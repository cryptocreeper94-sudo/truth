# SignalCast — Fix Handoff

**Repo:** Cryptocreeper94-sudo/signalcast  
**Live site:** https://signalcast.tlid.io  
**Date:** March 26, 2026  
**Purpose:** SignalCast is the marketing automation backbone for the entire DarkWave/TrustLayer ecosystem. It posts hourly content across 9 social platforms (X/Twitter, Facebook, Instagram, Discord, Telegram, LinkedIn, Reddit, Pinterest, Nextdoor) on behalf of 15 ecosystem tenants. It includes Trust Layer SSO, Stripe subscriptions, an affiliate/referral system, hallmarks (SC-*), a composer, rules engine, templates, campaigns, and analytics views.

---

## What It Is

- **Ecosystem-wide social scheduler:** Posts hourly 6am–10pm CST, rotating across 15 tenants — darkwave, dwtl, pulse, tlid, tradeworksai, paintpros, tldriverconnect, garagebot, trustshield, lotopspro, vedasolus, brewboard, orbitstaffing, orbycommander, strikeagent
- **9 platform connectors:** X/Twitter (OAuth 1.0a), Facebook + Instagram (Graph API v21.0), Discord, Telegram, Nextdoor, LinkedIn, Reddit, Pinterest
- **Server:** Express + Drizzle ORM + PostgreSQL + multer (image upload)
- **Auth:** Trust Layer SSO with circuit breaker (threshold 3, 60s cooldown, 5s timeout)
- **Payments:** Stripe subscription + webhook handler
- **Ecosystem integrations:** Hallmark routes (SC-*), affiliate/referral, ecosystem status API
- **Frontend views:** Command Center, Compose, Setup Wizard, Rules Engine, Templates, Campaigns, Analytics, Pricing

---

## Priority 1 — Broken / Empty Right Now

### 1.1 Zero platforms connected — the engine is running but posting to nothing

**Observed on live site:** "⚡ Platform Health: 0/9 connected" — every platform shows "Set Up →". The scheduler is confirmed RUNNING but has nothing to post to.

This is not a bug in the code — it means no API credentials have been configured in the live database. However, this is the most important thing to fix operationally before any real posting happens.

**Fix:** The agent needs to walk through the Setup Wizard for each platform and enter real credentials:
- **X/Twitter:** API Key, API Secret, Access Token, Access Token Secret
- **Facebook/Instagram:** Meta system user token + Page IDs per tenant
- Each tenant in `ECOSYSTEM_TENANTS` can have its own `metaIntegrations` row

---

### 1.2 Nine of fifteen tenant URLs point to a generic fallback

**File:** `server/scheduler.ts`

In `TENANT_URLS`, the following 9 tenants all resolve to `https://dwsc.io/welcome`:
`pulse`, `tldriverconnect`, `garagebot`, `lotopspro`, `vedasolus`, `brewboard`, `orbitstaffing`, `orbycommander`, `strikeagent`

If the scheduler runs and posts for any of these tenants, every post links back to the same generic page instead of the correct product URL.

**Fix:** Update `TENANT_URLS` with each tenant's real URL. For tenants that don't have a live site yet, either point to the closest working equivalent or skip them in the rotation until their site is live.

---

### 1.3 X/Twitter rate limit workaround is fragile

**File:** `server/scheduler.ts`

```ts
let xPostsThisSession = 0;
const MAX_X_POSTS_PER_RESTART = 1;
```

Twitter/X posting is capped at 1 post per server restart. This is a workaround for hitting the free-tier rate limit. Every time the server restarts (deploy, crash, scale event), the counter resets and another X post fires.

**Fix (short-term):** Persist `xPostsThisSession` to the database so it survives restarts. Use a rolling 15-minute or daily window.  
**Fix (long-term):** Upgrade to a Twitter/X API tier that supports the required post volume, or implement a proper per-tenant daily cap stored in the DB.

---

## Priority 2 — Security

### 2.1 Session token returned from SSO is never stored — auth is stateless in a bad way

**File:** `server/trustLayerSSO.ts`

The SSO login endpoint returns:
```ts
sessionToken: crypto.randomBytes(48).toString('hex')
```
This token is generated and returned but never written to any database or cache. There is no endpoint that validates it on subsequent requests. Any route that tries to use this token to verify identity cannot — there's nothing to check it against.

