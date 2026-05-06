# HydroCore Drive — Complete Engineering Specification
## Deterministic Hydrogen-Hybrid Vehicle System

**Author:** Jason Andrews / DarkWave Studios LLC
**ORCID:** 0009-0007-5214-649X
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Date:** May 2026
**Version:** 1.0 — Architecture / Pre-Prototype

---

## Purpose

This document is the complete engineering specification for the HydroCore Drive vehicle system — a hydrogen-hybrid electric vehicle in which all hydrogen production, pressure management, thermal governance, and energy routing is controlled in real time by the HydroCore synthetic organism (Lume 4/42 architecture).

HydroCore Drive does not refuel at hydrogen stations. It carries water, splits it into hydrogen onboard via deterministic electrolysis, feeds the hydrogen to a PEM fuel cell, and recovers the exhaust water vapor back to the reservoir. External energy inputs — regenerative braking, suspension harvesting, thermal recovery, solar, and optionally Meridian roadway wireless charging — power the electrolyzer.

---

## Energy Balance — Non-Negotiable Physics

This system is not perpetual motion. The energy balance must be stated and understood before any other engineering decision:

| Stage | Efficiency | Notes |
|---|---|---|
| Electrolysis (water → H2) | ~65–70% (PEM, optimized) | HydroCore stabilization improves this vs. uncontrolled |
| Hydrogen storage and delivery | ~95% | Minimal losses at low pressure |
| PEM fuel cell (H2 → electricity) | ~50–60% | Standard PEM stack |
| Round-trip (electricity → H2 → electricity) | ~33–42% | Best case with HydroCore optimization |
| Electric drivetrain | ~90–95% | Motor + inverter losses |

**Interpretation:** For every 1 kWh of electricity put into the electrolyzer, approximately 0.33–0.42 kWh reaches the wheels via the fuel cell path. The vehicle cannot sustain itself on its own motion energy alone. External energy input is required.

**What makes this viable:**

The vehicle is a hydrogen range extender architecture. A battery pack provides primary energy and propulsion. The onboard electrolyzer runs continuously on supplemental power (harvesting systems + Meridian roadway charging when available) to produce hydrogen. The fuel cell converts that hydrogen back to electricity, extending range well beyond the battery alone. Water is recovered and recycled — the vehicle never needs to refuel with hydrogen at an external station. It recharges electricity and tops up water.

**Honest range architecture:**
- Battery-only range: 150–200 miles (standard EV battery pack)
- Hydrogen extension from harvesting-powered electrolysis: 40–120 additional miles depending on harvesting conditions and drive cycle
- On Meridian-equipped roads: continuous electrolyzer input → near-unlimited range on equipped corridors
- Water consumption: approximately 1 liter of water per ~0.5 kWh of hydrogen energy produced. A 20-gallon reservoir provides ample margin for multi-day driving without water top-up.

---

## System Architecture

```
ENERGY INPUTS
  ┌─────────────────────────────────────────────────────┐
  │ Regenerative braking (2–30 kW peak)                │
  │ Suspension harvesters (0.5–2 kW sustained)         │
  │ Thermoelectric waste heat (0.2–1 kW)               │
  │ Aerodynamic pressure recovery (0.1–0.5 kW)         │
  │ Solar roof/hood panels (0.3–1.5 kW)               │
  │ Meridian roadway wireless charging (3–15 kW)       │
  └────────────────────┬────────────────────────────────┘
                       │
                       ▼
              BATTERY BUFFER (10–40 kWh)
              Primary propulsion + electrolyzer feed
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
  ELECTRIC DRIVETRAIN      HYDROCORE PRESSURE CHAMBER
  (primary propulsion)          │
                         DETERMINISTIC ELECTROLYZER
                         (HydroCore-governed, PEM)
                                   │
                          HYDROGEN BUFFER TANK
                          (1–10 bar, 2–10 kg H2)
                                   │
                            PEM FUEL CELL STACK
                            (20–120 kW rated)
                                   │
                    ┌──────────────┴──────────────┐
                    │                              │
                    ▼                              ▼
          ELECTRIC DRIVETRAIN            WATER VAPOR EXHAUST
          (fuel cell supplement)              │
                                        CONDENSER
                                             │
                                    WATER RESERVOIR
                                    (5–20 gallons)
                                             │
                                    (loop continues)
```

---

## HydroCore 42-Node Vehicle Mapping

The same 42-node structure from HydroCore Physical applies with vehicle-specific node interpretations. Nodes govern both the pressure/flow system and the electrolysis process.

