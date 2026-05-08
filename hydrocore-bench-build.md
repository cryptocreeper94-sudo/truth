# HydroCore Physical — Bench Prototype Build & Operation Instructions

**Project:** HydroCore Physical Engine — Deterministic Hydraulic Governance Prototype
**Author:** Jason Andrews / DarkWave Studios LLC
**Patent:** U.S. Provisional 64/032,339 (Pending)
**Date:** May 2026

Send this document to everyone involved in the build. Work through it in order.

---

## WHAT THIS IS (plain English)

This is a physical hydraulic machine — water flows through it — controlled by a small computer
running a deterministic governance engine called HydroCore. Instead of the typical approach of
using separate PID controllers for pressure, flow, and temperature, HydroCore monitors all 42
variables of the system at the same time and makes one coordinated decision every 10 milliseconds.

Same sensor readings always produce the same valve commands. Always. That is the claim this
prototype exists to prove.

The machine has a pressure chamber, two solenoid valves (inlet and outlet), a pump, sensors on
every key variable, and an ESP32-S3 microcontroller running the governance engine. It logs
everything to an SD card and serves a live dashboard over WiFi.

This is NOT perpetual motion and NOT an energy generator in its closed-loop bench form. It is a
governance demonstration — a proof that a deterministic organism architecture can govern a
physical plant in real time.

---

## BILL OF MATERIALS

Order everything before starting the physical build. Estimated total: $150–$250 USD.

### Fluid System

| Item | Specification | Source / Notes |
|---|---|---|
| Water reservoir | 3-gallon HDPE tank, food-grade | Any hardware store. Camping jugs work. |
| Pressure chamber | 1/2" ID clear polycarbonate tube, 12" length, end-capped | Clear so you can see flow state visually. Cap both ends with brass 1/4" NPT fittings. |
| Micro-turbine | Pelton-style, 1/2" nozzle, stainless, 0.5–5 PSI rated | OR a 1/2" bore piston assembly with return spring if turbine is unavailable. |
| Inlet valve (V1) | 12V normally-closed solenoid valve, 1/4" NPT, food-grade, 0–100 PSI rated | Granzow W5A04-AA0K00 or equivalent. NC = fails closed (safe). |
| Outlet valve (V2) | Same spec as V1 | Order two of the same part. |
| Relief valve (V3) | Spring-loaded pressure relief, 1/4" NPT, set to 80% of chamber max pressure | Passive — NOT wired to the controller. Always in-line. This is your hard mechanical safety. |
| Pump | 12V centrifugal pump, 2–5 GPM, 10 PSI max | Bench testing only. Removes any energy generation claim — this is purely a governance demo. |
| Tubing | 1/2" ID reinforced PVC, pressure-rated to 100 PSI | Buy 6–8 feet. |
| Fittings | 1/4" NPT brass — assorted tees, elbows, barbed connectors | Pick up an assortment kit. You'll use most of it. |
| Hose clamps | Stainless, sized for 1/2" ID tubing | 10 pack minimum. |

### Sensors

| Sensor | Part Number | Interface | Notes |
|---|---|---|---|
| Pressure A — chamber inlet | Honeywell MPRLS0025PA00001A | I2C | 0–25 PSI, ±0.25% accuracy. Need two of these. |
| Pressure B — chamber outlet | Same as above | I2C | Use I2C address jumper to differentiate from Pressure A. |
| Flow A — inlet line | YF-S201 Hall-effect flow sensor | Pulse interrupt | 1–30 L/min. Need two. |
| Flow B — outlet line | Same as above | Pulse interrupt | Pair with Flow A to compute net flow. |
| Temperature — chamber wall | DS18B20 waterproof probe | 1-Wire | ±0.5°C accuracy. Use 9-bit resolution for 94ms response (not 12-bit — 750ms is too slow). |
| Turbulence / Vibration | ADXL345 breakout board | I2C or SPI | Mount directly on the chamber body with adhesive or clamp. This sensor does double duty — it reads structural vibration AND provides the cavitation signature (high-frequency spikes above 500Hz). |

### Controller and Electronics

