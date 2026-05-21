# AXIOM DLA ENGINE — IMPROVEMENT HANDOFF
## Date: May 2026
## Author: DarkWave Studios LLC Engineering
## Classification: Internal — Architecture Improvement Recommendations

---

## TERMINOLOGY

**DLA — Deterministic Language Architecture**
Coined: May 2026
Author: Jason Andrews / DarkWave Studios LLC
Patent: 64/032,339 (Pending)

A DLA is a language response system in which output is governed by deterministic architecture rather than probabilistic inference. Same input always produces the same output. No stochastic models, no neural weights, no sampling temperature. Responses are composed from structured knowledge and governed grammar — auditable, reproducible, and offline-capable.

DLA is the category term that distinguishes AXIOM from Large Language Models (LLMs). An LLM is large and probabilistic. A DLA is deterministic by architecture. These are not points on the same spectrum — they are fundamentally different classes of language system.

| Property | LLM | DLA |
|----------|-----|-----|
| Output | Probabilistic — varies per run | Deterministic — identical every run |
| Auditability | Black box | Pure function |
| Infrastructure | Cloud, GPU, token billing | Local, offline-capable |
| Safety | Guardrails bolted on after | Hard constraints at architecture level |
| Licensing | Training data provenance uncertain | Explicit, clean, documented |
| Hallucination | Structural risk | Structurally impossible |

AXIOM is a DLA. It does not guess.

---

## 1. SCOPE

This document identifies five targeted improvements to the DLA NLG pipeline introduced in the May 7, 2026 audit handoff. All improvements are additive — no breaking changes to the existing pipeline, no data loss, no changes to the backwards-compatible fallback behavior.

**Systems Affected:** DLA Engine (`D:\dda`) — composition layer only
**Systems NOT Affected:** Trust Layer SSO, Firebase Auth, Axiom Studio IDE, Lume-Cortex OS, Arbora Platform, all 212 knowledge packs

---

## 2. IMPROVEMENT SUMMARY

| # | Improvement | Priority | Effort | Risk |
|---|-------------|----------|--------|------|
| 1 | Pre-decomposition of all 212 packs at build time | High | Medium | Low |
| 2 | Fallback telemetry — measure NLG pipeline health | High | Low | None |
| 3 | Thesaurus expansion — increase variation surface | Medium | Medium | None |
| 4 | Correction confidence layer — protect knowledge integrity | Medium | Low | Low |
| 5 | Tone detection specification — explicit, auditable logic | Low | Low | None |

---

## 3. IMPROVEMENT DETAILS

---

### 3.1 Pre-Decomposition of All 212 Packs at Build Time

**Problem:**
The current composition engine parses pre-written response text into structured fact objects (`{ subject, core, process, goal, aspects, keywords }`) at runtime, on the fly. With 181,000 topics across 212 packs, this parsing happens at query time. Under load, this adds measurable latency that conflicts with AXIOM's <2ms response guarantee.

**Improvement:**
Add a build-time pre-decomposition step that processes all 212 packs once and writes the structured fact objects to a JSON cache. At runtime, the composition engine reads from the cache rather than parsing on the fly.

**Implementation:**

New file: `scripts/predecompose-packs.mjs`

```javascript
// Run at build time: node scripts/predecompose-packs.mjs
// Reads all 212 packs, decomposes each response into structured facts,
// writes output to data/fact-cache.json

import { CompositionEngine } from '../src/composition/composition-engine.js';
import { loadAllPacks } from '../src/knowledge/pack-loader.js';
import { writeFileSync } from 'fs';

const packs = await loadAllPacks();
const engine = new CompositionEngine();
const cache = {};

for (const [domain, topics] of Object.entries(packs)) {
  cache[domain] = {};
  for (const [topicKey, response] of Object.entries(topics)) {
    cache[domain][topicKey] = engine.decompose(response);
  }
}

writeFileSync('data/fact-cache.json', JSON.stringify(cache, null, 2));
console.log(`Pre-decomposed ${Object.keys(packs).length} packs.`);
```

Modify `composition-engine.js` to check the cache first:

```javascript
// In CompositionEngine.compose(domain, topicKey, rawResponse):
const cached = this.factCache?.[domain]?.[topicKey];
const fact = cached ?? this.decompose(rawResponse);
```

