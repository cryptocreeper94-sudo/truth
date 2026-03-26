# HappyEats — Fix Handoff

**Repo:** Cryptocreeper94-sudo/happyeats  
**Live site:** https://happyeats.tlid.io (or primary domain via APP_URL env var)  
**Date:** March 26, 2026  
**Commits:** 852 — 2 branches  
**Last push:** 17 hours ago (flyer catalog glassmorphism upgrade)  
**Purpose:** Food delivery platform. Multi-tenant SaaS — HappyEats is the primary tenant, with a `tenants/happyeats/` config folder indicating a white-label architecture is being built out. Features: vendor management, order routing, delivery zone mapping, driver dispatch, customer accounts, AI flyer creation, marketing scheduler, social media connectors, SMS alerts, Stripe payments, franchise onboarding, affiliate/referral system, Trust Layer SSO and hallmark integration.

---

## What's Genuinely Working

- **Twilio SMS is real and A2P compliant** — `server/sms.ts` reads live env vars, normalizes phone numbers, uses Twilio SDK, and sends templated messages with opt-out footer on every message. SMS opt-in checkboxes were added across all forms.
- **Stripe payments are properly configured** — `server/stripe.ts` reads `APP_URL` (not `REPLIT_DEV_DOMAIN`) for redirect URLs, generates full HTML receipts, handles multiple fee line items (service fee, tax, delivery, tip, promo discount, reward credit).
- **Auth rate limiting is in place** — `routes.ts` applies `authLimiter` (10 attempts / 15 min) to login, register, forgot-password, reset-password, and vendor login endpoints.
- **Input sanitization** — `sanitizeInput()` and `sanitizeObject()` are applied across form inputs; phone and email regex validation is present.
- **`bot-prerender.ts`** — SEO prerendering for crawlers and ad networks. Good for discoverability.
- **Multi-tenant architecture started** — `tenants/happyeats/config` drives SMS prefix, domain, and branding. Right direction for white-labeling.
- **DB-backed sessions** — `connect-pg-simple` used for sessions, not in-memory.
- **Trust Layer SSO** — `trustlayer-sso.ts` present and wired.

---

## Priority 1 — Security

### 1.1 `@solana/web3.js` is still in `package.json`

HappyEats does not have visible Solana routes, but `@solana/web3.js` remains a listed dependency:
```json
"@solana/web3.js": "^1.98.4"
```

This pulls in a large, security-sensitive package on every install. If it's not actively imported by any route, it's dead weight and an unnecessary audit surface. Grep for `solana` imports across the server — if nothing uses it, remove it from `package.json` and run `npm install` to clean `package-lock.json`.

---

### 1.2 Customer password reset codes are in-memory — lost on restart

**File:** `server/routes.ts`

```ts
const customerResetCodes = new Map<string, { code: string; expiresAt: Date; email: string }>();
```

Password reset codes are stored in a Map. Every server restart (deploy, crash, Render scale event) wipes all pending reset codes — a customer who just requested a password reset will find their code is invalid. This is a security gap and a support headache.

**Fix:** Add a `customerPasswordResetTokens` table to `shared/schema.ts` mirroring the pattern from OrbitStaffing: `email`, `tokenHash` (SHA-256 of the code), `expiresAt`, `consumedAt`. Store the hashed code, send the plaintext to the user. Look up by hash on verify.

---

### 1.3 `SANDBOX_MODE` env var bypasses ordering cutoff times

**Commit:** `feat: add SANDBOX_MODE env var to bypass batch ordering cutoff times`

Confirm this variable is not set in the production Render environment. If `SANDBOX_MODE=true` is set in prod, real customers could place orders outside of valid time windows, causing vendor operations problems.

**Fix:** Add this to the deployment checklist: `SANDBOX_MODE` must be unset or `false` in production. Consider renaming it to `TESTING_SANDBOX_MODE` to make it even harder to accidentally enable in prod.

---

## Priority 2 — Data / Content Issues

### 2.1 Hardcoded Stripe price IDs in `stripe.ts`

**File:** `server/stripe.ts`

```ts
const AD_FREE_PRICE_ID = 'price_1T31aZRq977vVehdckX6UYTH';
const AD_FREE_PRODUCT_ID = 'prod_U13hFfiCJtgilV';
const MEDIA_STUDIO_PRO_PRICE_ID = 'price_1T32qMRq977vVehd0OlbG4vF';
const MEDIA_STUDIO_PRO_PRODUCT_ID = 'prod_U150re0FN7cNy6';
const FRANCHISE_SUBSCRIPTION_PRICE = 49900; // $499.00
```

Stripe price/product IDs are hardcoded as string constants. If a price is ever updated in the Stripe dashboard (price change, repackaging), the code breaks silently — the old price ID still works for existing subscribers but new checkouts may fail or charge the wrong amount.

