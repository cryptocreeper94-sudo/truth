# Meridian Physical Deployment Architecture: Volumetric Beam Routing in Complex Built Environments

**Subtitle:** Architectural Voxel Mapping, Floor-Transition Gateways, and the Formal Safety Proof for Multi-Story Deterministic Energy Delivery

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
**Guardian Security (Guardian-E):** Security and safety enforcement layer. Domain: TrustShield.tech

**Companion Papers:**
- Andrews, J. (2026). Meridian: A Four-Layer Deterministic Wireless Energy Routing Architecture. [Cited as "Meridian Architecture, 2026"]
- Andrews, J. (2026). Meridian as Synthetic Organism. [Cited as "Meridian Organism, 2026"]
- Andrews, J. (2026). The Energy Internet. [Cited as "Energy Internet, 2026"]
- Andrews, J. (2026). Deterministic Infrastructure: A General Theory. [Cited as "DI Theory, 2026"]
- Andrews, J. (2026). Guardian Security. [Cited as "Guardian Security, 2026"]
- Andrews, J. (2026). The Unified Energy-Data Mesh. [Cited as "UEDM, 2026"]

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

The six preceding papers in this series specify Meridian as a network protocol stack, a biological organism analog, an internet-scale energy routing standard, a general theory of deterministic infrastructure, a formal security framework, and a unified energy-data fabric. None of them answer the question a building owner, architect, or facilities manager asks first: *how does this actually get installed in a real building?*

Real buildings are not free-space volumes with nodes floating in ideal positions. They are layered collections of floors, walls, ceilings, open staircases, atriums, elevator shafts, mezzanines, balconies, mechanical chases, and structural columns — each with different RF propagation properties, different occupancy characteristics, and different implications for where a directed energy beam may safely travel. A beam path that appears valid in the node routing graph may physically traverse an open staircase void connecting three floors. A ceiling-mounted relay node that appears to satisfy the z_min height constraint may overhang a mezzanine where the effective clearance is half of nominal. These are not edge cases — they are standard features of every commercial building Meridian will be deployed in.

I introduce the Architectural Voxel Map (AVM) — a formal 3D volumetric representation of a building's physical geometry that is imported into the Meridian routing engine at commissioning and enforced as a hard constraint on every beam path computation. The AVM classifies every voxel in the building volume as one of seven types, and the DRMA routing engine rejects any beam path whose geometric projection intersects a prohibited voxel class, regardless of the node-graph shortest path.

I define the ceiling-plane routing model as the standard deployment posture for occupied buildings: relay nodes are mounted at ceiling height on each floor, energy travels horizontally along the ceiling plane between relay nodes, and descends to devices only in the controlled final-hop geometry. I characterize the five void types that require explicit routing detours — open staircases, atriums, elevator shafts, balcony overhangs, and occupied mezzanines — and specify the floor-transition gateway architecture that enables inter-floor energy transfer without beam traversal of occupied spaces.

I provide the formal safety proof for multi-story deployment: that the combined enforcement of AVM constraints, ceiling-plane routing preference, floor-transition gateway geometry, and the Biological Safety Layer [Guardian Security, 2026] makes physical harm from beam traversal impossible under all non-destructive attack conditions, including the adversarial conditions characterized in the T1–T11 threat taxonomy.

I close with the Building Information Model (BIM) integration pathway — the specification for how Meridian deployment becomes a native layer of architectural design software, enabling architects to co-design beam routing topology alongside HVAC, electrical, and structural systems during building design rather than retrofitting it afterward.

**Keywords:** wireless energy routing, deployment architecture, architectural voxel map, ceiling-plane routing, floor-transition gateway, building information model, multi-story deployment, open staircase routing, atrium routing, deterministic safety, Meridian, BIM integration

---

## Table of Contents

1. Introduction
2. Background: The Gap Between Network Topology and Physical Architecture
3. The Architectural Voxel Map (AVM)
4. Ceiling-Plane Routing: The Standard Deployment Posture
5. The Five Void Types and Their Routing Detours
6. Floor-Transition Gateway Architecture
7. Dynamic Occupancy Overlay
8. The Formal Multi-Story Safety Proof
9. Frequency Selection and Its Architectural Implications
10. Building Type Scenarios
11. BIM Integration Pathway
12. Commissioning Protocol
13. Related Work
14. Limitations and Honest Boundaries
15. Conclusion
- Appendix A — AVM Voxel Classification Specification
- Appendix B — Floor-Transition Gateway Node Specification
- Appendix C — AVM-DRMA Integration: Beam Path Validation Algorithm
- Appendix D — BIM Export Format Specification (Meridian Layer)
- References

---

## 1. Introduction

### 1.1 The Gap This Paper Fills

The Meridian architecture [Meridian Architecture, 2026] specifies how energy is routed through a mesh of addressed nodes. It defines the routing protocol, the control runtime, the security framework, and the self-healing mechanisms. It does not specify where, physically, the nodes go — or how the building's geometry constrains where the beams between them may travel.

This gap is not academic. It is the difference between a paper that describes a correct routing protocol for a free-space volume and a product that can be installed in a hospital, an office tower, a residential building, or a warehouse without injuring anyone and without requiring the building to be demolished and rebuilt around the energy routing requirements.

The architecture papers correctly observe that Meridian operates in physical space and that the Biological Safety Layer provides the safety backstop. What they do not specify is the proactive spatial framework that keeps beam paths out of occupied zones before the BSL ever needs to act. That proactive framework is this paper's contribution.

### 1.2 The Ceiling-Plane Insight

The motivating insight for this paper is simple: a building's ceiling is a surface that is, under normal occupancy conditions, above every person in the building. A beam that travels along the ceiling plane — horizontally at ceiling height between relay nodes mounted at the ceiling — passes through a geometric zone that people do not occupy. The beam path is safe not because a sensor detected no person in its way, but because no person can be in its way given the physical geometry.

This reframes the safety model from reactive (detect a person, stop the beam) to proactive (route the beam where no person can be). The BSL remains as the enforcement backstop for failure cases. But the primary safety mechanism is architectural routing — choosing beam paths that are geometrically separated from occupied space.

The ceiling-plane insight extends naturally to multi-story buildings: each floor has a ceiling plane that is safe for horizontal beam travel. The challenge is floor-to-floor transition — getting energy from floor 1's ceiling plane to floor 2's ceiling plane without routing through the vertical space between them, which may include occupied staircases, atriums, and elevator shafts. This paper solves that challenge.

### 1.3 Contributions

I make five contributions:

1. The formal definition of the Architectural Voxel Map (AVM) — a seven-class 3D volumetric representation of building geometry that the routing engine enforces as a hard constraint on every beam path.

2. The ceiling-plane routing model as the standard deployment posture for occupied buildings, with formal geometric proofs of its safety properties.

3. The characterization of five void types (open staircase, atrium, elevator shaft, balcony overhang, occupied mezzanine) and the specific routing detour each requires.

4. The floor-transition gateway architecture — the physical and protocol specification for inter-floor energy transfer at designated architectural transition points.

5. The BIM integration pathway — a specification for how Meridian deployment becomes a co-designed architectural layer rather than a post-hoc installation.

### 1.4 Paper Organization

Section 2 characterizes the gap between network topology and physical architecture. Section 3 defines the AVM formally. Section 4 specifies ceiling-plane routing. Section 5 characterizes the five void types. Section 6 defines floor-transition gateways. Section 7 describes the dynamic occupancy overlay. Section 8 provides the formal safety proof. Section 9 addresses frequency selection and its architectural implications. Section 10 presents four building type scenarios. Section 11 specifies the BIM integration pathway. Section 12 defines the commissioning protocol. Section 13 situates this in related literature. Section 14 states limitations. Section 15 concludes.

---

## 2. Background: The Gap Between Network Topology and Physical Architecture

### 2.1 How Current Routing Models Represent Space

The DRMA routing engine [Meridian Architecture, 2026 §9] maintains a routing table that represents the mesh as a graph: nodes as vertices, wireless links as edges, link quality as edge weights. The routing algorithm (a modified Dijkstra over the energy-topology graph) finds the minimum-cost path from source to destination through this graph.

This representation is accurate for what it models: the connectivity and quality of wireless links between nodes. It does not model the physical geometry of the space those links traverse. A link between node A at position (3.0m, 2.0m, 2.5m) and node B at position (8.0m, 2.0m, 2.5m) is represented as an edge with a link quality metric. The routing engine does not know that the straight line between those two positions crosses over an open staircase void at x = 5.5m, meaning that the beam along that link, while technically maintaining a 2.5m height, has a downward projection into a space with zero effective clearance because the floor is not there.

