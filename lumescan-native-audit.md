# LumeScan Native Mobile — Hardware Connection Audit
**Repo:** `cryptocreeper94-sudo/lumescan` (branch: `master`)  
**Stack:** Expo SDK 54 / React Native 0.81.5  
**Auditor:** Claude  
**Date:** June 23, 2026  
**For:** Gemini Implementation Agent

---

## Gemini's Two Claimed Fixes — VERIFIED ✅

Both are confirmed in the actual code:

**Fix 1 — TCP socket (WiFiConnector.ts):**
```typescript
this.socket = TcpSocket.createConnection({ host, port }, () => { ... });
```
`react-native-tcp-socket` v6.4.1 is in `package.json`. The implementation is present and structurally correct. ✅

**Fix 2 — MTU negotiation (BLEConnector.ts):**
```typescript
connectedDevice = await device.connect({ timeout: 8000 });
if (Platform.OS === 'android') {
  await connectedDevice.requestMTU(512);
}
await connectedDevice.discoverAllServicesAndCharacteristics();
```
MTU is negotiated AFTER connect and BEFORE service discovery — this is the correct order. Requesting 512 is fine; the OS negotiates down to hardware maximum (usually 247 or 251 on Android). ✅

---

## Remaining Bugs — These Will Still Block Hardware Connections

### Bug 1 — CRITICAL: iOS BLE Permissions Not Declared in `app.json`

`requestPermissions()` in `BLEConnector.ts` only handles Android via `PermissionsAndroid`. iOS is handled with a bare `return true`, but iOS **requires** BLE usage strings declared at the native build level in `Info.plist`. Without them, CoreBluetooth kills the app silently on first scan attempt.

**File:** `app.json`  
Find the `"ios"` section and add:
```json
"ios": {
  "infoPlist": {
    "NSBluetoothAlwaysUsageDescription": "LumeScan uses Bluetooth to connect to your OBD-II adapter and read live engine data.",
    "NSBluetoothPeripheralUsageDescription": "LumeScan uses Bluetooth to connect to your OBD-II adapter and read live engine data."
  }
}
```

Also add to the `"android"` section:
```json
"android": {
  "permissions": [
    "android.permission.BLUETOOTH",
    "android.permission.BLUETOOTH_ADMIN",
    "android.permission.BLUETOOTH_SCAN",
    "android.permission.BLUETOOTH_CONNECT",
    "android.permission.ACCESS_FINE_LOCATION"
  ]
}
```

---

### Bug 2 — CRITICAL: TCP Socket Timeout Handler Is Missing — Stalled Connections Hang Forever

**File:** `src/telemetry/WiFiConnector.ts` — `ELM327Socket.connect()`

```typescript
this.socket.setTimeout(5000);  // ← fires a 'timeout' event but does NOT close the socket
```

`setTimeout()` on a React Native TCP socket fires a `timeout` event — it does NOT auto-close. Without a handler, a stalled connection (adapter powered on, phone connected to wrong WiFi, etc.) hangs indefinitely, blocking the entire probe loop.

**Fix — add the handler immediately after `setTimeout`:**
```typescript
this.socket.setTimeout(5000);

this.socket.on('timeout', () => {
  console.warn('[LumeScan WiFi] TCP connection timed out');
  this.socket.destroy();
  this.socket = null;
  resolve(false);
});
```

---

### Bug 3 — MODERATE: Socket Not Destroyed on Error — File Descriptor Leak Per Failed Probe

**File:** `src/telemetry/WiFiConnector.ts` — `ELM327Socket.connect()`

```typescript
this.socket.on('error', (error: any) => {
  console.warn('[LumeScan WiFi] TCP Error: ', error);
  resolve(false);  // ← socket is not destroyed
});
```

When a probe to one host fails, `resolve(false)` returns but the socket object is abandoned without calling `destroy()`. The next probe attempt in the `ALT_HOSTS` loop creates a new socket on top of the leaked one. On Android, this exhausts file descriptors after a few failed probes and causes the subsequent real connection to fail.

**Fix:**
```typescript
this.socket.on('error', (error: any) => {
  console.warn('[LumeScan WiFi] TCP Error: ', error);
  this.socket.destroy();
  this.socket = null;
  resolve(false);
});
```

---

### Bug 4 — MODERATE: `OBDConnector.ts` Is a Dead Duplicate — Remove It

**File:** `src/telemetry/OBDConnector.ts`

This file is a legacy BLE connector using hardcoded short-form UUIDs (`'fff0'`, `'fff1'`, `'fff2'`) which react-native-ble-plx will not resolve correctly without full UUID formatting. It duplicates `BLEConnector.ts` and uses an entirely separate `BleManager` instance — if anything still imports from it, there will be two simultaneous BLE managers competing for the same adapter.

**Verify no imports remain:**
```bash
grep -rn "OBDConnector" src/ --include="*.tsx" --include="*.ts"
```

If zero results: delete the file.  
If any results remain: update those imports to point to `BLEConnector.ts` instead, then delete `OBDConnector.ts`.

---

### Bug 5 — BLOCKER FOR TESTING: Native Modules Cannot Run in Expo Go

`react-native-ble-plx` and `react-native-tcp-socket` are both native modules. They **cannot run in standard Expo Go**. Any test on a physical device must use a development build.

**If a dev build hasn't been made yet:**
```bash
npx eas build --profile development --platform android
```

Or for local build (faster, requires Android Studio):
```bash
npx expo run:android
```

The existing EAS-built APK (`releases/LumeScan_v1.0.0.apk`) will reflect the pre-fix code. A new build is required to test any of Gemini's changes.

---

## What Is Structurally Sound — Do Not Touch

- ✅ Android 12+ permission logic (`BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT` for API 31+, `ACCESS_FINE_LOCATION` for below)
- ✅ Name-based BLE scanning — more reliable than UUID filtering for unknown adapters
- ✅ Dual/separate TX+RX characteristic discovery with proper fallback chain
- ✅ Base64 encode/decode for BLE transport (required by `react-native-ble-plx`)
- ✅ `>` prompt buffering in both BLE and WiFi — correct ELM327 protocol handling
- ✅ `ATZ` + 1000ms delay before `ATE0` in WiFi init — correct reset sequence
- ✅ `ConnectionScreen.tsx` — properly capitalized, imports correct, BLE/WiFi/Demo paths all wired correctly

---

## Fix Order for Gemini

| # | File | Change | Severity |
|---|---|---|---|
| 1 | `app.json` | Add iOS BLE + Android permission declarations | CRITICAL |
| 2 | `WiFiConnector.ts` | Add `timeout` event handler with `socket.destroy()` | CRITICAL |
| 3 | `WiFiConnector.ts` | Add `socket.destroy()` in `error` handler | MODERATE |
| 4 | `OBDConnector.ts` | Verify no imports, then delete | MODERATE |
| 5 | Build | Run `npx expo run:android` or EAS dev build to test | REQUIRED |

---

## Commit After Fixes

```bash
git add -A
git commit -m "fix: ios ble permissions, tcp timeout handler, socket cleanup on error, remove dead OBDConnector"
git push origin master
```

Then rebuild the APK and test on a physical Android device with a real ELM327 adapter plugged in.
