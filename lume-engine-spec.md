# Lume Organism Engine — Complete Technical Specification

**Author:** Jason Andrews / DarkWave Studios LLC
**ORCID:** 0009-0007-5214-649X
**Date:** May 2026
**Status:** Architecture-complete specification for backend build agents
**Patent:** 64/032,339 (Pending)

---

## What This Document Is

This document specifies the Lume Organism Engine — the live backend service that makes all seven Lume synthetic organisms operational. Without this engine, every Lume and AXIOM product is a static shell displaying architecture. With this engine running, the organisms have real state populated from real data sources, and every consumer and professional product becomes a live deterministic governance tool.

This is the most important document in the DarkWave Studios build stack.

---

## What the Engine Does

The Lume Organism Engine is a deterministic API service. It:

1. Accepts data inputs (user self-report, external API feeds, wearable data, multi-rater input)
2. Maps those inputs to the correct nodes across the 42-node organism architecture
3. Runs the routing rules, threshold evaluation, and mode selection logic for each organism
4. Evaluates cross-organism coupling when multiple organisms are active
5. Returns organism state: full node values, primitive aggregates, active mode, ordered recommendations, and ring visualization data
6. Stores daily evaluation results per user and computes trend data
7. After 14+ days per user, calibrates thresholds to personal baseline

**The deterministic guarantee:** Given identical inputs, the engine always produces identical outputs. No randomness. No probabilistic generation. No AI hallucination. The recommendations are pre-defined governance outputs, not generated text. This guarantee must be architecturally enforced — not just claimed.

---

## Architecture Overview

```
External Data Sources          User Input
(Weather, Wearables,           (Self-report sliders,
 Telemetry, APIs)               Multi-rater forms)
         │                              │
         ▼                              ▼
┌────────────────────────────────────────────────────┐
│              DATA INGESTION LAYER                  │
│  • Source adapters (one per external API type)     │
│  • Input normalization (all values → −1.0 to +1.0) │
│  • Node mapping tables (source field → node ID)    │
└────────────────────────────┬───────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────┐
│              ORGANISM ENGINE CORE                  │
│  • 42-node state population (per organism)         │
│  • Routing rules and coupling logic                │
│  • Threshold evaluation (advisory/caution/critical)│
│  • Critical pattern detection                      │
│  • Mode selection (deterministic hierarchy)        │
│  • Recommendation selection (governance-weighted)  │
│  • Cross-organism coupling propagation             │
└────────────────────────────┬───────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────┐
│              PERSISTENCE LAYER                     │
│  • Daily evaluation storage per user               │
│  • 7-day trend computation                         │
│  • 14-day baseline calibration                     │
│  • History retrieval                               │
└────────────────────────────┬───────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────┐
│              API RESPONSE LAYER                    │
│  • Structured JSON responses                       │
│  • Ring visualization data                         │
│  • Mode and recommendation output                  │
│  • Trend indicators                                │
└────────────────────────────────────────────────────┘
```

The engine is stateless per request. All state (history, baseline) lives in the persistence layer and is passed in or looked up by user ID. Horizontal scaling is safe because no request depends on in-memory state from a previous request.

---

## Normalization Standard

All node values and all inputs are normalized to the range **−1.0 to +1.0**:

| Normalized Value | Meaning |
|---|---|
| +1.0 | Fully optimal |
| 0.0 | Neutral / threshold boundary |
| −0.3 | Advisory band begins |
| −0.4 | Caution band begins |
| −0.7 | Caution band ends |
| −0.8 | Critical band begins |
| −1.0 | Fully critical |

**Converting self-report sliders (1–10 scale) to normalized:**
```
normalized = (slider_value - 5.5) / 4.5

Examples:
  10 → +1.0 (fully optimal)
   7 → +0.33 (advisory positive)
   5 → −0.11 (advisory negative)
   3 → −0.56 (caution)
   1 → −1.0  (fully critical)
```

**Converting inverted sliders** (where 10 = low load, 1 = high load):
```
normalized = (5.5 - slider_value) / 4.5
```

**Converting external API data** (weather, wearables):
Each data source adapter defines its own mapping function.
Examples defined in the Data Source Integrations section below.

---

## Core Data Models

### Organism State (the primary engine output)

