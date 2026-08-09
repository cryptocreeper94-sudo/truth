# Handoff: "Through The Veil" / The Lying Pen — current state (Aug 9, 2026)

For: the agent building the INVARIANT landing page.
From: the agent maintaining the book manuscript + Evidence Room reader in `cryptocreeper94-sudo/theveil` (branch `main`).

## 1. Correct book stats — update the landing page
The page currently shows **62 chapters / 78,000 words**. Both are wrong.

- **Word count: ~128,200 words** (exact `wc -w` on the manuscript today: 128,198). Round to **128K**.
- **Chapter count: 71 chapters** (verified against the live table of contents), **plus a new Epilogue** ("The Two Deathbeds") just added — so 71 + epilogue once the next deploy picks up the parser change.
- Subtitle/edition line: "Second Edition — 2026" is fine if that's Jason's call.
- Suggested stats row: **71 chapters · 128K words · Second Edition — 2026**

## 2. What changed in the book recently (in case the page describes content)
- **New Epilogue: "The Two Deathbeds"** — Romans 6:23 as Paul's legal sentence; the two meanings of "death"; a firsthand deathbed witness account.
- **Chapter 36C expanded** — now three movements: the Relocated Map, the Little Season, and **"The Great River"** (New Madrid 1811 earthquakes read as Revelation 9:14, the Mississippi as "the great river").
- **All 8 Wyatt-site archaeology photos removed** (copyright exposure closed). The book now deliberately contains **no photographs** for those claims — replaced with a "do your own work" note. If the landing page uses any Wyatt-site imagery (ark formation, chariot wheels, split rock, Jabal al-Lawz, Sodom ash, sulfur balls, Nuweiba column), **remove it** — same copyright problem.
- **Hospitality pass** — a names key table (Yahusha→Jesus, etc.) added to the front matter; repetition trimmed; clearer section headers.
- **Reader UI restyled** — the online reader is now a warm-ink "Evidence Room" aesthetic: near-black chrome, brass (amber) and oxblood (red-900) accents, parchment reading surface with serif type. If the landing page links to "Read Online," its visual language could echo that (ink/parchment/brass) rather than cyan/glass.

## 3. Canonical facts the page must not contradict
- Names convention: **Yahusha** (never Yeshua), Sha'ul, Kepha, Yochanon, Yahuah. Translation referenced: the Cepher.
- Tone: documentary — "presented, not asserted." Objections stated at full strength.
- The book does **not** claim "Yahusha's story happened in America" — that is explicitly reserved for a future book. Don't foreshadow it on the page.

## 4. Where the book lives
- Repo: `cryptocreeper94-sudo/theveil`, branch `main`. Manuscript: `client/public/through-the-veil.md` (mirror copy at `public/through-the-veil.md` — keep both in sync).
- Live reader: https://thelyingpen.tlid.io (root serves the Trust Layer app; reader at `/veil/read`, but **deep links 404 in production** — no SPA fallback. A shareable front-door URL is still an open item; if the landing page links to the reader, test the link cold in a fresh browser.)
- API: `/api/veil/toc` and `/api/veil/chapters` (TOC is cached ~5 min server-side).

## 5. The blank half of the page — likely causes
The screenshot shows a very tall empty black region between the "Choose Your Format" section and the footer. Most likely one of:
1. **Scroll-reveal animations that never fire** — sections start at `opacity: 0` (or `visibility: hidden`) waiting on an IntersectionObserver/reveal class that isn't being added (observer not attached, class name mismatch, or JS error upstream killing the script). Check the console for errors and check whether the "hidden" sections have their reveal class after scrolling.
2. **Failed background/section images** — sections with fixed `min-height` whose `background-image` URLs 404, leaving tall empty containers. Check the Network tab for 404s on image assets.
3. Less likely: a section rendering with no content (empty data/map) but keeping its `padding`/`min-height`.

## 6. One more thing
The landing page source doesn't appear to be pushed to any GitHub repo under this account yet — please push it (or tell Jason where it lives) so it survives environment resets and other agents can reference it.
