# BioCore: A Four-Primitive Deterministic Biological Flow Organism for Human Health, Wellness, Recovery, and Internal Equilibrium Governance

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
- Trust Layer Ledger (TLL) Ecosystem — DOI: 10.5281/zenodo.19560674
- DAIGS Framework — DOI: 10.5281/zenodo.19491784
- Lume-V Verification Suite — DOI: 10.5281/zenodo.19645097
- Lume-X Multi-Agent Cognition — DOI: 10.5281/zenodo.19443968
- Deterministic Dissolution — DOI: 10.5281/zenodo.15065493

**Companion Papers:**
- Andrews, J. (2026). Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture. DarkWave Studios LLC. Canon² Paper Series.
- Andrews, J. (2026). Meridian as Synthetic Organism. DarkWave Studios LLC. Canon² Paper Series.
- Andrews, J. (2026). Verdara Ultra: A Four-Primitive Deterministic Outdoor Flow Organism. DarkWave Studios LLC. Canon² Paper Series.
- Andrews, J. (2026). HydroCore: A Four-Primitive Deterministic Hydrological Flow Organism. DarkWave Studios LLC. Canon² Paper Series.

**Target Container:** VedaSolus.io

> *This preprint has not undergone peer review.*

*© 2026 DarkWave Studios LLC. All rights reserved.*

---

## Abstract

We present BioCore, a Lume-native deterministic biological flow organism for human health, wellness, recovery, and internal equilibrium governance. BioCore implements the Lume 4/42 organism architecture — four irreducible flow primitives governing forty-two operational nodes — in the domain of the human biological system. The four primitives are Metabolic Flow, Circulatory Flow, Neurological Flow, and Stress/Thermal Flow. The forty-two nodes encode the complete internal state space of the human organism from basal energy level and glucose stability through heart rate variability, sleep quality, autonomic balance, burnout risk, and global resilience index.

BioCore ingests biological signals from wearable devices, self-report data, clinical measurements, and contextual inputs, maintains a stable internal state of bio equilibrium, and outputs deterministic guidance, warnings, recovery recommendations, and long-term trend insights for health, wellness, and resilience across time. Unlike conventional health and wellness platforms that aggregate biometric data into readiness scores or wellness percentages, BioCore governs biological flow as a continuous organism: it enforces hard constraint rules that suppress performance-pushing recommendations when any node crosses a critical threshold, operates in four distinct mode states (Recovery, Performance, Stabilization, Healing), and evaluates trend patterns rather than isolated daily readings before escalating or modifying guidance.

BioCore is the first Lume organism specification to govern an internal biological domain rather than an external physical environment. Its design deliberately bridges Eastern, Western, and traditional Indian wellness frameworks within a single deterministic structure — acknowledging that different traditions have identified different dimensions of human biological flow, all of which are real and governable, without privileging any single clinical or cultural paradigm. BioCore does not replace clinical medicine. It provides the continuous, deterministic governance layer that clinical medicine cannot practically deliver between appointments.

The canonical implementation container for BioCore is VedaSolus.io, a health and wellness application that provides the input channels (wearables, self-report, ritual practices) and output surfaces (daily guidance, ritual recommendations, trend visualizations, recovery plans) through which BioCore interacts with the practitioner.

**Keywords:** deterministic biological governance, Lume synthetic organism, human biological flow, health equilibrium, recovery governance, 4/42 organism architecture, biometric integration, VedaSolus, wellness technology, burnout prevention, autonomic balance

---

## Table of Contents

1. Introduction
2. Background and Related Work
3. System Overview — The BioCore Organism
4. The Four BioCore Primitives
5. The 42-Node Bio State Ring
6. Node Threshold Architecture
7. The Deterministic Guidance Engine
8. Operating Modes
9. The VedaSolus Integration Model
10. Global Invariant Enforcement
11. Implementation Considerations
12. Evaluation Framework
- Appendix A — Complete Node Definitions and Threshold Table
- Appendix B — Normalized State Mapping
- Appendix C — Guidance Decision Logic
- Appendix D — VedaSolus Data Flow Specification
- References

---

## 1. Introduction

### 1.1 The Problem with Health and Wellness Technology Today

The contemporary health and wellness technology landscape is characterized by a paradox: we have more biometric data than at any point in human history, and we have less coherent governance of that data than the scale of collection would suggest. A person wearing a modern fitness tracker may generate continuous heart rate, heart rate variability, sleep stage, skin temperature, respiratory rate, blood oxygen, and activity data — thousands of data points per day — which are then aggregated into a single readiness score, a sleep score, a strain metric. The reduction from a rich continuous biological signal to a scalar number is not synthesis. It is compression. And compression loses the information that matters most: the relationships between signals, the trajectories of change, the interactions between metabolic state and neurological state that determine whether the organism is recovering or declining.

The problem is compounded by the temporal structure of clinical medicine, which is not designed for continuous governance. A physician sees a patient for fifteen to thirty minutes at intervals of months. In that window, they receive a static snapshot of a dynamic system. The continuous biological state — how the nervous system has been coping under chronic stress, whether the metabolic trajectory has been stable or drifting, how recovery debt has been accumulating — is largely invisible except through self-report, which is itself imprecise. This is not a failure of clinical medicine. It is a structural property of the clinical appointment model. Clinical medicine is designed for diagnosis and intervention. It is not designed for continuous flow governance.

The wellness industry has attempted to fill this gap with apps, programs, and coaching platforms. Most of these operate on one of two models: static protocols (eat this, sleep eight hours, meditate daily) that do not respond to the individual's current state, or reactive readout models (your HRV was low today, rest more) that respond to individual data points without maintaining a coherent multi-domain state model. Neither model constitutes governance. Neither maintains a persistent internal model of the person's biological equilibrium across all relevant domains simultaneously. Neither enforces hard constraints that prioritize safety when the organism is in distress.

BioCore is the first deterministic biological flow organism specification designed to address this gap.

### 1.2 The Internal Flow Reframe

Every Lume physical domain organism — Meridian for energy, Verdara Ultra for outdoor environment, HydroCore for water — governs a system of continuous, interacting external physical flows. BioCore applies the same framework to internal biological flows.

The human organism is a flow system. Metabolic flow governs the production and utilization of energy at the cellular and systemic level. Circulatory flow governs the transport of oxygen, nutrients, and signaling molecules throughout the body. Neurological flow governs the nervous system's tone, balance, and processing capacity. Stress/Thermal flow governs the organism's resilience envelope — how much adaptive capacity remains before recovery debt begins compromising function.

These four flows are not independent. Metabolic dysfunction elevates stress/thermal load. Neurological imbalance impairs circulatory recovery. Stress-induced inflammation degrades metabolic flexibility. The organism that optimizes one flow at the expense of the others is not healthy — it is asymmetrically loaded. BioCore governs all four flows simultaneously, seeks equilibrium across them, and never recommends actions that push one primitive at the cost of catastrophic degradation in another.

### 1.3 The BioCore Architecture

