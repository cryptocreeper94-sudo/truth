# The Energy Internet: A Universal Protocol Stack for Deterministic Wireless Power Delivery

**Subtitle:** Extending the Meridian Architecture Toward a Global Standard for Routed Energy

---

**DarkWave Studios LLC — Canon² Technical Paper Series**
**Paper Number:** [Assign at Zenodo Upload]
**DOI:** [Assign at Zenodo Upload — doi.org/10.5281/zenodo.XXXXXXX]

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Affiliation:** DarkWave Studios LLC, Nashville, Tennessee
**Contact:** team@dwsc.io
**GitHub:** github.com/cryptocreeper94-sudo
**Website:** lume-lang.org
**Series:** Canon² — Engineering Architecture Papers

**Patent Pending:** Systems and Methods for Deterministic Multi-Layer Wireless Energy Routing Using Ambient Harvesting, Mesh Coordination, and Directional Transmission (DarkWave Studios LLC)
**Lume-X:** Provisionally patented deterministic control runtime.

**Companion Papers:**
- Andrews, J. (2026). Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture. DarkWave Studios LLC. Canon² Paper Series. [Cited as "Meridian Architecture, 2026"]
- Andrews, J. (2026). Meridian as Synthetic Organism: A Formal Structural Isomorphism Between Deterministic Wireless Energy Routing and Biological System Architecture. DarkWave Studios LLC. Canon² Paper Series. [Cited as "Meridian Organism, 2026"]

**Related Work:**
- Lume Language Specification — DOI: 10.5281/zenodo.19382282
- Trust Layer Ecosystem — DOI: 10.5281/zenodo.19560674
- DAIGS Framework — DOI: 10.5281/zenodo.19491784
- Lume-V Verification Suite — DOI: 10.5281/zenodo.19645097
- Lume-X Multi-Agent Cognition — DOI: 10.5281/zenodo.19443968
- Deterministic Dissolution — DOI: 10.5281/zenodo.15065493

> *This preprint has not undergone peer review.*

*© 2026 DarkWave Studios LLC. All rights reserved. Patent pending.*

---

## Abstract

The internet did not begin as a global network. It began as a protocol — a formal specification for how independently administered networks could exchange packets across a shared addressing space using common routing rules. Once the protocol was correct, the network grew to encompass the planet without requiring central coordination. Every device that speaks IP participates in the same network regardless of who built it, where it runs, or what physical medium it uses. The protocol is the internet. The infrastructure follows.

I propose that the same transformation is possible for energy delivery — and that the foundational protocol now exists.

The Meridian architecture, defined in the companion paper [Meridian Architecture, 2026], demonstrates that wireless energy can be routed deterministically through a mesh of addressed nodes using routing tables, quality-of-service guarantees, and a self-healing control runtime. The architecture is complete at room scale. This paper extends it toward a universal protocol standard: the Energy Internet.

I define the Energy Internet Protocol Stack — a formal, layered specification for deterministic energy routing across independently administered meshes. The stack comprises five layers: the Energy Physical Layer (EPL), the Energy Link Layer (ELL), the Energy Network Layer (ENL), the Energy Transport Layer (ETL), and the Energy Application Layer (EAL). I define the Energy Internet Protocol (EIP) for addressing and routing, the Energy Transmission Control Protocol (ETCP) for delivery guarantees, the Energy Domain Name System (EDNS) for human-readable endpoint addressing, and the Energy Border Gateway Protocol (EBGP) for inter-mesh federation between independently operated networks.

I argue that the supercapacitor is the packet buffer of the Energy Internet — that burst-mode transmission is packet switching applied to power — and that every core mechanism of the data internet has a functional analog in the energy domain. I demonstrate that the obstacles to energy internet standardization are not primarily technical but architectural, economic, and governance-related, and I propose a standardization pathway analogous to the IETF RFC process through which the data internet protocols were developed.

This paper makes no claim that the Energy Internet is imminent. Phase 1 experimental data for the room-scale Meridian architecture does not yet exist. The path to the Energy Internet runs through every experimental phase defined in the companion paper. This is a theoretical framework paper. Its purpose is to establish, formally and now, that a universal wireless energy routing protocol is architecturally coherent — so that when Phase 1 data exists, the target is already defined.

**Keywords:** energy internet, wireless power routing, network protocol stack, deterministic energy delivery, inter-mesh federation, energy addressing, quality of service, energy border gateway protocol, Meridian, Lume-X, wireless power transfer standard

---

## Table of Contents

1. Introduction
2. Background: The Internet as a Model
3. The Energy Internet Protocol Stack
4. Energy Addressing and the Energy Domain Name System
5. Inter-Mesh Federation and Energy Peering
6. Quality of Service for Power Delivery
7. Security at Scale: Guardian Security as the Energy TLS
8. The Path from Meridian to Energy Internet
9. Governance and Standardization
10. Related Work
11. Limitations and Honest Boundaries
12. Conclusion
- Appendix A — Energy Internet Protocol Stack: Formal Layer Definitions
- Appendix B — Energy Address Specification
- Appendix C — Energy Border Gateway Protocol (EBGP) Overview
- Appendix D — Standardization Roadmap
- References

---

## 1. Introduction

### 1.1 The Wrong Frame

The history of wireless power transfer has been written in the wrong frame. Every major milestone in the field — Brown's 54% rectenna efficiency in 1969, the MIT resonance demonstration in 2007, the proliferation of Qi charging pads — has been framed as a transmission problem. How much power can be transferred? How efficiently? How far? The implicit model is a pipe: a source at one end, a receiver at the other, and the question is how much gets through.

This frame produced sixty years of genuine technical progress and one fundamental architectural dead end. A pipe, no matter how efficient, cannot scale into infrastructure. Infrastructure requires routing — the capacity to direct resources along dynamically selected paths through a network of nodes, to reroute around failure, to prioritize competing demands, to guarantee delivery. A pipe has none of these properties. Neither does any wireless power system designed in the transmission frame.

The internet did not succeed because its transmission technology was superior. Packet radio, coaxial cable, fiber optics, and satellite links are all radically different physical transmission media. They share one thing: the IP protocol, which abstracts away the physical medium and provides a universal addressing, routing, and delivery framework that works identically regardless of what is underneath. Any physical medium that can carry a packet can participate in the internet. The protocol is the infrastructure. The medium is interchangeable.

I propose applying this insight to energy delivery. The Energy Internet is not a wireless power system — it is a protocol. A formal specification for how energy flows between addressed nodes across independently administered meshes, using common routing rules, delivery guarantees, and security mechanisms that work identically regardless of the physical transmission medium underneath. Any physical medium capable of delivering energy in a controlled, measurable, confirmed manner can participate in the Energy Internet. The protocol is the infrastructure. Meridian [Meridian Architecture, 2026] is the first medium that can participate.

### 1.2 Why Now

Two developments make this proposal timely rather than speculative.

First, the Meridian architecture [Meridian Architecture, 2026] has demonstrated that deterministic wireless energy routing is architecturally complete. The four-layer Meridian stack — Meridian Core, Meridian Flow Engine, Meridian Mesh Fabric, and Meridian Transmission Layer — provides every component required for addressed energy routing: node identity, spatial coordination, flow governance, topology-aware routing, and physical beam delivery with closed-loop confirmation. The architecture is not a sketch. It is a formally specified system with defined interfaces between all layers. A protocol built on this foundation has a complete implementation target.

Second, the convergence of IP networking concepts with physical infrastructure management has accelerated. Software-defined networking has separated the control plane from the data plane, enabling centralized routing intelligence over distributed physical infrastructure. Network function virtualization has decoupled network functions from dedicated hardware. These developments have created a body of engineering practice and tooling directly applicable to the Energy Internet control plane. The Energy Internet does not need to invent its control architecture from scratch — it can adopt SDN patterns proven in the data networking domain.

### 1.3 The Central Analogy

The central analogy of this paper is the correspondence between data packet routing and energy burst routing. I state it precisely here and develop it formally throughout:

| Data Internet | Energy Internet |
|---|---|
| Bit | Joule |
| Packet | Burst |
| Packet buffer (RAM) | Supercapacitor |
| Store-and-forward | Harvest-store-transmit |
| IP address | Energy address (EIP) |
| Routing table | Energy routing table |
| TCP delivery guarantee | ETCP delivery guarantee |
| BGP inter-domain routing | EBGP inter-mesh routing |
| TLS security layer | Guardian Security (Guardian-E) |
| DNS | Energy Domain Name System (EDNS) |
| ISP | Energy Service Provider (ESP) |
| Internet Exchange Point (IXP) | Energy Exchange Point (EXP) |
| Autonomous System (AS) | Energy Autonomous System (EAS) |

Each of these correspondences will be developed formally. They are not loose analogies — they are functional equivalences at the protocol level. The mechanisms differ because the physics of energy and data differ, but the protocol functions are identical.

### 1.4 What the Energy Internet Is Not

Before proceeding, I want to be explicit about the scope of this proposal.

