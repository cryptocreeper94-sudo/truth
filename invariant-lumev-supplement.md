# Invariant — Lume-V Supplement Handoff
**For:** Gemini Implementation Agent  
**Date:** June 22, 2026  
**Repo:** `cryptocreeper94-sudo/invariant`  
**Applies after:** `invariant-master-handoff.md` is applied  
**Purpose:** Add Lume-V as a named card in the Invariant ecosystem carousel. It was omitted from the master handoff and must be added now.

---

## What Lume-V Is

Lume-V is the voice and visual layer of the Lume language — the compiler interface that takes spoken or visual input and resolves it to deterministic Lume output. It is a distinct published system with its own Zenodo DOI (`10.5281/zenodo.19645097`) and its own deployed site at `lumev.tlid.io`. It is NOT absorbed into `lume-lang.org` — it is a separate product in the ecosystem.

It belongs in the carousel immediately after Lume Language, before HydroCore. Lume is the substrate. Lume-V is the interface layer above it. The order reflects the stack.

---

## Fix — Add Lume-V Card to Carousel

**File:** `src/lume/main.lume` — the `eco_items` array  
**Applied on top of:** the corrected `eco_items` array from the master handoff

Insert this item as the **second entry** in `eco_items`, immediately after the Lume Language card:

```javascript
{ 
  title: "Lume-V", 
  desc: "The voice and visual compiler interface for the Lume language. Spoken input resolves to deterministic Lume output. The human-to-engine layer above the substrate.", 
  link: "https://lumev.tlid.io", 
  img: "/assets/lumev_card.png", 
  domain: "lumev.tlid.io" 
},
```

The full corrected order for the first four cards:

```javascript
define eco_items = [
  { title: "Lume Language", ..., featured: true,  domain: "lume-lang.org" },   // 1 — genesis
  { title: "Lume-V",        ..., domain: "lumev.tlid.io" },                    // 2 — voice/visual layer
  { title: "HydroCore",     ..., domain: "hydrocore.dev" },                    // 3
  { title: "Meridian",      ..., domain: "meridiancanon.com" },                // 4
  // ... rest unchanged
]
```

---

## Fix — Trust Layer Card Image

The master handoff's `eco_items` array incorrectly uses `lumev_card.png` as the Trust Layer card image:

```javascript
// WRONG (current):
{ title: "Trust Layer", ..., img: "/assets/lumev_card.png", coming_soon: true }

// CORRECT:
{ title: "Trust Layer", ..., img: "/assets/trustlayer_card.png", coming_soon: true }
```

If `trustlayer_card.png` does not yet exist in `/assets/`, use `axiom_card.png` as a placeholder:

```javascript
{ title: "Trust Layer", ..., img: "/assets/axiom_card.png", coming_soon: true }
```

`lumev_card.png` is now correctly assigned to the Lume-V card above.

---

## Fix — ENGINE_MAP Deep Link

**File:** `index.html` — the `ENGINE_MAP` object from Fix 2 of the master handoff

Add Lume-V to the ENGINE_MAP so deep linking works:

```javascript
const ENGINE_MAP = {
  'lume':           { url: 'https://lume-lang.org',              title: 'LUME LANGUAGE' },
  'lumev':          { url: 'https://lumev.tlid.io',              title: 'LUME-V' },        // ADD THIS
  'hydrocore':      { url: 'https://hydrocore.dev',              title: 'HYDROCORE' },
  'meridian':       { url: 'https://meridiancanon.com',          title: 'MERIDIAN' },
  'biocore':        { url: '/dist/biocore/engine.html',          title: 'BIOCORE' },
  'governancecore': { url: '/dist/governancecore/engine.html',   title: 'GOVERNANCECORE' },
  'neurocore':      { url: '/dist/neurocore/engine.html',        title: 'NEUROCORE' },
  'sociocore':      { url: '/dist/sociocore/engine.html',        title: 'SOCIOCORE' },
  'verdara':        { url: '/dist/verdara/verdara.js',           title: 'VERDARA' },
};
```

---

## Fix — Status Bar

**File:** `index.html` — the `buildStatusBar()` function from Fix 3 of the master handoff

Add Lume-V to the status bar cores array, as a static green dot (external live site):

```javascript
const cores = [
  { key: 'LUME',           label: 'LUME',       static: true },
  { key: 'LUMEV',          label: 'LUME-V',     static: true },   // ADD THIS
  { key: 'HYDROCORE',      label: 'HYDROCORE',  static: true },
  { key: 'MERIDIAN',       label: 'MERIDIAN',   static: true },
  { key: 'BIOCORE',        label: 'BIOCORE',    static: false },
  { key: 'GOVERNANCECORE', label: 'GOVERNANCE', static: false },
  { key: 'NEUROCORE',      label: 'NEURO',      static: false },
  { key: 'SOCIOCORE',      label: 'SOCIO',      static: false },
];
```

Also add LUMEV to the `item.addEventListener('click', ...)` ENGINE_MAP lookup — it will resolve correctly since `'lumev'` is now in ENGINE_MAP.

---

## Fix — Deploy Script

**File:** `deploy_ecosystem.cjs`

The `LUME_V_SRC` variable is already present from the master handoff fix. Confirm it is wired to actually copy Lume-V's built assets into the dist output, not just defined and ignored:

```javascript
const LUME_V_SRC = process.env.LUME_V_SRC || path.join(__dirname, '..', 'lume-v-site', 'dist');

// Confirm this copy block exists:
if (fs.existsSync(LUME_V_SRC)) {
  copyDir(LUME_V_SRC, path.join(DIST, 'lumev'));
  console.log('✓ Lume-V copied');
} else {
  console.warn('⚠ LUME_V_SRC not found — skipping Lume-V copy');
}
```

If the copy block is missing, add it. The warning fallback means a missing `lume-v-site` build doesn't crash the deploy.

---

## Verification

- [ ] Carousel second card is Lume-V with `lumev.tlid.io` domain tag
- [ ] Lume-V card is NOT marked `coming_soon` — it is a live site
- [ ] `invariant.foundation/#lumev` deep link opens `lumev.tlid.io`
- [ ] Status bar has `LUME-V` dot — turns green on page load
- [ ] Trust Layer card no longer uses `lumev_card.png`
- [ ] No `localhost` URLs in any card — grep confirms zero
- [ ] Lume-V DOI `10.5281/zenodo.19645097` not referenced on the Invariant site itself (it's in the paper series, not needed here — don't add it to the card desc)

---

## Push

Add to the existing commit from the master handoff, or push as a follow-up:

```bash
git add -A
git commit -m "feat: add lume-v card to carousel, engine map, and status bar"
git push origin main
```
