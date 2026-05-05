# HydroCore: A Four-Primitive Deterministic Hydrological Flow Organism for Water Routing, Pressure Governance, Purity Safety, and Thermal Management

**DarkWave Studios LLC — Canon² Technical Paper Series**
**Paper Number:** [Assign at Zenodo Upload]
**DOI:** [Assign at Zenodo Upload — doi.org/10.5281/zenodo.XXXXXXX]

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Affiliation:** DarkWave Studios LLC, Nashville, Tennessee
**Contact:** team@dwsc.io
**Website:** lume-lang.org
**Series:** Canon² — Engineering Architecture Papers

**Related Work:**
- Lume Language Specification — DOI: 10.5281/zenodo.19382282
- Trust Layer Ecosystem — DOI: 10.5281/zenodo.19560674
- DAIGS Framework — DOI: 10.5281/zenodo.19491784
- Lume-V Verification Suite — DOI: 10.5281/zenodo.19645097
- Lume-X Multi-Agent Cognition — DOI: 10.5281/zenodo.19443968
- Deterministic Dissolution — DOI: 10.5281/zenodo.15065493

**Companion Papers:**
- Andrews, J. (2026). Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture. DarkWave Studios LLC. Canon² Paper Series.
- Andrews, J. (2026). Verdara Ultra: A Four-Primitive Deterministic Outdoor Flow Organism. DarkWave Studios LLC. Canon² Paper Series.

> *This preprint has not undergone peer review.*

*© 2026 DarkWave Studios LLC. All rights reserved.*

---

## Abstract

We present HydroCore, a Lume-native deterministic hydrological flow organism for water routing, pressure governance, purity safety assessment, and thermal state management across physical water systems at any scale. HydroCore implements the Lume 4/42 organism architecture — four irreducible flow primitives governing forty-two operational nodes — in the hydrological domain. The four primitives are Pressure Flow, Volume Flow, Purity Flow, and Thermal Flow. The forty-two nodes encode the complete hydrological state space from static and dynamic pressure through flow rate, saturation, flood and drought probability, contamination indices, pathogen risk, water temperature, freeze state, and phase change probability.

Unlike conventional water management systems that monitor individual sensors or enforce point-in-time regulatory thresholds, HydroCore operates as a deterministic organism: it maintains a continuous internal state of hydro equilibrium across all four primitive flows simultaneously, enforces hard constraint rules that halt routing through compromised segments when any node crosses a critical threshold, and re-routes flow deterministically when conditions degrade. The organism never guesses, never hides risk, and never produces routing recommendations that violate its governing invariants.

HydroCore is scale-invariant and fractal: any hydrological unit from a single pipe segment to a regional watershed can be represented as its own 4/42 micro-organism, enabling recursive hydrological state modeling at any resolution. The architecture includes a complete 2D/3D visual geometry specification — a polar coordinate ring with radial state encoding, four-axis primitive core, primitive lobe volumes, flow vector overlays, and extruded three-dimensional time and scale stacks — that renders hydro equilibrium visually and provides immediate gestalt-level recognition when any primitive enters a failure envelope.

HydroCore is the third published member of the Lume physical flow organism family, following Meridian (energy domain) and Verdara Ultra (outdoor domain), and the first organism specification addressing an infrastructure-scale continuous physical medium with purity and contamination as first-class governance primitives.

**Keywords:** deterministic hydrological governance, Lume synthetic organism, water flow routing, pressure management, purity safety, 4/42 organism architecture, hydro equilibrium, water infrastructure, contamination detection, deterministic control

---

## Table of Contents

1. Introduction
2. Background and Related Work
3. System Overview — The HydroCore Organism
4. The Four HydroCore Primitives
5. The 42-Node Hydro State Ring
6. Node Threshold Architecture
7. The Deterministic Flow Routing Engine
8. Visual Geometry — 2D and 3D Representation
9. Runtime Behavior and Operating Modes
10. Global Invariant Enforcement
11. Implementation Considerations
12. Evaluation Framework
- Appendix A — Complete Node Definitions and Threshold Table
- Appendix B — Normalized State Mapping
- Appendix C — Flow Routing Decision Logic
- Appendix D — 2D/3D Geometry Data Model
- References

---

## 1. Introduction

### 1.1 The Problem with Water System Governance Today

Water infrastructure is among the most critical physical systems in human civilization, and among the least coherently governed at the state-model level. Municipal water systems, agricultural irrigation networks, micro-hydro generation installations, stormwater management systems, and natural watershed management all share a structural deficiency: they are monitored as collections of individual sensors rather than governed as unified flow organisms.

A city water utility monitors pressure at pump stations, turbidity at treatment plants, flow rates at distribution junctions, and contamination at regulatory sampling points — in separate dashboards, on separate timescales, by separate engineering teams. When a main breaks, the first signal may be a pressure drop at an upstream pump station. The response is an engineer dispatched to investigate. By the time the break is located and isolated, downstream contamination may have propagated through a distribution zone. The failure was detectable earlier. The cross-domain signals — pressure drop, flow anomaly, downstream quality deviation — were all present. No system was looking at all of them simultaneously.

This fragmented monitoring is not a technology failure. It is an architectural failure. Water systems are unified flow organisms. Pressure, volume, purity, and thermal conditions are not independent variables — they interact continuously, and the interactions often contain more information than any individual signal. Pressure loss alters flow velocity which alters sedimentation which alters purity. Thermal change alters viscosity which alters flow rate which alters pressure distribution. A system that governs water through unified flow primitives, continuously monitoring all forty-two state nodes and enforcing cross-domain constraint relationships, would catch these cascades before they become failures.

HydroCore is that system.

### 1.2 The Flow Organism Reframe

The foundational insight of this work is that water system governance is not a monitoring problem. It is a flow governance problem. A water system is a set of continuous, interacting physical flows — pressure gradients that drive routing, volumetric flows that govern distribution and saturation, purity conditions that govern safety and treatment requirements, and thermal states that govern viscosity, phase change, and biological activity. A system governing this environment must maintain equilibrium across all four domains simultaneously and respond to degradation in any domain with coordinated, deterministic action.

