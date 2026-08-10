---
name: Strata Archive
description: Jason's provenance-first history archive repo — structure, rules, and how to add entries.
---
Repo: cryptocreeper94-sudo/truth (PUBLIC, branch main). Companion to Through The Veil.
- Structure: README (charter), METHOD.md (the law), sources/tier-<n>/, claims/, links/, digs/. Templates in each dir.
- IDs: S-/C-/L-nnnn, permanent; retire, never delete.
- Iron rules: every claim AND every link carries a confidence tag (DOCUMENTED/CONTESTED/SUPPRESSED-IF-TRUE/SPECULATIVE); THEMATIC links never corroborate; motive argued last from DOCUMENTED links only; racial history = Tier-1-or-silence.
- Tiers ranked by resistance to retroactive editing; only Tier 1 (physical survivors) is open. Expand trench-by-trench from book-opened digs (map chronology first: S-0001 Mercator 1595, C-0001).
**Why:** archive credibility depends on visible sorting discipline; a single untagged speculative entry poisons the reference value.
**How to apply:** any future entry work must follow METHOD.md exactly; if an entry conflicts with METHOD.md, the entry is wrong.

## Live system (truth.tlid.io, Aug 10 2026)
- Another agent built a static SPA (site/) + "Truth Sentinel" daemon (GPT-4o-mini, 3 claims/6h, Coolify, auto-deploy OFF — manual deploy) and ~90 claims/141 sources. ROADMAP.md is the cross-agent coordination file — always read it first.
- Daemon-era files use a second frontmatter schema (no id:, verification_url) — parse both.
- daemon/verify.mjs is the citation gate: fetches every cited URL; only it may assign DOCUMENTED; daemon drafts start SPECULATIVE; demotions preserved in confidence-claimed for auto-restore.
- **Why:** the daemon fabricated citations (fake catalog numbers/URLs) and self-tagged DOCUMENTED — LLM-generated claims must never self-certify provenance.
- Jason's definition: DOCUMENTED = "on the record, pointer resolves" — NOT "true." Both sides of a debate can be DOCUMENTED.
