# NeuroCore Physical: Deterministic Governance of Neuromorphic Computing Substrates via the Lume 4/42 Synthetic Organism Architecture

**Canon³ — The Lume Synthetic Organism Canon (L-SOC)**
**Cognitive Physical Instantiation Volume I**

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Organization:** DarkWave Studios LLC
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Date:** May 2026

**Related Works:**
Lume Language Specification (DOI: 10.5281/zenodo.19382282)
HydroCore Physical — L-SOC Physical Instantiation Vol. I (DOI pending)
The Lume Organism Stack — L-SOC Architecture Vol. I (DOI pending)
Human-Machine Coupling — L-SOC Architecture Vol. IV (DOI pending)

**DOI:** Pending Zenodo assignment

---

## Abstract

The Lume Organism Stack (Architecture Vol. I) identifies NeuroCore as the L3 Cognitive layer — the organism governing human cognitive flow. The paper also notes, in passing, that NeuroCore could "in principle, govern a neuromorphic computing substrate." This paper converts that passing observation into a full specification.

NeuroCore Physical is the first physical instantiation of a cognitive organism: the Lume 4/42 architecture applied to govern neuromorphic computing hardware — chips that implement spiking neural network computation through analog or mixed-signal circuits, mimicking biological neural dynamics. The substrate is not a conventional digital processor. It is a system whose behavior is itself neural in character: spiking, adaptive, energy-proportional, and temporally dynamic.

Governing such a substrate with a cognitive organism creates a structural coherence that no conventional control system achieves: the cognitive organism (whose abstract domain is cognitive flow) governs the physical hardware (whose physical behavior instantiates cognitive computation). The governance architecture is cognate with the governed system. This paper specifies the complete 42-node mapping of NeuroCore primitives to neuromorphic hardware variables, the novel governance challenges posed by spiking substrates, the hard constraint layer for neuromorphic safety, and the recursive coupling relationship between the governance organism and the cognitive processes it enables.

---

## 1. Introduction

### 1.1 Neuromorphic Computing and the Control Gap

Neuromorphic computing — computation implemented through spiking neural network dynamics on specialized hardware — presents a governance challenge that conventional process control cannot address. The hardware's behavior is not describable as a fixed set of states transitioning through defined operations. It is a continuous, high-dimensional, temporally dynamic system whose salient variables are spike rates, synaptic weights, inter-population coherence, and energy consumption per computation — not clock cycles, memory addresses, and instruction counts.

Existing control systems for neuromorphic hardware (power management units, thermal controllers) treat these chips like conventional processors: manage thermal envelope, manage power delivery, alert on fault conditions. They do not govern the computational quality — the degree to which the spiking dynamics are producing coherent, useful computation versus generating noise. They have no vocabulary for the distinction.

NeuroCore Physical provides that vocabulary. The LD/PR/FS/SL primitives applied to neuromorphic substrate variables produce a governance system that can distinguish coherent high-quality computation from incoherent noise generation — and respond to that distinction with appropriate mode transitions and output adjustments.

### 1.2 The Recursion

There is a structural recursion in NeuroCore Physical that does not appear in any other L-SOC physical instantiation. HydroCore governs hydraulics — an organism governing a domain it does not instantiate. NeuroCore Physical governs neuromorphic computation — a cognitive organism governing hardware that physically instantiates cognitive computation.

The recursion is not circular. The governance organism (NeuroCore Physical running on conventional microcontroller firmware) and the governed substrate (the neuromorphic chip) are architecturally distinct. But the cognitive architecture of the organism is cognate with the computational architecture of the substrate. The governance loop has structural meaning: a cognitive governance layer overseeing a physical cognitive system.

This recursion is the defining feature of NeuroCore Physical and has no precedent in the existing control systems literature.

---

## 2. Neuromorphic Substrate Characteristics

### 2.1 Target Hardware

