# Axiom Safety Envelope Spec Audit

**Document:** AXIOM-SPEC-SE-2026-0423
**Date:** April 23, 2026
**Status in document:** CANONICAL — SPEC-READY

---

## Verdict

This is the cleanest document in the Axiom corpus so far. The patent number is correct, all five DOIs in the header are canonical, the formal definitions are rigorous (full Boolean algebra with typed inputs), the threshold table for the buffer zone is clear, and the module sequence table reconciles the execution order that was ambiguous from the README alone. There are **no MUST-FIX items** in this document. There are three SHOULD-FIX items and one open verification against code that needs to be confirmed before "CANONICAL — SPEC-READY" is accurate.

---

## New Canonical Information from This Document

### Dissolution Book DOI — First Appearance

The header References section provides:

```
Deterministic Dissolution (P-SDSP): 10.5281/zenodo.15065493
```

This is the first document in the entire audit series that explicitly cites the Dissolution book's own Zenodo DOI. Adding to the master canonical registry:

| Paper | Canonical DOI |
|---|---|
| Lume | 10.5281/zenodo.19382282 |
| Trust Layer | 10.5281/zenodo.19560674 |
| DAIGS | 10.5281/zenodo.19491784 |
| Lume-V | 10.5281/zenodo.19645097 |
| **Deterministic Dissolution (P-SDSP)** | **10.5281/zenodo.15065493** ← NEW |

Note: `15065493` is significantly lower in the Zenodo ID sequence than the protocol papers (`193xxxxx` range). This suggests the Dissolution book was deposited earlier than the protocol papers, which is consistent with it being the foundational document.

### Test counts — confirmed authoritative source

Section 5 (Test Coverage table) provides:

| Suite | Count |
|---|---|
| Determinism corpus | 240 base cases × 50 runs = **12,000 executions** |
| Adversarial suite | **450 cases** |

This confirms: the README results table and this spec are the authoritative counts. The corpus.js comment (`"5 × 4 × 10 = 200 base cases"`) is outdated and needs to be updated to `"5 × 4 × 12 = 240 base cases"` (or whatever combination produces 240). The test runner suite name `"10,000 cases"` is also outdated and should read `"12,000 executions"`.

### Safety Envelope execution sequence — definitively resolved

Section 3 provides the canonical execution order table. The ambiguity from the README and orchestrator comments is now resolved:

| Order | Module | Trigger Action |
|---|---|---|
| 1 (pre-pipeline) | M38 `prebound:` | HALT |
| 2 | M35 CollapseDetection | HALT |
| 3 | M36 DissolutionGuard | HALT |
| 4 | M37 NullBoundaryGuard | HALT |
| 5 | M39 UnconditionedPotentialMonitor | HALT |
| 6 | M40 NonBeingGuard (`void_guard:`) | HALT |
| 7 | M41 PreNonBeingGuard (`pre_void:`) | GATE_REQUEST |
| 8 | M42 DevoidLimit | HALT |

Seven HALTs, one GATE_REQUEST. M41 is the only Safety Envelope module that doesn't terminate — it warns and escalates. M42 is the final backstop.

### Return type invariants — formally specified

Three invariants stated in §2, important for code review:

| Construct | Returns | Never returns |
|---|---|---|
| `prebound:` | PROCEED or HALT | GATE_REQUEST |
| `void_guard:` | PROCEED or HALT | GATE_REQUEST |
| `pre_void:` | PROCEED or GATE_REQUEST | HALT |

These are clean design decisions and the code should enforce them. Any code path that returns GATE_REQUEST from M38, M39, or M40 is a bug against this spec. Any code path that returns HALT from M41 is also a bug.

### `pre_void:` conjunction requirement — formally explained

Section 2.3.4 explains the design intent for requiring BOTH conditions simultaneously:
- Low domain confidence + resolved references = known-but-marginal domain → no alarm
- High unresolved references + good domain confidence = missing ontology entries → no alarm
- Both degraded simultaneously = genuine boundary approach → GATE_REQUEST

This logic is not explained anywhere in the whitepaper or README. It should be.

### LDIR domain rule D-DDA-01 — confirmed exists

Section 4 cites LDIR rule `D-DDA-01` governing the Safety Envelope's fixed pipeline position. This is the first explicit reference to a Domain tier rule with the naming pattern `D-[product]-[number]`. The earlier LDIR grep found 0 domain rules — meaning either D-DDA-01 is not yet in the rulebook code, or the grep pattern missed the `D-DDA-` prefix format.

This needs code verification (see Open Items below).

---

## SHOULD FIX