### Primitive 1 — Flow Stability (FS1–FS10)

Governs water flow quality from reservoir to electrolyzer. Turbulence and cavitation in the water feed line degrade electrolysis efficiency and can damage membrane electrode assemblies (MEAs).

| Node | Name | Vehicle Signal | Sensor |
|---|---|---|---|
| FS1 | Laminar Stability | Feed line pressure diff variance | Differential pressure sensor |
| FS2 | Turbulence Onset | Feed line vibration RMS 10–100Hz | MEMS accelerometer on feed line |
| FS3 | Turbulence Intensity | Peak vibration sustained >200ms | Same |
| FS4 | Cavitation Risk | High-frequency acoustic energy >500Hz | Piezo on electrolyzer inlet |
| FS5 | Flow Uniformity | Inlet vs. outlet flow ratio | Dual flow sensors |
| FS6 | Vortex Formation | Pressure oscillation at dominant frequency | FFT of inlet pressure |
| FS7 | Flow Recovery Speed | Recovery time after perturbation | Computed from transient response |
| FS8 | Shear Stress | Derived from flow velocity / tube geometry | Computed |
| FS9 | Flow Drift | Rolling mean deviation from setpoint | Computed |
| FS10 | Flow Safety Index | min(FS1, FS4, FS5) weighted | Safety node |

**Vehicle-specific FS note:** FS4 Cavitation Risk is critical in the vehicle context because MEA membranes are damaged by cavitation-induced pressure spikes. HydroCore suppresses cavitation at the electrolyzer inlet as a first-priority governance action.

### Primitive 2 — Pressure Regulation (PR1–PR10)

Governs chamber pressure feeding the electrolyzer. Elevated and stable pressure increases electrolysis efficiency (Faraday efficiency improves at 3–10 bar vs. atmospheric). HydroCore maintains optimal electrolyzer pressure deterministically.

| Node | Name | Vehicle Signal | Notes |
|---|---|---|---|
| PR1 | Chamber Pressure | Electrolyzer inlet pressure (bar) | Target: 3–8 bar |
| PR2 | Pressure Drift | dP/dt over 500ms | |
| PR3 | Surge Pressure | Peak pressure over 100ms | Surge damages MEA |
| PR4 | Oscillation Amplitude | Pressure FFT dominant amplitude | |
| PR5 | Pressure Uniformity | Inlet/outlet pressure stability | |
| PR6 | Backflow Risk | Hydrogen backflow into water side | Critical — destroys MEA |
| PR7 | Pressure Recovery Speed | Time to setpoint after demand change | |
| PR8 | Pressure Load | Sustained pressure above 80% rated | |
| PR9 | Pressure Volatility | Stddev of pressure over 1 second | |
| PR10 | Pressure Safety Index | min(PR1, PR3, PR6) | Safety node |

**PR6 hard constraint:** Hydrogen backflow from the anode into the cathode water feed is a critical failure mode in PEM electrolyzers. PR6 at critical triggers immediate V1 close and electrolyzer shutdown.

### Primitive 3 — Thermal Balance (TB1–TB11)

Governs thermal state of the electrolyzer stack, fuel cell stack, and water reservoir. PEM electrolyzers operate optimally at 60–80°C. PEM fuel cells operate optimally at 60–80°C. Managing both simultaneously while recovering waste heat is a core HydroCore function.

| Node | Name | Vehicle Signal | Target Range |
|---|---|---|---|
| TB1 | Temperature Rise | dT/dt of electrolyzer stack | < 2°C/min |
| TB2 | Thermal Load | Electrolyzer stack temp (absolute) | 60–80°C optimal |
| TB3 | Cooling Efficiency | Temp drop rate in Recovery Mode | |
| TB4 | Heat Saturation | Stack temp > 85°C sustained 30s | Triggers Recovery |
| TB5 | Thermal Drift | 60-second rolling mean deviation | |
| TB6 | Thermal Noise | Stack temp 1-second stddev | |
| TB7 | Thermal Recovery Speed | Rate of descent after thermal event | |
| TB8 | Thermal Load Index | Composite TB nodes | |
| TB9 | Thermal Volatility | d²T/dt² | |
| TB10 | Heat Transfer Efficiency | Waste heat to thermoelectric yield | |
| TB11 | Thermal Safety Index | min(TB2, TB4, TB8) | Safety node |

**TB2 vehicle-specific behavior:** TB2 is bidirectional — the electrolyzer must not be too cold (< 40°C, efficiency drops sharply) or too hot (> 90°C, membrane degradation). The normalization function peaks at 70°C and degrades in both directions.