**Fix:** Move these to environment variables (`STRIPE_AD_FREE_PRICE_ID`, `STRIPE_MEDIA_STUDIO_PRICE_ID`, etc.) so they can be updated without a code deploy. At minimum, document them clearly so they're easy to find and update.

---

### 2.2 Social connectors — verify which platforms are actually posting

**File:** `server/social-connectors.ts`

The `marketing-scheduler.ts` and `social-connectors.ts` handle Twitter, Facebook, and Instagram posting. The schema has a `metaIntegrations` table and `scheduledPosts`. Confirm:
- Which platforms have live API credentials configured in Render?
- Twitter/X API access now requires Elevated or Basic tier — is the API key provisioned at the right tier for posting?
- Facebook/Instagram Graph API tokens expire — are token refresh flows in place?

If no platforms are live, the marketing scheduler is running against unconfigured connectors and silently failing. The UI should show a clear "not connected" state for each platform rather than allowing posts to be scheduled into a void.

---

### 2.3 `orbit-staffing-handoff.tsx` is a publicly accessible page

**File:** `client/src/pages/orbit-staffing-handoff.tsx`

This is an internal planning/handoff document rendered as an app page. It's in the client pages directory with no apparent auth gate. Any user who navigates to the route can read internal deployment notes.

**Fix:** Either delete the page entirely, or if it needs to stay, gate it behind the admin/team login (`role === 'admin'` check on the route).

---

## Priority 3 — Architecture

### 3.1 Multi-tenant migration is incomplete

**Commit:** `refactor: extract HappyEats config into tenants/happyeats/ folder`

The refactor started extracting brand-specific config (SMS prefix, domain, branding) into `client/src/tenants/happyeats/`. This is the right direction for a white-label platform. But the refactor appears partial — confirm that all hardcoded references to "HappyEats" branding, `happyeats.tlid.io` URLs, and HappyEats-specific copy in `routes.ts` and the client pages have been moved to the tenant config. Any hardcoded brand strings left in the shared code will break the next tenant deployment.

---

### 3.2 `HE_JWT_SECRET` rename — verify backward compatibility is actually applied everywhere

**Commit:** `feat: rename JWT_SECRET to HE_JWT_SECRET with fallback for backward compat`

The rename added a fallback so existing deployments using `JWT_SECRET` still work. But confirm:
- Is the Render production environment updated to use `HE_JWT_SECRET`?
- Is `JWT_SECRET` still set as a fallback? If both are set, the fallback may be masking a misconfiguration.

The safest state is: `HE_JWT_SECRET` is set in Render, `JWT_SECRET` is removed, and the code uses `HE_JWT_SECRET` with no fallback. The fallback should be temporary, not permanent.

---

## Environment Variables — Full Checklist

Confirm all of these are set in Render production:

| Var | Required For | Confirm |
|---|---|---|
| `DATABASE_URL` | All DB operations | ✅ / ❌ |
| `HE_JWT_SECRET` | Auth tokens | ✅ / ❌ |
| `STRIPE_SECRET_KEY` | Payments | ✅ / ❌ |
| `STRIPE_WEBHOOK_SECRET` | Webhook validation | ✅ / ❌ |
| `TWILIO_ACCOUNT_SID` | SMS | ✅ / ❌ |
| `TWILIO_AUTH_TOKEN` | SMS | ✅ / ❌ |
| `TWILIO_PHONE_NUMBER` | SMS | ✅ / ❌ |
| `OPENAI_API_KEY` | AI flyer generation | ✅ / ❌ |
| `APP_URL` | Stripe redirects | ✅ / ❌ |
| `TRUSTLAYER_HUB_API_KEY` | Trust Layer sync | ✅ / ❌ |
| `TRUSTLAYER_HUB_API_SECRET` | Trust Layer sync | ✅ / ❌ |
| `SANDBOX_MODE` | Must be unset/false | ✅ / ❌ |

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 1.1 | @solana/web3.js in package.json — likely unused | MEDIUM | OPEN |
| 1.2 | Customer reset codes in-memory — lost on restart | HIGH | OPEN |
| 1.3 | SANDBOX_MODE — verify not set in production | HIGH | VERIFY |
| 2.1 | Stripe price IDs hardcoded in source — brittle | MEDIUM | OPEN |
| 2.2 | Social connectors — verify platforms actually posting | MEDIUM | VERIFY |
| 2.3 | orbit-staffing-handoff.tsx is a public page | MEDIUM | OPEN |
| 3.1 | Multi-tenant migration is partial | MEDIUM | OPEN |
| 3.2 | HE_JWT_SECRET rename — verify Render env updated | MEDIUM | VERIFY |
