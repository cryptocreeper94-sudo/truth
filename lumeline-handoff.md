# LumeLine — Fix Handoff

**Repo:** Cryptocreeper94-sudo/lumeline  
**Live app URL:** https://lumeline.bet  
**Ecosystem subdomain:** https://lumeline.tlid.io (to be configured — not yet pointing to this app)  
**Date:** March 26, 2026  
**Commits:** 67  
**Purpose:** Real-time sports odds intelligence platform tracking 47+ oddsmakers across 16+ sports. Detects line manipulation and collusion, generates ML-weighted consensus predictions, scores source accuracy, includes a full betting wallet, and has an AI voice assistant (Lume Agent). King Capper is the featured partner with a 50/50 revenue split and 5% monthly residual equity.

> **Note on ML Improvements:** A separate, exhaustive document — `lumeline-ml-improvements.md` — covers the 10 algorithmic improvements to the consensus engine (CLV weighting, temporal decay, delta scoring, anomaly modulation, multi-market fusion, personal calibration, confidence bands, sport-specific calibration, consensus history, GPT reasoning). Consensus.js is already on v0.2.0 with P1/P5/P6 implemented. That doc is the authoritative reference for algorithm work. This handoff covers everything else.

---

## What It Is

- **Odds engine:** Tracks 47+ oddsmakers, scores each source (sharp/reliable/neutral/fade tiers), calculates CLV, consistency, timing accuracy
- **Anomaly detection:** 4 detectors — Sync Move, Reverse Steam, Cascade Tracker, House Divergence — running via `server/anomaly.js`
- **House Decoder Engine v0.2.0:** 5 signals — sharp vs. recreational divergence, total mismatch, public bait line, inflection point, reverse indicator (`server/house-decoder.js`)
- **ML Consensus Engine v0.2.0:** Weighted ensemble with CLV, temporal decay, delta scoring (`server/consensus.js`)
- **Betting Wallet:** Full CRUD for bets, parlays (SGP), sportsbook tracking, live bets, promos, screenshot OCR, email parsing (`server/bets.js` + `bets.html`)
- **Lume Agent:** OpenAI-powered side-tab assistant with ElevenLabs TTS voice (`server/agent.js`)
- **Auth:** Custom auth with plan gating (`server/auth.js` — `requireAuth`, `requirePlan`, Pro at $9.99/mo Early Bird) + Trust Layer SSO (`server/trustLayerSSO.js`)
- **Notifications:** Twilio SMS alerts — consensus alerts, anomaly alerts, daily summary (`server/notifications.js`)
- **PWA / Play Store:** Service worker, manifest, TWA assetlinks in `.well-known/` for Android Play Store readiness
- **Featured partner:** King Capper — sharp tier, 8-2 last 10, 71% win rate, 5-game streak (tracked in DB)
- **Outcome evaluation:** `server/outcomes.js` — auto-resolves bets against final scores

---

## Priority 1 — Subdomain Wiring (Pending)

### 1.1 lumeline.tlid.io subdomain not yet pointed at this app

The production app lives at `https://lumeline.bet`. The `lumeline.tlid.io` ecosystem subdomain is not yet configured — currently serving the Trust Layer hub. This is a known pending task, not a bug.

**When ready:** Point `lumeline.tlid.io` at the same Render deployment as `lumeline.bet`. No code changes required — purely a DNS/deployment routing task.

Also confirm the Lume Agent system prompt is updated to reference `lumeline.bet` as the canonical URL if it isn't already.

---

## Priority 2 — Security

### 2.1 One-time migration runs on every server start

**File:** `server/server.js`

```js
db.query(`UPDATE sources SET name = 'King Capper', slug = 'king-capper' WHERE slug = 'mathew'`)
  .then(r => { if (r.rowCount) console.log('✅ Renamed Mathew → King Capper'); })
  .catch(() => {});
```

This runs on every server boot. After the first successful run it's a no-op, but it fires a DB write on every restart and silently swallows errors. If `migration_rename_mathew.sql` has already been applied to production, this line should be removed entirely.

**Fix:** Delete this block from `server.js`. The rename belongs in the migration file only.

---

