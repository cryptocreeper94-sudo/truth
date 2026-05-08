# 4 BioCore Physical: Deterministic Governance of Wearable Biosensor Arrays via the Lume 4/42 Synthetic Organism Architecture

**Canon³ — The Lume Synthetic Organism Canon (L-SOC)**
**Biological Physical Instantiation Volume I**

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Organization:** DarkWave Studios LLC
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Date:** May 2026

**Related Works:**
Lume Language Specification (DOI: 10.5281/zenodo.19382282)
HydroCore Physical — L-SOC Physical Instantiation Vol. I (DOI pending)
Human-Machine Coupling — L-SOC Architecture Vol. IV (DOI pending)
The Lume Organism Stack — L-SOC Architecture Vol. I (DOI pending)

**DOI:** Pending Zenodo assignment

---

## Abstract

BioCore is the Lume 4/42 organism governing human biological flow — the L2 layer of the organism stack, abstractly specifying how physiological variables are normalized, classified, and governed. The Human-Machine Coupling paper (Architecture Vol. IV) uses BioCore outputs to influence physical system behavior. Neither paper specifies the physical substrate that produces those BioCore outputs: the hardware that measures, processes, and governs the biological signals in the first place.

This paper specifies BioCore Physical — the Lume 4/42 organism instantiated on a wearable biosensor array. The wearable is the physical instantiation of BioCore: the device that converts raw physiological measurements (heart rate, HRV, SpO2, EDA, temperature, accelerometry) into the normalized BioCore node values that feed the organism's governance logic, and whose outputs are the BioCore mode decisions and alerts experienced by the user.

The paper establishes: the sensor architecture for the BioCore Physical wearable; the complete 42-node mapping of BioCore primitives to measured physiological variables; the signal processing pipeline from raw sensor measurement to normalized node value; the hard constraint layer covering clinical alert thresholds; the governance mode behaviors and their user-facing expressions; the firmware architecture for a resource-constrained wearable MCU; and the regulatory pathway for deployment as a consumer wellness device versus a medical device.

---

## 1. Introduction

### 1.1 The BioCore Physical Distinction

Every other physical instantiation in the L-SOC series governs an external system — a hydraulic engine, a vehicle, a road network, a steam plant. The governing organism and the governed system are distinct entities.

BioCore Physical governs the human wearing the device. The organism and the governed system share an identity — the user is simultaneously the operator and the subject of governance. This identity collapse between operator and subject is unique to the biological layer and produces governance considerations that do not arise in any other physical instantiation.

In particular: the BioCore Physical wearable cannot command the human body the way HydroCore commands a valve. It can observe, classify, and recommend. Its "actuators" are advisory outputs — notifications, mode indicators, DLA language responses — not direct physical commands. The organism's output function maps to communicative actions rather than mechanical ones.

### 1.2 The Wearable as First Consumer BioCore

The wearable biosensor is the form factor that makes BioCore Physical the first consumer-accessible physical instantiation of the L-SOC series. The bench hydraulic system (Physical Vol. I) is a laboratory device. The vehicle system (Physical Vol. II) is an automotive system. The steam plant (Physical Vol. III) is industrial infrastructure. The wearable is a product that any person can wear daily.

BioCore Physical is the entry point for consumer deployment of the Lume organism architecture into everyday life.

---

## 2. Sensor Architecture

### 2.1 Core Sensing Modalities

The BioCore Physical wearable integrates six sensing modalities on a single wrist-worn platform:

**Photoplethysmography (PPG):** Green and red/infrared LEDs with photodetector array. Measures: heart rate (HR), heart rate variability (HRV), SpO2 (blood oxygen saturation), perfusion index. Sampling rate: 100Hz (HR/HRV), 25Hz (SpO2).

**Electrodermal Activity (EDA):** Two skin-contact electrodes on the posterior wrist. Measures: tonic skin conductance level (SCL) and phasic electrodermal response (EDR) — proxies for sympathetic nervous system arousal and acute stress events. Sampling rate: 4Hz.

**Skin Temperature:** Thermistor array on the posterior wrist. Measures: peripheral skin temperature — proxy for vascular tone and thermoregulatory state. Sampling rate: 1Hz.

**Accelerometry (6-axis IMU):** 3-axis accelerometer + 3-axis gyroscope. Measures: physical movement, activity classification (sedentary, walking, running, exercise), sleep movement patterns, step count. Sampling rate: 50Hz.

**Barometric Pressure:** MEMS pressure sensor. Measures: altitude changes (used for activity classification and VO2 estimation). Sampling rate: 1Hz.