NeuroCore Physical is specified for neuromorphic hardware platforms including:

- **Intel Loihi 2:** 1 million neurons, 120 million synapses, mixed-signal architecture, on-chip learning, ~1W active power
- **IBM TrueNorth:** 4,096 cores, 256 neurons/core, binary synapses, ultra-low power (~70mW)
- **BrainScaleS (Heidelberg):** Analog silicon neurons, 200,000 neurons, operates 10,000× faster than biological real time
- **SpiNNaker:** Digital FPGA-based neuromorphic, flexible spike routing, scalable to millions of neurons

The 42-node mapping is architecture-agnostic — it maps to observable variables present across all of these platforms, not to implementation-specific registers.

### 2.2 Key Substrate Variables

Neuromorphic hardware exposes the following observable variables relevant to governance:

**Spike rate (population-level):** The aggregate firing rate of neural populations across the chip. Measured in spikes/second. High spike rates indicate active computation; very high rates indicate runaway excitation (seizure-like behavior). Very low rates indicate insufficient activity (dead network).

**Synaptic weight distribution:** The distribution of synaptic connection strengths across the network. Measures of weight variance, kurtosis, and drift indicate learning dynamics and potential saturation.

**Inter-population coherence:** The degree to which different neural populations are synchronized. High coherence indicates coordinated computation; incoherent populations indicate computation breakdown.

**Energy consumption per spike:** The metabolic efficiency of computation. Neuromorphic hardware is designed to be energy-proportional — energy cost should be proportional to spike count. Deviation indicates hardware stress.

**Thermal state:** Neuromorphic analog circuits are temperature-sensitive. Neuron firing thresholds drift with temperature, affecting computational accuracy.

**Synaptic plasticity rate:** The rate at which the learning algorithm updates synaptic weights. Too fast: catastrophic forgetting. Too slow: failure to adapt.

---

## 3. The 42-Node Mapping

### 3.1 LD — Load/Demand Primitive (11 nodes)

| Node | Variable | Description | Normalization |
|---|---|---|---|
| LD1 | Task spike demand | Incoming query rate to the neuromorphic array | spikes/s, [0, max_rate] → [-1, +1] |
| LD2 | Population load | Fraction of neuron populations actively engaged | [0, 1.0] → [-1, +1] |
| LD3 | Memory load | Synaptic utilization fraction (used weights / total) | [0, 1.0] → [-1, +1] |
| LD4 | Learning demand | Active plasticity update rate | [0, max_plasticity] → [-1, +1] |
| LD5 | I/O throughput demand | Data ingestion rate to input neurons | bytes/s → [-1, +1] |
| LD6 | Energy demand | Total power draw vs. rated capacity | [0, TDP] → [-1, +1] |
| LD7 | Inference queue depth | Pending task queue length | [0, max_queue] → [-1, +1] |
| LD8 | Spike backlog | Unprocessed spike events in routing fabric | [0, max_buffer] → [-1, +1] |
| LD9 | External coupling load | State import from coupled organisms (LIOCP) | normalized input |
| LD10 | Population recruitment rate | Rate at which dormant populations are activated | populations/s → [-1, +1] |
| LD11 | Human cognitive demand signal | BioCore coupling — human operator cognitive load | LIOCP import |

### 3.2 PR — Pressure/Stress Primitive (10 nodes)