Add `pnpm run predecompose` (or equivalent) to the build script.

**Outcome:** Runtime fact decomposition is eliminated. Cold-start latency from 212 packs drops to zero. <2ms guarantee is protected.

---

### 3.2 Fallback Telemetry — Measure NLG Pipeline Health

**Problem:**
The `cognitive-engine.js` try/catch wrapper falls back to legacy `_applyMode()` silently when the composition engine fails. There is currently no way to know how often this fallback fires, which grammar templates are failing, or which intent types are underserved. A pipeline that fails 40% of the time looks identical to one that fails 0% of the time from the outside.

**Improvement:**
Add a lightweight counter to the catch block that logs intent type, domain, and failure reason without disrupting the user-facing response.

**Implementation:**

Modify `cognitive-engine.js` catch block:

```javascript
try {
  result = CompositionEngine.compose(domain, intentKey, answer);
} catch (err) {
  // Existing fallback — unchanged
  result = this._applyMode(answer);

  // NEW: telemetry (non-blocking, fire-and-forget)
  this._logFallback({
    domain,
    intentKey,
    error: err.message,
    timestamp: Date.now()
  });
}
```

New method in `cognitive-engine.js`:

```javascript
_logFallback({ domain, intentKey, error, timestamp }) {
  // Append to a rolling JSON log — no external dependency
  const entry = JSON.stringify({ domain, intentKey, error, timestamp }) + '\n';
  try {
    appendFileSync('logs/composition-fallbacks.log', entry);
  } catch (_) {
    // Never let telemetry break the response path
  }
}
```

Add a summary script: `scripts/fallback-report.mjs`
- Reads `logs/composition-fallbacks.log`
- Groups by `intentKey` and `domain`
- Outputs top 10 failing patterns sorted by frequency

**Outcome:** You have visibility into actual NLG pipeline health. The fallback-report script tells you exactly which intent types and domains need grammar template attention. Engineering decisions become data-driven rather than guesswork.

---

### 3.3 Thesaurus Expansion — Increase Variation Surface

**Problem:**
The current thesaurus has 128 root words and 1,022 synonym links. Serving 181,000 topics across 212 domains, the variation surface is narrow. Users who interact with AXIOM frequently will begin to notice recurring synonym substitutions, reducing the naturalness that the NLG pipeline was built to create.

**Improvement:**
Two targeted expansions that require no new licensing complexity:

**Expansion A — Domain-specific synonym packs (internal, no license required):**

New file: `data/domain-thesaurus.json`

Each of the 212 domain packs can contribute a small list of domain-specific synonyms at pack authoring time. Format:

```json
{
  "physics": {
    "energy": ["power", "force", "capacity", "work"],
    "particle": ["body", "element", "unit", "constituent"]
  },
  "medicine": {
    "treatment": ["therapy", "intervention", "management", "care"],
    "patient": ["individual", "person", "subject", "case"]
  }
}
```

The composition engine checks domain-thesaurus first, falls back to moby-thesaurus. Domain-specific terms are always more precise than general synonyms.

**Expansion B — WordNet Full (same Princeton license, already approved):**

The current `wordnet-core.json` has 19 antonym entries. The full Princeton WordNet database contains ~155,000 word senses and is available under the same license already approved and noted in the audit handoff. Ingesting a curated subset (e.g., the 5,000 most common English words with their synonym sets) would increase the variation surface by roughly 40×.

Update `ingest-thesaurus.mjs` to process the WordNet full data file.

**Outcome:** Synonym variation becomes rich enough that heavy AXIOM users do not perceive repetition. The domain-specific pack approach also improves semantic precision — "therapy" is more appropriate than "treatment" in some medical contexts, and a domain-scoped thesaurus makes that distinction.

---

### 3.4 Correction Confidence Layer — Protect Knowledge Integrity

**Problem:**
When a user says "actually, that's wrong" or "no, actually..." the learning system writes to `learned_corrections.json` and the correction overrides the source pack on future queries. If the user is mistaken and the pack was correct, the correction silently corrupts the system's knowledge for all future sessions. There is no audit trail and no way to distinguish a valid correction from an incorrect user override.

**Improvement:**
Add a confidence field and a source comparison log to every correction entry.

**Implementation:**

