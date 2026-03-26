# TLDriverConnect — Fix Handoff

**Repo:** Cryptocreeper94-sudo/TLDriverConnect  
**Live site:** Likely tldriverconnect.tlid.io or configured via APP_URL  
**Date:** March 26, 2026  
**Commits:** 866  
**Last push:** 2 hours ago (5s timeout on all Trust Layer hub fetch calls)  
**Origin:** Forked from the same codebase as HappyEats — same server structure, same build scripts, same package.json. Diverged with trucking/driver-specific pages and a full Trust Layer ecosystem integration layer.  
**Purpose:** Trucker and independent driver platform. Features: CDL directory, GPS/fuel finder, truck map, trucker talk community, driver ID badges, revenue tracker, vendor food ordering (inherited from HappyEats codebase), AI flyer creator, marketing hub, Trust Layer ecosystem sync (Hub, TrustVault, OrbitStaffing, OrbitFinancialHub), Stripe payments, affiliate/referral, Trust Layer SSO.

---

## What's Genuinely Working

- **Ecosystem integration is the most mature in the ecosystem** — `server/ecosystem/` contains 5 separate client integrations (Trust Layer Hub, TrustVault, OrbitFinancialHub, OrbitStaffing, webhookHandler). All use `AbortSignal.timeout(5000)` after the fix 2 hours ago.
- **Trust Layer ID auto-generated on vendor signup** — `feat: auto-generate Trust Layer ID on vendor signup + ecosystem sync` wires the signup into the hub.
- **Stripe payment verification** — `fix: critical payment verify - search up to 100 Stripe sessions` shows the Stripe verify loop was hardened.
- **Persistent feature toggles** — `feat: persistent feature toggles - DB-backed with server-side enforcement` — feature flags are in the database, not in-memory.
- **Auth-gated quick-access side tab** — role-based access controls confirmed added.
- **Twilio A2P-compliant SMS opt-in checkboxes** added across all forms.
- **DB-backed sessions** — same `connect-pg-simple` setup as HappyEats.
- **`drizzle-kit push` in Render build command** — schema migrations run automatically on deploy.

---

## Priority 1 — Critical Bugs

### 1.1 The ecosystem `index.ts` identifies this app as "Happy Eats" — copy-paste bug

**File:** `server/ecosystem/index.ts`

```ts
private appName = 'Happy Eats';
private appId = 'happyeats';
```

This is in the TLDriverConnect codebase. When TLDriverConnect syncs vendors, logs activity, or registers workers with the Trust Layer Hub, it identifies itself as `happyeats`. Every ecosystem log, audit trail entry, and sync record from TLDriverConnect will be misattributed to HappyEats in the Hub's registry.

**Fix — do this immediately:**
```ts
private appName = 'TL Driver Connect';
private appId = 'tldriverconnect';
```

Check all five ecosystem client files (`trustLayerHubClient.ts`, `orbitFinancialHub.ts`, `trustLayerBlockchain.ts`, `orbitStaffingClient.ts`, `webhookHandler.ts`) for any remaining HappyEats references and correct them.

---

### 1.2 Revenue tracker has hardcoded mock data with a reference to "Kathy"

**File:** `client/src/pages/revenue-tracker.tsx`

```ts
// Mock data — in production this comes from API
const MOCK_WEEKS: WeeklyData[] = [
  { week: "Mar 3-9", revenue: 2840, costs: 680, orders: 142 },
  { week: "Mar 10-16", revenue: 3210, costs: 720, orders: 161 },
  ...
];

const [baseSplitOperator] = useState(60); // Kathy's default %
```

The revenue tracker page is displaying static mock data hardcoded in the component. Real drivers/operators using this page see fake revenue numbers. The comment says "in production this comes from API" but the API is not connected — the `useState(MOCK_WEEKS)` never gets replaced.

Additionally, the split percentage is labeled "Kathy's default %" in the code. This is another instance of a specific client's name hardcoded (same pattern as OrbitStaffing's Kathy Grater dashboard). This suggests the revenue tracker was built for a specific person, not as a general feature.

**Fix:** Wire the revenue tracker to real API data from the database (order history by week, cost entries). Remove the hardcoded mock data. Rename `baseSplitOperator` to a generic variable. The revenue tracker should pull from the authenticated user's actual orders and expenses.

---

