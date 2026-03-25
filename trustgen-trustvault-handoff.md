# TrustGen + TrustVault — Independent Review & Handoff

**Repos reviewed:** Cryptocreeper94-sudo/trustgen · Cryptocreeper94-sudo/TrustVault  
**Date:** March 25, 2026  
**Purpose:** Third-party architectural assessment of both projects and how they work together, for agent review and response

---

## Naming Clarification (Fix This First)

There are three repos with confusingly similar names:

| Repo | State | What it is |
|---|---|---|
| `trust-vault` (lowercase) | **Completely empty** | Dead-end repo, no code |
| `TrustVault` (capital T + V) | **386 commits, active** | The real TrustVault app |
| `trustgen` | **Active** | 3D creator tool |

The empty `trust-vault` repo should either be deleted or redirected. Anyone sent to `trust-vault` finds nothing and has no way to know the real repo is `TrustVault`. This is a real discoverability problem.

---

## What These Two Projects Are

### TrustVault
The central hub of the ecosystem. Handles authentication, user management, admin, affiliate tracking, AI routes, blockchain integration, and SSO identity. Was previously called **DW Media Studio** — rebranded to TrustVault on February 21, 2026 (roughly one month ago). Built primarily through Replit Agent with 386 commits.

**Stack:** React (client) + Express/TypeScript (server) + PostgreSQL  
**Server modules:** `agent/`, `ai/`, `blockchain/`, `trustLayerSSO.ts`, `routes.ts`  
**Pages:** Admin, Affiliate, Explorer, Developer Explorer, and more

### TrustGen
A browser-based 3D content creation tool. Previously used Meshy.ai for 3D generation — recently replaced with an in-house procedural geometry engine. Includes an animation system with IK (inverse kinematics), a motion library, a character creator, an environment builder with era-specific asset sets, and a story mode. Also houses "Lume Studio" — a no-code site builder that publishes to `.tlid.io` subdomains.

**Stack:** React + TypeScript + Vite + Three.js (via React Three Fiber) + GSAP + Stripe  
**Notable deps:** `@monaco-editor/react` (in-browser code editor), `@react-three/postprocessing`, `zustand`, `immer`  
**Server modules:** `trustLayerApi.ts`, `hallmark.ts`, `affiliate.ts`, `ecosystem.ts`

### How They Connect
Both apps authenticate users through `dwtl.io` — the central Trust Layer identity service. Authentication uses HMAC-SHA256 signed requests between services and a token exchange pattern for SSO. Users have a `trust_layer_id` / `uniqueHash` that follows them across all apps in the ecosystem. Published sites from Lume Studio get `.tlid.io` subdomains. The broader ecosystem also includes the Lume language and Lumeline (sports betting app).

---

## What's Architecturally Strong

### HMAC-SHA256 Inter-Service Auth
TrustGen's `trustLayerApi.ts` signs every request to the Trust Layer with a canonical string:
```
METHOD:PATH:API_KEY:TIMESTAMP:BODY_HASH
```
Then HMAC-SHA256 signs it with the API secret. This is proper inter-service security. Most projects at this stage just pass a raw API key in a header. Doing it right from the start is a good sign.

### SSO Token Exchange Pattern
TrustVault's SSO flow in `trustLayerSSO.ts` is correctly designed:
1. Receive SSO token from client
2. Try exchange via `/api/auth/exchange-token` at dwtl.io
3. Fall back to bearer verification via `/api/auth/me` if exchange fails
4. Verify email is present before accepting
5. Issue a new local session token

Two-stage fallback (exchange → verify) is the right approach for resilience. The token exchange itself is clean.

### Multi-Tenant Architecture in TrustGen
The `tenants` table in TrustGen's DB schema from day one — with per-tenant feature flags in JSONB — is forward-thinking. Most projects bolt multi-tenancy on later and pay the refactoring cost. Building it in upfront means TrustGen can eventually be white-labeled or sold as a platform.

### Procedural Geometry Recipe System
TrustGen's engine has a `recipes/` directory with geometry recipes for all 87 environment assets (30 modern, 28 medieval, 29 wild west). Each asset has a node-based procedural definition. Switching from an external API (Meshy.ai) to a self-contained procedural system is the right long-term move for cost control and reliability — as long as the actual generation is fully working (see concerns below).

### Sustained Velocity
386 commits on TrustVault and 30 commits on TrustGen, both actively worked on. The ecosystem is moving. The SSO module was added one hour before this review was written, which shows active development.

---

## The Concerns

### Concern 1: dwtl.io Is a Single Point of Failure for the Entire Ecosystem

Every app in the ecosystem — TrustVault, TrustGen, Lumeline, presumably others — authenticates through `dwtl.io`. If that service goes down, becomes slow, or has an outage, **nothing in the ecosystem can log in**.

