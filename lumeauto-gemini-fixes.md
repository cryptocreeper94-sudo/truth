# LumeAuto — Gemini Fix Handoff
**Repo:** `cryptocreeper94-sudo/lumeauto`  
**Apply all 7 fixes. Do not skip any.**

---

## Fix 1 — Add missing `enterBLEDemoMode` export
**File:** `src/telemetry/BLEConnector.ts`  
Add this function anywhere after the `connectionState` declaration:

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

---

## Fix 2 — Capitalize the component name
**File:** `src/components/diagnostic/EngineConnection.tsx`

Find:
```typescript
export default function engineConnection({ onConnect }: { onConnect: () => void }) {
```

Replace with:
```typescript
export default function EngineConnection({ onConnect }: { onConnect: () => void }) {
```

---

## Fix 3 — Fix demo mode fallback + add polling lock
**File:** `src/telemetry/BLEConnector.ts`

Add this variable near the top with the other module-level `let` declarations:
```typescript
let isPolling = false;
```

Find the entire `startBLETelemetryLoop` function:
```typescript
export function startBLETelemetryLoop(
  onData: (snapshot: TelemetrySnapshot) => void,
  intervalMs: number = 300
): () => void {
  startTime = Date.now();

  const timer = setInterval(async () => {
    if (txCharacteristic && connectionState.status === 'connected' && !connectionState.isSimulated) {
      await pollAllBLEPIDs();
      onData(buildSnapshot());
    } else {
      // Simulated fallback
      onData(simulatedTick());
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
```

Replace with:
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
    // No else — do not silently feed fake data
  }, intervalMs);

  return () => clearInterval(timer);
}
```

Then find every call to `startBLETelemetryLoop` in the codebase and add the second argument. Example — if the call currently looks like:
```typescript
const stop = startBLETelemetryLoop((snapshot) => {
  setData(snapshot);
});
```

Update it to:
```typescript
const stop = startBLETelemetryLoop(
  (snapshot) => {
    setData(snapshot);
  },
  (isSimulated) => {
    setIsDemoMode(isSimulated); // add this state variable if it doesn't exist
  }
);
```

In the JSX for whichever component shows the dashboard, add a visible demo banner:
```tsx
{isDemoMode && (
  <div style={{ background: '#f59e0b', color: '#000', padding: '6px 12px', textAlign: 'center', fontWeight: 700 }}>
    ⚠ DEMO MODE — No hardware connected
  </div>
)}
```

---

## Fix 4 — Fix WiFi TCP protocol mismatch
**File:** `server.js`  
Add this block at the end of the file, before `module.exports` or `app.listen` if present:

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

**File:** `src/telemetry/WiFiConnector.ts`  
Find the `ELM327Socket.connect()` method. Find the line that sets the WebSocket URL:
```typescript
const url = `ws://${host}:${port}`;
```

Replace with:
```typescript
const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
const url = `${proto}://${window.location.host}/obd-proxy?host=${host}&port=${port}`;
```

---

## Fix 5 — Priority-based PID polling
**File:** `src/telemetry/BLEConnector.ts`

Add these constants near the top with the other constants:
```typescript
const HIGH_PRIORITY_CMDS = ['010C', '010D', '0111', '0104', '0106', '0107', '0105', '0101'];
const LOW_PRIORITY_CMDS  = ['0110', '010F', '010B', '010E', '0114', '0142'];
let pollCycle = 0;
```

Find the entire `pollAllBLEPIDs` function:
```typescript
export async function pollAllBLEPIDs(): Promise<void> {
  if (!txCharacteristic) return;

  for (const { cmd, parse } of PIDS) {
    const hex = await readPID(cmd);
    if (hex && hex.length >= 2) {
      try {
        const values = parse(hex);
        Object.assign(rawValues, values);
      } catch {
        // Skip malformed responses
      }
    }
  }
}
```

Replace with:
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

## Fix 6 — Update anchor API endpoint
**File:** `src/telemetry/AnchorService.ts`

Find:
```typescript
const TLL_API_URL = 'https://dwtl.io/api';
```

Replace with:
```typescript
const TLL_API_URL = 'https://fla.tlid.io/api';
```

---

## Fix 7 — Rename Cox-branded file
Run in the repo root:

```bash
git mv public/downloads/Cox_Operational_Platform.exe public/downloads/Lume_Operational_Platform.exe
```

Then search the entire codebase for the old filename and update any download links:
```bash
grep -r "Cox_Operational_Platform" src/ public/ --include="*.tsx" --include="*.ts" --include="*.html" --include="*.md"
```

Replace every occurrence of `Cox_Operational_Platform.exe` with `Lume_Operational_Platform.exe`.

---

## Commit

```bash
git add -A
git commit -m "fix: ble demo mode, component casing, wifi tcp proxy, pid priority polling, anchor endpoint, cox rename"
git push origin main
```
