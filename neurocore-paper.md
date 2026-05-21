# NeuroCore: A Four-Primitive Deterministic Cognitive Flow Organism for Attention, Clarity, Emotional Load, and Decision Equilibrium

**DarkWave Studios LLC — Canon² Technical Paper Series**
**Paper Number:** [Assign at Zenodo Upload]
**DOI:** [Assign at Zenodo Upload — doi.org/10.5281/zenodo.XXXXXXX]

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Affiliation:** DarkWave Studios LLC, Nashville, Tennessee
**Contact:** team@dwsc.io
**Website:** lume-lang.org
**Series:** Canon² — Engineering Architecture Papers
**Vertical:** Lume-Cognition
**Position in Canon:** First organism of the Cognitive Layer (after BioCore)

**Related Work:**
- Lume Language Specification — DOI: 10.5281/zenodo.19382282
- Trust Layer Ecosystem — DOI: 10.5281/zenodo.19560674
- DAIGS Framework — DOI: 10.5281/zenodo.19491784
- Lume-V Verification Suite — DOI: 10.5281/zenodo.19645097
- Lume-X Multi-Agent Cognition — DOI: 10.5281/zenodo.19443968
- Deterministic Dissolution — DOI: 10.5281/zenodo.15065493

**Companion Papers (required reading):**
- Andrews, J. (2026). BioCore: A Four-Primitive Deterministic Biological Flow Organism. DarkWave Studios LLC. Canon² Paper Series.
- Andrews, J. (2026). Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture. DarkWave Studios LLC. Canon² Paper Series.
- Andrews, J. (2026). Verdara Ultra: A Four-Primitive Deterministic Outdoor Flow Organism. DarkWave Studios LLC. Canon² Paper Series.
- Andrews, J. (2026). HydroCore: A Four-Primitive Deterministic Hydrological Flow Organism. DarkWave Studios LLC. Canon² Paper Series.

> *This preprint has not undergone peer review.*

*© 2026 DarkWave Studios LLC. All rights reserved.*

---

## Abstract

We present NeuroCore, a Lume-native deterministic cognitive flow organism for attention, clarity, emotional load, and decision equilibrium governance. NeuroCore implements the Lume 4/42 organism architecture — four irreducible flow primitives governing forty-two operational nodes — in the cognitive domain. The four primitives are Attention Flow, Intention Flow, Emotional Flow, and Cognitive Load Flow. The forty-two nodes encode the complete internal cognitive state space from focus stability and working memory load through goal clarity, decision paralysis risk, emotional reactivity, burnout pressure, and global cognitive resilience.

NeuroCore is the first organism in the Lume-Cognition vertical and occupies the cognitive layer directly above BioCore in the canonical organism stack. Where BioCore governs the biological substrate — metabolic, circulatory, neurological, and stress/thermal flows of the physical body — NeuroCore governs the cognitive output of that substrate: the attention, intention, emotion, and load that determine whether the mind is clear, stable, and capable of producing coherent decisions. The two organisms are formally coupled: BioCore exports sleep quality, stress load, recovery debt, and inflammation signals to NeuroCore as first-class input nodes, and NeuroCore exports cognitive load and emotional drift back to BioCore's stress/thermal primitive.

Unlike productivity platforms, cognitive performance tools, or mental wellness apps that provide static protocols or reactive readouts, NeuroCore operates as a deterministic organism: it maintains a continuous internal state of cognitive equilibrium across all four primitive flows simultaneously, enforces hard constraint rules that suppress performance-pushing recommendations when any node crosses a critical threshold, selects one of five operating modes deterministically based on node pattern, and evaluates multi-day trends rather than isolated readings before escalating or modifying guidance.

The paper includes a complete formal 2D/3D visual geometry specification: a polar coordinate ring with radial state encoding, four-axis primitive core in a fixed cognitive color palette, primitive envelope volumes, drift vector overlays, and three-dimensional extrusion options for time-stack and depth-stack modes. The geometry encodes cognitive equilibrium deterministically — the same input state always produces the same visual output — and includes a formal cognitive pressure and safety envelope visualization for multi-critical-node states.

**Keywords:** deterministic cognitive governance, Lume synthetic organism, cognitive flow, attention management, intention alignment, emotional load, decision fatigue, burnout prevention, 4/42 organism architecture, cognitive equilibrium, Lume-Cognition vertical, BioCore integration

---

## Table of Contents

1. Introduction
2. Background and Related Work
3. System Overview — The NeuroCore Organism
4. The Four NeuroCore Primitives
5. The 42-Node Cognitive State Ring
6. Node Threshold Architecture
7. The Deterministic Cognitive Engine
8. Operating Modes
9. BioCore Integration Model
10. Visual Geometry — 2D and 3D Representation
11. Global Invariant Enforcement
12. Implementation Considerations
13. Evaluation Framework
- Appendix A — Complete Node Definitions and Threshold Table
- Appendix B — Normalized State Mapping
- Appendix C — Cognitive Engine Decision Logic
- Appendix D — Geometry Data Model
- References

---

## 1. Introduction

### 1.1 The Problem with Cognitive Governance Today

The contemporary landscape of cognitive performance and mental wellness technology operates under a fundamental mischaracterization of what the mind is and how it fails. Productivity systems — task managers, time-blocking frameworks, GTD implementations, focus timers — treat cognitive capacity as a fixed resource to be allocated across tasks. Wellness apps treat mental state as a scalar readout to be optimized toward a target score. Coaching frameworks treat cognitive performance as a behavioral problem to be addressed through habit change. All of these approaches share the same structural flaw: they treat the mind as a static system rather than a dynamic flow.

The mind is not a container with a fixed amount of attention to allocate. It is a continuous field of interacting flows — attention that rises and falls based on sleep, recovery, task switching cost, and sensory interference; intention that drifts when executive function is depleted and goal clarity erodes; emotion that loads and shifts in patterns that compound over days; cognitive pressure that builds from accumulated load and depletes resilience. These flows interact continuously. Depleted attention amplifies decision fatigue. Emotional reactivity destabilizes intention. Burnout pressure collapses the whole system faster than any single depleted node would suggest.

No current cognitive tool maintains a continuous internal model of all four of these flows simultaneously. No current tool enforces hard constraints that protect the cognitive organism from recommendations that would push a depleted system past its safety envelope. No current tool evaluates multi-day patterns before escalating guidance, distinguishing a spike from a trend from a structural collapse.

NeuroCore is the first Lume organism specification designed to address the cognitive domain with the same architectural rigor applied to energy, water, outdoor, and biological flow governance.

### 1.2 The Cognitive Flow Reframe

The foundational insight of this work is that cognition is not a performance metric. It is a flow system. Attention is not a score — it is a continuous field that rises and falls with the biological substrate, the task environment, and the recovery history. Intention is not a goal list — it is a flow of executive direction that determines whether effort is coherent or scattered. Emotion is not a mood state — it is a load-bearing flow that either stabilizes or destabilizes every other cognitive function. Cognitive load is not a busyness measure — it is the pressure that the entire system operates under and the depletion of the resilience envelope that makes further load increasingly dangerous.

NeuroCore applies the Lume 4/42 organism architecture to this cognitive flow system. The result is not a productivity tool or a wellness app. It is a cognitive governance organism: a system that maintains equilibrium across all four flows, enforces safety constraints, adapts its outputs deterministically as conditions change, and never recommends actions that would damage the cognitive organism in order to extract short-term performance.

### 1.3 Position in the Lume Organism Stack

NeuroCore occupies a specific position in the canonical Lume organism hierarchy:

```
COGNITIVE LAYER:    NeuroCore (this paper)
BIOLOGICAL LAYER:   BioCore
PHYSICAL LAYER:     Meridian / Verdara Ultra / HydroCore
```

The physical layer organisms (Meridian, Verdara Ultra, HydroCore) govern the external physical environment. BioCore governs the internal biological substrate of the human organism. NeuroCore governs the cognitive output of that biological substrate — the mind-layer that emerges from and depends upon the biological layer, and that in turn shapes the biological layer through the bidirectional coupling between cognitive and physiological stress.

This layering is not merely conceptual. It is operational: NeuroCore receives formal inputs from BioCore (sleep quality, stress load, recovery debt, inflammation) that directly populate specific NeuroCore nodes. Cognitive degradation caused by poor sleep is not a vague correlation — it is a formally specified coupling between BioCore N1/N2 (Sleep Duration/Quality) and NeuroCore A10 (Attention Fatigue) and L7 (Sleep Debt Impact).

### 1.4 Novel Contributions

This work makes six distinct contributions not present in existing cognitive performance or mental wellness literature:

1. **The first formal 4/42 cognitive flow organism specification** — applying the Lume synthetic organism architecture to the cognitive domain with complete node definitions, threshold bands, and cross-primitive interaction modeling.

2. **Cognitive equilibrium as a governable state** — a formal definition of cognitive equilibrium as a continuously maintained relationship between four flow primitives, with a deterministic governance engine that seeks and restores equilibrium.

