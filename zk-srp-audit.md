# Audit: Zero-Knowledge State Reversal Protocols — v1.0.0 Revision Review
**Comparing Draft 1 → Draft 2 | April 2026**

---

## WHAT WAS FIXED ✅

Every major issue from the first audit was addressed. This is a significantly cleaner paper.

| Issue | Status |
|---|---|
| Header DOI updated to concept DOI `10.5281/zenodo.19382282` | ✅ Fixed |
| "elliptical curve" → "elliptic curve cryptography" | ✅ Fixed |
| LDIR defined: "Lume Deterministic Intent Resolver (LDIR)" | ✅ Fixed |
| "Signal Chat infrastructure" replaced with specific WebSocket claim + latency range (20–50ms) | ✅ Fixed |
| Pseudocode adverbs ("brutally", "fiercely") removed from Algorithms | ✅ Fixed |
| Appendices E, F, G, H completely rewritten with real, substantive content | ✅ Fixed — major improvement |
| Orphaned references [1]–[5] (Hume, Kant, etc.) removed | ✅ Fixed |
| Missing references [11]–[14] added to list | ✅ Fixed |
| Trusted setup acknowledged — D.2 now explicitly targets PLONK/Halo2 | ✅ Fixed |
| Purple prose cleaned up ("cosmic timelines", "mathematical darkness", "zero particle of sensitive syntax") | ✅ Fixed |

The appendix rewrite alone is the difference between a paper that gets dismissed on sight and one that gets taken seriously. That was the right call.

---

## WHAT STILL NEEDS FIXING ⚠️

Three remaining issues, two of them structural.

---

### REMAINING-1: Body Citation Numbers Are Out of Sync With the New Reference List

**This is the most important remaining fix.**

When the orphaned references [1]–[5] were removed, the list was renumbered from [1]–[8]. But the inline citations in the body text were never updated to match. The body still uses the old numbering.

**Current mismatch:**

| Body cites | Should now cite | Reference |
|---|---|---|
| `[6]` (Section 2.1) | `[1]` | Elnozahy — Rollback Recovery |
| `[7]` (Section 2.1) | `[2]` | Mohan — ARIES |
| `[8]` (Section 2.2) | `[3]` | Ben-Sasson — STARKs |
| `[9]` (Section 2.2) | `[4]` | Goldwasser — ZK definition |
| `[10]` (Section 2.2) | `[5]` | Bowe — Zexe |
| `[11]` (Section 2.2) | `[6]` | Ben-Sasson — Zerocash |
| `[12]` (Section 2.3) | `[7]` | Wood — Ethereum Yellow Paper |
| `[13]` (Section 2.4) | `[8]` | Andrews — Trust Layer |
| `[14]` (Section 2.4) | missing | PKI reference — see below |

**Fix:** Do a find-replace pass on the body text updating each inline `[N]` to its new number using the table above.

---

### REMAINING-2: Reference [14] Is Still Cited in the Body But Not in the List

**Location:** Section 2.4 — "Traditional Public Key Infrastructure (PKI) models verify identity but do very little to verify the logic of the executing code `[14]`."

The old [14] (RFC 5280 PKI reference) was cited in the body but doesn't appear in the new reference list, which ends at [8]. The citation is dangling.

**Fix:** Add this as reference [9] and update the Section 2.4 inline citation to `[9]`:

> [9] D. Cooper et al., "Internet X.509 Public Key Infrastructure Certificate and CRL Profile," RFC 5280, IETF, 2008.

---

### REMAINING-3: Typo in Section 8.3

**Location:** Section 8.3, last sentence.
**Error:** "It drastically reduces recovery **bandwith** bottlenecks."
**Fix:** "bandwidth"

---

## TWO ITEMS TO VERIFY (Cannot Confirm From Truncated View)

The abstract was cut off in the file preview. Please check these two items manually:

1. **Abstract final sentence** — The previous draft ended the abstract with a grammatical fragment (a noun phrase with no main verb). Confirm the abstract ends with a complete sentence, e.g., "ZK-SRP represents, to my knowledge, the first deterministic privacy-preserving state reversal architecture that..."

2. **"Turing-complete runtime rollbacks"** — The previous draft used this phrase in the abstract. ZK circuits are not Turing-complete; the correct phrase is "general-purpose runtime rollbacks." Confirm this was updated.

---

## OVERALL STATUS

Three quick fixes remaining (citation renumbering, missing [14]/[9], one typo) plus two items to verify in the abstract. The paper is otherwise publication-ready. The core argument is sound, the appendices are now real content, and the technical terminology is correct.
