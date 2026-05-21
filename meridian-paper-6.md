# The Unified Energy-Data Mesh: Co-Routing Power and Information Through a Single Deterministic Fabric

**Subtitle:** When the Wire That Carries the Packet Also Carries the Watt

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
- Andrews, J. (2026). Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture. [Cited as "Meridian Architecture, 2026"]
- Andrews, J. (2026). Meridian as Synthetic Organism. [Cited as "Meridian Organism, 2026"]
- Andrews, J. (2026). The Energy Internet. [Cited as "Energy Internet, 2026"]
- Andrews, J. (2026). Deterministic Infrastructure: A General Theory. [Cited as "DI Theory, 2026"]
- Andrews, J. (2026). Guardian Security. [Cited as "Guardian Security, 2026"]

**Related Work:**
- Lume Language Specification — DOI: 10.5281/zenodo.19382282
- Trust Layer Ledger (TLL) Ecosystem — DOI: 10.5281/zenodo.19560674
- DAIGS Framework — DOI: 10.5281/zenodo.19491784
- Lume-V Verification Suite — DOI: 10.5281/zenodo.19645097
- Lume-X Multi-Agent Cognition — DOI: 10.5281/zenodo.19443968
- Deterministic Dissolution — DOI: 10.5281/zenodo.15065493

> *This preprint has not undergone peer review.*

*© 2026 DarkWave Studios LLC. All rights reserved. Patent pending.*

---

## Abstract

The Meridian mesh already carries two kinds of traffic. The first kind is the energy it was designed for: RF bursts routed hop-by-hop from source nodes to destination devices, governed by DRMA routing tables and MFE burst scheduling. The second kind is the control-plane traffic it requires to operate: LINK_STATE_UPDATE messages, NODE_ANNOUNCE broadcasts, EBF delivery confirmations, Guardian Security authentication exchanges, and Lume-X cross-layer monitoring packets. These control-plane messages are data — structured, addressed, routed information — flowing across the same physical nodes as the energy they govern.

The Meridian mesh is already a unified energy-data fabric. It just has not been formally recognized as one.

This paper formalizes the co-routing architecture of the Meridian mesh — the simultaneous routing of energy and data through the same physical node infrastructure under a shared addressing and governance framework. I define the Unified Energy-Data Mesh (UEDM) as a formal architecture in which the same addressed nodes, the same topology-aware routing fabric, and the same Trust Layer Ledger (TLL) identity substrate serve both energy delivery and data communication simultaneously. I show that the UEDM is not a new design — it is a formal recognition and extension of what Meridian already does.

I define the co-routing arbitration rules that govern how energy bursts and data packets share TDMA capacity without conflict. I define the UEDM addressing scheme that unifies energy delivery addresses (EIP) and data communication addresses under the same 128-bit namespace. I show that the UEDM collapses two infrastructure problems — where does this device get its power, and how does this device communicate — into one, simplifying deployment, reducing infrastructure cost, and enabling a class of self-sustaining autonomous devices that power themselves and communicate through the same wireless fabric.

I propose the Unified Energy-Data Mesh as the convergence point of the Energy Internet [Energy Internet, 2026] and the Trust Layer Ledger (TLL) communication infrastructure [16]: a single fabric that routes both resources and information under a unified governance framework, providing the complete infrastructure substrate for autonomous physical systems operating in the Deterministic Infrastructure paradigm [DI Theory, 2026].

**Keywords:** unified energy-data mesh, co-routing, wireless power and communication, SWIPT, Meridian, deterministic infrastructure, TDMA co-scheduling, ambient IoT, self-sustaining networks, simultaneous wireless information and power transfer

---

## Table of Contents

1. Introduction
2. Background: Convergent Infrastructure
3. The Meridian Mesh as Existing Dual-Traffic Fabric
4. The Unified Energy-Data Mesh Architecture
5. Co-Routing Arbitration
6. UEDM Addressing
7. The Self-Sustaining Device Model
8. UEDM and the Energy Internet
9. The UEDM Control Plane
10. Applications and Deployment Scenarios
11. Related Work
12. Limitations and Honest Boundaries
13. Conclusion
- Appendix A — UEDM Protocol Stack
- Appendix B — Co-Routing Arbitration Rules
- Appendix C — UEDM Addressing Specification
- Appendix D — Self-Sustaining Device Profile
- References

---

## 1. Introduction

### 1.1 Two Problems That Have Always Been One

Every autonomous device in the physical world needs two things: power and communication. Power to operate its sensors, processors, actuators, and radio. Communication to report its sensor readings, receive instructions, and coordinate with other devices.

The history of wireless technology treats these as separate problems. The wireless communication industry spent sixty years building Wi-Fi, Bluetooth, Zigbee, LoRa, 5G, and a dozen other standards for wireless data transfer. The wireless power industry spent the same sixty years building inductive chargers, RF energy harvesters, and directed beam systems. The two industries produced incompatible infrastructures: a building with Wi-Fi coverage has wireless communication everywhere, but devices still need batteries or wires for power. A building with wireless charging capability has power delivery at specific locations, but that infrastructure carries no information.

The separation is not fundamental. It is historical. Power and communication are both electromagnetic phenomena. An RF signal carries energy (which can be harvested) and information (which can be demodulated) simultaneously — this is the basis of SWIPT (Simultaneous Wireless Information and Power Transfer), an active research area since the 2000s [58, 59]. The question has never been whether power and communication can coexist on the same RF channel. They already do. The question is whether they can be co-routed — whether the same deterministic routing infrastructure can govern both simultaneously.

This paper answers that question.

### 1.2 What Meridian Already Does

The Meridian mesh, as specified in [Meridian Architecture, 2026], routes energy through a distributed network of addressed nodes. To do this, it necessarily moves a substantial volume of data through those same nodes: routing table updates, delivery confirmations, localization signals, security authentication messages, and control-loop telemetry. This data is currently classified as "control-plane traffic" — necessary overhead that enables energy routing.

The argument of this paper begins with a reframing: the control-plane traffic in the Meridian mesh is not overhead. It is the first payload of the data communication channel that exists latent in the Meridian infrastructure. The mesh that routes energy also already routes data. It does so on a limited basis (control messages only) using a limited channel (the control-plane bandwidth reserved in each TDMA slot). Extending this to general data communication requires:

1. Defining the co-routing arbitration rules that govern how energy and data share TDMA capacity
2. Extending the addressing scheme to cover both energy delivery endpoints and data communication endpoints under one namespace
3. Specifying the QoS rules that govern priority relationships between energy delivery and data communication
4. Defining the security architecture for data communication (which already exists through Guardian Security [Guardian Security, 2026])