HydroCore treats water system governance as a flow governance problem and implements it as a Lume-native deterministic organism. The 4/42 organism architecture is the natural structure for this problem: four irreducible physical flow primitives, forty-two operational state nodes, continuous equilibrium maintenance, hard constraint enforcement, and deterministic re-routing when conditions degrade. The same architecture that governs energy flow in Meridian and outdoor environmental flow in Verdara Ultra governs hydrological flow in HydroCore.

### 1.3 The HydroCore Architecture

HydroCore is a 4/42 deterministic hydrological flow organism. The four primitives are Pressure Flow, Volume Flow, Purity Flow, and Thermal Flow. The forty-two nodes encode the full hydrological state space:

- **Pressure Flow (P1–P10):** Static pressure, dynamic pressure, pressure differential, head height, hydraulic gradient, pipe/channel constriction, backpressure, cavitation risk, pressure stability, burst/failure probability.
- **Volume Flow (V1–V10):** Flow rate, velocity, discharge volume, saturation level, soil/material absorption, channel capacity, flood probability, drought probability, flow continuity, flow variability.
- **Purity Flow (U1–U11):** Turbidity, sediment load, chemical contamination, pathogen index, mineral load, pH level, dissolved oxygen, conductivity, salinity, filtration requirement, potability index.
- **Thermal Flow (T1–T11):** Water temperature, thermal gradient, freeze risk, thaw risk, viscosity shift, thermal shock risk, heat load, evaporation rate, condensation rate, thermal stability, phase change probability.

### 1.4 Novel Contributions

This work makes six distinct contributions not present in existing water management or hydrological engineering literature:

1. **The first formal 4/42 hydrological flow organism specification** — applying the Lume synthetic organism architecture to water system governance with complete node definitions, threshold tables, and cross-domain interaction modeling.

2. **Purity as a first-class flow primitive** — treating water quality not as a monitoring metric but as a continuous flow field that interacts with pressure, volume, and thermal conditions in a unified routing governance model.

3. **Deterministic hard constraint routing for water systems** — a formal rule system that halts routing through compromised segments and re-routes flow deterministically when any node crosses a critical threshold.

4. **Scale-invariant fractal hydrological organism structure** — any water system unit from a single pipe to a regional watershed can be represented as its own 4/42 micro-organism, enabling recursive hydrological state modeling at any resolution.

5. **Formal 2D/3D visual geometry specification for hydrological state** — a polar coordinate ring and three-dimensional extrusion model that renders all forty-two node states visually with deterministic, reproducible, state-driven encoding.

6. **Cross-primitive interaction modeling** — formal specification of the interaction relationships between pressure, volume, purity, and thermal conditions that determine cascade failure modes in water systems.

### 1.5 Scope and Honest Limitations

HydroCore is a theoretical and architectural framework. No deployment system exists at time of writing. All node thresholds and scoring functions are initial specifications subject to empirical validation against real water system operational data across multiple installation types, climate zones, and infrastructure ages.

The system is designed for the physical water domain: municipal distribution, agricultural irrigation, micro-hydro generation, stormwater management, and natural watershed governance. It is not a drinking water treatment system and does not replace the domain-specific expertise required for regulatory compliance in any jurisdiction.

### 1.6 Paper Organization

Section 2 reviews related work in water system monitoring, hydrological engineering, and Lume organism architecture. Section 3 presents the HydroCore system overview. Sections 4 through 6 define the primitives, nodes, and threshold architecture. Section 7 describes the deterministic routing engine. Section 8 presents the visual geometry specification. Section 9 describes runtime behavior. Section 10 defines global invariant enforcement. Sections 11 and 12 address implementation and evaluation.

---

## 2. Background and Related Work

### 2.1 Water System Monitoring and SCADA

Modern water infrastructure monitoring is dominated by SCADA (Supervisory Control and Data Acquisition) systems — real-time data collection from field instrumentation (pressure transducers, flow meters, water quality analyzers, level sensors) fed into a centralized monitoring interface. SCADA systems excel at real-time parameter visibility and alarm triggering at individual sensor thresholds [1, 2]. They do not maintain a unified cross-domain state model, do not perform routing decisions, and do not enforce constraint relationships between pressure, volume, purity, and thermal domains.

Advanced Distribution Management Systems (ADMS) and Water Distribution System (WDS) hydraulic models [3, 4] provide network-level simulation capabilities — EPANET, for example, simulates pressure and flow distribution across distribution networks. These models operate on static network topology and do not integrate purity or thermal primitives into their routing logic. They simulate; they do not govern.

### 2.2 Hydrological State Modeling

Academic hydrological modeling encompasses watershed-scale models (SWAT, HBV), groundwater flow models (MODFLOW), and hydraulic routing models (HEC-RAS) [5, 6]. These are powerful simulation tools with strong empirical foundations. None of them operate as real-time continuous governance organisms. None enforce hard routing constraints in response to live state changes. None integrate purity and thermal primitives with hydraulic routing in a unified organism framework.

### 2.3 Water Quality Governance

Water quality regulatory frameworks — the Safe Drinking Water Act in the United States, WHO Guidelines for Drinking Water Quality globally — define threshold values for individual parameters (turbidity, pH, coliform bacteria, chemical contaminants) with sampling and reporting requirements [7, 8]. These frameworks are monitoring and compliance frameworks, not continuous governance organisms. They establish what the numbers must be; they do not provide a continuous routing engine that enforces safety constraints in real time.

### 2.4 Lume Physical Flow Organisms

Meridian [Andrews, 2026] established the first complete physical instantiation of the Lume 4/42 organism architecture in the energy domain. Verdara Ultra [Andrews, 2026] established the second, in the outdoor environmental domain. HydroCore is the third, in the hydrological domain, and the first to include purity as a first-class flow primitive.

---

## 3. System Overview — The HydroCore Organism

### 3.1 Core Thesis

HydroCore ingests hydrological signals — pressure, flow rate, purity metrics, temperature — maintains a stable internal state of hydro equilibrium, and outputs deterministic routing, flow adjustments, pressure balancing, purity warnings, and thermal risk alerts across water systems at any scale.

