# LumeAuto — Gemini Verification + Implementation Handoff
**Date:** June 23, 2026  
**Auditor:** Claude  
**For:** Gemini Implementation Agent

---

## Step 0 — Confirm You Are In the Right Directory

Run:
```bash
cd D:\lume-auto-mobile
cat package.json | grep name
```

Expected output should contain `lumeauto` or similar. Also confirm:
```bash
ls src/telemetry/
```

Expected: `BLEConnector.ts`, `WiFiConnector.ts`, `SimulatedEngine.ts`, `AnchorService.ts`

If those files are present, proceed. If not, stop and tell Jason the directory does not match the audited repo.

---

## Step 1 — Apply Fix 1: Add missing `enterBLEDemoMode` export

**File:** `src/telemetry/BLEConnector.ts`

Find the line that declares `connectionState`:
```typescript
let connectionState: BLEConnection = {
  status: 'disconnected', deviceName: null, error: null, isSimulated: false, adapterInfo: null,
};
```

Immediately after that block, add:
```typescript
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

**Verify:** Run `grep -n "enterBLEDemoMode" src/telemetry/BLEConnector.ts` — should now return a result.

---

## Step 2 — Apply Fix 2: Capitalize React component name

**File:** `src/components/diagnostic/EngineConnection.tsx`

Find:
```typescript
export default function engineConnection({ onConnect }: { onConnect: () => void }) {
```

Replace with:
```typescript
export default function EngineConnection({ onConnect }: { onConnect: () => void }) {
```

**Verify:** Run `grep -n "function.*ngineConnection" src/components/diagnostic/EngineConnection.tsx`  
Must show uppercase `E`. Also check all import sites:
```bash
grep -rn "EngineConnection\|engineConnection" src/ --include="*.tsx" --include="*.ts"
```
Every import and usage must use uppercase `EngineConnection`.

---

## Step 3 — Apply Fix 3: Polling lock + remove silent simulated fallback

**File:** `src/telemetry/BLEConnector.ts`

Add `let isPolling = false;` near the top with the other module-level let declarations (near `let device`, `let txCharacteristic`, etc.).

Find the entire `startBLETelemetryLoop` function and replace it:

```typescript
export function startBLETelemetryLoop(
  onData: (snapshot: TelemetrySnapshot) => void,
  onSimulated: (isSimulated: boolean) => void,
  intervalMs: number = 500
): () => void {
  startTime = Date.now();
  isPolling = false;

  const timer = setInterval(async () => {
    if (isPolling) return;

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
  }, intervalMs);

  return () => clearInterval(timer);
}
```

Now find every call to `startBLETelemetryLoop` across the codebase:
```bash
grep -rn "startBLETelemetryLoop" src/ --include="*.tsx" --include="*.ts"
```

For each call site, add the second `onSimulated` callback argument and wire up a `isDemoMode` state variable. Also add this banner to whichever component renders the dashboard:
```tsx
{isDemoMode && (
  <div style={{ background: '#f59e0b', color: '#000', padding: '6px 12px', textAlign: 'center', fontWeight: 700 }}>
    ⚠ DEMO MODE — No hardware connected
  </div>
)}
```

**Verify:** Run `grep -n "simulatedTick\|Simulated fallback" src/telemetry/BLEConnector.ts`  
The only remaining `simulatedTick` call should be inside the `connectionState.isSimulated` branch — not in a bare `else`.

---

## Step 4 — Apply Fix 4: WiFi TCP proxy

**File:** `server.js`

Find where the HTTP server is created — look for `const server = http.createServer(app)` or similar. Add the WebSocket-to-TCP proxy block immediately after the server is created, before `server.listen`:

```javascript
const net = require('net');
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  if (request.url && request.url.startsWith('/obd-proxy')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const host = url.searchParams.get('host') || '192.168.0.10';
      const port = parseInt(url.searchParams.get('port') || '35000');

      const tcp = new net.Socket();
      tcp.connect(port, host, () => {
        ws.send(JSON.stringify({ status: 'connected' }));
      });

      ws.on('message', (data) => tcp.write(data));
      tcp.on('data', (data) => {
        if (ws.readyState === 1) ws.send(data);
      });
      tcp.on('error', (err) => ws.close(1011, err.message));
      tcp.on('close', () => ws.close());
      ws.on('close', () => tcp.destroy());
    });
  }
});
```

Check whether `ws` is already a dependency:
```bash
grep '"ws"' package.json
```

If not present, install it:
```bash
npm install ws
```

**File:** `src/telemetry/WiFiConnector.ts`

Find inside `ELM327Socket.connect()` the line that builds the WebSocket URL. It will look something like:
```typescript
const url = `ws://${host}:${port}`;
```

Replace with:
```typescript
const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
const url = `${proto}://${window.location.host}/obd-proxy?host=${host}&port=${port}`;
```

**Verify:** Run `grep -n "ws://" src/telemetry/WiFiConnector.ts`  
Should return no hardcoded `ws://` lines remaining.