None of these extensions require new hardware. They require new protocol definitions on top of existing hardware. The Unified Energy-Data Mesh is a protocol and software extension of the existing Meridian architecture, not a new physical system.

### 1.3 The Self-Sustaining Device

The most significant practical implication of the UEDM is the self-sustaining device: an autonomous sensor, actuator, or monitor that receives both its power and its communication through the same UEDM mesh, requiring no battery, no separate communication radio, and no wired connection to either a power source or a data network.

Self-sustaining devices change the economics of autonomous device deployment. The dominant cost of large-scale IoT deployments is not the sensors — it is the power and communication infrastructure that keeps them running. Battery replacement at scale is expensive in labor and logistics. Wired power at scale is expensive in installation and inflexible in deployment. Separate wireless power and wireless communication systems are expensive to maintain independently and multiply the infrastructure required for a single deployment.

A self-sustaining device powered and connected through the same UEDM mesh eliminates all three cost categories simultaneously. The UEDM mesh is the infrastructure — a single installation provides both power and connectivity to every device in its coverage area.

### 1.4 Contributions

I make four contributions:

1. I formally recognize the Meridian mesh as an existing dual-traffic fabric and define the Unified Energy-Data Mesh (UEDM) as its formal extension to general data communication.

2. I define the co-routing arbitration rules — the protocol specification for how energy bursts and data packets share TDMA capacity under a unified scheduling framework.

3. I define the UEDM addressing scheme — a unified 128-bit namespace in which energy delivery addresses and data communication addresses are the same address, eliminating the need for separate network identity management for power and communication.

4. I characterize the self-sustaining device as a deployment model and define its operational profile, power-communication budget, and interaction with the UEDM mesh.

### 1.5 Paper Organization

Section 2 examines the history of converging communication and power infrastructure. Section 3 formally characterizes the Meridian mesh as an existing dual-traffic fabric. Section 4 defines the UEDM architecture. Section 5 specifies co-routing arbitration. Section 6 defines UEDM addressing. Section 7 characterizes the self-sustaining device model. Section 8 positions the UEDM within the Energy Internet framework. Section 9 describes the UEDM control plane. Section 10 discusses applications. Section 11 situates this in related literature. Section 12 states limitations. Section 13 concludes.

---

## 2. Background: Convergent Infrastructure

### 2.1 Power Line Communication: The Inversion Precedent

Power Line Communication (PLC) [53] uses existing electrical power wiring as a communication medium: high-frequency data signals are superimposed on the 50/60 Hz power signal and demodulated at the receiver. PLC demonstrated that a medium designed to carry one resource — electrical power — can simultaneously carry another — digital data. The physical medium, the copper wire, is agnostic to the signal type. Protocol design determines what it carries.

PLC inverts the UEDM concept: it uses a power medium to carry data. The UEDM uses a data networking protocol to carry power. The inversion is symmetrical and instructive — both demonstrate that power and data are not inherently separate resources requiring separate infrastructure.

PLC achieved significant deployment in home automation (HomePlug standard), smart grid metering (PRIME, G3-PLC), and broadband internet access (G.hn). Its limitations are the limitations of the power line medium: noise from electrical equipment, signal attenuation in long runs, and signal coupling across transformers. The UEDM does not share these limitations because it operates over RF rather than conducted power lines.

### 2.2 SWIPT: Simultaneous Wireless Information and Power Transfer

SWIPT research [58, 59] has demonstrated, theoretically and experimentally, that a single RF signal can simultaneously transfer energy to a harvesting receiver and information to a communication receiver. The fundamental tradeoff is between harvested power and communication data rate: energy harvesting requires a strong received signal, which limits modulation order; high data rate requires high modulation order, which reduces the fraction of signal power extractable for harvesting.

SWIPT systems manage this tradeoff through receiver design (power splitting: fraction of received power goes to rectenna, fraction to demodulator) and transmitter design (time switching: transmitter alternates between high-power energy bursts and modulated data signals). The fundamental insight — one RF signal, two resource types — is the physical basis for the UEDM.

The UEDM extends SWIPT in two critical dimensions. SWIPT research has focused on single-link point-to-point systems, or at most small-cell broadcast scenarios. The UEDM is a multi-hop, topology-aware, deterministically routed network in which both energy and data are addressed, routed, and delivered with guarantees. SWIPT provides the physical foundation; the UEDM provides the network architecture.

### 2.3 Integrated Access and Backhaul

The 5G integrated access and backhaul (IAB) architecture [57] uses the same wireless nodes to simultaneously provide user-facing access (communication to devices) and network backhaul (communication between base stations). A single node participates in both functions through time-division multiplexing — some TDMA slots serve as access, others as backhaul.

The UEDM applies the same architectural principle in the energy domain: the same node participates in both energy delivery (energy-focused TDMA slots) and data communication (data-focused TDMA slots) under a unified scheduling framework. The IAB precedent demonstrates that time-division sharing of a single wireless node's capacity across multiple traffic types is technically mature and deployable at scale.

### 2.4 The Convergence Attractor

These three prior technologies — PLC, SWIPT, and IAB — each demonstrate that power and communication infrastructure converge when physical medium constraints are examined without historical separation. PLC converged power line and communication in the wired domain. SWIPT is converging them at the physical layer in the wireless domain. IAB is converging access and backhaul at the network layer.

The UEDM is the convergence at the routing layer — the formal definition of a unified protocol stack in which both energy and data are addressed, routed, quality-of-service managed, and security-governed through a single deterministic framework. It is the natural terminus of the convergence trajectory.

---

## 3. The Meridian Mesh as Existing Dual-Traffic Fabric

### 3.1 Cataloguing the Data Already in the Mesh

To demonstrate that the Meridian mesh is already a dual-traffic fabric, I enumerate the data traffic that currently flows through it in normal operation:

**Topology management traffic:**
- `NODE_ANNOUNCE` — broadcast by each node at join and at configurable intervals; carries node identity, capabilities, and position. Variable length, typically 128–256 bytes.
- `LINK_STATE_UPDATE` — propagated through the mesh when link quality changes or topology changes; carries link metrics and validity flags. Variable length, typically 64–128 bytes.
- `ROUTE_TABLE_SYNC` — periodic synchronization of routing tables between neighbors; carries routing table deltas. Variable length.

**Delivery management traffic:**
- `EBF_HEADER` — the Energy Burst Frame header transmitted before each energy burst; carries source, destination, routing path, timing, and safety flags. Fixed 64 bytes.
- `EBF_CONFIRMATION` — returned by the receiving node after each energy burst; carries received power, spatial accuracy, timestamp, and status. Fixed 32 bytes.