3. **Hard constraint suppression for cognitive safety** — a formal rule that suppresses performance-pushing guidance when any cognitive safety node crosses a critical threshold, replacing the default behavior of most cognitive tools (which continue pushing regardless of system state).

4. **Five-mode deterministic cognitive operating system** — Focus, Recovery, Emotional Stabilization, Decision, and Cognitive Safety modes selected by the engine based on node pattern, each activating a qualitatively different guidance profile.

5. **Formal BioCore integration specification** — a complete formal mapping of the bidirectional coupling between BioCore's biological primitives and NeuroCore's cognitive nodes, establishing the first organism-to-organism coupling specification in the Lume ecosystem.

6. **Deterministic 2D/3D cognitive geometry** — a full visual geometry specification including polar coordinate ring, four-axis core in the cognitive color palette, primitive envelope lobes, drift vector overlays, cognitive pressure visualization, and 3D time-stack and depth-stack extrusion modes.

### 1.5 Scope and Honest Limitations

NeuroCore does not diagnose cognitive or psychiatric disorders. It does not replace clinical neuropsychology, psychiatry, or psychotherapy. The E4 (Depression Load) and E3 (Anxiety Load) nodes are governance signals within the BioCore-NeuroCore wellness framework, not clinical diagnostic instruments. When these nodes cross critical thresholds, NeuroCore explicitly recommends clinical evaluation — it does not attempt to provide clinical intervention.

All node threshold bands are initial specifications subject to empirical calibration. Subjective nodes populated through self-report are dependent on honest and accurate self-assessment, which is itself impaired when the cognitive system is under significant load.

### 1.6 Paper Organization

Section 2 reviews related work. Section 3 presents the NeuroCore system overview. Sections 4 through 6 define the primitives, nodes, and threshold architecture. Section 7 describes the deterministic cognitive engine. Section 8 describes the five operating modes. Section 9 specifies the BioCore integration model. Section 10 presents the visual geometry specification. Section 11 defines global invariant enforcement. Sections 12 and 13 address implementation and evaluation.

---

## 2. Background and Related Work

### 2.1 Attention and Executive Function Research

The cognitive science of attention is among the most thoroughly studied domains in experimental psychology [1, 2]. Kahneman's resource model established the foundational framework of attention as a limited-capacity resource with an allocation policy governed by arousal and effort [1]. Baddeley's working memory model characterized the central executive, phonological loop, and visuospatial sketchpad as the working components of active cognition [3]. Research on sustained attention, mind-wandering, and task-switching cost has produced rich empirical literatures on the conditions under which attentional capacity degrades and recovers [4, 5].

NeuroCore's Attention Flow primitive (A1–A10) is grounded in this literature: focus stability, distractibility, task-switching cost, working memory load, and attention fatigue are all formally characterized constructs with published measurement instruments. The NeuroCore node definitions translate these constructs into continuous governance variables within the 4/42 architecture.

### 2.2 Executive Function and Decision-Making

Executive function — the set of cognitive control processes that govern goal-directed behavior, including planning, inhibition, cognitive flexibility, and working memory — is the cognitive substrate of NeuroCore's Intention Flow primitive [6, 7]. Decision fatigue research has documented the progressive depletion of decision quality under sustained decision load — a phenomenon that the L9 (Decision Fatigue) node formally tracks [8]. The literature on ego depletion, though contested in its precise mechanisms, is consistent with the observation that sustained self-regulatory demand degrades subsequent performance across domains [9].

### 2.3 Emotional Regulation and Affect Science

Gross's process model of emotion regulation established the foundational taxonomy of regulatory strategies and their downstream consequences for adaptive function [10]. Research on affective forecasting, emotional contagion, and mood-congruent cognition demonstrates the pervasive influence of emotional state on cognitive performance across all domains [11, 12]. Social baseline theory [13] and the evidence base for social isolation as a biological and psychological hazard provide the grounding for NeuroCore's E7 (Social Overload) and E8 (Social Withdrawal Pressure) nodes.

### 2.4 Burnout and Cognitive Exhaustion

Maslach's foundational burnout framework — exhaustion, cynicism, and reduced professional efficacy — has been extended by subsequent research to characterize the neurobiological underpinnings of burnout: sustained HPA axis activation, reduced prefrontal function, and structural brain changes following chronic workplace stress [14, 15]. NeuroCore's L3 (Burnout Pressure) node is grounded in this literature and is formally coupled to BioCore's S6 (Burnout Risk) through the BioCore integration model (Section 9).

### 2.5 Lume Organism Architecture

The Lume 4/42 organism architecture was established in the energy domain by Meridian [Andrews, 2026] and extended to the outdoor, hydrological, and biological domains by Verdara Ultra, HydroCore, and BioCore [Andrews, 2026]. BioCore [Andrews, 2026] is the immediate predecessor organism in the stack and the primary data source for NeuroCore's biological input nodes. The architecture's core properties — determinism, invariant enforcement, hard constraint routing, and scale-invariant fractal structure — carry forward unchanged into NeuroCore.

---

## 3. System Overview — The NeuroCore Organism

### 3.1 Core Thesis

NeuroCore ingests cognitive signals — attention patterns, behavioral indicators of intention coherence, emotional load, and cognitive pressure — maintains a stable internal state of cognitive equilibrium, and outputs deterministic guidance for mental clarity, focus, emotional regulation, decision pacing, and cognitive resilience.

Cognitive equilibrium exists when:
- Attention is stable and sufficiently sustained to support current task demands
- Intention is coherent — the practitioner has a clear sense of direction and can act on it
- Emotional state is regulated within a functional range — neither blunted nor reactive
- Cognitive load is within a safe operating envelope with reserve capacity available

Equilibrium is not peak performance. A practitioner in cognitive equilibrium may be producing far below their technical capability — the organism does not optimize for maximum output. It governs for sustained, safe, resilient function. The distinction is fundamental: a governance system that optimizes for output will destroy cognitive resilience over time. NeuroCore optimizes for equilibrium.

### 3.2 The 4/42 Structure

The global state of NeuroCore at any moment is represented by two vectors:

**Primitive State Vector N:**
```
N = [AttentionFlow, IntentionFlow, EmotionalFlow, CognitiveLoadFlow]
```
Each element is a scalar in [−1.0, +1.0] computed as a weighted mean of its constituent nodes.

**Node State Ring R:**
```
R = [A1..A10, I1..I10, E1..E11, L1..L11]
```
Each element is a normalized scalar in [−1.0, +1.0] derived from available cognitive data via the normalized state mapping function.

### 3.3 Temporal Scale Structure

NeuroCore is fractal across three temporal scales:

- **Moment-level organism:** State at the current hour or session. The primary real-time operating resolution.
- **Day-level organism:** Mean or worst-case envelope over the current day. The primary guidance generation resolution.
- **Week-level organism:** Trajectory of day-level organisms over the past seven days. The trend-detection and pattern-classification resolution.

The cognitive engine's trend-awareness (Rule 6) operates across all three scales. A moment-level spike in L4 (Overwhelm) does not trigger the same response as a week-level pattern of sustained L4 elevation. The temporal structure prevents false positive escalation from transient states while ensuring that genuine developing patterns are caught early.

### 3.4 Organism Identity

NeuroCore's identity is defined by its governing invariants (Section 11), its primitive definitions (Section 4), its node definitions and threshold table (Sections 5 and 6), and its cognitive engine rules (Section 7). No guidance output that violates a governing invariant is a NeuroCore output.

---

## 4. The Four NeuroCore Primitives

### 4.1 Attention Flow

Attention Flow governs the quality, stability, and recovery capacity of directed cognitive attention. It is the foundation of all purposeful cognitive activity — without adequate attention, intention cannot be executed, emotion cannot be regulated effectively, and load cannot be accurately assessed. A positive Attention Flow state indicates stable, sustainable, precise attention — the practitioner can direct focus, sustain it without excessive effort, and recover it quickly when interrupted. A negative Attention Flow state indicates fragmented, unstable, or fatigued attention — the mind wanders, task switching is expensive, and cognitive precision degrades.

Attention Flow is governed by ten nodes (A1–A10). The most operationally critical for moment-to-moment cognitive function are A1 (Focus Stability) and A7 (Attention Recovery Speed), as these determine not just whether focus is intact now but whether the system can repair itself after disruptions. A10 (Attention Fatigue) is the primitive's terminal safety node — when attention is not merely poor but exhausted, the guidance engine's hard constraint Rule 1 activates.

### 4.2 Intention Flow

Intention Flow governs goal coherence, executive direction, motivation, and the capacity to convert purpose into action. Where Attention Flow is about what the mind can see clearly, Intention Flow is about where it is pointed and how strongly. A positive Intention Flow state indicates clear goals, strong motivation, intact executive function, a coherent sense of what to do next, and the cognitive confidence to act on it. A negative Intention Flow state indicates a directionless or fragmented executive system — the practitioner may have technically adequate attention but no coherent target for it, or may face such severe decision paralysis that no action is possible regardless of attention quality.

