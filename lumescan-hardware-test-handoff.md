# LumeScan — Hardware Test Handoff
**Repo:** `cryptocreeper94-sudo/lumescan` (branch: `master`)
**Date:** June 23, 2026
**Status:** APK built. Ready for physical hardware test.

---

## Code Is Frozen — No Further Changes Required

All fixes are confirmed in master:
- Native TCP socket (react-native-tcp-socket) — verified
- BLE MTU negotiation (requestMTU 512) — verified
- OBDConnector.ts dead code — removed
- FlightRecorder.ts — structurally sound, packages installed
- isSimulated state leak — fixed in DashboardScreen.tsx
- iOS BLE permissions — confirmed in app.json

---

## Step 1 — Rename the Release APK

The current filename `releases/LumeScan_v1.0.0.apk` matches the old placeholder. Rename before distributing:

```bash
cd D:\lume-auto-mobile
git mv releases/LumeScan_v1.0.0.apk releases/LumeScan_v1.1.0.apk
git add -A
git commit -m "release: v1.1.0 — live hardware build, native BLE/TCP, all fixes applied"
git push origin master
```

---

## Step 2 — Sideload to Android Device

Connect device via USB with USB debugging enabled:

```bash
adb install D:\LumeScan_Live_Hardware_Build.apk
```

Or transfer the APK manually and install from Files on the device.

---

## Step 3 — Hardware Test

**Setup:**
- Plug ELM327 adapter into vehicle OBD-II port (under dash, driver side)
- Turn ignition ON (engine running or key-on, engine off both work)
- Keep phone within 3 feet of adapter for initial BLE pairing

**BLE path:**
1. Open LumeScan → tap **BLE Connect**
2. Android Bluetooth picker appears — select the adapter (name will contain "OBD", "ELM", "Vgate", or similar)
3. Watch status progress: `scanning → connecting → initializing → connected`
4. Connection badge must show `BLE: [device name]` — **not DEMO MODE**
5. Dashboard populates with live RPM, speed, coolant within ~5 seconds

**WiFi path (if testing WiFi adapter):**
1. Connect phone to adapter's WiFi hotspot first (in Android WiFi settings)
2. Open LumeScan → tap **WiFi Connect**
3. App probes 192.168.0.10:35000 → 192.168.1.10 → 10.0.0.1 → 192.168.4.1
4. Badge must show `WIFI CONNECTED`

---

## Step 4 — If BLE Connects But Dashboard Is Blank

The ELM327 init sequence may be timing out on slower adapters. In `src/telemetry/BLEConnector.ts`, find:

```typescript
await sendBLECommand('ATZ', 4000);
```

Increase to:
```typescript
await sendBLECommand('ATZ', 6000);
```

Rebuild and retest.

---

## Step 5 — If Connection Fails Completely

Tap **Export Diagnostic Log** on the connection screen. Share the `.txt` file — it contains every TX/RX byte exchanged with the adapter and will show exactly where the handshake broke.

---

## Step 6 — If Hardware Test Passes, Cut Production Build

```bash
npx eas build --profile production --platform android
```

Submit to Play Store or distribute directly.