**Security traffic:**
- `GUARDIAN_AUTH_REQUEST` — pre-transmission authentication exchange; four messages (Steps 1–4 of the Guardian Security protocol). Approximately 512 bytes total.
- `GUARDIAN_ANOMALY_REPORT` — generated by any node detecting an anomaly; carries anomaly classification, evidence hash, and timestamp. Variable length.
- `CERTIFICATE_CHAIN_ENTRY` — generated by Lume-X for every security event; carries signed event record. Typically 256–512 bytes.

**Control plane traffic:**
- `LUME_X_TELEMETRY` — generated by the Lume-X control loop at 73 Hz on each node; carries cross-layer state summary for monitoring. Fixed 128 bytes per cycle.
- `SHDCL_RECOVERY_EVENT` — generated by SHDCL when an anomaly is detected and recovery initiated; carries event classification and recovery action. Variable length.

**Total control-plane data volume estimate (per node, per second):**

| Traffic Type | Rate | Size | Bytes/sec |
|---|---|---|---|
| LUME_X_TELEMETRY | 73/sec | 128 B | 9,344 B/s |
| EBF_HEADER + CONFIRMATION | ~10/sec | 96 B | 960 B/s |
| NODE_ANNOUNCE | 0.1/sec | 192 B | 19 B/s |
| LINK_STATE_UPDATE | ~1/sec | 96 B | 96 B/s |
| GUARDIAN_AUTH | ~1/sec | 512 B | 512 B/s |
| Other | — | — | ~200 B/s |
| **Total** | | | **~11.1 KB/s** |

Eleven kilobytes per second of structured, addressed, authenticated data already flows through each Meridian node. This is not a negligible communication channel — it is approximately the throughput of a 2G cellular data connection, adequate for sensor telemetry, status reporting, and low-rate command-and-control for a wide range of IoT applications.

The Meridian mesh is not becoming a communication network. It already is one. The UEDM formalizes and extends this existing capability.

### 3.2 Why the Control-Plane Channel Is a Communication Channel

The control-plane traffic catalogued above satisfies every requirement of a data communication channel:

- **Addressing:** Every control-plane message carries source and destination node identities (MC 64-bit IDs, extensible to EIP 128-bit addresses under the UEDM)
- **Routing:** LINK_STATE_UPDATE and ROUTE_TABLE_SYNC propagate through the same topology-aware DRMA routing fabric as energy bursts
- **Authentication:** All control-plane messages are signed by the originating node's Guardian Security credential
- **Reliability:** EBF_CONFIRMATION provides delivery acknowledgment; SHDCL provides retransmission for critical messages
- **Timing:** TDMA scheduling provides deterministic timing for all message delivery

The only dimension in which control-plane traffic differs from general-purpose data communication is content restriction: currently, only system-defined message types are carried. The UEDM removes this restriction, allowing application-defined data payloads to be carried in the same channel alongside system control messages.

---

## 4. The Unified Energy-Data Mesh Architecture

### 4.1 Architectural Principle

The UEDM is built on one architectural principle: **a joule and a bit are both payloads; the difference is their physical carrier, not their addressing, routing, or governance.**

In the UEDM, every node has one address. That address is used for both energy delivery (EIP format) and data communication (same EIP format, data payload). The routing fabric is the same — DRMA routes both energy bursts and data packets through the same topology-aware mesh. The scheduling framework is the same — TDMA divides time between energy slots and data slots under a unified co-routing arbitration policy. The security framework is the same — Guardian Security authenticates both energy delivery sessions and data communication sessions.

The UEDM adds one new concept: the **Resource-Type Field (RTF)** in the node addressing header. The RTF indicates whether a given TDMA slot is carrying an energy payload (RTF = ENERGY) or a data payload (RTF = DATA). All other header fields — source address, destination address, routing path, timing window, safety flags — are shared between both payload types.

```
UEDM Frame Header (unified for energy and data):
  src_node_id     : 128 bits  (UEDM EIP address)
  dst_node_id     : 128 bits  (UEDM EIP address)
  resource_type   : 4 bits    (ENERGY=0x1, DATA=0x2, MIXED=0x3, CONTROL=0x4)
  priority_class  : 4 bits    (CRITICAL, HIGH, NORMAL, BACKGROUND)
  seq_num         : 32 bits
  path_id         : 32 bits
  timing_window   : 128 bits  (start + end, µs precision)
  safety_flags    : 16 bits   (BSL status, relevant for ENERGY type only)
  payload_length  : 16 bits
  checksum        : 32 bits
  [payload]       : variable  (RF burst parameters if ENERGY, data bytes if DATA)
```

The UEDM frame header is a superset of the existing EBF header, with the addition of the resource_type and payload_length fields and the generalization of the address fields to 128-bit UEDM EIP format.

### 4.2 UEDM Stack

The UEDM protocol stack is a natural extension of both the Meridian architecture stack and the Energy Internet Protocol Stack [Energy Internet, 2026]:

```
┌─────────────────────────────────────────────────────────┐
│  UAL — Unified Application Layer                        │
│  (Energy application: EaaS; Data application: any)      │
├─────────────────────────────────────────────────────────┤
│  UTL — Unified Transport Layer                          │
│  (ETCP for energy; DTCP for data; shared session mgmt)  │
├─────────────────────────────────────────────────────────┤
│  UNL — Unified Network Layer                            │
│  (EIP/EBGP for routing; shared 128-bit address space)   │
├─────────────────────────────────────────────────────────┤
│  ULL — Unified Link Layer                               │
│  (UEDM frame; co-routing arbitration; TDMA scheduling)  │
├─────────────────────────────────────────────────────────┤
│  UPL — Unified Physical Layer                           │
│  (RF: energy beam for ENERGY type, OOK/FSK for DATA)    │
└─────────────────────────────────────────────────────────┘
```

Each layer serves both resource types with a unified interface. The only layer where energy and data diverge is the UPL — the physical carrier is different (a focused beam at high power for energy; modulated signal at low power for data), though both operate on the same RF hardware through time-division switching.

### 4.3 Physical Layer Duality

The Meridian MTL hardware is a phased-array RF system. The same phased array that forms a focused beam for energy delivery can be modulated to carry information in the same transmission window. The physical layer duality operates in two modes:

**Mode 1 — Time-switched:** The TDMA scheduler dedicates specific slots to ENERGY transmission (high power, focused beam, no modulation) and other slots to DATA transmission (low power, modulated signal, no beam focusing). This is the simpler mode — the hardware operates in one mode per slot, and there is no interference between energy and data.

**Mode 2 — SWIPT-integrated:** Within a single slot, a portion of the transmitted power is modulated to carry data while the remainder is unmodulated high-power energy. The receiver simultaneously demodulates the data component and rectifies the energy component using a power-splitting receiver. This mode maximizes channel utilization but requires more sophisticated receiver hardware.

