# LumeAuto — Hardware Integration Diagnostic Handoff
**Repo:** `cryptocreeper94-sudo/lumeauto`  
**Auditor:** Claude  
**Date:** June 23, 2026  
**For:** Gemini Implementation Agent  

This is a precise, file-by-file bug report. Do not rewrite the codebase. Apply each fix surgically in the order listed. The bugs are independent — fix all of them.

---

## Bug 1 — CRITICAL: `enterBLEDemoMode` Imported But Does Not Exist

**File:** `src/components/diagnostic/EngineConnection.tsx`, line ~4  
**Severity:** App-breaking — causes a runtime crash or silent undefined on import

```typescript
// CURRENT (broken):
import { connectBLE, type BLEConnection, enterBLEDemoMode, isBLESupported } from '../../telemetry/BLEConnector';
```

`enterBLEDemoMode` is not exported from `BLEConnector.ts`. The import resolves to `undefined`. Any call to `enterBLEDemoMode()` silently does nothing or throws.

**Fix — Add the export to `src/telemetry/BLEConnector.ts`:**

```typescript
/**
 * Force demo/simulated mode — used when hardware is unavailable
 */
export function enterBLEDemoMode(onStatusChange: (status: BLEConnection) => void): void {
  connectionState = {
    status: 'connected',
    deviceName: 'Simulated OBD-II Adapter',
    error: null,
    isSimulated: true,
    adapterInfo: 'Lume-Auto Simulated Engine (Demo)',
  };
  onStatusChange({ ...connectionState });
}
```

This makes demo mode an explicit, deliberate action — not a silent fallback.

---

## Bug 2 — CRITICAL: React Component Name Is Lowercase — UI Never Renders

**File:** `src/components/diagnostic/EngineConnection.tsx`  
**Severity:** The connection screen silently fails to mount as a React component

```typescript
// CURRENT (broken):
export default function engineConnection({ onConnect }: { onConnect: () => void }) {
```

React treats lowercase function names as DOM elements, not components. `<engineConnection />` renders nothing. The entire BLE/WiFi selection UI is invisible, so users can never initiate a real connection.

**Fix:**

```typescript
// CORRECT:
export default function EngineConnection({ onConnect }: { onConnect: () => void }) {
```

Also verify every import site uses `EngineConnection` (uppercase E).

---

## Bug 3 — CRITICAL: Demo Mode Is The Default — Real Data Never Flows

**File:** `src/telemetry/BLEConnector.ts` — `startBLETelemetryLoop()`  
**Severity:** Even when BLE connects successfully, the fallback else-branch silently stays active if `txCharacteristic` is momentarily null

```typescript
// CURRENT (broken):
const timer = setInterval(async () => {
  if (txCharacteristic && connectionState.status === 'connected' && !connectionState.isSimulated) {
    await pollAllBLEPIDs();
    onData(buildSnapshot());
  } else {
    onData(simulatedTick()); // ← always fires on any hiccup
  }
}, intervalMs);
```

The problem: `pollAllBLEPIDs()` is async and takes longer than `intervalMs` (300ms). While it's awaiting BLE responses, the next interval fires, `txCharacteristic` is still valid but the previous poll hasn't finished — causing the condition to evaluate unexpectedly and fall through to `simulatedTick()`. Also, there is zero indication to the user that simulated data is being shown.

**Fix — Guard with a polling lock and remove the silent fallback:**

```typescript
let isPolling = false;

export function startBLETelemetryLoop(
  onData: (snapshot: TelemetrySnapshot) => void,
  onSimulated: (isSimulated: boolean) => void,
  intervalMs: number = 500  // Increase to 500ms — gives BLE time to respond
): () => void {
  startTime = Date.now();
  isPolling = false;

  const timer = setInterval(async () => {
    if (isPolling) return; // Skip tick if previous poll still running

    if (txCharacteristic && connectionState.status === 'connected' && !connectionState.isSimulated) {
      isPolling = true;
      try {
        await pollAllBLEPIDs();
        onData(buildSnapshot());
        onSimulated(false);
      } finally {
        isPolling = false;
      }
    } else if (connectionState.isSimulated) {
      onData(simulatedTick());
      onSimulated(true);
    }
    // If neither: do nothing — don't silently feed fake data
  }, intervalMs);

  return () => clearInterval(timer);
}
```