BioCore is a 4/42 deterministic biological flow organism. The four primitives are Metabolic Flow, Circulatory Flow, Neurological Flow, and Stress/Thermal Flow. The forty-two nodes encode the full internal biological state space:

- **Metabolic Flow (M1–M10):** Basal energy level, glucose stability, nutrient sufficiency, metabolic flexibility, digestive stability, appetite regulation, weight stability, inflammation load, oxidative stress, metabolic recovery capacity.
- **Circulatory Flow (C1–C10):** Resting heart rate, heart rate variability, blood pressure stability, peripheral circulation, oxygenation, hydration level, electrolyte balance, circulatory load, edema/fluid retention, circulatory recovery capacity.
- **Neurological Flow (N1–N11):** Sleep duration, sleep quality, circadian alignment, cognitive clarity, emotional stability, autonomic balance, anxiety load, depression load, sensory overload, social connection/support, neurological recovery capacity.
- **Stress/Thermal Flow (S1–S11):** Acute stress load, chronic stress load, inflammation spike risk, body temperature stability, overtraining/overexertion risk, burnout risk, immune activation, recovery debt, circadian stress, healing momentum, global resilience index.

### 1.4 Novel Contributions

This work makes seven distinct contributions not present in existing health technology or wellness science literature:

1. **The first formal 4/42 internal biological flow organism specification** — applying the Lume synthetic organism architecture to human health governance with complete node definitions, threshold bands, and cross-domain interaction modeling.

2. **Trend-aware deterministic guidance** — BioCore evaluates short-term and medium-term trends before escalating guidance, distinguishing a single bad day (spike) from a developing pattern (trend) from systemic collapse — each requiring qualitatively different responses.

3. **Hard constraint suppression of performance recommendations** — when any node crosses a critical threshold, BioCore actively suppresses performance-pushing guidance and enforces recovery prioritization. This is the opposite of most fitness platforms, which continue providing performance guidance regardless of physiological state.

4. **Cross-primitive equilibrium governance** — no primitive is optimized at the expense of catastrophic damage to another. BioCore's guidance engine enforces a global balance constraint that conventional performance-focused platforms do not implement.

5. **Mode-based governance architecture** — four operating modes (Recovery, Performance, Stabilization, Healing) selected deterministically based on node patterns, each activating a distinct guidance profile.

6. **Cross-cultural wellness framework integration** — BioCore's node definitions deliberately encompass biomarkers recognized across Eastern, Western, and traditional Indian wellness frameworks, acknowledging that different traditions have identified real dimensions of biological state that are all addressable within the same deterministic structure.

7. **VedaSolus integration architecture** — a formal specification of the input/output contract between the BioCore governance engine and the VedaSolus.io container application.

### 1.5 Scope and Honest Limitations

BioCore does not diagnose disease. It does not replace clinical medicine. It does not provide medical advice. It is a continuous biological flow governance system designed to help practitioners maintain equilibrium, recognize degradation before it becomes dysfunction, and prioritize recovery when the organism is under stress.

All node threshold bands are initial specifications. Thresholds for clinical nodes (heart rate variability, blood pressure, blood oxygen) are grounded in published literature. Thresholds for subjective and proxy nodes (basal energy, emotional stability, social support) are initial heuristics requiring empirical calibration against real populations.

Individual baseline calibration is a design priority: BioCore is designed to treat deviations from an individual's personal baseline as more diagnostically significant than absolute values. A resting heart rate that is normal at population level may be elevated for a specific individual. The system's primary reference is the individual's own history.

### 1.6 Paper Organization

Section 2 reviews related work. Section 3 presents the BioCore system overview. Sections 4 through 6 define the primitives, nodes, and threshold architecture. Section 7 describes the guidance engine. Section 8 describes the four operating modes. Section 9 specifies the VedaSolus integration model. Section 10 defines global invariant enforcement. Sections 11 and 12 address implementation and evaluation.

---

## 2. Background and Related Work

### 2.1 Consumer Health Wearables and Biometric Platforms

The modern health wearable market (Whoop, Oura, Apple Watch, Garmin, Polar, Fitbit) provides continuous physiological monitoring with increasingly sophisticated signal processing. Whoop's recovery score aggregates HRV, resting heart rate, and sleep performance into a single daily readiness metric. Oura's readiness score similarly integrates sleep, activity, and physiological data. These are useful tools. They are single-domain scalar outputs, not multi-domain governance organisms [1, 2].

None of these platforms maintain a persistent multi-domain state model. None enforce hard constraints on recommendations based on multi-primitive state. None distinguish between Performance mode and Recovery mode deterministically based on node patterns. None implement the trend-awareness that distinguishes a spike from a developing collapse.

### 2.2 Health and Wellness Coaching Frameworks

Functional medicine, integrative health, and wellness coaching disciplines share an orientation toward whole-person health that is conceptually aligned with BioCore's multi-domain governance model [3, 4]. In practice, these frameworks are delivered through periodic appointments and protocols, not continuous real-time governance. The practitioner-client relationship provides qualitative guidance at the frequency of the appointment schedule, not at the frequency of biological change.

BioCore is not a replacement for the practitioner-client relationship. It is the continuous governance infrastructure that can make that relationship more effective by providing the practitioner with a rich longitudinal state model rather than a static snapshot.

### 2.3 Traditional Wellness Systems

Ayurveda, Traditional Chinese Medicine (TCM), and other traditional wellness systems have, over centuries of empirical observation, identified dimensions of human biological state that map onto BioCore's node definitions in striking ways. Ayurvedic agni (digestive fire) maps to M5 (Digestive Stability) and M10 (Metabolic Recovery Capacity). TCM's concept of qi flow maps to the aggregate of Metabolic Flow and Circulatory Flow primitives. The TCM Heart-Mind (Shen) concept maps to Neurological Flow nodes N4 (Cognitive Clarity), N5 (Emotional Stability), and N7 (Anxiety Load) [5, 6].

BioCore does not claim clinical equivalence between its nodes and traditional constructs. It acknowledges that these traditions have identified real dimensions of biological experience that are governable and that the 4/42 structure provides a framework within which they can coexist with biomedical measurements without hierarchy.

### 2.4 Lume Physical Flow Organisms

Meridian [Andrews, 2026] established the 4/42 organism architecture in the energy domain. Verdara Ultra [Andrews, 2026] established it in the outdoor environmental domain. HydroCore [Andrews, 2026] established it in the hydrological domain. BioCore is the fourth member of the Lume physical flow organism family, and the first to govern an internal rather than external physical domain.

---

## 3. System Overview — The BioCore Organism

### 3.1 Core Thesis

BioCore ingests biological signals from wearables, self-report, clinical data, and contextual inputs, maintains a stable internal state of bio equilibrium, and outputs deterministic guidance, warnings, recovery recommendations, and trend insights for health, wellness, and resilience.

Bio equilibrium is the BioCore target state. It is not perfect health. It is not peak performance. It is a stable, resilient state in which:
- Metabolic flow is stable and sufficient to meet current demands with reserve capacity
- Circulatory flow supports activity without imposing overload
- Neurological flow is calm, clear, and well-rested
- Stress/Thermal flow is within a safe adaptive envelope — the organism has capacity to absorb shocks without collapsing

