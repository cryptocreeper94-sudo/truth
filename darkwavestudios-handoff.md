# DarkWave Studios — Fix Handoff

**Repos:** Two repos exist for this app — read carefully  
- `darkwavestudios` (Replit, original) — still live on Replit, has Replit-specific artifacts committed  
- `darkwave-studios` (Render, production) — `feat: DarkWave Studios — migrated from Replit` initial commit, deploying to `darkwavestudios.io`

**Live domain:** https://darkwavestudios.io  
**Date:** March 26, 2026  
**Purpose:** Corporate marketing and developer hub for the DarkWave Studios / Trust Layer ecosystem. Ecosystem catalog (37 apps), Lume language API and playground, Widget Marketplace, Signal Chat (WebSocket), blog, AI marketing scheduler, affiliate program, hallmark trust-stamping, Stripe and Coinbase Commerce payments, OrbitStaffing integration, TrustLink SSO.

**Stack:** React 19 + Vite (client) · Express 4 server · Drizzle ORM · Neon PostgreSQL · OpenAI · Stripe · Coinbase Commerce · Twilio · Passport.js + JWT · Twitter API · Framer Motion · Radix UI

---

## 🚨 Act On This Right Now

### Hallmark system is simulated — same as Trust Layer Hub

The `hallmark.ts` code is explicit:

```typescript
function simulatedTxHash(): string {
  return "0x" + randomBytes(32).toString("hex");
}

function simulatedBlockHeight(): string {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}
```

Every DS-XXXXXXXX hallmark generated on this platform has a fabricated `txHash` and `blockHeight`. These are random hex strings stored in Postgres and presented as blockchain records. The same issue exists in Trust Layer Hub (TH- prefix). This is an ecosystem-wide pattern — none of the hallmarks across any app have real on-chain provenance.

**The darkwavestudios.io/hallmark/:id/verify URL exists** — meaning users can visit a verification page that shows them a "blockchain transaction" that never happened.

---

### The same import is in `server/index.ts` twice

```typescript
import { registerTrustLayerSSO } from './trustLayerSSO';
// ... 15 lines of code ...
import { registerTrustLayerSSO } from './trustLayerSSO';
```

The `registerTrustLayerSSO` import appears at the top of `server/index.ts` and again mid-file. TypeScript will throw a compile error for a duplicate identifier in the same scope, or silently deduplicate — either way, it's a bug. The second import should be removed.

---

## Priority 1 — Two Repos, One Is Dead Weight

### 1.1 `darkwavestudios` (Replit repo) has Replit-specific junk committed

The `darkwavestudios` repo — the original Replit environment — has the following committed:
- `.cache/` — Replit package cache
- `.local/state/replit` — Replit state
- `.upm/` — Replit package manager state
- `.replit` — Replit config
- `stripe-replit-sync` in `package.json` — a Replit-specific Stripe sync package

This repo is the old environment. If the Replit instance is still running, it's running alongside the Render deployment — two live instances against possibly the same database, with one using `stripe-replit-sync` behavior that doesn't exist on Render.

**Decision needed:** Is the Replit instance still serving traffic? If `darkwavestudios.io` is pointed at Render, the Replit instance should be shut down or set to private. Running two live instances of a marketing site with different Stripe behaviors is a data consistency risk.

---

### 1.2 Two SSO files with different responsibilities — naming hides this

**File A:** `server/trustLayerSSO.ts` (new — added after migration)  
**File B:** `server/trustlayer-sso.ts` (original — from Replit migration)

These are actually NOT duplicates of the same function — they do different things:

- `trustLayerSSO.ts` → handles ecosystem-wide TrustLink login (token exchange with `dwtl.io`)
- `trustlayer-sso.ts` → handles **chat user auth** (bcrypt + JWT for the Signal Chat WebSocket)

Only `trustLayerSSO.ts` is imported in `server/index.ts`. The chat auth in `trustlayer-sso.ts` may also be imported somewhere in the chat route. The naming is nearly identical and confusing.

**Fix:** Rename `trustlayer-sso.ts` → `chat-auth.ts` to make the distinction obvious. The current naming makes anyone touching these files assume one is dead code.

---

### 1.3 Chat JWT secret falls back to a random value on each restart

**File:** `server/trustlayer-sso.ts`

```typescript
function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (!getJwtSecret._fallback) {
    getJwtSecret._fallback = crypto.randomBytes(64).toString("hex");
    console.warn("[Trust Layer SSO] No JWT_SECRET env var set, using generated secret (tokens will not survive restarts)");
  }
  return getJwtSecret._fallback;
}
```

If `JWT_SECRET` is not set in Render's environment variables, the JWT signing secret is random on every server start. Every deploy or restart invalidates all active chat sessions — every user in a chat session gets kicked out silently.

**Fix:** Verify `JWT_SECRET` is set in the Render env vars for `darkwave-studios`. It's listed in `render.yaml` as `sync: false`, meaning it won't auto-sync — it has to be manually set in the Render dashboard.

---

## Priority 2 — Security

### 2.1 Coinbase Commerce webhook secret needs verification

**File:** `render.yaml`

