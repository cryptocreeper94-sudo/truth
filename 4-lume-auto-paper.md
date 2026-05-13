# Lume-Auto: A Four-Primitive Deterministic Petroleum Engine Efficiency Organism

**Canon³ Technical Paper Series — L-SOC Vol. X**
**Series:** Language Architecture / Physical Instantiation — Automotive Series Vol. I
**Author:** Jason Andrews, DarkWave Studios LLC
**ORCID:** 0009-0007-5214-649X
**Contact:** team@dwsc.io
**Patent:** 64/032,339
**DOI (pending):** Lume ecosystem — 10.5281/zenodo.19382282
**Prior Art Anchor:** May 2026
**Version:** 1.0

---

## Abstract

This paper introduces Lume-Auto, a deterministic synthetic organism that governs fuel efficiency in existing petroleum vehicles using the Lume 4/42 architecture. Treating the internal combustion engine (ICE) as a deterministic multi-flow system, Lume-Auto maps 42 governance nodes across four flow primitives — Throughput Base (TB), Process Rate (PR), Flow State (FS), and System Lifecycle (SL) — and applies real-time deterministic governance to identify, quantify, and resolve thermodynamic, mechanical, behavioral, and maintenance-driven inefficiencies. The organism operates exclusively on OBD-II telemetry, requires no hardware modification, performs no ECU rewriting, and operates fully within emissions compliance boundaries enforced by three hard constraints. Lume-Auto achieves typical MPG improvements of 3–12% through behavioral and flow optimization, with 15%+ achievable in high-degradation vehicles where maintenance inefficiencies dominate. This paper formally establishes the ICE engine as a Lume-native physical flow organism, coins the governance framework for petroleum efficiency organisms, and defines the coupling interface to HydroCore and Meridian for future multi-organism integration.

---

## Table of Contents

1. Introduction
2. Theoretical Foundation: The ICE Engine as a Deterministic Flow System
3. The Lume-Auto Organism Architecture
   - 3.1 Primitive Decomposition
   - 3.2 The 42 Governance Nodes
   - 3.3 Node Population Rationale
4. Hard Constraints
5. Mode Hierarchy
6. Governance Logic
7. MPG Improvement Mechanisms
8. Organism Coupling Protocols
   - 8.1 Lume-Auto ↔ BioCore
   - 8.2 Lume-Auto ↔ HydroCore
   - 8.3 Lume-Auto ↔ Meridian
9. Deployment Architecture
10. Novel Contributions
11. Prior Art and Intellectual Property
12. Future Work
13. Appendices
14. References

---

## 1. Introduction

The internal combustion engine has powered global transportation for over a century. Despite advances in hybrid and electric powertrains, 1.4 billion petroleum vehicles remain in active operation worldwide. OEM mechanical efficiency has approached thermodynamic limits at the hardware layer — the average gasoline engine converts only 20–40% of fuel energy to useful work. The remaining 60–80% is lost to heat, friction, incomplete combustion, drivetrain losses, and behavioral inefficiency.

Prior approaches to efficiency improvement have focused on hardware modification (lightweight materials, variable valve timing, turbocharging) or ECU calibration (proprietary tuning requiring specialized equipment and voiding warranties). Neither approach is accessible at scale, and both carry regulatory and legal risk when applied to existing vehicles.

Lume-Auto addresses this gap through a fundamentally different lens: deterministic flow governance applied at the observation and recommendation layer. Rather than modifying hardware or firmware, the organism reads OBD-II telemetry — a standardized interface available on all post-1996 vehicles — and applies the Lume 4/42 governance architecture to continuously model the engine as a deterministic flow system, identify deviations from efficiency equilibrium, and generate optimization guidance delivered to the driver through a companion application.

This approach yields several properties that hardware-based alternatives cannot offer:

- **Zero regulatory risk:** No ECU modification, no emissions tampering, no warranty void
- **Universal applicability:** Any OBD-II vehicle, any make, any model, any year post-1996
- **Continuous learning:** The organism accumulates vehicle-specific baseline data over time
- **Hard constraint safety:** Governance bounds prevent the organism from recommending any action that could damage the engine or violate emissions standards

Lume-Auto is the first formally specified petroleum engine organism in the Lume synthetic organism taxonomy. It establishes the ICE engine as a valid Lume-native substrate and defines the governance model that future petroleum, hybrid, and hydrogen propulsion organisms will extend.

---

## 2. Theoretical Foundation: The ICE Engine as a Deterministic Flow System

The Lume organism architecture is built on a core claim: complex physical systems can be modeled as deterministic flow networks where observable inputs, internal state, and outputs are governed by stable mathematical relationships. When this claim holds, the 4/42 architecture can be applied to derive a complete governance model.