Hydro equilibrium exists when:
- Flow is stable and continuous within channel and pipe capacity
- Purity is safe for the intended end use (potable, agricultural, industrial, ecological)
- Pressure is within safe operational envelope at all points in the distribution network
- Thermal conditions support flow continuity without freeze, phase change, or viscosity failure

Equilibrium is not a static condition. It is a continuously maintained relationship between the four primitive flows. When any primitive's aggregate state degrades — or when one or more nodes cross a critical threshold — HydroCore responds deterministically: it adjusts routing, enforces constraints, and proposes alternative flow paths.

### 3.2 The 4/42 Structure

The global state of HydroCore at any moment is represented by two vectors:

**Primitive State Vector P:**
```
P = [PressureFlow, VolumeFlow, PurityFlow, ThermalFlow]
```

**Node State Ring R:**
```
R = [P1..P10, V1..V10, U1..U11, T1..T11]
```

Each element of R is a normalized scalar in [−1.0, +1.0] derived from the raw value of its corresponding hydrological measurement via the normalized state mapping function.

### 3.3 Fractal and Scale-Invariant Structure

HydroCore is fractal. Any hydrological unit can be represented as its own 4/42 micro-organism:

- A single pipe segment has its own P and R vectors
- A distribution zone is a 4/42 organism composed of its constituent segment organisms
- A full watershed is a 4/42 organism composed of its constituent zone organisms

This recursive structure enables the routing engine to operate simultaneously at multiple scales — evaluating the immediate flow path through a junction while maintaining a zone-level view of pressure balance and a watershed-level view of flood and drought risk.

### 3.4 Organism Identity

HydroCore maintains a fixed organism identity defined by its governing invariants, primitive definitions, node threshold table, and routing engine rules. No routing recommendation produced by HydroCore can violate these identity constraints. An output that violates a governing invariant is not a HydroCore output.

---

## 4. The Four HydroCore Primitives

### 4.1 Pressure Flow

Pressure Flow governs routing, force, and system stability across the hydraulic network. It represents the potential energy distribution of the water system — the driving force that moves water from higher-pressure to lower-pressure zones. A positive Pressure Flow state indicates stable pressure within operational envelopes at all points in the network. A negative Pressure Flow state indicates pressure anomalies — excessive pressure that risks burst failure, insufficient pressure that signals leakage or demand imbalance, or unstable pressure oscillations that indicate resonance or pump cycling problems.

Pressure Flow is governed by ten nodes (P1–P10). The dominant safety nodes are P8 (Cavitation Risk) and P10 (Burst/Failure Probability), as these represent the most consequential failure modes in pressurized water systems. Cavitation causes rapid impeller and pipe wear and can compromise system integrity within hours of onset. Burst failure represents immediate infrastructure damage and potential public safety hazard.

### 4.2 Volume Flow

Volume Flow governs distribution, availability, and hydraulic load across the system. It represents the kinetic dimension of water movement — how much water is moving, how fast, and whether the system's capacity to carry it is adequate. A positive Volume Flow state indicates flow rates within design parameters, adequate channel and pipe capacity, and balanced supply and demand. A negative Volume Flow state indicates capacity stress — potential flooding from excess flow, or drought-induced depletion threatening supply continuity.

Volume Flow is governed by ten nodes (V1–V10). The most operationally critical are V7 (Flood Probability) and V8 (Drought Probability), which represent the two extremes of volume flow failure. V9 (Flow Continuity) is a composite resilience node — it captures whether flow through the system is maintained without interruption, which is a prerequisite for all other Volume Flow nodes to be meaningful.

### 4.3 Purity Flow

Purity Flow governs safety, potability, and filtration requirements across the water system. It is the dimension of water quality — the chemical, biological, and physical properties of the water itself as it moves through the system. Purity Flow is the primitive that most directly governs human and ecological health outcomes. A positive Purity Flow state indicates water that is clean, potable, and biologically safe. A negative Purity Flow state indicates contamination, biological hazard, or chemical loading that requires treatment before the water can be safely used.

Purity Flow is governed by eleven nodes (U1–U11). The most safety-critical are U4 (Pathogen Index) and U3 (Chemical Contamination), as these represent failure modes with immediate and potentially severe public health consequences. U11 (Potability Index) is the composite output node — it integrates all other Purity Flow nodes into a single overall potability assessment that governs the routing engine's hard constraints on water delivery to potable end points.

Purity Flow is distinguished from the other three primitives in one important respect: its degradation is not always visible or instrumentally obvious in real time. Pressure failure manifests as a measurable pressure drop. Volume failure manifests as visible flooding or empty channels. Thermal failure manifests as measurable temperature deviation. Purity failure may be invisible — colorless, odorless, tasteless chemical or biological contamination that only manifests as illness after exposure. This makes Purity Flow the highest-priority primitive for conservative threshold management.

### 4.4 Thermal Flow

Thermal Flow governs viscosity, phase change, and flow behavior as a function of water temperature throughout the system. It represents the thermal energy state of the water and its infrastructure — whether temperatures support stable liquid flow or risk freeze, boiling, or thermal shock in pipes and channels. A positive Thermal Flow state indicates temperatures within the stable liquid flow range with no risk of phase change or extreme viscosity shift. A negative Thermal Flow state indicates thermal extremes that risk freeze damage, thermal expansion failure, or biologically significant temperature changes that interact with Purity Flow.

Thermal Flow is governed by eleven nodes (T1–T11). The most operationally critical for infrastructure systems are T3 (Freeze Risk) and T6 (Thermal Shock Risk). Freeze risk affects buried pipe systems in cold climates, above-ground irrigation in shoulder seasons, and micro-hydro systems in alpine environments. Thermal shock risk affects systems where large temperature differentials are introduced rapidly — industrial cooling systems, heated water return lines, and cold-water injection into warm distribution mains.

---

## 5. The 42-Node Hydro State Ring

### 5.1 Pressure Flow Nodes (P1–P10)

**P1 — Static Pressure**
Gauge pressure at the point of measurement under no-flow (static) conditions. The baseline pressure state of the system. Deviations from design static pressure indicate supply changes, elevation model errors, or demand imbalance.

