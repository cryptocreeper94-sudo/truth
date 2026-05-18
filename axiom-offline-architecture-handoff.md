# AXIOM OFFLINE-CAPABLE DETERMINISTIC ARCHITECTURE
## System Handoff v2.0 — Build Agent Directive

**Author:** DarkWave Studios LLC
**Date:** May 2026
**Status:** Architecture-complete. All sections are implementation directives, not proposals.
**Patent:** 64/032,339 (Pending)

**Related Works:**
- AXIOM Consumer Product Suite Specification v2.0
- AXIOM DLA Engine Improvement Handoff (May 2026)
- Verdara Ultra Organism Paper (DOI pending)
- Lume Language Specification (DOI: 10.5281/zenodo.19382282)
- Lume-V Deterministic Governance (DOI: 10.5281/zenodo.19645097)
- DAIGS Multi-Vertical Framework (DOI: 10.5281/zenodo.19491784)

---

## I. SYSTEM OVERVIEW

AXIOM is a DLA — a Deterministic Language Architecture. It is not an LLM. Same input always produces the same output. No probabilistic inference, no sampling temperature, no neural weights. Hallucination is structurally impossible because no probabilistic model is involved.

**Brand guarantee:** "The AI That Never Guesses."

The offline architecture extends this guarantee to disconnected environments. AXIOM must produce deterministic, useful output whether the device has full network access, partial cache, or no connection at all. The architecture achieves this through a three-tier knowledge system, a formal Pack Streaming Protocol, and a defined fallback response contract.

**Current knowledge corpus:** ~120,000 topics across 212 Knowledge Packs. Target: 1,000,000 topics. The architecture is designed to scale to the 1M target without changes to the offline protocol — only the pack count and cache sizing parameters change.

**Response performance guarantee:** <2ms for cached queries. This constraint governs all architecture decisions. Nothing in the offline layer may add latency above this threshold for a cache-hit query.

---

## II. DLA CONTEXT — HOW KNOWLEDGE PACKS RELATE TO THE ENGINE

The build agent must understand how Knowledge Packs fit into the DLA pipeline before implementing the offline layer.

**DLA composition pipeline (existing):**

```
User Query
  → Intent Classification
  → Pattern Match (local rule engine)
  → Knowledge Lookup (pack topic match)
  → Fact Object: { subject, core, process, goal, aspects, keywords }
  → Deterministic NLG Composition
  → Response (identical every run for identical inputs)
```

Knowledge Packs are the data layer for Step 3 (Knowledge Lookup). They are read-only inputs to the composition engine. They do not contain executable code. They do not modify the runtime. The composition engine is local and deterministic regardless of which packs are loaded — packs only determine what topics can be answered with full fidelity.

**Pre-decomposition:** Per the DLA Improvement Handoff, all 212 packs are pre-decomposed into structured fact objects at build time and stored in `data/fact-cache.json`. The offline layer operates on this pre-decomposed cache, not on raw pack text. The Pack Streaming Protocol delivers packs in raw format; the Micro-Knowledge Cache stores the pre-decomposed fact objects.

---

## III. THREE-TIER KNOWLEDGE ARCHITECTURE

### TIER 1 — CORE ENGINE (LOCAL, ALWAYS PRESENT)

**Footprint target:** <10 MB
**Availability:** 100% — ships with every AXIOM installation, never evicted

Contents:
- Deterministic compiler
- Intent resolver and pattern matcher
- Rule executor and local reasoning graph
- Safety constraints and hard constraint enforcement
- Synthetic Organism Interface Layer (organism hooks)
- Fallback Response Generator (see Section VII)
- Zero external runtime dependencies

**Capability without Tier 2 or 3:** AXIOM can respond to any query. Responses for topics not present in the local cache use the Fallback Response Format (Section VII). No query is left unanswered. No query produces an error state visible to the user.

### TIER 2 — MICRO-KNOWLEDGE CACHE (LOCAL, ROTATING)