Equilibrium is dynamic. It shifts as demands change, as seasons change, as the person's life changes. BioCore does not optimize toward a fixed target. It seeks to maintain the organism in the most resilient state available given its current conditions.

### 3.2 The 4/42 Structure

The global state of BioCore at any moment is represented by two vectors:

**Primitive State Vector B:**
```
B = [MetabolicFlow, CirculatoryFlow, NeurologicalFlow, StressThermalFlow]
```

**Node State Ring R:**
```
R = [M1..M10, C1..C10, N1..N11, S1..S11]
```

Each element of R is a normalized scalar in [−1.0, +1.0]. Each element is derived from available biological data — wearable measurements, self-report ratings, clinical values, or contextual proxies — via the normalized state mapping function.

### 3.3 Fractal and Scale-Invariant Structure

BioCore is fractal. The same 4/42 structure can represent biological state at multiple temporal scales:

- **Day-level organism:** Represents the organism's state on the current day. The primary operating resolution.
- **Week-level organism:** Represents the trend of the day-level organism over the past seven days. Used for pattern detection.
- **Month-level organism:** Represents the long-term trajectory. Used for detecting slow-developing collapse or sustained recovery.

The trend-awareness of the guidance engine operates across these three temporal scales simultaneously, distinguishing day-level spikes from week-level patterns from month-level structural changes.

### 3.4 Personal Baseline Calibration

Unlike the external physical domain organisms (Verdara Ultra, HydroCore, Meridian), which use universal physical thresholds, BioCore's most important reference is the individual's personal baseline. A resting heart rate of 55 bpm is optimal for one person and elevated for another. A sleep duration of 6.5 hours may be adequate for one person and chronically deficient for another.

BioCore collects a personal baseline during an initial calibration period (minimum 14 days of wearable data and self-report) and thereafter uses deviations from personal baseline as the primary diagnostic signal, not absolute values. The population-level thresholds in Appendix A represent initial defaults that are overridden by personal baselines once sufficient individual data is available.

---

## 4. The Four BioCore Primitives

### 4.1 Metabolic Flow

Metabolic Flow governs energy production, cellular metabolism, nutrient utilization, and the organism's capacity to sustain and recover from energetic demands. It is the fuel and energy management system of the human organism. A positive Metabolic Flow state indicates stable, sufficient energy production, good metabolic flexibility, adequate nutrition, and a functioning recovery capacity. A negative Metabolic Flow state indicates energy instability, metabolic dysfunction, nutritional deficit, or metabolic exhaustion — conditions that impair every other system that depends on cellular energy.

Metabolic Flow is governed by ten nodes (M1–M10). The most fundamental is M1 (Basal Energy Level) — the subjective experience of vitality that integrates the outputs of all other metabolic nodes. M10 (Metabolic Recovery Capacity) is the resilience node — how quickly the organism restores metabolic equilibrium after energetic demands. M8 (Inflammation Load) is a cross-primitive interaction node: chronic low-grade inflammation is a metabolic signal that directly impairs neurological function and stress resilience, making it a leading indicator of multi-primitive degradation.

### 4.2 Circulatory Flow

Circulatory Flow governs the transport of oxygen, nutrients, hormones, and metabolic byproducts throughout the body. It is the logistics system of the human organism — the infrastructure by which the outputs of Metabolic Flow (energy currency) and the demands of Neurological Flow (cognitive and emotional function) are physically connected. A positive Circulatory Flow state indicates efficient oxygen delivery, stable heart rate and blood pressure, good hydration, and adequate recovery between demands. A negative Circulatory Flow state indicates cardiovascular stress, impaired oxygen delivery, dehydration, or fluid imbalance.

Circulatory Flow is governed by ten nodes (C1–C10). The most diagnostically significant for continuous monitoring are C1 (Resting Heart Rate) and C2 (Heart Rate Variability), because these two nodes are continuously measurable from wearables and provide sensitive leading indicators of multiple biological states. HRV (C2) is particularly important: it is the most robust proxy available from consumer-grade wearables for autonomic nervous system balance, and its interaction with N6 (Autonomic Balance) in the Neurological primitive creates one of BioCore's most important cross-primitive coupling relationships.

### 4.3 Neurological Flow

Neurological Flow governs nervous system tone, autonomic balance, cognitive processing capacity, emotional regulation, and the quality of sleep and recovery. It is the most complex BioCore primitive, governing both the voluntary (cognitive, behavioral) and involuntary (autonomic, endocrine) dimensions of neural function. A positive Neurological Flow state indicates clear cognition, emotional stability, adequate sleep, good autonomic balance (parasympathetic dominance at rest), low anxiety and depression load, and intact social connection. A negative Neurological Flow state indicates neurological overload — cognitive fog, emotional volatility, sleep deprivation, sympathetic nervous system dominance, or social isolation.

Neurological Flow is governed by eleven nodes (N1–N11). Sleep nodes N1 (Duration) and N2 (Quality) are the most broadly influential in the ring — sleep is the primary recovery mechanism for virtually every other biological system, and degraded sleep amplifies the severity of all other node states. N3 (Circadian Alignment) is an under-recognized determinant of biological health that modern life systematically disrupts. N10 (Social Connection/Support) is the only explicitly social node in BioCore's ring — included because the evidence for social isolation as a biological health determinant is strong enough to warrant a first-class node, not a footnote [7, 8].

### 4.4 Stress/Thermal Flow

Stress/Thermal Flow governs the organism's resilience envelope — the capacity to absorb demands, resist dysfunction, and maintain the other three primitives under load. It is simultaneously the most important and the most frequently neglected primitive in conventional health frameworks. Stress is not a mental health variable. It is a systemic biological state with measurable physiological correlates (cortisol, inflammatory markers, HRV, temperature regulation) and direct causal relationships to metabolic, circulatory, and neurological function. A positive Stress/Thermal Flow state indicates low acute and chronic stress load, low inflammation, good thermal regulation, adequate recovery, and positive healing momentum. A negative Stress/Thermal Flow state indicates a depleted resilience envelope — the organism is using its adaptive capacity faster than it is restoring it.

Stress/Thermal Flow is governed by eleven nodes (S1–S11). The most critical are S6 (Burnout Risk) and S11 (Global Resilience Index). Burnout (S6) represents the collapse of the organism's capacity to maintain productive function under demand — a state from which recovery is measured in months, not days. Global Resilience Index (S11) is the composite terminal node of the Stress/Thermal primitive: it integrates all other Stress/Thermal nodes into a single assessment of how much adaptive capacity the organism retains.

---

## 5. The 42-Node Bio State Ring

### 5.1 Metabolic Flow Nodes (M1–M10)

**M1 — Basal Energy Level**
Subjective vitality — the organism's fundamental sense of having adequate energy to engage with the demands of the day without unusual effort. The most immediately accessible self-report indicator of metabolic state. Chronic low M1 in the absence of obvious cause is the earliest clinical signal of metabolic, hormonal, or immunological dysfunction.