The UEDM specifies Mode 1 as the baseline — it requires no hardware modifications to existing Meridian nodes, only software changes to the TDMA scheduler and ULL. Mode 2 is an optional upgrade for nodes equipped with SWIPT-capable receivers, providing higher combined throughput.

---

## 5. Co-Routing Arbitration

### 5.1 The Arbitration Problem

The UEDM shares a fixed TDMA frame capacity between energy delivery and data communication. The total frame capacity is fixed by the physical channel parameters (bandwidth, frequency, modulation). The arbitration problem is: how should this capacity be divided between energy and data under varying load conditions?

The arbitration is constrained by two requirements that can conflict:

**Energy delivery requirement:** CRITICAL and HIGH priority energy sessions have guaranteed capacity — these sessions cannot be preempted or delayed regardless of data traffic load. Energy delivery is the primary function of the mesh; data communication is a secondary function.

**Data communication requirement:** Some data traffic (Guardian Security authentication, SHDCL recovery events, emergency alerts) must be delivered within bounded latency regardless of energy traffic load. This data is essential to the correct operation of the energy delivery system itself.

The resolution: energy delivery and essential control-plane data share a guaranteed capacity pool. General-purpose application data uses the residual capacity.

### 5.2 Capacity Allocation Framework

The UEDM TDMA frame is divided into three capacity pools:

**Pool A — Guaranteed Energy Capacity (GEC):** Reserved exclusively for CRITICAL and HIGH priority energy sessions. Size: dynamically adjusted based on the sum of active CRITICAL and HIGH session P_min requirements. Minimum: 60% of total frame capacity. Maximum: 90% of total frame capacity (the remaining 10% is reserved for Pool C regardless of energy demand).

**Pool B — Guaranteed Control Data Capacity (GCDC):** Reserved for essential control-plane data: Guardian Security authentication messages, SHDCL recovery events, NODE_ANNOUNCE, LINK_STATE_UPDATE, and LUME_X_TELEMETRY. Size: fixed at the maximum observed control-plane data rate plus 50% headroom. Typical: 5–10% of total frame capacity.

**Pool C — Flexible Shared Capacity (FSC):** The remaining capacity, shared between NORMAL and BACKGROUND energy sessions and all general-purpose application data. Arbitration within FSC is governed by the co-routing arbitration policy described in Section 5.3.

```
Total Frame Capacity = GEC + GCDC + FSC
Minimum allocation: GEC ≥ 60%, GCDC = 5–10%, FSC = remainder
```

This allocation ensures that energy delivery to CRITICAL devices and control-plane operation are never compromised by data communication traffic, while providing meaningful capacity for application data in the FSC pool.

### 5.3 Flexible Shared Capacity Arbitration Policy

Within the FSC pool, energy sessions (NORMAL and BACKGROUND) and data communication sessions compete for capacity. The arbitration policy:

**Rule 1 — Energy priority within FSC:** NORMAL energy sessions take priority over all data communication sessions in FSC. A NORMAL energy session that cannot be satisfied from FSC may preempt BACKGROUND and NORMAL data sessions. It may not preempt HIGH data (which is served from GCDC).

**Rule 2 — Application data priority classes:** Data communication sessions in FSC are classified using the same four-level QoS system as energy sessions: CRITICAL (served from GCDC), HIGH (served from GCDC), NORMAL (served from FSC with priority over BACKGROUND), BACKGROUND (served from FSC residual).

**Rule 3 — Burst accommodation:** A large data payload (firmware update, map download, batch sensor data) that does not fit in a single FSC allocation is fragmented across multiple FSC slots, with each fragment treated as a separate NORMAL data session for arbitration purposes. The first fragment has priority over subsequent fragments of the same payload.

**Rule 4 — BACKGROUND energy yields to NORMAL data:** BACKGROUND energy sessions have the lowest priority in FSC. A BACKGROUND energy session that cannot be immediately satisfied waits for FSC availability rather than preempting any data session. This prevents battery-free devices running on BACKGROUND energy from starving application data sessions.

**Rule 5 — Combined throughput optimization:** The co-routing scheduler actively seeks slots where the beam path for an energy delivery session overlaps with the communication path for a data session — enabling Mode 2 (SWIPT-integrated) transmission that serves both sessions simultaneously within one slot. This optimization is opportunistic, not guaranteed.

---

## 6. UEDM Addressing

### 6.1 Unified Address Space

The UEDM uses the EIP 128-bit address structure defined in [Energy Internet, 2026 §4.1] as the universal address for both energy delivery and data communication. There is no separate data networking address — a device that participates in the UEDM has one address that identifies it for all resource types.

```
UEDM Address (128 bits, EIP format):
  [Global Registry ID : 16 bits]
  [EAS Number        : 24 bits]
  [Zone ID           : 16 bits]
  [Node Type         : 8 bits]    — extended to include DATA_ONLY (0x06) node type
  [Node Serial       : 40 bits]
  [Checksum          : 24 bits]
```

The Node Type byte is extended by one value: 0x06 = DATA_ONLY. A DATA_ONLY node participates in data communication but cannot serve as an energy relay or source. This type accommodates devices with communication capability but no energy harvesting or transmission hardware — for example, a battery-powered gateway node that routes data through the UEDM mesh to the wider internet.

### 6.2 Service Endpoint Addressing

Within the unified address space, specific services running on a UEDM node are addressed using a service port analogous to TCP/UDP ports:

```
UEDM Service Endpoint:
  [UEDM Address : 128 bits]
  [Service Port : 16 bits]

Reserved service ports:
  0x0001 : Energy delivery (EaaS)
  0x0002 : Guardian Security authentication
  0x0003 : Lume-X telemetry
  0x0004 : SHDCL recovery messaging
  0x0005 : EDNS query/response
  0x0006 : EBGP peering
  0x0100–0xFFFF : Application-defined services
```

Application-defined services — sensor data reporting, actuator command delivery, firmware update distribution, log aggregation — use ports in the 0x0100–0xFFFF range. A sensor that reports temperature readings to a data aggregation service at address `A` port `0x0200` uses the same UEDM routing infrastructure as the energy delivery to that sensor, with the same addressing, the same security, and the same delivery accounting.

### 6.3 Multicast and Anycast in the UEDM

The UEDM supports two additional address types beyond unicast:

**UEDM Multicast:** A multicast address identifies a group of nodes. A single message addressed to a multicast group is delivered to all members of the group via efficient in-network replication. Useful for: firmware updates distributed to all nodes of a given type, emergency alerts to all nodes in a zone, routing table updates to all nodes in a zone.

Multicast is DATA-only — energy cannot be delivered to a multicast address, since energy delivery requires per-recipient power level and position validation that multicast cannot provide.

