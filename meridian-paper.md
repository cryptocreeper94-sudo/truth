# Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture

**DarkWave Studios LLC — Canon² Technical Paper Series**
**Paper Number:** [Assign at Zenodo Upload]
**DOI:** [Assign at Zenodo Upload — doi.org/10.5281/zenodo.XXXXXXX]

**Author:** Jason Andrews
**Affiliation:** DarkWave Studios LLC
**Series:** Canon² — Engineering Architecture Papers

**Related Work:**
- Lume Language Specification — DOI: 10.5281/zenodo.19382282
- Trust Layer Ecosystem — DOI: 10.5281/zenodo.19560674
- DAIGS Framework — DOI: 10.5281/zenodo.19491784
- Lume-V Verification Suite — DOI: 10.5281/zenodo.19645097
- Deterministic Dissolution — DOI: 10.5281/zenodo.15065493

**Provisional Patent:** Systems and Methods for Deterministic Multi-Layer Wireless Energy Routing Using Ambient Harvesting, Mesh Coordination, and Directional Transmission (DarkWave Studios LLC)

**Lume-X Control System:** Provisionally patented. Energy-domain deterministic control runtime.
**Guardian Security (Guardian-E):** Security enforcement layer. Domain: TrustShield.tech

---

## Abstract

We present Meridian, a four-layer deterministic wireless energy routing architecture that unifies ambient energy harvesting, burst-mode storage, mesh-based relay coordination, and directed wireless power delivery under a single governing framework. Meridian defines a universal energy coordinate system, a deterministic flow engine, a multi-hop mesh fabric, and a directional transmission layer — designated Meridian Core (MC), Meridian Flow Engine (MFE), Meridian Mesh Fabric (MMF), and Meridian Transmission Layer (MTL) respectively. These four layers are vertically coupled and governed by a set of global invariants that guarantee deterministic, loss-bounded, and safe energy propagation across the network regardless of ambient variability.

Meridian integrates three established DarkWave subsystems: DWER (Deterministic Wireless Energy Routing) for point-to-point directed beam delivery, DRMA (Distributed Relay Mesh Architecture) for multi-hop energy routing, and DAEH (Deterministic Ambient Energy Harvesting) for node-autonomous power accumulation. The architecture is controlled by Lume-X, a provisionally patented deterministic control runtime validated at 73 Hz cycle frequency, and enforced by Guardian Security (energy-domain designation: Guardian-E), the security layer hosted at TrustShield.tech, which addresses eleven threat categories including localization spoofing, routing table manipulation, beam hijacking, and denial-of-power attacks.

The primary technical contributions of this work are: (1) the first formal definition of deterministic wireless energy routing as a network protocol stack, with power nodes addressed as IP devices, routing tables adapted from OSPF and BGP equivalents, and quality-of-service guarantees applied to watt delivery; (2) the Self-Healing Deterministic Control Layer (SHDCL), which provides continuous autonomous recovery from failure conditions across all three physical subsystems without human intervention; (3) a formal, testable determinism standard for wireless power delivery defined by four required measurements — received power P_min (mW), spatial uncertainty radius r (cm), trial variance σ² (%), and distance d (m); (4) a burst-mode ambient harvesting integration model that makes node autonomy a first-class architectural layer rather than a supplementary subsystem; and (5) a formal biological safety layer with real-time RF exposure monitoring and automatic threshold enforcement.

No experimental data currently exists for this architecture. This paper establishes the formal theoretical and architectural foundation. No deployment-scale capability claims are made. Phase 1 experimental validation is the immediate next step.

**Keywords:** deterministic wireless energy routing, mesh energy networks, ambient energy harvesting, phased-array beamforming, self-healing control systems, deterministic control, wireless power transfer, network protocol stack for energy, burst-mode storage, biological safety layer, SHDCL, Lume-X

---

## Table of Contents

1. Introduction
2. Background and Related Work
3. System Overview
4. Meridian Core (MC): The Energy Coordinate System
5. Meridian Flow Engine (MFE): Deterministic Energy Movement
6. Meridian Mesh Fabric (MMF): Multi-Hop Coordination
7. Meridian Transmission Layer (MTL): Directional Wireless Delivery
8. Ambient Harvesting Integration (DAEH)
9. Mesh Routing Integration (DRMA)
10. Wireless Transmission Integration (DWER)
11. Global Invariant Enforcement
12. Control and Safety Layer
13. Implementation Considerations
14. Evaluation Framework
- Appendix A — Formal Definitions and Notation
- Appendix B — Meridian State Machine
- Appendix C — Mathematical Model of Loss-Bounded Flow
- Appendix D — Mesh Topology Scenarios
- Appendix E — Safety Model
- Appendix F — Reference Implementation Blueprint
- References

---

## 1. Introduction

### 1.1 The Problem with Wireless Power Today

Wireless power transfer has been a subject of active research and commercial development for more than sixty years, yet the field has not produced a system capable of operating deterministically. Current commercial wireless power systems — including resonant inductive coupling platforms, omnidirectional RF broadcast systems, and near-field charging pads — share a fundamental architectural limitation: none of them can guarantee delivery. They transmit energy into the environment and rely on proximity, orientation, or statistical averaging to achieve acceptable transfer rates. None define, measure, or enforce a formal determinism standard. None provide closed-loop confirmation of delivery. None reroute around failure. None maintain continuous safe operation in the presence of environmental perturbation, node failure, or unexpected physical intrusion.

This limitation is not a product of insufficient engineering effort. It is a consequence of the underlying architectural approach: existing wireless power systems are broadcast systems. They were not designed to route. Routing requires a formal model of the network, a defined path between source and destination, confirmation that delivery occurred, and a recovery mechanism when delivery fails. No existing wireless power system provides any of these four properties.

The consequences are practical and immediate. A wireless power system that cannot guarantee delivery cannot be used in safety-critical applications. A system without closed-loop confirmation cannot be regulated or certified with confidence. A system that fails hard when a node goes offline cannot be deployed in real-world environments where node failure is inevitable. The gap is not marginal — it is structural.

### 1.2 The Routing Reframe

The foundational insight of this work is that wireless energy delivery is a routing problem, not a transmission problem. The distinction matters precisely. A transmission system optimizes the output of a single source. A routing system optimizes the path from source to destination across a network, with explicit awareness of topology, failure, and dynamic conditions. Packet-switched data networks solved this problem decades ago, and the conceptual framework they produced — addressed nodes, routing tables, QoS guarantees, topology-aware path selection, failure detection and recovery — applies directly and powerfully to wireless energy delivery.

Meridian implements this reframe completely. Power nodes are addressed like IP devices. Energy flows along defined paths selected by routing tables. Quality of service constraints govern delivery guarantee thresholds. Topology changes propagate through a link-state protocol. Failed nodes trigger automatic path recalculation. The entire architecture is governed by a deterministic control runtime — Lume-X — that monitors every layer continuously and recovers from failure without human intervention.

This reframe produces a system with fundamentally different capabilities than any existing wireless power platform. It also produces a set of novel research contributions that are described in Section 1.4.

### 1.3 The Meridian Architecture

Meridian is a four-layer deterministic wireless energy routing architecture. The four layers are:

**Meridian Core (MC)** — the foundational coordinate system. MC defines node identity, spatial orientation, charge-state vector representation, and deterministic timing primitives. It provides the universal reference frame from which all routing, harvesting, and alignment decisions are derived. Every other Meridian layer depends on MC for its coordinate substrate.

**Meridian Flow Engine (MFE)** — the energy-flow logic layer. MFE converts charge-state data from MC into deterministic routing decisions. It manages burst-mode transmission scheduling, supercapacitor threshold evaluation, and loss-bounded energy propagation modeling. MFE ensures that energy moves predictably through the network and that no transmission is initiated without sufficient charge and a confirmed downstream path.

**Meridian Mesh Fabric (MMF)** — the multi-hop coordination layer. MMF maintains routing tables, link-state awareness, and neighbor-graph topology across the full mesh. It supports bi-directional energy movement, relay participation scheduling, and mesh-level optimization. MMF integrates DRMA logic for packet-like energy handling and resolves conflicts between nodes to prevent chaotic energy oscillation.

**Meridian Transmission Layer (MTL)** — the physical execution layer. MTL controls beam steering, RF emission shaping, safety gating, and closed-loop delivery confirmation. It receives transmission directives from MMF and MFE, executes them against the physical hardware, and returns delivery confirmation feedback that closes the control loop. MTL aligns with DWER for all directional wireless power transfer operations.

These four layers are vertically coupled and governed by five global invariants enforced continuously by Lume-X: no uncontrolled discharge, no ambiguous routing, no non-deterministic flow, no unsafe transmission events, and no mesh-level oscillation.

### 1.4 Novel Research Contributions

This work makes eleven distinct contributions not present in current wireless power or mesh networking literature:

1. **Self-Healing Deterministic Control Layer (SHDCL)** — the first application of a self-healing runtime to wireless energy routing, providing continuous autonomous recovery across all three physical subsystems.

2. **Energy Routing as a Network Protocol Stack** — DRMA formally modeled as an IP-addressed, routing-protocol-governed, QoS-guaranteed power mesh. The first application of network protocol stack architecture to wireless energy delivery.

3. **Formal Determinism Definition for Wireless Power** — the P_min/r/σ²/d framework as a precise, measurable, reproducible standard for determinism in wireless power delivery. No equivalent standard exists in current literature.

4. **Bi-Directional Energy Flow in a Mesh** — dynamic energy flow reversal based on real-time mesh state, with surplus nodes supplying depleted nodes autonomously.

5. **Natural Language Human-Machine Interface for Power Mesh Control** — plain English and voice control of a wireless energy routing system via Lume-X. No existing wireless power system has this interface layer.

6. **Formal Security Threat Model for Deterministic Energy Routing** — the first formal definition of the attack surface for a wireless power routing system, with Guardian Security as the defense framework.

7. **Burst-Mode Harvesting as a First-Class Architectural Layer** — DAEH supercapacitor burst-mode integrated as a named architectural layer coordinated by a deterministic control system.

8. **Dual-Mode Mechanical Harvester Design** — combined triboelectric and piezoelectric elements on a single mechanical substrate, driven simultaneously by the same environmental excitation.

9. **Biological Safety Layer as a Named System Component** — formally defined, continuously monitored, automatically enforced RF exposure layer with real-time power density calculation.

10. **EMP and Geomagnetic Storm Resilience Architecture** — formal analysis of inherent structural resistance to electromagnetic pulse and geomagnetic events, with explicit hardening measures.

11. **Phase-Change Material Storage for Relay Nodes** — higher energy density burst-mode storage for nodes adjacent to heat sources, underexplored in wireless power relay literature.

### 1.5 Scope and Honest Limitations

This paper presents a formal theoretical and architectural framework. No experimental data exists at time of writing. Phase 1 hardware validation — demonstrating directional gain of at least 10 dB under beam alignment versus 45-degree off-axis conditions, with result repeatability across ten consecutive trials — is the immediate next step before any publication at a venue requiring experimental results.

Current development scale powers low-power devices: sensors, wearables, IoT nodes, and microcontrollers. Claims about powering critical infrastructure, hospitals, or building-scale systems are long-horizon goals contingent on solving open efficiency and energy-density problems that remain active research challenges across the field. Those goals are identified explicitly in Section 10 as the long-term vision. They are not presented as near-term capabilities.

### 1.6 Paper Organization

Section 2 reviews prior work in wireless power transfer, mesh networking, ambient energy harvesting, and deterministic systems. Section 3 presents the Meridian system overview and the vertical coupling model. Sections 4 through 7 define each of the four Meridian layers formally. Sections 8 through 10 describe integration with DAEH, DRMA, and DWER respectively. Section 11 defines the global invariant enforcement model. Section 12 describes the Lume-X control layer and Guardian Security integration. Section 13 addresses implementation considerations. Section 14 defines the evaluation framework for Phase 1 through Phase 3 experimental validation. Six appendices provide formal definitions, state machine specifications, mathematical models, topology scenarios, the safety model, and a reference implementation blueprint.

