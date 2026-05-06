# Meridian Infrastructure — Complete Engineering Specification
## Deterministic Roadway Wireless Energy Network

**Author:** Jason Andrews / DarkWave Studios LLC
**ORCID:** 0009-0007-5214-649X
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Date:** May 2026
**Version:** 1.0 — Architecture / Infrastructure Design

---

## Purpose

This document specifies the Meridian Infrastructure system — a roadway-embedded wireless energy transfer network governed in real time by the Meridian synthetic organism (Lume 4/42 architecture). Meridian nodes embedded in road surfaces transfer energy to passing vehicles via resonant inductive coupling. The Meridian organism governs resonance stability, multi-vehicle load distribution, interference suppression, and adaptive routing across the node network — deterministically.

This is not a dumb power delivery system. Every kilowatt delivered to every vehicle is governed by a 42-node organism that ensures stable, interference-free, optimally routed energy transfer. Same traffic conditions always produce the same power allocations. Always.

---

## System Overview

```
GRID / RENEWABLE SOURCE
         │
         ▼
MERIDIAN CONTROL UNIT (per road segment)
  42-node organism engine
  Node network manager
  Vehicle communication layer
         │
    ┌────┴────┐
    ▼         ▼
NODE 1    NODE 2  ... NODE N
(road)    (road)       (road)
  ↑↑↑       ↑↑↑         ↑↑↑
  │││       │││         │││
  Wireless coupling to passing vehicles
  │││       │││         │││
Vehicle A  Vehicle B  Vehicle C
(HydroCore Drive or compatible receiver)
```

Each road segment (100–500 meter span) is managed by one Meridian Control Unit. Multiple segments connect to a regional Meridian network that enables cross-segment vehicle handoff as vehicles travel.

---

## The Meridian 42-Node Roadway Mapping

The four Meridian primitives — Resonance Flow, Load Distribution Flow, Interference Flow, and Adaptive Routing Flow — map directly to the four governance domains of a wireless energy transfer network.

### Primitive 1 — Resonance Flow (RF1–RF10, 10 nodes)

Resonance Flow governs the stability of the electromagnetic carrier field. Wireless power transfer via resonant inductive coupling requires the transmitter and receiver coils to be tuned to the same resonant frequency. Environmental factors — temperature, ground composition, vehicle speed, metallic objects nearby — perturb the resonant frequency. Meridian governs the carrier stability across all active nodes simultaneously.

| Node | Name | Physical Signal | Conversion |
|---|---|---|---|
| RF1 | Carrier Stability | Primary coil frequency lock — deviation from target (Hz) | 1 − (|Δf| / f_tolerance), clamped |
| RF2 | Resonance Drift | dF/dt over 200ms — rate of frequency drift | 1 − (drift_rate / drift_limit), clamped |
| RF3 | Coupling Coefficient | Magnetic coupling factor k between transmitter and receiver coil | k itself (already 0–1, mapped to 0 to +1.0) |
| RF4 | Q-Factor Stability | Loaded Q-factor deviation from design value | 1 − (|ΔQ| / Q_tolerance), clamped |
| RF5 | Phase Alignment | Phase angle between transmitter current and receiver voltage | cos(phase_error), clamped |
| RF6 | Frequency Interference | External EMI at operating frequency band | 1 − (EMI_level / EMI_threshold), clamped |
| RF7 | Resonance Recovery Speed | Time to re-lock resonance after perturbation | 1 − (recovery_ms / limit_ms) |
| RF8 | Field Uniformity | Magnetic field strength variance across coil surface | 1 − (variance / max_variance), clamped |
| RF9 | Resonance Volatility | Standard deviation of carrier frequency over 1 second | 1 − (stddev / stddev_threshold) |
| RF10 | Resonance Safety Index | min(RF1, RF3, RF5) weighted | Safety node |

**RF3 Coupling Coefficient** is the primary efficiency node. k ranges from 0 (no coupling) to 1 (perfect coupling). In roadway deployment at typical vehicle ground clearance (100–250mm), k values of 0.2–0.6 are achievable with well-designed coil geometry. Meridian governs all other variables to maximize k for each vehicle.

### Primitive 2 — Load Distribution Flow (LD1–LD10, 10 nodes)

Load Distribution Flow governs how available power is allocated across multiple vehicles simultaneously receiving from the same road segment. This is the governance domain unique to roadway networks — a single charging station serves one vehicle at a time; a Meridian road segment may serve 5–20 vehicles simultaneously.

