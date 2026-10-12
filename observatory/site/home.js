/**
 * ═══════════════════════════════════════════════════════════════
 *  TRUTH OBSERVATORY — Homepage glue (free strip, level picker)
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  42-Doctrine map:
 *    D4  Identity    — level picker writes the single Levels setting
 *    D9  Reference   — strip shows /api/now tiles verbatim
 *    D22 Coherence   — subscribers see "Enter cockpit" instead of upsell
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  const N = window.ObsNow;
  if (!N) return;
  const $ = function (id) { return document.getElementById(id); };
  let nowData = null;

  // ── Right-now strip ─────────────────────────────────────────
  function drawNow() {
    N.renderTiles($('home-now-track'), nowData.tiles, 'home-now');
    N.wireCarousel($('home-now-carousel'));
  }
  N.fetchNow().then(function (d) { nowData = d; drawNow(); }).catch(function () {
    const t = $('home-now-track');
    t.textContent = '';
    t.appendChild(N.el('p', 'now-error', 'Live readings are refreshing. Try the full page for today.'));
  });

  // ZIP box: prefill the remembered ZIP; validate before leaving the page
  const zipIn = $('home-zip-input');
  if (zipIn) {
    zipIn.value = N.savedZip();
    $('home-zip-form').addEventListener('submit', function (ev) {
      const z = zipIn.value.trim();
      if (!/^\d{5}$/.test(z)) { ev.preventDefault(); zipIn.focus(); zipIn.setCustomValidity('Enter a 5-digit US ZIP code'); zipIn.reportValidity(); return; }
      zipIn.setCustomValidity('');
      N.saveZip(z);
    });
    zipIn.addEventListener('input', function () { zipIn.setCustomValidity(''); });
  }

  // ── Level picker ────────────────────────────────────────────
  function paintLevel() {
    const lv = (typeof Levels !== 'undefined' && Levels.get()) || '';
    document.querySelectorAll('#level-track .level-card').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.level === lv));
    });
    if (typeof Levels !== 'undefined') {
      const meta = Levels.getCurrentMeta && Levels.getCurrentMeta();
      const sub = $('hero-subtitle');
      if (meta && sub && meta.heroSubtitle) sub.textContent = meta.heroSubtitle;
    }
  }
  document.querySelectorAll('#level-track .level-card').forEach(function (b) {
    b.addEventListener('click', function () {
      if (typeof Levels === 'undefined') return;
      Levels.set(b.dataset.level);
      paintLevel();
      if (nowData) drawNow();
    });
  });
  paintLevel();
  N.wireCarousel($('level-carousel'));
  N.wireCarousel($('plan-carousel'));

  // ── Subscribers: swap the upsell for the cockpit ────────────
  N.getJson('/api/account').then(function (a) {
    if (!a || !a.subscribed) return;
    const cta = $('hero-cta');
    if (cta) { cta.href = '/cockpit'; cta.textContent = 'ENTER COCKPIT →'; }
    const sub = $('subscribe-cta');
    if (sub) sub.style.display = 'none';
    const link = $('hero-cockpit');
    if (link) { link.href = '/today'; link.innerHTML = 'See today&rsquo;s summary &rarr;'; }
    const pro = $('plan-pro-cta');
    if (pro) { pro.textContent = 'Open the cockpit'; pro.onclick = function () { location.href = '/cockpit'; }; }
  }).catch(function () { /* anonymous visitor */ });
})();