### 1.3 `@solana/web3.js` in `package.json` AND `SOLANA_WALLET_PRIVATE_KEY` checked in ecosystem status

**Files:** `package.json`, `server/ecosystem/index.ts`

```json
"@solana/web3.js": "^1.98.4"
```

```ts
blockchain: {
  configured: trustLayerBlockchain.isConfigured(),
  hasWallet: !!process.env.SOLANA_WALLET_PRIVATE_KEY
}
```

Unlike HappyEats, TLDriverConnect actively uses the Solana package via `server/ecosystem/trustLayerBlockchain.ts`. The ecosystem status check exposes whether a Solana wallet is configured. This is deeper than a dead dependency — it's an active integration.

Confirm the intended state: is TLDriverConnect using the TrustVault blockchain (the Trust Layer L1), Solana, or both? If TrustVault has replaced Solana as the blockchain layer, `trustLayerBlockchain.ts` may need to be updated to use TrustVault instead of Solana. The `trustvaultClient.ts` file exists separately, suggesting TrustVault and Solana are both wired in parallel.

**Fix:** Determine which chain is canonical for hallmark minting. If TrustVault, remove Solana from `trustLayerBlockchain.ts` and `package.json`. If both are intentional (Solana for some things, TrustVault for others), document which routes use which chain.

---

## Priority 2 — Data Issues

### 2.1 Stripe payments wired to OrbitStaffing Financial Hub — confirm the handoff is live

**Commit:** `feat: wire Stripe payments to Orbit Financial Hub for disbursement`

TLDriverConnect sends payment data to the OrbitFinancialHub. Confirm:
- Is `ORBIT_FINANCIAL_HUB_URL` or equivalent configured in Render?
- Does OrbitStaffing's financial hub actually receive and process these events?
- Is there a retry mechanism if the Hub is down when a payment fires?

If the Hub isn't receiving events, payment disbursement is silently failing.

---

### 2.2 Stripe payment verification loop searches up to 100 sessions — performance risk

**Commit:** `fix: critical payment verify - search up to 100 Stripe sessions`

Searching 100 Stripe sessions to find a matching payment is an O(n) scan of the Stripe API. At scale (or with a slow Stripe API response), this will timeout or slow down the payment confirmation flow.

**Fix:** Store the Stripe `session_id` in the database when the checkout is created (on the redirect to Stripe). Verify by looking up that single session ID directly. The 100-session scan is a workaround for not storing the session ID — fix the root cause instead.

---

### 2.3 `orbit-staffing-handoff.tsx` is a public page

**File:** `client/src/pages/orbit-staffing-handoff.tsx`

Same issue as HappyEats — an internal planning document rendered as an accessible app page. Delete or admin-gate it.

---

## Priority 3 — Features That Need Verification

### 3.1 CDL directory — data source

**File:** `client/src/pages/cdl-directory.tsx`

