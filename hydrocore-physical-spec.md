# HydroCore Physical Engine — Complete Engineering Specification

**Author:** Jason Andrews / DarkWave Studios LLC
**ORCID:** 0009-0007-5214-649X
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Date:** May 2026
**Version:** 1.0 — Prototype / Bench Build

---

## Purpose

This document is the complete engineering specification for the Deterministic Hydraulic Engine — a physical hydraulic machine whose behavior is governed in real time by the HydroCore synthetic organism (Lume 4/42 architecture). It is intended for a build agent with electronics and embedded systems capability.

The engine is not a conventional PID-controlled hydraulic system. It is governed by a 42-node deterministic organism that monitors 4 physical flow primitives simultaneously, selects a discrete operating mode, and issues deterministic actuator commands. Same sensor readings always produce the same valve states. Always.

---

## System Overview

```
[Water Source] → [Inlet Valve V1] → [Pressure Chamber]
                                          │
                                    [Turbine/Piston]
                                          │
                              [Outlet Valve V2] → [Return / Output]
                                          │
                              [Return Line] → [Reservoir]

Sensor Layer:
  PS-A: Pressure sensor, chamber inlet
  PS-B: Pressure sensor, chamber outlet
  FS-A: Flow sensor, inlet line
  FS-B: Flow sensor, outlet line
  TS-1: Temperature sensor, chamber wall
  AX-1: Piezo accelerometer, chamber body (turbulence + vibration proxy)
  OX-1: Dissolved oxygen sensor (optional, environmental HydroCore variant)

Controller:
  MCU: ESP32-S3 (dual core, 240MHz)
  Actuators: V1, V2 (solenoid valves), V3 (bypass/relief valve)
  Power: 12V DC supply or battery
  Logging: SD card module or serial-over-USB
```

---

## Bill of Materials (Prototype Scale)

### Fluid System

| Component | Spec | Notes |
|---|---|---|
| Reservoir | 3-gallon HDPE tank | Closed-loop baseline. Replace with gravity feed for net generation. |
| Pressure chamber | 1/2" ID clear polycarbonate tube, 12" length, end-capped with brass NPT fittings | Allows visual inspection of flow state |
| Micro-turbine | Pelton-style, 1/2" nozzle, stainless, rated 0.5–5 PSI operating range | OR: 1/2" bore piston assembly with return spring |
| Inlet valve V1 | 12V NC solenoid valve, 1/4" NPT, food-grade, 0–100 PSI rated | Granzow W5A04-AA0K00 or equivalent |
| Outlet valve V2 | Same spec as V1 | |
| Relief valve V3 | Spring-loaded pressure relief, 1/4" NPT, set at 80% of chamber max pressure | Safety — passive, not solenoid-controlled |
| Tubing | 1/2" ID reinforced PVC, pressure-rated to 100 PSI | |
| Fittings | 1/4" NPT brass, assorted tees and elbows | |
| Pump (closed-loop only) | 12V centrifugal pump, 2–5 GPM, 10 PSI max | Removes net generation claim — for bench testing only |

### Sensor Layer

| Sensor | Part | Interface | Notes |
|---|---|---|---|
| Pressure A (inlet) | Honeywell MPRLS0025PA00001A | I2C | 0–25 PSI, ±0.25% accuracy |
| Pressure B (outlet) | Same | I2C | |
| Flow A (inlet) | YF-S201 Hall-effect flow sensor | Pulse count | 1–30 L/min, ±10% accuracy |
| Flow B (outlet) | Same | Pulse count | Pair with Flow A for net flow computation |
| Temperature | DS18B20 waterproof probe | 1-Wire | ±0.5°C, 9–12 bit resolution |
| Turbulence / Vibration | Piezo MEMS accelerometer ADXL345 | I2C/SPI | Mounted on chamber body. Computes turbulence proxy from RMS acceleration at 10–100 Hz band |
| Cavitation proxy | Same ADXL345, high-freq band | — | Cavitation signature: impulsive spikes above 500Hz (use FFT on accelerometer data) |

