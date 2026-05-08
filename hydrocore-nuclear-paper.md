# HydroCore Nuclear: Deterministic Governance of Nuclear Power Plant Systems via the Lume 4/42 Synthetic Organism Architecture

**Canon³ — The Lume Synthetic Organism Canon (L-SOC)**
**Physical Instantiation Volume IV**

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Organization:** DarkWave Studios LLC
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Date:** May 2026

**Related Works:**
Lume Language Specification (DOI: 10.5281/zenodo.19382282)
HydroCore Steam — L-SOC Physical Instantiation Vol. III (DOI pending)
Safety and Certification — L-SOC Architecture Vol. V (DOI pending)
The Lume Organism Stack — L-SOC Architecture Vol. I (DOI pending)

**DOI:** Pending Zenodo assignment

---

## Abstract

HydroCore Steam (Physical Instantiation Vol. III) governs the steam side of power generation — the thermodynamic cycle that converts heat to mechanical work and then to electricity. At a nuclear power plant, that steam is produced by a reactor: a system whose governing variables are categorically different from any thermal process previously addressed in the L-SOC series. Reactor physics, coolant chemistry, neutron economics, and containment integrity are not extensions of steam governance. They are a new domain.

This paper specifies HydroCore Nuclear: the Lume 4/42 organism instantiated as the Advanced Process Control (APC) layer for a nuclear power plant, governing both the reactor-specific variables (neutron flux, coolant chemistry, criticality margin, xenon dynamics) and the plant steam system (already specified in HydroCore Steam). The two organisms — HydroCore Nuclear (reactor side) and HydroCore Steam (steam side) — are coupled through LIOCP at the reactor-to-steam boundary: the steam generator or heat exchanger interface.

The paper establishes: the nuclear power plant as a governed system with two coupled organism instances; the 42-node mapping of HydroCore Nuclear primitives to reactor physics and primary coolant variables; four novel governance nodes unique to nuclear operation; the nuclear-specific hard constraint layer including SCRAM preconditions and coolant activity limits; the regulatory positioning of HydroCore Nuclear within IEC 61513 (nuclear safety) and the NRC's defense-in-depth architecture; and the decade-scale pathway from simulation validation to licensed APC deployment.

---

## 1. Introduction

### 1.1 Nuclear Power and the Governance Gap

Nuclear power plants generate approximately 10% of the world's electricity — roughly 2,700 TWh per year from 440 operating reactors globally. They are the most densely governed power systems on Earth: multiple redundant safety systems, hardware interlocks, software protection systems, and regulatory oversight at a level unmatched by any other industrial system.

And yet the process control layer — the system that keeps the reactor at target power, manages coolant chemistry, and optimizes the thermodynamic cycle — is governed by conventional distributed control systems (DCS) that treat the reactor as a collection of setpoints and PID loops. These systems are safe. They are not deterministically intelligent. They do not synthesize across variables the way an organism does. They do not distinguish Advisory from Caution from Critical in a unified governance framework. They do not produce human-readable mode explanations through a language interface.

HydroCore Nuclear is not a safety system. It is an Advanced Process Control layer — the system that optimizes reactor operation within the bounds established by the existing safety systems. Its position in the defense-in-depth architecture is above the Basic Process Control System and well above the Reactor Protection System. It governs for performance and early-warning governance; the hardwired safety systems govern for safety independently of it.

### 1.2 The Nuclear-Specific Governance Challenge

Nuclear reactor physics introduces four governance challenges not present in any other physical instantiation:

**Neutron economics:** The reactor's power level is determined by the neutron chain reaction. The neutron population changes on microsecond timescales but is governed by the reactivity balance — the sum of control rod positions, coolant temperature coefficient, fuel burnup, xenon concentration, and boron concentration. Governing the neutron economy requires understanding the interaction of all these variables simultaneously — exactly the multi-variable synthesis task the organism architecture is designed for.

**Xenon dynamics:** Xe-135, produced by fission and by decay of I-135, is a powerful neutron absorber. Its concentration oscillates on a 15-hour timescale, producing power oscillations that challenge conventional control. A governance organism with xenon dynamics as a node variable can anticipate and preemptively compensate for xenon oscillations rather than reacting to them.

**Coolant chemistry:** Primary coolant chemistry (pH, boric acid concentration, dissolved hydrogen, corrosion product activity) is both a performance variable (affects reactivity) and a safety variable (coolant activity indicates fuel cladding integrity). Chemistry governance requires continuous integration of dozens of measurements that conventional DCS treats as independent alarms.

