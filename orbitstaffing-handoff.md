# OrbitStaffing — Fix Handoff

**Repo:** Cryptocreeper94-sudo/orbitstaffing  
**Live site:** https://orbitstaffing.io (confirmed from commits: "Update all instances of orbitstaffing.net to orbitstaffing.io")  
**Ecosystem subdomain:** https://orbitstaffing.tlid.io (currently serving Trust Layer Hub — not yet wired to this app)  
**Date:** March 26, 2026  
**Commits:** 1,182 — the most developed app in the ecosystem  
**Purpose:** Full enterprise staffing and workforce management platform. Multi-tenant SaaS with a two-tier franchise model. Covers AI worker matching, payroll with garnishments, E-Verify, background checks (Checkr), facial recognition clock-ins (Azure), Stripe Connect partner payouts, OAuth 2.0 partner APIs, Trust Layer blockchain anchoring, ISO 20022, and more.

---

## What It Is

**Roles:** `master_admin` → `franchise_admin` → `customer_admin` → `manager` → `worker` / `client`

**Core feature set:**
- AI matching engine — skill synonyms, distance, shift preferences, certifications, experience → A+/A/B/C/D match tiers
- Resume parsing + job board integration and distribution
- E-Verify integration (government identity verification)
- Background checks (Checkr integration)
- Facial recognition clock-ins and profile verification (Azure Face API)
- Payroll system — PDF paystubs, garnishments, payroll calculator, Stripe Connect payouts
- E-signature service
- Compliance data — prevailing wages, state tax rates, workers' comp rates, state compliance rules
- ISO 20022 financial messaging implementation
- CRM routes
- SMS (Plivo + Twilio)
- Email campaigns
- Time clock management
- Sync engine + treasury sync
- Trust Layer blockchain anchoring (with 5s timeout)
- TrustVault blockchain (replaced Solana)
- Two-tier franchise hallmark system (customerHallmarks + hallmarkCustodyTransfers)
- Partner APIs with Swagger/OpenAPI docs
- OAuth 2.0 management
- Sandbox mode
- Websocket chat panel
- Version manager
- Asset tracking and stamping

**Stack:** React + Vite (client) · Express + TypeScript (server) · Drizzle ORM + Neon PostgreSQL · Stripe Connect

**Docs in `/docs/`:** Business Plan, Executive Summary, Investor Roadmap, Competitive Analysis, App Store Description, Google Play Submission Guide, Legal Checklist, Privacy Policy, Terms of Service, ISO 20022 Implementation, Sandbox Mode Guide, Version 2 Roadmap, Hallmark Registry, Two-Tier Hallmark Handoff

---

## Priority 1 — Legal & Compliance Risk (Act First)

### 1.1 Biometric data (Azure Face) requires explicit legal review

**File:** `server/azureFaceService.ts`

Facial recognition is used for worker clock-ins and profile verification. Biometric data collection is regulated by:
- **Illinois BIPA** — requires written consent, data retention limits, destruction schedule, no sale prohibition
- **Texas CUBI**, **Washington MY Health MY Data** — similar requirements
- **GDPR** — biometric data is "special category" data requiring explicit consent and DPO review
- **CCPA/CPRA** — specific biometric data obligations in California

**Fix:** Before this feature is used with any real workers, confirm `docs/LEGAL_CHECKLIST.md` explicitly covers:
1. Informed written consent obtained before capture
2. Biometric data retention policy with destruction schedule
3. No third-party sharing without consent
4. Opt-out mechanism that doesn't deny employment

If this is not covered, disable Azure Face until legal review is complete.

---

### 1.2 ISO 20022 — confirm implementation scope and compliance

**File:** `docs/ISO_20022_IMPLEMENTATION.md`

ISO 20022 is a global financial messaging standard used for wire transfers, ACH, and SWIFT. If OrbitStaffing is generating real ISO 20022 messages for money movement, this needs an independent financial compliance audit. Incorrect implementation can cause failed payments, regulatory violations, or bank rejection.