**Note on turbulence sensing:** True optical or acoustic Doppler turbulence measurement is laboratory-grade and not appropriate for a bench prototype. Turbulence is computed as a derived signal: pressure differential variance (PS-A minus PS-B, measured over 100ms windows) combined with ADXL345 RMS acceleration in the 10–100 Hz band. This composite proxy adequately populates FS2 (Turbulence Onset) and FS3 (Turbulence Intensity) nodes for prototype-scale validation.

### Controller and Electronics

| Component | Part | Notes |
|---|---|---|
| Microcontroller | ESP32-S3 DevKit | Dual-core 240MHz, 512KB SRAM, 8MB flash, I2C + SPI + 1-Wire + GPIO |
| Valve driver | MOSFET board (4-channel, IRLZ44N or equivalent) | 12V/15A per channel, logic-level input |
| Power supply | 12V 3A regulated DC | Powers valves and pump. Separate 3.3V LDO for MCU and sensors |
| Logging | Micro SD card breakout (SPI) | Stores pressure curves, flow curves, mode transitions |
| Display (optional) | 0.96" OLED I2C (SSD1306) | Shows current mode, primitive aggregates, safety status |
| Enclosure | IP65 project box | Protects controller electronics from moisture |
| Misc | Screw terminals, DIN rail, wire, heatshrink | |

**Estimated BOM cost (prototype):** $150–$250 USD depending on sourcing.

---

## 42-Node Physical Mapping — Complete Specification

All nodes normalized to −1.0 (critical) → +1.0 (optimal). Sensor readings are converted to normalized values per the conversion functions below.

### Primitive 1 — Flow Stability (FS1–FS10, 10 nodes)

| Node | Name | Physical Signal | Conversion |
|---|---|---|---|
| FS1 | Laminar Stability | Pressure diff variance (PS-A − PS-B over 100ms) | 1 − (variance / max_variance), clamped |
| FS2 | Turbulence Onset | ADXL345 RMS 10–100Hz band | 1 − (rms / rms_threshold), clamped |
| FS3 | Turbulence Intensity | ADXL345 RMS peak sustained >200ms | 1 − (peak_rms / peak_max), clamped |
| FS4 | Cavitation Risk | ADXL345 FFT energy above 500Hz | 1 − (hf_energy / hf_threshold), clamped |
| FS5 | Flow Uniformity | FS-A vs FS-B flow rate ratio | 1 − abs(1 − (fa / fb)), clamped |
| FS6 | Vortex Formation | Pressure oscillation frequency (PS-A FFT dominant freq) | 1 − (osc_freq / vortex_threshold), clamped |
| FS7 | Flow Recovery Speed | Rate of return to target flow after perturbation | measured during mode transitions |
| FS8 | Shear Stress | Derived: velocity gradient from (FS-A flow rate / chamber cross-section) | (v_target − v_actual) / v_target, inverted |
| FS9 | Flow Drift | 10-cycle rolling mean deviation from setpoint | 1 − (drift / drift_max), clamped |
| FS10 | Flow Safety Index | min(FS1, FS4, FS5) weighted mean | Safety node — triggers on worst sub-group |

### Primitive 2 — Pressure Regulation (PR1–PR10, 10 nodes)