**Bioimpedance (optional, enhanced model):** Multi-frequency bioimpedance spectroscopy. Measures: hydration status, body composition estimates. Sampling rate: On-demand (not continuous due to power consumption).

### 2.2 Signal Processing Chain

Raw sensor data → on-device signal processing → BioCore node values:

```
PPG raw → R-peak detection (Pan-Tompkins) → RR intervals
  → HRV metrics: RMSSD, SDNN, LF/HF ratio, coherence index
  → HR (instantaneous and rolling average)
  → SpO2 (red/IR ratio → calibrated saturation %)

EDA raw → high-pass filter (phasic) + low-pass (tonic) decomposition
  → SCL (tonic) + EDR events (phasic)
  → Stress index (SCL + EDR event rate composite)

IMU raw → activity classification (CNN, on-device) → METs estimate
  → Sleep stage classification (during low-activity periods)
  → Step count, distance, caloric estimate

Temperature → rolling 30-second mean
  → Vascular tone proxy (peripheral vasoconstriction indicator)
```

All signal processing runs on-device (MCU). No raw signals leave the device — only processed node values.

### 2.3 MCU Architecture

The BioCore Physical wearable runs on a Nordic nRF5340 SoC (dual ARM Cortex-M33, 512KB RAM, 1MB flash, Bluetooth 5.3). The organism firmware occupies the network-core processor; the application core handles BLE communication and display.

Governance cycle: 1 second (consistent with the physiological timescales of the governing variables).

Power budget: 5mW average (continuous BioCore governance). Battery life target: 5 days on 180mAh battery at governance duty cycle.

---

## 3. The 42-Node Mapping

### 3.1 LD — Load/Demand Primitive (11 nodes)

| Node | Physiological Variable | Source | Normalization |
|---|---|---|---|
| LD1 | Metabolic rate (METs) | IMU activity classification | [1.0 (rest), 12.0 (maximal)] → [-1, +1] |
| LD2 | Heart rate | PPG | [RHR, HRmax] → [-1, +1]; RHR=resting, HRmax=age-estimated |
| LD3 | Physical activity load (30min rolling) | IMU | [sedentary, high intensity] → [-1, +1] |
| LD4 | Cumulative fatigue load | Composite: HRV + activity + sleep | proprietary composite → [-1, +1] |
| LD5 | Caloric demand | IMU + heart rate | [BMR, BMR×5] → [-1, +1] |
| LD6 | Sleep pressure | Sleep debt model from actigraphy | [0, 16h debt] → [-1, +1] |
| LD7 | Hydration demand (optional) | Bioimpedance | [optimal, dehydrated] → [-1, +1] |
| LD8 | Thermoregulatory demand | Skin temperature + activity | [cool-rest, heat-stress] → [-1, +1] |
| LD9 | Respiratory load | PPG-derived respiratory rate | [normal, elevated] → [-1, +1] |
| LD10 | Cognitive load proxy | HRV LF/HF ratio + EDA | LF/HF elevation + EDA composite |
| LD11 | Session duration load | MCU clock | [0, 16h waking period] → [-1, +1] |

### 3.2 PR — Pressure/Stress Primitive (10 nodes)

| Node | Physiological Variable | Source | Normalization |
|---|---|---|---|
| PR1 | Heart rate variability stress index | PPG (RMSSD suppression) | [high HRV, low HRV] → [-1, +1] (inverted) |
| PR2 | Acute EDA stress | EDA phasic response rate | [baseline, high event rate] → [-1, +1] |
| PR3 | Cortisol proxy (composite) | HRV + EDA + temperature composite | [-1, +1] composite index |
| PR4 | Blood pressure proxy | PPG pulse transit time | [normal, elevated] → [-1, +1] |
| PR5 | Sympathovagal balance | HRV LF/HF ratio | [vagal dominance, sympathetic dominance] → [-1, +1] |
| PR6 | Temperature stress | Skin temperature deviation from baseline | deviation → [-1, +1] |
| PR7 | Respiratory stress | Respiratory rate elevation | [normal, tachypnea] → [-1, +1] |
| PR8 | Allostatic load proxy | Multi-day composite of stress indicators | rolling composite → [-1, +1] |
| PR9 | Pain/discomfort proxy | EDA + HR composite (acute) | composite → [-1, +1] |
| PR10 | External stress coupling | HydroCore Physical → BioCore import | LIOCP import |

### 3.3 FS — Flow/Stability Primitive (11 nodes)

