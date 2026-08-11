---
name: DarkWave site deployment path
description: Which GitHub repo feeds darkwavestudios.io and the Coolify redeploy gotcha
---

# DarkWave site deployment path

- `darkwavestudios.io` is deployed via the user's Coolify instance; the Coolify app may be named "darkwavestudios v2" (that is an app name, not a repo — no `*v2*` DarkWave repo exists on GitHub).
- The **active source repo is `cryptocreeper94-sudo/DarkWaveStudiosLLC`** (README says "Live: darkwavestudios.io"; same page title as production).
- Older repos `cryptocreeper94-sudo/darkwavestudios` and `cryptocreeper94-sudo/darkwave-studios` are **archived/read-only** — pushes to them fail with "repository was archived".

**Why:** An investor-page rebuild was first committed to a clone of the archived repo and could not be pushed; the same commit had to be re-applied to `DarkWaveStudiosLLC` (pushed Aug 11, 2026, `/investors` rebuild).

**How to apply:** Always push DarkWave site changes to `DarkWaveStudiosLLC`. After pushing, verify deployment by checking the hashed `index-*.js` bundle on darkwavestudios.io for new content — build locally at a commit and compare the emitted `index-*.js` hash to the live one to identify exactly which commit is deployed.

**Auto-deploy DOES exist despite zero repo-level webhooks** (Aug 11, 2026): a push deployed within ~30s with the user away — the trigger is almost certainly a GitHub App connection in Coolify (App events don't appear in `GET /repos/.../hooks`). Do NOT conclude "no repo webhooks = manual deploys." However, the pipeline can silently stop: after one successful auto-deploy, three subsequent pushes (including an empty retrigger commit) produced no new build — a stuck/failed build in Coolify's queue, only diagnosable from the Coolify dashboard.