| Item | Part | Notes |
|---|---|---|
| Microcontroller | ESP32-S3 DevKit (any USB DevKit variant) | Dual-core 240MHz. The two cores run sensor/governance tasks on Core 0 and actuator/logging tasks on Core 1. |
| Valve driver board | 4-channel MOSFET board, IRLZ44N or equivalent | 12V / 15A per channel, logic-level input from ESP32. Controls V1, V2, and pump. |
| Power supply | 12V 3A regulated DC, barrel jack | Powers valves and pump. The ESP32 and sensors run on the board's onboard 3.3V regulator — no separate supply needed if your DevKit has a good LDO. |
| SD card module | Micro SD breakout, SPI interface | Logs all 42 node values, mode transitions, and raw sensor readings. |
| Display (optional but recommended) | 0.96" OLED, I2C, SSD1306 controller | Shows current mode and primitive aggregates on the bench without opening a laptop. Very useful when filming. |
| Project enclosure | IP65 waterproof project box, medium size | Protects the controller from water splash. The hydraulic system will spray on first startup. |
| Misc | Screw terminals, hookup wire (22 AWG), heatshrink, DIN rail (optional) | Pre-terminate all connections with screw terminals. No floating bare wires. |
| 4.7kΩ resistor | 1/4W through-hole | Pull-up resistor for the DS18B20 1-Wire data line. One required. |

---

## PHYSICAL ASSEMBLY — FLUID CIRCUIT

Build the fluid circuit first before touching any electronics. Pressure-test it with water and no
electronics present. Find all leaks before the controller is anywhere near it.

**Step 1 — Lay out the circuit path on the bench.**
The water flows in a loop:
```
Reservoir → Pump → Inlet Valve (V1) → Pressure Chamber → Outlet Valve (V2) → Reservoir
                                              |
                                         Micro-Turbine (inside or inline with chamber)
                                              |
                                    Relief Valve (V3) — teed off the chamber line
```

**Step 2 — Mount the pressure chamber.**
Secure the polycarbonate tube vertically or horizontally — vertical is easier to see flow visually.
Thread the brass NPT fittings into both end caps. Seal all NPT threads with PTFE tape (3 wraps,
clockwise when looking at the thread end). Hand tight plus 1–2 turns with a wrench. Do not
overtighten polycarbonate fittings.

**Step 3 — Install the relief valve (V3).**
Tee off the inlet side of the pressure chamber. V3 is always in-line and always passive — it
opens automatically if pressure exceeds its spring setting. Set it to 80% of the chamber's rated
max pressure. This valve is never wired to anything. It is your mechanical safety, independent of
all firmware.

**Step 4 — Install the solenoid valves.**
V1 goes on the inlet line, between the pump and the pressure chamber.
V2 goes on the outlet line, between the chamber and the reservoir return.
Both are normally-closed — they default to closed when unpowered. This is the safe failure state.
Install flow direction arrows on the valve bodies matching your flow direction.

**Step 5 — Mount the pump.**
Mount the pump at or below the reservoir water level. Prime it before first run by filling the
inlet line completely with water. A dry-running centrifugal pump will overheat quickly.

**Step 6 — Connect all tubing.**
Use hose clamps on every barbed fitting. Double-clamp anywhere above 10 PSI. Route tubing so
there are no upward traps where air can collect — air pockets cause pressure anomalies that will
confuse the sensors.

**Step 7 — Pressure test (water only, no power).**
Fill the reservoir. Open V1 and V2 manually (12V jumper wire briefly). Run the pump. Check every
fitting for leaks. Let it run for 5 minutes. Fix every drip before proceeding. There will be drips.

---

## SENSOR INSTALLATION

Install sensors only after the fluid circuit is leak-free.

**Pressure sensors (PS-A and PS-B).**
Tee both sensors into the tubing using 1/4" NPT brass tees. PS-A on the inlet line, just before
V1. PS-B on the outlet line, just after V2. Sensors face upward if possible — trapped air bubbles
under a downward-facing sensor give false pressure readings.

**Flow sensors (FS-A and FS-B).**
Install inline in the tubing. FS-A on the inlet line between pump and V1. FS-B on the outlet line
after V2. Flow sensors are directional — install with the arrow matching flow direction. These are
pulse-output sensors: each pulse from the Hall-effect element represents a fixed volume of water.
The ESP32 counts pulses per second and converts to liters per minute.

**Temperature sensor (TS-1).**
Mount the DS18B20 waterproof probe against the chamber wall, held with a hose clamp or zip tie.
Thermal paste between the probe tip and the chamber wall improves response. Do not submerge the
probe body in water — only the stainless probe tip is waterproof.