**Criticality margin:** The distance from the current reactivity state to criticality is the most important safety variable in reactor operation. It is not directly measured — it is calculated from the combination of control rod positions, temperature, boron concentration, and xenon state. A governance organism that maintains criticality margin as an explicit node variable makes this calculated quantity a first-class governance output.

---

## 2. Plant Architecture and Organism Placement

### 2.1 The Two-Organism Nuclear Plant Governance

A nuclear power plant consists of two thermodynamically coupled systems:

**Primary system (reactor side):** Reactor core, primary coolant loop, primary pump, pressurizer (for PWR) or steam drum (for BWR). Governed by **HydroCore Nuclear**.

**Secondary system (steam side):** Steam generators/heat exchangers, steam turbines, condenser, feedwater system. Governed by **HydroCore Steam** (Physical Instantiation Vol. III).

The two organisms couple at the steam generator boundary:

- HydroCore Nuclear exports: primary coolant temperature, heat transfer rate, reactor power level
- HydroCore Steam imports: heat source temperature and power as its primary thermal input nodes
- HydroCore Steam exports: steam demand (turbine load demand)
- HydroCore Nuclear imports: steam demand as a load demand signal driving reactor power target

This bidirectional coupling — HydroCore Nuclear ↔ HydroCore Steam — is the plant-level expression of the LIOCP architecture: the organism governing the reactor and the organism governing the steam cycle exchange state at the thermodynamic boundary between them.

### 2.2 Regulatory Positioning

HydroCore Nuclear is positioned as:

```
Layer 5: Reactor Protection System (RPS) — hardwired, independent, IEC 61513 SIL 3
Layer 4: Safety Instrumented System — independent protection (IEC 61513)
Layer 3: HydroCore Nuclear (APC layer — this paper)
Layer 2: Basic Process Control System (DCS)
Layer 1: Operator manual control
```

HydroCore Nuclear operates at Layer 3 — above the BPCS, below the safety systems. It does not interface with the RPS. The RPS is hardwired and cannot be influenced by any software layer above it. HydroCore Nuclear's outputs are setpoint recommendations to the BPCS — it does not directly actuate control rods, coolant pumps, or safety valves.

---

## 3. The 42-Node Mapping

### 3.1 LD — Load/Demand Primitive (11 nodes)

| Node | Variable | Description | Normalization |
|---|---|---|---|
| LD1 | Reactor power (% rated) | Current thermal power as fraction of rated output | [0, 100%] → [-1, +1] |
| LD2 | Power demand (grid) | Grid load demand on the turbine generator | [minimum load, full load] → [-1, +1] |
| LD3 | Neutron flux (average) | Average core neutron flux | [shutdown, 100% flux] → [-1, +1] |
| LD4 | Xenon load | Xe-135 reactivity worth (negative reactivity contribution) | [zero xenon, peak xenon] → [-1, +1] |
| LD5 | Control rod insertion depth | Average control rod bank position | [fully withdrawn, fully inserted] → [-1, +1] (inverted) |
| LD6 | Boron concentration | Primary coolant boron concentration | [min boron, max boron] → [-1, +1] |
| LD7 | Fuel burnup fraction | Current cycle burnup as fraction of design lifetime | [beginning of life, end of life] → [-1, +1] |
| LD8 | Primary coolant flow rate | Primary coolant pump flow | [min flow, design flow] → [-1, +1] |
| LD9 | Secondary steam demand | HydroCore Steam coupling import — steam demand | LIOCP import |
| LD10 | Decay heat load | Post-shutdown decay heat (if in shutdown cooling mode) | [0, peak decay] → [-1, +1] |
| LD11 | Reactor coolant system inventory | Pressurizer level (PWR) / water level (BWR) | [min, nominal] → [-1, +1] |

### 3.2 PR — Pressure/Stress Primitive (10 nodes)

| Node | Variable | Description | Normalization |
|---|---|---|---|
| PR1 | Reactor coolant pressure | RCS pressure vs. operating band | [min, max operating] → [-1, +1] |
| PR2 | Criticality margin | Distance from current state to prompt criticality (negative reactivity margin) | [large margin, small margin] → [-1, +1] (less margin = more pressure) |
| PR3 | Coolant temperature (Thot) | Primary coolant hot leg temperature | [min, max operating] → [-1, +1] |
| PR4 | Coolant activity | Primary coolant radioactivity — fuel cladding integrity proxy | [background, elevated] → [-1, +1] |
| PR5 | Xenon oscillation amplitude | Amplitude of spatial xenon oscillation in core | [stable, oscillating] → [-1, +1] |
| PR6 | Pressurizer level pressure | (PWR) Pressure-temperature relationship stress | deviation from design curve → [-1, +1] |
| PR7 | Reactivity insertion rate | Rate of reactivity change from control rod movement | [controlled, rapid] → [-1, +1] |
| PR8 | Core outlet temperature spread | Temperature variation across core exit thermocouples | [uniform, spread] → [-1, +1] |
| PR9 | Steam generator level stress | (PWR) Primary-to-secondary differential pressure and level | deviation → [-1, +1] |
| PR10 | Seismic / external event signal | External event monitoring (seismic, flooding, grid events) | [nominal, alert] → [-1, +1] |

