# DarkWave / Trust Layer Ecosystem — Full Sweep Red Flags Handoff

**Scope:** All 26 unreviewed repos under Cryptocreeper94-sudo (excludes lume, trustgen, TrustVault — covered in separate handoffs)  
**Date:** March 25, 2026  
**Method:** Parallel fetch of repo pages, server files, CI configs, .env files, package.json across all repos  
**Purpose:** Single consolidated red flag list for agent action

---

## Repo Inventory at a Glance

| Repo | Commits | What It Is | README |
|---|---|---|---|
| trust-layer | 3,631 | **dwtl.io** — the entire ecosystem's auth backbone. Rust blockchain + TypeScript server + validator node | ❌ |
| pulse | 1,759 | AI crypto trading platform. Mastra AI agents + Solana smart contracts + darkwave-web + darkwave-mobile | ✅ |
| paintpros | 2,354 | Multi-tenant painting business platform. Solana-verified payments | ❌ |
| lotopspro | 1,720 | Auto auction / lot management AI platform | ❌ |
| orbitstaffing | 1,182 | GPS-verified staffing — franchisee multi-tenant | ❌ |
| TLDriverConnect | 865 | Delivery platform (food + commercial drivers) | ❌ |
| happyeats | 852 | TL Driver Connect variant — tenant-scoped | ❌ |
| garagebot | 787 | 40+ retailer auto parts aggregator, AI recommendations, VIN decoding | ❌ |
| darkwavestudios | 636 | Full-service agency hub. Blockchain-verified code marketplace | ❌ |
| brewandboard | 510 | B2B coffee delivery for Nashville businesses | ❌ |
| orby | 509 | Real-time venue ops — emergency command, inventory, compliance | ❌ |
| TrustHome | 365 | Real estate super app — **React Native / Expo mobile app** | ❌ |
| thevoid | 244 | Cathartic venting app — AI reaction to user frustrations | ❌ |
| Verdara | 186 | Outdoors super app | ❌ |
| vedasolus | 152 | Holistic health platform — Ayurveda/TCM + AI wellness coaching | ❌ |
| Trust-Layer-Hub | 148 | Trust Layer Hub portal | ❌ |
| TrustGolf | 134 | Golf super app — AI swing analysis, course catalog, media editing | ❌ |
| lot-ops-pro-manheim | 78 | LotOpsPro variant — Manheim-specific build | ✅ |
| lumeline | 58 | Sports odds intelligence — oddsmaker scoring, ML predictions | ✅ |
| dwsc | 28 | DarkWave Systems Collective research/engineering portal | ✅ |
| darkwave-studios | 22 | DarkWave Studios site | ❌ |
| signalcast | 15 | Social media automation — cross-platform post scheduling | ❌ |
| guardianscreener | 11 | DEX screener — 12+ chain token scanning, AI Pulse scoring | ✅ |
| chronicles | unknown | Interactive historical narrative engine — 73 eras, Vercel deploy | ❌ |
| Paint-Pros | unknown | Multi-tenant marketing platform — paintpros.io, tradeworksai.io | ❌ |

---

## Red Flags by Severity

---

### CRITICAL

---

#### C1 — trust-layer Has No README With 3,631 Commits and Is the Entire Ecosystem's Backbone

`trust-layer` is the repo behind `dwtl.io` — the single auth hub every other app in the ecosystem calls. It has 3,631 commits, a Rust blockchain implementation (`blockchain/Cargo.toml`), a TypeScript server, a `validator-node/`, `contracts/`, `tests/`, and a `client/`. This is the most complex and most critical repo in the entire ecosystem.

It has **no README**. The server file alone is 20,157 characters. If the person running this project changed, or if an agent needs to work on it, there is no document explaining what it is, how it runs, what environment variables it needs, what the validator node does, or what the blockchain layer guarantees.

**What's needed:**
- README covering: what dwtl.io is, how the blockchain layer works, how the validator node fits in, what the server does, all required env vars, how to run locally
- Architecture diagram of the trust-layer components (blockchain, server, validator, client)

**Impact:** Maximum. This repo going wrong takes down every app in the ecosystem.

---

#### C2 — pulse Has Autonomous Trade Execution and Zero Tests

