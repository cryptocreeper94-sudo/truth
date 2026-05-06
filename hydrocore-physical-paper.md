# HydroCore Physical: Deterministic Hydraulic Governance via the Lume 4/42 Synthetic Organism Architecture

**Canon² Paper Series — Physical Instantiation Volume**

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Organization:** DarkWave Studios LLC
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Date:** May 2026

**Related Works:**
Lume Language Specification (DOI: 10.5281/zenodo.19382282)
Trust Layer (DOI: 10.5281/zenodo.19560674)
Lume-V Deterministic Wrapper (DOI: 10.5281/zenodo.19645097)
Lume-X Multi-Organism Substrate (DOI: 10.5281/zenodo.19443968)
HydroCore Biological (DOI: pending)

**DOI:** Pending Zenodo assignment

---

## Abstract

This paper presents HydroCore Physical — the first documented physical instantiation of the Lume 4/42 synthetic organism architecture. Where previous Canon² works defined organisms governing digital and biological state, this work demonstrates that the same 4-primitive, 42-node deterministic governance model can govern a physical hydraulic plant in real time.

HydroCore Physical maps the four HydroCore primitives — Flow Stability, Pressure Regulation, Thermal Balance, and Structural Load — to sensor-derived node values across a physical hydraulic system. A microcontroller running the HydroCore engine at 100Hz reads live sensor data, evaluates 42 normalized node states, selects a discrete operating mode, and issues deterministic actuator commands to govern valve states, flow rates, and pressure conditions.

The central contribution of this work is not hydraulic engineering. Hydraulic control systems are well-established. The contribution is the demonstration that a deterministic synthetic organism — an architectural construct previously applied to cognitive, social, and governance domains — can function as a physical plant controller with properties unavailable to conventional PID-based systems: simultaneous multi-primitive governance, discrete mode selection with hard safety constraints, and a provable determinism guarantee applicable to physical outputs.

The same governance architecture that tells a person their cognitive operating mode today tells a hydraulic engine its operating mode in real time. This equivalence is the thesis.

---

## 1. Introduction

The Lume synthetic organism architecture was developed as a universal deterministic governance framework. The foundational Canon² papers established organisms governing cognitive state (NeuroCore), social dynamics (SocioCore), institutional behavior (GovernanceCore), and biological flows (BioCore). Each organism shares the same structural invariants: four irreducible flow primitives, forty-two operational nodes, a normalized state space from −1.0 to +1.0, threshold-based status evaluation, and deterministic mode selection.

These organisms were initially conceived and documented in digital and biological contexts. The architecture was designed to be domain-agnostic — the primitives and node structure are abstract, and their physical or conceptual referents are domain assignments layered onto the architecture. But domain-agnosticism is a claim. A claim requires demonstration.

This paper provides that demonstration by instantiating HydroCore — the hydrological flow organism — as a real-time control system for a physical hydraulic engine. Every claim made about the Lume architecture's generality is tested here against physical reality: real sensors producing real normalized values, a real control loop selecting real operating modes, and real actuators responding to deterministic commands.

If the architecture works in a hydraulic plant, it works anywhere. Flow is flow. The physics differ. The governance structure does not.

### 1.1 Problem Statement

Conventional hydraulic control systems are governed by proportional-integral-derivative (PID) controllers. PID control optimizes a single feedback variable — pressure, flow rate, temperature — through continuous tuning. It does not natively handle simultaneous multi-variable governance. It has no concept of operating modes. It does not enforce hard safety constraints as first-class architectural elements. It produces no human-interpretable system state summary. And it does not provide a determinism guarantee: PID parameters drift, integrator windup occurs, and identical physical conditions at different points in time may produce different control responses.

HydroCore Physical addresses all of these limitations not by improving PID control, but by replacing the control paradigm entirely with organism-based deterministic governance.

### 1.2 Contributions

This paper contributes:

1. The first physical instantiation of the Lume 4/42 organism architecture
2. A complete sensor-to-node mapping for hydraulic physical systems using HydroCore primitives
3. A lag compensation model enabling deterministic organism governance of physical plants operating below the organism's control loop frequency
4. A demonstration that safety constraints enforced at the organism level produce provably harder safety guarantees than PID-based threshold monitoring
5. The HydroCore Home consumer product framework, defining two viable physical deployment contexts
6. Formal evidence that the Lume architecture is domain-agnostic at the governance level

### 1.3 Scope

This paper covers the HydroCore Physical system at prototype scale — a bench-buildable hydraulic circuit governed by an ESP32-S3 microcontroller running the HydroCore engine. It does not cover industrial-scale hydraulic systems, though the architecture scales without modification to larger systems with appropriate sensor and actuator substitutions.

---

## 2. Theoretical Foundation — The Lume 4/42 Architecture

### 2.1 The Universal Organism Structure

Every organism in the Lume Canon² series shares one architecture, regardless of domain:

**Four irreducible flow primitives.** These are the axes of the organism — the four independent dimensions along which system state is measured and governed. Each primitive is a named governance domain. The choice of four is not arbitrary: the Lume architecture is founded on the principle that any complex system can be reduced to four orthogonal flow types whose interactions fully characterize system behavior.

**Forty-two operational nodes.** Each primitive contains a defined number of nodes (distribution pattern: 10/10/11/11 or 10/10/10/12 per organism) that represent the specific, measurable quantities that together constitute the primitive's state. Each node holds a value in the normalized range −1.0 (fully critical) to +1.0 (fully optimal).

**Normalized state space.** All inputs, from any source domain, are converted to the −1.0/+1.0 range before entering the organism. This normalization is what makes the organism domain-agnostic: the same governance logic operates on the same value range whether the underlying measurement is PSI, liters per minute, degrees Celsius, or a subjective self-report slider.

