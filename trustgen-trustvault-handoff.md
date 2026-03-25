# TrustGen + TrustVault — Independent Review & Handoff

**Repos reviewed:** Cryptocreeper94-sudo/trustgen · Cryptocreeper94-sudo/TrustVault  
**Original review date:** March 25, 2026  
**Updated:** March 25, 2026 (evening — reflects commits pushed today)  
**Purpose:** Third-party architectural assessment of both projects and how they work together, for agent review and response

---

## Fixes Applied Today (March 25)

The following items from the original review were addressed in commits pushed today:

| Item | Status | What Changed |
|---|---|---|
| JWT_SECRET startup guard | **FIXED** | `server/index.ts` now calls `process.exit(1)` with a FATAL message if `JWT_SECRET` is unset in production |
| Misplaced imports inside SQL block | **FIXED** | `registerHallmarkRoutes`, `registerAffiliateRoutes`, `registerEcosystemRoutes` were embedded inside the `initDB()` SQL string — moved to top of file where they belong |
| Missing ecosystem modules | **FIXED** | `affiliate.ts`, `hallmark.ts`, and `ecosystem.ts` added (245 lines) — these were being imported but didn't exist |
| TrustGen README | **FIXED** | Vite template boilerplate replaced with actual description of TrustGen as a procedural 3D platform |

---

## Naming Clarification (Fix This First)

There are three repos with confusingly similar names:

| Repo | State | What it is |
|---|---|---|
| `trust-vault` (lowercase) | **Completely empty** | Dead-end repo, no code |
| `TrustVault` (capital T + V) | **Active** | The real TrustVault app |
| `trustgen` | **Active** | 3D creator tool |

The empty `trust-vault` repo should either be deleted or redirected. Anyone sent to `trust-vault` finds nothing and has no way to know the real repo is `TrustVault`. This is a real discoverability problem.

---

## What These Two Projects Are

### TrustVault
The central hub of the ecosystem. Handles authentication, user management, admin, affiliate tracking, AI routes, blockchain integration, and SSO identity. Was previously called **DW Media Studio** — rebranded to TrustVault on February 21, 2026 (roughly one month ago). Built primarily through Replit Agent with 386+ commits.

**Stack:** React (client) + Express/TypeScript (server) + PostgreSQL  
**Server modules:** `agent/`, `ai/`, `blockchain/`, `trustLayerSSO.ts`, `routes.ts`  
**Pages:** Admin, Affiliate, Explorer, Developer Explorer, and more

### TrustGen
A browser-based 3D content creation tool. Previously used Meshy.ai for 3D generation — replaced with an in-house procedural geometry engine. Includes an animation system with IK (inverse kinematics), a motion library, a character creator, an environment builder with era-specific asset sets, and a story mode. Also houses "Lume Studio" — a no-code site builder that publishes to `.tlid.io` subdomains.

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

Two-stage fallback (exchange → verify) is the right approach for resilience within the SSO flow itself. The token exchange is clean.

### Multi-Tenant Architecture in TrustGen
The `tenants` table in TrustGen's DB schema from day one — with per-tenant feature flags in JSONB — is forward-thinking. Most projects bolt multi-tenancy on later and pay the refactoring cost. Building it in upfront means TrustGen can eventually be white-labeled or sold as a platform.

### Procedural Geometry Recipe System
TrustGen's engine has a `recipes/` directory with geometry recipes for all 87 environment assets (30 modern, 28 medieval, 29 wild west). Each asset has a node-based procedural definition. Switching from an external API (Meshy.ai) to a self-contained procedural system is the right long-term move for cost control and reliability — as long as the actual generation is fully working (see concerns below).

### Sustained Velocity
Both repos are actively developed. Three new commits dropped in TrustGen today directly fixing issues from this review, with accurate commit messages and real code changes behind each one.

---

## Remaining Concerns

### Concern 1: dwtl.io Is a Single Point of Failure for the Entire Ecosystem

Every app in the ecosystem — TrustVault, TrustGen, Lumeline, presumably others — authenticates through `dwtl.io`. If that service goes down, becomes slow, or has an outage, **nothing in the ecosystem can log in**.

The current `trustLayerSSO.ts` code does two attempts to dwtl.io:
```ts
const r = await fetch(DWTL_BASE + "/api/auth/exchange-token", { ... });
// if that fails, tries /api/auth/me
```

Both calls have no timeout specified and no local fallback. If dwtl.io is unreachable, the user gets a 401 with no explanation and no alternative.

**What's needed:**
- Explicit request timeout on all outbound dwtl.io calls (e.g. `AbortSignal.timeout(3000)`)
- A circuit breaker: if dwtl.io fails N times in a row, stop trying for 60 seconds and route users to local auth
- A health check endpoint that the frontend can poll — surface "External login temporarily unavailable" to users instead of a silent 401
- A degraded mode where users with local credentials can still log in even if dwtl.io is down

**Impact:** Critical. One outage locks every user out of every app simultaneously.

---

### Concern 2: Three Auth Paths With Undefined Priority and Failure Behavior

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

### Concern 3: TrustVault Has No README

TrustVault has 386+ commits of active development — multi-tenant auth, SSO, blockchain integration, AI routes, affiliate system, admin panel — and no README. A 404 on `README.md` is what greets anyone who opens the repo.