`pulse` is an AI crypto trading platform that executes autonomous Solana trades. It uses the Mastra AI agent framework (`.mastra/` directory), has real Solana smart contracts in `contracts/dwav-token/`, integrates `darkwave-web` and `darkwave-mobile` as sub-projects, and has a complex multi-step build pipeline.

The `package.json` test script is:
```json
"test": "echo \"Error: no test specified\" && exit 1"
```

There are **zero tests** on an app that autonomously executes financial trades. No unit tests, no integration tests, no CI running on the trade execution logic.

**What's needed:**
- At minimum: unit tests on the trade decision logic (does the AI agent correctly interpret signals before executing?)
- Integration tests on the Solana contract interactions
- CI that actually runs tests on push instead of failing with "no test specified"
- A kill switch / manual override that halts autonomous trading without a code deploy

**Impact:** Critical. A bug in untested autonomous trade execution can drain wallets.

---

#### C3 — JWT Startup Guard Not Propagated Across the Ecosystem

The JWT_SECRET startup guard (`process.exit(1)` if unset in production) was fixed in trustgen today. But the same pattern exists across multiple apps and has not been applied ecosystem-wide.

Apps confirmed using JWT without a startup guard:
- **trust-layer** — the auth backbone
- **signalcast** — multi-platform social media posting (accesses Twitter/X, Facebook, Instagram, LinkedIn, Discord, Telegram)
- Any other app that uses JWT signing but was built before today's trustgen fix

**What's needed:** Apply the same startup guard pattern to every repo that uses `JWT_SECRET`:
```ts
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('FATAL: JWT_SECRET must be set in production')
  process.exit(1)
}
```
Run a search across all repos for `JWT_SECRET || '` to find every instance of an unguarded fallback.

**Impact:** Any app with a default JWT secret in production is fully compromisable.

---

### HIGH

---

#### H1 — 21 Out of 26 Repos Have No README

The README situation is ecosystem-wide, not isolated. Of the 26 repos checked:

**Has README:** pulse, lumeline, dwsc, guardianscreener, lot-ops-pro-manheim (5 of 26)  
**No README:** everything else, including trust-layer, paintpros, lotopspro, orbitstaffing, TLDriverConnect, happyeats, garagebot, darkwavestudios, brewandboard, orby, TrustHome, thevoid, Verdara, vedasolus, Trust-Layer-Hub, TrustGolf, darkwave-studios, signalcast, chronicles, Paint-Pros (21 of 26)

Every one of these is a multi-hundred-commit project. Several (paintpros: 2,354; orbitstaffing: 1,182; darkwavestudios: 636; brewandboard: 510; orby: 509) have substantial codebases that are completely undocumented at the repo level.

**What's needed:** At minimum, every repo needs:
1. What it is (one paragraph)
2. How to run it locally
3. Required environment variables
4. How it connects to the Trust Layer ecosystem

**Impact:** High for maintainability and any collaborative development. An agent working on these repos blind is prone to making wrong assumptions.

---

#### H2 — TrustHome Is a React Native / Expo Mobile App — Not a Web App

`TrustHome` (real estate platform, 365 commits) has `app.json` and `babel.config.js` in its root — this is an **Expo / React Native mobile app**, not a web app. Its server module structure is also unusual: `elevenlabs-client.ts` (voice AI), `media-studio-client.ts`, `orbit-routes.ts` (importing from orbitstaffing), `hallmark.ts`, `affiliate.ts`.

This means it has different deployment requirements, different testing requirements, and different build tooling from every other repo in the ecosystem. If an agent has been treating it as a standard Express+Vite project, changes are likely misconfigured.

**What's needed:**
- Confirm whether the app is being deployed as a mobile app (via Expo / EAS Build / App Store) or as a web app only
- Confirm the orbitstaffing dependency (`orbit-routes.ts`) — is TrustHome a white-labeled orbitstaffing variant?
- README clarifying what platform(s) this targets

---

#### H3 — chronicles Deploys to Vercel, Inconsistent With the Rest of the Ecosystem

`chronicles` has a `vercel.json` in its root and no `render.yaml` or Replit deployment config. Every other active app in the ecosystem appears to deploy through Render or Replit. Chronicles is on Vercel — a separate platform with separate environment variable configuration, separate logging, and separate deployment pipeline.

