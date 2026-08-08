---
name: The Veil book thesis & state
description: Jason's "lying pen" thesis, the book's revision history through Aug 2026, deployment facts, and pending UI work for the theveil repo.
---

# Thesis (Jason's evolved framework)
- Core: Jeremiah 8:8 — the "lying pen" corrupted not just texts but the MAP (geography relocated: American names/topology, Mississippi rivers, California-island maps 1620s–1740s killed by Ferdinand VI decree 1747), the CLOCK (Armageddon possibly already past — Utah melt, desert glass; Rev 20 "little season" explains a broken post-restoration world), and the MESSAGE (Paul vs the eyewitness streams).
- Master mechanism: "distributed/sharded truth" — truth split across camps, each fragment stapled to an absurdity so it arrives pre-discredited.
- Pen vs Land: everything written is suspect; everything standing (mounds, Newark lunar octagon, vitrified stone) is evidence.
- Name convention: **Yahusha**, never "Yeshua" (the book has a "Yeshua Trap" section). Sha'ul (Paul), Ya'aqob (James), Kepha (Peter), Yirmeyahu.
- Editorial standard: "presented, not asserted"; state objections at full strength; include falsifiability cautions. Opening promise (revised): "not trying to convince you to believe me — trying to convince you to look."

# Book state (Aug 8, 2026 — all pushed to cryptocreeper94-sudo/theveil, branch **main**, head 8292c83)
- Added: "The Sharded Truth: How to Read This Book" (front matter), Ch 36C The Relocated Map (+ "The Little Season" section), Ch 43B The Stolen Way (Paul vs eyewitness streams: Clementine Hom 17, Ya'aqob, Didache, Thomas, Ebionites), expanded Ch 43 witnesses.
- Fixed: CIA 1035-960 overstatement, Khazar ancestry passages (replaced with documented political history), gematria "proof" framing, chariot-wheel claims, image captions → identification language + disclaimer note in Ch 5B.
- ~124k words. Manuscript: client/public/through-the-veil.md; MUST sync duplicate public/through-the-veil.md after edits (server tries client/public first).
- Ch 42 defends Paul charitably; Ch 43B frames itself as "the deeper wave" so they don't contradict.

# Deployment facts
- LIVE site: **https://thelyingpen.tlid.io** on Coolify, auto-deploys from GitHub main. Reader at /veil/read; root serves "Trust Layer" app; API /api/veil/chapters.
- DEAD: throughtheveil.tlid.io → suspended old Render deployment (503, x-render-routing: suspend). Jason should repoint DNS or delete.
- Repo default branch is **main** (not master).

# Pending
- "Evidence Room" reader UI redesign approved in spirit, awaiting go: replace cyan glassmorphism (veil-reader.tsx, ~2000 lines, GlassCard/sky-blue) with ink/parchment archive aesthetic, serif body type, restrained accent.
- Image provenance question open: 8 Wyatt-site photos in client/public/images/ may be web-sourced (copyright risk); Sodom ash photo has Android EXIF (possibly Jason's own).