**Threshold evaluation.** Node values are classified into four bands: optimal (0.0 to +1.0), advisory (−0.3 to 0.0), caution (−0.4 to −0.7), critical (−0.8 to −1.0). Primitive aggregates are the weighted means of their member nodes and inherit the same threshold classification.

**Deterministic mode selection.** Given the current primitive states, the organism selects exactly one operating mode from a predefined set of five. The selection logic is a deterministic hierarchy — not a probabilistic classifier, not a neural network, not a heuristic. Same primitive states always produce the same mode.

**Deterministic output.** The selected mode, combined with the current primitive states, produces deterministic actuator commands, recommendations, or guidance. No two identical inputs produce different outputs.

### 2.2 Domain Agnosticism as an Architectural Property

The Lume architecture achieves domain agnosticism through the separation of three concerns:

1. **The governance logic** — threshold evaluation, mode selection hierarchy, hard constraint enforcement. This is identical across all organisms and all domains.

2. **The node definitions** — what each node represents in its specific domain. These are domain-specific assignments layered onto the universal node positions.

3. **The normalization layer** — the functions that convert domain-specific measurements (PSI, lpm, °C, self-report scores) into the universal −1.0/+1.0 range. These are domain-specific.

The governance logic never touches domain-specific data. It operates only on normalized values. This is why HydroCore Physical is not a new organism — it is HydroCore with domain-specific node assignments for physical hydraulic systems, running the same governance logic as HydroCore Environmental or HydroCore Biological.

### 2.3 The Determinism Guarantee

The determinism guarantee is the core claim of the Lume architecture: identical inputs always produce identical outputs. In digital systems, this is enforced by eliminating all non-deterministic elements from the output pipeline — no random seeds, no probabilistic models, no generative AI. In physical systems, the guarantee takes a different form:

*Identical normalized sensor readings always produce identical valve states.*

The physical world introduces measurement noise, sensor drift, and environmental variation. The guarantee applies at the normalized input level: if two sensor readings normalize to identical 42-node state vectors, the actuator commands will be identical. The governance logic is a pure function. Its outputs are entirely determined by its inputs.

---

## 3. Physical System Architecture

### 3.1 System Topology

The HydroCore Physical system consists of six functional layers operating in a closed governance loop:

```
LAYER 1 — FLUID SYSTEM
  Water source → inlet valve → pressure chamber → 
  output mechanism → outlet valve → return/reservoir

LAYER 2 — SENSOR LAYER
  Pressure (inlet/outlet) · Flow (inlet/outlet) ·
  Temperature (chamber wall) · Vibration/acceleration (chamber body)

LAYER 3 — NORMALIZATION LAYER
  Raw sensor readings → normalized node values (−1.0 to +1.0)
  Domain-specific conversion functions per sensor type

LAYER 4 — HYDROCORE ENGINE LAYER
  42-node state population · Primitive aggregation ·
  Threshold evaluation · Critical pattern detection ·
  Mode selection · Actuator command generation

LAYER 5 — ACTUATOR LAYER
  Solenoid valve drivers · Lag compensation model ·
  Command queue management · Physical settling time gating

LAYER 6 — OBSERVATION LAYER
  Logging (SD card) · Dashboard (web interface) ·
  Ring visualization · Mode and primitive display
```

The control loop operates at 100Hz. Sensor readings are acquired at 500Hz and buffered. The HydroCore engine evaluates at 100Hz. Actuator commands execute at 200Hz with lag compensation applied.

### 3.2 Why Hydraulics

Water is the ideal medium for demonstrating deterministic physical governance. Its physical properties support the determinism claim at the materials level:

Water is incompressible under normal operating pressures — pressure changes propagate at the speed of sound in the medium (~1480 m/s), making pressure wave dynamics predictable and fast. Water's response curves are linear across normal operating ranges — flow rate scales linearly with pressure differential under laminar conditions (Hagen-Poiseuille). Water's thermal behavior is well-characterized and stable — specific heat capacity, thermal conductivity, and viscosity are precisely known functions of temperature. Turbulence onset is governed by the Reynolds number — a dimensionless quantity determined entirely by flow velocity, hydraulic diameter, and kinematic viscosity, all of which are measurable.

In short, water obeys physics deterministically. It is the correct medium for a deterministic organism governor.

### 3.3 The Sensor-Node-Actuator Chain

The fundamental operational unit of HydroCore Physical is the sensor-node-actuator chain:

```
Physical measurement
  → normalization function
    → node value (−1.0 to +1.0)
      → primitive aggregate
        → mode selection
          → actuator command
            → physical change
              → new measurement
```

This chain runs at 100Hz. At each cycle, the organism evaluates the complete current state of the hydraulic system and determines the exact actuator state required to govern it toward optimal. The organism does not interpolate between states. It does not gradually adjust. It selects a mode and issues commands. The physical system responds. The sensors measure. The loop repeats.

---

## 4. The HydroCore-Physical Node Mapping

The four HydroCore primitives map to the four fundamental measurable properties of a hydraulic system under control. This mapping is not an analogy — it is a direct correspondence between the organism's primitive domains and the physical quantities that define hydraulic system state.

### 4.1 Primitive 1 — Flow Stability (FS1–FS10)

Flow Stability governs the quality and predictability of fluid motion through the system. The transition from laminar to turbulent flow is the central governance challenge — laminar flow is stable, predictable, and efficient; turbulent flow introduces energy loss, cavitation risk, and mechanical stress. Ten nodes characterize this primitive.

FS1 Laminar Stability measures the degree to which flow remains in the laminar regime. It is computed from the variance of the pressure differential between inlet and outlet over 100ms windows — stable laminar flow produces a stable, low-variance differential.

FS2 Turbulence Onset and FS3 Turbulence Intensity measure the early and sustained presence of turbulent flow respectively, derived from accelerometer RMS in the 10–100Hz band — the characteristic frequency range of hydraulic turbulence-induced vibration.