| Node | Name | Physical Signal | Notes |
|---|---|---|---|
| LD1 | Grid Power Availability | Available input power from grid (kW) | Normalized to segment rated capacity |
| LD2 | Total Vehicle Demand | Sum of all vehicle power requests on segment (kW) | If > LD1, allocation begins |
| LD3 | Allocation Efficiency | Power delivered / power requested ratio | |
| LD4 | Priority Distribution | Emergency/safety vehicle priority weighting active | Binary modifier |
| LD5 | Demand Variance | Variance in per-vehicle demand over 30-second window | |
| LD6 | Overload Risk | LD2 / LD1 ratio when > 0.8 | |
| LD7 | Load Recovery Speed | Recovery to balanced allocation after vehicle entry/exit | |
| LD8 | Distribution Uniformity | Variance of per-vehicle received power vs. requested | |
| LD9 | Load Drift | Rolling mean of LD3 over 60-second window | |
| LD10 | Load Safety Index | min(LD1, LD6, LD3) | Safety node — overload protection |

**Multi-vehicle allocation algorithm (deterministic):**

When total vehicle demand exceeds available grid power (LD6 triggered):

```
1. Emergency vehicles: full requested power, always (LD4 priority)
2. Vehicles with H2 buffer < 20%: 80% of requested power
3. Vehicles with battery SOC < 30%: 70% of requested power
4. All other vehicles: proportional share of remaining capacity
5. Allocation is recalculated every 100ms (10Hz)
6. Same vehicle state vector → same power allocation. Always.
```

### Primitive 3 — Interference Flow (IF1–IF11, 11 nodes)

Interference Flow governs electromagnetic interference between adjacent nodes and between vehicles. Multiple coils operating simultaneously at similar frequencies create cross-coupling, interference patterns, and potential resonance conflicts. Meridian suppresses interference deterministically.

| Node | Name | Physical Signal | Notes |
|---|---|---|---|
| IF1 | Cross-Node Interference | Field strength from adjacent nodes at current node location | 1 − (cross_field / cross_threshold) |
| IF2 | Vehicle Cross-Coupling | EMI from one vehicle's receiver affecting another vehicle's transfer | |
| IF3 | External EMI Load | Ambient EMI in operating frequency band (not from Meridian) | |
| IF4 | Harmonic Interference | Energy at harmonics of operating frequency from any source | |
| IF5 | Interference Onset | Rate of change of IF1+IF2 combined — early warning | |
| IF6 | Spectral Purity | Transmitter signal purity — harmonic distortion level | |
| IF7 | Interference Recovery Speed | Time to clear interference after source removed | |
| IF8 | Near-Field Coupling | Unintended coupling to non-vehicle metallic objects (guardrails, etc.) | |
| IF9 | Interference Volatility | Variance of IF1+IF2+IF3 over 1 second | |
| IF10 | Shielding Effectiveness | Measured isolation between adjacent nodes | |
| IF11 | Interference Safety Index | min(IF1, IF3, IF6) | Safety node |

**Interference suppression mechanism:**
Adjacent nodes are assigned orthogonal frequency slots (FDMA) or time slots (TDMA) by the Meridian Adaptive Routing primitive. IF nodes monitor actual interference and trigger slot reassignment when IF1 or IF2 exceed caution threshold.

### Primitive 4 — Adaptive Routing Flow (AR1–AR11, 11 nodes)

Adaptive Routing Flow governs how the network optimally assigns vehicles to nodes, frequency slots, time slots, and power levels as vehicles move through the road segment. This is the intelligence layer of the Meridian network.

| Node | Name | Physical Signal | Notes |
|---|---|---|---|
| AR1 | Route Optimality | Current routing efficiency vs. theoretical maximum | |
| AR2 | Handoff Smoothness | Power continuity during vehicle transition between nodes | Measured as power drop during handoff |
| AR3 | Slot Utilization | % of available frequency/time slots actively used | |
| AR4 | Vehicle Throughput | Vehicles successfully served per hour per segment | |
| AR5 | Routing Drift | Deviation of actual routing from optimal routing over time | |
| AR6 | Congestion Index | Ratio of vehicle demand to routing capacity | |
| AR7 | Routing Recovery Speed | Time to reach optimal routing after topology change | |
| AR8 | Predictive Accuracy | Accuracy of vehicle arrival prediction for pre-positioning | |
| AR9 | Routing Volatility | Change rate of routing assignments over 30-second window | |
| AR10 | Handoff Success Rate | % of vehicle-to-vehicle node transitions with < 10% power drop | |
| AR11 | Routing Safety Index | min(AR1, AR2, AR10) | Safety node |

**AR2 Handoff Smoothness** is the most operationally critical node for the driver experience. As a vehicle moves from one node to the next, the power transfer must continue smoothly. Meridian pre-positions the next node (activating it at the correct frequency and power level before the vehicle arrives) using vehicle speed and trajectory data to minimize the handoff gap.