---

## 2. Background and Related Work

### 2.1 Wireless Power Transfer

The technical lineage of wireless power transfer spans more than a century, beginning with Tesla's resonance experiments at the turn of the twentieth century and continuing through microwave power transmission, resonant inductive coupling, and near-field charging standards. Each generation advanced one dimension of the problem — efficiency, range, or convenience — without addressing the fundamental absence of routing, delivery confirmation, or determinism.

**Microwave Power Transmission (MPT).** William Brown at Raytheon demonstrated the first sustained microwave power link in the 1960s and 1970s, achieving approximately 54% rectenna conversion efficiency at fixed-point operation. Brown's work established the rectenna as the canonical receiver architecture for RF-to-DC conversion and demonstrated that directed microwave transmission was technically feasible. NASA's Solar Power Satellite concept in the 1970s extended this work to orbital scale, with theoretical analysis suggesting end-to-end system efficiencies of 5–10% from solar collection to Earth surface delivery. Brown's rectenna design is the direct technical ancestor of the DWER receiver module.

**Resonant Inductive Coupling.** Kurs et al. at MIT (2007) demonstrated mid-range wireless power transfer using strongly coupled magnetic resonators, achieving approximately 40% efficiency over 2 meters. This work revived commercial interest in wireless power and led directly to the WiTricity platform. Resonant inductive coupling operates at low frequency (tens of kilohertz to low megahertz range), is highly sensitive to receiver orientation and alignment, and does not scale to mesh architectures without interference between adjacent resonant pairs. Range is fundamentally limited by the resonator coil diameter.

**Phased-Array Beamforming.** Phased-array antenna technology is mature in radar, 5G massive MIMO, satellite communications, and sonar. The core technique — controlling the relative phase of signals fed to individual antenna elements to steer a combined beam in a desired direction — enables precise, electronically steerable, directional control of RF energy without mechanical moving parts. Modern phased-array systems at 28 GHz achieve beam widths of less than two degrees and electronic steering over the full hemisphere. DWER applies this technique to power delivery at 2.4 GHz and 5.8 GHz with 4–16 element arrays.

**Commercial Systems.** WiTricity (resonant inductive coupling) operates at short range with no beam steering, no closed-loop power confirmation, and no mesh capability. Ossia Cota (RF-based) broadcasts omnidirectionally with no deterministic routing, no closed-loop confirmation, and no mesh. Energous WattUp (RF-based) broadcasts with limited directionality, no formal determinism standard, and no mesh architecture. None of these systems formally define determinism, none provide closed-loop delivery confirmation, and none implement routing.

### 2.2 Mesh Networking and Multi-Hop Routing

The network protocol stack for data communications is one of the most thoroughly validated engineering constructs in existence. TCP/IP, OSPF link-state routing, BGP path-vector routing, and IEEE 802.11 mesh extensions have been deployed at global scale, studied extensively, and optimized over five decades. The insight that this framework applies to energy delivery — with power nodes as IP devices, routing tables governing energy path selection, and QoS constraints applying to watt delivery — is the highest-novelty contribution of this work.

Prior work on multi-hop wireless power relay has been limited. Fan et al. (2013) demonstrated two-hop resonant inductive relay chains with efficiency degradation per hop. Zhong et al. (2015) extended this to longer chains, characterizing cumulative losses. These systems use resonant inductive coupling and do not implement routing, addressing, path selection, or failure recovery. They are relay chains, not meshes. The distinction is fundamental: a relay chain has no routing intelligence, no topology awareness, no QoS, and no failure recovery. A mesh implements all four.

Software-defined networking (SDN) provides a conceptual parallel: separating the control plane from the data plane to enable dynamic, software-driven network management. Meridian implements the analogous separation for energy networks. The Lume-X control runtime is the control plane. DRMA, DWER, and DAEH are the data plane. The separation enables dynamic routing decisions without modifying the physical transmission hardware.

### 2.3 Ambient Energy Harvesting

Ambient energy harvesting for wireless sensor networks has been studied extensively since the early 2000s, driven by the need for battery-free IoT nodes. The major modalities — photovoltaic, thermal gradient (TEG), piezoelectric vibration, RF rectenna, and triboelectric (TENG) — have been characterized individually in hundreds of published works. Roundy et al. (2004) established the foundational power density analysis framework. Mitcheson et al. (2008) provided a comprehensive survey of kinetic energy harvesters. Vullers et al. (2010) benchmarked all major modalities against deployment requirements.

What does not exist in the literature is the integration of ambient energy harvesting as a first-class architectural layer in a wireless energy routing system. Existing harvesting systems are designed as isolated power sources for individual sensor nodes. They are not coordinated across a mesh, not governed by a deterministic control system, and not integrated with a directed beam supplementation layer. DAEH introduces all three of these integrations. The burst-mode supercapacitor architecture — in which low harvest rates do not prevent transmission but only increase the interval between bursts — is the enabling mechanism.

### 2.4 Deterministic Systems and Timing Models

Determinism in computing and control systems refers to the property that a given input always produces the same output, independent of external state or timing variability. Hard real-time systems — industrial controllers, medical devices, automotive safety systems, avionics — require deterministic response times and have formal tools for specifying and verifying them: rate-monotonic scheduling, earliest-deadline-first scheduling, and formal timing analysis.

No equivalent formal framework exists for wireless power delivery. The term "deterministic" appears in wireless power literature informally and inconsistently, sometimes meaning "predictable enough for practical use," sometimes meaning "repeatable under controlled laboratory conditions," and sometimes meaning nothing more than "working as intended." None of these usages constitute a testable, measurable standard.

The P_min/r/σ²/d determinism framework introduced in this work is the first formal definition of determinism for wireless power delivery. It requires four specific measurements: received power P_min (mW), spatial uncertainty radius r (cm), trial variance σ² (%), and transmission distance d (m). A result that omits any of these four values is not a deterministic result under this standard. The framework enables true experimental comparison between systems and provides a reproducible basis for regulatory analysis.

### 2.5 Identified Gaps Addressed by This Work

The review above identifies five structural gaps in current literature that Meridian addresses directly:

1. No wireless power system implements formal routing. Meridian implements the full network protocol stack architecture.
2. No wireless power system defines or enforces a formal determinism standard. Meridian defines P_min/r/σ²/d.
3. No wireless power system integrates a self-healing control runtime. Meridian integrates Lume-X with SHDCL.
4. No wireless power system integrates ambient harvesting as a coordinated architectural layer. Meridian integrates DAEH.
5. No wireless power system has a formal security threat model. Meridian integrates Guardian Security with a complete threat taxonomy.

---

## 3. System Overview

### 3.1 Architecture Summary

Meridian is best understood as an operating system for deterministic wireless energy. As an operating system, it does not perform the work itself — it governs, coordinates, and enforces invariants across the systems that do. DWER performs directional beam transmission. DRMA performs multi-hop mesh routing. DAEH performs ambient energy harvesting and burst-mode storage. Meridian provides the coordinate system, the flow logic, the mesh coordination, and the transmission governance layer that makes all three systems operate coherently as a single deterministic architecture.

The four Meridian layers map to the four primary concerns of this governance function:

- **MC (Meridian Core):** What does the network know about itself? Node identity, spatial position, charge state, and time.
- **MFE (Meridian Flow Engine):** How does energy decide where to go? Flow selection, burst scheduling, threshold evaluation.
- **MMF (Meridian Mesh Fabric):** What is the network topology and how does energy traverse it? Routing tables, link state, multi-hop coordination.
- **MTL (Meridian Transmission Layer):** How does energy physically leave a node? Beam steering, emission shaping, safety gating, delivery confirmation.

### 3.2 Vertical Coupling Model

The four layers are vertically coupled, meaning each layer depends on the layer below it and provides services to the layer above it. The coupling is strict and directional:

```
[MTL — Physical Transmission]
       ↑↓ directives / confirmation
[MMF — Mesh Coordination]
       ↑↓ flow vectors / topology data
[MFE — Flow Engine]
       ↑↓ charge state / burst schedule
[MC  — Core Coordinate System]
       ↑↓ identity / position / timing
```

**MC** is the foundation. Every other layer uses MC's coordinate substrate to represent nodes, positions, and states. MC has no dependencies on higher layers.

**MFE** consumes charge-state data from MC and produces routing decisions and burst schedules. MFE does not know about physical topology — it knows about energy states and thresholds.

**MMF** consumes flow-potential vectors from MFE and converts them into concrete routing paths using its topology knowledge. MMF knows about the network graph but not about individual node charge states — those come from MFE.

**MTL** consumes transmission directives from MMF and executes them against the physical hardware. MTL knows about RF emission, beam steering, and safety constraints, but not about routing logic — that comes from MMF.

### 3.3 Integration with DWER, DRMA, and DAEH

Meridian is the coordination layer. DWER, DRMA, and DAEH are the execution subsystems.

**Meridian ↔ DAEH.** MC receives charge-state vectors from DAEH nodes continuously. MFE evaluates these vectors against burst thresholds and schedules burst-mode releases. DAEH executes the burst on schedule and reports completion back to MC.

**Meridian ↔ DRMA.** MMF provides DRMA with flow-potential vectors, directional preferences, and relay eligibility states. DRMA returns link-state data, neighbor-graph topology, and multi-hop feasibility assessments. MMF uses this to compute deterministic flow paths and prevent oscillation.

**Meridian ↔ DWER.** MTL issues transmission directives to DWER specifying emission direction, power level, timing window, and safety constraints. DWER executes the directed beam and returns closed-loop confirmation, beam-steering feedback, and delivery verification. MTL uses this confirmation to close the power delivery control loop.

### 3.4 The Self-Healing Deterministic Control Layer

The Self-Healing Deterministic Control Layer (SHDCL) is not one of the four Meridian layers. It is a property of the Lume-X runtime that operates across all four layers simultaneously. SHDCL means that the Lume-X runtime monitors every active process, loop, and assertion across all four Meridian layers in real time. When any process drops, stalls, or enters an anomalous state, SHDCL detects the event within one control cycle (less than 14 ms at 73 Hz), executes a defined recovery sequence, and logs the event with full timestamp, duration, cause, and recovery path.

SHDCL eliminates the hard-failure class from the architecture entirely. In a conventional control system, an unhandled failure mode causes a hard fault with no recovery path. In Meridian with Lume-X, no failure mode is unhandled: the runtime itself is the recovery mechanism. The specific recovery behavior for each layer is defined in Section 12.

### 3.5 System-Level Invariants

Five invariants are enforced globally and continuously by Lume-X across all four Meridian layers:

**INV-1 — No Uncontrolled Discharge.** No node transmits energy without a confirmed downstream receiver, a valid routing path, and sufficient charge in MC state. Any attempt to transmit without these three conditions triggers GATE in MTL.

**INV-2 — No Ambiguous Routing.** Every energy packet has exactly one active route at any given time. MMF ensures this through exclusive path locking during transmission windows. No two routing table entries point to the same destination with equal cost without a deterministic tie-breaking rule.

**INV-3 — No Non-Deterministic Flow.** All energy movement is governed by the P_min/r/σ²/d framework. Every flow event is logged. Statistical validation runs continuously against the rolling 20-trial window for each active link.

**INV-4 — No Unsafe Transmission Events.** MTL enforces the Biological Safety Layer continuously. No beam fires without a confirmed, located receiver. No beam fires if the exclusion zone contains detected biological presence. No beam fires if calculated power density at any monitored point exceeds the ICNIRP threshold.

