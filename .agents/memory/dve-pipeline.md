---
name: DVE pipeline environment quirks
description: Deterministic Verification Engine (video verification) runtime dependencies and known limitations
---

# DVE pipeline environment quirks

- Python deps (`yt-dlp`, `faster-whisper`) must be installed via plain `pip` — the managed package installer fails trying to write into a protected Nix store path. They are recorded in `requirements.txt`, but persistence across environment rebuilds is unverified; if verification jobs fail at download/transcribe steps after a rebuild, reinstall with pip first.
- **Why:** cost a debugging cycle when the transcribe step errored with "engine not fully configured"-style failures that were really missing binaries/OpenAI env vars.
- OpenAI access goes through the Replit AI Integrations proxy (env vars auto-provisioned); the pipeline's claim labels (DOCUMENTED/CONTESTED/SPECULATIVE/REFUTED/UNVERIFIABLE) are deliberately separate from Physical Evidence case statuses.
- Known Phase 1 limitations (accepted, not bugs): source URLs come from the LLM unverified, jobs run in-process and die on server restart, no rate limiting.