**UEDM Anycast:** An anycast address identifies the nearest (lowest-latency, highest-quality) member of a group. A message addressed to an anycast group is delivered to the single best-positioned member. Useful for: energy delivery requests (route to nearest available source node), EDNS resolution (query the nearest EDNS resolver), service discovery (find the nearest instance of a service).

Anycast is supported for both energy and data: an energy request addressed to an anycast source node address is routed to the nearest available source node with sufficient charge state. This is the natural implementation of mesh-wide energy balancing — a requesting node does not need to know which specific source node is nearest; it sends to the anycast source-node address and the UEDM routes to the optimal source.

---

## 7. The Self-Sustaining Device Model

### 7.1 Definition

A self-sustaining device (SSD) is a UEDM participant that:
1. Receives all of its operating power from the UEDM (no battery, no wired power)
2. Conducts all of its data communication through the UEDM (no separate wireless radio)
3. Has no external infrastructure dependency beyond UEDM mesh coverage

An SSD is the device-level realization of the UEDM value proposition: a single wireless mesh deployment that provides both the power and the connectivity for all devices in its coverage area.

### 7.2 SSD Power-Communication Budget

An SSD operates under a power-communication budget: the energy it receives from the UEDM must be sufficient to power its computation, its sensing, and its UEDM communication — all from a single energy allocation.

A typical SSD budget:

```
SSD Operating Budget (10 mW received power example):
  Microcontroller (Cortex-M4 at 4 MHz)    : 1.2 mW
  Sensor (temperature + humidity, 1 Hz)   : 0.8 mW
  RF transceiver (receive mode)           : 2.0 mW
  RF transceiver (transmit mode, 1% duty) : 0.5 mW avg
  Energy management circuit               : 0.3 mW
  Margin for supercapacitor charging      : 5.2 mW
  ---------------------------------------------------
  Total                                   : 10.0 mW
```

At this budget, the SSD can operate continuously at 10 mW received power while maintaining a 52% supercapacitor charging margin — sufficient to sustain operation through brief periods of UEDM unavailability (mesh topology changes, TDMA schedule gaps).

Communication capacity at this budget: the RF transceiver in receive mode is always on (monitoring for incoming packets); in transmit mode at 1% duty cycle, with 250 kbps PHY rate, the SSD can transmit approximately 2.5 kbits per second of application data — sufficient for sensor telemetry, status reporting, and firmware updates at low rate.

### 7.3 SSD Lifecycle

An SSD has three operational states:

**BOOTSTRAPPING:** The SSD has just been deployed and has not yet established UEDM identity. It broadcasts a NODE_ANNOUNCE with a provisioning credential (a temporary credential issued during manufacture). A source node or gateway node receives the announcement and initiates the Guardian Security provisioning protocol. Once the SSD receives its full Trust Layer Ledger (TLL) identity credential, it transitions to OPERATIONAL.

**OPERATIONAL:** The SSD participates fully in the UEDM — receiving energy, routing control messages, and conducting application data communication. It monitors its supercapacitor charge state and requests supplementation when charge falls below V_min + margin.

**CONSERVATION:** The SSD's supercapacitor has dropped below V_min. All non-essential processes are suspended. The SSD maintains only the energy monitoring circuit and waits for UEDM energy delivery to restore charge. Once charge is restored above V_min + hysteresis, it transitions back to OPERATIONAL.

### 7.4 SSD Failure and Recovery

An SSD that drops out of the UEDM (power depletion in CONSERVATION state for longer than the SHDCL detection window) is treated as a failed node by the mesh. Mesh routing tables are updated to mark the SSD's relay function (if any) as unavailable. When the SSD recovers charge and re-announces, it is re-integrated through the same NODE_ANNOUNCE + verification process as initial bootstrapping.

This recovery behavior is identical to wound healing in the Meridian Synthetic Organism model [Meridian Organism, 2026 §5.4]: node failure → detection → rerouting → function continues → node recovery and reintegration. The SSD lifecycle is a concrete implementation of the wound-healing property operating at the device scale.

---

## 8. UEDM and the Energy Internet

### 8.1 The UEDM as the Energy Internet's Access Layer

The Energy Internet [Energy Internet, 2026] defines the protocol stack for energy routing across independently administered meshes. The UEDM is the access layer of the Energy Internet — the technology that connects end devices (sensors, actuators, monitors) to the Energy Internet infrastructure.

In the data internet model, the access layer (Wi-Fi, Ethernet, 5G) connects end devices to the wider internet. The access layer is not the internet — it is the last hop that connects devices to the infrastructure that carries their traffic to any destination globally. The Energy Internet needs the same two-tier structure: an internet-scale routing infrastructure (the Energy Internet) and a device-level access layer (the UEDM).

The UEDM is the Energy Internet's access layer because:
- End devices register with the UEDM mesh using UEDM addresses (EIP format)
- The UEDM mesh connects to the Energy Internet through gateway nodes that implement ELL and ENL
- Energy and data requests from end devices are routed through the UEDM mesh to the gateway, then across the Energy Internet to their destination

An SSD that needs energy can request it from a local UEDM source node (intra-mesh delivery) or, through the gateway, from an Energy Internet source node in a remote EAS (inter-mesh delivery via EBGP). The UEDM handles the last-hop access; the Energy Internet handles the inter-mesh routing.

### 8.2 UEDM Gateway Function

A UEDM gateway node implements the full Energy Internet Protocol Stack [Energy Internet, 2026 §3] in addition to the UEDM ULL and UPL. It translates between:

- UEDM frame format (ULL) ↔ Energy Internet ELL frame format
- UEDM node addresses ↔ Energy Internet EIP addresses (these are the same 128-bit format; translation is identity)
- UEDM TDMA scheduling ↔ Energy Internet link-layer timing

The gateway also runs EBGP, advertising the UEDM's EAS prefix to the wider Energy Internet and accepting routes from peer EAS operators. From the Energy Internet's perspective, the UEDM is an EAS — an independently administered network with a defined address prefix. The gateway is the EAS border router.

### 8.3 Data at Energy Internet Scale

The UEDM enables a capability that the Energy Internet specification did not include: data communication at internet scale through the energy routing infrastructure. An SSD's sensor data, routed through the UEDM to the gateway and then across the Energy Internet to a remote data aggregation service, is traveling on the same infrastructure as the energy that powers the SSD.

This convergence — the Energy Internet as both a power grid and a data network — is not an incidental feature. It is the natural consequence of the UEDM's unified addressing and routing framework. Once energy and data share the same addresses and the same routing fabric, they share the same internet-scale infrastructure automatically.

---

## 9. The UEDM Control Plane

### 9.1 Unified Control Plane Architecture

