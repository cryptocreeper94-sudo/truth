# Guardian Security: A Formal Threat Model and Defense Framework for Deterministic Wireless Energy Routing

**Subtitle:** The First Complete Security Architecture for Identity-Governed, Invariant-Enforced Wireless Power Delivery

---

**DarkWave Studios LLC — Canon² Technical Paper Series**
**Paper Number:** [Assign at Zenodo Upload]
**DOI:** [Assign at Zenodo Upload — doi.org/10.5281/zenodo.XXXXXXX]

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Affiliation:** DarkWave Studios LLC, Nashville, Tennessee
**Contact:** team@dwsc.io
**GitHub:** github.com/cryptocreeper94-sudo
**Website:** lume-lang.org | TrustShield.tech
**Series:** Canon² — Engineering Architecture Papers

**Patent Pending:** Systems and Methods for Deterministic Multi-Layer Wireless Energy Routing Using Ambient Harvesting, Mesh Coordination, and Directional Transmission (DarkWave Studios LLC)
**Lume-X:** Provisionally patented deterministic control runtime.
**Guardian Security:** Commercial security enforcement product. Domain: TrustShield.tech

**Companion Papers:**
- Andrews, J. (2026). Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture. [Cited as "Meridian Architecture, 2026"]
- Andrews, J. (2026). Meridian as Synthetic Organism. [Cited as "Meridian Organism, 2026"]
- Andrews, J. (2026). The Energy Internet: A Universal Protocol Stack for Deterministic Wireless Power Delivery. [Cited as "Energy Internet, 2026"]
- Andrews, J. (2026). Deterministic Infrastructure: A General Theory. [Cited as "DI Theory, 2026"]

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

Wireless energy routing introduces a class of security vulnerabilities that has no analog in data networking: a successful attack on a wireless power system does not corrupt data — it corrupts physics. Beam hijacking misdirects RF energy to unintended targets. Denial-of-power attacks starve critical devices. Localization spoofing causes a beam to strike a biological target rather than an electronic one. The consequences of these attacks are not data loss or service disruption — they are equipment damage, fire, and physical injury.

No formal security framework for wireless energy routing has previously been published. This paper provides one.

I define the complete attack surface for a deterministic wireless energy routing system, derive eleven threat categories from first principles, and specify the Guardian Security defense framework — the security enforcement layer implemented in the Meridian architecture — as a formal, auditable response to each threat. Guardian Security (energy-domain designation: Guardian-E; commercial product domain: TrustShield.tech) implements two-tier defense: an innate tier providing immediate, non-specific response to anomalous conditions, and an adaptive tier providing learned, specific response to classified threat patterns.

I derive the Guardian Security rule set from the formal attack surface definition rather than from enumerated known attacks, ensuring that the defense covers the complete threat space rather than only previously observed threats. I prove coverage completeness by demonstrating that every path from attacker to system compromise requires traversal of at least one Guardian Security enforcement boundary. I show that Guardian Security satisfies four formal security properties: authenticity (every participant is who they claim to be), integrity (no resource flow is modified in transit without detection), availability (the system continues operating under attack, with degraded but bounded service), and non-repudiation (every resource delivery event is attributable to a specific authenticated participant).

This paper establishes the security foundation for both the single-mesh Meridian architecture and the multi-mesh Energy Internet. It proposes Guardian Security as the reference security architecture for all future Deterministic Infrastructure deployments.

**Keywords:** wireless energy security, threat model, formal security analysis, Guardian Security, denial-of-power, beam hijacking, localization spoofing, Meridian, TrustShield, deterministic infrastructure security, wireless power transfer security

---

## Table of Contents

1. Introduction
2. Background: Why Energy Security Is Different
3. Attack Surface Definition
4. The Eleven Threat Categories
5. The Guardian Security Framework
6. Formal Security Properties and Coverage Proof
7. Guardian Security at Energy Internet Scale
8. The Biological Safety Layer as Physical Security Invariant
9. Operational Security: Deployment and Audit
10. Related Work
11. Limitations and Honest Boundaries
12. Conclusion
- Appendix A — Complete Threat Taxonomy
- Appendix B — Guardian Security Rule Set
- Appendix C — Coverage Proof by Attack Path
- Appendix D — Guardian Security at Three Operational Levels
- References

---

## 1. Introduction

### 1.1 A Security Gap With Physical Consequences

The wireless power transfer industry has, until this paper, produced no formal security framework. This is not oversight — it reflects the history of the field. Wireless power has been framed as an efficiency and range problem, not a security problem. The threat model for a Qi charging pad is limited: an attacker who places a foreign object on the charging surface triggers a foreign object detection circuit. The consequence of a failed attack is a failed charge. The security model needs only to prevent this one failure.

Wireless energy routing at mesh scale is a different threat environment entirely. When a system routes watt-level energy through addressed nodes across a distributed network, the attack surface expands in every dimension: the range is no longer centimeters but meters; the nodes are addressable over a network rather than physically accessible only; the power levels are sufficient to cause harm; and the routing infrastructure itself becomes a target — not just the delivery endpoint.

I enumerate the consequences of specific attack classes that a wireless energy routing system without a formal security framework cannot prevent:

**Localization spoofing:** An attacker feeds false position data to the routing system. The beam steers toward the false position — which may be occupied by a biological target. Physical injury results.

**Beam hijacking:** An attacker intercepts a delivery route and redirects the beam. An unauthorized device receives energy it was not allocated, and the intended recipient is denied it. If the intended recipient is a medical device, the denial is life-safety critical.

**Denial-of-power:** An attacker generates synthetic energy requests that saturate the mesh's routing capacity. Legitimate devices are denied service. A network of critical sensors loses power simultaneously.

**Routing table manipulation:** An attacker injects false routing table entries. Energy flows through attacker-controlled relay nodes, enabling interception, denial, or misdirection of all traffic on the poisoned route.

**Node impersonation:** An attacker deploys a device claiming a legitimate node's identity. It receives energy intended for the legitimate device and may serve as a relay that the attacker controls.

None of these attacks require proximity to a single charging pad. All of them require a wireless energy routing system without a formal security architecture. Guardian Security is that architecture.

### 1.2 The Security Architecture Problem

Building a security architecture for wireless energy routing presents three challenges that do not exist in data network security:

**The physics cannot be patched.** A data network that discovers a security vulnerability can be updated with a software patch. An RF beam that strikes a biological target cannot be recalled. Security must be preventive, not corrective. The Guardian Security framework is designed to make the class of physically harmful attacks impossible to execute, not merely detectable after the fact.

**The delivery confirmation is the attack surface.** In data networking, delivery confirmation (TCP ACK) is a control-plane message that is separated from the data payload. In wireless energy routing, the delivery confirmation is the physical measurement of received power — it is feedback from the physical world, not a protocol message. An attacker who can spoof the physical measurement (false received-power telemetry) can deceive the routing system about whether energy was delivered, to whom, and how much.

**Identity must be verified before the first joule flows.** In data networking, an unverified connection attempt is a mild nuisance — the worst case is a SYN flood. In wireless energy routing, an unverified node that successfully masquerades as a legitimate source node can aim a beam before identity is checked. Identity verification must be enforced at the routing level, before any physical transmission occurs.

### 1.3 Contributions

I make five contributions:

1. The first formal definition of the attack surface for a deterministic wireless energy routing system, derived from first principles rather than from enumerated known attacks.

2. A taxonomy of eleven threat categories covering the complete attack surface, each with formal definition, attack vector, and consequence characterization.

3. The Guardian Security framework — a two-tier (innate + adaptive) security architecture that provides coverage of all eleven threat categories with formally defined enforcement boundaries.