```typescript
interface OrganismState {
  organism_id: string           // e.g. "neurocore"
  evaluated_at: string          // ISO 8601 timestamp
  data_source: DataSource       // self_report | api_feed | wearable | mixed
  
  primitives: Primitive[]       // 4 primitives, always
  nodes: Node[]                 // 42 nodes, always
  
  active_mode: Mode
  recommendations: Recommendation[]  // ordered by governance weight, always 3
  summary: string               // 1-sentence deterministic summary
  
  critical_patterns: CriticalPattern[]  // empty array if none triggered
  
  ring_data: RingData
  
  // populated only if history exists
  trends?: PrimitiveTrend[]     // one per primitive
  baseline_active?: boolean     // true after 14+ days calibrated
}

interface Primitive {
  id: string                    // e.g. "attention"
  name: string                  // e.g. "Attention Flow"
  aggregate_value: number       // normalized mean of member nodes
  node_count: number            // always part of 4/42 structure
  color_hex: string
  status: "optimal" | "advisory" | "caution" | "critical"
}

interface Node {
  id: string                    // e.g. "A1", "L7"
  name: string                  // e.g. "Focus Stability"
  primitive_id: string
  value: number                 // normalized −1.0 to +1.0
  status: "optimal" | "advisory" | "caution" | "critical"
  source: "self_report" | "api_feed" | "wearable" | "coupled" | "derived"
}

interface Mode {
  id: string                    // e.g. "focus_mode"
  name: string                  // e.g. "Focus Mode"
  trigger_summary: string
  governance_level: "optimal" | "advisory" | "caution" | "critical" | "safety"
}

interface Recommendation {
  rank: number                  // 1, 2, 3 — ordered by urgency
  text: string                  // the full recommendation text
  target_primitive: string      // which primitive this addresses
  governance_weight: number     // 0.0–1.0, determines ordering
}

interface CriticalPattern {
  id: string
  name: string
  triggered_nodes: string[]     // node IDs that triggered it
  compound_response: string     // the escalated guidance text
  severity: "caution" | "critical"
}

interface RingData {
  axes: RingAxis[]              // 4 axes, one per primitive
  overall_health: number        // mean of all primitive aggregates
}

interface RingAxis {
  primitive_id: string
  direction: "up" | "right" | "down" | "left"
  value: number                 // normalized −1.0 to +1.0
  color_hex: string
  arc_density: number           // node_count / 42 — for arc width rendering
  domain_effect?: string        // visual effect ID if triggered
}

interface PrimitiveTrend {
  primitive_id: string
  direction: "improving" | "stable" | "degrading"
  delta_7d: number              // change over 7-day window
  data_points: number           // how many days of history exist
}

type DataSource = "self_report" | "api_feed" | "wearable" | "mixed"
```

### Daily Cross-Organism State (AXIOM Daily output)

```typescript
interface DailyState {
  user_id: string
  evaluated_at: string
  organisms: {
    bio?: OrganismState
    neuro?: OrganismState
    social?: OrganismState
  }
  
  active_mode: DailyMode
  cross_layer_recommendations: CrossLayerRecommendation[]  // always 3
  summary: string
  
  compound_signals: CompoundSignal[]   // cross-organism patterns
  
  ring_data: UnifiedRingData
}

interface CrossLayerRecommendation {
  rank: number
  text: string
  source_organisms: string[]    // which organisms contributed to this
  chain_description?: string    // e.g. "Social → Cognitive → Biological"
}

interface CompoundSignal {
  description: string
  organisms_involved: string[]
  severity: "advisory" | "caution" | "critical"
  highest_leverage_intervention: string
}
```

---

## API Endpoints

Base URL: `/v1`

### Evaluate a Single Organism

```
POST /v1/organism/{slug}/evaluate
```

Use this for self-report input (consumer products).

**Request:**
```json
{
  "user_id": "usr_abc123",
  "input_type": "self_report",
  "primitives": {
    "attention": 7,
    "intention": 6,
    "emotional": 4,
    "cognitive_load": 5
  },
  "include_history": true,
  "coupled_states": {
    "biocore": "<serialized BioCore OrganismState if available>"
  }
}
```

**Response:** `OrganismState` (see data model above)

---

### Evaluate a Single Organism from External Data Source

```
POST /v1/organism/{slug}/evaluate-from-source
```

Use this for physical layer organisms with live data feeds.

**Request:**
```json
{
  "user_id": "usr_abc123",
  "input_type": "api_feed",
  "source_config": {
    "weather": {
      "provider": "openweathermap",
      "location": { "lat": 37.7749, "lon": -122.4194 },
      "api_key_ref": "env:OPENWEATHER_API_KEY"
    },
    "terrain": {
      "provider": "open_elevation",
      "location": { "lat": 37.7749, "lon": -122.4194 }
    }
  }
}
```