Intention Flow is governed by ten nodes (I1–I10). The most safety-critical is I5 (Decision Paralysis Risk), which represents the failure mode in which the executive system is so depleted or overloaded that effective decision-making stops entirely. I6 (Internal Narrative Coherence) is among the most important nodes in the full 42-node ring because narrative incoherence — the sense that one's life, work, or relationships no longer make sense in a coherent story — is an early warning of multiple downstream failures including burnout (L3), depression load (E4), and sustained intention collapse.

### 4.3 Emotional Flow

Emotional Flow governs the tone, stability, and regulatory capacity of the affective system. Emotion is not a separate domain from cognition — it is a cognitive primitive. Emotional state shapes what information gets encoded in memory, what options get evaluated in decision-making, what risks get weighted, and how social interactions are interpreted. A positive Emotional Flow state indicates mood stability, appropriate reactivity calibrated to circumstances, low anxiety and depression load, and a healthy social interface. A negative Emotional Flow state indicates affective instability — unpredictable mood, disproportionate reactivity, anxiety or depression loading, and the social withdrawal or overload that compounds the biological and cognitive burden.

Emotional Flow is governed by eleven nodes (E1–E11). E11 (Emotional Safety Index) is the composite terminal node — it integrates the states of all other Emotional Flow nodes into a single overall assessment of whether the emotional system feels safe and stable. When E11 is degraded, the practitioner's cognitive decision space contracts: they make choices to avoid threat rather than to pursue goals, which is the emotional signature of a system that has shifted from growth mode to survival mode.

### 4.4 Cognitive Load Flow

Cognitive Load Flow governs the pressure under which the entire cognitive organism operates and the resilience envelope that determines how much additional load can be safely absorbed. It is the most systemic of the four primitives — where Attention, Intention, and Emotional Flow each govern a specific cognitive capacity, Cognitive Load Flow governs the operating conditions that shape all three simultaneously. A positive Cognitive Load Flow state indicates sustainable demand levels, adequate cognitive bandwidth, and positive recovery momentum. A negative Cognitive Load Flow state indicates overloaded conditions — the organism is managing more than it can sustainably process, depleting its resilience faster than it can restore it.

Cognitive Load Flow is governed by eleven nodes (L1–L11). The most consequential for long-term cognitive health are L3 (Burnout Pressure) and L11 (Global Cognitive Resilience). Burnout Pressure (L3) is NeuroCore's primary hard constraint trigger: when L3 crosses caution, all performance-increasing guidance is suppressed. Global Cognitive Resilience (L11) is the terminal safety node of the entire ring — the final integrated assessment of how much adaptive capacity the cognitive organism retains before any additional load begins causing irreversible degradation rather than manageable fatigue.

---

## 5. The 42-Node Cognitive State Ring

### 5.1 Attention Flow Nodes (A1–A10)

**A1 — Focus Stability**
The consistency of directed attention on a chosen cognitive object or task. Low focus stability means the practitioner's attention repeatedly and involuntarily shifts away from the intended target without deliberate choice to do so.

**A2 — Distractibility Index**
Susceptibility to interruption by external stimuli (sounds, notifications, environmental movement) and internal stimuli (intrusive thoughts, emotional noise, physical discomfort). High distractibility amplifies the cost of every A3 (Task Switching) event.

**A3 — Task Switching Cost**
The cognitive overhead — in time, energy, and error rate — imposed by each shift between distinct cognitive tasks. High task switching cost means that context switches are expensive, and a work environment with frequent interruptions is especially damaging.

**A4 — Working Memory Load**
The degree to which the working memory buffer is currently at or near capacity. High working memory load leaves no margin for the holding and manipulation of new information, degrading comprehension, error detection, and creative combination.

**A5 — Sensory Interference**
The degree to which sensory input is competing with or disrupting cognitive processing. Distinguished from distractibility (A2) in that sensory interference is specifically about the volume and intrusiveness of the sensory environment — not the practitioner's response to it.

**A6 — Cognitive Drift (Mind Wandering)**
Frequency and depth of unprompted shift from task-oriented thinking to self-referential or unrelated thought. At moderate levels, mind wandering is associated with creativity and insight. At high levels, it indicates attentional dysregulation.

**A7 — Attention Recovery Speed**
The speed with which directed attention can be re-established after it has been interrupted, distracted, or has drifted. A practitioner with low A7 takes long to regain productive focus after each interruption, making frequent-interruption environments especially costly.

**A8 — Precision/Detail Orientation**
The current capacity for fine-grained, careful, detailed cognitive work — proofreading, mathematical computation, code review, surgical task execution. Precision tasks require higher attentional resources and are the first to degrade when any Attention Flow node is compromised.

**A9 — Information Saturation**
The degree to which additional information input can be meaningfully processed versus being lost, misencoded, or creating confusion. High saturation means the practitioner has reached the point where more information reduces rather than improves decision quality.

**A10 — Attention Fatigue**
Cumulative depletion of attentional capacity through sustained cognitive effort, extended focus, or repeated attentional recovery from interruption. Attention fatigue is the Attention primitive's terminal safety node — at critical levels, voluntary direction of attention is no longer functionally possible.

### 5.2 Intention Flow Nodes (I1–I10)

**I1 — Goal Clarity**
The degree to which the practitioner has a clear, specific, achievable sense of what they are working toward in their current context. Vague or absent goal clarity is the primary driver of intention drift and productive-effort waste.

**I2 — Motivation Level**
The current level of intrinsic and extrinsic motivational energy available for goal pursuit. Motivation is not willpower — it is the affective state that makes effort feel worthwhile. Sustained low motivation is a leading indicator of L3 (Burnout Pressure) and E4 (Depression Load).

**I3 — Executive Function Strength**
The current capacity of the prefrontal executive control system: planning, inhibition of irrelevant responses, cognitive flexibility, and updating of working memory. Executive function is the infrastructure of all deliberate cognitive action.

**I4 — Decision Direction**
The sense of knowing what to do next — not just having a goal (I1) but having a clear immediate action that moves toward it. When I4 is degraded, the practitioner has goals but cannot translate them into actions, producing frustrating unproductive cycles of thinking without doing.

**I5 — Decision Paralysis Risk**
The probability that executive function is sufficiently depleted, overloaded, or conflicted that effective decision-making is no longer possible. High I5 means that presenting the practitioner with more options will make things worse, not better. The first guidance response to elevated I5 is radical simplification: reduce choices to one.

**I6 — Internal Narrative Coherence**
The degree to which the practitioner's experience of their own life, work, and relationships forms a meaningful, consistent, self-authored story. Narrative fragmentation — the sense that things no longer make sense, that actions feel arbitrary, that identity is unclear — is an early and severe signal of systemic cognitive distress that often precedes burnout collapse.

**I7 — Purpose Alignment**
The degree to which current activities feel connected to the practitioner's deeper values and long-term purpose. Low purpose alignment is not merely a dissatisfaction signal — it is a cognitive drain: effort directed at activities that feel purposeless costs more attention, generates more resistance, and recovers more slowly.

**I8 — Initiative Momentum**
The current tendency toward self-initiated action versus passive responsiveness or avoidance. High initiative momentum means the practitioner starts tasks, takes action, and moves forward without requiring external push. Low initiative momentum means even highly important tasks are avoided, deferred, or partially completed.

**I9 — Cognitive Confidence**
The practitioner's current self-assessment of their own cognitive capacity — their belief in their ability to think clearly, make good decisions, and execute effectively. Cognitive confidence is itself a cognitive resource: low confidence impairs performance independent of actual capability through the well-documented mechanisms of stereotype threat, imposter syndrome, and anxiety interference [16].

**I10 — Intention Recovery Speed**
The speed with which coherent intention can be restored after disruption — after an emotionally jarring event, an unexpected failure, a context switch, or a significant decision. Low I10 means that disruptions to intention have long recovery tails.

### 5.3 Emotional Flow Nodes (E1–E11)

**E1 — Mood Stability**
The consistency and predictability of emotional tone across time and contexts. Unstable mood — frequent, unpredictable shifts in emotional valence without clear external causes — is a governance signal distinct from both reactivity (E2) and depression/anxiety load (E3, E4).

**E2 — Emotional Reactivity**
The magnitude and speed of emotional response to environmental triggers. High reactivity means the practitioner's emotional responses are disproportionate to their triggers, consuming cognitive resources and destabilizing the other three primitives.

**E3 — Anxiety Load**
The current burden of anxiety — persistent worry, anticipatory threat processing, physiological arousal without corresponding threat, avoidance behavior. Anxiety load directly impairs A1 (Focus), I5 (Decision Paralysis), and L4 (Overwhelm).

**E4 — Depression Load**
The current burden of depressive affect — reduced motivation, anhedonia, cognitive slowing, social withdrawal, and reduced behavioral activation. E4 is a clinical escalation node: at caution and critical levels, NeuroCore issues explicit professional referral guidance.