**INV-5 — No Mesh Oscillation.** MMF monitors energy flow direction across all active links. Any oscillatory pattern — energy cycling between two nodes without net forward progress — is detected by MMF and resolved by MFE through burst schedule adjustment or forced path selection.

---

## 4. Meridian Core (MC): The Energy Coordinate System

### 4.1 Role and Purpose

Meridian Core is the lowest layer of the architecture and the substrate on which every other layer depends. MC answers one fundamental question for every node in the network: what is the current state of this node? That state comprises four components: identity, spatial orientation, charge-state vector, and timing primitives.

MC does not make routing decisions, does not manage physical transmission, and does not coordinate the mesh. It maintains the coordinate system that makes all of those operations possible. Every flow decision in MFE, every routing calculation in MMF, and every transmission directive in MTL is ultimately a function of MC state. If MC state is incorrect or stale, every dependent layer produces incorrect outputs. MC state integrity is therefore the foundational correctness requirement of the entire architecture.

### 4.2 Node Identity

Every Meridian node has a unique identifier that is fixed at deployment and does not change during the node's operational lifetime. Node identity in MC is a 64-bit vector structured as:

```
[Network_ID : 16 bits][Zone_ID : 16 bits][Node_Type : 8 bits][Node_Serial : 24 bits]
```

**Network_ID** identifies the Meridian network instance. Multiple independent Meridian deployments can coexist in the same physical space by using different Network_IDs. Nodes with different Network_IDs do not route energy to each other.

**Zone_ID** identifies a logical subdivision of the network — a room, floor, building section, or operational region. Zone boundaries are defined at deployment and stored in every node's routing table. Zone-local routing is preferred over cross-zone routing when the destination is local, reducing mesh-wide broadcast requirements.

**Node_Type** encodes the node's functional role: source node (0x01), relay node (0x02), destination node (0x03), harvesting relay node (0x04, combines relay and DAEH functions), or gateway node (0x05, bridge between network zones or between Meridian and external control systems).

**Node_Serial** is a unique per-node serial number assigned at manufacture. Combined with Network_ID and Zone_ID, Node_Serial guarantees global uniqueness within the Meridian addressing space.

### 4.3 Spatial Orientation

Each node maintains a spatial state vector S representing its position and orientation in the deployment coordinate frame:

```
S = [x, y, z, θ_azimuth, θ_elevation, Δx, Δy, Δz]
```

Where (x, y, z) is position in meters relative to the network origin, (θ_azimuth, θ_elevation) is the node's transmission antenna pointing direction in degrees, and (Δx, Δy, Δz) is the velocity vector in meters per second for mobile nodes (zero for fixed nodes).

Position is updated continuously from the UWB localization subsystem (Decawave DWM1001 or equivalent). Update rate is a minimum of 10 Hz for static nodes and 20 Hz for mobile nodes. MC holds the last confirmed position with a timestamp. MFE and MTL use the position age to assess freshness — a position reading older than 500 ms is flagged as stale and triggers a re-acquisition request before any transmission is permitted.

For fixed nodes, position is initialized at deployment and confirmed by the UWB subsystem. For mobile destination nodes, position tracking is continuous and the MC state is updated at the localization update rate. The spatial uncertainty radius r, used in the determinism framework, is derived directly from the UWB localization accuracy: the DWM1001 module provides approximately 10 cm accuracy under nominal indoor conditions, so r = 10 cm is the baseline spatial uncertainty parameter for Phase 1–2 experiments.

### 4.4 Charge-State Vector

The charge-state vector C encodes the complete energy state of a node:

```
C = [V_cap, V_min, V_burst, V_max, dV/dt, mode, harvest_rate, cycles]
```

Where:
- **V_cap** is the current supercapacitor voltage (volts)
- **V_min** is the minimum operating voltage below which the node's microcontroller enters power-conservation mode
- **V_burst** is the burst threshold voltage above which the node has sufficient stored energy to execute one transmission burst
- **V_max** is the rated maximum voltage of the supercapacitor
- **dV/dt** is the current charge rate (volts per second), estimated over the preceding 10-second window
- **mode** encodes the node's current operational mode: HARVEST (charging), READY (above V_burst, awaiting schedule), TRANSMITTING (burst in progress), DEPLETED (below V_min), or SUPPLEMENTED (receiving DWER directed beam)
- **harvest_rate** is the measured ambient harvest power in microwatts, averaged over the preceding 60-second window
- **cycles** is the total charge-discharge cycle count since deployment, used for supercapacitor health monitoring

MFE reads V_cap and V_burst to make burst scheduling decisions. MMF reads mode to assess relay eligibility — a node in DEPLETED mode is not eligible to relay. MTL reads mode before executing any transmission — TRANSMITTING must be set by MFE before MTL fires the beam, and MTL clears it upon completion.

### 4.5 Timing Primitives

Deterministic behavior across the mesh requires that all nodes share a common time reference. MC maintains a network time synchronization layer using a precision timestamp protocol (PTP-equivalent, sub-millisecond accuracy) distributed across the mesh via the control plane. All timing-sensitive operations — TDMA slot assignment, burst scheduling, beam handoff windows — are expressed as absolute network timestamps rather than local node intervals.

MC exposes three timing primitives to higher layers:

**T_now** — current network time in microseconds since epoch.

**T_slot(node_id)** — the start time of the current TDMA transmission window assigned to the specified node. Returns the next scheduled window if no current window is active.

**T_burst(node_id)** — the scheduled burst transmission time for the specified node, as computed by MFE based on current V_cap and projected charge accumulation rate.

The 73 Hz confirmed cycle rate of the Lume-X runtime corresponds to a 13.7 ms control cycle. This is the fundamental timing resolution of the Meridian control system. All transmission windows, beam handoffs, and burst events are aligned to control cycle boundaries to ensure that the runtime can observe and respond to any state change within one cycle.

---

## 5. Meridian Flow Engine (MFE): Deterministic Energy Movement

### 5.1 Role and Purpose

The Meridian Flow Engine is the decision layer. It consumes the coordinate state provided by MC and converts it into deterministic instructions about when, where, and how much energy to move. MFE does not know about physical transmission hardware — that is MTL's domain. MFE does not know about mesh topology — that is MMF's domain. MFE knows about energy states, thresholds, and flow rules.

The fundamental question MFE answers is: given the current charge state of every node in the network, which nodes should transmit, to which downstream nodes, and when? MFE's answer to that question must be deterministic — identical input states must produce identical routing decisions every time, without exception.

### 5.2 Flow-Selection Algorithm

MFE evaluates each eligible source node against a priority-ordered set of flow selection criteria:

**Step 1 — Eligibility check.** A node is eligible to transmit if and only if:
- V_cap ≥ V_burst (sufficient charge for one burst)
- mode ≠ DEPLETED and mode ≠ TRANSMITTING
- A valid downstream path exists in the MMF routing table
- T_slot(node_id) is within the current TDMA window or within the next window boundary
- INV-1 through INV-5 pass for the proposed transmission

Any failure at Step 1 removes the node from the candidate set without escalation.

**Step 2 — Priority scoring.** Each eligible node receives a priority score P:

```
P = w₁ × (V_cap - V_burst) / (V_max - V_burst)    [charge surplus fraction]
  + w₂ × (destination_priority)                    [destination urgency]
  + w₃ × (link_quality)                            [downstream link reliability]
  + w₄ × (1 - mesh_load)                           [mesh congestion factor]
```

Default weights: w₁ = 0.4, w₂ = 0.3, w₃ = 0.2, w₄ = 0.1. Weights are configurable per deployment via Lume-X.

**Step 3 — Transmission scheduling.** Nodes are ordered by priority score. The highest-priority eligible node is scheduled first, followed by the next-highest in the next available TDMA slot, continuing until all eligible nodes have scheduled transmissions or all TDMA slots in the current window are filled.

**Step 4 — Conflict resolution.** If two nodes share a downstream path segment — that is, both need to route energy through the same relay node — they cannot transmit in the same TDMA slot. MFE detects this condition using the MMF topology graph and serializes the conflicting transmissions into separate slots.

### 5.3 Burst-Mode Scheduling

Burst-mode scheduling is the mechanism that makes ambient energy harvesting architecturally viable for wireless relay operation. The core insight is that the supercapacitor completely decouples the harvest rate from the transmission rate. A node harvesting at 50 µW that needs to fire a 100 mW burst for 10 ms requires 20 joules of storage time — meaning it accumulates for 20 seconds between bursts. This is not a failure mode. It is deterministic operation at the harvest rate available in that environment.

MFE's burst scheduler operates as follows for each DAEH node:

```
observe V_cap from MC
if V_cap >= V_burst:
    compute T_burst = T_now + alignment_delay
    assign TDMA slot starting at T_burst
    set node.mode = READY
    notify MMF of pending transmission
    on slot arrival:
        set node.mode = TRANSMITTING
        signal MTL to execute burst
        await MTL confirmation
        set node.mode = HARVEST
        log burst event with V_cap_before, V_cap_after, T_burst, T_actual, P_delivered
else:
    compute T_ready = T_now + (V_burst - V_cap) / dV_dt
    schedule re-evaluation at T_ready
    if dV_dt < dV_dt_min:
        flag node for DWER supplementation
        notify MMF to activate directed beam toward node
```

The supplementation trigger — when harvest rate falls below the minimum threshold for viable burst scheduling — automatically activates a DWER directed beam from the nearest available source node. This closes the three-layer energy loop: DAEH harvests when possible, DWER supplements when necessary, and MFE manages the transition between modes transparently.

### 5.4 Loss-Bounded Flow Modeling

MFE maintains a loss model for every active link in the network. The loss model is a rolling statistical estimate derived from the delivery confirmation feedback returned by MTL after each completed transmission burst. For each link (source → destination):

```
L(link) = 1 - (P_received / P_transmitted)
σ²(link) = variance of L(link) over the preceding N observations (N ≥ 20)
```

MFE uses L(link) and σ²(link) to evaluate whether a link meets the determinism standard:
- P_received ≥ P_min (minimum acceptable received power)
- σ²(link) < σ²_max (maximum acceptable variance, default 10%)

A link that fails either criterion is flagged as degraded. MFE notifies MMF of the degraded state. MMF responds by computing an alternate path that avoids the degraded link. If no alternate path exists, Lume-X escalates to a SHDCL recovery event and logs the failure.

The loss model also feeds the efficiency break-even calculation. For the multi-hop architecture to outperform a single long-range source, the per-hop conversion losses must be smaller than the free-space path loss savings achieved by the shorter hops. MFE computes this comparison continuously at each operating frequency and updates the routing preference weights accordingly.

---

## 6. Meridian Mesh Fabric (MMF): Multi-Hop Coordination

### 6.1 Role and Purpose

Meridian Mesh Fabric is the topology layer. It maintains the complete map of the energy network: which nodes exist, where they are, which links are active, and what the current state of each link is. From this map, MMF computes routing paths, enforces path exclusivity during transmission windows, and updates the mesh in response to topology changes.

MMF is where the network protocol stack analogy is most direct. The routing tables in MMF are structurally identical to the forwarding tables in a packet-switched data network. The link-state protocol used to distribute topology updates is directly analogous to OSPF. The multi-hop path selection algorithm is a variant of Dijkstra's shortest-path algorithm adapted for energy delivery where "shortest" means "minimum expected delivery loss" rather than "minimum hop count" or "minimum latency."

### 6.2 Routing Tables

Each Meridian node maintains a routing table R with one entry per reachable destination:

```
R[destination_id] = {
    next_hop_id,
    path_cost,          // expected delivery loss to destination
    hop_count,
    link_quality,       // rolling reliability estimate for first hop
    alternate_next_hop, // pre-computed fallback path
    last_updated,       // network timestamp of last topology update
    state               // ACTIVE, DEGRADED, FAILED
}
```