**Response:** `OrganismState`

---

### Evaluate AXIOM Daily (Multi-Organism)

```
POST /v1/daily/evaluate
```

**Request:**
```json
{
  "user_id": "usr_abc123",
  "input_type": "self_report",
  "primitives": {
    "biological": 7,
    "cognitive": 5,
    "social": 4
  },
  "use_cached_organism_states": true
}
```

If `use_cached_organism_states` is true and the user has run individual organism evaluations today, the engine uses those states rather than requiring new input.

**Response:** `DailyState`

---

### Evaluate AXIOM Work (Team Governance)

```
POST /v1/work/evaluate
```

**Request:**
```json
{
  "team_id": "team_xyz789",
  "submitted_by": "usr_abc123",
  "input_type": "single_rater",
  "primitives": {
    "rule_coherence": 7,
    "coordination": 6,
    "fairness": 5,
    "conflict_resolution": 6
  },
  "social_overlay": {
    "team_social_energy": 6
  }
}
```

For multi-rater (v2):
```json
{
  "team_id": "team_xyz789",
  "input_type": "multi_rater",
  "responses": [
    { "rater_id": "usr_1", "primitives": {...} },
    { "rater_id": "usr_2", "primitives": {...} }
  ],
  "aggregate_method": "mean_with_variance"
}
```

**Response:** `OrganismState` (GovernanceCore state + team context)

---

### Record a Daily Evaluation to History

```
POST /v1/history/record
```

```json
{
  "user_id": "usr_abc123",
  "organism_id": "neurocore",
  "state": "<serialized OrganismState>"
}
```

---

### Get History for Trend Computation

```
GET /v1/history/{user_id}/{organism_id}?days=14
```

Returns array of historical `OrganismState` snapshots ordered by date descending.

---

### Get Organism Schema (for documentation sites)

```
GET /v1/organism/{slug}/schema
```

Returns the complete organism schema: all 42 node definitions, primitive groupings, mode definitions, recommendation sets, critical pattern definitions, palette, geometry spec. This endpoint powers the lume42.com reference site — it can render organism detail pages dynamically from live schema rather than static data files.

---

### Compute Baseline Calibration

```
POST /v1/baseline/calibrate/{user_id}/{organism_id}
```

Requires 14+ days of history. Recalibrates the user's personal advisory/caution/critical thresholds based on their observed distribution. Thresholds shift to be relative to their personal baseline rather than population defaults.

---

## Organism Engine Core Logic

This section specifies the deterministic logic the engine must implement for every organism. This logic is identical across all seven organisms — what differs per organism is the node definitions, mode trigger conditions, recommendation sets, and critical patterns.

### Step 1: Populate Nodes from Inputs

**Self-report path:**

Each primitive input score (normalized −1.0 to +1.0) distributes across its member nodes using a weighted distribution table defined per organism.

Distribution principle:
- Governance-critical nodes (safety indices, resilience nodes) receive proportionally more weight
- Coupling nodes (nodes that receive from external organisms) are populated from coupled state if available, otherwise default to 0.0 (neutral)
- Derived nodes (calculated from other nodes) are computed after initial distribution

Example (NeuroCore, Attention primitive, normalized input = +0.33):
```
A1  Focus Stability         → +0.33 × 1.2  = +0.40  (governance-critical, upweighted)
A2  Sustained Attention     → +0.33 × 1.0  = +0.33
A3  Selective Attention     → +0.33 × 1.0  = +0.33
...
A10 Attention Fatigue       → +0.33 × 0.8  = +0.26  (leading indicator, slightly downweighted)
```

Weights per node are defined in each organism's node weight table (see Appendix A of each organism's Canon² paper).

**API feed path (physical layer organisms):**

Each external data field maps directly to specific nodes. No distribution — the mapping is explicit.

See Data Source Integration section below for complete mapping tables.

**Coupling path (cross-organism nodes):**

Coupling nodes are populated from the source organism's state if that organism has been evaluated in the same session. If not, they default to 0.0 (neutral) with a flag indicating the coupling is inactive.

### Step 2: Evaluate Thresholds

For each of the 42 nodes:
```
if value >= −0.3:  status = "optimal"
if value >= −0.4 and value < −0.3:  status = "advisory"
if value >= −0.8 and value < −0.4:  status = "caution"
if value < −0.8:   status = "critical"
```

