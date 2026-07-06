# Axiom DDA — Root Cause Diagnosis & Fix Handoff (for Gemini)

**Repo:** `cryptocreeper94-sudo/DDA` ("Axiom DDA")
**Deploy target:** Coolify (auto-detects Node app via `package.json` `start` script → `node demo/server.js`)
**Prepared by:** Diagnostic pass across the full request path (loader → engine → grounded-rag → gateway → orchestrator → demo/server.js)
**Purpose:** This is a single consolidated file. Everything you need — root causes, exact code, and how to verify — is in this one document. Do not guess at causes not listed here; they were ruled out during diagnosis (see "Ruled Out" section).

This has been attempted multiple times over ~3 months. The instructions below state the root cause plainly and give exact code. Follow them in order. Do not skip the verification checklist at the end — that is how you confirm the fix actually worked, not just that it compiles.

---

## UPDATE (2026-07-06): PRIORITY-0 ROOT CAUSE FOUND — READ THIS FIRST

Everything below this section was diagnosed and (per commit history) largely already applied. It was real and worth doing, but it did NOT fix the core problem, because there is a bigger gate sitting upstream of all of it. **Confirmed live against production** (`https://axiom42.com/api/speak`) on 2026-07-06: ordinary questions like "what size tire does a 2014 ram truck have" and "explain the difference between a Roth IRA and a traditional IRA" both come back with `"pipelineStatus":"GATE_REQUEST"`, `"gatedAt":"M-15"`, `"knowledgeHit":null`, `"groundedFacts":null`. **The request never reaches the knowledge packs, GroundedRAG, or the LLM at all.** This is FIX 0 — apply it before anything else; it explains "not picking up knowledge packs" far more completely than the LLM-key issue did.

### FIX 0 — Module 15 (`ReferenceResolver`) is gating almost every real question before knowledge lookup ever runs

**File:** `src/modules/layer3-constraint/13-17-constraint.js`

**Root cause:** Every input goes through a fixed 42-module deterministic pipeline (`DDAOrchestrator.process()` in `src/runtime/orchestrator.js`) BEFORE the knowledge engine or GroundedRAG is ever consulted. `orchestrator.js`'s `speak()`/`speakDeterministic()` only proceed to knowledge lookup / GroundedRAG / LLM if `pipelineResult.status === "COMPLETE"` — if the pipeline returns `GATE_REQUEST` at any module, the whole knowledge/LLM section is skipped entirely and a generic canned response is returned instead.

Module 15 (`ReferenceResolver`) checks what fraction of the user's words match a **tiny 19-entity ontology** in `src/ontology/core-ontology.js` (entities like `USER`, `AGENT`, `INPUT`, `FRAME`, `RESPONSE`, `DOMAIN`, `SIGNAL`, `CERT` — pipeline bookkeeping concepts, not knowledge). If more than 85% of the words in an input (for inputs over 3 words) aren't found in that tiny ontology, it hard-stops the request:

```js
    if (unresolvedRatio > 0.85 && tokens.length > 3) {
      return {
        action: "GATE_REQUEST",
        reason: "M-15: High unresolved reference ratio — input may be outside agent domain.",
        gateType: "REFERENCE_RESOLUTION",
      };
    }
```

The actual knowledge lives in 270+ packs covering 120,000+ topics — completely separate from this 19-entity ontology. Since almost no everyday question (tires, IRAs, recipes, symptoms, anything) uses the pipeline's bookkeeping vocabulary, nearly every real question gets a near-100% "unresolved" ratio and is blocked here, regardless of whether the knowledge packs or the LLM could have answered it. Module 16 (`DomainMapper`) compounds this the same way, gating again if `domainConfidence < 0.15`, which is partly derived from this same unresolved ratio.

**Fix — make M-15/M-16 advisory instead of a hard gate, and let actual knowledge/LLM availability decide domain fit:**

In `ReferenceResolver._execute()`, replace the hard gate:

```js
    if (unresolvedRatio > 0.85 && tokens.length > 3) {
      return {
        action: "GATE_REQUEST",
        reason: "M-15: High unresolved reference ratio — input may be outside agent domain.",
        gateType: "REFERENCE_RESOLUTION",
      };
    }

    return { action: "PROCEED", data: { referencesResolved: resolved.length } };
```

with:

```js
    // NOTE: This module's ontology only covers ~19 pipeline-bookkeeping entities
    // (USER, AGENT, FRAME, etc.) — it does NOT cover the 120,000+ topics in the
    // knowledge packs. A high unresolvedRatio here means "not pipeline jargon,"
    // NOT "outside the agent's knowledge." Do not hard-gate on it. Let the
    // knowledge engine / GroundedRAG in orchestrator.speak() make the real
    // "do we know this" decision — that's the system with the actual domain
    // coverage. This module just annotates ctx.references for downstream use.
    return { action: "PROCEED", data: { referencesResolved: resolved.length, unresolvedRatio } };
```

In `DomainMapper._execute()` (Module 16, same file), find the equivalent hard gate on `domainConfidence < 0.15` and apply the same change: keep computing and attaching `ctx.domain` (other modules and the DPCL response formatter may read it), but change its `return` from `{ action: "GATE_REQUEST", ... }` to `{ action: "PROCEED", data: { domainConfidence } }`. Do NOT delete the confidence computation — only remove the hard `GATE_REQUEST` return so it stops blocking the pipeline. Downstream, `orchestrator.speak()`/`speakDeterministic()` already have a well-designed fallback chain (live data → GroundedRAG → Wikipedia → honest "I don't know" template) that is a much better arbiter of "do we actually know this" than a 19-entity keyword check. Let that chain run instead of preempting it.

**Why this is safe:** `M-38` (PreStructureMonitor) and the Layer 6 safety modules (M-35 through M-42 — CollapseDetection, DissolutionGuard, NullBoundaryGuard, etc.) remain fully intact and still run at the end of the pipeline as the actual safety envelope. This change only stops M-15/M-16 from pre-emptively blocking ordinary factual questions before the knowledge/LLM layer gets a chance to answer them.

**Verify this fix first, before re-testing anything else in this document:**
```bash
curl -X POST https://axiom42.com/api/speak -H "Content-Type: application/json" \
  -d '{"input":"what size tire does a 2014 ram truck have","mode":"auto"}'
```
Before the fix: `"pipelineStatus":"GATE_REQUEST"`, `"gatedAt":"M-15"`, `"knowledgeHit":null`.
After the fix: `"pipelineStatus":"COMPLETE"`, `"gatedAt":null`, and `"knowledgeHit"` should be truthy (or at minimum the response should attempt a real answer instead of the generic "i don't have a specific knowledge match" template).

---

## SUMMARY OF ADDITIONAL ROOT CAUSES (secondary — apply after FIX 0)

These were diagnosed earlier and, per commit history, largely already applied to the repo (see commits `3263f4f`, `7485c9f`, `4a7dfd1`). They are still worth confirming, but none of them matter until FIX 0 above is applied — a gated request never reaches any of this code.

1. **The LLM gateway may still be silently disabled in production** — because the environment variable it depends on (`ANTHROPIC_API_KEY` or `OPENAI_API_KEY`) is missing, blank, or invalid in Coolify's environment settings. When disabled, the code doesn't crash or error visibly — it just quietly serves worse answers.
2. **"Lume-V governance" did not exist anywhere in the runtime code path** prior to commit `3263f4f` — confirm the `LumeVGate` described below is actually present and wired into `gateway.js` on the current `main`.
3. **Voice narration lag** — confirm the `/api/speak/voice` fast-path (accepting precomputed `{ text }` instead of re-running the pipeline) described below is present and that the frontend actually calls it that way.

Separately (already partially addressed by commits `7485c9f` / `4a7dfd1` / VPS upgrade to 8GB RAM on Hetzner): the app was previously OOM-crashing on a 4GB VPS while loading thousands of knowledge packs (`--max-old-space-size=6144` was set on a box smaller than that ceiling, which is actively counterproductive — it lets V8 grow memory further before collecting, making an OS-level SIGKILL more likely, not less). The VPS has since been upgraded to 8GB, which resolves the immediate mismatch. If OOM symptoms return, re-check that `--max-old-space-size` stays meaningfully below actual available RAM (leave 1.5–2GB headroom for the OS, Postgres, and the background `knowledge_expansion_daemon.mjs` process), rather than raising the ceiling indefinitely.

None of these are "knowledge packs failing to load" in the sense of registration failing. `loader.js` registers 270+ packs unconditionally and `DomainKnowledgeEngine.register()` throws immediately if a pack is malformed — if packs weren't loading, the server would crash on boot, not run silently degraded. Confirm this is still true if you're re-diagnosing (see Ruled Out section).

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