### 2.2 Trust Layer SSO — verify session token is stored

**File:** `server/trustLayerSSO.js`

The SSO endpoint returns `sessionToken: crypto.randomBytes(48).toString('hex')` but it needs to be confirmed that this token is actually persisted to the database so `requireAuth` in `server/auth.js` can validate it on subsequent requests. The same gap exists in SignalCast and was flagged there.

**Fix:** Trace the session token flow:
1. `trustLayerSSO.js` generates token → is it written to a `sessions` table?
2. `requireAuth` reads token from header → is it checking the DB?
3. If either step is missing, add it. SSO login without a stored session is a one-way door.

---

### 2.3 Confirm all database migrations have been applied to production

**Directory:** `db/`

There are 7 migration files:
- `schema.sql` — base schema
- `migration_bets.sql` — user_bets, user_sportsbooks
- `migration_bets_v2.sql` — bet_legs, parlay_type, promo, live_bet
- `migration_consensus_v2.sql` — consensus history
- `migration_outcomes.sql` — outcomes tracking
- `migration_rename_mathew.sql` — King Capper rename
- `house_decoder_schema.sql` — decoder_signals table

If these haven't all been run in order on the production database, entire feature sets (bet legs, outcome resolution, decoder signals) will fail silently.

**Fix:** Run each migration file against production in the order listed above. Confirm by checking that `decoder_signals`, `bet_legs`, and `consensus` tables exist with the expected columns. Then remove the runtime rename query from `server.js` (see 2.2).

---

## Priority 3 — External API Dependencies (Confirm All Are Working)

LumeLine has 4 external API dependencies beyond the odds sources. Each requires env vars that may or may not be set on the production server.

### 3.1 OpenAI (Lume Agent)

**File:** `server/agent.js`

Required env var: `OPENAI_API_KEY`

The agent uses lazy initialization:
```js
if (!openai && process.env.OPENAI_API_KEY) { openai = new OpenAI(...) }
```
If the key is missing, all agent requests will fail silently (no OpenAI instance created, no error thrown until a request comes in).

**Fix:** On startup, log `✅ Lume Agent: OpenAI ready` or `⚠️ Lume Agent: OPENAI_API_KEY missing — agent disabled`. At minimum add a health check endpoint that reports the agent status.

---

### 3.2 ElevenLabs (Lume Agent Voice)

**File:** `server/agent.js`

Required env var: `ELEVENLABS_API_KEY`

TTS voice is a premium differentiator of the Lume Agent. If missing, the voice feature silently fails and users only get text responses.

**Fix:** Same pattern as OpenAI — log status on startup, expose in health check.

---

### 3.3 Twilio (SMS Alerts)

**File:** `server/notifications.js`

Required env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

`initTwilio` is called from `server.js`. If any of these are missing, SMS alerts (consensus alerts, anomaly alerts, daily summary) fail for all Pro subscribers who have SMS enabled.

**Fix:** In `initTwilio`, if any credentials are missing log a clear warning and set a `twilioEnabled = false` flag. Check that flag before calling `sendConsensusAlert` etc. so failures don't surface as unhandled errors.

---

### 3.4 OCR / Email Parsing for Bet Slip Import

**File:** `server/bets.js`

The bet wallet supports screenshot OCR and email parsing for automated bet import. This likely calls OpenAI Vision (gpt-4o) for OCR. Confirm:
- Which model is being called for OCR?
- Is there a fallback if OCR fails?
- Email parsing: what email source is used? Is there a webhook, IMAP polling, or manual paste?

**Fix:** Document these two import paths clearly in comments in `bets.js`. If email parsing requires a configured email address or inbox forwarding, that needs to be set up and documented.

---

## Priority 4 — King Capper Partnership Integrity

### 4.1 Partner stats should come from the DB, not be hardcoded

**Observed on live site:** King Capper shows "8-2 Last 10 · 71% Win Rate · 🔥 5 Streak"

If these numbers are hardcoded in the HTML or fetched from a static source, they create a legal and trust risk — especially given the 50/50 revenue deal described in `lumeline_handoff_for_mathew.md`.

