# Audit: Deterministic Organism Mobility & Spatial Coordination Protocols (D-OMSCP)

**Auditor:** Replit Agent (session continuity)
**Date:** April 20, 2026
**Paper length:** 791 lines
**Status: NOT READY — 2 SHOULD issues (2 uncited references)**

---

## Paper Overview

D-OMSCP formalizes the mobility and spatial coordination architecture for synthetic organisms in distributed deterministic ecosystems. The central argument: deterministic internal state is meaningless if organisms occupy different positions on different nodes, because organisms at different positions receive different environmental inputs and establish different communication channels, producing divergent behavioral trajectories that undermine ecosystem consistency.

The architecture defines four spatial tiers — cell (chemotaxis), signal (axon guidance), homeostasis (territorial stability), and cognitive (strategic multi-step navigation) — each with its own deterministic primitives, boundary constraints, and certificate types. A six-stage pipeline (detection, path selection, arbitration, validation, certificate issuance, multi-organism coordination) governs all spatial transitions. Integration sections cover Lume (§6), Trust Layer (§7), Lume-V (§8), DAIGS (§9), LDIR (§10), SOR (§11). Six failure modes (§12), five appendix sections (B–F), five diagram descriptions, five threat models, formal notation through §H.8.

**Notable additions versus prior papers:** Reynolds [21] ("Flocks, Herds and Schools") is the first new external reference to appear in the series since D-OMPP added Miller & Bassler. Berg & Purcell [19] ("Physics of Chemoreception") is a domain-specific chemotaxis reference appropriate to a spatial paper. The Liskov-Wing reference shifts from [17] in prior papers to [24] in D-OMSCP due to the insertion of D-OMPP [17] and other series additions pushing external refs up the list.

---

## Reference & Header Check

### Header DOIs

| Item | Expected | Found | Status |
|---|---|---|---|
| Patent (header) | 64/032,339 | 64/032,339 | ✓ |
| Patent (footer) | 64/032,339 | 64/032,339 | ✓ |
| Lume DOI | 10.5281/zenodo.19382282 | 10.5281/zenodo.19382282 | ✓ |
| Trust Layer DOI | 10.5281/zenodo.19560674 | 10.5281/zenodo.19560674 | ✓ |
| DAIGS DOI | 10.5281/zenodo.19491784 | 10.5281/zenodo.19491784 | ✓ |
| Lume-V DOI | 10.5281/zenodo.19645097 | 10.5281/zenodo.19645097 | ✓ |

**All four header DOIs correct. Patent consistent throughout.**

---

### Internal References [1]–[17]

| Ref | Paper | Patent / DOI | Body citation confirmed? |
|---|---|---|---|
| [1] | ZK-SRP | 64/032,339 | ✓ §12.1, §16.2 |
| [2] | Sandbox Guardrails | 64/032,339 | ✓ §8.4 |
| [3] | Behavioral Homeostasis | 64/032,339 | ✓ §3.3, §11.3 |
| [4] | AST Compilation | 64/032,339 | ✓ §6.1 |
| [5] | RT-Healing | 64/032,339 | ✓ §5.4, §12.3, §12.5 |
| [6] | Trust Layer | DOI 10.5281/zenodo.19560674, full canonical title ✓ | ✓ §1.2, §2.3, §4.5, §7 |
| [7] | DAIGS | DOI 10.5281/zenodo.19491784 + 64/032,339 | ✓ §3.4, §5.2, §8.2, §9, §15.2 |
| [8] | LDIR | 64/032,339 | ✓ §1.4, §10 |
| [9] | SOR | 64/032,339 | ✓ §1.1, §3.1, §11.1, §16.3 |
| [10] | GUPAS | 64/032,339 | ✓ §4.6, §7.4, §9.2, §E.1 |
| [11] | Lume-V | DOI 10.5281/zenodo.19645097, no patent (correct) | ✓ §8.1 |
| [12] | Dynamic Arbitration | 64/032,339 | ✓ §5.3, §16.3 |
| [13] | Proof-of-Intent | 64/032,339 | ✓ §2.4 |
| [14] | G-DRSP | 64/032,339 | ✓ §2.2, §5.4, §8.1, §8.2 |
| [15] | D-COCP | 64/032,339 | ✓ §3.2, §5.6, §11.2 |
| [16] | D-OLP | 64/032,339 | ✓ §7.2, §11.4, §F.4 |
| [17] | D-OMPP | 64/032,339 | ✓ §2.1, §3.1, §3.4, §13.6 |

