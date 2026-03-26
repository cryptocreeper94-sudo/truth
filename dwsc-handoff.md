# DWSC — Fix Handoff

**Repo:** Cryptocreeper94-sudo/dwsc  
**Live site:** https://dwsc.io  
**Date:** March 26, 2026  
**Commits:** 28  
**Purpose:** DarkWave Systems Collective — the R&D and engineering org page for DarkWave Studios LLC. A static site built entirely in Lume (the language itself, as a live proof of concept). Showcases the Lume programming language, hosts research papers and an engineering blog, displays the Trust Layer ecosystem directory, and includes a PIN-protected developer portal.

---

## What It Is

- **Static site** — no server. `src/main.lume` → `build.js` (custom Lume transpiler) → `dist/dwsc.js` → served as HTML + JS bundle via Render
- **Self-healing build pipeline (Tier 1–3):**
  - Tier 1: Syntax gate (`node -c`), paren/brace balance check, VM sandbox execution test
  - Tier 2: Deploy-time health monitoring
  - Tier 3: Runtime evolution engine — build history tracking, pattern learning, recommendations
- **Dev portal** (`#portal`) — triple-click footer easter egg → PIN entry → internal tools/links
- **Research papers** — downloadable PDFs in `public/papers/`
- **Engineering blog** — 5 posts written in Lume
- **Ecosystem directory** — 36+ apps across 8 verticals
- **Account Hub V2** — ecosystem affiliate/referral component (added recently)
- **SEO** — `sitemap.xml`, `robots.txt`, meta tags

---

## Priority 1 — Build Pipeline Fragility

### 1.1 The Lume transpiler is a regex replacer, not an AST parser

**File:** `build.js`

The transpiler converts `.lume` → `.js` using line-by-line string replacements:
```js
line.replace(/^(\s*)define\s+/, '$1const ')
line.replace(/^(\s*)show\s+(.+)$/, '$1console.log($2)')
```

These break the moment `define` or `show` appear inside a string, nested expression, comment, or any non-statement context. The commit history shows this has already happened multiple times:
- `fix: repair dist/dwsc.js syntax errors causing black screen`
- `fix: missing ) in topRefs.map() + convert all Lume syntax to JS`
- `fix: restore working dist/dwsc.js with hero CTA + footer updates`

`main.lume` is now **3,311 lines / 119 KB** and growing. The fragility risk scales with the file size.

**Fix (short-term):** Split `main.lume` into logical section files (hero, research, ecosystem, blog, portal) and `import`/concatenate them in the build step. Smaller files mean smaller blast radius per build failure.

**Fix (long-term):** Extend the transpiler to track parser state (inside string, inside template literal, inside comment) before applying substitutions, so patterns inside strings are never transformed.

---

### 1.2 `dist/dwsc.js` is committed to the repo — build output under version control

Every broken build is a bad commit. The commit history shows at least 4 commits that are direct repairs to the built output file. This is a symptom of the fragility in 1.1.

**Fix:** Add `dist/dwsc.js` to `.gitignore`. The Render deploy command should run `node build.js` before serving. The self-healing pipeline already validates the output — if validation fails, the deploy should fail before the broken file is ever served.

The exception is `dist/.last-good-hash` — this should still be tracked for rollback to work.

---

### 1.3 `.githooks/pre-push` won't run by default

**File:** `.githooks/pre-push`

Git hooks in `.githooks/` only work if each developer has explicitly run:
```sh
git config core.hooksPath .githooks
```
If they haven't, the pre-push hook that blocks broken bundles is silently skipped. This is why broken builds are making it into commits.

**Fix:** Add to `package.json`:
```json
"scripts": {
  "prepare": "git config core.hooksPath .githooks"
}
```
`prepare` runs automatically on `npm install`, so every new clone or pull gets the hook configured without any manual step.

---

## Priority 2 — Security

### 2.1 Dev portal PIN is in the client-side JS — security theater

**Site:** `https://dwsc.io/#portal` (triple-click footer to activate)

PIN validation runs entirely in the browser. Anyone who opens DevTools → Sources and searches for the PIN comparison can read it in seconds. If the dev portal links to actual internal tools, admin panels, or sensitive resources, this protection is ineffective.

**Fix:** Decide what level of protection is actually needed:
- **Obscurity only (acceptable):** Keep it as-is but document that the PIN is not a real security control — it's just friction. Remove anything genuinely sensitive from the portal.
- **Real access control:** Move the gated content to a server-side route that requires a real session token (Trust Layer SSO). The PIN gate becomes a client-side UX flow that triggers a server-validated session check.

---

## Priority 3 — Content / Credibility

### 3.1 "0 CD Target Score" reads as a zero metric, not a goal

**Observed on live site:** The four hero stats display as:
```
7 Tolerance Layers  |  2,149 Tests Passing  |  3 Security Layers  |  0 CD Target Score
```

The zero is intentional — Cognitive Distance of zero is the design goal. But displayed as a raw number alongside three other metrics, it reads as "this system scored a zero" rather than "zero is what we're achieving."