```
TB2 normalization: 1 − (|T − 70| / 30), clamped to ±1.0
```

### Primitive 4 — Structural Load (SL1–SL11)

Governs mechanical integrity of all vehicle hydrogen system components under road vibration, acceleration loads, and thermal cycling. Road vehicles experience continuous broadband vibration (5–500Hz), shock events, and sustained G-forces during acceleration and cornering.

| Node | Name | Vehicle Signal | Notes |
|---|---|---|---|
| SL1 | Mechanical Stress | Chassis-mounted accelerometer DC component | |
| SL2 | Vibration Amplitude | ADXL345 RMS 1–10Hz (road vibration) | |
| SL3 | Resonance Risk | FFT at tank/electrolyzer natural frequency | H2 tank resonance is safety-critical |
| SL4 | Fatigue Load | Cumulative high-amplitude vibration cycles | Session + lifetime counter |
| SL5 | Structural Drift | Low-frequency DC offset drift | |
| SL6 | Harmonic Load | FFT energy at harmonics | |
| SL7 | Structural Recovery Speed | Vibration decay after road event | |
| SL8 | Material Flexion | Strain gauge on hydrogen tank (required, not v2) | H2 tank flexion is safety-critical |
| SL9 | Structural Volatility | dRMS/dt over 500ms | |
| SL10 | Vibration Noise | Broadband noise floor | |
| SL11 | Structural Safety Index | min(SL1, SL3, SL4) | Safety node |

**SL8 note:** Unlike the bench engine where SL8 was deferred to v2, in the vehicle context a strain gauge on the hydrogen tank is a required safety component. Hydrogen tank structural integrity monitoring is non-negotiable.

---

## Electrolysis Module — Deterministic Control

### Why Determinism Improves Electrolysis Efficiency

Standard PEM electrolyzer controllers use separate PID loops for voltage, current, temperature, and pressure. These loops are tuned independently and interact through the electrochemical process. Interaction between loops creates transients — brief periods of non-optimal conditions that reduce Faraday efficiency.

HydroCore governs all 42 variables simultaneously and selects a single operating mode that coordinates all actuators coherently. There are no competing loops. The voltage, pressure, temperature, and flow are all commanded from one deterministic output simultaneously.

**Measurable efficiency gain:** Estimated 3–8% improvement in Faraday efficiency at equivalent power input, primarily from cavitation suppression and pressure stability. At 50 kWh/kg H2 baseline, a 5% efficiency gain recovers approximately 2.5 kWh/kg — meaningful at vehicle scale.

### Electrolyzer Specifications (Target)

| Parameter | Specification |
|---|---|
| Type | PEM (Proton Exchange Membrane) |
| Operating pressure | 3–8 bar (HydroCore-governed) |
| Operating temperature | 60–80°C (TB2 optimal band) |
| Current density | 1–3 A/cm² |
| Cell voltage | 1.8–2.2V per cell |
| Stack size (vehicle prototype) | 5–20 kW input |
| H2 output rate | 0.1–0.4 kg/hr at rated input |
| MEA material | Nafion 117 or equivalent |

### Electrolyzer Control Signals (HydroCore → Electrolyzer)

| HydroCore Output | Electrolyzer Action |
|---|---|
| V1 aperture (water feed) | Feed rate to electrolyzer inlet |
| PWM duty cycle (electrolyzer) | Electrolysis current density |
| Target pressure setpoint | Pressure chamber governor |
| Thermal management signal | Coolant loop valve |
| Emergency shutdown | All power cut, V1 close |

---

## Hydrogen Safety Layer

Hydrogen requires a dedicated safety layer beyond the standard HydroCore safety nodes. This layer operates independently of the organism and cannot be overridden.

### Hydrogen-Specific Hard Constraints

| Condition | Sensor | Response |
|---|---|---|
| H2 concentration > 1% in cabin | H2 sensor (cabin) | All windows open, electrolyzer shutdown, fuel cell shutdown, alert |
| H2 concentration > 2% in engine bay | H2 sensor (engine bay) | Electrolyzer shutdown, fuel cell shutdown, vent valve open, vehicle stop |
| H2 concentration > 4% anywhere | Any H2 sensor | Emergency shutdown, all H2 valves close, 911 alert if connected |
| Tank pressure > 95% rated max | Tank pressure sensor | Electrolyzer shutdown, relief valve check, vehicle stop |
| Tank temperature > 85°C | Tank temp sensor | Electrolyzer shutdown, tank cooling loop active |
| Crash detection (impact > 5G) | Chassis accelerometer | Immediate H2 system shutdown, all solenoids close |