```yaml
- key: COINBASE_COMMERCE_WEBHOOK_SECRET
  sync: false
```

Coinbase Commerce sends payment webhooks to the server. Like Stripe, these need HMAC signature verification. If `COINBASE_COMMERCE_WEBHOOK_SECRET` is not set or the `webhookHandlers.ts` doesn't verify it, anyone can POST a fake payment confirmation to the webhook endpoint and trigger fulfillment without paying.

**Fix:** Verify `COINBASE_COMMERCE_WEBHOOK_SECRET` is set in Render and that `webhookHandlers.ts` verifies the signature before processing any fulfillment logic.

---

### 2.2 OpenAI called on a schedule via `marketing-scheduler.ts`

**File:** `server/marketing-scheduler.ts`

The marketing scheduler auto-generates AI content and schedules social posts using OpenAI. This runs continuously as part of the server. Confirm:
- Is there a daily/weekly cap on how many OpenAI calls the scheduler makes?
- What model is it using? GPT-4o on a high-frequency schedule can generate substantial API costs.
- What happens if the OpenAI API key is missing — does the scheduler fail silently and retry in a tight loop?

The same concern flagged for Pulse's Mastra agents applies here: AI running on a schedule with no cost cap is a billing risk.

---

### 2.3 Twitter API keys in render.yaml — confirm they're secrets, not values

**File:** `render.yaml`

```yaml
- key: TWITTER_API_KEY
  sync: false
- key: TWITTER_ACCESS_TOKEN
  sync: false
- key: TWITTER_ACCESS_TOKEN_SECRET
  sync: false
```

All three Twitter credentials are `sync: false`, meaning they must be manually set. If `social-connectors.ts` calls the Twitter API and any of these are missing or wrong, confirm the connector fails gracefully rather than throwing an unhandled exception that crashes the server.

---

## Priority 3 — Architecture

### 3.1 Render free tier — again

**File:** `render.yaml`

```yaml
plan: free
```

`darkwavestudios.io` is the corporate face of DarkWave Studios LLC. Free tier means cold starts, service spin-downs, and 30-60 second first-load delays for anyone visiting the site after a period of inactivity. A marketing site on a free hosting plan sends a message.

**Fix:** Upgrade to Render Starter ($7/month).

---

### 3.2 `memorystore` in dependencies — verify sessions are persistent

**File:** `package.json`

```json
"memorystore": "^1.6.7",
"connect-pg-simple": "^10.0.0",
```

Both an in-memory session store (`memorystore`) and a Postgres session store (`connect-pg-simple`) are in the dependencies. Check `server/index.ts` (the session middleware setup) to confirm which one is actually used. If `memorystore` is active:
- All user sessions are lost on every Render deploy
- On the free tier, where restarts happen frequently, users are logged out constantly

`connect-pg-simple` is the correct choice for a deployed Render app.

---

### 3.3 OrbitStaffing API dependency

**File:** `server/orbitClient.ts`

The DarkWave Studios server makes outbound calls to `orbitstaffing.io/api/ecosystem`. If OrbitStaffing is down or returns errors, those calls need to fail gracefully. Confirm the `orbitClient.ts` has timeouts set and error handling that doesn't propagate OrbitStaffing failures into DarkWave Studios page loads.

---

### 3.4 Ecosystem stats are manually updated in code

**Commits:**
- "fix: update ecosystem stats across all pages - 35→37 apps, 1.74M→1.86M+ lines of code, 12+→37 live apps"

The "37 apps" and "1.86M lines of code" stats are hardcoded values updated manually by commit. Same as the test count pattern across the ecosystem. Every time a new app is added, someone has to remember to update these numbers in the right places — and the commit history shows they frequently go stale.

**Fix:** Store ecosystem stats in the database and expose an admin endpoint to update them. The catalog is already in the DB — derive the app count from the actual rows rather than hardcoding it.

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 0 | Hallmark txHash/blockHeight are simulated — fake blockchain records | CRITICAL | OPEN |
| 0.1 | `registerTrustLayerSSO` imported twice in server/index.ts | HIGH | FIX NOW |
| 1.1 | Replit `darkwavestudios` repo may be live alongside Render deployment | HIGH | VERIFY/SHUT DOWN |
| 1.2 | Two SSO files with identical names but different purposes | MEDIUM | RENAME |
| 1.3 | Chat JWT falls back to random secret — all sessions lost on restart | HIGH | OPEN |
| 2.1 | Coinbase Commerce webhook signature verification — unverified | HIGH | VERIFY |
| 2.2 | OpenAI marketing scheduler running on schedule — no cost cap confirmed | MEDIUM | VERIFY |
| 2.3 | Twitter API keys — confirm graceful failure if missing | LOW | VERIFY |
| 3.1 | Render free tier on corporate marketing site | MEDIUM | UPGRADE |
| 3.2 | memorystore + connect-pg-simple both present — verify which is active | MEDIUM | VERIFY |
| 3.3 | OrbitStaffing outbound calls — verify timeout and graceful failure | LOW | VERIFY |
| 3.4 | Ecosystem stats hardcoded in source, go stale by commit | LOW | OPEN |