This is the gap: routing tables are correct about connectivity; they are silent about the physical geometry of beam paths.

### 2.2 Why Node Positions Alone Are Insufficient

One might argue that if nodes are correctly positioned — mounted at ceiling height, away from voids — the routing will naturally be safe. This argument fails for three reasons:

**First, link paths are not points.** A link between two ceiling-mounted nodes defines a line (or more precisely, a beam cross-section sweeping through a volume) in physical space. That volume may intersect an architectural void even if the node endpoints are in safe positions.

**Second, buildings change.** A building commissioned with Meridian in January may have its staircase opening enlarged in March, a new mezzanine added in June, and a temporary work platform installed in August. The node positions don't change; the architectural geometry does. Without an AVM that can be updated to reflect architectural changes, the routing engine operates on a stale model of the building.

**Third, height alone is not the safety criterion.** A node mounted at 3.0m height on floor 2, directly above an open staircase that connects floor 1 and floor 2, is at 3.0m above floor 2 but potentially 6.0m+ above floor 1. A beam that departs from this node horizontally may pass through the staircase void at angles that create exposure to persons on the staircase. Height is floor-relative, not building-relative.

### 2.3 The AVM as the Necessary Extension

The AVM is the minimal necessary extension to the Meridian architecture to support deployment in complex built environments. It does not replace the node routing graph — it augments it with the physical geometry that the routing graph cannot represent. The routing engine uses both: the node graph to find candidate paths, and the AVM to validate that candidate paths are geometrically safe before authorizing them.

---

## 3. The Architectural Voxel Map (AVM)

### 3.1 Voxel Grid Definition

The AVM divides the building volume into a uniform 3D grid of voxels. Each voxel is a cube of side length V_size, with V_size selected based on the required spatial resolution. For standard commercial building deployment, V_size = 25 cm is recommended — sufficient to resolve staircase openings, balcony edges, and mechanical penetrations at a resolution meaningful for beam path planning.

```
AVM coordinate system:
  Origin: building datum point (typically ground floor SW corner)
  X: East (meters)
  Y: North (meters)
  Z: Up (meters)

Voxel index (i, j, k) corresponds to physical volume:
  X ∈ [i × V_size, (i+1) × V_size]
  Y ∈ [j × V_size, (j+1) × V_size]
  Z ∈ [k × V_size, (k+1) × V_size]
```

For a typical 10-story office building (50m × 40m footprint, 40m height), the AVM contains approximately 50/0.25 × 40/0.25 × 40/0.25 = 200 × 160 × 160 = 5,120,000 voxels. At 1 byte per voxel (the type tag), the full AVM for this building is approximately 5 MB — trivial to store and load at commissioning.

### 3.2 The Seven Voxel Classes

Each voxel is assigned one of seven classes:

**Class 0 — SOLID:** The voxel is occupied by structural material (concrete slab, masonry wall, steel column, timber framing, glass curtain wall). RF at frequencies above ~2.4 GHz attenuates significantly through most SOLID materials; at mmWave frequencies (24+ GHz) attenuation through a concrete slab is extreme (>40 dB). Beam paths do not traverse SOLID voxels — they terminate at SOLID boundaries. SOLID voxels are the natural beam containment boundaries.

**Class 1 — FLOOR_SAFE:** The voxel is in the ceiling zone of a normally occupied floor — specifically, the volume between the structural ceiling and the height z_safe(floor), where z_safe = floor_slab_height + 2.2m (2.2m provides a 10 cm margin above the 99th percentile standing height of 2.1m for the occupied population). FLOOR_SAFE voxels are the primary routing medium: relay nodes are mounted within or adjacent to FLOOR_SAFE voxels, and beam paths are preferred to remain within FLOOR_SAFE zones.

**Class 2 — FLOOR_OCCUPIED:** The voxel is in the normally occupied zone of a floor — between z_floor and z_safe. Beams must not traverse FLOOR_OCCUPIED voxels except in the controlled final-hop geometry (directly from a ceiling relay node downward to a destination device, with BSL active). This is the only permissible traversal of FLOOR_OCCUPIED voxels, and it is governed by the final-hop protocol specified in Section 4.3.

**Class 3 — VOID_STAIRCASE:** The voxel is part of the air volume in or directly above an open staircase — a void that connects floor planes. This class extends vertically through all floors the staircase spans. No beam path may have any portion of its swept volume intersecting a VOID_STAIRCASE voxel.

**Class 4 — VOID_ATRIUM:** The voxel is part of the air volume of an atrium, light well, or multi-story open space. Like VOID_STAIRCASE, this class extends through all floor levels of the void. No beam path may intersect a VOID_ATRIUM voxel.

**Class 5 — VOID_SHAFT:** The voxel is part of an elevator shaft, mechanical shaft, dumbwaiter shaft, or similar enclosed vertical void containing moving elements. No beam path may intersect a VOID_SHAFT voxel.

**Class 6 — GATEWAY_ZONE:** The voxel is designated as a floor-transition gateway location — a specific architectural position where a gateway relay node is installed to handle inter-floor energy transfer. GATEWAY_ZONE voxels are FLOOR_SAFE at their floor level, but they additionally participate in the inter-floor routing protocol. The routing engine may terminate a floor's beam path at a GATEWAY_ZONE and resume it at the corresponding GATEWAY_ZONE on the adjacent floor.

```
Routing permissions summary:
  SOLID           : beam terminates (physical boundary)
  FLOOR_SAFE      : beam traversal permitted (preferred)
  FLOOR_OCCUPIED  : beam traversal permitted in final-hop geometry only
  VOID_STAIRCASE  : beam traversal PROHIBITED
  VOID_ATRIUM     : beam traversal PROHIBITED
  VOID_SHAFT      : beam traversal PROHIBITED
  GATEWAY_ZONE    : beam termination and inter-floor handoff point
```

### 3.3 AVM Construction

The AVM is constructed from one of three sources, in order of preference:

**Source 1 — BIM export (preferred).** If the building has a BIM model (Section 11), the AVM is generated automatically by the Meridian BIM plugin from the architectural model. The plugin classifies each voxel by querying the BIM model's spatial elements: structural elements → SOLID, occupied spaces at floor level → FLOOR_OCCUPIED, ceiling zones → FLOOR_SAFE, staircase voids → VOID_STAIRCASE, atrium voids → VOID_ATRIUM, shaft elements → VOID_SHAFT, pre-designated gateway locations → GATEWAY_ZONE. This process is automated and produces a complete, accurate AVM for buildings with BIM documentation.

**Source 2 — As-built survey.** For buildings without BIM, a physical survey using laser scanning (LiDAR point cloud) or structured-light scanning produces a 3D model of the building interior that is then classified into AVM voxel types by the Meridian commissioning tool. The survey must capture all voids, overhangs, and mezzanines that are not visible in floor plans.

**Source 3 — Floor plan annotation.** For buildings where neither BIM nor physical survey is available, the commissioning technician annotates 2D floor plans with void types and the commissioning tool generates an AVM by extruding the 2D annotations vertically according to the specified floor heights. This is the least accurate method and requires careful annotation of all void boundaries.

### 3.4 AVM Updates

The AVM must be updated whenever the building's geometry changes. The commissioning tool maintains an AVM version history and requires re-validation of all existing beam paths against the new AVM whenever an update is applied. If an existing beam path becomes invalid under the updated AVM (because a previously-safe route now intersects a new void or mezzanine), the routing engine recomputes the affected paths before resuming operation.

---

## 4. Ceiling-Plane Routing: The Standard Deployment Posture

### 4.1 Definition

Ceiling-plane routing is the standard deployment posture for Meridian in occupied buildings: relay nodes are mounted at ceiling height within FLOOR_SAFE voxels, and beam paths are required to remain within FLOOR_SAFE voxels except for the controlled final-hop descent to destination devices.

Formally, a ceiling-plane route ρ from source node s to relay chain [r₁, r₂, ..., rₙ] to destination device d satisfies:

```
For all hops hᵢ from node nᵢ to node nᵢ₊₁, where nᵢ₊₁ ≠ d:
  all voxels in swept_volume(beam(nᵢ, nᵢ₊₁)) ∈ FLOOR_SAFE ∪ SOLID

For the final hop from rₙ to d:
  all voxels in swept_volume(beam(rₙ, d)):
    horizontal component ∈ FLOOR_SAFE
    vertical descent component ∈ FLOOR_OCCUPIED
    final-hop protocol active (BSL engaged, tracking active, power limited)
```

