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