**Fix:** Confirm these stats are:
1. Calculated from actual `picks` or `outcomes` records in the DB for the `king-capper` source slug
2. Updated automatically when `evaluateOutcomes` runs
3. NOT manually entered anywhere in the frontend

If they're manually entered, wire them to real DB queries immediately.

---

### 4.2 Revenue tracking for the 50/50 split

**File:** `lumeline_handoff_for_mathew.md`

The partnership includes 50/50 on LumeLine revenue and 5% monthly residual equity. There is no visible revenue tracking or partner payout dashboard in the codebase.

**Fix (longer term):** Add a partner revenue view accessible to King Capper that shows monthly subscription revenue, their 50% share, and cumulative equity accrual. This doesn't need to be complex — a read-only dashboard pulling from Stripe revenue data is sufficient.

---

## Priority 5 — Feature Completeness Audit

### 5.1 Outcome evaluation — confirm it runs on a schedule

**File:** `server/outcomes.js`, `server/server.js`

`evaluateOutcomes` needs to run periodically to resolve pending bets and update source accuracy scores. If it's only called manually or on a one-off trigger, outcome resolution will fall behind and the source leaderboard will become stale.

**Fix:** Confirm a cron job or interval is calling `evaluateOutcomes` regularly. If not, add a scheduled interval in `server.js` (e.g., every 2 hours) using `setInterval` or a proper cron library.

---

### 5.2 ML improvements from v0.2.0 — verify which of the 10 are live

The `lumeline-ml-improvements.md` doc lists 10 improvements. From reading `consensus.js`, the following are confirmed implemented:
- ✅ P1: CLV as primary weight
- ✅ P5: Line movement delta scoring  
- ✅ P6: Temporal decay weighting

The following still need to be verified against the actual code:
- ❓ P2: Anomaly type modulation (not just counting)
- ❓ P3: Multi-market fusion (spread + moneyline cross-check)
- ❓ P4: Personal calibration loop (user_ml_profile table)
- ❓ P7: Confidence bands (range, not single number)
- ❓ P8: Sport-specific calibration
- ❓ P9: Consensus history and trend tracking
- ❓ P10: GPT reasoning for high-confidence picks

**Fix:** Read the full `generateConsensus` function in `consensus.js` and check each of the 10 points. Mark each as DONE or TODO. For any that are TODO, follow the implementation plan in `lumeline-ml-improvements.md`.

---

### 5.3 `user_ml_profile` table — confirm it exists in production schema

The personal calibration loop (P4 from the ML doc) requires a `user_ml_profile` table. Confirm this is in `db/schema.sql` or a migration, and that the `/api/bets/recalculate-profile` endpoint exists and is called after bet settlement.

---

### 5.4 AI guardrails — confirm they're wired to the agent

**File:** `server/ai-guardrails.js`

This file was added alongside the Lume Agent. Confirm:
- Are guardrails applied to every agent request (not just some)?
- Does it block responses that give specific bet recommendations in high-liability situations?
- Is it consistent with the responsible gaming content in `responsible-gaming.html`?

---

## Priority 6 — Housekeeping

### 6.1 README is the Vite boilerplate

Same pattern as every other repo. The README says "React + TypeScript + Vite." Replace with actual product documentation including the env var list, local dev setup, DB migration order, and sport API integration notes.

---

### 6.2 `lume.config.json` and `index.lume` — clarify their role

The initial commit was "LumeLine - Odds Intelligence Platform built in Lume" — with a `lume.config.json` and `server/index.lume` file. The repo has since moved to standard JS. Confirm:
- Is `lume.config.json` still used by anything?
- Is `server/index.lume` still needed or is it a dead artifact from the original Lume framework?

If they're unused, delete them. Orphaned config files in root are noise.

---

### 6.3 No tests — 67 commits

The anomaly detection, consensus engine, house decoder, and outcome evaluation are the most important algorithmic components of the entire app. Zero test coverage across all of them.

Minimum test targets:
- `detectSyncMoves` in `anomaly.js` — unit test the 5-minute window logic
- `calculateWeightedVotes` in `consensus.js` — verify CLV and delta weighting produce expected outputs
- `decodeGame` signals in `house-decoder.js` — verify each of the 5 signal detectors fires correctly
- `evaluateOutcomes` — verify win/loss/push resolution against known final scores