Modify `learning-memory.js` correction write:

```javascript
// Before writing correction:
const originalAnswer = await KnowledgeEngine.query(topic);

const correctionEntry = {
  topic,
  original: originalAnswer.answer,   // what the pack said
  correction: userCorrection,        // what the user said
  timestamp: Date.now(),
  confirmed: false,                  // requires one re-confirmation to lock
  sessionsSeen: 0
};

// Write to learned_corrections.json as before
```

Add a confirmation step in `learning-memory.js`:

```javascript
// On subsequent session where same topic is queried:
// If correction.confirmed === false, increment sessionsSeen
// If sessionsSeen >= 2, set confirmed = true (user has seen the correction applied twice without complaining)
// If user says "actually that's wrong" again on the same topic, discard correction and restore original
```

Add `scripts/audit-corrections.mjs`:
- Lists all corrections with original vs. corrected side by side
- Flags corrections where the original pack text contains authoritative source markers (citations, formulas, proper nouns)

**Outcome:** User corrections that are genuinely useful get confirmed over two sessions and lock in. User corrections that are mistakes either get reversed when the user notices, or are flagged in the audit script for human review. Knowledge integrity is protected without removing the correction learning feature.

---

### 3.5 Tone Detection — Explicit, Auditable Logic

**Problem:**
The audit handoff states tone is "auto-detected from query style" but does not specify the detection mechanism. An unspecified mechanism cannot be audited, tuned, or debugged when it misfires. If a user writes casually but asks a technical question, it is unclear which signal wins.

**Improvement:**
Make the tone detection logic explicit and document it in `tone-adapter.js`.

**Recommended detection hierarchy (in priority order):**

```javascript
detectTone(query, conversationContext) {
  // Priority 1: Explicit user preference from learning-memory
  const learned = this.memory.getPreference('tone');
  if (learned) return learned;

  // Priority 2: Explicit query signal (user is telling us the register)
  if (/\b(technical|detailed|in depth|explain fully)\b/i.test(query)) return 'technical';
  if (/\b(briefly|short|quick|summary|tldr)\b/i.test(query)) return 'concise';
  if (/\b(simple|easy|layman|plain)\b/i.test(query)) return 'conversational';
  if (/\b(scholarly|academic|formally|cite)\b/i.test(query)) return 'scholarly';
  if (/\b(i'm (struggling|worried|confused)|help me understand)\b/i.test(query)) return 'empathetic';

  // Priority 3: Domain-based default
  const domainToneMap = {
    'medicine': 'empathetic',
    'physics': 'technical',
    'mathematics': 'technical',
    'casual_conversation': 'conversational',
    'legal': 'scholarly'
  };
  if (domainToneMap[domain]) return domainToneMap[domain];

  // Priority 4: Fallback
  return 'conversational';
}
```

**Outcome:** Tone detection is a readable pure function. Every tone assignment has a documented reason. Misfires are diagnosable by reading the function rather than debugging a black box. Domain-based defaults mean technical questions get technical tone even when asked casually.

---

## 4. REVISED REMAINING WORK ORDER

Reprioritized from the original audit handoff based on the above analysis:

| Priority | Item | Source |
|----------|------|--------|
| 1 | Pre-decomposition build step | This document §3.1 |
| 2 | Fallback telemetry | This document §3.2 |
| 3 | Correction confidence layer | This document §3.4 |
| 4 | Tone detection specification | This document §3.5 |
| 5 | Thesaurus expansion — domain packs | This document §3.3 |
| 6 | Thesaurus expansion — WordNet full | This document §3.3 |
| 7 | API router metadata (composition trace) | Original audit handoff §10.2 |
| 8 | Live integration test in Axiom Studio IDE | Original audit handoff §10.4 |

---

## 5. WHAT IS NOT CHANGING

- All 212 packs and ~181K topics remain intact
- The determinism guarantee (hash-seeded synonym variation) is unchanged
- The 5-dimension learning system is unchanged except for the correction confidence addition
- The try/catch fallback to `_applyMode()` legacy behavior is unchanged
- No external APIs, no LLM dependencies, no stochastic models introduced

---

**No breaking changes. No data loss. Full backwards compatibility maintained.**

DarkWave Studios LLC — Axiom Engineering Division