**Fix:** Clarify in `docs/ISO_20022_IMPLEMENTATION.md` whether this is:
- A real implementation generating live payment messages — if so, a financial compliance review is required
- A planned/roadmap item — mark it clearly as such
- A documentation spec for future integration — no immediate action needed

---

## Priority 2 — Security

### 2.1 In-memory rate limiting will not scale and resets on restart

**File:** `server/auth.ts`

The code explicitly notes: `"use Redis for production at scale"` for the login attempts map:
```ts
const loginAttempts = new Map<string, { count: number; lockoutUntil: number }>();
```

In production on Render, any restart (deploy, crash, scale event) wipes all rate limit state. An attacker can bypass account lockout by timing attacks around restarts.

**Fix:** Replace the in-memory Map with Redis (Upstash or Render Redis). The rest of the rate limiting logic is sound — only the storage layer needs to change.

---

### 2.2 Two duplicate Trust Layer SSO files — one is likely dead

**Files:** `server/trustLayerSSO.ts` AND `server/trustlayer-sso.ts`

`routes.ts` imports from `trustlayer-sso.ts`. The other file (`trustLayerSSO.ts`) may be a dead duplicate. If both are active, they could be registering conflicting route handlers.

**Fix:** Determine which file is the live one (check all imports in `routes.ts` and `app.ts`). Delete the unused file. Rename the live file to a consistent casing convention.

---

### 2.3 Admin 4-digit PIN stored in users table — confirm it's hashed

**File:** `shared/schema.ts`

```ts
adminPin: varchar("admin_pin", { length: 4 }),
```

4-digit PINs are brute-forceable (10,000 combinations). Confirm:
1. The PIN value stored in the database is a bcrypt hash, not plaintext
2. PIN comparison uses `verifyPassword` (bcrypt), not `===`
3. PIN entry has rate limiting applied — should use the same `rateLimitMiddleware` as login

If the PIN is stored in plaintext, any DB read exposure leaks every admin's PIN immediately.

---

### 2.4 Blockchain anchoring timeout — confirm failure handling

**File:** `server/trustLayerBlockchain.ts`  
**Last fix:** `fix: add 5s timeout to blockchain anchoring fetch call`

The 5s timeout was added but the handling of a timeout failure needs verification:
- When anchoring times out, is the record marked as `anchor_status: 'failed'` so it can be retried?
- Is there a retry queue or dead letter mechanism?
- Are failures surfaced in the admin dashboard or silently dropped?

**Fix:** Confirm the timeout catch block updates the record status and enqueues a retry. Silent failure on blockchain anchoring defeats the audit trail purpose.

---

### 2.5 Hardcoded client dashboard for "Kathy Grater"

**Commit:** `Add a dedicated dashboard for Kathy Grater to view Happy Eats financials`

Building a named dashboard for a specific client is a one-off pattern that won't scale and creates maintenance risk. If Kathy Grater is a real client, her data should be accessible through the standard `customer_admin` role dashboard filtered to her tenant, not a custom page.

**Fix:** Verify whether this dashboard is a permanent feature or was a quick demo. If permanent, refactor it into the standard client dashboard with role-based data scoping. Remove any hardcoded references to a client's name from the source code.

---

## Priority 3 — Architecture

### 3.1 Two server entry points — dev and prod can diverge

**Files:** `server/index-dev.ts`, `server/index-prod.ts`

Having two separate server entry points means any change made to one must be manually mirrored to the other. This is a common source of "works in dev, broken in prod" bugs.

**Fix:** Consolidate into a single `server/index.ts` that uses environment variables to toggle dev-specific behavior (e.g., `if (process.env.NODE_ENV === 'development') { ... }`). The `package.json` `dev` and `start` scripts can point to the same file with different env vars.

---

### 3.2 `companyId` is deprecated but may still be read

**File:** `shared/schema.ts`

```ts
companyId: varchar("company_id").references(() => companies.id), // Deprecated - use tenantId
```

If any query still reads `companyId` instead of `tenantId`, data isolation between tenants could break. With 50+ server files and 1,182 commits, this is a real risk.

**Fix:** Search the entire codebase for `companyId` references. For any that are in active query paths (not just schema definitions), migrate them to `tenantId`. Once all references are migrated, mark the column for eventual removal with a migration.

