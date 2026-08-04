---
name: Axiom two-codebase split
description: Where Axiom's real product code lives vs the Replit workspace, and how deploys work
---

**The rule:** Axiom's production product is the `cryptocreeper94-sudo/DDA` private GitHub repo (Express API + `demo/*.html` pages). Coolify on Hetzner watches `main` and auto-deploys to axiom42.com. The Replit workspace monorepo is a separate codebase (home page artifact etc.).

**Why:** Task agents merge into the Replit workspace, not DDA — features "merged" here are not live in production until manually ported to DDA and pushed. This caused repeated confusion during the Aug 2026 session.

**How to apply:**
- Product feature work → clone DDA to /tmp (`GITHUB_PAT` secret), edit, commit, push to `main`. /tmp is wiped on environment restart — re-clone as needed.
- All env vars (OPENAI_API_KEY etc.) live in Coolify, never in Replit secrets. Do not ask the user to enter keys in Replit.
- On axiom42.com the Express server serves at root, so demo paths are `/demo/...`; in the Replit preview the API artifact mounts at `/api`, so paths are `/api/demo/...`.
- User (Jason Andrews, DarkWave Studios LLC) also hands work to Gemini via `GEMINI_HANDOFF.md` at the workspace root — keep it current when sessions end.