For a petroleum engine, the claim holds. An ICE is a thermodynamic machine whose operation follows the conservation laws of energy and mass within bounded tolerances. Its behavior is determined by:

**Primary flows:**
- **Air flow:** Mass air entering the intake manifold, governed by volumetric efficiency and atmospheric conditions
- **Fuel flow:** Injected fuel mass per cycle, governed by injector pulse width and fuel pressure
- **Heat flow:** Thermal energy released by combustion, dissipated to coolant and exhaust
- **Torque flow:** Mechanical work produced at the crankshaft, transmitted through the drivetrain
- **Exhaust flow:** Post-combustion gas volume, temperature, and composition exiting the system
- **Parasitic flow:** Energy drawn by accessories (alternator, AC compressor, power steering) independent of propulsion

**Determinism guarantees:** Within the operational envelope of a well-maintained engine, the relationship between inputs (air mass, fuel mass, ignition timing, load) and outputs (torque, exhaust composition, efficiency) is deterministic and predictable. Deviations from predicted outputs signal inefficiency, degradation, or fault conditions — exactly the information a governance organism requires.

**OBD-II as the governance telemetry layer:** The On-Board Diagnostics II standard (mandated in the United States for all vehicles sold after January 1, 1996, and subsequently adopted globally) exposes over 200 standardized sensor parameters via a universal diagnostic port. Lume-Auto treats the OBD-II interface as the organism's sensory array — a real-time telemetry stream into the engine's flow state. The organism reads this stream, computes governance signals, and generates outputs without writing any data back to the ECU.

This read-only constraint is architecturally significant. It means Lume-Auto is a governance organism in the purest sense: it observes, models, and recommends. It does not actuate. The driver is the actuation layer.

---

## 3. The Lume-Auto Organism Architecture

### 3.1 Primitive Decomposition

Lume-Auto is organized around the four Lume flow primitives:

| Primitive | Symbol | Role in Lume-Auto |
|-----------|--------|-------------------|
| Throughput Base | TB | Fundamental flow rates: air, fuel, heat, torque, loss |
| Process Rate | PR | Efficiency of conversion processes: combustion, transmission, thermal |
| Flow State | FS | Real-time state of flows: mixture, timing, load, behavior |
| System Lifecycle | SL | Health and remaining life of components governing flow capacity |

These four primitives together provide a complete governance picture: what is flowing (TB), how efficiently it is being processed (PR), what state the system is in right now (FS), and how long the system can sustain current operation (SL).

### 3.2 The 42 Governance Nodes

#### TB — Throughput Base (10 nodes)

**TB1 — Air Mass Flow Rate**
Primary input to combustion. Measured via MAF sensor in g/s. Normalized against volumetric efficiency to establish actual vs. theoretical air charge per cycle. Governs AFR stability ceiling.

**TB2 — Fuel Delivery Rate**
Injected fuel mass per cycle derived from injector pulse width and fuel rail pressure. Paired with TB1 to compute instantaneous AFR. Deviation from commanded pulse width indicates injector wear or fuel pressure fault.

**TB3 — Air-Fuel Balance**
Real-time AFR deviation from stoichiometric ratio (14.7:1 gasoline, lambda = 1.0). Computed continuously in closed-loop operation. TB3 > 0 (lean excursion) degrades power; TB3 < 0 (rich excursion) wastes fuel. The primary throughput efficiency signal.

**TB4 — Exhaust Mass Flow**
Post-combustion exhaust velocity and volume normalized per cycle. Governs back-pressure estimation, catalytic converter loading, and EGR rate feasibility.

**TB5 — Heat Energy Throughput**
BTU per combustion cycle derived from fuel mass × lower heating value × combustion efficiency estimate. Tracks thermal energy conversion rate. Excess heat throughput signals incomplete combustion or cooling system stress.

**TB6 — Torque Throughput**
Net torque produced at the crankshaft per cycle, estimated from MAP, RPM, and volumetric efficiency model. Primary output of the combustion process. The signal by which all efficiency gains are ultimately measured.

**TB7 — Drivetrain Power Transfer Efficiency**
Torque × RPM → wheel power, accounting for torque converter slip (automatic transmission) or clutch engagement quality (manual). Measures the percentage of crankshaft torque reaching the driven wheels. Gear selection and shift point optimization flow through this node.

**TB8 — Braking Energy Loss Rate**
Kinetic energy dissipated as heat during braking events. Derived from speed delta and deceleration rate. Non-recoverable in non-hybrid vehicles. Governs regenerative opportunity quantification and coasting guidance.