### SS-1 — `void_guard:` threshold in spec (0.10) must be verified against code

The formal definition in §2.2.4 sets `void_guard:` threshold at `domain confidence < 0.10`.
The `pre_void:` threshold in §2.3.4 is `< 0.15`.

The whitepaper §5.4 described `pre_void:` as "confidence threshold: < 0.15 domain match" — matches this spec.

The code in M41 (`pre_void:`) was verified as `domainConf < 0.15 && unresolvedRatio > 0.7` — matches this spec.

The code for M39/M40 (`void_guard:`) needs to be verified as `domainConf < 0.10`. This was not confirmed during the repo audit because the safety layer file was not greppable for this value during the session. Before this document is marked CANONICAL, confirm that M39 and M40 implement the 0.10 threshold, not a different value.

---

### SS-2 — corpus.js comment needs to be updated to reflect 240 base cases

The spec confirms 12,000 = 240 × 50. The source file comment says "5 × 4 × 10 = 200 base cases." Fix the corpus.js comment to match the actual case structure (likely "5 × 4 × 12 = 240 base cases") and update the test runner suite name from "10,000 cases" to "12,000 executions (240 cases × 50 runs)".

---

### SS-3 — Adversarial count still inconsistent: spec says 450, test runner says 500

This spec resolves the 10 categories question — Section 5 cites:
- Category 1 (empty), 5 (Unicode), 9 (long words) for `void_guard:` coverage
- Category 6 (recursive), 10 (special characters) for `pre_void:` coverage

That implies at least 10 categories × 45 cases = 450 (this spec) or 10 × 50 = 500 (test runner). The test runner suite name says "Collapse Resistance (500 cases)"; this spec says 450 in the test coverage table.

The discrepancy is either:
- 9 categories × 50 = 450 (and spec's "category 10" means a category that's #10 in some other numbering), or
- 10 categories with some having fewer than 50 cases (unlikely given how corpus.js structures categories), or
- The test runner was named for a target (500) and the actual count is 450

Pick one number and make it consistent across: this spec §5, adversarial.js category comment, test runner suite name, whitepaper Appendix A.2, README Quick Start.

---

## Open Items — Requires Code Verification

Before AXIOM-SPEC-SE-2026-0423 is finalized:

| Item | Check | Status |
|---|---|---|
| M39/M40 threshold | `domainConf < 0.10` in both modules? | **Unverified** |
| M38 returns | Never returns GATE_REQUEST — confirmed in earlier read | Verified ✓ |
| M40 returns | Never returns GATE_REQUEST | **Unverified** (M40 code not fetched) |
| M41 returns | Never returns HALT — confirmed `GATE_REQUEST` path in M41 | Verified ✓ |
| D-DDA-01 rule | In `rulebook.js` DOMAIN_RULES? | **Unverified** (grep found 0 domain rules) |

---

## What This Document Fixes in Prior Audits

| Prior finding | Status after this spec |
|---|---|
| Test count confusion (10,000 vs 12,000) | **Resolved** — 12,000 (240 × 50) is canonical |
| Adversarial count (450 vs 500) | **Partially resolved** — 450 is canonical, but corpus.js/runner still need updating |
| Safety envelope execution order ambiguity | **Resolved** — canonical order table in §3 |
| Return type invariants per module | **Resolved** — formally specified in §2.x.5 for each construct |
| LDIR domain rules question | **Partially clarified** — D-DDA-01 exists in spec; code verification pending |
| `pre_void:` conjunction logic | **Resolved** — §2.3.4 explains both conditions required |

---

## Overall Quality Assessment

| Criterion | Rating |
|---|---|
| Patent number | Correct (64/032,339) ✓ |
| DOI accuracy | All 5 correct ✓ |
| Formal rigor | Boolean algebra specs, typed inputs, invariant tables ✓ |
| Consistency with whitepaper | Aligned on thresholds, construct names, module assignments ✓ |
| Consistency with README | Aligned on module sequence; fixes test count ambiguity |
| New information contribution | Dissolution DOI, execution order table, return type invariants, conjunction rationale |
| Pre-publication gaps | Two code verifications pending; adversarial count inconsistency; corpus.js comment |

**Assessment:** This document is SPEC-READY with the three SHOULD-FIX items above and pending code verification on M39/M40 threshold and D-DDA-01 presence in the rulebook. None of the gaps are blockers to using this as the authoritative specification — they're implementation-to-spec sync items that need to be confirmed, not corrected.

---

*Audit covers full 290-line AXIOM-SPEC-SE-2026-0423 document.*