**E5 — Irritability/Frustration**
The current threshold for frustration responses and the frequency of irritability events. Elevated irritability is a surface manifestation of multiple underlying states: insufficient sleep, sustained cognitive load, pain, hunger, or relational stress. It is an important early warning node precisely because it is observable by others before the practitioner fully registers it internally.

**E6 — Emotional Drift**
Unexplained, slow-moving shifts in emotional tone that are not clearly linked to identifiable events. Emotional drift is distinguished from mood instability (E1) in its temporal character: drift is gradual, and may only become apparent over days. Negative drift — a gradual darkening of baseline emotional tone without clear cause — is one of the earliest available signals of developing burnout (L3) or depressive episode (E4).

**E7 — Social Overload**
The degree to which social demands and interactions are currently exceeding the practitioner's emotional processing capacity. Introversion-related social drain, high-conflict relational environments, and sustained emotional labor all contribute to E7. High E7 drives E8 (Social Withdrawal Pressure) and depletes E10 (Empathy/Connection Capacity).

**E8 — Social Withdrawal Pressure**
The urge or tendency to reduce social engagement below the practitioner's own preferred baseline. Distinguished from healthy introversion recovery time — E8 is elevated when the pull toward isolation is stronger than the practitioner would choose it to be, and when it begins to erode E10 (connection capacity) and I7 (purpose alignment).

**E9 — Emotional Recovery Speed**
The speed with which emotional regulation is restored after a destabilizing event — an argument, a significant disappointment, an anxiety spike, or an emotionally demanding interaction. Low E9 means that emotional disruptions have long recovery tails that consume cognitive resources across multiple subsequent sessions.

**E10 — Empathy/Connection Capacity**
The current capacity to engage with others' emotional experiences — to feel genuine interest, compassion, and relational presence. Depleted empathy capacity is an early clinical signal of burnout: the shift from caring engagement to cynical detachment is one of Maslach's three burnout dimensions [14].

**E11 — Emotional Safety Index**
Composite terminal node. The overall assessment of whether the emotional system feels safe, stable, and able to engage with the world from a regulated, non-threat-dominated posture. Low E11 is the emotional signature of survival mode — the state in which all cognitive resources are diverted to threat processing and coping, leaving none for growth, creativity, or connection.

### 5.4 Cognitive Load Flow Nodes (L1–L11)

**L1 — Acute Cognitive Load**
The total demand currently being placed on the cognitive system by immediate tasks, decisions, and responsibilities. Acute load is normal and productive within the organism's safe operating envelope. It becomes problematic when it is sustained without relief, or when it combines with chronic load (L2) to exceed total capacity.

**L2 — Chronic Cognitive Load**
The baseline level of cognitive demand the practitioner has been carrying over weeks to months — the sustained background pressure of ongoing responsibilities, commitments, and unresolved open loops. Chronic load is the primary depletor of L11 (Global Cognitive Resilience) and the primary upstream driver of L3 (Burnout Pressure).

**L3 — Burnout Pressure**
The probability that the organism's cumulative demand-recovery imbalance is approaching the burnout threshold — the state of cognitive, emotional, and motivational exhaustion from which recovery is measured in months, not days. L3 is NeuroCore's primary hard constraint trigger. When L3 crosses caution, all performance-pushing guidance is suppressed.

**L4 — Overwhelm Index**
The subjective experience of demand exceeding capacity — the sense that there is too much to handle, that control has been lost, that no adequate response to current demands exists. Overwhelm is distinct from high load (L1): it is the cognitive state that results when L1 exceeds perceived capacity, regardless of actual throughput.

**L5 — Narrative Fragmentation Risk**
The probability that the practitioner's internal organizing narrative — the story that makes their work, decisions, and identity coherent — is beginning to break down. High L5 interacts with I6 (Internal Narrative Coherence) as both a cause and consequence: fragmentation risk is elevated when L2 is sustained, and narrative fragmentation in turn depletes I6.

**L6 — Cognitive Exhaustion**
Cumulative depletion of cognitive processing capacity through sustained effort. Distinguished from attention fatigue (A10) in that cognitive exhaustion is global — it is not just that attention is depleted, but that all cognitive operations (working memory, reasoning, inhibition) are degraded.

**L7 — Sleep Debt Impact**
The direct effect of accumulated sleep deficit on current cognitive performance. This is NeuroCore's primary formal intake node from BioCore — populated directly from BioCore's N1 (Sleep Duration) and N2 (Sleep Quality) states. Sleep debt is not merely fatiguing; it produces specific cognitive impairments in attention, executive function, emotional regulation, and decision quality that are formally mapped onto NeuroCore's other node categories.

**L8 — Stress Integration**
The cognitive load contribution from biological stress, populated from BioCore's S1 (Acute Stress), S2 (Chronic Stress), and S8 (Recovery Debt) states. Biological stress impairs cognitive function through HPA axis activation, glucocorticoid effects on prefrontal function, and attentional narrowing. L8 is the second primary BioCore intake node.

**L9 — Decision Fatigue**
Cumulative depletion of decision quality through sustained decision-making demands. Decision fatigue has a distinct signature: early in a decision-making session, decisions tend to be careful and nuanced; late in a session, decisions tend toward default options, status quo bias, or impulsive choices that minimize immediate cognitive demand at the cost of quality.

**L10 — Cognitive Recovery Momentum**
The direction and rate of the organism's cognitive recovery trajectory — is cognitive capacity being restored faster than it is being depleted? The trend node for Cognitive Load Flow, analogous to BioCore's S10 (Healing Momentum). Negative recovery momentum is an early warning that the organism is on a trajectory toward L6 or L3 even if current absolute load is not yet critical.

**L11 — Global Cognitive Resilience**
The integrated capacity of the cognitive organism to absorb additional demands without crossing into dysfunction. The terminal safety node of the entire 42-node ring. Critical L11 is a prerequisite for Cognitive Safety Mode activation — NeuroCore's highest alert state, in which guidance becomes maximally protective and clinical referral is explicitly recommended.

---

## 6. Node Threshold Architecture

### 6.1 Three-Band Threshold Model

Each of the forty-two nodes is governed by three threshold bands: advisory (heightened awareness, no guidance change), caution (behavioral modification recommended, conservatism multiplier active), and critical (hard constraint enforcement, immediate escalation).

### 6.2 Personal Baseline Priority

For nodes that can be tracked over time through behavioral observation or self-report (A1, I2, E1, L1, L2), the primary threshold reference is deviation from the practitioner's personal baseline rather than population-level norms. Baseline calibration requires a minimum of 14 days of consistent self-report data. Population-level defaults apply until sufficient personal baseline data is available.

### 6.3 Normalized State Mapping

All raw node values are mapped to normalized state s ∈ [−1.0, +1.0]:

```
optimal band:   s = +0.3 to +1.0
advisory band:  s =  0.0 to −0.3
caution band:   s = −0.4 to −0.7
critical band:  s = −0.8 to −1.0
```

For subjective nodes, a self-report scale (1–10) is mapped linearly: 8–10 → optimal, 6–8 → advisory, 4–6 → caution, 1–4 → critical.

### 6.4 Primitive State Aggregation

Each primitive's scalar state is a weighted mean of its constituent node states. Safety-critical nodes receive elevated weights:

- A1 (Focus) and A10 (Fatigue) have elevated weights within Attention Flow
- I5 (Paralysis) and I6 (Narrative Coherence) have elevated weights within Intention Flow
- E3 (Anxiety), E4 (Depression), and E11 (Safety Index) have elevated weights within Emotional Flow
- L3 (Burnout), L7 (Sleep Debt), and L11 (Resilience) have elevated weights within Cognitive Load Flow

---

## 7. The Deterministic Cognitive Engine

### 7.1 Inputs and Outputs

**Inputs:**
- Self-report (clarity, mood, stress, overwhelm, motivation — on structured 1–10 scales)
- Behavioral signals (reported task switching frequency, procrastination, avoidance, decision deferral)
- BioCore outputs (L7 ← BioCore N1/N2; L8 ← BioCore S1/S2/S8; see Section 9)
- Context (workload, deadlines, social demands, life events, physical environment)
- Complete 42-node state vector R
- Day-level and week-level organism state vectors (for trend-awareness)

**Outputs:**
- Cognitive mode selection (Section 8)
- Prioritized guidance recommendations
- Drift warnings (trajectory alerts before threshold crossings)
- Load balancing recommendations
- Equilibrium insights (explanations of current state patterns)
- Clinical referral recommendations when warranted

### 7.2 The Six Cognitive Engine Rules

**Rule 1 — Hard Constraint: Cognitive Safety Suppression**

If any node crosses critical threshold (s ≤ −0.8), the cognitive engine:
1. Suppresses all recommendations that add cognitive load or push performance
2. Activates mandatory recovery guidance for the affected primitive
3. Escalates the critical node to the primary guidance position
4. Does not return to performance guidance until the critical node recovers to caution-band or better

