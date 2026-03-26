# TrustHome — Fix Handoff

**Repo:** Cryptocreeper94-sudo/TrustHome  
**Live domain:** trusthome.tlid.io (per TLID_DOMAINS.md)  
**Date:** March 26, 2026  
**Purpose:** Real estate CRM and home services platform. Features: property management, showings, MLS setup, leads, transactions, document vault, business suite (expenses, mileage), AI marketing hub, media studio (via TrustVault), AI voice assistant (OpenAI + ElevenLabs), Signal Chat (Socket.IO), tree services AI assessment, analytics. Integrates with OrbitStaffing, Verdara, and Trust Layer SSO. Designed for real estate agents and brokers.

**Ownership:** 51% Jennifer Lambert (Managing Member) / 49% Jason Andrews (Technical Lead) — DarkWave Studios LLC, `womanOwned: true`

**Stack:** Expo SDK 54 + React Native 0.81.5 · Express 5 server · Drizzle ORM · Neon PostgreSQL · Socket.IO · OpenAI · ElevenLabs · Resend · OrbitStaffing API · Verdara API · TrustVault API · Trust Layer SSO

---

## 🚨 Act On This Before Anything Else

### OrbitStaffing auto-registration sends Replit URLs on Render

**File:** `server/orbit-routes.ts`

```typescript
const appUrl = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : process.env.REPL_SLUG
  ? `https://${process.env.REPL_SLUG}.replit.app`
  : "https://trusthome.replit.app";  // ← default fallback
```

Every time TrustHome starts on Render, it auto-registers with OrbitStaffing and sends:
- `appUrl: "https://trusthome.replit.app"`
- `webhookUrl: "https://trusthome.replit.app/webhooks/orbit"`

Neither `REPLIT_DEV_DOMAIN` nor `REPL_SLUG` exist on Render. OrbitStaffing's records for TrustHome point to a Replit URL — meaning any webhooks OrbitStaffing sends to TrustHome go to the wrong server, and any cross-app links within OrbitStaffing that point to TrustHome are broken.

**Fix:** Add `SITE_BASE_URL` (already in `render.yaml`) to the URL resolution chain:
```typescript
const appUrl = process.env.SITE_BASE_URL 
  || process.env.REPLIT_DEV_DOMAIN && `https://${process.env.REPLIT_DEV_DOMAIN}`
  || "https://trusthome.tlid.io";
