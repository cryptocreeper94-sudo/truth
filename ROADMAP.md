# TRUTH Archive — Project Roadmap

> **CRITICAL**: This document persists across agent sessions. Any agent working on Truth MUST read this before making changes.
> **Last Updated**: 2026-08-10 — Phase 1a complete, enrichment pass done.

## Architecture

- **Site**: Static SPA at `D:\truth\site\index.html` + `style.css` — reads raw markdown from GitHub
- **Daemon**: `D:\truth\daemon\daemon.mjs` — Truth Sentinel, runs as Coolify container on Hetzner VPS
- **Repo**: `cryptocreeper94-sudo/truth` on GitHub
- **Live URL**: `truth.tlid.io`
- **Model**: GPT-4o-mini (env var `TRUTH_MODEL` in Coolify)
- **Budget**: $30/month, 3 claims per 6-hour cycle
- **Parser**: Custom regex in index.html (lines ~55-68), strips quotes, maps source_ids→sources, derives id from filename

## Key Rules

1. **Auto-deploy is OFF** on both Site and Sentinel. Manual deploy from Coolify.
2. **Truth is not a wiki — it's a courtroom.** Anyone can submit evidence. No one edits the record.
3. **DOCUMENTED ≠ TRUE.** It means a verifiable source exists. Both sides of a debate can be DOCUMENTED.
4. **PM2 is BANNED.** All daemons run as Coolify containers.
5. **Volume mount issue**: Sentinel Coolify volume mounts `/app/daemon` which overlays code. Need to change to `/app/state`.

## Phase 1a — Domain Navigation & Content Quality ✅ COMPLETE

- [x] 19 domain categories (Biblical Lineage, Cartography, Intelligence Programs, etc.)
- [x] Tiered accordion on home page (Tiers I-V by source-material density)
- [x] Domain filter bar on claims page
- [x] Breadcrumb navigation on claim/source detail pages
- [x] Related Claims sidebar
- [x] Source detail: evidence preview (image-url), verify button, external refs
- [x] Retroactive domain assignment for all 89 claims via GitHub API
- [x] GPT-4o-mini enrichment of 70 thin daemon claims (~$0.035)
- [x] Daemon prompt v0.4.0 with strict frontmatter template
- [x] Model switch: gpt-4o → gpt-4o-mini (15x cheaper)
- [x] Ken Burns hero slideshow (4 generated images)
- [x] Canonical footer with easter egg admin gate (triple-click → PIN input)

## Phase 1c — Record Integrity ✅ ENGINE BUILT (2026-08-10, main agent)

> DOCUMENTED means "the record exists AND the pointer to it resolves" — not that the claim is true.
> A fabricated catalog number or invented URL fails this even under the weak reading.

- [x] `daemon/verify.mjs` — citation verification engine. Fetches every source verify-at/verification_url and every URL in claim bodies. Verdicts: verified / blocked (site refuses bots) / failed / no-checkable-source. Writes `verification/report.json` + stamps claim frontmatter (`verification:`, `verified-on:`).
- [x] Demotion pass run: claims whose citations did not resolve dropped DOCUMENTED → SPECULATIVE (original tag preserved in `confidence-claimed:` — verify.mjs auto-restores when citations later pass). Result: 18 verified, 39 demoted, 32 already pending.
- [x] Daemon contract fixed: daemon may NEVER assign DOCUMENTED; drafts start SPECULATIVE; fabricating citations prohibited in prompt. Only verify.mjs promotes.
- [x] Site shows verification badges (claim cards + detail) and a Verification sidebar card explaining the gate.
- [x] Duplicate ID fixed: second C-0077 renumbered to C-0089.
- [ ] Repair pass on failed citations: replace invented URLs/catalog refs with real ones (Rumsey luna URLs, real LMA/archive references), then re-run verify.mjs to restore DOCUMENTED. **Do this as part of the image/link enrichment session.**
- [ ] Run verify.mjs at the end of every daemon cycle (wire into daemon.mjs or cron).

## Phase 1b — Image Caching & Infrastructure

- [ ] Create `/evidence/` directory in repo for hosting cached source images
- [ ] Script to download external evidence images and cache locally
- [ ] Fix Coolify volume mount: `/app/daemon` → `/app/state`
- [ ] Reset daemon budget tracking after model switch

## Phase 2 — Courtroom Model (User Evidence Submission)

- [ ] Admin page behind PIN gate (route: `#/admin`)
- [ ] Submission form: claim text, confidence tag, sources, domain
- [ ] Moderation queue: admin reviews before publishing
- [ ] Discussion system persistence (currently localStorage only → needs backend or GitHub Issues API)
- [ ] User authentication (simple PIN-based for admin, open for discussion)

## Phase 3 — Cross-Reference Graph

- [ ] Visual graph of claim-to-claim relationships
- [ ] `related:` field auto-populated by daemon
- [ ] Network view showing which domains interconnect
- [ ] Timeline view for chronological claims
- [ ] Search functionality across claims, sources, and digs

## Phase 4 — Community & Evidence Standards

- [ ] Public evidence submission portal (non-admin)
- [ ] Evidence quality scoring (Tier 1-5 source classification)
- [ ] Automated duplicate detection
- [ ] RSS/Atom feed of new claims
- [ ] API for programmatic access

## Domain → Tier Mapping

| Tier | Name | Domains |
|---|---|---|
| I | Foundation | Biblical Lineage, Biblical Texts, Calendar Systems, Cartography, Financial Origins |
| II | Institutional | Intelligence Programs, Institutional Origins, Education Design |
| III | Physical Evidence | Ancient Engineering, Buried Cities, Star Forts, Archaeology |
| IV | Civilization Patterns | Orphan History, World Fairs, Reset Evidence |
| V | Deep Chronology | Suppressed Finds, Ancient Texts, Flood Narratives, Etymology |

## File Map

| File | Purpose |
|---|---|
| `site/index.html` | Core SPA — all routing, rendering, parsing |
| `site/style.css` | All styles — design system, components, responsive |
| `site/img/hero-*.png` | Ken Burns slideshow images |
| `daemon/daemon.mjs` | Truth Sentinel — autonomous research daemon |
| `daemon/Dockerfile` | Container build for Coolify |
| `METHOD.md` | The Law — archive methodology rules |
| `claims/*.md` | Individual claim files with YAML frontmatter |
| `sources/*.md` | Source documentation files |
| `digs/*.md` | Dig site investigation files |
| `links/*.md` | Cross-reference link files |