Special cases with lower trigger thresholds (activate at caution, s ≤ −0.4):
- L3 (Burnout Pressure): all non-essential load suppressed, Cognitive Safety Mode evaluated
- E4 (Depression Load): clinical referral language activates
- L11 (Global Cognitive Resilience): Cognitive Safety Mode evaluation triggered

**Rule 2 — Attention Routing**

When A1 (Focus Stability) or A7 (Attention Recovery Speed) is at caution or below:
- Recommend monotasking: reduce number of active contexts to one
- Reduce scheduled context switches
- Increase recovery intervals between focus sessions
- Protect focus blocks from interruption

When A9 (Information Saturation) is at caution:
- Recommend information fast: reduce new information intake
- Do not schedule research, reading, or learning tasks

**Rule 3 — Intention Routing**

When I4 (Decision Direction) or I5 (Decision Paralysis Risk) is at caution or below:
- Narrow active goals to one or two maximum
- Simplify decision architecture: reduce options, apply defaults, defer non-urgent choices
- Recommend brief goal-clarification ritual before any work session

When I6 (Internal Narrative Coherence) is at caution or below:
- Recommend journaling, reflective conversation, or coaching engagement
- Elevate I6 to primary guidance position: narrative restoration is prerequisite for intention recovery

**Rule 4 — Emotional Routing**

When E3 (Anxiety), E4 (Depression), or E5 (Irritability) is at caution or below:
- Recommend emotional decompression rituals: breathwork, journaling, movement, nature exposure
- Reduce emotional labor demands where possible
- Increase predictability and routine to reduce anticipatory stress

When E3 or E4 is at critical:
- Emit clinical referral recommendation — do not suppress regardless of user preference settings
- Activate Emotional Stabilization Mode

**Rule 5 — Load Routing**

When L1/L2 (Acute/Chronic Load) or L9 (Decision Fatigue) is at caution or above:
- Recommend cognitive unloading: externalizing open loops (capture everything into a trusted system), reducing working memory burden
- Recommend scheduled decision breaks: limit decision-making to defined windows
- Recommend deliberate recovery intervals (rest, movement, low-demand activity)

**Rule 6 — Trend-Aware Escalation**

The cognitive engine classifies each node's trajectory before escalating guidance:
- **Spike** (1–2 day degradation): advisory-level guidance adjustment only
- **Pattern** (3–7 day sustained degradation): caution-level guidance + active recovery recommendations
- **Collapse** (7+ days sustained, or L10 at negative for 5+ days): critical intervention guidance + clinical referral evaluation

The engine never escalates a spike to the same response as a collapse. A single bad day of low motivation is a spike. Three weeks of declining I2, I7, and E10 together is a collapse that warrants intensive response.

---

## 8. Operating Modes

NeuroCore selects one of five operating modes deterministically based on node pattern. The same pattern always produces the same mode.

**Focus Mode**
Triggered when: N ≥ Advisory (all primitives); L3 and L11 both in optimal or advisory band; A1 ≥ advisory; I1 and I4 both ≥ advisory.
Guidance profile: Protect focused work blocks, batch administrative decisions to low-attention periods, optimize task sequencing for deep work, maintain recovery intervals between focus sessions.
This is the highest-performance sustainable mode. The engine does not recommend pushing beyond Focus Mode — the next level up is not a mode, it is an unsustainable sprint that depletes resilience.

**Recovery Mode**
Triggered when: L7 (Sleep Debt) at caution; OR L8 (Stress Integration) at caution; OR L10 (Recovery Momentum) at negative; OR any Cognitive Load node at critical.
Guidance profile: Sleep extension (coordinate with BioCore guidance), reduce active project count, defer non-urgent decisions, prioritize pleasurable and restorative activity, reduce social demands to minimum sustainable level.
Cognitive performance guidance: Suppressed.

**Emotional Stabilization Mode**
Triggered when: E3, E4, or E5 at caution or above; OR E11 (Emotional Safety Index) at caution; OR E6 (Emotional Drift) trending negative for 5+ days.
Guidance profile: Emotional decompression rituals (breathwork, movement, creative expression), increase predictability and routine, reduce novelty and ambiguity in task environment, prioritize relational safety, clinical evaluation recommended when E4 is at caution or above.
Decision-making: Simplified — defer all non-urgent choices until E11 recovers.

**Decision Mode**
Triggered when: I4 (Decision Direction) or I5 (Decision Paralysis Risk) at caution; OR L9 (Decision Fatigue) at caution; AND attention and emotional flows both at advisory or better.
Guidance profile: Radical goal narrowing (one or two active decisions maximum), eliminate optionality where possible, apply structured decision frameworks to reduce cognitive overhead, schedule critical decisions to early in the day before L9 accumulates.
This mode is specifically for practitioners whose primary distress is decision-related rather than attention or emotion-related.

**Cognitive Safety Mode**
Triggered when: L3 (Burnout Pressure) at critical; OR L11 (Global Cognitive Resilience) at critical; OR three or more nodes across multiple primitives at critical simultaneously.
Guidance profile: All performance and productivity guidance suspended. Load reduction is mandatory, not optional. Clinical or professional support is explicitly recommended. Recovery is measured in weeks to months, not days. The practitioner's only cognitive task is to rest and restore.
This is NeuroCore's emergency operating state. It is not designed to optimize performance during a difficult period. It is designed to stop the damage.

---

## 9. BioCore Integration Model

### 9.1 Coupling Architecture

NeuroCore and BioCore are formally coupled organisms. They exchange state information through defined integration channels that map specific BioCore output nodes to specific NeuroCore input nodes. This coupling is not optional — it is a required element of the NeuroCore organism specification. A NeuroCore instance that does not receive BioCore inputs operates with reduced precision on its biological input nodes, which default to caution-band.

### 9.2 BioCore → NeuroCore Inputs

The following BioCore node states are consumed by NeuroCore as first-class inputs to specific NeuroCore nodes:

| BioCore Node | NeuroCore Node | Coupling Mechanism |
|-------------|---------------|-------------------|
| N1 Sleep Duration | L7 Sleep Debt Impact | Deficient sleep duration directly populates L7 |
| N2 Sleep Quality | L7 Sleep Debt Impact | Poor sleep quality modulates L7 independent of duration |
| S1 Acute Stress | L8 Stress Integration | Acute biological stress contributes to cognitive load |
| S2 Chronic Stress | L8 Stress Integration | Chronic stress is the dominant L8 driver |
| S8 Recovery Debt | L8 Stress Integration | Accumulated recovery debt contributes to cognitive load |
| M8 Inflammation | A10 Attention Fatigue | Systemic inflammation impairs sustained attention |
| N6 Autonomic Balance | E1 Mood Stability | Sympathetic dominance at rest drives mood instability |
| S6 Burnout Risk | L3 Burnout Pressure | Biological burnout risk is the upstream driver of cognitive burnout |
| N7 Anxiety Load | E3 Anxiety Load | BioCore anxiety state directly informs NeuroCore anxiety node |
| N8 Depression Load | E4 Depression Load | BioCore depression state directly informs NeuroCore depression node |

The mapping is not strictly 1:1 for nodes with multiple biological contributors (L7, L8). These nodes are computed as weighted functions of their input BioCore states.

### 9.3 NeuroCore → BioCore Outputs

NeuroCore exports the following to BioCore:

| NeuroCore Node | BioCore Node | Coupling Mechanism |
|---------------|-------------|-------------------|
| L2 Chronic Cognitive Load | S2 Chronic Stress | Sustained cognitive overload is a biological stress source |
| L3 Burnout Pressure | S6 Burnout Risk | Cognitive burnout pressure amplifies biological burnout risk |
| E6 Emotional Drift | N5 Emotional Stability | Cognitive emotional drift informs biological emotional state |
| L6 Cognitive Exhaustion | S8 Recovery Debt | Cognitive exhaustion contributes to biological recovery debt |

This bidirectional coupling means that neither organism is the single source of truth for shared constructs like stress and emotional state. Both organisms contribute to and receive from the shared biological-cognitive interface. A governance system that runs both organisms simultaneously maintains a richer, more accurate model than either organism could independently.

---

## 10. Visual Geometry — 2D and 3D Representation

### 10.1 Geometry Purpose and Design Intent

NeuroCore's geometry encodes cognitive state deterministically. The same input state vector always produces the same visual output. The geometry is not a data visualization — it is an organism diagram. It should feel precise, calm, and analytical: the visual language of a system that is in control of its own state representation.

### 10.2 Cognitive Color Palette

- **Attention Flow:** Bright cyan — the color of clear, directed, electric focus
- **Intention Flow:** Gold/amber — the color of purposeful warmth and directional clarity
- **Emotional Flow:** Magenta/pink — the color of affective life, connection, and empathy
- **Cognitive Load Flow:** Deep violet/indigo — the color of depth, pressure, and weight

Color is not decorative. In all geometry contexts — axes, ring arcs, cross-node links, drift vectors, alert states — color always encodes the cognitive primitive of origin.