**Target size:** 50–200 pre-decomposed Knowledge Packs (scalable as device storage allows)
**Eviction policy:** LRU (Least Recently Used) with frequency bias — packs accessed more than 3 times in the past 30 days are promoted to "pinned" status and exempt from LRU eviction
**Index format:** Pattern signature index (see Appendix A)
**Storage location:** `data/micro-cache/` — pre-decomposed fact objects, not raw pack text

**Bootstrap set:** 24 packs ship pre-loaded on first install (see Appendix B). These cover the core of all five AXIOM consumer products plus the Verdara Ultra organism vertical. The bootstrap set provides meaningful offline capability from the first session, before any user-driven cache population occurs.

**Capability with Tier 2 only (no network):** Based on the 24-pack bootstrap set covering the highest-frequency query patterns across all AXIOM products, the bootstrap configuration resolves approximately 70% of common first-session queries fully offline. After 30 days of normal use, the user-populated LRU cache is projected to reach 85%+ offline resolution for that user's personal query patterns.

**Important:** The "80% offline" figure used informally in prior documents is a target for the steady-state user cache, not a guarantee on first install. The build agent must not surface this figure to users. The user-facing language is: "Most questions answered offline. A few may need a connection."

### TIER 3 — CLOUD KNOWLEDGE PACKS (REMOTE)

**Full corpus:** All 212 current packs, scaling to 1,000,000 topics
**Delivery:** Streamed on demand via Pack Streaming Protocol (Section IV)
**Local storage:** Only the requested topic's fact objects are cached — full packs are never downloaded in their entirety unless the user explicitly triggers a "sync all" operation
**Version control:** Each pack has a monotonically increasing version integer and an Ed25519-signed pack root (see Appendix A)

---

## IV. PACK STREAMING PROTOCOL (PSP)

### 4.1 Protocol Overview

The PSP is a deterministic, minimal-bandwidth protocol for fetching only the knowledge required to answer a specific query. It never fetches more than the query requires.

**Sequence:**

```
1. Query arrives → intent classified → pattern match attempted
2. Cache miss detected (required topic not in Tier 2)
3. AXIOM checks network state
   a. Online → PSP fetch (steps 4–7)
   b. Offline → Fallback Response (Section VII)
4. PSP sends Pack Header Request to remote server
5. Server returns Pack Header (see schema, Appendix A)
6. AXIOM evaluates: local pack version vs. server pack version
   a. Same version → request only the missing topic delta
   b. Lower version → request full topic delta for changed topics
   c. No local pack → request topic subset (only topics matching query)
7. Server returns Topic Delta (see schema, Appendix A)
8. AXIOM stores fact objects in Micro-Knowledge Cache
9. AXIOM executes composition pipeline on freshly cached facts
10. Response returned to user
```

### 4.2 What Is and Is Not Transmitted

| Direction | Content | Never Transmitted |
|---|---|---|
| Client → Server | Pack ID, topic pattern signature, local version integer, device ID (hashed) | User query text, user identity, session history |
| Server → Client | Pack header, topic fact objects, version integer, Ed25519 attestation | Other users' cache state, full pack contents (unless topic count < 5) |

User query text never leaves the device. The server receives only a topic pattern signature — a hash of the topic category, not the query itself. Privacy is structural, not policy-dependent.

### 4.3 Network Failure Handling

If the PSP fetch fails at any point (timeout, DNS failure, server error):

1. AXIOM logs the missing pack signature and topic pattern to `data/sync-queue.json`
2. AXIOM immediately invokes the Fallback Response Generator (Section VII)
3. The user receives a response — never an error screen
4. On next successful network contact, the sync queue is processed (Section V, Mode C)

**Timeout threshold:** 800ms. If the server has not returned a Pack Header within 800ms, the fetch is abandoned and fallback is triggered. This preserves the user experience without visibly degrading to a loading state.

---

## V. OFFLINE MODE BEHAVIOR

### Mode A — Full Offline

**Condition:** No network available. Only Tier 1 + Tier 2 accessible.