FS4 Cavitation Risk is the highest-priority safety node in the flow stability primitive. Cavitation — the formation and violent collapse of vapor bubbles in low-pressure regions — is the primary destructive mechanism in hydraulic systems. It is detected from high-frequency energy above 500Hz in the accelerometer spectrum, the characteristic acoustic signature of bubble collapse.

FS5 through FS9 characterize flow uniformity, vortex formation, flow recovery speed, shear stress, and flow drift — the secondary indicators that together complete the flow stability picture.

FS10 Flow Safety Index is the composite safety node: the weighted minimum of FS1, FS4, and FS5. A critical value at FS10 triggers Safety Mode regardless of all other system state.

### 4.2 Primitive 2 — Pressure Regulation (PR1–PR10)

Pressure Regulation governs the stability and safety of pressure throughout the system. Pressure is the primary energy carrier in a hydraulic system — it must be maintained within an operating range that maximizes output while remaining below the structural limits of all system components.

PR1 Chamber Pressure measures the deviation of inlet pressure from the target operating pressure. The normalization is symmetric: the further pressure deviates from target in either direction, the more negative the node value.

PR3 Surge Pressure and PR4 Oscillation Amplitude capture transient pressure events — water hammer, surge, and resonant pressure oscillations — that can damage components even when mean pressure is within range.

PR6 Backflow Risk is a binary node. Negative flow at the outlet sensor (FS-B reading below zero threshold) indicates backflow — a condition that can damage the output mechanism and contaminate the fluid system. At backflow detection, PR6 drops to −1.0 immediately.

PR10 Pressure Safety Index is the composite safety node for pressure: the weighted minimum of PR1, PR3, and PR6.

### 4.3 Primitive 3 — Thermal Balance (TB1–TB11)

Thermal Balance governs the temperature state of the fluid and system components. Heat accumulation in hydraulic systems degrades fluid viscosity, reduces component lifetime, accelerates seal wear, and in extreme cases causes boiling and loss of system integrity.

TB1 Temperature Rise measures the rate of temperature increase — a forward-looking indicator that predicts thermal problems before they reach dangerous levels. A system with stable absolute temperature but rapidly rising rate is more dangerous than one with moderately elevated but stable temperature.

TB4 Heat Saturation is a threshold node that triggers when the chamber wall temperature exceeds 55°C for more than 30 continuous seconds. Unlike continuous-valued nodes, TB4 is binary — below threshold it contributes +1.0; at threshold it drops to −0.8 and triggers Recovery Mode consideration.

TB11 Thermal Safety Index is the composite safety node for thermal state. A critical TB11 value triggers the most severe physical response: pump stop and system depressurization. Thermal runaway in a pressurized hydraulic system is not a recoverable condition through valve adjustment — it requires total load removal.

### 4.4 Primitive 4 — Structural Load (SL1–SL11)

Structural Load governs the mechanical stress on all physical components of the system. Hydraulic systems subject their components to cyclic pressure loading, vibration, and resonance — the primary mechanisms of fatigue failure.

SL1 Mechanical Stress measures the static force component on the chamber body, derived from the DC acceleration component of the ADXL345 accelerometer. In a properly mounted system at rest, this reflects only gravitational acceleration — deviation indicates external mechanical loading.

SL3 Resonance Risk detects the approach of structural resonance — the condition where the operating frequency of the hydraulic system coincides with the natural frequency of a structural component. Resonance causes rapid fatigue accumulation and can produce destructive oscillation in very short timeframes. The node is populated from the FFT of accelerometer data at the system's natural frequency.

SL4 Fatigue Load is the only node in the system that accumulates over session time rather than reflecting instantaneous state. It counts vibration cycles above a threshold amplitude and converts the count to a normalized value against a cycle limit — capturing cumulative wear that instantaneous readings cannot detect.

SL11 Structural Safety Index, like all safety index nodes, computes the weighted minimum of the most critical structural nodes and triggers Safety Mode when critical.

---

## 5. Primitive Aggregation and Threshold Evaluation

### 5.1 Aggregation

Each primitive's aggregate state is the weighted mean of its member nodes. Governance-critical nodes (safety index nodes, primary state nodes) carry higher weights than secondary indicator nodes. Coupling nodes and derived nodes carry standard weights.

For each primitive:
```
primitive_aggregate = Σ(node_value × node_weight) / Σ(node_weight)
```

The primitive aggregate inherits the same threshold classification as individual nodes:
- Optimal: 0.0 to +1.0
- Advisory: −0.3 to 0.0
- Caution: −0.4 to −0.7
- Critical: −0.8 to −1.0

### 5.2 Safety Node Priority

Safety index nodes (FS10, PR10, TB11, SL11) have a special property: their critical status triggers mode selection immediately, bypassing the standard mode selection hierarchy. The safety node evaluation runs before primitive aggregation in the control loop so that critical safety conditions are responded to within a single loop cycle (10ms at 100Hz).

This is equivalent to the hard constraint enforcement in software organisms — the governance architecture enforces that certain conditions cannot be managed with standard interventions. They require immediate mandatory response.

### 5.3 Critical Patterns

Critical patterns are compound trigger conditions — specific combinations of nodes across primitives that, when simultaneously degraded, indicate a compound fault condition more dangerous than any single node reading would suggest.

**Turbulence-Surge Compound (FS2 ≤ −0.4 AND PR3 ≤ −0.4):**
Turbulence onset and surge pressure occurring simultaneously indicates the system is approaching cavitation via a different mechanism than the standard FS4 path. This compound triggers a coordinated valve response: V1 aperture reduction and V2 opening, targeting FS5 (flow uniformity) recovery.

**Thermal-Structural Compound (TB2 ≤ −0.5 AND SL4 ≤ −0.5):**
Elevated thermal load and accumulated structural fatigue co-occurring indicates a system that is both thermally stressed and mechanically fatigued. Standard Recovery Mode (cooling focus) is insufficient — the compound response reduces operating frequency by 30% in addition to standard thermal recovery steps.

