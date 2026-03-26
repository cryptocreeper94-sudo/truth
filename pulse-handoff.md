# DarkWave Pulse — Fix Handoff

**Repo:** Cryptocreeper94-sudo/pulse  
**Live domain:** https://darkwavepulse.com  
**Date:** March 26, 2026  
**Commits:** 1,759 — second most in the ecosystem  
**Last push:** 17 hours ago (Add missing ecosystem modules)  
**Purpose:** AI-powered crypto trading and analysis platform. ML prediction engine (100K+ predictions tracked), StrikeAgent token sniper bot, autonomous trading (Jupiter swap + Jito MEV), custom HD wallet (23 chains), Phantom/Solflare integration, TradingView charts, Fear & Greed index, coin safety scoring (honeypot/rug detection), Telegram Mini App, DWAV token smart contract (Anchor/Rust), Firebase auth, developer API with key management and billing, Stripe subscriptions ($20/month).

**Stack:** Mastra AI agent framework · React 19 + Vite 7 (darkwave-web/) · Node.js · Drizzle ORM + PostgreSQL · Firebase · Solana (Helius RPC, Jito, Squads multisig) · ethers.js (EVM) · Inngest (background jobs) · Python (image processing) · Rust/Anchor (smart contract)

---

## 🚨 Act On This Right Now — Before Anything Else

### WEBHOOK SECRET IS EXPOSED IN A PUBLIC GITHUB REPO

**File:** `PULSE_TECHNICAL_HANDOFF.md` (public repo, readable by anyone)

```
WEBHOOK SECRET: 97c05418d9e0caf5f786915590e7991855d7224380a2f1f6a70659828c85fce6
```