| Node | Name | Physical Signal | Conversion |
|---|---|---|---|
| PR1 | Chamber Pressure | PS-A raw reading (PSI) | (P_target − abs(P_actual − P_target)) / P_target |
| PR2 | Pressure Drift | Rate of change of PS-A over 500ms | 1 − (dP/dt / drift_threshold), clamped |
| PR3 | Surge Pressure | PS-A peak over 100ms window | 1 − (P_peak / P_surge_limit), clamped |
| PR4 | Oscillation Amplitude | PS-A FFT amplitude at dominant frequency | 1 − (amp / amp_threshold), clamped |
| PR5 | Pressure Uniformity | PS-A vs PS-B differential stability | 1 − (diff_variance / diff_max), clamped |
| PR6 | Backflow Risk | FS-B reading negative or below zero threshold | Backflow = −1.0; no backflow = +1.0 |
| PR7 | Pressure Recovery Speed | Time to return to setpoint after perturbation | 1 − (recovery_ms / recovery_limit_ms) |
| PR8 | Pressure Load | Sustained PS-A above 80% of rated max | 1 − (load_factor), clamped |
| PR9 | Pressure Volatility | Standard deviation of PS-A over 1 second window | 1 − (stddev / stddev_threshold), clamped |
| PR10 | Pressure Safety Index | min(PR1, PR3, PR6) weighted | Safety node |

### Primitive 3 — Thermal Balance (TB1–TB11, 11 nodes)

| Node | Name | Physical Signal | Conversion |
|---|---|---|---|
| TB1 | Temperature Rise | TS-1 delta from baseline (°C/min) | 1 − (dT_dt / dT_limit), clamped |
| TB2 | Thermal Load | TS-1 absolute (°C), relative to water max operating temp (65°C for standard water) | (65 − T) / 45, clamped |
| TB3 | Cooling Efficiency | Rate of temperature drop during Recovery Mode | measured during mode transitions |
| TB4 | Heat Saturation | TS-1 sustained above 55°C for >30 seconds | binary threshold node |
| TB5 | Thermal Drift | Rolling 60-second TS-1 mean deviation | 1 − (drift / drift_max) |
| TB6 | Thermal Noise | TS-1 high-frequency variance (1-second window stddev) | 1 − (noise / noise_max) |
| TB7 | Thermal Recovery Speed | TS-1 rate of descent after thermal event | measured |
| TB8 | Thermal Load Index | Composite: TB2 + TB4 + TB1 weighted mean | Derived |
| TB9 | Thermal Volatility | TS-1 second-derivative (acceleration of temperature change) | 1 − (d2T/dt2 / limit), clamped |
| TB10 | Heat Transfer Efficiency | Ratio of thermal load reduction to cooling effort in Recovery Mode | measured |
| TB11 | Thermal Safety Index | min(TB2, TB4, TB8) | Safety node — triggers thermal cutoff |

### Primitive 4 — Structural Load (SL1–SL11, 11 nodes)

| Node | Name | Physical Signal | Conversion |
|---|---|---|---|
| SL1 | Mechanical Stress | ADXL345 static force component (DC acceleration) | 1 − (force / force_max), clamped |
| SL2 | Vibration Amplitude | ADXL345 RMS 1–10Hz band (structural vibration) | 1 − (rms / rms_max), clamped |
| SL3 | Resonance Risk | ADXL345 FFT — peak at system natural frequency | 1 − (resonance_amp / resonance_threshold) |
| SL4 | Fatigue Load | Cumulative vibration cycles above threshold (session counter) | 1 − (cycle_count / cycle_limit) |
| SL5 | Structural Drift | Low-frequency DC offset drift in ADXL345 over session | 1 − (offset_drift / drift_limit) |
| SL6 | Harmonic Load | ADXL345 FFT — energy at 2nd and 3rd harmonics of operating frequency | 1 − (harmonic_energy / harmonic_max) |
| SL7 | Structural Recovery Speed | Vibration decay time after impulse | 1 − (decay_ms / decay_limit_ms) |
| SL8 | Material Flexion | Chamber body flex — derived from pressure vs. wall expansion (if strain gauge added) | Requires strain gauge for v2; default 0.0 in v1 |
| SL9 | Structural Volatility | Rate of change of SL2 over 500ms | 1 − (dRMS/dt / limit) |
| SL10 | Vibration Noise | Broadband noise floor from ADXL345 (0.5–500Hz RMS) | 1 − (noise_floor / noise_max) |
| SL11 | Structural Safety Index | min(SL1, SL3, SL4) weighted | Safety node |