---

## File Map (Key Files)

| File | Purpose |
|---|---|
| `server/server.js` | Express entry — all routes mounted, scheduler started, Twilio initialized |
| `server/ingestion.js` | Odds data ingestion from external sources |
| `server/consensus.js` | ML Consensus Engine v0.2.0 — weighted prediction |
| `server/scoring.js` | Source accuracy scoring, tier assignment, CLV calculation |
| `server/anomaly.js` | 4 anomaly detectors — sync, reverse steam, cascade, divergence |
| `server/house-decoder.js` | House Decoder Engine v0.2.0 — 5 signals |
| `server/house-accuracy.js` | House report card, fade targets, sharp books |
| `server/over-under.js` | O/U trend analysis |
| `server/outcomes.js` | Outcome evaluation — resolves bets, updates source accuracy |
| `server/bets.js` | Betting Wallet API — CRUD, parlays, OCR, email parsing |
| `server/auth.js` | Auth middleware — `requireAuth`, `requirePlan`, plan pricing |
| `server/trustLayerSSO.js` | Trust Layer SSO with circuit breaker (3 failures, 60s cooldown, 5s timeout) |
| `server/agent.js` | Lume Agent — OpenAI + ElevenLabs TTS |
| `server/ai-guardrails.js` | Agent safety guardrails |
| `server/notifications.js` | Twilio SMS — consensus, anomaly, daily summary |
| `server/sport-config.js` | Per-sport calibration config |
| `db/schema.sql` | Base schema |
| `db/migration_bets.sql` | Bets wallet tables |
| `db/migration_bets_v2.sql` | Bet legs, parlay support |
| `db/house_decoder_schema.sql` | Decoder signals table |
| `index.html` | Main app — sports screener, consensus meter, source leaderboard |
| `bets.html` | Betting wallet UI |
| `dashboard.html` | User dashboard |
| `lumeline_handoff_for_mathew.md` | King Capper partnership terms — 50/50 revenue + 5% equity |
| `mascot_handoff.md` | 3D Pixar-style mascot asset instructions |

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 1.1 | lumeline.tlid.io subdomain not yet wired — DNS/routing task only | LOW | PENDING |
| 2.1 | One-time DB migration running on every server boot | MEDIUM | OPEN |
| 2.2 | SSO session token — verify it's persisted and validated | HIGH | OPEN |
| 2.3 | 7 DB migrations — confirm all applied to production in order | HIGH | OPEN |
| 3.1 | OpenAI key — no startup validation or health status logging | MEDIUM | OPEN |
| 3.2 | ElevenLabs key — no startup validation | MEDIUM | OPEN |
| 3.3 | Twilio — no graceful degradation if credentials missing | MEDIUM | OPEN |
| 3.4 | OCR/email bet import — pipeline undocumented | MEDIUM | OPEN |
| 4.1 | King Capper stats — must come from DB, not be hardcoded | HIGH | OPEN |
| 4.2 | No revenue tracking dashboard for 50/50 partner split | LOW | OPEN |
| 5.1 | Outcome evaluation — confirm it runs on a schedule | HIGH | OPEN |
| 5.2 | 7 of 10 ML improvements from the doc are unverified | HIGH | OPEN |
| 5.3 | user_ml_profile table — confirm it exists in production | MEDIUM | OPEN |
| 5.4 | AI guardrails — confirm wired to every agent request | MEDIUM | OPEN |
| 6.1 | README is Vite boilerplate | LOW | OPEN |
| 6.2 | lume.config.json / index.lume — likely dead artifacts | LOW | OPEN |
| 6.3 | Zero tests across 67 commits | LOW | OPEN |

---

## Cross-Reference

For all algorithmic improvements to the ML consensus engine, see:  
**`lumeline-ml-improvements.md`** — covers CLV weighting, temporal decay, anomaly modulation, multi-market fusion, personal calibration loop, confidence bands, sport calibration, consensus history, and GPT reasoning (10 improvements total, P1/P5/P6 confirmed in v0.2.0).