The caller (DiagnosticApp or EngineDashboard) must update its UI when `onSimulated(true)` fires — show a visible "DEMO MODE" banner so Jason can see which mode is active.

---

## Bug 4 — CRITICAL: WiFi Connector Uses WebSocket Protocol Against a Raw TCP Socket

**File:** `src/telemetry/WiFiConnector.ts` — `ELM327Socket.connect()`  
**Severity:** WiFi connection will never work — protocol mismatch at the transport layer

```typescript
// CURRENT (broken):
const url = `ws://${host}:${port}`;  // WebSocket handshake
```

WiFi ELM327 adapters (all of them — OBDLink MX+, Vgate, generic units) speak **raw TCP on port 35000**. They do not speak WebSocket. Sending a WebSocket `Upgrade` handshake to a raw TCP ELM327 returns garbage or drops the connection. The browser's WebSocket API cannot connect to a raw TCP socket.

**The fix requires a TCP proxy.** There are two valid approaches:

**Option A — Server-side WebSocket-to-TCP Proxy (recommended for web app):**

Add to `server.js`:

```javascript
const net = require('net');
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/obd-proxy') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const host = url.searchParams.get('host') || '192.168.0.10';
      const port = parseInt(url.searchParams.get('port') || '35000');

      const tcp = new net.Socket();
      tcp.connect(port, host, () => ws.send(JSON.stringify({ status: 'connected' })));

      ws.on('message', (data) => tcp.write(data));
      tcp.on('data', (data) => ws.readyState === 1 && ws.send(data));
      tcp.on('error', (err) => ws.close(1011, err.message));
      tcp.on('close', () => ws.close());
      ws.on('close', () => tcp.destroy());
    });
  }
});
```

Then in `WiFiConnector.ts`:

```typescript
// Connect through the server-side proxy
const proxyUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/obd-proxy?host=${host}&port=${DEFAULT_PORT}`;
this.ws = new WebSocket(proxyUrl);
```

**Option B — Prompt user to use BLE instead of WiFi (short-term):**

If the server-side proxy is too large a change for now, disable the WiFi connection button and show:

```
WiFi OBD-II requires the desktop app. Use the BLE adapter with Chrome on Android.
```

Do NOT leave the WiFi path active and silently failing — it makes the app look broken.

---

## Bug 5 — MODERATE: Sequential PID Polling Overruns the Telemetry Interval

**File:** `src/telemetry/BLEConnector.ts` — `pollAllBLEPIDs()`  
**Severity:** Causes stacking async calls, dropped responses, and stale/empty data

```typescript
// CURRENT:
export async function pollAllBLEPIDs(): Promise<void> {
  for (const { cmd, parse } of PIDS) {
    const hex = await readPID(cmd);  // Each: up to 2000ms timeout
    // ...
  }
}
```

14 PIDs × ~100ms average round-trip on BLE = ~1,400ms per full poll cycle. The interval is 300ms (now corrected to 500ms in Bug 3 fix). Even at 500ms the polls stack. More critically, the single global `responseResolve` means if a second poll starts while the first is mid-flight, their responses collide.

**Fix — Poll a reduced priority set, fire-and-forget non-critical PIDs:**

```typescript
// High priority — poll every cycle (engine-critical)
const HIGH_PRIORITY_PIDS = ['010C', '010D', '0111', '0104', '0106', '0107', '0105', '0101'];

// Low priority — poll every 5th cycle
const LOW_PRIORITY_PIDS  = ['0110', '010F', '010B', '010E', '0114', '0142'];

let pollCycle = 0;

export async function pollAllBLEPIDs(): Promise<void> {
  if (!txCharacteristic) return;
  pollCycle++;

  const toQuery = pollCycle % 5 === 0
    ? [...HIGH_PRIORITY_PIDS, ...LOW_PRIORITY_PIDS]
    : HIGH_PRIORITY_PIDS;

  for (const cmd of toQuery) {
    const pidDef = PIDS.find(p => p.cmd === cmd);
    if (!pidDef) continue;
    const hex = await readPID(cmd);
    if (hex && hex.length >= 2) {
      try {
        Object.assign(rawValues, pidDef.parse(hex));
      } catch { /* skip malformed */ }
    }
  }
}
```