---

## Safety Node Hard Constraints

The following conditions trigger immediate Safety Mode regardless of all other node states:

| Condition | Node | Action |
|---|---|---|
| Cavitation detected (FS4 ≤ −0.8) | FS10 → critical | Immediate V1 close, V2 open, pressure drop |
| Chamber pressure exceeds 90% rated max (PR3 ≤ −0.9) | PR10 → critical | Immediate V1 close, relief valve check |
| Temperature ≥ 60°C (TB4 triggered, TB11 → critical) | TB11 → critical | Immediate pump stop, V2 open, system drain |
| Structural resonance detected (SL3 ≤ −0.8) | SL11 → critical | Immediate operating frequency shift via valve timing |

Passive relief valve V3 provides mechanical safety independent of the control loop. It is always present and not under firmware control.

---

## Threshold Model

| Band | Range | Action |
|---|---|---|
| Optimal | 0.0 to +1.0 | No intervention |
| Advisory | −0.3 to 0.0 | Log and monitor; no actuator change |
| Caution | −0.4 to −0.7 | Mode selection re-evaluated; actuator adjustment initiated |
| Critical | −0.8 to −1.0 | Safety protocol engagement; mode forced to SAFETY or RECOVERY |

---

## Operating Modes

### Mode 1: STABILITY MODE
**Trigger:** All primitives at advisory or better.
**Goal:** Maintain laminar flow at target operating point.
**Actuator state:** V1 modulated to hold PS-A at setpoint. V2 at fixed aperture for target flow rate.
**Node targets:** FS1 > −0.2, PR1 > −0.2, all safety nodes > −0.3.

### Mode 2: POWER MODE
**Trigger:** All primitives healthy, output demand signal high (if connected to load).
**Goal:** Maximize turbine torque / generator output.
**Actuator state:** V1 fully open. V2 modulated to maintain safe outlet pressure.
**Constraint:** Automatically exits if FS2 (Turbulence Onset) reaches −0.4.

### Mode 3: SAFETY MODE
**Trigger:** Any safety index node (FS10, PR10, TB11, SL11) at −0.8 or below.
**Goal:** Suppress the fault condition. Protect chamber integrity.
**Actuator state:** V1 immediately closed. V2 fully open (depressurize). Pump stops.
**Exit condition:** All safety nodes return above −0.5 for 5 consecutive seconds.

### Mode 4: RECOVERY MODE
**Trigger:** TB2 (Thermal Load) at caution OR SL4 (Fatigue Load) at caution OR PR8 (Pressure Load) sustained.
**Goal:** Reduce thermal and mechanical load. Allow system cooling.
**Actuator state:** V1 partially closed (50% rated flow). V2 fully open. Cycle duty reduced.
**Exit condition:** TB2 and SL4 return above −0.3.

### Mode 5: BALANCE MODE
**Trigger:** PR-primitive and FS-primitive have opposing signals (pressure high, flow low, or vice versa).
**Goal:** Re-establish equilibrium between pressure and flow.
**Actuator state:** V1 and V2 both modulated in coordination. Small incremental adjustments, 10Hz update rate. Target: FS5 (Flow Uniformity) and PR5 (Pressure Uniformity) both above −0.2.

---

## Firmware Architecture

**Platform:** ESP32-S3, Arduino framework or ESP-IDF. Recommend FreeRTOS dual-core task model.

### Task Map

