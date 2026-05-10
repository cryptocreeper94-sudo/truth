# AXIOM42 (DDA) — Conversational Fluency Upgrade Audit
**Repo:** github.com/cryptocreeper94-sudo/DDA  
**Commit audited:** d31bf37  
**Files reviewed:** `src/conversation/gateway.js`, `src/runtime/orchestrator.js`, `src/dpcl/personality.js`, `src/knowledge/live/index.js`, `src/dpcl/engine.js`  
**Date:** May 10, 2026  
**Auditor:** Canon³ / DarkWave Studios LLC

---

## VERDICT SUMMARY

| # | Question | Result |
|---|----------|--------|
| 1 | Anthropic API implementation in gateway.js | ✅ PASS (one model-name flag) |
| 2 | Tier 1.5 guards in orchestrator.js | ⚠️ BUG — live data guard is incomplete |
| 3 | Personality prefix skip for GROUNDED responses | ✅ PASS |
| 4 | Grounded prompt hallucination constraints | ✅ PASS (one soft spot noted) |
| 5 | Fallback behavior when API key missing or API errors | ✅ PASS |

One real bug. One documentation inconsistency. Everything else is solid.

---

## Q1 — Does gateway.js correctly implement the Anthropic Messages API?

**PASS.** Every required element is correct.

| Check | Line(s) | Status |
|-------|---------|--------|
| `x-api-key` header | 238 | ✅ Correct |
| `anthropic-version: 2023-06-01` header | 239 | ✅ Correct |
| System field extracted from messages array | 219–227 | ✅ Correct — system messages are concatenated and passed as the top-level `system` field |
| `system: undefined` when no system content | 245 | ✅ Correct — `systemPrompt \|\| undefined` omits the field cleanly |
| First message must be `user` role | 230–232 | ✅ Correct — guard adds a placeholder user turn if needed |
| Response parsed as `data.content[0].text` | 258 | ✅ Correct — uses optional chaining (`data.content?.[0]?.text`) so it won't throw on malformed response |

**One flag — model name:**  
Line 41 sets the default model to `claude-sonnet-4-20250514`. The naming pattern (no generation number between "claude" and model name, no "3-" or "3-5-") is different from prior Anthropic conventions. If this model name is invalid, every API call will return a `400` or `404`, which the code catches at lines 250–255 and returns `null` — non-crashing, but silent and broken until the key gets a log inspection.

**Fix:** Verify the exact model string against `GET https://api.anthropic.com/v1/models` with your key. If it's wrong, set the correct name in the `AXIOM_LLM_MODEL` env var on Render without a code deploy.

---

## Q2 — Is the Tier 1.5 guard correctly protecting against live data, wiki, and already-composed sources?

**BUG.** The guard is incomplete for stock, sports, and news live queries.

### What the guard checks (orchestrator.js lines 373–377):
```js
if (ctx.knowledgeHit && this._conversationGateway.available && !isMetaQuery
    && ctx.knowledgeHit.source !== "grounded_composition"
    && ctx.knowledgeHit.source !== "conversation_gateway"
    && ctx.knowledgeHit.source !== "live_data"
    && ctx.knowledgeHit.source !== "wikipedia") {
```

### What actually ends up in `ctx.knowledgeHit.source`:

The orchestrator sets `source` at line 349:
```js
source: liveResult.liveSource || "live_data"
```

`liveResult.liveSource` comes from each fetcher's `data.source` field:

| Live query type | `liveResult.liveSource` value | `ctx.knowledgeHit.source` | Guard catches it? |
|----------------|-------------------------------|---------------------------|-------------------|
| Date/time (system-pack) | `undefined` (field not set) | `"live_data"` (fallback) | ✅ Yes |
| Stocks | `"yahoo_finance"` or `"cache"` | `"yahoo_finance"` | ❌ **NO** |
| Sports scores | `"espn_api"` or `"cache"` | `"espn_api"` | ❌ **NO** |
| News | `"google_news_rss"` or `"cache"` | `"google_news_rss"` | ❌ **NO** |
| Wikipedia | `"wikipedia"` | `"wikipedia"` | ✅ Yes |

**Consequence:** Tier 1.5 will run the LLM on live stock prices, sports scores, and news headlines. This wastes an API call on already-formatted live data and risks the LLM silently dropping precision — e.g., reformatting `"AAPL: $213.47 ↑ 1.2%"` into a sentence that loses the exact figure.

### Fix (two options):