The Energy Internet is not a proposal to replace the electrical grid. The conventional grid transmits gigawatts over continental distances with transmission losses of 5–10%. The Energy Internet, at current development scale, delivers milliwatts to watts over meter-scale distances. These are different operating regimes by many orders of magnitude. The grid will not be replaced by wireless mesh networks in any foreseeable timeframe. The Energy Internet addresses a different market: low-power distributed devices — sensors, wearables, IoT nodes, microcontrollers, relay nodes — that are poorly served by wired infrastructure, impractical to battery-maintain at scale, and within the power budget of ambient harvesting and directed beam delivery.

The Energy Internet is not imminent. No room-scale Meridian deployment has been experimentally validated. The path from laboratory demonstration to building scale to campus scale to city scale is measured in years per phase, not months. Each phase requires independent efficiency validation, safety certification, and regulatory review.

The Energy Internet is a standard — a specification — not a product. Its value is in establishing the protocol now, so that when the hardware capabilities exist, the routing infrastructure is already defined and interoperability is built in from the first deployment.

### 1.5 Paper Organization

Section 2 examines the data internet as a model for protocol-driven infrastructure scaling. Section 3 defines the Energy Internet Protocol Stack formally. Section 4 specifies energy addressing and the Energy Domain Name System. Section 5 defines inter-mesh federation and the Energy Border Gateway Protocol. Section 6 develops the quality-of-service framework for power delivery. Section 7 defines security at Energy Internet scale. Section 8 maps the path from current Meridian development to Energy Internet deployment. Section 9 addresses governance and standardization. Section 10 situates this work in related literature. Section 11 states limitations explicitly. Section 12 concludes. Four appendices provide formal specifications for the protocol stack, addressing, peering protocol, and standardization roadmap.

---

## 2. Background: The Internet as a Model

### 2.1 How the Data Internet Scaled

The ARPANET, the precursor to the modern internet, connected four nodes in 1969. It did not scale to global infrastructure because the underlying transmission technology was superior. It scaled because the protocol was correct [27, 28].

The key design decisions that made scaling possible were:

**Packet switching.** Rather than reserving a dedicated circuit between sender and receiver (as telephone networks did), packet switching breaks data into independently routed packets. Each packet carries its own destination address and is independently routed through whatever path is currently available. Circuits reserve capacity regardless of use; packets use capacity only when data exists to transmit. This efficiency gain is what made the internet economically viable at scale.

**Layered abstraction.** The OSI reference model [29] and TCP/IP stack separated network concerns into independent layers, each with a defined interface to the layers above and below. Physical medium, link-level framing, network-level addressing, transport-level delivery guarantees, and application-level services are independently specified. A new physical medium (fiber optics, wireless, satellite) can participate in the internet by implementing the link layer interface — it does not need to know about TCP, DNS, or any application protocol. The abstraction is what makes the internet medium-independent.

**Decentralized routing.** The Border Gateway Protocol [30] allows independently administered networks (Autonomous Systems) to exchange routing information and forward packets across network boundaries without requiring central coordination. No single entity controls internet routing. Each AS advertises the destinations it can reach and the routing protocol distributes this information through the network. The internet has no center. It has a protocol.

**Best-effort delivery with transport-layer guarantees.** The IP layer provides best-effort delivery: packets are forwarded toward their destination, but delivery is not guaranteed. The TCP layer adds delivery guarantees: lost packets are detected and retransmitted, packets are reordered if necessary, and the application sees a reliable byte stream regardless of the unreliability of the underlying network. The separation of routing (IP) from delivery guarantee (TCP) allows both to be independently optimized.

These four design decisions — packet switching, layered abstraction, decentralized routing, and separated reliability guarantee — are the architectural core of the data internet. I will show in Section 3 that all four have direct analogs in the Energy Internet.

### 2.2 What the Grid Did Not Do

The electrical grid took the opposite approach on every dimension.

The grid uses circuit switching: a generator produces power, it flows through transmission lines to a substation, and from there to distribution lines and finally to the consumer. The path is fixed by the physical wiring. There is no dynamic routing. A broken transmission line is a broken path — there is no protocol to reroute power around it. The grid's resilience comes from physical redundancy (parallel transmission lines) rather than dynamic routing.

The grid is not layered. High-voltage transmission, medium-voltage distribution, and low-voltage delivery are different physical systems, but they are not abstracted from each other. A generator cannot participate in a different grid by implementing an interface specification — it must be physically connected to the transmission system with compatible voltage and frequency characteristics.

The grid is centrally coordinated. Grid operators — independent system operators (ISOs) and regional transmission organizations (RTOs) — coordinate generation and transmission in real time. The grid has a center. When the center fails, the grid fails. The 2003 North American blackout cascaded through 55 million people because a single control center lost situational awareness.

The grid provides no delivery guarantee at the individual device level. Power arrives at a standard voltage and frequency; what happens to it at the point of consumption is the consumer's problem. There is no TCP equivalent for electricity.

The grid's architecture reflects the engineering constraints of its era: it was designed before packet switching, before layered network protocols, and before the computational infrastructure that makes dynamic routing practical. It is not wrong — it is optimized for a different set of constraints. But it is not the architecture that produces the Energy Internet.

### 2.3 The Packet-Burst Correspondence

The most important technical correspondence between the data internet and the Energy Internet is the equivalence between a data packet and an energy burst. This equivalence is what makes the protocol stack analogy functional rather than metaphorical.

A data packet is a bounded unit of data transmitted as a unit through the network. It carries a header (source address, destination address, routing information, sequence number) and a payload (the data being delivered). It is stored in a buffer at each router, queued for transmission, forwarded on the selected outgoing interface, and confirmed received by the next hop.

An energy burst is a bounded unit of energy transmitted as a unit through the mesh. It carries header information (source node identity, destination node identity, routing path, burst sequence number, power level) and a payload (the RF energy delivered). It is stored in a supercapacitor at each relay node, queued for transmission in the TDMA schedule, forwarded on the selected outgoing beam path, and confirmed received by the next hop via delivery confirmation telemetry.

The supercapacitor IS the packet buffer. The TDMA transmission window IS the queue scheduling algorithm. The MFE burst scheduler IS the packet forwarding engine. The DRMA relay chain IS the store-and-forward router chain. The SHDCL retry sequence IS TCP retransmission. The delivery confirmation telemetry IS the TCP acknowledgment.

These are not loose analogies. They are the same mechanism — store, schedule, forward, confirm — applied to joules rather than bits. The physics differ (energy dissipates during transmission; bits do not), but the protocol function is identical.

### 2.4 The Key Difference: Lossiness

The data internet can retransmit a lost packet with zero information loss. A bit transmitted and lost can be retransmitted identically. Energy transmitted and lost — dissipated as heat during RF propagation — cannot be recovered. Retransmission of an energy burst costs new energy. This is the fundamental physical difference between data routing and energy routing, and it has protocol implications throughout.

In the data internet, lossiness at the IP layer is absorbed by TCP retransmission. The cost of retransmission is latency. In the Energy Internet, lossiness at the EPL layer is absorbed by ETCP retransmission (Section 6). The cost of retransmission is energy. Every protocol design decision in the Energy Internet must account for this asymmetry: retransmission costs what it is trying to deliver.

This asymmetry makes energy routing inherently less tolerant of routing inefficiency than data routing. A data packet lost in transit is annoying. An energy burst lost in transit depletes the transmitting node, fails to charge the receiving node, and may leave the mesh in a degraded state that requires SHDCL recovery. Energy routing protocols must minimize retransmission more aggressively than data routing protocols because the cost of retransmission is not just latency — it is energy.

---

## 3. The Energy Internet Protocol Stack

### 3.1 Design Principles

The Energy Internet Protocol Stack (EIPS) is designed on four principles inherited directly from the data internet design philosophy:

**Principle 1 — Layered abstraction.** Each layer provides a defined interface to the layers above and below. A new physical transmission medium participates in the Energy Internet by implementing the EPL interface. A new application that consumes delivered energy participates by using the EAL interface. No layer needs to know the internal implementation of any other layer.

**Principle 2 — Decentralized routing.** No single entity controls Energy Internet routing. Each Energy Autonomous System (EAS) administers its own routing tables internally and exchanges reachability information with peer EAS networks through EBGP. The Energy Internet has no center.

**Principle 3 — Separation of routing and delivery guarantee.** EIP (Energy Internet Protocol) provides routing — determining which path a burst takes through the network. ETCP (Energy Transmission Control Protocol) provides delivery guarantee — ensuring that the target device receives at least P_min across N trials with variance below σ²_max. These are independent functions with independent protocols.

**Principle 4 — Physical medium independence.** The Energy Internet is not defined by a specific transmission technology. Directed RF beamforming (Meridian/DWER) is the first medium. Optical energy delivery, millimeter-wave transmission, inductive relay chains, and future technologies that do not yet exist are all valid EPL implementations as long as they can satisfy the ELL interface requirements: addressed node delivery, power measurement, and delivery confirmation.

### 3.2 The Five-Layer Stack

