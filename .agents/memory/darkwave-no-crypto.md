---
name: DarkWave public site — no crypto language
description: Public-facing DarkWave site must stay free of crypto/blockchain/token/presale language
---

# DarkWave public site: no cryptocurrency language

The user removed all cryptocurrency, token, presale, blockchain, DeFi, NFT, and wallet language from the public-facing darkwavestudios.io site (DarkWaveStudiosLLC repo).

**Why:** Deliberate repositioning decision (August 2026) — the company presents as deterministic trust/verification infrastructure, not a crypto ecosystem. This matters for investor-facing credibility.

**How to apply:**
- Any new public-facing copy for DarkWave properties should use "trust infrastructure", "verification", "cryptographic proof-of-state" — never blockchain/token/crypto framing.
- Legitimate security terms (cryptographic hashing, signatures, encryption, zero-knowledge) are fine and were intentionally preserved.
- Cleanup covered only pages routed in client/src/App.tsx plus public static assets. Many UNROUTED page files still contain heavy crypto content (TrustLayerHub, Developers, GuardianAI*, AffiliateDashboard, Ecosystem*) — if any of these are ever re-routed, they must be cleaned first.
- Backend Coinbase Commerce code (webhook handlers, schema fields) still exists; only the UI was removed.
