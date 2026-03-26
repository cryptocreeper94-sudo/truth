# Trust Layer Hub — Fix Handoff

**Repo:** Cryptocreeper94-sudo/trust-layer-hub (case-sensitive: `Trust-Layer-Hub`)  
**Live domain:** https://trusthub.tlid.io  
**Date:** March 26, 2026  
**Purpose:** Genesis application for the entire Trust Layer ecosystem. Provides TrustLink SSO for 34+ apps, the Hallmark trust-stamping system, financial wallet (Plaid), AI agent chat (OpenAI + ElevenLabs TTS), user profiles, leaderboard, affiliate/referral system, staking, multisig, and a developer portal.

**Stack:** Expo SDK 54 + React Native 0.81.5 (mobile) · Express 5 server · Drizzle ORM · Neon PostgreSQL · Plaid · Stripe · Twilio · Resend · OpenAI · ElevenLabs · Solana (Helius RPC) · Expo Router

---

## 🚨 Act On This Right Now — Before Anything Else

### The Hallmark system is simulated — all blockchain records are fake

This is the most consequential issue in the repo.

The `TRUST-LAYER-HANDOFF.md` in the repo documents this explicitly:

> *"Currently, the Hallmark System simulates blockchain submission locally: SHA-256 hashes the event payload, Generates a fake `txHash` and `blockHeight`, Stores locally in our PostgreSQL"*

The `hallmarks` table stores a `txHash` and `blockHeight` for every hallmark event — TH-XXXXXXXX numbered records that look like verified on-chain anchors. They are not. They are randomly generated strings stored only in Postgres.

**Why this matters at ecosystem scale:** Every app in the 34-app ecosystem that generates hallmarks — OrbitStaffing (hiring records), Pulse (trade records), LOT OPS Pro (vehicle transactions), Trust Layer Hub itself — is producing hallmark IDs that claim blockchain provenance they don't have. If any of those hallmark IDs are shown to end users as "blockchain verified," that's misrepresentation.

**What's needed to go live:**
```
DARKWAVE_RPC_URL=   (Solana RPC endpoint)
DARKWAVE_PRIVATE_KEY=   (signing wallet)
```

Once those are set, the hallmark service needs to actually call the Solana RPC and submit the SHA-256 hash to a real transaction. Until then, every TH- record is a local database entry with a fake hash.

---

## Priority 1 — Integration Gaps (App Is Incomplete)

### 1.1 Four environment variables are missing — the app is not fully wired

The `TRUST-LAYER-HANDOFF.md` documents four things the app still needs from the Trust Layer backend team:

| Variable | Purpose | Current State |
|---|---|---|
| `TRUST_LAYER_API_URL` | Canonical Trust Layer API base URL | Falls back to `localhost:5000` |
| `TRUST_LAYER_API_KEY` | Service-level key for privileged ops | Not set |
| `JWT_SECRET` | Signs/verifies WebSocket chat tokens | Unknown — may be unset |
| `DARKWAVE_RPC_URL` + `DARKWAVE_PRIVATE_KEY` | Real blockchain submission | Not set, hallmarks are simulated |

If `JWT_SECRET` is not set in Render, chat WebSocket authentication will fail or silently skip verification. Verify this is set.

---

### 1.2 Plaid is hardcoded to sandbox — real bank connections will fail

**File:** `server/plaid.ts`, line 1

```typescript
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments.sandbox,  // ← hardcoded
```

The financial wallet feature lets users link their bank accounts. Plaid sandbox only accepts Plaid's test credentials — no real bank account can be connected. Switching to production requires:

1. Plaid production approval (applied for through the Plaid dashboard — requires business verification)
2. Changing `PlaidEnvironments.sandbox` → `PlaidEnvironments.production`
3. Separate `PLAID_CLIENT_ID` and `PLAID_SECRET` for the production environment

Until then, the financial wallet is a demo-only feature, even in production.

---

