# Axiom (DDA) — Whitepaper Audit

**Document:** DDA-WP-2026-0422 v1.0.0-DRAFT
**Date:** April 23, 2026
**Read alongside:** `axiom-dda-full-audit.md` (repo audit), `axiom-dda-readme-handoff.md`

---

## Verdict

Strong, well-structured whitepaper for a v1.0 DRAFT. The architecture narrative is coherent, the doctrine-to-module mapping in §2 is clear and complete, the four Lume constructs are formally specified in §5, and the commercial positioning in §11 is appropriate. There is **one MUST-FIX DOI error**, one significant **internal inconsistency** between the V&V plan and what the code actually does, one **pipeline diagram error** (module order), one **LDIR gap** that confirms the repo finding, and a **Canon/Canon² naming conflict** that needs to be resolved before anything is published publicly. None of these are architectural problems. All are correctable before Zenodo deposit.

---

## MUST FIX

### W-1 — Lume DOI is wrong (same phantom DOI that surfaced in the Dissolution book)

**§1.3 and References [2] say:**
> *LUME: Eliminating Cognitive Distance.* Zenodo DOI: **10.5281/zenodo.19430898**

**Canonical Lume DOI:** `10.5281/zenodo.19382282`

This is the third document where `19430898` appears in the wrong place:
- Dissolution book bibliography listed it as the **Trust Layer** DOI (also wrong)
- Now it's appearing here as the **Lume** DOI

`19430898` is not a canonical DOI for anything in the master registry. Either it's a staging deposit that was superseded, or it's a copy-paste error that has propagated. Whatever it is, it's wrong here. Fix to `10.5281/zenodo.19382282`.

---

## SHOULD FIX

### W-2 — Pipeline diagram (§3) shows M32 before M31 — reversed from actual execution order

The runtime flow diagram in §3 shows:
```
→ [32] Integrity Layer ──── tamper detected → HALT
→ [31] Verification Layer ── cert invalid → HALT
```

The orchestrator (`/src/runtime/orchestrator.js`) executes Layer 5 as M28→M29→M30→**M31**→**M32**→M33→M34 — Verification Layer (M31) runs **before** Integrity Layer (M32).

The diagram and the implementation are reversed. One of them is wrong. If the whitepaper's logic is that you should check integrity (tamper detection) before running verification (cert validation), then the orchestrator needs to swap M31 and M32. If the orchestrator order is correct (verify cert first, then check integrity chain), then the whitepaper diagram needs to be updated.

Decide which order is architecturally correct and make both consistent.

---

### W-3 — V&V plan (§10.1) describes a different test structure than the code

**Whitepaper §10.1 and Appendix A.1 say:**
> "10,000 deterministic test cases. Each case executed **twice** under identical conditions."

That would be 10,000 cases × 2 runs = 20,000 executions.

**What the code actually does** (`/tests/determinism/corpus.js`):
> `5 × 4 × 10 = 200 base cases, each run 50× = 10,000 total executions`

These describe fundamentally different test designs. The whitepaper's approach (10,000 cases, 2 runs each) tests breadth — many different inputs, minimal repetition. The code's approach (200 cases, 50 runs each) tests depth — fewer inputs, rigorous repetition to catch non-determinism. Both are valid AX-01 validation strategies, but they aren't the same thing.

Update the whitepaper to reflect what the code actually does, or update the code to match the whitepaper's intent. Also confirm the case count: the code comment says 200 base cases, the README results table says 240 base cases — pick one.

---

### W-4 — LDIR rule count: whitepaper says 31, code has 17

The Glossary entry for LDIR reads: *"hierarchical rule system (31 rules, 4 tiers)"*. This matches the README and patent claims. The repo audit found 17 implemented rules (S-01–S-05, A-01–A-07, DEF-01–DEF-05) with `DOMAIN_RULES` defined but empty.

This is the same gap flagged as M-2 in the repo audit. The whitepaper correctly describes the intended final state. It needs either:
- A note in §4/Glossary that domain rules are Phase 2 work, or
- The 14 domain rules implemented before this whitepaper is submitted as anything other than DRAFT