```
Core 0:
  Task: SENSOR_TASK       Priority: HIGH    Period: 2ms (500Hz)
    - Read all sensors
    - Normalize to −1.0/+1.0
    - Write to shared state buffer (mutex-protected)

  Task: HYDROCORE_TASK    Priority: HIGH    Period: 10ms (100Hz)
    - Read normalized sensor values
    - Compute 42-node state
    - Compute primitive aggregates
    - Evaluate thresholds
    - Detect critical patterns
    - Select operating mode
    - Generate actuator commands
    - Write commands to actuator queue

Core 1:
  Task: ACTUATOR_TASK     Priority: HIGH    Period: 5ms (200Hz)
    - Read actuator command queue
    - Apply lag compensation (see below)
    - Drive MOSFET outputs for V1, V2

  Task: LOGGING_TASK      Priority: LOW     Period: 100ms
    - Write primitive aggregates, mode, timestamp to SD card
    - Write node states at mode transitions (full 42-node snapshot)

  Task: DISPLAY_TASK      Priority: LOW     Period: 500ms
    - Update OLED with current mode, primitive aggregates, safety status
```

### Lag Compensation Model

Physical hydraulic systems have inertia. Commands issued at 100Hz may not result in physical changes for 20–200ms depending on valve type, pressure, and tube length. Without compensation, the control loop will over-correct.

```
Per actuator, maintain:
  command_queue[]: FIFO of pending valve states
  settling_time_ms: measured or configured per valve type
    Solenoid valve (12V, 1/4" NPT): 20–40ms typical
    Pressure wave propagation (1/2" tube, 12"): ~0.008ms (negligible)
    Thermal sensor response (DS18B20): 750ms at 12-bit — use 9-bit (94ms)

Lag compensation algorithm:
  1. HydroCore issues actuator command at time T
  2. Command is queued with timestamp T
  3. ACTUATOR_TASK fires the command at T
  4. HydroCore does NOT re-evaluate the same actuator until T + settling_time_ms
     (flag: actuator_settling = true for settling_time_ms duration)
  5. During settling period, that actuator's contribution to node state
     is computed from the COMMANDED state, not the measured state
     (predict-ahead: "what will the sensor read once the valve settles")
```

### Sensor Normalization Functions

```c
// Pressure sensor (Honeywell MPRLS, 0-25 PSI → normalized)
float normalize_pressure(float psi, float target_psi, float max_psi) {
    float deviation = fabs(psi - target_psi) / max_psi;
    return fmaxf(-1.0f, fminf(1.0f, 1.0f - deviation));
}

// Flow sensor (YF-S201, pulse count → L/min → normalized)
float normalize_flow(float lpm, float target_lpm, float max_lpm) {
    float deviation = fabs(lpm - target_lpm) / max_lpm;
    return fmaxf(-1.0f, fminf(1.0f, 1.0f - deviation));
}

// Temperature sensor (DS18B20, °C → normalized, max 65°C)
float normalize_temperature(float celsius) {
    return fmaxf(-1.0f, fminf(1.0f, (65.0f - celsius) / 45.0f));
}

// Accelerometer RMS (ADXL345, g → normalized)
float normalize_vibration(float rms_g, float threshold_g) {
    return fmaxf(-1.0f, fminf(1.0f, 1.0f - (rms_g / threshold_g)));
}

// Pressure drift (dP/dt, PSI/s → normalized)
float normalize_pressure_drift(float dpdt, float limit_psi_per_sec) {
    return fmaxf(-1.0f, fminf(1.0f, 1.0f - (fabs(dpdt) / limit_psi_per_sec)));
}
```

### HydroCore Engine Core (Pseudocode)