**4% lower flammability limit:** Hydrogen ignites in air at concentrations between 4–75%. The 4% threshold is the hard stop. The safety layer fires at 2% (well below ignition) and exits before any ignition risk.

### Hydrogen Sensors Required (BOM addition)

- 2× H2 catalytic sensors (engine bay) — Figaro TGS821 or equivalent
- 1× H2 sensor (passenger cabin) — same
- 1× H2 sensor (tank compartment)
- Dedicated safety MCU (separate from HydroCore MCU — not on same processor) evaluates H2 sensors at 10Hz independently

---

## Regenerative Energy System

### Energy Sources and Realistic Outputs

| Source | Peak Output | Sustained Output | Notes |
|---|---|---|---|
| Regenerative braking | 20–80 kW | 2–5 kW (averaged over drive cycle) | High peak, intermittent |
| Suspension linear generators | 1–3 kW per corner | 0.3–0.8 kW total | Road surface dependent |
| Thermoelectric (waste heat) | 0.5–2 kW | 0.3–1 kW | Engine bay + exhaust thermal gradient |
| Aerodynamic pressure recovery | 0.1–0.5 kW | 0.1–0.3 kW | Speed-dependent |
| Solar roof/hood | 0.3–1.5 kW | 0.2–0.8 kW | Weather/sun angle dependent |
| Meridian roadway (equipped roads) | 3–15 kW | 3–15 kW | Continuous while on equipped road |

**Total sustained without Meridian:** 3–8 kW
**Total with Meridian:** 6–23 kW

At 5 kW sustained to the electrolyzer (without Meridian), the system produces approximately 0.1 kg H2/hr, providing roughly 30–40 additional miles of range per hour of driving. On Meridian roads at 10 kW input, approximately 60–80 additional miles per hour.

### Regeneration Manager (Firmware Module)

The Regeneration Manager allocates incoming energy from all sources:

```
Priority 1: Safety systems (always powered)
Priority 2: Drivetrain (if battery SOC < 20%)
Priority 3: Battery charging (if SOC < 80%)
Priority 4: Electrolyzer (HydroCore-governed rate)
Priority 5: Auxiliary systems
```

When battery SOC is above 80%, all surplus harvested energy flows to the electrolyzer. HydroCore receives the available power input as a signal and adjusts electrolysis rate accordingly (Power Mode vs. Stability Mode selection).

---

## Meridian Coupling Interface

When the vehicle is on a Meridian-equipped road, the following coupling protocol activates:

**Vehicle side (HydroCore nodes populated from Meridian feed):**
- PR8 Pressure Load node receives Meridian energy input rate as a positive modifier (more available power → pressure load reduced → supports Power Mode)
- FS9 Flow Drift receives Meridian stability signal (consistent Meridian input → stable electrolyzer feed)
- TB10 Heat Transfer Efficiency receives Meridian continuity signal (continuous input → steady thermal state)

**Communication protocol:**
Vehicle broadcasts: current battery SOC, electrolyzer demand (kW requested), H2 buffer level.
Meridian node responds: available power (kW), slot allocation, transfer frequency.
Transfer: resonant inductive coupling at vehicle-specific frequency assigned by Meridian routing.

Full Meridian infrastructure specification: see Meridian Infrastructure Specification (companion document).

---

## Operating Modes — Vehicle Context

### STABILITY MODE
**Trigger:** All primitives advisory or better, normal driving.
**Electrolyzer:** Running at moderate rate, maintaining H2 buffer.
**Drivetrain:** Battery primary, fuel cell supplementing as needed.
**Thermal:** All systems in normal operating band.

### POWER MODE
**Trigger:** All primitives healthy, high Meridian input or high regen energy available.
**Electrolyzer:** Maximum rated input, producing H2 aggressively to fill buffer.
**Drivetrain:** Battery + fuel cell combined output available.
**Exit:** FS2 Turbulence Onset at caution, or PR3 Surge, or TB4 triggered.

### SAFETY MODE
**Trigger:** Any safety index node critical, OR any H2 sensor trigger.
**Electrolyzer:** Immediate shutdown.
**Fuel cell:** Immediate shutdown.
**H2 valves:** All closed.
**Vehicle:** Controlled stop initiated.