**Behavior:**
- Pattern matching runs against Tier 2 cache
- Cache hits → full deterministic response, indistinguishable from online response
- Cache misses → Fallback Response (Section VII) + log to sync queue
- All organism integrations continue operating (organism state is local)
- No error states, no loading spinners, no "offline" banners for cache hits

**User-facing indicator:** A small persistent indicator in the UI showing "Local mode" — not "Offline" or "Degraded." Language matters. The system is not broken; it is operating on local knowledge.

### Mode B — Partial Offline

**Condition:** Device has Tier 2 cache from prior sessions. Network intermittently available or slow.

**Behavior:**
- Same as Mode A for cache hits
- For cache misses: PSP fetch attempted with 800ms timeout
  - Success → cache populated, full response delivered
  - Timeout → fallback triggered, topic queued for background sync
- Background sync runs when connection is stable (does not block user queries)

### Mode C — Sync Mode (Connection Restored)

**Condition:** Network connection established after offline period.

**Sync sequence:**
1. Read `data/sync-queue.json` — list of missing pack signatures from offline period
2. For each queued signature: request only the topic delta (not full pack)
3. Verify Ed25519 attestation on each received delta
4. Write verified fact objects to Micro-Knowledge Cache
5. Remove successfully synced entries from sync queue
6. Log sync completion with timestamp to `data/sync-log.json`

**Sync is non-blocking.** It runs as a background process and does not interfere with active user queries. If the user issues a query for a topic currently being synced, the existing cache state (or fallback) is used — the sync result is available for the next identical query.

---

## VI. FALLBACK RESPONSE FORMAT

This section is critical. Every cache miss — whether from a cold-start device, an offline session, or a PSP timeout — produces a fallback response. The fallback must be useful, honest, and tonally consistent with the AXIOM brand voice. It must not feel like an error.

### 6.1 Fallback Response Schema

```json
{
  "response_type":   "fallback",
  "topic_pattern":   "string — the matched topic category (e.g., 'cognitive_load_management')",
  "confidence":      "partial | none",
  "body":            "string — the composed fallback response text (see 6.2)",
  "sync_queued":     true | false,
  "available_when":  "online | next_sync | already_cached",
  "organism_state":  "object — current organism mode and primitive scores if organism is active",
  "deterministic":   true
}
```

**`confidence: partial`** — Used when Tier 1 rules can produce a structurally valid response for the topic category, but without the specific pack's depth. The response answers the question in general terms.

**`confidence: none`** — Used when the topic pattern is outside Tier 1's rule coverage entirely. The response acknowledges the gap and provides actionable next steps.

### 6.2 Fallback Response Composition Rules

The build agent must implement the fallback composer as a rule-based NLG function in the Tier 1 Core Engine. The composer takes `{topic_pattern, confidence, organism_state}` as input and produces a response string. Rules:

**Rule F1 — Never say "I don't know."**
The fallback response always provides something useful. If confidence is `none`, the response provides the governance principle that governs the topic category, not a statement of ignorance.

*Prohibited:* "I don't have information on that topic."
*Correct:* "That falls under [topic category]. The governing principle is [Tier 1 rule]. For full detail, [sync note]."

**Rule F2 — Never say "offline" or "unavailable" to the user.**
The system is operating in local mode. The vocabulary the user sees: "local knowledge," "expanded detail available when connected," "syncing in the background."

*Prohibited:* "This topic is unavailable offline."
*Correct:* "I can answer this from local knowledge. Full detail syncs in the background."

**Rule F3 — If an organism is active, ground the response in organism state.**
When Verdara Ultra, Lume-Auto, or any other organism is running and providing state, the fallback for any topic in that organism's domain uses the live organism state as the response foundation. A fallback response grounded in real sensor data is more useful than a generic principle statement.

*Example (Verdara Ultra active, weather pack not cached):*
"Your current terrain flow state is [FS value from organism]. Weather pack detail is syncing. Based on current elevation and pace, [Tier 1 routing rule output]."

**Rule F4 — Sync note is always the last sentence, never the first.**
The information about what will be available when connected is secondary. The useful content comes first.