```
┌─────────────────────────────────────────────┐
│  EAL — Energy Application Layer             │
│  (Energy as a Service, priority routing,    │
│   application-defined power profiles)       │
├─────────────────────────────────────────────┤
│  ETL — Energy Transport Layer               │
│  (ETCP: delivery guarantee, P_min/σ²        │
│   enforcement, retransmission, QoS)         │
├─────────────────────────────────────────────┤
│  ENL — Energy Network Layer                 │
│  (EIP: addressing, inter-mesh routing,      │
│   EBGP, EDNS resolution)                    │
├─────────────────────────────────────────────┤
│  ELL — Energy Link Layer                    │
│  (hop-by-hop delivery, burst framing,       │
│   link-level confirmation, TDMA scheduling) │
├─────────────────────────────────────────────┤
│  EPL — Energy Physical Layer                │
│  (transmission medium: RF, optical, etc.    │
│   beam control, safety gating, localization)│
└─────────────────────────────────────────────┘
```

Each layer is defined by the services it provides to the layer above and the requirements it places on the layer below.

### 3.3 Energy Physical Layer (EPL)

The EPL is the transmission medium. It is responsible for the actual delivery of energy from one node to an adjacent node — a single hop. The EPL does not know about multi-hop routing, delivery guarantees across an end-to-end path, or addressing above the single-hop level. It knows how to aim energy at a located node, fire a burst, and confirm that energy was received.

**EPL mandatory capabilities:**
- Node localization: must be able to determine the position of the receiving node within a spatial uncertainty radius r, updated at minimum 10 Hz
- Directed transmission: must be able to aim energy output toward the located receiver with a beam width that limits energy outside the intended path
- Power measurement: receiving node must measure P_received at mW resolution and report it back to the transmitting node
- Delivery confirmation: must provide a confirmed delivery receipt containing P_received, spatial accuracy achieved, and timestamp
- Safety gating: must implement hardware-level transmission cutoff independent of software gate status

**EPL optional capabilities (for advanced implementations):**
- Beam shaping for sidelobe reduction
- Frequency agility across multiple operating bands
- Multi-element phased-array steering
- Polarization diversity

**Meridian/DWER as EPL implementation.** The DWER subsystem as defined in [Meridian Architecture, 2026] is a complete EPL implementation. MTL (Meridian Transmission Layer) provides beam steering, safety gating, and physical emission control. The UWB localization subsystem provides node localization. The delivery confirmation telemetry provides power measurement and confirmation. Every EPL mandatory capability is satisfied by the Meridian/DWER specification.

### 3.4 Energy Link Layer (ELL)

The ELL manages energy delivery across a single hop within the mesh — between one node and its immediate neighbor. It provides link-level framing (the Energy Burst Frame, described below), TDMA slot scheduling within the local mesh, link-quality monitoring, and per-hop delivery confirmation.

**Energy Burst Frame (EBF):**

```
EBF Header:
  src_node_id     : 64 bits   (sending node's EIP address)
  dst_node_id     : 64 bits   (receiving node's EIP address)
  burst_seq_num   : 32 bits   (sequence number for this burst)
  P_planned_mW    : 16 bits   (planned transmit power)
  T_window_start  : 64 bits   (network timestamp, µs)
  T_window_end    : 64 bits   (network timestamp, µs)
  hop_count       : 8 bits    (number of hops traversed so far)
  ttl             : 8 bits    (maximum hops remaining)
  path_id         : 32 bits   (routing path identifier from ENL)
  safety_flags    : 16 bits   (BSL status flags at time of transmission)
  checksum        : 32 bits

EBF Confirmation (returned by receiver):
  src_node_id     : 64 bits
  dst_node_id     : 64 bits
  burst_seq_num   : 32 bits
  P_received_mW   : 16 bits   (measured received power)
  V_cap_after     : 16 bits   (supercapacitor voltage after receipt)
  spatial_error_cm: 8 bits    (position error at time of receipt)
  T_received      : 64 bits   (network timestamp of receipt)
  status          : 8 bits    (CONFIRMED / PARTIAL / FAILED)
```

The EBF provides the Energy Internet with its fundamental unit of transmission accounting. Every joule delivered through the Energy Internet is traceable to a specific EBF with a specific confirmation status. This is the foundation for energy billing, regulatory compliance, and safety audit trails.

**ELL relationship to Meridian.** The ELL maps directly onto the Meridian link layer as defined in the DRMA and DWER subsystems. The EBF header corresponds to the BeamCommand struct (MTL), and the EBF confirmation corresponds to the DeliveryConfirm message. Meridian nodes implementing the EIPS run ELL as their link-layer protocol.

### 3.5 Energy Network Layer (ENL)

The ENL provides energy routing across multiple hops and across mesh boundaries. It implements EIP — the Energy Internet Protocol — for addressing and intra-AS routing, and EBGP for inter-AS routing. ENL is the layer that makes the Energy Internet a network rather than a collection of isolated meshes.

The ENL is analogous to the IP layer in the data internet: it provides best-effort routing — the best path currently available is used, but delivery across the full path is not guaranteed at this layer. Delivery guarantees are provided by the ETL above.

ENL maintains the energy routing table at each node — not the local per-mesh routing table maintained by MMF, but the wider energy routing table that includes paths to nodes in other EAS networks. ENL processes EBF headers, determines the next-hop ELL address for each burst, and forwards bursts accordingly.

### 3.6 Energy Transport Layer (ETL)

The ETL provides end-to-end delivery guarantees across the full path from source to destination — the equivalent of TCP for energy. It enforces the P_min/r/σ²/d determinism standard across the full path, not just per hop. It handles retransmission when delivery fails, reordering when burst sequence is disrupted, and congestion control when the mesh is overloaded.

**ETCP — Energy Transmission Control Protocol:**

ETCP maintains a session between a source energy provider and a destination energy consumer. The session specifies:

```
ETCP Session:
  source_EIP          : energy address of providing node
  destination_EIP     : energy address of consuming device
  P_min_mW            : minimum acceptable power at destination
  sigma_sq_max        : maximum acceptable delivery variance (%)
  priority_class      : QoS priority (CRITICAL / HIGH / NORMAL / BACKGROUND)
  session_duration    : session length in seconds (or INDEFINITE)
  retry_limit         : maximum retransmission attempts per burst
  billing_account     : energy credit account for settlement
```

ETCP monitors cumulative delivery statistics across all bursts in a session. If the rolling σ² across the last N bursts exceeds σ²_max, ETCP signals the ENL to reroute through a less lossy path. If P_received falls below P_min across three consecutive bursts, ETCP triggers a retransmission and escalates to SHDCL if retransmission fails.

**The cost of retransmission.** As established in Section 2.4, energy retransmission costs energy. ETCP's retransmission mechanism must account for this: a retransmission request is not free. ETCP maintains a retransmission budget per session — a maximum number of retransmissions permitted before the session is flagged as inefficient and rerouting is forced. This prevents a poorly performing path from draining nodes through repeated retransmission.

### 3.7 Energy Application Layer (EAL)

The EAL is the interface between the Energy Internet and the applications that consume delivered energy. It provides three primary services:

**Energy as a Service (EaaS).** A consuming device declares its power profile — minimum power, preferred power, maximum power, duty cycle — and the EAL negotiates a ETCP session that satisfies the profile. The device does not manage its own energy delivery; the EaaS layer handles all routing, delivery guarantee, and retransmission management on its behalf.

**Priority routing requests.** The EAL allows consuming devices to request priority-class delivery. A medical monitoring device requests CRITICAL priority. A background IoT sensor requests BACKGROUND priority. The EAL translates priority classes into QoS parameters for the ETCP session and ENL routing preferences.

**Energy accounting interface.** The EAL provides each consuming device with a standardized interface to its energy consumption accounting: how much energy was delivered in the current session, at what efficiency, from which source nodes, and at what cost in energy credits.

---

## 4. Energy Addressing and the Energy Domain Name System

### 4.1 The Energy Internet Protocol Address (EIP Address)

The MC 64-bit node identity defined in [Meridian Architecture, 2026] serves as the link-layer identifier within a single mesh. The Energy Internet requires a hierarchical addressing scheme that spans multiple independently administered meshes — equivalent to the transition from MAC addresses (link-layer, locally unique) to IP addresses (network-layer, globally unique).

The EIP address is a 128-bit hierarchical identifier structured as:

```
EIP Address (128 bits):
  [Global Registry ID : 16 bits]   Assigned by the Energy Internet Registry Authority (EIRA)
  [EAS Number        : 24 bits]    Energy Autonomous System number — uniquely identifies mesh operator
  [Zone ID           : 16 bits]    Logical zone within the EAS
  [Node Type         : 8 bits]     Functional role (source / relay / destination / harvesting relay / gateway)
  [Node Serial       : 40 bits]    Unique per-node serial within the EAS
  [Checksum          : 24 bits]    Address integrity verification
```

This 128-bit structure provides:
- 65,536 Global Registry partitions (supporting multiple governance regimes or geographic regions)
- 16,777,216 unique EAS numbers (each independently administered energy mesh network)
- 65,536 zones per EAS
- 256 node types
- 1 trillion unique nodes per EAS zone