| Node | Variable | Description | Normalization |
|---|---|---|---|
| PR1 | Spike rate pressure | Population spike rate vs. safe operating range | [safe_min, safe_max] → [-1, +1]; above max = +1 |
| PR2 | Synaptic saturation | Fraction of synaptic weights at maximum value | [0, 1.0] → [-1, +1] |
| PR3 | Coherence degradation | Inverse of inter-population coherence metric | [0, 1.0] → [-1, +1] |
| PR4 | Thermal stress | Chip temperature vs. calibrated operating range | [T_min, T_max] → [-1, +1] |
| PR5 | Weight drift rate | Rate of uncontrolled synaptic weight drift | deviation/cycle → [-1, +1] |
| PR6 | Routing congestion | Spike routing fabric utilization | [0, 1.0] → [-1, +1] |
| PR7 | Clock desynchronization | Inter-core timing jitter | ns → [-1, +1] |
| PR8 | External demand spike | Sudden demand increase from LIOCP coupling | normalized delta |
| PR9 | Inhibitory balance stress | Excitatory/inhibitory ratio deviation from calibrated | ratio deviation → [-1, +1] |
| PR10 | Operator stress coupling | BioCore PR3 import — human stress affecting chip load | LIOCP import |

### 3.3 FS — Flow/Stability Primitive (11 nodes)

| Node | Variable | Description | Normalization |
|---|---|---|---|
| FS1 | Inference flow rate | Completed inference tasks per second | [0, max_throughput] → [-1, +1] (higher = better) |
| FS2 | Spike propagation latency | Average spike travel time across the network | [min_lat, max_lat] → [-1, +1] (lower = better, inverted) |
| FS3 | Population synchrony | Coherence of population-level oscillations | [0, 1.0] → [-1, +1] (higher = better) |
| FS4 | Learning stability | Stability of synaptic weight update trajectory | variance measure → [-1, +1] (lower variance = better) |
| FS5 | I/O flow coherence | Input spike stream regularity | regularity index → [-1, +1] |
| FS6 | Energy flow efficiency | Energy consumed per useful computation unit | [optimal, max] → [-1, +1] (lower = better, inverted) |
| FS7 | Plasticity convergence | Degree to which learning is converging vs. oscillating | convergence index → [-1, +1] |
| FS8 | Inter-chip flow (if multi-chip) | State coherence across chip boundaries in multi-chip arrays | coherence metric → [-1, +1] |
| FS9 | Routing flow efficiency | Spike delivery success rate (delivered / sent) | [0, 1.0] → [-1, +1] |
| FS10 | Computational output quality | Task accuracy on benchmark subset | [0, 1.0] → [-1, +1] |
| FS11 | Governance coherence | Alignment between organism mode and substrate state | internal metric |

### 3.4 SL — Structural/Systemic Primitive (10 nodes)

| Node | Variable | Description | Normalization |
|---|---|---|---|
| SL1 | Network topology integrity | Fraction of synaptic connections functioning vs. designed | [0, 1.0] → [-1, +1] |
| SL2 | Neuron health index | Fraction of neurons within normal operating parameters | [0, 1.0] → [-1, +1] |
| SL3 | Cumulative thermal stress | Integrated thermal exposure — analog circuit aging proxy | normalized accumulated exposure |
| SL4 | Weight permanence | Long-term stability of learned weights (not drifting) | stability index → [-1, +1] |
| SL5 | Chip lifecycle fraction | Estimated remaining chip operational life based on thermal and electrical stress | [0, 1.0] → [-1, +1] |
| SL6 | Fault node fraction | Fraction of neurons/synapses flagged as faulty | [0, 1.0] → [-1, +1] (lower = better, inverted) |
| SL7 | Configuration integrity | Firmware and weight configuration checksum validity | binary + confidence |
| SL8 | Power delivery stability | Voltage rail stability under dynamic load | deviation metric → [-1, +1] |
| SL9 | Calibration drift | Deviation of neuron parameters from calibrated values | [0, max_drift] → [-1, +1] |
| SL10 | Multi-chip coupling integrity | (Multi-chip deployments) Health of inter-chip coupling | LIOCP health metric |

---

## 4. Novel Governance Nodes

### 4.1 FS10 — Computational Output Quality (Novel Node)

No prior HydroCore paper includes a node that directly measures the quality of the governed system's primary output. In hydraulic governance, output quality (was the pressure maintained within bounds?) is implicit in the node values. In neuromorphic governance, output quality is directly measurable: the chip's inference accuracy on a held-out benchmark subset run continuously as a quality monitor.