**Accelerometer (ADXL345).**
Mount the breakout board directly on the pressure chamber body — not on the bench, not on the
enclosure. It needs to be mechanically coupled to the chamber to measure chamber vibration and
turbulence-induced acceleration. Use double-sided foam tape or a small clamp. The foam tape also
provides minor vibration isolation from the bench itself, which is what you want.

---

## ELECTRONICS WIRING

Work in the enclosure. All connections via screw terminals — no bare wire ends.

### Power Distribution

```
12V DC input (barrel jack on enclosure wall)
  ├── MOSFET board VIN → powers V1, V2, pump relay
  └── Step-down regulator or ESP32 DevKit USB/VIN → 3.3V for MCU and sensors
```

Do not power the ESP32 and the solenoid valves from the same regulator. Valve switching causes
voltage spikes. Use the DevKit's onboard regulator for the MCU/sensors and let the MOSFET board
handle valve power directly from 12V.

### ESP32-S3 GPIO Assignments

| GPIO | Connected To | Notes |
|---|---|---|
| GPIO 4 | V1 MOSFET gate | Inlet valve — HIGH = open |
| GPIO 5 | V2 MOSFET gate | Outlet valve — HIGH = open |
| GPIO 6 | Pump MOSFET gate | Pump — HIGH = on |
| GPIO 21 | I2C SDA | PS-A, PS-B, ADXL345, OLED all share this bus |
| GPIO 22 | I2C SCL | Same I2C bus |
| GPIO 18 | 1-Wire data | DS18B20 temperature sensor (4.7kΩ pull-up to 3.3V on this line) |
| GPIO 34 | FS-A pulse input | Flow sensor A — interrupt-driven pulse counting |
| GPIO 35 | FS-B pulse input | Flow sensor B — interrupt-driven pulse counting |
| GPIO 23 | SPI MOSI | SD card |
| GPIO 19 | SPI MISO | SD card |
| GPIO 18 | SPI CLK | SD card |
| GPIO 5  | SPI CS | SD card (use a different GPIO if conflicts with V2 — remap as needed) |

**Note on I2C addresses:**
- PS-A (Honeywell MPRLS): address 0x18
- PS-B (Honeywell MPRLS): address 0x19 (use the address jumper on the second board)
- ADXL345: address 0x53 (SDO pin to GND) or 0x1D (SDO to 3.3V)
- SSD1306 OLED: address 0x3C (most common) or 0x3D

Verify all four devices respond on the I2C bus with an I2C scanner sketch before flashing the
full firmware.

### MOSFET Valve Driver Wiring

Each solenoid valve connects:
- Valve + lead → MOSFET drain (12V switched output)
- Valve − lead → 12V GND
- Add a flyback diode (1N4007) across each valve coil: cathode to +, anode to −. Without this,
  valve switching injects voltage spikes back into the power rail. The ADXL345 is sensitive enough
  to detect these as false vibration events if not suppressed.

---

## FIRMWARE SETUP AND FLASH ORDER

Flash the ESP32-S3 in stages. Do not flash the full firmware on a bench that has not passed the
sensor baseline test.

**Stage 1 — I2C scanner.**
Flash a basic I2C scanner sketch. Scan the bus. Confirm all expected addresses appear:
0x18 (PS-A), 0x19 (PS-B), 0x53 or 0x1D (ADXL345), 0x3C (OLED). Fix wiring before proceeding.

**Stage 2 — Sensor readout.**
Flash a sensor readout sketch. Print all raw sensor values to serial at 1Hz:
PS-A PSI, PS-B PSI, FS-A LPM, FS-B LPM, TS-1 Celsius, ADXL345 X/Y/Z g.
With valves closed and pump off, verify:
- Pressure sensors read near 0 PSI (atmospheric, slight positive offset is normal)
- Flow sensors read 0.0 LPM
- Temperature reads ambient room temperature
- Accelerometer reads approximately 1.0g on whichever axis is vertical (gravity)

**Stage 3 — Normalization layer.**
Add the normalization functions. Print normalized node values alongside raw values.
At rest (pump off, valves closed), all 42 node values should read between −0.1 and +0.1.
If any node reads far from zero at rest, the normalization function has a calibration error.