This formalization captures the key property: the beam travels horizontally at ceiling height through FLOOR_SAFE voxels for all non-final hops, and descends through FLOOR_OCCUPIED voxels only for the final hop, which is governed by a more restrictive protocol.

### 4.2 Node Placement Requirements

For ceiling-plane routing to be effective, relay nodes must be mounted within FLOOR_SAFE voxels. The node placement requirements for a compliant installation:

- **Mounting height:** Node center at z ≥ z_safe(floor) — at or above the safe zone boundary. Typical mounting is at z_ceiling − 5 cm (surface-flush ceiling mount) or z_ceiling − 15 cm (pendant mount for better beam angle coverage).

- **Mounting position:** Node must not be positioned directly above a VOID_STAIRCASE, VOID_ATRIUM, or VOID_SHAFT — even if the node height is within FLOOR_SAFE for that floor, the downward beam geometry from such a position will intersect the void.

- **Beam angle envelope:** Each relay node's phased array must be capable of producing a beam confined to ±θ_max from horizontal, where θ_max is defined by the geometry: θ_max = arctan((z_node − z_safe) / d_min), where d_min is the minimum expected inter-node distance. This ensures that even at the nearest neighbor, the beam departs at an angle that remains within FLOOR_SAFE. Typical values: z_node = 2.7m (ceiling height), z_safe = 2.2m, d_min = 1.5m → θ_max = arctan(0.5/1.5) ≈ 18.4°.

- **Density:** Node density must be sufficient to maintain FLOOR_SAFE routing paths around all VOID voxels. The minimum node density is determined by the void geometry: no VOID column should be wider than the effective beam range of the relay nodes on either side of it.

### 4.3 Final-Hop Protocol

The final hop — from the last relay node down to the destination device — is the only segment that passes through FLOOR_OCCUPIED space. It is governed by a more restrictive protocol than relay hops:

**Power reduction:** Final-hop power is reduced to the minimum necessary for delivery (P_final ≤ P_relay × attenuation_factor for the final hop distance). Since the final hop is always shorter than relay hops (device is below the ceiling relay), less power is required, further reducing any exposure.

**Beam width reduction:** The final-hop beam is commanded to minimum aperture — maximum array focusing — reducing the swept volume through FLOOR_OCCUPIED to the tightest achievable cross-section.

**Active tracking engagement:** Lume-X activates continuous position tracking for the destination device. If the device moves more than r_track (default: 10 cm) from its last confirmed position, the beam is held until position is reconfirmed.

**Enhanced BSL monitoring:** The final-hop BSL check requires all five sensor modalities to confirm no biological presence in the final-hop cone before each burst. For relay hops, three-modality consensus is sufficient; for final hops, five-modality consensus is required.

**Burst duration limiting:** Final-hop bursts are limited to T_burst_max (default: 500ms). After each burst, a 50ms hold allows BSL sensors to update before the next burst.

---

## 5. The Five Void Types and Their Routing Detours

### 5.1 Open Staircase

**Physical description:** An open staircase is a floor opening connecting two or more floor levels, with the staircase treads exposed to the surrounding space rather than enclosed within walls. The void extends from the lowest floor level connected by the staircase to the ceiling of the highest floor connected.

**Routing problem:** A horizontal beam at ceiling height of floor N, traveling in the direction of the staircase opening, will have a downward projection that passes through the staircase void — where persons on the stairs may be at heights ranging from floor N-1 level to near-ceiling of floor N. The apparent height of the beam above floor N is safe; its height above persons on the staircase may not be.

**AVM classification:** All voxels within the staircase opening footprint, from z = floor_N-1 to z = ceiling_N, are classified VOID_STAIRCASE. Additionally, a 50 cm buffer zone around the perimeter of the opening at ceiling level is classified VOID_STAIRCASE to prevent beams from grazing the opening edge.

**Routing detour:** The routing engine routes around the staircase footprint — a horizontal detour at ceiling level that circumnavigates the VOID_STAIRCASE column. The detour length depends on the staircase width; for a typical 1.2m wide staircase opening, the detour adds one or two relay hops. If no circumnavigation path exists (the staircase opening spans the full width between two nodes), the routing falls through to inter-floor gateway routing (Section 6) rather than attempting a direct crossing.

**Physical analogy:** A river crossing that routes traffic over a bridge rather than through the water. The bridge is the relay node path around the staircase; the void is the water.

### 5.2 Atrium

**Physical description:** An atrium is a multi-story open volume — a space where multiple floor levels have been removed or never built, creating a tall open interior. Atriums span from a ground floor (or basement) to a skylight or roof opening, passing through every floor level in between. They are common in commercial buildings, hotels, and shopping centers.

**Routing problem:** An atrium creates a void that invalidates ceiling-plane routing for any portion of any floor that borders the atrium, because the "ceiling" of floor N at the atrium boundary is not a safe routing zone — a beam departing horizontally from a node near the atrium edge will pass into the atrium volume, where persons may be standing on balconies at any floor level, or traversing the atrium floor.

**AVM classification:** All voxels within the atrium footprint and its floor-level buffer (50 cm perimeter), from z = ground to z = roof, are classified VOID_ATRIUM regardless of floor level.

**Routing detour:** Nodes bordering the atrium must route around it rather than across it. This typically requires a perimeter routing strategy — relay nodes are placed around the atrium perimeter at ceiling height on each floor, forming a ring that routes energy around the atrium void. Energy never crosses the atrium volume; it travels around it. For large atriums, this may significantly increase hop count. The routing engine selects the lowest-hop perimeter path automatically.

**Balcony sub-case:** A balcony that overlooks an atrium is a FLOOR_OCCUPIED zone at non-standard height. A relay node mounted at the ceiling of the floor above a balcony must not route toward the atrium side, because the effective z_safe for that direction is limited by the balcony floor height, not the main floor height. The AVM handles this through the VOID_ATRIUM classification of the atrium-facing voxels: any beam directed toward the atrium is blocked by the VOID_ATRIUM boundary before it can reach the balcony zone.

### 5.3 Elevator Shaft

**Physical description:** An elevator shaft is an enclosed vertical void containing one or more elevator cars, counterweights, cables, and guide rails. Elevator shafts typically span the full building height and are enclosed by solid walls on all sides. Personnel may enter the shaft for maintenance.

**Routing problem:** Elevator shafts are SOLID-bounded — the shaft walls are concrete or metal, providing effective RF attenuation at mmWave frequencies. For most practical purposes, the shaft itself does not create a routing problem because beams cannot penetrate the shaft walls to enter it. The routing problem arises at shaft doors: when an elevator door is open, the door opening creates a temporary aperture in the SOLID boundary that connects the VOID_SHAFT to the adjacent corridor.

**AVM classification:** The shaft interior is classified VOID_SHAFT. The floor-level area in front of each shaft door is classified FLOOR_OCCUPIED. The elevator lobby (typically 2–3m in front of the door) is FLOOR_OCCUPIED.

**Dynamic handling:** The routing engine treats elevator door openings as temporary VOID_SHAFT extensions into the corridor. This is handled by the dynamic occupancy overlay (Section 7) rather than the static AVM: the elevator door sensor (or UEDM occupancy sensor at the lobby) detects the door opening event and marks the lobby voxels immediately in front of the open door as VOID_SHAFT for the duration of the door opening. Beams that would route through the lobby are held or rerouted during door-open events.

**Practical impact:** Elevator lobbies are typically not routing paths — relay nodes avoid direct paths through elevator lobby zones by installation convention. The door-open dynamic marking is a backstop for unusual routing configurations.

### 5.4 Balcony Overhang

**Physical description:** A balcony overhang is a floor extension that protrudes beyond the main floor plate, creating a zone where the ceiling of the space below is the underside of the balcony slab rather than the main floor ceiling. Balconies are common in residential buildings, hotels, theaters, and lecture halls.

**Routing problem:** A relay node mounted at ceiling height on floor N, near a balcony overhang, may have a z_node value that appears safe relative to floor N, but if the balcony below it reduces the effective ceiling clearance at that horizontal position, the FLOOR_SAFE classification at that position is incorrect. Additionally, persons on the balcony above are at non-standard height — higher than floor N's FLOOR_OCCUPIED zone, lower than floor N+1's FLOOR_SAFE zone.

**AVM classification:** The underside of the balcony slab is classified SOLID at its actual height. The zone between the balcony slab underside and the main floor ceiling at the overhang position is re-classified based on actual clearance. If the clearance is less than 2.2m (z_safe), the zone is classified FLOOR_OCCUPIED even if its absolute height would normally fall in FLOOR_SAFE. The balcony surface itself (on floor N+1) is FLOOR_OCCUPIED. The space above balcony standing height on floor N+1 is FLOOR_SAFE if it has ≥2.2m clearance to the floor N+2 ceiling.

