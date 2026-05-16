# BUILD AGENT — LUME-OPS RECON
## Windows Enterprise Application for Manheim Lot Operations
**Issued by:** Jason Andrews, DarkWave Studios LLC / Lume42 Labs
**Version:** 1.0
**Domain:** `lotopspro.com` *(future — switch when ready)*
**Context:** This is the enterprise-facing product layer that sits on top of the Lume-Auto organism and Cox Automotive Ledger (CAL) node network. It is what Manheim's lot managers, reconditioning coordinators, and transport dispatchers actually touch every day.

---

## WHAT THIS IS

**Lume-Ops Recon** is a Windows desktop application that delivers Lume-Auto's organism intelligence and CAL's immutable record infrastructure to Manheim lot staff through a clean, installable enterprise tool.

It is not a new product. It is the enterprise packaging of three things that already exist:

| Layer | What it is | What it does |
|---|---|---|
| **Lume-Ops Recon** | Windows executable (what they see) | Dashboard, reports, alerts, arbitration viewer |
| **Lume-Auto** | Deterministic organism (what runs) | 42-node vehicle governance, condition scoring, fault detection |
| **Cox Automotive Ledger (CAL)** | Node network (what connects) | Immutable record ledger, cross-location sync, audit trail |

The lane manager installs Lume-Ops Recon. They never need to know what's underneath it.

---

## DEPLOYMENT ARCHITECTURE — TWO-TRACK STRATEGY

The Lume ecosystem deploys across two distinct tracks. Same organism engine, same CAL network underneath — different delivery layer based on context.

| Track | Platform | Product | Target User |
|---|---|---|---|
| **Mobile** | iOS + Android — Expo native build | Lume-Auto | Consumer drivers, personal vehicles, small fleet owners |
| **Desktop** | Windows + Linux — local installation | Lume-Ops Recon | Manheim lot staff, enterprise fleet operators, lane managers, recon coordinators |

**What this means for the build agent:**
- The Expo mobile build and the Windows/Linux desktop build share the same Lume-Auto organism core and CAL node infrastructure
- The mobile app is the consumer and small business entry point
- Lume-Ops Recon is the enterprise entry point — installed locally on lot workstations, tablets (Windows/Linux), and laptops
- Both tracks feed into the same Cox Automotive Ledger (CAL) node network — a vehicle scanned on a mobile device and a vehicle scanned through Lume-Ops Recon both write to the same immutable ledger

---

## THE THREE-LAYER STACK

```
┌─────────────────────────────────────┐
│           LUME-OPS RECON               │
│      Windows Desktop Application    │
│  (Lane Manager / Recon / Transport) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│           LUME-AUTO                 │
│    Deterministic Organism Engine    │
│  42-node OBD-II governance · 100ms  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         TRUST LAYER NODE            │
│  Immutable Record Ledger · POA Net  │
│  1 node per Manheim location        │
└─────────────────────────────────────┘
```

Each Manheim location runs one CAL node. 300 locations = 300 nodes. The network is Manheim's — they operate it, they own the data, they control access.

---

## LUME-OPS RECON — FEATURE MODULES

### Module 1: Vehicle Intake Scanner
- Technician connects OBD-II adapter to incoming vehicle
- Lume-Auto organism runs full 42-node scan
- Lume-Ops Recon displays structured condition report in real time
- Report is written to the local CAL node (immutable, timestamped)
- Lane readiness score generated automatically

### Module 2: Condition Report Dashboard
- All intake scans for the current day, sorted by lot arrival time
- Per-vehicle: condition score, fault flags, battery health, lane readiness
- One-click report export (PDF or structured data for Manheim AMS integration)
- Reports are signed by the node that generated them — tamper-evident

### Module 3: Arbitration Viewer
- Search any vehicle by VIN or scan date
- Pull full organism log: every node state at time of intake scan
- Timestamped, signed, immutable — cannot be altered after generation
- Dispute resolution: the scan log either confirms or disproves the claimed fault

### Module 4: Lot Flow Intelligence
- Live view of current lot population health
- Battery health distribution (flag low-state vehicles before lane assignment)
- Pending fault count by severity
- Pre-lane reconditioning queue: organism-flagged vehicles that need work before they run
- Lane readiness heat map: which vehicles are ready now vs. need intervention

### Module 5: Reconditioning Queue Manager
- Incoming maintenance work orders generated from organism SL-node scores
- Priority sorted by severity and lot position
- Technician marks work complete → record written to CAL node
- Before/after organism scores compared automatically