**Option A — Add a live data flag on the knowledgeHit (cleanest):**
```js
// In orchestrator.js, when setting live data knowledgeHit (line 344–351):
ctx.knowledgeHit = {
  answer: liveResult.response,
  domain: liveResult.domain,
  source: liveResult.liveSource || "live_data",
  intentKey: liveResult.register,
  isLiveData: true,  // ADD THIS
};
```

Then update the Tier 1.5 guard:
```js
if (ctx.knowledgeHit && this._conversationGateway.available && !isMetaQuery
    && !ctx.knowledgeHit.isLiveData                        // replaces source !== "live_data"
    && ctx.knowledgeHit.source !== "grounded_composition"
    && ctx.knowledgeHit.source !== "conversation_gateway"
    && ctx.knowledgeHit.source !== "wikipedia") {
```

**Option B — Allowlist known pack sources (if you don't want to touch the hit shape):**
```js
const SKIP_TIER_15_SOURCES = new Set([
  "live_data", "yahoo_finance", "espn_api", "google_news_rss",
  "cache", "wikipedia", "grounded_composition", "conversation_gateway"
]);

if (ctx.knowledgeHit && this._conversationGateway.available && !isMetaQuery
    && !SKIP_TIER_15_SOURCES.has(ctx.knowledgeHit.source)) {
```

Option A is cleaner and more future-proof — new live sources get the flag automatically.

---

## Q3 — Does personality.js skip prefix injection for GROUNDED responses but still apply it for raw deterministic responses?

**PASS.** The logic is correct for all paths.

**personality.js lines 219–222:**
```js
const responseMode = ctx.knowledgeHit?.responseMode;
if (responseMode === "GROUNDED" || responseMode === "CONVERSATIONAL") {
  return response;  // Full skip — no prefix, no suffix, no transforms
}
```

**Path tracing:**

| Scenario | `ctx.knowledgeHit.responseMode` | Result |
|----------|---------------------------------|--------|
| Tier 1.5 polish succeeded | `"GROUNDED"` (set at orchestrator line 391) | ✅ Prefix skipped — Claude's natural response returned as-is |
| Tier 1.5 polish failed (LLM down, catch block fires) | `undefined` (never set) | ✅ Prefix/suffix applied to raw deterministic answer — correct fallback |
| Tier 2 grounded composition succeeded | `"GROUNDED"` | ✅ Prefix skipped |
| Tier 3 pure LLM (conversation_gateway) | `"CONVERSATIONAL"` | ✅ Prefix skipped |
| Raw deterministic hit, gateway disabled | `undefined` | ✅ Prefix/suffix applied |

The DPCL engine calls `this._personalityEngine.apply(assembledResponse, { ...ctx, rawInput })` (engine.js line 97–100), spreading the full ctx including `knowledgeHit`. The `responseMode` check in `personality.js` reads `ctx.knowledgeHit?.responseMode` correctly from that spread.

**One note:** The PROFESSIONAL personality profile has `prefixes: []` and `suffixes: []` — so the skip check only matters for CONVERSATIONAL profile deployments. Both are handled correctly.

---

## Q4 — Is the grounded composition prompt sufficiently constrained to prevent hallucination?

**PASS overall, with one soft spot.**

### What the prompt does well:
- **Hard constraint:** `"Use ONLY the facts provided below. Do not add external knowledge or speculation."` — explicit and unambiguous
- **Double-bars filler openers:** `"Do NOT use filler openers like 'Great question!', 'That's a fun one.'"` — directly solves the documented problem
- **Bars meta-commentary:** `"Do NOT mention 'facts provided', 'according to my sources'"` — prevents the engine from revealing its architecture
- **Temperature 0.4:** Lower than the default 0.7 for `generate()`. Reduces the model's tendency to improvise.
- **Honest limits clause:** `"If the facts are insufficient to fully answer the question, say what you can and be honest about limitations."` — better than silence

### One soft spot — tangential fact handling:

The prompt says:
> "If a fact seems to be about a slightly different topic than what was asked, acknowledge the most relevant parts and note what you can address."

This is the instruction for the exact case that caused the original bug (user asks "what is code", engine hits "code auditing"). The current instruction tells Claude to acknowledge the relevant parts — but it could still draw on training knowledge to bridge the gap, since "acknowledge the most relevant parts" doesn't explicitly forbid supplementation.

**Tighter alternative for that clause:**
```
If the retrieved facts are about a related but different topic than what was asked,
respond only with: "I have information about [fact topic], but not specifically about
[user's topic]. Can you rephrase?" Do NOT supplement with external knowledge to fill the gap.
```

This makes the boundary explicit. Whether you tighten it depends on how often tangential hits occur in practice — the current instruction is workable for most cases.

---

## Q5 — Does the fallback work if the API key is missing or the API errors?

**PASS.** The fallback chain is well-constructed at every level.

### If `ANTHROPIC_API_KEY` is missing:
| Step | Code | Behavior |
|------|------|----------|
| Gateway init | Line 51: `this._enabled = !!this._apiKey` | `_enabled = false` |
| `generate()` called | Line 82: `if (!this._enabled) return null` | Returns null immediately |
| `composeGrounded()` called | Line 132: `if (!this._enabled \|\| !facts ...) return null` | Returns null immediately |
| Tier 1.5 block | Line 373: `this._conversationGateway.available` | Block skipped entirely — raw answer used |
| Console | Line 59: `console.warn(...)` | Warning logged at startup |

### If the API call fails at runtime (network error, rate limit, 500):
| Step | Code | Behavior |
|------|------|----------|
| Non-2xx response | Lines 250–255: `if (!response.ok)` | Logs error, returns `null` |
| Exception thrown | Lines 107–110 in `generate()`, 190–194 in `composeGrounded()` | Caught, `_errorCount++`, returns `null` |
| Tier 1.5 polish | Line 387: `if (polished?.response)` | Only overwrites answer if truthy — `null` is a no-op |
| Catch block | Lines 394–397 | Logs warning, raw deterministic answer preserved untouched |

### Full fallback cascade in `speak()`:
```
Tier 1.5 polish fails → raw deterministic answer preserved
Tier 2 grounded fails → Wikipedia tried
Wikipedia fails → Tier 3 pure LLM tried
Tier 3 LLM fails → disambiguation fallback used
All fail → DPCL generates "unknown domain" response (never crashes)
```

Solid. No crash path exists through any of these routes.

---

## SECONDARY FINDING — `speakDeterministic()` naming vs. behavior mismatch

**Not a bug, but a documentation inconsistency worth flagging.**

The method JSDoc (line 488–490) says:
```
"Pure deterministic pipeline. NO LLM fallback."
```

But `speakDeterministic()` at lines 524–548 includes a full Tier 2 grounded composition block that calls `composeGrounded()` — an LLM call. The inline comment at line 524 even acknowledges this: `"Tier 2: Grounded Composition (uses LLM but constrained to facts)"`.

So the method DOES use the LLM — just not for Tier 3 pure conversational fallback. The distinction is:
- `speak()` → Tier 1.5 + Tier 2 grounded + Tier 3 pure LLM
- `speakDeterministic()` → Tier 2 grounded (LLM, constrained to facts) but NO Tier 1.5 and NO Tier 3

This means "deterministic" in the method name means "no Tier 3 hallucination-risk LLM", not "no LLM at all." That's a valid design choice — but anyone reading the JSDoc will expect zero LLM calls and be surprised.

**Recommendation:** Update the JSDoc to:
```js
/**
 * speakDeterministic() — Knowledge-first pipeline. No pure LLM fallback.
 * Tier 2 grounded composition (LLM constrained to verified facts) is included.
 * Tier 3 (unrestricted LLM) is NOT used. If no facts exist, returns honest "unknown" response.
 */
```

---

## ENV VARS CHECKLIST (Render — axiom42 service)

| Var | Status | Action needed |
|-----|--------|---------------|
| `ANTHROPIC_API_KEY` | Set by owner | Verify it's active and has quota |
| `AXIOM_LLM_PROVIDER` | May not be set | Add `anthropic` — without it, the code still selects Anthropic if the key exists (line 31–32), but being explicit avoids surprises |
| `AXIOM_LLM_MODEL` | Not set (using code default) | Optionally set to override `claude-sonnet-4-20250514` if the model name turns out to be invalid |

---

## ACTION ITEMS BY PRIORITY

| Priority | File | Line(s) | Action |
|----------|------|---------|--------|
| **P1 — Fix** | `orchestrator.js` | 344–351, 373–377 | Add `isLiveData: true` flag to live data knowledgeHit; update Tier 1.5 guard to use flag |
| **P2 — Verify** | `gateway.js` | 41 | Confirm `claude-sonnet-4-20250514` is a valid model name |
| **P3 — Set env** | Render dashboard | — | Add `AXIOM_LLM_PROVIDER=anthropic` if not already set |
| **P4 — Doc fix** | `orchestrator.js` | 488–490 | Update `speakDeterministic()` JSDoc to clarify Tier 2 LLM is included |
| **P5 — Consider** | `gateway.js` | 154 | Tighten tangential-fact instruction in grounded prompt |
