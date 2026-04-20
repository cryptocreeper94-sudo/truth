# Audit: SOR — Cell / Signal / Homeostasis Analogues

**Auditor:** Replit Agent (session continuity)
**Date:** April 20, 2026
**Paper length:** 823 lines
**Status:** PREPRINT-READY after MUST-1 fix; SHOULD-1 verification recommended

---

## Paper Overview

Formalizes the Synthetic Organism Runtime (SOR) as a deterministic biological analogue framework for the Lume ecosystem. The three core primitives — cell (memory-isolated, certificate-bound computational unit), signal (typed, timestamped, certificate-validated inter-cell message), and homeostasis (continuous drift-detection and deterministic correction) — are each given formal tuple definitions, state-transition rules, algorithms, threat models, and full integration mappings to Lume, Trust Layer, Lume-V, DAIGS, LDIR, and GUPAS.

This is the foundational architecture paper for synthetic organisms; the companion Behavioral Homeostasis paper (ref [7]) covers Type-4 specifics only. Sixteen sections, eight appendices, four algorithms, sixteen references.

---

## Reference & Header Check

| Item | Expected | Found | Status |
|---|---|---|---|
| Patent number (header) | 64/032,339 | 64/032,339 | ✓ |
| Patent number (footer) | 64/032,339 | 64/032,339 | ✓ |
| Lume DOI [1] | 10.5281/zenodo.19382282 | 10.5281/zenodo.19382282 | ✓ |
| Trust Layer DOI [3] | 10.5281/zenodo.19560674 | 10.5281/zenodo.19560674 | ✓ |
| Lume-V DOI [4] | 10.5281/zenodo.19645097 | 10.5281/zenodo.19645097 | ✓ |
| DAIGS DOI [5] | 10.5281/zenodo.19491784 | 10.5281/zenodo.19491784 | ✓ |
| GUPAS [2] | patent only | patent only | ✓ |
| LDIR/Multilingual [12] | patent only (no Zenodo) | patent only | ✓ consistent |
| Internal refs [6–11], [13] | 64/032,339 each | 64/032,339 each | ✓ |
| Brooks [14] | "No Silver Bullet," IEEE Computer 1987 | present | ⚠ see SHOULD-1 |
| Keccak [15] | Bertoni et al., EUROCRYPT 2013 | present | ✓ |
| Ed25519 [16] | Bernstein et al., J. Cryptographic Eng. 2012 | present | ✓ |

**All DOIs correct. Patent number consistent throughout. No reference-layer errors.**

---

## Issues Found

### MUST-1 — §5.3 Internal Signal-Type Inconsistency

**Location:** §5.3 (Correction Mechanisms), Appendix A.3 (Signal Analogue definition), Appendix F.3 (extended example)

**Problem:** §5.3 introduces five correction mechanisms — THROTTLE, PAUSE, HEAL, REDISTRIBUTE, ESCALATE — framing them as if they are distinct signal types. The same paragraph then states: *"The correction signal is a standard SOR signal with a **HEAL signal type**."* This directly contradicts its own preceding sentence, which lists THROTTLE, PAUSE, HEAL, REDISTRIBUTE, and ESCALATE as if they were each distinct signal types.

The extended example in F.3 resolves the ambiguity operationally — it shows the homeostasis engine emitting *"a HEAL signal (subtype THROTTLE)"* — which reveals the intended architecture: all homeostatic corrections are transmitted as HEAL-typed signals, with the specific correction mechanism encoded as a payload subtype. This is a coherent design.

The problem is that this subtype mechanism is never documented in the signal taxonomy. §4.2 defines six signal types (COMPUTE, QUERY, NOTIFY, COMMAND, HEAL, GOVERN) with no mention of subtypes. Appendix A.3 repeats the same six-type list with no subtype note. A reader of §4.2 and A.3 would have no way to know that HEAL carries subtypes, or that THROTTLE, PAUSE, REDISTRIBUTE, and ESCALATE are HEAL subtypes rather than independent signal types.

**Fix:** Two changes:
1. In §5.3, replace the sentence *"emits a correction signal (THROTTLE, PAUSE, HEAL, REDISTRIBUTE, or ESCALATE)"* with something like *"emits a HEAL-typed signal with the correction subtype (THROTTLE, PAUSE, HEAL, REDISTRIBUTE, or ESCALATE) specified in the signal payload."*
2. Add a note to §4.2 (and mirror it in Appendix A.3) specifying that HEAL-typed signals carry a correction subtype field and listing the valid subtypes.

