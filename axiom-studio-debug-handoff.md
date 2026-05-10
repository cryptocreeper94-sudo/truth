# Axiom Studio — Debug Handoff for Build Agent

**Repo:** github.com/cryptocreeper94-sudo/Axiom-Studio
**Author:** Jason Andrews / DarkWave Studios LLC
**Audit date:** May 2026
**Status:** Multiple blocking issues found. App cannot start in current state.

This document lists every issue found, ordered by severity, with exact file locations and
exact fixes. Work through them in order — the first three will prevent the server from
starting at all.

---

## ISSUE 1 — CRITICAL: No `.env` file → server hard-exits at launch

**File:** `server/index.ts`, line 24–28

The server checks for `JWT_SECRET` at startup and calls `process.exit(1)` if it is missing.
There is no `.env` file and no `.env.example` in the repo. Anyone who clones this cannot start
the server at all.

**Fix — Create `.env` at the project root with these keys:**

```
JWT_SECRET=<generate a 64-char random string — use: openssl rand -hex 32>
DATABASE_URL=<your Neon PostgreSQL connection string>
ANTHROPIC_API_KEY=<your Anthropic API key>
OPENAI_API_KEY=<your OpenAI API key>
FIREBASE_SERVICE_ACCOUNT=<JSON string of your Firebase service account — see Issue 5>
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

**Also create `.env.example`** with the same keys but empty values, and add `.env` to `.gitignore`.
Currently `.env` is NOT in `.gitignore` — this must be added before any sensitive values are committed.

---

## ISSUE 2 — CRITICAL: `AGENT_CREDIT_COSTS` does not exist → runtime crash on every agent route

**File:** `server/agent-routes.ts`, line 21
**Import line:**
```ts
import {
  agentConversations,
  agentMessages,
  agentDefinitions,
  chatUsers,
  aiCreditBalances,
  aiCreditTransactions,
  AGENT_CREDIT_COSTS,    // ← THIS DOES NOT EXIST IN shared/schema.ts
} from "../shared/schema.js";
```

`shared/schema.ts` exports tables but never exports `AGENT_CREDIT_COSTS`. The credit costs are
defined in `server/tiers.ts` as `AGENT_COSTS`. This import will fail at runtime, crashing the
entire agent routes module. Every API call will return 500.

**Fix — In `server/agent-routes.ts`:**

Step 1: Remove `AGENT_CREDIT_COSTS` from the `shared/schema.js` import.

Step 2: Add this import at the top of `agent-routes.ts`:
```ts
import { AGENT_COSTS } from "./tiers.js";
```

Step 3: Find line 87 where `AGENT_CREDIT_COSTS` is used:
```ts
// BEFORE (broken):
const costKey = `agent-${agentId}` as keyof typeof AGENT_CREDIT_COSTS;
const cost = AGENT_CREDIT_COSTS[costKey]?.credits ?? 1;

// AFTER (fixed):
const cost = AGENT_COSTS[agentId]?.credits ?? 1;
```

---

## ISSUE 3 — CRITICAL: `cortex-bridge.js` has a JavaScript syntax error

**File:** `cortex-bridge.js`, line 21

```js
// CURRENT (broken — missing backtick template literal):
console.log([Cortex] ${this.appName} registered with Lume-OS (ID: ${this.appId}));