**P2 — Dynamic Pressure**
Pressure under active flow conditions. The difference between P1 and P2 (with adjustment for velocity head) yields information about pipe friction losses and flow resistance.

**P3 — Pressure Differential**
Differential between upstream and downstream pressure across a system segment. A primary diagnostic for head loss, friction loss, and localized obstruction.

**P4 — Head Height**
Hydraulic head at the current measurement point — the equivalent height of water that would produce the measured pressure. The fundamental variable in gravity-fed and pump-assisted distribution systems.

**P5 — Hydraulic Gradient**
Rate of pressure loss per unit length along the flow path. Elevated hydraulic gradient indicates high friction losses, often signaling undersized pipe, fouling, tuberculation, or partial blockage.

**P6 — Pipe/Channel Constriction**
Degree of flow path restriction from corrosion, biofouling, scaling, debris, or valve position. Constriction interacts with P2 (Dynamic Pressure) and P5 (Hydraulic Gradient) to produce elevated local velocities and pressure drops.

**P7 — Backpressure**
Reverse pressure acting against the intended flow direction. Common at pressure zone boundaries, pump discharge check valve failures, and thermal expansion events. Persistent backpressure can drive cross-contamination through non-potable connections.

**P8 — Cavitation Risk**
Probability that local pressure has fallen below the vapor pressure of water, causing vapor bubble formation and collapse. Cavitation causes rapid mechanical damage to impellers, valve seats, and pipe walls. The fastest-escalating failure mode in the Pressure Flow primitive.

**P9 — Pressure Stability**
Variance of pressure over time at a fixed measurement point. High pressure instability indicates pump surge, demand fluctuation, or water hammer propagation. Sustained instability causes fatigue stress on pipe joints and fittings.

**P10 — Burst/Failure Probability**
Integrated probability of pipe or fitting failure given current pressure conditions, pipe age, material class, and corrosion state. The terminal safety node of the Pressure Flow primitive.

### 5.2 Volume Flow Nodes (V1–V10)

**V1 — Flow Rate (Q)**
Volumetric flow rate at the measurement point in gallons per minute or liters per second. The primary Volume Flow state variable.

**V2 — Velocity**
Average flow velocity in the pipe or channel cross-section. Governs turbulence regime (Reynolds number), sediment transport capacity, and scouring risk in unlined channels.

**V3 — Discharge Volume**
Cumulative volume discharged over a defined time window. Used for mass balance calculations at watershed and distribution zone scale.

**V4 — Saturation Level**
Ratio of current flow to channel or pipe design capacity. Saturation approaching 100% indicates no surge capacity — any demand increase or additional inflow will cause overflow or pressure surge.

**V5 — Soil/Material Absorption**
Rate at which surrounding soil or material absorbs infiltrating water. Relevant for stormwater systems, irrigation, and leakage assessment. Low absorption (saturated soil) drives surface runoff and flood risk amplification.

**V6 — Channel Capacity**
Remaining hydraulic capacity before overflow or pressure rating is reached. A direct function of V4 but computed at the channel or pipe segment level rather than the point level.

**V7 — Flood Probability**
Integrated probability of overbank flow, surface flooding, or distribution system overflow within the forecast window given current V1, V4, V5, and upstream watershed state.

**V8 — Drought Probability**
Integrated probability of supply-side depletion below minimum operational levels within the forecast window. Relevant for reservoir-fed systems, groundwater-dependent systems, and rain-dependent micro-hydro generation.

**V9 — Flow Continuity**
Binary-to-continuous assessment of whether uninterrupted flow is maintained through the system. Discontinuous flow (air entrainment, vapor lock, dead-end zones, seasonally dry channels) degrades system performance across all other nodes.

**V10 — Flow Variability**
Variance of V1 over time. High variability indicates demand fluctuation, intermittent pump operation, or upstream supply instability. The routing engine applies conservatism multipliers when V10 is elevated.

### 5.3 Purity Flow Nodes (U1–U11)

**U1 — Turbidity**
Optical clarity of the water as measured by light scattering. Turbidity indicates suspended particulate load and is a leading indicator of both sediment transport events and microbial contamination risk (pathogens frequently adsorb to particulates).

**U2 — Sediment Load**
Gravimetric concentration of suspended sediment. High sediment load accelerates pipe wear, impairs treatment efficiency, and carries adsorbed contaminants.

**U3 — Chemical Contamination**
Detected concentration of any chemical contaminant relative to its regulatory maximum contaminant level (MCL). Includes synthetic organics, heavy metals, nitrates, and process chemicals.

**U4 — Pathogen Index**
Integrated biological contamination risk accounting for indicator organism counts (E. coli, total coliform), source water vulnerability assessment, and treatment barrier status. The highest-priority safety node in the Purity Flow primitive.

**U5 — Mineral Load**
Total dissolved mineral concentration (hardness, alkalinity, total dissolved solids). Governs scaling risk, corrosion inhibition, and treatment chemical demand.

**U6 — pH Level**
Hydrogen ion concentration. pH outside the 6–8 range accelerates pipe corrosion (low pH) or scale deposition (high pH), and affects disinfection efficacy (chlorine disinfection is strongly pH-dependent).

**U7 — Dissolved Oxygen**
Concentration of dissolved oxygen in the water. Critical for aquatic ecosystem health in natural water bodies. Low dissolved oxygen indicates organic loading or stratification and is associated with elevated microbial activity and odor events.

**U8 — Conductivity**
Electrical conductivity of the water, a proxy for total ionic strength. Sudden conductivity changes signal contamination events or water source changes more rapidly than many other parameters.

**U9 — Salinity**
Concentration of dissolved salts. Governs suitability for irrigation (crop-specific tolerance limits), aquatic habitat quality, and corrosion of metallic infrastructure.

**U10 — Filtration Requirement**
Assessed need for additional filtration before the water is suitable for its intended end use, given current U1–U9 states. A derived node that integrates Purity Flow inputs into an actionable treatment requirement.

**U11 — Potability Index**
Composite assessment of overall water potability for human consumption given all Purity Flow node states. The terminal safety node of the Purity Flow primitive. Critical U11 state triggers hard constraints on delivery to any potable endpoint.