**Stage 4 — Valve drivers.**
Flash a simple valve test. Toggle V1 on/off every 2 seconds. Listen for the solenoid click.
Confirm V1 opens (flow starts) and closes (flow stops). Repeat for V2 and the pump.
If no click is heard, check MOSFET gate wiring. A MOSFET that is always-on has its gate floating.

**Stage 5 — Full firmware.**
Flash the complete HydroCore firmware with all five FreeRTOS tasks:
- SENSOR_TASK (Core 0, 500Hz)
- HYDROCORE_TASK (Core 0, 100Hz)
- ACTUATOR_TASK (Core 1, 200Hz)
- LOGGING_TASK (Core 1, 10Hz)
- DISPLAY_TASK (Core 1, 2Hz)

Verify the OLED shows a mode and four primitive values. Verify the SD card begins logging.

---

## OPERATING THE SYSTEM — STARTUP PROCEDURE

Follow this order every time. Do not shortcut it.

**1. Fill the reservoir.**
Fill to 80% — not full. Thermal expansion and pump priming need headroom.

**2. Power on the controller only (12V supply on, pump and valves still unpowered).**
Confirm the OLED initializes and shows STABILITY MODE with all primitives near zero.
Confirm SD card logging begins (check the SD card LED or serial output).

**3. Open WiFi dashboard.**
The ESP32 broadcasts a WiFi hotspot named `HydroCore-Physical`. Connect from any phone or laptop.
Open the dashboard at `192.168.4.1`. You should see live primitive rings and sensor readouts.

**4. Enable the pump.**
Flip the pump power switch (or enable via dashboard if implemented). Let the pump prime for
10 seconds before opening any valves. You will hear the pump cavitate briefly as air purges —
this is normal on first start. If it persists past 10 seconds, stop and check for air traps.

**5. Open V1 (inlet valve).**
The dashboard valve control opens V1. Pressure should begin building in the chamber.
Watch PS-A on the dashboard — it should rise smoothly to your target setpoint (typically 10–15 PSI
for bench operation).

**6. Open V2 (outlet valve).**
Open V2 to begin flow through the turbine. You should see:
- FS-A and FS-B reading positive LPM values
- PR1 (Chamber Pressure) stabilizing near 0.0 (on-target)
- Mode display showing STABILITY MODE
- The OLED primitive rings showing all four primitives in the green band

**7. Let it run.**
At stable operation, leave it running for a minimum of 10 minutes before filming or testing.
The thermal nodes (TB1–TB11) need time to stabilize. Early readings will show artificially good
thermal state as the water warms from ambient.

---

## THE FIVE OPERATING MODES — WHAT TO WATCH FOR

| Mode | What it looks like | What caused it |
|---|---|---|
| STABILITY | Green across all four primitives. V1 modulating slowly. Normal running state. | All variables healthy. |
| POWER | V1 fully open. Higher flow and pressure. Exits automatically if turbulence rises. | All healthy + high output demand. |
| BALANCE | V1 and V2 both modulating in small coordinated steps. | Pressure and flow are pulling against each other — one is high while the other is low. |
| RECOVERY | V1 partially closed. V2 wide open. System running at reduced load. | Thermal load or structural fatigue getting high. System is cooling itself down. |
| SAFETY | V1 slams closed. V2 opens fully. Pump stops. Dashboard shows red. | A safety node hit critical (FS10, PR10, TB11, or SL11 ≤ −0.8). System will not restart until the fault clears for 5 continuous seconds. |

---

## TEST SEQUENCE — RUN THESE IN ORDER

Run all six tests before filming the demo. Tests 1 and 6 are the most important.

**Test 1 — Sensor baseline.**
Pump off, valves closed. Verify all 42 node values are within ±0.1 of 0.0. Log the results.
This is your reference state. If baseline is off, normalization calibration needs adjustment.

**Test 2 — Mode transition (Balance → Stability).**
With system running in Stability Mode, partially restrict V2 manually (clamp the outlet tube
briefly). Pressure rises, flow drops. Verify the system transitions to Balance Mode.
Release the restriction. Verify return to Stability Mode within 30 seconds.

**Test 3 — Safety mode trigger.**
Restrict V2 aggressively until PS-A approaches 90% of rated max pressure.
Verify Safety Mode fires within one control loop cycle (should be nearly instantaneous — within
10ms from threshold crossing to V1 close command, plus valve settling time of 20–40ms).
Verify V1 closes, V2 opens, pump stops. Verify PR10 node reads ≤ −0.8 in the log.