### 1.3 Render free tier — SSO provider spinning down is an ecosystem-wide problem

**File:** `render.yaml`

```yaml
plan: free
```

Trust Layer Hub is the SSO backbone for 34+ apps. Free tier Render services spin down after 15 minutes of inactivity and take 30-60 seconds to cold-start. This means:

- Any user logging into any ecosystem app after an idle period waits 30-60 seconds for login to complete
- During that cold start, TrustLink SSO calls return 503, causing login failures across the whole ecosystem

**Fix:** Upgrade to at minimum the Render Starter plan ($7/month) which keeps the service warm. This is not optional for a service that 34+ other apps depend on.

---

## Priority 2 — Security

### 2.1 No rate limiting on auth routes

**File:** `server/auth.ts`

The `POST /api/auth/login` and `POST /api/auth/register` routes have no visible rate limiting. The `verification_codes` table has an `attempts` counter, which handles brute-forcing codes — but the login route itself (email + password) has no request rate limiter.

With TrustLink, this server receives login requests from 34+ apps. A bad actor can run a credential-stuffing attack against the hub and, if they compromise an account here, they have access to every ecosystem app that account has used TrustLink on.

**Fix:** Add `express-rate-limit` to `POST /api/auth/login` — e.g., 10 attempts per IP per 15 minutes with exponential backoff. This is a two-minute code change.

---

### 2.2 `PHANTOM_SECRET_KEY` in render.yaml — clarify its use

**File:** `render.yaml`

```yaml
- key: PHANTOM_SECRET_KEY
  sync: false
```

A Phantom wallet private key is loaded as a server environment variable. Clarify:
- Is this wallet used for signing real on-chain transactions (spending SOL/tokens)?
- Or is it only for reading RPC data?

If this wallet can spend funds, any server-side code injection or environment leak gives an attacker spending access to the wallet. Confirm the wallet holds only what's needed for operational transactions and not a primary treasury.

---

### 2.3 Developer portal uses PIN, not role-based auth

**Commit:** "Update developer portal access to use a PIN instead of admin roles"

Same pattern documented across DWSC (PIN "2424"), LOT OPS Pro, OrbitStaffing. Verify:
- What is the PIN? Is it hardcoded in `developer-portal.ts` or read from an env var?
- Is there any rate limiting on PIN attempts?
- Does a wrong PIN log the attempt?

A hardcoded PIN with no rate limit is equivalent to no auth — anyone who reads the source code (and this is a public repo) knows the PIN.

---

### 2.4 `uniqueHash` is the ecosystem-wide affiliate identity anchor

**File:** `server/db/schema.ts`

```typescript
uniqueHash: text("unique_hash").unique()
```

This 32-character hex value (16 bytes, generated at registration) is what ties a user's identity and affiliate relationships across all 34 apps. It is the `referredBy` tracking key for the affiliate program.

If a user's `uniqueHash` is accidentally reset or overwritten (e.g., by a TrustLink sync that pushes a different hash), all their affiliate relationships silently break. There's no audit trail for `uniqueHash` changes in the schema.

**Fix:** Add a `unique_hash_history` table or at minimum log `uniqueHash` changes in the audit trail. Make `uniqueHash` immutable once set — only allow it to be set once, never updated.

---

## Priority 3 — Architecture

### 3.1 Expo web export has a fallback to a static HTML page

**File:** `scripts/render-build.sh`

```bash
npx expo export:web --output-dir dist/web 2>/dev/null || \
npx expo export --platform web --output-dir dist/web 2>/dev/null || {
  echo "⚠️ Expo web export not available, using static landing page..."
  cp web/index.html dist/web/index.html
}
```

The build tries two Expo export commands and silently falls back to copying a static HTML page if both fail. Users visiting `trusthub.tlid.io` from a browser may be seeing the static landing page instead of the full Expo web app without any error being surfaced.

