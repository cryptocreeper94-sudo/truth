# Trust Layer (dwtl.io) — Fix Handoff

**Repo:** Cryptocreeper94-sudo/trust-layer  
**Live domains:** dwsc.io · dwtl.io · tlid.io (all route to this one app)  
**Date:** March 26, 2026  
**Commit count:** Not on the profile page but extensive — this is the largest, most complex repo in the ecosystem  
**Purpose:** The backbone of the entire ecosystem. Provides: TrustLink SSO for all apps, the real hallmark trust-stamping system, an embedded TypeScript BFT blockchain (SIG token), staking engine, Signal Chat, Guardian Scanner, Chronicles AI, Zealy integration, PayPal + Stripe + Coinbase Commerce payments, Shells airdrop scheduler, referral payout scheduler, membership reconciliation, marketing scheduler, ElevenLabs voice, WebAuthn biometric auth, external validator nodes, `.tlid` identity domains, and DWSC/DWAV token interaction. It also proxies Firebase Auth for Google Sign-In.

**Stack:** React 19 + Vite · Express 4 · Drizzle ORM · Neon PostgreSQL · Custom BFT blockchain (TypeScript, in-process) · Rust blockchain binary (separate, not deployed on Render) · Firebase · Google Cloud Storage · WebAuthn · Solana web3.js · OpenAI · ElevenLabs · Stripe · PayPal · Coinbase Commerce · Twilio · Zealy · Three.js/React Three Fiber

**Launch target:** August 23, 2026

---

## 🚨 Act On This Before Anything Else

### `stripe-replit-sync` is imported in `server/index.ts` and deployed on Render

```typescript
import { runMigrations } from "stripe-replit-sync";
import { getStripeSync } from "./stripeClient";
```

`stripe-replit-sync` is a Replit-specific package designed to work inside the Replit environment. This app is deployed on Render. This import either:
- Fails silently (the package resolves but its Replit-environment checks return no-ops)
- Throws at runtime when it tries to access Replit's internal systems and they don't exist

Either way, it's dead code running in the wrong environment. It was removed from `darkwave-studios` explicitly ("Remove stripe-replit-sync for Render deployment") but never removed from `trust-layer`. Remove this import and verify `getStripeSync()` from `./stripeClient` handles everything Stripe needs without it.

---

### The custom blockchain chain ID defaults to 8453 — that's Base mainnet

**File:** `server/darkwave.ts`

```typescript
const DARKWAVE_CHAIN_ID = parseInt(process.env.DARKWAVE_CHAIN_ID || "8453");
```

Chain ID 8453 is **Base** — Coinbase's Ethereum Layer 2 mainnet. If `DARKWAVE_CHAIN_ID` is not set as an environment variable on Render, the Trust Layer blockchain identifies itself as Base. Wallet software that reads chain IDs will try to connect to it as the Base network.

The Trust Layer custom chain needs a unique chain ID that doesn't collide with any existing EVM chain. Set a proper unique ID (e.g., something in the 400,000+ range or a custom namespace) and add `DARKWAVE_CHAIN_ID` as a required env var with no default.

---

## Priority 1 — Blockchain Architecture

### 1.1 The blockchain runs embedded inside the Express server — no separation

**File:** `server/blockchain-engine.ts` (imported by `server/darkwave.ts`)

The Trust Layer blockchain is not a separate process or external system — it's a TypeScript module that runs inside the same Express server process. Its state lives in the same PostgreSQL database as the application (tables: `chainBlocks`, `chainTransactions`, `chainAccounts`, `chainValidators`, `blockAttestations`, `slashingRecords`, `consensusEpochs`).

This means:
- If the Express server crashes or restarts, the blockchain is down
- A bad database migration can corrupt chain state alongside application data
- The blockchain and application share the same database connection pool
- There is no blockchain "node" that can continue operating while the web server is down

This is an architectural decision that makes sense for a pre-launch internal system, but it needs to be clearly understood: the Trust Layer blockchain is not yet a distributed network — it's a PostgreSQL-backed state machine running inside the web server.