High-priority PIDs (8) at ~80ms each = ~640ms. With the 500ms interval and the polling lock from Bug 3, this gives the BLE adapter breathing room. Low-priority PIDs run every 5 cycles (~2.5 seconds) — sufficient for slow-changing values like MAF and O2 sensors.

---

## Bug 6 — MODERATE: AnchorService Points to `dwtl.io` — Verify or Update

**File:** `src/telemetry/AnchorService.ts`, line ~15  

```typescript
const TLL_API_URL = 'https://dwtl.io/api';
```

The anchor endpoint posts to `dwtl.io`. If this domain is not live and serving the FLA ledger API, every anchor attempt silently falls back to `local-only`. The hash is still computed correctly — that part works — but no record reaches the ledger.

**Action required before fix:**  
Run: `curl -X POST https://dwtl.io/api/submit/condition -H "Content-Type: application/json" -d '{}'`

- If it returns a 4xx error with a JSON body → server is up, endpoint may need auth or correct payload
- If it returns connection refused or DNS failure → domain is not live; update to the correct FLA API URL (likely `https://fla.tlid.io/api`)

**Fix if domain is wrong:**

```typescript
const TLL_API_URL = 'https://fla.tlid.io/api';
```

---

## Bug 7 — URGENT (Separate Issue): Cox-Named File Is Publicly Served

**File:** `public/downloads/Cox_Operational_Platform.exe`  
**Severity:** Publicly accessible at `https://[your-domain]/downloads/Cox_Operational_Platform.exe`

This file must be renamed or removed immediately:

```bash
git mv public/downloads/Cox_Operational_Platform.exe public/downloads/Lume_Operational_Platform.exe
git add -A
git commit -m "scrub: rename Cox exe to Lume branding"
git push origin main
```

Also update any download links in the frontend that reference the old filename.

---

## Summary — Fix Order

| # | File | Bug | Priority |
|---|---|---|---|
| 1 | `BLEConnector.ts` | Export `enterBLEDemoMode` | CRITICAL |
| 2 | `EngineConnection.tsx` | Uppercase component name | CRITICAL |
| 3 | `BLEConnector.ts` | Poll lock + remove silent sim fallback | CRITICAL |
| 4 | `WiFiConnector.ts` | WebSocket vs raw TCP protocol mismatch | CRITICAL |
| 5 | `BLEConnector.ts` | Priority-based PID polling | MODERATE |
| 6 | `AnchorService.ts` | Verify/update `dwtl.io` → `fla.tlid.io` | MODERATE |
| 7 | `public/downloads/` | Rename Cox exe | URGENT |

---

## What Good Looks Like After Fix

1. User opens the app on Chrome for Android
2. `EngineConnection` (capitalized, renders correctly) shows BLE and WiFi buttons
3. User taps BLE — browser shows native Bluetooth picker
4. Adapter selected → `connectBLE()` runs AT init sequence
5. `startBLETelemetryLoop()` fires with polling lock — real PIDs flow
6. Dashboard shows live data with NO "DEMO MODE" banner
7. User generates a report → `anchorReport()` hashes it → POST to `fla.tlid.io/api` → `status: 'anchored'`
8. WiFi button either routes through the server-side proxy correctly, or shows a clear "use desktop app" message — no silent failure

---

## Push

```bash
git add -A
git commit -m "fix: ble demo mode trap, component casing, wifi protocol, pid polling, anchor endpoint"
git push origin main
```

Do not mark complete until a real BLE adapter connects and live PID data flows without a simulated fallback.