---

## Node Hardware Specification (Per Road Node)

### Physical Installation

Each Meridian road node is a coil assembly embedded in the road surface:

| Component | Specification | Notes |
|---|---|---|
| Primary transmitter coil | Litz wire, 300–800mm diameter, flat spiral | Optimized for 100–300mm coupling distance |
| Coil former | Glass fiber reinforced polymer (GFRP) | Non-conductive, road-rated load bearing |
| Coil encapsulation | Epoxy resin, IP68 rated, road grade | Protects from moisture, road loads |
| Power electronics module | Roadside mounting, weatherproof enclosure | Class D inverter + resonance controller |
| Node controller | STM32H7 or equivalent | Runs local node firmware, communicates to segment MCU |
| Temperature sensor | PT100 RTD | Coil and power electronics temperature |
| Current/voltage sensors | Hall effect CT, isolated voltage divider | Power metering per node |
| EMI sensors | Broadband antenna, 81kHz–300kHz band | RF1–RF10 and IF1–IF11 node data |
| Vehicle detection | Inductive loop or LIDAR | Vehicle presence and speed |

**Operating frequency:** 81–90 kHz (within SAE J2954 recommended band for dynamic wireless charging). Frequency assigned per-vehicle by Meridian Adaptive Routing to minimize interference.

**Node spacing:** 3–5 meters center-to-center. At 60 mph (27 m/s), a vehicle traverses one node every 110–185 milliseconds. Handoff pre-positioning begins 2 nodes ahead of current position.

**Node power rating:** 3–22 kW per node (scalable by power electronics sizing). Vehicle receiver coil rating determines practical maximum.

### Segment Control Unit

One Segment Control Unit manages 20–100 nodes (100–500 meter road span):

| Component | Specification |
|---|---|
| Processor | Industrial STM32MP1 (ARM Cortex-A7 + M4) or Raspberry Pi CM4 industrial |
| Meridian engine | Full 42-node HydroCore equivalent, adapted for Meridian primitives |
| Node communication | CAN bus or RS-485, one per node |
| Vehicle communication | 5.9 GHz DSRC (Dedicated Short Range Communications) per WAVE standard |
| Grid interface | Three-phase metering + smart grid communication (OCPP 2.0) |
| Uplink | 4G/5G + fiber fallback |
| Logging | Industrial SSD, 30-day rolling buffer |
| Redundancy | Hot-standby secondary processor |

---

## Operating Modes

### STABILITY MODE
**Trigger:** All primitives advisory or better, normal traffic conditions.
**Behavior:** All active vehicle transfers proceeding at requested rates. Node frequency assignments stable. Interference within bounds.

### POWER MODE
**Trigger:** Grid capacity high, vehicle demand moderate, all primitives healthy.
**Behavior:** Pre-activate nodes ahead of arriving vehicles. Maximize delivered power to all served vehicles. AR3 slot utilization maximized.

### SAFETY MODE
**Trigger:** Any safety index node critical (RF10, LD10, IF11, AR11 at −0.8 or below). OR: external EMI event, grid fault, coil fault.
**Behavior:** Affected nodes powered down immediately. Neighboring nodes adjust frequency allocation. Vehicles routed to non-faulted nodes. Grid isolation if required.

### RECOVERY MODE
**Trigger:** Node coil or power electronics temperature elevated. Grid power reduced.
**Behavior:** Reduce per-node power output. Increase node spacing for thermal recovery. LD2 demand reduced proportionally.

### BALANCE MODE
**Trigger:** LD6 Overload Risk at caution — vehicle demand approaching grid capacity.
**Behavior:** Allocation algorithm activates. Emergency priority vehicles served first. Others receive proportional share. AR routing shifts to maximize overall throughput.

---

## Vehicle Coupling Protocol

### Handshake Sequence

```
1. Vehicle enters segment detection zone (LIDAR or inductive loop)
2. Segment MCU receives: vehicle speed, trajectory, receiver coil specification
3. Vehicle broadcasts: battery SOC, electrolyzer demand (kW), H2 buffer level,
                       receiver coil resonant frequency, vehicle ID
4. Meridian assigns: frequency slot, time slot, target node sequence,
                     power allocation (kW), handoff timing
5. Node pre-positions at vehicle's assigned frequency before arrival
6. Transfer begins: AR2 handoff smoothness governs power continuity
7. Vehicle exits segment: segment MCU transmits handoff data to next segment MCU
8. Next segment pre-positions without interruption
```

**Handshake latency target:** < 50ms from vehicle detection to first power assignment.
**Handoff gap target:** < 100ms power interruption between nodes (AR2 goal).
**Re-acquisition on exit/re-entry:** < 200ms.