The address space is intentionally large — designed to accommodate the scale of a global sensor and IoT network without requiring renumbering as the Energy Internet grows. The IPv6 designers learned this lesson painfully from IPv4's exhausted 32-bit space; EIP incorporates it from the beginning.

**Address hierarchy and routing.** The EAS Number in the EIP address is the key to inter-mesh routing. Within a single EAS, routing uses MMF's intra-mesh routing tables (extended to EIP addressing). Between EAS networks, routing uses EBGP to exchange reachability information: "EAS 42 can reach nodes with EAS Number 42 in their address." This is structurally identical to BGP routing in the data internet, where Autonomous System Numbers identify networks and BGP routes between them.

### 4.2 EIP Subnetting and Zone Aggregation

Large EAS deployments — a campus, a building complex, or an industrial facility — may contain thousands of nodes organized into zones. Routing announcements for every individual node would overwhelm inter-mesh routing protocols. EIP uses zone aggregation analogous to IP CIDR (Classless Inter-Domain Routing): a gateway node announces the entire zone as a single reachable prefix rather than individual node addresses.

```
Zone aggregation example:
  Full node address: [EIRA:0001][EAS:000042][ZONE:0005][TYPE:02][SERIAL:000000001234][CHK:...]
  Zone aggregate:    [EIRA:0001][EAS:000042][ZONE:0005][*][*][*]
  Inter-mesh announcement: "EAS:000042 can deliver energy to all nodes in ZONE:0005"
```

This dramatically reduces the routing table size at inter-mesh gateway nodes — exactly as CIDR reduces BGP routing table size in the data internet.

### 4.3 Energy Domain Name System (EDNS)

EIP addresses are not human-readable. Just as the Domain Name System translates human-readable hostnames (google.com) to IP addresses, the Energy Domain Name System translates human-readable energy endpoint names to EIP addresses.

EDNS names follow a hierarchical structure:

```
[device-name].[zone].[facility].[operator].energy

Examples:
  sensor-7.lab-a.building-3.mit.energy
  cardiac-monitor-icu-4.floor-2.mass-general.energy
  relay-node-42.zone-5.campus-north.darkwave.energy
```

EDNS resolution works identically to DNS:
1. Consuming device requests EIP address for `sensor-7.lab-a.building-3.mit.energy`
2. Local EDNS resolver checks its cache
3. If not cached: queries the authoritative EDNS server for `building-3.mit.energy`
4. Authoritative server returns the EIP address for `sensor-7.lab-a`
5. Resolver caches the result with a TTL and returns to the requesting device

EDNS is administered by the facility operator — in the example above, MIT manages the `mit.energy` EDNS zone. The root EDNS zone (`.energy`) is administered by the EIRA (Energy Internet Registry Authority) — the governance body proposed in Section 9.

**EDNS and mobile nodes.** For nodes that move between zones — a mobile medical device that travels between hospital floors, or a wearable that moves through a building — EDNS must provide low-latency address update capability. The TTL on EDNS records for mobile nodes should be short (seconds rather than hours) and the authoritative EDNS server should update records when node position crosses zone boundaries. This is analogous to mobile IP, where a mobile device's home agent maintains a current location binding.

---

## 5. Inter-Mesh Federation and Energy Peering

### 5.1 Energy Autonomous Systems

An Energy Autonomous System (EAS) is an independently administered collection of energy routing nodes under common operational control. A university campus, a hospital complex, a smart factory, or a city block could each constitute an EAS. The EAS is the fundamental unit of Energy Internet governance: within an EAS, the operator chooses its own routing protocols and node management practices. Between EAS networks, routing is governed by EBGP.

Every EAS has:
- A globally unique EAS Number assigned by the EIRA
- One or more gateway nodes that peer with adjacent EAS networks
- An internal routing domain managed by the operator's choice of intra-EAS protocol (Meridian MMF at small scale; more scalable protocols at large scale)
- A routing policy that defines which destinations the EAS will accept energy traffic for and which EAS peers it will transit traffic between

This structure is identical to the Autonomous System model of the data internet, and for the same reason: it allows the Energy Internet to scale without requiring any central entity to know the complete topology.

### 5.2 Energy Exchange Points (EXPs)

In the data internet, major carriers interconnect at Internet Exchange Points (IXPs) — physical facilities where routers from multiple Autonomous Systems share a common switching fabric and exchange BGP routing information. This eliminates the need for every AS to establish direct connections to every other AS.

The Energy Internet requires the same infrastructure: Energy Exchange Points (EXPs). An EXP is a physical location — initially, a wired power connection point — where multiple EAS gateway nodes are co-located and can peer directly. At the EXP:

- Gateway nodes from multiple EAS networks are physically co-located
- EAS operators establish EBGP peering sessions with peer operators
- Energy traffic that crosses AS boundaries is handed off between gateway nodes
- The EXP maintains a public peering database listing which EAS operators are present and what energy delivery capacity they offer

At the EXP, energy traffic crosses the boundary between wireless mesh and wired power (or between two wireless meshes). The EXP is not a wireless-to-wireless connection — at current technology scale, inter-mesh energy transfer at significant power levels requires a wired connection at the exchange point. The wireless Energy Internet operates within each EAS; the EXP provides the inter-AS connection at the ELL level.

As energy routing technology matures and efficiency at longer ranges improves, direct wireless inter-mesh connections become viable. The EXP model accommodates this evolution: a wired EXP is an ELL implementation, just as a copper IXP and a fiber IXP are both valid data internet IXP implementations. The protocol does not change.

### 5.3 Energy Border Gateway Protocol (EBGP)

EBGP is the routing protocol that exchanges reachability information between EAS networks. It is a path-vector protocol — each EBGP update carries not just the destination and cost, but the complete sequence of EAS numbers that the path traverses. This allows receiving EAS operators to detect and avoid routing loops, apply routing policy based on which operators are in the path, and select paths based on operator relationships as well as technical metrics.

**EBGP route advertisement:**

```
EBGP UPDATE message:
  origin_EAS          : 24 bits   (advertising EAS number)
  destination_prefix  : 128 bits  (EIP address prefix being announced)
  AS_path             : variable  (sequence of EAS numbers traversed)
  P_available_mW      : 16 bits   (available delivery power at destination zone)
  efficiency_estimate : 8 bits    (estimated end-to-end delivery efficiency %)
  latency_ms          : 16 bits   (estimated burst delivery latency)
  safety_certified    : 1 bit     (whether path meets BSL requirements end-to-end)
  guardian_certified  : 1 bit     (whether path is Guardian Security certified)
  next_hop_gateway    : 128 bits  (EIP address of next-hop gateway node)
```

The inclusion of `safety_certified` and `guardian_certified` flags in EBGP updates is a significant departure from data internet BGP, where security and safety properties are not advertised at the routing layer. In the Energy Internet, safety certification is a routing property — a consumer device requesting CRITICAL priority delivery (a medical device, for example) should only receive energy over paths that are BSL-certified end-to-end. EBGP carries this information so that ENL routing decisions can enforce it automatically.

**EBGP route selection.** When an ENL router has multiple EBGP routes to the same destination, it selects the preferred route using an ordered set of criteria:

1. Highest local preference (operator-configured policy)
2. Shortest AS path (fewest inter-AS hops)
3. Highest P_available_mW (most delivery capacity)
4. Highest efficiency_estimate (least lossy path)
5. Lowest latency_ms (fastest delivery)
6. Tie-break: lowest next-hop gateway EIP address (deterministic)

Criteria 3 and 4 are energy-specific additions. In the data internet, BGP does not consider bandwidth or loss rate at the routing layer. In the Energy Internet, delivery capacity and efficiency are routing-layer concerns because they directly affect whether ETCP can satisfy the session's P_min requirement.

### 5.4 Energy Peering Agreements

EAS operators establish peering agreements governing the terms under which they exchange energy traffic. Three peering models exist, directly analogous to data internet peering models:

**Settlement-free peering.** Two EAS operators of comparable size exchange energy traffic at no charge, agreeing that the traffic flows are roughly balanced over time. Common between adjacent campus meshes or neighboring building systems.

**Transit peering.** A smaller EAS pays a larger EAS to route its traffic to destinations outside their shared zone. The larger EAS provides Energy Internet transit — access to the wider Energy Internet through its gateway connections.

**Energy credit settlement.** An accounting system for energy traffic that crosses AS boundaries. Energy credits — denominated in milliwatt-hours — are transferred between EAS operators based on measured delivery volumes. The EBF confirmation record provides the audit trail for settlement: every delivered burst is documented with source, destination, power, and timestamp.

---

## 6. Quality of Service for Power Delivery

### 6.1 Why QoS Matters in the Energy Internet

In the data internet, QoS differentiates time-sensitive traffic (voice, video) from best-effort traffic (file downloads, email). A voice call that arrives 500 ms late is useless. An email that arrives 500 ms late is indistinguishable from an email that arrives instantly. QoS marks time-sensitive traffic for preferential treatment and allows the network to meet latency requirements even during congestion.

In the Energy Internet, QoS differentiates power-critical loads from background loads. A cardiac monitor that loses power is a life-safety event. A background temperature sensor that misses a charging cycle recovers on the next cycle. Power QoS allocates available energy delivery capacity to the highest-priority loads first, ensuring that critical devices receive P_min even when the mesh is operating under capacity constraints.

