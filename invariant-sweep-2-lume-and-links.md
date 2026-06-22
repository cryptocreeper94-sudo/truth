# Invariant — Sweep 2: Add Lume Language + Fix Broken Links
**Repo:** `cryptocreeper94-sudo/invariant`  
**Verified against:** latest main  
**Date:** June 22, 2026  
**For:** Gemini Implementation Agent

Read this fully before touching anything. Three categories of fixes.

---

## The Problem

1. **Lume Language (`lume-lang.org`) is not in the carousel at all.** This is the programming language that powers every `.lume` file in Invariant, LumeCortex, HydroCore, and the rest of the ecosystem. It is the genesis. It should be the first card.

2. **Three carousel items link to `localhost`.** Any real visitor gets a dead link:
   - Axiom News → `http://localhost:3000`
   - Truth Engine → `http://localhost:3001`
   - Trust Layer → `http://localhost:3002`

3. **HydroCore and Meridian still point to local `/dist/` paths** — not the real canonical domains (`hydrocore.dev` and `meridiancanon.com`). This was covered in sweep-1b but confirm it is applied here.

---

## Fix 1 — Add Lume Language as the First Card

**File:** `src/lume/main.lume` — the `eco_items` array

Add this as the **first entry** in the `eco_items` array, before Meridian:

```javascript
{
  title: "Lume Language",
  desc: "The first programming language you can speak. The deterministic substrate powering every engine in the Invariant ecosystem. Zero dependencies. Zero ambiguity.",
  link: "https://lume-lang.org",
  img: "/assets/lume42_card.png",
  featured: true,
  domain: "lume-lang.org"
}
```

The `featured: true` flag should give it a visual distinction in the carousel — a glowing border, a "GENESIS" or "FOUNDATION" badge, or a slightly larger card. Add whatever badge treatment is consistent with the existing carousel card design. The key is that it reads as the foundational layer, not just another product.

---

## Fix 2 — Fix HydroCore and Meridian Links

In `eco_items`, find and update:

**HydroCore** — change:
```
"link": "/hydrocore/index.html"
```
to:
```
"link": "https://hydrocore.dev"
```

**Meridian** — change:
```
"link": "/meridian/index.html"
```
to:
```
"link": "https://meridiancanon.com"
```

Also update their descriptions to match the real sites:

```javascript
// HydroCore
{
  title: "HydroCore",
  desc: "The world's first deterministic closed-loop hydrogen governance engine. 42 nodes. 4 flow primitives. Patent 64/032,339 pending.",
  link: "https://hydrocore.dev",
  img: "/assets/hydrocore_card.png",
  domain: "hydrocore.dev"
}

// Meridian
{
  title: "Meridian",
  desc: "Wireless Energy Architecture. Deterministic signal routing and energy governance.",
  link: "https://meridiancanon.com",
  img: "/assets/meridian_card.png",
  domain: "meridiancanon.com"
}
```

---

## Fix 3 — Fix or Gate the Three Localhost Items

**File:** `src/lume/main.lume` — `eco_items` array

These three items have dead `localhost` URLs that will never work for any real visitor:

- Axiom News → `http://localhost:3000`
- Truth Engine → `http://localhost:3001`
- Trust Layer → `http://localhost:3002`

**Do not guess at real URLs for these** — Jason hasn't specified where they will live. Instead, mark them as `coming_soon: true` and update their links to `#`. The carousel card renderer should check this flag and display a "COMING SOON" badge instead of making them clickable:

```javascript
{ title: "Axiom News",      desc: "Purely deterministic, non-biased news aggregate engine. Strips narrative and emotional manipulation to deliver immutable, cryptographically-verified facts.", link: "#", img: "/assets/axiom_card.png",    coming_soon: true },
{ title: "Truth Engine",    desc: "Layer 1 Deterministic Math Engine.",                                                                                                                          link: "#", img: "/assets/meridian_card.png", coming_soon: true },
{ title: "Trust Layer",     desc: "Cryptographically isolated trust fabric for multi-division enterprise execution.",                                                                             link: "#", img: "/assets/lumev_card.png",    coming_soon: true },
```

**Update the carousel card renderer** to handle the `coming_soon` flag. Find where cards are rendered and add:

```javascript
// Inside the card render loop, after creating the card element:
if (item.coming_soon) {
  // Add badge
  const badge = document.createElement('div');
  badge.textContent = 'COMING SOON';
  badge.style.cssText = 'position:absolute;top:12px;right:12px;font-size:9px;font-weight:700;letter-spacing:0.12em;padding:3px 8px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:2px;color:rgba(255,255,255,0.4);font-family:"Space Mono",monospace;';
  card.style.position = 'relative';
  card.appendChild(badge);
  // Make it non-clickable
  card.style.cursor = 'default';
  card.style.opacity = '0.5';
  card.style.pointerEvents = 'none';
}
```

---

## Fix 4 — Update ENGINE_MAP for Deep Linking

**File:** `index.html` — the `ENGINE_MAP` object

Add Lume Language and confirm HydroCore/Meridian use real domains:

```javascript
const ENGINE_MAP = {
  'lume':           { url: 'https://lume-lang.org',              title: 'LUME LANGUAGE' },
  'hydrocore':      { url: 'https://hydrocore.dev',              title: 'HYDROCORE' },
  'meridian':       { url: 'https://meridiancanon.com',          title: 'MERIDIAN' },
  'biocore':        { url: '/dist/biocore/engine.html',          title: 'BIOCORE' },
  'governancecore': { url: '/dist/governancecore/engine.html',   title: 'GOVERNANCECORE' },
  'neurocore':      { url: '/dist/neurocore/engine.html',        title: 'NEUROCORE' },
  'sociocore':      { url: '/dist/sociocore/engine.html',        title: 'SOCIOCORE' },
  'verdara':        { url: '/dist/verdara/verdara.js',           title: 'VERDARA' },
};
```

Now `invariant.foundation/#lume` will launch the Lume Language site directly inside the Invariant shell.

---

## Fix 5 — Manifesto Section: Reference Lume as the Substrate

**File:** `src/lume/main.lume` — the manifesto section

The current manifesto text reads:

> *"The current digital and financial architectures are built on a foundation of sand—narrative, emotion, and manipulation. Invariant is the architectural foundation of the future. We do not gamble. We do not speculate. We execute mathematical truth."*

Add a second paragraph beneath it that ties the language to the thesis:

```javascript
define man_p2 = dom.create("p", { 
  className: "text-stark", 
  text: "Every engine in this system is written in Lume — the first programming language built for determinism by design. No ambiguity in the syntax. No speculation in the output. If the language is deterministic, the system is deterministic. That is the standard.", 
  styles: { 
    color: "var(--bg-secondary)", 
    marginTop: "24px", 
    fontSize: "1rem", 
    maxWidth: "800px", 
    margin: "24px auto 0 auto", 
    textAlign: "center",
    lineHeight: "1.8",
    opacity: "0.7"
  } 
})
dom.add_child(man_container, man_p2)
```

---

## Verification Checklist

Before pushing, confirm all of these:

- [ ] Lume Language is the first card in the carousel with a featured/genesis visual treatment
- [ ] Clicking the Lume Language card opens `lume-lang.org` in the iframe shell (or fallback to new tab if blocked)
- [ ] HydroCore card links to `hydrocore.dev` — NOT `/hydrocore/index.html`
- [ ] Meridian card links to `meridiancanon.com` — NOT `/meridian/index.html`
- [ ] Axiom News, Truth Engine, Trust Layer all show "COMING SOON" badges and are non-clickable
- [ ] Enterprise Daemons also has "COMING SOON" treatment (it links to `#`)
- [ ] `#lume` hash deep link auto-launches Lume Language in the shell
- [ ] Manifesto section has the second paragraph about Lume as the language substrate
- [ ] grep the entire repo for `localhost:3000`, `localhost:3001`, `localhost:3002` — confirm zero matches remain
- [ ] grep for `meridiancore.com` — confirm zero matches (squatted domain)

---

## After All Fixes

```bash
git add -A
git commit -m "feat: add lume-lang.org as genesis card, fix hydrocore/meridian domains, gate localhost items as coming-soon"
git push origin main
```

Do not mark complete until push confirmed and checklist done.