### HydroCore Drive Integration

HydroCore Drive vehicles communicate their electrolyzer state to Meridian:

```
Vehicle → Meridian broadcast (100ms intervals):
{
  vehicle_id: string,
  receiver_coil_spec: { frequency_hz, rated_kw, coil_diameter_mm },
  requested_power_kw: float,        // electrolyzer demand
  battery_soc_pct: float,
  h2_buffer_pct: float,
  hydrocore_mode: string,           // which mode HydroCore is in
  priority_class: string            // standard | emergency
}

Meridian → Vehicle response (100ms intervals):
{
  allocated_power_kw: float,
  assigned_frequency_hz: float,
  assigned_node_id: string,
  next_node_id: string,             // pre-positioning info
  handoff_time_ms: int,             // when to expect handoff
  segment_load_pct: float           // how loaded this segment is
}
```

HydroCore Drive's Meridian coupling nodes (PR8, FS9, TB10) update from this response data. If `allocated_power_kw` is high → PR8 Pressure Load decreases (more power available, less load on battery). If handoff is smooth → FS9 Flow Drift stays stable.

---

## Safety Layer (Infrastructure)

### Electromagnetic Safety

Operating at 81–90 kHz, the magnetic field outside the designated coupling zone must remain below ICNIRP guidelines for general public exposure (27 A/m at 81 kHz). Enforcement:

- Active field monitoring via EMI sensors at road edges
- IF nodes (IF8 Near-Field Coupling) detect unintended coupling to guardrails, non-vehicle objects
- Pedestrian detection via LIDAR — node deactivates within 200ms of pedestrian on roadway
- IF11 critical → immediate node power-down

### Grid Fault Protection

- Ground fault interrupt on every node power electronics module
- Segment isolation within 50ms of grid fault detection
- LD10 critical → segment power-down, grid isolation, alert to regional operator

### Vehicle Safety

Meridian never exceeds a vehicle's declared receiver rating. The vehicle declares `rated_kw` during handshake. Meridian never allocates more than that value. If a vehicle fails to respond for 500ms, its power allocation drops to zero.

---

## Determinism Test (Infrastructure)

1. Place test vehicle on segment at defined speed (60 mph), defined SOC (70%), defined H2 demand (5 kW), defined receiver spec.
2. Record complete 42-node Meridian state vector and power allocation issued.
3. Clear session. Repeat with identical vehicle and conditions.
4. Verify 42-node state and power allocation are identical.
5. Add a second vehicle with defined state. Record both allocations.
6. Repeat. Verify allocations are identical.
7. Trigger IF1 interference condition (external EMI injection). Record mode transition and node response.
8. Repeat EMI injection. Verify mode transition and response are identical.

---

## Meridian Network Scale

### Single Segment
100–500 meters, 20–100 nodes, 1 Segment Control Unit.
Serves 5–20 vehicles simultaneously at 60 mph.
Grid connection: 100–500 kW three-phase.

### Corridor
Multiple segments, regional Meridian Network Controller.
Segments communicate vehicle handoff data at inter-segment boundaries.
Vehicle experiences continuous power throughout corridor without gap.

### Metropolitan Network
Regional controllers connect to city-level Meridian Network Manager.
Manages priority routing (emergency vehicles), demand forecasting, grid load balancing.
Meridian organism state data available to city traffic management systems.

---

## Energy Source Compatibility

Meridian infrastructure is energy-source agnostic at the grid interface:

| Source | Notes |
|---|---|
| Municipal grid | Standard three-phase connection, smart meter |
| Dedicated solar farm | Highway median or roadside solar canopy |
| Wind generation | Highway-adjacent wind turbines |
| Grid battery storage | Enables Meridian operation during grid low/fault periods |
| Vehicle-to-grid (V2G) | HydroCore Drive vehicles with surplus H2 can feed back |

V2G capability: HydroCore Drive vehicles with full H2 buffer and high battery SOC can reverse the coupling — fuel cell output feeds back to Meridian segment, providing grid support during peak demand. Meridian governs bidirectional power flow through the same 42-node architecture with inverted LD node interpretations.

---

## Companion Documents

- `meridian-infrastructure-paper.md` — Canon² paper (academic)
- `hydrocore-drive-spec.md` — Vehicle system this infrastructure serves
- `hydrocore-drive-paper.md` — Vehicle system Canon² paper

---

## Metadata

**Author:** Jason Andrews / ORCID: 0009-0007-5214-649X
**Organization:** DarkWave Studios LLC / Contact: team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Source organism:** Meridian (meridian-paper.md)