### 10.3 The 4/42 Core and Ring

**Core (four axes, clockwise from top):**
- Up (0°): Attention Flow — bright cyan
- Right (90°): Intention Flow — gold/amber
- Down (180°): Emotional Flow — magenta/pink
- Left (270°): Cognitive Load Flow — deep violet/indigo

Each axis length encodes aggregate primitive state (−1.0 to +1.0). Axis thickness encodes volatility — rate of change over the past sensing cycle. A thick, shortening axis signals a rapidly degrading primitive requiring immediate attention.

At the tips of the four axes, a small four-sided central polygon connects them. This polygon encodes overall cognitive balance:
- When all four primitives are healthy and near-equal: the polygon is regular and symmetric
- When one primitive dominates or collapses: the polygon distorts toward or away from the affected axis
- The polygon's fill is a blended mix of all four primitive colors weighted by their current states

**Ring (42 nodes, clockwise from top):**
- Arc 1 (0°–85.7°): A1–A10, Attention nodes — cyan arc
- Arc 2 (85.7°–171.4°): I1–I10, Intention nodes — gold arc
- Arc 3 (171.4°–265.7°): E1–E11, Emotional nodes — magenta arc
- Arc 4 (265.7°–360°): L1–L11, Cognitive Load nodes — violet arc

Each node is a small circle or hexagon:
- Fill color: green (optimal), yellow (advisory), orange (caution), red (critical)
- Radial position: outward at +1.0 (healthy pulse), on ring at 0.0, inward at −1.0 (collapsing)
- Border thickness: data confidence (thinner border = lower confidence / self-report only)
- Node size: alert priority (critical nodes are rendered larger)

### 10.4 Intra-Ring Connections

**Within-primitive connections:**
Faint arcs connecting consecutive nodes within the same primitive (A1–A2, A2–A3, etc.), colored in the primitive's palette color. These make each primitive's arc segment visually coherent as a group.

**Cross-primitive coupling links:**
Thin lines between strongly coupled nodes across primitives:
- I1 (Goal Clarity) ↔ A1 (Focus Stability): intention and attention are mutually reinforcing
- E3 (Anxiety) ↔ L1 (Acute Load): anxiety is both a driver and a consequence of load
- L7 (Sleep Debt) ↔ A10 (Attention Fatigue): sleep debt is the primary biological driver of attention fatigue
- L3 (Burnout) ↔ E10 (Empathy/Connection): burnout's first behavioral signal is often depleted empathy
- I6 (Narrative Coherence) ↔ E11 (Emotional Safety): narrative stability and emotional safety are mutually dependent

### 10.5 Primitive Envelopes

Smooth contour lines tracing the outer boundary of each primitive's node positions — forming four colored "petals" around the core. The Attention envelope (cyan), Intention envelope (gold), Emotional envelope (magenta), and Cognitive Load envelope (violet) collectively show the organism's shape. A balanced organism has four roughly equal petals. A degraded organism has one or more petals that have retracted inward.

### 10.6 Drift Vectors

Small directional arrows overlaid on each node, color-coded in the primitive's palette color, indicating the trend direction:
- Arrow pointing outward (toward ring edge): improving
- Arrow pointing inward (toward core): degrading
- No arrow: stable

In 3D time-stack mode (Section 10.8), drift is visible as the slope of each node's vertical ribbon — positive slope improving, negative slope degrading.

### 10.7 Cognitive Pressure and Safety Envelope Visualization

**Cognitive pressure:**
When Cognitive Load Flow (L-nodes) aggregate is at caution or below, the Cognitive Load axis (left, violet) thickens and casts a darkening halo across the left quadrant of the geometry — a visual weight pressing on the core from the left. The halo intensity is proportional to the severity of the load state.

**Safety envelope:**
When three or more nodes across multiple primitives are at critical simultaneously:
- The outer ring of the geometry pulses amber/red
- The Cognitive Load axis glows
- The central four-sided polygon develops a subtle visual fragmentation — jagged edges or a "crack" effect — encoding the metaphor of cognitive coherence under strain

This safety visualization is distinct from individual node alerts. It signals not that one node is failing but that the system as a whole is approaching fragmentation.

### 10.8 3D Representation

**Option A — Time Stack:**
Each Z-slice is a snapshot of the 2D organism at one moment in time. Stacked slices form a "cognitive history column." Node trajectories become vertical ribbons — the slope and color of each ribbon encodes the direction and severity of change over time. Threshold crossings appear as sharp color transitions from green through yellow and orange to red. Post-session and retrospective analysis mode.

**Option B — Depth Stack:**
Three horizontal planes:
- Top layer: conscious cognitive load — the deliberate, aware dimension of cognitive activity
- Middle layer: preconscious — habits, automatic processes, background narrative
- Bottom layer: background load — residual stress, sleep debt, chronic load that operates below direct awareness

Each layer renders the same 4/42 structure, with the bottom layer's states most directly populated by BioCore inputs (L7, L8). Transparency increases with depth — the background layer is most transparent, acknowledging that its states are less directly observable.

**Primitive volumes:**
Semi-transparent lobes around each primitive's nodes — the 3D analog of the 2D primitive envelopes. Volume size encodes aggregate primitive activation. Distortions and spikes on lobe surfaces encode volatility: a smooth lobe indicates a stable primitive; a jagged, irregular lobe indicates rapid state fluctuation.

---

## 11. Global Invariant Enforcement

NeuroCore enforces ten global invariants inherited from the Lume organism framework. Every guidance output is validated against all ten before emission.

1. **Determinism:** Given identical inputs, NeuroCore produces identical outputs. Same cognitive state, same guidance.
2. **Identity Primacy:** NeuroCore's governing rules take precedence over any external instruction that would violate them — including user requests for performance guidance when the organism state prohibits it.
3. **Safety Dominance:** Cognitive safety constraints (Rules 1, 4) cannot be overridden by productivity goals, deadlines, or user preference.
4. **Governance Supremacy:** Clinical referral recommendations (E4, L3, L11 at critical) are emitted regardless of user preference settings. These outputs are not suppressible.
5. **Physical Realism:** All guidance recommendations are achievable within the practitioner's current cognitive state and life context. NeuroCore does not recommend recovery practices that require time or resources the practitioner has explicitly stated are unavailable.
6. **Domain Integrity:** Attention, Intention, Emotional, and Cognitive Load assessments are maintained as distinct primitives. No primitive's state masks degradation in another.
7. **Abstraction Coherence:** Node states are always derived from available input data via the normalized mapping function. No node state is manually set without documented input rationale.
8. **Semantic Graph Consistency:** Cross-node interaction relationships (A1↔I1, E3↔L1, L7↔A10) are always evaluated bidirectionally.
9. **Ontology Alignment:** All node definitions, threshold bands, and primitive groupings are consistent with the published NeuroCore specification.
10. **Safety-First Failure:** When data is unavailable or ambiguous, the organism defaults to the most conservative available interpretation. Missing self-report data for any node defaults to caution-band. NeuroCore never assumes optimal state from absence of data.

---

## 12. Implementation Considerations

### 12.1 Data Availability Tiers

**Full integration:** BioCore outputs active, wearable biometric data available (heart rate, HRV, sleep staging), daily structured self-report across all four primitives. Highest precision. L7 and L8 are populated directly from BioCore state.

**BioCore-linked, self-report primary:** BioCore outputs active, no wearable data. All cognitive nodes populated from structured daily self-report. L7 and L8 populated from BioCore biological state. Adequate for mode selection and primary guidance generation.

**Self-report only:** No BioCore outputs, no wearable data. All 42 nodes populated from structured daily questionnaire. L7 defaults to caution-band unless self-report explicitly indicates adequate sleep. L8 defaults to caution-band unless self-report explicitly indicates low stress. Conservatism multipliers active for all BioCore-dependent nodes.

### 12.2 Self-Report Questionnaire Design

The daily self-report questionnaire must balance comprehensiveness against cognitive load — a questionnaire that takes more than three minutes to complete will not be completed consistently, and inconsistent self-report data is worse than no data for trend-aware guidance. The recommended approach is:

- **Core daily check-in (5 items, 60 seconds):** Energy level, focus quality, mood, stress, overall clarity — populate the most critical node in each primitive plus L11 aggregate
- **Extended check-in (15 items, 3 minutes):** Full primary node coverage for all four primitives — triggered when core check-in shows any advisory or below value
- **Deep assessment (42 items, 10 minutes):** Full node-by-node assessment — triggered weekly or when extended check-in shows multiple caution-level nodes

### 12.3 Clinical Escalation Protocol

NeuroCore includes mandatory clinical escalation triggers that cannot be suppressed by user preference:

- E4 (Depression Load) at caution or critical → explicit professional mental health referral recommendation
- L3 (Burnout Pressure) at critical → physician or mental health provider consultation recommended
- L11 (Global Cognitive Resilience) at critical → professional medical evaluation recommended
- E4 + L3 both at caution or above simultaneously → urgent clinical referral recommendation