If baseline calibration is active for this user, thresholds are adjusted:
```
advisory_threshold  = user_baseline_mean − (0.3 × user_baseline_std)
caution_threshold   = user_baseline_mean − (0.6 × user_baseline_std)
critical_threshold  = user_baseline_mean − (0.9 × user_baseline_std)
```

### Step 3: Compute Primitive Aggregates

Each primitive aggregate = mean of all member node values.

```
attention_aggregate = mean(A1, A2, A3, ..., A10)
```

Primitive status = status of its aggregate value (same threshold table as nodes).

### Step 4: Detect Critical Patterns

Critical patterns are compound triggers — specific combinations of nodes all at caution or below simultaneously.

Evaluation is a boolean check per defined pattern:
```
if all(node.status in ["caution", "critical"] for node in pattern.trigger_nodes):
    pattern is TRIGGERED
```

Triggered patterns are returned in the response and their `compound_response` text overrides the standard recommendation for those node areas.

**Hard constraint: exploitation and safety nodes**

GovernanceCore F8 (Exploitation Risk) at caution or critical: this ALWAYS triggers mandatory intervention language regardless of any other system state. It cannot be suppressed or softened. This constraint is enforced at the engine level, not the presentation layer.

All organisms: safety index nodes (E11, I10, R11, C11, RC10, CO10, F11, CR11, L11) at critical trigger clinical escalation language. This is enforced at the engine level.

### Step 5: Select Operating Mode

Mode selection is a deterministic hierarchy. Evaluate from most severe to least severe.

**General hierarchy (applies to all organisms):**

```
1. Check if any SAFETY-level mode trigger is met → assign safety mode, stop
2. Check for critical pattern triggers that have mode implications → assign that mode, stop
3. Check caution-level mode triggers in governance-weight order → assign first matching, stop
4. Check advisory-level mode triggers → assign first matching, stop
5. No triggers met → assign optimal/aligned mode
```

Each organism defines its exact mode trigger conditions in its Canon² paper. The engine implements these exactly as specified — no interpretation, no softening.

### Step 6: Select Recommendations

Each mode has a defined recommendation set in the engine (not AI-generated). Recommendation selection is:

1. Identify the three primitives with the lowest aggregate values (most degraded)
2. From the active mode's recommendation pool, select the three recommendations that target those three primitives
3. Order by governance weight (most critical primitive first)
4. If a critical pattern is triggered, the pattern's `compound_response` becomes recommendation 1 and pushes the lowest-weight standard recommendation out

Recommendation text is static, predefined, and immutable. It does not vary based on user history or preference. Same mode + same degraded primitives = same recommendations. Always.

### Step 7: Generate Summary

The one-sentence summary is selected from a predefined pool keyed to (active_mode, dominant_primitive, secondary_primitive). It is not generated. It is a lookup.

Example pool entry:
```
key: ("focus_mode", "cognitive_load", "attention")
summary: "Your cognitive load is elevated but your attention is intact — protect focused work now before load reaches your clarity threshold."
```

### Step 8: Compute Ring Data

```
for each primitive:
  axis_value = primitive.aggregate_value
  arc_density = primitive.node_count / 42
  
  domain_effect = null
  if any(node.status in ["caution", "critical"] for node in primitive.nodes 
         and that node has a defined domain_effect):
    domain_effect = that node's effect ID

ring_data = {
  axes: [{ primitive_id, direction, value: axis_value, color_hex, arc_density, domain_effect }],
  overall_health: mean(all primitive aggregate values)
}
```

---

## Cross-Organism Coupling Engine

When multiple organisms are evaluated in the same session, coupling propagation runs after individual organism states are computed.

### Coupling Propagation Order

Coupling flows from lower layers to higher layers:
```
BioCore → NeuroCore → SocioCore → GovernanceCore
```

Physical layer organisms (Meridian, Verdara, HydroCore) do not currently couple to individual-facing organisms in v1. They are evaluated independently.

### Coupling Rules (v1 implementation)

**BioCore → NeuroCore:**
```
neurocore.L7_SleepDebtImpact.value = biocore.N1_SleepQuality.value × 0.85
neurocore.L8_StressIntegration.value = mean(biocore.S1, biocore.S2, biocore.S8) × 0.75
```
After coupling, re-evaluate NeuroCore mode selection (sleep debt or stress may push mode).

**NeuroCore → SocioCore:**
```
sociocore.R2_ConflictTolerance.value += neurocore.E6_EmotionalRegulation.value × 0.4
sociocore.C1_ActiveListeningCapacity.value += neurocore.L2_CognitiveFlexibility.value × 0.35
sociocore.I4_IdentityDrift.value -= neurocore.E3_AnxietyLoad.value × 0.3  // negative coupling
```
After coupling, re-evaluate SocioCore mode selection.

