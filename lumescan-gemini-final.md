# LumeScan Native — Final Handoff to Gemini
**Repo:** `cryptocreeper94-sudo/lumescan` (branch: `master`)  
**Date:** June 23, 2026  
**Status:** Code is clean. Ready for hardware test.

---

## What Has Been Verified (Do Not Touch)

All of the following are confirmed correct in the live `master` branch:

- ✅ `react-native-ble-plx` v3.5.1 — installed and initialized correctly
- ✅ `react-native-tcp-socket` v6.4.1 — installed, TCP connection replaces WebSocket
- ✅ MTU negotiation — `connectedDevice.requestMTU(512)` called after `connect()`, before `discoverAllServicesAndCharacteristics()` — correct order
- ✅ Android 12+ BLE permissions — `BLUETOOTH_SCAN` + `BLUETOOTH_CONNECT` + `ACCESS_FINE_LOCATION` for API 31+
- ✅ TCP timeout handler — `socket.on('timeout')` calls `destroy()` + `socket = null` + `resolve(false)`
- ✅ TCP error handler — `socket.on('error')` calls `destroy()` + `socket = null` + `resolve(false)`, both null-guarded
- ✅ `OBDConnector.ts` dead code removed
- ✅ `ConnectionScreen.tsx` — properly named, BLE/WiFi/Demo all wired correctly
- ✅ ELM327 `>` prompt buffering — correct in both BLE and WiFi transports
- ✅ Governance mode hysteresis — 3-second hold timer, dead zones on thresholds

---

## One Thing Still Needed Before Physical Test

**Verify `app.json` has iOS BLE permissions declared.**

Open `app.json` and confirm the `"ios"` block contains:

```json
"ios": {
  "infoPlist": {
    "NSBluetoothAlwaysUsageDescription": "LumeScan uses Bluetooth to connect to your OBD-II adapter and read live engine data.",
    "NSBluetoothPeripheralUsageDescription": "LumeScan uses Bluetooth to connect to your OBD-II adapter and read live engine data."
  }
}
```

And the `"android"` block contains:

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

Gemini already reported these were present. Confirm visually and move on.

---

## Build the APK

Both `react-native-ble-plx` and `react-native-tcp-socket` are native modules. They **cannot run in Expo Go**. A compiled build is required.

**Option A — Local build (faster, requires Android Studio + JDK):**
```bash
cd D:\lume-auto-mobile
npx expo run:android
```

**Option B — EAS cloud build:**
```bash
cd D:\lume-auto-mobile
npx eas build --profile development --platform android
```

The existing `releases/LumeScan_v1.0.0.apk` reflects pre-fix code. Do not test with it.

---

## Hardware Test Checklist

Install the new APK on a physical Android device (Chrome not required — this is native).

Test in this order:

1. **BLE path:**
   - Plug ELM327 BLE adapter into OBD-II port
   - Turn ignition ON (engine running or key-on)
   - Open LumeScan → tap BLE Connect
   - Android Bluetooth picker should appear
   - Select adapter → should reach `connected` status
   - Dashboard should show live RPM, speed, coolant, etc.
   - Confirm no DEMO MODE indicator is visible

2. **WiFi path:**
   - Connect phone to adapter's WiFi hotspot (SSID typically "OBDLink" or "WiFi_OBDII")
   - Open LumeScan → tap WiFi Connect
   - App probes `192.168.0.10:35000` first, then fallback IPs
   - Should reach `connected` status and show live data

3. **Failure case:**
   - With no adapter, tap BLE Connect
   - Should scan for 15 seconds, then show "No OBD-II adapter found" alert
   - Should NOT hang indefinitely

---

## If BLE Connects But Shows No Data

The ELM327 init sequence (`ATZ` → `ATE0` → `ATL0` → `ATS0` → `ATH0` → `ATSP0`) may be timing out on slower adapters. If dashboard is blank after connecting:

Check `BLEConnector.ts` — find `sendBLECommand('ATZ', 4000)` and increase the `ATZ` timeout to `6000`. Some adapters take longer to reset.

---

## If Physical Test Passes

```bash
cd D:\lume-auto-mobile
npx eas build --profile production --platform android
```

Then submit the production build for distribution.