4. A coverage proof demonstrating that every attack path from adversary to system compromise requires traversal of at least one Guardian Security enforcement boundary.

5. An extension of the Guardian Security framework to Energy Internet scale, addressing the additional threat surface introduced by inter-mesh federation, EBGP routing, and multi-operator deployments.

### 1.4 Paper Organization

Section 2 characterizes why energy security differs fundamentally from data security. Section 3 defines the attack surface from first principles. Section 4 presents the eleven threat categories. Section 5 specifies the Guardian Security framework. Section 6 proves formal security properties. Section 7 extends the framework to Energy Internet scale. Section 8 analyzes the Biological Safety Layer as a physical security invariant. Section 9 addresses operational security. Section 10 situates this in related literature. Section 11 states limitations. Section 12 concludes.

---

## 2. Background: Why Energy Security Is Different

### 2.1 The Consequence Asymmetry

Security analysis begins with the consequence model: what is the worst realistic outcome of a successful attack? The consequence model determines how much defense investment is justified and what failure modes are acceptable.

For a data network, the consequence model ranges from service disruption (DoS) to data breach (confidentiality loss) to data corruption (integrity loss). These are serious consequences — financial damage, reputational harm, privacy violations, regulatory penalties. They are not, in the general case, physical injury.

For a wireless energy routing network, the consequence model includes physical injury. An RF beam at the power densities required for useful energy delivery — even at the conservative power levels of Phase 1 Meridian deployment — can cause tissue heating if directed at a biological target at close range. At higher power levels, the consequence is burns. A localization spoofing attack that redirects a high-power beam toward a person is not a data breach — it is a physical assault.

This consequence asymmetry means that some attack classes that are "acceptable" in data network security — where "acceptable" means "detectable and recoverable" — are not acceptable in energy routing security. An attack that results in physical injury cannot be recovered from. The security architecture must prevent these attacks, not detect them post-hoc.

The Biological Safety Layer (BSL) in the Meridian architecture [Meridian Architecture, 2026 §8] is the primary mechanism for enforcing this preventive requirement. Section 8 of this paper analyzes the BSL as a physical security invariant — the mechanism that ensures physical harm is impossible even when all other security mechanisms fail simultaneously.

### 2.2 The Physical Delivery Confirmation Problem

In data networking, the control plane (routing decisions) and the data plane (packet forwarding) are conceptually separate, even when they share physical infrastructure. A routing decision is made based on control-plane information (routing tables, OSPF state, BGP updates) that is separate from the data being routed.

In wireless energy routing, the control plane and the physical plane are coupled at the measurement layer: the routing system's view of the physical world comes from physical measurements (received power telemetry, UWB localization returns, supercapacitor voltage readings). If these measurements can be falsified, the routing system's model of the physical world can be corrupted.

This coupling creates attack vectors that have no data networking analog:

- **False localization returns:** An attacker that can transmit UWB localization signals can cause a node to believe a receiver is at a different position than its actual position.
- **False received-power telemetry:** An attacker that can generate false EBF confirmation messages can cause the routing system to believe energy was successfully delivered when it was not, or to believe energy was not delivered when it was.
- **False supercapacitor readings:** An attacker that can inject false charge-state data can cause the routing system to make incorrect routing decisions — routing energy to a node that is actually fully charged, or denying supplementation to a node that is actually depleted.

Each of these attacks targets the measurement layer that the control plane depends on. Guardian Security must protect not just the protocol layer but the physical measurement layer.

### 2.3 The Pre-Transmission Identity Requirement

In data networking, authentication can happen after the first packet. TCP SYN packets are unauthenticated. TLS handshakes happen after TCP connection establishment. The worst case of unauthenticated early traffic is a SYN flood, which is annoying but recoverable.

In wireless energy routing, the first packet IS the physical beam. There is no unauthenticated "handshake packet" that precedes the physical action — the physical action itself is the delivery. A node that successfully triggers beam transmission without completing authentication has already received energy it was not entitled to, and the beam has already existed as a physical field in space.

Guardian Security must enforce complete authentication before any beam authorization is issued. The authentication must be completed at the routing layer, not at the application layer after delivery begins. This is the pre-transmission identity requirement: no beam command is issued to MTL unless the source, relay chain, and destination have all completed Guardian Security authentication for the current session.

---

## 3. Attack Surface Definition

I define the attack surface of a wireless energy routing system from first principles, without reference to specific known attacks. The attack surface is the set of all interfaces through which an adversary can influence system behavior.

### 3.1 Physical Attack Interfaces

**PAI-1: RF transmission medium.** The air through which RF energy travels. Accessible to any attacker within RF range. Enables: beam interception (passive — measure transmitted power without detection), beam interference (active — transmit RF that degrades received power), physical obstruction (place absorbing material in beam path).

**PAI-2: Localization signal medium.** The UWB localization signal environment. Accessible to any attacker with UWB transmission capability within localization range. Enables: position spoofing, replay attacks on localization signals, localization jamming.

**PAI-3: Physical node access.** Direct physical access to a deployed node. Accessible to any attacker who can physically reach a node. Enables: hardware modification, credential extraction, firmware replacement, physical destruction.

**PAI-4: Supercapacitor and harvest circuitry.** The energy storage and harvest subsystems accessible through physical proximity. Enables: power injection (force a node to false charge state), power drain (force a node to depletion), harvest signal manipulation.

### 3.2 Network Attack Interfaces

**NAI-1: Mesh control plane.** The LINK_STATE_UPDATE, NODE_ANNOUNCE, and routing protocol messages that maintain the mesh topology. Accessible to any node participating in the mesh, authenticated or not (before authentication is enforced). Enables: topology poisoning, routing table manipulation, false node announcements.

**NAI-2: EBF message channel.** The Energy Burst Frame messages carrying delivery instructions and confirmations. Accessible to any node in the communication range of transmitting nodes. Enables: EBF replay, EBF modification, false delivery confirmations.

**NAI-3: Delivery confirmation channel.** The telemetry messages from receiving nodes confirming energy receipt. Accessible to any node within communication range. Enables: false received-power claims, false spatial accuracy claims.

