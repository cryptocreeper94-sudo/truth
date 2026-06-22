# Axiom DLA Engine — Correction Handoff
**For:** Gemini Implementation Agent  
**Date:** June 22, 2026  
**Repo:** `D:\dda` (local) / `cryptocreeper94-sudo/dda` (GitHub)  
**Purpose:** Two corrections to the DLA improvement plan before it is finalized. Apply both before pushing.

---

## CORRECTION 1 — Domain Thesaurus Examples Are Wrong

**What was proposed:**
```json
{
  "trust vault": "Axiom42Suite",
  "meridian": "ecosystem core"
}
```

**Why this is wrong:**
The domain thesaurus is for *natural language synonym variation in output* — expanding the surface of words the NLG pipeline can use so responses don't sound repetitive. It is not a brand name mapping file. If `"trust vault" → "Axiom42Suite"` is in the thesaurus, the composition engine will silently substitute "Axiom42Suite" into any response where the words "trust vault" appear in a knowledge pack — corrupting output with product names mid-sentence.

The TrustVault → Axiom42Suite rename is a codebase find-replace, already handled in a prior sweep. It does not belong in the thesaurus.

**What `domain-thesaurus.json` should actually contain:**

Domain-specific synonym sets for common words that appear in knowledge pack responses. The goal is richer, more varied NLG output within each domain. Format:

```json
{
  "medicine": {
    "treatment": ["therapy", "intervention", "management", "care"],
    "patient": ["individual", "person", "subject", "case"],
    "condition": ["disorder", "ailment", "diagnosis", "state"]
  },
  "physics": {
    "energy": ["power", "force", "capacity", "work"],
    "particle": ["body", "element", "unit", "constituent"],
    "measurement": ["reading", "value", "quantity", "figure"]
  },
  "finance": {
    "return": ["yield", "gain", "performance", "output"],
    "risk": ["exposure", "variance", "uncertainty", "volatility"],
    "market": ["exchange", "sector", "arena", "space"]
  },
  "technology": {
    "system": ["platform", "framework", "infrastructure", "architecture"],
    "process": ["pipeline", "workflow", "procedure", "operation"],
    "data": ["information", "content", "records", "values"]
  },
  "law": {
    "agreement": ["contract", "arrangement", "accord", "compact"],
    "violation": ["breach", "infringement", "transgression", "offense"],
    "authority": ["jurisdiction", "mandate", "power", "governance"]
  }
}
```

Extend this pattern for any of the 212 active domains. Each domain contributes its own synonym sets. The composition engine checks domain-thesaurus first, moby-thesaurus second, WordNet last.

**Do NOT add any product names, brand names, or internal DarkWave terminology to this file.**

---

## CORRECTION 2 — .env / Firebase Verification Split

**What was inferred:**
> "Because the Axiom Studio mobile version is fully operational, the FIREBASE_SERVICE_ACCOUNT and Neon keys are already injected into production — cross this off the list."

**What's actually true:**
- **Cloud/Render deployment:** ✓ Firebase and Neon are confirmed live — the mobile app working proves this. This item is done for production.
- **Local Electron build:** Still open. Render's environment variables do not transfer to a local machine. Anyone running `npm run electron:dev` or cloning the repo on a new Windows machine needs a local `.env` file with these values. The local build cannot start without it.

**Action:**
Split the verification item into two:

| Context | Status | Action |
|---|---|---|
| Cloud (Render) | ✓ Done — confirmed via mobile app | No action needed |
| Local Electron build | ✗ Open | Ensure `.env` file is documented in README with all required keys. Ensure `.env.example` exists in repo root. Ensure `.env` is in `.gitignore`. Confirm `electron/main.ts` or `server/local-index.ts` gives a clear error message if a required env var is missing — not a silent crash. |

The specific env vars the local `.env` needs (from the original debug handoff):
```
JWT_SECRET=
DATABASE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
FIREBASE_SERVICE_ACCOUNT=
APP_URL=http://localhost:5100
NODE_ENV=development
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_BUILDER=
STRIPE_PRICE_POWER=
STRIPE_PRICE_STUDIO=
WORKSPACE_ROOT=./workspaces
```

---

## EVERYTHING ELSE IN THE DLA PLAN IS CORRECT

Proceed with the rest of the plan exactly as proposed:

- ✓ Pre-decomposition build step — `scripts/predecompose-packs.mjs` → `data/fact-cache.json` → cache lookup in composition-engine
- ✓ Fallback telemetry — `_logFallback()` in cognitive-engine catch block → `logs/composition-fallbacks.log` → `scripts/fallback-report.mjs`
- ✓ Correction confidence layer — `{ original, correction, timestamp, confirmed: false, sessionsSeen: 0 }` schema → `sessionsSeen >= 2` confirmation → `scripts/audit-corrections.mjs`
- ✓ Tone detection — explicit cascading hierarchy: learned preference → regex signals → domain defaults → `'conversational'` fallback
- ✓ WordNet full ingestion update (deferred is acceptable if not yet done — just note status)

---

## VERIFICATION

After applying both corrections:

```bash
# 1. Confirm no brand names in domain-thesaurus.json
grep -i "axiom\|trustvault\|trust vault\|meridian\|cortex\|lume" data/domain-thesaurus.json
# Should return nothing

# 2. Confirm .env.example exists and is complete
cat .env.example

# 3. Confirm .env is gitignored
grep "\.env" .gitignore

# 4. Run predecompose
npm run predecompose
# Verify data/fact-cache.json was created

# 5. Run fallback report
node scripts/fallback-report.mjs
# Should parse without errors (log may be empty — that's fine)

# 6. Run audit corrections
node scripts/audit-corrections.mjs
# Should output clean diff
```

---

## PUSH

```bash
git add -A
git commit -m "fix: correct domain-thesaurus entries; split env verification; complete DLA improvements"
git push origin main
```