```c
void hydrocore_evaluate(SensorState* sensors, SystemState* state) {
    // Step 1: Populate all 42 nodes from sensors
    populate_nodes(sensors, state->nodes);

    // Step 2: Apply lag compensation overrides
    apply_settling_overrides(state->nodes, state->actuator_queue);

    // Step 3: Compute primitive aggregates
    for each primitive:
        primitive.aggregate = weighted_mean(primitive.member_nodes)
        primitive.status = evaluate_threshold(primitive.aggregate)

    // Step 4: Detect safety node violations (hard stops first)
    if FS10 <= -0.8 || PR10 <= -0.8 || TB11 <= -0.8 || SL11 <= -0.8:
        state->mode = SAFETY_MODE
        issue_safety_commands(state->actuator_queue)
        return  // do not evaluate further

    // Step 5: Detect critical patterns
    if (FS2 <= -0.4 && PR3 <= -0.4):
        log_pattern("turbulence_surge_compound")
        // compound response: reduce V1 aperture 30%, increase V2

    // Step 6: Select mode (deterministic hierarchy)
    state->mode = select_mode(state->primitives)

    // Step 7: Generate actuator commands for selected mode
    ActuatorCommand cmd = mode_to_commands(state->mode, state->primitives)
    enqueue_actuator_command(state->actuator_queue, cmd)

    // Step 8: Compute ring data
    state->ring = compute_ring_data(state->primitives)
}

Mode select_mode(Primitive* primitives) {
    // Hierarchy: Safety → Recovery → Balance → Power → Stability
    if any_safety_index_critical(): return SAFETY_MODE
    if thermal_or_fatigue_caution(): return RECOVERY_MODE
    if pressure_flow_opposing_signals(): return BALANCE_MODE
    if all_healthy() && load_demand_high(): return POWER_MODE
    return STABILITY_MODE
}
```

### Actuator Command Table per Mode

| Mode | V1 State | V2 State | Update Rate | Notes |
|---|---|---|---|---|
| STABILITY | PWM to setpoint | Fixed aperture | 10Hz | Modulate V1 only |
| POWER | Fully open | PWM for outlet pressure | 5Hz | Monitor FS2 continuously |
| SAFETY | Closed | Fully open | Immediate | Pump stop signal issued |
| RECOVERY | 50% open | Fully open | 2Hz | Allow pressure and heat to dissipate |
| BALANCE | PWM coordinated | PWM coordinated | 10Hz | Small incremental steps only |

---

## Safety Thresholds (Prototype Spec)

| Parameter | Advisory | Caution | Critical | Hard Stop |
|---|---|---|---|---|
| Chamber pressure (PSI) | >18 | >20 | >22 | >23 → V1 close |
| Flow rate (L/min) | <0.5 or >8 | <0.3 or >9 | <0.2 or >10 | FS10 → critical |
| Temperature (°C) | >45 | >55 | >60 | >62 → pump stop |
| Vibration RMS (g) | >0.3 | >0.6 | >1.0 | SL11 → critical |
| Pressure drift (PSI/s) | >2 | >4 | >6 | PR10 → critical |

---

## Consumer Product Variant: HydroCore Home

**Tagline:** "Deterministic water-powered energy."
**Honest positioning** (corrected from original handoff):

A closed-loop bench system cannot generate net positive energy. HydroCore Home is positioned as one of two variants:

**Variant A — Gravity Feed Generator:**
Requires a water source at elevation (≥10 feet of head pressure). A rooftop tank, hillside cistern, or elevated rain collection system. Water flows down by gravity through the HydroCore engine, generating mechanical or electrical output, and is optionally returned to the source by a low-power pump or collected at ground level. This generates real net energy from the elevation differential. Target: off-grid cabins, agricultural setups, emergency backup power.

**Variant B — Line Pressure Harvester:**
Connects to existing municipal or irrigation water line (typical 40–80 PSI). HydroCore engine harvests kinetic energy from the flowing water without blocking the primary flow. A micro-turbine inline with the pipe generates power from water that was already flowing. No pump required. Target: residential irrigation lines, commercial water supply monitoring.

**User Interface (both variants):**
- Web dashboard served by ESP32 WiFi hotspot
- Live primitive rings (4/42 ring visualization, one per primitive)
- Current mode indicator with mode history
- Pressure and flow curves (last 60 minutes)
- Safety alerts with node-level detail
- Energy output readout (Wh, if generator attached)

---

## Test Harness

### Bench Test Sequence