```

---

### `mustResetPassword` and `used` stored as text strings — always truthy

**File:** `shared/schema.ts`

```typescript
mustResetPassword: text("must_reset_password").notNull().default('false'),
```
```typescript
used: text("used").notNull().default('false'),
```

Both fields store boolean values as text strings `'true'` and `'false'`. In JavaScript, **any non-empty string is truthy** — including the string `'false'`. This means:

- `if (user.mustResetPassword)` evaluates to `true` even when the value is `'false'`
- `if (verificationCode.used)` evaluates to `true` even for unused codes

The verification code `used` check is the more dangerous of the two. If this field is checked as `if (code.used)` anywhere, used codes will appear unused and can be replayed.

**Fix:** Change both columns to `boolean` type in the schema and run `db:push`. Check every conditional that reads `mustResetPassword` or `used` and confirm it compares against `=== 'true'` or is already using a boolean.

---

## Priority 1 — Simulated Hallmark (Ecosystem Pattern)

**File:** `server/hallmark.ts`

```typescript
function generateTxHash(): string {
  return "0x" + crypto.randomBytes(32).toString("hex");
}
function generateBlockHeight(): string {
  return String(1000000 + Math.floor(Math.random() * 9000000));
}
```

Same pattern as every other child app in the ecosystem. TR-XXXXXXXX hallmarks have fake blockchain references. This is not TrustHome's problem to solve independently — it's resolved when the Trust Layer backbone wires up real blockchain submission for all apps. Flagged here for completeness.

---

## Priority 2 — Architecture

### 2.1 Ownership data is hardcoded in source code

**File:** `server/orbit-routes.ts`

```typescript
const TRUSTHOME_PRICING = {
  ownership: {
    partner1: { name: "Jennifer Lambert", percentage: 51, role: "Managing Member" },
    partner2: { name: "Jason Andrews", percentage: 49, role: "Technical Lead & Platform Architect" },
    entity: "DarkWave Studios LLC",
    womanOwned: true,
  },
```

This ownership structure is hardcoded and sent to OrbitStaffing during auto-registration on every server start. If ownership percentages or members change, it requires a code change and a redeployment to take effect — and a stale registration will persist in OrbitStaffing until it's overwritten.

**Fix:** Move this to environment variables or a database record. At minimum, ownership data should not be in committed source code since it's a business-level fact that can change.

---

### 2.2 Four external service dependencies — each is a failure point

TrustHome makes outbound calls to:
1. **OrbitStaffing** (`ORBIT_HUB_URL`) — auto-registration, pricing sync
2. **Verdara** (`verdara-client.ts`) — outdoor/property services
3. **TrustVault** (`media-studio-client.ts`) — media studio projects
4. **Trust Layer** (`trustlayer-client.ts`) — certification, registry, blockchain stamps

The SSO has a circuit breaker (well-implemented). Confirm the other three clients also have:
- Request timeouts (so a slow Verdara/TrustVault response doesn't hang TrustHome requests)
- Graceful degradation (feature disabled, not 500 error, when a service is down)
- No blocking startup calls (auto-registration is already non-blocking — confirm the others are too)

---

### 2.3 Socket.IO proxy adds an extra network hop for chat

**File:** `server/socket-proxy.ts`

TrustHome proxies Socket.IO traffic, presumably to the Trust Layer Signal Chat server. Every chat message sent from TrustHome traverses: client → TrustHome server → Signal Chat server → back. This doubles the latency compared to a direct connection.

Confirm this is intentional (e.g., for auth injection or multi-tenancy) rather than an artifact of the development setup that was never revisited for production.

---

### 2.4 Replit artifacts committed to the repo

Present in the root:
- `.cache/` — Replit package cache
- `.local/state/replit/` — Replit agent state
- `.upm/` — Replit package manager state

These are in `.gitignore` in some repos but committed here. Add them to `.gitignore` and remove from the repo.

---

## Priority 3 — Positive Finding

### 3.1 The SSO circuit breaker is the best implementation in the ecosystem

**File:** `server/trustLayerSSO.ts`

This is the only app in the ecosystem where the SSO call to `dwtl.io` has:
- A hard 5-second timeout (`AbortSignal.timeout(5000)`)
- A circuit breaker (3 failures → 60-second cooldown, auto-reset)
- A `degraded: true` flag in the response so the frontend can show appropriate messaging
- Two fallback verification paths (token exchange → `/api/auth/me`)

The commit "fix: circuit breaker + timeout on SSO" shows this was added after real production failures. The pattern from this file should be copy-pasted into every other app in the ecosystem that calls TrustLink — none of the others have timeouts or circuit breakers.

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 0 | OrbitStaffing auto-registration sends `trusthome.replit.app` on Render | HIGH | FIX NOW |
| 0.1 | `mustResetPassword` and `used` as text strings — always truthy | HIGH | FIX NOW |
| 1 | Hallmark txHash/blockHeight simulated — ecosystem-wide issue | CRITICAL | TRACKED IN trust-layer |
| 2.1 | Ownership data hardcoded in source — can't change without redeploy | MEDIUM | OPEN |
| 2.2 | 4 external service dependencies — verify each has timeouts + graceful degradation | MEDIUM | VERIFY |
| 2.3 | Socket.IO proxy adds network hop for chat — confirm it's intentional | LOW | VERIFY |
| 2.4 | Replit artifacts committed to repo | LOW | CLEAN |
| 3.1 | Circuit breaker SSO is the best pattern in the ecosystem — copy to all other apps | POSITIVE | PROPAGATE |