FS10 is a novel governance node because it closes the governance loop at the application level: not only is the physical substrate governed, but the quality of what the substrate is computing is a governance variable. If FS10 drops (computational accuracy degrades) while all other nodes remain nominal, the organism detects a computational quality failure that has no physical correlate — and responds by entering Advisory mode to investigate.

### 4.2 SL5 — Chip Lifecycle Fraction (Novel Node)

Analogous to the HydroCore Steam SL5 Thermal Creep Accumulation node, SL5 in NeuroCore Physical provides continuous remaining-life estimation for the neuromorphic substrate. Analog neuromorphic circuits degrade through hot-carrier injection, oxide degradation, and electromigration — all driven by temperature and current. SL5 integrates these stressors using device physics models analogous to the Norton power law used for creep, producing a continuous remaining-life estimate rather than a post-hoc inspection result.

---

## 5. Hard Constraints

### 5.1 HC-NEURO-1: Runaway Excitation

**Trigger:** PR1 (spike rate pressure) > 0.90 for more than 50ms.

**Condition:** The neuromorphic population is approaching excitatory runaway — the analog-circuit equivalent of a seizure. Unchecked, this can damage circuit components and corrupt all learned weights.

**Override:** Immediately apply inhibitory bias to all populations (assert global inhibitory signal). Reduce input drive to zero. Hold until PR1 < 0.50.

**Rationale:** Runaway excitation in neuromorphic hardware is irreversible if allowed to persist — learned weights can be corrupted by the extreme currents produced by synchronous mass firing. This constraint has no analogue in digital computing governance.

### 5.2 HC-NEURO-2: Thermal Threshold

**Trigger:** PR4 (thermal stress) > 0.95.

**Override:** Halt all non-essential computation. Reduce population activity to minimum maintenance level. Resume normal operation when PR4 < 0.70.

### 5.3 HC-NEURO-3: Weight Integrity

**Trigger:** SL4 (weight permanence) < -0.80 (rapid weight drift).

**Override:** Freeze plasticity updates (halt learning). Revert to last stable weight checkpoint. Log corruption event for human review.

---

## 6. The Recursive Coupling

### 6.1 NeuroCore Physical ↔ NeuroCore (Digital)