| Node | Physiological Variable | Source | Normalization |
|---|---|---|---|
| FS1 | HRV coherence | PPG — ratio of LF power in a specific resonance band | [incoherent, coherent] → [-1, +1] |
| FS2 | Respiratory-cardiac coupling | Cross-spectral coherence of HR and respiration | [0, 1.0] → [-1, +1] |
| FS3 | Sleep architecture quality | Actigraphy sleep staging — deep+REM fraction | [poor, good] → [-1, +1] |
| FS4 | Circadian alignment | Timing of physiological peaks vs. circadian model | deviation → [-1, +1] |
| FS5 | Recovery flow | Post-exercise HRV recovery trajectory | [slow, rapid] → [-1, +1] |
| FS6 | Immune flow proxy | HRV suppression pattern (correlates with immune activation) | composite → [-1, +1] |
| FS7 | Hormonal flow proxy | 24h HRV and temperature rhythm coherence | circadian amplitude → [-1, +1] |
| FS8 | Hydration flow (optional) | Bioimpedance trend | [dehydrated trending, optimal trending] → [-1, +1] |
| FS9 | Energy metabolism flow | Activity-adjusted caloric balance estimate | [deficit, surplus] → [-1, +1] |
| FS10 | Attentional flow proxy | EDA stability + HRV coherence composite | composite → [-1, +1] |
| FS11 | Governance coherence | Internal metric — consistency of organism classifications | internal |

### 3.4 SL — Structural/Systemic Primitive (10 nodes)

| Node | Physiological Variable | Source | Normalization |
|---|---|---|---|
| SL1 | Cardiovascular structural health proxy | Long-term HRV trend (weeks) | trend → [-1, +1] |
| SL2 | Musculoskeletal load accumulation | IMU — cumulative impact metric | [low, high] → [-1, +1] |
| SL3 | Biological age proxy | HRV-derived biological age estimate vs. chronological | deviation → [-1, +1] |
| SL4 | Training adaptation | HRV trend under training load — positive vs. negative adaptation | trend → [-1, +1] |
| SL5 | Chronic stress accumulation | PR8 allostatic load multi-week trajectory | accumulated → [-1, +1] |
| SL6 | Sleep debt accumulation | Rolling 7-day sleep debt | [0, 7 nights debt] → [-1, +1] |
| SL7 | Sensor contact integrity | PPG signal quality index + EDA contact quality | [poor, good] → [-1, +1] |
| SL8 | Device thermal state | MCU temperature | [nominal, hot] → [-1, +1] |
| SL9 | Battery state | Battery charge level | [0%, 100%] → [-1, +1] |
| SL10 | Long-term physiological resilience | Composite of SL1–SL6 long-term trends | composite → [-1, +1] |

---

## 4. Novel Governance Nodes

### 4.1 SL10 — Long-Term Physiological Resilience (Novel Node)

No prior physical instantiation governs long-term resilience — the accumulated capacity of the governed system to withstand stress and recover from it. SL10 integrates cardiovascular structural health (SL1), musculoskeletal accumulation (SL2), chronic stress (SL5), sleep debt trajectory (SL6), and training adaptation (SL4) into a single resilience index.

This node has no equivalent in conventional fitness tracking, which measures individual metrics but does not synthesize them into a governance variable. SL10 is the organism's assessment of the human system's long-term governance headroom: how much margin exists before sustained demands produce structural degradation.

### 4.2 FS10 — Attentional Flow Proxy (Novel Node)

The combination of EDA stability (absence of phasic EDA events) and HRV coherence provides a proxy for attentional flow state — the condition of focused, effortless engagement associated with optimal cognitive performance (Csikszentmihalyi, 1990). FS10 is a novel physiological governance node in that it attempts to operationalize a psychological state variable using observable physiological signals.

---

## 5. Hard Constraints

### 5.1 HC-BIO-1: SpO2 Clinical Alert

**Trigger:** SpO2 < 90% confirmed over 60 seconds.

**Override:** Issue clinical alert to user and emergency contact (if configured). Disable non-essential processing. Maintain continuous SpO2 monitoring at maximum sample rate.

**Rationale:** SpO2 < 90% indicates hypoxemia — a medical emergency. No governance consideration overrides this.

### 5.2 HC-BIO-2: Tachycardia/Bradycardia Alert

**Trigger:** HR > 180bpm at rest (no significant IMU activity) for > 30 seconds, or HR < 40bpm during waking hours.