**All 17 internal references confirmed cited. All DOIs and patent numbers accurate.**
[11] Lume-V carries no patent — consistent with the canonical DOI-only pattern. [17] D-OMPP is correctly added as the newest internal reference.

---

### External Academic References [18]–[25]

| Ref | Citation | Body citation confirmed? |
|---|---|---|
| [18] | C. Dwork, N. Lynch, and L. Stockmeyer, "Consensus in the Presence of Partial Synchrony," JACM vol. 35 no. 2, pp. 288–323, 1988 | ✓ §2.5 |
| [19] | H. C. Berg and E. M. Purcell, "Physics of Chemoreception," Biophysical Journal, vol. 20, no. 2, pp. 193–219, 1977 | NOT FOUND — see SHOULD-2 |
| [20] | E. Mayr, "What Evolution Is," Basic Books, 2001 | NOT FOUND — see SHOULD-1 |
| [21] | C. W. Reynolds, "Flocks, Herds and Schools: A Distributed Behavioral Model," ACM SIGGRAPH Computer Graphics, vol. 21, no. 4, pp. 25–34, 1987 | ✓ §3.4 |
| [22] | R. C. Merkle, "A Digital Signature Based on a Conventional Encryption Function," CRYPTO '87, LNCS vol. 293, pp. 369–378, 1988 | ✓ §4.4 |
| [23] | D. J. Bernstein et al., "Ed25519," JCE vol. 2 no. 2, pp. 77–89, 2012 | ✓ §4.5, §14.2 |
| [24] | B. Liskov and J. Wing, "A Behavioral Notion of Subtyping," TOPLAS vol. 16 no. 6, pp. 1811–1841, 1994 | ✓ §8.1 |
| [25] | E. A. Brewer, "Towards Robust Distributed Systems," PODC pp. 7–10, 2000 | ✓ §15.1 |

**6 of 8 external references confirmed cited. [19] and [20] uncited — see issues below.**

---

## Issues Found

### SHOULD-1 — [20] Mayr "What Evolution Is" carried over again with no citation point

**Severity:** SHOULD
**Ref:** [20] E. Mayr, "What Evolution Is," Basic Books, 2001

This reference appeared in D-OLP (as [19]) where biological evolution theory was relevant. It was identified as dangling in D-OMPP and fixed. It reappears here in D-OMSCP — now renumbered to [20] — where biological evolution theory is again irrelevant. The word "evolution" in D-OMSCP refers exclusively to organism lifecycle evolution (a governed state transition managed by D-OLP), not to biological evolutionary theory. No body citation exists anywhere in the 791-line paper, and no appropriate citation point can be found without introducing off-topic material.

**Fix:** Remove [20] from the reference list and renumber: [21]→[20], [22]→[21], [23]→[22], [24]→[23], [25]→[24]. Update five body citations: Reynolds §3.4 [21→20], Merkle §4.4 [22→21], Ed25519 §4.5 and §14.2 [23→22], Liskov-Wing §8.1 [24→23], Brewer §15.1 [25→24].

---

### SHOULD-2 — [19] Berg & Purcell not cited in body despite direct relevance

**Severity:** SHOULD
**Ref:** [19] H. C. Berg and E. M. Purcell, "Physics of Chemoreception," Biophysical Journal, vol. 20, no. 2, pp. 193–219, 1977

Berg and Purcell's 1977 paper established the physical limits of chemoreception — how precisely a bacterium can measure chemical gradients using its receptor array. It is the foundational citation for any paper using bacterial chemotaxis as a biological analogy for gradient-following spatial navigation. D-OMSCP explicitly maps cell-level mobility to chemotaxis in three places:

- **§1.3** — "bacterial chemotaxis (gradient-following movement)"
- **§3.1** — "Cell-level spatial behavior corresponds to the chemotactic response of individual SOR cells"
- **§1.1** — "bacteria employ diverse mobility mechanisms: bacterial chemotaxis (gradient-following movement)"

None of these three natural citation points include "[19]." The reference is in the list but the body citation was omitted.

**Fix:** Add "[19]" in §3.1 at "Cell-level spatial behavior corresponds to the chemotactic response of individual SOR cells [9]" — expand to "[9] [19]" or add after "chemotaxis" in §1.3. If neither is appropriate, remove [19] from the list and renumber [20]→[19] through [25]→[24].

---

## Positive Notes