---

### W-5 — Canon / Canon² paper counts conflict with project tracking

**Whitepaper Glossary (confirmed twice — §Canon Positioning and Glossary):**
- Canon = 42 papers (philosophical archive — Dissolution Ladder)
- Canon² = 31 papers (engineering archive — Lume stack, DAIGS, LMADP, LDIR)

**Canon² breakdown per whitepaper:** "30 protocol papers + Deterministic Dissolution Book (engineering edition) = 31"

**What the project has been tracking:**
- A 42-paper Lume DAIGS Ecosystem as the primary canonical series (the papers we've been auditing — ZK-SRP, AST Compilation, Sandbox Guardrails, Trust Layer, etc.)
- The Dissolution book going into Canon² as a non-protocol artifact

The numbers don't reconcile cleanly. If Canon² = 30 protocol papers + Dissolution book = 31, then we have 42 engineering papers we've been auditing but the whitepaper says Canon² has only 30 protocol papers. Either:

1. The 42-paper Lume DAIGS Ecosystem IS Canon² (not Canon), and "42 papers" in Canon refers to the 42 chapters/doctrines of the Dissolution Ladder (not 42 separate papers), or
2. Canon² is still being counted and 30 is not the final number, or
3. The word "Canon" is being used in two different ways — as a brand name for the Zenodo community (first community = the 42-paper engineering series) and as a narrative label in the DDA whitepaper (Canon = WHY = philosophical)

This naming ambiguity needs to be resolved explicitly before any public-facing material is finalized. If someone reads the whitepaper and then goes to the Zenodo Canon community expecting philosophical papers, they'll find engineering protocol papers. Or vice versa.

**Recommended fix:** In the whitepaper Canon Positioning section, add a note: *"In the Zenodo deposit structure, the Canon community houses the [X] papers; the Canon² community houses the [Y] papers including..."* — make the Zenodo structure and the WHY/HOW narrative labels explicitly cross-referenced.

---

### W-6 — `meta:` construct not yet in codebase

§9.2 lists four new Lume constructs to be submitted for Lume v1.2.0:
- `meta:` (Doctrine 12 — Meta-Phenomenology)
- `prebound:`, `void_guard:`, `pre_void:` (Doctrines 39, 40, 41)

The repo has `prebound:`, `void_guard:`, and `pre_void:` implemented in Module 38, 39/40, and 41 respectively. **`meta:` is not implemented** — Module 12 (MetaPhenomenologyLayer) has no `meta:` construct in the code. The whitepaper note on M12 says "*(Requires `meta:` construct — see §5)*" which correctly flags the dependency, but the construct needs to exist in the codebase before the whitepaper's implementation claims are fully accurate.

This is Phase 1/2 work, but it should be noted in the publication checklist: "Required Pre-Publication: Implement `meta:` construct in M12."

---

## What the Whitepaper Resolves

### Previously flagged M-3 (doctrine-number labeling) — RESOLVED by §2

My repo audit flagged that module numbers don't correspond to Dissolution Ladder chapter numbers. The whitepaper's §2 ("The 42-Doctrine Module Map") explicitly provides the complete doctrine-to-module mapping table with both the module number and its doctrine name. The doctrine names in the whitepaper are the DDA's own re-numbered doctrine sequence (not the Dissolution Ladder's chapter sequence), which is a legitimate design decision for an engineering system. The whitepaper is the authority on the DDA's doctrine numbering.

**Residual:** The module code comments say `Doctrine X: [Name]` where X is the module number (e.g., M04 says "Doctrine 4: Symmetry"). In the Dissolution Ladder, Symmetry is Doctrine 16. The code comments cite the DDA's internal doctrine numbers, not the book's. This is fine **if** the whitepaper is always consulted alongside the code. If the code is ever read in isolation, the "Doctrine 4: Symmetry" comment will mislead. Consider changing the code comment to `DDA Doctrine 4 / DL Doctrine 16: Symmetry` for full traceability.