**Test 4 — Thermal cutoff.**
Use a heat gun on the chamber wall to drive TS-1 above 60°C.
Verify TB11 goes critical, Safety Mode fires, pump stops.
Do not let the system run hot for more than 30 seconds — this test can damage PVC tubing if
prolonged. Have a cold wet cloth ready to cool the chamber afterward.

**Test 5 — Cavitation simulation.**
Drive the system to near-maximum flow rate. Then rapidly close V2 (water hammer).
Watch the ADXL345 raw values on the dashboard — you should see a high-frequency spike.
Verify FS4 (Cavitation Risk) node responds and FS10 drops toward caution or critical.

**Test 6 — Determinism verification. This is the acceptance test.**
Set the system to a known steady state: PS-A = 12.5 PSI, FS-A = 4.2 L/min, TS-1 = 32°C,
ADXL345 RMS = 0.1g. Record the full 42-node snapshot and the current mode from the log.
Shut down and restart the system. Reproduce the same sensor conditions manually using valve
control. Verify the 42-node snapshot and mode are identical to the first run.
If they match: the system is deterministic. This is the result the prototype exists to prove.

---

## YOUTUBE FILMING PLAN

Film in this order. Have the dashboard visible (screen capture or second camera on the laptop)
in every shot. The dashboard is what proves the governance is happening in real time.

**Shot 1 — Overview (60 seconds)**
Wide shot of the full bench: reservoir, tubing, pressure chamber (clear tube with flow visible),
electronics enclosure, laptop with dashboard open. No explanation yet. Just show the machine.

**Shot 2 — Startup sequence (90 seconds)**
Film the startup procedure in real time. Show the pump priming. Show the dashboard going live.
Show the primitive rings stabilizing as the system reaches steady state. This establishes that
the machine runs and the governance is active before any test.

**Shot 3 — Stability Mode running (60 seconds)**
Close-up on the clear pressure chamber — water flowing, turbine spinning. Cut to dashboard
showing all four primitives in the green band, mode reading STABILITY. Let it run for 30 seconds.
Narrate what Stability Mode means: the organism is maintaining laminar flow at target pressure.

**Shot 4 — Balance Mode trigger (90 seconds)**
Film Test 2. Manually restrict the outlet, narrate what you are doing and why. Show the dashboard
transition from STABILITY to BALANCE. Show both V1 and V2 modulating. Release the restriction
and show the return to STABILITY. This is the clearest visible demonstration of real-time
governance responding to a physical event.

**Shot 5 — Safety Mode trigger (60 seconds)**
Film Test 3. Restrict the outlet aggressively. Have a second camera or screen capture showing
the PR10 node dropping in real time. When Safety Mode fires — V1 slams shut, pump stops — make
sure both cameras capture it simultaneously. This is the most dramatic shot.

**Shot 6 — The log file (30 seconds)**
Pull the SD card. Open the log on the laptop. Show the mode transition entries with timestamps.
Show the 42-node snapshot at the moment of the Safety Mode event. Narrate: every decision is
recorded, timestamped, and replayable. Same inputs always produce the same decision.

**Shot 7 — Determinism test (90 seconds)**
Film Test 6. This is the thesis shot. Set the known input conditions, record the 42-node output.
Restart, reproduce the inputs, show the identical output side by side. Narrate:
this is not AI. This is not probabilistic. Same input, same output, always.

---

## SAFETY NOTES

- V3 (mechanical relief valve) must be installed before ANY pressurized run. No exceptions.
- Do not run the pump dry. Prime it before opening any valves.
- Do not run above 20 PSI on a clear polycarbonate chamber without verifying the polycarbonate's
  pressure rating. Most polycarbonate tubing is rated 60–150 PSI, but verify your specific tube.
- Keep the electronics enclosure closed during operation. Water will spray on first startup.
- DS18B20 — only the stainless probe tip is waterproof. The cable body is not. Keep it dry.
- When filming, do not obstruct V3 (the relief valve outlet). If it opens, it will spray.
- Have a towel and a bucket nearby for the first full-power run. Plan for it to leak somewhere.

---

**Patent:** U.S. Provisional Application No. 64/032,339
**ORCID:** 0009-0007-5214-649X
**Contact:** team@dwsc.io
**Organization:** DarkWave Studios LLC
