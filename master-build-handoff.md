# DarkWave Studios — Master Build Handoff
## Lume Ecosystem: Engine + Sites + Consumer Products

**Author:** Jason Andrews / DarkWave Studios LLC
**ORCID:** 0009-0007-5214-649X
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Date:** May 2026

---

## How to Use This Document

This is the single source of truth for building the entire Lume ecosystem. Read it in full before building anything. Every section depends on the ones before it. The build order at the end is not a suggestion — it is the correct sequence.

This document supersedes all previous partial handoffs.

---

## Part 1 — Ecosystem Overview

### What DarkWave Studios Has Built

A deterministic AI ecosystem built on synthetic organisms. "Deterministic" means same inputs, same outputs, always. No hallucination. No guessing. No probabilistic drift. This is the core brand promise of everything in the ecosystem.

### The Five Properties

| Domain | URL | Status | Purpose |
|---|---|---|---|
| axiom42.com | Live | AXIOM deterministic agent. 181,282 topics, 148 domain packs, 11 specialty agents, <2ms response. Dark background, cyan (#00E5FF) accent. |
| lume42.com | Acquiring | Lume organism reference hub. All 7 organisms, 4/42 architecture, 294 nodes. Documentation + live organism state. |
| lume-cortex.com | Live (auth active) | Lume-OS. Deterministic Meta-Operating System. Browser-based OS shell (Windows/iOS hybrid). Trust Layer Ledger (TLL) SSO already live on login screen. Houses lume42.com and axiom42.com as modules. |
| lume-lang.org | Live | Lume Language Specification. Canonical DOI property. |
| vedasolus.io | Registered | BioCore consumer container for personal health application. |

### Product Hierarchy

```
lume-cortex.com                ← Lume-OS shell (auth: Trust Layer Ledger (TLL) SSO)
  ├── lume42.com               ← Organism reference hub (7 organisms, 294 nodes)
  ├── axiom42.com              ← AXIOM deterministic agent (181k topics)
  └── AXIOM Product Suite      ← 5 consumer/professional products
        ├── AXIOM Neuro        ← NeuroCore consumer interface
        ├── AXIOM Bio          ← BioCore consumer interface
        ├── AXIOM Social       ← SocioCore consumer interface
        ├── AXIOM Daily        ← 3-organism aggregate (Bio + Neuro + Social)
        └── AXIOM Work         ← GovernanceCore + SocioCore (B2B/teams)

Trust Layer Ledger (TLL) (DOI: 10.5281/zenodo.19560674)
  ↑ identity and auth fabric beneath all products
```

### Design Language (applies to all properties)

Reference: axiom42.com (live — look at it before building anything)
- Near-black background
- Cyan (#00E5FF) as primary accent at axiom42.com
- Each Lume organism has its own palette (listed in Part 3) — these provide accent variation per product
- Monospace / terminal elements for technical data
- Hexagon motifs
- Minimal, architectural, confident — not flashy, not marketing-heavy
- lume42.com and the AXIOM products are siblings of axiom42.com, not clones

---

## Part 2 — The Lume 4/42 Architecture

Every organism is built on one canonical architecture. This never varies.

### The Constants

- **4 irreducible flow primitives** — the axes of each organism
- **42 operational nodes** — grouped within the 4 primitives, distributed as:
  - Pattern A: 10 / 10 / 11 / 11 = 42
  - Pattern B: 10 / 10 / 10 / 12 = 42 (per organism, see papers)
- **Normalized state:** −1.0 (fully critical) → +1.0 (fully optimal)
- **Three threshold bands:**
  - Advisory: 0.0 to −0.3
  - Caution: −0.4 to −0.7
  - Critical: −0.8 to −1.0
- **5 operating modes** per organism (deterministically selected)
- **10 global invariants** (same set, every organism)
- **Geometry:** polar coordinate ring, 4-axis core, primitive envelope lobes

### The 4/42 Signature

7 organisms × 42 nodes = 294 total nodes.
294 digit-sums to 15, which digit-sums to 6... no.
Actually: 2+9+4 = 15 → 1+5 = 6. Not 4.
Correct: the 4-based signature lives at the organism level — 4 primitives, always. That is the canonical constraint. The ecosystem count is emergent, not designed.

### The Organism Stack (5 layers, 7 organisms)

```
Layer 5 — GOVERNANCE:  GovernanceCore
Layer 4 — SOCIAL:      SocioCore
Layer 3 — COGNITIVE:   NeuroCore
Layer 2 — BIOLOGICAL:  BioCore
Layer 1 — PHYSICAL:    Meridian | Verdara Ultra | HydroCore
```

---

## Part 3 — The Seven Organisms

### Organism 1: Meridian

**Layer:** Physical (Layer 1)
**Tagline:** Energy Flow Organism
**Domain:** Wireless energy routing, resonance management, load balancing, interference governance
**Source paper:** meridian-paper.md (+ parts 2–8)

**Primitives:**
1. Resonance Flow — carrier stability
2. Load Distribution Flow — energy allocation
3. Interference Flow — signal clarity
4. Adaptive Routing Flow — path optimization

**Consumer use:** Not directly surfaced in AXIOM consumer products. Governs external energy/RF infrastructure. Professional/IoT deployment context.

---

### Organism 2: Verdara Ultra

**Layer:** Physical (Layer 1)
**Tagline:** Outdoor Flow Organism
**Domain:** Solar exposure, wind load, precipitation, terrain, atmospheric governance
**Source paper:** verdara-ultra-paper.md (816 lines)

**Consumer use:** Not directly surfaced in AXIOM consumer products. Live data feeds from weather APIs and terrain APIs. Professional outdoor/agricultural/environmental context.

**Live data sources:**
- OpenWeatherMap: UV index, temperature, wind speed, humidity, precipitation, cloud cover
- Open-Elevation API: terrain elevation, grade

---

### Organism 3: HydroCore

**Layer:** Physical (Layer 1)
**Tagline:** Hydrological Flow Organism
**Domain:** Water systems, hydration, fluid dynamics, moisture governance
**Source paper:** hydrocore-paper.md (775 lines)

**Consumer use (VedaSolus context):** Personal hydration, fluid balance, moisture-related health. Self-report input in consumer context.
**Infrastructure use:** USGS Water Services API for environmental hydrological monitoring.

---

### Organism 4: BioCore

**Layer:** Biological (Layer 2)
**Tagline:** Biological Flow Organism
**Domain:** Metabolic, circulatory, neurological, stress/thermal flows of the human body
**Source paper:** biocore-paper.md (806 lines)
**Consumer container:** VedaSolus.io

**Live data sources:** Apple Health (HRV, sleep stages, resting HR), Google Fit. Self-report fallback always available.

**Coupling output:**
- Sleep nodes → NeuroCore L7 (Sleep Debt Impact)
- Stress nodes → NeuroCore L8 (Stress Integration)

---

### Organism 5: NeuroCore

**Layer:** Cognitive (Layer 3)
**Tagline:** Cognitive Flow Organism
**Domain:** Attention, clarity, emotional load, decision equilibrium
**Source paper:** neurocore-paper.md (985 lines — full 42-node spec, use this)

**Primitives and palette:**
| Primitive | Nodes | Color | Hex |
|---|---|---|---|
| Attention Flow | A1–A10 (10) | Bright cyan | #00E5FF |
| Intention Flow | I1–I10 (10) | Gold/amber | #FFC107 |
| Emotional Flow | E1–E11 (11) | Magenta/pink | #E91E63 |
| Cognitive Load | L1–L11 (11) | Deep violet | #4A148C |

**Ring axis order (clockwise from top):** Attention (up) → Intention (right) → Emotional (down) → Cognitive Load (left)

**Key nodes:**
- A1 Focus Stability, A10 Attention Fatigue
- I5 Decision Paralysis Risk, I6 Internal Narrative Coherence
- E3 Anxiety Load, E4 Depression Load, E11 Emotional Safety Index
- L3 Burnout Pressure, L7 Sleep Debt Impact (from BioCore), L8 Stress Integration (from BioCore), L11 Global Cognitive Resilience

**Operating Modes:**
1. FOCUS MODE — all primitives advisory or better
2. RECOVERY MODE — cognitive load critical or sleep debt high
3. EMOTIONAL STABILIZATION MODE — emotional load at caution or above
4. DECISION MODE — intention degraded, attention adequate
5. COGNITIVE SAFETY MODE — burnout pressure or global resilience critical

**Coupling received:** BioCore sleep → L7, BioCore stress → L8
**Coupling sent:** E6, L2, E3, E5 → SocioCore nodes

---

### Organism 6: SocioCore

**Layer:** Social (Layer 4)
**Tagline:** Social Flow Organism
**Domain:** Interpersonal energy, identity coherence, relational stability, communication load
**Source paper:** sociocore-paper.md (989 lines — full 42-node spec, use this)

**Primitives and palette:**
| Primitive | Nodes | Color | Hex |
|---|---|---|---|
| Social Energy Flow | S1–S10 (10) | Warm coral | #FF7043 |
| Identity Coherence Flow | I1–I10 (10) | Sage green | #7CB87C |
| Relational Stability | R1–R11 (11) | Soft indigo | #5C6BC0 |
| Communication Load | C1–C11 (11) | Warm grey | #78909C |

**Ring axis order (clockwise from top):** Social Energy (up) → Identity (right) → Relational (down) → Communication (left)

**Key nodes:**
- S1 Social Battery Level, S8 Social Burnout Risk
- I3 Masking Load, I4 Identity Drift, I6 Boundary Strength, I10 Identity Safety Index
- R1 Trust Level, R8 Loneliness Load, R11 Relational Safety Index
- C2 Emotional Labor Load, C11 Global Social Resilience

**Operating Modes:**
1. CONNECTION MODE — all primitives healthy
2. SOCIAL RECOVERY MODE — burnout risk or battery depleted
3. BOUNDARY MODE — boundary strength degraded, obligations high
4. IDENTITY STABILIZATION MODE — identity drift or safety index low
5. COMMUNICATION SAFETY MODE — global resilience critical

**Critical patterns:**
- Identity Fragmentation Risk: I4 + R2 + C2 all at caution
- Social Burnout Risk: S3 + C1 + R6 all at caution

**Domain visual effects:**
- Communication Load axis: inward-gravity halo (caution trigger)
- Identity Coherence axis: fragmentation crack pattern (caution trigger)
- Relational Stability lobe: wobble effect (caution trigger)

**Coupling received:** NeuroCore E6, L2, E3, E5
**Coupling sent:** R2, I4, S3 → GovernanceCore nodes

---

### Organism 7: GovernanceCore

**Layer:** Governance (Layer 5)
**Tagline:** Governance Flow Organism
**Domain:** Rule coherence, multi-agent coordination, fairness, conflict resolution
**Source paper:** governancecore-paper.md (989 lines — full 42-node spec, use this)
**Substrate for:** Trust Layer Ledger (TLL), Lume-QOS, DAMOS, AXIOM Work

**Primitives and palette:**
| Primitive | Nodes | Color | Hex |
|---|---|---|---|
| Rule Coherence Flow | RC1–RC10 (10) | Bronze/ochre | #8B6914 |
| Coordination Flow | CO1–CO10 (10) | Electric blue | #1565C0 |
| Fairness Flow | F1–F11 (11) | Teal | #00695C |
| Conflict Resolution | CR1–CR11 (11) | Iron grey | #607D8B |

**Ring axis order (clockwise from top):** Rule Coherence (up) → Coordination (right) → Fairness (down) → Conflict Resolution (left)

**Key nodes:**
- RC1 Rule Clarity, RC6 Rule Drift Risk, RC8 Rule Conflict, RC10 Rule Safety Index
- CO5 Coordination Drift, CO10 Coordination Safety Index
- F2 Bias Pressure, F7 Vulnerability Protection, F8 Exploitation Risk, F11 Fairness Safety Index
- CR2 Escalation Pressure, CR5 Deadlock Risk, CR6 Retaliation Pressure, CR11 Global Governance Resilience

**Operating Modes:**
1. COORDINATION MODE — all governance primitives healthy
2. RULE STABILIZATION MODE — rule clarity or consistency degraded
3. FAIRNESS MODE — equity or procedural fairness degraded
4. CONFLICT RESOLUTION MODE — escalation pressure or deadlock risk elevated
5. SYSTEMIC SAFETY MODE — multiple governance dimensions degraded

**Critical patterns:**
- Systemic Collapse Risk: RC8 + CR2 + F2 all at caution
- Governance Drift: CO5 + RC6 both at caution

**Hard constraint (no exceptions):**
F8 (Exploitation Risk) at caution triggers mandatory intervention regardless of all other system states.

**Domain visual effects:**
- Rule Coherence axis: contradiction crack/fracture (caution trigger)
- Fairness axis: downward distortion + red inner edge at F8 caution
- Conflict Resolution axis: inward-gravity halo (caution trigger)
- Governance Drift pattern: dual oscillation on bronze + blue axes

**Coupling received:** SocioCore R2, I4, S3; NeuroCore L4, E6, I5
**Coupling sent:** RC4, F5, F11 → SocioCore; RC1, RC9, CR11 → NeuroCore

---

## Part 4 — The Lume Organism Engine

### What It Is

The Lume Organism Engine is the live backend API service that makes all organisms operational. Without it, every Lume and AXIOM product is a static shell. With it running, organisms have real state populated from real data, and every product becomes a live deterministic governance tool.

**This is the most important system to build. Everything else is a client of this engine.**

### Architecture

```
External APIs          User Input          Wearables
(Weather, Telemetry)   (Self-report)       (HRV, Sleep)
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│              DATA INGESTION LAYER                   │
│  Source adapters · Input normalization              │
│  Node mapping tables (source field → node ID)       │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              ORGANISM ENGINE CORE                   │
│  42-node population · Routing rules                 │
│  Threshold evaluation · Critical pattern detection  │
│  Mode selection (deterministic) · Recommendations   │
│  Cross-organism coupling propagation                │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              PERSISTENCE LAYER                      │
│  Daily evaluation storage · 7-day trends            │
│  14-day baseline calibration                        │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              API RESPONSE LAYER                     │
│  Structured JSON · Ring data · Mode + recommendations│
└─────────────────────────────────────────────────────┘
```

The engine is **stateless per request**. All state lives in the persistence layer. Horizontal scaling is safe.

### Normalization Standard

All node values: −1.0 to +1.0.

Converting self-report sliders (1–10):
```
normalized = (slider_value - 5.5) / 4.5
```

Converting inverted sliders (10 = low load):
```
normalized = (5.5 - slider_value) / 4.5
```

Threshold bands:
- Advisory: −0.3 to 0.0
- Caution: −0.7 to −0.4
- Critical: −1.0 to −0.8

### API Endpoints

**Evaluate single organism (self-report):**
```
POST /v1/organism/{slug}/evaluate
body: {
  user_id, input_type: "self_report",
  primitives: { primitive_name: slider_value (1–10) },
  include_history: bool,
  coupled_states: { organism_slug: OrganismState }
}
response: OrganismState
```

**Evaluate organism from live data source:**
```
POST /v1/organism/{slug}/evaluate-from-source
body: {
  user_id, input_type: "api_feed",
  source_config: { weather: { provider, location, api_key_ref },
                   terrain: { provider, location } }
}
response: OrganismState
```

**Evaluate AXIOM Daily (multi-organism):**
```
POST /v1/daily/evaluate
body: {
  user_id, input_type: "self_report",
  primitives: { biological: n, cognitive: n, social: n },
  use_cached_organism_states: bool
}
response: DailyState
```

**Evaluate AXIOM Work (team governance):**
```
POST /v1/work/evaluate
body: {
  team_id, submitted_by,
  input_type: "single_rater" | "multi_rater",
  primitives: { rule_coherence: n, coordination: n, fairness: n, conflict_resolution: n },
  social_overlay: { team_social_energy: n }
}
response: OrganismState (GovernanceCore state + team context)
```

**History and baseline:**
```
POST /v1/history/record
GET  /v1/history/{user_id}/{organism_id}?days=14
POST /v1/baseline/calibrate/{user_id}/{organism_id}
GET  /v1/organism/{slug}/schema       ← powers lume42.com reference site
```

### Core Engine Logic (all organisms follow this sequence)

**Step 1: Populate nodes from inputs**

Self-report: each primitive input distributes across its member nodes via weighted distribution. Governance-critical nodes (safety indices, resilience nodes) receive higher weights. Derived nodes are computed after. Coupling nodes populate from linked organism states if available; otherwise default to 0.0.

API feed: external data fields map directly to specific nodes via mapping tables (see data source section below).

**Step 2: Evaluate thresholds per node**
```
value >= −0.3   → status: "optimal"
−0.3 to −0.4   → status: "advisory"
−0.4 to −0.8   → status: "caution"
< −0.8         → status: "critical"
```
After 14-day baseline calibration: thresholds shift to be relative to personal baseline mean and standard deviation.

**Step 3: Compute primitive aggregates**

Each primitive aggregate = mean of its member node values.

**Step 4: Detect critical patterns**

Boolean check: if all nodes in a pattern's trigger list are at caution or critical simultaneously → pattern triggered. Triggered pattern `compound_response` text overrides standard recommendations for those node areas.

**Step 5: Select operating mode (deterministic hierarchy)**
```
1. Safety-level trigger met? → assign safety mode, stop.
2. Critical pattern with mode implication? → assign that mode, stop.
3. Caution-level triggers in governance-weight order → first matching, stop.
4. Advisory-level triggers → first matching, stop.
5. No triggers → assign optimal/aligned mode.
```

**Step 6: Select 3 recommendations**

All recommendations are predefined static text — not AI-generated. Selection: identify the 3 most degraded primitives → from active mode's pool, select recommendations targeting those primitives → order by governance weight → cover at least 2 different primitives. If clinical escalation triggers, insert clinical text as rank 1.

**Step 7: Generate 1-sentence summary**

Lookup from static table keyed by (active_mode_id, dominant_primitive_id, secondary_primitive_id). Not generated.

**Step 8: Compute ring data**
```
For each primitive:
  axis_value = primitive.aggregate_value
  arc_density = primitive.node_count / 42
  domain_effect = triggered visual effect ID if applicable
```

### Cross-Organism Coupling Propagation

Runs after individual organism states are computed. Direction: BioCore → NeuroCore → SocioCore → GovernanceCore.

**BioCore → NeuroCore:**
```
neurocore.L7_SleepDebtImpact = biocore.N1_SleepQuality × 0.85
neurocore.L8_StressIntegration = mean(biocore.S1, S2, S8) × 0.75
```
Re-evaluate NeuroCore mode after coupling.

**NeuroCore → SocioCore:**
```
sociocore.R2_ConflictTolerance += neurocore.E6_EmotionalRegulation × 0.4
sociocore.C1_ActiveListeningCapacity += neurocore.L2_CognitiveFlexibility × 0.35
sociocore.I4_IdentityDrift -= neurocore.E3_AnxietyLoad × 0.3
```
Re-evaluate SocioCore mode after coupling.

**SocioCore → GovernanceCore:**
```
governancecore.CR2_EscalationPressure += sociocore.R2_ConflictTolerance × −0.5
governancecore.RC6_RuleDriftRisk += sociocore.I4_IdentityDrift × 0.3
governancecore.CO9_CoordinationLoad += sociocore.S3_SocialBurdenLoad × 0.4
```
Re-evaluate GovernanceCore mode after coupling.

**GovernanceCore → NeuroCore (reverse):**
```
neurocore.I1_IntentionClarity += governancecore.RC1_RuleClarity × 0.25
neurocore.E3_AnxietyLoad -= governancecore.RC9_EnforcementPredictability × 0.2
neurocore.L11_GlobalCognitiveResilience += governancecore.CR11_GlobalGovernanceResilience × 0.15
```

All coupling values clamped to −1.0 / +1.0.

### Data Source Node Mappings

**Verdara Ultra — OpenWeatherMap:**
```
UV Index (0–11+):   normalize (uvi / 11) × 2 − 1
  → VE_SolarExposureIntensity, VE_UVStressLoad

Temperature (°C):   delta from 21°C comfort midpoint, normalize delta/15, inverted
  → VE_ThermalStressLoad, VE_AmbientThermalPressure

Wind Speed (m/s):   1 − (wind_speed / 20), clamped
  → VE_WindLoadIndex, VE_AtmosphericTurbulence

Precipitation (mm): 1 − (rain / 50), clamped
  → VE_PrecipitationStress, VE_MoistureLoad

Cloud cover (0–100%): (clouds − 50) / 50, inverted
  → VE_SolarAvailability

Pressure change (hPa/6hr): delta/10, inverted (stable = +1.0)
  → VE_AtmosphericPressureStability
```

**Verdara Ultra — Open-Elevation:**
```
Elevation (m):   elevation / 3000, clamped
  → VE_TerrainElevationFactor
```

**BioCore — Apple Health (HealthKit):**
```
HRV (ms):        (hrv − 40) / 60, clamped
  → BC_AutonomicRegulation, BC_StressRecoveryIndex

Sleep quality:   composite of total hours, deep%, REM%
  sleep_quality = (total_hours / 8) × 0.5 + (deep_pct + rem_pct) × 0.5
  normalize: sleep_quality × 2 − 1
  → BC_SleepQualityIndex, BC_SleepDebt (inverted if < 7hrs for 3+ days)

Resting HR:      (65 − rhr) / 20, clamped (45bpm = +1.0, 85bpm = −1.0)
  → BC_CardiovascularLoad
```

**HydroCore — USGS Water Services:**
```
Streamflow (cfs vs seasonal baseline): (flow − baseline) / baseline_std, clamped
  → HC_FlowRateIndex, HC_HydrologicalMomentum

Water temp (°C vs species optimal): delta-normalized, inverted
  → HC_ThermalStressIndex

Dissolved oxygen (mg/L, optimal 8–12): (do − 10) / 4, clamped
  → HC_OxygenSaturation
```

**Meridian — Generic telemetry adapter:**
```
POST /v1/organism/meridian/evaluate-from-telemetry
body: { signal_strength, interference_index, load_factor, routing_efficiency }
  → maps directly to 4 Meridian primitive aggregates
  → node-level distribution follows weighted table in Meridian paper
```

### Hard Constraints (enforced at engine level — cannot be overridden by any product)

1. **Determinism:** Identical inputs → identical outputs. No randomness. No AI generation in the output pipeline.

2. **Safety modes contain no productivity recommendations.** Cognitive Safety Mode and Biological Safety Mode: rest guidance only. The engine will not include productivity recommendations. Products cannot add them.

3. **Clinical escalation text fires when triggered and cannot be hidden or softened:**

   *NeuroCore E4 at critical (Depression):*
   "This system is detecting sustained depressive load. This is not a productivity problem — it is a health signal. Please speak with a mental health professional. If you are in the US, call or text 988."

   *NeuroCore L3 at critical, sustained 5+ days (Burnout):*
   "Burnout at this level requires structural change, not more rest. A conversation with a doctor or counselor is appropriate. This system will not recommend productivity interventions while this signal is active."

   *SocioCore R7 + R8 at critical simultaneously (Isolation):*
   "Deep loneliness and social disconnection are present simultaneously. Please reach out to one person today. If you have no one to reach out to, a counselor or support line is a real option."

   *GovernanceCore F8 at caution or critical (Exploitation):*
   "Exploitation risk is detected in your team's governance state. This is a mandatory intervention signal — not advisory."

4. **Coupling coefficients** specified in organism papers are canonical. Do not adjust them.

5. **No language model in the output pipeline.** Recommendations and summaries are selected from predefined pools, not generated.

### Environment Variables Required

```
OPENWEATHER_API_KEY        # Verdara Ultra
OPEN_ELEVATION_API_KEY     # Verdara Ultra terrain
USGS_API_KEY               # HydroCore environmental
DATABASE_URL               # PostgreSQL
REDIS_URL                  # API response cache (15-min TTL for weather)
TRUST_LAYER_SSO_URL        # Auth validation
APPLE_HEALTH_CLIENT_ID     # BioCore v2
GOOGLE_FIT_CLIENT_ID       # BioCore v2
```

---

## Part 5 — lume42.com Site Specification

### What This Site Is

The canonical reference and discovery hub for all 7 Lume organisms. A documentation site that also displays live organism state by querying the engine. Not a marketing site. Audience: researchers, ecosystem developers, Lume implementers.

### Routes (5)

**/ (Stack Home)**

Primary visual: a vertical 5-layer diagram showing all organisms in stack order with coupling arrows between layers. Each organism is clickable → organism detail page. Below diagram: one paragraph on the 4/42 architecture. Stat block: 7 ORGANISMS / 5 LAYERS / 42 NODES EACH / 294 TOTAL NODES. No marketing copy.

**If engine is live:** display current state of each organism using the engine's `/v1/organism/{slug}/schema` endpoint. Organisms can show live ring visualizations.

**/stack (Integration Map)**

Directed graph of all formal inter-organism coupling relationships. Nodes = organisms, edges = coupling channels labeled with node pairs. Two views: full graph / per-organism highlight. Acceptable v1 fallback: structured table (source org → node → target org → node → mechanism).

**/organisms (Organism Index)**

Grid of all 7 organisms. Each card: name, layer badge, primitive names, color palette swatches, link to detail page.

**/organisms/[slug] (Organism Detail)**

Sections in order:
1. Header — name, layer badge, tagline, domain summary
2. Position in Stack — inline mini-diagram, links to adjacent organisms
3. Primitives — 4 cards: name, color swatch, node count, one-sentence description
4. 42-Node Ring — expandable table grouped by primitive. Columns: Node ID / Name / Description / Threshold. Default collapsed to primitive headers.
5. Operating Modes — 5 rows: name + trigger + guidance
6. Critical Patterns — only if organism has them
7. Integration — "Receives from" and "Sends to" with node pairs and organism links
8. Geometry Spec — palette swatches + hex values, axis assignments, domain visual effects described
9. Paper — title, author, DOI (or "pending"), download link

**If engine is live:** Detail page can show live current organism state via ring visualization, querying `/v1/organism/{slug}/schema`.

**/papers (Canon² Paper Index)**

Title / Organism / Status / DOI / Download for all papers in the series.

### Data Architecture

All organism data lives in ONE structured data file (TypeScript const or JSON). Not hardcoded in components. Site is statically generated from this data, or dynamically from the engine schema endpoint.

The 4/42 ring is the visual identity element of lume42.com. It must appear on the home page and each organism detail page.

---

## Part 6 — AXIOM Consumer Product Suite

### Shared Product Architecture

All 5 products use the same output contract:
- 1 operating mode (deterministic)
- 3 prioritized recommendations (ordered by governance weight)
- 1-sentence summary
- 1 trend indicator per primitive (improving / stable / degrading)
- 1 visual: the 4/42 ring (**not optional** — this is the visual identity)

**Shared input format:** 4 sliders, 1–10 scale, plain language labels. Never organism terminology. Under 60 seconds.

**Shared history model:** 7-day rolling trend. After 14 days: personal baseline calibration. Each day stores: 4 primitive scores, mode, date.

---

### Product 1: AXIOM Neuro

**Tagline:** "Your mind's daily operating mode."
**Engine:** NeuroCore
**Audience:** Students, professionals, ADHD, burnout, cognitive overwhelm

**Inputs (4 sliders):**
- "How focused do you feel?" → Attention primitive
- "How much emotional weight are you carrying?" → Emotional primitive (inverted)
- "How clear is your sense of direction?" → Intention primitive
- "How much pressure or load are you under?" → Cognitive Load primitive (inverted)

**Outputs:** NeuroCore mode + 3 recommendations + 1-sentence summary + NeuroCore ring (cyan/gold/magenta/violet)

**Key behaviors:**
- Cognitive Safety Mode = hard stop. No productivity recommendations. Non-negotiable.
- E4 depression trigger → clinical escalation text, rank 1
- L3 burnout sustained 5+ days → clinical escalation text
- BioCore link: when AXIOM Bio is also active, L7 and L8 populate from real BioCore data

**Differentiator from competitors:** Same inputs today = same outputs tomorrow. Always. The ring makes the state visible. The recommendations are always specific, never generic.

---

### Product 2: AXIOM Bio

**Tagline:** "Your biological baseline."
**Engine:** BioCore
**Audience:** Fatigue, chronic stress, burnout recovery, sleep issues, general health optimization

**Inputs (4 sliders):**
- "How is your physical energy right now?" → Metabolic primitive
- "How much stress are you carrying in your body?" → Stress primitive (inverted)
- "How well did you sleep?" → Neurological/Sleep primitive
- "How recovered do you feel from recent effort?" → Recovery primitive

**Optional live data:** Apple Health / Google Fit HRV, sleep stages, resting HR replace self-report for those nodes automatically.

**Outputs:** BioCore mode + 3 recommendations + 1-sentence summary + BioCore ring

**Key behaviors:**
- Biological Safety Mode = hard stop. Rest is mandatory.
- Wearable integration is the v2 upgrade that makes BioCore readings automatic
- BioCore exports to NeuroCore automatically when both products active

---

### Product 3: AXIOM Social

**Tagline:** "Your interpersonal operating system."
**Engine:** SocioCore
**Audience:** Social burnout, identity drift, relational stress, communication overload, loneliness

**Inputs (4 sliders):**
- "How much social energy do you have right now?" → Social Energy primitive
- "How clearly do you feel like yourself across contexts?" → Identity Coherence primitive
- "How safe and stable do your key relationships feel?" → Relational Stability primitive
- "How much is communication demanding from you?" → Communication Load primitive (inverted)

**Outputs:** SocioCore mode + 3 recommendations + 1-sentence summary + SocioCore ring (coral/sage/indigo/grey)

**Key behaviors:**
- Critical pattern alerts surface as distinct notices above recommendations
- Identity Fragmentation and Social Burnout compound patterns have escalated guidance
- R7 + R8 at critical → social isolation clinical escalation text
- Communication Safety Mode → triage language, not softened suggestion

---

### Product 4: AXIOM Daily

**Tagline:** "Your personal operating system."
**Engine:** BioCore + NeuroCore + SocioCore aggregate
**Audience:** General public, daily check-in habit, whole-system awareness

**Architecture:** 3-organism aggregate. The Physical layer organisms govern external environmental flows, not personal state — individual physical state is BioCore's domain. AXIOM Daily is correctly a 3-organism product.

**Inputs:** If AXIOM Bio, Neuro, and Social have already been run today, AXIOM Daily reads from them automatically — no additional input. Standalone input: 3 sliders (biological, cognitive, social) + optional cross-system stress slider.

**Outputs:** Unified daily mode + 3 cross-layer recommendations + 1-sentence whole-system summary + unified 4-axis ring

**Cross-layer recommendations — the core differentiator:**
These are the recommendations that could not come from any single organism. Examples:
- "Your social load is driving both your cognitive and biological stress simultaneously — the social source is the highest-leverage intervention point."
- "Your body has recovered but your mind lacks direction — this is the window to clarify goals before energy dissipates."
- "All three systems are depleted simultaneously. This is Full Recovery state. Today's goal is one thing: rest."

**Unified Daily Modes:** Aligned / Physical Recovery / Cognitive Recovery / Social Recovery / Full Recovery (two or more organisms degraded simultaneously)

---

### Product 5: AXIOM Work

**Tagline:** "Your team's coordination operating system."
**Engine:** GovernanceCore (primary) + SocioCore (secondary)
**Audience:** Teams, managers, distributed organizations. B2B entry point for the ecosystem.
**Note:** Only product that governs a multi-person system rather than an individual.

**Inputs (4 sliders, team-lead perspective):**
- "How clear and consistent are your team's rules and expectations?" → Rule Coherence primitive
- "How well is the team aligned and coordinating?" → Coordination primitive
- "How fair does the team environment feel?" → Fairness primitive
- "Is conflict resolving or accumulating?" → Conflict Resolution primitive (inverted)
- Optional: team social energy overlay → SocioCore aggregate input

**v2: Multi-rater input** — each team member submits their own 4 sliders. Engine aggregates and surfaces variance as a governance signal in itself.

**Outputs:** GovernanceCore mode + 3 governance recommendations + 1-sentence summary + GovernanceCore ring (bronze/electric blue/teal/iron grey)

**Critical pattern alerts:**
- Systemic Collapse Risk (RC8 + CR2 + F2 all at caution): "Do not add new work. Address at least one of these three before anything else."
- Governance Drift (CO5 + RC6): "Your team is losing coherence quietly. An alignment session and rule audit are both needed this week."

**F8 hard constraint:** Exploitation Risk at caution → mandatory intervention language as rank 1 output, always. No exceptions.

---

### Product Implementation Priority

| Order | Product | Reason |
|---|---|---|
| 1 | AXIOM Neuro | Largest audience, clearest pain point, fastest adoption |
| 2 | AXIOM Bio | Broad appeal, wearable pathway, strong daily habit retention |
| 3 | AXIOM Social | High emotional resonance, underserved category |
| 4 | AXIOM Daily | Requires others to be valuable — build after individual products validated |
| 5 | AXIOM Work | B2B, multi-rater complexity, highest revenue potential |

---

## Part 7 — Build Order

Build in this exact sequence. Each stage is a dependency of the next.

**Stage 1: Lume Organism Engine (backend)**
The engine first. Nothing else is real without it.
- Data models and normalization layer
- Self-report input adapter (all 7 organisms)
- 42-node population logic with weighted distribution
- Threshold evaluation, mode selection, recommendation selection for NeuroCore first
- Ring data computation
- `/v1/organism/neurocore/evaluate` endpoint working end-to-end
- History storage and 7-day trend computation
- Expand to all 7 organisms
- Cross-organism coupling propagation
- External data source adapters (Verdara Ultra weather first)
- `/v1/organism/{slug}/schema` endpoint
- Baseline calibration (14-day)
- AXIOM Daily multi-organism endpoint
- AXIOM Work endpoint

**Stage 2: AXIOM Neuro (first consumer product)**
First client of the engine. Proves the product loop.
- 4-slider input UI
- Engine call and response parsing
- Ring visualization (the 4/42 ring — NeuroCore palette)
- Mode display, 3 recommendations, 1-sentence summary
- Trend indicators (7-day)
- Clinical escalation display (non-negotiable, must be implemented correctly)

**Stage 3: AXIOM Bio**
Second consumer product. Add wearable data hooks as v1 optional layer.

**Stage 4: AXIOM Social**
Third consumer product. Add critical pattern alert display component.

**Stage 5: lume42.com**
Now that the engine is live, lume42.com displays real organism state.
- Organism data file (7 organisms, all fields)
- `/organisms/[slug]` detail pages
- Stack home with layer diagram and live ring visualizations
- `/organisms` index grid
- `/papers` index
- `/stack` integration map (table fallback acceptable for v1)

**Stage 6: AXIOM Daily**
Multi-organism product. Reads from existing individual product states.

**Stage 7: AXIOM Work**
B2B product. Single-rater first, multi-rater in v2.

---

## Part 8 — Metadata and References

**Author:** Jason Andrews
**ORCID:** 0009-0007-5214-649X
**Organization:** DarkWave Studios LLC
**Contact:** team@dwsc.io
**Patent:** 64/032,339 (Pending)
**Copyright:** © 2026 DarkWave Studios LLC

**Lume Ecosystem DOIs:**
- Lume Language Spec: 10.5281/zenodo.19382282
- Trust Layer Ledger (TLL): 10.5281/zenodo.19560674
- DAIGS: 10.5281/zenodo.19491784
- Lume-V: 10.5281/zenodo.19645097
- Lume-X: 10.5281/zenodo.19443968
- Dissolution: 10.5281/zenodo.15065493

**Organism paper DOIs:** Pending Zenodo assignment. Display as "DOI pending."

**Source files in repository:**
```
neurocore-paper.md          985 lines — full 42-node spec, authoritative
sociocore-paper.md          989 lines — full 42-node spec, authoritative
governancecore-paper.md     989 lines — full 42-node spec, authoritative
biocore-paper.md            806 lines
verdara-ultra-paper.md      816 lines
hydrocore-paper.md          775 lines
meridian-paper.md           (+ parts 2–8)
lume-engine-spec.md         Full engine technical specification
axiom-consumer-suite-spec.md  Full consumer product specification
master-build-handoff.md     This document
```

---

## End of Master Handoff

A build agent with this document and access to the organism papers has everything needed to build the full Lume ecosystem end to end without asking clarifying questions.