**Rule F5 — Fallback responses are deterministic.**
Given identical `{topic_pattern, confidence, organism_state}`, the fallback composer always returns identical text. This is enforced by making the composer a pure function with no randomness.

### 6.3 Example Fallback Responses

**Confidence: partial — topic: sleep_pressure_management**
> "Sleep pressure governs cognitive recovery. The core principle: sleep pressure accumulates linearly with time awake and clears only during slow-wave sleep. Without a full pack load, specific threshold values for your baseline are not available locally. Full personalized thresholds sync in the background."

**Confidence: none — topic: specific_supplement_interaction**
> "Supplement interaction detail requires the nutrition pack, which is syncing in the background. The governing principle: any compound that affects adenosine, cortisol, or HRV falls under biological flow governance. For immediate guidance, check your Bio primitive scores — the organism's current state is the most relevant signal available right now."

---

## VII. SYNTHETIC ORGANISM INTERFACE

### 7.1 Interface Commitment

**The build agent must implement the organism interface as JSON-RPC 2.0 over a local socket.**

- **Unix/Linux/macOS:** Unix domain socket at `/tmp/axiom-organism.sock`
- **Windows:** Named pipe at `\\.\pipe\axiom-organism`
- **Fallback (environments where neither is available):** JSON-RPC 2.0 over `localhost:PORT` where PORT is assigned at runtime and written to `data/organism-port.lock`

Do not implement both IPC and network transports simultaneously in the same session. The socket-based IPC is the primary transport. The localhost fallback is for constrained environments only and must be gated on a runtime check.

### 7.2 Message Schemas

**Organism → AXIOM (state push, called by organism at each governance cycle):**

```json
{
  "jsonrpc": "2.0",
  "method":  "organism.state_update",
  "params": {
    "organism_id":       "string — e.g., 'verdara_ultra', 'lume_auto'",
    "timestamp":         "ISO 8601 UTC",
    "mode":              "OPTIMAL | ADVISORY | CAUTION | CRITICAL | RECOVERY",
    "primitives": {
      "TB": 0.0,
      "PR": 0.0,
      "FS": 0.0,
      "SL": 0.0
    },
    "active_constraints": ["string — list of active hard constraint IDs"],
    "priority_nodes":     ["string — node IDs above advisory threshold"],
    "environment":        {}
  },
  "id": null
}
```

**AXIOM → Organism (query for context, called by AXIOM before composing response):**

```json
{
  "jsonrpc": "2.0",
  "method":  "organism.get_context",
  "params": {
    "topic_pattern": "string",
    "context_depth": "primitive | node | full"
  },
  "id": "string — request correlation ID"
}
```

**Organism → AXIOM (context response):**

```json
{
  "jsonrpc": "2.0",
  "result": {
    "organism_id":    "string",
    "mode":           "string",
    "relevant_nodes": [
      {
        "node_id":    "string",
        "value":      0.0,
        "trend":      "improving | stable | degrading",
        "in_alert":   true | false
      }
    ],
    "summary":        "string — one sentence organism state summary"
  },
  "id": "string — matching request correlation ID"
}
```

### 7.3 Offline Behavior of the Interface

The organism interface operates fully offline. The organism provides state from local sensors. AXIOM composes responses using that state plus local Tier 1/2 knowledge. The coupling is local IPC — it has no network dependency.

**If the organism is not running:** AXIOM operates without organism context. No error. The `organism_state` field in fallback responses is omitted. AXIOM's knowledge pipeline functions independently.

**If the organism enters CRITICAL or LIMP mode:** AXIOM immediately pauses any non-safety response composition and invokes the hard constraint response path — a fixed, pre-composed Tier 1 response appropriate to the constraint type. Hard constraint responses are not subject to pack availability. They are always in Tier 1.

---

## VIII. SECURITY AND VERSIONING

### 8.1 Pack Signing

All Knowledge Packs are signed using **Ed25519** — consistent with the broader Canon cryptographic standard (CAL chain attestation, Lume-V trust certificates, Enterprise Mesh chain roots).