If the ecosystem agent is managing deployments across all repos and doesn't know chronicles is on Vercel, it will be looking in the wrong place for logs, environment variables, and deployment status.

**What's needed:** Either migrate chronicles to the standard deployment target or explicitly document that it runs on Vercel so the agent knows where to look.

---

#### H4 — Stripe Webhook Signature Validation Needs Verification Across Payment Apps

Multiple apps in the ecosystem accept Stripe payments: `paintpros`, `orbitstaffing`, `TLDriverConnect`, `vedasolus`, `TrustGolf`, `brewandboard`, and potentially others.

A standard Stripe integration risk: webhook handlers that accept Stripe events without verifying the `stripe-signature` header using `stripe.webhooks.constructEvent()`. If validation is missing, anyone can POST fake Stripe events to trigger payment confirmations, subscription upgrades, or payout releases.

**What's needed:** For every repo that handles Stripe webhooks, confirm that `stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET)` is called before processing any webhook event. This should be a one-pass code review across all payment-integrated repos.

---

#### H5 — signalcast Has Live Social Media Credentials With No Tests and Only 15 Commits

`signalcast` (social media automation) is at 15 commits. It integrates with Twitter/X, Facebook, Instagram, LinkedIn, Discord, Telegram, and Reddit. It is capable of posting to all of these platforms automatically.

15 commits is extremely early for a system that has write access to production social media accounts. There is no CI test configuration for the posting logic.

**What's needed:**
- Do not connect production social media credentials to signalcast until the core posting logic has test coverage
- CI should mock social platform APIs and verify that the right content is sent before any live posting occurs
- Rate limit handling and posting failure recovery should be tested before live use

**Impact:** A bug in signalcast at 15 commits could spam followers across all platforms simultaneously with bad output.

---

### MEDIUM

---

#### M1 — orbitstaffing and signalcast Have .env Files Visible in Repo

Both repos have `.env` or `.env.example` files in the repo root visible from the GitHub file tree. The files fetched appear to contain placeholder values only (no real credentials), but they are visible nonetheless.

`orbitstaffing`: `.env.franchisee.example`  
`signalcast`: `.env.example`  
`lumeline`: `.env.example`

The risk is not the example files themselves but the pattern — if any developer copies `.env.example` to `.env` and forgets to add `.env` to `.gitignore`, real credentials get committed. The `.gitignore` should be verified in all three repos.

**What's needed:** Confirm `.env` (the real file) is in `.gitignore` for all repos. The example files themselves are fine.

---

#### M2 — pulse Is a Monorepo Inside a Repo — Build Complexity Is a Risk

`pulse` contains `darkwave-web` and `darkwave-mobile` as directories inside the repo root, along with a Mastra AI agent framework directory (`.mastra/`), Solana smart contracts (`contracts/dwav-token/`), and a multi-stage build script that runs 8+ sequential operations. 

The build command:
```bash
mastra build && tsc ... && mv dist/bootstrap.js dist/bootstrap.mjs && ./scripts/patch-mastra.sh && npm install --prefix .mastra/output ... && cd darkwave-web && npm run build && cp -r dist/* ../public/
```

This is fragile — one step failing silently breaks the entire build. There is no `|| true` suppression (good) but also no documented build failure recovery process.

**What's needed:**
- Each step in the build pipeline should be a named script so failures are identifiable
- The mobile sub-project (`darkwave-mobile`) needs its own build documented separately
- The Mastra agent configuration should be documented — what agents exist, what they do, what they can act on

---

#### M3 — trust-layer Blockchain Uses Rust — Verify the Compiled Artifact Is What's Running

`trust-layer/blockchain/` has `Cargo.toml` and `Cargo.lock` — real Rust code. The compiled output (`target/`) will be large and is typically gitignored. The validator node is also a separate component.

If the agent has been deploying trust-layer assuming it's a pure TypeScript project, the Rust blockchain component may not be compiled and deployed correctly. Rust requires a separate compilation step and the correct target architecture for the deployment host.

**What's needed:** Confirm the Rust blockchain component has a documented build and deploy process. Confirm the `validator-node/` is being deployed separately or confirm its role is handled in the TypeScript layer.

---

#### M4 — happyeats Is Described as a "Tenant-Scoped Version of TL Driver Connect" — Verify It's Not Forked and Diverging