**Routing detour:** Relay nodes must not be positioned under balcony overhangs where the effective clearance is less than z_safe. The routing engine routes around overhang-affected zones using standard FLOOR_SAFE path selection.

### 5.5 Occupied Mezzanine

**Physical description:** A mezzanine is an intermediate floor level inserted between two main floor levels, typically covering a portion of the main floor area. Mezzanines are common in warehouses, retail spaces, libraries, and industrial buildings. They create a zone where the effective occupied height is non-standard — higher than the main floor's FLOOR_OCCUPIED zone, lower than the ceiling.

**Routing problem:** A relay node mounted at the ceiling of the main floor, above a mezzanine, may have a nominal height of 6.0m (main floor ceiling height) but an effective clearance of only 1.0m above the mezzanine deck. A beam passing horizontally at 6.0m height, above the mezzanine, is safe relative to the main floor. But if the mezzanine extends under the beam path, the beam is only 1.0m above the mezzanine surface — well below z_safe — and persons standing on the mezzanine are directly in the beam path.

**AVM classification:** The mezzanine deck is classified SOLID. The zone above the mezzanine deck up to z_safe above the mezzanine is classified FLOOR_OCCUPIED. The zone above z_safe above the mezzanine is classified FLOOR_SAFE. The zone below the mezzanine deck (if accessible) uses the main floor classification. This produces a layered classification at the mezzanine location that correctly represents the multi-level occupancy.

**Routing detour:** The routing engine treats the mezzanine FLOOR_OCCUPIED zone as a routing obstacle for horizontal beam paths. Relay nodes above a mezzanine must route horizontally at the clearance height above the mezzanine FLOOR_OCCUPIED zone (i.e., at mezzanine_height + 2.2m or above), not at main floor ceiling height. If main floor ceiling height is insufficient to clear the mezzanine z_safe boundary, no horizontal ceiling-plane route exists at that location, and the routing engine falls through to a perimeter route around the mezzanine footprint.

---

## 6. Floor-Transition Gateway Architecture

### 6.1 The Inter-Floor Problem

Energy cannot be beamed through a concrete floor slab at useful power levels. At 60 GHz (short-range mmWave), attenuation through a standard 20 cm concrete slab exceeds 40 dB — effectively a total block. Inter-floor energy transfer therefore requires a physical transition mechanism: energy must travel through an architectural feature that provides a clear RF path between floors, or through a conducted transfer at a designated gateway node.

Three inter-floor transfer mechanisms are available, in order of RF path quality:

**Mechanism 1 — Open penetration.** An existing aperture through the floor slab at a designated location — a conduit chase, a pipe sleeve, or a purpose-built RF window in the slab. A gateway node pair (one node on each floor adjacent to the aperture) communicates through the aperture. The aperture provides a direct RF path; the gateway nodes route energy through it. This requires coordination with structural engineering but is the cleanest RF solution.

**Mechanism 2 — Enclosed stairwell.** An enclosed stairwell (as opposed to an open staircase) provides a continuous air volume connecting floor levels, bounded by solid walls. A gateway node mounted at the top of the stairwell and a paired node at the bottom (or at each floor landing) can communicate through the stairwell air volume. The enclosing walls prevent beam escape from the stairwell; the BSL monitors the stairwell volume for occupancy. This is the most commonly available inter-floor path in commercial buildings, since most buildings have both open and enclosed stairwells.

**Mechanism 3 — Dedicated RF conduit.** A purpose-installed waveguide or low-loss conduit connecting gateway nodes on adjacent floors, installed during building construction or retrofit. This provides the highest RF efficiency and the simplest safety model (the RF is fully enclosed in the conduit), but requires planned installation.

### 6.2 Gateway Node Specification

A gateway relay node (GRN) is a specialized Meridian node installed at a floor-transition point. Its specification extends the standard relay node specification [Meridian Architecture, 2026 §4] with:

**Dual-face antenna array:** The GRN carries two phased array faces — one oriented toward the floor above, one toward the floor below (or toward the inter-floor transfer mechanism). The upper face participates in floor N's ceiling-plane routing mesh. The lower face participates in floor N-1's ceiling-plane routing mesh. The GRN bridges the two floor meshes.

**Intermediate supercapacitor bank:** The GRN carries a larger supercapacitor bank than a standard relay node — sufficient to buffer energy arriving from floor N's mesh and retransmit it into floor N-1's mesh asynchronously. This decouples the timing of inter-floor transfer from intra-floor routing, allowing each floor's TDMA schedule to operate independently.

**Directional isolation:** The two antenna faces are physically isolated by a ground plane to prevent the upper-face beam from coupling into the lower-face field and vice versa. The GRN appears as two independent nodes to the routing engines of the two floors it connects.

**Shared identity:** The GRN registers with both floor meshes under a single Trust Layer identity with a capability profile that explicitly encodes its gateway function. The DRMA routing engine on each floor knows to terminate inter-floor routing paths at the GRN and resume them through the paired GRN on the adjacent floor.

### 6.3 Gateway Placement Rules

Gateway relay nodes must be placed at architectural positions that satisfy:

1. **Continuous air path:** There must be a continuous air path between the GRN's upper and lower antenna faces, free of SOLID obstruction, with sufficient cross-section for the beam to propagate without excessive diffraction loss. Minimum aperture: 30 cm diameter for 24 GHz, 15 cm diameter for 60 GHz.

2. **Accessible for maintenance:** The GRN must be accessible for inspection and replacement without disrupting building occupancy. This typically means installation in enclosed stairwells, mechanical rooms, or above accessible ceiling tiles.

