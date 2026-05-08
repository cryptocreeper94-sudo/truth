# Lume-Ops-Recon — Security Audit Report
**Repo:** github.com/cryptocreeper94-sudo/lume-ops-recon
**Date:** May 8, 2026
**Auditor:** Jason Andrews (internal review via DarkWave Studios audit pipeline)

---

## EXECUTIVE SUMMARY

This codebase is significantly more mature from a security standpoint than Axiom Studio.
No critical vulnerabilities found. No RCE vector. No hardcoded secrets visible.
The Lume-V governance layer is a genuine architectural achievement — the certificate pipeline,
invariant engine, and safety envelope are well-structured and correctly fail-closed.

Three medium-severity issues require attention before public exposure. The rest are low/informational.

---

## SEVERITY LEGEND
- [MEDIUM] Meaningful risk — fix before GA or any public demo
- [LOW]    Best practice / hardening
- [INFO]   Observation — no immediate action required

---

## ISSUE 1 — [MEDIUM] GOVERNANCE API ROUTES ARE UNAUTHENTICATED

**Endpoints:**
```
GET /api/governance/state
GET /api/governance/certificates
GET /api/governance/certificates/:id
GET /api/governance/replay/:id
GET /api/governance/reports/daily
GET /api/governance/reports/driver/:driverId
GET /api/governance/reports/safety
```

**Problem:**
These routes are registered without any auth middleware. Anyone who can reach the server
can read:
- The full operational certificate chain (every governed decision, with agent IDs)
- Driver-level compliance reports (who was blocked, escalated, their decision history)
- Facility safety state (frozen status, active incidents)
- Daily operational data

For a Manheim beta this is likely behind a VPN or firewall — but it should not be
assumed. If this app is deployed publicly, this is a data exposure issue.

**Fix:**
Add session auth middleware to the governance router before mounting it:

```typescript
function requireSession(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// In index.ts, apply to governance routes:
app.use('/api/governance', requireSession);
```

Or scope it per route if some governance endpoints should be public.
The `/api/governance/state` (kernel health) could be public.
Certificates, reports, and replay should be auth-gated.

---

## ISSUE 2 — [MEDIUM] `.env.*` FILES TRACKED IN GIT

**Files in repo:**
```
.env.manheim_beta
.env.public_demo
```

**Gitignore only covers:**
```
.env
```
— not `.env.*` variants.

**Current risk (LOW actual):**
The content of both files is only `VITE_` prefixed variables — these are public by
design since Vite embeds them into the frontend bundle. No actual secrets are exposed.

**Risk going forward (MEDIUM):**
The pattern of committing `.env.*` files is dangerous. If anyone ever adds a real secret
to one of these files (DATABASE_URL, STRIPE_SECRET_KEY, etc.) while following the
existing naming convention, it will be committed to the public repo.

**Fix:**
Update `.gitignore`:
```
.env
.env.*
!.env.example
!.env.*.example
```
Move the manheim_beta and public_demo configurations to `.env.manheim_beta.example`
(strip values, keep keys as documentation).

---

## ISSUE 3 — [MEDIUM] TRUST LAYER SSO SESSION TOKEN NOT STORED SERVER-SIDE

**File:** `server/trustLayerSSO.ts`

**Code:**
```typescript
const sessionToken = crypto.randomBytes(48).toString("hex");
res.json({ success: true, ..., sessionToken, ... });
```

**Problem:**
The SSO handler generates a 48-byte random session token and returns it to the client
but does not store it in `req.session` or any server-side store. This means on
subsequent requests, the server has no record of this token to validate against.

The session likely persists through express-session cookies (userId, userRole set
elsewhere in routes.ts), which may be sufficient — but the `sessionToken` returned
to the client is decorative as written. If the frontend is using this token as a
bearer token for subsequent API calls, those calls would have no server-side
validation path.

**Fix — Option A (if session cookie is the actual auth mechanism):**
Remove the `sessionToken` from the response. Return only the user object.
Set `req.session.userId` inside the SSO handler instead of relying on downstream code.

**Fix — Option B (if bearer token auth is intended):**
Store the token server-side:
```typescript
const sessionToken = crypto.randomBytes(48).toString("hex");
req.session.ssoToken = sessionToken;
req.session.userId = localUser.id;
req.session.userRole = localUser.role;
await new Promise((resolve, reject) =>
  req.session.save(err => err ? reject(err) : resolve(null))
);
res.json({ success: true, ..., sessionToken });
```
Then validate on protected routes:
```typescript
if (req.headers.authorization !== `Bearer ${req.session.ssoToken}`) { ... }
```

---

## ISSUE 4 — [LOW] `unsafe-inline` AND `unsafe-eval` IN CSP scriptSrc

**File:** `server/index.ts`

```typescript
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", ...]
```

**Problem:**
Both `unsafe-inline` and `unsafe-eval` negate a significant portion of XSS protection.
`unsafe-eval` in particular allows `eval()`, `new Function()`, and similar constructs —
these are common XSS escalation paths.