### 5.4 Thermal Flow Nodes (T1–T11)

**T1 — Water Temperature**
Bulk temperature of the water at the measurement point. The primary Thermal Flow state variable. Governs biological activity (U4 interaction), viscosity (V2 interaction), and regulatory compliance for thermal discharges.

**T2 — Thermal Gradient**
Temperature difference between measurement points — across a pipe segment, between surface and deep water, or between inlet and outlet of a thermal exchange system. High gradients indicate thermal stress loading.

**T3 — Freeze Risk**
Probability that water temperature will fall below 0°C (32°F) in exposed system components. Freeze causes expansion damage in rigid infrastructure. A leading indicator is T1 approaching 2–3°C with falling ambient temperature.

**T4 — Thaw Risk**
Risk of rapid thaw events following freeze — leading to sudden volume increase, debris flow, and increased flood probability (V7 interaction). Particularly relevant for snowmelt-driven watershed systems.

**T5 — Viscosity Shift**
Deviation of water viscosity from its standard reference value due to temperature extremes. Cold water is more viscous — at 0°C, viscosity is approximately 1.79 mPa·s, roughly twice its value at 25°C. Elevated viscosity increases pipe friction losses (P5) and pump energy requirements.

**T6 — Thermal Shock Risk**
Risk of rapid temperature change causing pipe, fitting, or equipment damage. Most relevant at points where hot and cold water streams mix, at thermal exchange equipment, and in systems with intermittent flow that allows stagnant water to reach extreme temperatures.

**T7 — Heat Load**
Thermal energy input to the water system from external sources: solar radiation, industrial process heat, groundwater recharge temperature. Governs ambient temperature trends and treatment needs.

**T8 — Evaporation Rate**
Rate of surface evaporation from open water bodies, reservoirs, and irrigation systems. At high rates, evaporation drives concentration of dissolved solids (U5, U9 interactions) and reduces available water volume (V8 interaction).

**T9 — Condensation Rate**
Rate of water condensation on cold surfaces. Relevant for enclosed systems and cold-water distribution in humid environments. Condensation drives corrosion on external pipe surfaces.

**T10 — Thermal Stability**
Variance of T1 over time at a fixed monitoring point. High thermal instability indicates fluctuating source temperatures, intermittent heat input, or stratification breakdown events.

**T11 — Phase Change Probability**
Integrated probability of any water-to-ice or water-to-vapor phase transition within system components within the forecast window. The terminal safety node of the Thermal Flow primitive.

---

## 6. Node Threshold Architecture

### 6.1 Three-Band Threshold Model

Each of the forty-two nodes is governed by a three-band threshold model — advisory, caution, and critical — defined in the node threshold table (Appendix A). The model provides graduated response: not every deviation triggers emergency action, but every deviation is tracked and communicated with an appropriate level of urgency.

### 6.2 Normalized State Mapping

All raw node values are mapped to normalized state s ∈ [−1.0, +1.0]:

```
if raw_value within optimal band:      s = +0.3 to +1.0
if raw_value crosses advisory:         s = 0.0 to −0.3
if raw_value crosses caution:          s = −0.4 to −0.7
if raw_value crosses critical:         s = −0.8 to −1.0
```

For nodes with both low-bad and high-bad failure modes (U6 pH, T1 Temperature, W1), a dual-sided mapping is applied: the optimal band occupies a center range, and both below-advisory and above-advisory deviations map to the negative portion of the scale.

### 6.3 Primitive State Aggregation

Each primitive's scalar state is a weighted mean of its node states. Safety-critical nodes receive elevated weights:
- P8 (Cavitation) and P10 (Burst) have elevated weights within Pressure Flow
- V7 (Flood) and V8 (Drought) have elevated weights within Volume Flow
- U4 (Pathogen) and U11 (Potability) have elevated weights within Purity Flow
- T3 (Freeze) and T11 (Phase Change) have elevated weights within Thermal Flow

---

## 7. The Deterministic Flow Routing Engine

### 7.1 Inputs and Outputs

**Inputs:**
- Pressure readings at all monitoring points in the network
- Flow rate and velocity measurements
- Water quality analysis (real-time or sampled)
- Temperature data throughout the system
- Network topology (pipe geometry, junction connectivity, pump and valve states)
- System constraints (capacity limits, regulatory requirements, operational bounds)
- Delivery targets (distribution points, reservoirs, required flow rates)

**Outputs:**
- Recommended flow routing path through the network
- Valve and pump adjustment recommendations
- Pressure balancing actions
- Purity warnings with treatment recommendations
- Thermal risk alerts with protective action recommendations
- System optimization opportunities (efficiency improvements within safe envelopes)

### 7.2 The Six Routing Rules

**Rule 1 — Hard Constraint Enforcement**

If any node crosses its critical threshold (s ≤ −0.8), the routing engine:
1. Halts routing through all system segments influenced by that node
2. Computes alternative flow paths that bypass the affected segment
3. Escalates the critical node to the primary alert position
4. Suppresses all routing recommendations that depend on the compromised segment until the node returns to caution-band or better

Special purity constraints: U4 (Pathogen Index) and U11 (Potability Index) trigger hard constraints at the caution threshold (s ≤ −0.4) for any segment delivering to a potable end point. The asymmetry of biological contamination consequences — irreversible public health impact — justifies a lower trigger threshold for these two nodes.

**Rule 2 — Risk-Weighted Flow Scoring**

For each candidate routing path, the engine computes:

```
Score = α·Efficiency − β·Risk + γ·Stability − δ·Purity_Cost
```

Where:
- Efficiency = throughput achievement relative to delivery targets
- Risk = function of P10, V7, U4, T3 across the routing path
- Stability = P9 + V9 + T10 (smooth, continuous, thermally stable flow)
- Purity_Cost = treatment or filtration overhead imposed by the path's purity conditions

**Rule 3 — Pressure Equalization**

HydroCore actively balances pressure across the network to prevent both burst risk (P10) and low-pressure contamination intrusion risk (P7 backpressure). Pressure equalization is a continuous background optimization that runs in parallel with routing decisions:

- When P10 approaches caution in any segment, the engine recommends pressure reduction measures (throttling, pressure-reducing valve adjustment, pump speed reduction)
- When static pressure falls below minimum supply threshold in any zone, the engine recommends flow redistribution from adjacent zones or pump activation

**Rule 4 — Purity Protection**

No routing path may deliver water from a segment with Purity Flow below the potability threshold to a potable endpoint without treatment. Purity protection operates as a routing constraint:

```
for each delivery path to potable endpoint:
    if any segment on path has U11.state <= -0.4:
        require treatment_barrier between contaminated segment and delivery point
        if no treatment_barrier available: block path entirely
```

Treatment barriers (filtration, chlorination, UV treatment) are first-class routing elements that HydroCore incorporates into its path model.

**Rule 5 — Thermal Safety**

Routing avoids segments at freeze risk (T3 approaching critical) and re-routes flow through them to prevent stagnation-induced freeze. When T3 crosses caution in an exposed segment, HydroCore:
- Increases flow velocity through the at-risk segment (thermal mass from moving water prevents freeze better than stagnant water)
- Alerts operators to insulation requirements
- Prepares bypass routing that bypasses the freeze-risk segment if T3 reaches critical

**Rule 6 — Dynamic Re-Evaluation**

All forty-two nodes are recomputed at every sensing cycle. The routing engine re-evaluates all recommendations and active alerts at each cycle. This continuous re-evaluation means HydroCore responds to conditions as they change, not as they were when a route was initially planned.

---

## 8. Visual Geometry — 2D and 3D Representation

### 8.1 Geometry Purpose

HydroCore's visual geometry is a direct, deterministic encoding of hydrological state. Every visual element — node color, radial position, axis length, lobe volume — is driven by the live state vector. An operator who knows the geometry reads system equilibrium at a glance. The geometry is not a status dashboard; it is an organism diagram.

### 8.2 Color Palette

- **Pressure Flow:** Deep blue — the color of compressed, energetic water under head pressure
- **Volume Flow:** Cyan/teal — the color of open, flowing water
- **Purity Flow:** White/pale blue — the color of clean, safe water
- **Thermal Flow:** Orange/red — heat energy, thermal loading, phase change risk

### 8.3 The 4/42 Core and Ring

**Core (four axes, clockwise from top):**
- Up (0°): Pressure Flow — deep blue
- Right (90°): Volume Flow — cyan/teal
- Down (180°): Purity Flow — white/pale blue
- Left (270°): Thermal Flow — orange/red

Each axis length encodes aggregate primitive state (−1.0 to +1.0). A collapsed axis signals a failing primitive. Axis thickness encodes volatility.

**Ring (42 nodes, clockwise from top):**
- Arc 1 (0°–85.7°): P1–P10, Pressure nodes
- Arc 2 (85.7°–171.4°): V1–V10, Volume nodes
- Arc 3 (171.4°–265.7°): U1–U11, Purity nodes
- Arc 4 (265.7°–360°): T1–T11, Thermal nodes

Node fill color: green (optimal), yellow (advisory), orange (caution), red (critical). Radial position: outward at +1.0, on base ring at 0.0, inward at −1.0.

### 8.4 Flow Vector Overlays

Overlaid on the 2D ring:
- **Pressure vectors:** Arrows showing the direction of highest pressure gradient, indicating the dominant flow-driving force
- **Volume flow lines:** Streamlines showing volumetric throughput in the primary flow path
- **Purity gradient:** Color wash across the ring arc from U1 to U11 — clean white transitioning to contamination amber as Purity Flow degrades
- **Thermal contour:** An isocontour line showing the thermal equilibrium boundary between freeze-safe and freeze-risk zones

### 8.5 3D Representation

**Option A — Time Stack:** Z-axis encodes time. Each slice is a snapshot of the 2D organism. Node trajectories become vertical ribbons. Threshold crossings appear as sharp color transitions. Used for post-event analysis and long-term trend review.

**Option B — Scale Stack:** Bottom slice: single pipe or channel segment. Middle slice: distribution zone or sub-watershed. Top slice: full system or watershed. Vertical pillars connect corresponding nodes across scales.

Primitive lobes — semi-transparent 3D volumes — expand and contract with aggregate primitive state. A Purity Flow lobe that transitions from white to amber and collapses inward provides immediate visual recognition of a contamination event propagating through the system.

### 8.6 Alert Visualization

- Single critical node: flashes red with ring arc highlight
- Primitive envelope breach: corresponding axis glows and lobe distorts
- Multi-primitive critical: outer ring pulses, central core flashes hydro instability indicator
- Purity breach for potable delivery: Purity arc segment displays a blocked delivery symbol — a distinct visual language indicating that no flow should be delivered downstream until resolution

---

## 9. Runtime Behavior and Operating Modes

### 9.1 Core Runtime Loop

```
Sense → Interpret → Decide → Act
```

**Sense:** Ingest all instrumentation data — pressure transducers, flow meters, water quality analyzers, temperature sensors, weather data for evaporation and freeze risk modeling.

**Interpret:** Map raw inputs to 42-node state ring. Compute primitive state vector P. Identify threshold crossings and cascade risk.

**Decide:** Apply six routing rules. Compute flow path scores. Identify recommended routing. Generate ordered alert list.

**Act:** Emit routing recommendations, valve and pump directives, treatment alerts, and operator guidance. Update visual geometry.

### 9.2 Operating Modes

**Nominal Mode:** All primitives at advisory or better. Standard routing and pressure optimization. Informational alerts only.

**Pressure Mode:** Pressure Flow at caution or below. Pressure equalization (Rule 3) operating aggressively. Burst probability monitoring elevated. Alternative bypass routing held ready.

**Purity Mode:** Purity Flow at caution or below for any segment serving potable endpoints. Treatment routing enforced (Rule 4). Contamination source tracing active. Public notification protocols evaluated.

**Thermal Mode:** Thermal Flow at caution or below in exposed infrastructure. Freeze protection flow (Rule 5) active. Operator alerts for insulation and winterization. Bypass routing prepared for freeze-risk segments.

