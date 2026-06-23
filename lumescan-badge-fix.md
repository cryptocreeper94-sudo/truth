# LumeScan — Final Fix Handoff
**Repo:** `cryptocreeper94-sudo/lumescan` (branch: `master`)  
**Date:** June 23, 2026  
**Status:** One line of code remaining before hardware test.

---

## Everything Else Is Verified — Do Not Touch

All prior fixes (TCP socket, MTU, OBDConnector removal, FlightRecorder, VIN logic) are confirmed correct in the live codebase. Do not re-examine them.

---

## The One Remaining Fix

**File:** `src/screens/DashboardScreen.tsx`  
**Line:** ~437  
**Problem:** The connection badge ORs both transport states — if Demo Mode was used before a real BLE connection, the WiFi `isSimulated` flag is still `true` and the badge shows "DEMO MODE" during live data.

Find this exact block:
```typescript
{getWiFiStatus().isSimulated || getBLENativeStatus().isSimulated
  ? 'DEMO MODE'
  : getBLENativeStatus().status === 'connected'
    ? `BLE: ${getBLENativeStatus().deviceName || 'CONNECTED'}`
    : 'WIFI CONNECTED'
}
```

Replace with:
```typescript
{getBLENativeStatus().status === 'connected'
  ? getBLENativeStatus().isSimulated
    ? 'DEMO MODE'
    : `BLE: ${getBLENativeStatus().deviceName || 'CONNECTED'}`
  : getWiFiStatus().isSimulated
    ? 'DEMO MODE'
    : 'WIFI CONNECTED'
}
```

This reads `isSimulated` only from whichever transport is actually active, not both simultaneously.

---

## Commit and Build

```bash
git add src/screens/DashboardScreen.tsx
git commit -m "fix: connection badge reads isSimulated from active transport only"
git push origin master
```

Then build:
```bash
npx expo prebuild --clean
npx expo run:android
```

Install on physical device, plug in ELM327 dongle, turn ignition ON, connect via BLE. Badge must show `BLE: [device name]` — not DEMO MODE.