### RECOVERY MODE
**Trigger:** TB2 above optimal band (stack too hot), SL4 fatigue accumulation.
**Electrolyzer:** Reduced rate (50%).
**Thermal:** Coolant loop increased flow, thermoelectric recovery active.
**Drivetrain:** Battery primary, fuel cell resting.

### BALANCE MODE
**Trigger:** H2 buffer low AND battery SOC moderate AND regen input variable.
**Electrolyzer:** Modulated to match available input, not rated max.
**Goal:** FS5 Flow Uniformity and PR5 Pressure Uniformity both above advisory.

---

## Bill of Materials (Vehicle Prototype Scale)

### Water and Hydrogen Systems

| Component | Spec | Notes |
|---|---|---|
| Water reservoir | 15-gallon HDPE, sealed, pressure-rated | Mounted in former fuel tank position |
| Feed pump | 12V/24V diaphragm pump, 0.5–3 GPM, 100 PSI rated | Continuous duty rated |
| HydroCore pressure chamber | 1" ID polycarbonate/steel, 12" length | Same as bench design, larger scale |
| PEM electrolyzer stack | 5–10 kW rated, 3–8 bar operating pressure | Giner ELX, Nel Hydrogen, or equivalent |
| Hydrogen buffer tank | 2–5 kg H2 capacity, 10 bar rated, Type III composite | Carbon fiber over aluminum liner |
| PEM fuel cell stack | 20–80 kW rated | Ballard FCvelocity, Toyota TFCS, or equivalent |
| Water condenser | Air-cooled aluminum plate-fin, fuel cell exhaust input | Sized for full fuel cell output |
| Solenoid valves | 24V, 1/4"–1/2" NPT, H2-rated (stainless, PTFE seats) | 6–10 required |
| Pressure relief valves | Spring-loaded, H2-rated, set at 90% tank max | One per pressure zone |
| Water-gas separator | Downstream of condenser, returns liquid to reservoir | |

### Sensors

| Sensor | Qty | Part | Notes |
|---|---|---|---|
| Pressure (water) | 3 | Honeywell MPRLS 0–25 PSI | Feed line, chamber, outlet |
| Pressure (H2) | 2 | Honeywell MLH 0–150 PSI | Buffer tank, fuel cell inlet |
| Flow (water) | 2 | YF-S201 or turbine type | Inlet and outlet |
| Temperature (stack) | 3 | DS18B20 waterproof | Electrolyzer, fuel cell, reservoir |
| Accelerometer | 2 | ADXL345 | Feed line + H2 tank |
| Strain gauge | 1 | Full-bridge, bonded to H2 tank | Required (not optional) |
| H2 concentration | 4 | Figaro TGS821 | Engine bay ×2, cabin ×1, tank ×1 |
| Voltage/current | 2 | INA226 or Hall effect CT | Electrolyzer input, fuel cell output |
| Vehicle CAN interface | 1 | MCP2515 | For SOC, drivetrain, regen data |

### Controller

| Component | Spec | Notes |
|---|---|---|
| Primary MCU (HydroCore) | STM32H7 (480MHz, dual-core capable) | Higher performance than ESP32 for vehicle safety requirements |
| Safety MCU (H2 monitoring) | STM32F4 (separate processor) | Dedicated H2 sensor evaluation, cannot be disabled by primary MCU |
| CAN bus interface | MCP2515 + TJA1050 | Integrates with vehicle bus |
| MOSFET drivers | IR2110 or DRV8840 | For solenoid valve control |
| Solid-state relay | For electrolyzer power control | 40A rated |
| Isolated DC-DC converter | 12V → 3.3V, isolated | Sensor power supply |
| Data logger | SD card + 4G modem (optional) | Telemetry to HydroCore cloud |

---

## Firmware Architecture

### Task Map (STM32H7, FreeRTOS)

```
Core M7 (primary processing):
  SENSOR_TASK           2ms period (500Hz)     — all sensors except H2
  HYDROCORE_TASK        10ms period (100Hz)    — 42-node engine
  ELECTROLYSIS_TASK     5ms period (200Hz)     — PWM control to electrolyzer
  REGEN_MANAGER         100ms period           — energy allocation
  FUEL_CELL_TASK        10ms period            — load balancing
  THERMAL_TASK          50ms period            — coolant loops
  MERIDIAN_TASK         100ms period           — Meridian coupling interface
  LOGGING_TASK          1000ms period          — data logging + telemetry
  CAN_TASK              Event-driven           — vehicle bus integration

Core M4 (safety-dedicated, cannot be preempted by M7):
  H2_SAFETY_TASK        100ms period (10Hz)    — H2 sensor evaluation
  CRASH_TASK            2ms period (500Hz)     — impact detection
  WATCHDOG_TASK         500ms period           — system health
```