### Canon positioning framing — CLARIFIED

The whitepaper's §2 canon diagram makes the WHY→HOW→WHAT structure explicit and uses it as a positioning framework rather than a naming convention, which is a defensible framing. The Glossary definitions for Canon and Canon² are clear within the document.

### SHA-256 — CONFIRMED INTENTIONAL

§9.1 uses "SHA-256 chain" consistently, confirming this is a deliberate engineering choice for Axiom, not a typo. The deviation from the protocol papers' SHA3-256 should be noted in the whitepaper with a one-sentence rationale.

### Four Lume constructs — FULLY SPECIFIED

§5 provides formal behavioral definitions and Lume syntax for all four constructs (`meta:`, `prebound:`, `void_guard:`, `pre_void:`). This is the spec home I was asking for in the repo audit. These are well-defined. The patent Claim 6 matches the whitepaper §5 descriptions. The only gap is `meta:` not yet in the code (W-6 above).

---

## Strong Points

**§2 — 42-Doctrine Module Map:** Complete, well-organized, and internally consistent. The six-layer table with doctrine name and engineering function for all 42 modules is the clearest single artifact in the DDA canon so far.

**§5 — Four Boundary Constructs:** These are genuinely novel language extensions with clear formal semantics. The `pre_void:` 60-second timeout → `void_guard:` escalation chain is elegant engineering. Each construct has: semantic definition, formal behavior, and Lume syntax. Patent-ready.

**§8 — Synthetic Organism Framing:** The biological analogy table is precise and non-metaphorical — each mapping is a real structural correspondence. This is one of the DDA's most distinctive claims and the whitepaper handles it well.

**§11 — Commercial Positioning:** Target markets are accurately characterized and the "deterministic by construction, not by guardrail" value proposition is clearly stated. The four failure modes of probabilistic agents (§1.1) are the right ones to lead with for enterprise audiences.

**Conclusion (§12):** Clean enumeration of what the whitepaper established. The closing line *"Determinism is not a feature. It is the contract."* is a strong tag.

---

## Pre-Publication Checklist (from whitepaper + audit findings)

**Must complete:**
- [ ] Fix Lume DOI: `19430898` → `10.5281/zenodo.19382282` (§1.3 and References [2])
- [ ] Resolve M31/M32 pipeline order (§3 diagram vs. orchestrator) — pick one and align both
- [ ] Update V&V plan (§10.1 / Appendix A.1) to reflect actual test structure (200 base × 50 runs, not 10,000 cases × 2 runs)
- [ ] Confirm LDIR rule count: implement 14 domain rules OR update whitepaper to say "17 rules (domain tier in development)"
- [ ] Add application number `64/032,339` to Related Works / patent references
- [ ] Implement `meta:` construct in M12 OR flag clearly as Phase 2 in whitepaper

**Should complete:**
- [ ] Insert diagram assets (whitepaper pre-publication task — already noted)
- [ ] Resolve Canon / Canon² naming vs. Zenodo community structure — cross-reference explicitly
- [ ] Add one-sentence SHA-256 rationale (intentional deviation from protocol-paper SHA3-256)
- [ ] Confirm Lume v1.2.0 syntax for four new constructs (already on whitepaper pre-pub list)

---

## Outstanding from Corpus (not whitepaper-specific)

The five series-wide fixes still outstanding for the protocol paper series are unchanged. The whitepaper adds one new item to the cross-canon DOI tracker:

| DOI appears as | In document | Should be |
|---|---|---|
| 10.5281/zenodo.19430898 | DDA whitepaper References [2] (Lume) | 10.5281/zenodo.19382282 |
| 10.5281/zenodo.19430898 | Dissolution book Bibliography (Trust Layer) | 10.5281/zenodo.19560674 |

`19430898` appears twice in two different documents, cited as two different papers. It is the correct DOI for neither. Track it down and either retire it or document what it actually points to.

---

*Audit covers full 721-line whitepaper DDA-WP-2026-0422 v1.0.0-DRAFT.*
