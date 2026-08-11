---
name: DarkWave site deployment path
description: Which GitHub repo feeds darkwavestudios.io and the Coolify redeploy gotcha
---

# DarkWave site deployment path

- `darkwavestudios.io` is deployed via the user's Coolify instance; the Coolify app may be named "darkwavestudios v2" (that is an app name, not a repo — no `*v2*` DarkWave repo exists on GitHub).
- The **active source repo is `cryptocreeper94-sudo/DarkWaveStudiosLLC`** (README says "Live: darkwavestudios.io"; same page title as production).
- Older repos `cryptocreeper94-sudo/darkwavestudios` and `cryptocreeper94-sudo/darkwave-studios` are **archived/read-only** — pushes to them fail with "repository was archived".

**Why:** An investor-page rebuild was first committed to a clone of the archived repo and could not be pushed; the same commit had to be re-applied to `DarkWaveStudiosLLC` (pushed Aug 11, 2026, `/investors` rebuild).

**How to apply:** Always push DarkWave site changes to `DarkWaveStudiosLLC`. After pushing, verify deployment by checking the hashed `index-*.js` bundle on darkwavestudios.io for new content.

**Confirmed Aug 11, 2026: the repo has ZERO GitHub webhooks** (`GET /repos/.../hooks` returns empty) — Coolify cannot auto-deploy on push. Every deploy requires the user to click Redeploy in Coolify. Past "auto-deploys" were manual redeploys that happened to follow pushes. Permanent fix: register the Coolify app's webhook URL on the GitHub repo.