**SocioCore → GovernanceCore:**
```
governancecore.CR2_EscalationPressure.value += sociocore.R2_ConflictTolerance.value × −0.5
governancecore.RC6_RuleDriftRisk.value += sociocore.I4_IdentityDrift.value × 0.3
governancecore.CO9_CoordinationLoad.value += sociocore.S3_SocialBurdenLoad.value × 0.4
```
After coupling, re-evaluate GovernanceCore mode selection.

**Reverse coupling (governance → individual):**
```
neurocore.I1_IntentionClarity.value += governancecore.RC1_RuleClarity.value × 0.25
neurocore.E3_AnxietyLoad.value -= governancecore.RC9_EnforcementPredictability.value × 0.2
neurocore.L11_GlobalCognitiveResilience.value += governancecore.CR11_GlobalGovernanceResilience.value × 0.15
```

All coupling adjustments are clamped to the −1.0 to +1.0 range. Coupling coefficients are defined in the organism papers and must not be altered at implementation time.

### AXIOM Daily Cross-Layer Recommendation Logic

After all three individual organisms are evaluated and coupling propagation is complete:

1. Identify compound signals: cases where two or more organisms have the same dominant primitive status at caution or below
2. For each compound signal, identify the causal chain (which organism is upstream)
3. Select the cross-layer recommendation that addresses the upstream cause
4. Recommendations target the root of the chain, not each symptom separately

Example chain detection:
```
sociocore.S3_SocialBurdenLoad = −0.6   (caution)
neurocore.L4_ExecutiveLoadIndex = −0.55 (caution)
biocore.S2_MusculoskeletalStress = −0.5 (caution)

chain: Social → Cognitive → Biological
root cause: social burden
cross_layer_recommendation_1: "Your social load is driving both your cognitive and biological stress — the social source is the highest-leverage intervention point."
```

---

## Data Source Integrations

### Organism: Verdara Ultra (Outdoor / Environmental)

**Data source 1: OpenWeatherMap Current + Forecast**

API: `https://api.openweathermap.org/data/3.0/onecall`
Required fields: `current.temp`, `current.uvi`, `current.wind_speed`, `current.humidity`, `current.pressure`, `current.clouds`, `daily[0].temp.max`, `daily[0].temp.min`, `daily[0].rain`

Node mappings:
```
UV Index (0–11+):
  normalize: (uvi / 11) × 2 − 1, clamped to +1.0 / −1.0
  → VE_SolarExposureIntensity, VE_UVStressLoad

Temperature (°C, relative to user comfort range, default 18–24°C):
  delta_from_comfort = temp − 21  (midpoint)
  normalize: delta_from_comfort / 15, inverted (comfort = +1.0)
  → VE_ThermalStressLoad, VE_AmbientThermalPressure

Wind Speed (m/s):
  normalize: 1 − (wind_speed / 20), clamped (calm = +1.0, storm = −1.0)
  → VE_WindLoadIndex, VE_AtmosphericTurbulence

Precipitation (mm/hr):
  normalize: 1 − (rain / 50), clamped
  → VE_PrecipitationStress, VE_MoistureLoad

Cloud cover (0–100%):
  normalize: (clouds − 50) / 50, inverted
  → VE_SolarAvailability

Atmospheric pressure change (hPa/6hr from forecast):
  normalize: delta / 10, inverted (stable = +1.0)
  → VE_AtmosphericPressureStability
```

**Data source 2: Open-Elevation API (terrain)**

API: `https://api.open-elevation.com/api/v1/lookup`
Required fields: `elevation` at current location

Node mappings:
```
Elevation (meters):
  normalize: elevation / 3000, clamped (sea level = 0.0, 3000m = +1.0)
  Note: high elevation is not inherently negative — interpret with activity context
  → VE_TerrainElevationFactor

Elevation change (requires route or path points, v2):
  → VE_TerrainDifficultyIndex, VE_PhysicalDemandProfile
```

**Verdara Ultra mode selection context:**
Verdara Ultra is unusual because optimal conditions are context-dependent. A high UV index is optimal for a solar energy farmer and a caution signal for an unprotected outdoor laborer. In v1, use the population-default interpretation. In v2, implement user context profiles.

---

### Organism: Meridian (Energy / Wireless)

