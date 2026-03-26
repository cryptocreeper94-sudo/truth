# GuardianScreener — Fix Handoff

**Repo:** Cryptocreeper94-sudo/guardianscreener  
**Live site:** https://guardianscreener.tlid.io  
**Date:** March 26, 2026  
**Purpose:** Token screener with AI-scored Snipe/Watch/Avoid ratings, real-time WebSocket price feed, Strike Agent dashboard, candlestick charts, and DEX swap widget. Core data pipeline is live and working. This document lists what needs to be fixed, in priority order.

---

## What It Is

- Multi-chain token screener backed by DexScreener API (12 chains supported: Solana, Ethereum, BSC, Arbitrum, Polygon, Base, Avalanche, Fantom, Optimism, Cronos, Tron, zkSync)
- AI Snipe / Watch / Avoid recommendations with ML confidence score
- Guardian Score grading system (A/B/C) shown per token
- Strike Agent page — full dashboard with per-token safety reports, presets, watchlist, trade history
- Token detail page — candlestick chart (lightweight-charts / TradingView), live price via WebSocket
- DEX swap widget and QuickTradePanel for fast trades
- Subscription gate on premium features
- Server: Express + WebSocket + 9 pulse services in `server/services/pulse/`
- Frontend: React + Vite + wouter + React Query + shadcn/ui + Tailwind + Framer Motion

---

## Priority 1 — Broken Right Now

### 1.1 Chart data is hardcoded mock OHLCV — CRITICAL

**File:** `src/pages/token-detail.tsx`

The chart data fetch function generates **random fake candles** in memory. There is a comment in the code that explicitly says:

> "For now, generate mock OHLCV to demonstrate the TradingView chart integration. In production, this would call DexScreener's or BirdEye's history API."

Users clicking any token see fabricated price history. This is the most important feature on the detail page.

**Fix:** Call DexScreener's chart history endpoint:
```
GET https://api.dexscreener.com/latest/dex/candles/{chainId}/{pairAddress}?from={from}&to={to}&res={resolution}
```
Map resolution to the existing timeframe selector (1m, 5m, 15m, 1H, 1D). Replace the `chartQueryFn` mock data block entirely.

---

### 1.2 WebSocket connection is dead — "OFFLINE" showing on live site

**File:** `server/guardian-screener-ws.ts`, `src/hooks/use-guardian-screener-ws.ts`

The Guardian status indicator on the live site shows "OFFLINE". The WebSocket at `/ws/guardian-screener` is not staying connected on the deployed server. The entire real-time price feed is down.

**Fix:**
- Check the WS server setup in `server/guardian-screener-ws.ts` for connection error handling
- Check the client hook `use-guardian-screener-ws.ts` for reconnect logic — add exponential backoff if missing
- Verify the Render/deployment environment allows WebSocket upgrades on the same port as the HTTP server
- Add a connection health ping/pong to keep the socket alive

---

### 1.3 Rebrand incomplete — "GUARDIANSCANNER PRO" still in nav

The site was rebranded 6 hours ago (commit `5df3c13`) from Guardian Scanner to Guardian Screener, but the live nav still shows **"GUARDIANSCANNER PRO"**. 

**Fix:** Search all files for "GUARDIANSCANNER" and "Guardian Scanner" — replace with "GUARDIAN SCREENER" / "Guardian Screener". Redeploy.

---

## Priority 2 — Security

### 2.1 Review `backupVaultService.ts`

**File:** `server/services/pulse/backupVaultService.ts`

A vault backup service has no obvious reason to live inside a token screener. It needs to be understood before anything else:
- What data does it store and where?
- Does it touch wallet keys, credentials, or user data?
- If it's storing anything sensitive outside of the user's explicit consent, it must be removed or properly documented with disclosure

**Fix:** Read the file, document what it does in a comment block. If it stores sensitive data without user consent, remove it from this repo.

---

### 2.2 No rate limiting on API routes

**File:** `server/routes.ts`

`GET /api/guardian-screener/tokens` and `GET /api/guardian-screener/token/:chain/:address` hit DexScreener directly with no throttling or auth guard. A bot can hammer the server and exhaust the DexScreener rate limit for all users.

**Fix:** Add `express-rate-limit` middleware:
```ts
import rateLimit from 'express-rate-limit';
const apiLimiter = rateLimit({ windowMs: 60_000, max: 60 });
app.use('/api/', apiLimiter);
```

---

### 2.3 QuickTradePanel audit

**File:** `src/components/quick-trade-panel.tsx`

If this component actually submits trades on behalf of the user, confirm:
- Wallet signing is always done client-side (private key never leaves the browser)
- Slippage and priority fee settings are validated before submission
- The subscription gate correctly blocks unauthenticated users from this path

---

## Priority 3 — Product Quality

### 3.1 Token images — all showing DiceBear placeholder shapes

**Files:** `server/guardian-screener-service.ts` (where token data is assembled)

Every token shows a random DiceBear SVG shape instead of a real logo. DexScreener returns real token images in `pair.info.imageUrl` for most established tokens.