### 3.3 FS — Flow/Stability Primitive (11 nodes)

| Node | Variable | Description | Normalization |
|---|---|---|---|
| FS1 | Coolant flow stability | Primary coolant flow rate stability | [unstable, stable] → [-1, +1] |
| FS2 | Power-to-flow ratio | Ratio of reactor power to coolant flow — heat transfer adequacy | [high P/F ratio, low] → [-1, +1] (lower = better) |
| FS3 | Core power distribution | Radial power peaking factor (Fq) | [high peaking, flat] → [-1, +1] |
| FS4 | Xenon time derivative | Rate of xenon concentration change — oscillation direction | [stable, oscillating] → [-1, +1] |
| FS5 | Chemistry stability | Primary coolant pH and chemistry parameter stability | [drifting, stable] → [-1, +1] |
| FS6 | Steam generator heat transfer | (PWR) Overall heat transfer coefficient | [degraded, design] → [-1, +1] |
| FS7 | Reactor period | Current reactor period (time for power to change by factor e) | [short period = rapid change, long = stable] → [-1, +1] |
| FS8 | Void fraction stability | (BWR) Coolant void fraction stability | [unstable, stable] → [-1, +1] |
| FS9 | Secondary steam flow stability | HydroCore Steam FS coupling import | LIOCP import |
| FS10 | Axial power offset | Axial offset of core power (top/bottom balance) | deviation from target → [-1, +1] |
| FS11 | Governance coherence | Internal organism state consistency | internal metric |

### 3.4 SL — Structural/Systemic Primitive (10 nodes)

| Node | Variable | Description | Normalization |
|---|---|---|---|
| SL1 | Fuel cladding integrity | Coolant activity trend as fuel cladding health proxy | [degraded, intact] → [-1, +1] |
| SL2 | Primary system leak rate | Identified and unidentified leakage rates | [leaking, tight] → [-1, +1] |
| SL3 | Containment integrity | Containment atmosphere monitoring | [elevated, normal] → [-1, +1] |
| SL4 | Control rod worth | Available shutdown margin from current control rod configuration | [low margin, high margin] → [-1, +1] |
| SL5 | Boron worth reserve | Remaining soluble shutdown margin (boron concentration headroom) | [low, high] → [-1, +1] |
| SL6 | Core thermal margin | Distance from safety limit (DNBR, peak cladding temperature) | [small margin, large margin] → [-1, +1] |
| SL7 | Reactor coolant system integrity | Composite of pressure boundary monitoring | [degraded, intact] → [-1, +1] |
| SL8 | Fuel burnup uniformity | Uniformity of burnup across fuel assemblies | [non-uniform, uniform] → [-1, +1] |
| SL9 | Emergency system readiness | Operability status of ECCS and other safety systems | [degraded, operable] → [-1, +1] |
| SL10 | Long-term core health | Multi-cycle trend of fuel and cladding performance indicators | composite → [-1, +1] |

---

## 4. Novel Governance Nodes

### 4.1 PR2 — Criticality Margin (Novel Node)

No prior L-SOC paper includes a node representing a calculated safety margin rather than a measured physical quantity. Criticality margin is not measured by any single sensor — it is calculated from the combination of control rod positions, coolant temperature, boron concentration, xenon state, and burnup. Maintaining criticality margin as an explicit PR node makes this calculated quantity a first-class organism variable.

When PR2 approaches the Caution threshold, the organism anticipates the narrowing margin and begins advisory outputs recommending conservative control rod positioning and boron concentration adjustments — before any protection system trip setpoint is approached. This is the APC layer functioning as designed: governing for performance while maintaining margin to the safety boundary.

### 4.2 LD4 — Xenon Load (Novel Node)