**Fix:** After generating the session token, write it to the database (or a Redis/in-memory cache with TTL) alongside the user's email and Trust Layer ID. Add a `/api/auth/me` endpoint that looks up the token and returns the current user.

---

### 2.2 No authentication middleware on any API routes

**File:** `server/index.ts`

All API routes — including posting, scheduling, image upload, and platform configuration — are open with no session validation. Any request that knows the endpoint can trigger a post, modify rules, or upload images.

**Fix:** Add an `authenticate` middleware that reads the session token from the `Authorization` header or a cookie, looks it up in the DB (once 2.1 is fixed), and blocks unauthenticated requests with 401.

---

### 2.3 Unreachable log statement after `res.json()` in SSO

**File:** `server/trustLayerSSO.ts`

```ts
res.json({ success: true, ... });
console.log(`[TL SSO] ${APP_SLUG}: Verified user ${ecosystemUser.email}`);
```

The `console.log` after `res.json()` never executes — the function returns after sending the response. All SSO verifications are silently unlogged.

**Fix:** Move the `console.log` to before `res.json()`.

---

### 2.4 Meta OAuth tokens stored in DB — confirm access is restricted

**File:** `server/scheduler.ts` — calls `db.select().from(metaIntegrations)`

Facebook and Instagram page access tokens (long-lived) are stored in the `metaIntegrations` table. Confirm:
- The database is not accessible from the public internet
- No API endpoint exposes `metaIntegrations` rows directly
- Tokens are rotated on a schedule (Meta long-lived tokens expire in 60 days)

---

## Priority 3 — Product Quality

### 3.1 Platform connector coverage is unverified

**File:** `server/connectors.ts`

The X/Twitter connector (OAuth 1.0a) and Facebook/Instagram connector (Graph API) are clearly implemented. The remaining 6 connectors — **Discord, Telegram, Nextdoor, LinkedIn, Reddit, Pinterest** — need to be verified.

**Fix:** For each connector, check:
- Is the connector class implemented or is it a stub/placeholder?
- Does `post(content, imageUrl?)` actually call the platform API?
- Are the required env vars documented?

Mark any stub connectors as `NOT IMPLEMENTED` in the Setup Wizard UI so the user isn't misled.

---

### 3.2 Campaigns, Analytics, Rules, Templates — confirm not empty shells

**Files:** `src/views/CampaignsView.tsx`, `src/views/AnalyticsView.tsx`, `src/views/RulesView.tsx`, `src/views/TemplatesView.tsx`

These views were added in the v2.0 commit. Verify each one:
- Does it load real data from the database?
- Does it have working create/edit/delete flows?
- Or is it a designed shell with no backend wiring?

If any are shells, label them as "Coming Soon" in the nav so users don't land on broken pages.

---

### 3.3 Presale banner on an operations tool is confusing UX

**Component:** `src/components/PresaleBanner.tsx`

The live site shows a prominent "Signal Charging $0.001→$0.01 at TGE 10×" presale banner at the top of the control panel. This mixes a marketing/investment pitch into what should be a focused operations tool.

**Fix:** Gate the presale banner behind a role check — show it only to non-subscribed/external users, not to operators already using the system. Or move it to the Pricing view only.

---

### 3.4 Hero slideshow on the command center

**Component:** `src/components/HeroSlideshow.tsx`

A 5-slide marketing carousel with a world map image appears on what is an authenticated operations dashboard. This is a marketing element that likely belongs on a public landing page, not inside the control panel.

**Fix:** Move the HeroSlideshow to a public landing/splash route. The Command Center should open directly to the scheduler status, recent deploys, and platform health.

---

### 3.5 EcosystemAccountHub — affiliate bonus rotation needs backend validation

**Component:** `src/components/EcosystemAccountHub.tsx`  
**Last commit:** "Account Hub V2 - premium design, rotating affiliate bonuses"

The Account Hub shows rotating affiliate bonuses. Confirm that:
- Bonus amounts are pulled from the database, not hardcoded in the component
- Referral attribution is properly tracked server-side
- Stripe is correctly wired to subscription fulfillment (not just checkout creation)

---

## Priority 4 — Housekeeping

### 4.1 README is the Vite template boilerplate

