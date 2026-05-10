# Release Day Build Handoff
**Author:** Jason Andrews / DarkWave Studios LLC  
**Date:** May 10, 2026  
**Repos:** github.com/cryptocreeper94-sudo/DDA · github.com/cryptocreeper94-sudo/Axiom-Studio  
**Goal:** Get both repos production-ready for release today.

Work through DDA first (faster), then Axiom Studio in exact order listed.

---

# PART 1 — DDA (AXIOM42)
**Estimated time: ~45 minutes**

## FIX 1 — Verify the Claude model name
**File:** `src/conversation/gateway.js`, line 41  
**Why it matters:** If the model name is wrong, every Claude API call silently returns null. The system doesn't crash — it just falls back to raw deterministic responses, meaning the entire fluency upgrade does nothing.

**Action:**
1. Log into [console.anthropic.com](https://console.anthropic.com)
2. Check the exact string for the Claude Sonnet 4 model available on the account
3. Current default in code: `claude-sonnet-4-20250514`
4. If the real model name is different, set it on Render (axiom42 service) as an env var — no code deploy needed:
   ```
   AXIOM_LLM_MODEL=<correct-model-name>
   ```

---

## FIX 2 — Set missing env var on Render
**Service:** axiom42 on Render  
**Why it matters:** Without this the gateway still selects Anthropic (because the key exists), but it's implicit. Set it explicitly to prevent any ambiguity.

**Action:** In the Render dashboard for the axiom42 service, add:
```
AXIOM_LLM_PROVIDER=anthropic
```

---

## FIX 3 — Live data guard bug in Tier 1.5
**File:** `src/runtime/orchestrator.js`  
**Why it matters:** The Tier 1.5 guard checks `ctx.knowledgeHit.source !== "live_data"` to skip LLM polishing on live data. But stock queries set source to `"yahoo_finance"`, sports set it to `"espn_api"`, and news sets it to `"google_news_rss"`. None of these match `"live_data"`, so Tier 1.5 runs the LLM on live stock prices and sports scores — wasting API calls and risking the LLM dropping numerical precision.

**Change 1 — Add `isLiveData` flag when setting live knowledgeHit (~line 344):**

```js
// BEFORE:
ctx.knowledgeHit = {
  answer: liveResult.response,
  domain: liveResult.domain,
  source: liveResult.liveSource || "live_data",
  intentKey: liveResult.register,
};

// AFTER:
ctx.knowledgeHit = {
  answer: liveResult.response,
  domain: liveResult.domain,
  source: liveResult.liveSource || "live_data",
  intentKey: liveResult.register,
  isLiveData: true,
};
```

**Change 2 — Update the Tier 1.5 guard (~line 373):**

```js
// BEFORE:
if (ctx.knowledgeHit && this._conversationGateway.available && !isMetaQuery
    && ctx.knowledgeHit.source !== "grounded_composition"
    && ctx.knowledgeHit.source !== "conversation_gateway"
    && ctx.knowledgeHit.source !== "live_data"
    && ctx.knowledgeHit.source !== "wikipedia") {

// AFTER:
if (ctx.knowledgeHit && this._conversationGateway.available && !isMetaQuery
    && !ctx.knowledgeHit.isLiveData
    && ctx.knowledgeHit.source !== "grounded_composition"
    && ctx.knowledgeHit.source !== "conversation_gateway"
    && ctx.knowledgeHit.source !== "wikipedia") {
```

**After applying:** Commit and push. Render redeploys automatically.

---

## FIX 4 — Update speakDeterministic() JSDoc (documentation only)
**File:** `src/runtime/orchestrator.js`, lines 488–490  
**Why it matters:** The JSDoc says "NO LLM fallback" but the method does include Tier 2 grounded LLM composition. The behavior is correct, the doc is misleading.

```js
// BEFORE:
/**
 * speakDeterministic() — Pure deterministic pipeline. NO LLM fallback.
 * If no knowledge hit, returns an honest "I don't know" response.

// AFTER:
/**
 * speakDeterministic() — Knowledge-first pipeline. No pure LLM (Tier 3) fallback.
 * Tier 2 grounded composition (LLM strictly constrained to verified facts) is included.
 * Tier 3 unrestricted LLM is NOT used. If no facts exist, returns honest "unknown" response.
```

---

# PART 2 — AXIOM STUDIO
**Estimated time: ~2 hours**  
**Critical:** Fix issues 1–6 in exact order. The app cannot start or function without all six.

---

## ISSUE 1 — BLOCKER: No `.env` file → server hard-exits at launch
**File:** `server/index.ts`, lines 24–28  
**Symptom:** Server immediately exits with a non-zero code. Nothing starts.

**Action — Create `.env` at the project root:**
```
JWT_SECRET=<generate with: openssl rand -hex 32>
DATABASE_URL=<your Neon PostgreSQL connection string>
ANTHROPIC_API_KEY=<your Anthropic API key>
OPENAI_API_KEY=<your OpenAI API key>
FIREBASE_SERVICE_ACCOUNT=<full JSON string — see Issue 5>
APP_URL=http://localhost:5100
NODE_ENV=development

# Stripe (can be empty for dev — purchase flow will not work without these)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_BUILDER=
STRIPE_PRICE_POWER=
STRIPE_PRICE_STUDIO=

# Optional
WORKSPACE_ROOT=./workspaces
```

**Also:**
- Create `.env.example` with same keys but empty values
- Add `.env` to `.gitignore` if not already there — verify this before committing anything

---

## ISSUE 2 — BLOCKER: `AGENT_CREDIT_COSTS` import doesn't exist → every agent route returns 500
**File:** `server/agent-routes.ts`, line 21  
**Symptom:** Every API call to an agent route crashes at import time with a runtime error.

**Step 1 — Remove from schema import:**
```ts
// BEFORE (line 21):
import {
  agentConversations,
  agentMessages,
  agentDefinitions,
  chatUsers,
  aiCreditBalances,
  aiCreditTransactions,
  AGENT_CREDIT_COSTS,    // ← REMOVE THIS LINE
} from "../shared/schema.js";

// AFTER:
import {
  agentConversations,
  agentMessages,
  agentDefinitions,
  chatUsers,
  aiCreditBalances,
  aiCreditTransactions,
} from "../shared/schema.js";
```

**Step 2 — Add correct import:**
```ts
import { AGENT_COSTS } from "./tiers.js";
```

**Step 3 — Fix usage at line 87:**
```ts
// BEFORE (broken):
const costKey = `agent-${agentId}` as keyof typeof AGENT_CREDIT_COSTS;
const cost = AGENT_CREDIT_COSTS[costKey]?.credits ?? 1;

// AFTER (fixed):
const cost = AGENT_COSTS[agentId]?.credits ?? 1;
```

---

## ISSUE 3 — BLOCKER: Syntax error in `cortex-bridge.js`
**File:** `cortex-bridge.js`, line 21  
**Symptom:** Any tooling that parses or bundles this file will fail.

```js
// BEFORE (broken — missing backticks):
console.log([Cortex] ${this.appName} registered with Lume-OS (ID: ${this.appId}));

// AFTER (fixed):
console.log(`[Cortex] ${this.appName} registered with Lume-OS (ID: ${this.appId})`);
```

---

## ISSUE 4 — BLOCKER: `node-pty` native module may not have compiled
**File:** `server/pty.ts`  
**Symptom:** Server starts but terminal panel is blank or shows WebSocket connection error.

**Action after `npm install`:**
```bash
node -e "require('node-pty')"
```

If it throws, rebuild:
```bash
npm rebuild node-pty
```

If rebuild fails, install system dependencies first:
- **Linux / Render:** `nix-env -iA nixpkgs.python3 nixpkgs.gcc nixpkgs.gnumake`
- **Mac:** `xcode-select --install`

On Render: add `npm rebuild node-pty` as a post-install build command.

---

## ISSUE 5 — BLOCKER: Firebase `FIREBASE_SERVICE_ACCOUNT` not set → Google/GitHub login always returns 401
**File:** `server/firebase-admin.ts`, lines 41–47  
**Symptom:** Every OAuth login attempt hits POST `/api/agent/auth/firebase`, token verification fails, user sees login error with no explanation.

**Action:**
1. Go to Firebase Console → Project `darkwave-auth` → Project Settings → Service Accounts
2. Click "Generate new private key" → download the JSON file
3. Minify the JSON to a single line (use [jsonformatter.org](https://jsonformatter.org) or `jq -c . key.json`)
4. Set it as `FIREBASE_SERVICE_ACCOUNT` in `.env` — the full single-line JSON string
5. Do NOT commit this file. It is a private key.

---

## ISSUE 6 — BLOCKER: `ecosystem_whitelist` table missing → ALL signups return "closed beta" error
**File:** `server/agent-routes.ts`, lines 29–44  
**Symptom:** Every signup attempt returns `{ "error": "Axiom Studio is in closed beta. Request access at darkwavestudios.io" }` — even for the owner.

**Action — Run this SQL in your Neon console:**
```sql
CREATE TABLE IF NOT EXISTS ecosystem_whitelist (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  apps TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  access_level TEXT NOT NULL DEFAULT 'full',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add your own email so you can log in
INSERT INTO ecosystem_whitelist (email, apps, active, access_level, notes)
VALUES ('your@email.com', ARRAY['axiom-studio'], true, 'owner', 'pre-granted 999999 credits');
```

---

## ISSUE 7 — MEDIUM: Remove duplicate `xterm` package
**File:** `package.json`  
**Symptom:** Both `@xterm/xterm` (correct, current) and `xterm` (deprecated, old) are in dependencies. May cause Vite to bundle both.

```bash
npm uninstall xterm
```

---

## ISSUE 8 — LOW: Add `localhost:5101` to CORS allowed origins
**File:** `server/index.ts`, lines 39–44

```ts
// BEFORE:
const ALLOWED_ORIGINS = [
  "https://axiomstudio.dev",
  "https://axiom-studio.app",
  "http://localhost:5173",
  process.env.APP_URL,
].filter(Boolean) as string[];

// AFTER:
const ALLOWED_ORIGINS = [
  "https://axiomstudio.dev",
  "https://axiom-studio.app",
  "http://localhost:5100",
  "http://localhost:5101",
  process.env.APP_URL,
].filter(Boolean) as string[];
```

---

## ISSUE 9 — LOW: Add explanatory comment to `drizzle.config.ts`
**File:** `drizzle.config.ts`, line 3  
No code change needed — just add a comment to prevent someone from "fixing" it incorrectly:

```ts
// Points to agent-schema.ts intentionally — Axiom Studio only manages its own tables.
// shared/schema.ts includes DWTL-owned tables managed by the DWTL repo. Do not change this.
schema: "./shared/agent-schema.ts",
```

---

## AXIOM STUDIO — STARTUP SEQUENCE (after all fixes applied)

Run these in order:
```bash
npm install
node -e "require('node-pty')"     # must pass before continuing
npm run db:push                   # pushes agent tables to Neon
npm run dev                       # starts server on port 5100 with Vite middleware
```

Then open `http://localhost:5100` and walk the full flow:  
**Sign up → log in → create project → open file → open terminal**

All six blockers must pass before this flow works end to end.

---

## ENV VARS CHECKLIST — AXIOM STUDIO

| Variable | Required | What breaks without it |
|---|---|---|
| `JWT_SECRET` | YES — hard exit | Server refuses to start |
| `DATABASE_URL` | YES | All routes return 500 |
| `ANTHROPIC_API_KEY` | YES | All Claude chat requests fail |
| `OPENAI_API_KEY` | YES | Auto-router and GPT-4 agent fail |
| `FIREBASE_SERVICE_ACCOUNT` | YES for OAuth | Google/GitHub login always 401 |
| `APP_URL` | Recommended | CORS may block certain origins |
| `STRIPE_SECRET_KEY` | Billing only | Credit purchase flow fails |
| `STRIPE_WEBHOOK_SECRET` | Billing only | Stripe webhooks fail, credits not added |
| `NODE_ENV` | Recommended | Defaults to development behavior |
| `WORKSPACE_ROOT` | Optional | Defaults to `./workspaces` |

---

## PRIORITY TABLE — COMBINED BOTH REPOS

| Priority | Repo | Issue | Time |
|---|---|---|---|
| P1 | DDA | Verify Claude model name + set `AXIOM_LLM_MODEL` on Render | 5 min |
| P2 | DDA | Set `AXIOM_LLM_PROVIDER=anthropic` on Render | 2 min |
| P3 | DDA | Fix live data `isLiveData` guard in `orchestrator.js` | 15 min |
| P4 | Studio | Create `.env` with all required vars | 10 min |
| P5 | Studio | Fix `AGENT_CREDIT_COSTS` import in `agent-routes.ts` | 5 min |
| P6 | Studio | Fix template literal in `cortex-bridge.js` | 1 min |
| P7 | Studio | Verify `node-pty` compiled | 15 min |
| P8 | Studio | Set `FIREBASE_SERVICE_ACCOUNT` | 15 min |
| P9 | Studio | Create `ecosystem_whitelist` table + add owner email | 10 min |
| P10 | Studio | Remove old `xterm` package | 2 min |
| P11 | Studio | Fix CORS origins | 2 min |
| P12 | Studio | Add drizzle.config comment | 2 min |
| P13 | DDA | Update `speakDeterministic()` JSDoc | 5 min |