This HMAC-SHA256 signing secret is used to validate inbound webhook payloads to `dwtl.io/api/webhooks/pulse`. Anyone who has read this file (it's in a public repo) can forge valid webhook signatures and inject arbitrary `new_signal`, `signal_outcome`, or `strike_alert` events into the Trust Layer.

**Fix — do this immediately, in order:**
1. Generate a new webhook secret: `openssl rand -hex 32`
2. Update `WEBHOOK_SECRET` in the Render environment for Pulse
3. Update the receiving endpoint at `dwtl.io` with the new secret
4. Redact `PULSE_TECHNICAL_HANDOFF.md` — remove the secret value, replace with `WEBHOOK_SECRET env var`
5. Force-push a redacted version of the file (or use `git filter-repo` to scrub the secret from git history — it's been public, so rotation is the priority, but history cleanup prevents future exposure)

---

## Priority 1 — Core Product Is Broken

### 1.1 Market data table never populates — frontend rendering bug

**File:** `URGENT_FIXES_NEEDED.md` (self-documented)  
**Location in code:** `darkwave-web/` `app.js` → `loadMarketData()` function (~line 326)

The market data table loads the "Loading..." state but never renders data. The backend API returns data correctly — this is a frontend JavaScript rendering bug. The `items` array isn't populating the table DOM.

This is the primary feature of the platform. Without the market data table, Pulse has no visible product.

**Fix:** Debug `loadMarketData()` — verify the API response shape matches what the table renderer expects. Check if the data response is paginated or wrapped in a nested key the renderer isn't unwrapping. Add a `console.error` on the fetch catch to surface any silent failures.

---

### 1.2 Charts never initialize — LightweightCharts not loading

**File:** `app.js` → `renderInlineChart()` (~line 467)

Chart containers render but remain empty. The `lightweight-charts` library (TradingView) is not initializing. This could be a load-order issue (script loading after the DOM tries to render charts), a version conflict, or a missing initialization call.

**Fix:** Confirm `lightweight-charts` is loaded before `renderInlineChart()` is called. Check browser console for `LightweightCharts is not defined` or similar. The React version in `darkwave-web/src` may be loading correctly while the legacy `app.js` version is not — verify which file is serving the live site.

---

### 1.3 Mobile is completely broken

**File:** `URGENT_FIXES_NEEDED.md`

Charts stretch off-screen, layout breaks on small viewports. The platform has a Telegram Mini App (`TelegramApp.jsx`) — Telegram is mobile-only. Mobile being broken means the Telegram integration is also broken.

**Fix:** Add `max-width: 100vw; overflow-x: hidden;` to chart containers. Add media queries for sub-768px viewports. Test on iPhone SE (375px) as the minimum baseline.

---

## Priority 2 — Security

### 2.1 Autonomous trading with real money — verify safeguards exist

**File:** `src/services/autonomousTradingService.ts`

The autonomous trading service executes real on-chain trades via Jupiter swap with Jito MEV protection. This runs as a background service. Confirm the following safeguards exist and are enforced:

- **Max trade size** — a hard cap on any single trade amount in SOL/USD
- **Daily loss limit** — if total losses exceed X in 24h, trading halts and alerts fire
- **Emergency kill switch** — a single API call or env var toggle that stops all autonomous trading immediately
- **Paper/demo mode gate** — the `demoTradeService.ts` exists, confirm autonomous trading cannot be triggered in demo mode

If none of these safeguards are in the code, autonomous trading should be disabled until they are. An AI agent making uncapped trades is a funds-loss risk.

---

### 2.2 Three auth systems may conflict

**Auth systems present:**
1. **Firebase** (`context/AuthContext.jsx`) — primary user auth
2. **Custom JWT / API keys** (`src/services/apiKeyService.ts`, `apiBillingService.ts`) — developer API access  
3. **Trust Layer SSO** (`src/services/trustLayerSSO.ts`) — ecosystem identity

Verify that session state from one system cannot be used to access routes gated by another. Specifically: a valid Firebase session should not bypass API key billing enforcement, and a Trust Layer SSO token should not grant developer API access without a separate API key.

---

### 2.3 DWAV token smart contract is unaudited

**Directory:** `contracts/dwav-token/programs/dwav-token/` (Anchor/Rust)

Per the MASTER-PROJECT-TRACKER (dated November 2024), the DWAV token deploy was planned for "Week 5" of the launch strategy. The contract is committed to the repo. No external audit is referenced in any document.

**Deploying an unaudited token contract to Solana mainnet is a financial and reputational risk.** Any vulnerability in the mint, burn, or transfer logic can be exploited immediately after launch.

**Fix:** Before mainnet deploy, get a third-party audit (OtterSec, Neodyme, or similar Solana-focused auditors). At minimum, run `cargo clippy` and the Anchor test suite on the contract and have a senior Rust/Solana dev review the mint authority and freeze authority handling.

---

## Priority 3 — Architecture

### 3.1 Pre-built Mastra output is committed — source and runtime can drift

**Files:** `.mastra/output/index.mjs` (committed), `scripts/render-start.sh`

The start script runs the committed `.mastra/output/index.mjs` directly:
```bash
if [ -f ".mastra/output/index.mjs" ]; then
  node .mastra/output/index.mjs
```

If agent code in `src/mastra/` is updated but the output isn't rebuilt and recommitted, the live server runs stale agents. There's no automatic check that the output matches the source.

**Fix:** Add a build step to `render-build.sh` that rebuilds the Mastra output from source (`mastra build`) instead of relying on the committed output. The committed output should be a safety net, not the primary deployment artifact. Remove `.mastra/output/` from version control and add it to `.gitignore` once the build step is reliable.

---

### 3.2 Two trade execution services — one is likely dead

**Files:** `src/services/tradeExecutionService.ts` AND `src/services/tradeExecutorService.ts`

Two files with near-identical names for what should be a single responsibility. Same pattern as the duplicate SSO files in OrbitStaffing. Determine which is active (check imports in `autoTradeService.ts` and `autonomousTradingService.ts`). Delete the unused one.

Same issue: `darkwave-chain-client.ts` AND `darkwaveChainClient.ts` — two DarkWave chain client files with different casing. One is likely dead.

---

### 3.3 Build script uses `--force` and `--legacy-peer-deps` as primary strategies

**File:** `scripts/render-build.sh`

```bash
npm install --legacy-peer-deps --ignore-scripts || npm install --legacy-peer-deps --force
```

`--force` overrides dependency resolution — it installs packages even when they have incompatible peer dependencies. This can cause silent runtime errors where two packages that claim compatibility actually aren't. This pattern appearing as the primary install strategy (not a last resort) suggests unresolved dependency conflicts in `package.json`.

**Fix:** Run `npm install` without flags locally and read the peer dependency warnings. Resolve them explicitly by pinning versions in `package.json` rather than suppressing the warnings with `--force`.

---

### 3.4 Python service (`main.py`) in a Node.js deployment

**Files:** `main.py`, `pyproject.toml`, `uv.lock`, `scripts/remove_backgrounds.py`

Python is used for image background removal. Render's Node.js runtime does not include Python by default. Confirm:
- Is `main.py` actually called by any active route?
- Does Render have Python installed in this service? (Check the Render build logs)
- If Python is needed, the `render.yaml` needs a Docker-based runtime or the Python calls need to be replaced with a Node.js library (`@imgly/background-removal`, `sharp`)

---

## Priority 4 — Repo Hygiene (Do Before Any Agent Works Here)

### 4.1 Committed junk files

The root of the repo contains files that should never be in version control:

| File | What It Is | Action |
|---|---|---|
| `nohup.out` | Linux process log | Delete + add to .gitignore |
| `sedcGeE5E` | Temp file from a failed `sed` command | Delete |
| `exports/` | Likely Replit export artifacts | Verify and delete or gitignore |
| `.upm/` | Replit package manager state | Delete + add to .gitignore |
| `.config/` | Replit config state | Delete + add to .gitignore |
| `dist/` | Build output committed to repo | Gitignore (or verify if intentional) |

---

### 4.2 "Saved progress at the end of the loop" — Replit agent state commits

Dozens of commits have the message "Saved progress at the end of the loop" or "Update agent state to..." — these are Replit agent auto-save commits, not meaningful development commits. The files they touch (`.config/`, `exports/`, etc.) are Replit internal state.

This history noise doesn't affect functionality but it means the actual development history is buried. Clean up the commit description going forward — every commit that touches real code should have a meaningful message.

---

### 4.3 REPLIT_SUPPORT_EMAIL.txt — AI agents were causing unexpected charges

**File:** `REPLIT_SUPPORT_EMAIL.txt` says "Disable AI agents and wallet features to prevent unexpected charges"

This was likely a billing overage incident on Replit. Now that Pulse is on Render, the concern shifts to:
- Claude/OpenAI API costs for the Mastra agents running continuously
- Inngest workflow invocation costs (if on a paid plan)
- Helius RPC costs (based on API calls volume)

Confirm there are cost alerts set up for each of these services. The autonomous trading agents + ML prediction scanner running 24/7 on Claude can generate significant API costs.

---

## What Needs Verification Before Calling Pulse "Production Ready"

| Feature | Status |
|---|---|
| Market data table | **BROKEN** — never populates |
| Charts | **BROKEN** — never initialize |
| Mobile layout | **BROKEN** |
| Autonomous trading safeguards | **UNVERIFIED** |
| Webhook secret | **EXPOSED — rotate immediately** |
| DWAV token contract audit | **NOT DONE** |
| Python service on Render | **UNVERIFIED** |
| Stripe subscriptions | Need to confirm payment → feature gate flow |
| Telegram Mini App | Mobile broken means this is also broken |
| ML prediction accuracy (70%+ claimed) | Need to verify numbers come from DB, not hardcoded |

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 0 | Webhook secret in public repo — rotate immediately | CRITICAL | **ACT NOW** |
| 1.1 | Market data table never populates | CRITICAL | OPEN |
| 1.2 | Charts never initialize | CRITICAL | OPEN |
| 1.3 | Mobile completely broken | HIGH | OPEN |
| 2.1 | Autonomous trading — verify loss limits and kill switch | CRITICAL | VERIFY |
| 2.2 | Three auth systems may conflict | MEDIUM | VERIFY |
| 2.3 | DWAV token contract unaudited | HIGH | OPEN |
| 3.1 | Pre-built Mastra output committed — source/runtime can drift | HIGH | OPEN |
| 3.2 | Duplicate trade execution + chain client services | MEDIUM | OPEN |
| 3.3 | Build uses --force as primary strategy — unresolved deps | MEDIUM | OPEN |
| 3.4 | Python service in Node.js Render deployment | MEDIUM | VERIFY |
| 4.1 | nohup.out, sedcGeE5E, .upm/, .config/ committed to repo | LOW | CLEAN |
| 4.2 | Replit agent state commits polluting history | LOW | ONGOING |
| 4.3 | AI agent API cost monitoring — set up cost alerts | MEDIUM | OPEN |