Xenon-135 dynamics are the most complex single variable in reactor control. Its concentration depends on fission rate history, neutron flux, and the I-135 decay chain — a 15-hour delayed response that makes xenon oscillations challenging to anticipate and counter. LD4 tracks the current Xe-135 reactivity worth as a Load/Demand variable: it represents the parasitic demand that xenon places on the available reactivity budget.

Combined with FS4 (Xenon time derivative), the organism has the information to anticipate xenon oscillation trajectories and recommend preemptive control adjustments — the first time xenon management has been formalized as an organism governance variable.

### 4.3 PR4 — Coolant Activity (Novel Node)

Primary coolant radioactivity is the most direct indicator of fuel cladding integrity. Fuel cladding failures allow fission products to enter the coolant, raising its activity. PR4 tracks coolant activity as a Pressure/Stress node — elevated activity is stress on the primary system's radiological integrity boundary. This node connects the organism's governance logic to nuclear safety in a way no prior physical instantiation addresses.

### 4.4 SL9 — Emergency System Readiness (Novel Node)

No prior L-SOC paper includes a node tracking the readiness of protective/emergency systems. In nuclear operation, emergency core cooling system (ECCS) operability is a regulatory requirement — if ECCS is degraded, reactor power must be limited or the reactor must be shut down per Technical Specifications. SL9 makes ECCS and other safety system operability a Structural/Systemic node: the organism's structural health includes the health of the systems that back it up.

---

## 5. Hard Constraints

### 5.1 HC-NUC-1: SCRAM Precondition

**Trigger:** PR2 (criticality margin) < -0.90 OR PR7 (reactivity insertion rate) > 0.95.

**Override:** HydroCore Nuclear outputs a SCRAM advisory to the BPCS and operator interface. This is NOT a SCRAM command (which is hardwired through the RPS) — it is an advisory that criticality margin is critically narrow and the BPCS should initiate protective action. The RPS operates on its own sensors and setpoints independently.

**Distinction from RPS:** The HC-NUC-1 organism output is an APC-layer advisory that may trigger operator action or BPCS-level protective action. The RPS trip is a separate, independent, hardwired protection that operates regardless of organism state.

### 5.2 HC-NUC-2: Coolant Activity Limit

**Trigger:** PR4 (coolant activity) > 0.85 (elevated activity indicating possible fuel cladding failure).

**Override:** Output power reduction advisory. Recommend initiation of continuous coolant sampling. Flag for engineering review within 4 hours. Log event with full organism state.

### 5.3 HC-NUC-3: Emergency System Degradation

**Trigger:** SL9 (emergency system readiness) < -0.70 during power operation.

**Override:** Output Technical Specification compliance advisory — reactor power must be reduced or the unit entered into a required action within the specified completion time per Technical Specifications. DLA surfaces full regulatory context for the Technical Specification applicability.

### 5.4 HC-NUC-4: Containment Isolation Signal

**Trigger:** SL3 (containment integrity) < -0.90.

**Override:** Highest-priority advisory. Operator notification. Log with full state capture. SCRAM advisory if SL3 continues to decline.

---

## 6. The Regulatory Pathway

### 6.1 IEC 61513 and Nuclear Safety

IEC 61513 — the nuclear adaptation of IEC 61508 — divides nuclear plant I&C into safety categories:

- **Category A:** Required for safety functions (reactor protection, ECCS actuation). SIL 3 requirements.
- **Category B:** Important to safety. SIL 2 requirements.
- **Category C:** Non-safety. No SIL requirement.

HydroCore Nuclear, as an APC layer that does not directly perform safety functions, is Category C. It does not require SIL rating. It requires only that it cannot interfere with Category A or B systems — which is guaranteed by the LIOCP architecture (organism outputs are BPCS setpoint recommendations, not direct actuator commands; safety systems are hardwired and cannot receive inputs from Category C software).

### 6.2 NRC Regulatory Pathway

US Nuclear Regulatory Commission (NRC) licensing of new APC software follows 10 CFR 50 Appendix B (Quality Assurance) and IEEE 603 (safety system design criteria). APC software (Category C) requires:

- Software Quality Assurance program per IEEE 7-4.3.2
- Verification and validation per IEEE 1012
- Independence from safety systems (hardware isolation where required)
- Configuration management per IEEE 828

The HydroCore Nuclear determinism property (all theorems from the Formal Mathematics paper apply) directly supports V&V — the organism's behavior under any input can be fully characterized by testing, and the same test results are reproducible indefinitely.

### 6.3 Deployment Timeline

**Years 1–3:** Full-scope simulation validation at a licensed nuclear simulator facility. All 42 nodes, all hard constraints, all mode transitions validated against simulator transients including design basis accidents (with the organism in advisory-only mode during accident scenarios — it observes and logs but does not issue control recommendations during transients outside its APC scope).