---

## 13. Evaluation Framework

### 13.1 Phase 1 — Node and Threshold Calibration

Calibrate self-report scale mappings against validated clinical instruments: the PHQ-9 (E4 Depression), GAD-7 (E3 Anxiety), Maslach Burnout Inventory (L3), and cognitive performance batteries (A1, A10, I3). Validate that NeuroCore threshold bands produce sensitivity and specificity appropriate for a continuous wellness monitoring context without over-triggering clinical escalation for transient states.

### 13.2 Phase 2 — BioCore Coupling Validation

Validate the BioCore → NeuroCore coupling coefficients against published literature on sleep deprivation and cognitive performance, chronic stress and executive function, and inflammation and attentional capacity. Verify that L7 and L8 states derived from BioCore outputs correspond to practitioner-reported cognitive impacts.

### 13.3 Phase 3 — Pilot User Study

Deploy NeuroCore with a pilot cohort of 50–100 practitioners across diverse work and life contexts. Collect daily self-report and, where available, BioCore data. Validate mode selection against expert assessment. Validate guidance appropriateness against reported outcomes over 8–12 weeks. Calibrate personal baseline algorithms against individual response patterns.

### 13.4 Phase 4 — Longitudinal Outcome Validation

Track pilot cohort outcomes over 6–12 months. Primary metrics: cognitive resilience trajectory (L11 trend), burnout risk trajectory (L3 trend), emotional safety improvement (E11 trend), decision fatigue reduction (L9 trend), and self-reported overall cognitive wellbeing. Compare against control groups using conventional productivity or wellness tools.

---

## Appendix A — Complete Node Definitions and Threshold Table

| Node | Description | Advisory | Caution | Critical |
|------|-------------|----------|---------|----------|
| A1 | Focus Stability | mild drift | frequent drift | cannot sustain |
| A2 | Distractibility Index | mild | high | extreme |
| A3 | Task Switching Cost | mild | high | extreme |
| A4 | Working Memory Load | moderate | high | at capacity |
| A5 | Sensory Interference | moderate | high | extreme |
| A6 | Cognitive Drift | mild | frequent | constant |
| A7 | Attention Recovery Speed | slightly slow | slow | stalled |
| A8 | Precision Orientation | slightly reduced | poor | unable |
| A9 | Information Saturation | moderate | high | overloaded |
| A10 | Attention Fatigue | mild | high | collapse |
| I1 | Goal Clarity | mild fog | unclear | lost |
| I2 | Motivation Level | slightly low | low | absent |
| I3 | Executive Function | mildly reduced | impaired | collapsed |
| I4 | Decision Direction | uncertain | unclear | paralyzed |
| I5 | Decision Paralysis Risk | possible | likely | active |
| I6 | Narrative Coherence | slightly fragmented | fragmented | incoherent |
| I7 | Purpose Alignment | mild disconnect | disconnected | absent |
| I8 | Initiative Momentum | slightly low | low | absent |
| I9 | Cognitive Confidence | slightly low | low | very low |
| I10 | Intention Recovery Speed | slightly slow | slow | stalled |
| E1 | Mood Stability | mild swings | frequent | volatile |
| E2 | Emotional Reactivity | slightly elevated | high | extreme |
| E3 | Anxiety Load | mild | moderate | severe |
| E4 | Depression Load | mild | moderate | severe |
| E5 | Irritability/Frustration | mild | high | extreme |
| E6 | Emotional Drift | slight | noticeable | sustained |
| E7 | Social Overload | mild | high | extreme |
| E8 | Social Withdrawal Pressure | slight | moderate | strong |
| E9 | Emotional Recovery Speed | slightly slow | slow | stalled |
| E10 | Empathy/Connection | slightly reduced | low | depleted |
| E11 | Emotional Safety Index | slightly reduced | low | unsafe |
| L1 | Acute Cognitive Load | mild | high | extreme |
| L2 | Chronic Cognitive Load | mild | high | extreme |
| L3 | Burnout Pressure | possible | likely | active |
| L4 | Overwhelm Index | mild | high | extreme |
| L5 | Narrative Fragmentation | possible | likely | active |
| L6 | Cognitive Exhaustion | mild | high | collapse |
| L7 | Sleep Debt Impact | mild | moderate | severe |
| L8 | Stress Integration | mild | moderate | severe |
| L9 | Decision Fatigue | mild | high | collapse |
| L10 | Recovery Momentum | flat | negative | strongly negative |
| L11 | Global Cognitive Resilience | slightly low | low | very low |

---

## Appendix B — Normalized State Mapping

```
// Subjective nodes — self-report scale 1–10 (10 = optimal)
function normalize_subjective(rating):
    if rating >= 8:     return lerp(+0.3, +1.0, (rating - 8) / 2)
    if rating >= 6:     return lerp(0.0, -0.3, (6 - rating) / 2)    // note: 6→0, 5→-0.15
    if rating >= 3:     return lerp(-0.4, -0.7, (6 - rating) / 3)
    else:               return lerp(-0.8, -1.0, (3 - rating) / 3)

// BioCore-derived nodes (L7, L8)
function normalize_biocore_derived(biocore_node_state):
    // BioCore state already normalized to [-1, +1]
    // Map with a slight delay factor (cognitive impact lags biological state by ~0.1 days)
    return biocore_node_state × coupling_coefficient

// Trend integration (for L10, I10, A7, E9)
function normalize_trend(recent_states, window_days):
    slope = linear_regression_slope(recent_states, window_days)
    if slope > 0:     return +lerp(0.0, +1.0, slope)
    else:             return lerp(-0.8, -1.0, abs(slope))  // negative slopes push toward critical faster
```

---

## Appendix C — Cognitive Engine Decision Logic

```
function generate_cognitive_guidance(N, R, trend, biocore_state, user_profile):
    
    // Step 1: BioCore intake
    R.L7 = normalize_biocore_derived(biocore_state.N1, biocore_state.N2)
    R.L8 = normalize_biocore_derived(biocore_state.S1, biocore_state.S2, biocore_state.S8)
    R.E3 = weighted_combine(R.E3_selfreport, biocore_state.N7)
    R.E4 = weighted_combine(R.E4_selfreport, biocore_state.N8)
    
    // Step 2: Recompute primitive states
    N = compute_primitives(R)
    
    // Step 3: Rule 1 — hard constraints
    critical_nodes = [n for n in R if n.state <= -0.8]
    suppress_performance = bool(critical_nodes)
    
    // Special lower-threshold constraints
    if R.L3.state <= -0.4 or R.L11.state <= -0.4:
        activate_cognitive_safety_evaluation()
    if R.E4.state <= -0.4 or R.E3.state <= -0.8:
        emit_clinical_referral()
    
    // Step 4: Mode selection
    mode = select_mode(R, trend)
    
    // Step 5: Rule 6 — trend classification
    trend_class = classify_trend(trend)  // spike / pattern / collapse
    
    // Step 6: Generate guidance candidates for mode
    candidates = get_mode_guidance_pool(mode)
    
    // Step 7: Apply hard constraint filter
    if suppress_performance:
        candidates = filter(candidates, lambda g: not g.adds_cognitive_load)
    
    // Step 8: Rule 2–5 routing
    candidates = apply_attention_routing(candidates, R)
    candidates = apply_intention_routing(candidates, R)
    candidates = apply_emotional_routing(candidates, R)
    candidates = apply_load_routing(candidates, R)
    
    // Step 9: Score candidates
    for g in candidates:
        g.score = (
            alpha * g.recovery_support
            - beta * g.load_added
            + gamma * trend_alignment(g, trend)
            - delta * g.risk_exposure
        )
    
    // Step 10: Output top recommendations + drift warnings
    top_guidance = sorted(candidates, by=score)[:5]
    drift_warnings = identify_drift_warnings(R, trend)
    
    return CognitiveOutput(mode, top_guidance, drift_warnings)
```

---

## Appendix D — Geometry Data Model