---

### 1.2 The Rust blockchain binary is separate and not deployed on Render

**Files:** `blockchain/src/*.rs`, `run_blockchain.sh`

```bash
# run_blockchain.sh
cd blockchain
exec ./target/debug/orbit-chain --rpc-port 3030
```

There is a Rust implementation of the blockchain in `blockchain/src/` with `consensus.rs`, `ledger.rs`, `node.rs`, `rpc.rs`, etc. This is a real compiled binary (`orbit-chain`) that runs on port 3030 separately. The render.yaml only deploys the Node.js server — the Rust binary is not built or started as part of the Render deployment.

**The TypeScript `blockchain-engine.ts` and the Rust `orbit-chain` binary are two parallel implementations of the blockchain.** Only the TypeScript version is running in production. The Rust version's state and the TypeScript version's state are not synchronized.

This needs a clear decision: which implementation is the production blockchain? If Rust is the target (higher performance, better suited for a real chain), there needs to be a migration plan and Render needs to build and run the Rust binary. If TypeScript is the long-term choice, the Rust code should be either removed or flagged as a future migration target.

---

### 1.3 Five validator nodes poll at 400ms each — 12+ requests/second baseline load

**File:** `validator-node/validator.js`

```javascript
POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS || "400"),
```

The Founders validators (Founders, NA-East, NA-West, EU-Central, APAC) each poll `dwtl.io` for new blocks every 400 milliseconds. Five validators × 2.5 polls/second = **12.5 requests per second** of constant background traffic to the server, just from validator heartbeating — before any real users load the site.