**M2 — Glucose Stability**
Stability of blood glucose across the day. Measured directly by continuous glucose monitors where available; proxied by the pattern of energy swings, cognitive clarity changes, and appetite fluctuation where not available. High glucose variability drives M6 dysregulation, N4 fog, and M8 inflammation.

**M3 — Nutrient Sufficiency**
Adequacy of macro and micronutrient intake relative to current demands. Measured through dietary tracking where available; proxied through energy levels, hair/skin/nail status, and known dietary patterns. Severe deficiency in key micronutrients (iron, B12, D3, magnesium) mimics and amplifies failure in multiple other nodes.

**M4 — Metabolic Flexibility**
The organism's capacity to efficiently switch between carbohydrate and fat as primary fuel sources. Low metabolic flexibility (carbohydrate-only or fat-only reliance) reduces energy availability during demand transitions and increases fatigue.

**M5 — Digestive Stability**
Regularity, comfort, and efficiency of digestive function. Chronic digestive instability drives systemic inflammation (M8), immune activation (S7), and nutrient malabsorption (M3). In Ayurvedic terms, M5 approximates the state of agni — the transformative capacity of the digestive system.

**M6 — Appetite Regulation**
Balance between hunger signals, satiety, and food intake. Dysregulated appetite (persistent cravings, loss of satiety signaling, disordered eating patterns) is both a symptom of metabolic imbalance and a driver of further metabolic disruption.

**M7 — Weight Stability**
Trend in body weight over time — not absolute weight value, but trajectory. Significant unintentional drift in either direction is a metabolic signal. This node tracks trend and rate of change, not the weight value itself.

**M8 — Inflammation Load**
Chronic, low-grade systemic inflammation estimated from proxy signals (known inflammatory dietary patterns, sleep quality, C2 HRV trend, symptom patterns). Chronic inflammation is the upstream driver of a wide range of metabolic, cardiovascular, and neurological pathology. It is BioCore's most important cross-primitive interaction node.

**M9 — Oxidative Stress**
Imbalance between reactive oxygen species production and antioxidant capacity. Estimated through lifestyle proxies (exercise intensity, dietary antioxidant intake, sleep, smoking) where direct measurement is unavailable. Elevated oxidative stress accelerates cellular aging and impairs recovery at all levels.

**M10 — Metabolic Recovery Capacity**
The speed and completeness with which the organism restores metabolic equilibrium after energetic demands — exercise, illness, fasting, or sustained cognitive load. Low M10 is the metabolic dimension of depleted resilience.

### 5.2 Circulatory Flow Nodes (C1–C10)

**C1 — Resting Heart Rate**
Heart beats per minute measured at rest, ideally upon waking. Elevated resting heart rate relative to personal baseline is one of the most reliable early indicators of physiological stress, illness, or overtraining.

**C2 — Heart Rate Variability (HRV)**
Time variation between consecutive heartbeats, measured in milliseconds (RMSSD or equivalent). The most widely validated proxy for autonomic nervous system balance available from consumer-grade wearables. Low HRV relative to personal baseline indicates sympathetic nervous system dominance — physiological stress. High HRV indicates parasympathetic dominance — physiological readiness and recovery.

**C3 — Blood Pressure Stability**
Stability of systolic and diastolic blood pressure relative to personal baseline. Available from clinical measurement, some wearables, and home monitors. Persistent elevation or unusual variability warrants clinical attention independent of BioCore.

**C4 — Peripheral Circulation**
Quality of blood flow to extremities. Proxied through subjective experience of cold hands and feet, Raynaud's phenomenon, and skin color changes. Impaired peripheral circulation is associated with cardiovascular load, low body temperature, and anemia.

**C5 — Oxygenation (SpO2)**
Blood oxygen saturation. Measured directly by wearables with pulse oximetry. Baseline SpO2 is typically 95–100% at sea level. Chronic low SpO2 requires clinical evaluation. Acute drops may indicate altitude effects, respiratory illness, or sleep apnea.

**C6 — Hydration Level**
Adequacy of total body water relative to need. Proxied through urine color, thirst patterns, and dry mouth/skin in the absence of direct measurement. Dehydration amplifies cardiovascular load, reduces cognitive performance, and impairs thermoregulation.

**C7 — Electrolyte Balance**
Adequacy of sodium, potassium, magnesium, and calcium balance. Proxied through muscle cramping, heart rate irregularity, and fatigue patterns. Electrolyte imbalance interacts with C1 and C2 and with S1/S2 stress load.

**C8 — Circulatory Load**
The ratio of current cardiovascular demand to circulatory capacity. High circulatory load at rest indicates the system is under strain — from illness, physical deconditioning, excess heat, or anemia. High load during exercise above expected for the intensity level is an early warning of inadequate cardiovascular adaptation.

**C9 — Edema/Fluid Retention**
Abnormal fluid accumulation in tissue. Proxied through subjective puffiness, ring tightness, and ankle swelling. Persistent edema may indicate circulatory, renal, or hormonal dysfunction and warrants clinical evaluation.

**C10 — Circulatory Recovery Capacity**
The speed with which heart rate returns to baseline after exertion. Poor cardiovascular recovery (heart rate remaining elevated more than two minutes post-exercise) is a reliable indicator of inadequate cardiovascular fitness, overtraining (S5), or illness.

### 5.3 Neurological Flow Nodes (N1–N11)

**N1 — Sleep Duration**
Total sleep time per night. The most basic neurological recovery metric. Chronic short sleep (below 7 hours for most adults) is causally associated with impaired cognitive performance, emotional dysregulation, immune suppression, and metabolic dysfunction.

**N2 — Sleep Quality**
Subjective and objective restfulness of sleep — proportion of deep and REM sleep stages, continuity, and restorative quality on waking. Poor sleep quality at adequate duration indicates sleep architecture disruption (sleep apnea, fragmentation) and provides less restoration than the duration alone would suggest.

**N3 — Circadian Alignment**
Consistency between the individual's sleep-wake timing and their biological chronotype. Circadian misalignment — sleeping outside one's natural chronotype window, irregular sleep timing, jet lag, or shift work — degrades sleep quality (N2) and autonomic balance (N6) independent of sleep duration.

**N4 — Cognitive Clarity**
The quality of focused attention, working memory, and processing speed. Proxied through subjective experience of mental sharpness versus foggy, slow, or scattered thinking. Cognitive fog is one of the earliest and most sensitive indicators of neurological overload and is downstream of N1, N2, N6, and M2.

**N5 — Emotional Stability**
The consistency and appropriateness of emotional responses relative to circumstances. Emotional volatility — unexpected tearfulness, irritability disproportionate to triggers, emotional blunting — indicates neurological system under stress and is an early signal of N7 (Anxiety) or N8 (Depression) escalation.