### Module 6: Transport Readiness
- Drivetrain health flag for all vehicles queued for transport
- Organism identifies vehicles with degraded state unsuitable for transport without reconditioning
- Reduces transport damage claims and roadside events
- Transport manifest generated with per-vehicle health summary

### Module 7: Node Network Status (Admin Only)
- Status of this location's CAL node
- Cross-location vehicle history lookup (vehicle scanned at another lot appears here)
- Network sync status
- Record count and integrity confirmation

---

## PRODUCT NAMING WITHIN THE STACK

| Product Name | Audience | Description |
|---|---|---|
| **Lume-Ops Recon** | Enterprise (Manheim) | The Windows application. What they install and use. |
| **Lume-Auto** | Technical / investor | The organism engine underneath Lume-Ops Recon. |
| **Cox Automotive Ledger (CAL)** | Technical / investor | The POA node network built specifically for Cox Automotive / Manheim. Not named to lot staff — they see "the network" or "the audit log." |
| **TrustVault** | Technical | The immutable record store within CAL. Manheim staff see "audit log" or "scan record." |
| **TrustGen** | Technical | The condition report generation engine. Manheim staff see "condition report." |

**Rule:** In Manheim-facing materials, use **Lume-Ops Recon** as the product name. Reference Lume-Auto only when speaking to technical decision-makers. Never say "blockchain" — say "distributed governance network" or "federated node infrastructure."

---

## HOW THIS FITS THE EXISTING HANDOFF

The existing `manheim-build-agent-handoff.md` positions Lume-Auto as the enterprise product. This is accurate but needs to be updated to reflect the following:

**Before (existing framing):**
- Enterprise tier = "Enterprise / Auction" custom contract
- Delivery mechanism = unspecified

**After (correct framing):**
- Enterprise tier = **Lume-Ops Recon** — Windows executable, per-location deployment
- Delivery mechanism = Windows installer, deployed to lot workstations
- Underlying stack = Lume-Auto organism + CAL node (invisible to end user)

**Update required in `manheim-build-agent-handoff.md`:**
- Section 1: Add Lume-Ops Recon as the enterprise product name
- Section 5: Rename "Enterprise / Auction" tier to "Lume-Ops Recon"
- Section 6: Add Windows deployment detail to pilot proposal
- Section 9: Add Lume-Ops Recon to website and deck assets list

---

## PILOT DEPLOYMENT FLOW

1. DarkWave installs Lume-Ops Recon on 2–3 workstations at the pilot Manheim location
2. CAL node is activated for that location
3. Technicians run OBD-II intake scans using existing adapter hardware (Lume firmware)
4. Lume-Ops Recon surfaces condition reports, lot-flow dashboard, and arbitration viewer
5. All records written to the local node — immutable from point of generation
6. At pilot close: pull 30-day report from node, demonstrate record integrity, present ROI

---

## DELIVERABLES FOR BUILD AGENT

- [ ] Update `manheim-build-agent-handoff.md` — rename Enterprise tier to Lume-Ops Recon, add Windows deployment detail
- [ ] Update `lume-auto-product.md` — add Lume-Ops Recon section under Enterprise Features
- [ ] Create Lume-Ops Recon one-page product brief (Manheim-facing)
- [ ] Create Lume-Ops Recon feature module diagram (the 7 modules above)
- [ ] Create three-layer stack diagram (Lume-Ops Recon → Lume-Auto → Cox Automotive Ledger)
- [ ] Update `manheim.tlid.io` site to include Lume-Ops Recon product section
- [ ] Update Manheim deck: add Lume-Ops Recon slide, three-layer architecture slide

---

## TONE GUIDANCE

- **To lane managers:** "Lume-Ops Recon gives you a complete picture of every vehicle on the lot — condition, faults, battery, lane readiness — from the moment it arrives."
- **To IT:** "Windows application, standard installer, connects to your existing network infrastructure. No browser dependency, no cloud-only requirement."
- **To executives:** "Lume-Ops Recon is the operational intelligence layer your teams use every day. The underlying Lume-Auto organism and CAL network are the infrastructure it runs on."
- **To technical evaluators:** "Deterministic 42-node OBD-II governance engine, 2,358 test cases passed with zero AI calls, immutable POA ledger with per-location nodes."

# END OF LUME-OPS RECON BUILD HANDOFF