Energy QoS has an additional dimension absent from data QoS: not just priority, but also delivery guarantee strength. A background sensor can tolerate high σ² (high variance in received power). A precision actuator cannot. QoS must specify both priority class and the σ² threshold the session must maintain.

### 6.2 QoS Priority Classes

The Energy Internet defines four QoS priority classes:

**CRITICAL.** Life-safety or mission-critical devices. Examples: implantable medical devices, emergency communications nodes, hospital monitoring equipment, critical infrastructure sensors. CRITICAL sessions receive absolute priority over all other traffic. Mesh capacity is reserved for CRITICAL sessions even at the cost of interrupting BACKGROUND and NORMAL sessions. BSL certification is mandatory for all CRITICAL paths. ETCP retransmission budget is unlimited. σ²_max is 5% (tightest delivery guarantee).

**HIGH.** Important operational devices. Examples: industrial process monitors, security systems, building management sensors. HIGH sessions receive priority over NORMAL and BACKGROUND but may be preempted by CRITICAL sessions. σ²_max is 10%.

**NORMAL.** Standard IoT devices. Examples: occupancy sensors, environmental monitors, asset trackers. NORMAL sessions receive best-effort service with σ²_max of 15%.

**BACKGROUND.** Non-time-sensitive devices. Examples: data loggers, passive sensors, occasional-reporting devices. BACKGROUND sessions use only surplus mesh capacity — capacity not needed by higher-priority sessions. σ²_max is 20%. No delivery latency guarantee.

### 6.3 Energy as a Service (EaaS) Model

Energy as a Service extends the QoS framework to a complete managed energy delivery model. Rather than requiring each consuming device to manage its own ETCP sessions and routing negotiations, EaaS provides a subscription-based energy delivery interface:

**Device enrolls in EaaS.** Device provides its power profile:
```
EaaS Profile:
  device_EIP          : device's energy address
  P_min_mW            : minimum continuous power requirement
  P_preferred_mW      : preferred operating power
  duty_cycle          : fraction of time at P_preferred (0.0–1.0)
  priority_class      : CRITICAL / HIGH / NORMAL / BACKGROUND
  sigma_sq_max        : maximum acceptable delivery variance
  max_burst_latency   : maximum acceptable time between bursts (ms)
  billing_account     : energy credit account
```

**EaaS negotiates delivery.** The EaaS layer establishes ETCP sessions with available source nodes, negotiates EBGP paths that satisfy the profile requirements, and manages routing failover transparently. The device receives power and does not manage its own energy routing.

**EaaS monitors and adapts.** If the enrolled device's power consumption pattern changes — it enters high-activity mode, requiring more power — EaaS detects the change through the EBF confirmation records and renegotiates the ETCP session parameters. This is the energy analog of adaptive bitrate streaming in video delivery: the delivery profile adapts to actual consumption in real time.

### 6.4 Emergency Priority Override

The Energy Internet must handle emergency situations in which normal priority scheduling is insufficient. An EMP event, a natural disaster, or a grid outage creates a condition where available energy routing capacity suddenly drops while CRITICAL demand (emergency services, medical devices, communication infrastructure) surges.

The Emergency Priority Override (EPO) mechanism allows designated emergency management authorities to issue a network-wide priority reset: all BACKGROUND and NORMAL sessions are suspended, all HIGH sessions are rate-limited, and all available mesh capacity is reserved for CRITICAL sessions. EPO is authenticated by the Guardian Security layer using emergency management authority credentials.

EPO is not a product feature — it is a protocol requirement for any Energy Internet deployment that serves life-safety applications. Its inclusion in the EIPS reflects the same reasoning that motivated priority routing in emergency communication networks: when lives depend on the network, the network must have a way to prioritize life-safety traffic over all other traffic.

---

## 7. Security at Scale: Guardian Security as Energy TLS

### 7.1 The Threat Model Expands at Internet Scale

Within a single Meridian mesh, the Guardian Security threat model [Meridian Architecture, 2026] covers six primary vectors: localization spoofing, routing table manipulation, beam hijacking, denial-of-power attacks, node impersonation, and timing attacks. These threats are addressed by per-node cryptographic authentication, signed routing updates, delivery confirmation verification, and TDMA timing enforcement.

At Energy Internet scale, the threat model expands in three dimensions:

**Scale.** An attacker targeting a single mesh node faces local defenses only. An attacker targeting the inter-mesh routing infrastructure faces the entire Energy Internet. EBGP route manipulation — analogous to BGP hijacking in the data internet, which has caused major internet outages — can redirect energy traffic across entire EAS networks. The Energy Internet requires BGP-equivalent security: route origin validation, AS path verification, and cryptographic signing of routing updates.

**Sophistication.** Single-mesh attacks require physical proximity to the target mesh. Internet-scale attacks can be launched remotely, from anywhere with access to the EBGP peering infrastructure. The authentication requirements for inter-mesh communication are therefore higher than for intra-mesh communication.

**Stakes.** In the data internet, a successful attack degrades data delivery. In the Energy Internet, a successful attack at CRITICAL priority can deny power to life-safety devices. The stakes of security failure are not measured in data loss but in physical harm. The security architecture must reflect this.

### 7.2 Guardian Security at Three Levels

Guardian Security (Guardian-E in the energy domain, domain: TrustShield.tech) operates at three levels in the Energy Internet:

**Level 1 — Intra-mesh security.** The Guardian Security implementation defined in [Meridian Architecture, 2026]. Per-node cryptographic authentication, signed EBF frames, TDMA timing enforcement, delivery confirmation verification. This level is unchanged from the single-mesh implementation.

**Level 2 — Inter-mesh security (Energy TLS).** Guardian Security extended to the inter-mesh interface. Every EBGP session between gateway nodes is authenticated using EAS-level public key infrastructure (PKI). EBGP updates are signed by the originating EAS gateway. Receiving gateways verify the signature before accepting and propagating route updates. Route origin validation confirms that an EAS advertising a destination actually controls the EIP address prefix it is advertising. This is Energy TLS — the analog of Transport Layer Security that protects data internet connections.

**Level 3 — Registry security.** Guardian Security at the EIRA level. EAS Number assignments, EIP address prefix delegations, and EDNS zone delegations are cryptographically signed by the EIRA and verifiable by any EIP node. A forged EAS Number or a fraudulently delegated address prefix is detectable by any properly configured ENL node.

### 7.3 Energy RPKI: Route Origin Validation

The data internet's Resource Public Key Infrastructure (RPKI) provides cryptographic attestation that an AS is authorized to originate routes for a given IP address prefix. Energy RPKI (ERPKI) provides the same function for EIP address prefixes: the EIRA maintains a signed database of which EAS is authorized to originate routes for which EIP prefix, and ENL routers validate EBGP route origins against this database before accepting them.

A route origin that does not validate against ERPKI is rejected. This prevents the energy equivalent of BGP hijacking — an adversary announcing routes for EIP prefixes they do not control in order to intercept or disrupt energy traffic to those addresses.

ERPKI is a preventive security measure. It does not depend on detecting attack behavior; it validates authorization before accepting routing information. This is a stronger security guarantee than anomaly-based detection for inter-mesh routing security.

### 7.4 Emergency Authority Credentials

The Emergency Priority Override mechanism (Section 6.4) requires authentication of emergency authority credentials. Guardian Security manages a separate credential class — Emergency Authority Credentials (EAC) — issued to designated emergency management bodies: hospitals, emergency services, military installations, critical infrastructure operators.

EAC holders can issue signed EPO commands that propagate through the Energy Internet via EBGP. ENL routers that receive a valid EPO command apply the emergency priority scheduling immediately. Invalid or unsigned EPO commands are rejected. The EAC credential system is administered by the EIRA and is audited by Guardian Security's certificate chain logging.

---

## 8. The Path from Meridian to Energy Internet

### 8.1 Development Phases

The Energy Internet is not built at once. It is built incrementally, each phase validating the assumptions of the next. The development path runs from the current state of the Meridian architecture through a series of validated phases to global deployment.

**Phase 0 — Current state.** The Meridian architecture is formally specified. Lume-X is validated at 73 Hz. No hardware experiment has been conducted. The Energy Internet Protocol Stack is defined in this paper. The path is clear; the walking has not begun.

**Phase 1 — Single-mesh validation (Years 1–2).** DWER Phase 1–3 experimental results validate point-to-point and mesh energy routing at room scale. A single Meridian EAS operates and is confirmed against the P_min/r/σ²/d determinism standard. The EPL, ELL, and intra-EAS ENL layers are validated in hardware. This is the foundation without which nothing else advances.

**Phase 2 — Multi-mesh federation (Years 2–4).** Two independently operated Meridian EAS networks establish an EBGP peering session. Energy traffic is successfully routed across the AS boundary. Inter-mesh Guardian Security authentication is validated. Energy credit settlement between the two operators is demonstrated. The EDNS resolves cross-AS addresses. This phase validates the inter-mesh federation architecture.