---

### 3.3 `seed.ts.disabled` — dead file

**File:** `server/seed.ts.disabled`

A disabled seed file sitting in the server directory adds confusion. The agent may not know if it's intentionally disabled or accidentally excluded.

**Fix:** Either delete it if superseded by `demo-seed.ts`, or rename it to `seed.ts` if it's still needed for setup.

---

## Priority 4 — Feature Verification

### 4.1 Verify all external integrations have credentials configured

OrbitStaffing has more external API dependencies than any other app in the ecosystem. Confirm each is live and credentialed in the production environment:

| Integration | Env Var(s) Needed | Status to Verify |
|---|---|---|
| Checkr (background checks) | `CHECKR_API_KEY` | Active? |
| Azure Face API | `AZURE_FACE_KEY`, `AZURE_FACE_ENDPOINT` | Active? |
| E-Verify | E-Verify credentials | Active? |
| Stripe Connect | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Active? |
| Coinbase | `COINBASE_API_KEY` etc. | Still needed or deprecated? |
| Plivo (SMS) | `PLIVO_AUTH_ID`, `PLIVO_AUTH_TOKEN` | Active? |
| Twilio (SMS) | `TWILIO_*` vars | Active or replaced by Plivo? |
| OpenAI (resume parsing / AI match) | `OPENAI_API_KEY` | Active? |
| Neon PostgreSQL | `DATABASE_URL` | Active? |

---

### 4.2 Coinbase integration — still needed after TrustVault migration?

**File:** `server/coinbaseService.ts`

Solana was replaced by TrustVault. Coinbase is a separate integration. Confirm:
- Is Coinbase still actively used for any payment flow?
- Or is it a leftover from before TrustVault replaced the crypto payment path?

If it's not actively used, remove it to reduce surface area.

---

### 4.3 Plivo vs Twilio — one may be dead

**Files:** `server/plivoService.ts`, `server/twilioService.ts`

Both SMS providers are present. A commit message says "Add Plivo SMS integration for enhanced communication" which implies Plivo replaced or supplements Twilio. The Twilio commit says "Add SMS notification placeholder with API endpoints and documentation" — suggesting Twilio may be a stub.

**Fix:** Determine the active SMS provider. Delete the stub or deprecated one.

---

### 4.4 Two-tier franchise hallmark system — verify tables exist in production

**Commit:** `Add a two-tier franchise system for customer hallmark ownership`  
**File:** `docs/ORBIT-TWO-TIER-HALLMARK-HANDOFF.txt`

The two-tier system adds `customerHallmarks` and `hallmarkCustodyTransfers` tables. Confirm these tables exist in the production Neon database via `drizzle-kit push` or by querying directly.

---

### 4.5 Sandbox mode — confirm it's gated from production data

**File:** `server/sandboxService.ts`  
**Doc:** `docs/SANDBOX_MODE_IMPLEMENTATION_GUIDE.md`

Sandbox mode lets partners test integrations without affecting real data. Confirm:
- Sandbox operations write to separate tables or a sandboxed tenant, never production records
- The `sandboxService` flag cannot be set by a non-admin API call
- Webhook events fired from sandbox mode are clearly labeled as test events

---

## Priority 5 — Housekeeping

### 5.1 No tests — 1,182 commits

This is the most business-critical platform in the ecosystem (payroll, E-Verify, garnishments, biometric data, Stripe Connect payouts). Zero test coverage is the highest-risk position of any app reviewed.

Minimum test targets, in priority order:
1. `payrollCalculator.ts` — unit test against known inputs and expected outputs
2. `auth.ts` rate limiting and lockout logic
3. `aiMatchingEngine.ts` — skill synonym matching and tier scoring
4. `everifyService.ts` — request/response handling, error states
5. `trustLayerBlockchain.ts` — timeout and retry behavior

### 5.2 `orbitstaffing.tlid.io` subdomain not wired

Same as `lumeline.tlid.io` — currently serving the Trust Layer Hub. The production app is at `orbitstaffing.io`. Subdomain wiring is a DNS/deployment task only when ready.

