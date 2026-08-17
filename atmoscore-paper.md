# AtmosCore: A Four-Primitive Deterministic Atmospheric Flow Organism for Field Observation, Environmental State Governance, and Physical Evidence Documentation

**DarkWave Studios LLC — Canon³ Technical Paper Series**
**Paper Number:** [Assign at Zenodo Upload]
**DOI:** [Assign at Zenodo Upload — doi.org/10.5281/zenodo.XXXXXXX]

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Affiliation:** DarkWave Studios LLC, Nashville, Tennessee
**Contact:** team@dwsc.io
**Website:** lume-lang.org
**Series:** Canon³ — The Lume Synthetic Organism Canon (L-SOC)
**Subseries:** Physical Instantiation Series

**Related Work:**
- Lume Language Specification — DOI: 10.5281/zenodo.19382282
- Trust Layer Ecosystem — DOI: 10.5281/zenodo.19560674
- DAIGS Framework — DOI: 10.5281/zenodo.19491784
- Lume-V Verification Suite — DOI: 10.5281/zenodo.19645097
- Lume-X Multi-Agent Cognition — DOI: 10.5281/zenodo.19443968
- Deterministic Dissolution — DOI: 10.5281/zenodo.15065493

**Companion Papers:**
- Andrews, J. (2026). Verdara Ultra: A Four-Primitive Deterministic Outdoor Flow Organism. DarkWave Studios LLC. Canon² Paper Series.
- Andrews, J. (2026). HydroCore: A Four-Primitive Deterministic Hydrological Flow Organism. DarkWave Studios LLC. Canon² Paper Series.
- Andrews, J. (2026). The Lume Organism Stack — Architecture Vol. I. DarkWave Studios LLC. Canon³ Paper Series.
- Andrews, J. (2026). Organism Coupling: LIOCP — Architecture Vol. II. DarkWave Studios LLC. Canon³ Paper Series.
- Andrews, J. (2026). The Lume 4/42 Formal Mathematics — Architecture Vol. III. DarkWave Studios LLC. Canon³ Paper Series.

**Companion Systems:**
- Truth Observatory — continuous geophysical and atmospheric data collection system whose atmospheric layer AtmosCore consumes and contributes to.
- Truth Physical Evidence — case file schema whose ENVIRONMENTAL section AtmosCore populates as a primary field instrument.

> *This preprint has not undergone peer review.*

*© 2026 DarkWave Studios LLC. All rights reserved.*

---

## Abstract

We present AtmosCore, a Lume-native deterministic atmospheric flow organism designed for field observation support, local environmental state governance, and structured Physical Evidence documentation. AtmosCore implements the Lume 4/42 organism architecture — four irreducible flow primitives governing forty-two operational nodes — in the atmospheric physical domain. The four primitives are Thermodynamic Flow, Optical Propagation Flow, Dynamic Flow, and Temporal Stability Flow.

AtmosCore fills a structural gap in the Lume organism stack: no existing organism governs the atmospheric medium through which physical experiments and long-baseline observations are conducted. Current instruments report raw atmospheric measurements in isolation. No existing system synthesizes pressure, temperature, humidity, gradient, inversion state, refraction index, and optical propagation quality into a unified deterministic state that a field researcher can act on. AtmosCore provides that synthesis.

The organism is designed for three use cases simultaneously. First, as a **field observation instrument** — a mobile application that provides a researcher, experimenter, or observer with a continuous deterministic read of atmospheric state at their location, including an explicit suitability assessment for the specific type of observation they are conducting. Second, as a **Physical Evidence documentation engine** — automatically populating the mandatory ENVIRONMENTAL section of the Truth Physical Evidence case file schema with structured, source-attributed, timestamped atmospheric records, resolving the most common cause of `INCOMPLETE` and `INCONCLUSIVE — ENVIRONMENTAL CONTROLS MISSING` case file status. Third, as a **local node in the Truth Observatory atmospheric layer** — contributing field-collected primary measurements to the global continuous collection system, extending its spatial resolution beyond what fixed-station networks can provide.

AtmosCore introduces four novel nodes not present in the existing organism stack: FS10 (`Observer-Condition Flow State`) — an aggregate suitability score for field observation; FS12 (`Long-Baseline Optical Propagation State`) — the deterministic state of atmospheric conditions for long-distance optical experiments; PR8 (`Optical Propagation Risk Index`) — the refraction and scattering risk for a given experimental geometry; and SL3 (`Temperature Inversion Persistence`) — the accumulated duration and depth of an active temperature inversion, critical for interpreting long-baseline optical results.

Three hard constraints are defined. HC1 governs observer safety — wind, lightning, and temperature extremes that create hazard regardless of observation goals. HC2 governs optical propagation validity — atmospheric conditions that make long-baseline optical results unreliable must be flagged regardless of user intent. HC3 governs data provenance — the organism cannot present estimated or missing data as measured data.

No deployment system currently exists for AtmosCore. This paper establishes the formal theoretical, architectural, node, threshold, coupling, and field-export specification. The target application is any researcher, independent investigator, or field scientist who requires a structured, deterministic, provenance-preserving atmospheric state record as part of an empirical physical observation.

**Keywords:** deterministic atmospheric organism, Lume synthetic organism, atmospheric flow governance, field observation instrument, 4/42 organism architecture, optical propagation, temperature inversion, refraction index, physical evidence documentation, Truth Observatory, environmental controls

---

## Table of Contents

1. Introduction
2. Background and Related Work
3. System Overview — The AtmosCore Organism
4. The Four AtmosCore Primitives
5. The 42-Node Atmospheric State Ring
6. Node Threshold Architecture
7. The Deterministic State Engine
8. Physical Evidence Export
9. Observatory Integration
10. Visual Geometry — 2D and 3D Representation
11. Runtime Behavior and Operating Modes
12. Hard Constraint Enforcement
13. Cross-Organism Coupling
14. Implementation Considerations
15. Evaluation Framework
- Appendix A — Complete Node Definitions and Threshold Table
- Appendix B — Normalized State Mapping
- Appendix C — State Engine Decision Logic
- Appendix D — Physical Evidence ENVIRONMENTAL Export Schema
- Appendix E — Observatory Contribution Record Schema
- References

---

## 1. Introduction

### 1.1 The Problem AtmosCore Solves

Physical observation of the world depends on the atmosphere. Every long-baseline optical measurement, every experiment conducted outdoors, every photograph intended as evidence of surface geometry, celestial mechanics, or atmospheric behavior is conducted through an atmospheric medium whose state is almost never rigorously recorded at the time and location of the observation.

This omission is systematic and consequential. Temperature inversions, boundary layer structure, humidity gradients, barometric pressure trends, and atmospheric ducting can each produce measurable effects on apparent object positions, distances, and visibility over long baselines. An observation recorded without these measurements cannot be fully interpreted. An experiment whose result differs from a geometric prediction cannot determine whether the difference is real or whether refraction, inversion, or scattering explains the discrepancy — because the atmospheric state was not recorded.

The Truth Physical Evidence case file schema recognizes this. Its ENVIRONMENTAL section is a required section containing fields for temperature gradient, pressure, humidity, wind, inversion state, inversion source, and refraction correction applied. The most common reason a Physical Evidence case file carries `INCOMPLETE` or `INCONCLUSIVE — ENVIRONMENTAL CONTROLS MISSING` status is that these fields were not populated at the time of the experiment. They were estimated after the fact, extracted from distant weather stations that did not share the observation location's microclimate, or simply left blank.

AtmosCore is the instrument that fills this gap. It is a deterministic organism that maintains continuous atmospheric state at the observer's location, synthesizes that state into a structured, source-attributed record, and exports it directly into the Physical Evidence ENVIRONMENTAL schema at the moment it is needed.

### 1.2 Why This Is an Organism Problem, Not an App Problem

A weather app solves a different problem. It shows a forecast, a current temperature, and perhaps a comfort index. It does not maintain a continuous internal model of atmospheric state. It does not detect contradictions between its own data streams — the case where surface pressure says stable but temperature gradient says inversion is forming. It does not tell a researcher whether current conditions make a long-baseline optical observation reliable or unreliable. It does not produce a structured, source-attributed, schema-compatible export that can be attached to a Physical Evidence case file. It does not flag when its own data is estimated rather than measured. It does not enforce a hard constraint that prevents an observation from being classified as valid when atmospheric controls are missing.

These are organism problems. They require continuous state, cross-node interaction detection, threshold enforcement, hard constraints, and deterministic governance outputs. The Lume 4/42 architecture is the natural structure for this. The same architecture that governs hydraulic flow in HydroCore, energy routing in Meridian, and outdoor navigation in Verdara Ultra governs atmospheric state in AtmosCore.

### 1.3 The AtmosCore Architecture