**Phase 3 — Building scale (Years 3–6).** A full building is covered by a Meridian Energy Internet deployment — multiple EAS zones, an in-building EXP, CRITICAL priority delivery to life-safety devices, and EaaS subscriptions for standard devices. QoS priority scheduling is validated under simulated load. The ETCP delivery guarantee is confirmed across full building-scale paths.

**Phase 4 — Campus scale (Years 5–10).** Multiple buildings interconnect through EXPs. EBGP peering between building-level EAS networks enables campus-wide energy routing. Higher-frequency operation (24 GHz, 60 GHz) improves beam precision and supports higher node density. Device-aware routing maps device identity to named energy paths. The Energy Internet is a functioning campus-scale infrastructure.

**Phase 5 — Energy Internet (Years 10+).** The EIPS is formally standardized through the IETF-equivalent process described in Section 9. Multiple independent operators deploy compatible Energy Internet infrastructure. EBGP peering between city-level EAS networks. Energy Internet exchange points in major urban centers. The Energy Internet is a functioning multi-operator global infrastructure for low-power device delivery.

### 8.2 The Efficiency Constraint at Scale

The single largest technical obstacle to Energy Internet scaling is efficiency. At room scale, end-to-end efficiency of 3–25% is acceptable — the transmit power is under 1W, the delivered power is measurable in milliwatts, and the energy cost is negligible. As the network scales and the delivered power requirements grow, efficiency becomes a binding constraint.

The efficiency requirement at building scale: a building with 10,000 IoT sensors each requiring 1 mW average power needs 10 W of delivered energy. At 10% end-to-end efficiency, this requires 100 W of transmission power — feasible. At 1% efficiency, it requires 1 kW — the equivalent of a moderate electrical heater, which is no longer negligible.

The efficiency improvement path runs through:
- Higher-frequency operation (shorter wavelength → smaller antenna aperture → tighter beams → less path loss at equivalent distances)
- Better rectenna design (current 50–70% RF-to-DC conversion can improve toward 85%+ with optimized circuit design)
- Denser node deployment (shorter hop distances → less per-hop path loss)
- Better beam shaping (tighter main lobes → less power in non-useful directions)
- Adaptive beam tracking (dynamic nulling of interference directions → less wasted power)

None of these improvements are speculative — they are active research areas with documented progress. The Energy Internet does not require a breakthrough; it requires the accumulation of incremental efficiency improvements across all stages of the energy path.

### 8.3 The Regulatory Pathway

Energy Internet deployment at building and campus scale requires regulatory approval that does not yet exist for this class of system. The current regulatory landscape treats wireless power systems as Point-to-Point Power Transmission under FCC Part 15 (below 1W) or as Industrial, Scientific, and Medical (ISM) equipment under FCC Part 18 (above 1W). Neither framework contemplates a multi-mesh, multi-operator, energy-routing network.

The regulatory pathway requires:

1. Phase 1–3 experimental safety data demonstrating BSL compliance at room scale
2. Submission of a regulatory framework proposal to the FCC, Ofcom, and ITU documenting the system architecture, safety mechanisms, and proposed operating parameters
3. Development of a type-approval process for Energy Internet nodes — standards that a node must meet to be certified for Energy Internet participation (analogous to FCC Part 15 type approval for wireless devices)
4. Development of an operator licensing framework for EAS operators — defining what certifications and safeguards are required to operate an EAS network
5. International harmonization of operating frequency bands and power limits for Energy Internet operation

This is not a short process. Regulatory development for new wireless technology frameworks typically takes five to ten years from initial proposal to formal rule. The regulatory pathway must begin concurrently with Phase 1 experimental validation — not after.

---

## 9. Governance and Standardization

### 9.1 Why Governance Matters

The data internet's most important governance decision was to make IP an open standard — freely implementable by anyone, with no royalties, governed by the IETF through a consensus-based process. This decision is what allowed the internet to scale globally across every political and economic boundary. If IP had been a proprietary standard owned by a single vendor, the internet as we know it would not exist.