Routing tables are populated at network initialization using a mesh discovery protocol: each node broadcasts a NODE_ANNOUNCE message containing its full MC state. Receiving nodes add the announcing node to their neighbor graph and propagate the announcement one hop further. After three advertisement cycles (typically less than 500 ms), the full mesh topology is known to every node.

Routing tables are updated continuously as link states change. Link state changes are announced using a LINK_STATE_UPDATE message that propagates through the mesh using flood-limited broadcast (TTL decremented at each hop, discard at TTL=0). Every node that receives a LINK_STATE_UPDATE merges it into its local topology model and recomputes routing table entries that use the affected link.

### 6.3 Path Selection

MMF uses a modified Dijkstra algorithm for path selection. The cost function minimizes expected delivery loss across the full path rather than hop count:

```
PathCost(path) = Σ L(link_i) for all links i in path
               + penalty × hop_count     // small per-hop penalty to prefer fewer hops at equal loss
```

The hop count penalty is configurable (default: 0.02 per hop additional cost fraction). This ensures that a two-hop path with 15% total expected loss is preferred over a three-hop path with 14% total expected loss — the marginal loss benefit is not worth the added complexity and synchronization overhead of an extra hop.

Alternate paths are pre-computed for every destination at routing table population time. When a primary path degrades, MMF switches to the pre-computed alternate without requiring a full re-computation. Full re-computation occurs in the background and updates the pre-computed alternate for future use.

### 6.4 Bi-Directional Energy Flow

One of the distinguishing capabilities of the Meridian mesh is bi-directional energy flow. Standard relay chain architectures are unidirectional: energy flows from source to destination along a predetermined path. In Meridian, energy can flow in either direction on any link, and can flow from any node with surplus charge to any node with depleted charge, regardless of the original source-destination pairing.

Bi-directional flow is governed by MMF's surplus-deficit monitor, which runs continuously:

```
for each node n:
    if C[n].V_cap > V_burst + surplus_threshold:
        n is eligible as energy donor
    if C[n].V_cap < V_min + deficit_threshold:
        n requires energy donation

for each (donor, recipient) pair:
    if path exists between donor and recipient:
        compute flow_reversal_benefit = V_cap_delta / path_cost
        if flow_reversal_benefit > reversal_threshold:
            schedule reversed-flow burst from donor to recipient
```

The flow reversal mechanism prevents nodes from becoming stranded with no energy in a mesh where surplus exists elsewhere. It also serves as the foundation for the mesh self-balancing property: over time, the mesh drives toward an equilibrium where no node is deeply depleted and no node is wasting charge capacity by sitting above V_max.

### 6.5 Oscillation Prevention

Mesh oscillation occurs when energy cycles between two nodes without net forward progress — for example, node A transmits to node B, which immediately re-transmits back to node A because node A's charge dropped while node B's rose. Left uncorrected, this wastes energy and prevents delivery to the intended destination.

MMF detects oscillation using a directed flow history buffer maintained per link. If a link shows alternating flow direction across three consecutive transmission windows without net delivery progress to the destination, MMF flags the condition as oscillatory and applies a flow stabilization rule: one direction is locked as the preferred direction for the next ten transmission windows, with the preference based on the net destination progress metric.

Lume-X enforces INV-5 continuously. Any oscillatory condition not resolved by MMF's automatic mechanism within two control cycles is escalated to a SHDCL recovery event with full logging.

### 6.6 Topology Change Handling

The mesh must handle three types of topology change: node addition, node failure, and link degradation.

**Node Addition.** A new node broadcasts NODE_ANNOUNCE. All neighbors update their topology models. MMF re-evaluates whether the new node improves any existing path and updates routing tables if it does. The new node receives a full routing table from its nearest neighbor.

**Node Failure.** When a node fails to respond within two consecutive control cycles, its neighbors mark it as PRESUMED_FAILED and broadcast a LINK_STATE_UPDATE. All affected routing table entries switch to their pre-computed alternate paths. The failed node is removed from the topology model. If the failed node was on the primary path to any destination with no viable alternate, MMF escalates to Lume-X for SHDCL recovery.

**Link Degradation.** When a link's rolling delivery loss exceeds the degradation threshold, MMF marks it as DEGRADED and moves affected traffic to alternate paths. The degraded link remains monitored — if it recovers, its status returns to ACTIVE and the routing preference shifts back.

---

## 7. Meridian Transmission Layer (MTL): Directional Wireless Delivery

### 7.1 Role and Purpose

The Meridian Transmission Layer is the interface between the Meridian software architecture and the physical world. Everything above MTL operates in the domain of vectors, routing tables, charge states, and scheduling. MTL translates those abstractions into specific hardware instructions: beam steering angles, RF emission power levels, timing windows, and safety gate commands. It is also the layer that receives physical reality back from the hardware — delivery confirmation, beam steering feedback, and safety monitoring data — and converts those physical measurements back into the coordinate language that Meridian's higher layers understand.

### 7.2 Beam Steering and Emission Shaping

MTL controls the phased-array transmitter through a beam steering command interface. Each beam steering command specifies:

```
BeamCommand = {
    target_node_id,         // destination node identifier
    target_position,        // S vector from MC — position + uncertainty radius
    power_level_mW,         // transmit power in milliwatts (never exceeds 1000 mW = 1W)
    beam_width_deg,         // desired 3 dB beam width
    frequency_GHz,          // operating frequency (2.4 or 5.8 GHz for Phase 1-2)
    timing_window,          // T_start, T_end from MC timing primitives
    safety_constraints      // inherited from INV-4, BSL thresholds
}
```

The phased-array driver translates BeamCommand into per-element phase and amplitude settings. Phase offsets for each of the N antenna elements are computed as:

```
φ_n = (2π / λ) × d_n × sin(θ)
```

Where λ is wavelength, d_n is the position offset of element n from the array center, and θ is the desired beam steering angle. At 2.4 GHz (λ ≈ 12.5 cm) with 4-element half-wavelength spacing, this produces a beam steering range of approximately ±60 degrees from broadside.

Emission shaping — controlling the sidelobe structure of the radiated pattern — is achieved by applying amplitude taper across the array elements (Taylor or Chebyshev window). Sidelobe reduction reduces ambient RF exposure in non-beam directions and improves the effectiveness of the RF-absorptive node enclosure shielding.

### 7.3 Safety Gating

MTL implements a five-condition safety gate. All five conditions must be satisfied before any beam is permitted to fire:

**Gate Condition 1 — Receiver confirmed.** A valid, current (less than 500 ms old) position reading exists for the target node. Target node is in READY or HARVEST mode (not FAILED or DEPLETED).

**Gate Condition 2 — Path authorized.** The transmission was authorized by a valid MMF routing table entry for the target node. No unauthorized transmissions.

**Gate Condition 3 — Exclusion zone clear.** The localization subsystem confirms no biological presence within the defined exclusion volume around the beam path. The exclusion volume is defined as a cylinder of radius 0.5 m around the beam centerline for the full path length between transmitter and receiver.

**Gate Condition 4 — Power density within limits.** Real-time calculation of power density at all monitored points in the environment confirms values below ICNIRP reference levels (2 W/m² at 2.4 GHz for the general public, 10 W/m² for occupational exposure).

**Gate Condition 5 — Charge sufficient.** V_cap ≥ V_burst as confirmed by current MC state. Prevents dry-fire transmission attempts.

If any gate condition fails, MTL issues a GATE_REJECT event to Lume-X with the specific failed condition identified. Lume-X logs the event, notifies MFE to reschedule the transmission, and initiates the appropriate SHDCL recovery sequence if the failure is persistent.

### 7.4 Closed-Loop Delivery Confirmation

MTL does not consider a transmission complete until delivery is confirmed. After firing the beam, MTL awaits a DELIVERY_CONFIRM message from the receiver node containing:

```
DeliveryConfirm = {
    source_node_id,
    receiver_node_id,
    P_received_mW,          // measured received power
    V_cap_after,            // supercapacitor voltage after burst receipt
    position_at_receipt,    // actual receiver position at time of delivery
    timestamp
}
```

MTL computes the delivery efficiency η = P_received / P_transmitted and logs it against the link's rolling statistics model in MFE. If no DELIVERY_CONFIRM arrives within the confirmation timeout window (default: T_end + 100 ms), MTL treats the transmission as failed and initiates a SHDCL retry sequence.

### 7.5 Deterministic Transmission Windows

MTL enforces strict timing compliance. Each transmission is assigned a window [T_start, T_end] by MC's timing primitives. MTL will not fire before T_start (beam alignment preparation begins at T_start - 50 ms). If the beam is not confirmed aligned before T_start, the window is missed and the transmission is rescheduled. If T_end is reached before delivery confirmation is received, the beam is cut and the incomplete delivery is logged as a partial delivery event.

Strict window enforcement is what makes the TDMA-style synchronization robust. No node transmits outside its assigned window. Adjacent nodes cannot interfere with each other because their windows do not overlap. The Lume-X runtime enforces window boundaries as hard timing invariants.

---

## 8. Ambient Harvesting Integration (DAEH)

### 8.1 Overview

DAEH — Deterministic Ambient Energy Harvesting — is the node autonomy layer of the Meridian architecture. Its function is to reduce the dependence of relay nodes on wired power inputs by extracting energy from naturally occurring environmental sources, storing it in supercapacitors, and feeding it into the mesh via burst-mode transmission coordinated by MFE.

DAEH is not presented as a solution to the energy supply problem. Ambient energy densities are measured in microwatts per square centimeter. They cannot sustain continuous RF transmission at relay power levels. What DAEH provides is node operational autonomy for low-power logic functions (microcontroller, localization module, sensors, routing logic), accumulated burst energy for periodic transmission events, and resilience against wired power interruption.

The generator model is the correct mental framework: a generator does not output power the instant fuel arrives — it accumulates energy and releases it in a controlled, usable form when sufficient energy has accumulated. DAEH nodes do precisely this.

### 8.2 Harvesting Modalities

**RF from Known Sources.** Rather than attempting to harvest incoherent ambient RF noise, DAEH targets predictable, stable RF sources: cellular towers, Wi-Fi access points, and broadcast signals. These have known frequencies, stable power levels, and predictable spatial distribution. A rectenna array tuned to these bands collects additive power across all elements.

Critical constraint: ambient RF signals from independent sources are incoherent. They cannot be phase-combined. What is achieved is additive power summation across array elements, not coherent beamforming gain. Received power scales linearly with array area — not quadratically. No coherent gain claims are made for this modality anywhere in this document.

**Indoor Solar and Ambient Light.** The highest-yield and most mature indoor harvesting modality. Photovoltaic cells optimized for artificial lighting spectra (warm LED, fluorescent) produce 10–100 µW/cm² under typical indoor illumination. This is the recommended primary harvest source for indoor relay nodes and the first modality to be deployed in Phase 2 experiments.

**Thermal Gradient Harvesting (TEG).** Thermoelectric generators convert temperature differentials into voltage via the Seebeck effect. Output is 1–10 µW/cm² for small temperature differentials (1–5°C), scaling with ΔT. Useful for nodes placed near heat sources: electronic equipment, HVAC vents, server racks, exterior walls. Deterministic thermal modeling of the deployment environment significantly improves output stability.

**Piezoelectric Vibration Harvesting.** Piezoelectric and MEMS harvesters convert mechanical vibration to electrical energy. Output is 10–100 µW/cm² in mechanically active environments. Resonance tuning to the dominant vibration frequency of the specific deployment environment substantially increases yield. Useful in environments with consistent mechanical excitation: HVAC systems, industrial machinery, high-traffic flooring.