AtmosCore is a 4/42 deterministic atmospheric flow organism. The four primitives are:

- **Thermodynamic Flow (TH1–TH10):** The thermal and chemical state of the atmosphere — temperature, pressure, humidity, dew point, density, and their gradients and stability indicators.
- **Optical Propagation Flow (OP1–OP10):** The atmospheric state as it affects the propagation of light — refractive index, scattering, inversion presence, ducting, visibility, and long-baseline propagation quality.
- **Dynamic Flow (DY1–DY12):** The mechanical motion of the atmosphere — wind speed, wind direction coherence, shear, turbulence, boundary layer height, convective activity, and frontal passage state.
- **Temporal Stability Flow (TS1–TS10):** The persistence, trend, and lifecycle of atmospheric conditions — inversion duration, pressure system stage, seasonal anomaly, observation window quality over time, and long-term atmospheric drift.

The forty-two nodes encode the full atmospheric state space relevant to field observation, physical experimentation, and environmental documentation. They are not a checklist. They are a continuous state ring — each node holds a normalized value from −1.0 (critical for observation) to +1.0 (optimal for observation), recomputed continuously as new data arrives.

### 1.4 Novel Contributions

This work makes six distinct contributions not present in the existing Lume organism stack or atmospheric observation literature:

1. **The first formal 4/42 atmospheric flow organism specification** — applying the Lume synthetic organism architecture to the atmospheric physical domain with complete node definitions, threshold tables, and deterministic state logic.

2. **Observer-condition flow state as a first-class organism output** — FS10 integrates all forty-two atmospheric nodes into a single observation suitability score for the specific type of observation being conducted, replacing informal judgment with a deterministic governance output.

3. **Long-baseline optical propagation as a governed organism state** — FS12 and PR8 make the atmospheric suitability for long-distance optical experiments a continuously monitored, threshold-enforced state rather than an afterthought.

4. **Temperature inversion persistence as a novel organism node** — SL3 is not available in any existing Lume organism. It accumulates inversion duration and depth over time, which is necessary to interpret long-baseline optical results and to determine whether an inversion is a transient event or a persistent local condition.

5. **Direct Physical Evidence schema export** — AtmosCore produces a schema-compatible ENVIRONMENTAL export that populates the required fields of a Truth Physical Evidence case file directly, eliminating the most common cause of `INCOMPLETE` and `INCONCLUSIVE — ENVIRONMENTAL CONTROLS MISSING` status.

6. **Observatory contribution record** — AtmosCore field sessions produce primary measurement records compatible with the Truth Observatory atmospheric layer schema, extending the Observatory's spatial resolution through field-collected data.

### 1.5 Scope and Honest Limitations

AtmosCore is a theoretical and architectural framework. No deployment system exists at time of writing. All node thresholds are initial specifications subject to empirical calibration. The normalized state mapping from raw API or instrument data to node states requires validation across multiple climate zones, terrain types, and seasonal conditions.

The organism is designed primarily for surface-level field observation at altitudes up to approximately 4,000 meters. Upper-atmosphere, aviation-altitude, and stratospheric conditions are outside scope. Claims about atmospheric refraction quantities computed from AtmosCore node values are estimates; they are not a substitute for dedicated meteorological instruments such as radiosondes.

AtmosCore does not predict weather. It governs current atmospheric state and trend. Forecast capability requires integration with numerical weather prediction systems that are outside the organism's scope.

### 1.6 Paper Organization

Section 2 reviews related work. Section 3 presents the system overview. Section 4 defines the four primitives. Section 5 specifies the forty-two nodes. Section 6 defines the threshold architecture. Section 7 describes the deterministic state engine. Sections 8 and 9 describe the Physical Evidence export and Observatory integration. Section 10 presents the visual geometry. Section 11 describes runtime behavior and operating modes. Section 12 defines hard constraint enforcement. Section 13 describes cross-organism coupling. Section 14 addresses implementation. Section 15 presents the evaluation framework.

---

## 2. Background and Related Work

### 2.1 Atmospheric Measurement and Field Instruments

Field atmospheric measurement divides into three categories. Fixed-station networks (NOAA ASOS, WMO surface synoptic) provide high-quality measurements at fixed locations, typically spaced tens to hundreds of kilometers apart, with limited representation of local microclimates. Portable weather instruments (Kestrel meters, portable radiosondes) measure individual atmospheric properties at a point but do not synthesize them into a coherent state model or produce evidence-compatible structured records. Consumer weather apps aggregate forecast and station data for comfort and planning but do not provide the measurement attribution, gradient detection, or observation suitability assessment required for empirical research.

No existing instrument or application maintains a continuous deterministic state of atmospheric conditions relevant to optical observation, produces schema-compatible structured records for evidence documentation, or integrates with a provenance-preserving evidence system.

### 2.2 Atmospheric Refraction and Long-Baseline Optics

Atmospheric refraction — the bending of light as it passes through air of varying density — is extensively documented in geodetic, astronomical, and surveying literature [1, 2, 3]. The standard refraction coefficient for terrestrial refraction is approximately k = 0.13, meaning that optical paths curve at roughly 13% of the Earth's curvature rate. This coefficient varies significantly with atmospheric conditions: temperature inversions can increase it dramatically, in some cases producing super-refraction that allows objects to appear at much greater heights than geometric optics would predict, or sub-refraction that makes objects appear lower.

Despite this extensive theoretical understanding, refraction conditions are rarely measured in the field during informal or independent physical experiments. The result is a systematic gap: experiments that find discrepancies with geometric predictions cannot determine whether the discrepancy is due to surface geometry or atmospheric refraction, because the refraction conditions were not recorded. AtmosCore's FS12 and PR8 nodes address this gap directly.

### 2.3 Physical Evidence Documentation Standards

The Truth Physical Evidence case file schema [PHYSICAL_EVIDENCE.md, Truth project, 2026] defines a structured documentation standard for independently reproducible physical experiments. Its ENVIRONMENTAL section requires temperature gradient measurements, pressure, humidity, wind, inversion state and source, and a flag for whether refraction correction was applied. The schema explicitly classifies experiments with missing environmental data as `INCONCLUSIVE — ENVIRONMENTAL CONTROLS MISSING`.

AtmosCore's design is directly responsive to this schema. Every field it requires is either a direct or derived output of AtmosCore's node state at the time of observation.

### 2.4 The Lume Synthetic Organism Stack

The Lume 4/42 synthetic organism architecture [Lume Spec, DOI: 10.5281/zenodo.19382282] defines the formal framework for deterministic flow organisms. The current stack includes BioCore (biological), NeuroCore (cognitive), SocioCore (social), HydroCore (hydrological), Meridian (energy), GovernanceCore (institutional), and Verdara Ultra (outdoor navigation). The Architecture Vol. I paper [Lume Organism Stack, 2026] establishes the full coupling topology and formal guarantees of the stack.

AtmosCore occupies a position in the stack that has been structurally anticipated but not yet filled: the atmospheric physical environment. Verdara Ultra's Weather Flow primitive (W1–W10) addresses weather for outdoor navigation but does not provide the depth, gradient detection, or optical propagation specificity required for empirical physical observation. AtmosCore is the dedicated atmospheric organism; Verdara Ultra's Weather Flow would couple to it rather than duplicate it.

### 2.5 Truth Observatory

The Truth Observatory [OBSERVATORY.md, Truth project, 2026] is a continuously collected, provenance-preserving record of geophysical and atmospheric observations. Its atmospheric layer is planned to collect NOAA GSOD, ERA5 reanalysis, MERRA-2, and NOAA SWDI data. AtmosCore's field sessions are designed to contribute primary measurements to this layer, extending its spatial coverage through ground-truth field observations.

---

## 3. System Overview — The AtmosCore Organism

### 3.1 Core Thesis

AtmosCore ingests atmospheric signals — thermodynamic state, optical propagation conditions, dynamic flow patterns, temporal stability trends — maintains a stable internal model of local atmospheric state, and outputs deterministic observation suitability assessments, Physical Evidence export records, Observatory contribution records, and hard-constraint alerts.

Atmospheric equilibrium in the AtmosCore sense is not meteorological stability in the synoptic sense. It is the relationship between atmospheric conditions and the observational requirements of the person using the instrument. Equilibrium exists when:

- The atmosphere supports the intended type of observation with measurable and documented conditions.
- The atmospheric state is self-consistent — no contradiction between primitive states that would indicate measurement error or model failure.
- Uncertainty and missing data are visible, not hidden.
- Hard constraints are not active.

When equilibrium is disturbed — when conditions degrade observation quality, when nodes contradict each other, when a hard constraint is crossed — AtmosCore responds deterministically: it updates the observation suitability state, produces explicit rationale, and emits structured outputs that document the atmospheric conditions at that moment.

### 3.2 The 4/42 Structure