---

## Step 5 — Apply Fix 5: Priority-based PID polling

**File:** `src/telemetry/BLEConnector.ts`

Add near the top with other constants (after `KNOWN_SERVICES`, `KNOWN_CHARACTERISTICS`, etc.):
```typescript
const HIGH_PRIORITY_CMDS = ['010C', '010D', '0111', '0104', '0106', '0107', '0105', '0101'];
const LOW_PRIORITY_CMDS  = ['0110', '010F', '010B', '010E', '0114', '0142'];
let pollCycle = 0;
```

Find the entire `pollAllBLEPIDs` function and replace it:
```typescript
export async function pollAllBLEPIDs(): Promise<void> {
  if (!txCharacteristic) return;

  pollCycle++;
  const cmdsToQuery = pollCycle % 5 === 0
    ? [...HIGH_PRIORITY_CMDS, ...LOW_PRIORITY_CMDS]
    : HIGH_PRIORITY_CMDS;

  for (const cmd of cmdsToQuery) {
    const pidDef = PIDS.find(p => p.cmd === cmd);
    if (!pidDef) continue;
    const hex = await readPID(cmd);
    if (hex && hex.length >= 2) {
      try {
        Object.assign(rawValues, pidDef.parse(hex));
      } catch {
        // Skip malformed responses
      }
    }
  }
}
```

---

## Step 6 — Apply Fix 6: Update anchor API endpoint

**File:** `src/telemetry/AnchorService.ts`

Find:
```typescript
const TLL_API_URL = 'https://dwtl.io/api';
```

Replace with:
```typescript
const TLL_API_URL = 'https://fla.tlid.io/api';
```

**Verify:** `curl -s -o /dev/null -w "%{http_code}" https://fla.tlid.io/api/submit/condition`  
If this returns 404 or 405, the server is up but the route needs the right payload — that's fine.  
If it returns 000 (no connection), stop and tell Jason the FLA endpoint is not live.

---

## Step 7 — Rename Cox-branded file

```bash
cd D:\lume-auto-mobile
git mv public/downloads/Cox_Operational_Platform.exe public/downloads/Lume_Operational_Platform.exe
```

Search and replace filename references:
```bash
grep -rn "Cox_Operational_Platform" src/ public/ --include="*.tsx" --include="*.ts" --include="*.html" --include="*.md" --include="*.json"
```

Replace every occurrence with `Lume_Operational_Platform.exe`.

---

## Step 8 — Build check

```bash
npm run build
```

Fix any TypeScript errors before committing. The most likely error will be call sites of `startBLETelemetryLoop` that now need the second `onSimulated` argument — update each one.

---

## Step 9 — Commit and push

```bash
git add -A
git commit -m "fix: ble demo mode, component casing, wifi tcp proxy, pid priority polling, anchor endpoint, cox rename"
git push origin main
```

---

## Step 10 — Tell Jason what to test

After push, Jason should:
1. Open the app in **Chrome on Android** (not Safari, not Firefox — Web Bluetooth only works in Chrome)
2. Navigate to the Diagnostic page
3. Tap **BLE Connect** — the browser should show the native Bluetooth device picker
4. Select the OBD-II adapter
5. Confirm the dashboard shows **live data with no DEMO MODE banner**
6. Confirm the **WiFi path** either connects through the proxy or shows the correct fallback message

If the DEMO MODE banner is still showing after BLE connects, report back the exact text of `connectionState` at that moment.