// FIXED:
console.log(`[Cortex] ${this.appName} registered with Lume-OS (ID: ${this.appId})`);
```

This file is a syntax error in its current state. While it may not block the server from
starting (it's not imported by the server directly), it will break any tooling that tries to
parse or bundle it.

---

## ISSUE 4 — CRITICAL: `node-pty` native module — will not build without system dependencies

**File:** `server/pty.ts` (imports `node-pty`)
**Package:** `"node-pty": "^1.1.0"` in `package.json`

`node-pty` is a native Node.js addon that spawns real terminal processes. It requires:
- Python 3 (for `node-gyp`)
- C++ build tools (`build-essential` on Linux, Xcode CLI tools on Mac, MSVS on Windows)

After cloning and running `npm install`, `node-pty` will silently fail to compile on many
machines. The symptom is: the server starts but the terminal panel shows a blank screen or
WebSocket connection error.

**Fix — Add build prerequisites to your README and verify the build:**

After `npm install`, run:
```bash
node -e "require('node-pty')"
```

If it throws, rebuild:
```bash
npm rebuild node-pty
```

If that fails, install system dependencies first:
- **Linux/Replit:** `nix-env -iA nixpkgs.python3 nixpkgs.gcc nixpkgs.gnumake`
- **Mac:** `xcode-select --install`
- **Windows:** Install MSVS Build Tools

On Render/Railway: add a build command that runs `npm rebuild node-pty` after `npm install`.

**Alternative:** Add a graceful fallback in `pty.ts` — catch the import error and disable the
terminal feature instead of crashing the WebSocket handler.

---

## ISSUE 5 — CRITICAL (for OAuth): Firebase `FIREBASE_SERVICE_ACCOUNT` not set → Google/GitHub login always fails

**File:** `server/firebase-admin.ts`, lines 41–47

Without `FIREBASE_SERVICE_ACCOUNT` in the environment, Firebase Admin initializes in
`project-id-only` mode. In this mode, `verifyIdToken()` always throws on non-GCP hosts
(Render, Railway, Replit, etc.). The server logs this warning:

```
⚠️  No FIREBASE_SERVICE_ACCOUNT env var found.
⚠️  Initialized with projectId only — verifyIdToken() WILL FAIL on Render/Heroku.
```

The result: every Google or GitHub login attempt hits `POST /api/agent/auth/firebase`, the token
verification fails, and the server returns `401 Invalid Firebase token`. The user sees a
login error with no explanation.

**Fix:**

1. Go to Firebase Console → Project `darkwave-auth` → Project Settings → Service Accounts
2. Click "Generate new private key" → download the JSON file
3. Minify the JSON to a single line
4. Set it as the `FIREBASE_SERVICE_ACCOUNT` environment variable (the full JSON string,
   quoted properly for your shell/hosting provider)

Do NOT commit this JSON to the repo. It is a private key.

---

## ISSUE 6 — HIGH: `ecosystem_whitelist` table missing → ALL signups fail on fresh database

**File:** `server/agent-routes.ts`, lines 29–44 (`checkWhitelist` function)

The signup flow queries a table `ecosystem_whitelist` that is NOT in `shared/schema.ts`,
NOT in `shared/agent-schema.ts`, and NOT created by the auto-migration in `db.ts`.

If this table does not exist in the database, the query throws, the `catch` block runs,
and the function returns `{ allowed: false }` — because it is designed to "fail closed."
The signup route then returns:

```json
{ "error": "Axiom Studio is in closed beta. Request access at darkwavestudios.io" }
```

This means no one can sign up on a fresh deployment, even if you want them to.

**Fix — Option A (for production):** Create the `ecosystem_whitelist` table in your Neon DB:
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

-- Add your own email to whitelist yourself
INSERT INTO ecosystem_whitelist (email, apps, active, access_level, notes)
VALUES ('your@email.com', ARRAY['axiom-studio'], true, 'owner', 'pre-granted 999999 credits');
```

**Fix — Option B (for dev/testing):** Add a dev bypass to `checkWhitelist`:
```ts
async function checkWhitelist(email: string, app: string = "axiom-studio"): Promise<{ allowed: boolean; entry?: any }> {
  // Dev bypass — skip whitelist in development
  if (process.env.NODE_ENV !== "production") {
    return { allowed: true, entry: { access_level: "full" } };
  }
  // ... existing code
}
```

---

## ISSUE 7 — MEDIUM: `drizzle.config.ts` points to wrong schema file

**File:** `drizzle.config.ts`, line 3

```ts
// CURRENT:
schema: "./shared/agent-schema.ts",

// PROBLEM: The server imports from shared/schema.ts (which includes ALL tables).
// drizzle-kit push will only push agent-only tables, ignoring shared tables.
// On a fresh DB this is fine. But if drizzle-kit is ever used to introspect or
// diff the schema, it will report all shared tables as "not in schema."
```

**Fix:** This is intentional separation (Axiom Studio only manages its own tables, not the
shared DWTL tables). The config is correct for that intent. But add a comment to `drizzle.config.ts`
explaining why it points to `agent-schema.ts` and not `schema.ts`, to prevent the next developer
from "fixing" it incorrectly.

No code change needed. Add a comment:
```ts
// Schema points to agent-schema.ts intentionally — Axiom Studio only manages its own tables.
// shared/schema.ts includes DWTL-owned tables (chat_users, ai_credit_balances, etc.)
// that are managed by the DWTL repo. Do not change this to schema.ts.
schema: "./shared/agent-schema.ts",
```

---

