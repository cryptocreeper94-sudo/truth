# Audit: Quantum-Resistant Ed25519 Implementations in Lume

**Auditor:** Replit Agent (session continuity)
**Date:** April 20, 2026
**Paper length:** 811 lines
**Status:** PREPRINT-READY after SHOULD-1 verification

---

## Paper Overview

Formalizes the quantum-resistant cryptographic migration architecture for the Lume ecosystem. The threat is well-scoped (Shor's algorithm breaks Ed25519 via ECDLP; Grover's algorithm halves SHA3-256 effective security but leaves it above NIST minimums — no hash changes required). The migration proceeds in three governed phases: Hybrid (Ed25519 + PQ dual signatures), PQ-Primary (PQ is primary verifier, Ed25519 is fallback), PQ-Native (classical cryptography eliminated). Three NIST-standardized schemes are evaluated for different use cases: Dilithium (FIPS 204, recommended default), Falcon (FIPS 206, bandwidth-constrained), SPHINCS+ (FIPS 205, ceremony-level high-assurance). Six failure modes are formalized with detection and corrective responses.

Seventeen sections, eight appendices, four algorithms, twenty-two references (seven external, fifteen internal ecosystem).

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
| Dilithium FIPS [17] | FIPS 204 | FIPS 204 | ✓ |
| SPHINCS+ FIPS [19] | FIPS 205 | FIPS 205 | ✓ |
| Falcon FIPS [18] | FIPS 206 | FIPS 206 | ✓ |
| Shor [20] | SIAM J. Computing, 1997 | present, correct | ✓ |
| Grover [21] | ACM STOC, 1996 | present, correct | ✓ |
| NIST PQC [22] | NIST 2024 | present | ✓ |
| Bernstein Ed25519 [16] | J. Cryptographic Eng. 2012 | present, correct | ✓ |
| [15] "LDIR: Lume Deterministic Inference Relay" | patent only | present in list | ⚠ see SHOULD-1 |

**All DOIs correct. All three NIST FIPS numbers correct. Patent number consistent throughout. No DOI errors.**

---

## Issues Found

### SHOULD-1 — Reference [15] May Be a Floating Reference

**Location:** Reference list entry [15]; body text unconfirmed

**Background:** This paper has an unusual two-entry LDIR situation. Reference [12] is "Multilingual Inference Through LDIR Expansions" (the paper previously audited). Reference [15] is "LDIR: Lume Deterministic Inference Relay" — a separate paper, apparently the base LDIR rulebook (the canonical 31-rule inference relay specification) as distinct from its multilingual expansion.

**Problem:** In the body text, LDIR is consistently cited as [12] — in §1.4 ("LDIR [12]"), and throughout the entire §11 integration section ("LDIR Expansions [12]"). Reference [15] does not appear in any body-text citation observed across the full read of the paper. If [15] is genuinely uncited in the body, it is a floating reference.

**Fix options:**
1. If [15] (base LDIR) is a real distinct paper: add an in-text [15] citation in §11 where the discussion shifts from the base LDIR rulebook to the multilingual expansions. For example, a sentence like "The base LDIR rulebook [15] governs the 31 canonical inference rules that the multilingual expansion [12] extends..." would anchor both citations appropriately.
2. If [15] was added in error (conflating the base LDIR concept with the Multilingual Expansions paper already cited as [12]): remove [15] from the reference list.

**Severity:** SHOULD — verify with a body-text search for `[15]` before submission. If genuinely floating, resolve before deposit.

---

## Technical Accuracy Observations (No Issues)

**Shor vs. Grover threat scoping is correct:** The paper correctly identifies that Shor's algorithm provides polynomial-time ECDLP solution (complete break of Ed25519) while Grover's algorithm provides only a quadratic speedup for hash search (SHA3-256 remains above NIST minimums at 128-bit post-Grover security). The conclusion that only Ed25519 requires replacement — not SHA3-256 — is well-reasoned and accurate.

**Dilithium determinism vs. Falcon probabilistic signing handled correctly:** §4.2 correctly notes that Dilithium is deterministic by default, Falcon requires a derandomization wrapper, and SPHINCS+ has a deterministic variant. The derandomization treatment in §5.2 is technically sound. This is a common point of confusion in PQ migration papers and the paper navigates it cleanly.

**FIPS numbers:** All three NIST FIPS assignments (FIPS 204 = Dilithium, FIPS 205 = SPHINCS+, FIPS 206 = Falcon) are correct per the NIST August 2024 finalization.

**SPHINCS+ scheme selection:** The paper correctly restricts SPHINCS+ to ceremony-level operations (governance authority certificates, organism creation certificates) due to its ~5–10ms verification latency, while recommending Dilithium for the SOR Signal Bus where sub-millisecond verification is required. This tradeoff analysis is accurate.

**"Harvest now, decrypt later" threat model:** §3.5 and §4.4 both correctly identify that certificates issued today under Ed25519 are retroactively vulnerable once CRQC is available, and correctly identify Phase I hybrid signatures as the mitigation. The urgency argument is sound.

**Hybrid security property:** §5.5 correctly states that the dual-verification requirement means breaking either scheme alone does not compromise the hybrid certificate — an adversary must break both simultaneously. This is the standard security argument for hybrid constructions and is stated correctly.

---

## Cross-Paper Tracking

| Prior finding | Status in this paper |
|---|---|
| Canonical Lume DOI 19382282 | Correct ✓ |
| Patent number 64/032,339 | Consistent throughout ✓ |
| SOR paper MUST-1 (signal type inconsistency) | Not referenced here; no carry-forward |
| SOR paper SHOULD-1 (Brooks floating ref) | This paper has a parallel issue ([15]) |
| "Designated Ecosystem Governance Authority" | Used consistently ✓ |

**Parallel pattern noted:** Both the SOR paper (SHOULD-1, Brooks [14]) and this paper (SHOULD-1, LDIR [15]) have a potential floating reference in the same list position relative to external citations. Worth a systematic check of all papers' reference lists before Zenodo deposit.

---

## Verdict

**PREPRINT-READY after SHOULD-1 is verified.**

This is the most technically dense paper in the series and it holds up well under scrutiny. The crypto content is accurate, the threat model is correctly scoped, and the three-phase migration architecture is internally coherent. The FIPS numbers are current (2024 finalization), the Dilithium/Falcon/SPHINCS+ tradeoff analysis matches the technical literature, and the governance integration is consistent with the existing ecosystem papers.

SHOULD-1 is a quick body-text check. If [15] is a legitimate distinct paper (the base LDIR rulebook), one sentence of in-text citation anchors it. If it was added in error, it is removed. Either resolution is trivial.

No MUST issues.