Each pack carries:
- A pack root: Ed25519 signature over the Merkle root of all fact objects in the pack
- Signed by the DarkWave Studios LLC pack signing key
- Public key published at `lume-lang.org/pack-signing-key.pub`

The build agent must verify the Ed25519 attestation on every pack received via PSP before writing fact objects to the Micro-Knowledge Cache. A pack that fails signature verification is rejected in its entirety. The topic is queued for re-fetch. The user receives a fallback response.

### 8.2 Pack Security Model

| Property | Guarantee |
|---|---|
| Packs contain executable code | Never — packs are JSON fact objects only |
| Packs can modify the runtime | Never — the composition engine is read-only to pack content |
| Packs can modify hard constraints | Never — hard constraints are Tier 1, isolated from pack data |
| Pack tampering is detectable | Always — Ed25519 signature over Merkle root |
| Version rollback is detectable | Always — version integer is monotonically increasing; the engine rejects version integers lower than the locally stored version |

### 8.3 Sensitive Deployment Note

For military, industrial control, and privacy-sensitive deployments identified as target use cases: the current architecture meets general commercial security requirements. FIPS 140-2/3 compliance, classified data handling, and air-gapped deployment configurations are **not** specified in this document and require a separate security architecture handoff before deployment in those environments. The build agent must not assume the current architecture is sufficient for classified or federally regulated deployments without that additional specification.

---

## IX. IMPLEMENTATION ROADMAP

All phases are implementation directives. The build agent executes them in order. No phase is optional.

### Phase 1 — Core Runtime (Tier 1)

**Deliverables:**
- Pattern matcher with deterministic intent classification
- Rule executor and local reasoning graph
- Hard constraint enforcement layer
- Fallback Response Generator (all rules in Section VI implemented and tested)
- `data/sync-queue.json` write path

**Acceptance criteria:**
- Given any query, the system returns a response within 2ms (Tier 1 only)
- Given a topic with no cache entry, the fallback response is deterministic: identical input → identical output on repeated runs
- Hard constraint responses fire correctly when constraint flags are injected
- All five Fallback Rules (F1–F5) are verifiable by automated test

### Phase 2 — Micro-Knowledge Cache (Tier 2)

**Deliverables:**
- LRU cache with frequency-bias pinning (3+ accesses in 30 days → pinned)
- Pack index loader from `data/fact-cache.json` (pre-decomposed format from DLA Improvement Handoff)
- Bootstrap pack installer — loads the 24 packs defined in Appendix B on first run
- Cache hit detection integrated into the composition pipeline (cache hit bypasses PSP entirely)

**Acceptance criteria:**
- Cache hit for any bootstrap pack topic returns response within 2ms
- LRU eviction correctly exempts pinned packs
- Bootstrap install completes on first run without network access
- `data/micro-cache/` directory structure matches Appendix A index format

### Phase 3 — Pack Streaming Protocol (Tier 3)

**Deliverables:**
- PSP client implementing the 10-step sequence in Section IV
- 800ms timeout with automatic fallback trigger
- Ed25519 signature verification on all received pack deltas
- `data/sync-queue.json` read/write for offline queuing
- Pack Header Request and Topic Delta schemas (Appendix A)

**Acceptance criteria:**
- PSP fetch for a single topic delta completes and is cached within 1.5 seconds on a standard broadband connection
- Ed25519 verification failure causes topic rejection with sync re-queue, not a crash
- 800ms timeout fires correctly under simulated network delay
- A pack with a lower version integer than the locally stored version is rejected

### Phase 4 — Synthetic Organism Interface

**Deliverables:**
- JSON-RPC 2.0 server on Unix domain socket / Windows named pipe
- `organism.state_update` handler — updates AXIOM's current organism context
- `organism.get_context` request/response handler
- Hard constraint mode detection — when organism enters CRITICAL, hard constraint response path fires
- Localhost fallback (gated on runtime environment check)

**Acceptance criteria:**
- Verdara Ultra organism can push state updates via IPC and AXIOM's composition pipeline uses that state in the next response
- CRITICAL mode organism state triggers hard constraint response within one governance cycle
- Interface operates fully offline with no network calls
- All three schema fields (`organism_id`, `mode`, `primitives`) are validated on receipt; malformed messages are rejected without crashing the runtime

