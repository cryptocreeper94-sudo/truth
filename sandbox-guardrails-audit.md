# Audit: Autonomous Sandbox Guardrails in Unverified Executions
**Draft 1 → Draft 2 Comparison | April 2026**

---

## VERDICT

All six issues from the first audit are fixed. The paper is ready for preprint submission. Two minor adverb remnants in Appendix C are the only remaining items, and neither is a blocker.

---

## WHAT WAS FIXED ✅

| Issue | Status |
|---|---|
| Appendix C.4 — complete word salad collapse replaced with one clean, accurate diagram description | ✅ Fixed — good rewrite |
| Appendix A.8 — word salad tail trimmed; ends cleanly at "container purging" | ✅ Fixed |
| Section 1.5 — unhedged "first" claim now reads "what is, to my knowledge, the first..." | ✅ Fixed |
| Reference [4] added — Andrews, Trust Layer Protocol Paper, DOI: 10.5281/zenodo.19571978 | ✅ Fixed |
| Reference [5] added — Andrews, ZK-SRP, with cross-patent citation | ✅ Fixed |
| Both [4] and [5] wired into body text (Sections 1.4 and 8.4) | ✅ Fixed |
| Section 9.6 grammar — "reconstruction" → "reconstruct" | ✅ Fixed |
| Section 10.3 — "comfortably" removed | ✅ Fixed |
| Section 11.1 performance claim — now properly hedged with "Based on preliminary internal profiling" | ✅ Fixed |

---

## TWO REMAINING MINOR ITEMS (Not Blocking)

---

### MINOR-1: Appendix C.2 Still Has Adverb Tail

C.2 ends:
> "...compared to the destructive Tier 4 rollback explicitly natively firmly securely **comfortably perfectly squarely forcefully**."

"Comfortably perfectly squarely forcefully" is the same residue that was removed from other sections. The sentence ends cleanly at "rollback."

**Fix:** Trim from "explicitly" onward: "...compared to the destructive Tier 4 rollback path."

---

### MINOR-2: Appendix C.3 Still Has Adverb Tail

C.3 ends:
> "...triggering validators natively properly actively cleanly efficiently dependably confidently reliably exactly explicitly dynamically."

This is still an adverb chain, just shorter than the original. The content ends at "triggering validators."

**Fix:** "A systemic diagram mapping the local guardrail relaying the execution fault across the global blockchain, triggering validator revocation and trust score degradation."

---

## ONE ADDITIONAL MINOR ITEM

**Section 8.4 — Duplicate word:**
> "It **cleanly** wipes the ephemeral scratchpad **cleanly** and reverts all temporary variable allocations back to zero-state."

"Cleanly" appears twice in the same sentence. Remove the first one: "It wipes the ephemeral scratchpad cleanly and reverts..."

---

## OVERALL STATUS

Three one-line fixes remain — two in Appendix C diagram descriptions, one duplicate word. The paper is clean. Legal footer, ORCID, patent number, email, and GitHub are all properly appended. References [1]–[5] are complete and correctly cited in the body. This is ready.