---

## File Map (Key Files)

| File | Purpose |
|---|---|
| `server/routes.ts` | Entire API surface — all routes registered here (~50 service imports) |
| `server/auth.ts` | Auth utilities — bcrypt, rate limiting (in-memory), token generation |
| `server/aiMatchingEngine.ts` | AI worker-to-job matching — skill synonyms, distance, tier scoring |
| `server/matchingService.ts` | Auto-match workers + auto-reassign requests |
| `server/payrollCalculator.ts` | Payroll calculation — hours, rates, deductions, garnishments |
| `server/paystubGenerator.ts` | PDF paystub generation |
| `server/stripeService.ts` | Stripe subscriptions, checkout, Connect payouts, garnishment payments |
| `server/checkrService.ts` | Background check integration (Checkr) |
| `server/azureFaceService.ts` | Facial recognition for clock-ins (Azure) — **biometric data** |
| `server/everifyService.ts` | E-Verify identity verification |
| `server/trustLayerBlockchain.ts` | Blockchain anchoring for audit trail (5s timeout added) |
| `server/trustlayer-sso.ts` | Trust Layer SSO (active — imported by routes.ts) |
| `server/trustLayerSSO.ts` | Possible duplicate — verify and delete if unused |
| `server/hallmarkService.ts` | Hallmark queue and blockchain stats |
| `server/ecosystemHallmark.ts` | Ecosystem hallmark integration |
| `server/sandboxService.ts` | Sandbox/test mode for partner integrations |
| `server/oauthService.ts` | OAuth 2.0 management for partner API access |
| `server/openapi.ts` | Swagger/OpenAPI spec — served at `/api-docs` |
| `server/webhookService.ts` | Outbound webhooks + retry processor |
| `server/syncEngine.ts` | Automatic data synchronization |
| `server/financialHub.ts` | Financial hub — product registry |
| `server/coinbaseService.ts` | Coinbase payments — verify if still needed |
| `server/plivoService.ts` | Plivo SMS — likely active |
| `server/twilioService.ts` | Twilio SMS — likely stub |
| `shared/schema.ts` | Drizzle schema — all tables, includes deprecated `companyId` |
| `docs/LEGAL_CHECKLIST.md` | Legal checklist — **must cover biometric data** |
| `docs/ISO_20022_IMPLEMENTATION.md` | ISO 20022 financial messaging — verify scope |

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 1.1 | Azure Face biometric data — legal compliance required before use | CRITICAL | OPEN |
| 1.2 | ISO 20022 — confirm implementation scope and compliance | HIGH | OPEN |
| 2.1 | In-memory rate limiting resets on restart — needs Redis | HIGH | OPEN |
| 2.2 | Two duplicate Trust Layer SSO files — one may be dead | MEDIUM | OPEN |
| 2.3 | Admin 4-digit PIN — confirm it's hashed, not plaintext | HIGH | OPEN |
| 2.4 | Blockchain anchor timeout — confirm failure is recorded and retried | HIGH | OPEN |
| 2.5 | Hardcoded "Kathy Grater" dashboard — refactor to role-based | MEDIUM | OPEN |
| 3.1 | Two server entry points (dev/prod) can diverge | MEDIUM | OPEN |
| 3.2 | Deprecated companyId may still be in active queries | MEDIUM | OPEN |
| 3.3 | seed.ts.disabled — delete or restore | LOW | OPEN |
| 4.1 | 9 external integrations — verify all have production credentials | HIGH | OPEN |
| 4.2 | Coinbase — verify still needed after TrustVault migration | LOW | OPEN |
| 4.3 | Plivo vs Twilio — one is a stub, delete it | LOW | OPEN |
| 4.4 | Two-tier hallmark tables — confirm exist in production DB | MEDIUM | OPEN |
| 4.5 | Sandbox mode — confirm isolated from production data | HIGH | OPEN |
| 5.1 | Zero tests across 1,182 commits — highest risk in ecosystem | HIGH | OPEN |
| 5.2 | orbitstaffing.tlid.io subdomain not yet wired | LOW | PENDING |
