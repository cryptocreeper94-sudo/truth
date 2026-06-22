# Invariant — Sweep 1: Make It Embody Its Own Thesis
**Repo:** `cryptocreeper94-sudo/invariant`  
**Verified against:** latest main  
**Date:** June 22, 2026  
**For:** Gemini Implementation Agent

Read this fully before writing code. Five fixes in priority order. Push when done.

---

## The Problem in One Sentence

Invariant's entire thesis is **determinism over speculation** — but the telemetry engines currently generate their data with `Math.random()`. That's a contradiction that needs to be fixed before anything else.

---

## Fix 1 — Replace `Math.random()` with a Seeded Deterministic Function

**Applies to:** `dist/biocore/engine.html`, `dist/governancecore/engine.html`, `dist/neurocore/engine.html`, `dist/sociocore/engine.html`

All four engines use this pattern:
```javascript
nodesState[node.id] = { val: 90 + Math.random() * 8, history: Array(20).fill(50) };

setInterval(() => {
  state.val = Math.max(10, Math.min(100, state.val + (Math.random() - 0.45) * 4));
}, 1000);
```

Replace `Math.random()` with a **seeded pseudo-random function** (mulberry32). Same seed = same output = deterministic. The seed is derived from the node ID, so each node has its own stable, reproducible trajectory. This is mathematically on-brand.

**Add this function** at the top of the `<script>` block in each engine file:
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

**Then replace every `Math.random()` call** in the init and interval loop with `nodeRng(node.id)()`:

```javascript
// Init — replace Math.random() with seeded rng per node
nodesState[node.id] = { val: 90 + nodeRng(node.id)() * 8, history: Array(20).fill(50), rng: nodeRng(node.id) };

// Interval — replace Math.random() with stored rng
setInterval(() => {
  const rng = state.rng;
  state.val = Math.max(10, Math.min(100, state.val + (rng() - 0.45) * 4));
}, 1000);
```

**Result:** Every node's telemetry is now a deterministic mathematical sequence seeded by its own ID. Reload the page and the values start at the same point. That's the thesis made real.

---

## Fix 2 — Deep Linking: Hash-Based Engine Routing

**File:** `index.html`

Currently `openApp(url, title)` just sets the iframe src with no URL record. If someone shares a link to HydroCore, they get the homepage. Add hash routing so engines are directly linkable.

**Find the existing `openApp` and `closeApp` functions:**
```javascript
function openApp(url, title) { 
  document.getElementById('app-iframe').src = url; 
  document.getElementById('app-overlay').classList.add('active'); 
  ...
}
function closeApp() { 
  document.getElementById('app-overlay').classList.remove('active'); 
  setTimeout(() => { document.getElementById('app-iframe').src = 'about:blank'; }, 500); 
  ...
}
```

**Replace with:**
```javascript
const ENGINE_MAP = {
  'hydrocore':      { url: '/dist/hydrocore/index.html',          title: 'HYDROCORE' },
  'biocore':        { url: '/dist/biocore/engine.html',           title: 'BIOCORE' },
  'governancecore': { url: '/dist/governancecore/engine.html',    title: 'GOVERNANCECORE' },
  'neurocore':      { url: '/dist/neurocore/engine.html',         title: 'NEUROCORE' },
  'sociocore':      { url: '/dist/sociocore/engine.html',         title: 'SOCIOCORE' },
  'meridian':       { url: '/dist/meridian/index.html',           title: 'MERIDIAN' },
  'verdara':        { url: '/dist/verdara/verdara.js',            title: 'VERDARA' },
};

function openApp(url, title) {
  document.getElementById('app-iframe').src = url;
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('app-overlay').classList.add('active');
  document.body.classList.add('app-open');
  // Write hash so this URL is shareable
  const key = Object.keys(ENGINE_MAP).find(k => ENGINE_MAP[k].title === title) || '';
  if (key) window.location.hash = key;
}

function closeApp() {
  document.getElementById('app-overlay').classList.remove('active');
  document.body.classList.remove('app-open');
  setTimeout(() => { document.getElementById('app-iframe').src = 'about:blank'; }, 500);
  history.pushState('', document.title, window.location.pathname); // clear hash
}

// On load — check hash and auto-launch
window.addEventListener('load', () => {
  const hash = window.location.hash.slice(1);
  if (hash && ENGINE_MAP[hash]) {
    const e = ENGINE_MAP[hash];
    openApp(e.url, e.title);
  }
});
```

**Result:** `invariant.foundation/#hydrocore` opens HydroCore directly. Shareable, bookmarkable, press-ready.

---

## Fix 3 — Portable Deploy Script

**File:** `deploy_ecosystem.cjs`

Currently hardcoded to Jason's Windows machine:
```javascript
copyDir('D:\\lume-v-site\\dist', path.join(INVARIANT_DIST, 'lume-v'));
copyDir('D:\\meridian-ui\\dist', path.join(INVARIANT_DIST, 'meridian'));
copyDir('D:\\hydrocore', path.join(INVARIANT_DIST, 'hydrocore'));
```

Replace all hardcoded `D:\\` paths with environment variables with sensible defaults:

```javascript
const LUME_V_SRC     = process.env.LUME_V_SRC     || path.join(__dirname, '..', 'lume-v-site', 'dist');
const MERIDIAN_SRC   = process.env.MERIDIAN_SRC   || path.join(__dirname, '..', 'meridian-ui', 'dist');
const HYDROCORE_SRC  = process.env.HYDROCORE_SRC  || path.join(__dirname, '..', 'hydrocore');
const VERDARA_SRC    = process.env.VERDARA_SRC    || path.join(__dirname, '..', 'verdara');
const CORTEX_SRC     = process.env.CORTEX_SRC     || path.join(__dirname, '..', 'LumeCortex', 'dist');
```