The global state of AtmosCore at any moment is represented by two vectors:

**Primitive State Vector P:**
```
P = [ThermodynamicFlow, OpticalPropagationFlow, DynamicFlow, TemporalStabilityFlow]
```
Each element of P is a scalar in [−1.0, +1.0] representing the aggregate state of that primitive — computed as a weighted function of its constituent nodes.

**Node State Ring R:**
```
R = [TH1..TH10, OP1..OP10, DY1..DY12, TS1..TS10]
```
Each element of R is a normalized scalar in [−1.0, +1.0] derived from the raw value of its corresponding atmospheric measurement via the normalized state mapping function (Section 6.2).

The organism's state engine, observation suitability assessment, hard constraint enforcement, and export logic all operate on P and R. They never operate on raw sensor or API data directly. This ensures all decisions are made in the normalized state space, where threshold enforcement and cross-domain comparison are well-defined.

### 3.3 Organism Identity

AtmosCore maintains a fixed organism identity across all operations. The organism's identity is defined by:
- Its governing invariants (Section 12)
- Its primitive definitions (Section 4)
- Its node definitions and threshold table (Sections 5 and 6)
- Its state engine rules (Section 7)
- Its Physical Evidence and Observatory export schemas (Appendices D and E)

No output produced by AtmosCore can violate these identity constraints. An export that presents estimated data as measured data is not an AtmosCore output — it violates HC3, and the violation is surfaced rather than suppressed.

### 3.4 Position in the Lume Organism Stack

```
Lume Organism Stack — with AtmosCore

BioCore           — biological / human physiological state
NeuroCore         — cognitive flow and mental state
SocioCore         — social coordination and trust
HydroCore         — fluid and hydraulic flow
Meridian          — energy routing and distribution
GovernanceCore    — institutional decision governance
Verdara Ultra     — outdoor navigation and field safety
AtmosCore  ← NEW — atmospheric state, optical propagation, field observation
```

