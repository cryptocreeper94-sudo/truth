---
name: LumeScan OBD data pipeline
description: Where LumeScan code lives and the root causes / fix history of the "connects but no data" bug
---

# LumeScan OBD-II pipeline

- Repos: `cryptocreeper94-sudo/lumescan` = the Expo/React Native mobile app **and** its marketing site (connector code in `src/telemetry/`). `cryptocreeper94-sudo/lumeauto` = the lumeauto.tech order/download portal only. There is NO dongle firmware anywhere — the app talks to off-the-shelf ELM327 BLE adapters. Branch is `master` (not main). Jason's hardware: a ~$30 commodity BLE-only dongle.
- Root causes of months of "connected but no/wrong data" (fixed Aug 2026 in a structural BLE rewrite): shared response resolver with overlapping 300ms telemetry sweeps (responses attributed to wrong PIDs), init/connection status never verified against adapter responses, and a blind `substring(4)` parse fallback that decoded echo/garbage as data.
- **Why previous "fixes" failed:** at least 3 earlier agent rounds added smoothing/spike-rejection — filtering symptoms of the attribution bug instead of serializing commands. Lesson: when OBD values are erratic, suspect command/response mismatch before adding filters.
- Current design (keep consistent): all ELM327 commands serialized through a promise chain; drain window discards late responses after timeouts; `connected` requires a real `41 0C` RPM reply (NO DATA → degraded "waiting for vehicle" state); unparseable responses dropped and logged to FlightRecorder; failed connects `cancelConnection()` and reset the queue.
- `WiFiConnector.ts` received the same fixes (Aug 2026) — both transports now serialized+verified with the same degraded "waiting for vehicle" state.
- npm registry is blocked (403) in the Replit shell for this repo's deps; typecheck via the workspace tsc binary with `--noResolve` on single files.
- VIN/"vehicle name" bug (fixed Aug 2026): commands sent as `'0902\r'` while the send layer appends another `\r` — a bare CR is the ELM327 "repeat last command" shortcut, so Mode-09 commands ran twice; CAN ISO-TP framing ("014" length line, "0:"/"1:" prefixes) was concatenated into the hex; dashboard tried the VIN read exactly once at mount. Send layers now strip trailing CRs; shared extractVIN validates against the VIN alphabet (17 chars, no I/O/Q); dashboard retries 3x.
- Rebuilds go through EAS cloud build → APK; only a real-car test with the Flight Recorder log can confirm adapter behavior.