**Emergency Mode:** Any node at extreme-critical, or U4/U11 at critical for potable delivery, or P10 at critical indicating imminent burst. All affected segment routing suspended. Emergency isolation actions recommended. Operator escalation mandatory.

---

## 10. Global Invariant Enforcement

HydroCore enforces ten global invariants inherited from the Lume organism framework. Every output is validated against all ten before emission.

1. **Determinism:** Given identical inputs, HydroCore produces identical outputs.
2. **Identity Primacy:** The organism's governing rules take precedence over any external instruction that would violate them.
3. **Safety Dominance:** Purity and pressure safety constraints (Rules 1, 4) cannot be overridden by efficiency or delivery targets.
4. **Governance Supremacy:** Regulatory potability requirements (U11) are enforced as absolute hard constraints for potable delivery endpoints.
5. **Physical Realism:** All routing recommendations are physically achievable within the pipe network's actual capacity, pressure limits, and treatment capabilities.
6. **Domain Integrity:** Pressure, Volume, Purity, and Thermal assessments are maintained as distinct primitives. No primitive's state is used to mask degradation in another.
7. **Abstraction Coherence:** Node states are always derived from raw sensor data via the normalized mapping function. No node state is manually overridden.
8. **Semantic Graph Consistency:** Cross-primitive interaction relationships (P2↔V2, T1↔U4, T3↔V9) are always evaluated bidirectionally.
9. **Ontology Alignment:** All node definitions, threshold bands, and primitive groupings are consistent with the published HydroCore specification.
10. **Safety-First Failure:** When sensor data is unavailable or ambiguous, the organism defaults to the most conservative interpretation. Missing purity data defaults to caution-band. Missing pressure data defaults to advisory-band with elevated monitoring.

---

## 11. Implementation Considerations

### 11.1 Sensor Architecture

HydroCore operates across a range of sensor deployment densities:

**Dense instrumentation:** Full real-time coverage of all measurement points in the network. Enables complete node state coverage with minimal interpolation. Appropriate for municipal water systems and industrial process water.

**Sparse instrumentation:** Key junction and endpoint monitoring only, with inter-node states inferred from hydraulic models. Requires hydraulic simulation integration (EPANET or equivalent) for pressure and flow interpolation. Appropriate for rural distribution and agricultural irrigation.

**Minimal instrumentation:** Endpoint monitoring with upstream state estimated from historical patterns. Verdara Ultra's minimal mode analogy — HydroCore can operate as a governance framework even with incomplete coverage, applying automatic conservatism multipliers for all nodes without live data.

### 11.2 Integration with Existing SCADA Systems

HydroCore is designed to operate as a governance layer above existing SCADA monitoring infrastructure, not as a replacement for it. SCADA systems continue to collect and display raw sensor data. HydroCore ingests that data, maps it to the 42-node state ring, and emits routing recommendations and governance alerts as a separate layer.

This integration approach means HydroCore can be deployed in existing water utilities without replacing or disrupting current operational technology infrastructure.

### 11.3 Regulatory Compliance

HydroCore's threshold architecture is designed to be aligned with regulatory standards (EPA, WHO) but is not a compliance documentation system. Regulatory reporting requirements — sample logging, violation notification timelines, annual reporting — are handled by existing compliance management systems. HydroCore provides the real-time governance layer; compliance systems provide the audit trail.

---

## 12. Evaluation Framework

### 12.1 Phase 1 — Historical Incident Validation

Validate the routing engine and constraint system against a library of historical water system failures — main breaks, contamination events, flood damage, freeze failures. For each incident, reconstruct the 42-node state vector in the hours before the failure. Verify that HydroCore would have triggered the appropriate warning or hard constraint before the failure occurred. Target: 85% correct constraint identification across a test library of 50 documented incidents.

### 12.2 Phase 2 — Pilot Deployment

Deploy HydroCore as a monitoring overlay on an operational water system — a municipal distribution zone, an agricultural irrigation network, or a micro-hydro installation. Collect continuous node state data and operator feedback on routing recommendations. Validate threshold calibrations against direct operator assessment and domain expert review.

### 12.3 Phase 3 — Production Deployment and Threshold Calibration

Deploy at full-scale production. Collect operational data across seasonal variation (freeze risk, drought risk, storm events, high-demand periods). Publish empirically validated threshold tables and weight coefficients as an open specification update.

---

## Appendix A — Complete Node Definitions and Threshold Table

| Node | Description | Advisory | Caution | Critical |
|------|-------------|----------|---------|----------|
| P1 | Static Pressure | 60 psi | 90 psi | 120 psi |
| P2 | Dynamic Pressure | moderate | high | extreme |
| P3 | Pressure Differential | 10% | 20% | 30% |
| P4 | Head Height | 10 ft | 20 ft | 30 ft |
| P5 | Hydraulic Gradient | moderate | steep | extreme |
| P6 | Constriction | mild | severe | blocked |
| P7 | Backpressure | elevated | high | critical |
| P8 | Cavitation Risk | possible | likely | active |
| P9 | Pressure Stability | reduced | poor | collapse |
| P10 | Burst/Failure Probability | 5% | 15% | 30% |
| V1 | Flow Rate (Q) | moderate | high | extreme |
| V2 | Velocity | 3 ft/s | 6 ft/s | 10 ft/s |
| V3 | Discharge Volume | moderate | high | extreme |
| V4 | Saturation Level | 70% | 85% | 95% |
| V5 | Soil/Material Absorption | moderate | low | none |
| V6 | Channel Capacity | 70% | 85% | 95% |
| V7 | Flood Probability | elevated | high | imminent |
| V8 | Drought Probability | moderate | high | extreme |
| V9 | Flow Continuity | reduced | poor | broken |
| V10 | Flow Variability | moderate | high | chaotic |
| U1 | Turbidity | 5 NTU | 10 NTU | 20 NTU |
| U2 | Sediment Load | moderate | high | extreme |
| U3 | Chemical Contamination | detectable | high | toxic |
| U4 | Pathogen Index | possible | likely | confirmed |
| U5 | Mineral Load | moderate | high | extreme |
| U6 | pH Level | 6.0–8.0 | 5.0–6.0 or 8.0–9.0 | <5.0 or >9.0 |
| U7 | Dissolved Oxygen | 6 mg/L | 4 mg/L | 2 mg/L |
| U8 | Conductivity | moderate | high | extreme |
| U9 | Salinity | moderate | high | extreme |
| U10 | Filtration Requirement | needed | urgent | critical |
| U11 | Potability Index | reduced | unsafe | dangerous |
| T1 | Water Temperature | 40–80°F | 32–40 or 80–95°F | <32 or >95°F |
| T2 | Thermal Gradient | moderate | steep | extreme |
| T3 | Freeze Risk | possible | likely | active |
| T4 | Thaw Risk | moderate | high | extreme |
| T5 | Viscosity Shift | moderate | high | extreme |
| T6 | Thermal Shock Risk | possible | likely | active |
| T7 | Heat Load | moderate | high | extreme |
| T8 | Evaporation Rate | moderate | high | extreme |
| T9 | Condensation Rate | moderate | high | extreme |
| T10 | Thermal Stability | reduced | poor | chaotic |
| T11 | Phase Change Probability | possible | likely | active |