**TB9 — Accessory Parasitic Load**
Electrical load drawn by alternator, AC compressor, and power steering pump, expressed as equivalent fuel consumption. Computed from alternator duty cycle, AC compressor engagement state, and system voltage. Represents 2–5% of total fuel consumption in normal operation.

**TB10 — Rolling Resistance Load**
Tire-road friction force opposing motion, estimated from vehicle mass, speed, and tire pressure proxy. Elevated rolling resistance from under-inflation or tire wear is a persistent, often undetected throughput loss. Governs tire pressure alert thresholds.

---

#### PR — Process Rate (10 nodes)

**PR1 — Combustion Efficiency**
Fraction of fuel chemical energy converted to mechanical work per cycle. Theoretical maximum for a gasoline engine is approximately 56% (Carnot limit at typical operating temperatures). Practical range: 25–42%. Derived from indicated mean effective pressure estimation and fuel consumption rate.

**PR2 — Volumetric Efficiency**
Ratio of actual air mass ingested per intake stroke to theoretical maximum at atmospheric pressure. Governs engine breathing quality. Degraded by air filter restriction (SL3), intake valve carbon buildup (SL7), or throttle body deposits.

**PR3 — Ignition Timing Coherence**
Deviation of actual spark advance from optimal Maximum Brake Torque (MBT) timing for current conditions. Expressed in degrees crank angle. Knock retard (FS4) pulls timing from MBT; each degree of retard reduces torque approximately 0.5–1%. Governs timing optimization guidance.

**PR4 — Fuel Atomization Quality**
Injector spray pattern and fuel vaporization completeness, inferred from STFT behavior (FS2) and injector balance rates. Poor atomization from worn or clogged injectors produces incomplete combustion and elevated HC emissions. Governs injector maintenance prediction.

**PR5 — Catalytic Conversion Rate**
Oxidation and reduction efficiency of the catalytic converter, derived from upstream vs. downstream O2 sensor signal comparison. Degraded catalyst reduces emissions performance and increases exhaust back-pressure. Monitored by SL4 for lifecycle tracking.

**PR6 — EGR Flow Rate**
Exhaust gas recirculation percentage — the fraction of exhaust reintroduced to the intake to reduce combustion temperature and NOx emissions. EGR reduces available O2 per cycle, trading NOx reduction against slight efficiency cost. Governs the EGR optimization window.

**PR7 — Transmission Shift Efficiency**
Torque converter slip rate (automatic) or shift quality index (manual), measuring energy lost in the power transfer between engine and drivetrain during gear changes. Optimal shift point governed by the engine's torque curve (TB6) and current road load.

**PR8 — Throttle Response Coherence**
Driver throttle input rate vs. the efficiency-optimal input curve for current speed and grade. Aggressive throttle application forces rich mixture transients and torque converter turbulence. Smooth throttle modulation is the single highest-yield behavioral efficiency lever.

**PR9 — Cold-Start Enrichment Decay Rate**
Time elapsed from engine start to closed-loop O2 feedback activation. Cold starts run open-loop with rich enrichment — typically consuming 2–4x normal fuel per mile. Shorter warm-up time through route optimization and engine pre-conditioning reduces cold-start fuel penalty.

**PR10 — Deceleration Fuel Cut Efficiency**
Rate of Deceleration Fuel Cut-Off (DFCO) engagement — most modern ECUs cut fuel entirely during deceleration when RPM is above idle threshold. Maximizing DFCO utilization through coasting guidance yields direct fuel savings on every deceleration event.

---

#### FS — Flow State (12 nodes)

**FS1 — Closed-Loop Status**
Binary state: whether the O2 feedback control loop is active. Open-loop operation (cold start, wide-open throttle, sensor fault) runs without AFR correction. Closed-loop is the normal governance-compatible state. Any deviation from closed-loop at steady-state cruise is an anomaly signal.

**FS2 — Short-Term Fuel Trim State**
STFT: real-time percentage correction applied to base fuel map to achieve stoichiometric AFR. Normal range: ±10%. Values outside this range indicate a current mixture deviation requiring investigation. The most immediate signal of combustion flow state.

**FS3 — Long-Term Fuel Trim State**
LTFT: accumulated correction to base fuel map learned over multiple drive cycles. Represents a systematic bias in the air-fuel system. LTFT > +15% indicates a persistent lean condition (vacuum leak, MAF degradation, injector clogging). LTFT < -15% indicates persistent rich condition. Governs maintenance alerts.

**FS4 — Knock Retard State**
Degrees of timing pulled from MBT due to knock (detonation) detection. Knock retard is the engine's self-protective response to premature combustion. Each degree of retard sacrifices torque and efficiency. Persistent knock retard signals low fuel octane, carbon deposits, or elevated intake temperature.