The UEDM control plane manages both energy routing and data communication simultaneously. It is implemented as an extension of the existing Meridian control plane (MMF + MFE + Lume-X), with additional data-specific control functions:

**Energy control functions (existing):**
- DRMA topology management (routing tables, link-state)
- MFE burst scheduling (charge state monitoring, burst timing)
- SHDCL failure detection and recovery
- Guardian-E energy security (pre-transmission authentication, anomaly detection)

**Data control functions (new):**
- DTCP session management (data delivery sessions, retransmission, QoS)
- Multicast group management (group membership, replication scheduling)
- Application service registration (port binding, service announcement)
- Data security integration (Guardian-E session authorization for data sessions)

**Unified control functions (shared):**
- Co-routing arbitration (capacity pool management, TDMA scheduling)
- UEDM address management (EIP address assignment, EDNS registration)
- Gateway function management (EAS boundary, EBGP state)
- Certificate chain logging (audit records for both energy and data events)

### 9.2 Data Transport Control Protocol (DTCP)

DTCP is the data-domain equivalent of ETCP [Energy Internet, 2026 §3.6]. Where ETCP provides delivery guarantees for energy sessions (P_min, σ², retransmission budget), DTCP provides delivery guarantees for data sessions (packet loss rate, latency bound, retransmission limit).

```
DTCP Session:
  source_UEDM     : 128-bit UEDM address + 16-bit port
  destination_UEDM: 128-bit UEDM address + 16-bit port
  priority_class  : CRITICAL / HIGH / NORMAL / BACKGROUND
  max_latency_ms  : maximum acceptable end-to-end delivery latency
  max_loss_pct    : maximum acceptable packet loss rate (%)
  session_type    : STREAM / DATAGRAM / MULTICAST
  billing_account : energy credit account (data communication also billed)
```

DTCP retransmission differs from ETCP retransmission in one important way: data retransmission costs data capacity but not energy. A retransmitted data packet does not deplete source node supercapacitors — the RF transmission power for data packets is orders of magnitude lower than for energy bursts. DTCP can therefore be more aggressive in retransmission than ETCP.

### 9.3 Billing Integration

In a deployed UEDM, data communication is a service with associated costs, analogous to cellular data billing. The energy credit accounting system [Energy Internet, 2026 §5.4] is extended to cover both energy delivery and data communication:

**Energy billing:** Billed per milliwatt-hour delivered, as defined in the Energy Internet specification.

**Data billing:** Billed per kilobyte delivered, using the same energy credit denomination. The exchange rate (energy credits per kilobyte) is determined by the EAS operator based on the energy cost of data transmission (RF transmission power × transmission time) plus overhead.

**Combined billing:** An SSD that receives both energy and data through the UEDM has a single energy credit account that is debited for both services. This simplifies billing compared to separate power and communication subscriptions.

---

## 10. Applications and Deployment Scenarios

### 10.1 Smart Building Infrastructure

A building equipped with UEDM infrastructure requires no per-device wiring for either power or communication. Every device in the building — occupancy sensors, air quality monitors, HVAC controls, lighting dimmers, door access readers, security cameras, fire detectors — is an SSD. Installation is physical mounting only; there is no wiring.

The UEDM mesh provides:
- Power to every device from UEDM source nodes installed in ceiling panels or wall outlets
- Data communication from every device to the building management system through the same mesh
- Identity verification for every device through the Trust Layer Ledger (TLL), enabling granular access control and audit
- Self-healing around device or mesh node failures, maintaining coverage without manual intervention

The cost comparison against conventional smart building infrastructure (wired power + separate wireless communication) is significant: eliminating two separate infrastructure installations and replacing them with one unified mesh reduces material cost, installation labor, and ongoing maintenance complexity simultaneously.

### 10.2 Industrial IoT at Scale

A manufacturing facility with thousands of sensors monitoring temperature, vibration, fluid level, and equipment health faces two infrastructure challenges: powering all sensors (battery replacement at scale is expensive) and connecting them all (wired communication is inflexible; separate wireless networks require separate management).

The UEDM addresses both simultaneously. Sensors are SSDs — powered and connected through the mesh. Actuators (valve controllers, motor controllers, conveyor adjusters) receive high-priority energy delivery (NORMAL or HIGH class) and accept control commands through the same mesh. The manufacturing DPI described in [DI Theory, 2026 §9.2] uses the UEDM as its resource routing fabric.

### 10.3 Emergency Response Networks

Portable UEDM anchor nodes deployed by emergency responders create an instant infrastructure — no wiring, no separate communication setup. Personnel carrying UEDM-enabled equipment receive power for their devices and communicate through the mesh simultaneously. Medical monitoring devices provide continuous telemetry to triage coordinators through the same mesh that powers them.

The Emergency Priority Override mechanism [Energy Internet, 2026 §6.4] ensures that CRITICAL energy sessions (medical devices) are protected even when the mesh is under high load. The Guardian Security Emergency Authority Credential [Guardian Security, 2026 §7.3] enables emergency coordinators to establish and protect priority sessions with authenticated authorization.

### 10.4 Agricultural Sensor Networks

Large-scale agricultural monitoring — soil moisture, microclimate conditions, pest detection, irrigation control — requires dense sensor deployment over large areas. Battery replacement in a field with thousands of sensors per square kilometer is impractical. Wiring is impossible. The UEDM mesh, deployed through strategically placed anchor nodes (solar-powered Class A anchors on fence posts or poles), provides power and connectivity to dense sensor networks across agricultural areas.

Communication range in this scenario is extended by relay nodes — SSD relay nodes that receive energy from the anchor, forward it to more distant sensors, and relay data from distant sensors back to the anchor and onward to the internet through the gateway. The relay chain is the DRMA multi-hop topology applied to an agricultural deployment context.

---

## 11. Related Work

### 11.1 Simultaneous Wireless Information and Power Transfer

The SWIPT literature [58, 59] is the primary academic foundation for the UEDM's physical layer duality. Varshney [58] first formulated the theoretical tradeoff between information rate and energy harvesting from a single RF signal. Grover and Sahai [60] extended this to the capacity-energy tradeoff for AWGN channels. Zhou et al. [61] introduced the receiver design models (power splitting and time switching) that the UEDM's Mode 1 and Mode 2 draw on directly.

The UEDM advances the SWIPT literature in two directions. First, SWIPT research has focused overwhelmingly on single-link or broadcast scenarios; the UEDM is a multi-hop routed network, which introduces the co-routing arbitration problem that has not been addressed in the SWIPT literature. Second, SWIPT research treats the physical layer tradeoff as the primary design variable; the UEDM treats it as one parameter in a broader routing and governance problem.

### 11.2 Wireless Powered Communication Networks