Confirm whether the CDL directory displays real data from the database or static/seeded data. If it's seeded, note it clearly in the UI. If it's real, confirm the data entry flow (who adds CDL records, how they're verified).

---

### 3.2 GPS finder and fuel finder — API or static

**Files:** `client/src/pages/gps-finder.tsx`, `client/src/pages/fuel-finder.tsx`

These features suggest integration with a GPS or fuel station data API. Confirm:
- Are these using a live third-party API (e.g., GasBuddy, Open Charge Map, TomTom)?
- Or are they displaying static/seeded station data?
- If using a third-party API, is the API key configured in Render?

---

### 3.3 Trust Layer Hub timeout — confirm failure handling after the fix

**Last commit:** `fix: add 5s timeout to all Trust Layer hub fetch calls`

Same question as OrbitStaffing's blockchain timeout. When a Hub call times out:
- Does the operation complete locally (vendor created, order logged) and the Hub sync is marked as pending for retry?
- Or does the entire request fail and return 500 to the user?

The correct pattern: local operation succeeds first, Hub sync is best-effort with a retry queue. A Hub timeout should never block a vendor signing up or an order being placed.

---

### 3.4 TrustVault — confirm production endpoint

**Commit:** `Update TrustVault connection details to use production environment`

The `trustvaultClient.ts` was updated to point at the production TrustVault endpoint. Confirm:
- `TRUSTVAULT_URL` in Render points to production, not a dev/staging URL
- TrustVault API keys are configured
- The TrustVault production environment is actually live

---

### 3.5 Social connectors — same question as HappyEats

Both repos share the same `social-connectors.ts`. Same verification needed: which platforms have live credentials, are token refresh flows in place for Facebook/Instagram, is the marketing scheduler failing silently on unconfigured connectors?

---

## What Exists in TLDriverConnect but Not HappyEats (Unique Pages)

These pages are TLDriverConnect-specific and need individual verification that they're pulling live data (not mocks):

| Page | What It Does | Data Source Verified? |
|---|---|---|
| `cdl-directory.tsx` | CDL driver directory | ? |
| `fuel-finder.tsx` | Fuel station locator | ? |
| `gps-finder.tsx` | GPS route finder | ? |
| `truck-map.tsx` | Truck location map | ? |
| `trucker-talk.tsx` | Community/chat | DB-backed (chat-ws) |
| `id-badge.tsx` | Driver ID badge | TL ID from DB |
| `revenue-tracker.tsx` | Revenue dashboard | **MOCK DATA — not live** |
| `business-suite.tsx` | Business tools | ? |
| `everyday.tsx` | Daily driver tools | ? |
| `trust-vault.tsx` | TrustVault UI | Depends on TrustVault live |
| `user-dashboard.tsx` | User dashboard | ? |
| `owner-account.tsx` | Owner account view | ? |
| `tl-landing.tsx` | TL-branded landing | Static |
| `customer-guide.tsx` | Customer manual | Static |
| `owner-guide.tsx` | Owner manual | Static |
| `vendor-guide.tsx` | Vendor manual | Static |
| `operator-guide.tsx` | Operator manual | Static |

---

## Environment Variables — Full Checklist

Confirm all of these are set in Render production:

| Var | Required For | Confirm |
|---|---|---|
| `DATABASE_URL` | All DB operations | ✅ / ❌ |
| `HE_JWT_SECRET` | Auth tokens (if using same var as HE) | ✅ / ❌ |
| `STRIPE_SECRET_KEY` | Payments | ✅ / ❌ |
| `STRIPE_WEBHOOK_SECRET` | Webhook validation | ✅ / ❌ |
| `TWILIO_ACCOUNT_SID` | SMS | ✅ / ❌ |
| `TWILIO_AUTH_TOKEN` | SMS | ✅ / ❌ |
| `TWILIO_PHONE_NUMBER` | SMS | ✅ / ❌ |
| `OPENAI_API_KEY` | AI flyer generation | ✅ / ❌ |
| `APP_URL` | Stripe redirects | ✅ / ❌ |
| `TRUSTLAYER_HUB_URL` | Ecosystem sync | ✅ / ❌ |
| `TRUSTLAYER_HUB_API_KEY` | Ecosystem sync | ✅ / ❌ |
| `TRUSTLAYER_HUB_API_SECRET` | Ecosystem sync | ✅ / ❌ |
| `SOLANA_WALLET_PRIVATE_KEY` | Blockchain (if still Solana) | ✅ / ❌ |
| `TRUSTVAULT_URL` | TrustVault integration | ✅ / ❌ |

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 1.1 | Ecosystem identifies app as "Happy Eats" — copy-paste bug | CRITICAL | FIX NOW |
| 1.2 | Revenue tracker shows hardcoded mock data — "Kathy's default %" | HIGH | OPEN |
| 1.3 | @solana/web3.js active via trustLayerBlockchain.ts — clarify Solana vs TrustVault | HIGH | OPEN |
| 2.1 | Stripe → OrbitFinancialHub handoff — confirm live and retryable | HIGH | VERIFY |
| 2.2 | Stripe verification scans 100 sessions — O(n) performance risk | MEDIUM | OPEN |
| 2.3 | orbit-staffing-handoff.tsx is a public page | MEDIUM | OPEN |
| 3.1 | CDL directory — confirm data source (live vs. static) | MEDIUM | VERIFY |
| 3.2 | GPS/fuel finder — confirm live API or static | MEDIUM | VERIFY |
| 3.3 | Hub timeout — confirm local operation completes before Hub sync | HIGH | VERIFY |
| 3.4 | TrustVault — confirm production endpoint live | HIGH | VERIFY |
| 3.5 | Social connectors — verify platforms are actually posting | MEDIUM | VERIFY |
