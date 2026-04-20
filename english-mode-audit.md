# Audit: English Mode Intent Resolution at Compile Time
**Draft 1 Review | April 2026**

---

## PRELIMINARY ASSESSMENT

804 lines, 16 sections, 8 appendices, 4 formal algorithms, 15 references (11 Andrews, 4 external academic). Prose quality matches GUPAS — clean, structurally sound, no adverb stacking, no participial run-on chains. The six-stage pipeline is well-defined and internally consistent. The failure mode taxonomy (§11) is the strongest section in the paper — six named, well-characterized failure modes with concrete examples and mitigations.

Issue count: 3. One MUST (typo), one SHOULD (internal tension), one MINOR. Lightest audit in the series by a wide margin.

There is also one cross-paper finding that closes the GUPAS MUST-1: this paper cites Lume with DOI 10.5281/zenodo.19382282, confirming that GUPAS's citation of 19612948 is an error.

---

## ISSUES

### MUST-1 — §E.2 typo: "Restricated" should be "Restricted"

**Location:** Appendix E.2, Governance & Compliance — How Intent Is Governed

**Current:**
> "Restricated canonical actions are filtered before the constraint extraction stage, ensuring that prohibited operations cannot reach the compilation output."

**Correction:**
> "Restricted canonical actions are filtered before the constraint extraction stage..."

---

### SHOULD-1 — §4.2 / §11.2 internal tension: adverb mapping vs. over-specification

**Location:** §4.2 (Semantic Grounding) and §11.2 (Over-Specification)

**The tension:** §4.2 states that adverbs like "quickly," "safely," and "quietly" are mapped to execution modifiers (execution priority, safety level, logging verbosity). This implies individual adverbs resolve cleanly. §11.2 then gives "quickly and efficiently" as the leading qualifiers in an over-specification example, without acknowledging that "quickly" alone would have resolved per §4.2.

A reader who processes §4.2 first will be confused when they reach §11.2 and see "quickly" treated as an example of exceeding parameter capacity — because §4.2 just said it maps to execution priority. The distinction the paper is making (a single adverb resolves; accumulating 7+ qualifiers overflows) is valid, but it is never stated explicitly.

**Suggested addition** (one sentence at the start of §11.2 or after the example):
> "Individual adverbs that map to canonical modifiers (§4.2) do resolve; over-specification occurs when the aggregate qualifier count exceeds the canonical action's parameter schema capacity."

---

### MINOR-1 — §15.3 double-hedged novelty claim: acceptable, flagged for awareness

**Location:** §15.3, line 517

**Current:**
> "This closed loop, to my knowledge, would represent the first instance of a natural-language programming system that spans both human and autonomous expression within a unified deterministic framework."

**Assessment:** Doubly hedged ("to my knowledge" + "would represent," the latter referring to a future system not yet built). This is the appropriate framing for a future-work claim about a system that does not yet exist. No change required — flagged only for consistency with the pattern of watching "first" claims.

---

## CROSS-PAPER FINDING — GUPAS MUST-1 CONFIRMED

This paper cites the Lume paper as:
> [1] DOI: 10.5281/zenodo.19382282

This matches every prior paper in the series and is the established canonical DOI. GUPAS cited Lume as DOI: 10.5281/zenodo.19612948 — which is now confirmed to be a transcription error. GUPAS should be corrected on this point before submission.

---

## NEW PAPER IN REFERENCE CHAIN

Reference [10] is a paper not previously seen in the series:
> [10] R. J. Andrews, "Lume Doctrine Expansion Subsystems: A Structured Architecture for Extending Deterministic Natural-Language Programming Beyond Canonical Boundaries," DarkWave Studios LLC, 2026. U.S. Pat. App. No. 64/032,339.

This appears in §§1.4, 15.1, E.1 as the "Doctrine Expansion Subsystem" and the "Cross-Vertical Expansion Subsystem." Adding to the canonical reference list.

---

## REFERENCE CHAIN — FULL VERIFICATION

| Ref | Paper | Citation Type |
|---|---|---|
| [1] | Lume | DOI: 10.5281/zenodo.19382282 ✅ canonical |
| [2] | GUPAS | 64/032,339 ✅ |
| [3] | Trust Layer | DOI: 10.5281/zenodo.19560674 ✅ |
| [4] | Lume-V | DOI: 10.5281/zenodo.19645097 ✅ |
| [5] | DAIGS | DOI: 10.5281/zenodo.19491784 ✅ |
| [6] | AST Compilation | 64/032,339 ✅ |
| [7] | Behavioral Homeostasis | 64/032,339 ✅ |
| [8] | ZK-SRP | 64/032,339 ✅ |
| [9] | Taxonomy | 64/032,339 ✅ |
| [10] | Lume Doctrine Expansion Subsystems | 64/032,339 ✅ (first appearance) |
| [11] | Proof-of-Intent | 64/032,339 ✅ |
| [12] | Brooks Jr., "No Silver Bullet," IEEE Computer 1987 | External ✅ |
| [13] | Myers et al., "Natural Programming Languages," CACM 2004 | External ✅ |
| [14] | Manning & Schütze, NLP textbook, MIT Press 1999 | External ✅ |
| [15] | Carlini & Wagner, IEEE S&P 2017 | External ✅ |

Patent footer, legal footer, ORCID, contact, GitHub, repository all present and correct.

Notable: Real-Time Healing and Dynamic Arbitration are not cited — appropriate, as both are runtime execution concerns outside this paper's compile-time scope.

---

## PROSE QUALITY NOTE

No adverb stacking. No participial run-on chains. The examples in §§11, F, and G are particularly well-constructed — the negation handling discussion (§11.6, "don't delete," "don't not delete," "keep the backup files") demonstrates nuanced thinking that reads cleanly.

The algorithms in Appendix B are correctly specified. The formal notation in Appendix H is precise and consistent with GUPAS's notation conventions.

---

## SUMMARY

| ID | Severity | Location | Issue |
|---|---|---|---|
| MUST-1 | Must Fix | §E.2 | Typo: "Restricated" → "Restricted" |
| SHOULD-1 | Should Fix | §4.2 / §11.2 | Add one sentence reconciling adverb mapping (§4.2) with over-specification example (§11.2) |
| MINOR-1 | Minor | §15.3 | Double-hedged future novelty claim — flagged, assessed acceptable as-is |

**Cross-paper action:** Correct GUPAS reference [1] from DOI 10.5281/zenodo.19612948 to 10.5281/zenodo.19382282.

**Status: One-pass edit required. Preprint-ready after fixing the typo and the §4.2/§11.2 clarification.**