The H2_SAFETY_TASK runs on the secondary core and cannot be interrupted by any primary MCU task. Its shutdown commands have hardware-level priority over all other actuator commands — implemented via dedicated GPIO lines that bypass the software actuator queue.

### Electrolyzer PWM Control

The electrolyzer current is governed by a deterministic PWM signal from HydroCore:

```
Mode → Base PWM duty cycle:
  STABILITY: 60% of rated current
  POWER:     95% of rated current
  RECOVERY:  30% of rated current
  BALANCE:   dynamic, based on PR1 and FS1 aggregates
  SAFETY:    0% (immediate)

Modulation: fine adjustment ±10% based on FS1 (laminar stability)
  High laminar stability → increase toward mode ceiling
  Turbulence onset → reduce toward mode floor

Update rate: 200Hz (5ms), lag compensation applied for electrolyzer thermal response (5-second thermal time constant)
```

---

## Safety Thresholds (Vehicle)

| Parameter | Advisory | Caution | Critical | Hard Stop |
|---|---|---|---|---|
| Water feed pressure (PSI) | >20 | >22 | >24 | >25 → shutdown |
| Electrolyzer pressure (bar) | >7 | >8 | >9 | >9.5 → shutdown |
| H2 tank pressure (bar) | >9 | >9.5 | >10 | >10.5 → safety MCU |
| Electrolyzer temp (°C) | <50 or >80 | <45 or >85 | <40 or >88 | >90 → shutdown |
| H2 concentration (% vol) | >0.5% | >1% | >2% | >4% → emergency |
| Vibration RMS on H2 tank (g) | >0.5 | >1.0 | >2.0 | SL3 resonance |
| Crash G-force | — | — | — | >5G → full shutdown |

---

## Determinism Test (Vehicle)

Adaptation of the bench engine Determinism Test for vehicle context:

1. Bring vehicle to steady-state at a defined operating point: battery SOC 70%, H2 buffer 50%, electrolyzer running in Stability Mode, road speed 60 mph.
2. Record complete 42-node state vector and actuator states.
3. On a subsequent run, reproduce the same operating conditions.
4. Verify 42-node state vector and actuator states are identical.
5. Disconnect Meridian coupling. Verify fallback behavior is deterministic.
6. Introduce controlled H2 sensor reading (via calibrated gas reference). Verify safety layer fires within 100ms and H2_SAFETY_TASK response is identical on repeated triggers.

---

## Consumer Product Framing — HydroCore Drive

**Name:** HydroCore Drive
**Tagline:** "Deterministic hydrogen from water. Drive anywhere."

**Dashboard (vehicle display + mobile app):**
- HydroCore ring visualization (4 primitive arcs, real time)
- Current mode (Stability / Power / Safety / Recovery / Balance)
- H2 production rate (kg/hr)
- H2 buffer level (%)
- Water reservoir level (gallons remaining)
- Energy input breakdown (regen / thermal / solar / Meridian)
- Estimated range (battery + H2 combined)
- Safety node status (green/amber/red)
- Meridian road status (connected / searching / not available)

**Differentiation statement:**
HydroCore Drive is not a hydrogen car that refuels at stations. It is a water-fed vehicle that produces its own hydrogen onboard, governed by a 42-node deterministic system that optimizes every variable of the production chain simultaneously. Same driving conditions always produce the same hydrogen output. The system never guesses.

---

## Meridian Coupling — Forward Reference

Full Meridian infrastructure specification is in the companion document: `meridian-infrastructure-spec.md`.

The coupling protocol between HydroCore Drive vehicles and Meridian roadway nodes:

- HydroCore nodes PR8, FS9, TB10 receive Meridian input signals as positive modifiers
- The vehicle broadcasts its electrolyzer demand to the Meridian node network
- Meridian governs multi-vehicle power allocation deterministically (same vehicle mix → same power allocations)
- Coupling activates within 200ms of road entry; deactivates within 100ms of road exit

---

## Metadata

**Author:** Jason Andrews / ORCID: 0009-0007-5214-649X
**Organization:** DarkWave Studios LLC / Contact: team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Related paper:** hydrocore-drive-paper.md (Canon² Series)
**Companion document:** meridian-infrastructure-spec.md
**Source organism:** HydroCore (hydrocore-paper.md)
**Bench precursor:** hydrocore-physical-spec.md