**Fix:** Change the label from `CD Target Score` to one of:
- `CD Score: →0` (arrow makes the direction obvious)
- `~0 Cognitive Distance` (approximate/approaching)
- `Zero-CD Achieved` (if the claim is that it's reached)

---

### 3.2 Test count is manually maintained

**Commits:** `chore: update Lume test count 2,000 → 2,149` and `chore: remove + from test count — 2,149 is exact`

The 2,149 number on the live site is hardcoded in `main.lume`. It will go stale as the Lume test suite grows.

**Fix:** Output the test count to a JSON file during the Lume CI run (e.g., `lume-stats.json`), read it in `build.js` at build time, and inject it as a variable into the bundle. The number then updates automatically on every deploy without a manual commit.

---

### 3.3 12+ ecosystem apps link to `href="#"` with "Coming Soon"

The ecosystem directory carousel shows apps like Deploy Engine, Hallmarks, Trust Stamps, Marketplace, ServiceHub, MetricFlow, OpsCenter, DocForge, AuditTrail, Bloom, Newsroom, GameForge, ConnectHub, and others — all with `href="#"` and "Coming Soon."

For a page that claims "36+ production apps," half the carousel linking to `#` creates a credibility gap. A visitor clicking through will see half the ecosystem is non-existent.

**Fix (recommended):** Remove coming-soon cards from the carousel entirely. Add them back when they go live. Keep only apps with real URLs in the live directory. A shorter list of real apps is more credible than a long list with half as placeholders.

**Fix (alternative):** Replace `href="#"` with a waitlist/notify signup URL so at least the click does something.

---

## Priority 4 — Dead Code Cleanup

### 4.1 Vite config and TypeScript configs are orphaned

The repo switched from Vite to the custom Lume bundler (commit: `fix: use Lume bundler for build instead of Vite`). The following files are no longer used by anything:

- `vite.config.ts`
- `tsconfig.app.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `eslint.config.js` (Vite/TS project — not applicable to a Lume build)

**Fix:** Delete all five. They add noise and confuse any agent or developer reading the repo.

---

### 4.2 `src/App.tsx` and `src/main.tsx` — React dead weight

These TSX files remain from the original React/Vite setup. The build only reads `src/main.lume`. The `.tsx` files are never compiled or referenced by `build.js`.

**Fix:** Delete `src/App.tsx` and `src/main.tsx`. Keep `src/main.lume` and the `src/assets/` and `src/components/` directories only if the Lume source actually imports from them.

---

### 4.3 Confirm `src/components/` is used by the Lume build

There is a `src/components/` directory (added with Account Hub V2). Confirm whether `build.js` processes and includes these component files, or whether they're React components that don't actually make it into the bundle.

---

## Priority 5 — Account Hub V2

### 5.1 Verify affiliate routing is connected to a live backend

The Account Hub V2 component (added 3 hours before this review) calls ecosystem affiliate/referral routes. Confirm:
- Which backend URL does it call? Is it `dwtl.io` or a local server?
- DWSC is a static site — API calls go to an external backend. Is that backend live and accessible?
- Are affiliate referral clicks and conversions actually being tracked server-side?

---

## File Map (Key Files)

| File | Purpose |
|---|---|
| `src/main.lume` | Entire site source — 3,311 lines, 119 KB |
| `build.js` | Custom Lume-to-JS transpiler + 3-stage validation |
| `lume-heal.js` | CLI: validate, rollback, status, monitor, history, evolve |
| `dist/dwsc.js` | Built bundle — currently in version control (should be gitignored) |
| `dist/.last-good-hash` | Tracks last valid commit for rollback — keep in version control |
| `.githooks/pre-push` | Blocks push on validation failure — only runs if hooksPath is configured |
| `public/papers/` | Downloadable research PDFs |
| `index.html` | HTML shell that loads `dist/dwsc.js` |
| `sitemap.xml` | SEO sitemap — verify it's current |
| `robots.txt` | Search indexing config |
| `src/components/` | Account Hub V2 + other components — verify Lume build includes these |

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 1.1 | Regex transpiler fails on edge cases — main.lume is 3,311 lines | HIGH | OPEN |
| 1.2 | dist/dwsc.js committed to repo — build output in version control | HIGH | OPEN |
| 1.3 | .githooks/pre-push won't run without manual git config | HIGH | OPEN |
| 2.1 | Dev portal PIN is client-side JS — not real security | MEDIUM | OPEN |
| 3.1 | "0 CD Target Score" reads as a zero measurement, not a goal | MEDIUM | OPEN |
| 3.2 | Test count (2,149) manually maintained — will go stale | MEDIUM | OPEN |
| 3.3 | 12+ ecosystem apps show "Coming Soon" with href="#" | MEDIUM | OPEN |
| 4.1 | Vite config + TS configs orphaned — 5 dead files | LOW | OPEN |
| 4.2 | src/App.tsx and src/main.tsx are dead React files | LOW | OPEN |
| 4.3 | Confirm src/components/ is actually included in Lume build | MEDIUM | OPEN |
| 5.1 | Account Hub V2 — verify affiliate routing connects to live backend | MEDIUM | OPEN |