## ISSUE 8 — MEDIUM: Duplicate `xterm` packages installed

**File:** `package.json`

```json
"@xterm/xterm": "^6.0.0",   // new package name
"xterm": "^5.3.0",           // old package name — deprecated
```

Both packages are in `dependencies`. The component imports from `@xterm/xterm` (correct).
The old `xterm` package is dead weight and may cause Vite to bundle both.

**Fix:** Remove `xterm` (old) from `package.json` and run `npm install`:
```bash
npm uninstall xterm
```

---

## ISSUE 9 — LOW: CORS allowed origins missing `localhost:5101`

**File:** `server/index.ts`, lines 39–44

```ts
const ALLOWED_ORIGINS = [
  "https://axiomstudio.dev",
  "https://axiom-studio.app",
  "http://localhost:5173",    // ← wrong port
  process.env.APP_URL,
].filter(Boolean) as string[];
```

Vite runs on port 5101 (per `vite.config.ts`). The CORS list has 5173 (Vite's default) but not 5101.
In normal dev mode (single server with Vite middleware at port 5100), CORS is not an issue since
there's no cross-origin call. But if you ever run the Vite dev client separately
(`npm run dev:client`), the browser will block API calls.

**Fix:** Add `http://localhost:5101` to `ALLOWED_ORIGINS`, or replace the hardcoded port with
the env var:
```ts
const ALLOWED_ORIGINS = [
  "https://axiomstudio.dev",
  "https://axiom-studio.app",
  "http://localhost:5100",
  "http://localhost:5101",
  process.env.APP_URL,
].filter(Boolean) as string[];
```

---

## STARTUP ORDER (once all fixes are applied)

1. Create `.env` with all required values (Issue 1)
2. Create `ecosystem_whitelist` table and add your email (Issue 6)
3. Run `npm install`
4. Verify `node-pty` compiled: `node -e "require('node-pty')"` (Issue 4)
5. Run `npm run db:push` to push agent tables to the database
6. Run `npm run dev` — server starts on port 5100 with Vite middleware
7. Open `http://localhost:5100` in the browser
8. Sign up with an email that is in the `ecosystem_whitelist` table

---

## ENVIRONMENT VARIABLES CHECKLIST

| Variable | Required | What breaks without it |
|---|---|---|
| `JWT_SECRET` | YES — hard exit | Server refuses to start |
| `DATABASE_URL` | YES | DB connection fails, all routes 500 |
| `ANTHROPIC_API_KEY` | YES | All Claude chat requests fail |
| `OPENAI_API_KEY` | YES | Auto-router classifier fails + GPT-4 agent fails |
| `FIREBASE_SERVICE_ACCOUNT` | YES for OAuth | Google/GitHub login always fails |
| `APP_URL` | Recommended | CORS may block certain origins |
| `STRIPE_SECRET_KEY` | Only for billing | Credit purchase flow fails |
| `STRIPE_WEBHOOK_SECRET` | Only for billing | Stripe webhooks fail (credits not added) |
| `NODE_ENV` | Recommended | Defaults to development behavior |
| `WORKSPACE_ROOT` | Optional | Defaults to `./workspaces` in cwd |

---

## SUMMARY — PRIORITY ORDER FOR THE BUILD AGENT

| # | Issue | File | Severity | Time to fix |
|---|---|---|---|---|
| 1 | Create `.env` with all required vars | Root | BLOCKER | 10 min |
| 2 | Fix `AGENT_CREDIT_COSTS` import | `server/agent-routes.ts` | BLOCKER | 5 min |
| 3 | Fix template literal in `cortex-bridge.js` | `cortex-bridge.js:21` | BLOCKER | 1 min |
| 4 | Verify/rebuild `node-pty` native module | `package.json` / system | BLOCKER | 15 min |
| 5 | Set `FIREBASE_SERVICE_ACCOUNT` | `.env` | BLOCKER for OAuth | 15 min |
| 6 | Create `ecosystem_whitelist` table + add email | Database | BLOCKER for signup | 10 min |
| 7 | Add comment to `drizzle.config.ts` | `drizzle.config.ts` | Low | 2 min |
| 8 | Remove old `xterm` package | `package.json` | Medium | 2 min |
| 9 | Add `localhost:5101` to CORS list | `server/index.ts` | Low | 2 min |

Fix issues 1–6 in order. The app will not run without all six.

---

**Audit by:** Jason Andrews / DarkWave Studios LLC
**Contact:** team@dwsc.io