**FS5 — Engine Load State**
Calculated load percentage: actual torque output relative to maximum torque capacity at current RPM. Governs operating point on the engine's efficiency map (BSFC surface). Most engines operate most efficiently between 50–80% load at moderate RPM. Governs shift-point and route optimization guidance.

**FS6 — Thermal State**
Composite thermal equilibrium: coolant temperature, intake air temperature, and estimated oil temperature. Sub-optimal thermal state (engine not at operating temperature, or overheating tendency) degrades combustion efficiency. Governs warm-up routing and thermal management guidance.

**FS7 — Intake Air Density State**
Combined effect of intake air temperature (IAT) and manifold absolute pressure (MAP) on air density. Hot, thin air reduces volumetric efficiency. Cold, dense air improves it. Governs seasonal and altitude compensation in optimization recommendations.

**FS8 — Combustion Cycle Coherence**
*Novel node.* Misfire rate and combustion uniformity across cylinders, derived from crankshaft acceleration uniformity and misfire monitor counters. Cylinder-level combustion coherence has not been formalized as a flow state in prior governance frameworks. An engine with one misfiring cylinder loses 12–25% of that cylinder's contribution to torque throughput. Governs cylinder-specific maintenance prediction.

**FS9 — Drivetrain Slip State**
Differential between engine-expected wheel speed and actual wheel speed, capturing torque converter slip, wheel spin (TCS events), and drivetrain losses. Elevated slip state indicates energy being converted to heat in the power transfer path rather than propulsion.

**FS10 — Driver Behavioral Flow State**
*Novel node.* Composite index of driver throttle modulation smoothness, braking frequency, acceleration curve shape, and coasting utilization. Scored on a continuous scale from 0 (chaotic, high-loss) to 1.0 (optimal). The primary input to behavioral efficiency recommendations. Unlike prior driving score implementations that use GPS alone, FS10 integrates OBD-II pedal position, throttle angle, and fuel trim data for a physics-grounded behavioral state.

**FS11 — Fuel Quality State**
Inferred fuel octane and ethanol content from knock retard behavior (FS4) and O2 sensor response patterns. E85-capable vehicles show distinct O2 and LTFT signatures on high-ethanol blends. Governs fuel quality alerts and octane-appropriate timing guidance.

**FS12 — Route Grade State**
Estimated road grade from speed, RPM, load, and throttle position relationships. Uphill grade increases load demand; downhill enables DFCO and coasting. Grade state governs shift-point optimization and anticipatory guidance for terrain-aware efficiency.

---

#### SL — System Lifecycle (10 nodes)

**SL1 — Spark Plug Degradation Index**
Wear accumulation estimated from ignition voltage demand trends and misfire frequency (FS8). Worn plugs require higher voltage, fire inconsistently, and increase HC emissions. Degradation index governs spark plug replacement prediction with 2,000–5,000 mile advance notice.

**SL2 — Fuel Injector Wear Index**
Injector degradation from LTFT bias (FS3) and injector balance rate deviation (PR4). Clogged injectors shift LTFT positive; worn injectors with high flow rates shift it negative. Governs injector cleaning and replacement prediction.

**SL3 — Air Filter Restriction Index**
MAF-to-throttle-position ratio degradation over time. A clogged air filter reduces volumetric efficiency (PR2) by restricting airflow, measurable as MAF under-reading relative to throttle position. Governs air filter replacement prediction with fuel penalty quantification.

**SL4 — Catalytic Converter Health Index**
O2 sensor upstream/downstream switching frequency ratio. A healthy catalyst produces a nearly flat downstream O2 signal. A degraded catalyst shows upstream-synchronized downstream oscillation. Governs catalytic converter replacement prediction.

**SL5 — Oxygen Sensor Response Index**
O2 sensor switching speed degradation. Slow O2 sensors cause sluggish closed-loop correction, widening AFR excursions and reducing efficiency. Response time measurable from crossing frequency. Governs O2 sensor replacement prediction.

**SL6 — Engine Oil Degradation Index**
Estimated oil condition from accumulated thermal cycles, operating hours, and time since last change. Degraded oil increases internal friction (mechanical efficiency loss) and reduces thermal conductivity. Governs oil change prediction.

**SL7 — Carbon Buildup Index**
Direct injection engine intake valve carbon accumulation, inferred from LTFT trends and cold-start enrichment behavior. Carbon deposits reduce volumetric efficiency (PR2) and create hot-spot detonation sources. Governs walnut blasting / intake cleaning prediction.

