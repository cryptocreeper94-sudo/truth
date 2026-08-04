# Axiom — Gemini Handoff Brief
**Project:** Axiom — Professional Writing + Knowledge AI  
**Company:** DarkWave Studios LLC  
**Date:** August 4, 2026  
**Prepared for:** Gemini (continuing agent)

---

## What Axiom Is

Axiom is a professional writing and AI knowledge tool for high-stakes communicators — congressional staff, communications directors, executives. It has two primary surfaces:

1. **Document Composer** (`/demo/compose.html`) — generates 14 document types (resumes, cover letters, policy briefs, press releases, talking points, etc.) from structured prompts. Supports write, tailor, improve, and match/ATS-score intents. Includes Fix Gaps (one-click ATS repair), image generation, PDF + Word export, snippets library, compose history, share links, and templates.
2. **Chat Interface** (`/demo/index.html`) — a cockpit-style AI chat using a cognitive OS with dialectical reasoning and multiple agent modes.

The product has a **React + Vite home page** (separate artifact, `artifacts/axiom-home/`) serving as the public front door with CTAs pointing to the two demo pages.

---

## Deployment

| Layer | Where |
|---|---|
| **Production URL** | axiom42.com |
| **Hosting** | Hetzner server managed by Coolify |
| **CI/CD** | Coolify watches GitHub repo `cryptocreeper94-sudo/DDA` (private), auto-deploys on push to `main` |
| **Database** | PostgreSQL, persisted via Coolify volume mount |
| **Home page** | Separate Replit artifact (React + Vite), deployed independently |

---

## Environment Variables

**All env vars live in Coolify — NOT in Replit secrets.** Do not ask the user to enter them in Replit. They are injected at container startup by Coolify.

### Required for core features

| Variable | Purpose | Status |
|---|---|---|
| `OPENAI_API_KEY` | LLM gateway (Tier 2 composition, Fix Gaps) + DALL-E 3 image generation | ✅ Set in Coolify |
| `DATABASE_URL` | PostgreSQL connection string | ✅ Set in Coolify |
| `JWT_SECRET` | Auth token signing | ✅ Set in Coolify |
| `SESSION_SECRET` | Session middleware | ✅ Set in Coolify |

### Optional / feature-specific

| Variable | Purpose | Default if absent |
|---|---|---|
| `AXIOM_LLM_PROVIDER` | `openai` / `anthropic` / `ollama` | `openai` |
| `AXIOM_LLM_MODEL` | Override model name | `gpt-4o-mini` (openai) or `claude-3-5-sonnet-20241022` (anthropic) |
| `OPENAI_BASE_URL` | Custom OpenAI-compatible endpoint | `https://api.openai.com/v1` |
| `OPENAI_CLOUD_API_KEY` | Separate cloud fallback key | Falls back to `OPENAI_API_KEY` |
| `AXIOM_CLOUD_MODEL` | Cloud fallback model | — |
| `ANTHROPIC_API_KEY` | Use Anthropic instead of OpenAI | — |
| `RESEND_API_KEY` | Transactional email | — |
| `RESEND_FROM` | Sender address | — |
| `COINBASE_COMMERCE_API_KEY` | Crypto payments | — |
| `COINBASE_COMMERCE_WEBHOOK_SECRET` | Coinbase webhook verification | — |
| `STRIPE_SECRET_KEY` | Stripe payments | — |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification | — |
| `TWILIO_ACCOUNT_SID` | SMS / voice | — |
| `TWILIO_AUTH_TOKEN` | Twilio auth | — |
| `TWILIO_PHONE_NUMBER` | Twilio outbound number | — |
| `GEONAMES_USERNAME` | Geo lookup | — |
| `EMBEDDING_MAX_DOMAINS` | Embedding domain limit | — |

### How the LLM gateway resolves

```
src/conversation/gateway.js
```
- Reads `AXIOM_LLM_PROVIDER` first (default: `openai`)
- If `openai`: uses `OPENAI_API_KEY` + model `gpt-4o-mini` (or `AXIOM_LLM_MODEL`)
- If `anthropic`: uses `ANTHROPIC_API_KEY` + model `claude-3-5-sonnet-20241022`
- If `ollama`: uses local Ollama at `OPENAI_BASE_URL`, no real key needed
- `gateway.available` returns `true` if a valid provider+key combo is found
- All Tier 2 LLM calls (document composition, Fix Gaps, ATS feedback) gate on `gateway.available`

