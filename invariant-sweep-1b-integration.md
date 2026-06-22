# Invariant — Sweep 1b: Real Site Integration
**Repo:** `cryptocreeper94-sudo/invariant`  
**Supersedes:** Fix 2 (deep linking) from `invariant-sweep-1.md` — replace the ENGINE_MAP URLs entirely  
**Date:** June 22, 2026  
**For:** Gemini Implementation Agent

---

## Context

Two external production sites exist and must be treated as the canonical sources:

- **HydroCore** → `https://hydrocore.dev` — full cinematic landing page, patent badge, 3D engine, cockpit UI. The local `dist/hydrocore/` copy inside Invariant is stale and should no longer be used.
- **Meridian** → `https://meridiancanon.com` — live site, "Wireless Energy Architecture," atmospheric intro with glowing logo. **Not** `meridiancore.com` — that domain is squatted by an unrelated 2005 MMORPG.

The Invariant iframe shell is already designed to load external URLs. Update it to point to the real sites.

---

## Fix A — Update ENGINE_MAP to Real External URLs

**File:** `index.html`

Find the `ENGINE_MAP` object (added in sweep 1) and update the `hydrocore` and `meridian` entries:

```javascript
const ENGINE_MAP = {
  'hydrocore':      { url: 'https://hydrocore.dev',               title: 'HYDROCORE' },
  'meridian':       { url: 'https://meridiancanon.com',           title: 'MERIDIAN' },
  'biocore':        { url: '/dist/biocore/engine.html',           title: 'BIOCORE' },
  'governancecore': { url: '/dist/governancecore/engine.html',    title: 'GOVERNANCECORE' },
  'neurocore':      { url: '/dist/neurocore/engine.html',         title: 'NEUROCORE' },
  'sociocore':      { url: '/dist/sociocore/engine.html',         title: 'SOCIOCORE' },
  'verdara':        { url: '/dist/verdara/verdara.js',            title: 'VERDARA' },
};
```

---

## Fix B — Update Carousel Cards to Use Real URLs + Correct Descriptions

**File:** `src/lume/main.lume` (or wherever the carousel cards are defined in Lume source)

Find the carousel card definitions and update HydroCore and Meridian:

```javascript
// HydroCore card — update url and description
{ 
  id: 'hydrocore',
  name: 'HydroCore',
  desc: 'Deterministic Hydraulic Governance Engine',
  sub: 'The world\'s first deterministic closed-loop hydrogen engine. 42 nodes. Patent 64/032,339 pending.',
  url: 'https://hydrocore.dev',
  img: '/assets/hydrocore_card.png'
}

// Meridian card — update url and description  
{
  id: 'meridian',
  name: 'Meridian',
  desc: 'Wireless Energy Architecture',
  sub: 'Deterministic wireless energy routing and governance.',
  url: 'https://meridiancanon.com',
  img: '/assets/meridian_card.png'
}
```

---

## Fix C — Handle iframe Embedding (Critical)

External sites may block iframe embedding via `X-Frame-Options` or `Content-Security-Policy: frame-ancestors` headers. If either `hydrocore.dev` or `meridiancanon.com` has these headers set, the iframe will show a blank screen instead of the site.

**Update `openApp()` to handle this gracefully:**

```javascript
function openApp(url, title) {
  const isExternal = url.startsWith('http');
  const iframe = document.getElementById('app-iframe');
  
  iframe.src = url;
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('app-overlay').classList.add('active');
  document.body.classList.add('app-open');

  const key = Object.keys(ENGINE_MAP).find(k => ENGINE_MAP[k].title === title) || '';
  if (key) window.location.hash = key;

  // For external sites — if iframe fails to load content, offer external link fallback
  if (isExternal) {
    iframe.onload = () => {
      try {
        // If we can't access contentDocument, it's blocked — show fallback
        const doc = iframe.contentDocument;
        if (!doc || doc.URL === 'about:blank') throw new Error('blocked');
      } catch(e) {
        showExternalFallback(url, title);
      }
    };
  }
}

function showExternalFallback(url, title) {
  const iframe = document.getElementById('app-iframe');
  iframe.srcdoc = `
    <html>
      <body style="margin:0;background:#050505;display:flex;align-items:center;justify-content:center;height:100vh;font-family:'Inter',sans-serif;flex-direction:column;gap:24px;">
        <div style="color:rgba(255,255,255,0.3);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;">Opening ${title}</div>
        <a href="${url}" target="_blank" style="background:#fff;color:#000;padding:12px 28px;border-radius:2px;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">
          Launch ${title} →
        </a>
        <div style="color:rgba(255,255,255,0.15);font-size:10px;">${url}</div>
      </body>
    </html>`;
}
```

