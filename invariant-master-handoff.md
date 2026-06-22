# Invariant — Master Handoff
**Repo:** `cryptocreeper94-sudo/invariant`  
**Verified against:** latest main  
**Date:** June 22, 2026  
**For:** Gemini Implementation Agent

This is the single complete handoff. Ignore any earlier sweep documents or supplements. Apply all fixes in order, then push once at the end.

---

## Context: What Invariant Is

Invariant is the philosophical and architectural nexus of the DarkWave ecosystem. Its thesis — "Mathematics is the new standard" — is embodied by a set of deterministic engines, each governing a different domain of reality. The site is a manifesto and a launchpad.

The full confirmed ecosystem, with correct canonical URLs:

| Engine | Domain | Status |
|---|---|---|
| **Lume Language** | `lume-lang.org` | LIVE — genesis of everything |
| **Lume-V** | `lumev.tlid.io` | LIVE — voice and visual compiler interface |
| **HydroCore** | `hydrocore.dev` | LIVE — Patent 64/032,339 pending |
| **Meridian** | `meridiancanon.com` | LIVE — Wireless Energy Architecture |
| **BioCore** | local `/dist/biocore/` | Local engine |
| **NeuroCore** | local `/dist/neurocore/` | Local engine |
| **SocioCore** | local `/dist/sociocore/` | Local engine |
| **GovernanceCore** | local `/dist/governancecore/` | Local engine |
| **Verdara** | local `/dist/verdara/` | Local engine |
| **Axiom News** | not deployed yet | Coming Soon |
| **Truth Engine** | not deployed yet | Coming Soon |
| **Trust Layer** | not deployed yet | Coming Soon |
| **Enterprise Daemons** | not deployed yet | Coming Soon |

**Critical notes on Lume and Lume-V:**
- Lume Language is not just a product in the carousel. It is the language every `.lume` file in this repo is written in. It is a published npm package (`lume-lang`, v1.1.0), has a 42-paper academic research corpus on Zenodo, and has native LLM keywords built into the syntax. The number 42 is an intentional architectural constant across the entire ecosystem (42 nodes in HydroCore, 42-module Axiom pipeline, 42 canon papers, Axiom42Suite). Lume must be the first and featured card.
- Lume-V is the voice and visual compiler interface layer above the Lume substrate — a distinct published system (Zenodo DOI: `10.5281/zenodo.19645097`) with its own live site at `lumev.tlid.io`. It is NOT absorbed into `lume-lang.org`. It sits second in the carousel, immediately after Lume Language. Lume → Lume-V → physical engines reflects the correct stack order.

---

## Fix 1 — Deterministic Telemetry (Replace Math.random())

**Applies to:** `dist/biocore/engine.html`, `dist/governancecore/engine.html`, `dist/neurocore/engine.html`, `dist/sociocore/engine.html`

Invariant's thesis is determinism. All four local engines currently generate telemetry with `Math.random()`. Replace with a seeded pseudo-random function — same seed always produces same output.

**Add to the top of the `<script>` block in each engine file:**

```javascript
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
function nodeRng(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (Math.imul(31, hash) + id.charCodeAt(i)) | 0;
  return mulberry32(Math.abs(hash));
}
```

**Replace every `Math.random()` call in the init and interval loop:**

```javascript
// Init
nodesState[node.id] = { val: 90 + nodeRng(node.id)() * 8, history: Array(20).fill(50), rng: nodeRng(node.id) };

// Interval update
setInterval(() => {
  const rng = state.rng;
  state.val = Math.max(10, Math.min(100, state.val + (rng() - 0.45) * 4));
}, 1000);
```

Do this in all four engine files. Reload the page — values must be identical on every refresh for a given node.

---

## Fix 2 — Deep Linking via URL Hash

**File:** `index.html`

Replace the existing `openApp()` and `closeApp()` functions with this version that writes and reads the URL hash. Lume-V is included in ENGINE_MAP:

```javascript
const ENGINE_MAP = {
  'lume':           { url: 'https://lume-lang.org',              title: 'LUME LANGUAGE' },
  'lumev':          { url: 'https://lumev.tlid.io',              title: 'LUME-V' },
  'hydrocore':      { url: 'https://hydrocore.dev',              title: 'HYDROCORE' },
  'meridian':       { url: 'https://meridiancanon.com',          title: 'MERIDIAN' },
  'biocore':        { url: '/dist/biocore/engine.html',          title: 'BIOCORE' },
  'governancecore': { url: '/dist/governancecore/engine.html',   title: 'GOVERNANCECORE' },
  'neurocore':      { url: '/dist/neurocore/engine.html',        title: 'NEUROCORE' },
  'sociocore':      { url: '/dist/sociocore/engine.html',        title: 'SOCIOCORE' },
  'verdara':        { url: '/dist/verdara/verdara.js',           title: 'VERDARA' },
};

function openApp(url, title) {
  const iframe = document.getElementById('app-iframe');
  const isExternal = url.startsWith('http');
  iframe.src = url;
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('app-overlay').classList.add('active');
  document.body.classList.add('app-open');
  const key = Object.keys(ENGINE_MAP).find(k => ENGINE_MAP[k].title === title) || '';
  if (key) window.location.hash = key;
  if (isExternal) {
    iframe.onload = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc || doc.URL === 'about:blank') throw new Error('blocked');
      } catch(e) {
        showExternalFallback(url, title);
      }
    };
  }
}

function showExternalFallback(url, title) {
  document.getElementById('app-iframe').srcdoc = `
    <html><body style="margin:0;background:#050505;display:flex;align-items:center;justify-content:center;height:100vh;font-family:'Inter',sans-serif;flex-direction:column;gap:24px;">
      <div style="color:rgba(255,255,255,0.3);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">${title}</div>
      <a href="${url}" target="_blank" style="background:#fff;color:#000;padding:12px 28px;border-radius:2px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">Open ${title} →</a>
      <div style="color:rgba(255,255,255,0.15);font-size:10px;">${url}</div>
    </body></html>`;
}

function closeApp() {
  document.getElementById('app-overlay').classList.remove('active');
  document.body.classList.remove('app-open');
  setTimeout(() => { document.getElementById('app-iframe').src = 'about:blank'; }, 500);
  history.pushState('', document.title, window.location.pathname);
}

// Auto-launch from hash on page load
window.addEventListener('load', () => {
  const hash = window.location.hash.slice(1);
  if (hash && ENGINE_MAP[hash]) {
    const e = ENGINE_MAP[hash];
    openApp(e.url, e.title);
  }
});
```

---

## Fix 3 — Cross-Core Signal Bus + Live Status Bar

**File:** `index.html` (main script block)

Add the Invariant signal bus and a status bar at the bottom of the page. Lume, Lume-V, HydroCore, and Meridian show static green — they're external live sites. Local engines animate based on signal bus data.