---

## Repository Structure

```
/
├── src/
│   ├── api/router.js              # All API endpoints
│   ├── conversation/gateway.js    # LLM provider abstraction
│   ├── database/db.js             # PostgreSQL — all tables + CRUD
│   ├── runtime/document-composer.js  # 14 doc types, Tier 1+2 pipeline
│   ├── knowledge/
│   │   ├── packs/resume_axiom.js        # Resume-specific writing rules
│   │   └── packs/general_writing_axiom.js  # 20 rules for all other doc types
│   │   └── loader.js              # Registers both packs
│   ├── capabilities/image-gen.js  # DALL-E 3 integration
│   ├── engines/                   # Cognitive OS, dialectical engine
│   └── auth/tenant.js             # Auth + tenant management
├── demo/
│   ├── compose.html               # Document Composer UI (standalone HTML/JS/CSS)
│   ├── index.html                 # Chat interface
│   └── axiom.css                  # Design system — dark/crème, JetBrains Mono, Inter
└── artifacts/
    └── axiom-home/                # React + Vite public home page (separate artifact)
        └── src/pages/home.tsx     # Landing page component
```

---

## Database Tables

| Table | Purpose |
|---|---|
| `axiom_tenants` | Registered users / orgs |
| `axiom_sessions` | Session management |
| `axiom_compose_history` | Saved compose results per session/tenant |
| `axiom_share_links` | Shareable document links with expiry |
| `axiom_snippets` | Personal reusable text snippets (NEW — this session) |
| `axiom_templates` | Document templates (NEW — Task #9) |

---

## What Was Built This Session

### PDF Export (`demo/compose.html`)
- Pure client-side JS PDF 1.4 builder — no server, no libraries
- Word-wraps at ~90 chars, paginates at ~50 lines/page, correct 20-byte xref
- "⬇ .pdf" button in the compose action row

### Fix Gaps Bug Fix (`demo/compose.html`)
- `renderMatchResult()` was never setting `lastMatchData = data`
- This caused Fix Gaps to silently bail on every click
- Fixed — Fix Gaps now works correctly

### Snippets Library (`src/database/db.js`, `src/api/router.js`, `demo/compose.html`)
- `axiom_snippets` table with CRUD: `saveSnippet()`, `getSnippets()`, `deleteSnippet()`, `updateSnippetTitle()`
- API: `GET/POST /v1/compose/snippets`, `PATCH/DELETE /v1/compose/snippets/:id`
- UI: "📌 Save" button → modal → collapsible "My Snippets" panel with Insert/Delete/Rename

### Document Templates (`src/api/router.js`, `demo/compose.html`) — Task #9
- Merged via task agent at commit `d6fe4ce`
- Templates table + API endpoints
- UI for browsing and loading templates into composer

### Axiom Home Page (`artifacts/axiom-home/`)
- React + Vite landing page at preview path `/`
- Design rules (IMPORTANT — follow these exactly):
  - **Font:** Inter 900 weight for headings, JetBrains Mono for all labels/tags/mono text
  - **Sections:** strictly alternating dark (`#0c0c14`) and crème (`#f5f2eb`) sections
  - **Noise overlay:** `::before` pseudo-element, SVG fractalNoise, 4% opacity on every section
  - **Accents:** Cyan `#22d3ee`, Teal `#2dd4bf`, Purple `#c084fc`, Rose `#fb7185`
  - **Images:** `filter: grayscale(100%) contrast(1.05)` default → full color on hover
  - **Cards:** 3D tilt effect via custom `useTilt` React hook (perspective + rotateX/Y ±8deg)
  - No emojis anywhere
- CTAs: `/api/demo/compose.html` and `/api/demo/index.html` (Replit preview paths)
  - **Note for Coolify:** on axiom42.com the Express server serves at root, so paths should be `/demo/compose.html` and `/demo/index.html` — this may need updating for production

---

## Final Session Status (end of Aug 4 session)

**DDA repo push state: ✅ everything pushed.** `origin/main` HEAD is `a2dc611` (snippets library). Coolify has picked up all commits through that point. Nothing uncommitted or unpushed.

**Important caveat — two codebases:**
- The **DDA GitHub repo** (deployed to axiom42.com via Coolify) contains the real product: Express API + `demo/*.html` pages. Everything the main agent built (PDF export, snippets, Fix Gaps fix, templates from Task #8/#9) is in there and pushed.
- The **Replit workspace** is a separate pnpm monorepo. Replit *task agents* merged several tasks (#9 templates, #11 image rate limit, #12 image persistence, #13 PDF export, #14 home page) into the **workspace**, not into DDA. If any of those merges contain product code that isn't already in DDA, it must be ported manually. Cross-check before assuming a task-agent merge is live in production.

**Still open / worth doing next (priority order):**
1. **Home page → axiom42.com** — the React home page only exists in the Replit workspace; see "Home Page Deployment — Action Required" section below. CTA paths must change from `/api/demo/...` to `/demo/...` for production.
2. **Task #20 — draft autosave** — the biggest real product gap: compose drafts are lost on page refresh. localStorage save every few seconds is enough.
3. **Task #16 — ATS score delta** ("you went from 61 → 89" after Fix Gaps) — a task agent was working on this at session end; check whether it finished and whether its output landed in the workspace or needs porting to DDA.
4. **Task #29 — Word (.docx) export** — completes the text/PDF/Word trio; can be done client-side like the PDF exporter in `demo/compose.html`.
5. **Tasks #5/#6/#7** — share-link polish (expired-link page, auto-cleanup, manage-links UI).
6. **Tasks #22/#23/#25/#26** — image generation quality-of-life (daily count display, bot quota protection, old-image cleanup, delete individual images).

**Verify on production (quick smoke test):**
- Fix Gaps works end-to-end (the `lastMatchData` bug fix is in `c0fa22a`)
- PDF download produces a valid file
- Snippets save/insert/rename/delete
- Image generation produces real images (OPENAI_API_KEY is set in Coolify)
- Mobile: user has been using the product from their phone all day — it works; do not "add mobile support," it exists.
- There is NO "coming soon" page in production — auto-proposed tasks claiming otherwise were based on Replit workspace placeholders and were cancelled.

---

## Current Task Status

| Task | State | Notes |
|---|---|---|
| #5 Expired share links → blank page | PROPOSED | Minor UX — expired links currently show nothing |
| #6 Share link auto-cleanup | PROPOSED | DB hygiene — prune old links on cron |
| #7 View/manage shared links | PROPOSED | Dashboard for user's own links |
| #10 Image generation AI key | IMPLEMENTED | Task agent just finished — needs Apply |
| #11 Reset image gen rate limit | PENDING | Gated on #10 |
| #12 Keep generated images after refresh | PENDING | Gated on #10 |
| #16 Show ATS score delta after Fix Gaps | PENDING | "You went from 61 → 89" display |
| #17 Paste resume URL | PENDING | Let users link instead of paste |
| #19 Template preview | PENDING | See template content before loading |
| #20 Draft autosave | PENDING | localStorage or DB save every few seconds |
| #21 Activate AI features without losing on restart | PROPOSED | Env var persistence concern — but vars are in Coolify so this may already be resolved |

---

## Things to Check / Verify

1. **Task #10 (image gen) is IMPLEMENTED** — hit "Apply Changes" to merge, then verify DALL-E image generation works on axiom42.com with the real `OPENAI_API_KEY`

2. **Home page CTA paths** — the React home page was built in the Replit workspace. CTAs point to `/api/demo/compose.html`. On axiom42.com the correct paths are `/demo/compose.html` and `/demo/index.html`. Confirm the user pushed the home page code to the DDA repo and that the paths are correct for production.

3. **Task #21 ("Activate AI features without losing them on server restart")** — this was auto-proposed but may already be a non-issue. The gateway reads env vars from `process.env` at startup. As long as Coolify injects `OPENAI_API_KEY` (and it does), the gateway will be `available: true` on every boot. No code change needed unless there's a specific caching or in-memory override happening.

4. **Fix Gaps end-to-end on production** — the `lastMatchData` bug was fixed in this session. Verify it works on axiom42.com: load the ATS matcher, run a match, then click Fix Gaps. It should now rewrite the resume sections.

---

## Design System Reference

The full design system is in `demo/axiom.css`. Key tokens:

```css
/* Dark (default) */
--void: #0c0c14;  --primary: #12121e;  --secondary: #1a1a2e;
--cyan: #22d3ee;  --teal: #2dd4bf;     --purple: #c084fc;  --rose: #fb7185;
--font-mono: 'JetBrains Mono', monospace;
/* body: Inter, sans-serif */

/* Light / Crème (home page alternating sections) */
--crème-bg: #f5f2eb;  /* warm off-white — NOT the cold gray #f0f2f5 */
```

All UI uses Inter for body copy and JetBrains Mono for labels, badges, code, captions. Buttons are flat cyan gradient (`#22d3ee → #2dd4bf`) with black text.

---

## GitHub / Git

- **Repo:** `cryptocreeper94-sudo/DDA` (private)
- **Working clone in this environment:** `/tmp/DDA`
- **Main branch:** `main`
- **Recent commits this session:**
  - `a2dc611` — snippets library
  - `c0fa22a` — PDF export + Fix Gaps bug fix
  - `feed3c7` — universal document writing (14 doc types)
  - `a5367f5` — expired links, DB cleanup, share management
  - `83e6557` — Fix Gaps one-click + templates

Push to `main` via: `cd /tmp/DDA && git push origin main` (uses `GITHUB_PAT` secret in Replit).

---

## Backlog for Gemini — 9 Approved Features (Build These)

These are the remaining high-value features, spec'd explicitly. All work happens in the DDA repo (`cryptocreeper94-sudo/DDA`). The three files you'll touch most: `demo/compose.html` (the composer UI — standalone HTML/JS/CSS, no framework), `src/api/router.js` (all API endpoints), `src/database/db.js` (PostgreSQL tables + CRUD methods). Follow the existing code style in each file — plain JS, no build step for the demo pages. Push to `main` when done; Coolify auto-deploys to axiom42.com.

### 1. Expired share link error page
**Problem:** Visiting an expired or deleted share link shows a blank page.
**Build:** In the share-link route in `src/api/router.js`, when the link is missing or expired, return a styled HTML error page (dark theme, matching `demo/axiom.css` tokens: bg `#0c0c14`, JetBrains Mono, cyan `#22d3ee` accent) saying "This link has expired or was removed" with a button linking to `/demo/compose.html`.
**Done:** No shared link ever renders a blank page.

### 2. Manage shared links
**Problem:** Users can create share links but can't see or revoke them.
**Build:** `GET /v1/compose/shares` (list current session/tenant's links with created date, expiry, view count if tracked) and `DELETE /v1/compose/shares/:id`. In `demo/compose.html`, add a "My Links" collapsible panel (copy the pattern from the existing "My Snippets" panel) listing each link with a copy button and a revoke button.
**Done:** Users can list, copy, and revoke their own share links from the compose page.

### 3. Daily image count display
**Problem:** Users can't see how many image generations they have left today.
**Build:** The rate limit logic already exists server-side (recently updated by Task #11 — find it near the image generation endpoint in `src/api/router.js`). Add remaining/limit numbers to the image generation response (or a small `GET /v1/images/quota` endpoint). In `demo/compose.html`, show "X of Y today" next to the image generation button, updating after each generation.
**Done:** The user always knows their remaining daily image quota.

### 4. Bot/shared-IP quota protection
**Problem:** The image quota is keyed in a way bots or users behind shared IPs can exhaust.
**Build:** Key the quota to session ID (and tenant ID when logged in) rather than IP alone; combine session+IP so a fresh anonymous session on a shared IP still gets a reasonable allowance while a single session can't bypass by rotating IPs. Add a simple honeypot/heuristic guard: reject image requests with no prior compose activity in the session.
**Done:** One user's or bot's usage can't wipe out the quota for everyone on the same IP.

### 5. Clear error for private Google Docs (resume URL import)
**Problem:** The resume-URL import (Task #17, merged) fetches a URL; a private Google Doc returns a sign-in HTML page, which currently produces confusing output.
**Build:** In the URL-fetch handler, detect Google's sign-in redirect (response URL contains `accounts.google.com` or body contains `ServiceLogin`) and return a friendly 422: "This Google Doc is private. Share it as 'Anyone with the link can view' and try again." Show that message in the compose UI.
**Done:** Pasting a private Doc URL gives an actionable instruction, not garbage text.

### 6. Paste a job description URL
**Problem:** Users can paste a resume URL but must still paste job descriptions manually.
**Build:** Reuse the exact resume-URL fetch pipeline (same endpoint or a twin) for the job description field in the match/ATS flow in `demo/compose.html`. Same URL validation, same private-doc error handling as item 5.
**Done:** Both resume and job description accept a URL or pasted text interchangeably.

### 7. Search/filter templates by category
**Problem:** The template picker is a flat list; with 14+ doc types it's getting long.
**Build:** Templates already have a doc type. In the template picker UI in `demo/compose.html`, add a text filter input and category chips (one per doc type present). Client-side filtering only — no API changes needed.
**Done:** Users can narrow the template list by typing or clicking a category chip.

### 8. Remember last-used template
**Problem:** Returning users re-select the same template every visit.
**Build:** On template load, write the template ID to `localStorage` (`axiom_last_template`). On page load, if present and still valid, pre-select it in the picker with a subtle "Last used" badge. Do NOT auto-load its content — just pre-select.
**Done:** The previous template is pre-selected on return visits; one click to load.

### 9. Named multiple drafts
**Problem:** Autosave (Task #20, merged) protects one in-progress draft; users writing several documents in parallel can't switch between them.
**Build:** Extend the autosave mechanism: a "Drafts" dropdown in the compose header. "Save as draft" prompts for a name and stores `{name, docType, brief, result, savedAt}` in `localStorage` (`axiom_drafts` array, cap ~20). Selecting a draft restores all fields. Include delete buttons per draft.
**Done:** Users can name, switch between, and delete multiple working drafts.

**Order of attack:** 1 and 5 are quick wins (error handling). 3, 7, 8 are small UI additions. 2, 6, 9 are medium. 4 is the only one needing design judgment on the quota keying.

---

## ⚠️ Home Page Deployment — Action Required

The Axiom home page (`artifacts/axiom-home/`) is a **React + Vite app that lives in the Replit workspace monorepo**, not in the `cryptocreeper94-sudo/DDA` GitHub repo. Coolify only watches the DDA repo, so it has **not** been deployed to axiom42.com automatically.

To get the home page live on axiom42.com, one of these approaches is needed:

### Option A — Build and serve static files from the DDA repo (simplest)
1. Run `pnpm --filter @workspace/axiom-home run build` in the Replit workspace — outputs to `artifacts/axiom-home/dist/`
2. Copy the `dist/` contents into a `public/home/` folder (or root `public/`) in the DDA repo
3. Add an Express route in `src/api/router.js` to serve those static files at `/`
4. Push to `main` — Coolify deploys it with the rest of the app
5. **Update CTA links:** change `/api/demo/compose.html` → `/demo/compose.html` and `/api/demo/index.html` → `/demo/index.html` for production

### Option B — Deploy as a separate Coolify service
1. Create a new Coolify service pointing to the Replit workspace repo (or a separate GitHub repo for the home page)
2. Set it to serve at the root domain or a subdomain
3. No CTA path changes needed if served from the same domain

### Option C — Export built files from Replit and commit to DDA
1. In Replit, run the build and download `artifacts/axiom-home/dist/`
2. Commit those files into the DDA repo under `public/`
3. Serve them via Express static middleware

**Current CTA paths in the home page code** (need updating for production):
- `OPEN DOCUMENT COMPOSER` → `/api/demo/compose.html` ← change to `/demo/compose.html`
- `OPEN CHAT` → `/api/demo/index.html` ← change to `/demo/index.html`

The home page file is at: `artifacts/axiom-home/src/pages/home.tsx`

---

*End of handoff. All env vars are in Coolify — do not prompt the user for API keys in the chat.*