**Triboelectric Nanogenerator Harvesting (TENG).** Triboelectric nanogenerators harvest energy from charge-separation events between materials through friction, contact, vibration, and airflow. Output ranges from 1–100 µW/cm² depending heavily on environmental conditions. TENG harvesting requires high-impedance charge amplifiers and voltage multiplier circuits. Rectennas are RF-to-DC converters and are not applicable to this modality. These are distinct circuit architectures and must be specified and built separately.

**Dual-Mode Mechanical Harvester.** A novel design option combining piezoelectric and triboelectric elements on a single mechanical substrate. Since both modalities respond to the same class of mechanical stimuli — vibration, friction, impact, contact — the same physical excitation drives both simultaneously. Combined yield is meaningfully higher than either modality alone. Recommended as a standard design option for nodes in mechanically active environments.

**Atmospheric Electrostatic Gradient.** The Earth maintains approximately 100–300 V/m atmospheric electric field near the surface under fair-weather conditions. This is a real physical phenomenon. Practical energy yield at relay node scale is in the nanowatt range under normal conditions, rising during storm activity but not under conditions suitable for deterministic system operation. This modality is classified as a long-term experimental roadmap item only. Strict power density validation required before any claims.

**Magnetic Flux Harvesting.** Measurable in proximity to power lines and electrical equipment. Nanowatt range in typical indoor environments away from concentrated sources. Long-term experimental roadmap only.

### 8.3 Honest Power Density Baselines

All DAEH experiments must beat the following established baselines before any efficiency claims are made:

| Source | Power Density | Notes |
|---|---|---|
| Ambient RF indoor (random) | 0.01–1 µW/cm² | Highly location-dependent |
| RF from known sources | 1–100 µW/cm² | Predictable, targetable |
| Thermal gradient TEG (small ΔT) | 1–10 µW/cm² | Requires temperature differential |
| Piezoelectric vibration | 10–100 µW/cm² | Requires mechanical excitation |
| Indoor solar / ambient light | 10–100 µW/cm² | Most mature modality |
| Triboelectric TENG | 1–100 µW/cm² | Highly environment-dependent |

Harvested power at these densities powers node logic (microcontroller: ~10–50 µW, UWB localization module: ~100–500 µW active, 1–10 µW sleep). RF relay transmission at 100 mW output from a supercapacitor burst requires 1 joule for a 10 ms burst. At 50 µW average harvest rate, charge accumulation time is approximately 20,000 seconds (5.6 hours) per burst without DWER supplementation. With DWER supplementation during periods of low harvest, charge time is reduced to a configurable minimum.

### 8.4 Phase-Change Material Storage

Supercapacitors are the primary burst storage technology for Phase 1–3 experiments. Phase-change thermal storage materials represent a longer-horizon option for nodes deployed near consistent heat sources. Phase-change materials store significantly more energy per unit volume than supercapacitors at comparable cost, releasing it on demand through a thermoelectric generator. For nodes adjacent to server racks, HVAC equipment, or other consistent heat sources, PCM storage could dramatically increase burst energy availability compared to supercapacitor storage alone. This remains a forward-looking research contribution. Phase 1–3 experiments use supercapacitors exclusively.

### 8.5 DAEH Experimental Phases

**Phase 1 — Baseline Measurement.** Characterize all available harvesting modalities at intended deployment locations. Record power density for each modality across 20 trials. Establish variance baselines per modality. Identify highest-yield modality for the specific environment.

**Phase 2 — Single-Node Harvesting.** Deploy chosen modality (recommended: indoor solar as primary) on one relay node. Measure supercapacitor charge rate under real environmental conditions. Calculate time-to-threshold for burst transmission. Validate deterministic repeatability of full charge/discharge cycle.

**Phase 3 — Integrated Mesh Operation.** Feed harvested energy into an active DRMA relay node. Demonstrate burst-mode transmission from harvested power alone. Quantify improvement in node autonomy compared to wired baseline. Validate Lume-X burst scheduling against real-time charge state data.

---

## 9. Mesh Routing Integration (DRMA)

### 9.1 Overview

DRMA — Distributed Relay Mesh Architecture — is the multi-hop energy routing subsystem. It is the physical implementation of the network protocol stack architecture described in MMF. Where MMF maintains the routing tables and topology model, DRMA provides the physical relay infrastructure: the nodes that receive energy, buffer it, and re-transmit it toward the destination.

Each DRMA relay node contains a directional receiving antenna, a rectenna for RF-to-DC conversion, a supercapacitor buffer, a directional transmitting antenna, a low-power amplifier (less than 1W), a microcontroller, a UWB localization module, and a safety gating circuit. Node cost and size are intentionally minimized to enable dense deployment.

### 9.2 Why Short Hops Beat Long Hops

The free-space path loss law governs why multi-hop architectures can outperform single-source long-range transmission:

```
FSPL(dB) = 20 log₁₀(d) + 20 log₁₀(f) + 20 log₁₀(4π/c)
```

At 2.4 GHz, FSPL increases by 6 dB every time distance doubles. At 1 meter, FSPL is approximately 40 dB. At 4 meters, it is approximately 52 dB — 12 dB more loss for four times the distance.

Breaking a 4-meter path into four 1-meter hops saves approximately 12 dB in path loss per hop but incurs per-hop conversion losses. Each relay node incurs:

| Per-Hop Stage | Estimated Efficiency |
|---|---|
| Rectenna RF to DC | 50–70% |
| Re-transmission DC to RF | 60–75% |
| Per-hop round-trip conversion | ~30–52% |

Converting to dB: per-hop conversion loss is approximately 3–5 dB. Path loss savings per meter reduction (at 2.4 GHz, 1m vs. 4m) is approximately 12 dB. The break-even occurs when per-hop conversion losses equal path loss savings. At 2.4 GHz, relay nodes begin paying off at inter-node distances beyond approximately 2–3 meters. Below this threshold, a single source is more efficient. The exact break-even distance must be calculated and validated experimentally for each operating frequency and is a required deliverable of Phase 2.

### 9.3 The Synchronization Protocol

Inter-node synchronization is the critical design challenge for multi-hop operation. Each relay node must execute in sequence: receive beam from upstream node, convert RF to DC, buffer in supercapacitor, switch to transmit mode, re-transmit to downstream node. Adjacent nodes transmitting simultaneously cause mutual interference that can break the energy path.

Meridian uses a TDMA-style synchronization protocol managed by the Lume-X runtime. Each node in an active relay chain is assigned a non-overlapping transmission window by the MMF routing layer. Window assignments are computed when the routing path is established and updated whenever the path changes.

The TDMA window structure for a three-node relay chain (Source → Relay₁ → Relay₂ → Destination):

```
Window 1: Source transmits to Relay₁ (duration: T_burst)
Gap:      Relay₁ confirms receipt, switches to transmit mode (duration: T_switch ≈ 5 ms)
Window 2: Relay₁ transmits to Relay₂ (duration: T_burst)
Gap:      Relay₂ confirms receipt, switches to transmit mode (duration: T_switch)
Window 3: Relay₂ transmits to Destination (duration: T_burst)
Confirmation: Destination reports delivery to control system
```

Total latency per hop is T_burst + T_switch + T_confirm. At T_burst = 10 ms, T_switch = 5 ms, and T_confirm = 5 ms, three-hop delivery latency is approximately 60 ms. This is not a real-time power delivery system — it is a scheduled, burst-mode delivery system. Latency is a design parameter, not a failure mode.

### 9.4 Security Threat Model

A deterministic energy routing system has a formal attack surface. This is the first formal treatment of the security threat model for a wireless power routing system. Identified threat vectors:

- **Localization spoofing** — false position signals from a malicious node redirect beam energy to unintended targets
- **Routing table manipulation** — corrupted routing table entries cause energy to bypass critical nodes or loop endlessly
- **Beam hijacking** — an unauthorized receiver positions itself in the beam path to intercept routed energy
- **Denial-of-power attacks** — deliberate disruption of mesh routing to starve target devices
- **Node impersonation** — false charge-state reporting to trigger burst scheduling toward or away from a specific node
- **Timing attack** — injecting false timing signals to desynchronize TDMA windows and cause collisions

Guardian Security (energy-domain designation: Guardian-E, domain: TrustShield.tech) maps its eleven threat categories directly onto this threat model. The formal mapping between DRMA attack vectors and Guardian Security defensive responses is a required deliverable for Phase 3 and is outlined in Section 12 and Appendix E.

### 9.5 DRMA Experimental Phases

**Phase 1 — Single-Hop Validation.** Directional gain demonstrated at relay node hardware. Per-hop efficiency baseline established and documented. Deterministic repeatability verified against the P_min/r/σ²/d standard.

**Phase 2 — Two-Hop Routing.** Energy routed through two relay nodes. Inter-node synchronization protocol validated. Cumulative efficiency measured and compared to single-source at equivalent total distance. Break-even distance calculated and confirmed experimentally. Deterministic power delivery verified at final receiver.

**Phase 3 — Dynamic Mesh Routing.** Moving receiver tracked through mesh. Hop-to-hop handoff with less than 20% P_min drop during transition. Fallback path routing demonstrated when one node is blocked. Bi-directional energy flow demonstrated with surplus-to-depleted node transfer.

---

## 10. Wireless Transmission Integration (DWER)

### 10.1 Overview

DWER — Deterministic Wireless Energy Routing — is the foundational point-to-point energy delivery subsystem. It is the direct ancestor of all wireless energy delivery in the Meridian architecture. Every mesh hop is a DWER link. Every directed supplementation beam from a source node to a depleted relay node is a DWER link. The DRMA mesh is an interconnected set of DWER links governed by Meridian's routing framework.

DWER builds on three established technical traditions — microwave power transmission, resonant inductive coupling concepts, and phased-array beamforming — and contributes the closed-loop deterministic control layer that is the primary novel element.

### 10.2 The Determinism Standard

Every experimental result claiming deterministic delivery must report all four values. A result that omits any of these four is not a deterministic result under the Meridian standard:

```
Deterministic delivery: for a given transmitter configuration and receiver position,
the system guarantees P_min (mW) within spatial uncertainty radius r (cm),
with variance σ² below threshold, across N ≥ 20 repeated trials under identical conditions,
at distance d (m).
```

Four mandatory layers achieve this standard:

1. **Localization feedback** — continuous receiver position update at defined intervals (minimum 10 Hz)
2. **Phase-steering correction** — real-time beam adjustment to maintain alignment
3. **Power confirmation telemetry** — receiver reports P_received back to control system, closing the loop
4. **Repeatability logging** — all trials logged and statistically validated against the σ² threshold

### 10.3 Efficiency Budget

At 2.4 GHz, less than 1W transmit power, over 1–3 meters:

| Stage | Estimated Efficiency |
|---|---|
| Power amplifier to antenna | 60–75% |
| Free-space path loss (1m, focused beam) | 10–30% |
| Rectenna RF to DC conversion | 50–70% |
| End-to-end (optimistic) | ~15–25% |
| End-to-end (conservative) | ~3–10% |

These numbers are consistent with published rectenna experiments at similar power and distance. Phase 1 is not about efficiency — it is about proving directional control exists and is measurable. Efficiency improvement begins in Phase 3.

### 10.4 Commercial System Differentiation

DWER must be formally differentiated from existing commercial wireless power systems in all publications:

**WiTricity** — resonant inductive coupling, short range, no beam steering, no closed-loop power confirmation, no mesh, no formal determinism standard.

**Ossia Cota** — RF-based, omnidirectional broadcast, no deterministic routing, no closed-loop confirmation, no mesh architecture, no formal determinism standard.

**Energous WattUp** — RF-based, broadcast with some directionality, no formal determinism standard, no mesh architecture, no closed-loop confirmation.

DWER differentiates on all five dimensions: closed-loop power confirmation, formal determinism standard, phased-array beam steering, mesh routing integration, and self-healing control runtime. No commercial system provides all five.

### 10.5 DWER Experimental Phases