TrustVault's SSO handler does this:
```ts
const r = await fetch(DWTL_BASE + "/api/auth/exchange-token", { ... });
if (r.ok) ecosystemUser = await r.json();
```

There is no documented fallback. If this fetch fails (network error, timeout, dwtl.io outage), the user gets a 401.

**What's needed:**
- A degraded mode where local credentials work even if dwtl.io is unreachable
- A health check for dwtl.io that the frontend can surface to users ("External login temporarily unavailable — use your email and password instead")
- Explicit timeout handling on all outbound calls to dwtl.io with a reasonable ceiling (e.g., 3 seconds)
- Circuit breaker pattern: if dwtl.io has failed 3 times in a row, stop trying for 60 seconds and serve from local auth only

**Impact:** Critical. A multi-app ecosystem with a single auth dependency is one outage away from total lockout.

---

### Concern 2: The Default JWT Secret Is a Live Security Risk

In `trustgen/server/index.ts`:
```ts
const JWT_SECRET = process.env.JWT_SECRET || 'trustgen-dev-secret-change-me'
```

If the `JWT_SECRET` environment variable is not set in the production deployment, every JWT token is signed with the string `'trustgen-dev-secret-change-me'` — which is now publicly visible in the GitHub repo. Anyone who reads this file can:
- Forge any user's session token
- Grant themselves admin privileges
- Impersonate any account

**What's needed:**
```ts
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET must be set in production');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET || 'trustgen-dev-secret-change-me';
```

The server should refuse to start in production without this variable set. Verify the Render/Railway deployment config has `JWT_SECRET` explicitly configured. Also verify TrustVault has the same check — look for any similar fallback secrets in its server code.

**Impact:** Critical if not already set in production. One line fix with a hard startup guard.

---

### Concern 3: Three Auth Paths With Undefined Priority and Failure Behavior

TrustGen has:
1. Local auth (bcrypt password + JWT)
2. Trust Layer SSO (token exchange with dwtl.io)
3. Ecosystem credential sync (syncs new users to dwtl.io on registration)

TrustVault has:
1. Local auth
2. Trust Layer SSO

**The problems:**
- When a user tries to log in and local auth fails, does it automatically try SSO? Is the user told this is happening?
- If a user changes their password on dwtl.io, does TrustGen's local password get out of sync? What happens on their next login?
- If a user registers on TrustGen, `syncUserToEcosystem()` is called to sync to dwtl.io. What happens if that sync fails? Is the user created locally only, or does the registration roll back?
- What if the same email exists in both local auth and the Trust Layer with different passwords?

**What's needed:**
A documented and implemented auth priority order:
```
1. Try local auth
2. If local fails → try Trust Layer SSO
3. If both fail → 401
4. On successful SSO login → update local password hash to stay in sync
```

Each step should fail loudly with a specific error, not silently fall through.

**Impact:** High. Silent auth failures or lockouts from password divergence are bad user experiences that are hard to debug.

---

### Concern 4: TrustVault Has 386 Commits and No README

The commit history shows TrustVault was built almost entirely through Replit Agent (commit messages contain Replit checkpoint IDs and screenshot URLs). That's a fast way to build, but it means the human understanding of the codebase may be shallow.

A project this complex — multi-tenant auth, SSO, blockchain integration, AI routes, affiliate system, admin panel — with no README is a serious onboarding problem. Any new developer, collaborator, or agent working on this has to reverse-engineer the entire system from code.

**What's needed at minimum:**
- A README covering: what TrustVault is, how to run it locally, what environment variables are required, what the server module structure is, and how it connects to dwtl.io
- The same for TrustGen
- A top-level ecosystem diagram showing how TrustVault, TrustGen, Lume, Lumeline, and dwtl.io all relate to each other

**Impact:** Medium on the technical side, high on the collaboration and maintainability side.

---

### Concern 5: The Recent Rebrand Is Only Skin-Deep

TrustVault was "DW Media Studio" until February 21 — one month ago. The commit that did the rename says:
> "Replace all instances of 'DW Media Studio' with 'TrustVault' across the application, including frontend, backend, and configuration files."

A find-and-replace rebrand often misses:
- Third-party service registrations (Stripe dashboard, SendGrid, Twilio account names)
- Email templates that went out to users
- Any cached metadata in dwtl.io that still refers to the old name
- App store listings if applicable
- Legal/terms of service documents
- Any database rows where the name was stored as data (not code)

**What's needed:** A manual audit of every external service and database table that might still reference "DW Media Studio". A search for the old name across all repos including TrustGen, Lumeline, and Lume.

**Impact:** Low technically, but brand confusion erodes trust (especially for a product named TrustVault).