Wireless Powered Communication Networks (WPCN) [62, 63] consider networks in which devices harvest energy from wireless signals transmitted by a power beacon and use the harvested energy to communicate with an access point. This architecture is similar to the SSD model — devices receive power wirelessly and communicate wirelessly — but differs in that WPCNs use separate beacons and access points for power and communication rather than a unified mesh.

The UEDM's SSD model achieves the same device independence as WPCN (battery-free, cable-free operation) through a unified mesh architecture that provides both functions from the same infrastructure, eliminating the separate power beacon and access point infrastructure that WPCN requires.

### 11.3 Integrated Sensing and Communication

Integrated Sensing and Communication (ISAC) [64, 65] uses a shared RF waveform for both radar sensing and communication, exploiting the spectral overlap between sensing and communication to improve efficiency. This is a waveform-level integration analogous to the UEDM's network-level integration.

The UEDM's localization subsystem (UWB ranging) already performs a sensing function — measuring node positions. Extending this to general environmental sensing (radar presence detection for BSL, structural health monitoring through vibration sensing at the node hardware) would make the UEDM an ISAC system at the node level. This is a natural extension beyond the scope of this paper.

### 11.4 Named Data Networking

Named Data Networking (NDN) [66] proposes replacing IP's host-centric addressing (route to this address) with content-centric addressing (route to this named piece of data). The UEDM's service endpoint addressing (Section 6.2) draws on NDN principles — a data request can be addressed to a service name (e.g., `temperature-sensor.lab-a.building-3.mit.energy:0x0200`) rather than a specific device address, allowing the routing fabric to deliver the request to the nearest available temperature sensor.

The UEDM's anycast addressing (Section 6.3) is a limited form of NDN content routing: route to the nearest instance of a service rather than to a specific host. A full NDN integration into the UEDM — where energy requests are addressed by capability name rather than device address — is a promising extension for ambient IoT scenarios where device identity is less important than service availability.

### 11.5 The Lume Ecosystem

The UEDM is the convergence of two Lume ecosystem trajectories: the energy routing trajectory (Meridian [Meridian Architecture, 2026], Energy Internet [Energy Internet, 2026]) and the identity and communication trajectory (Trust Layer Ledger (TLL) [16], DAIGS [17]). The UEDM is the physical instantiation of the cross-domain interoperability model described in [DI Theory, 2026 §8] — the single fabric in which energy, data, and identity are governed under one framework.

---

## 12. Limitations and Honest Boundaries

**No hardware validation exists.** The UEDM is an architectural specification. The co-routing arbitration rules, the UEDM frame format, and the DTCP protocol have not been implemented or tested in hardware. The SSD power-communication budget estimates are based on current hardware specifications for microcontrollers and RF transceivers — they are plausible but not validated.

**The TDMA capacity model is simplified.** The capacity pool analysis in Section 5.2 treats the total TDMA frame capacity as a fixed number. In practice, channel capacity varies with distance, interference, frequency, and hardware configuration. The arbitration rules are correct in structure but require empirical capacity measurements for specific deployment scenarios to set meaningful parameter values.

**Mode 2 (SWIPT-integrated) requires hardware not currently specified in Meridian.** The Meridian MTL specification [Meridian Architecture, 2026] does not include a SWIPT-capable receiver design. Mode 2 operation requires receiver hardware that simultaneously demodulates a data signal and rectifies RF energy from the same incoming signal. This hardware exists in research prototypes but has not been included in the Meridian node specification. Mode 1 requires no hardware changes.

**Self-sustaining device viability depends on deployment density.** An SSD in a sparse UEDM mesh — one source node for a large area — may not receive sufficient energy for continuous operation. The SSD model is viable when UEDM source node density is sufficient to maintain P_min at all SSD locations. The required density depends on the physical environment (attenuation, reflections, mobility), the SSD power budget, and the Phase 1–3 efficiency validation results.

**Data latency in the UEDM is higher than dedicated data networks.** TDMA scheduling introduces fixed latency at each hop. A five-hop data path with 13.7 ms control cycles has a minimum latency of approximately 70 ms for data packets — higher than Wi-Fi or Bluetooth, adequate for sensor telemetry and status reporting, but not appropriate for real-time control applications or high-quality audio/video streaming.

**The billing model is unvalidated.** The energy-credit-denominated data billing model described in Section 9.3 has no economic validation. The exchange rate between energy credits and data capacity requires empirical calibration against actual deployment economics.

---

## 13. Conclusion

The Meridian mesh was designed to route energy. It already routes data. That was inevitable — a deterministic routing network that governs energy delivery through addressed nodes, authenticated sessions, and confirmed receipts cannot route energy without also routing the information that governs it. The control plane is a communication layer. The UEDM formalizes it.

The formal recognition of the Meridian mesh as a dual-traffic fabric — one that routes both joules and bits under a unified addressing, routing, and governance framework — has three significant implications.

First, it resolves the most persistent practical obstacle to large-scale IoT deployment: the dual infrastructure problem. Every deployed IoT device currently needs two connections — one for power, one for communication. The UEDM reduces two infrastructure problems to one, cutting deployment cost and complexity simultaneously.

Second, it validates the convergence thesis at the infrastructure level. Papers 1–4 of this series argued that deterministic autonomous systems converge toward biological organization, that this convergence is general across physical domains, and that it is a design principle rather than an accident. The UEDM demonstrates this convergence at the resource level: power and communication, the two fundamental infrastructure resources, converge toward a single fabric when both are designed on deterministic routing principles. Convergence is not just a property of system organization — it is a property of resource infrastructure.

Third, it completes the Energy Internet architecture. The Energy Internet [Energy Internet, 2026] defined the inter-mesh routing standard but deferred the access layer — how end devices connect to the energy routing infrastructure. The UEDM is that access layer. Together, the Energy Internet and the UEDM provide the complete architecture from global inter-mesh routing to self-sustaining device connection, with no infrastructure gap.

When both the power and the packet travel through the same fabric, governed by the same addresses, the same routes, and the same governance framework, the infrastructure needed to support a world of trillions of autonomous devices becomes not two separate global systems but one.

That is what the UEDM makes possible.

---

## Appendix A — UEDM Protocol Stack

| Layer | Name | Energy Function | Data Function | Protocol |
|---|---|---|---|---|
| 5 | UAL | EaaS energy profiles | Application services | EaaS + custom |
| 4 | UTL | ETCP energy sessions | DTCP data sessions | ETCP / DTCP |
| 3 | UNL | EIP routing, EBGP | Same (unified address) | EIP / EBGP |
| 2 | ULL | Energy burst framing, TDMA | Data packet framing, co-routing | UEDM Frame |
| 1 | UPL | High-power focused beam | Modulated low-power signal | RF (time-switched) |

---

## Appendix B — Co-Routing Arbitration Rules