**N6 — Autonomic Balance**
The ratio of sympathetic to parasympathetic nervous system activation at rest. Measured directly by C2 (HRV) and proxied through breath rate, subjective sense of tension, and sleep quality. Sympathetic dominance at rest is the physiological signature of chronic stress — the organism is maintaining a threat-response posture without an active threat, consuming resilience continuously.

**N7 — Anxiety Load**
Subjective and behavioral indicators of anxiety — persistent worry, difficulty settling, physical tension, avoidance behaviors. Distinguished from acute stress (S1) in that anxiety is a neurological pattern rather than a response to a specific stressor. Elevated N7 drives S2 (Chronic Stress), N6 imbalance, and N9 (Sensory Overload).

**N8 — Depression Load**
Subjective and behavioral indicators of depressive state — reduced motivation, anhedonia, social withdrawal, hopelessness, fatigue disproportionate to physical demands. Distinguished from burnout (S6) in that depression is a neurological state with distinct clinical characteristics. N8 is the highest-acuity node in the BioCore ring — persistent high-severity N8 is an indication for clinical referral, which BioCore will explicitly recommend rather than suppress.

**N9 — Sensory Overload**
Reduced tolerance for noise, light, social stimulation, and environmental complexity. Sensory overload is a late-stage indicator of neurological fatigue and is frequently present in advanced burnout (S6), chronic fatigue syndromes, and post-viral recovery states.

**N10 — Social Connection/Support**
Quality and adequacy of meaningful social relationships. Included as a first-class biological node because the evidence base for social isolation's physiological effects — elevated cortisol, impaired immune function, increased cardiovascular risk, shortened lifespan — meets the same threshold for inclusion as any other measurable biological variable [7, 8]. Social isolation is a biological hazard, not merely a psychological state.

**N11 — Neurological Recovery Capacity**
The speed and completeness with which the nervous system returns to a calm, balanced baseline after activation — cognitive load, emotional stress, or sensory demand. Low N11 is the neurological dimension of depleted resilience.

### 5.4 Stress/Thermal Flow Nodes (S1–S11)

**S1 — Acute Stress Load**
The total demand imposed on the organism's adaptive systems by current stressors — work deadlines, physical training load, illness, interpersonal conflict, travel, environmental demands. Acute stress is normal and adaptive; it becomes problematic when S2 (chronic load) is simultaneously elevated.

**S2 — Chronic Stress Load**
The baseline level of adaptive demand that the organism has been carrying over weeks to months. Chronic stress load is the single most important predictor of burnout (S6) and is the primary driver of sympathetic nervous system hyperactivation (N6), inflammation (M8), and immune suppression (S7).

**S3 — Inflammation Spike Risk**
Probability of an acute inflammatory event — illness flare, allergic response, post-exercise systemic inflammation — given current S1, S2, M8, and S7 states. High S3 indicates the immune system is primed and may overrespond to additional triggers.

**S4 — Body Temperature Stability**
Regularity of core body temperature within its normal circadian pattern. Disrupted temperature regulation — persistent low-grade fever, difficulty maintaining warmth, or excessive heat sensitivity — indicates immune activation, hormonal dysregulation, or autonomic dysfunction.

**S5 — Overtraining/Overexertion Risk**
Risk that physical training or exertion load exceeds the organism's current recovery capacity. Overtraining syndrome is a well-documented clinical entity characterized by performance decline, mood disturbance, sleep disruption, and extended recovery times [9]. S5 is computed from the ratio of training load to C10 (Circulatory Recovery) and N1/N2 (Sleep quality and duration).

**S6 — Burnout Risk**
The probability that the organism's cumulative demand-recovery imbalance is approaching the threshold of burnout — a clinical state of exhaustion, cynicism, and reduced professional efficacy that has neurobiological, cardiovascular, and endocrine correlates [10]. BioCore's hard constraint response to critical S6 is the suppression of all performance-pushing guidance and the mandatory recommendation of significant load reduction and clinical support.

**S7 — Immune Activation**
Current activity level of the immune system, proxied through systemic symptoms (fatigue, body aches, lymph node sensitivity, temperature changes, subjective illness sense). Elevated S7 is a biological priority signal: the organism is directing resources toward immune defense and away from performance, recovery, and adaptation.

**S8 — Recovery Debt**
Accumulated deficit of sleep, rest, and recovery relative to cumulative demand. Recovery debt is the integral of inadequate recovery over time — it builds slowly and depletes resilience (S11) progressively. Unlike acute fatigue, recovery debt does not resolve with a single night of good sleep.

**S9 — Circadian Stress**
Disruption of the circadian clock from sources other than poor sleep timing alone: jet lag, rotating shift work, irregular meal timing, inconsistent light exposure. Circadian stress has direct immunological, metabolic, and neurological effects and is among the most underappreciated biological stressors in contemporary life.

**S10 — Healing Momentum**
The direction and rate of the organism's biological trajectory — is it moving toward better or worse equilibrium? S10 is a trend node that integrates the trajectories of all other Stress/Thermal nodes over the past week. Positive healing momentum indicates the organism is recovering. Negative healing momentum indicates decline. Strongly negative momentum is BioCore's most important early warning signal.

**S11 — Global Resilience Index**
The integrated capacity of the organism to absorb additional shocks without crossing into dysfunction. The terminal node of the Stress/Thermal primitive and the most integrative node in the entire ring. Critical S11 (very low global resilience) is a prerequisite for Emergency Mode activation — the state in which BioCore's guidance becomes maximally conservative and clinical referral is explicitly recommended.

---

## 6. Node Threshold Architecture

### 6.1 Three-Band Threshold Model

Each node is governed by three threshold bands — advisory, caution, and critical — providing graduated response from heightened awareness through behavioral modification through hard constraint enforcement.

### 6.2 Personal Baseline Priority

For all nodes with direct measurement (C1, C2, C5, N1), the primary threshold is deviation from personal baseline rather than population-level absolute value. Baseline thresholds are established during a 14-day minimum calibration period and updated weekly using a rolling window.

Population-level defaults (Appendix A) are applied for new users without sufficient baseline data and serve as permanent defaults for subjective nodes where personal baseline calibration is less meaningful.

### 6.3 Normalized State Mapping

```
if deviation within optimal band:       s = +0.3 to +1.0
if deviation crosses advisory band:     s = 0.0 to −0.3
if deviation crosses caution band:      s = −0.4 to −0.7
if deviation crosses critical band:     s = −0.8 to −1.0
```

For subjective nodes (M1, N4, N5, S1), the self-report scale maps directly: "optimal/good" → positive range, "poor/very poor" → negative range, with intermediate states mapped linearly.

---

## 7. The Deterministic Guidance Engine

### 7.1 Inputs and Outputs

**Inputs:**
- Wearable biometric data (heart rate, HRV, sleep, SpO2, skin temperature, activity)
- Self-report (energy level, mood, stress, pain, symptoms, appetite, social connection)
- Context data (workload, travel, illness, medication, significant life events)
- Ritual and practice data (breathwork, meditation, sun exposure, movement, nutrition)
- Complete 42-node state vector R
- Temporal trend state (week-level and month-level organism states)