**Phase 1 — Directionality (Immediate Priority).**
- Received power increases by at least 10 dB when beam aligned vs. 45° off-axis
- System acquires and locks onto receiver within 5 seconds
- Result repeatable across 10 consecutive trials with variance less than 15%

**Phase 2 — Determinism.**
- Received power at 1 meter: at least 5 mW from less than 1W transmit
- Trial-to-trial variance: less than 10% across 20 trials
- Power curve matches simulated beam pattern within 3 dB

**Phase 3 — Routing.**
- Beam handoff between two receivers in less than 500 ms
- Track receiver moving at 0.5 m/s with less than 2 cm pointing error
- Time-division concurrent delivery to two receivers with measured power at each

### 10.6 Hardware Configuration (Phase 1)

**Transmitter Module.** 2.4 GHz or 5.8 GHz phased-array board, 4–16 elements; software-defined radio (SDR) for waveform control; microcontroller for phase and amplitude steering; low-wattage power amplifier, less than 1W output.

**Receiver Module.** Tuned resonant rectenna at operating frequency; RF-to-DC rectifier circuit; supercapacitor or small Li-ion storage; power measurement instrumentation, mW resolution; telemetry link back to control system.

**Localization Module.** UWB positioning (Decawave DWM1001) — preferred, cm-level accuracy. Alternatives: mmWave radar (TI IWR6843), optical marker tracking (ArUco).

**Control System.** Laptop running Lume-X control loop over USB. Desktop-first approach for Phase 1. Real-time feedback loop: position → phase correction → beam update → delivery confirmation → loop. Safety envelope enforcement continuous. Full logging for repeatability validation.

---

## 11. Global Invariant Enforcement

### 11.1 Overview

The five global invariants defined in Section 3.5 are not design aspirations. They are hard assertions enforced by the Lume-X runtime at every control cycle. Every 13.7 ms (73 Hz cycle rate), Lume-X evaluates all five invariants against current system state. Any invariant violation triggers an immediate, typed response.

The invariant enforcement model follows the same pattern used in Lume's deterministic assertion framework: `verify` → `gate_if_failed` → `log` → `recover`. No invariant failure is silent. No invariant failure produces an undefined system state.

### 11.2 INV-1 Enforcement: No Uncontrolled Discharge

```
verify node.V_cap >= V_burst before every transmission attempt
verify route exists for target in MMF routing table
verify receiver confirmed in MTL gate before beam fires
on failure: GATE transmission, log DISCHARGE_PREVENTED event, reschedule MFE burst
```

### 11.3 INV-2 Enforcement: No Ambiguous Routing

```
verify each destination has exactly one active route entry in MMF routing table
verify no two routing entries have equal cost without deterministic tiebreaker
verify path lock is held by the active transmitter for the duration of its window
on failure: pause routing, log ROUTING_AMBIGUITY event, force re-convergence, resume
```

### 11.4 INV-3 Enforcement: No Non-Deterministic Flow

```
verify rolling σ² for each active link < σ²_max across current 20-trial window
verify P_received >= P_min on every completed delivery
verify variance update applied after each delivery confirmation
on failure: mark link DEGRADED in MMF, log DETERMINISM_FAILURE event, activate alternate path
```

### 11.5 INV-4 Enforcement: No Unsafe Transmission Events

```
verify exclusion_zone clear before every beam fire
verify power_density at all_monitored_points < icnirp_limit at all times
verify V_cap >= V_burst before every beam fire
verify localization signal age < 500ms before every beam fire
on failure: GATE beam, log SAFETY_GATE event with failed condition, await resolution
```

The SAFETY_GATE event is the highest-priority log event in the system. It is never suppressed, never batched, and always written synchronously to the persistent log before any other recovery action is taken.

### 11.6 INV-5 Enforcement: No Mesh Oscillation

```
verify directional flow consistency on each link over the preceding 3 windows
detect oscillatory pattern: alternating flow direction without net destination progress
on detection: log OSCILLATION_DETECTED event, apply flow stabilization, lock preferred direction
on stabilization failure: escalate to SHDCL recovery event
```

---

## 12. Control and Safety Layer

### 12.1 Lume-X as the Operating System

Lume-X is the provisionally patented deterministic control runtime that operates the entire Meridian architecture. It is the energy-domain implementation of the Lume language ecosystem (DOI: 10.5281/zenodo.19382282). Lume-X is not a higher-level script that calls external systems — it is the runtime itself, operating all four Meridian layers simultaneously through a unified control loop validated at 73 Hz.

The 73 Hz validation result is critical. The minimum control-loop requirement for DWER beam steering responsiveness is 10 Hz (100 ms cycle). DRMA inter-node synchronization requires faster cycles to maintain TDMA window precision. At 73 Hz (13.7 ms cycle time), Lume-X exceeds the minimum requirement by a factor of 7.3 for beam steering and provides TDMA resolution of approximately 14 ms per slot — sufficient for Phase 1–3 experimental requirements without hardware bridging.

The Lume-X runtime implements SHDCL — the Self-Healing Deterministic Control Layer — as a property of the runtime itself, not as an application-layer module. SHDCL means the runtime monitors every process it manages. A dropped process is automatically restarted. A stalled loop is detected and recovered. A missing heartbeat from a relay node is flagged and the mesh routes around the silent node. The system does not wait for human intervention.

### 12.2 SHDCL Recovery Sequences

**DWER Beam Steering Recovery.** When localization signal is momentarily lost:

```
detect: localization signal age > 500ms
execute: hold beam at last confirmed safe position (no steering, no power change)
initiate: re-acquisition sequence (request fresh position from UWB subsystem)
on restore: resume normal operation
on failure: cut beam after 2-second hold limit, log BEAM_RECOVERY_FAILED event
log: event timestamp, duration, recovery path, outcome
```

Without SHDCL: beam enters unknown state, potential safety hazard, system halt required.
With SHDCL: controlled hold, automatic recovery, continuous safe operation.

**DRMA Node Failure Recovery.** When a relay node drops out of the mesh:

```
detect: node fails to respond within 2 consecutive control cycles
execute: mark node PRESUMED_FAILED in MMF topology
calculate: alternate routing path using pre-computed fallback
activate: alternate path, signal adjacent nodes to update routing tables
continue: power delivery to destination through alternate path
log: failure event, recovery path, time-to-recovery
```

Without SHDCL: mesh breaks, power delivery to target fails, manual intervention required.
With SHDCL: automatic rerouting, continuous delivery, full event log.

**DAEH Harvest Cycle Recovery.** When a harvesting modality underperforms:

```
detect: dV/dt < dV_dt_min for 60-second window
execute: adjust burst scheduling to match actual available energy
shift: harvest priority to higher-performing modalities if available
flag: degraded harvest state for maintenance attention
if charge rate insufficient to meet delivery schedule:
    request DWER supplementation beam from nearest eligible source node
log: degraded state, adjusted schedule, supplementation request if issued
```

Without SHDCL: harvest cycle operates on stale assumptions, transmission failures propagate.
With SHDCL: adaptive scheduling, safe operation at any harvest level, predictive maintenance flagging.

### 12.3 Natural Language Control Interface

Lume-X provides an English-mode and voice-to-code interface that allows a technician or operator to control the mesh in natural language in real time. This is a direct application of the Lume language's natural-language programming capabilities to a physical hardware control domain. No existing wireless power system has this interface.

Valid operator commands are translated by Lume-X into typed Meridian control operations:

| Natural Language Command | Meridian Operation |
|---|---|
| "Reroute power around node 3" | MMF: mark Node-3 EXCLUDED, recalculate all affected paths |
| "Increase harvest priority on south wall nodes" | MFE: raise burst schedule priority for Zone_ID=south_wall |
| "Switch to burst-only mode on all DAEH nodes" | MFE: disable DWER supplementation, burst-only scheduling |
| "Reduce beam power on corridor nodes to 50%" | MTL: set power_level_mW = 0.5 × current for Zone_ID=corridor |
| "Show me the charge state of all relay nodes" | MC: broadcast CHARGE_STATE_REPORT for all node_type=relay |

The natural language interface is not a convenience layer — it is a safety capability. An operator who can issue plain-English commands during an incident response does not need to pause for terminal access or documentation lookup. The interface lowers the operational skill requirement for mesh management and reduces the probability of human error during recovery events.

### 12.4 Guardian Security Integration

Guardian Security (energy-domain designation: Guardian-E; domain: TrustShield.tech) provides the security enforcement layer for the Meridian architecture. Guardian Security covers eleven threat categories in its general implementation. The energy-domain mapping focuses on six primary threat vectors:

**Localization Spoofing Defense.** Guardian-E requires multi-modal position confirmation before any transmission is authorized. A position reading from the UWB subsystem must be cross-validated against an independent second modality (optical marker or mmWave radar) before MTL accepts it. A single-source position that cannot be independently confirmed triggers a POSITION_UNVERIFIED gate.

**Routing Table Integrity.** All routing table entries are signed by the originating node using a per-node key provisioned at deployment. MMF rejects any routing update that cannot be verified against the originating node's key. This prevents routing table manipulation by malicious or compromised nodes.

**Beam Hijacking Prevention.** MTL requires delivery confirmation from a node whose current position matches the authorized target position within r cm. A delivery confirmation from an unexpected position triggers a BEAM_HIJACK_SUSPECTED event and immediate beam cut.

**Denial-of-Power Detection.** Guardian-E monitors delivery success rates per destination. A pattern of repeated delivery failures to a specific node that cannot be explained by environmental factors triggers a DENIAL_OF_POWER_SUSPECTED event and activates alternate path analysis.

**Node Impersonation Prevention.** All inter-node messages are authenticated using the provisioned node keys. An unauthenticated message that arrives from a known node address triggers an IMPERSONATION_SUSPECTED event.

**Timing Attack Resistance.** TDMA window assignments are computed by the trusted Lume-X runtime and distributed signed. A node that transmits outside its assigned window triggers a TIMING_VIOLATION event and is quarantined.

The formal written specification of the Guardian Security rule set for the Meridian energy domain is Appendix E of this document and is also listed as Gap Item 8 in the project gap list.

---

## 13. Implementation Considerations

### 13.1 Hardware Requirements

Phase 1 experimental hardware is intentionally minimal, desktop-first, and commercially available:

**Phased-Array Board.** Several commercial boards support 2.4 GHz phased-array beamforming at lab scale. Boards with 4–16 elements and software-accessible phase controls are suitable. SDR integration via USB is preferred for Phase 1 to enable waveform flexibility without custom firmware.

**UWB Localization.** The Decawave DWM1001 module is the preferred localization hardware. It provides approximately 10 cm accuracy, USB connectivity, and a well-documented API. A minimum of three anchor modules plus one tag module enables 3D positioning. Phase 1 may use 2D positioning (three anchors, planar tracking) to reduce complexity.

**Rectenna.** Phase 1 rectenna is a lab-assembled discrete component: a tuned dipole or patch antenna at the operating frequency, a matching network, a Schottky diode rectifier (HSMS-285x or equivalent), and a smoothing capacitor. A commercial evaluation kit (e.g., Powercast P2110) may be used to accelerate Phase 1 verification before a custom rectenna is built.

**Supercapacitor.** 1–10 F, 5V rated, with monitored voltage divider. Panasonic EEC-EN0F104 or equivalent.

**Control Computer.** Any modern laptop running the Lume-X runtime over USB. No embedded target required for Phase 1.

### 13.2 Supercapacitor Sizing

Supercapacitor capacity C (farads) required to deliver a burst of power P_burst (watts) for duration T_burst (seconds) from voltage V_burst to minimum operating voltage V_min:

```
E_burst = P_burst × T_burst
C = 2 × E_burst / (V_burst² - V_min²)
```