---

### Concern 6: The In-House 3D Engine Scope Is a Major Bet That Needs Verification

The commit that removed Meshy.ai says:
> "feat: strip Meshy.ai — all generation now in-house procedural engine"

This is a very large architectural decision. Building a browser-based procedural 3D geometry engine that can generate 87+ distinct environment assets (commercial jet airplane, helicopter, stagecoach, ox cart, medieval buildings, etc.) from recipe definitions is a significant engineering undertaking.

The recipes exist — 87 assets have geometry node definitions. But key questions remain:
- Is `composeFromRecipe()` fully implemented and working for all 87 assets?
- Is GLB batch export actually functional?
- Does IK rigging work for characters that "need rigging" (the commit notes "Saddled Horse — needs rigging" for two assets)?
- Does the story mode work end-to-end with the procedural engine?

**What's needed:** An explicit smoke test of the full pipeline — generate a character, place them in an environment, add an animation, export as GLB, and verify the output is valid. This should be a documented process that can be re-run after any engine change.

**Impact:** High if gaps exist. If the 3D engine is the core value proposition of TrustGen and it only works partially, the product is incomplete in a fundamental way.

---

### Concern 7: Blockchain Integration Is Underspecified

TrustVault has a `server/blockchain/` directory with routes. The blockchain client signs GET requests with HMAC headers. But from the outside, it's unclear:
- What blockchain is being used? (Ethereum, Solana, a private chain, just the term "blockchain" as a metaphor?)
- What data is being stored on-chain vs. in PostgreSQL?
- What is a "hallmark"? (`hallmarks` table exists in TrustGen, `trust_stamps` table references similar concepts)
- What is the relationship between `hallmark_id`, `trust_layer_id`, and `uniqueHash`?

The terminology ("blockchain", "hallmark", "trust stamp") is evocative but the implementation may be more centralized than the language implies. If `dwtl.io` is just a regular database that calls itself a blockchain, that's a credibility issue. If it's actually on-chain, the latency and cost implications need to be documented.

**Impact:** Medium. Needs a clear technical spec of what "blockchain" means in this context and what guarantees it provides.

---

## Questions for the Agent

1. Is `JWT_SECRET` explicitly set in the Render/Railway production environment for TrustGen? Can you confirm the app starts without the fallback string being used?

2. What is the defined auth priority order when a user tries to log in to TrustGen? If local auth fails, does it automatically try SSO, and is the user told this is happening?

3. If `dwtl.io` goes down, can users still log in to TrustVault and TrustGen? What is the fallback?

4. Is `composeFromRecipe()` fully working for all 87 environment asset recipes? Are there any that are defined but not yet generating correctly?

5. What does "blockchain" specifically mean in this codebase — is it a real distributed ledger, or a centralized database with blockchain-style terminology?

6. Is there a password sync mechanism when a user changes their credentials in the Trust Layer vs. locally in TrustGen or TrustVault?

7. The `trust-vault` (lowercase) repo is completely empty — should it be deleted?

---

## Priority Action List

| Priority | Action | Affected Repo | Effort |
|---|---|---|---|
| 1 | Add startup guard: refuse to start if `JWT_SECRET` unset in production | trustgen/server | Trivial |
| 2 | Verify `JWT_SECRET` is set in all production deployments | Render/Railway config | Trivial |
| 3 | Define and document the auth fallback chain (local → SSO → error) | trustgen + trustvault | Low |
| 4 | Add timeout + circuit breaker on all dwtl.io calls | trustgen + trustvault | Low-Medium |
| 5 | Delete or archive the empty `trust-vault` repo | GitHub | Trivial |
| 6 | Write a README for TrustVault and TrustGen | Both repos | Medium |
| 7 | Audit for remaining "DW Media Studio" references in external services | Manual | Low |
| 8 | Smoke test the full TrustGen 3D pipeline end-to-end | trustgen | Medium |
| 9 | Write a clear technical spec for what "blockchain" means in this system | Documentation | Low |
| 10 | Draw an ecosystem diagram showing all apps, their auth flows, and data dependencies | Documentation | Low |

---

## Bottom Line

The ecosystem architecture — shared TLID identity, HMAC inter-service auth, SSO token exchange — is the right pattern and is implemented correctly in concept. TrustGen is genuinely ambitious in scope and the decision to build a self-contained procedural 3D engine is bold.

The real risks are:
- **Security**: the default JWT secret is a one-line fix with critical impact if missed
- **Resilience**: the entire ecosystem has one auth dependency with no documented fallback
- **Completeness**: the 3D engine needs end-to-end verification after the Meshy.ai removal
- **Documentation**: 386 commits of AI-assisted development with no README leaves the codebase opaque

Fix the security items first. Everything else can follow.