**Fix:** When assembling the `GuardianToken` object, set:
```ts
imageUrl: pair.info?.imageUrl ?? `https://api.dicebear.com/7.x/shapes/svg?seed=${pair.baseToken.symbol}`
```
Pass `imageUrl` through to the frontend token object and use it in the table row.

---

### 3.2 Multi-chain support not exposed in the UI

**File:** `src/pages/guardian-screener.tsx`

The service supports 12 chains but the live UI only shows Solana tokens with no chain switcher visible. All the backend infrastructure is built.

**Fix:** Add a chain selector dropdown (or tab strip) to the main screener page. Wire the `chain` query param to the `/api/guardian-screener/tokens?chain=` endpoint. Default to Solana.

---

### 3.3 Prediction tracking resets on every server restart

**Files:** `server/services/pulse/predictionTrackingService.ts`, `server/services/pulse/predictionLearningService.ts`

These services appear to store prediction history in memory (no database connection visible in the repo). Every deploy or server restart wipes all tracked prediction outcomes.

**Fix:** Connect to the existing storage layer (`server/storage.ts`) or add a lightweight SQLite/PostgreSQL write for prediction records. At minimum add file-based persistence so history survives restarts.

---

### 3.4 Price notation tooltip missing

**Observed on live site:** Prices display as `$0.0₄0.02` using Unicode subscript notation for leading zeros. This is unfamiliar to most users.

**Fix:** Add a small info icon (ℹ) next to any price using subscript notation with a tooltip explaining: *"The subscript number indicates how many leading zeros follow the decimal point."*

---

### 3.5 No loading skeletons

The token table goes blank while fetching. No skeleton states anywhere.

**Fix:** Use shadcn's `Skeleton` component to render a shimmer table placeholder during the initial load and on refetch.

---

### 3.6 Pulse services duplicated in this repo

**Directory:** `server/services/pulse/` (9 files)

The same pulse engine lives inside the standalone `pulse` repo. These will drift out of sync as both are developed independently.

**Fix (longer term):** Extract pulse services to a shared internal package or point guardianscreener at the pulse API over HTTP instead of importing the engine directly.

---

## Priority 4 — Housekeeping

### 4.1 README is the Vite boilerplate

**File:** `README.md`

The README is the default "React + TypeScript + Vite" template text. The repo has zero product documentation.

**Fix:** Replace entirely with:
- What GuardianScreener is
- How to run locally (`npm install`, env vars needed, `npm run dev`)
- Architecture overview (Express server + Vite client + WS)
- How the AI score is calculated (or a note that it's proprietary)
- Deployment notes (Render, port config)

---

### 4.2 No tests — 11 commits

Zero test files in the entire repo. At minimum the AI scoring logic and the DexScreener data mapping should be unit tested.

---

## File Map (Key Files)

| File | Purpose |
|---|---|
| `src/pages/guardian-screener.tsx` | Main screener table page |
| `src/pages/strike-agent.tsx` | Strike Agent dashboard (large — imports all sniper components) |
| `src/pages/token-detail.tsx` | Token detail with chart — **mock chart data lives here** |
| `src/components/sniper/candle-chart.tsx` | Candle chart component |
| `src/components/sniper/live-snipe-tracker.tsx` | Real-time snipe feed |
| `src/components/sniper/safety-report.tsx` | Per-token safety breakdown |
| `src/components/quick-trade-panel.tsx` | Trade submission UI |
| `src/components/subscription-gate.tsx` | Feature gating |
| `src/components/dex-swap-widget.tsx` | Embedded DEX swap |
| `server/guardian-screener-service.ts` | Core data service — DexScreener calls + AI scoring |
| `server/guardian-screener-ws.ts` | WebSocket real-time price feed |
| `server/guardian-screener-cache.ts` | In-memory cache (30s TTL for token list, 15s for detail) |
| `server/routes.ts` | API routes — only 2 endpoints currently |
| `server/services/pulse/safetyEngineService.ts` | Solana safety checks (honeypot, mint authority, freeze) |
| `server/services/pulse/evmSafetyEngine.ts` | EVM chain safety checks |
| `server/services/pulse/backupVaultService.ts` | **Unknown — needs review before touching anything else** |
| `server/hallmark.ts` | Hallmark module (also referenced in TrustGen — check for duplication) |

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 1.1 | Chart data is fake OHLCV | CRITICAL | OPEN |
| 1.2 | WebSocket OFFLINE on live site | CRITICAL | OPEN |
| 1.3 | "GUARDIANSCANNER PRO" still in nav | HIGH | OPEN |
| 2.1 | backupVaultService.ts — unknown, needs review | HIGH | OPEN |
| 2.2 | No rate limiting on API routes | HIGH | OPEN |
| 2.3 | QuickTradePanel security audit | MEDIUM | OPEN |
| 3.1 | All token images are DiceBear placeholders | MEDIUM | OPEN |
| 3.2 | Multi-chain UI not wired | MEDIUM | OPEN |
| 3.3 | Prediction history resets on restart | MEDIUM | OPEN |
| 3.4 | No tooltip for subscript price notation | LOW | OPEN |
| 3.5 | No loading skeletons | LOW | OPEN |
| 3.6 | Pulse services duplicated | LOW | OPEN |
| 4.1 | README is Vite boilerplate | LOW | OPEN |
| 4.2 | Zero tests | LOW | OPEN |