```javascript
// ── Invariant Cross-Core Signal Bus ──
const InvariantBus = {
  _listeners: {}, _state: {},
  publish(core, nodeId, value) {
    this._state[core + ':' + nodeId] = value;
    (this._listeners[core + ':' + nodeId] || []).forEach(fn => fn(value, core, nodeId));
    (this._listeners['*'] || []).forEach(fn => fn(value, core, nodeId));
  },
  subscribe(core, nodeId, fn) {
    const key = core + ':' + nodeId;
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
  },
  subscribeAll(fn) {
    if (!this._listeners['*']) this._listeners['*'] = [];
    this._listeners['*'].push(fn);
  }
};
window.InvariantBus = InvariantBus;

// ── Cross-Core Status Bar ──
function buildStatusBar() {
  const bar = document.createElement('div');
  bar.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;height:32px;background:rgba(5,5,5,0.96);border-top:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;justify-content:center;gap:32px;z-index:10000;font-family:"Inter",sans-serif;font-size:10px;letter-spacing:0.1em;';
  const cores = [
    { key: 'LUME',           label: 'LUME',       static: true },
    { key: 'LUMEV',          label: 'LUME-V',     static: true },
    { key: 'HYDROCORE',      label: 'HYDROCORE',  static: true },
    { key: 'MERIDIAN',       label: 'MERIDIAN',   static: true },
    { key: 'BIOCORE',        label: 'BIOCORE',    static: false },
    { key: 'GOVERNANCECORE', label: 'GOVERNANCE', static: false },
    { key: 'NEUROCORE',      label: 'NEURO',      static: false },
    { key: 'SOCIOCORE',      label: 'SOCIO',      static: false },
  ];
  const indicators = {};
  cores.forEach(core => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:6px;color:rgba(255,255,255,0.25);cursor:pointer;transition:color 0.3s;';
    const dot = document.createElement('div');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#222;transition:background 0.5s,box-shadow 0.5s;';
    const label = document.createElement('span');
    label.textContent = core.label;
    item.appendChild(dot);
    item.appendChild(label);
    item.addEventListener('click', () => {
      const mapKey = core.key.toLowerCase();
      const e = ENGINE_MAP[mapKey];
      if (e) openApp(e.url, e.title);
    });
    bar.appendChild(item);
    indicators[core.key] = dot;
    if (core.static) {
      setTimeout(() => {
        dot.style.background = '#22c55e';
        dot.style.boxShadow = '0 0 6px #22c55e';
      }, 800);
    }
  });
  document.body.appendChild(bar);
  InvariantBus.subscribeAll((value, core) => {
    const key = core.toUpperCase();
    if (!indicators[key]) return;
    const color = value >= 70 ? '#22c55e' : value >= 40 ? '#f59e0b' : '#ef4444';
    indicators[key].style.background = color;
    indicators[key].style.boxShadow = `0 0 6px ${color}`;
  });
}
buildStatusBar();
```

**Wire each local engine to publish to the bus.** In each `engine.html`, inside the `setInterval` update loop, add after updating `state.val`:

```javascript
if (window.parent && window.parent.InvariantBus) {
  window.parent.InvariantBus.publish('biocore', node.id, state.val);
  // Replace 'biocore' with the correct core name for each file
}
```

---

## Fix 4 — Carousel: Full Corrected eco_items Array

**File:** `src/lume/main.lume` — the `eco_items` array

Replace the entire `eco_items` array with this corrected version. Lume is first and featured, Lume-V is second, HydroCore and Meridian use real domains, local engines are wired correctly, coming-soon items are marked. Note: Trust Layer uses `axiom_card.png` — `lumev_card.png` belongs to the Lume-V card:

```javascript
define eco_items = [
  { title: "Lume Language", desc: "The deterministic natural-language programming language. English is code. Voice is a compiler. The substrate every engine in this system is built on. 42-paper research corpus. npm: lume-lang.", link: "https://lume-lang.org", img: "/assets/lume42_card.png", featured: true, domain: "lume-lang.org" },
  { title: "Lume-V", desc: "The voice and visual compiler interface for the Lume language. Spoken input resolves to deterministic Lume output. The human-to-engine layer above the substrate.", link: "https://lumev.tlid.io", img: "/assets/lumev_card.png", domain: "lumev.tlid.io" },
  { title: "HydroCore", desc: "The world's first deterministic closed-loop hydrogen governance engine. 42 nodes. 4 flow primitives. 5 operating modes. Patent 64/032,339 pending.", link: "https://hydrocore.dev", img: "/assets/hydrocore_card.png", domain: "hydrocore.dev" },
  { title: "Meridian", desc: "Wireless Energy Architecture. Deterministic signal routing and energy governance.", link: "https://meridiancanon.com", img: "/assets/meridian_card.png", domain: "meridiancanon.com" },
  { title: "BioCore", desc: "Layer 1 Biological Flow Engine. Metabolic, circulatory, and stress state governance.", link: "/dist/biocore/engine.html", img: "/assets/biocore_card.png" },
  { title: "NeuroCore", desc: "Layer 1 Cognitive Flow Engine. Neural-synaptic geometric bandwidth and attention routing.", link: "/dist/neurocore/engine.html", img: "/assets/neurocore_card.png" },
  { title: "SocioCore", desc: "Layer 1 Relational Flow Engine. Immutable trust graphs and conflict friction mapping.", link: "/dist/sociocore/engine.html", img: "/assets/sociocore_card.png" },
  { title: "GovernanceCore", desc: "Layer 1 Decision Flow Engine. Priority routing, operational authority, and macro-structural integrity.", link: "/dist/governancecore/engine.html", img: "/assets/governancecore_card.png" },
  { title: "Verdara Ultra", desc: "4/42 Deterministic Outdoor Organism — Lume-Native.", link: "/dist/verdara/verdara.js", img: "/assets/verdara_card.png" },
  { title: "Axiom News", desc: "Purely deterministic, non-biased news aggregate engine. Strips narrative and emotional manipulation to deliver immutable, cryptographically-verified facts.", link: "#", img: "/assets/axiom_card.png", coming_soon: true },
  { title: "Truth Engine", desc: "Layer 1 Deterministic Math Engine.", link: "#", img: "/assets/meridian_card.png", coming_soon: true },
  { title: "Trust Layer", desc: "Cryptographically isolated trust fabric for multi-division enterprise execution.", link: "#", img: "/assets/axiom_card.png", coming_soon: true },
  { title: "Enterprise Daemons", desc: "Unified deterministic operational platform governing enterprise infrastructure — LumeScan, CORE ledger, EMP-VL verification, and Recon OS.", link: "#", img: "/assets/daemon_card.png", coming_soon: true }
]
```

**Update the carousel card renderer** to handle `featured`, `domain`, and `coming_soon` flags:

```javascript
// Featured treatment (Lume Language only)
if (item.featured) {
  card.style.border = '1px solid rgba(6,182,212,0.4)';
  card.style.boxShadow = '0 0 24px rgba(6,182,212,0.08)';
  const badge = document.createElement('div');
  badge.textContent = 'GENESIS';
  badge.style.cssText = 'font-size:9px;font-weight:700;letter-spacing:0.15em;padding:3px 8px;background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.3);border-radius:2px;color:rgba(6,182,212,0.8);font-family:"Space Mono",monospace;margin-bottom:8px;display:inline-block;';
  card.insertBefore(badge, card.firstChild);
}

// Domain tag (for external live sites)
if (item.domain) {
  const domainTag = document.createElement('div');
  domainTag.textContent = item.domain;
  domainTag.style.cssText = 'font-family:"Space Mono",monospace;font-size:9px;color:rgba(255,255,255,0.2);letter-spacing:0.08em;margin-top:8px;border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;';
  card.appendChild(domainTag);
}

// Coming soon treatment
if (item.coming_soon) {
  const badge = document.createElement('div');
  badge.textContent = 'COMING SOON';
  badge.style.cssText = 'position:absolute;top:12px;right:12px;font-size:9px;font-weight:700;letter-spacing:0.12em;padding:3px 8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:2px;color:rgba(255,255,255,0.3);font-family:"Space Mono",monospace;';
  card.style.position = 'relative';
  card.style.opacity = '0.45';
  card.style.pointerEvents = 'none';
  card.appendChild(badge);
}
```

---

## Fix 5 — Manifesto: Name Lume as the Substrate

**File:** `src/lume/main.lume` — manifesto section

After the existing `man_p` paragraph, add a second paragraph:

```javascript
define man_p2 = dom.create("p", { 
  className: "text-stark", 
  text: "Every engine in this system is written in Lume — a natural-language programming language built for determinism by design. English is the syntax. Voice is the compiler. Mathematics is the output. If the language is deterministic, the system is deterministic. That is the standard.", 
  styles: { color: "var(--bg-secondary)", marginTop: "24px", fontSize: "1rem", maxWidth: "800px", margin: "24px auto 0 auto", textAlign: "center", lineHeight: "1.8", opacity: "0.7" } 
})
dom.add_child(man_container, man_p2)
```

---

## Fix 6 — Portable Deploy Script

**File:** `deploy_ecosystem.cjs`

Remove all hardcoded `D:\\` Windows paths. Replace with environment variables. Include Lume-V copy block with graceful fallback:

```javascript
const LUME_V_SRC    = process.env.LUME_V_SRC    || path.join(__dirname, '..', 'lume-v-site', 'dist');
const MERIDIAN_SRC  = process.env.MERIDIAN_SRC  || path.join(__dirname, '..', 'meridian-ui', 'dist');
const VERDARA_SRC   = process.env.VERDARA_SRC   || path.join(__dirname, '..', 'verdara');
const CORTEX_SRC    = process.env.CORTEX_SRC    || path.join(__dirname, '..', 'LumeCortex', 'dist');

// Lume-V copy block
if (fs.existsSync(LUME_V_SRC)) {
  copyDir(LUME_V_SRC, path.join(DIST, 'lumev'));
  console.log('✓ Lume-V copied');
} else {
  console.warn('⚠ LUME_V_SRC not found — skipping Lume-V copy');
}

// HydroCore removed — canonical at https://hydrocore.dev
```

Add `.env.example` to the repo root:

```
LUME_V_SRC=../lume-v-site/dist
MERIDIAN_SRC=../meridian-ui/dist
VERDARA_SRC=../verdara
CORTEX_SRC=../LumeCortex/dist
```

---

## Final Checks Before Pushing

Run these greps — all must return zero matches:

```bash
grep -r "localhost:300" .           # No dead localhost URLs
grep -r "meridiancore\.com" .       # No squatted domain
grep -r "D:\\\\" .                  # No hardcoded Windows paths
grep -r "/hydrocore/index\.html" .  # No stale local hydrocore path
grep -r "/meridian/index\.html" .   # No stale local meridian path
```

Then verify each item manually:

- [ ] Reload BioCore — values identical on every refresh (deterministic seed working)
- [ ] `invariant.foundation/#lume` auto-launches `lume-lang.org`
- [ ] `invariant.foundation/#lumev` auto-launches `lumev.tlid.io`
- [ ] `invariant.foundation/#hydrocore` auto-launches `hydrocore.dev`
- [ ] `invariant.foundation/#meridian` auto-launches `meridiancanon.com`
- [ ] Carousel card 1: Lume Language — cyan border, "GENESIS" badge, `lume-lang.org` domain tag
- [ ] Carousel card 2: Lume-V — no featured badge, `lumev.tlid.io` domain tag, NOT marked coming soon
- [ ] Carousel card 3: HydroCore — `hydrocore.dev` domain tag
- [ ] Carousel card 4: Meridian — `meridiancanon.com` domain tag
- [ ] Trust Layer card uses `axiom_card.png` — NOT `lumev_card.png`
- [ ] Axiom News, Truth Engine, Trust Layer, Enterprise Daemons: "COMING SOON" badge, non-clickable, 45% opacity
- [ ] Status bar visible at bottom — LUME, LUME-V, HYDROCORE, MERIDIAN dots are green on load
- [ ] BioCore/NeuroCore/SocioCore/GovernanceCore dots animate as engines run
- [ ] Manifesto has second paragraph about Lume as the language substrate
- [ ] `.env.example` exists in repo root
- [ ] No HydroCore assets being copied in deploy script

---

## Push

```bash
git add -A
git commit -m "feat: deterministic telemetry, deep linking, cross-core bus, lume-v card, lume as genesis, fix all urls, portable deploy"
git push origin main
```

Do not mark complete until push is confirmed and every checklist item above is verified.