---

## Fix D — Remove Stale Local HydroCore Copy from Deploy Script

**File:** `deploy_ecosystem.cjs`

Now that HydroCore is live at `hydrocore.dev`, the deploy script no longer needs to copy the local hydrocore directory into `dist/hydrocore/`. Remove or comment out the hydrocore ingestion block:

```javascript
// REMOVED — HydroCore is now canonical at https://hydrocore.dev
// console.log("   [+] Ingesting Hydrocore...");
// hydrocoreAssets.forEach(asset => { ... });
```

Similarly, update the Meridian ingestion block to note the correct domain:

```javascript
// Meridian is canonical at https://meridiancanon.com
// Local dist/meridian/ is only used as fallback if meridiancanon.com is unreachable
console.log("   [+] Ingesting Meridian (local fallback)...");
copyDir(MERIDIAN_SRC, path.join(INVARIANT_DIST, 'meridian'));
```

---

## Fix E — Update Cross-Core Status Bar to Reflect Real Sites

**File:** `index.html` — the `buildStatusBar()` function added in sweep 1

The status bar currently lists `HYDROCORE` as a local engine. Update it so clicking `HYDROCORE` or `MERIDIAN` opens the real sites:

In the `buildStatusBar()` function, the `item.addEventListener('click')` already calls `openApp()` via `ENGINE_MAP`. Since ENGINE_MAP is now updated (Fix A), this requires no additional changes — it will automatically use `hydrocore.dev` and `meridiancanon.com`.

However, since HydroCore and Meridian are external and won't post cross-core bus messages back to Invariant, their status dots will remain dark (no signal). Fix this by giving them a **static "online" indicator** on load:

```javascript
// After buildStatusBar() creates the indicators, set external cores to static green
setTimeout(() => {
  ['HYDROCORE', 'MERIDIAN'].forEach(core => {
    if (indicators[core]) {
      indicators[core].style.background = '#22c55e';
      indicators[core].style.boxShadow = '0 0 6px #22c55e';
    }
  });
}, 1000);
```

---

## Fix F — Carousel Card: Show Real Domain as a Tag

**File:** `src/lume/main.lume`

Each carousel card should show the live domain as a subtle tag so visitors know these are real deployed products. In the card markup, add a domain tag below the description:

For HydroCore:
```html
<div class="card-domain">hydrocore.dev</div>
```

For Meridian:
```html
<div class="card-domain">meridiancanon.com</div>
```

Add this CSS alongside the card styles:
```css
.card-domain { 
  font-family: 'Space Mono', monospace; 
  font-size: 10px; 
  color: rgba(255,255,255,0.25); 
  letter-spacing: 0.1em; 
  margin-top: 8px; 
  border-top: 1px solid rgba(255,255,255,0.06); 
  padding-top: 8px; 
}
```

---

## Verification Checklist

- [ ] Carousel HydroCore card — clicking opens the iframe shell with `hydrocore.dev` loading inside
- [ ] Carousel Meridian card — clicking opens the iframe shell with `meridiancanon.com` loading inside
- [ ] If either site blocks iframe embedding — the fallback panel appears with a "Launch →" button that opens the real site in a new tab
- [ ] URL hash `#hydrocore` auto-launches HydroCore at `hydrocore.dev`
- [ ] URL hash `#meridian` auto-launches Meridian at `meridiancanon.com`
- [ ] Status bar: HYDROCORE and MERIDIAN dots are green on load
- [ ] Carousel cards show the live domain tag (`hydrocore.dev`, `meridiancanon.com`)
- [ ] `deploy_ecosystem.cjs` no longer attempts to copy hydrocore assets
- [ ] No references to `meridiancore.com` (the squatted domain) anywhere in the codebase — grep for it and remove

---

## After All Fixes

```bash
git add -A
git commit -m "feat: wire hydrocore.dev and meridiancanon.com as canonical external engines"
git push origin main
```

Do not mark complete until the push is confirmed and the checklist is done.