**Test 1: Sensor baseline**
- Run system with V1 closed, V2 open, pump off
- Verify all sensors read within expected quiescent range
- Log all 42 node values at rest — verify all within ±0.1 of 0.0 (neutral)

**Test 2: Mode transitions under controlled conditions**
- Manually drive PS-A above caution threshold (constrict V2)
- Verify BALANCE MODE engagement
- Verify V1/V2 actuator response within settling_time_ms
- Verify return to STABILITY MODE when PS-A recovers

**Test 3: Safety mode trigger**
- Drive PS-A above critical threshold (90% rated max)
- Verify SAFETY MODE fires within one control loop cycle (10ms)
- Verify V1 closes within 40ms (valve settling time)
- Verify PR10 node value ≤ −0.8 in logged output

**Test 4: Thermal cutoff**
- Use heat gun on chamber wall to drive TS-1 above 60°C
- Verify TB11 → critical, SAFETY MODE fires, pump stop issued
- Verify TB4 node triggers at correct temperature

**Test 5: Cavitation simulation**
- Drive system to high flow rate (near FS-A max)
- Rapidly close V2 (water hammer simulation)
- Verify ADXL345 detects high-frequency impulse
- Verify FS4 node responds and FS10 reflects cavitation risk

**Test 6: Determinism verification**
- Record input conditions: PS-A=12.5 PSI, FS-A=4.2 L/min, TS-1=32°C, ADXL345 RMS=0.1g
- Record full 42-node state and mode output
- Reset system, reproduce same input conditions (manually via valve control)
- Verify 42-node state and mode output are identical to first run
- This is the determinism test. It must pass. Same inputs = same outputs.

---

## Logging Schema

```json
{
  "timestamp": "2026-05-05T14:23:01.042Z",
  "mode": "STABILITY_MODE",
  "primitives": {
    "flow_stability": 0.72,
    "pressure_regulation": 0.61,
    "thermal_balance": 0.88,
    "structural_load": 0.79
  },
  "safety_nodes": {
    "FS10": 0.68,
    "PR10": 0.57,
    "TB11": 0.84,
    "SL11": 0.74
  },
  "actuators": {
    "V1_aperture_pct": 67,
    "V2_aperture_pct": 45,
    "pump_state": "ON"
  },
  "raw_sensors": {
    "PS_A_psi": 12.4,
    "PS_B_psi": 8.1,
    "FS_A_lpm": 4.3,
    "FS_B_lpm": 4.1,
    "TS_1_celsius": 31.2,
    "ADXL_rms_g": 0.09
  }
}
```

Mode transitions log a full 42-node snapshot at the moment of transition.

---

## Build Order for Agent

1. Flash ESP32-S3 with FreeRTOS skeleton. Verify dual-core task creation.
2. Wire and verify all sensors. Run Test 1 (sensor baseline) before any other code.
3. Implement sensor normalization functions. Verify node values are in −1.0/+1.0 range for known inputs.
4. Implement MOSFET valve drivers. Verify V1 and V2 respond to GPIO commands.
5. Implement lag compensation model. Verify settling time gating works per Test 2.
6. Implement full 42-node population from sensor readings.
7. Implement primitive aggregation and threshold evaluation.
8. Implement mode selection hierarchy.
9. Implement actuator command table per mode.
10. Run Tests 2 and 3 (mode transitions, safety mode).
11. Run Test 6 (determinism verification). This is the acceptance test.
12. Implement logging to SD card.
13. Implement web dashboard (ESP32 WiFi + simple HTML page).
14. Run Tests 4 and 5 (thermal cutoff, cavitation simulation).

---

## Metadata

**Author:** Jason Andrews / ORCID: 0009-0007-5214-649X
**Organization:** DarkWave Studios LLC
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Related organism paper:** hydrocore-physical-paper.md (Canon² Series)
**Source organism:** HydroCore (hydrocore-paper.md)
**Engine spec:** lume-engine-spec.md