The Energy Internet requires the same governance decision. A proprietary Energy Internet standard — controlled by a single company, with licensing requirements for implementation — would produce a fragmented landscape of incompatible energy routing systems that cannot peer with each other. The value of a network is proportional to the square of the number of participants (Metcalfe's Law). A proprietary Energy Internet with 1,000 nodes is worth far less than an open Energy Internet with a billion nodes.

I propose that the Energy Internet Protocol Stack be submitted to an open standards process — the IETF or an equivalent body — for development and maintenance as an open standard. DarkWave Studios LLC commits to making the foundational EIPS specification royalty-free. The provisional patent portfolio covering the Meridian architecture will be licensed under FRAND (Fair, Reasonable, and Non-Discriminatory) terms for implementations that comply with the open standard.

### 9.2 The Energy Internet Registry Authority (EIRA)

The Energy Internet requires a registry authority analogous to IANA (Internet Assigned Numbers Authority) and ICANN (Internet Corporation for Assigned Names and Numbers):

**EIRA functions:**
- Assign EAS Numbers to qualifying Energy Internet operators
- Delegate EIP address prefixes to EAS operators
- Administer the root EDNS zone (`.energy`)
- Maintain the ERPKI root certificate for Energy Internet route origin validation
- Issue Emergency Authority Credentials to qualifying emergency management bodies
- Publish the authoritative EIPS standard and manage its versioning

**EIRA governance model.** The EIRA should be a multi-stakeholder body, not a government agency or a single company. Stakeholders include: EAS operators, device manufacturers, regulatory agencies, safety certification bodies, emergency management agencies, and civil society representatives. This is the governance model that has allowed ICANN and IANA to operate effectively across national boundaries.

### 9.3 The RFC Process for Energy Internet Standards

The Internet Engineering Task Force's RFC (Request for Comments) process has proven remarkably effective at developing and maintaining internet standards. Technical proposals are published as drafts, reviewed publicly, revised through community comment, and published as RFCs when consensus is reached. No individual or organization can unilaterally adopt a standard — consensus is required.

I propose an Energy RFC (ERFC) process for Energy Internet standards development:

**ERFC-0001:** Energy Internet Protocol Stack — the foundational document (this paper adapted for standards format)
**ERFC-0002:** Energy Internet Protocol (EIP) — addressing specification
**ERFC-0003:** Energy Transmission Control Protocol (ETCP) — delivery guarantee specification
**ERFC-0004:** Energy Border Gateway Protocol (EBGP) — inter-mesh routing specification
**ERFC-0005:** Energy Domain Name System (EDNS) — human-readable addressing
**ERFC-0006:** Energy Resource Public Key Infrastructure (ERPKI) — route origin validation
**ERFC-0007:** Energy QoS — priority class definitions and scheduling requirements
**ERFC-0008:** Guardian Security for the Energy Internet — security specification

These eight documents constitute the minimum viable standards package for an interoperable Energy Internet. Additional ERFCs covering operational practices, management protocols, and application interfaces would follow.

---

## 10. Related Work

### 10.1 Wireless Power Transfer Systems

The commercial wireless power landscape — WiTricity, Ossia Cota, Energous WattUp — was reviewed in [Meridian Architecture, 2026]. None of these systems implement routing, addressing, inter-system federation, or a formal delivery guarantee framework. They are transmission systems, not routing systems. The Energy Internet is not in competition with these systems as products — it is a fundamentally different architectural approach that subsumes the transmission capabilities of these systems under a routing framework.

The academic wireless power transmission literature similarly focuses on transmission efficiency rather than routing infrastructure. Powercast's RF energy harvesting work [35] has demonstrated multi-node energy delivery networks at low power levels, but without addressing, routing protocols, or delivery guarantees. These systems are closest to the EPL of the Energy Internet — they implement the physical transmission medium — but they do not provide the protocol stack above it.

### 10.2 Software-Defined Networking

The SDN literature [31, 32] is directly relevant to the Energy Internet control plane. SDN separates the control plane (routing decisions) from the data plane (packet forwarding) and centralizes routing intelligence in a software controller that programs the forwarding rules of distributed data plane devices. This architecture dramatically simplifies network management and enables dynamic routing policy without reconfiguring individual devices.

The Energy Internet's Lume-X control layer implements the SDN pattern: Lume-X is the control plane (managing routing decisions across all four Meridian layers), while the physical node firmware is the data plane (executing forwarding decisions without independent routing logic). The separation is explicit in the Meridian architecture: MTL executes BeamCommands but does not determine which node to beam; that decision belongs to MMF (the energy routing controller).

Future Energy Internet deployments at building and campus scale may benefit from centralized SDN-style energy controllers that manage routing across the entire EAS rather than distributing routing intelligence to every node. The EIPS is designed to accommodate both distributed and centralized control plane models.

### 10.3 Internet of Things Power Management

The IoT power management literature has extensively studied strategies for extending battery life, harvesting ambient energy, and duty-cycling sensor nodes to minimize power consumption. Energy harvesting for wireless sensor networks — particularly the work of Kansal et al. [33] on energy-neutral operation and Sudevalayam and Kulkarni [34] on energy harvesting sensor nodes — provides the baseline performance characterization that the Energy Internet must exceed.

The critical distinction from this body of work is the direction of the solution. IoT power management minimizes the device's energy requirements to match available supply. The Energy Internet increases the available supply to match device requirements. Both approaches are valid; they address different operating regimes. The Energy Internet is applicable when ambient harvesting alone is insufficient and a more active energy delivery mechanism is required.

### 10.4 The Power Line Communication Analogy

Power Line Communication (PLC) — using the existing electrical grid wiring as a communication medium — inverts the Energy Internet concept: it uses an energy medium to carry data. The Energy Internet uses a data networking protocol to carry energy. The inversion is instructive: PLC demonstrated that the data internet protocol stack (IP, TCP, application protocols) could be implemented over an energy medium with appropriate physical layer adaptation. The Energy Internet demonstrates the converse: energy delivery can be implemented using a data networking protocol stack with appropriate adaptation for the physics of energy transmission.

The analogy suggests that hybrid energy-data meshes — networks that simultaneously route power and information over the same physical nodes using a unified protocol stack — may be feasible and valuable. The DRMA mesh already carries both energy (in burst-mode RF transmissions) and data (in control-plane EBF communications). A unified mesh that formally integrates both functions is a natural extension beyond the scope of this paper.

### 10.5 The Lume Ecosystem

The Energy Internet is the long-horizon destination of the Lume ecosystem's trajectory. Lume [15] provided the deterministic programming language. DAIGS [17] provided the multi-agent coordination framework. Lume-X [19] provided the high-frequency deterministic control runtime. Meridian [Meridian Architecture, 2026] provided the first physical energy routing architecture. The Energy Internet provides the protocol standard that allows Meridian to scale beyond a single mesh to a global infrastructure.

The ecosystem is coherent: each component was designed with the next in mind, and the chain of components provides a complete path from programming language to global energy network. No other ecosystem has this property.

---

## 11. Limitations and Honest Boundaries

I state the following limitations without qualification.

**The Energy Internet does not exist.** This is a theoretical framework paper. No inter-mesh EBGP peering session has been established. No EDNS resolver has been deployed. No EaaS subscription has been activated. The Phase 1 single-mesh experimental data that is the foundation of this entire framework does not yet exist.

**Efficiency at scale is an open problem.** The end-to-end efficiency arguments in Section 8.2 are directionally correct but not experimentally validated. The Energy Internet is only economically viable if efficiency improves substantially from current estimates. The improvement path is identified and plausible; it is not guaranteed.

**The regulatory landscape is undefined.** No regulatory framework for multi-operator wireless energy routing networks exists in any jurisdiction. The regulatory pathway described in Section 8.3 is a proposal, not a plan with committed timelines. Regulatory development is inherently unpredictable and may take longer or shorter than estimated.

**The governance proposal is aspirational.** The EIRA does not exist. The ERFC process does not exist. Whether the wireless power industry and regulatory agencies will adopt an open standard for energy routing — rather than allowing a proprietary standard to win through market dominance — is an open question. The data internet took twenty years from ARPANET to the World Wide Web. The Energy Internet's governance development timeline is uncertain.

**Energy routing latency is not comparable to data routing.** A data packet traverses a five-hop internet path in tens of milliseconds. An energy burst traversing a five-hop Energy Internet path takes approximately 300–500 ms at current TDMA burst-mode timing. The Energy Internet is not a real-time energy delivery system — it is a scheduled, burst-mode delivery system. Applications that require continuous, uninterrupted power at high power levels are not served by the Energy Internet at current development scale. Battery systems, wired connections, and conventional grid power remain appropriate for those applications.

**The EIP address space may need revision.** The 128-bit EIP address specification in Section 4.1 is a first draft. As the ERFC process develops and operational experience accumulates, addressing requirements may be revised. The address space should be treated as provisional until standardized through the ERFC process.

**This paper does not resolve the economics.** Energy credit settlement, ESP business models, EXP interconnection economics, and the pricing of EaaS subscriptions are not addressed in this paper. A viable Energy Internet requires not just technical standards but a functional economic model. That model is outside the scope of this technical specification paper.

---

## 12. Conclusion

The internet began as a protocol. Four nodes in 1969. A correct specification for how independently administered networks exchange packets. The infrastructure followed. Fifty years later, eight billion devices participate in a global network that was not planned, not centrally administered, and not owned by any single entity. The protocol is the internet.

I have proposed that the same transformation is possible for energy delivery. The Energy Internet Protocol Stack — five layers from physical transmission to application interface, with addressing, routing, delivery guarantees, security, and inter-mesh federation — is the specification from which a global wireless energy routing infrastructure can be built. The specification is complete. The implementation has not yet begun at scale.

The foundational implementation target exists. Meridian [Meridian Architecture, 2026] is a formally specified, four-layer deterministic wireless energy routing architecture that implements the EPL, ELL, and intra-EAS ENL of the Energy Internet Protocol Stack. Lume-X, validated at 73 Hz, is the control plane that governs the mesh. Guardian Security is the security layer that authenticates nodes and protects routing. DAEH is the ambient harvesting layer that reduces infrastructure dependency. The room-scale architecture is complete and awaits Phase 1 experimental validation.

The remaining distance from Phase 1 validation to a functioning Energy Internet is measured in years, not decades — if the protocol is defined now. The data internet's history demonstrates that a correct protocol, published and available, attracts implementation faster than any planned deployment schedule. The ARPANET did not wait for all nodes to be ready before publishing IP. It published the protocol and let the network grow.

The Energy Internet Protocol Stack is published here. The network will grow.

I make one final claim, stated precisely: if Phase 1 experimental data confirms the Meridian architecture's determinism standard, and if the EIPS is adopted as an open standard through a consensus governance process, then the Energy Internet is not a speculative vision — it is an engineering project with a defined specification, a validated foundational layer, and a clear path through a finite number of development phases. It is, in the language of engineering, achievable.

The protocol is written. The work begins.

---

## Appendix A — Energy Internet Protocol Stack: Formal Layer Definitions

| Layer | Name | Abbreviation | Primary Protocol | Analogous Data Internet Layer |
|---|---|---|---|---|
| 5 | Energy Application Layer | EAL | EaaS | Application Layer (HTTP, SMTP) |
| 4 | Energy Transport Layer | ETL | ETCP | Transport Layer (TCP) |
| 3 | Energy Network Layer | ENL | EIP + EBGP | Network Layer (IP + BGP) |
| 2 | Energy Link Layer | ELL | EBF + TDMA | Link Layer (Ethernet) |
| 1 | Energy Physical Layer | EPL | DWER/MTL | Physical Layer (fiber, radio) |

**EPL Service Interface (EPL → ELL):**
- `transmit_burst(dst_node, power_mW, duration_ms, timing_window) → delivery_confirm`
- `locate_node(node_id) → position_vector, accuracy_cm, timestamp`
- `get_safety_status() → gate_conditions[5], bsl_status`

**ELL Service Interface (ELL → ENL):**
- `send_ebf(ebf_header, path_id) → ebf_confirmation`
- `get_link_quality(next_hop_id) → loss_pct, sigma_sq, latency_ms`
- `get_tdma_slot(node_id) → t_start, t_end`

**ENL Service Interface (ENL → ETL):**
- `route_burst(src_eip, dst_eip, P_mW, priority) → path_id, estimated_loss, latency`
- `resolve_edns(name) → eip_address`
- `get_as_path(dst_eip) → as_sequence, gateway_eip`

**ETL Service Interface (ETL → EAL):**
- `open_session(session_spec) → session_id, confirmed_P_min, confirmed_sigma_sq`
- `get_session_stats(session_id) → bursts_delivered, avg_P_received, current_sigma_sq`
- `close_session(session_id) → final_accounting`

---

## Appendix B — Energy Address Specification

```
EIP Address Structure (128 bits):

Bits 127–112: Global Registry ID (16 bits)
  - Assigned by EIRA to major geographic/governance regions
  - 0x0000: Reserved
  - 0x0001: Americas
  - 0x0002: Europe / Africa
  - 0x0003: Asia / Pacific
  - 0x0004–0xFFFE: Future allocation
  - 0xFFFF: Multicast / Broadcast

Bits 111–88: EAS Number (24 bits)
  - Assigned by EIRA to individual Energy Autonomous System operators
  - 0x000000: Reserved (loopback / test)
  - 0x000001–0xFFFFFE: Operator-assigned EAS Numbers
  - 0xFFFFFF: Reserved

Bits 87–72: Zone ID (16 bits)
  - Assigned by EAS operator to logical zones within the EAS
  - 0x0000: Default zone (single-zone EAS)

Bits 71–64: Node Type (8 bits)
  - 0x00: Reserved
  - 0x01: Source node (wired power input)
  - 0x02: Relay node (wireless relay, no wired input)
  - 0x03: Destination node (consuming device)
  - 0x04: Harvesting relay node (DAEH + relay capability)
  - 0x05: Gateway node (inter-EAS border router)
  - 0x06–0xFE: Reserved for future node types
  - 0xFF: Any / wildcard (routing use only)

Bits 63–24: Node Serial (40 bits)
  - Assigned by node manufacturer
  - Unique within manufacturer namespace
  - Combined with EAS Number provides global uniqueness

Bits 23–0: Checksum (24 bits)
  - CRC-24 of bits 127–24
  - Detects address corruption in transit
```

**EIP Address Notation:**
`GRRR:AAAA:BBBB:TTSS:SSSS:SSCC:CCCC` (hex groups, similar to IPv6)

Example: `0001:0000:0042:0005:0200:0000:0001:XXXX`
(Americas, EAS 42, Zone 5, Node Type 0x02=relay, Serial 1, checksum XXXX)

---

## Appendix C — Energy Border Gateway Protocol (EBGP) Overview

EBGP operates between gateway nodes at EAS boundaries. It is a path-vector protocol: each route advertisement carries the complete sequence of EAS numbers traversed.

**Session establishment:**
```
1. Gateway node A initiates TCP-equivalent control session with Gateway node B
2. Both gateways authenticate using EAS-level PKI (Guardian Security Level 2)
3. ERPKI validation confirms each gateway is authorized to represent its EAS
4. EBGP OPEN message exchanged: EAS Number, EIPS version, supported capabilities
5. EBGP KEEPALIVE messages maintain session (interval: 30 seconds default)
6. EBGP UPDATE messages exchange route advertisements
```

**Route advertisement format (key fields):**
```
EBGP UPDATE:
  ORIGIN         : IGP / EGP / INCOMPLETE (how route was learned)
  AS_PATH        : [EAS_A, EAS_B, EAS_C] (path traversed)
  NEXT_HOP       : EIP address of advertising gateway
  P_AVAILABLE    : available delivery capacity (mW)
  EFFICIENCY     : estimated end-to-end efficiency (%)
  SAFETY_FLAGS   : BSL_CERTIFIED, GUARDIAN_CERTIFIED, CRITICAL_CAPABLE
  NLRI           : Network Layer Reachability Info (EIP prefixes being advertised)
```

**Route selection (in priority order):**
1. ERPKI validation passes (reject invalid origins)
2. Not in AS_PATH loop (reject routes that would create routing loops)
3. Highest LOCAL_PREF (operator policy)
4. Shortest AS_PATH
5. Highest P_AVAILABLE
6. Highest EFFICIENCY
7. Lowest NEXT_HOP EIP address (deterministic tiebreak)

---

## Appendix D — Standardization Roadmap

| ERFC | Title | Status | Dependencies |
|---|---|---|---|
| ERFC-0001 | Energy Internet Protocol Stack | Draft (this paper) | None |
| ERFC-0002 | Energy Internet Protocol (EIP) | Not started | ERFC-0001 |
| ERFC-0003 | Energy Transmission Control Protocol (ETCP) | Not started | ERFC-0001, ERFC-0002 |
| ERFC-0004 | Energy Border Gateway Protocol (EBGP) | Not started | ERFC-0001, ERFC-0002 |
| ERFC-0005 | Energy Domain Name System (EDNS) | Not started | ERFC-0002 |
| ERFC-0006 | Energy Resource PKI (ERPKI) | Not started | ERFC-0002, ERFC-0004 |
| ERFC-0007 | Energy QoS and Priority Classes | Not started | ERFC-0003 |
| ERFC-0008 | Guardian Security for the Energy Internet | Not started | ERFC-0001, ERFC-0006 |
| ERFC-0009 | EaaS — Energy as a Service | Not started | ERFC-0003, ERFC-0007 |
| ERFC-0010 | Emergency Priority Override (EPO) | Not started | ERFC-0007, ERFC-0008 |

**Governance milestones:**
- M1: EIRA founding body established (Year 1, concurrent with Phase 1 experiments)
- M2: ERFC-0001 through ERFC-0004 published as draft standards (Year 2)
- M3: First inter-EAS EBGP peering session validated (Year 3, concurrent with Phase 2)
- M4: ERFC-0001 through ERFC-0008 ratified as formal standards (Year 4)
- M5: First EXP operational (Year 5, concurrent with Phase 3)
- M6: First EIRA EAS Number assignments (Year 2, for Phase 2 operators)

---

## References

**Internet Architecture:**

[27] Cerf, V., & Kahn, R. (1974). "A Protocol for Packet Network Intercommunication." *IEEE Transactions on Communications, 22*(5), 637–648.

[28] Leiner, B.M., et al. (2009). "A Brief History of the Internet." *ACM SIGCOMM Computer Communication Review, 39*(5), 22–31.

[29] ISO/IEC 7498-1. (1994). *Information Technology — Open Systems Interconnection — Basic Reference Model: The Basic Model.*

[30] Rekhter, Y., Li, T., & Hares, S. (2006). *A Border Gateway Protocol 4 (BGP-4).* RFC 4271. IETF.

[31] McKeown, N., et al. (2008). "OpenFlow: Enabling Innovation in Campus Networks." *ACM SIGCOMM Computer Communication Review, 38*(2), 69–74.

[32] Kreutz, D., et al. (2015). "Software-Defined Networking: A Comprehensive Survey." *Proceedings of the IEEE, 103*(1), 14–76.

**Wireless Power and Energy Harvesting:**

[33] Kansal, A., Hsu, J., Zahedi, S., & Srivastava, M.B. (2007). "Power Management in Energy Harvesting Sensor Networks." *ACM Transactions on Embedded Computing Systems, 6*(4).

[34] Sudevalayam, S., & Kulkarni, P. (2011). "Energy Harvesting Sensor Nodes: Survey and Implications." *IEEE Communications Surveys and Tutorials, 13*(3), 443–461.

[35] Sample, A.P., Yeager, D.J., Powledge, P.S., & Smith, J.R. (2011). "Design of an RFID-Based Battery-Free Programmable Sensing Platform." *IEEE Transactions on Instrumentation and Measurement, 57*(11), 2608–2615.

[36] Brown, W.C. (1984). "The History of Power Transmission by Radio Waves." *IEEE Transactions on Microwave Theory and Techniques, 32*(9), 1230–1242.

[37] Zhang, Z., Pang, H., Georgiadis, A., & Cecati, C. (2019). "Wireless Power Transfer — An Overview." *IEEE Transactions on Industrial Electronics, 66*(2), 1044–1058.

**Network QoS and Management:**

[38] Blake, S., et al. (1998). *An Architecture for Differentiated Services.* RFC 2475. IETF.

[39] Braden, R., Clark, D., & Shenker, S. (1994). *Integrated Services in the Internet Architecture: An Overview.* RFC 1633. IETF.

[40] Rosen, E., Viswanathan, A., & Callon, R. (2001). *Multiprotocol Label Switching Architecture.* RFC 3031. IETF.

**Internet Governance:**

[41] Mueller, M. (2002). *Ruling the Root: Internet Governance and the Taming of Cyberspace.* MIT Press.

[42] DeNardis, L. (2014). *The Global War for Internet Governance.* Yale University Press.

**Security:**

[43] Lepinski, M., & Kent, S. (2012). *An Infrastructure to Support Secure Internet Routing.* RFC 6480. IETF. [RPKI specification]

[44] Dierks, T., & Rescorla, E. (2008). *The Transport Layer Security (TLS) Protocol Version 1.2.* RFC 5246. IETF.

**Lume Ecosystem:**

[45] Andrews, J. (2026). *Lume Language Specification.* DarkWave Studios LLC. DOI: 10.5281/zenodo.19382282

[46] Andrews, J. (2026). *Trust Layer Ecosystem.* DarkWave Studios LLC. DOI: 10.5281/zenodo.19560674

[47] Andrews, J. (2026). *DAIGS Framework.* DarkWave Studios LLC. DOI: 10.5281/zenodo.19491784

[48] Andrews, J. (2026). *Lume-V Verification Suite.* DarkWave Studios LLC. DOI: 10.5281/zenodo.19645097

[49] Andrews, J. (2026). *Lume-X Multi-Agent Cognition.* DarkWave Studios LLC. DOI: 10.5281/zenodo.19443968

[50] Andrews, J. (2026). *Deterministic Dissolution.* DarkWave Studios LLC. DOI: 10.5281/zenodo.15065493

[51] Andrews, J. (2026). *Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture.* DarkWave Studios LLC. [Companion paper]

[52] Andrews, J. (2026). *Meridian as Synthetic Organism.* DarkWave Studios LLC. [Companion paper]

---

*END OF PAPER*

*The Energy Internet: A Universal Protocol Stack for Deterministic Wireless Power Delivery*
*Version 1.0 — DarkWave Studios LLC*
*Author: Jason Andrews | ORCID: 0009-0007-5214-649X | team@dwsc.io*
*lume-lang.org | github.com/cryptocreeper94-sudo*
*Patent Pending — Provisional Application: Systems and Methods for Deterministic Multi-Layer Wireless Energy Routing Using Ambient Harvesting, Mesh Coordination, and Directional Transmission*
*Lume-X: Provisionally patented deterministic control runtime.*
*© 2026 DarkWave Studios LLC. All rights reserved.*
*This preprint has not undergone peer review.*
*Do not submit to any publication venue before Phase 1 experimental data exists.*