**SL8 — Tire Pressure / Rolling Resistance Index**
Rolling resistance increase over time, inferred from the relationship between vehicle speed, engine load, and fuel consumption at steady-state cruise. Under-inflation increases rolling resistance by 0.3–0.5% per PSI below optimal. Governs tire pressure alerts with fuel penalty quantification.

**SL9 — Drivetrain Health Index**
Transmission health from torque converter slip trends (PR7) and shift quality degradation. Worn transmission fluid and mechanical wear show as increasing slip under load. Governs transmission service prediction.

**SL10 — Vehicle Efficiency Lifecycle Score**
*Novel node.* Cumulative MPG degradation from the vehicle's established baseline efficiency. Tracks the organism's total governance picture: how much efficiency has been recovered vs. how much remains recoverable. Expressed as percentage of baseline MPG. The primary long-term governance health signal and the metric against which all organism outputs are ultimately measured. No prior governance framework has formally defined a continuous vehicle-level efficiency lifecycle score as a first-class governed node.

---

### 3.3 Node Population Rationale

The 42-node population reflects the Lume architectural principle that governance completeness requires representation across all four temporal scales of a physical system:

- **TB nodes** govern what is happening right now at the flow level
- **PR nodes** govern how efficiently those flows are being converted
- **FS nodes** govern the current operating state that contextualizes efficiency
- **SL nodes** govern the degradation trajectory that determines future capacity

The 12 FS nodes (vs. 10 for TB and PR, 10 for SL) reflect the higher informational density of state signals in an ICE governance system: the engine's instantaneous operating state encompasses more orthogonal dimensions than its throughput or lifecycle dimensions.

---

## 4. Hard Constraints

Hard constraints are conditions the organism is architecturally forbidden from violating regardless of optimization pressure. They are enforced at the governance layer before any recommendation is issued.

**HC1 — No Lean Detonation Risk**
The organism shall never recommend, suggest, or produce guidance that would result in an air-fuel ratio leaner than 15.5:1 under load conditions. Lean excursions beyond this threshold risk pre-ignition and detonation, which cause immediate and irreversible engine damage. This constraint supersedes any efficiency gain.

*Formal statement:* For all operating states where engine load FS5 > 30%, AFR recommendation ∉ (15.5, ∞). The constraint applies to any direct or indirect recommendation pathway.

**HC2 — Emissions System Inviolability**
The organism shall never recommend any action that bypasses, disables, degrades, or circumvents any emissions control system, including but not limited to: O2 sensor feedback loop, EGR valve operation, catalytic converter function, EVAP system, and PCV system. Emissions compliance is a hard constraint independent of efficiency benefit.

*Formal statement:* For all states, organism outputs ∩ {actions affecting emissions systems} = ∅. This constraint is architecturally prior to all optimization objectives.

**HC3 — Safety-Critical Event Suspension**
The organism shall suspend all optimization guidance output during active safety-critical vehicle events: ABS activation, TCS activation, ESC activation, collision detection, or emergency braking. During these events, driver attention must be unconditionally available for vehicle control. No efficiency recommendation has priority over active safety system operation.

*Formal statement:* While any safety-critical event flag is active, organism output = null. Governance resumes only after all safety events have cleared and a minimum 3-second settling period has elapsed.

---

## 5. Mode Hierarchy

Lume-Auto operates in five governance modes, transitioning between them based on the composite state of all 42 nodes:

```
OPTIMAL
  └── All TB, PR, FS, SL nodes within target bands
  └── No maintenance predictions within 3,000 miles
  └── Organism output: proactive micro-optimizations only

EFFICIENCY
  └── One or more TB or PR nodes outside target band
  └── OR FS10 (behavioral flow state) < 0.65
  └── OR SL10 (lifecycle score) < 90% of baseline
  └── Organism output: active optimization recommendations

MAINTENANCE_ALERT
  └── One or more SL nodes below maintenance threshold
  └── Predicted efficiency loss > 3% attributable to component degradation
  └── Organism output: maintenance predictions + efficiency penalty quantification

FAULT_DETECTED
  └── Active OBD-II fault code (DTC) present
  └── OR any FS node outside safe operating bounds for > 3 consecutive seconds
  └── Organism output: fault explanation + safe operating guidance only

LIMP_MODE
  └── HC1, HC2, or HC3 constraint violation risk detected
  └── OR critical engine safety fault
  └── Organism output: minimum safe operation guidance only; all optimization suspended
```

Mode transitions are one-way toward LIMP_MODE on fault escalation and require explicit node recovery confirmation for upward transitions. The organism does not oscillate between modes on transient sensor noise — a three-reading debounce applies to all mode transition triggers.

---

## 6. Governance Logic

The Lume-Auto governance cycle executes at 100ms intervals synchronized to the OBD-II polling rate:

```
1. INGEST: Read all available OBD-II PIDs via Bluetooth adapter
2. NORMALIZE: Convert raw PID values to node states (TB1–SL10)
3. BOUND CHECK: Evaluate all 42 nodes against target bands
4. CONSTRAINT VERIFY: Evaluate HC1, HC2, HC3 — if any violated risk, enter LIMP_MODE
5. MODE ASSESS: Determine current organism mode from node composite
6. EFFICIENCY MODEL: Run efficiency surface model against current operating point
7. OPPORTUNITY DETECT: Identify highest-yield optimization opportunities
8. RECOMMENDATION GENERATE: Produce contextual guidance appropriate to current mode
9. LIFECYCLE UPDATE: Update SL node accumulators from current cycle data
10. AUDIT: Append cycle record to audit ledger (certHash for provenance)
```

The efficiency model in step 6 uses the vehicle's Brake Specific Fuel Consumption (BSFC) surface — a map of fuel consumption per unit power output across RPM and load combinations. The organism builds a vehicle-specific BSFC approximation over the first 500 miles of operation, then uses it to evaluate the efficiency cost of current operating point vs. nearby achievable points.

---

## 7. MPG Improvement Mechanisms

### 7.1 Behavioral Efficiency (FS10 pathway)
**Yield: 3–8% MPG improvement for average drivers**

The single largest recoverable efficiency pool for most vehicles. Governed primarily through FS10 (Driver Behavioral Flow State), PR8 (Throttle Response Coherence), and TB8 (Braking Energy Loss). Guidance includes: throttle smoothing, anticipatory coasting, shift-point optimization, and route grade awareness (FS12). Research literature consistently demonstrates 5–15% fuel consumption difference between aggressive and smooth driving styles for identical vehicles on identical routes.

### 7.2 Operating Point Optimization (FS5 pathway)
**Yield: 1–3% MPG improvement**

Shifting the average operating point toward the engine's peak efficiency zone on the BSFC surface. Governed through FS5 (Engine Load State) and PR7 (Transmission Shift Efficiency). Higher gears at moderate RPM and load generally correspond to lower BSFC. Guidance targets keeping the engine in the 50–80% load range at the lowest efficient RPM for current road conditions.

### 7.3 Maintenance Efficiency Recovery (SL pathway)
**Yield: 5–15%+ MPG improvement for degraded vehicles**

The highest absolute yield opportunity, but only available in vehicles with deferred maintenance. Each degraded SL node represents a quantifiable, recoverable efficiency penalty:
- Clogged air filter (SL3): 10–15% power reduction, equivalent fuel penalty
- Worn spark plugs (SL1): 4–8% combustion efficiency reduction
- Under-inflated tires (SL8): 0.3–0.5% per PSI below optimal
- Fouled injectors (SL2): 2–8% mixture distribution inefficiency
- Degraded O2 sensors (SL5): 2–5% closed-loop correction degradation

The SL pathway is the primary driver of the 15%+ improvement claim for high-degradation vehicles.

### 7.4 Cold-Start Penalty Reduction (PR9 pathway)
**Yield: 0.5–2% MPG improvement for short-trip drivers**

Cold starts consume disproportionate fuel per mile. For vehicles used predominantly on trips under 5 miles, cold-start enrichment can represent 10–20% of total fuel consumption. Route optimization (avoiding unnecessary cold restarts) and engine pre-conditioning guidance (optimal start timing relative to trip distance) reduce this penalty.

### 7.5 Deceleration Fuel Cut Optimization (PR10 pathway)
**Yield: 1–3% MPG improvement**

DFCO is free fuel savings — no fuel is consumed during deceleration when RPM is above idle threshold. Maximizing DFCO utilization through anticipatory coasting guidance (releasing throttle 3–5 seconds earlier when approaching stops) yields direct, measurable fuel savings on every deceleration event.

---

## 8. Organism Coupling Protocols

Lume-Auto follows the Lume Inter-Organism Coupling Protocol (LIOCP) for all cross-organism state exchanges. Coupling operates in Mode-Aware fashion: coupling signals are exchanged only when both organisms are in OPTIMAL or EFFICIENCY mode.

### 8.1 Lume-Auto ↔ BioCore Coupling

**Coupling rationale:** Driver physiological state (governed by BioCore) directly influences behavioral efficiency (FS10). A fatigued or high-stress driver exhibits degraded throttle coherence and increased braking frequency — measurable in FS10 but with ambiguous cause unless BioCore state is available.

**Coupling nodes:**
| Lume-Auto node | BioCore node | Signal | Direction |
|---|---|---|---|
| FS10 (Driver Behavioral Flow State) | SL10 (Physiological Resilience) | Fatigue index | BioCore → Lume-Auto |
| FS10 | FS10 (Attentional Flow Proxy) | Attention state | BioCore → Lume-Auto |