---

## Appendix B — Normalized State Mapping

```
function normalize(raw, advisory, caution, critical, direction):
    if direction == "high_bad":
        if raw < advisory: return lerp(+0.3, +1.0, ...)
        if raw < caution:  return lerp(0.0, -0.3, ...)
        if raw < critical: return lerp(-0.4, -0.7, ...)
        else:              return lerp(-0.8, -1.0, ...)
    if direction == "low_bad":
        if raw > advisory: return lerp(+0.3, +1.0, ...)
        if raw > caution:  return lerp(0.0, -0.3, ...)
        if raw > critical: return lerp(-0.4, -0.7, ...)
        else:              return lerp(-0.8, -1.0, ...)
    if direction == "dual":
        // Optimal band is center range
        // Both below-low and above-high map to negative scale
        if optimal_low <= raw <= optimal_high: return lerp(+0.3, +1.0, ...)
        // etc.
```

---

## Appendix C — Flow Routing Decision Logic

```
function route(network, R, delivery_targets, constraints):
    candidates = generate_candidate_paths(network, delivery_targets)
    
    for path in candidates:
        // Rule 1: Hard constraint check
        if any(node.state <= -0.8 for node in R if node.affects(path)):
            path.score = -infinity; continue
        
        // Rule 4: Purity protection for potable endpoints
        if path.endpoint.is_potable:
            for segment in path.segments:
                if segment.U11.state <= -0.4:
                    if not segment.has_treatment_barrier:
                        path.score = -infinity; continue
        
        // Rule 2: Score computation
        path.score = (
            alpha * efficiency(path, delivery_targets)
            - beta * risk(path, R)
            + gamma * stability(path, R)
            - delta * purity_cost(path, R)
        )
        
        // Rule 3: Pressure equalization bonus
        if path.reduces_max_P10: path.score += equalization_bonus
        
        // Rule 5: Thermal safety
        for segment in path.segments:
            if segment.T3.state <= -0.4:
                path.score += velocity_increase_bonus  // more flow = less freeze
                if segment.T3.state <= -0.8:
                    path.score = -infinity  // bypass entirely
    
    return argmax(candidates, key=lambda p: p.score)
```

---

## Appendix D — 2D/3D Geometry Data Model

```json
{
  "organism": "hydrocore",
  "core": {
    "axes": [
      {"id": "pressure",    "angle_deg": 0,   "color": "#003087", "state": 0.0},
      {"id": "volume",      "angle_deg": 90,  "color": "#00B2CC", "state": 0.0},
      {"id": "purity",      "angle_deg": 180, "color": "#E8F4F8", "state": 0.0},
      {"id": "thermal",     "angle_deg": 270, "color": "#E05C00", "state": 0.0}
    ]
  },
  "ring": {
    "base_radius": 1.0,
    "nodes": [
      {"id": "P1",  "primitive": "pressure", "angle_deg": 0,       "state": 0.0},
      {"id": "P2",  "primitive": "pressure", "angle_deg": 8.571,   "state": 0.0},
      "...",
      {"id": "T11", "primitive": "thermal",  "angle_deg": 351.429, "state": 0.0}
    ]
  }
}
```

---

## References

[1] Savic, D. A., & Walters, G. A. (1995). Genetic algorithms for least-cost design of water distribution networks. *Journal of Water Resources Planning and Management*, 123(2), 67–77.

[2] Puust, R., Kapelan, Z., Savic, D. A., & Koppel, T. (2010). A review of methods for leakage management in pipe networks. *Urban Water Journal*, 7(1), 25–45.

[3] Rossman, L. A. (2000). *EPANET 2 Users Manual*. U.S. Environmental Protection Agency.

[4] Walski, T. M., Chase, D. V., Savic, D. A., Grayman, W., Beckwith, S., & Koelle, E. (2003). *Advanced Water Distribution Modeling and Management*. Haestad Press.

[5] Arnold, J. G., Srinivasan, R., Muttiah, R. S., & Williams, J. R. (1998). Large area hydrologic modeling and assessment: Part I. *Journal of the American Water Resources Association*, 34(1), 73–89.

[6] Brunner, G. W. (2016). *HEC-RAS River Analysis System User's Manual*. U.S. Army Corps of Engineers.

[7] U.S. Environmental Protection Agency. (2018). *2018 Edition of the Drinking Water Standards and Health Advisories Tables*. EPA 822-F-18-001.

[8] World Health Organization. (2022). *Guidelines for Drinking-Water Quality* (4th ed., incorporating the 1st and 2nd addenda). WHO Press.

[9] Andrews, J. (2026). Lume Language Specification. DarkWave Studios LLC. DOI: 10.5281/zenodo.19382282.

[10] Andrews, J. (2026). Trust Layer Ecosystem. DarkWave Studios LLC. DOI: 10.5281/zenodo.19560674.

[11] Andrews, J. (2026). Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture. DarkWave Studios LLC. Canon² Paper Series.

[12] Andrews, J. (2026). Verdara Ultra: A Four-Primitive Deterministic Outdoor Flow Organism. DarkWave Studios LLC. Canon² Paper Series.