### Phase 5 — Offline Sync Engine

**Deliverables:**
- Sync queue processor (reads `data/sync-queue.json`, executes PSP fetches, clears queue on success)
- Background sync runner — non-blocking, runs when network is available, does not delay active queries
- `data/sync-log.json` writer with timestamps and result codes
- Mode C (Sync Mode) full flow as specified in Section V

**Acceptance criteria:**
- Sync queue is fully processed within 60 seconds of network restoration for a queue of up to 50 missing topic signatures
- Sync never blocks a user query — active query always takes priority over background sync
- Sync log captures timestamp, pack ID, topic count, and success/failure per sync operation
- On sync failure for any individual topic, the queue entry is retained and retried on next sync cycle (not cleared on failure)

---

## X. SCALE ARCHITECTURE NOTE

The current corpus is ~120,000 topics across 212 packs. The target is 1,000,000 topics. The offline architecture does not require modification at 1M topics — the Micro-Knowledge Cache scales by adding more pack slots (increasing the 50–200 range as device storage allows), the PSP scales by adding more pack IDs to the remote index, and the pre-decomposition step scales by processing more packs at build time.

The one parameter that requires re-evaluation at 1M topics is the bootstrap pack selection (Appendix B). At 1M topics, the 24-pack bootstrap set will represent a smaller fraction of the total corpus. The bootstrap selection criteria (highest query frequency per product vertical) remains correct — only the absolute topic coverage percentage changes. Bootstrap pack revision is a content decision, not an architecture change.

---

## APPENDIX A — PACK FORMAT SCHEMAS

### A.1 Pack Header (Server → Client)

```json
{
  "pack_id":           "string — unique pack identifier (e.g., 'neuro_cognitive_load_v4')",
  "version":           42,
  "topic_count":       847,
  "topic_index": [
    {
      "pattern_signature": "hex — SHA-256 of the topic pattern string",
      "topic_id":          "string — human-readable topic identifier",
      "fact_count":        12
    }
  ],
  "pack_root":         "hex — Merkle root of all fact objects in this pack",
  "attestation":       "hex — Ed25519 signature of pack_root by DarkWave signing key",
  "updated_at":        "ISO 8601 UTC"
}
```

### A.2 Topic Delta (Server → Client)

```json
{
  "pack_id":      "string",
  "version":      42,
  "topics": [
    {
      "topic_id":         "string",
      "pattern_signature": "hex",
      "facts": [
        {
          "subject":   "string",
          "core":      "string",
          "process":   "string",
          "goal":      "string",
          "aspects":   ["string"],
          "keywords":  ["string"]
        }
      ],
      "topic_hash": "hex — SHA-256 of the canonically serialized facts array"
    }
  ],
  "delta_root":   "hex — Merkle root of this delta's topic_hashes",
  "attestation":  "hex — Ed25519 signature of delta_root"
}
```

### A.3 Micro-Cache Index Entry

```json
{
  "pack_id":           "string",
  "version":           42,
  "cached_at":         "ISO 8601 UTC",
  "last_accessed":     "ISO 8601 UTC",
  "access_count":      17,
  "pinned":            false,
  "topic_signatures":  ["hex"],
  "cache_path":        "data/micro-cache/{pack_id}/facts.json"
}
```

### A.4 Sync Queue Entry

```json
{
  "queued_at":         "ISO 8601 UTC",
  "pack_id":           "string",
  "pattern_signature": "hex",
  "retry_count":       0,
  "last_attempt":      null,
  "reason":            "cache_miss | psp_timeout | signature_failure"
}
```

---

## APPENDIX B — BOOTSTRAP PACK LIST

The following 24 packs ship pre-loaded on every AXIOM installation. Selection criteria: highest query frequency per product vertical, covering all five AXIOM consumer products and the Verdara Ultra organism domain. No network access required to install these packs — they are bundled with the application.