Each poll includes HMAC-SHA256 signature computation and an authenticated API call. This is significant baseline load. Increase the poll interval to 2-5 seconds for pre-launch (block times don't need sub-second validator response) and add request batching for the attestation submissions.

---

### 1.4 BFT consensus requires 2/3+ stake — with 5 validators, 2 going offline halts the chain

**File:** `server/blockchain-engine.ts`

```typescript
const BFT_QUORUM_THRESHOLD = 0.67; // 2/3+ stake required for finality
```

With 5 founder validators and 30M SIG total stake, the BFT quorum requires ~20M SIG in agreement. If 2 validators go offline, the chain cannot produce finalized blocks. For a pre-launch system where validator uptime is not yet guaranteed, a network halt means all hallmark submissions fail until quorum is restored.

Confirm there's a manual override or grace period in the consensus engine for pre-launch where the quorum requirement is relaxed or the server operator can manually finalize blocks.

---

## Priority 2 — Security and Compliance

### 2.1 Shells → SIG conversion may have securities law implications

**File:** `TOKENOMICS_REFERENCE.md`

```
Shells: 1 Shell = $0.001 | Conversion: 10 Shells = 1 SIG | Convertible: YES — converts to SIG at TGE
```

Users can purchase Shells with real money ($0.001/Shell). Shells convert to SIG tokens at TGE at a guaranteed 10:1 ratio. SIG is described as "a real tradeable asset" with a presale price of $0.001 and a TGE launch price of $0.01.

This is a pre-sale of a token at a fixed discount with a guaranteed future conversion. Depending on jurisdiction (particularly the US), this structure may qualify as a security offering subject to SEC registration or an applicable exemption. This is not a code issue — it requires a legal review before any public Shell sales begin.

**Note:** This is flagged for awareness, not for the agent to fix. It needs a lawyer's opinion, not a code change.

---

### 2.2 Five schedulers running simultaneously — uncontrolled AI and payout costs

**File:** `server/index.ts`

Five schedulers start on server boot:
1. `marketing-scheduler` — AI content generation via OpenAI
2. `shells-airdrop-scheduler` — automatic Shells airdrops to users
3. `referral-payout-scheduler` — referral reward payouts
4. `email-update-scheduler` — email notification batches
5. `membership-reconciliation-scheduler` — subscription state syncs

Each of these runs independently on its own timer. Confirm:
- Each scheduler has a documented run interval (not running on every tick)
- The marketing scheduler has a daily OpenAI call cap
- The Shells airdrop scheduler has a maximum daily airdrop amount
- Scheduler failures are logged and alerted, not silently swallowed

An infinite loop in any scheduler, or a tighter interval than intended, produces unbounded API costs or token payouts.

---

### 2.3 Multiple Replit artifacts committed to the repo

The root of the repo contains:
- `.cache/` — Replit package cache
- `.config/replit/.semgrep` — Replit security scan state
- `.local/state/replit/agent` — Replit agent state
- `.upm/` — Replit package manager state
- `.replit` — Replit configuration

Also in the root:
- `facebook-bios.txt` — social media content
- `facebook-welcome-post.txt` — social media content
- `trust-layer-x-bio.txt` — social media content
- `tmp_description.txt` — temp file

None of these belong in version control. Add all of them to `.gitignore` and remove from the repo.

---

## Priority 3 — The Good News (Genuine Positive)

### 3.1 This is the only repo in the ecosystem with a real test runner configured

**Files:** `tests/*.test.ts`, `vitest.config.ts`

Trust Layer has six actual test files with Vitest configured:
- `auth.test.ts`
- `blockchain.test.ts`
- `chronicles.test.ts`
- `core-api.test.ts`
- `financial.test.ts`
- `trustvault.test.ts`

Every other repo in the ecosystem has zero tests or manually maintained test counts in markdown documents. This is the exception. Run `npx vitest` and check current pass/fail status — these tests may have drifted from the current code but having a runner in place is the foundation to build from.

---

## Priority 4 — Architecture Cleanup

### 4.1 Two blockchain implementations need a single source of truth decision

The TypeScript `blockchain-engine.ts` and the Rust `blockchain/src/` are independent implementations. Pick one and document it as the canonical chain. If Rust is the long-term plan, start the migration now. If TypeScript is staying, remove or archive the Rust code.

---

### 4.2 Domain routing complexity — three domains, one server, subdomain routing

`dwsc.io`, `dwtl.io`, and `tlid.io` all route to this Express server. The `server/index.ts` handles subdomain routing with a `tlidSubdomain` extension on the Express Request. Verify:
- That the wildcard DNS for `*.tlid.io` is correctly set on Namecheap (per `TLID_DOMAINS.md`)
- That the subdomain router correctly isolates session state per subdomain (a session on `academy.tlid.io` should not be valid on `pulse.tlid.io`)

---

## Summary Status Table

| # | Issue | Severity | Status |
|---|---|---|---|
| 0 | `stripe-replit-sync` imported in server/index.ts — wrong env, deployed on Render | HIGH | FIX NOW |
| 0.1 | Chain ID defaults to 8453 (Base mainnet) — needs unique ID | HIGH | FIX NOW |
| 1.1 | Blockchain runs embedded in Express — no process separation | MEDIUM | ARCHITECTURAL DECISION |
| 1.2 | Rust blockchain and TypeScript blockchain are two diverging implementations | HIGH | DECIDE AND CONSOLIDATE |
| 1.3 | 5 validators × 400ms poll = 12.5 req/sec baseline — increase interval | MEDIUM | OPEN |
| 1.4 | BFT 2/3 quorum with 5 validators — 2 offline halts the chain | MEDIUM | VERIFY OVERRIDE EXISTS |
| 2.1 | Shells → SIG pre-sale structure may be a security offering — legal review needed | CRITICAL | LEGAL REVIEW (NOT CODE) |
| 2.2 | 5 schedulers with no documented caps — AI and payout cost risk | MEDIUM | VERIFY |
| 2.3 | Replit artifacts + social media content committed to repo | LOW | CLEAN |
| 3.1 | Only repo in ecosystem with real Vitest tests — run them, check status | POSITIVE | VERIFY PASS/FAIL |
| 4.1 | Two blockchain implementations — pick one | HIGH | DECIDE |
| 4.2 | Subdomain routing — verify session isolation and DNS | MEDIUM | VERIFY |