**Override:** Issue clinical alert. Log full HR and HRV record from the preceding 5 minutes for medical review.

### 5.3 HC-BIO-3: Severe Dehydration (if bioimpedance equipped)

**Trigger:** Bioimpedance hydration index below -0.80 (severe dehydration estimated).

**Override:** High-priority hydration alert. Disable exercise intensity recommendations until hydration improves.

---

## 6. User-Facing Mode Expressions

Unlike all other physical instantiations, BioCore Physical's output actuators are communicative, not mechanical. The mode decisions manifest as:

| Mode | User Experience |
|---|---|
| Optimal | Ring indicator: green. No notifications unless requested. |
| Advisory | Ring indicator: blue. Gentle notification: "Your recovery indicators suggest a lighter day may be beneficial." |
| Caution | Ring indicator: amber. Notification with specific guidance from DLA: which nodes are elevated and what the biological research says about the condition. |
| Critical | Ring indicator: red pulse. Explicit notification. Clinical alert if HC triggers. |
| Recovery | Ring indicator: teal. Positive notification: "Your biological indicators are recovering. Sleep and rest are working." |

---

## 7. Regulatory Pathway

### 7.1 Consumer Wellness Device (Class I / Low Risk)

BioCore Physical deployed as a consumer wellness device — without making diagnostic claims — occupies the FDA 510(k) Class I category in the US, CE wellness category in the EU. No clinical claims (diagnosis, treatment) are made. Outputs are wellness information and organism mode indicators.

The hard constraint alerts (HC-BIO-1, HC-BIO-2) are positioned as wellness notifications, not diagnostic outputs, under guidance that explicit clinical language ("you may be having a cardiac event") requires Class II registration.

### 7.2 Medical Device Path (Class II)

If clinical claims are added — specifically, if HC-BIO-1 and HC-BIO-2 are described as detecting specific medical conditions — BioCore Physical becomes a Class II medical device requiring 510(k) clearance. The 42-node architecture and hard constraint specification in this paper constitute the design documentation required by FDA's Design Controls (21 CFR Part 820).

---

## 8. Conclusion

BioCore Physical is the L-SOC series' first consumer wearable instantiation. The same organism architecture that governs a steam turbine governs a wrist-worn biosensor array — normalized physiological flows, primitive aggregates, threshold classification, mode selection, and hard constraints applied to the human biological domain.

The wearable is not a fitness tracker. It is a biological organism governance system — the first such product formally specified as a Lume 4/42 instantiation, with 42 nodes, four primitives, five modes, and three hard constraints protecting the user's clinical safety.

The organism governs the body that wears it. The governance is deterministic. The information is grounded. The guessing stops.

---

## Appendix — Sensor-to-Node Mapping Summary

| Sensor | Primary Nodes Driven |
|---|---|
| PPG | LD2 (HR), PR1 (HRV stress), FS1 (HRV coherence), FS2 (respiratory coupling) |
| EDA | PR2 (acute stress), PR9 (pain proxy), FS10 (attentional flow) |
| IMU | LD1 (METs), LD3 (activity load), FS3 (sleep quality) |
| Temperature | PR6 (temperature stress), LD8 (thermoregulatory demand) |
| Barometer | LD1 modifier (altitude correction for activity) |
| Bioimpedance (optional) | LD7 (hydration demand), FS8 (hydration flow) |

---

## References

Andrews, J. (2026). HydroCore Physical. L-SOC Physical Instantiation Vol. I. DarkWave Studios LLC.
Andrews, J. (2026). Human-Machine Coupling. L-SOC Architecture Vol. IV. DarkWave Studios LLC.

Berntson, G. G., et al. (1997). Heart rate variability: Origins, methods, and interpretive caveats. *Psychophysiology*, 34(6), 623–648.

Csikszentmihalyi, M. (1990). *Flow: The Psychology of Optimal Experience*. Harper & Row.

McCraty, R., & Shaffer, F. (2015). Heart rate variability: New perspectives on physiological mechanisms, assessment of self-regulatory capacity, and health risk. *Global Advances in Health and Medicine*, 4(1), 46–61.

Pan, J., & Tompkins, W. J. (1985). A real-time QRS detection algorithm. *IEEE Transactions on Biomedical Engineering*, 32(3), 230–236.

---

*Canon³ — The Lume Synthetic Organism Canon (L-SOC)*
*Biological Physical Instantiation Volume I*
*© 2026 Jason Andrews / DarkWave Studios LLC. All rights reserved.*
*Patent 64/032,339 Pending.*