**Data source: RF/Network telemetry feed (IoT context)**

In consumer products, Meridian is not directly surfaced. In infrastructure/professional contexts, data feeds from:
- Network monitoring APIs (signal strength, interference metrics, load data)
- Energy grid APIs (load, frequency stability, routing efficiency)
- Custom telemetry endpoints per deployment

Node mappings are deployment-specific. The engine exposes a generic telemetry adapter:
```
POST /v1/organism/meridian/evaluate-from-telemetry
body: {
  "signal_strength": 0.0–1.0,
  "interference_index": 0.0–1.0,
  "load_factor": 0.0–1.0,
  "routing_efficiency": 0.0–1.0
}
```

These four values map directly to the four Meridian primitive aggregates. Node-level distribution follows the standard weighted distribution table from the Meridian paper.

---

### Organism: HydroCore (Hydrological)

**Data source: USGS Water Services API (US deployments)**

API: `https://waterservices.usgs.gov/nwis/iv/`
Required fields: streamflow (cfs), water temperature, dissolved oxygen, turbidity

Node mappings:
```
Streamflow (cfs, relative to seasonal baseline):
  normalize: (flow − baseline) / baseline_std, clamped
  → HC_FlowRateIndex, HC_HydrologicalMomentum

Water temperature (°C, relative to species-specific optimal):
  → HC_ThermalStressIndex, HC_AquaticThermalLoad

Dissolved oxygen (mg/L, optimal 8–12 mg/L):
  normalize: (do − 10) / 4, clamped
  → HC_OxygenSaturation, HC_AquaticHealthIndex
```

**Consumer application of HydroCore:**
In the VedaSolus context (health and wellness), HydroCore governs personal hydration, fluid balance, and moisture-related health indicators. In this context:

Self-report input mapping:
```
"How hydrated do you feel?" → HC_HydrationLevel
"How is your fluid intake today?" → HC_FluidIntakeIndex
"Any swelling or fluid retention?" → HC_FluidRetentionRisk (inverted)
"Physical exertion and sweat loss?" → HC_FluidLossRate
```

---

### Organism: BioCore (Biological)

**Primary data source: Self-report**

```
"Physical energy" (1–10)  → metabolic primitive aggregate
"Stress level" (1–10, inverted) → stress/thermal primitive aggregate
"Sleep quality" (1–10)   → neurological/sleep primitive aggregate
"Recovery status" (1–10) → recovery/momentum primitive aggregate
```

**Secondary data source: Apple Health (HealthKit)**

API: HealthKit via iOS native integration

```
HKQuantityTypeIdentifierHeartRateVariabilitySDNN (ms):
  normalize: (hrv − 40) / 60, clamped (60ms = +0.33, 100ms+ = +1.0)
  → BC_AutonomiRegulation, BC_StressRecoveryIndex

HKCategoryTypeIdentifierSleepAnalysis:
  total_sleep_hours, deep_sleep_minutes, rem_minutes
  sleep_quality = (total_sleep_hours / 8) × 0.5 + (deep_pct + rem_pct) × 0.5
  normalize: sleep_quality × 2 − 1
  → BC_SleepQualityIndex, BC_SleepDebt (inverted if < 7hrs for 3+ days)

HKQuantityTypeIdentifierRestingHeartRate (bpm):
  normalize: (65 − rhr) / 20, clamped (45bpm = +1.0, 85bpm = −1.0)
  → BC_CardiovascularLoad

HKQuantityTypeIdentifierActiveEnergyBurned (kcal):
  → BC_PhysicalExertionLoad (context-dependent, v2)
```

**Secondary data source: Google Fit**

Similar fields via Fitness.BodyMetrics and Fitness.Activity. Normalization functions identical to HealthKit equivalents.

---

### Organism: NeuroCore (Cognitive)

**Primary data source: Self-report** (see AXIOM Neuro product spec)

**Secondary data source: BioCore coupling** (automatic when BioCore is active)
```
L7_SleepDebtImpact ← BC_SleepDebt via coupling engine
L8_StressIntegration ← mean(BC_StressNodes) via coupling engine
```

---

### Organism: SocioCore (Social)

**Primary data source: Self-report** (see AXIOM Social product spec)

**Secondary data source: NeuroCore coupling** (automatic when NeuroCore is active)

**Optional: Communication platform metadata (v2, with explicit user consent)**
```
Daily message volume (normalized against user 14-day mean):
  → SC_CommunicationVolumeLoad (high volume relative to baseline = more negative)
  
Notification density (count per hour):
  → SC_InterruptionLoad
```