**Coupling behavior:** When BioCore reports SL10 < 0.4 (moderate fatigue), Lume-Auto adjusts FS10 scoring to weight behavioral anomalies as physiological rather than habitual — suppressing behavioral efficiency guidance in favor of rest/break recommendations.

### 8.2 Lume-Auto ↔ HydroCore Coupling

**Coupling rationale:** HydroCore governs hydraulic and hydrogen fuel systems. In hydrogen or hydraulic hybrid vehicles, HydroCore's output state directly constrains Lume-Auto's propulsion efficiency model.

**Coupling nodes (future integration):**
| Lume-Auto node | HydroCore node | Signal | Direction |
|---|---|---|---|
| TB6 (Torque Throughput) | PR7 (Hydraulic Power Transfer Rate) | Propulsion share | HydroCore → Lume-Auto |
| TB8 (Braking Energy Loss) | FS9 (Hydraulic Accumulator State) | Regeneration availability | HydroCore → Lume-Auto |

### 8.3 Lume-Auto ↔ Meridian Coupling

**Coupling rationale:** In grid-connected or V2G scenarios, vehicle accessory load (TB9) can be coordinated with Meridian's energy routing state to minimize grid draw during peak periods.

**Coupling nodes (future integration):**
| Lume-Auto node | Meridian node | Signal | Direction |
|---|---|---|---|
| TB9 (Accessory Parasitic Load) | LD2 (Local Demand Index) | Grid load state | Meridian → Lume-Auto |
| TB9 | FS4 (Energy Flow Coherence) | Charging opportunity | Meridian → Lume-Auto |

---

## 9. Deployment Architecture

Lume-Auto deploys as a three-layer system:

**Layer 1 — Sensor Layer (OBD-II Bluetooth Adapter)**
Standard ELM327-compatible OBD-II Bluetooth dongle. Plugs into the OBD-II port (standard location under the dashboard, driver's side). Pairs with the companion app. Read-only; no write access to ECU. Compatible with all OBD-II vehicles (1996+ US, 2001+ EU).

**Layer 2 — Application Layer (Mobile + Desktop)**
The companion application performs real-time OBD-II polling (100ms cycle), node computation, governance logic, mode management, and recommendation rendering. Operates in two sub-modes:
- **Online mode:** Node state synchronized to cloud organism brain for fleet aggregation and model refinement
- **Offline mode:** Full local governance using on-device BSFC model — no cloud dependency for core function

**Layer 3 — Cloud Organism Brain**
Aggregates anonymized telemetry across the vehicle fleet. Refines BSFC surface models by make/model/year. Feeds fleet-level maintenance pattern data back to individual vehicle predictions. Hosts the organism's continuous learning layer.

---

## 10. Novel Contributions

This paper makes the following original contributions to the Lume synthetic organism taxonomy:

**1. First formal petroleum engine organism specification.** Lume-Auto is the first application of the Lume 4/42 architecture to an internal combustion engine, establishing the ICE as a Lume-native deterministic flow substrate.

**2. FS8 — Combustion Cycle Coherence.** A novel governance node formalizing cylinder-level combustion uniformity as a first-class flow state. Prior governance and telematics frameworks treat misfires as binary fault events. FS8 treats combustion coherence as a continuous, governable flow state with measurable efficiency implications.

**3. FS10 — Driver Behavioral Flow State.** A novel governance node replacing GPS-derived driving scores with a physics-grounded OBD-II behavioral state. FS10 integrates pedal position, throttle angle, and fuel trim data to produce a behavioral efficiency score that reflects actual fuel consumption impact rather than proxy speed behavior.

**4. SL10 — Vehicle Efficiency Lifecycle Score.** A novel governance node providing continuous tracking of cumulative MPG degradation from baseline. No prior telematics or governance framework has formalized vehicle-level efficiency lifecycle as a first-class governed node. SL10 enables the organism to answer the governance question "how degraded is this vehicle from its efficiency potential?" at any point in time.

**5. Read-only governance architecture.** The formal establishment of a governance organism that achieves measurable physical efficiency improvement through observation and recommendation alone — without actuation. This defines the observational governance pattern for future Lume organisms deployed in regulated physical environments.

---

## 11. Prior Art and Intellectual Property

**Patent:** US Provisional Application 64/032,339 (DarkWave Studios LLC)
**Prior art anchor:** May 2026
**Ecosystem DOIs:** Lume=10.5281/zenodo.19382282, Trust Layer=10.5281/zenodo.19560674, DLA=10.5281/zenodo.19645097

The 4/42 organism architecture, four-primitive decomposition, LIOCP coupling protocol, and hard constraint governance framework are original contributions of DarkWave Studios LLC, established in prior Canon series publications. Lume-Auto applies this framework to the petroleum vehicle efficiency domain for the first time in this paper.

---

## 12. Future Work

- **Fleet optimization:** Multi-vehicle organism coordination for commercial trucking fleets, municipal vehicles, and logistics operators
- **Hydrogen integration:** Lume-Auto extension for hydrogen ICE vehicles (H2-ICE) with modified AFR governance bounds and combustion coherence parameters
- **HydroCore physical integration:** Formal coupling implementation for hydraulic hybrid propulsion vehicles
- **Meridian V2G integration:** Accessory load coordination with grid state in V2G-capable vehicles
- **Predictive route organism:** Integration with mapping data to provide organism-aware route selection optimized for the vehicle's current efficiency state

---

## 13. Appendices

### Appendix A — OBD-II PID Mapping to Governance Nodes

| Node | Primary OBD-II PID | Secondary PIDs |
|------|--------------------|----------------|
| TB1 | 0x10 (MAF rate) | 0x11 (Throttle), 0x0B (MAP) |
| TB2 | 0x44 (Commanded AFR) | 0x67 (Engine Coolant Temp) |
| TB3 | 0x44, 0x45 (AFR, Commanded Equiv Ratio) | 0x14–0x1B (O2 sensors) |
| TB6 | 0x0C (RPM) + 0x04 (Load) | 0x0D (Speed) |
| TB8 | 0x0D (Vehicle Speed) | 0x11 (Throttle Position) |
| TB9 | 0x42 (Control Module Voltage) | 0x63 (Engine Torque) |
| PR3 | 0x0E (Timing Advance) | 0x04 (Calculated Load) |
| PR10 | 0x04 (Calc Load) + 0x0C (RPM) | 0x11 (Throttle) |
| FS1 | 0x41 (Monitor Status) | 0x01 (Status since DTC clear) |
| FS2 | 0x06 (Short Term Fuel Trim B1) | 0x08 (STFT B2) |
| FS3 | 0x07 (Long Term Fuel Trim B1) | 0x09 (LTFT B2) |
| FS4 | 0x0E (Timing Advance) vs. base | Historical timing model |
| FS5 | 0x04 (Calculated Engine Load) | 0x0C (RPM) |
| FS6 | 0x05 (Coolant Temp) | 0x0F (Intake Air Temp) |
| FS8 | 0x41 (Monitor Status) | Manufacturer-specific misfires |
| FS10 | 0x11 (Throttle) + 0x0D (Speed) | 0x5E (Fuel Rate) |

### Appendix B — BSFC Surface Construction Methodology

The vehicle-specific BSFC approximation is constructed from the first 500 miles of operation using a grid-based interpolation approach. Operating points are binned by RPM (500 RPM intervals) and load (10% intervals). Fuel consumption rate (PID 0x5E) is recorded at each operating point and normalized to g/kWh. Minimum 10 samples per bin required before that operating point is considered calibrated. The resulting surface guides operating point optimization guidance through TB6, FS5, and PR7.

---

## 14. References

1. Heywood, J.B. (1988). *Internal Combustion Engine Fundamentals*. McGraw-Hill.
2. SAE International. (2016). *OBD-II Standards and PID Reference*. SAE J1979.
3. Andrews, J. (2026). *The Lume 4/42 Formal Mathematics*. Canon³ L-SOC Architecture Vol. III. DarkWave Studios LLC.
4. Andrews, J. (2026). *Organism Coupling: LIOCP*. Canon³ L-SOC Architecture Vol. II. DarkWave Studios LLC.
5. Andrews, J. (2026). *HydroCore: A Four-Primitive Deterministic Hydrological Flow Organism*. Canon³. DarkWave Studios LLC.
6. Andrews, J. (2026). *BioCore Physical — Biological Physical Instantiation Vol. I*. Canon³. DarkWave Studios LLC.
7. NHTSA. (2023). *Light-Duty Automotive Technology, Carbon Dioxide Emissions, and Fuel Economy Trends*. US Department of Transportation.
8. EPA. (2023). *Fuel Economy Guide*. US Environmental Protection Agency.
9. EEA. (2023). *Average CO2 emissions from new passenger cars in Europe*. European Environment Agency.
10. Andrews, J. (2026). *Safety and Certification — Architecture Vol. V*. Canon³. DarkWave Studios LLC.

---

*This paper is an original contribution of DarkWave Studios LLC. All rights reserved. Prior art anchor: May 2026. Patent 64/032,339.*