Then replace every hardcoded path reference with the variable. Also do the same in `scrape.cjs` and `scrape_repos.cjs` — remove any hardcoded `D:\\invariant` or similar paths.

**Add a `.env.example` file** to the repo root:
```
# Copy to .env and set paths for your local machine
LUME_V_SRC=../lume-v-site/dist
MERIDIAN_SRC=../meridian-ui/dist
HYDROCORE_SRC=../hydrocore
VERDARA_SRC=../verdara
CORTEX_SRC=../LumeCortex/dist
```

**Result:** Any machine or CI pipeline can run the deploy script. Right now only Jason's Windows box can.

---

## Fix 4 — Cross-Core Signal Bus (Stub Implementation)

**File:** `index.html` (in the main script block)

This is the feature that earns the name "Deterministic Nexus." Engines don't need to be fully wired yet — but the signal bus needs to exist so engines can publish and subscribe to cross-core events.

**Add this to the main `<script>` block in `index.html`:**

```javascript
// ── Invariant Cross-Core Signal Bus ──
const InvariantBus = {
  _listeners: {},
  _state: {},

  publish(core, nodeId, value) {
    this._state[core + ':' + nodeId] = value;
    const key = core + ':' + nodeId;
    (this._listeners[key] || []).forEach(fn => fn(value, core, nodeId));
    // Also fire wildcard listeners
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
  },

  getState(core, nodeId) {
    return this._state[core + ':' + nodeId] ?? null;
  }
};

window.InvariantBus = InvariantBus;
```

**Wire each engine to publish to the bus via postMessage.** In each `engine.html`, at the end of the `setInterval` update loop, add:

```javascript
// Publish to Invariant cross-core bus
if (window.parent && window.parent.InvariantBus) {
  window.parent.InvariantBus.publish('biocore', node.id, state.val);
}
```

(Replace `'biocore'` with the appropriate core name for each engine file.)

**Add a Cross-Core Status indicator to the Invariant landing page** — a small fixed bar at the bottom showing the current health of each core as a single color indicator (green/amber/red based on the average of that core's nodes). This is what makes the homepage feel like a live nexus, not a static portfolio:

```javascript
// ── Cross-Core Status Bar ──
function buildStatusBar() {
  const bar = document.createElement('div');
  bar.id = 'nexus-status';
  bar.style.cssText = 'position:fixed;bottom:0;left:0;width:100%;height:32px;background:rgba(5,5,5,0.95);border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;gap:32px;z-index:10000;font-family:"Inter",sans-serif;font-size:11px;letter-spacing:0.08em;';

  const cores = ['BIOCORE', 'GOVERNANCECORE', 'NEUROCORE', 'SOCIOCORE', 'HYDROCORE'];
  const indicators = {};

  cores.forEach(core => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:6px;color:rgba(255,255,255,0.3);cursor:pointer;';
    const dot = document.createElement('div');
    dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#333;transition:background 0.5s;';
    const label = document.createElement('span');
    label.textContent = core;
    item.appendChild(dot);
    item.appendChild(label);
    item.addEventListener('click', () => {
      const e = ENGINE_MAP[core.toLowerCase()];
      if (e) openApp(e.url, e.title);
    });
    bar.appendChild(item);
    indicators[core] = dot;
  });

  document.body.appendChild(bar);

  // Update dots when bus receives signals
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

**Result:** The homepage has a live status bar showing the health of each core. Click any indicator to launch that engine. The nexus is now actually a nexus.

---

## Fix 5 — HydroCore: Surface the Patent

**File:** `dist/hydrocore/index.html`

The patent number `64/032,339` is buried in a `<meta>` description tag. It needs to be visible on the page. Add a patent badge to the hero section header:

Find the hero/status bar area and add:
```html
<div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:rgba(255,255,255,0.35);letter-spacing:0.1em;padding:4px 10px;border:1px solid rgba(255,255,255,0.1);border-radius:2px;">
  U.S. PATENT 64/032,339 PENDING
</div>
```

Place it in the `hc-s-right` nav links area so it's always visible in the cockpit status bar. It should be the rightmost element, styled distinctly from the nav links — monospace, dimmer, with a border.

---

## Verification Checklist

Before pushing, confirm each of these manually:

- [ ] Reload BioCore — the starting values are the same on every refresh (deterministic seed working)
- [ ] Open Invariant homepage, append `#hydrocore` to the URL — HydroCore auto-launches
- [ ] Close an engine — the URL hash is cleared, no hash remains
- [ ] Share URL `invariant.foundation/#biocore` — opens directly to BioCore
- [ ] Bottom status bar appears on the homepage with 5 core indicators
- [ ] Clicking a status indicator launches that engine
- [ ] When an engine is running in the iframe, its dots eventually turn green in the status bar
- [ ] `deploy_ecosystem.cjs` has no hardcoded `D:\\` paths
- [ ] `.env.example` exists in repo root
- [ ] HydroCore status bar shows the patent badge

---

## After All Fixes

```bash
git add -A
git commit -m "feat: deterministic seeded telemetry, deep linking, cross-core bus, portable deploy, patent badge"
git push origin main
```

Do not mark complete until the push is confirmed and the verification checklist is done.