Platform APIs: Slack, Teams, Gmail metadata (subject count, not content)
Privacy requirement: metadata only, zero content access, requires explicit opt-in per platform.

---

### Organism: GovernanceCore (Governance)

**Primary data source: Self-report / single-rater** (see AXIOM Work product spec)

**Secondary data source: Multi-rater aggregation** (v2)

**Optional: Project management metadata (v2)**
```
Task overdue rate (% of team tasks past deadline):
  → GC_CoordinationMomentum (inverted)
  
Blocked task count:
  → GC_DeadlockRisk
```

Platform APIs: Jira, Linear, Asana, Monday.com (task metadata only)

---

## Recommendation Engine Specification

All recommendations are predefined static text. The recommendation engine selects from a pool — it does not generate text. This is what makes the determinism guarantee possible.

### Recommendation Pool Structure

Per organism, per mode, the pool contains:

```typescript
interface RecommendationPool {
  organism_id: string
  mode_id: string
  recommendations: {
    target_primitive: string
    governance_weight: number  // 0.0–1.0
    text: string
    severity_floor: "advisory" | "caution" | "critical"
    // severity_floor: only show if target primitive is AT LEAST this severe
  }[]
}
```

Selection algorithm:
```
1. Get active mode's recommendation pool
2. Filter to recommendations where target_primitive.status >= severity_floor
3. Sort by governance_weight descending
4. Select top 3 that cover at least 2 different primitives
   (avoid giving 3 recommendations about the same primitive)
5. If clinical escalation node is triggered, insert clinical text as rank 1
   and drop rank 3
```

### Clinical Escalation Text (hard-coded, not in recommendation pool)

These texts are enforced by the engine. They cannot be overridden by product layer:

**Depression node (NeuroCore E4 at critical):**
"This system is detecting sustained depressive load. This is not a productivity problem — it is a health signal. Please speak with a mental health professional. If you are in the US, call or text 988 (Suicide & Crisis Lifeline) to talk with someone now."

**Burnout node (NeuroCore L3 at critical, sustained 5+ days):**
"Burnout at this level requires more than rest — it requires a structural change to your demands or support. A conversation with a doctor or counselor is appropriate. This system will not recommend productivity interventions while this signal is active."

**Social isolation (SocioCore R7 at critical, R8 at critical simultaneously):**
"Deep loneliness and social disconnection are present simultaneously. Please reach out to one person today — not to solve anything, just to be with someone. If you don't have someone to reach out to, a counselor or support line is a real option."

**GovernanceCore exploitation (F8 at caution or critical):**
"Exploitation risk is detected in your team's governance state. This is a mandatory intervention signal — not advisory. Address this before any other governance priority."

---

## Summary Generation Specification

One-sentence summaries are selected from a predefined lookup table keyed by:
`(active_mode_id, dominant_primitive_id, secondary_primitive_id)`

The lookup table contains summaries for all meaningful combinations per organism (approximately 20–40 entries per organism, covering the most common mode/primitive combinations). Edge cases that miss the lookup table fall back to a mode-level default summary.

Example entries (NeuroCore):

```
("focus_mode", "cognitive_load", "attention") →
  "Your cognitive load is elevated but your attention is intact — protect focused work now before load reaches your clarity threshold."

("recovery_mode", "cognitive_load", "emotional") →
  "Both your mental load and emotional weight are high simultaneously — rest is the only correct intervention today, not optimization."

("emotional_stabilization", "emotional", "intention") →
  "Your emotional system is the dominant signal today: regulate first, direct later."

("cognitive_safety", "cognitive_load", "attention") →
  "This system is recommending a stop: your cognitive resilience is critically depleted and your attention has followed."
```

---

## History and Baseline Specification

### Daily Record Schema

```typescript
interface DailyRecord {
  user_id: string
  organism_id: string
  date: string               // YYYY-MM-DD
  primitive_values: {
    [primitive_id: string]: number   // normalized −1.0 to +1.0
  }
  active_mode_id: string
  overall_health: number
  data_source: DataSource
}
```

### Trend Computation (7-day)

```
for each primitive:
  values_7d = last 7 DailyRecords.primitive_values[primitive_id]
  if len(values_7d) < 3: trend = "insufficient_data"
  else:
    slope = linear_regression_slope(values_7d)
    if slope > 0.05: trend = "improving"
    if slope < −0.05: trend = "degrading"
    else: trend = "stable"
  
  delta_7d = values_7d[−1] − values_7d[0]  // today minus 7 days ago
```