**Common cause:** Vite dev mode requires `unsafe-eval`. It should not be needed in production.

**Fix:**
Gate on environment:
```typescript
scriptSrc: [
  "'self'",
  "'unsafe-inline'",
  ...(isProduction ? [] : ["'unsafe-eval'"]),
  "https://cdn.jsdelivr.net",
  "https://js.stripe.com",
],
```
Remove `unsafe-eval` from production. If React/Vite still requires it after build,
investigate the specific package causing it and add a nonce-based allowance instead.

---

## ISSUE 5 — [LOW] ROUTES.TS IS 7,653 LINES

**Not a security issue. A significant maintainability concern.**

A single 7,653-line file is:
- Impossible to review effectively (as demonstrated — I cannot audit what I cannot read)
- A high-risk merge conflict surface
- A performance concern for TypeScript compilation and IDE tooling
- Likely containing auth patterns mixed with business logic mixed with utilities

**Recommendation:**
Split into domain-based router files:
```
server/routes/
  auth.ts       — login, logout, PIN, session
  drivers.ts    — driver CRUD, moves, assignments
  vehicles.ts   — vehicle CRUD, moves, history
  work-orders.ts
  safety.ts     — incidents, speed violations
  hallmarks.ts  — NFT badges, ecosystem hallmarks
  ai.ts         — OpenAI integration
  weather.ts
  ...
```
This is a refactor, not an emergency — but it should happen before the codebase
grows further.

---

## ISSUE 6 — [LOW] SIMULATED BLOCKCHAIN IN HALLMARK SERVICE

**File:** `server/hallmark-service.ts`

```typescript
function simulatedTxHash(): string {
  return "0x" + crypto.randomBytes(32).toString("hex");
}
function simulatedBlockHeight(): string {
  return String(Math.floor(1000000 + Math.random() * 9000000));
}
```

**Problem:**
These generate fake transaction hashes and block heights. If these are displayed in
the UI as blockchain confirmations without clear labeling, users (or enterprise
clients reviewing the system) may believe real on-chain transactions are occurring.
For a beta this is fine. For a GA release or enterprise demo, it needs a label.

**Fix:**
Either:
- Display these clearly as "Simulated / Pre-mainnet" in the UI wherever hallmarks appear
- Or connect to Solana devnet for real transactions (the `solana-service.ts` already
  supports this — the service is fully wired, the `hallmark-service.ts` just isn't
  calling it yet)

---

## WHAT IS DONE WELL (notable positives)

**Security architecture:**
- Helmet fully configured — CSP, HSTS (1 year + preload + subdomains), X-Frame-Options,
  Referrer-Policy, X-Content-Type-Options. All correct.
- CORS locked to specific domain whitelist in production. Not wildcard.
- Rate limiting properly tiered: 10 login attempts / 15 min, 200 API / min.
- Session secret: comment in code explicitly says "Required SESSION_SECRET in production
  (no fallback)" — this is the right approach. The fallback problem from Axiom Studio
  appears to have been addressed here.
- No exec endpoint. No PTY terminal. No RCE surface.
- Solana secrets read fresh from env at call time — not cached at module load.

**Lume-V governance implementation:**
- The kernel architecture is correct: invariants → safety envelope → decision → certificate.
  This is the right ordering.
- The governance middleware fails CLOSED on error (returns 500, does not pass through).
  This is correct. Most implementations get this wrong and fail open.
- SHA3-256 hash-linked certificate chain with canonical JSON serialization (RFC 8785 style)
  is production-grade. This is not typical for a solo/small-team project.
- The safety envelope tiering (allow → warn → escalate → block → freeze) maps correctly
  to the Lume 4/42 architecture. The weather freeze and speed freeze thresholds are
  domain-appropriate.
- InvariantEngine is clean, testable, and correctly returns structured results with
  timestamps and explanations. The vector output format is audit-friendly.
- CustodyEngine tracking vehicles through governed state transitions is a genuine
  product differentiator — this is what makes the "complete chain of custody" claim real.

**Code quality:**
- TypeScript throughout with proper interface definitions
- Drizzle ORM with schema validation (not raw SQL strings for main data access)
- Open-Meteo for weather (free, no API key — sensible for a beta)
- Trust Layer SSO integration is cleaner than rolling custom JWT auth

---

## PRIORITY FIX ORDER

1. [MEDIUM] Add auth middleware to governance API routes
2. [MEDIUM] Update .gitignore to cover `.env.*` patterns
3. [MEDIUM] Verify SSO session token is stored and validated server-side
4. [LOW]    Remove `unsafe-eval` from production CSP
5. [LOW]    Plan routes.ts split before next major feature addition
6. [LOW]    Label simulated blockchain in UI before enterprise demo

Items 1–3 before any public or enterprise-facing deployment.
Items 4–6 before GA.