| # | Pack ID | Product Vertical | Topic Coverage |
|---|---|---|---|
| 1 | `neuro_cognitive_load_v1` | AXIOM Neuro | Cognitive load, attention, focus degradation |
| 2 | `neuro_decision_fatigue_v1` | AXIOM Neuro | Decision fatigue, choice architecture, recovery |
| 3 | `neuro_sleep_pressure_v1` | AXIOM Neuro | Sleep pressure, circadian alignment, recovery windows |
| 4 | `neuro_performance_states_v1` | AXIOM Neuro | Flow state, peak performance conditions |
| 5 | `bio_hrv_governance_v1` | AXIOM Bio | HRV interpretation, stress-recovery balance |
| 6 | `bio_cortisol_rhythm_v1` | AXIOM Bio | Cortisol patterns, stress response governance |
| 7 | `bio_fatigue_classification_v1` | AXIOM Bio | Physical vs. cognitive fatigue differentiation |
| 8 | `bio_nutrition_timing_v1` | AXIOM Bio | Meal timing, energy flow governance |
| 9 | `social_communication_load_v1` | AXIOM Social | Communication overhead, interaction cost |
| 10 | `social_conflict_signals_v1` | AXIOM Social | Early conflict detection, de-escalation patterns |
| 11 | `social_team_cohesion_v1` | AXIOM Social | Team cohesion indicators, coordination health |
| 12 | `daily_check_in_core_v1` | AXIOM Daily | Core daily check-in — all four primitives |
| 13 | `daily_trend_interpretation_v1` | AXIOM Daily | Multi-day trend reading, primitive trajectory |
| 14 | `work_decision_governance_v1` | AXIOM Work | Governance decision quality, escalation patterns |
| 15 | `work_meeting_load_v1` | AXIOM Work | Meeting density, cognitive load from coordination |
| 16 | `verdara_terrain_flow_v1` | Verdara Ultra | Terrain primitives, elevation and grade governance |
| 17 | `verdara_weather_risk_v1` | Verdara Ultra | Weather hazard windows, lightning risk thresholds |
| 18 | `verdara_biological_flow_v1` | Verdara Ultra | Hydration, caloric, and exertion governance |
| 19 | `verdara_route_scoring_v1` | Verdara Ultra | Route risk scoring, bailout point identification |
| 20 | `verdara_hard_constraints_v1` | Verdara Ultra | All hard constraint rules for outdoor safety |
| 21 | `axiom_core_principles_v1` | All Products | AXIOM brand voice, determinism explanation, DLA principles |
| 22 | `organism_mode_explanations_v1` | All Products | What each operating mode means in plain language |
| 23 | `hard_constraint_responses_v1` | All Products | Pre-composed hard constraint response text (Tier 1 reinforcement) |
| 24 | `fallback_topic_bridges_v1` | All Products | Topic bridge rules for graceful fallback across all verticals |

**Packs 21–24 are system packs.** They are never evicted by LRU. They are pinned permanently.

---

## APPENDIX C — OFFLINE MODE DETECTION

The build agent must implement network state detection as a pure function, not a continuous background monitor. Network state is checked at query time, not on a timer.

**Detection sequence:**

```
1. Query arrives
2. Pattern match → cache hit check
   a. Cache hit → return response immediately (no network check needed)
   b. Cache miss → proceed to step 3
3. Network check: attempt DNS resolution of pack server hostname
   - Timeout: 200ms
   - Success → proceed to PSP fetch
   - Failure → Mode A (Full Offline), trigger fallback immediately
```

The 200ms DNS check adds at most 200ms to cache-miss queries when offline — the system does not hang on a failed connection. The 800ms PSP timeout applies after successful DNS resolution.

**Never poll for network state.** Network state is resolved only when a cache miss requires it. Continuous polling wastes battery on mobile and edge devices and is architecturally unnecessary.

---

*AXIOM Offline-Capable Deterministic Architecture — System Handoff v2.0*
*© 2026 DarkWave Studios LLC. All rights reserved.*
*Patent 64/032,339 Pending.*