| Rule | Description | Priority Impact |
|---|---|---|
| AR-01 | GEC reserved exclusively for CRITICAL + HIGH energy | Energy ≫ data in GEC |
| AR-02 | GCDC reserved for essential control-plane data | Control data ≫ application data |
| AR-03 | NORMAL energy priority over all data in FSC | Energy > data in FSC |
| AR-04 | BACKGROUND energy yields to NORMAL data in FSC | Data > background energy |
| AR-05 | CRITICAL data served from GCDC, not FSC | Data CRITICAL protected |
| AR-06 | FSC allocated in TDMA slot increments | Minimum granularity: 1 slot |
| AR-07 | Mode 2 (SWIPT) used when paths overlap | Efficiency optimization |
| AR-08 | Large data payloads fragmented across FSC slots | No monopolization of FSC |

---

## Appendix C — UEDM Addressing Specification

```
UEDM Address Format (128 bits):
  Same as EIP address format [Energy Internet, 2026, Appendix B]
  with Node Type 0x06 = DATA_ONLY added

Service Endpoint Format:
  [UEDM Address : 128 bits] + [Service Port : 16 bits] = 144 bits total

Reserved Ports:
  0x0001 : Energy delivery (EaaS endpoint)
  0x0002 : Guardian Security authentication
  0x0003 : Lume-X telemetry
  0x0004 : SHDCL recovery messaging
  0x0005 : EDNS query/response
  0x0006 : EBGP peering session
  0x0007 : DTCP session establishment
  0x0008 : Multicast group management
  0x0009 : Service discovery
  0x000A : Energy credit settlement
  0x000B–0x00FF : Reserved for future system services
  0x0100–0xFFFF : Application-defined services
```

---

## Appendix D — Self-Sustaining Device Profile

| Parameter | Minimum | Typical | High-Performance |
|---|---|---|---|
| Received power (P_min) | 1 mW | 10 mW | 100 mW |
| Computation | Ultra-low-power MCU, 1 MHz | Cortex-M4, 4 MHz | Cortex-M33, 64 MHz |
| Sensor duty cycle | 0.1 Hz | 1 Hz | 10 Hz |
| Data rate (uplink) | 100 bps | 2.5 kbps | 25 kbps |
| Supercapacitor capacity | 1 mF | 10 mF | 100 mF |
| Recovery time after blackout | 60 s | 10 s | 2 s |
| Organism type [Meridian Organism, 2026] | Type 2 | Type 3 | Type 3+ |

---

## References

**Converged Infrastructure:**

[53] Ferreira, H.C., et al. (2010). *Power Line Communications: Theory and Applications for Narrowband and Broadband Communications over Power Lines.* Wiley.

[54] IEEE 1901. (2010). *Standard for Broadband over Power Line Networks: Medium Access Control and Physical Layer Specifications.* IEEE.

[55] Berger, L.T., & Schwager, A. (2014). *MIMO Power Line Communications: Narrow and Broadband Standards, EMC, and Advanced Processing.* CRC Press.

**SWIPT:**

[58] Varshney, L.R. (2008). "Transporting Information and Energy Simultaneously." *IEEE ISIT*, 1612–1616.

[59] Grover, P., & Sahai, A. (2010). "Shannon meets Tesla: Wireless Information and Power Transfer." *IEEE ISIT*, 2363–2367.

[60] Zhou, X., Zhang, R., & Ho, C.K. (2013). "Wireless Information and Power Transfer: Architecture Design and Rate-Energy Tradeoff." *IEEE Transactions on Communications, 61*(11), 4754–4767.

**Wireless Powered Communication Networks:**

[61] Bi, S., Ho, C.K., & Zhang, R. (2015). "Wireless Powered Communication: Opportunities and Challenges." *IEEE Communications Magazine, 53*(4), 117–125.

[62] Ju, H., & Zhang, R. (2014). "Throughput Maximization in Wireless Powered Communication Networks." *IEEE Transactions on Wireless Communications, 13*(1), 418–428.

**ISAC:**

[63] Liu, F., et al. (2022). "Integrated Sensing and Communications: Toward Dual-Functional Wireless Networks for 6G and Beyond." *IEEE Journal on Selected Areas in Communications, 40*(6), 1728–1767.

[64] Zhang, J.A., et al. (2021). "An Overview of Signal Processing Techniques for Joint Communication and Radar Sensing." *IEEE Journal of Selected Topics in Signal Processing, 15*(6), 1295–1315.

**Named Data Networking:**

[65] Zhang, L., et al. (2014). "Named Data Networking." *ACM SIGCOMM Computer Communication Review, 44*(3), 66–73.

**IAB (Integrated Access and Backhaul):**

[57] 3GPP TR 38.874. (2018). *Study on Integrated Access and Backhaul.* 3GPP.

**Lume Ecosystem:**

[15] Andrews, J. (2026). *Lume Language Specification.* DOI: 10.5281/zenodo.19382282
[16] Andrews, J. (2026). *Trust Layer Ledger (TLL) Ecosystem.* DOI: 10.5281/zenodo.19560674
[17] Andrews, J. (2026). *DAIGS Framework.* DOI: 10.5281/zenodo.19491784
[18] Andrews, J. (2026). *Lume-V Verification Suite.* DOI: 10.5281/zenodo.19645097
[19] Andrews, J. (2026). *Lume-X Multi-Agent Cognition.* DOI: 10.5281/zenodo.19443968
[20] Andrews, J. (2026). *Deterministic Dissolution.* DOI: 10.5281/zenodo.15065493
[21] Andrews, J. (2026). *Meridian Architecture.* [Companion paper]
[22] Andrews, J. (2026). *Meridian Organism.* [Companion paper]
[23] Andrews, J. (2026). *Energy Internet.* [Companion paper]
[50] Andrews, J. (2026). *Deterministic Infrastructure.* [Companion paper]
[51] Andrews, J. (2026). *Guardian Security.* [Companion paper]

---

*END OF PAPER*

*The Unified Energy-Data Mesh: Co-Routing Power and Information Through a Single Deterministic Fabric*
*Version 1.0 — DarkWave Studios LLC*
*Author: Jason Andrews | ORCID: 0009-0007-5214-649X | team@dwsc.io*
*lume-lang.org | github.com/cryptocreeper94-sudo*
*Patent Pending — Provisional Application: Systems and Methods for Deterministic Multi-Layer Wireless Energy Routing Using Ambient Harvesting, Mesh Coordination, and Directional Transmission*
*Lume-X: Provisionally patented deterministic control runtime.*
*© 2026 DarkWave Studios LLC. All rights reserved.*
*This preprint has not undergone peer review.*
*Do not submit to any publication venue before Phase 1 experimental data exists.*