```json
{
  "organism": "neurocore",
  "palette": {
    "attention":      "#00E5FF",
    "intention":      "#FFC107",
    "emotional":      "#E91E63",
    "cognitive_load": "#4A148C"
  },
  "core": {
    "axes": [
      {"id": "attention",      "angle_deg": 0,   "color": "#00E5FF", "state": 0.0, "volatility": 0.0},
      {"id": "intention",      "angle_deg": 90,  "color": "#FFC107", "state": 0.0, "volatility": 0.0},
      {"id": "emotional",      "angle_deg": 180, "color": "#E91E63", "state": 0.0, "volatility": 0.0},
      {"id": "cognitive_load", "angle_deg": 270, "color": "#4A148C", "state": 0.0, "volatility": 0.0}
    ],
    "central_polygon": {
      "vertices": 4,
      "blend_color": "weighted_mix(palette, primitive_states)"
    }
  },
  "ring": {
    "base_radius": 1.0,
    "nodes": [
      {"id": "A1",  "primitive": "attention",      "angle_deg": 0,       "state": 0.0, "confidence": 1.0},
      {"id": "A2",  "primitive": "attention",      "angle_deg": 8.571,   "state": 0.0, "confidence": 1.0},
      {"id": "A3",  "primitive": "attention",      "angle_deg": 17.143,  "state": 0.0, "confidence": 1.0},
      {"id": "A4",  "primitive": "attention",      "angle_deg": 25.714,  "state": 0.0, "confidence": 1.0},
      {"id": "A5",  "primitive": "attention",      "angle_deg": 34.286,  "state": 0.0, "confidence": 1.0},
      {"id": "A6",  "primitive": "attention",      "angle_deg": 42.857,  "state": 0.0, "confidence": 1.0},
      {"id": "A7",  "primitive": "attention",      "angle_deg": 51.429,  "state": 0.0, "confidence": 1.0},
      {"id": "A8",  "primitive": "attention",      "angle_deg": 60.0,    "state": 0.0, "confidence": 1.0},
      {"id": "A9",  "primitive": "attention",      "angle_deg": 68.571,  "state": 0.0, "confidence": 1.0},
      {"id": "A10", "primitive": "attention",      "angle_deg": 77.143,  "state": 0.0, "confidence": 1.0},
      {"id": "I1",  "primitive": "intention",      "angle_deg": 85.714,  "state": 0.0, "confidence": 1.0},
      {"id": "I2",  "primitive": "intention",      "angle_deg": 94.286,  "state": 0.0, "confidence": 1.0},
      {"id": "I3",  "primitive": "intention",      "angle_deg": 102.857, "state": 0.0, "confidence": 1.0},
      {"id": "I4",  "primitive": "intention",      "angle_deg": 111.429, "state": 0.0, "confidence": 1.0},
      {"id": "I5",  "primitive": "intention",      "angle_deg": 120.0,   "state": 0.0, "confidence": 1.0},
      {"id": "I6",  "primitive": "intention",      "angle_deg": 128.571, "state": 0.0, "confidence": 1.0},
      {"id": "I7",  "primitive": "intention",      "angle_deg": 137.143, "state": 0.0, "confidence": 1.0},
      {"id": "I8",  "primitive": "intention",      "angle_deg": 145.714, "state": 0.0, "confidence": 1.0},
      {"id": "I9",  "primitive": "intention",      "angle_deg": 154.286, "state": 0.0, "confidence": 1.0},
      {"id": "I10", "primitive": "intention",      "angle_deg": 162.857, "state": 0.0, "confidence": 1.0},
      {"id": "E1",  "primitive": "emotional",      "angle_deg": 171.429, "state": 0.0, "confidence": 1.0},
      {"id": "E2",  "primitive": "emotional",      "angle_deg": 180.0,   "state": 0.0, "confidence": 1.0},
      {"id": "E3",  "primitive": "emotional",      "angle_deg": 188.571, "state": 0.0, "confidence": 1.0},
      {"id": "E4",  "primitive": "emotional",      "angle_deg": 197.143, "state": 0.0, "confidence": 1.0},
      {"id": "E5",  "primitive": "emotional",      "angle_deg": 205.714, "state": 0.0, "confidence": 1.0},
      {"id": "E6",  "primitive": "emotional",      "angle_deg": 214.286, "state": 0.0, "confidence": 1.0},
      {"id": "E7",  "primitive": "emotional",      "angle_deg": 222.857, "state": 0.0, "confidence": 1.0},
      {"id": "E8",  "primitive": "emotional",      "angle_deg": 231.429, "state": 0.0, "confidence": 1.0},
      {"id": "E9",  "primitive": "emotional",      "angle_deg": 240.0,   "state": 0.0, "confidence": 1.0},
      {"id": "E10", "primitive": "emotional",      "angle_deg": 248.571, "state": 0.0, "confidence": 1.0},
      {"id": "E11", "primitive": "emotional",      "angle_deg": 257.143, "state": 0.0, "confidence": 1.0},
      {"id": "L1",  "primitive": "cognitive_load", "angle_deg": 265.714, "state": 0.0, "confidence": 1.0},
      {"id": "L2",  "primitive": "cognitive_load", "angle_deg": 274.286, "state": 0.0, "confidence": 1.0},
      {"id": "L3",  "primitive": "cognitive_load", "angle_deg": 282.857, "state": 0.0, "confidence": 1.0},
      {"id": "L4",  "primitive": "cognitive_load", "angle_deg": 291.429, "state": 0.0, "confidence": 1.0},
      {"id": "L5",  "primitive": "cognitive_load", "angle_deg": 300.0,   "state": 0.0, "confidence": 1.0},
      {"id": "L6",  "primitive": "cognitive_load", "angle_deg": 308.571, "state": 0.0, "confidence": 1.0},
      {"id": "L7",  "primitive": "cognitive_load", "angle_deg": 317.143, "state": 0.0, "confidence": 1.0},
      {"id": "L8",  "primitive": "cognitive_load", "angle_deg": 325.714, "state": 0.0, "confidence": 1.0},
      {"id": "L9",  "primitive": "cognitive_load", "angle_deg": 334.286, "state": 0.0, "confidence": 1.0},
      {"id": "L10", "primitive": "cognitive_load", "angle_deg": 342.857, "state": 0.0, "confidence": 1.0},
      {"id": "L11", "primitive": "cognitive_load", "angle_deg": 351.429, "state": 0.0, "confidence": 1.0}
    ]
  },
  "cross_primitive_links": [
    {"from": "I1", "to": "A1", "label": "intention enables focus"},
    {"from": "E3", "to": "L1", "label": "anxiety amplifies cognitive load"},
    {"from": "L7", "to": "A10", "label": "sleep debt drives attention fatigue"},
    {"from": "L3", "to": "E10", "label": "burnout depletes empathy"},
    {"from": "I6", "to": "E11", "label": "narrative coherence supports emotional safety"}
  ]
}
```

---

## References

[1] Kahneman, D. (1973). *Attention and Effort*. Prentice-Hall.

[2] Posner, M. I., & Petersen, S. E. (1990). The attention system of the human brain. *Annual Review of Neuroscience*, 13(1), 25–42.

[3] Baddeley, A. (2000). The episodic buffer: A new component of working memory? *Trends in Cognitive Sciences*, 4(11), 417–423.

[4] Smallwood, J., & Schooler, J. W. (2015). The science of mind wandering: Empirically navigating the stream of consciousness. *Annual Review of Psychology*, 66, 487–518.

[5] Rubinstein, J. S., Meyer, D. E., & Evans, J. E. (2001). Executive control of cognitive processes in task switching. *Journal of Experimental Psychology: Human Perception and Performance*, 27(4), 763–797.

[6] Miyake, A., Friedman, N. P., Emerson, M. J., Witzki, A. H., Howerter, A., & Wager, T. D. (2000). The unity and diversity of executive functions. *Cognitive Psychology*, 41(1), 49–100.

[7] Diamond, A. (2013). Executive functions. *Annual Review of Psychology*, 64, 135–168.

[8] Baumeister, R. F., & Tierney, J. (2011). *Willpower: Rediscovering the Greatest Human Strength*. Penguin Press.

[9] Hagger, M. S., et al. (2016). A multilab preregistered replication of the ego-depletion effect. *Perspectives on Psychological Science*, 11(4), 546–573.

[10] Gross, J. J. (1998). The emerging field of emotion regulation. *Review of General Psychology*, 2(3), 271–299.

[11] Bower, G. H. (1981). Mood and memory. *American Psychologist*, 36(2), 129–148.

[12] Forgas, J. P. (1995). Mood and judgment: The affect infusion model (AIM). *Psychological Bulletin*, 117(1), 39–66.

[13] Coan, J. A., & Sbarra, D. A. (2015). Social baseline theory: The social regulation of risk and effort. *Current Opinion in Psychology*, 1, 87–91.

[14] Maslach, C., & Leiter, M. P. (2016). Understanding the burnout experience. *World Psychiatry*, 15(2), 103–111.

[15] Golkar, A., Johansson, E., Kasahara, M., Osika, W., Perski, A., & Savic, I. (2014). The influence of work-related chronic stress on the regulation of emotion. *PLOS ONE*, 9(9), e107579.

[16] Steele, C. M. (2010). *Whistling Vivaldi: And Other Clues to How Stereotypes Affect Us*. W. W. Norton & Company.

[17] Andrews, J. (2026). Lume Language Specification. DarkWave Studios LLC. DOI: 10.5281/zenodo.19382282.

[18] Andrews, J. (2026). Trust Layer Ecosystem. DarkWave Studios LLC. DOI: 10.5281/zenodo.19560674.

[19] Andrews, J. (2026). BioCore: A Four-Primitive Deterministic Biological Flow Organism. DarkWave Studios LLC. Canon² Paper Series.

[20] Andrews, J. (2026). Meridian as Synthetic Organism. DarkWave Studios LLC. Canon² Paper Series.
