# Axiom DDA — Root Cause Diagnosis & Fix Handoff (for Gemini)

**Repo:** `cryptocreeper94-sudo/DDA` ("Axiom DDA")
**Deploy target:** Coolify (auto-detects Node app via `package.json` `start` script → `node demo/server.js`)
**Prepared by:** Diagnostic pass across the full request path (loader → engine → grounded-rag → gateway → orchestrator → demo/server.js)
**Purpose:** This is a single consolidated file. Everything you need — root causes, exact code, and how to verify — is in this one document. Do not guess at causes not listed here; they were ruled out during diagnosis (see "Ruled Out" section).

This has been attempted multiple times over ~3 months. The instructions below state the root cause plainly and give exact code. Follow them in order. Do not skip the verification checklist at the end — that is how you confirm the fix actually worked, not just that it compiles.

---

## SUMMARY OF ROOT CAUSES (3 issues, ranked by likely impact)

1. **The LLM gateway is very likely silently disabled in production** — because the environment variable it depends on (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`) is missing, blank, or invalid in Coolify's environment settings. When disabled, the code doesn't crash or error visibly — it just quietly serves worse answers. This is the most likely explanation for "not grounding to an LLM" and a large share of "not picking up knowledge packs."
2. **"Lume-V governance" does not exist anywhere in the runtime code path.** It is currently only a declarative manifest file (`src/knowledge/local/local-lumev.js`) describing intents/inputs/outputs/constraints — but nothing in `gateway.js`, `grounded-rag.js`, or `orchestrator.js` ever imports or calls it. Comments say "governed by Lume-V" but no code enforces anything. This needs to be built, not patched.
3. **Voice narration lags ~20 seconds behind text** because `/api/speak/voice` reruns the ENTIRE 42-module + knowledge pipeline a second time (duplicating the work already done by `/api/speak`), and only starts the ElevenLabs TTS call after that second run finishes — three slow things stacked sequentially instead of one.

None of these are "knowledge packs failing to load." `loader.js` registers 270+ packs unconditionally and `DomainKnowledgeEngine.register()` throws immediately if a pack is malformed — if packs weren't loading, the server would crash on boot, not run silently degraded. Confirm this is still true if you're re-diagnosing (see Ruled Out section).

---

## FIX 1 — Verify & make the LLM gateway failure LOUD instead of silent

### Step 1a (Jason must do this — cannot be verified from the repo)
Coolify manages environment variables outside the repo. `render.yaml` in this repo is **stale** — the project is no longer deployed on Render, so its declared env vars do not reflect reality. Jason: open the Coolify dashboard → this service → Environment Variables, and confirm:
- `ANTHROPIC_API_KEY` — is it present at all? (`gateway.js` prefers Anthropic if this key exists)
- `OPENAI_API_KEY` — is it present and a valid, non-expired key? (fallback if Anthropic key absent)
- At least one of these two must be present and valid, or the LLM is fully disabled.
- Also confirm `ELEVENLABS_API_KEY` is present (needed for Fix 3 to matter).

### Step 1b — Code change: make gateway startup failure impossible to miss
Currently `src/conversation/gateway.js` only logs a `console.warn` on boot if disabled — easy to miss in a firehose of Coolify logs, and nothing surfaces the disabled state to the running app's health/status endpoints at runtime.

**File:** `src/conversation/gateway.js`
**Find this block in the constructor:**

```js
    if (this._enabled) {
      console.log(`[ConversationGateway] Provider: ${this._provider} (${this._model})`);
    } else {
      console.warn("[ConversationGateway] No LLM API key configured — gateway disabled");
    }
```

**Replace with:**

```js
    if (this._enabled) {
      console.log(`[ConversationGateway] Provider: ${this._provider} (${this._model})`);
    } else {
      console.error("═══════════════════════════════════════════════════════════");
      console.error("[ConversationGateway] FATAL CONFIG WARNING: No LLM API key configured.");
      console.error("[ConversationGateway] Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set.");
      console.error("[ConversationGateway] Gateway is DISABLED. All LLM composition, grounded");
      console.error("[ConversationGateway] response polishing, and conversational fallback will");
      console.error("[ConversationGateway] be skipped. Set one of these env vars in Coolify.");
      console.error("═══════════════════════════════════════════════════════════");
    }
```

**Also add this getter right after the existing `get provider()` getter**, so the running app can report its own disabled state via the API instead of hiding it:

```js
  /** Human-readable diagnostic reason if disabled — surfaced via /api/status */
  get diagnostic() {
    if (this._enabled) return { status: "ok", provider: this._provider, model: this._model };
    return {
      status: "DISABLED",
      reason: "No ANTHROPIC_API_KEY or OPENAI_API_KEY set in environment",
      impact: "LLM grounded composition, conversational fallback, and LLM-based query comprehension are all inactive",
    };
  }
```

**File:** `demo/server.js`
Find the existing `/health` handling near the top of the file (the early-binding health check), and also find wherever `/api/status` or a similar diagnostics endpoint exists (search for `sendJSON(res, {` blocks near `/api/`). Add the gateway diagnostic to whatever status/health JSON endpoint already exists, e.g.:

```js
  if (url.pathname === "/api/status") {
    sendJSON(res, {
      // ...existing fields...
      llmGateway: dda._conversationGateway.diagnostic,
    });
    return;
  }
```

If no `/api/status` endpoint exists yet, add one. This gives a single URL Jason can hit after every deploy to confirm the LLM is actually live, instead of discovering it 3 months later through degraded answers.

---

## FIX 2 — Build real Lume-V enforcement (currently doesn't exist)

Today, `local-lumev.js` only declares constraints as data. Nothing checks them. We will make it an actual gate that runs before any LLM call leaves the system, and stamps every LLM-touched response with a governance record.

**New file:** `src/governance/lume-v-gate.js`

```js
/**
 * Lume-V Governance Gate — Enforcement Layer
 * DarkWave Studios LLC — Copyright 2026
 *
 * This is the ACTUAL enforcement of Lume-V, not a manifest. Every LLM call
 * that leaves the system (grounded composition or pure conversational)
 * must pass through certify() first. If it fails, the caller must NOT
 * make the LLM call and should fall back to a deterministic/template path.
 */

import { createHash } from "crypto";

const MAX_INPUT_LENGTH = 8000;

export class LumeVGate {
  constructor(manifest) {
    this._manifest = manifest;
    this._certifiedCount = 0;
    this._rejectedCount = 0;
  }

  /**
   * Certify a request before it is allowed to reach an LLM.
   * @param {object} request - { input, facts, mode } — mode: "grounded" | "conversational"
   * @returns {{ allowed: boolean, reason?: string, certificate?: object }}
   */
  certify(request) {
    const { input, facts = [], mode } = request;

    if (!input || typeof input !== "string" || !input.trim()) {
      this._rejectedCount++;
      return { allowed: false, reason: "Empty or invalid input" };
    }

    if (input.length > MAX_INPUT_LENGTH) {
      this._rejectedCount++;
      return { allowed: false, reason: `Input exceeds Lume-V max length (${MAX_INPUT_LENGTH})` };
    }

    // Grounded mode requires at least one fact — never let "grounded" mean "ungrounded"
    if (mode === "grounded" && (!facts || facts.length === 0)) {
      this._rejectedCount++;
      return { allowed: false, reason: "Grounded mode requires at least one retrieved fact" };
    }

    this._certifiedCount++;
    const certificate = {
      governance: "Lume-V",
      mode,
      factCount: facts.length,
      inputHash: createHash("sha256").update(input).digest("hex").slice(0, 16),
      certifiedAt: new Date().toISOString(),
    };

    return { allowed: true, certificate };
  }

  stats() {
    return { certified: this._certifiedCount, rejected: this._rejectedCount };
  }
}
```

**File:** `src/conversation/gateway.js`
Add the import at the top:

```js
import { LumeVGate } from "../governance/lume-v-gate.js";
```

In the constructor, after `this._enabled = !!this._apiKey;`, add:

```js
    this._lumeV = new LumeVGate();
```

Now wrap both LLM entry points with certification. **In `generate(input, options = {})`**, right after `if (!this._enabled) return null;`, add:

```js
    const cert = this._lumeV.certify({ input, mode: "conversational" });
    if (!cert.allowed) {
      console.warn(`[Lume-V] Blocked conversational call: ${cert.reason}`);
      return null;
    }
```

**In `composeGrounded(input, facts, options = {})`**, right after `if (!this._enabled || !facts || facts.length === 0) return null;`, add:

```js
    const cert = this._lumeV.certify({ input, facts, mode: "grounded" });
    if (!cert.allowed) {
      console.warn(`[Lume-V] Blocked grounded call: ${cert.reason}`);
      return null;
    }
```

Then in both methods, where the successful return object is built, add the certificate to the response so it's auditable downstream, e.g. in `composeGrounded`'s return:

```js
      return {
        response: result.content,
        model: result.model,
        usage: result.usage,
        latency,
        facts: facts.map(f => ({ domain: f.domain, source: f.source, intentKey: f.intentKey })),
        mode: "GROUNDED",
        source: "grounded_composition",
        provider: this._provider,
        lumeV: cert.certificate,
      };
```

(Same pattern for `generate()`'s return object — add `lumeV: cert.certificate`.)

This makes "governed by Lume-V" literally true: every LLM response now carries a certificate proving it passed the gate, and any response that fails certification never reaches the LLM at all — it falls back to the existing template/deterministic path automatically (because `gateway.generate()`/`composeGrounded()` returning `null` already triggers the fallback logic in `grounded-rag.js` and `orchestrator.js` — no changes needed there).

---

## FIX 3 — Fix the 20-second voice narration lag

**File:** `demo/server.js`
**Root cause:** `/api/speak/voice` calls `dda.speak()` a second time (duplicating the work `/api/speak` already did) before even starting the ElevenLabs call.

**Find:**

```js
  // POST /api/speak/voice — TTS
  if (url.pathname === "/api/speak/voice" && req.method === "POST") {
    try {
      const body = JSON.parse(await readBody(req));
      const result = await dda.speak(body.input || "");
      const audio = await elevenLabsTTS(result.response);
      if (audio) {
        res.writeHead(200, {
          "Content-Type": "audio/mpeg",
          "X-Axiom-Register": result.register,
          "X-Axiom-Hash": result.responseHash,
        });
        res.end(audio);
      } else {
        sendJSON(res, { ...result, audio: null, voiceError: "TTS unavailable" });
      }
    } catch (err) { sendJSON(res, { error: err.message }, 400); }
    return;
  }
```

**Replace with:**

```js
  // POST /api/speak/voice — TTS
  // Accepts EITHER { input } (will run the pipeline itself, legacy behavior)
  // OR { text, register, responseHash } (reuses an already-computed /api/speak result — fast path)
  if (url.pathname === "/api/speak/voice" && req.method === "POST") {
    try {
      const body = JSON.parse(await readBody(req));

      let responseText, register, responseHash;
      if (body.text) {
        // Fast path: frontend already has the text from /api/speak — do NOT rerun the pipeline.
        responseText = body.text;
        register = body.register || null;
        responseHash = body.responseHash || null;
      } else {
        // Legacy/fallback path: only rerun the pipeline if no precomputed text was given.
        const result = await dda.speak(body.input || "");
        responseText = result.response;
        register = result.register;
        responseHash = result.responseHash;
      }

      const audio = await elevenLabsTTS(responseText);
      if (audio) {
        res.writeHead(200, {
          "Content-Type": "audio/mpeg",
          "X-Axiom-Register": register,
          "X-Axiom-Hash": responseHash,
        });
        res.end(audio);
      } else {
        sendJSON(res, { response: responseText, audio: null, voiceError: "TTS unavailable" });
      }
    } catch (err) { sendJSON(res, { error: err.message }, 400); }
    return;
  }
```

**Frontend requirement (whichever `demo/*.html`/JS calls these two endpoints):** update it to call `/api/speak` first, then immediately call `/api/speak/voice` with `{ text: result.response, register: result.register, responseHash: result.responseHash }` instead of `{ input: originalInput }`. This eliminates the duplicate pipeline run, which is the biggest chunk of the 20-second delay. The remaining delay will just be the single ElevenLabs synthesis call (typically 2–6 seconds for a few sentences) — much closer to real-time. If the front-end can be changed to fire the `/api/speak` and TTS request in parallel (predicting/streaming text while audio renders), that removes the ElevenLabs wait too, but the fix above alone should remove the bulk of the lag.

---

## RULED OUT (do not re-investigate these — already confirmed not the cause)

- **Knowledge pack loading/registration is not broken.** `src/knowledge/loader.js`'s `createKnowledgeEngine()` registers 270+ packs unconditionally; `DomainKnowledgeEngine.register()` in `src/knowledge/engine.js` throws immediately if `pack.id` is missing — a broken pack would crash server boot, not silently degrade. If packs still appear "missing" after Fix 1, the cause is retrieval/comprehension quality (see below), not loading.
- **Retrieval keyword matching in `GroundedRAG.retrieve()` (`src/engines/grounded-rag.js`) is functioning as designed** — it scores against `intentKey` words extracted from comprehension keywords. Its quality is directly dependent on whether `comprehend()` gets good keywords, which depends on Fix 1 (LLM classification is far better than the manual regex/stopword fallback used when the LLM is disabled).

---

## VERIFICATION CHECKLIST (run all of these after applying fixes — do not skip)

1. **Confirm LLM is live:** Hit the new `/api/status` endpoint (or whatever health endpoint you wired `llmGateway` into). Expect `"status": "ok"` with a real provider/model. If it says `"DISABLED"`, stop — go back to Step 1a, the Coolify env var is still missing, no code fix will help until that's set.
2. **Confirm Lume-V certificates appear:** Send a request that should hit grounded composition — e.g. `POST /api/speak` with `{ "input": "what size tire does a 2014 ram truck have", "mode": "wrapped" }`. In the response JSON, confirm a `lumeV` object is present with `governance: "Lume-V"`, a `certifiedAt` timestamp, and `factCount > 0`.
3. **Confirm Lume-V actually blocks bad calls:** Send `POST /api/speak/voice` (or trigger `composeGrounded` some other way) with facts explicitly empty, or an 9000+ character input, and confirm the server logs `[Lume-V] Blocked grounded call: ...` and falls back to a template/deterministic response instead of erroring.
4. **Confirm knowledge pickup improved:** Ask 5 domain-specific questions that map to distinct packs (e.g. one automotive, one legal, one cooking/food, one finance, one history question). With the LLM live, confirm none of them return the generic "No knowledge pack matches" gap response that was common before Fix 1.
5. **Confirm voice lag is fixed:** In the browser network tab, time from when text appears on screen to when `/api/speak/voice` request is sent — it should fire immediately with `{ text, register, responseHash }` in the body (not `{ input }`), and the response should arrive in a few seconds (single ElevenLabs call), not ~20 seconds.
6. **Regression check:** Run `npm run test` (existing `tests/run-all.js`) and confirm nothing existing broke.

If any of these fail, the log output described in Fix 1b and the `[Lume-V]` log lines from Fix 2 should tell you exactly which layer is still failing — do not guess, read the log line.