### Reynolds [21] — first appearance of the boids paper in the series

C. W. Reynolds, "Flocks, Herds and Schools: A Distributed Behavioral Model" (1987) is the foundational paper on emergent collective movement behavior. Reynolds' agent-based "boids" model demonstrated that simple local rules produce complex collective spatial patterns (flocking, herding, schooling). This is the correct reference for §3.4's discussion of "swarm coordination." The citation is precise: "collective spatial intelligence (formation maintenance, swarm coordination as described by Reynolds [21])." This is the most domain-appropriate new external citation since Miller & Bassler in D-OMPP.

### All 17 internal references cited — zero dangling internals for second consecutive paper

D-OMSCP maintains the zero-dangling-internal-references standard set by D-OMPP. Every companion paper from ZK-SRP [1] through D-OMPP [17] is cited appropriately in context:
- [17] D-OMPP: §2.1 (persistence), §3.1 (cell spatial state default ephemeral), §3.4 (cognitive spatial memory versioning), §13.6 (recovery)
- [16] D-OLP: §7.2, §11.4, §F.4 (territorial inheritance)
- [14] G-DRSP: §2.2, §5.4, §8.1, §8.2 — most-cited companion in the body

### Liskov-Wing [24] correctly anchored

Liskov-Wing's behavioral substitutability (§8.1: "satisfying the Liskov-Wing behavioral substitutability requirements [24] regardless of the legacy code's internal navigation implementation") is the correct application — the Lume-V adapter must guarantee that wrapping legacy navigation produces indistinguishable observable behavior regardless of the legacy code's internal implementation. Same well-targeted application as in D-OMPP.

### [25] Brewer CAP correctly cited for third consecutive paper

§15.1 again uses Brewer [25] appropriately: "This overhead reflects the fundamental consistency-availability trade-off formalized by Brewer [25]: stronger deterministic spatial guarantees consume more resources than unverified navigation, but the cost is justified by the ecosystem's correctness requirements." Consistent correct usage established in D-OMPP continues.

### Berg & Purcell bibliographic accuracy

Although [19] is uncited in the body, the citation is accurate: Biophysical Journal, vol. 20, no. 2, pp. 193–219, 1977. This is the correct metadata for the Berg & Purcell chemoreception paper. The reference belongs in this paper — only the body citation is missing.

---

## Cross-Check: Patent and DOI Consistency

All 15 internal references carrying a patent number use 64/032,339. The two DOI-only entries ([6] Trust Layer, [11] Lume-V) carry no patent. [7] DAIGS carries both DOI (10.5281/zenodo.19491784) and patent (64/032,339). All four header DOIs match the body reference metadata. Footer patent matches header. No inconsistency found.

---

## Pattern Note: Mayr Recurrence

Mayr "What Evolution Is" has now appeared in three consecutive papers:
- D-OLP: [19] — appropriate (evolution theory relevant), cited; later found uncited in D-OLP context; fixed
- D-OMPP: [19] — wrong paper (memory paper), removed as SHOULD-2; fix confirmed
- D-OMSCP: [20] — wrong paper (spatial paper), not cited; this SHOULD-1

Recommendation: When drafting papers 22+, actively verify that [20] Mayr (or whatever position it occupies in the renumbered list) is genuinely cited in the body before finalizing the reference list. The reference appears to be persisting in the reference list template without being re-evaluated for relevance per paper.

---

## Summary

| Severity | Count | Items |
|---|---|---|
| MUST | 0 | — |
| SHOULD | 2 | SHOULD-1 ([20] Mayr — remove and renumber 5 citations); SHOULD-2 ([19] Berg & Purcell — add body citation in §3.1 or §1.3, or remove) |
| CONSIDER | 0 | — |

**Total uncited references:** 2 of 25 ([19], [20]).
**Total confirmed cited:** 23 of 25.
**Internal coverage:** 17 of 17 (100%).

**Recommended fix priority:**
1. SHOULD-1: Remove [20] Mayr and renumber [21]→[20] through [25]→[24]. Five body citations to update.
2. SHOULD-2: Add "[19]" in §3.1 at the chemotactic response sentence. One-word addition. OR remove [19] and renumber [20]→[19] through [25]→[24] (six body citations to update — do this first if removing both).

Cleanest combined approach: If adding [19] citation, fix SHOULD-2 first (add the citation), then fix SHOULD-1 (remove Mayr, renumber [21]–[25] down by one). Net result: 25→24 references, five body citation updates.