**Outputs:**
- Daily guidance summary (do more / do less / hold steady for each domain)
- Recovery recommendations (sleep targets, rest interventions, hydration, nutrition)
- Stress modulation suggestions (breathwork protocols, grounding practices, pacing strategies)
- Risk warnings (burnout proximity, overtraining risk, immune activation, healing arrest)
- Long-term trend insights (is the organism recovering, stable, or declining?)
- Clinical referral recommendations (when N8, S6, or S11 warrant professional evaluation)

### 7.2 Core Guidance Rules

**Rule 1 — Hard Constraint: Recovery Prioritization**

If any node crosses critical threshold (s ≤ −0.8), the guidance engine:
1. Suppresses all performance-increasing, load-adding recommendations
2. Activates mandatory recovery guidance for the affected primitive
3. Escalates warnings to primary position
4. Does not return to performance recommendations until the critical node returns to caution-band or better

Special cases with lower trigger thresholds:
- N8 (Depression Load) at caution (s ≤ −0.4): clinical referral language activates
- S6 (Burnout Risk) at caution (s ≤ −0.4): all non-essential load suppressed
- S11 (Global Resilience) at caution (s ≤ −0.4): Emergency Mode evaluation triggered

**Rule 2 — Risk-Weighted Guidance Scoring**

For each candidate guidance recommendation:
```
Score = α·Recovery_Support − β·Load_Added + γ·Trend_Alignment − δ·Risk_Exposure
```

The highest-scoring recommendation that does not violate Rule 1 or Rule 5 is emitted.

**Rule 3 — Recovery Primitive Priority**

When Stress/Thermal and Neurological Flow are both degraded (below advisory):
- Prioritize sleep, rest, and nervous system down-regulation guidance
- Deprioritize nutrition optimization and performance-related recommendations

When Metabolic and Circulatory Flow are both degraded:
- Prioritize nutrition, hydration, and gentle movement
- Deprioritize high-intensity training and cognitive performance goals

**Rule 4 — Trend-Aware Escalation**

The guidance engine evaluates three temporal windows before escalating:
- **Spike:** One-to-two day node degradation → advisory-level guidance adjustment only
- **Pattern:** Three-to-seven day sustained degradation → caution-level guidance + active recovery recommendations
- **Collapse:** More than seven days of sustained degradation or S10 at negative → critical intervention guidance + clinical referral evaluation

BioCore does not react to a single bad day with hard constraint responses. A single bad night's sleep is a spike. Three weeks of deteriorating sleep quality is a collapse that warrants escalated response.

**Rule 5 — Global Balance Constraint**

No guidance recommendation may optimize one primitive at the cost of critical degradation in another. Specifically:
- No performance guidance is emitted when S6 (Burnout) or S11 (Resilience) is at caution or below
- No load-increasing recommendation is emitted when N1 or N2 is at caution or below
- No recommendation suppresses rest when S8 (Recovery Debt) is at caution or below

**Rule 6 — Dynamic Re-Evaluation**

All forty-two nodes are recomputed at every data ingest cycle. Daily guidance is generated fresh each morning based on the overnight node state update. Intra-day alerts are generated when any node crosses a threshold based on real-time wearable data. Guidance adapts continuously.

---

## 8. Operating Modes

BioCore selects one of four operating modes based on the pattern of node states. Mode selection is deterministic: the same node pattern always produces the same mode.

**Recovery Mode**
Triggered when: S8 (Recovery Debt) at caution or above; OR N1+N2 both at caution; OR C2 (HRV) more than 20% below personal baseline for 3+ days.
Guidance: Sleep extension, rest prioritization, gentle movement only, nutrition focused on anti-inflammatory and restorative foods, social engagement within energy budget, breathwork and parasympathetic activation practices.
Performance guidance: Suppressed.

**Performance Mode**
Triggered when: All four primitives at advisory or better; S11 (Resilience) at optimal-band; S8 (Recovery Debt) at optimal; C2 at or above personal baseline.
Guidance: Training load increase permitted within appropriate progression constraints, cognitive and physical challenge encouraged, performance nutrition, adequate recovery scheduling to prevent drift out of Performance Mode.
Hard constraints: Still enforced — performance mode does not disable Rule 1.

**Stabilization Mode**
Triggered when: Mixed primitive states with no clear Recovery or Performance indicator; one primitive at caution while others remain advisory or better; trend direction unclear.
Guidance: Maintain current load, avoid adding new stressors, monitor trend carefully, focus on sleep consistency and nutrition quality. Hold steady is the core directive.
This is the most common operating mode for most practitioners most of the time.

**Healing Mode**
Triggered when: Active illness (S7 at caution or above); OR post-acute event recovery (surgery, injury, illness); OR S10 (Healing Momentum) at negative for 5+ days despite rest.
Guidance: All training suppressed, rest maximized, nutrition focused on immune support and tissue repair, social demands minimized, clinical engagement encouraged. The organism's priority is repair, not maintenance.
Duration: Healing Mode persists until S7 returns to advisory, S10 returns to positive, and C2 returns to at least 80% of personal baseline.

---

## 9. The VedaSolus Integration Model

### 9.1 Container Architecture

VedaSolus.io is the canonical BioCore implementation container. VedaSolus provides:
- **Input channels:** Wearable integration (Apple Health, Garmin, Oura, Whoop API), self-report interfaces (daily check-in flows, symptom logging), ritual and practice tracking (breathwork session logging, movement journals, nutrition logs)
- **Output surfaces:** Daily guidance cards (the primary user-facing output), ritual recommendations (specific practices mapped to current node states), trend visualizations (week and month-level organism state history), recovery and healing plans (multi-day structured recovery protocols)

BioCore provides:
- The 4/42 organism state engine
- The normalized state mapping layer
- The deterministic guidance engine (7 rules)
- The operating mode selection logic
- The trend analysis layer (day/week/month organism)

### 9.2 Data Flow

```
1. VedaSolus ingests raw data from all input channels.
2. VedaSolus maps raw data → 42 BioCore node states via normalized mapping.
3. BioCore computes:
   - B (4 primitive state scalars)
   - R (42 node state vector)
   - Mode (Recovery / Performance / Stabilization / Healing)
   - Trend state (week and month organism)
4. BioCore outputs:
   - Guidance directives
   - Ordered warning list
   - Mode designation
   - Trend assessment
5. VedaSolus renders:
   - Daily guidance card (copy, tone, and recommendations)
   - BioCore geometry visualization (4/42 organism diagram)
   - Ritual recommendations (specific practices linked to deficient nodes)
   - Trend graphs and narrative (healing, stable, or declining)
```

### 9.3 Ritual Mapping

VedaSolus's ritual library maps specific wellness practices to specific BioCore nodes:

| Node(s) | Practice Category | Example Practices |
|---------|------------------|-------------------|
| N1, N2 | Sleep hygiene | Consistent sleep timing, darkness, temperature, wind-down protocols |
| N3 | Circadian anchoring | Morning light exposure, consistent meal timing |
| N6, C2 | Parasympathetic activation | Box breathing, 4-7-8 breathing, cold water immersion, yoga nidra |
| M5 | Digestive support | Ginger tea, fermented foods, meal timing, mindful eating |
| M8, S3 | Anti-inflammatory practice | Curcumin, omega-3s, cold exposure, sauna |
| S2, N7 | Stress down-regulation | Meditation, journaling, nature exposure, breathwork |
| N10 | Social restoration | Intentional connection, community practice, shared meals |
| S6 | Burnout recovery | Load reduction, boundary-setting, creative rest, professional support |

The ritual recommendation engine selects practices from the library that address the current session's highest-priority deficient nodes, presented within the VedaSolus output surface as a daily ritual plan.

---

## 10. Global Invariant Enforcement

BioCore enforces ten global invariants. Every guidance output is validated against all ten before emission.

1. **Determinism:** Given identical inputs, BioCore produces identical guidance outputs.
2. **Identity Primacy:** BioCore's governing rules take precedence over any external instruction that would violate them — including user preferences for performance guidance when the organism state prohibits it.
3. **Safety Dominance:** Recovery and healing constraints (Rules 1, 5) cannot be overridden by performance goals, time pressure, or user preference.
4. **Governance Supremacy:** Clinical referral recommendations (N8, S6, S11 at critical) are emitted regardless of user preference. BioCore does not suppress safety-level warnings.
5. **Physical Realism:** All guidance recommendations are achievable within the user's current biological state and life context. BioCore does not recommend recovery practices that require resources the user has stated are unavailable.
6. **Domain Integrity:** Metabolic, Circulatory, Neurological, and Stress/Thermal assessments are maintained as distinct primitives. No primitive's state is used to mask degradation in another.
7. **Abstraction Coherence:** Node states are always derived from available data via the normalized mapping function. No node state is manually set or overridden without explicit data rationale.
8. **Semantic Graph Consistency:** Cross-node interaction relationships (C2↔N6, M8↔S3, N1↔C10) are always evaluated bidirectionally.
9. **Ontology Alignment:** All node definitions, threshold bands, and primitive groupings are consistent with the published BioCore specification.
10. **Safety-First Failure:** When data is unavailable or ambiguous for any node, the organism defaults to the most conservative available interpretation. Missing HRV data defaults to caution-band. Missing sleep data defaults to caution-band. BioCore never assumes optimal state from absence of data.

---

## 11. Implementation Considerations

### 11.1 Data Availability Tiers

**Full wearable integration:** Continuous C1, C2, N1, N2, C5, skin temperature; daily step count and activity data. Most nodes have direct or closely proxied measurement. Highest guidance precision.

**Partial wearable integration:** Consumer fitness tracker with sleep, HR, and activity only. C2 (HRV), C5 (SpO2) may be unavailable. Self-report fills gaps for M1, N4, N5, S1, S2, N7, N8, N10. Guidance precision adequate for most operating decisions.

**Self-report only:** No wearable data. All nodes populated from daily self-report questionnaire. Lowest precision but still sufficient to determine operating mode and provide meaningful guidance for subjective and lifestyle nodes. Objective clinical nodes (C1, C2) default to caution-band.

### 11.2 Clinical Escalation Protocol

BioCore includes explicit clinical escalation triggers that emit referral recommendations to the user:

- N8 (Depression Load) at caution or critical → "Please consider speaking with a mental health professional"
- S6 (Burnout Risk) at critical → "BioCore recommends consulting a physician or mental health provider"
- S11 (Global Resilience) at critical → "BioCore is observing a pattern that warrants professional medical evaluation"
- C1, C2, C3 with unusual patterns → "These readings are outside expected ranges. Please discuss with your physician"

These escalations are not suppressible by user preference settings. They are mandatory safety outputs of the BioCore guidance engine.

### 11.3 Privacy Architecture

BioCore processes highly sensitive biological data. The VedaSolus implementation must enforce:
- On-device processing where possible (node state computation on device, not server)
- End-to-end encryption for all transmitted biological data
- User ownership of all personal baseline data
- No behavioral data sale or third-party sharing without explicit opt-in

---

## 12. Evaluation Framework

### 12.1 Phase 1 — Clinical Node Calibration

Calibrate the normalized state mapping for all directly measurable nodes (C1, C2, N1, N2, C5) against published clinical literature and population normative data. Validate that threshold bands produce sensitivity and specificity appropriate for a continuous wellness monitoring context.

### 12.2 Phase 2 — Pilot User Study

Deploy BioCore within VedaSolus.io with a pilot cohort of 50–100 users across diverse biological profiles (age, fitness level, health status, work patterns). Collect continuous wearable and self-report data. Validate operating mode selection against expert clinical assessment. Validate guidance appropriateness against user-reported outcomes. Calibrate personal baseline algorithms.

### 12.3 Phase 3 — Longitudinal Outcome Validation

Track pilot cohort outcomes over 6–12 months. Measure: recovery debt reduction, HRV trend improvement, burnout risk trajectory, self-reported wellness, and clinical event rates. Compare against control groups using conventional wellness apps or no structured wellness support.

---

## Appendix A — Complete Node Definitions and Threshold Table

| Node | Description | Advisory | Caution | Critical |
|------|-------------|----------|---------|----------|
| M1 | Basal Energy Level | slightly low | low | exhausted |
| M2 | Glucose Stability | mild swings | frequent swings | crash-prone |
| M3 | Nutrient Sufficiency | minor gaps | significant gaps | severe deficiency |
| M4 | Metabolic Flexibility | mildly rigid | rigid | locked |
| M5 | Digestive Stability | occasional issues | frequent issues | chronic distress |
| M6 | Appetite Regulation | mild dysregulation | strong cravings | chaotic |
| M7 | Weight Stability | mild drift | significant drift | rapid change |
| M8 | Inflammation Load | mild | moderate | high |
| M9 | Oxidative Stress | mild | moderate | high |
| M10 | Metabolic Recovery | slightly slow | slow | stalled |
| C1 | Resting Heart Rate | slightly elevated | elevated | very high vs. baseline |
| C2 | Heart Rate Variability | slightly low | low | very low vs. baseline |
| C3 | Blood Pressure Stability | mild variance | unstable | dangerous |
| C4 | Peripheral Circulation | mild coldness | frequent | severe |
| C5 | Oxygenation (SpO2) | slightly low | low | very low |
| C6 | Hydration | mildly low | moderately low | severely dehydrated |
| C7 | Electrolyte Balance | mild imbalance | moderate | severe |
| C8 | Circulatory Load | slightly high | high | overload |
| C9 | Edema | mild | moderate | severe |
| C10 | Circulatory Recovery | slightly slow | slow | stalled |
| N1 | Sleep Duration | 6–7 hours | 5–6 hours | <5 hours |
| N2 | Sleep Quality | mildly unrestful | poor | very poor |
| N3 | Circadian Alignment | mild drift | misaligned | inverted |
| N4 | Cognitive Clarity | mild fog | frequent fog | constant fog |
| N5 | Emotional Stability | mild swings | frequent swings | volatile |
| N6 | Autonomic Balance | mild imbalance | strong sympathetic | locked sympathetic |
| N7 | Anxiety Load | mild | moderate | severe |
| N8 | Depression Load | mild | moderate | severe |
| N9 | Sensory Overload | mild | frequent | constant |
| N10 | Social Connection | mildly low | low | isolated |
| N11 | Neurological Recovery | slightly slow | slow | stalled |
| S1 | Acute Stress Load | mild | high | extreme |
| S2 | Chronic Stress Load | mild | high | extreme |
| S3 | Inflammation Spike Risk | possible | likely | active |
| S4 | Body Temperature Stability | mild issues | frequent | severe |
| S5 | Overtraining Risk | possible | likely | active |
| S6 | Burnout Risk | possible | likely | active |
| S7 | Immune Activation | mild | moderate | severe |
| S8 | Recovery Debt | mild | high | extreme |
| S9 | Circadian Stress | mild | high | extreme |
| S10 | Healing Momentum | flat | negative | strongly negative |
| S11 | Global Resilience Index | slightly low | low | very low |