**Fix:** Remove the `2>/dev/null` silence on the Expo export commands and let the build fail loudly if the export fails. A silent fallback to a degraded experience is harder to catch than a failed build.

---

### 3.2 Lume programming language docs don't belong in this repo

The root of the repository contains 10+ Lume language specification and academic paper files:
- `LUME-ACADEMIC-PAPER.md`
- `LUME-MASTER-SPECIFICATION.md`
- `LUME-LANGUAGE-SPEC.md`
- `LUME-MILESTONE-6-SELF-SUSTAINING.md`
- `LUME-MILESTONES-7-13-HANDOFF.md`
- `LUME-GAP-RESOLUTION-HANDOFF.md`
- `LUME-GAP-RESOLUTION-PART-2-HANDOFF.md`
- `LUME-VOICE-TO-CODE-HANDOFF.md`
- `LUME-CHI-PAPER.md`
- `LUME-ACADEMY-KNOWLEDGE-BASE.md`

Trust Layer Hub is a mobile app and SSO hub. Lume has its own repo (`Cryptocreeper94-sudo/lume`). These docs were likely authored here in a Replit session and never moved. They should be transferred to the Lume repo and removed from this one — they create confusion about the purpose of this codebase and add maintenance noise.

---

### 3.3 Test count is manually maintained and inaccurate

**Commits:**
- "chore: update stale 552 test count → 2,149 across LUME-ACADEMIC-PAPER, MASTER-SPECIFICATION, ecosystem-apps, ai-agent"
- "chore: remove + from test count — 2,149 is exact"

The "2,149 tests" is a number written in markdown documents, not a test runner output. Across the ecosystem this pattern has been flagged repeatedly — the test count in academic papers and handoff documents is being manually bumped by commit without any test suite generating that number.

There are no `*.test.ts`, `*.spec.ts`, `*.test.tsx` files visible in the repo tree. **Zero automated tests exist.** The 2,149 figure is aspirational documentation.

---

## Priority 4 — Ecosystem Coordination

### 4.1 Trust Layer Hub is the single point of failure for 34+ apps

Every app in the ecosystem calls `dwtl.io` for TrustLink SSO. If Trust Layer Hub goes down:
- No one can log into any ecosystem app via TrustLink
- Existing sessions remain valid (until they expire), but new logins fail everywhere

There is no documented:
- SLA or uptime target for `trusthub.tlid.io`
- Fallback auth path (what should apps do if TrustLink is unreachable?)
- Health check monitoring or alerting

**Fix:** Set up a health check monitor (UptimeRobot is free). Document what each app should do when TrustLink returns a 503 — at minimum, degrade gracefully with a "Login temporarily unavailable" message rather than a broken screen.

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 0 | Hallmark blockchain is simulated — all txHash records are fake | CRITICAL | OPEN |
| 1.1 | 4 env vars missing — app not fully wired to Trust Layer backend | HIGH | OPEN |
| 1.2 | Plaid hardcoded to sandbox — no real bank connections possible | HIGH | OPEN |
| 1.3 | Render free tier — SSO provider cold-starts break ecosystem logins | HIGH | OPEN |
| 2.1 | No rate limiting on login route — credential stuffing risk | HIGH | OPEN |
| 2.2 | PHANTOM_SECRET_KEY as server env var — clarify spending scope | MEDIUM | VERIFY |
| 2.3 | Developer portal PIN — verify not hardcoded, verify rate limited | MEDIUM | VERIFY |
| 2.4 | uniqueHash has no change audit trail — affiliate links can break silently | MEDIUM | OPEN |
| 3.1 | Expo web export silently falls back to static HTML | MEDIUM | OPEN |
| 3.2 | 10+ Lume docs in wrong repo — move to Lume repo | LOW | CLEAN |
| 3.3 | 2,149 "tests" are manual markdown numbers — zero test files exist | LOW | ONGOING |
| 4.1 | Hub is single point of failure — no downtime plan for 34 dependent apps | HIGH | OPEN |