AtmosCore couples to Verdara Ultra (shares the outdoor environment; Verdara's Weather Flow primitive becomes a downstream consumer of AtmosCore state), to BioCore (temperature, pressure, and humidity affect human physiology), and to the Truth Observatory atmospheric layer (field measurements contribute to the global collection record).

---

## 4. The Four AtmosCore Primitives

### 4.1 Thermodynamic Flow (TH)

Thermodynamic Flow governs the thermal and chemical state of the local atmosphere — the raw measurable quantities of temperature, pressure, humidity, dew point, and atmospheric density, along with the vertical gradients that determine whether the atmosphere is behaving normally or is in an inverted or unstable state. A positive Thermodynamic Flow state indicates an atmosphere with normal lapse rate, moderate humidity, stable pressure, and no significant gradient anomalies. A negative Thermodynamic Flow state indicates temperature inversion, anomalous gradient, saturated humidity, rapidly changing pressure, or conditions outside the normal range for the location and season.

Thermodynamic Flow is the foundation of the other three primitives. Optical propagation quality, dynamic behavior, and temporal stability all derive from or depend on the thermodynamic state. The dominant nodes in this primitive are TH3 (Temperature Gradient) and TH6 (Atmospheric Lapse Rate), as these most directly determine whether the atmosphere is in a state that distorts optical propagation.

Thermodynamic Flow is the most directly measurable primitive. Most of its nodes can be populated from standard surface weather station data, portable weather instruments, or consumer weather APIs. The key limitation is altitude coverage — surface-level temperature and pressure do not fully characterize the vertical profile, which requires radiosonde or profiler data to resolve completely.

### 4.2 Optical Propagation Flow (OP)

Optical Propagation Flow governs the state of the atmosphere as a medium for light propagation. It synthesizes the thermodynamic and dynamic state of the atmosphere into a model of how light behaves at the observation geometry — the refractive index at the observer, the estimated refraction coefficient for the specific baseline distance, the presence of ducting or sub-refraction conditions, atmospheric scattering from particulate matter, and the overall quality of the long-baseline optical window.

Optical Propagation Flow is the most novel primitive in the organism and the most specific to AtmosCore's field observation mission. No existing Lume organism has an equivalent. A positive Optical Propagation Flow state indicates that the atmosphere is geometrically transparent — light travels close to a straight line at the experimental geometry, refraction is within the standard coefficient range, and the observation can be interpreted against geometric predictions with confidence. A negative Optical Propagation Flow state indicates that light propagation is significantly non-standard — inversion ducting, thermal shimmer, super-refraction, or scattering is operating at a level that makes long-baseline optical results unreliable without explicit correction.

The dominant nodes are OP4 (Refractive Index Estimate), OP5 (Refraction Coefficient for Current Geometry), OP7 (Atmospheric Ducting State), and OP10 (Long-Baseline Propagation Quality). OP10 is the primary output node of this primitive and a key input to FS12 and the Physical Evidence export.

### 4.3 Dynamic Flow (DY)

Dynamic Flow governs the mechanical motion of the atmosphere — wind speed, wind direction coherence, vertical wind shear, turbulence, boundary layer height, convective activity, and frontal passage state. These properties affect both observation safety and observation quality: high winds create instrument motion and thermal mixing that degrade optical stability; boundary layer turbulence produces image shimmer; convective activity signals approaching weather instability; frontal passage signals a transition in thermodynamic state.

A positive Dynamic Flow state indicates calm, coherent, well-structured airflow with a stable boundary layer and no significant convective activity. A negative Dynamic Flow state indicates high wind, turbulent mixing, active convection, or frontal passage — all of which reduce observation quality and may create safety concerns.

Dynamic Flow is the most rapidly changing primitive. Wind and convective activity can shift from optimal to degraded within minutes. The Dynamic Flow aggregate is therefore weighted with the highest temporal sensitivity in the state engine — a deteriorating DY state triggers earlier advisory alerts than a deteriorating TH state of equal magnitude.

### 4.4 Temporal Stability Flow (TS)

Temporal Stability Flow governs the persistence, trend, and lifecycle of atmospheric conditions. It is the memory primitive — it answers not just "what are conditions now" but "how long have they been this way, are they improving or worsening, and is this location typically suitable for observation at this time?" A positive Temporal Stability Flow state indicates persistent stable conditions, a favorable seasonal window, and an observation location with a strong historical suitability record. A negative Temporal Stability Flow state indicates rapidly changing conditions, a degrading trend, or a location or time of year that rarely provides suitable observation windows.

SL3 (Temperature Inversion Persistence) is the most novel node in this primitive. It records not just whether an inversion is present but how long it has been active and how deep it is. A transient inversion that develops and clears over an hour has very different implications for long-baseline optical interpretation than a persistent inversion that has been stable for twelve hours.

---

## 5. The 42-Node Atmospheric State Ring

### 5.1 Thermodynamic Flow Nodes (TH1–TH10)

**TH1 — Surface Temperature**
Dry-bulb air temperature at approximately 2 meters above the surface. Governs thermal load on the observer, dew point margin, and baseline for gradient calculations. Source: surface weather station, portable instrument, or consumer API.

**TH2 — Surface Pressure**
Barometric pressure at the observation location, corrected to station elevation. Governs atmospheric density, refraction baseline, and weather system state. Source: surface weather station, portable barometer.

**TH3 — Temperature Gradient**
The rate of temperature change with altitude in the layer from surface to approximately 500 meters — estimated from surface temperature, dew point, and, where available, elevated measurement sources. This is the most observation-critical thermodynamic node: a positive gradient (temperature increasing with altitude) indicates a temperature inversion that will bend light upward and can make distant objects appear higher than geometric predictions.

**TH4 — Relative Humidity**
Percentage relative humidity at the surface. Governs dew point margin, fog formation risk, and scattering contribution to optical propagation. High humidity near the dew point indicates fog formation risk and increased scattering.

**TH5 — Dew Point Margin**
The difference between current surface temperature and dew point. A small margin (< 2°C) indicates near-saturation conditions and high risk of fog, mist, or condensation on instrument surfaces.

**TH6 — Atmospheric Lapse Rate**
The estimated environmental lapse rate compared with the dry adiabatic lapse rate (DALR ≈ 9.8°C/km) and moist adiabatic lapse rate. A sub-adiabatic lapse rate indicates a stable atmosphere. A super-adiabatic lapse rate indicates instability and convective potential.

**TH7 — Water Vapor Pressure**
Partial pressure of water vapor in the atmosphere. A component of the refractive index calculation; elevated water vapor pressure increases the refractive index and therefore increases refraction.

**TH8 — Atmospheric Density**
Estimated air density at the observation location, derived from temperature and pressure. Governs the base refractive index and affects the magnitude of refraction at any geometry.

**TH9 — Thermal Plume Activity**
Estimate of convective thermal plume activity — columns of rising warm air — at the observation location. Active thermals create localized refraction anomalies and image shimmer over long baselines. Source: derived from surface heating, wind, and boundary layer state.

**TH10 — Atmospheric Stability Index**
A composite index integrating TH3 (gradient), TH6 (lapse rate), and TH9 (thermal plume activity) into a single stability score. Positive values indicate stable atmospheric structure favorable for optical observation. Negative values indicate instability, active mixing, or inversion.

---

### 5.2 Optical Propagation Flow Nodes (OP1–OP10)

**OP1 — Visibility Distance**
Horizontal visibility estimated from current conditions. The most directly observable optical propagation indicator. Reduced visibility from fog, haze, smoke, or precipitation indicates scattering that degrades long-baseline optical quality.

**OP2 — Aerosol and Particulate Load**
Atmospheric particulate concentration (PM2.5 and PM10 when available, or estimated from visibility and humidity). Governs scattering and absorption of light. High particulate loads reduce contrast and degrade image sharpness over long baselines.

**OP3 — Atmospheric Scattering State**
An estimate of the net scattering contribution from aerosols, water droplets, and gas molecules at the observation geometry. Scattering reduces contrast for distant objects and introduces color shift in photographic evidence.

**OP4 — Refractive Index Estimate**
The estimated atmospheric refractive index at the observation location, derived from temperature, pressure, and water vapor pressure using the Ciddor equation or equivalent formulation. The refractive index determines how much the speed of light is reduced in the local atmosphere.

**OP5 — Refraction Coefficient for Current Geometry** *(Novel node)*
The estimated terrestrial refraction coefficient k for the specific observation geometry — determined by the baseline distance and the estimated vertical temperature gradient across the propagation path. Standard terrestrial refraction uses k ≈ 0.13. Active temperature inversion can push k to 0.25 or higher; sub-refraction conditions can reduce it below 0.07. This node quantifies the deviation from standard refraction for the specific observation being conducted.

**OP6 — Thermal Shimmer Index**
An estimate of the optical turbulence (Cn² — refractive index structure constant) near the surface. Active thermals, high surface heating, and wind shear produce shimmer that degrades image sharpness and increases measurement uncertainty for long-baseline observations.

**OP7 — Atmospheric Ducting State**
An assessment of whether ducting conditions are present — a type of super-refraction in which the refraction gradient is so strong that light bends around the Earth's curvature and allows objects to be seen far beyond their normal geometric horizon. Ducting conditions produce the most dramatic and most commonly misinterpreted long-baseline optical anomalies.

**OP8 — Sub-Refraction Risk**
An assessment of whether conditions favor sub-refraction — reduced bending relative to standard — which would make objects appear lower than normal refraction predicts. Sub-refraction is less dramatic than super-refraction but equally significant for interpreting optical experiments against geometric predictions.

**OP9 — Observation Geometry Compatibility**
A node that accepts the specific observation geometry (baseline distance, observer height, target height) as an input and evaluates whether the current atmospheric state is compatible with that geometry. A geometry that requires a propagation path that runs close to the surface is more susceptible to inversion and ducting effects than one with a higher propagation angle.

**OP10 — Long-Baseline Propagation Quality** *(Novel node)*
A composite assessment of the overall quality of long-baseline optical propagation under current atmospheric conditions. Integrates OP1 through OP9 into a single governance output: the confidence with which a long-baseline optical observation made under current conditions can be interpreted against a geometric model without additional correction for atmospheric refraction and scattering. This is the primary output node of the Optical Propagation Flow primitive.

---

### 5.3 Dynamic Flow Nodes (DY1–DY12)

**DY1 — Wind Speed**
Surface wind speed at the observation location. Governs instrument stability, thermal mixing, and exposure risk for the observer.

**DY2 — Wind Direction Coherence**
The consistency and steadiness of wind direction over the preceding observation window (typically 15–30 minutes). Inconsistent, gusty, or veering wind indicates turbulent conditions unfavorable for stable optical observation.

**DY3 — Wind Shear**
The estimated rate of change of wind speed and direction with altitude in the boundary layer. High wind shear generates turbulence and optical instability.

**DY4 — Boundary Layer Height**
The estimated height of the convective boundary layer — the lowest portion of the atmosphere directly influenced by surface heating. A shallow boundary layer confines thermal plumes and turbulence to a lower altitude band; a deep boundary layer can produce turbulence throughout the observation path of a long-baseline experiment.

**DY5 — Surface Turbulence Intensity**
Estimated mechanical turbulence generated by wind flow over surface roughness at the observation location. Relevant to instrument vibration and near-surface optical instability.

**DY6 — Convective Available Potential Energy (CAPE)**
CAPE estimate for the observation location — a measure of the energy available for convective storm development. High CAPE values indicate potential for rapid weather deterioration.

**DY7 — Frontal Proximity**
An estimate of the distance and time to the nearest approaching meteorological front. Frontal passages produce rapid changes in thermodynamic state and often precede the most significant atmospheric anomalies.

**DY8 — Precipitation State**
Current precipitation type and intensity. Any active precipitation degrades optical observation quality and introduces hard safety considerations.

**DY9 — Squall and Gust Probability**
Estimated probability of sudden wind increase within the observation window. Relevant to observer safety and instrument stability.

**DY10 — Jet Stream Influence**
An assessment of whether the observation location is under significant jet stream influence at the relevant altitude. Jet stream proximity can produce high-altitude wind effects that propagate into surface conditions.

**DY11 — Sea Breeze or Land Breeze State**
For coastal and lakeshore observation locations, an assessment of whether the dominant flow is a thermally driven sea breeze or land breeze. These flows are associated with specific boundary layer structures that affect optical propagation over water.

**DY12 — Dynamic Flow Coherence**
A composite assessment of the overall dynamic state of the atmosphere. Integrates DY1 through DY11 into a measure of how well-organized and stable the atmospheric flow is at the observation location and time. High coherence indicates conditions favorable for stable optical observation; low coherence indicates turbulent, rapidly changing, or hazardous conditions.

---

### 5.4 Temporal Stability Flow Nodes (TS1–TS10)

**TS1 — Pressure Trend**
The rate and direction of barometric pressure change over the preceding three hours. A falling pressure trend indicates approaching weather deterioration. A rising trend indicates improving conditions.

**TS2 — Pressure System Stage**
The estimated stage of the dominant pressure system — developing, mature, dissipating — based on pressure trend, wind pattern, and cloud or precipitation state. Governs the expected duration of current conditions.

**TS3 — Temperature Inversion Persistence** *(Novel node)*
The accumulated duration and estimated depth of any active temperature inversion at the observation location. A transient surface inversion that forms and clears within one hour has very different implications for long-baseline optical interpretation than a persistent inversion that has been stable for twelve or more hours. The node records both the current inversion state and its history within the current observation session.

**TS4 — Observation Window Quality — Current Session**
The aggregate observation suitability score averaged over the current session or observation day. Provides a record of how stable conditions have been throughout the observation period rather than only the instantaneous state.

**TS5 — Seasonal Observation Suitability**
An estimate of whether the current time of year is typically favorable for the type of observation being conducted at this location. Some locations have systematic seasonal inversion patterns, predictable fog windows, or predictable thermal activity that makes certain observation types unreliable at certain times of year.

**TS6 — Diurnal Phase**
The time-of-day phase — pre-dawn, dawn, morning, midday, afternoon, evening, night — as it relates to atmospheric stability. Midday is typically the least stable period for near-surface optical observation due to maximum solar heating and thermal plume activity. Pre-dawn is typically the most stable.

**TS7 — Solar Heating Accumulation**
The accumulated solar energy input to the surface over the current day, which drives thermal plume activity, boundary layer growth, and surface-atmosphere temperature gradient development. Higher accumulation indicates greater afternoon instability.

**TS8 — Anomaly Index**
A measure of how far current conditions deviate from the climatological baseline for this location, season, and time of day. Highly anomalous conditions are more likely to produce unusual optical propagation behavior that the standard refraction coefficient does not capture.

**TS9 — Trend Coherence**
An assessment of whether all temporal indicators are pointing in the same direction — improving, stable, or deteriorating. Incoherent trends (some indicators improving while others worsen) indicate a transitional atmospheric state with higher uncertainty.

**TS10 — Atmospheric Stability Lifecycle Score**
A composite long-term stability score for the observation location that integrates TS1 through TS9 into an assessment of whether the atmosphere is in a settled, reliable state or a transitional, unreliable one. This is the primary output node of the Temporal Stability Flow primitive.

---

## 6. Node Threshold Architecture

### 6.1 Three-Band Threshold Model

Every node in AtmosCore operates on the Lume three-band threshold model. For atmospheric observation, the bands carry specific meanings:

| Band | Normalized Range | Observation Meaning |
|---|---|---|
| Optimal | 0.0 to +1.0 | Conditions favorable; no qualification needed |
| Advisory | −0.3 to 0.0 | Conditions acceptable with awareness; note in record |
| Caution | −0.4 to −0.7 | Conditions marginal; results require qualification |
| Critical | −0.8 to −1.0 | Conditions unsuitable; HC2 evaluation triggered |

The distinction between Advisory and Caution carries Physical Evidence implications: Advisory conditions produce a note in the ENVIRONMENTAL export; Caution conditions add an explicit qualification flag; Critical conditions trigger a Hard Constraint evaluation and may block classification of results without additional correction.

### 6.2 Normalized State Mapping

Raw atmospheric measurements are mapped to normalized node states. The mapping is monotone within each node's physical domain and reflects the relationship between the raw value and observation suitability — not absolute physical quantity.

**Representative mappings:**

```
Surface Temperature → TH1
  T < −10°C or T > 40°C       → −0.8 to −1.0   (extreme, safety concern)
  −10 ≤ T < 0 or 35 < T ≤ 40 → −0.3 to −0.8   (marginal)
  0 ≤ T < 5 or 25 < T ≤ 35   → −0.3 to 0.0    (acceptable)
  5 ≤ T ≤ 25                  → 0.0 to +1.0    (optimal range)

Temperature Gradient → TH3
  Strong positive gradient (inversion > +3°C/100m)  → −0.8 to −1.0
  Moderate positive gradient (+1 to +3°C/100m)      → −0.4 to −0.8
  Weak positive gradient (0 to +1°C/100m)           → −0.3 to −0.4
  Near-neutral (±0.5°C/100m of standard lapse)      → 0.0 to +0.3
  Standard to super-adiabatic lapse                 → +0.3 to +1.0

Refraction Coefficient → OP5
  k > 0.25 (strong super-refraction / ducting)      → −0.8 to −1.0
  0.18 < k ≤ 0.25 (elevated refraction)             → −0.4 to −0.8
  0.13 < k ≤ 0.18 (above-standard refraction)       → −0.3 to 0.0
  0.08 ≤ k ≤ 0.13 (standard range)                  → 0.0 to +1.0
  k < 0.08 (sub-refraction)                         → −0.4 to −0.8

Temperature Inversion Persistence → TS3
  Persistent > 6 hours, deep                        → −0.8 to −1.0
  Active 2–6 hours                                  → −0.4 to −0.8
  Recent < 2 hours or shallow                       → −0.3 to −0.4
  No inversion, conditions stable                   → 0.0 to +1.0
```

### 6.3 Primitive State Aggregation

Each primitive aggregates its constituent nodes using a weighted mean that emphasizes the most observation-critical nodes:

```
ThermodynamicFlow = w_TH3 · TH3 + w_TH6 · TH6 + w_TH10 · TH10 + (equal weights for remaining nodes)
OpticalPropagationFlow = w_OP10 · OP10 + w_OP5 · OP5 + w_OP7 · OP7 + (equal weights for remaining)
DynamicFlow = w_DY12 · DY12 + w_DY1 · DY1 + w_DY8 · DY8 + (equal weights for remaining)
TemporalStabilityFlow = w_TS10 · TS10 + w_TS3 · TS3 + w_TS9 · TS9 + (equal weights for remaining)
```

Critical-node weights are set at 3× the base weight, with normalization to maintain the −1.0 to +1.0 output range.

---

## 7. The Deterministic State Engine

### 7.1 Inputs and Outputs

**Inputs:**
- Raw atmospheric data from API sources (NOAA, OpenWeatherMap, ERA5, local weather service)
- Local instrument readings when available (portable barometer, thermometer, anemometer)
- Observation geometry parameters: baseline distance, observer elevation, target elevation
- Observation type: general, long-baseline optical, photographic evidence, celestial, other

**Outputs:**
- Primitive state vector P
- Node state ring R
- Active mode (Section 11)
- Observation suitability assessment — overall and observation-type-specific
- Three ordered recommendations
- Hard constraint status (Section 12)
- Physical Evidence ENVIRONMENTAL export (Section 8)
- Observatory contribution record (Section 9)
- Session summary for the current observation window

### 7.2 The Six State Engine Rules

**Rule 1 — Thermodynamic First**
Thermodynamic state is evaluated before Optical Propagation state. Optical propagation estimates derived from thermodynamic measurements can only be as good as those measurements. If TH node confidence is degraded (source gaps, stale data, estimated values), OP node estimates are flagged with reduced confidence.

**Rule 2 — Optical Propagation Overrides Apparent Conditions**
If OP5 (Refraction Coefficient) or OP7 (Ducting State) is in caution or critical territory, the organism output must include an explicit propagation qualification regardless of other node states. A clear, calm day with an active temperature inversion may appear ideal for observation while being the worst possible condition for reliable long-baseline optical interpretation.

**Rule 3 — Dynamic Rate Weighting**
Dynamic Flow deterioration is time-weighted more aggressively than Thermodynamic or Temporal Stability deterioration. A DY state that has moved from +0.5 to −0.3 in 15 minutes triggers a higher-urgency advisory than a TH state that has made the same movement over 3 hours.

**Rule 4 — Inversion History Required for Optical Conclusions**
Any observation that involves long-baseline optics must have TS3 (Temperature Inversion Persistence) populated. If TS3 is unknown because the session started without inversion history, the Physical Evidence export must flag the inversion history as `NOT ESTABLISHED — SESSION START` and classify the ENVIRONMENTAL section as `PARTIALLY DOCUMENTED`.

**Rule 5 — Contradiction Detection**
The state engine checks for contradictions between primitive states. A positive TH state (stable thermodynamics) combined with a negative DY state (turbulent dynamics) is not a contradiction — these can co-exist. A positive OP state (good optical propagation) combined with a critical TS3 (persistent deep inversion) is a contradiction — strong inversions degrade optical propagation; if OP appears positive under those conditions, the OP data sources must be flagged for review.

**Rule 6 — Estimation Visibility**
Any node whose value is derived from an API estimate, a remote station, or an extrapolation rather than a local direct measurement must be tagged `source: estimated`. The Physical Evidence export and Observatory contribution record must carry this tag. The observation suitability assessment must note the proportion of estimated versus measured nodes.

---

## 8. Physical Evidence Export

### 8.1 Purpose

The Physical Evidence export is a structured, schema-compatible document that populates the mandatory ENVIRONMENTAL section of a Truth Physical Evidence case file. It is produced at the conclusion of an observation session or on demand during the session.

The export resolves the most common cause of `INCOMPLETE` and `INCONCLUSIVE — ENVIRONMENTAL CONTROLS MISSING` status in Physical Evidence case files by providing a machine-generated, source-attributed, timestamped record of atmospheric conditions at the time and location of the observation.

### 8.2 Export Schema

```yaml
ATMOSCORE_ENVIRONMENTAL_EXPORT:
  session_id:           Unique session identifier
  organism_version:     AtmosCore version used
  session_start:        ISO 8601 timestamp
  session_end:          ISO 8601 timestamp
  location:
    latitude:           GPS latitude to 6 decimal places
    longitude:          GPS longitude to 6 decimal places
    elevation_m:        Elevation above mean sea level in metres
  observation_geometry:
    baseline_distance_m: Stated baseline distance in metres
    observer_height_m:   Observer elevation above surface
    target_height_m:     Target elevation above surface
    geometry_compatibility: OP9 normalized value and status

  ENVIRONMENTAL:
    AIR_TEMP_C:
      surface_2m:       TH1 raw value in °C
      elevated_estimate: Estimated from TH3 gradient, or null if unavailable
      source:           Station ID, API name, or "local_instrument"
      confidence:       "measured" | "estimated" | "extrapolated"
    PRESSURE_HPA:
      value:            TH2 raw value in hPa
      trend:            TS1 pressure trend in hPa/3hr
      source:           Data source
      confidence:       "measured" | "estimated"
    HUMIDITY_PCT:
      value:            TH4 raw value in %
      dew_point_margin_c: TH5 raw value in °C
      source:           Data source
      confidence:       "measured" | "estimated"
    WIND_MS:
      speed:            DY1 raw value in m/s
      direction_deg:    Wind direction in degrees
      coherence:        DY2 status — "steady" | "variable" | "gusty"
      source:           Data source
      confidence:       "measured" | "estimated"
    TEMP_GRADIENT:
      value_c_per_100m: TH3 raw value
      direction:        "normal_lapse" | "near_neutral" | "inversion"
      confidence:       "measured" | "estimated_from_surface"
    INVERSION:
      present:          boolean — TS3 > advisory threshold
      depth_m:          Estimated depth of inversion layer, or null
      duration_hrs:     TS3 raw persistence value in hours
      source:           How inversion state was determined
    REFRACTION:
      estimated_k:      OP5 raw refraction coefficient estimate
      standard_k:       0.13 (reference)
      deviation:        Signed deviation from standard
      confidence:       "calculated" | "estimated" | "not_calculated"
    DUCTING_STATE:
      present:          OP7 status — boolean
      strength:         "none" | "weak" | "moderate" | "strong"
      confidence:       OP7 source and confidence
    OPTICAL_PROPAGATION:
      quality_score:    OP10 normalized value
      status:           "reliable" | "qualified" | "unreliable"
      qualification:    Text description of any qualification required
    REFRACTION_CORRECTION_APPLIED: boolean
    ATMOSPHERIC_STABILITY:
      index:            TH10 normalized value
      status:           "stable" | "transitional" | "unstable"
    INVERSION_HISTORY:
      status:           "documented" | "not_established_session_start" | "none"
      notes:            Free text for inversion history documentation
    OBSERVATION_SUITABILITY:
      overall:          P aggregate — "suitable" | "qualified" | "unsuitable"
      optical_specific: OP10 — "reliable" | "qualified" | "unreliable"
      hard_constraints: List of any active HC flags
    DATA_SOURCES:
      list:             Array of {source_name, type, retrieval_timestamp, station_id}
    EXPORT_GENERATED:   ISO 8601 timestamp
    PARTIALLY_DOCUMENTED: boolean — true if any required field is estimated or missing
    MISSING_FIELDS:     Array of field names that could not be populated
```

### 8.3 Integration with Physical Evidence Case Files

A researcher using AtmosCore in the field copies or imports the ENVIRONMENTAL export directly into their Physical Evidence case file. The export is designed so that every field maps one-to-one to a required ENVIRONMENTAL field in the Physical Evidence schema. Fields that AtmosCore cannot populate from available data sources are explicitly listed in MISSING_FIELDS rather than silently omitted.

If any field in the export carries `confidence: "estimated"` or `confidence: "extrapolated"`, the case file ENVIRONMENTAL section must be marked `PARTIALLY DOCUMENTED` and the qualification must be carried through to the STATUS_RATIONALE.

---

## 9. Observatory Integration

### 9.1 Purpose

An AtmosCore field session at a specific location and time constitutes a primary atmospheric measurement. Where fixed weather station networks are sparse or where the observation location is not co-located with a station, the AtmosCore session record provides ground-truth data that extends the Truth Observatory atmospheric layer's spatial coverage.

### 9.2 Contribution Record Schema

```yaml
ATMOSCORE_OBSERVATORY_CONTRIBUTION:
  record_type:          "PRIMARY_MEASUREMENT"
  source_class:         "PRIMARY_MEASUREMENT"
  organism_id:          "atmoscore"
  organism_version:     AtmosCore version
  session_id:           Unique session identifier
  location:
    latitude:
    longitude:
    elevation_m:
    location_description: Human-readable name
  session_start:        ISO 8601
  session_end:          ISO 8601
  measurements:
    surface_temp_c:     TH1 raw values with timestamps
    pressure_hpa:       TH2 raw values with timestamps
    humidity_pct:       TH4 raw values with timestamps
    wind_speed_ms:      DY1 raw values with timestamps
    wind_direction_deg: Raw values with timestamps
    visibility_m:       OP1 raw values with timestamps
    inversion_present:  TS3 boolean values with timestamps
    refraction_k:       OP5 raw values with timestamps
  data_sources:         Array of source attributions with retrieval timestamps
  node_states:          Full 42-node R vector snapshots at key session intervals
  primitive_states:     Full 4-element P vector snapshots
  raw_payloads:         SHA-256 hashes of API response payloads
  observer_notes:       Optional free-text field observations
  upload_timestamp:     ISO 8601
```

---

## 10. Visual Geometry — 2D and 3D Representation

### 10.1 Geometry Purpose

AtmosCore's visual geometry serves two distinct functions: it provides the researcher with an immediate visual read of atmospheric state at a glance, and it produces a geometry-compatible record that can be embedded in a Physical Evidence case file or Observatory record as a visual documentation artifact.

The geometry follows the Lume standard 4/42 polar coordinate ring with the AtmosCore-specific color palette and node arrangement.

### 10.2 Color Palette

AtmosCore's color identity reflects atmospheric phenomena:

| Element | Color | Hex |
|---|---|---|
| Primary / Thermodynamic | Deep cerulean | `#1E6FA8` |
| Secondary / Optical | Amber-gold | `#D4A017` |
| Tertiary / Dynamic | Slate | `#5A7A8A` |
| Quaternary / Temporal | Deep violet | `#4A3060` |
| Optimal state | Clear sky blue | `#87CEEB` |
| Advisory state | Haze amber | `#D4A017` |
| Caution state | Storm orange | `#D4601A` |
| Critical state | Deep crimson | `#8B1A1A` |

### 10.3 The 4/42 Core and Ring

The 2D representation follows the Lume standard:

```
Ring outer band:    42 nodes arranged in four arcs, counter-clockwise
                    TH1–TH10  (Thermodynamic, cerulean arc)
                    OP1–OP10  (Optical, amber-gold arc)
                    DY1–DY12  (Dynamic, slate arc)
                    TS1–TS10  (Temporal, violet arc)

Core quadrant:      Four quadrants, one per primitive
                    Size of each quadrant scales with primitive aggregate value
                    Color encodes primitive status

Node encoding:      Each node appears as a radial bar
                    Bar length = absolute value of normalized state
                    Bar color = status band (optimal/advisory/caution/critical)
                    Negative states invert to point inward (toward center)
```

### 10.4 Observation Suitability Overlay

AtmosCore's geometry includes a non-standard overlay not present in other Lume organisms: an observation suitability ring. This is a secondary ring outside the main 42-node ring that shows the composite observation suitability for the active observation type at each node position. Nodes whose current state is the binding constraint on observation suitability are highlighted with a white boundary marker.

### 10.5 3D Representation

The 3D representation follows the standard Lume extrusion model. The time stack extrudes the 2D ring along the vertical axis, showing the evolution of all 42 node states over the current observation session. This is particularly useful for TS3 (Temperature Inversion Persistence), which is most legible as a time-extended visualization.

---

## 11. Runtime Behavior and Operating Modes

### 11.1 Core Runtime Loop

```
Every 60 seconds (nominal cadence):
1. Fetch updated atmospheric data from configured sources
2. Check for local instrument overrides
3. Normalize all raw values to node states
4. Compute primitive aggregates
5. Run contradiction detection
6. Evaluate hard constraints
7. Determine active mode
8. Generate ranked recommendations
9. Update observation suitability assessment
10. Update session record and export buffers
11. Push ring visualization update
12. Check for Observatory contribution trigger
```

The 60-second cadence is adjustable. For rapidly changing dynamic conditions (approaching storms, frontal passage), the organism can increase to a 15-second cadence. For stable, settled sessions, it can reduce to a 5-minute cadence to preserve battery and data budget on mobile devices.

### 11.2 Operating Modes

| Mode | Trigger | Meaning |
|---|---|---|
| `SETTLED` | All primitives optimal or advisory | Conditions favorable; observation proceeding normally |
| `MONITORING` | One primitive in caution territory | Conditions acceptable with attention; specific node flagged |
| `QUALIFIED` | Optical Propagation in caution | Observation results require explicit qualification; refraction deviation active |
| `TRANSITIONAL` | Dynamic or Temporal Stability deteriorating | Conditions changing; duration of window uncertain |
| `MARGINAL` | Two or more primitives in caution | Conditions marginal for the current observation type |
| `CONSTRAINED` | HC2 evaluation triggered | HC2 active — long-baseline optical results unreliable; must be documented |
| `SAFETY_ALERT` | HC1 triggered | Observer safety concern active; supersedes all other mode considerations |
| `DEGRADED` | Data sources insufficient | Organism operating on estimated data; confidence reduced throughout |

---

## 12. Hard Constraint Enforcement

### 12.1 HC1 — Observer Safety

**Trigger conditions:**
- Wind speed > 25 m/s (sustained) or > 35 m/s (gust)
- Lightning risk elevated within 20 km (storm proximity)
- Air temperature < −25°C or > 50°C
- Precipitation of any kind combined with electrical hazard indicators
- Visibility < 50 meters

**Effect:** Mode shifts to `SAFETY_ALERT` immediately. All observation suitability outputs are suspended. The instrument displays only the safety alert and the specific triggering condition. The alert cannot be dismissed without acknowledging the condition and noting a manual override with timestamp.

**Physical Evidence effect:** Any session interval during which HC1 was active is marked `OBSERVER SAFETY CONSTRAINT ACTIVE — DATA FROM THIS INTERVAL FLAGGED` in the Physical Evidence export.

### 12.2 HC2 — Optical Propagation Validity

**Trigger conditions:**
- OP5 (Refraction Coefficient) > 0.25 or < 0.07
- OP7 (Atmospheric Ducting State) = strong
- TS3 (Temperature Inversion Persistence) > 4 hours AND depth > 50 m
- OP10 (Long-Baseline Propagation Quality) in critical territory
- Active super-refraction event identified

**Effect:** Mode shifts to `CONSTRAINED`. The observation suitability for long-baseline optical work is set to `UNRELIABLE — HC2 ACTIVE`. Recommendations are generated for documenting the propagation anomaly rather than conducting the primary observation. The constraint is noted in the Physical Evidence export and must appear in any case file STATUS_RATIONALE that references observations made during this interval.

**Physical Evidence effect:** The OPTICAL_PROPAGATION field in the export is set to `status: "unreliable"` and the qualification is set to the specific triggering condition. The case file may not advance beyond `INCOMPLETE` or `INCONCLUSIVE — REFRACTION` status for any long-baseline optical result from this interval without additional refraction correction data.

### 12.3 HC3 — Data Provenance

**Trigger conditions:**
- Any node is populated with a value that cannot be attributed to a named source with a retrieval timestamp
- Any OP-primitive node is computed from a TH estimate rather than a TH measurement, without being tagged as estimated
- The Physical Evidence export attempts to mark any `confidence: "estimated"` field as `confidence: "measured"`

**Effect:** The export or output is blocked and an error is surfaced. The organism does not produce a Physical Evidence export that misrepresents estimation as measurement. The researcher is shown which fields require either a local instrument reading, a closer station source, or explicit `confidence: "estimated"` tagging before the export is generated.

---

## 13. Cross-Organism Coupling

### 13.1 AtmosCore → Verdara Ultra

Verdara Ultra's Weather Flow primitive (W1–W10) is a weather-for-navigation assessment. In deployments where both organisms are active, AtmosCore's primitive state vector P should be used as the primary source for Verdara Ultra's Weather Flow aggregate, with Verdara's W nodes mapping to AtmosCore nodes as follows:

| Verdara Ultra Node | AtmosCore Source |
|---|---|
| W1 Temperature | TH1 |
| W2 Wind Speed | DY1 |
| W3 Wind Direction | DY2 (coherence) |
| W4 Precipitation | DY8 |
| W5 Storm Proximity | DY7 |
| W6 Storm Proximity | DY7 |
| W7 Lightning Risk | DY6 (CAPE), DY9 |
| W8 Thermal Load | TH1, TH7 |
| W9 Weather Volatility | TS9 (trend coherence) |
| W10 Safe Weather Window | TS2, TS10 |

When AtmosCore is active, Verdara Ultra's Weather Flow primitive is computed from this coupling table rather than from independent API calls.

### 13.2 AtmosCore → BioCore

Atmospheric conditions affect human physiological state. The coupling surface connects AtmosCore thermodynamic and dynamic nodes to BioCore external-load nodes:

| BioCore Node | AtmosCore Source |
|---|---|
| External thermal load | TH1 (temperature), TH4 (humidity) — heat index calculation |
| Cold stress | TH1, DY1 — wind chill calculation |
| UV stress | TH9 — solar irradiance proxy |
| Air quality respiratory load | OP2 (aerosol/particulate) |
| Barometric pressure effect | TH2, TS1 (pressure trend) |

BioCore coupling is read-only from AtmosCore's perspective — AtmosCore provides context; it does not modify BioCore state directly.

### 13.3 AtmosCore → Truth Observatory

AtmosCore field sessions are Observatory contributions. The coupling is write-once: each completed session produces a contribution record (Section 9) that is submitted to the Observatory atmospheric layer as a primary measurement. The Observatory does not write back to AtmosCore.

---

## 14. Implementation Considerations

### 14.1 Data Sources

**Primary API sources (free or low-cost):**
- OpenWeatherMap API — surface temperature, pressure, humidity, wind, visibility
- NOAA NWS API — US locations; hourly observations and forecast discussion
- Open-Meteo API — ERA5-based reanalysis data, no API key required
- Windy API or equivalent — wind, pressure, temperature at multiple altitudes

**Specialized sources:**
- NOAA SPC — CAPE and convective outlook data
- AirNow API — PM2.5 and PM10 air quality data
- NASA POWER API — solar irradiance data
- Aerosol Optical Depth — MODIS/VIIRS near-real-time products

**Local instrument integration:**
- Bluetooth-connected portable weather stations (Davis Leaf & Soil, Kestrel 5500 series)
- USB barometers and thermometers
- Manual entry override for any node value from any instrument

**Data gap handling:**
Every node must have a defined behavior when its data source is unavailable. Nodes fall back to: (1) local instrument reading, (2) nearest available station within 50 km, (3) reanalysis estimate, (4) `null` with `confidence: "not_available"`. A `null` node contributes zero to the primitive aggregate and is counted in the DEGRADED-mode threshold calculation.

### 14.2 Mobile Application Architecture

AtmosCore's natural form is a mobile application for field use. Key architectural requirements:

- **GPS integration:** Automatic location detection for API query targeting and Physical Evidence export geo-tagging.
- **Background refresh:** The 60-second cadence must continue when the app is backgrounded, accumulating session data for the Physical Evidence export.
- **Offline resilience:** The last known node state should be preserved and marked `stale` when connectivity is lost. The organism operates in DEGRADED mode until connectivity is restored.
- **Export mechanics:** The Physical Evidence ENVIRONMENTAL export should be copyable as YAML or JSON for direct paste into a case file, and should be shareable as a file or QR code for field documentation.
- **Battery management:** The cadence should automatically reduce when battery is below 20% and the user is not actively viewing the ring visualization.
- **Instrument pairing:** Bluetooth pairing with supported weather instruments must override the corresponding API node values.

### 14.3 Web Application

A companion web application serves as an observation planning tool. Given a proposed observation date, time, location, and geometry, it provides:

- Historical atmospheric climatology for the location and season
- Forecast-driven prediction of AtmosCore node states for the observation window
- An OP5 and TS3 prediction for the proposed observation date
- A recommended time-of-day window for the lowest inversion risk and most stable optical propagation conditions

The web application does not replace the mobile field instrument — forecast data is not a substitute for real-time node state during an active observation session.

### 14.4 Data Retention and Session Storage

Field sessions should be retained locally for at least 30 days. The user may upload completed sessions to the Truth Observatory atmospheric layer at any time. Sessions contain no personally identifiable information beyond the GPS location — which is required for the Physical Evidence export and Observatory contribution record.

---

## 15. Evaluation Framework

### 15.1 Phase 1 — Simulation Validation

Validate the normalized state mapping against historical atmospheric datasets with known optical propagation outcomes. Specifically:

- Apply AtmosCore's OP5 and OP10 node mappings to historical radiosonde datasets from locations where documented long-baseline optical observations were made.
- Verify that the organism's refraction coefficient estimates are within acceptable tolerance of the values computed from the full vertical temperature profile.
- Verify that HC2 would have triggered on historical inversion events associated with documented optical anomalies.

**Success criteria:** HC2 triggers on ≥ 80% of historical super-refraction events in the validation dataset. OP5 estimates are within ± 20% of radiosonde-derived k values for standard atmosphere conditions.

### 15.2 Phase 2 — Controlled Field Testing

Deploy AtmosCore alongside calibrated portable weather instruments and a local radiosonde launch at three geographically distinct observation sites over a period of 30 days.

- Compare AtmosCore node values with instrument ground truth.
- Evaluate the Physical Evidence export against a manually completed ENVIRONMENTAL section prepared by an independent observer.
- Assess whether HC2 activates appropriately under artificially induced inversion conditions (cold-air pooling, coastal fog).
- Evaluate the observation suitability assessment against the judgment of an experienced meteorologist reviewing the same conditions.

**Success criteria:** AtmosCore ENVIRONMENTAL export matches manual expert assessment for the inversion, refraction, and optical propagation fields in ≥ 85% of sessions. No false-negative HC2 failures in sessions where an experienced meteorologist would classify conditions as unreliable for long-baseline optical observation.

### 15.3 Phase 3 — Field Integration

Integrate AtmosCore with the Truth Physical Evidence case file system. Apply it to the two initial case files (PE-2026-001 Great Salt Lake laser and PE-2026-002 Chicago skyline visibility) by obtaining historical atmospheric data for the known observation dates and locations.

- Determine whether the atmospheric conditions at the time of each experiment were within the standard refraction range.
- Produce a retroactive ENVIRONMENTAL export for each case file.
- Document any conditions that would have triggered HC2 during either experiment.
- Assess whether the case file status can be advanced from `INCOMPLETE` based on the retroactive atmospheric record.

**Success criteria:** Both case files receive a populated ENVIRONMENTAL section. The TS3 (inversion persistence) field is either populated from historical data or explicitly marked `NOT ESTABLISHED — RETROACTIVE RECONSTRUCTION` with appropriate confidence levels.

---

## Appendix A — Complete Node Definitions and Threshold Table

| Node ID | Name | Primitive | Optimal | Advisory | Caution | Critical | Notes |
|---|---|---|---|---|---|---|---|
| TH1 | Surface Temperature | Thermodynamic | 5–25°C | 0–5, 25–35°C | < 0, 35–40°C | < −10, > 40°C | |
| TH2 | Surface Pressure | Thermodynamic | 1013 ± 15 hPa | ± 15–30 hPa | ± 30–50 hPa | > ± 50 hPa | |
| TH3 | Temperature Gradient | Thermodynamic | Normal lapse | Weakened lapse | Near-neutral | Inversion | Critical node |
| TH4 | Relative Humidity | Thermodynamic | 30–70% | 70–85% | 85–95% | > 95% | |
| TH5 | Dew Point Margin | Thermodynamic | > 5°C | 3–5°C | 1–3°C | < 1°C | |
| TH6 | Atmospheric Lapse Rate | Thermodynamic | DALR ± 20% | DALR ± 40% | Sub-adiabatic | Inversion/super-adiabatic | Critical node |
| TH7 | Water Vapor Pressure | Thermodynamic | < 1.5 kPa | 1.5–2.5 kPa | 2.5–3.5 kPa | > 3.5 kPa | |
| TH8 | Atmospheric Density | Thermodynamic | Standard range | ± 2% | ± 4% | > ± 4% | |
| TH9 | Thermal Plume Activity | Thermodynamic | Low | Moderate | Active | Very active | |
| TH10 | Atmospheric Stability Index | Thermodynamic | Stable | Weakly stable | Neutral | Unstable/inverted | Composite |
| OP1 | Visibility Distance | Optical | > 20 km | 10–20 km | 2–10 km | < 2 km | |
| OP2 | Aerosol/Particulate Load | Optical | PM2.5 < 12 | 12–35 | 35–55 | > 55 | µg/m³ |
| OP3 | Atmospheric Scattering | Optical | Negligible | Low | Moderate | High | |
| OP4 | Refractive Index | Optical | Near standard | Slight deviation | Moderate deviation | Large deviation | |
| OP5 | Refraction Coefficient k | Optical | 0.08–0.13 | 0.13–0.18 | 0.18–0.25 | < 0.07 or > 0.25 | Novel node; HC2 at critical |
| OP6 | Thermal Shimmer Index | Optical | Very low | Low | Moderate | High | Cn² estimate |
| OP7 | Atmospheric Ducting | Optical | None | Possible | Probable | Active | HC2 at active |
| OP8 | Sub-Refraction Risk | Optical | Low | Moderate | High | Active | |
| OP9 | Geometry Compatibility | Optical | Compatible | Marginal | Incompatible | — | Input-dependent |
| OP10 | Long-Baseline Propagation | Optical | Reliable | Qualified | Marginal | Unreliable | Novel node; primary optical output |
| DY1 | Wind Speed | Dynamic | < 5 m/s | 5–10 m/s | 10–15 m/s | > 15 m/s or > 25 m/s HC1 |  |
| DY2 | Wind Direction Coherence | Dynamic | Steady | Variable | Gusty | Chaotic | |
| DY3 | Wind Shear | Dynamic | Negligible | Low | Moderate | High | |
| DY4 | Boundary Layer Height | Dynamic | 500–1500 m | 1500–2500 m | 2500–4000 m | < 100 or > 4000 m | |
| DY5 | Surface Turbulence | Dynamic | Low | Moderate | High | Severe | |
| DY6 | CAPE | Dynamic | < 500 J/kg | 500–1000 | 1000–2000 | > 2000 | |
| DY7 | Frontal Proximity | Dynamic | > 500 km | 200–500 km | 50–200 km | < 50 km | |
| DY8 | Precipitation State | Dynamic | None | Light | Moderate | Heavy | Hard constraint context |
| DY9 | Squall/Gust Probability | Dynamic | < 10% | 10–30% | 30–50% | > 50% | |
| DY10 | Jet Stream Influence | Dynamic | Absent | Indirect | Moderate | Direct | |
| DY11 | Sea/Land Breeze State | Dynamic | Negligible | Active | Strong | — | Location-dependent |
| DY12 | Dynamic Flow Coherence | Dynamic | High | Moderate | Low | Very low | Composite |
| TS1 | Pressure Trend | Temporal | Stable | Slow change | Moderate change | Rapid change | hPa/3hr |
| TS2 | Pressure System Stage | Temporal | Mature/stable | Developing/dissipating | Transitional | Rapid transition | |
| TS3 | Inversion Persistence | Temporal | None active | < 1 hour | 1–4 hours | > 4 hours and deep | Novel node; HC2 component |
| TS4 | Session Window Quality | Temporal | Consistently optimal | Mostly optimal | Variable | Mostly marginal | |
| TS5 | Seasonal Suitability | Temporal | High | Moderate | Low | Very low | |
| TS6 | Diurnal Phase | Temporal | Pre-dawn/evening | Morning/night | Afternoon | Peak heating | |
| TS7 | Solar Heating Accum. | Temporal | Low | Moderate | High | Very high | |
| TS8 | Anomaly Index | Temporal | Near-normal | Slightly anomalous | Anomalous | Highly anomalous | |
| TS9 | Trend Coherence | Temporal | Coherent | Mostly coherent | Mixed | Incoherent | |
| TS10 | Stability Lifecycle Score | Temporal | Settled | Mostly settled | Transitional | Volatile | Composite |

---

## Appendix B — Normalized State Mapping

Full normalization functions for all 42 nodes follow the monotone mapping convention established in the Lume normalization standard (Lume Engine Spec, 2026). Each function maps raw physical units to the [−1.0, +1.0] normalized state space with the observation-suitability-centric interpretation defined in Section 6.2.

---

## Appendix C — State Engine Decision Logic

The six state engine rules (Section 7.2) are implemented as ordered evaluations against the full 42-node R vector and the 4-element P vector. The decision tree proceeds: (1) data confidence check → (2) HC1 evaluation → (3) HC2 evaluation → (4) contradiction detection → (5) mode selection → (6) recommendation generation → (7) export preparation.

---

## Appendix D — Physical Evidence ENVIRONMENTAL Export Schema

See Section 8.2 for the complete YAML export schema. The schema is versioned alongside the AtmosCore organism version. A PHYSICAL_EVIDENCE.md case file that imports an AtmosCore export must record the AtmosCore version used to produce the export in its SOURCE record.

---

## Appendix E — Observatory Contribution Record Schema

See Section 9.2 for the complete YAML contribution record schema. Observatory contributions are submitted to the Truth Observatory atmospheric layer endpoint and stored as PRIMARY_MEASUREMENT source-class records with the AtmosCore session ID as the artifact identifier.

---

## References

1. Bean, B. R., & Dutton, E. J. (1966). *Radio Meteorology.* National Bureau of Standards Monograph 92. U.S. Government Printing Office.

2. Hirt, C., Filfeld, S., & Seeber, G. (2010). Comparison of GPS and terrestrially determined ellipsoidal heights over the SRTM era. *Journal of Geodesy,* 84(2), 105–117.

3. Rüeger, J. M. (2006). Refractive Index Formulae for Electronic Distance Measurement with Radio and Millimetre Waves. *Unisurv Report S-68,* University of New South Wales.

4. Ciddor, P. E. (1996). Refractive index of air: new equations for the visible and near infrared. *Applied Optics,* 35(9), 1566–1573.

5. Andrews, J. (2026). The Lume Organism Stack — Architecture Vol. I. DarkWave Studios LLC. Canon³ Paper Series.

6. Andrews, J. (2026). Organism Coupling: LIOCP — Architecture Vol. II. DarkWave Studios LLC. Canon³ Paper Series.

7. Andrews, J. (2026). The Lume 4/42 Formal Mathematics — Architecture Vol. III. DarkWave Studios LLC. Canon³ Paper Series.

8. Andrews, J. (2026). Verdara Ultra: A Four-Primitive Deterministic Outdoor Flow Organism. DarkWave Studios LLC. Canon² Paper Series.

9. Andrews, J. (2026). HydroCore: A Four-Primitive Deterministic Hydrological Flow Organism. DarkWave Studios LLC. Canon² Paper Series.

10. Andrews, J. (2026). Physical Evidence — Truth Project Documentation Standard. DarkWave Studios LLC. Truth Project Repository.

11. Andrews, J. (2026). Observatory — Truth Project Atmospheric Collection Framework. DarkWave Studios LLC. Truth Project Repository.

12. Lume Language Specification — DOI: 10.5281/zenodo.19382282

13. Trust Layer Ecosystem — DOI: 10.5281/zenodo.19560674