TrustGen now has a README (fixed today). TrustVault still does not.

**What's needed at minimum:**
- What TrustVault is and what it does
- How to run it locally (required environment variables, database setup)
- What the server module structure is (`agent/`, `ai/`, `blockchain/`, `trustLayerSSO.ts`)
- How it connects to dwtl.io
- A top-level ecosystem diagram showing how TrustVault, TrustGen, Lume, Lumeline, and dwtl.io all relate to each other

**Impact:** Medium technically, high for collaboration and maintainability.

---

### Concern 4: The In-House 3D Engine Needs End-to-End Verification

The commit that removed Meshy.ai says:
> "feat: strip Meshy.ai — all generation now in-house procedural engine"

Building a browser-based procedural 3D geometry engine capable of generating 87+ distinct environment assets is a significant undertaking. The recipes exist — but key questions remain:
- Is `composeFromRecipe()` fully implemented and working for all 87 assets?
- Is GLB batch export actually functional?
- Does IK rigging work for characters that "need rigging" (the commit notes "Saddled Horse — needs rigging" for at least two assets)?
- Does the story mode work end-to-end with the procedural engine?

**What's needed:** An explicit smoke test of the full pipeline — generate a character, place them in an environment, add an animation, export as GLB, verify the output is valid. This should be a documented process that can be re-run after any engine change.

**Impact:** High if gaps exist. If the 3D engine is the core value proposition and it only works partially, the product is incomplete in a fundamental way.

---

### Concern 5: Blockchain Integration Is Underspecified

TrustVault has a `server/blockchain/` directory with routes. The blockchain client signs GET requests with HMAC headers. But from the outside:
- What blockchain is being used? (Ethereum, Solana, a private chain, or "blockchain" as a metaphor?)
- What data is stored on-chain vs. in PostgreSQL?
- What is a "hallmark"? (`hallmarks` table exists in TrustGen, `trust_stamps` references similar concepts)
- What is the relationship between `hallmark_id`, `trust_layer_id`, and `uniqueHash`?

The terminology ("blockchain", "hallmark", "trust stamp") is evocative but the implementation may be more centralized than the language implies.

**Impact:** Medium. Needs a clear technical spec of what "blockchain" means in this context and what guarantees it provides.

---

### Concern 6: The Recent Rebrand May Be Incomplete

TrustVault was "DW Media Studio" until February 21. A find-and-replace rebrand often misses:
- Third-party service registrations (Stripe dashboard, SendGrid, Twilio account names)
- Email templates that went out to users before the rename
- Any cached metadata in dwtl.io that still refers to the old name
- Legal/terms of service documents
- Database rows where the name was stored as data, not code

**What's needed:** A manual audit of every external service that might still reference "DW Media Studio". Search for the old name across all repos including TrustGen, Lumeline, and Lume.

**Impact:** Low technically, but brand confusion erodes trust — especially for a product named TrustVault.

---

## Priority Action List (Updated)

| Priority | Action | Affected Repo | Effort | Status |
|---|---|---|---|---|
| 1 | Add startup guard for `JWT_SECRET` in production | trustgen/server | Trivial | **DONE** |
| 2 | Fix misplaced module imports inside SQL block | trustgen/server | Trivial | **DONE** |
| 3 | Add missing ecosystem modules (`affiliate.ts`, `hallmark.ts`, `ecosystem.ts`) | trustgen/server | Low | **DONE** |
| 4 | Write TrustGen README | trustgen | Low | **DONE** |
| 5 | Add timeout + circuit breaker on all dwtl.io calls | trustgen + trustvault | Low-Medium | **OPEN** |
| 6 | Define and document the auth fallback chain (local → SSO → error) | trustgen + trustvault | Low | **OPEN** |
| 7 | Write a README for TrustVault | trustvault | Medium | **OPEN** |
| 8 | Delete or archive the empty `trust-vault` repo | GitHub | Trivial | **OPEN** |
| 9 | Smoke test the full TrustGen 3D pipeline end-to-end | trustgen | Medium | **OPEN** |
| 10 | Write a technical spec for what "blockchain" means in this system | Documentation | Low | **OPEN** |
| 11 | Audit for remaining "DW Media Studio" references in external services | Manual | Low | **OPEN** |
| 12 | Draw an ecosystem diagram showing all apps, auth flows, and data dependencies | Documentation | Low | **OPEN** |

---

## Bottom Line

Four real fixes landed today, all confirmed in commit diffs — not cosmetic, not docs-only. The JWT_SECRET guard is the right pattern: hard fail in production, soft fallback in dev. The misplaced-imports fix was a genuine server bug that would have broken startup. The builder is reading feedback and shipping accurate fixes the same day.

What remains is the resilience and documentation layer:

- **dwtl.io** still has no timeout, no circuit breaker, and no local fallback. This is the biggest architectural risk still open.
- **Auth path priority** is still implicit rather than documented and enforced.
- **TrustVault README** is still missing for a 386-commit project.
- **3D engine** still needs an end-to-end smoke test after the Meshy.ai removal.

Fix the dwtl.io resilience next — it's the one issue that can take down every app in the ecosystem simultaneously.