### Baseline Calibration (14-day minimum)

```
for each node:
  values_14d = last 14 DailyRecords node values
  user_mean = mean(values_14d)
  user_std = std_dev(values_14d)
  
  calibrated_thresholds = {
    advisory:  user_mean − (0.5 × user_std),
    caution:   user_mean − (1.0 × user_std),
    critical:  user_mean − (1.5 × user_std)
  }
```

Calibrated thresholds are stored per user per organism and applied on all subsequent evaluations until recalibrated.

---

## Non-Negotiable Engine Constraints

These constraints cannot be softened, overridden, or "UX-smoothed" by any product layer:

1. **Determinism:** Identical inputs must always produce identical outputs. Any source of randomness (random seeds, timestamp-based variation, AI generation) is forbidden in the recommendation and mode selection pipeline.

2. **Hard stop modes:** Cognitive Safety Mode (NeuroCore) and Biological Safety Mode (BioCore) do not include productivity recommendations. Period. The engine will not include them. The product cannot add them.

3. **Clinical escalation:** Clinical escalation text fires when triggered. It cannot be deprioritized, hidden behind a toggle, or softened by the product layer.

4. **GovernanceCore F8:** Exploitation Risk at caution fires mandatory intervention language. The engine inserts this as the top-priority output regardless of other state.

5. **Coupling coefficients:** The coupling propagation coefficients specified in the organism papers are canonical. Implementations must not adjust these for better UX results.

6. **No AI generation in the output pipeline:** Recommendations, summaries, and mode text are all selected from predefined pools. No language model is involved in generating engine outputs. AXIOM's determinism guarantee depends on this.

---

## Deployment Architecture

**Recommended stack:**
- Runtime: Node.js (TypeScript) or Python (FastAPI)
- Database: PostgreSQL (daily records, user baselines)
- Cache: Redis (organism schema, external API response cache — 15-minute TTL for weather data)
- External API calls: handled server-side only (API keys never exposed to client)
- Auth: Trust Layer SSO or standard JWT

**Deployment contexts:**
- Standalone API service (serves all AXIOM consumer products)
- Module within Lume-Cortex OS shell (internal service call)
- Embedded in lume42.com for live organism state display

**Environment variables required:**
```
OPENWEATHER_API_KEY        # Verdara Ultra weather data
OPEN_ELEVATION_API_KEY     # Verdara Ultra terrain data
USGS_API_KEY               # HydroCore (US deployments)
DATABASE_URL               # PostgreSQL connection string
REDIS_URL                  # Cache connection string
TRUST_LAYER_SSO_URL        # Auth validation endpoint
APPLE_HEALTH_CLIENT_ID     # BioCore wearable integration (v2)
GOOGLE_FIT_CLIENT_ID       # BioCore wearable integration (v2)
```

---

## Appendix A: Organism Slugs and Source Files

| Slug | Organism | Source Paper |
|------|----------|-------------|
| `meridian` | Meridian | meridian-paper.md (+ parts 2–8) |
| `verdara-ultra` | Verdara Ultra | verdara-ultra-paper.md |
| `hydrocore` | HydroCore | hydrocore-paper.md |
| `biocore` | BioCore | biocore-paper.md |
| `neurocore` | NeuroCore | neurocore-paper.md |
| `sociocore` | SocioCore | sociocore-paper.md |
| `governancecore` | GovernanceCore | governancecore-paper.md |

All organism papers are the canonical source of truth for node definitions, mode trigger conditions, recommendation pools, critical pattern definitions, coupling coefficients, palette values, and geometry specifications. The engine must implement these exactly as specified.

---

## Appendix B: Version Roadmap

**v1 (initial deployment):**
- Self-report input for all 7 organisms
- External API feeds for Verdara Ultra (weather) and HydroCore (self-report fallback)
- BioCore → NeuroCore → SocioCore coupling chain
- 7-day history and trend computation
- All five AXIOM consumer products (Neuro, Bio, Social, Daily, Work)
- Single-rater AXIOM Work
- lume42.com live schema endpoint

**v2:**
- Apple Health and Google Fit integration for BioCore
- Multi-rater AXIOM Work
- Baseline calibration (14-day)
- Communication platform metadata for SocioCore (opt-in)
- Terrain data for Verdara Ultra (elevation API)
- Meridian and HydroCore professional deployment adapters
- GovernanceCore → NeuroCore reverse coupling
- AXIOM Daily automated morning brief