**NAI-4: EDNS and inter-mesh routing.** At Energy Internet scale: the EDNS resolution infrastructure and EBGP routing advertisements. Accessible to any participant in the inter-mesh routing system. Enables: EDNS poisoning (route energy requests to wrong EAS), EBGP hijacking (advertise routes to destinations the attacker doesn't control).

### 3.3 Identity Attack Interfaces

**IAI-1: Node identity credentials.** The cryptographic credentials that establish node identity in the Trust Layer PKI. Accessible to an attacker who can compromise the provisioning process or extract credentials from a deployed node. Enables: node impersonation, credential replay.

**IAI-2: Trust Layer PKI infrastructure.** The certificate authority infrastructure that signs node credentials. Accessible to a sophisticated attacker who can compromise CA infrastructure. Enables: fraudulent credential issuance, certificate chain forgery.

**IAI-3: Provisioning process.** The process by which new nodes receive their identity credentials. Accessible to an attacker who can intercept or hijack provisioning. Enables: identity substitution during provisioning, credential interception.

---

## 4. The Eleven Threat Categories

From the attack surface definition in Section 3, I derive eleven threat categories by enumerating the distinct attack objectives and the attack interfaces through which each can be pursued. A threat category is a class of attacks sharing the same objective — the specific attack technique may vary, but the defense must cover the objective class.

### 4.1 T1 — Localization Spoofing

**Objective:** Cause the routing system to believe a node is at a false position, resulting in beam misdirection.

**Attack interfaces:** PAI-2 (localization signal medium), NAI-2 (EBF position fields).

**Attack vectors:**
- *T1a — UWB signal forgery:* Transmit false UWB ranging signals that cause the localization system to compute a false position for a target node. Requires UWB transmission capability within localization range.
- *T1b — Position field injection:* Modify the position field in EBF messages (NAI-2) to report false position data to the routing system.
- *T1c — Replay attack:* Capture and replay a legitimate node's localization signals from a different physical position, causing the system to compute a false location based on authentic signals.

**Worst-case consequence:** Beam directed at a biological target at the spoofed position. Physical injury.

**Guardian Security response:** See Section 5.3 (T1 defenses).

### 4.2 T2 — Routing Table Manipulation

**Objective:** Corrupt the mesh routing table to redirect energy flows through attacker-controlled nodes or to unintended destinations.

**Attack interfaces:** NAI-1 (mesh control plane).

**Attack vectors:**
- *T2a — False LINK_STATE_UPDATE injection:* Transmit false link-state updates advertising nonexistent links or false link quality metrics, causing routing algorithms to select attacker-preferred paths.
- *T2b — Route withdrawal attack:* Transmit false link-state updates withdrawing legitimate routes, forcing traffic through attacker-controlled alternatives.
- *T2c — Metric manipulation:* Modify link quality metrics to make attacker-controlled paths appear preferred over legitimate paths.

**Worst-case consequence:** All energy traffic routed through attacker-controlled nodes, enabling interception, denial, or misdirection of all delivered energy.

### 4.3 T3 — Beam Hijacking

**Objective:** Redirect an authorized beam from its intended target to an attacker-controlled receiver.

**Attack interfaces:** PAI-1 (RF medium), NAI-2 (EBF messages), IAI-1 (credentials).

**Attack vectors:**
- *T3a — Relay impersonation:* Compromise a relay node position in a multi-hop path and redirect the beam at that hop rather than forwarding it.
- *T3b — BeamCommand injection:* Inject false BeamCommand messages that override the legitimate steering parameters before MTL executes them.
- *T3c — Path substitution:* Using a compromised routing table (T2), route the beam through an attacker-controlled relay that performs mid-path redirection.

**Worst-case consequence:** High-priority device (medical monitor, emergency communication) denied energy while attacker device receives it.

### 4.4 T4 — Denial-of-Power Attack

**Objective:** Starve legitimate devices of energy by exhausting routing capacity, depleting source nodes, or blocking delivery paths.

**Attack interfaces:** NAI-1, NAI-2, PAI-1.

**Attack vectors:**
- *T4a — Request flooding:* Generate high volumes of synthetic energy requests that saturate the mesh's routing computation capacity. Legitimate requests are delayed or dropped.
- *T4b — Source depletion:* Cause source nodes to repeatedly transmit energy to false destinations (exploiting T3 or T1), depleting their supercapacitors and leaving the mesh without energy to route.
- *T4c — Path blocking:* Physically obstruct beam paths or use RF jamming to degrade link quality until routing fails to find viable paths.

**Worst-case consequence:** Simultaneous power loss to all devices in the mesh during an emergency condition.

### 4.5 T5 — Node Impersonation

**Objective:** Deploy a device that successfully claims a legitimate node's identity, receiving its energy allocation and potentially serving as a relay the attacker controls.

**Attack interfaces:** IAI-1 (credentials), NAI-1 (NODE_ANNOUNCE).

**Attack vectors:**
- *T5a — Credential cloning:* Extract a legitimate node's cryptographic credentials (via PAI-3 physical access) and deploy a second device using those credentials.
- *T5b — Credential replay:* Capture credential exchange messages and replay them from a different device.
- *T5c — Provisioning interception:* Intercept credentials during the provisioning process (IAI-3) before they are securely stored on the legitimate device.

**Worst-case consequence:** Legitimate device denied its energy allocation; attacker device serving as a controllable relay inside the trusted mesh.

### 4.6 T6 — Delivery Confirmation Falsification

**Objective:** Deceive the routing system about whether energy was successfully delivered, enabling false accounting, route selection corruption, and ETCP session manipulation.

**Attack interfaces:** NAI-3 (delivery confirmation channel).

**Attack vectors:**
- *T6a — False positive confirmation:* Transmit a delivery confirmation claiming successful receipt when no energy was received. Causes the routing system to believe delivery succeeded and move on to the next burst, leaving the intended recipient with no energy.
- *T6b — False negative confirmation:* Transmit a delivery failure message when energy was successfully received. Triggers SHDCL recovery and unnecessary retransmission, depleting source nodes.
- *T6c — Power level falsification:* Report a false received power level. Causes MFE to misadjust burst power levels — either under-delivering (slow starvation) or over-delivering (wasted energy and potential component damage).

**Worst-case consequence:** Systematic false accounting across all deliveries, creating a gap between the routing system's model of the mesh state and physical reality.

### 4.7 T7 — Timing Attacks

**Objective:** Disrupt TDMA scheduling to cause simultaneous transmissions (collision), scheduling gaps (denial), or predictable transmission windows (enabling interception).

**Attack interfaces:** NAI-1, NAI-2.

**Attack vectors:**
- *T7a — TDMA schedule manipulation:* Inject false scheduling information that causes two nodes to transmit simultaneously, corrupting delivery for both.
- *T7b — Clock desynchronization:* Introduce timing errors in network time synchronization, causing scheduling drift that eventually produces collisions.
- *T7c — Transmission window prediction:* Exploit deterministic TDMA scheduling to predict exactly when a given node will transmit, enabling targeted interception or jamming at that moment.

**Worst-case consequence:** Systematic collision of all high-priority transmissions, effectively implementing a denial-of-power attack through timing manipulation.

### 4.8 T8 — Physical Node Compromise

**Objective:** Gain control of a deployed node through physical access, enabling all attacks from a trusted insider position.

**Attack interfaces:** PAI-3 (physical node access).

**Attack vectors:**
- *T8a — Credential extraction:* Extract cryptographic keys from secure storage on a captured node and deploy a cloned device (feeds T5).
- *T8b — Firmware replacement:* Replace legitimate firmware with attacker-controlled firmware that executes attacker instructions while appearing legitimate.
- *T8c — Hardware backdoor installation:* Modify node hardware to include a covert communication channel or power draw that is not visible to the software layer.

**Worst-case consequence:** Full insider access to the mesh, with trust-level credentials and physical mesh participation, enabling all other attacks with legitimate authentication.

### 4.9 T9 — Energy Credit Fraud (Energy Internet Scale)

**Objective:** Manipulate the energy credit settlement system to receive energy without paying for it or to receive payment for energy not delivered.

**Attack interfaces:** NAI-2 (EBF confirmation records used for settlement), IAI-2 (PKI infrastructure used for settlement signatures).

**Attack vectors:**
- *T9a — Confirmation record falsification:* Generate false EBF confirmation records that overstate delivered energy, enabling fraudulent claims for energy credit reimbursement.
- *T9b — Settlement signature forgery:* Forge the signature on energy credit transfer records, enabling unauthorized credit transfers.
- *T9c — Replay of settlement records:* Replay legitimate settlement records from prior periods to claim credits multiple times for the same delivered energy.

**Worst-case consequence:** Financial fraud at Energy Internet scale; systematic undercharging for energy that discourages legitimate ESP participation.

### 4.10 T10 — EBGP Route Hijacking (Energy Internet Scale)

**Objective:** Announce false EBGP routes that redirect energy traffic from its intended EAS to an attacker-controlled EAS.

**Attack interfaces:** NAI-4 (inter-mesh routing).

**Attack vectors:**
- *T10a — Prefix hijacking:* Announce an EBGP route for an EIP address prefix that the attacker does not control, causing remote source nodes to route energy toward the attacker's EAS rather than the legitimate destination.
- *T10b — AS path manipulation:* Manipulate AS path attributes to make attacker-controlled routes appear shorter or more preferred than legitimate routes.
- *T10c — Route withdrawal:* Withdraw legitimate EBGP routes to isolate an EAS from the wider Energy Internet, effectively implementing a denial-of-power attack at internet scale.

**Worst-case consequence:** All energy traffic destined for a legitimate EAS redirected to an attacker-controlled EAS, enabling large-scale energy theft or denial.

### 4.11 T11 — Safety System Bypass

**Objective:** Disable or circumvent the Biological Safety Layer, enabling beam transmission in conditions where BSL would normally prevent it.

**Attack interfaces:** PAI-3 (physical access to BSL sensor hardware), NAI-2 (safety status flags in EBF headers).

**Attack vectors:**
- *T11a — Sensor spoofing:* Feed false data to the biological presence detection sensors (radar, thermal, optical), causing BSL to not detect a biological target in the exclusion zone.
- *T11b — Safety flag manipulation:* Modify the safety_flags field in EBF headers to falsely report that all safety conditions are met.
- *T11c — Software gate bypass:* Exploit a vulnerability in the software implementation of the five-condition MTL gate to issue a BeamCommand that bypasses one or more gate conditions.

**Worst-case consequence:** Beam transmission directed at a biological target with no safety mitigation. This is the highest severity threat in the taxonomy.

---

## 5. The Guardian Security Framework

Guardian Security (energy-domain designation: Guardian-E; commercial product domain: TrustShield.tech) is the security enforcement layer of the Meridian architecture. It operates as a two-tier system: the innate tier provides immediate, non-specific response to anomalous conditions; the adaptive tier provides learned, specific response to classified threat patterns.

### 5.1 Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│           Guardian Security Framework                │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │          Adaptive Tier (Guardian-E)          │    │
│  │  • Threat classifier (T1–T11 mapping)        │    │
│  │  • Learned threat patterns (11 categories)   │    │
│  │  • Node quarantine and isolation             │    │
│  │  • Certificate chain audit                  │    │
│  │  • ERPKI route origin validation (inter-mesh)│    │
│  └────────────────────┬────────────────────────┘    │
│                       │                              │
│  ┌────────────────────▼────────────────────────┐    │
│  │          Innate Tier (SHDCL)                 │    │
│  │  • Immediate anomaly detection (13.7ms)      │    │
│  │  • Process recovery without classification   │    │
│  │  • Beam hold on unresolved anomaly           │    │
│  │  • Escalation to adaptive tier               │    │
│  └────────────────────┬────────────────────────┘    │
│                       │                              │
│  ┌────────────────────▼────────────────────────┐    │
│  │       Physical Safety Layer (BSL)            │    │
│  │  • Hardware-enforced beam cutoff             │    │
│  │  • Independent of software gate status       │    │
│  │  • Biological presence detection             │    │
│  │  • Cannot be bypassed by software attack     │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

The three-tier architecture provides defense in depth. No single tier is a single point of failure. If the adaptive tier fails to classify a threat, the innate tier holds the beam. If the innate tier is compromised, the BSL provides hardware-level enforcement. If the BSL sensor is spoofed (T11a), the adaptive tier's sensor integrity monitoring detects the anomaly. Defense in depth means that an attacker must compromise multiple independent tiers simultaneously to achieve physical harm.

### 5.2 Pre-Transmission Authentication Protocol

Before any beam authorization is issued, Guardian Security enforces a four-step pre-transmission authentication protocol:

**Step 1 — Node identity verification.** The requesting node presents its Trust Layer PKI credential. Guardian-E verifies the signature chain from the credential to the Trust Layer root CA. If verification fails: request rejected, anomaly logged, node flagged as UNVERIFIED.

**Step 2 — Capability authorization check.** Guardian-E verifies that the requesting node's capability profile (encoded in its identity credential) includes the requested operation type, power level, and target zone. If the capability profile does not authorize the request: request rejected, anomaly logged.

**Step 3 — Route integrity check.** Guardian-E verifies that the proposed routing path through the mesh consists entirely of verified, non-quarantined nodes, and that the path's safety envelope is within bounds for the requested delivery parameters. If any relay node in the path is UNVERIFIED or QUARANTINED: path rejected, alternate path computation requested.

**Step 4 — Temporal consistency check.** Guardian-E verifies that the request's timestamp is within the acceptable window (±2 TDMA slots of network time), that the requesting node's last confirmed transaction matches the routing system's record, and that no anomalous request rate is detected from this node. If consistency check fails: request held for review, node flagged for anomaly investigation.

Only after all four steps pass does Guardian-E issue beam authorization to the Lume-X control loop, which then validates the five MTL gate conditions before issuing the BeamCommand. The security check (Guardian-E) and the safety check (MTL gate) are independent — both must pass.

### 5.3 Defenses Against Each Threat Category

**T1 — Localization Spoofing:**
Guardian-E enforces multi-source localization consistency: position reported by UWB localization must be consistent with position inferred from signal strength, TDMA timing, and mesh topology (neighbor node distances). A position report that is inconsistent across these sources is flagged as a potential T1 attack, the node is placed in POSITION_UNVERIFIED status, and no beam is authorized until consistency is restored. Threshold: if position variance across sources exceeds r_threshold (50 cm) for three consecutive measurements, the node is QUARANTINED. The BSL exclusion zone provides the ultimate backstop: even if localization is spoofed, biological presence detection prevents beam transmission at the spoofed location if a biological target is actually there.

**T2 — Routing Table Manipulation:**
All LINK_STATE_UPDATE messages are signed by the originating node using its Trust Layer PKI credential. Receiving nodes verify the signature before applying the update. Guardian-E applies consistency checks to all routing updates: a link quality metric that changes by more than Δq_max in one update cycle without a corresponding physical event (node failure, localization loss) is flagged. Route selection is rate-limited: no node's routes can be completely replaced within a single control cycle. This prevents sudden, large-scale routing table corruption.

**T3 — Beam Hijacking:**
Guardian-E tracks the expected position of the beam target throughout the delivery session. If the target's position deviates from the expected trajectory by more than the adaptive position model allows, the session is suspended and the node is flagged. Relay nodes in a multi-hop path are required to confirm receipt and forward within their TDMA window — a relay that receives but does not forward (potential redirection) is detected by the downstream node's missing receipt confirmation within T_relay_max.

**T4 — Denial-of-Power:**
Guardian-E applies per-node and per-EAS request rate limits. A node generating more than N_max requests per control cycle is flagged and rate-limited. A node whose requests consistently fail (false destinations, invalid capability claims) is quarantined after K_max consecutive failures. CRITICAL-priority sessions are protected from rate-limiting and receive dedicated capacity reservation that cannot be displaced by NORMAL or BACKGROUND traffic — even under attack.

**T5 — Node Impersonation:**
Guardian-E enforces one-credential-one-node: a credential that is simultaneously reported as active from two different physical positions is immediately flagged as a T5 attack. Both instances are quarantined pending investigation. Since credentials are bound to physical hardware characteristics at provisioning (secure element measurements, power draw profile), a cloned credential on different hardware will exhibit a different hardware profile and fail the capability consistency check.

**T6 — Delivery Confirmation Falsification:**
Guardian-E cross-validates delivery confirmations against the mesh's physics model. A node reporting P_received higher than P_transmitted × maximum_path_efficiency is flagged — energy cannot be amplified in transit. A node that consistently reports successful delivery while the intended device's charge state (reported separately) does not increase is flagged. All confirmation messages are signed by the confirming node; unsigned or incorrectly signed confirmations are rejected.

**T7 — Timing Attacks:**
TDMA schedule assignments are cryptographically sealed by Guardian-E at each scheduling epoch: the schedule for the next N epochs is signed and distributed to all nodes. A node that transmits outside its assigned window is detected by all nodes that receive the out-of-window transmission and reported to Guardian-E. Clock synchronization is protected by signed time-sync messages with a maximum accepted drift of ±T_drift. A node that attempts to desynchronize the network clock by broadcasting false time is detected by majority-consensus cross-checking.

**T8 — Physical Node Compromise:**
Guardian-E cannot prevent physical compromise but limits its blast radius. Credentials are stored in secure elements with anti-tamper protection. A credential that is extracted and used on a different hardware platform fails the hardware-profile consistency check (T5 defense). A node exhibiting anomalous behavior after a maintenance event (unusual request rates, unexpected routing changes, new neighbor relationships) is flagged for investigation. Firmware integrity is verified at boot using a signed firmware hash — a node with modified firmware fails the boot integrity check and does not receive credentials.

**T9 — Energy Credit Fraud:**
All EBF confirmation records used for settlement are signed by both the delivering node and the receiving node. A settlement claim without dual signatures is rejected. Settlement records include a reference to the specific EBF sequence numbers being settled — replay of prior settlement records is detected by duplicate sequence number checking. ERPKI validates the signing authority of all settlement records.

**T10 — EBGP Route Hijacking:**
ERPKI validates all EBGP route origins: an EAS cannot announce a route for an EIP prefix it was not delegated by the EIRA. Route announcements without valid ERPKI attestation are rejected. AS path manipulation is detected by cross-referencing EBGP updates against the known topology — an AS path that claims to traverse an EAS that has no established peering relationship with the adjacent AS is flagged.

**T11 — Safety System Bypass:**
The BSL is hardware-enforced: the beam cutoff circuit operates independently of the software gate and cannot be disabled by a software attack. Sensor integrity is monitored by cross-validating biological presence detection across multiple sensor modalities (radar, thermal, optical, ultrasonic). A sensor that is physically blocked or tampered with produces an anomalous reading pattern (all-clear when other sensors indicate uncertainty) and triggers a SENSOR_INTEGRITY_FAILURE event, which forces beam hold until the sensor is inspected. The five-condition MTL gate is implemented in firmware with a hardware watchdog — a gate bypass attempt that corrupts gate state triggers a watchdog reset and beam hold.

---

## 6. Formal Security Properties and Coverage Proof

### 6.1 Security Properties

Guardian Security is designed to satisfy four formal security properties:

**Authenticity:** Every participant N in a Guardian Security-protected mesh can be verified as the entity it claims to be. Formally: ∀N, ∀interactions I(N, *): Guardian-E verifies PKI_cert(N) before I is permitted. A participant that cannot be verified is not permitted to interact.

**Integrity:** No resource flow is modified in transit without detection. Formally: for any delivered burst B from source s to destination d, if P_received(d) ≠ P_transmitted(s) × path_efficiency(s,d) within the tolerance ±ε_phys (physical measurement uncertainty), Guardian-E flags the discrepancy within one control cycle.

**Availability:** The mesh continues delivering energy at bounded degraded service under attack. Formally: under any attack that does not involve physical destruction of nodes or physical access to BSL hardware, at least all CRITICAL-priority sessions continue at P_min for the duration of the attack. NORMAL and BACKGROUND sessions may be suspended.

**Non-repudiation:** Every resource delivery event is attributable to a specific authenticated participant. Formally: for every EBF delivery, the certificate chain contains signed records from the authorizing source node, all relay nodes, and the receiving node, with timestamps, power measurements, and authentication proofs. No participant can deny participation in a delivery event without forging signatures that would be detected by Guardian-E.

### 6.2 Coverage Proof

I prove coverage by attack path enumeration: for every threat category T1–T11, I show that achieving the attack objective requires traversing at least one Guardian Security enforcement boundary.

| Threat | Attack Objective | Guardian-E Enforcement Boundary Crossed |
|---|---|---|
| T1 | Beam misdirection via false position | Multi-source position consistency check (Step 1 of beam authorization) |
| T2 | Routing table corruption | Signed routing update verification; rate-limited route replacement |
| T3 | Beam redirected to attacker | Trajectory consistency monitoring; relay forwarding timeout detection |
| T4 | Legitimate devices denied energy | Per-node rate limits; CRITICAL priority reservation |
| T5 | Attacker device receives legitimate allocation | One-credential-one-node enforcement; hardware profile consistency |
| T6 | False delivery accounting | Physics-model cross-validation; dual-signature requirement |
| T7 | Transmission collision or denial | Signed TDMA schedule; out-of-window detection; clock sync protection |
| T8 | Insider access via physical compromise | Blast radius limitation; firmware integrity check; hardware profile binding |
| T9 | Energy credit fraud | Dual-signature settlement; ERPKI attestation; sequence number dedup |
| T10 | EBGP route hijacking | ERPKI prefix validation; topology cross-reference |
| T11 | Safety system disabled | Hardware-enforced BSL; multi-modal sensor cross-validation; watchdog |

For T11 specifically, I note that the coverage guarantee has a physical limit: an attacker with physical access to the BSL hardware circuitry who can sever the hardware cutoff connection cannot be stopped by software means. This is the residual risk acknowledged in Section 11 (Limitations). The defense against T11 physical hardware attack is physical security of node deployment locations, not Guardian Security.

---

## 7. Guardian Security at Energy Internet Scale

The Energy Internet [Energy Internet, 2026] introduces three new threat surfaces beyond the single-mesh Meridian architecture: the inter-mesh EBGP routing infrastructure, the EDNS resolution infrastructure, and the energy credit settlement system. Sections 4.9–4.11 addressed the associated threat categories (T9–T11). This section specifies the Guardian Security extensions for internet-scale operation.

### 7.1 Three-Level Architecture

Guardian Security operates at three levels in the Energy Internet [Energy Internet, 2026 §7.2]:

**Level 1 — Intra-mesh security.** The single-mesh Guardian Security implementation specified in Sections 5 and 6. Unchanged from the single-mesh architecture.

**Level 2 — Inter-mesh security (Energy TLS).** Every EBGP peering session between gateway nodes is authenticated using EAS-level PKI managed through the Trust Layer. EBGP route updates are signed by the originating gateway; receiving gateways verify the signature and the ERPKI prefix authorization before accepting and propagating routes. The session uses forward-secret key exchange (ephemeral Diffie-Hellman over curves approved by the Trust Layer governance framework) so that compromise of a long-term key does not expose past session traffic.

**Level 3 — Registry security (EIRA-level).** All EIRA operations — EAS Number assignment, EIP prefix delegation, Emergency Authority Credential issuance — are signed by the EIRA root credential and published in a transparency log. Any Energy Internet participant can verify any EIRA action independently. A fraudulent EIRA action is detectable by any participant within one log publication cycle.

### 7.2 ERPKI Implementation

Energy Resource Public Key Infrastructure (ERPKI) provides route origin validation for EBGP. The implementation follows the structure of RPKI for data internet BGP [RFC 6480]:

1. The EIRA maintains the ERPKI root and delegates EAS-level signing authorities to each EAS operator.
2. Each EAS operator issues Route Origin Authorizations (ROAs) for the EIP prefixes it is delegated, signed by its EIRA-delegated EAS-level authority.
3. ENL routers validate EBGP route origins against the ERPKI repository. A route origin that does not have a valid ROA is flagged as INVALID and rejected.
4. The ERPKI repository is published as a distributed, signed database with full history — allowing retroactive detection of fraudulent ROA issuance.

### 7.3 Emergency Authority Credential Security

Emergency Authority Credentials (EAC) enable Emergency Priority Override (EPO) — the mechanism that reallocates all mesh capacity to CRITICAL sessions during emergencies [Energy Internet, 2026 §6.4]. The security of EAC is critical: a compromised EAC enables a denial-of-service attack against all NORMAL and BACKGROUND sessions network-wide.

EAC security measures:
- EAC private keys are stored in hardware security modules (HSMs) that require multi-party authorization for key use (M-of-N threshold signing)
- EPO commands must include a valid timestamp within ±60 seconds of network time (prevents replay)
- Each EAC has a maximum EPO duration — commands that don't include a finite duration are rejected
- EPO commands are logged in the certificate chain and are publicly auditable
- EIRA can revoke any EAC within one propagation cycle if compromise is detected

---

## 8. The Biological Safety Layer as Physical Security Invariant

### 8.1 The BSL as the Security Invariant of Last Resort

Guardian Security is a software and protocol framework. A sufficiently sophisticated attacker who can compromise the software stack — through physical node access (T8), firmware replacement, or an undetected vulnerability — may be able to bypass Guardian Security's protocol-level defenses.

The Biological Safety Layer (BSL) is the security mechanism that operates below the software stack. It is implemented in hardware circuitry that is independent of the node's microcontroller, firmware, and software gate logic. The BSL's biological presence detection and beam cutoff circuit operates whether the software is running correctly, is crashed, is compromised, or has been replaced.

Formally, the BSL enforces a physical security invariant:

```
BSL_invariant: ∀t, ∀positions p:
  biological_presence(p, t) = TRUE →
  beam_active_at(p, t) = FALSE
```

This invariant is enforced by hardware physics, not by software logic. It is the security invariant of last resort — the property that holds even when every other security mechanism has failed.

### 8.2 BSL Tamper Resistance

For the BSL_invariant to be a genuine security guarantee, the BSL hardware must be tamper-resistant. The BSL implementation specifies:

- **Sensor diversity:** Biological presence detection uses at least two independent sensor modalities (e.g., radar + thermal). An attacker who blocks one sensor modality does not defeat detection.
- **Anomalous-absence detection:** Sensors that go offline or produce anomalous "all-clear" readings when other sensors are uncertain trigger a SENSOR_INTEGRITY_FAILURE event that forces beam hold. The absence of a sensor signal is treated as a safety hazard, not as permission to transmit.
- **Hardware cutoff independence:** The beam cutoff circuit receives power and control signals independent of the main microcontroller. A crashed or compromised MCU does not disable the cutoff.
- **Tamper evidence:** The BSL housing includes tamper-evident sealing. A node whose BSL housing has been opened fails the physical inspection at maintenance intervals.

### 8.3 The Residual Risk Statement

No security system provides zero residual risk. The BSL's residual risk is a T11c attack: an attacker with sustained physical access who surgically modifies the BSL hardware circuitry itself — bypassing the sensor, severing the cutoff circuit, or replacing the BSL hardware with a dummy that always reports safe. This attack requires:

- Physical access to a deployed node
- Technical knowledge of the specific BSL circuit implementation
- Time to perform hardware modification without detection
- Tolerance for the fact that the modification will be detected at the next physical inspection

This residual risk is accepted as the irreducible physical security baseline. Mitigations include: physical security of node deployment locations, tamper-evident sealing with regular inspection, and geofenced monitoring that alerts when a node's physical position changes unexpectedly.

---

## 9. Operational Security: Deployment and Audit

### 9.1 Secure Provisioning

Node provisioning is the process by which a new node receives its Trust Layer identity credential. It is the most security-sensitive phase of a node's lifecycle, because a credential issued at provisioning cannot be recalled without revocation, and revocation has a propagation latency.

Guardian Security specifies a five-step secure provisioning process:

1. **Factory key injection:** The node's Trust Layer public/private key pair is generated in the factory inside a hardware security module. The private key never leaves the HSM — it is injected directly into the node's secure element without passing through any host system.

2. **Identity credential signing:** The factory generates a Certificate Signing Request using the node's public key and the node's identity parameters (Node_Type, EAS assignment, Zone ID, capability profile). The CSR is submitted to the Trust Layer PKI for signing.

3. **Hardware profile binding:** The Trust Layer credential includes a hardware profile hash — a signed measurement of the node's hardware characteristics (power draw profile, timing characteristics, secure element measurements). A credential used on different hardware will fail the hardware profile consistency check.

4. **Provisioning receipt:** The provisioned node signs a provisioning receipt confirming that it successfully received and stored its credential. The receipt is logged in the certificate chain.

5. **First-contact verification:** On first network contact, the node presents its credential and the provisioning receipt. Guardian-E verifies both before accepting the node as VERIFIED. A node that cannot present a valid provisioning receipt is not accepted into the mesh.

### 9.2 The Certificate Chain as Audit Substrate

Every Guardian Security event — authentication, authorization, anomaly detection, quarantine, restoration — is logged in the certificate chain with a signed entry from the Lume-X control loop. The certificate chain is:

- **Append-only:** Entries cannot be deleted or modified once written
- **Signed:** Each entry is signed by the Lume-X runtime using the node's Trust Layer credential
- **Timestamped:** Each entry includes a network timestamp verifiable against the distributed time consensus
- **Cross-referenced:** Each entry references the EBF sequence numbers and session IDs of the transactions it relates to

This produces a complete, auditable history of every security event in the mesh. For regulatory compliance (safety certification of wireless power systems), insurance liability attribution, and forensic investigation following an incident, the certificate chain provides the definitive record.

### 9.3 Incident Response Protocol

When Guardian-E detects a suspected attack, the incident response protocol is:

1. **Immediate containment:** The suspect node or path is QUARANTINED within one control cycle. No traffic is routed through the quarantined node or path until the quarantine is lifted.

2. **Evidence preservation:** All certificate chain entries related to the suspect node's recent activity are cryptographically sealed (signed with a timestamp by the Lume-X runtime) to prevent tampering.

3. **Affected session recovery:** All sessions that were routing through the quarantined node are rerouted through verified alternate paths. CRITICAL sessions receive priority in rerouting.

4. **Threat classification:** Guardian-E classifies the detected anomaly against the T1–T11 taxonomy and logs the classification in the certificate chain.

5. **Administrator notification:** A signed alert is transmitted to the designated administrator endpoint (the EaaS account holder or the EAS operator) specifying the quarantined node, the threat classification, and the evidence preserved.

6. **Quarantine review:** The administrator reviews the evidence and either lifts the quarantine (after verifying the node is not compromised) or initiates physical inspection and credential revocation.

---

## 10. Related Work

### 10.1 Wireless Network Security

The wireless data network security literature is extensive and directly relevant to the protocol-layer defenses in Guardian Security. IEEE 802.11i (WPA2/3) [35] provides the reference architecture for wireless network authentication and key management. The 5G security architecture [36] provides the reference for subscriber identity management and authentication at scale. Guardian Security's pre-transmission authentication protocol draws on both, adapted for the energy delivery context where the "data" being protected is joules rather than bits.

The critical distinction is that wireless network security assumes a stable separation between the control plane (authentication, key management) and the data plane (packet delivery). Guardian Security operates in an environment where the control plane measurement (delivery confirmation, localization) is also a physical measurement of the data plane output. This coupling is the source of T6 (delivery confirmation falsification) and T1 (localization spoofing), which have no analog in wireless data network security.

### 10.2 Industrial Control System Security

ICS security [37, 38] addresses security for systems where cyber-physical coupling creates physical consequences for security failures — exactly the challenge Guardian Security addresses. The MITRE ATT&CK for ICS framework [39] provides a structured taxonomy of attacks against industrial control systems that informed the development of the T1–T11 threat taxonomy. The Stuxnet case [40] is the canonical demonstration that cyber attacks on physical control systems can produce physical damage — the exact threat class that Guardian Security's BSL invariant is designed to make impossible.

The key distinction from ICS security is that Guardian Security operates on a wireless, distributed, autonomously administered mesh rather than a fixed, wired, centrally administered control network. ICS security assumes network perimeter control — the control network is air-gapped or firewalled. Guardian Security cannot assume perimeter control because the RF transmission medium is inherently accessible to any attacker within range.

### 10.3 Physical Layer Security

Physical layer security research [41, 42] exploits the physical properties of wireless channels — multipath characteristics, spatial diversity, channel reciprocity — to provide security guarantees that cannot be bypassed by higher-layer attacks. This approach is complementary to Guardian Security's protocol-layer defenses.

The localization integrity verification in Guardian Security (multi-source position consistency checking) draws on physical layer security principles: the physical channel characteristics (path length, multipath profile, angle of arrival) are independent measurements that a position spoof must be consistent with. Spoofing a UWB localization signal while maintaining consistency with RF received signal strength, angle-of-arrival measurements, and mesh neighbor distance data simultaneously is significantly harder than spoofing any single measurement.

### 10.4 The Lume Ecosystem Security Framework

The Trust Layer [16] provides the identity foundation that Guardian Security builds on. Guardian (the general, non-domain-specific security enforcement product) provides the general threat classification and adaptive response framework. Guardian-E is the energy-domain specialization that adds the physical-layer defenses (BSL integration, localization integrity, power measurement validation) that are specific to the energy routing context.

Guardian Security is the first published formal specification of a Guardian deployment in a physical domain. The security architecture defined in this paper is the reference for future Guardian deployments in the transportation (DMI), manufacturing (DPI), and ambient computation (DII) domains described in [DI Theory, 2026].

---

## 11. Limitations and Honest Boundaries

**The threat taxonomy covers the current architecture, not all future attacks.** The T1–T11 taxonomy is derived from the attack surface of the current Meridian architecture. Novel attack techniques not anticipated in this analysis may find gaps. The ERFC process for Guardian Security standards updates (Appendix B) includes a vulnerability disclosure process and a taxonomy update mechanism for new threat categories.

**Physical node compromise (T8) has limited software-layer defenses.** An attacker with sustained physical access to a node and sufficient technical knowledge can defeat the BSL hardware safeguards. This is the irreducible residual risk of any physically deployed system. The assumption of physical security for high-value nodes (source nodes, gateway nodes, CRITICAL-priority relay nodes) is a prerequisite for the Guardian Security guarantees.

**Coverage proof assumes correct implementation.** The coverage proof in Section 6.2 demonstrates that every attack path crosses at least one Guardian Security enforcement boundary. It does not prove that the implementation of those boundaries is correct. Implementation vulnerabilities — software bugs, cryptographic errors, side-channel attacks on secure elements — can create gaps in coverage that are not present in the specification. Lume-V formal verification [18] of the Guardian Security implementation is the mitigation; it has not yet been completed for all components.

**Multi-party compromise is not addressed.** The Guardian Security framework assumes that the Trust Layer PKI root is not compromised. A compromise of the Trust Layer root credential — enabling issuance of fraudulent credentials for any identity — would defeat every cryptographic defense in Guardian Security simultaneously. This is the Tier 1 existential threat to any PKI-based system and requires organizational security controls beyond the scope of this technical paper.

**No experimental validation exists.** Guardian Security has been formally specified but not deployed in a physical mesh. The timing guarantees (anomaly detection within 13.7 ms, quarantine within one control cycle), the physical layer consistency checks (position variance threshold, power measurement cross-validation), and the BSL sensor integration have not been validated in hardware. All quantitative claims are based on architectural analysis of the Meridian specification.

---

## 12. Conclusion

Wireless energy routing is not a data routing problem with a different payload. It is a fundamentally different security domain — one where successful attacks produce physical consequences, where the control plane is coupled to physical measurements, and where identity must be verified before the first joule flows rather than after the first packet arrives.

No formal security framework for this domain previously existed. This paper provides one.

The Guardian Security framework — two-tier innate-plus-adaptive defense, pre-transmission authentication, eleven-category threat coverage, BSL physical invariant, and certificate chain audit — addresses the complete attack surface of a deterministic wireless energy routing system. It provides four formal security guarantees: authenticity, integrity, availability, and non-repudiation. The coverage proof demonstrates that every attack path requires traversal of at least one enforcement boundary.

The most important security property of the Guardian Security framework is the one that cannot be improved through protocol design: the Biological Safety Layer invariant. The BSL guarantees that no beam strikes a biological target regardless of the state of every software and protocol defense. This guarantee is the irreducible physical security baseline of wireless energy routing — the property that makes the difference between a security failure that damages data and a security failure that damages people.

Guardian Security is a formal specification. It requires experimental validation, implementation in the Meridian architecture, and integration with the Trust Layer PKI infrastructure. Those steps are the work of the experimental phases defined in [Meridian Architecture, 2026]. This paper establishes the specification so that when the hardware exists, the security architecture is already defined.

The Energy Internet cannot be built without this foundation. A global wireless energy routing network with a complete absence of formal security architecture would be an infrastructure disaster — the energy equivalent of the early internet, where the absence of security design produced decades of vulnerability. Guardian Security is the security foundation that the Energy Internet needs to be built on, stated now, so that it is built in from the first deployment rather than retrofitted from the last breach.

---

## Appendix A — Complete Threat Taxonomy

| ID | Name | Attack Interface | Objective | Max Consequence | Guardian-E Tier |
|---|---|---|---|---|---|
| T1 | Localization Spoofing | PAI-2, NAI-2 | Beam misdirection | Physical injury | Adaptive + BSL |
| T2 | Routing Table Manipulation | NAI-1 | Traffic redirection | All traffic hijacked | Adaptive |
| T3 | Beam Hijacking | PAI-1, NAI-2, IAI-1 | Attacker receives authorized beam | Critical device denied power | Adaptive |
| T4 | Denial-of-Power | NAI-1, NAI-2, PAI-1 | Legitimate devices denied service | Simultaneous mesh blackout | Innate + Adaptive |
| T5 | Node Impersonation | IAI-1, NAI-1 | Attacker receives legitimate allocation | Mesh infiltration | Adaptive |
| T6 | Delivery Confirmation Falsification | NAI-3 | False accounting | Systematic model corruption | Adaptive |
| T7 | Timing Attacks | NAI-1, NAI-2 | Scheduling disruption | Effective denial-of-power | Innate + Adaptive |
| T8 | Physical Node Compromise | PAI-3 | Insider access | All attacks from trusted position | Adaptive (limited) |
| T9 | Energy Credit Fraud | NAI-2, IAI-2 | Financial fraud | Economic disruption of ESPs | Adaptive |
| T10 | EBGP Route Hijacking | NAI-4 | Internet-scale traffic redirection | EAS isolation or theft | Adaptive (L2) |
| T11 | Safety System Bypass | PAI-3, NAI-2 | BSL disabled | Physical injury (worst case) | BSL (hardware) |

---

## Appendix B — Guardian Security Rule Set (Summary)

| Rule ID | Description | Threat Covered | Enforcement Point |
|---|---|---|---|
| GS-R01 | All participants verify PKI credential before interaction | T5 | Pre-transmission auth Step 1 |
| GS-R02 | All routing updates require valid signature | T2 | NAI-1 input validation |
| GS-R03 | Position consistency check across ≥2 sources | T1 | Pre-transmission auth position check |
| GS-R04 | Delivery confirmation physics cross-validation | T6 | Post-delivery confirmation handler |
| GS-R05 | One-credential-one-position enforcement | T5 | NODE_ANNOUNCE handler |
| GS-R06 | Per-node request rate limiting | T4 | ENL request scheduler |
| GS-R07 | CRITICAL priority capacity reservation | T4 | ETL QoS enforcer |
| GS-R08 | Signed TDMA schedule distribution | T7 | Scheduling epoch handler |
| GS-R09 | Out-of-window transmission detection | T7 | ELL receive handler |
| GS-R10 | Relay forwarding timeout detection | T3 | DRMA relay monitor |
| GS-R11 | Trajectory consistency monitoring | T3 | Session state tracker |
| GS-R12 | Dual-signature settlement requirement | T9 | Settlement handler |
| GS-R13 | ERPKI route origin validation | T10 | EBGP UPDATE handler |
| GS-R14 | Hardware profile consistency check | T8 | Boot integrity verifier |
| GS-R15 | Multi-modal sensor cross-validation | T11 | BSL sensor fusion |
| GS-R16 | Sensor absence treated as safety hazard | T11 | BSL safety logic |
| GS-R17 | Hardware-enforced beam cutoff | T11 | BSL hardware circuit |

---

## Appendix C — Coverage Proof by Attack Path

For each threat T1–T11, the minimum set of Guardian Security rules that must be bypassed simultaneously to achieve the attack objective:

| Threat | Rules That Must Be Simultaneously Bypassed |
|---|---|
| T1 | GS-R03 AND GS-R15 AND GS-R16 AND GS-R17 |
| T2 | GS-R02 AND GS-R11 |
| T3 | GS-R01 AND GS-R10 AND GS-R11 |
| T4 | GS-R06 AND GS-R07 |
| T5 | GS-R01 AND GS-R05 AND GS-R14 |
| T6 | GS-R04 AND GS-R01 (confirmation signature) |
| T7 | GS-R08 AND GS-R09 |
| T8 | GS-R14 AND physical tamper evidence |
| T9 | GS-R12 AND GS-R13 AND sequence dedup |
| T10 | GS-R13 AND topology cross-reference |
| T11 | GS-R15 AND GS-R16 AND GS-R17 (hardware circuit) |

The minimum attack complexity for each threat is the AND of independent enforcement mechanisms. No single rule bypass suffices for any threat category.

---

## Appendix D — Guardian Security at Three Operational Levels

| Level | Scope | Authentication | Key Management | Threat Coverage |
|---|---|---|---|---|
| L1 — Intra-mesh | Single EAS | Per-node PKI credential | Trust Layer EAS-delegated CA | T1–T8, T11 |
| L2 — Inter-mesh | Multi-EAS, single EXP | EAS-level PKI credential | Trust Layer root-delegated EAS CA | T9–T10 + L1 |
| L3 — Registry | Global | EIRA root credential | EIRA HSM, M-of-N threshold signing | EIRA operation integrity |

---

## References

**Wireless Security:**

[35] IEEE 802.11i. (2004). *IEEE Standard for Information Technology — Wireless LAN Medium Access Control (MAC) and Physical Layer (PHY) Specifications: Security Enhancements.* IEEE.

[36] 3GPP TS 33.501. (2022). *Security Architecture and Procedures for 5G System.*

**Industrial Control System Security:**

[37] Stouffer, K., Falco, J., & Scarfone, K. (2011). *Guide to Industrial Control Systems (ICS) Security.* NIST SP 800-82.

[38] Langner, R. (2011). "Stuxnet: Dissecting a Cyberweapon." *IEEE Security and Privacy, 9*(3), 49–51.

[39] MITRE. (2020). *ATT&CK for Industrial Control Systems.* mitre.org/attackics

[40] Lindsay, J.R. (2013). "Stuxnet and the Limits of Cyber Warfare." *Security Studies, 22*(3), 365–404.

**Physical Layer Security:**

[41] Mukherjee, A. (2015). "Physical-Layer Security in the Internet of Things." *Proceedings of the IEEE, 103*(10), 1831–1843.

[42] Liu, Y., Chen, H.H., & Wang, L. (2017). "Physical Layer Security for Next Generation Wireless Networks." *IEEE Wireless Communications, 24*(6), 110–117.

**PKI and Certificate Infrastructure:**

[43] Cooper, D., et al. (2008). *Internet X.509 Public Key Infrastructure Certificate and CRL Profile.* RFC 5280. IETF.

[44] Lepinski, M., & Kent, S. (2012). *An Infrastructure to Support Secure Internet Routing.* RFC 6480. IETF. [RPKI]

[45] Bassham, L., et al. (2009). *Recommendation for the Selection of Public-Key Cryptographic Algorithms.* NIST SP 800-131A.

**Threat Modeling:**

[46] Shostack, A. (2014). *Threat Modeling: Designing for Security.* Wiley.

[47] Swiderski, F., & Snyder, W. (2004). *Threat Modeling.* Microsoft Press.

**Wireless Power and Energy Delivery:**

[48] Brown, W.C. (1984). "The History of Power Transmission by Radio Waves." *IEEE Transactions on Microwave Theory and Techniques, 32*(9), 1230–1242.

[49] Zhang, Z., et al. (2019). "Wireless Power Transfer — An Overview." *IEEE Transactions on Industrial Electronics, 66*(2), 1044–1058.

**Lume Ecosystem:**

[15] Andrews, J. (2026). *Lume Language Specification.* DOI: 10.5281/zenodo.19382282
[16] Andrews, J. (2026). *Trust Layer Ecosystem.* DOI: 10.5281/zenodo.19560674
[17] Andrews, J. (2026). *DAIGS Framework.* DOI: 10.5281/zenodo.19491784
[18] Andrews, J. (2026). *Lume-V Verification Suite.* DOI: 10.5281/zenodo.19645097
[19] Andrews, J. (2026). *Lume-X Multi-Agent Cognition.* DOI: 10.5281/zenodo.19443968
[20] Andrews, J. (2026). *Deterministic Dissolution.* DOI: 10.5281/zenodo.15065493
[21] Andrews, J. (2026). *Meridian Architecture.* [Companion paper]
[22] Andrews, J. (2026). *Meridian Organism.* [Companion paper]
[23] Andrews, J. (2026). *Energy Internet.* [Companion paper]
[50] Andrews, J. (2026). *Deterministic Infrastructure.* [Companion paper]

---

*END OF PAPER*

*Guardian Security: A Formal Threat Model and Defense Framework for Deterministic Wireless Energy Routing*
*Version 1.0 — DarkWave Studios LLC*
*Author: Jason Andrews | ORCID: 0009-0007-5214-649X | team@dwsc.io*
*lume-lang.org | TrustShield.tech | github.com/cryptocreeper94-sudo*
*Patent Pending — Provisional Application: Systems and Methods for Deterministic Multi-Layer Wireless Energy Routing Using Ambient Harvesting, Mesh Coordination, and Directional Transmission*
*Lume-X: Provisionally patented deterministic control runtime.*
*© 2026 DarkWave Studios LLC. All rights reserved.*
*This preprint has not undergone peer review.*
*Do not submit to any publication venue before Phase 1 experimental data exists.*