Example: P_burst = 0.1 W, T_burst = 10 ms = 0.01 s, V_burst = 4.5 V, V_min = 2.5 V:

```
E_burst = 0.1 × 0.01 = 0.001 J
C = 2 × 0.001 / (4.5² - 2.5²) = 0.002 / (20.25 - 6.25) = 0.002 / 14 ≈ 0.000143 F = 143 µF
```

For higher burst energy (1W for 100 ms = 0.1 J): C ≈ 14.3 mF. Standard 0.1–1 F supercapacitors provide substantial headroom above these minimums, enabling multiple burst events between recharge cycles.

### 13.3 Node Density and Spacing

Optimal inter-node spacing depends on the operating frequency and the efficiency break-even distance. At 2.4 GHz, theoretical break-even is approximately 2–3 meters (to be confirmed experimentally in Phase 2). For initial deployments, 1.5–2.5 m inter-node spacing is recommended, providing a margin below the estimated break-even while maintaining practical node counts.

Node density in a room-scale deployment (5m × 5m room):
- At 2m spacing: 4–9 relay nodes for full coverage
- At 1.5m spacing: 9–16 relay nodes
- Gateway node required at the wired power entry point (or multiple gateways for larger spaces)

### 13.4 RF Emission Constraints

All Phase 1–3 experiments operate at less than 1W RF output at all nodes. This is a hard constraint enforced by MTL's safety gate and logged at every transmission event. This constraint ensures compliance with FCC Part 15 general-purpose unlicensed device rules at 2.4 GHz and 5.8 GHz.

Before any deployment-scale claims or demonstration beyond a controlled laboratory environment, a full regulatory analysis is required:

- FCC Part 15 compliance verification for the complete system
- SAR (specific absorption rate) analysis for sustained exposure scenarios
- EIRP (effective isotropic radiated power) calculations per operating band
- FCC Part 18 industrial, scientific, and medical equipment analysis if operating at higher power levels is required

This analysis is Gap Item 4 in the project gap list.

### 13.5 Environmental Factors

Multipath reflections in indoor environments create standing wave patterns that affect beam delivery consistency. Phase 1 experiments should be conducted in an environment with minimal metallic reflectors. Phase 2 and 3 experiments should characterize the effect of multipath on the σ² variance metric and develop beam shaping or frequency selection strategies to mitigate degraded links.

Human presence affects both the localization accuracy (body occlusion of UWB signals) and the RF power density calculation (body absorption). The Biological Safety Layer exclusion zone enforcement directly addresses the latter. Localization robustness in the presence of human body occlusion should be characterized during Phase 2.

---

## 14. Evaluation Framework

### 14.1 Overview

The evaluation framework defines how the Meridian architecture will be tested once experimental hardware exists. All success criteria are quantitative. All experimental results are logged to the standard Meridian delivery log format for post-hoc statistical analysis. No phase is considered complete until all success criteria for that phase are met across the required number of trials.

**Fundamental requirement:** Phase 1 DWER directionality results are required before any advancement to Phase 2. No paper submission before Phase 1 experimental data exists. This is not a guideline — it is a hard constraint.

### 14.2 Deterministic Timing Accuracy

For each active link in the DWER and DRMA subsystems:
- Beam acquisition time: less than 5 seconds from receiver detection to locked delivery
- TDMA window compliance: beam fires within ±50 ms of assigned T_start across 95% of events
- Recovery time: re-acquisition after signal loss complete within 2 seconds for 95% of events
- Control cycle jitter: Lume-X cycle time variance less than ±2 ms at 73 Hz nominal

### 14.3 Routing Stability

For each active DRMA mesh configuration:
- Path convergence time after node addition: less than 500 ms
- Path reconvergence time after node failure: less than 2 control cycles (less than 30 ms)
- Oscillation detection time: less than 3 consecutive windows
- Routing table consistency: all nodes converge to identical topology within 1 second of any topology change

### 14.4 Harvesting Efficiency

For each DAEH harvesting modality at each deployment location:
- Power density measurement accuracy: ±10% of calibrated reference
- Charge accumulation repeatability: V_cap trajectory variance less than 5% across 10 trials
- Burst threshold detection: V_burst level confirmed within ±0.1V across 20 consecutive cycles
- Time-to-threshold prediction accuracy: predicted vs. actual within ±15% for 90% of burst events

### 14.5 Transmission Reliability

For each active DWER link:
- P_received ≥ P_min in at least 95% of attempts
- σ² < 10% across rolling 20-trial window
- Delivery confirmation rate: greater than 95% of transmissions confirmed within timeout window
- Beam alignment confirmation: greater than 10 dB gain vs. 45° off-axis (Phase 1 primary criterion)

### 14.6 Mesh-Level Resilience

For the full integrated DRMA mesh:
- Single-node failure: delivery continues within 2 control cycles through alternate path
- Multi-node failure: delivery continues for all destinations with viable alternate paths
- Bi-directional flow: demonstrated surplus-to-depleted transfer across at least one link reversal
- Moving receiver: tracking maintained at 0.5 m/s with less than 2 cm pointing error (Phase 3)

### 14.7 Safety Compliance

For every experimental session:
- Zero SAFETY_GATE failures in the final 100 transmissions of any session (no trend toward safety violations as session progresses)
- Exclusion zone enforcement: 100% gate compliance across all biological presence events injected during testing
- Power density: calculated values at all monitored points remain below ICNIRP thresholds in 100% of measurements
- Beam kill on signal loss: confirmed within one control cycle (less than 14 ms) in 100% of simulated signal loss events

---

## Appendix A — Formal Definitions and Notation

### A.1 Charge-State Vector

```
C = [V_cap, V_min, V_burst, V_max, dV/dt, mode, harvest_rate, cycles]
```

- V_cap ∈ [0, V_max] — current supercapacitor voltage (V)
- V_min — minimum operating voltage (V)
- V_burst — burst threshold voltage (V), V_burst > V_min
- V_max — rated maximum voltage (V)
- dV/dt — charge rate (V/s), positive during charging, negative during discharge
- mode ∈ {HARVEST, READY, TRANSMITTING, DEPLETED, SUPPLEMENTED}
- harvest_rate — ambient harvest power (µW), 60-second rolling average
- cycles — total charge-discharge cycle count (integer)

### A.2 Flow-Potential Vector

```
F = [source_id, P_available, direction_vector, loss_model, priority, T_available]
```

- source_id — Meridian node identifier of the source node
- P_available — estimated deliverable power in mW based on V_cap - V_burst margin
- direction_vector — unit vector in 3D space pointing toward highest-priority downstream path
- loss_model — L(link) and σ²(link) for the first downstream link
- priority — MFE-computed transmission priority score P ∈ [0, 1]
- T_available — earliest timestamp at which this node can transmit

### A.3 Routing Matrix

The MMF routing matrix R is an N×N matrix where N is the number of nodes in the network:

```
R[i][j] = { next_hop, cost, hops, quality, alt_next_hop, updated, state }
```

R[i][j] represents the routing table entry at node i for destination j. R[i][i] = NULL (no self-routing). R[i][j] = UNREACHABLE if no path exists from node i to node j.

### A.4 Timing Primitives

- T_now — current network timestamp (µs since epoch)
- T_slot(n) — start of current or next TDMA transmission window for node n
- T_burst(n) — MFE-projected burst transmission time for node n
- T_cycle — Lume-X control cycle period (13.7 ms at 73 Hz)
- T_switch — node mode-switch time, transmit to receive or receive to transmit (≈ 5 ms)

### A.5 Determinism Parameters

- P_min — minimum acceptable received power (mW)
- r — spatial uncertainty radius (cm), derived from localization accuracy
- σ² — maximum acceptable delivery variance (%), default 10%
- d — transmission distance (m)
- N_trials — minimum trial count for statistical validation, N_trials ≥ 20

---

## Appendix B — Meridian State Machine

### B.1 Node Lifecycle

Each Meridian relay node follows a defined state machine:

```
States: INIT → DISCOVERY → ACTIVE → DEGRADED → FAILED → RECOVERED

INIT:       Node powers on, loads Meridian firmware, reads provisioned identity
DISCOVERY:  Broadcasts NODE_ANNOUNCE, receives topology from neighbors, populates routing table
ACTIVE:     Normal operation — cycles through HARVEST → READY → TRANSMITTING → HARVEST
DEGRADED:   Operating with reduced capability — harvest rate below threshold, or link loss
FAILED:     Node unresponsive, presumed offline by neighbors after 2 missed cycles
RECOVERED:  Node returns from FAILED state, re-announces, requests routing table refresh
```

### B.2 Relay Eligibility

A node is eligible to relay when:
- State = ACTIVE
- mode ∈ {HARVEST, READY} (not TRANSMITTING or DEPLETED)
- Routing table entry exists for the requested destination
- V_cap ≥ V_burst
- No pending GATE conditions in MTL

### B.3 Transmission Gate State Machine

```
States: IDLE → CHECKING → GATED / AUTHORIZED → FIRING → CONFIRMING → LOGGED

IDLE:        No transmission pending
CHECKING:    MTL evaluating five gate conditions
GATED:       One or more conditions failed — transmission blocked, event logged
AUTHORIZED:  All five conditions passed — transmission authorized
FIRING:      Beam active, delivery in progress
CONFIRMING:  Beam complete, awaiting DELIVERY_CONFIRM from receiver
LOGGED:      Confirmation received (or timeout), delivery record written, state returns to IDLE
```

---

## Appendix C — Mathematical Model of Loss-Bounded Flow

### C.1 Free-Space Path Loss

```
FSPL(dB) = 20 log₁₀(d) + 20 log₁₀(f) + 20 log₁₀(4π/c)

At 2.4 GHz:
FSPL(1m)  ≈ 40.0 dB
FSPL(2m)  ≈ 46.0 dB
FSPL(3m)  ≈ 49.5 dB
FSPL(4m)  ≈ 52.0 dB
```

### C.2 Per-Hop Relay Efficiency

```
η_hop = η_rect × η_retx

Where:
η_rect ∈ [0.50, 0.70] — rectenna RF-to-DC conversion efficiency
η_retx ∈ [0.60, 0.75] — re-transmission DC-to-RF conversion efficiency

η_hop ∈ [0.30, 0.52]
η_hop_dB ∈ [-5.2, -2.8] dB
```

### C.3 Break-Even Distance Calculation

Multi-hop routing is more efficient than single-source transmission when:

```
FSPL_single(d_total) > FSPL_hop(d_hop) × N_hops + η_hop_dB_loss × (N_hops - 1)

For N_hops = 2, d_total = 4m, d_hop = 2m at 2.4 GHz:
Single: FSPL(4m) = 52.0 dB
Two-hop: FSPL(2m) × 2 + conversion_loss = 46.0 + 46.0 + 5.2 = 97.2 dB (total chain)
```

This formulation shows that naive comparison misleads: the break-even analysis must account for the fact that in a relay chain, the path loss is paid at each hop independently, not cumulatively. The correct comparison is:

```
P_received_single = P_tx / FSPL(d_total) × η_rect
P_received_multi  = P_tx / FSPL(d_hop) × η_hop^(N_hops-1) × η_rect

Break-even: P_received_single = P_received_multi
Solve for d_total given d_hop and η_hop
```

At η_hop = 0.40 and 2.4 GHz, the break-even distance is approximately 2.5–3 meters. Below this threshold, a single source is more efficient. Above it, relay nodes improve delivered power. This calculation must be validated experimentally in Phase 2 for the specific hardware used.

### C.4 Burst Threshold Functions

Charge accumulation to burst threshold:

```
T_to_burst(n) = max(0, (V_burst - V_cap(n)) / (dV/dt(n)))

Where dV/dt(n) is the current charge rate for node n.
```

Burst energy available above threshold:

```
E_burst(n) = 0.5 × C_sc × (V_cap(n)² - V_min²)

Where C_sc is supercapacitor capacitance in farads.
```

### C.5 Deterministic Timing Bounds

Maximum delivery latency for an N-hop relay chain:

```
T_delivery(N) = N × (T_burst + T_switch + T_confirm) + T_alignment

Where:
T_burst    ≈ 10 ms (default burst duration)
T_switch   ≈ 5 ms (mode switch overhead)
T_confirm  ≈ 5 ms (delivery confirmation round-trip)
T_alignment ≈ 50 ms (initial beam acquisition)

T_delivery(1) ≈ 70 ms
T_delivery(2) ≈ 120 ms
T_delivery(3) ≈ 170 ms
```

---

## Appendix D — Mesh Topology Scenarios

### D.1 Sparse Mesh (Low Node Density)

Configuration: 3 relay nodes, 5 meter inter-node spacing. Characteristics: fewer alternate paths available, higher path loss per hop (beyond break-even distance). SHDCL behavior: single-node failure may leave no viable alternate path for some destinations. Mitigation: DWER direct beam activated from source node to bypass failed relay segment.

### D.2 Dense Mesh (High Node Density)

Configuration: 9–16 relay nodes, 1.5 meter inter-node spacing. Characteristics: multiple alternate paths for most destinations, lower path loss per hop (within break-even distance may make single-source preferable). MFE behavior: routing preference shifts toward direct DWER links where single-source efficiency exceeds relay chain efficiency. SHDCL behavior: single-node failure resolved by multiple alternate paths with minimal delivery impact.

### D.3 Mobile Nodes

Configuration: one or more receiver nodes moving at up to 0.5 m/s. MTL behavior: beam steering updates at 10 Hz minimum, position freshness checked at every control cycle. MMF behavior: routing table updates propagate when mobile node moves between relay coverage zones. Success criterion: less than 2 cm pointing error while tracking 0.5 m/s movement.

### D.4 Environmental Interference

Scenarios: metallic reflectors creating multipath, human body occlusion of UWB signals, co-channel RF interference at 2.4 GHz. Characterization required during Phase 2 and 3 testing. SHDCL behavior: σ² increase triggers link DEGRADED state, alternate path activated. Mitigation options: frequency agility (switch to 5.8 GHz), beam shaping adjustments, localization modality fallback.

---

## Appendix E — Safety Model

### E.1 Guardian Security Rule Set (Energy Domain)

The following rules are enforced continuously by Guardian Security (Guardian-E) in the Meridian energy domain. This is the formal specification of the energy-domain security layer:

```
RULE GE-01: Every transmission must be authorized by a valid signed routing entry.
RULE GE-02: Position data must be independently confirmed before authorizing beam fire.
RULE GE-03: Delivery confirmation must match target position within r cm.
RULE GE-04: All inter-node messages must be authenticated against provisioned node keys.
RULE GE-05: TDMA window violations trigger immediate quarantine of the violating node.
RULE GE-06: Delivery failure rate exceeding 20% for any single destination triggers DENIAL_OF_POWER_SUSPECTED.
RULE GE-07: Energy flow reversal requests must originate from an authenticated surplus node.
RULE GE-08: Any node reporting charge state inconsistent with its measured behavior is flagged.
RULE GE-09: Guardian-E logs all security events with full context before taking any action.
RULE GE-10: No Guardian-E action suppresses a SAFETY_GATE event.
RULE GE-11: All rule violations are reported to Lume-X for SHDCL coordination.
```

### E.2 Transmission Constraints

- Maximum single-node RF output: 1W (hardware-enforced, not only software-enforced)
- Minimum beam cutoff response time: 1 control cycle (≤ 14 ms)
- Maximum exclusion zone radius: configurable, default 0.5 m around beam centerline
- Maximum calculated power density at monitored points: ICNIRP general public limits (2 W/m² at 2.4 GHz)
- Minimum position confirmation age: less than 500 ms before beam fire

### E.3 Failure-Mode Analysis

| Failure Mode | Detection Mechanism | Response | Log Event |
|---|---|---|---|
| Localization signal lost | MC position age > 500ms | Beam hold, re-acquisition | BEAM_HOLD |
| Node failure | No heartbeat × 2 cycles | Route around node | NODE_FAILED |
| Gate condition failure | MTL gate check | Block transmission | GATE_REJECT |
| Delivery not confirmed | Confirmation timeout | Retry × 2, then SHDCL | DELIVERY_FAILED |
| σ² threshold exceeded | MFE variance monitor | Link DEGRADED, alternate path | DETERMINISM_FAILURE |
| Biological presence detected | Exclusion zone sensor | Immediate beam cut | SAFETY_GATE |
| Power density threshold approached | BSL continuous monitor | Beam throttle, then cut | POWER_DENSITY_WARN |
| Routing oscillation detected | MMF flow history | Flow stabilization lock | OSCILLATION_DETECTED |
| Security rule violation | Guardian-E rule engine | Per-rule response | SECURITY_EVENT |

---

## Appendix F — Reference Implementation Blueprint

### F.1 Node Architecture

Each Meridian relay node hardware stack:

```
Layer 5: Lume-X Runtime (software)
Layer 4: Meridian Control Software (MC + MFE + MMF + MTL)
Layer 3: Communication Interface (USB for Phase 1, embedded for Phase 2+)
Layer 2: Sensor and Actuator Firmware (UWB, RF control, charge measurement)
Layer 1: Hardware (phased-array board, rectenna, supercapacitor, microcontroller, UWB module)
```

### F.2 Firmware Modules

**identity_module** — reads provisioned node identity from persistent storage, exposes MC identity interface.

**localization_module** — interfaces with UWB hardware, provides position updates at configured rate, reports staleness to MC.

**charge_monitor_module** — reads supercapacitor voltage at 1 Hz or faster, computes dV/dt rolling estimate, updates MC charge-state vector.

**harvest_monitor_module** — reads harvesting modality power sensors, updates harvest_rate in MC charge-state vector.

**beam_control_module** — translates MTL BeamCommand into phased-array driver settings, reports alignment status.

**rectenna_monitor_module** — measures received power at rectenna, reports to delivery confirmation channel.

**safety_gate_module** — hardware-level interlock for RF emission, independent of software gate (belt and suspenders safety architecture).

**communication_module** — handles inter-node messaging for routing table distribution, DELIVERY_CONFIRM, LINK_STATE_UPDATE, and Guardian-E authentication.

### F.3 Build Order

The recommended implementation order, validated and confirmed in the Meridian system specification:

1. DWER control loop built in Lume-X against mocked hardware data
2. Feedback logic validated end-to-end in software before any real hardware is connected
3. Real hardware connected one layer at a time — UWB localization first, then power measurement
4. DWER Phase 1 and Phase 2 proven with Lume-X as operational control system
5. Inter-node synchronization protocol designed, specified, and validated in simulation
6. DRMA two-node testbed built and validated
7. DAEH charge-state monitoring and burst scheduling added to Lume-X control loop
8. Full three-layer operation validated: harvest → store → route → deliver

---

## References

[1] Brown, W.C. (1969). "Experiments in the Transportation of Energy by Microwave Beam." *IEEE PTGMTT International Symposium Digest.*

[2] Brown, W.C. (1984). "The History of Power Transmission by Radio Waves." *IEEE Transactions on Microwave Theory and Techniques, 32*(9), 1230–1242.

[3] Kurs, A., Karalis, A., Moffatt, R., Joannopoulos, J.D., Fisher, P., & Soljačić, M. (2007). "Wireless Power Transfer via Strongly Coupled Magnetic Resonances." *Science, 317*(5834), 83–86.

[4] Glaser, P.E. (1968). "Power from the Sun: Its Future." *Science, 162*(3856), 857–861.

[5] Mitcheson, P.D., Yeatman, E.M., Rao, G.K., Holmes, A.S., & Green, T.C. (2008). "Energy Harvesting From Human and Machine Motion for Wireless Electronic Devices." *Proceedings of the IEEE, 96*(9), 1457–1486.

[6] Roundy, S., Wright, P.K., & Rabaey, J. (2004). *Energy Scavenging for Wireless Sensor Networks.* Kluwer Academic Publishers.

[7] Vullers, R.J.M., van Schaijk, R., Doms, I., Van Hoof, C., & Mertens, R. (2010). "Micropower Energy Harvesting." *Solid-State Electronics, 53*(7), 684–693.

[8] Wang, Z.L. (2012). "Self-Powered Nanosensors and Nanosystems." *Advanced Materials, 24*(2), 280–285. [Triboelectric nanogenerators]

[9] Myny, K., et al. (2010). "Organic RFID Transponder Chip With Data Rate Compatible With Electronic Product Coding." *Organic Electronics, 11*(7), 1176–1179.

[10] Tauk, A.C.J., et al. (2006). "Wireless Energy Transfer Using Magnetic Resonance." *Applied Physics Letters, 89*(18).

[11] Dickinson, R.M. (1975). "Rectenna Power Systems." *Proceedings of the IEEE Conference on Industrial Applications of Microwave Energy.*

[12] He, X., Shu, W., Li, B., & Du, H. (2013). "Smart Grid Meeting House: A Wireless Power System Architecture for Consumer Electronics." *IEEE Internet of Things Journal, 1*(1).

[13] Zhang, Z., Pang, H., Georgiadis, A., & Cecati, C. (2019). "Wireless Power Transfer — An Overview." *IEEE Transactions on Industrial Electronics, 66*(2), 1044–1058.

[14] Fan, Y., Li, X., & Xu, X. (2013). "Relay Effect of Wireless Power Transfer Using Strongly Coupled Magnetic Resonances." *Progress in Electromagnetics Research, 138*, 153–171.

[15] Andrews, J. (2026). *Lume Language Specification.* DarkWave Studios LLC. DOI: 10.5281/zenodo.19382282.

[16] Andrews, J. (2026). *Trust Layer Ecosystem.* DarkWave Studios LLC. DOI: 10.5281/zenodo.19560674.

[17] Andrews, J. (2026). *DAIGS Framework.* DarkWave Studios LLC. DOI: 10.5281/zenodo.19491784.

[18] Andrews, J. (2026). *Lume-V Verification Suite.* DarkWave Studios LLC. DOI: 10.5281/zenodo.19645097.

[19] Andrews, J. (2026). *Deterministic Dissolution.* DarkWave Studios LLC. DOI: 10.5281/zenodo.15065493.

[20] Andrews, J. (2026). *Axiom DDA: The Deterministic AI Agent.* DarkWave Studios LLC. [Whitepaper DDA-WP-2026-0422]

[21] Pozar, D.M. (2011). *Microwave Engineering*, 4th ed. Wiley.

[22] Skolnik, M.I. (2008). *Radar Handbook*, 3rd ed. McGraw-Hill. [Phased-array beamforming reference]

[23] Department of Homeland Security. (2012). *HEMP Protection for Ground-Based C4I Facilities Performing Critical, Time-Urgent Missions.* MIL-HDBK-423.

[24] ICNIRP. (2020). "Guidelines for Limiting Exposure to Electromagnetic Fields (100 kHz to 300 GHz)." *Health Physics, 118*(5), 483–524.

[25] FCC. (2019). *Evaluating Compliance with FCC Guidelines for Human Exposure to Radiofrequency Electromagnetic Fields.* OET Bulletin 65, Edition 97-01.

[26] Decawave. (2019). *DWM1001 Module Datasheet.* Rev 1.3.

---

*END OF PAPER*

*Meridian — A Four-Layer Deterministic Wireless Energy Routing Architecture*
*Version 1.0 — DarkWave Studios LLC*
*Author: Jason Andrews*
*Do not submit to any publication venue before Phase 1 experimental data exists.*
*Guardian Security domain: TrustShield.tech*
*Lume-X provisionally patented.*