**Years 3–6:** Regulatory pre-application engagement with NRC. Software V&V documentation. Independent safety assessment (ISA) of the Category C determination.

**Years 6–8:** Pilot deployment at a single unit, in monitoring-only mode. All organism recommendations are logged and compared against actual operator actions. No BPCS integration yet.

**Years 8–12:** BPCS integration at pilot unit. Setpoint recommendations implemented via automatic BPCS setpoint adjustment within pre-approved bounds. Operator retains full override authority.

---

## 7. Discussion

### 7.1 The Ultimate Physical Instantiation

HydroCore Nuclear is the most extreme physical instantiation in the L-SOC series:

| Metric | HydroCore Physical | HydroCore Steam | HydroCore Nuclear |
|---|---|---|---|
| Power scale | Single-digit watts | Hundreds of megawatts | Thousands of megawatts (thermal) |
| Safety consequence | Personal injury risk | Industrial fatality risk | Multi-regional radiological risk |
| Regulatory framework | None | OSHA / PED | IEC 61513 / 10 CFR 50 |
| Governance cycle | 50ms | 100ms | 100ms (APC) |
| Novel nodes | 0 | 2 | 4 |

The same organism architecture spans this entire range. The normalization functions change. The threshold values change. The regulatory context changes dramatically. The governance logic — normalized state, primitive aggregation, mode selection, hard constraints, LIOCP coupling — does not change.

### 7.2 The HydroCore Nuclear ↔ HydroCore Steam Coupling

The bidirectional coupling between HydroCore Nuclear and HydroCore Steam is the most consequential inter-organism coupling in the physical instantiation series. When the steam turbine (governed by HydroCore Steam) trips unexpectedly, the resulting loss of steam load creates a rapid reactor power transient. HydroCore Nuclear must anticipate and respond to the turbine state — which it can do through LIOCP coupling of LD9 (secondary steam demand) in real time.

Conversely, when HydroCore Nuclear advises a power reduction (e.g., due to narrowing criticality margin), HydroCore Steam must adjust its turbine load accordingly. The inter-organism coupling is the formal architecture of the reactor-turbine coordination that plant operators manage manually today.

---

## 8. Conclusion

HydroCore Nuclear is the fourth physical instantiation of the HydroCore organism and the most demanding application of the Lume 4/42 architecture to date. Four novel governance nodes — criticality margin, xenon load, coolant activity, and emergency system readiness — extend the organism framework into variables unique to nuclear reactor governance.

The reactor does not change the architecture. The architecture governs the reactor.

---

## Appendix — Novel Node Summary

| Node | Innovation | Prior Art |
|---|---|---|
| PR2 Criticality Margin | First calculated (not measured) safety margin as organism node | None in L-SOC or industrial DCS |
| LD4 Xenon Load | First xenon dynamics formalized as organism governance variable | Conventional DCS treats xenon as setpoint disturbance |
| PR4 Coolant Activity | First radiological integrity metric as organism governance variable | Nuclear process historian, not APC variable |
| SL9 Emergency System Readiness | First protective system health as structural organism node | Technical Specification tracking, not APC variable |

---

## References

Andrews, J. (2026). HydroCore Steam. L-SOC Physical Instantiation Vol. III. DarkWave Studios LLC.
Andrews, J. (2026). Safety and Certification. L-SOC Architecture Vol. V. DarkWave Studios LLC.
Andrews, J. (2026). Organism Coupling. L-SOC Architecture Vol. II. DarkWave Studios LLC.

IAEA. (2002). *Instrumentation and Control Systems Important to Safety in Nuclear Power Plants*. Safety Standards Series No. NS-G-1.3.

IEC 61513:2011. Nuclear power plants — Instrumentation and control important to safety. International Electrotechnical Commission.

NRC. (2007). *Criteria for Use of Computers in Safety Systems of Nuclear Power Plants*. Regulatory Guide 1.152, Rev. 3.

Kerlin, T. W., & Upadhyaya, B. R. (2019). *Dynamics and Control of Nuclear Reactors*. Academic Press.

Lamarsh, J. R., & Baratta, A. J. (2018). *Introduction to Nuclear Engineering* (4th ed.). Pearson.

---

*Canon³ — The Lume Synthetic Organism Canon (L-SOC)*
*Physical Instantiation Volume IV*
*© 2026 Jason Andrews / DarkWave Studios LLC. All rights reserved.*
*Patent 64/032,339 Pending.*