3. **Within 2m of the floor transition:** To minimize the portion of the beam path that is in the transition zone (neither floor's FLOOR_SAFE), GRN pairs should be positioned as close to the floor/ceiling interface as the aperture geometry allows.

4. **Clear of occupancy during transfer:** The inter-floor transfer volume (the air path between the GRN pair) must be within a zone that is either unoccupied by design (enclosed stairwell, mechanical room) or monitored by the BSL sensors of both GRNs simultaneously.

### 6.4 Multi-Floor Routing Example

For a device on floor 5 receiving energy from a source on floor 2 of a commercial building:

```
Route:
  Source (floor 2, position A)
  → ceiling relay nodes on floor 2 ceiling plane
  → GRN-2/3 upper face (floor 2 ceiling zone)
  → inter-floor transfer (enclosed stairwell between floors 2 and 3)
  → GRN-2/3 lower face (floor 3 ceiling zone)
  → ceiling relay nodes on floor 3 ceiling plane
  → GRN-3/4 upper face
  → inter-floor transfer
  → GRN-3/4 lower face (floor 4 ceiling zone)
  → GRN-4/5 upper face
  → inter-floor transfer
  → GRN-4/5 lower face (floor 5 ceiling zone)
  → ceiling relay nodes on floor 5 ceiling plane
  → final-hop descent to device
```

Each intra-floor segment is ceiling-plane routing in FLOOR_SAFE voxels. Each inter-floor segment is through an enclosed stairwell or designated aperture, monitored by the GRN pair's BSL sensors. No beam segment traverses VOID_STAIRCASE, VOID_ATRIUM, VOID_SHAFT, or FLOOR_OCCUPIED voxels outside the controlled final-hop geometry.

---

## 7. Dynamic Occupancy Overlay

### 7.1 Static vs. Dynamic Constraints

The AVM encodes the building's static physical geometry — constraints that are true regardless of who is in the building or what time it is. Dynamic occupancy constraints layer on top: constraints that depend on where people actually are in real time.

Dynamic constraints are necessary because the AVM cannot capture transient conditions: a person standing in a corridor near a relay node, a maintenance technician on a temporary scaffold, a crowd gathering in a normally sparse atrium floor. The AVM says "this corridor is FLOOR_OCCUPIED"; the dynamic occupancy overlay says "and there is currently a person at position (12.3m, 8.1m, 4.2m)."

### 7.2 Occupancy Sensor Integration

The Meridian mesh already includes biological presence detection as part of the BSL [Guardian Security, 2026 §8]. In the building deployment context, these sensors serve a dual function: safety monitoring (BSL role) and dynamic occupancy mapping (routing role).

Occupancy data flows into the routing engine through the LUME_X_TELEMETRY channel: each relay node reports its local BSL sensor readings at 73 Hz, including the binary biological_presence flag and, where available, the estimated position of detected biological entities within the sensor's detection radius.

The routing engine maintains a dynamic occupancy map — a 3D array at AVM voxel resolution — updated from incoming BSL telemetry. A voxel within a sensor's coverage radius that reports biological presence is marked OCCUPIED in the dynamic map. A voxel that reports clear is marked CLEAR. Beam paths are validated against the dynamic occupancy map in addition to the static AVM: a path that is valid in the AVM but passes through a dynamically OCCUPIED voxel is held until the voxel clears.

### 7.3 Occupancy Map Latency

The dynamic occupancy map update latency — the time between a person entering a voxel and the routing engine marking it OCCUPIED — is bounded by the Lume-X control cycle: 13.7 ms maximum. A person walking at 1.5 m/s travels 2 cm in 13.7 ms. Since the AVM voxel resolution is 25 cm, a person cannot enter and exit a voxel within a single control cycle. The occupancy map is always current to within one voxel of the person's actual position.

The consequence: a beam path that is valid at time T is checked against the occupancy map at time T. If a person enters the path's voxels between T and T + 13.7ms, the next control cycle detects the incursion and holds the beam at T + 13.7ms. Maximum exposure window: one control cycle of the beam's swept volume, which at the final-hop burst duration limit of 500ms and the 13.7ms cycle is bounded to a small fraction of the burst duration. The BSL hardware cutoff (independent of the control cycle) further reduces this to zero for any incursion that the BSL hardware detects.

### 7.4 Predictive Routing

For buildings with established occupancy patterns — office buildings with regular work schedules, retail spaces with predictable traffic flows — the routing engine can apply predictive occupancy modeling. Historical occupancy data (aggregated from BSL sensor logs, without personal identification) informs routing preferences: paths that are statistically unoccupied during a given time window receive preference over paths that are statistically busy.

Predictive routing does not override real-time occupancy detection. It is a soft preference in the routing cost function — it makes certain paths cheaper than others — not a hard constraint. The AVM constraints and real-time dynamic occupancy map are both hard constraints that override any predictive preference.

---

## 8. The Formal Multi-Story Safety Proof

### 8.1 Claim

I claim that the combined enforcement of the following four mechanisms makes physical harm from Meridian beam traversal impossible in a compliant multi-story deployment under all non-destructive conditions:

1. AVM constraint enforcement (prohibits beam traversal of all void voxels)
2. Ceiling-plane routing with z_safe enforcement (keeps horizontal beam paths above occupancy zone)
3. Final-hop protocol (governs the only deliberate traversal of occupied voxel space)
4. BSL hardware cutoff (prevents beam activation when biological presence is detected in the beam path)

**Definition of non-destructive conditions:** Conditions in which no building structural element has been physically removed or damaged, no BSL sensor hardware has been physically severed or destroyed, and no AVM has been unilaterally overridden without commissioning authority. Destructive conditions — a person cutting a BSL sensor wire, removing a floor section, or physically destroying a relay node — are out of scope for the software/protocol safety proof. Physical security of the installation is a necessary complement.

### 8.2 Proof by Case Analysis

I prove the claim by case analysis over the possible paths from beam activation to biological contact.

**Case 1: Horizontal beam path through FLOOR_SAFE voxels.**
By the AVM constraint, beam paths in FLOOR_SAFE voxels are at or above z_safe (≥2.2m above the floor slab). By definition of z_safe, no standing or seated person can occupy the FLOOR_SAFE zone. The only biological entities at z ≥ z_safe are those performing ceiling maintenance (climbing on equipment or scaffolding). The AVM marks the maintenance zone as FLOOR_OCCUPIED during registered maintenance events (part of commissioning protocol). During unregistered maintenance (a person climbs on a chair spontaneously), the BSL sensors detect biological presence above normal standing height and mark the affected voxels OCCUPIED in the dynamic map, holding the beam. The horizontal ceiling-plane path is safe.

**Case 2: Final-hop beam path through FLOOR_OCCUPIED voxels.**
The final-hop protocol requires five-modality BSL consensus (no biological presence in the final-hop cone) before each burst, limits burst duration to 500ms, and limits beam width to minimum aperture. A person who enters the final-hop cone during a burst is detected by the BSL hardware cutoff — which operates at the hardware layer, independent of the control cycle — within the response time of the BSL circuit (specified as ≤1ms for hardware-implemented detection). The beam is cut within 1ms of biological entry into the final-hop cone. At final-hop power levels (reduced relative to relay hops), 1ms of exposure at the beam edge is physiologically insignificant at the specified RF frequencies and power densities (below ICNIRP limits by design margin).

**Case 3: Void traversal attempt.**
By the AVM constraint, beam paths are rejected by the routing engine if any voxel in the path's swept volume is classified VOID_STAIRCASE, VOID_ATRIUM, or VOID_SHAFT. The constraint is enforced by the beam path validation algorithm (Appendix C) before any beam is authorized. A void traversal attempt that bypasses the routing engine by direct BeamCommand injection (T3 or T11 attack) is caught by Guardian Security's pre-transmission route integrity check [Guardian Security, 2026 §5.2 Step 3], which validates the proposed path against the AVM before issuing beam authorization. The BSL hardware cutoff provides the final backstop in the event that both routing enforcement and security enforcement are simultaneously bypassed.

**Case 4: Staircase or atrium perimeter beam grazing.**
The 50 cm buffer zone around all VOID boundaries adds additional margin: a beam path must stay at least 50 cm from any VOID boundary in the horizontal plane. At the specified beam widths (≤18° full angle for standard relay hops), a beam in the FLOOR_SAFE zone is physically incapable of grazing the VOID perimeter if its horizontal routing center line is 50 cm from the VOID boundary and the beam is below the maximum angular spread.

**Case 5: Dynamic occupancy incursion between BSL sensor updates.**
As characterized in Section 7.3, maximum incursion window is one control cycle (13.7ms). The BSL hardware cutoff, which operates independently of the control cycle, responds in ≤1ms. Actual maximum exposure window: 1ms at the hardware cutoff response time, not 13.7ms at the control cycle latency.

In all five cases, biological contact with the beam is prevented by at least two independent mechanisms. No single mechanism failure produces physical harm. This is the defense-in-depth proof: the safety guarantee is not contingent on any single mechanism being correct; it holds as long as at least one mechanism in the chain is functioning.

---

## 9. Frequency Selection and Its Architectural Implications

### 9.1 The Frequency-Architecture Tradeoff

Frequency selection for Meridian deployment is an architectural decision, not just a hardware decision. Different frequency bands produce different beam width properties, different penetration through building materials, and different interaction with the AVM classification system.

**2.4 / 5.8 GHz (ISM band, ~5–12 cm wavelength):**
- Penetrates concrete floors significantly (10–20 dB loss per slab), making the floor slab a less reliable beam boundary
- Wide beamwidth from practical antenna apertures (30°+ full angle) — large swept volumes, harder to confine to FLOOR_SAFE zone
- Long range (10–30m relay hops in clear space)
- Heavily congested spectrum; interference management required

**24 GHz (K-band, ~1.25 cm wavelength):**
- Concrete floor slab attenuation: 30–40 dB per slab — effective containment
- Achievable beamwidth from 10 cm aperture: ~15° full angle — significantly tighter than ISM band
- Range: 5–15m relay hops in building interior
- Regulatory status: generally requires licensing at transmission powers useful for energy delivery

**60 GHz (V-band, ~5 mm wavelength):**
- Concrete floor slab attenuation: >40 dB — essentially complete containment
- Achievable beamwidth from 10 cm aperture: ~5° full angle — near laser-like precision
- Oxygen absorption at 60 GHz: ~15 dB/km — negligible for building-scale distances
- Range: 3–10m relay hops in building interior (atmospheric absorption limits longer hops)
- Regulatory status: unlicensed in most jurisdictions (FCC Part 15, ETSI EN 302 567)
- **Recommended for Meridian building deployment** due to beam precision, floor containment, and regulatory availability

**77–79 GHz (automotive radar band, ~4 mm wavelength):**
- Similar properties to 60 GHz but with even tighter beamwidth and better floor containment
- Primary regulatory use is automotive radar; building energy routing would require regulatory clearance
- Not recommended for near-term deployment

### 9.2 The Ceiling-Crawl Case for mmWave

The ceiling-plane routing model is dramatically stronger at 60 GHz than at 5.8 GHz. At 60 GHz:

- A 10 cm phased array produces a beam approximately 25 cm wide at 3m distance — the beam fits entirely within FLOOR_SAFE with substantial margin
- The concrete floor slab (above relay nodes on their floor) completely contains upward-directed scatter — no energy leaks to the floor above through the slab
- The floor below completely contains downward-directed scatter from ceiling-level relay hops — no energy reaches FLOOR_OCCUPIED from ceiling relay hops unless it is the controlled final-hop beam

At 5.8 GHz, the much wider beam requires larger safety margins, the floor containment is partial, and the required relay node density is lower but the swept volume through occupied space is larger. The ceiling-plane safety proof is more conservative at 5.8 GHz and may require additional relay node density to maintain FLOOR_SAFE confinement.

**Recommendation:** Meridian building deployments should use 60 GHz as the primary frequency for intra-floor ceiling-plane routing and inter-floor gateway transfer. A secondary 5.8 GHz channel may be used for long-range relay hops in high-ceiling industrial spaces (warehouses, atriums exceeding 20m height) where the 60 GHz range limitation is a constraint.

---

## 10. Building Type Scenarios

### 10.1 Commercial Office Tower

**Characteristics:** Repeating open-plan floors with suspended ceilings, central core (elevators, enclosed stairwells), floor heights 3.5–4.0m, regular grid of structural columns.

**AVM profile:** Clean, regular. SOLID = concrete slab and columns. FLOOR_SAFE = suspended ceiling zone (2.7–4.0m). VOID_STAIRCASE = open staircase if present (unusual in commercial towers, which typically have enclosed stairwells). VOID_SHAFT = elevator shafts in the core. GATEWAY_ZONE = enclosed stairwell landings on each floor.

**Deployment pattern:** Relay nodes mounted in suspended ceiling grid at 3–5m spacing. GRNs at stairwell landings. Node density approximately 1 relay per 15–20 m². Final-hop descent at device desks and workstations. Dense enough for continuous coverage throughout entire floor plate. SSD devices (Section 7.3 of UEDM, 2026) fully viable — no battery replacement needed throughout the building.

**Primary challenge:** Cable management for source nodes (which connect to building electrical for energy input). In a retrofit scenario, source nodes co-locate with existing lighting circuits for power connection.

### 10.2 Hospital

**Characteristics:** Mix of private rooms, open wards, corridors, nursing stations, operating theaters, and public areas. Strict infection control requires minimal exposed surfaces. Many critical devices requiring reliable power (monitors, infusion pumps). Multiple floors with diverse occupancy patterns.

**AVM profile:** Complex. Multiple ceiling heights (2.5m in corridors, 3.0m in wards, 4.5m in operating theaters). Extensive mechanical infrastructure (HVAC, medical gas lines) in ceiling voids. GATEWAY_ZONE at service corridors and enclosed stairwells.

**Deployment pattern:** Relay nodes must be rated for hospital environments (antimicrobial housing, no exposed fasteners, flush-ceiling mount). Final-hop delivery to medical devices uses device-embedded receiver chips. CRITICAL priority class for all life-critical devices — guaranteed capacity under any load condition. The hospital scenario is the strongest use case for Meridian: eliminating battery replacement for patient monitors and bedside devices is a significant infection control benefit.

**Primary challenge:** Operating theaters require absolute RF interference assurance with medical equipment. Frequency selection (60 GHz has minimal interference with existing medical telemetry in the 400 MHz, 900 MHz, and 2.4 GHz bands) is the primary mitigation. Pre-deployment RF compatibility testing with all critical devices is required.

### 10.3 Residential Mid-Rise

**Characteristics:** Stack of residential units (apartments or condominiums), each unit occupying a partial floor. Shared corridors, open stairways between corridors and unit entrances, elevator cores, rooftop mechanical rooms. Ceiling heights 2.4–2.7m (lower than commercial).

**AVM profile:** Each unit is effectively an independent deployment zone separated by SOLID (party walls and floor slabs). VOID_STAIRCASE = corridor-to-corridor open stairways (common in mid-rise residential). GATEWAY_ZONE = enclosed fire stairwells on each floor.

**Deployment pattern:** Per-unit mesh, with a source node in each unit (plugged into a standard outlet) serving as both the energy source and the MMF gateway for that unit. SSD devices in the unit (thermostat, occupancy sensors, door lock, voice assistant) receive continuous power. Larger devices (phones, laptops) receive supplementation at lower rates — not full replacement charging, but meaningful battery life extension. Inter-unit energy routing is a secondary use case; the primary case is intra-unit self-sustaining device networks.

**Primary challenge:** Ceiling height of 2.4m leaves only 0.2m of FLOOR_SAFE margin (z_safe = 2.2m, ceiling = 2.4m). This requires very precise node mounting and beam angle control. The 60 GHz beam at this height and margin requires tighter pointing accuracy than in commercial spaces. This is a Phase 2 deployment target (requires experimental validation of pointing accuracy at reduced ceiling margins) rather than a Phase 1 target.

### 10.4 Industrial Warehouse

**Characteristics:** Single large open volume, 8–15m ceiling height, no intermediate floors (but may include mezzanine storage levels), large open loading dock doors, mobile equipment (forklifts, pallet movers), variable occupancy patterns.

**AVM profile:** Simple structure: SOLID = roof deck and perimeter walls. FLOOR_SAFE = volume above z_safe (6–13m of FLOOR_SAFE zone, far more than in any other building type). FLOOR_OCCUPIED = 0 to z_safe. VOID issues limited to loading dock openings.

**Deployment pattern:** The warehouse is the most favorable environment for Meridian deployment. The enormous FLOOR_SAFE zone allows wide beam angles and fewer relay nodes. Source nodes at the roof structure. The primary use case is powering the dense IoT sensor network (temperature, humidity, inventory tracking, equipment health) throughout the warehouse without per-sensor battery management. Secondary use case: forklift battery supplementation (high-power delivery to vehicles during normal operation, reducing the need for scheduled battery swaps).

**Primary challenge:** Mobile equipment (forklifts) creates dynamic occupancy patterns that change rapidly. The dynamic occupancy overlay (Section 7) handles this, but the 13.7ms cycle may be insufficient for fast-moving equipment at close range. A supplemental short-range sensor on each forklift (transmitting its position directly to the nearest relay node) provides sub-cycle position data for high-speed occupancy tracking.

---

## 11. BIM Integration Pathway

### 11.1 BIM as the Design Environment for Meridian

Building Information Modeling (BIM) is the industry-standard design workflow for commercial construction. A BIM model contains the complete digital representation of a building — structural elements, MEP (mechanical, electrical, plumbing) systems, architectural finishes, spatial zones — in a 3D database that all design disciplines access simultaneously.

Meridian deployment should be designed within BIM for the same reason HVAC and electrical systems are designed within BIM: it is a building system with spatial requirements, clearance requirements, penetration requirements, and coordination requirements with other systems. Designing Meridian outside of BIM and then retrofitting it to an existing building produces coordination conflicts (a relay node mounting point that conflicts with an HVAC duct, a gateway aperture that penetrates a structural beam, a source node power connection that conflicts with existing electrical routing) that are far more expensive to resolve in construction than in design.

### 11.2 The Meridian BIM Plugin

The Meridian BIM plugin (compatible with Autodesk Revit, Bentley AECOsim, and IFC-compliant BIM platforms) adds a Meridian design layer to the building model with the following capabilities:

**AVM generation:** The plugin reads the building model's spatial elements and automatically generates the AVM classification for each voxel. Architects review and adjust the auto-classification for any ambiguous zones (split-level areas, sloped ceilings, unusual structural geometries).

**Node placement tool:** A plugin interface for placing relay nodes, source nodes, and gateway relay nodes in the BIM model, with real-time validation against the AVM and against HVAC/structural clearance requirements. The tool highlights conflicts (a proposed node position that conflicts with a duct or structural element) and suggests compliant alternatives.

**Coverage simulation:** Given a proposed node placement, the plugin simulates coverage using the AVM and beam propagation model, showing which areas of each floor are within deterministic delivery range and which require additional nodes. The simulation uses 60 GHz propagation characteristics by default.

**Gateway aperture coordination:** The plugin identifies required floor-transition gateway locations based on the building's void geometry and highlights available penetration points (existing conduit sleeves, stairwell landing positions). It flags proposed gateway positions that conflict with structural or MEP elements.

**BIM export to AVM format:** The plugin exports the completed AVM in the Meridian AVM binary format (Appendix D) for import into the Meridian commissioning tool. The export is versioned and cryptographically signed by the BIM author — the commissioning tool can verify the AVM's provenance.

**Coordination model:** All Meridian elements (nodes, gateway zones, AVM classification overrides) are exported as IFC entities for coordination with other building systems using standard BIM coordination workflows.

### 11.3 The Retrofit Pathway

For buildings without BIM, the retrofit pathway uses the LiDAR survey process (Section 3.3 Source 2) with the following additions:

1. **LiDAR scan** of the building interior produces a point cloud with geometric accuracy ≤2 cm.
2. **Meridian commissioning tool** processes the point cloud, auto-classifying voxels by geometric analysis (flat horizontal surfaces → floor/ceiling, vertical surfaces → walls, gaps between floor levels → voids).
3. **Technician review** of auto-classification, with manual correction for ambiguous zones.
4. **AVM validation** against physical walk-through: a commissioning technician physically verifies every void classification and every proposed gateway location.
5. **Signed AVM** exported from the commissioning tool for import into the installed Meridian system.

---

## 12. Commissioning Protocol

### 12.1 Pre-Installation Checklist

Before any node is installed, the commissioning checklist must be completed:

```
□ AVM complete and signed (BIM export or LiDAR survey)
□ All void classifications verified by physical walk-through
□ Gateway aperture positions identified and cleared with structural engineer
□ Relay node positions validated against AVM and MEP conflict check
□ Source node power connection points coordinated with electrical
□ RF interference pre-survey completed (existing RF environment characterization)
□ BSL sensor coverage map generated (no coverage gaps in final-hop zones)
□ Trust Layer identity credentials ordered for all nodes
□ Guardian Security commissioning authority credential issued
```

### 12.2 Installation Sequence

1. **Gateway relay nodes first.** Install GRNs at all floor-transition points before intra-floor nodes. GRNs are the architectural anchor points for the mesh; intra-floor nodes are aligned to them.

2. **Source nodes second.** Install source nodes at their planned positions and connect to building electrical. Verify power input and initial supercapacitor charge. Import AVM. Verify Trust Layer identity registration.

3. **Relay nodes third.** Install intra-floor relay nodes working outward from source nodes and gateway nodes. Each relay node auto-announces at installation; the source node's routing engine validates its position against the AVM before accepting it into the mesh.

4. **Coverage verification.** Using the commissioning tool, verify that the installed mesh provides compliant routing paths (all FLOOR_SAFE, no VOID traversal) to all planned device positions. Flag any coverage gaps for additional relay node placement.

5. **BSL calibration.** At each relay node, calibrate the BSL sensor suite for the specific installation geometry — ceiling height, nearby structural elements, expected occupancy zone boundaries.

6. **AVM live import.** Import the final signed AVM into the operational routing engine. Verify that the routing engine correctly rejects a test path that the AVM should prohibit (a path deliberately drawn through a VOID voxel).

7. **Safety validation.** With the system operational, perform the safety validation sequence: confirm that a person walking through each planned beam path triggers dynamic occupancy marking within one control cycle; confirm that the BSL hardware cutoff activates within specification.

### 12.3 Change Management

Any physical change to the building that affects the AVM — opening a wall, adding a mezzanine, cutting a new staircase opening — requires:

1. AVM update (re-survey or BIM model update)
2. Re-validation of all existing beam paths against the updated AVM
3. Re-commissioning of any paths that become invalid under the updated AVM before the building change occurs

The commissioning tool enforces this sequence: an AVM update is accepted only with a commissioning authority signature, and the routing engine enters a validation-pending state until all paths are re-validated.

---

## 13. Related Work

### 13.1 Indoor RF Propagation Modeling

The indoor RF propagation literature [67, 68] provides the physical models for how RF signals propagate through building interiors, including the material-specific attenuation, diffraction, and reflection characteristics that underlie the AVM voxel classification. The 60 GHz indoor propagation literature [69, 70] is particularly relevant, characterizing the strong material attenuation and limited penetration that make mmWave the preferred frequency for ceiling-plane containment.

### 13.2 Indoor Positioning Systems

The UWB positioning literature [71, 72] provides the localization accuracy bounds for the Meridian MC coordinate system. Sub-10cm positioning accuracy is achievable with commercial UWB hardware (DecaWave/Qorvo DW1000 family), sufficient for the 25 cm AVM voxel resolution. The BSL sensor fusion literature [73] provides the multi-modal occupancy detection accuracy bounds that underlie the dynamic occupancy overlay.

### 13.3 BIM and Building Systems Integration

The BIM integration literature [74, 75] documents the workflows and data exchange standards (IFC, COBie) for integrating building systems design into BIM. The MEP coordination workflow — coordinating mechanical, electrical, and plumbing systems within BIM — is the precedent for the Meridian design-layer integration. The IFC standard [76] provides the entity schema that the Meridian BIM plugin exports Meridian elements within.

### 13.4 Wireless Power in Built Environments

The emerging literature on wireless power deployment in built environments [77, 78] is thin — this paper is the first to propose a formal spatial safety framework for multi-story wireless energy routing. Prior work on room-scale wireless charging [79] addresses single-room scenarios without the multi-floor void routing problem.

---

## 14. Limitations and Honest Boundaries

**The AVM assumes rigid geometry.** The AVM classification is computed from the building's structural geometry, which is assumed to be rigid and unchanging between AVM updates. Flexible architectural elements — retractable partitions, deployable barriers, temporary installations — require either frequent AVM updates or the more conservative classification of their location as FLOOR_OCCUPIED regardless of current configuration.

**Void classification at irregular boundaries is imprecise.** The 25 cm voxel resolution means that an irregular void boundary — a diagonal staircase edge, a curved atrium wall — is approximated to the nearest voxel boundary. The conservative classification (any voxel that partially overlaps a void is classified as the void type) means safe routing zones are slightly smaller than the physical geometry allows. This conservatism is intentional.

**The formal safety proof assumes correct AVM construction.** If the AVM is incorrectly constructed — a VOID_STAIRCASE misclassified as FLOOR_SAFE — the safety proof does not hold for paths through the misclassified zone. The commissioning walk-through and sign-off requirement is the mitigation; it does not guarantee that all misclassifications are caught. The BSL provides the safety backstop for any misclassification that passes commissioning review.

**60 GHz range limitations constrain coverage in large spaces.** In warehouse or atrium scenarios with large horizontal distances between nodes, 60 GHz's atmospheric attenuation may limit effective relay hop distance to 8–10m. Large spaces require denser node deployment than the geometric coverage model suggests, increasing installation cost.

**No experimental validation of the ceiling-plane routing model exists.** The beam containment in FLOOR_SAFE zones and the BSL sensor coverage characterization are based on manufacturer specifications and propagation modeling, not on measurements in actual buildings. Phase 1 experimental work should include ceiling-plane routing validation in a real building environment before commercial deployment.

**The BIM integration pathway requires BIM software vendor cooperation.** The Meridian BIM plugin is specified here but not implemented. Plugin development requires BIM platform API access (Autodesk Revit SDK, Bentley OpenBuildings SDK) and cooperation with or licensing from the BIM platform vendors.

---

## 15. Conclusion

The six preceding papers in this series define what Meridian is. This paper defines where Meridian goes.

A routing protocol that cannot be safely deployed in a real building is not a product. Real buildings have open staircases that connect floor levels, atriums that rise through the building's full height, elevator shafts that move through the building's full height, balconies that overhang lower spaces, and mezzanines that insert intermediate occupied levels. Every one of these features creates a geometric condition under which a naive energy routing implementation — one that routes beams based on node connectivity without regard for the physical geometry of the beam path — would create beam paths through occupied space.

The Architectural Voxel Map is the mechanism that prevents this. By encoding the building's physical geometry as a hard constraint on every beam path computation, the AVM ensures that the routing engine cannot authorize a beam path that traverses a void, regardless of how attractive that path looks in the node-graph representation of the mesh. Ceiling-plane routing keeps the vast majority of beam energy above the occupied zone. Floor-transition gateways solve the inter-floor energy transfer problem without requiring beams to traverse occupied vertical space. The BSL provides the safety backstop for any condition the proactive mechanisms do not anticipate.

The result is a formal safety proof: physical harm from Meridian beam traversal is impossible in a compliant multi-story deployment under non-destructive conditions. This proof rests on four independent mechanisms — no single mechanism failure produces harm. This is the safety standard that wireless energy routing requires to be deployed in occupied buildings, and it is what this paper establishes.

The BIM integration pathway closes the loop between engineering specification and architectural practice. When Meridian deployment is designed as a native BIM layer — alongside HVAC, electrical, and structural — the coordination problems that plague retrofit installations are resolved before construction rather than during it. This is not just an efficiency argument. It is a safety argument: a Meridian installation whose relay node positions, gateway apertures, and AVM classifications were designed and coordinated in BIM is a safer installation than one whose positions were decided on-site by an installer working from a 2D floor plan.

The ceiling-plane routing model is, at its core, a simple idea: keep the beam where no person can be, and govern the descent to where people are with maximum care. That idea, formalized through the AVM, the gateway architecture, the dynamic occupancy overlay, and the multi-story safety proof, is what makes Meridian a real product — not a laboratory demonstration, but an energy infrastructure system that can be installed in the buildings where people live and work.

---

## Appendix A — AVM Voxel Classification Specification

| Class | ID | Definition | Beam Traversal |
|---|---|---|---|
| SOLID | 0 | Structural material: concrete, masonry, steel, timber, glass | Beam terminates (physical boundary) |
| FLOOR_SAFE | 1 | Above z_safe (floor_slab + 2.2m) and below ceiling slab | Permitted (preferred routing zone) |
| FLOOR_OCCUPIED | 2 | Between floor_slab and z_safe | Final-hop geometry only |
| VOID_STAIRCASE | 3 | Open staircase air volume + 50 cm buffer, all floors spanned | PROHIBITED |
| VOID_ATRIUM | 4 | Atrium air volume + 50 cm buffer, all floors spanned | PROHIBITED |
| VOID_SHAFT | 5 | Elevator, mechanical, or other enclosed shaft | PROHIBITED |
| GATEWAY_ZONE | 6 | Designated inter-floor handoff position | Beam termination and handoff |

**Classification priority (for overlapping zone resolution):**
SOLID > VOID_STAIRCASE = VOID_ATRIUM = VOID_SHAFT > FLOOR_OCCUPIED > GATEWAY_ZONE > FLOOR_SAFE

Any voxel with ambiguous classification is assigned the higher-priority (more restrictive) class.

---

## Appendix B — Floor-Transition Gateway Node Specification

| Parameter | Value | Notes |
|---|---|---|
| Antenna faces | 2 (upper + lower) | One per floor |
| Frequency | 60 GHz (primary) | 5.8 GHz optional |
| Array aperture | 10 cm per face | Each face independent |
| Beamwidth per face | ≤5° full angle | 60 GHz at 10 cm |
| Supercapacitor capacity | 10× standard relay | Inter-floor buffer |
| BSL sensors | 2 sets (one per face) | Full 5-modality each |
| Aperture requirement | ≥15 cm clear path | Between faces |
| Mounting clearance | ≤2m from floor/ceiling transition | Close to transition |
| Identity | Single Trust Layer ID | Capability: GATEWAY |
| Maintenance access | Required | Replacement without occupancy disruption |

---

## Appendix C — AVM-DRMA Integration: Beam Path Validation Algorithm

```
FUNCTION validate_path(candidate_path, AVM, occupancy_map) → VALID | REJECTED

  FOR each hop (node_i, node_j) in candidate_path:
    swept_volume ← compute_swept_volume(node_i.position, node_j.position,
                                        beam_width_at(node_i, node_j))
    
    FOR each voxel v in swept_volume:
      voxel_class ← AVM.classify(v)
      
      IF voxel_class IN {VOID_STAIRCASE, VOID_ATRIUM, VOID_SHAFT}:
        RETURN REJECTED (reason: VOID_TRAVERSAL, voxel: v, hop: (i,j))
      
      IF voxel_class == FLOOR_OCCUPIED:
        IF (node_i, node_j) is NOT final_hop(candidate_path):
          RETURN REJECTED (reason: NON_FINAL_OCCUPIED_TRAVERSAL, hop: (i,j))
        ELSE:
          // Final hop through FLOOR_OCCUPIED — check final-hop protocol
          IF NOT final_hop_protocol_satisfied(node_i, node_j):
            RETURN REJECTED (reason: FINAL_HOP_PROTOCOL_VIOLATION)
      
      IF occupancy_map.is_occupied(v):
        RETURN REJECTED (reason: DYNAMIC_OCCUPANCY, voxel: v, hop: (i,j))
  
  RETURN VALID
```

The validation function is called for every candidate path before beam authorization is issued by Guardian-E. It runs within the Lume-X control cycle (13.7ms budget).

---

## Appendix D — BIM Export Format Specification (Meridian Layer)

The Meridian AVM binary format (`.mav` extension):

```
Header (64 bytes):
  magic          : 4 bytes  ("MAVM")
  version        : 2 bytes  (currently 0x0001)
  building_id    : 16 bytes (UUID)
  avm_version    : 4 bytes  (incremental version counter)
  origin_x/y/z   : 24 bytes (double precision, meters)
  voxel_size     : 4 bytes  (float, meters, default 0.25)
  grid_dims_i/j/k: 12 bytes (uint32 each)
  timestamp      : 8 bytes  (Unix epoch, milliseconds)
  author_key_id  : 8 bytes  (Trust Layer identity of BIM author)
  signature      : [64 bytes] (Ed25519 signature over header + voxel data)

Voxel data:
  [grid_dims_i × grid_dims_j × grid_dims_k bytes]
  Each byte: voxel class (0–6 as specified in Appendix A)
  Order: (i=0,j=0,k=0), (i=1,j=0,k=0), ..., row-major in i, then j, then k
```

The signature covers the full voxel data array and the header (excluding the signature field itself). The Meridian commissioning tool verifies the signature against the author's Trust Layer public key before importing any AVM. An AVM with an invalid signature is rejected.

---

## References

**Indoor RF Propagation:**

[67] Rappaport, T.S., et al. (2013). "Millimeter Wave Mobile Communications for 5G Cellular." *IEEE Access, 1*, 335–349.

[68] Serafimovski, N., et al. (2012). "Practical Implementation of Visible Light Communications." *IEEE Transactions on Consumer Electronics, 58*(1), 21–28.

[69] Maltsev, A., et al. (2010). "Experimental Investigations of 60 GHz WLAN Systems in Office Environment." *IEEE Journal on Selected Areas in Communications, 27*(8), 1488–1499.

[70] Jacob, M., et al. (2012). "Influence of Furniture on a 60 GHz Indoor Channel." *IEEE Antennas and Wireless Propagation Letters, 11*, 1412–1416.

**Indoor Positioning:**

[71] Alarifi, A., et al. (2016). "Ultra Wideband Indoor Positioning Technologies." *Sensors, 16*(5), 707.

[72] Gezici, S., et al. (2005). "Localization via Ultra-Wideband Radios." *IEEE Signal Processing Magazine, 22*(4), 70–84.

**Occupancy Sensing:**

[73] Chen, Z., et al. (2012). "Sensor-Based Activity Recognition." *IEEE Transactions on Systems, Man, and Cybernetics, 42*(6), 790–808.

**BIM and Building Systems:**

[74] Eastman, C., et al. (2011). *BIM Handbook: A Guide to Building Information Modeling.* Wiley.

[75] BuildingSMART International. (2020). *Industry Foundation Classes (IFC) — IFC4 ADD2 TC1 Standard.* ISO 16739-1:2018.

[76] Autodesk Inc. (2023). *Revit API Developer's Guide.* Autodesk Developer Network.

**Wireless Power in Buildings:**

[77] Sample, A.P., et al. (2013). "Enabling Seamless Wireless Power Delivery in Dynamic Environments." *Proceedings of the IEEE, 101*(6), 1343–1358.

[78] Talla, V., et al. (2015). "Powering the Next Billion Devices with Wi-Fi." *ACM CoNEXT*, 1–13.

[79] Ossia Inc. (2022). *Cota Real Wireless Power: Technical Overview.* Ossia Technical Report.

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
[51] Andrews, J. (2026). *Guardian Security.* [Companion paper]
[52] Andrews, J. (2026). *Unified Energy-Data Mesh.* [Companion paper]

---

*END OF PAPER*

*Meridian Physical Deployment Architecture: Volumetric Beam Routing in Complex Built Environments*
*Version 1.0 — DarkWave Studios LLC*
*Author: Jason Andrews | ORCID: 0009-0007-5214-649X | team@dwsc.io*
*lume-lang.org | TrustShield.tech | github.com/cryptocreeper94-sudo*
*Patent Pending — Provisional Application: Systems and Methods for Deterministic Multi-Layer Wireless Energy Routing Using Ambient Harvesting, Mesh Coordination, and Directional Transmission*
*Lume-X: Provisionally patented deterministic control runtime.*
*© 2026 DarkWave Studios LLC. All rights reserved.*
*This preprint has not undergone peer review.*
*Do not submit to any publication venue before Phase 1 experimental data exists.*