The recursive coupling is between NeuroCore Physical (governing the neuromorphic hardware) and NeuroCore (the L3 cognitive organism governing the human operator's cognitive state):

**NeuroCore Physical → NeuroCore:**
- FS10 (Computational Output Quality) → NeuroCore cognitive input quality modifier: if the neuromorphic substrate is producing degraded outputs, the cognitive organism governing the human using those outputs should receive lower confidence in the information quality
- SL5 (Lifecycle Fraction) → NeuroCore long-term planning input: approaching end-of-life in the computing substrate affects the cognitive planning horizon for the operator

**NeuroCore (human) → NeuroCore Physical:**
- NeuroCore LD3 (human cognitive load) → NeuroCore Physical LD11 (human cognitive demand signal): high human cognitive load may indicate the neuromorphic task complexity should be reduced
- NeuroCore PR5 (human decision fatigue) → NeuroCore Physical task queue moderation: complex queued tasks may be deferred when the human is cognitively fatigued

This coupling closes the loop between the human cognitive layer and the physical cognitive substrate — both governed by organisms derived from the same architecture, exchanging state across the human-machine boundary using LIOCP.

---

## 7. Operating Modes

| Mode | Trigger Condition | Physical Substrate Behavior | Governance Action |
|---|---|---|---|
| Optimal | All primitives green | Full inference capacity, active learning | Normal operation |
| Advisory | Any primitive yellow | Coherence slightly degraded or thermal rising | Log state, prepare to reduce load |
| Caution | Any primitive orange | Coherence degraded, thermal stress rising, output quality declining | Reduce task queue, increase inhibitory tone |
| Critical | PR1 > 0.90 or PR4 > 0.95 or SL4 < -0.80 | Hard constraint activation | HC-NEURO-1/2/3 as appropriate |
| Recovery | Post-Critical, all primitives ≤ Advisory | Substrate stabilizing | Gradual load restoration, 300s minimum |

---

## 8. Discussion and Future Work

### 8.1 Multi-Chip Neuromorphic Arrays

Large neuromorphic deployments (Loihi 2 wafer-scale, SpiNNaker 2 machines with millions of neurons) use multiple chips. NeuroCore Physical at multi-chip scale requires:

- Per-chip organism instances (each chip gets its own NeuroCore Physical)
- LIOCP coupling between chip organisms via SL10 (inter-chip coupling integrity) and FS8 (inter-chip flow)
- An aggregate organism (or Meridian-style network organism) governing the array as a whole

This is the Meridian Network architecture applied to neuromorphic computing — a subject for Cognitive Physical Instantiation Volume II.

### 8.2 Online Learning Governance

The plasticity governance (LD4, FS4, FS7, HC-NEURO-3) addresses one of the fundamental challenges in deployed neuromorphic systems: online learning in production. Current neuromorphic deployments freeze weights after training because online learning risks catastrophic forgetting and weight corruption. NeuroCore Physical's plasticity governance — monitoring learning stability and bounding update rates — provides the governance layer that makes safe online learning in production tractable.

---

## 9. Conclusion

NeuroCore Physical is the first physical instantiation of a cognitive organism in the L-SOC series. It governs a substrate whose physical behavior is itself cognitive in character — creating a structural recursion in which the cognitive governance layer and the governed physical system are architecturally cognate.

The 42-node mapping covers the full space of neuromorphic hardware observables. Two novel nodes — FS10 (Computational Output Quality) and SL5 (Chip Lifecycle Fraction) — extend the organism framework to variables unique to neuromorphic governance. Three hard constraints protect against failure modes specific to spiking neural hardware.

The organism does not change. The recursion is new.

---

## Appendix — 42-Node Summary Table

| Primitive | Nodes | Key Novel Nodes |
|---|---|---|
| LD Load/Demand | LD1–LD11 | LD11: BioCore human cognitive demand coupling |
| PR Pressure/Stress | PR1–PR10 | PR1: spike rate pressure (runaway excitation risk) |
| FS Flow/Stability | FS1–FS11 | FS10: computational output quality (novel) |
| SL Structural/Systemic | SL1–SL10 | SL5: chip lifecycle fraction (novel) |

---

## References

Andrews, J. (2026). HydroCore Physical. L-SOC Physical Instantiation Vol. I. DarkWave Studios LLC.
Andrews, J. (2026). The Lume Organism Stack. L-SOC Architecture Vol. I. DarkWave Studios LLC.
Andrews, J. (2026). Human-Machine Coupling. L-SOC Architecture Vol. IV. DarkWave Studios LLC.

Davies, M., et al. (2018). Loihi: A neuromorphic manycore processor with on-chip learning. *IEEE Micro*, 38(1), 82–99.

Merolla, P. A., et al. (2014). A million spiking-neuron integrated circuit with a scalable communication network. *Science*, 345(6197), 668–673.

Mahowald, M., & Douglas, R. (1991). A silicon neuron. *Nature*, 354, 515–518.

Chicca, E., Stefanini, F., Bartolozzi, C., & Indiveri, G. (2014). Neuromorphic electronic circuits for building autonomous cognitive systems. *Proceedings of the IEEE*, 102(9), 1367–1388.

---

*Canon³ — The Lume Synthetic Organism Canon (L-SOC)*
*Cognitive Physical Instantiation Volume I*
*© 2026 Jason Andrews / DarkWave Studios LLC. All rights reserved.*
*Patent 64/032,339 Pending.*
