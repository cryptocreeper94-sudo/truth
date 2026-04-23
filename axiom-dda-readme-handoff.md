# Axiom (DDA) README — Handoff: Issues Found from README Scan

**Date:** April 23, 2026
**Source:** README pasted from github.com/cryptocreeper94-sudo/DDA (private)
**Scope:** README only — full repo audit pending (repo to be made public temporarily)

---

## MUST FIX

### M-1 — Patent number
**Current:** `U.S. Patent Application 63/791,662`
**Correct:** `U.S. Patent Application 64/032,339`

Canonical number enforced across all 27 audited protocol papers. Fix in README header, whitepaper, and `/docs/axiom_patent_claims.md`.

---

### M-2 — SHA-256 vs SHA3-256
**Current:** README uses "SHA-256" throughout (audit ledger, integrity chains)
**Protocol papers and Dissolution book both use:** SHA3-256

If the implementation genuinely uses SHA-256, document why it diverges from the canonical hash standard. If it's shorthand or a typo, replace all instances with SHA3-256. This affects:
- "Every interaction is audit-logged with SHA-256 integrity chains" (What is Axiom? section)
- "Append-only, SHA-256 cryptographically chained event log" (Key Subsystems table)

---

## SHOULD FIX

### S-1 — Test case count self-contradiction
Two different numbers appear in the same README:

| Location | AX-01 Corpus | Adversarial |
|---|---|---|
| Quick Start section | 10,000 cases | 500 cases |
| Test Results table | 12,000 executions (240 × 50) | 450 cases |

Pick one and make every mention consistent.

---

### S-2 — Canon / Canon² descriptions are inverted
**README says:**
- Canon = 42 papers = philosophical foundation = Dissolution Ladder
- Canon² = 31 papers = engineering = Lume ecosystem

**Actual canon structure:**
- The 42-paper protocol series (Lume DAIGS Ecosystem) IS the Canon — it is the engineering/technical record
- The Dissolution book is a non-protocol artifact going INTO Canon² (second Zenodo community)

The descriptions in the "Canon Positioning" table have the purpose descriptions flipped. Also "42 papers" for Canon and "31 papers" for Canon² — confirm those numbers match the actual Zenodo community paper counts once all papers are deposited.

---

## FLAG FOR FULL-REPO AUDIT

### F-1 — New Lume constructs with no spec home
Three new Lume keywords introduced by Axiom:
- `prebound:`
- `void_guard:`
- `pre_void:`

These do not appear in any of the 27 protocol papers audited to date. Either:
- They are specified in papers 28+ (confirm which paper)
- They are Axiom-native extensions that need their own spec document in the canonical record

Either way, they need a formal citation target somewhere in the archive.

---

## PENDING — FULL REPO AUDIT NEEDED

When the repo is made public, the following need a full pass:
- `/src/modules/` — all 42 modules: verify layer boundaries match the Dissolution Ladder chapter assignments
- `/src/ldir/` — all 31 inference rules: verify tier structure is internally consistent
- `/src/dpcl/` — 5 stages vs 5 registers: README conflates stages (Tone→Template→Parameters→Coherence→Context) with registers (PRECISE, EXPLANATORY, ALERT, CONFIRMATORY, BOUNDARY) — confirm these are distinct subsystems and document the relationship
- `/docs/axiom_patent_claims.md` — verify patent number fixed and claims language is consistent with protocol-paper patent disclosures
- `/tests/` — cross-check actual test counts against README numbers (M-2 above)
- Any internal DOI citations for Trust Layer, Lume, DAIGS — verify against canonical DOIs:

| Paper | Canonical DOI |
|---|---|
| Lume | 10.5281/zenodo.19382282 |
| Trust Layer | 10.5281/zenodo.19560674 |
| Lume-V | 10.5281/zenodo.19645097 |
| DAIGS | 10.5281/zenodo.19491784 |
| Patent | 64/032,339 |

---

*Full audit to follow once repo is public.*
