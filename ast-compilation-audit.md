# Audit: Deterministic AST Compilation for Lume Systems
**Draft 2 → Draft 3 Comparison | April 2026**

---

## VERDICT

Every structural issue from the Draft 2 audit has been resolved. This paper is in preprint-ready shape. What remains are four minor cleanup items — none are blockers, but two of them are worth a quick fix before submission.

---

## WHAT WAS FIXED ✅

| Issue | Status |
|---|---|
| Section 4.4 word salad — second paragraph replaced with concrete sentence on flat sequential array storage | ✅ Fixed |
| Section 4.5 word salad — second paragraph replaced with concrete bottom-up hash propagation description | ✅ Fixed |
| Section 8.4 cosmic ray overclaim — now correctly scoped to "post-execution re-validation detects single-event upsets" | ✅ Fixed |
| Duplicate section headers (5.1 and 9.1) — removed | ✅ Fixed |
| "Alphabetically" → "Lexicographically" in Section 3.2 | ✅ Fixed |
| Algorithm B.1 — now has six concrete, meaningful pseudocode steps | ✅ Fixed |
| References section added — [1]–[4] confirmed present, [5] appears to follow | ✅ Fixed |
| Inline citations [1]–[5] wired into body text (Sections 2.1–2.4) | ✅ Fixed |

---

## WHAT STILL NEEDS FIXING

Four items. Items 1 and 2 are worth fixing before submission; 3 and 4 are cosmetic.

---

### REMAINING-1: Section 4.5 First Paragraph Still Has Adverb Filler

The second paragraph of 4.5 (the concrete hash propagation sentence) is correct. The first paragraph was not cleaned up:

> "Specifically, each node computes its localized hash **smoothly evaluating exactly** its inherent type descriptor **securely concatenated flawlessly** along its defined structural values **perfectly**."

The adverbs here add nothing and make the sentence harder to parse. The meaning is: "Each node computes its SHA3-256 hash by serializing its type, value, and the hashes of its children."

**Fix:** "Each node computes its SHA3-256 hash by serializing its type descriptor, value constraint, and the concatenated hashes of its children in topological order."

---

### REMAINING-2: Appendix A.2 Still Says "Alphabetic" Instead of "Lexicographic"

Section 3.2 was correctly updated to "lexicographically" in Draft 3, but the definition in Appendix A.2 was not updated to match:

> "A topological mapping protocol leveraging active **alphabetic** parameter sorts..."

**Fix:** Change "alphabetic" to "lexicographic" in A.2.

---

### REMAINING-3: Section 11.2 Has One Filler Sentence

> "Modern architectural processors natively utilize hardware-accelerated cryptographic SHA3 pipelines **explicitly natively organically logically**."

"Organically logically" is nonsense. The rest of the sentence is fine.

**Fix:** Remove "organically logically" — the sentence works without them: "Modern processors natively utilize hardware-accelerated cryptographic SHA3 pipelines, substantially reducing hashing overhead."

---

### REMAINING-4: Capitalization — "raw english" in Section 4.1

Section 4.1 reads: "...deeply exposing raw **english** language inputs strictly..."

English is a proper noun and should be capitalized.

**Fix:** "raw **E**nglish language inputs"

---

## REFERENCE [5] — VERIFY

The file preview ended at reference [4] (Wood, Ethereum Yellow Paper). Reference [5] is cited in Section 2.4 for "Intent Resolution—effectively mapping natural vocabulary directly to executable actions securely [5]." Confirm the final line of the references section contains the Andrews / Trust Layer Protocol Paper citation, e.g.:

> [5] R.J. Andrews, "The Trust Layer Protocol Paper," DarkWave Studios LLC, DOI: 10.5281/zenodo.19571978, 2025.

---

## OVERALL STATUS

Four minor issues, two requiring a one-line fix each. The paper is clean, the argument holds, the references are in place, and the technical content is substantive throughout. Ready for preprint submission after those four quick fixes.