**Severity:** MUST — the contradiction creates a genuine ambiguity in a formal specification. An implementer reading §5.3 cold would not know whether to implement six correction signal types or one HEAL type with subtypes. F.3 resolves it but appendices should not be the primary specification for architectural decisions.

---

### SHOULD-1 — Verify That [14] Brooks Is Cited In the Body Text

**Location:** Reference list entry [14]; body text unconfirmed

**Problem:** Reference [14] (F. P. Brooks Jr., "No Silver Bullet: Essence and Accidents of Software Engineering," IEEE Computer, 1987) appears in the reference list but no in-text citation to `[14]` was found in the paper during full read. The natural citation location would be §1.2's argument against ad-hoc architectures (Brooks's accidental vs. essential complexity argument is directly relevant), but §1.2 contains no citation to [14].

If [14] is genuinely uncited in the body text, it is a floating reference — present in the list but never referenced — which is an error in any preprint submission.

**Fix:** Either (a) add an in-text `[14]` citation at the appropriate location (most naturally §1.2 when arguing that ad-hoc architectures resist composition and governance, or §1.3 when describing the complexity challenge), or (b) remove [14] from the reference list if the connection is too indirect to cite directly.

**Severity:** SHOULD — verify first. If the citation exists and was simply missed in reading, no action needed. If the reference is genuinely floating, promote to MUST and add or remove the citation before submission.

---

### CONSIDER-1 — Identical Novelty Claim Appears in Both Abstract and Conclusion

**Locations:**
- Abstract (line 13): *"To my knowledge, this paper presents the first complete biological analogue model for deterministic, certificate-bound synthetic organisms in a governed computational ecosystem."*
- §17 Conclusion (line 568): *"To my knowledge, this paper presents the first complete biological analogue model for deterministic, certificate-bound synthetic organisms."*

The abstract phrasing includes "in a governed computational ecosystem"; the conclusion drops that qualifier. Both are appropriate hedges for the novelty claim and the slight wording difference is fine. The repetition is standard and expected. The §16.3 future-work hedge ("To my knowledge, the successful implementation of governed organism reproduction will represent the first instance...") is a separate, different claim and does not add redundancy.

No action required. Noted for completeness.

---

## Observations (No Action Required)

**Organism Arbitration (B.4) correctly omits language seniority:** The organism-level arbitration algorithm resolves conflicts via safety → specificity → canonical precedence → envelope safety, without the "language seniority" tiebreaker present in the Multilingual paper's arbitration algorithm. This is correct — organisms operate on canonical UIS representations, so language seniority is inapplicable at the organism level. The two arbitration algorithms are architecturally consistent.

**"Designated Ecosystem Governance Authority" phrasing used consistently:** §2.5, §4.5, E.1, and E.2 all use this preferred formulation. Confirms this is the settled ecosystem-wide term.

**Dual-level envelope enforcement (§9.1, §6.2):** The "tyranny of small numbers" argument — many individually compliant resource requests aggregating to an unacceptable total — is well-articulated and represents genuine design depth. Worth highlighting in any ecosystem-level governance documentation.

**Guardian Cell architecture (§12.3):** The redundant homeostasis failover (Guardian Cell monitoring primary homeostasis cell) is a novel addition to the ecosystem's failure-mode documentation. No prior paper documented this pattern; it's specific to SOR.

**No adverb stacking, no participial run-ons.** Prose quality is consistent with GUPAS-and-later standard throughout all 823 lines.

---

## Cross-Paper Tracking

| Prior finding | Status in this paper |
|---|---|
| Canonical Lume DOI 19382282 | Correct ✓ |
| GUPAS "sole arbiter" → "designated Ecosystem Governance Authority" | Resolved; SOR uses preferred phrasing ✓ |
| Language seniority bias (Multilingual SHOULD-1) | Not applicable to SOR; organism arbitration omits it correctly ✓ |
| Brooks [14] floating ref | New finding — needs verification |

---

## Verdict

**PREPRINT-READY after MUST-1 is fixed and SHOULD-1 is verified.**

MUST-1 is a documentation gap, not a design flaw — the F.3 example shows the HEAL-subtype architecture works; it just needs to be stated in the signal taxonomy (§4.2 / A.3) and the wording in §5.3 needs to be made consistent with it. This is a one-paragraph fix.

SHOULD-1 requires a quick body-text search for `[14]` before submission. If it's genuinely absent, a single sentence citation in §1.2 or §1.3 closes it.