---

## 6. Mode Selection and Control Logic

### 6.1 Mode Selection Hierarchy

Mode selection is strictly hierarchical. The engine evaluates from most severe to least severe and selects the first matching condition:

```
Priority 1: SAFETY MODE
  Condition: any(FS10 ≤ −0.8, PR10 ≤ −0.8, TB11 ≤ −0.8, SL11 ≤ −0.8)
  Action: immediate V1 close, V2 full open, pump stop
  Exit: all safety nodes > −0.5 for 5 continuous seconds

Priority 2: RECOVERY MODE
  Condition: any(TB2 ≤ −0.5, SL4 ≤ −0.5, PR8 ≤ −0.5) sustained > 10 seconds
  Action: V1 at 50% rated flow, V2 full open, reduced duty cycle
  Exit: all trigger nodes > −0.3

Priority 3: BALANCE MODE
  Condition: FS-primitive and PR-primitive with opposing status vectors
             (one positive, one negative, diverging)
  Action: Coordinated V1/V2 modulation at 10Hz, small incremental steps
  Exit: FS5 > −0.2 AND PR5 > −0.2

Priority 4: POWER MODE
  Condition: all primitives advisory or better AND external load demand active
  Action: V1 fully open, V2 modulated for outlet pressure target
  Constraint: exits immediately if FS2 ≤ −0.4

Priority 5: STABILITY MODE (default)
  Condition: none of the above
  Action: V1 modulated to hold PS-A at setpoint, V2 fixed aperture
```

### 6.2 Mode Persistence

To prevent rapid mode oscillation at threshold boundaries, mode selection includes a hysteresis rule: a mode is maintained for a minimum of 5 control cycles (50ms at 100Hz) after it is selected, unless a higher-priority condition triggers. Safety Mode has no minimum persistence — it activates instantly and exits only when the physical condition clears.

### 6.3 Actuator Commands as Deterministic Outputs

The Lume architecture's output in digital systems is a mode, three recommendations, and a summary sentence. The output in a physical system is a mode, valve states, and a pump command. The structure is identical. The domain of the output differs. The governance architecture generating it does not.

For each mode, the actuator command is a pure function of the current primitive states:

```
f(mode, primitive_aggregates) → {V1_aperture, V2_aperture, pump_state}
```

No randomness. No interpolation from prior states. No running average over past commands. The current state determines the current command. Always.

---

## 7. Sensor Integration and Normalization

### 7.1 The Normalization Contract

Every normalization function must satisfy:
- Input: a physical measurement in its native units
- Output: a value in [−1.0, +1.0]
- Direction: higher normalized value always means more favorable state
- Monotonicity: the function must be monotonic (increasing physical safety → increasing normalized value, or decreasing physical stress → increasing normalized value)
- Clamping: values outside the physical measurement range are clamped to ±1.0

This contract ensures the HydroCore governance engine operates on a consistent, interpretable state space regardless of the diversity of underlying sensor types.

### 7.2 Sensor Update Rates and Latency

The control loop runs at 100Hz. Sensors update at different rates:

| Sensor | Native update rate | Buffer behavior |
|---|---|---|
| Pressure (MPRLS) | Up to 1000 Hz | Latest value used |
| Flow (YF-S201) | Pulse-based, ~200ms for low flow | 200ms rolling count, interpolated |
| Temperature (DS18B20 at 9-bit) | ~94ms | Value held until next reading |
| Accelerometer (ADXL345) | Up to 3200 Hz | 100Hz windowed RMS computed in background task |

Temperature is the slowest sensor at 94ms minimum. This means TB nodes update approximately every 9–10 control loop cycles. The lag compensation model must account for this by flagging TB nodes as "settling" during the 94ms update interval and holding the previous value.

### 7.3 Derived and Composite Nodes

Several nodes cannot be directly measured and are computed from combinations of other sensor readings:

**FS8 Shear Stress:** derived from the flow velocity gradient. Flow velocity = volumetric flow rate / cross-sectional area. Shear stress is proportional to velocity gradient. Computed from FS-A reading and known tube diameter.

**FS9 Flow Drift:** computed as the rolling mean deviation from the target flow setpoint over the last 10 control cycles. Measures the system's tendency to drift from setpoint, not its instantaneous deviation.

**PR4 Oscillation Amplitude:** computed from the FFT of 100ms PS-A pressure readings. The dominant oscillation frequency and its amplitude are extracted. Vortex-shedding frequencies and water hammer frequencies appear as characteristic peaks in this spectrum.

**TB8 Thermal Load Index:** a composite of TB2, TB4, and TB1. Represents the overall thermal burden of the system rather than any single thermal measurement.

**SL4 Fatigue Load:** cumulative count of vibration cycles exceeding the amplitude threshold in the SL2 frequency band, normalized against the designed component cycle limit. This is the only node that does not reset between control cycles — it accumulates across the session and is reset only on system power cycle or manual reset command.

---

## 8. Lag Compensation and Physical Control

### 8.1 The Physical Control Challenge

The HydroCore engine operates at 100Hz. Physical hydraulic components operate on longer timescales:

- Solenoid valve mechanical response: 20–40ms
- Pressure wave propagation (12" chamber): <1ms (negligible)
- Turbulence development after flow change: 50–200ms
- Temperature equilibration: 94ms to several seconds

Without compensation, the 100Hz control loop will issue commands faster than the physical system can respond. The engine will observe a condition that has not yet changed (because the actuator is still settling), re-evaluate as if the command was not issued, and issue another command. This produces actuator chatter and control instability — the opposite of deterministic governance.

### 8.2 The Lag Compensation Model

For each actuator, the engine maintains a settling state:

```
actuator_state = {
  commanded_aperture: current commanded position
  physical_settling: bool (true while settling)
  settle_complete_at: timestamp
  predicted_node_values: node values predicted after settling
}
```

When a command is issued:
1. The command fires immediately to the physical actuator
2. `physical_settling = true` for `settling_time_ms`
3. During settling, the engine evaluates node values using `predicted_node_values` (what the sensor will read after the actuator settles) rather than current sensor readings
4. When `settle_complete_at` is reached, `physical_settling = false` and the engine returns to live sensor readings
5. If a higher-priority condition triggers during settling (safety mode), the settling state is abandoned and the emergency command fires immediately

This model allows the organism to evaluate the physical system as if the command has already taken effect, preventing the re-issuance loop that causes chatter.

### 8.3 Predicting Post-Settling Node Values

For valve aperture changes, post-settling pressure and flow predictions use the Hagen-Poiseuille relationship for laminar flow:

```
predicted_flow = (π × r⁴ × ΔP) / (8 × μ × L) × aperture_fraction
```

Where r is tube radius, ΔP is the pressure differential, μ is kinematic viscosity (temperature-dependent), L is tube length, and aperture_fraction is the commanded valve opening. This gives a physics-based prediction of what the flow sensor will read after the valve settles.

For turbulence (FS2/FS3), prediction is simpler: if the commanded flow rate is below the laminar-turbulent transition threshold (Re < 2300), FS2 is predicted to recover toward +1.0 after settling. If above threshold, FS2 is predicted to degrade.

---

## 9. Safety Constraints and Hard Stops

### 9.1 The Hard Constraint Architecture

In digital Lume organisms, hard constraints are governance rules that fire mandatory outputs regardless of other system state — the GovernanceCore F8 Exploitation Risk node always triggers mandatory intervention language; the NeuroCore Cognitive Safety Mode never includes productivity recommendations. These constraints are enforced at the engine level and cannot be overridden by any product layer.

In HydroCore Physical, hard constraints take physical form. They are not software recommendations — they are direct actuator commands issued with highest priority, preempting all mode-based commands, and requiring physical clearing conditions before release.

The four physical hard constraints of HydroCore Physical:

**HC-1 Cavitation Stop:** FS4 ≤ −0.8 → V1 immediately closed, V2 fully open. System depressurizes. No commands restore V1 until FS4 > −0.5 for 5 continuous seconds and FS10 > −0.5.

**HC-2 Overpressure Stop:** PR3 ≤ −0.9 (chamber pressure ≥ 90% of rated maximum) → V1 immediately closed, pump stop. Passive relief valve V3 opens at 95% rated maximum (mechanical, not firmware-controlled). No firmware command can restore V1 until PR10 > −0.4.

**HC-3 Thermal Stop:** TB11 ≤ −0.8 (temperature ≥ 60°C) → pump stop, V2 fully open, complete system depressurization. This is the most severe hard stop — restoration requires manual reset after temperature drops below 45°C (TB2 > −0.2). Cannot restore automatically.

**HC-4 Resonance Stop:** SL3 ≤ −0.8 (structural resonance at or above critical threshold) → operating frequency shift command issued immediately. The engine adjusts valve timing to shift the system's operating frequency away from structural resonance by ±15%. If the resonance does not clear within 5 seconds, system enters Recovery Mode with reduced duty cycle.

### 9.2 The Independence of the Safety Layer

All four hard constraints evaluate on every control loop cycle, regardless of current mode. A system in Power Mode evaluating at HC-2 (overpressure) does not wait for the next mode selection cycle — it fires immediately. This is the physical equivalent of the Lume architecture's "engine-level enforcement" — constraints that no product layer, mode, or configuration can suppress.

The passive relief valve V3 provides a mechanical safety layer entirely independent of the firmware. It is a design requirement that V3 is always present in any HydroCore Physical deployment. No configuration of the engine's HC constraints replaces the mechanical safety layer. They work in parallel.

---

## 10. The Determinism Guarantee in Physical Systems

### 10.1 What Physical Determinism Means

In a digital Lume organism, the determinism guarantee is clean: identical inputs → identical outputs. The system is a pure function operating on digital data.

In a physical system, the claim requires precision. Physical sensors have noise. Valve positions have mechanical hysteresis. Temperature has thermal inertia. Perfect identical inputs are not achievable in practice.

The physical determinism guarantee is therefore stated as:

*For any two instants at which all sensor readings normalize to the same 42-node state vector (within the quantization resolution of the normalization functions), the HydroCore engine will produce identical actuator commands.*

This is achievable because the normalization functions quantize the continuous physical measurements into the discrete −1.0/+1.0 space at the resolution of the threshold bands. Two pressure readings of 12.4 PSI and 12.6 PSI, if both normalize to the same FS1 value (e.g., +0.72), produce the same downstream governance output.

The quantization inherent in normalization is not a limitation — it is the mechanism by which physical determinism is achieved.

### 10.2 Verifying Physical Determinism

The determinism guarantee can be experimentally verified:

1. Record a complete 42-node state vector at time T1
2. Record the actuator commands issued at T1
3. Reset the system to quiescent state
4. Use manual valve control to reproduce the sensor readings that produce the same 42-node state vector
5. Verify that the actuator commands issued are identical to those at T1

This verification procedure — the Determinism Test — is a required acceptance test in the HydroCore Physical build protocol. A system that fails the Determinism Test is not a HydroCore Physical system. It is a hydraulic control system with an organism-shaped interface.

### 10.3 Determinism as a Physical Property

The determinism guarantee has engineering value beyond the philosophical. In safety-critical hydraulic systems — industrial processes, medical devices, aerospace systems — the ability to predict and verify system behavior is a certification requirement. A control system that provably maps identical inputs to identical outputs is auditable in a way that PID-controlled or neural-network-governed systems are not.

HydroCore Physical's governance architecture is inspectable. Its mode selection logic is fully deterministic and can be traced. Its safety constraints are enumerated and their trigger conditions are exact. This auditability is a direct engineering advantage of the organism architecture over conventional hydraulic control.

---

## 11. Consumer Application — HydroCore Home

### 11.1 Positioning

HydroCore Home is the consumer-facing product built on the HydroCore Physical engine. It is a deterministic water-powered energy system for off-grid and supplemental power applications.

Two deployment variants are viable:

**Variant A — Gravity Feed Generator**
Requires a water source at elevation: minimum 10 feet of head pressure (approximately 4.3 PSI). A rooftop cistern, elevated rain collection tank, or hillside water source provides the energy gradient. Water flows downward through the HydroCore engine, driving a micro-turbine or linear generator, and is optionally returned to the source or collected at ground level. The HydroCore engine governs the system to maximize turbine efficiency while maintaining safe pressure and flow conditions.

This variant generates genuine net positive energy from the gravitational potential of elevated water. The energy output is small at prototype scale (single-digit watts to low tens of watts for a 10-foot head and 2-5 lpm flow) but is continuous, zero-fuel, and silent.

**Variant B — Line Pressure Harvester**
Connects inline to an existing pressurized water line (municipal supply: 40–80 PSI typical, irrigation lines: 20–40 PSI). A micro-turbine harvests kinetic energy from water that is already flowing through the line for primary use (irrigation, household water). The HydroCore engine governs turbine loading to harvest energy without creating backpressure that would affect the primary water use.

This variant requires no water source — it harvests from infrastructure already in place. Energy output depends on flow rate and pressure, but continuous harvest from an active irrigation system during growing season can deliver meaningful cumulative energy.

**A closed-loop bench system (pump circulating water through a reservoir) cannot generate net positive energy.** The pump power consumption exceeds turbine output. This variant is appropriate for laboratory demonstration and development only.

### 11.2 User Interface

The HydroCore Home user interface is served by the ESP32's WiFi hotspot as a local web dashboard accessible without internet:

- **Ring visualization:** The 4/42 ring in HydroCore's physical palette, displaying all four primitive aggregates in real time. The ring makes the organism's current state visible.
- **Mode indicator:** Current operating mode with time-in-mode display
- **Primitive gauges:** Four arc meters, one per primitive, with threshold band coloring
- **Live curves:** Pressure and flow rate for the last 60 minutes
- **Safety status:** Safety node values with alert display at caution and critical
- **Energy output:** Wh generated this session, if a generator is connected and instrumented

The dashboard exposes no organism terminology to the user. It shows physical quantities (pressure, flow, temperature, vibration) and system state (mode, safety status, energy output). The organism is infrastructure — the user sees the governed physical system.

---

## 12. Patent and Intellectual Property Context

### 12.1 Prior Art in Hydraulic Control

Conventional hydraulic control systems are governed by:
- PID controllers (single-variable feedback, continuous tuning)
- Fuzzy logic controllers (rule-based, multi-variable, non-deterministic output)
- Model predictive control (optimization-based, computationally intensive)
- Neural network controllers (trained, probabilistic, non-auditable)
- State machine controllers (discrete states, typically simple 2–4 state models)

None of these paradigms combine: simultaneous 42-variable governance, 4-primitive architectural structure, discrete 5-mode selection, hard constraint enforcement as a first-class architectural element, and a provable determinism guarantee. The combination is the novel contribution.

### 12.2 The Novel Claims

The following aspects of HydroCore Physical appear to have no clear prior art in combination:

1. Governance of a physical hydraulic plant by a Lume 4/42 synthetic organism architecture
2. Normalization of physical sensor measurements into the Lume −1.0/+1.0 state space for governance purposes
3. Hard safety constraints enforced at the organism level with mandatory physical responses that cannot be overridden at the product layer
4. The lag compensation model enabling deterministic organism governance of physical systems operating below the control loop frequency
5. Cross-domain equivalence: the same governance architecture (same primitives, same threshold model, same mode selection hierarchy) governing both digital/biological state and a physical hydraulic plant

### 12.3 Existing Patent Context

Patent 64/032,339 (Pending) covers the Lume deterministic governance framework. The Lume-V provisional covers the deterministic wrapper. The Lume-X provisional covers the multi-organism substrate.

HydroCore Physical is a physical instantiation of the HydroCore organism — an application of the existing architecture to a new domain. Whether this instantiation warrants an additional claim, a continuation, or is fully covered by existing provisionals requires legal assessment. This paper provides the technical documentation necessary for that assessment.

The provisional applications should be reviewed to confirm that physical-domain organism instantiation is covered within the existing claims language before HydroCore Physical is publicly demonstrated or deployed.

---

## 13. Discussion and Future Work

### 13.1 The Physical-Digital Equivalence

The most significant implication of HydroCore Physical is not hydraulic. It is architectural. The demonstration that a synthetic organism governs a physical system using the same primitives, nodes, thresholds, and mode hierarchy as it governs a cognitive or social system establishes the Lume architecture as a universal governance framework — not universal in the sense of "applicable to everything" but universal in the specific sense of being domain-invariant at the governance level.

This equivalence has downstream implications for the entire DarkWave Studios ecosystem. NeuroCore could, in principle, govern a neuromorphic computing substrate. SocioCore could govern a multi-agent communication network. GovernanceCore could govern an actual institutional decision process with enforcement mechanisms. The organism architecture does not distinguish between substrate types. It governs normalized flows.

### 13.2 Multi-Organism Physical Systems

The Lume architecture defines formal coupling relationships between organisms. In digital deployments, BioCore state feeds into NeuroCore through sleep and stress coupling nodes. The same coupling architecture applies in principle to physical systems.

A physical system where BioCore (biological organism) and HydroCore Physical (hydraulic organism) share coupling nodes — where the biological state of a human operator affects the hydraulic system's operating mode (reduced Power Mode when operator stress is high, extended Recovery Mode when operator fatigue is detected) — is architecturally expressible in the existing framework. This multi-organism physical coupling is a natural extension of HydroCore Physical and a subject for future work.

### 13.3 Scaling

The HydroCore Physical architecture as specified here operates at prototype scale (2–5 gallon reservoir, single pressure chamber, single turbine, ESP32-S3 controller). The governance architecture scales without modification. Larger systems require:

- Higher-rated sensors and actuators (same interface, different range specifications)
- More powerful controller (ARM Cortex-M7 or higher for multi-chamber systems)
- Multiple pressure chambers governed by a single HydroCore instance with distributed sensor aggregation
- Industrial-grade solenoid valves (24V or pneumatic rather than 12V)

The organism does not change. The normalization functions' range parameters change. The governance logic is identical.

### 13.4 The Deterministic Physical Product Category

HydroCore Physical represents the opening of a new product category: deterministic physical governance. Products in this category are characterized by:

- Governance architecture that is inspectable and verifiable
- Hard safety constraints that are architectural, not configurable
- Same-input/same-output guarantees at the normalized sensor level
- Human-interpretable system state in real time (the ring visualization, mode indicator)
- No probabilistic, learned, or adaptive elements in the control pipeline

This is the physical world expression of the AXIOM brand promise: "The AI That Never Guesses" applied to a physical machine. The hydraulic engine never guesses what valve state to adopt. It always knows, because the governance logic is deterministic.

---

## Appendix A — Complete 42-Node Table

| ID | Name | Primitive | Physical Signal | Direction | Safety Node |
|---|---|---|---|---|---|
| FS1 | Laminar Stability | Flow Stability | Pressure diff variance | Higher = more laminar | |
| FS2 | Turbulence Onset | Flow Stability | Accelerometer RMS 10–100Hz | Higher = less turbulent | |
| FS3 | Turbulence Intensity | Flow Stability | Accelerometer RMS peak >200ms | Higher = lower intensity | |
| FS4 | Cavitation Risk | Flow Stability | Accelerometer FFT >500Hz energy | Higher = lower risk | ★ |
| FS5 | Flow Uniformity | Flow Stability | Inlet/outlet flow rate ratio | Higher = more uniform | |
| FS6 | Vortex Formation | Flow Stability | Pressure oscillation frequency | Higher = no vortex | |
| FS7 | Flow Recovery Speed | Flow Stability | Time to recover after perturbation | Higher = faster recovery | |
| FS8 | Shear Stress | Flow Stability | Velocity gradient (derived) | Higher = lower shear | |
| FS9 | Flow Drift | Flow Stability | Rolling mean deviation from setpoint | Higher = less drift | |
| FS10 | Flow Safety Index | Flow Stability | Composite: FS1, FS4, FS5 | — | ★★ |
| PR1 | Chamber Pressure | Pressure Reg. | Inlet pressure deviation from target | Higher = on target | |
| PR2 | Pressure Drift | Pressure Reg. | dP/dt over 500ms | Higher = stable | |
| PR3 | Surge Pressure | Pressure Reg. | PS-A peak over 100ms window | Higher = no surge | ★ |
| PR4 | Oscillation Amplitude | Pressure Reg. | PS-A FFT dominant amplitude | Higher = no oscillation | |
| PR5 | Pressure Uniformity | Pressure Reg. | Inlet/outlet pressure diff stability | Higher = uniform | |
| PR6 | Backflow Risk | Pressure Reg. | Outlet flow sign | +1.0 no backflow, −1.0 backflow | ★ |
| PR7 | Pressure Recovery Speed | Pressure Reg. | Time to recover to setpoint | Higher = faster | |
| PR8 | Pressure Load | Pressure Reg. | Sustained pressure above 80% max | Higher = lower load | |
| PR9 | Pressure Volatility | Pressure Reg. | Stddev of PS-A over 1 second | Higher = less volatile | |
| PR10 | Pressure Safety Index | Pressure Reg. | Composite: PR1, PR3, PR6 | — | ★★ |
| TB1 | Temperature Rise | Thermal Balance | dT/dt (°C/min) | Higher = slower rise | |
| TB2 | Thermal Load | Thermal Balance | Absolute temperature vs. 65°C max | Higher = cooler | |
| TB3 | Cooling Efficiency | Thermal Balance | Rate of temperature drop in Recovery | Higher = more efficient | |
| TB4 | Heat Saturation | Thermal Balance | T > 55°C for > 30 seconds | Binary: 0 = not triggered | ★ |
| TB5 | Thermal Drift | Thermal Balance | 60-second rolling mean deviation | Higher = stable | |
| TB6 | Thermal Noise | Thermal Balance | TS-1 1-second stddev | Higher = lower noise | |
| TB7 | Thermal Recovery Speed | Thermal Balance | TS-1 descent rate after event | Higher = faster | |
| TB8 | Thermal Load Index | Thermal Balance | Composite: TB2, TB4, TB1 | Higher = lower load | |
| TB9 | Thermal Volatility | Thermal Balance | d²T/dt² | Higher = stable | |
| TB10 | Heat Transfer Efficiency | Thermal Balance | Load reduction per cooling unit in Recovery | Higher = more efficient | |
| TB11 | Thermal Safety Index | Thermal Balance | Composite: TB2, TB4, TB8 | — | ★★ |
| SL1 | Mechanical Stress | Structural Load | ADXL345 DC component | Higher = lower stress | |
| SL2 | Vibration Amplitude | Structural Load | ADXL345 RMS 1–10Hz | Higher = lower amplitude | |
| SL3 | Resonance Risk | Structural Load | ADXL345 FFT at natural frequency | Higher = no resonance | ★ |
| SL4 | Fatigue Load | Structural Load | Cumulative vibration cycles (session) | Higher = less accumulated | |
| SL5 | Structural Drift | Structural Load | DC offset drift over session | Higher = less drift | |
| SL6 | Harmonic Load | Structural Load | FFT energy at harmonics of op. freq. | Higher = lower harmonic | |
| SL7 | Structural Recovery Speed | Structural Load | Vibration decay time after impulse | Higher = faster decay | |
| SL8 | Material Flexion | Structural Load | Strain gauge (v2) / default 0.0 (v1) | Higher = less flexion | |
| SL9 | Structural Volatility | Structural Load | dRMS/dt over 500ms | Higher = stable | |
| SL10 | Vibration Noise | Structural Load | Broadband noise floor 0.5–500Hz RMS | Higher = lower noise | |
| SL11 | Structural Safety Index | Structural Load | Composite: SL1, SL3, SL4 | — | ★★ |

★ Primary safety node (contributes to safety index)
★★ Composite safety index node (triggers hard stop at critical)

---

## Appendix B — Normalization Reference

| Input | Function | Notes |
|---|---|---|
| Pressure deviation (PSI from target) | `1 − (|P − P_target| / P_max)` | Clamped to ±1.0 |
| Pressure rate of change (PSI/s) | `1 − (|dP/dt| / drift_limit)` | Inverted |
| Flow rate (L/min, deviation from target) | `1 − (|F − F_target| / F_max)` | Clamped |
| Temperature (°C, max 65°C) | `(65 − T) / 45` | Clamped |
| Temperature rate (°C/min) | `1 − (dT/dt / dT_limit)` | Inverted |
| Accelerometer RMS (g) | `1 − (rms / rms_threshold)` | Clamped |
| Accelerometer FFT band energy | `1 − (energy / energy_threshold)` | Clamped |
| Backflow (binary) | `+1.0 if flow ≥ 0; −1.0 if flow < 0` | Binary node |
| Fatigue cycle count | `1 − (cycle_count / cycle_limit)` | Session-accumulating |
| Self-report slider (1–10) | `(value − 5.5) / 4.5` | Consumer input only |

---

## Appendix C — Mode Selection Decision Tree

```
Evaluate safety nodes first (each loop cycle):
├─ Any of (FS10, PR10, TB11, SL11) ≤ −0.8?
│    YES → SAFETY MODE (hard stop, immediate actuator response)
│    NO ↓
├─ TB2 ≤ −0.5 (sustained 10s) OR SL4 ≤ −0.5 OR PR8 ≤ −0.5?
│    YES → RECOVERY MODE
│    NO ↓
├─ FS-primitive and PR-primitive opposing status vectors (diverging)?
│    YES → BALANCE MODE
│    NO ↓
├─ All primitives advisory or better AND load demand signal active?
│    YES → POWER MODE (exit immediately if FS2 ≤ −0.4)
│    NO ↓
└─ DEFAULT → STABILITY MODE
```

---

## Appendix D — Ring Geometry Specification

**Palette:**
- Flow Stability axis (up): #1565C0 (electric blue — water, laminar flow)
- Pressure Regulation axis (right): #00695C (teal — pressure, containment)
- Thermal Balance axis (down): #B71C1C (deep red — heat, thermal warning)
- Structural Load axis (left): #607D8B (iron grey — material, structure)

**Axis layout (clockwise from top):**
Up: Flow Stability → Right: Pressure Regulation → Down: Thermal Balance → Left: Structural Load

**Arc density:** node_count / 42 per primitive.
Flow Stability: 10/42 = 0.238
Pressure Regulation: 10/42 = 0.238
Thermal Balance: 11/42 = 0.262
Structural Load: 11/42 = 0.262

**Domain visual effects:**
- Thermal Balance axis at TB4 triggered: arc shifts to #FF1744 (alarm red) with outward pulse animation
- Structural Load axis at SL3 caution: arc oscillation pattern at resonance frequency (visual resonance indicator)
- Flow Stability axis at FS4 caution: inward-gravity compression toward center (cavitation risk indicator)
- Pressure Regulation axis at PR6 triggered: arc flashes #FF6F00 (backflow alert)

---

## References

Andrews, J. (2026). Lume Language Specification. Zenodo. DOI: 10.5281/zenodo.19382282

Andrews, J. (2026). Trust Layer: Deterministic Identity Architecture. Zenodo. DOI: 10.5281/zenodo.19560674

Andrews, J. (2026). Lume-V: The Deterministic Wrapper. Zenodo. DOI: 10.5281/zenodo.19645097

Andrews, J. (2026). Lume-X: The Multi-Organism Substrate. Zenodo. DOI: 10.5281/zenodo.19443968

Andrews, J. (2026). HydroCore: Hydrological Flow Organism. DarkWave Studios LLC. (Canon² Series, DOI pending)

Andrews, J. (2026). NeuroCore: Cognitive Flow Organism. DarkWave Studios LLC. (Canon² Series, DOI pending)

Andrews, J. (2026). GovernanceCore: Governance Flow Organism. DarkWave Studios LLC. (Canon² Series, DOI pending)

White, F. M. (2011). *Fluid Mechanics* (7th ed.). McGraw-Hill. [Hagen-Poiseuille, Reynolds number, turbulence onset]

Åström, K. J., & Wittenmark, B. (2013). *Computer-Controlled Systems: Theory and Design*. Dover. [PID control, lag compensation, sampled-data systems]

Merritt, H. E. (1967). *Hydraulic Control Systems*. Wiley. [Hydraulic plant dynamics, valve control, cavitation]

International Electrotechnical Commission. (2003). *IEC 61511: Functional Safety — Safety Instrumented Systems for the Process Industry Sector*. [Safety constraint architecture reference]

---

*This paper is part of the Canon² Series, DarkWave Studios LLC.*
*© 2026 Jason Andrews / DarkWave Studios LLC. All rights reserved.*
*Patent 64/032,339 Pending.*