`happyeats` (852 commits) and `TLDriverConnect` (865 commits) exist as separate repos with nearly identical commit counts. If happyeats is a white-label tenant of TLDriverConnect, bug fixes applied to one should be applied to the other — but if they've diverged at 850+ commits each, they are now effectively two separate codebases that will drift further apart with every commit.

**What's needed:** Clarify the relationship between these two repos. If happyeats is supposed to be a tenant configuration of TLDriverConnect, it should be a config flag or a fork that pulls from the upstream — not a separate 852-commit codebase.

---

#### M5 — lot-ops-pro-manheim Appears to Be a Manheim-Specific Fork of lotopspro

`lot-ops-pro-manheim` (78 commits) vs `lotopspro` (1,720 commits). Same pattern as happyeats/TLDriverConnect — a fork of the main product for a specific client or deployment context. At 78 commits vs 1,720, the fork is significantly behind. Any improvement in lotopspro won't be in the Manheim version unless manually ported.

**What's needed:** Determine whether lot-ops-pro-manheim should track lotopspro via a shared base, or whether it's intentionally diverged for Manheim-specific customizations.

---

#### M6 — No Centralized Ecosystem Dependency Map

The Trust Layer ecosystem now has 30+ repos, each of which calls `dwtl.io` for auth, some of which call each other (TrustHome calls orbitstaffing, happyeats is a variant of TLDriverConnect, signalcast likely integrates with TrustVault). There is no documented map of which repos depend on which other repos.

When trust-layer's API changes, there's no way to know which apps will break without reading all 30 repos. When dwtl.io goes down, there's no documented list of impact.

**What's needed:** A single `ECOSYSTEM.md` or diagram at the org level showing:
- Every app and what it does
- Every inter-service call (A calls B's API)
- Which apps have Stripe, which have Solana contracts, which are mobile
- Deploy targets (Render, Vercel, Expo, Replit)

---

## Priority Action List

| Priority | Action | Repos | Effort |
|---|---|---|---|
| 1 | Apply JWT_SECRET startup guard to trust-layer and signalcast | trust-layer, signalcast + any others using JWT | Trivial per repo |
| 2 | Write README for trust-layer | trust-layer | Medium |
| 3 | Add tests and CI to pulse — especially trade execution logic | pulse | High |
| 4 | Verify Stripe webhook signature validation in all payment repos | paintpros, orbitstaffing, TLDriverConnect, vedasolus, TrustGolf, brewandboard | Low-Medium |
| 5 | Clarify TrustHome mobile vs web deployment target | TrustHome | Low |
| 6 | Document that chronicles deploys to Vercel, not Render | chronicles | Trivial |
| 7 | Write READMEs for all 21 repos missing them — minimum version only | All 21 | Medium (batch) |
| 8 | Verify .env is in .gitignore for orbitstaffing, signalcast, lumeline | 3 repos | Trivial |
| 9 | Clarify and consolidate happyeats vs TLDriverConnect relationship | happyeats + TLDriverConnect | Medium |
| 10 | Clarify and consolidate lot-ops-pro-manheim vs lotopspro | Both | Low-Medium |
| 11 | Document trust-layer Rust blockchain build and deploy process | trust-layer | Medium |
| 12 | Do not connect production social credentials to signalcast until test coverage exists | signalcast | Low |
| 13 | Write ECOSYSTEM.md — full dependency map of all 30 repos | New doc | Medium |

---

## Bottom Line

Three tiers of concern across the ecosystem:

**The backbone (trust-layer):** 3,631 commits, Rust blockchain, TypeScript server, validator node, no README. This is the most important repo in the ecosystem and the most opaque. It needs documentation before anything else.

**The financial risk (pulse):** Autonomous trade execution with zero tests. This is the repo most likely to cause real monetary damage if something goes wrong. Tests before live credentials.

**The ecosystem-wide gaps:** 21 repos with no README, JWT startup guards not propagated from the trustgen fix, Stripe webhook validation unverified across 6+ payment apps, and no map of how the 30 repos relate to each other.

The individual apps — orby, brewandboard, garagebot, TrustGolf, vedasolus, thevoid — look architecturally reasonable from the outside. The risk isn't in any one of them. It's in the connective tissue: the auth backbone has no docs, the financial execution has no tests, and the ecosystem has no map.