Same pattern as every other repo. Replace with:
- What SignalCast does
- Setup guide (env vars for each platform, DB setup, Stripe keys)
- How to add a new tenant to the rotation
- Scheduler cadence documentation

### 4.2 No tests — 15 commits

The scheduler logic (tenant rotation, rate limit protection, token refresh) is the highest-risk code and has zero test coverage.

---

## File Map (Key Files)

| File | Purpose |
|---|---|
| `server/index.ts` | Express entry — all routes, middleware, multer, static serving |
| `server/scheduler.ts` | Ecosystem scheduler — tenant rotation, hourly posting, Facebook/X posting |
| `server/connectors.ts` | Platform connectors — Twitter OAuth 1.0a, Facebook Graph API, others |
| `server/trustLayerSSO.ts` | Trust Layer SSO with circuit breaker + timeout — **session token not persisted** |
| `server/stripe.ts` | Stripe checkout + webhook handler |
| `server/db.ts` | Drizzle ORM database connection |
| `server/hallmarkRoutes.ts` | SC-* hallmark registration/verification |
| `server/affiliateRoutes.ts` | Affiliate referral tracking |
| `server/ecosystemRoutes.ts` | Ecosystem status API |
| `src/App.tsx` | Router — 8 views, scheduler status polling |
| `src/views/CommandCenter.tsx` | Main dashboard — deploys, platform health, scheduler status |
| `src/views/ComposerView.tsx` | Post composer — drag-and-drop image upload |
| `src/views/SetupWizard.tsx` | Platform credential setup |
| `src/views/RulesView.tsx` | Automation rules engine |
| `src/views/TemplatesView.tsx` | Content template library |
| `src/views/CampaignsView.tsx` | Campaign management |
| `src/views/AnalyticsView.tsx` | Deploy analytics |
| `src/views/PricingView.tsx` | Stripe pricing/upgrade |
| `src/components/EcosystemAccountHub.tsx` | Account Hub with affiliate bonuses |
| `src/components/PresaleBanner.tsx` | Presale banner — should be gated |
| `shared/schema.ts` | Drizzle schema — all tables |

---

## Ecosystem Tenants & Current URL Status

| Tenant | URL Status |
|---|---|
| darkwave | ✅ https://dwsc.io/welcome |
| dwtl | ✅ https://dwtl.io/welcome |
| tlid | ✅ https://tlid.io |
| tradeworksai | ✅ https://tradeworksai.com |
| paintpros | ✅ https://paintpros.io |
| trustshield | ✅ https://trustshield.tech |
| pulse | ⚠️ Needs real URL (currently points to dwsc.io/welcome) |
| tldriverconnect | ⚠️ Needs real URL |
| garagebot | ⚠️ Needs real URL |
| lotopspro | ⚠️ Needs real URL |
| vedasolus | ⚠️ Needs real URL |
| brewboard | ⚠️ Needs real URL |
| orbitstaffing | ⚠️ Needs real URL |
| orbycommander | ⚠️ Needs real URL |
| strikeagent | ⚠️ Needs real URL |

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 1.1 | 0/9 platforms connected — no credentials in DB | CRITICAL | OPEN |
| 1.2 | 9/15 tenant URLs point to generic fallback | HIGH | OPEN |
| 1.3 | X/Twitter rate limit cap resets on every server restart | HIGH | OPEN |
| 2.1 | Session token from SSO is never stored — no real auth state | HIGH | OPEN |
| 2.2 | No auth middleware on any API route | HIGH | OPEN |
| 2.3 | Unreachable console.log after res.json() in SSO | LOW | OPEN |
| 2.4 | Meta OAuth tokens in DB — confirm access is restricted | MEDIUM | OPEN |
| 3.1 | 6 platform connectors unverified — may be stubs | HIGH | OPEN |
| 3.2 | Campaigns/Analytics/Rules/Templates — confirm not empty shells | MEDIUM | OPEN |
| 3.3 | Presale banner shown inside operator control panel | LOW | OPEN |
| 3.4 | Hero slideshow on the command center dashboard | LOW | OPEN |
| 3.5 | Affiliate bonus rotation — validate backend tracking | MEDIUM | OPEN |
| 4.1 | README is Vite boilerplate | LOW | OPEN |
| 4.2 | Zero tests | LOW | OPEN |