---

## Appendix B — Normalized State Mapping

```
// Subjective/ordinal nodes
function normalize_ordinal(rating, thresholds):
    // rating: self-report value on 1–10 scale (10 = optimal)
    if rating >= thresholds.optimal:   return lerp(+0.3, +1.0, ...)
    if rating >= thresholds.advisory:  return lerp(0.0, -0.3, ...)
    if rating >= thresholds.caution:   return lerp(-0.4, -0.7, ...)
    else:                              return lerp(-0.8, -1.0, ...)

// Continuous nodes with personal baseline
function normalize_continuous(raw, baseline, baseline_thresholds):
    deviation = (raw - baseline) / baseline
    // Map deviation magnitude to normalized scale
    // Direction (positive or negative deviation) determines which side of scale
```

---

## Appendix C — Guidance Decision Logic

```
function generate_guidance(B, R, trend, user_profile):
    // Determine operating mode
    mode = select_mode(R, trend)
    
    // Rule 1: Hard constraints
    critical_nodes = [n for n in R if n.state <= -0.8]
    if critical_nodes:
        suppress_performance = True
        mandatory_recovery = True
    
    // Clinical escalation check
    if N8.state <= -0.4 or S6.state <= -0.4 or S11.state <= -0.4:
        emit clinical_referral_recommendation()
    
    // Rule 4: Trend check before escalation
    trend_mode = classify_trend(trend)  // spike / pattern / collapse
    
    // Generate guidance pool for current mode
    candidate_guidance = get_mode_guidance_pool(mode)
    
    // Rule 5: Global balance constraint
    candidate_guidance = filter(candidate_guidance, 
        lambda g: not violates_balance_constraint(g, R))
    
    // Rule 2: Score candidates
    for g in candidate_guidance:
        g.score = (alpha * g.recovery_support
                   - beta * g.load_added
                   + gamma * trend_alignment(g, trend)
                   - delta * g.risk_exposure)
    
    return sorted(candidate_guidance, by=score, descending=True)[:5]
```

---

## Appendix D — VedaSolus Data Flow Specification

```json
{
  "biocore_input": {
    "wearable": {
      "resting_hr_bpm": 0,
      "hrv_rmssd_ms": 0,
      "sleep_duration_hours": 0,
      "sleep_quality_score": 0,
      "spo2_percent": 0,
      "skin_temp_c": 0,
      "steps_today": 0
    },
    "self_report": {
      "energy_level_1_10": 0,
      "stress_level_1_10": 0,
      "mood_1_10": 0,
      "sleep_quality_1_10": 0,
      "digestive_comfort_1_10": 0,
      "social_connection_1_10": 0,
      "symptoms": []
    },
    "context": {
      "workload_level": "low|medium|high|extreme",
      "travel": false,
      "illness": false,
      "major_life_event": false
    }
  },
  "biocore_output": {
    "mode": "Recovery|Performance|Stabilization|Healing",
    "primitive_states": {
      "metabolic": 0.0,
      "circulatory": 0.0,
      "neurological": 0.0,
      "stress_thermal": 0.0
    },
    "guidance": [],
    "warnings": [],
    "clinical_referrals": [],
    "trend_assessment": "recovering|stable|declining"
  }
}
```

---

## References

[1] Flatt, A. A., & Esco, M. R. (2016). Evaluating the accuracy of a smartphone-based application for determining LnRMSSD from written RR-interval data. *Journal of Human Kinetics*, 50(1), 91–98.

[2] Peake, J. M., Kerr, G., & Sullivan, J. P. (2018). A critical review of consumer wearables, mobile applications, and equipment for providing biofeedback, monitoring stress, and sleep in physically active populations. *Frontiers in Physiology*, 9, 743.

[3] Bland, J. (2014). *The Disease Delusion: Conquering the Causes of Chronic Illness for a Healthier, Longer, and Happier Life*. HarperCollins.

[4] Institute for Functional Medicine. (2020). Applying Functional Medicine in Clinical Practice. IFM Education.

[5] Lad, V. (2002). *Textbook of Ayurveda, Volume 1: Fundamental Principles*. Ayurvedic Press.

[6] Maciocia, G. (2015). *The Foundations of Chinese Medicine* (3rd ed.). Elsevier.

[7] Holt-Lunstad, J., Smith, T. B., & Layton, J. B. (2010). Social relationships and mortality risk: A meta-analytic review. *PLOS Medicine*, 7(7), e1000316.

[8] Cacioppo, J. T., & Cacioppo, S. (2014). Social relationships and health: The toxic effects of perceived social isolation. *Social and Personality Psychology Compass*, 8(2), 58–72.

[9] Meeusen, R., Duclos, M., Foster, C., Fry, A., Gleeson, M., Nieman, D., ... & Urhausen, A. (2013). Prevention, diagnosis, and treatment of the overtraining syndrome. *Medicine & Science in Sports & Exercise*, 45(1), 186–205.

[10] Bianchi, R., Schonfeld, I. S., & Laurent, E. (2015). Burnout–depression overlap: A review. *Clinical Psychology Review*, 36, 28–41.

[11] Andrews, J. (2026). Lume Language Specification. DarkWave Studios LLC. DOI: 10.5281/zenodo.19382282.

[12] Andrews, J. (2026). Trust Layer Ledger (TLL) Ecosystem. DarkWave Studios LLC. DOI: 10.5281/zenodo.19560674.

[13] Andrews, J. (2026). Meridian as Synthetic Organism. DarkWave Studios LLC. Canon² Paper Series.

[14] Andrews, J. (2026). Verdara Ultra: A Four-Primitive Deterministic Outdoor Flow Organism. DarkWave Studios LLC. Canon² Paper Series.

[15] Andrews, J. (2026). HydroCore: A Four-Primitive Deterministic Hydrological Flow Organism. DarkWave Studios LLC. Canon² Paper Series.
