/**
 * ═══════════════════════════════════════════════════════════════
 *  TRUTH OBSERVATORY — /today page (free preview)
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  Browser glue for the public preview. Data and wording come from
 *  /api/now, /api/now/near (lib/now-snapshot.lume), /api/brief,
 *  /api/signals/kp and /api/signals/events/quake.
 *
 *  42-Doctrine map:
 *    D4  Identity      — one level setting (levels.js) drives all copy
 *    D9  Reference     — every number shown is a server observation
 *    D14 Determinacy   — fixed copy tables per level, no generated text
 *    D36 Safety        — textContent only; location rounded to ~1 km
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  const N = window.ObsNow;
  const $ = function (id) { return document.getElementById(id); };
  const DAY = 86400000;

  // window.__subscribe is provided by pricing.js (founders counter + checkout link from /api/pricing).

  // ── Copy per level (fixed, deterministic) ───────────────────
  const COPY = {
    observer: {
      sub: 'A calm, plain-English look at the planet right now. No hype. Just what the instruments say.',
      whyNow: 'Four things that can affect power, GPS, radio, flights and the sky above you.',
      whyKp: 'The Kp index measures how shaken-up Earth\'s magnetic field is, from 0 (calm) to 9 (extreme storm). Most days sit between 0 and 3. Higher numbers mean better aurora chances and, at the top end, possible effects on power grids and GPS.',
      whyQuakes: 'The strongest earthquakes recorded anywhere on Earth in the last 7 days. Magnitude 4.5 and up. Each step up in magnitude is roughly 32 times more energy.',
    },
    analyst: {
      sub: 'Current space-weather and geophysical conditions, with local context and a 7-day view.',
      whyNow: 'Geomagnetic activity, solar X-ray flux, global seismicity and US wildfire/volcano status.',
      whyKp: 'Planetary Kp, 3-hour maximum per bar. Kp 5 corresponds to a G1 (minor) geomagnetic storm on the NOAA scale; Kp 9 is G5 (extreme).',
      whyQuakes: 'Top USGS events by magnitude, M4.5+, last 7 days. Depth matters: shallow events (under 70 km) are usually felt more strongly at the surface.',
    },
    researcher: {
      sub: 'Live snapshot from the archive. Exact timestamps shown. Raw series available via /api/signals.',
      whyNow: 'Derived from the newest raw captures: SWPC Kp + solar wind, GOES XRS, USGS FDSN, NIFC/USGS HANS.',
      whyKp: 'Kp (GFZ definitive history + SWPC nowcast), 3h resolution, max per interval. Source: /api/signals/kp.',
      whyQuakes: 'USGS FDSN, minmagnitude=4.5, 7-day window, sorted by magnitude. Source: /api/signals/events/quake.',
    },
  };

  function copy() { return COPY[N.level()] || COPY.observer; }

  // ── Back button: return to previous page on this site, else home
  $('today-back').addEventListener('click', function () {
    const sameSite = document.referrer && document.referrer.indexOf(location.origin) === 0;
    if (sameSite && history.length > 1) history.back();
    else location.href = '/';
  });

  $('today-date').textContent = new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  // ── Level switch ────────────────────────────────────────────
  function paintLevel() {
    const lv = N.level();
    document.querySelectorAll('#level-switch button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.level === lv));
    });
    const c = copy();
    $('today-sub').textContent = c.sub;
    $('why-now').textContent = c.whyNow;
    $('why-kp').textContent = c.whyKp;
    $('why-quakes').textContent = c.whyQuakes;
  }
  document.querySelectorAll('#level-switch button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (typeof Levels !== 'undefined') Levels.set(b.dataset.level);
      paintLevel();
      paintBrief();
      if (state.now) drawNow();
      if (state.near) drawNear();
      if (state.quakes) drawQuakes();
    });
  });
  if (typeof Levels !== 'undefined') Levels.apply();

  const state = { now: null, near: null, brief: null, kp: null, quakes: null };

  // ── Brief ───────────────────────────────────────────────────
  function paintBrief() {
    const b = state.brief;
    const box = $('today-brief');
    if (!b || !b.briefs || !(b.activeFeeds > 0)) { box.hidden = true; return; }
    const entry = b.briefs[N.level()] || b.briefs.observer;
    if (!entry || !entry.text) { box.hidden = true; return; }
    $('today-brief-text').textContent = entry.text;
    box.hidden = false;
  }
  N.getJson('/api/brief').then(function (b) { state.brief = b; paintBrief(); }).catch(function () {});

  // ── Right now ───────────────────────────────────────────────
  function drawNow() {
    N.renderTiles($('now-track'), state.now.tiles, 'now');
    N.wireCarousel($('now-carousel'));
  }
  N.fetchNow().then(function (d) { state.now = d; drawNow(); }).catch(function (e) {
    const t = $('now-track');
    t.textContent = '';
    t.appendChild(N.el('p', 'now-error', 'Live readings are unavailable right now (' + e.message + '). Please try again in a few minutes.'));
  });

  // ── Near you ────────────────────────────────────────────────
  const msg = $('zip-msg');
  function setMsg(text, isErr) {
    msg.textContent = text || '';
    msg.classList.toggle('zip-form__msg--err', !!isErr);
  }
  function drawNear() {
    $('near-place').textContent = state.near.place ? state.near.place.label : '';
    $('near-carousel').hidden = false;
    N.renderTiles($('near-track'), state.near.tiles, 'near');
    N.wireCarousel($('near-carousel'));
  }
  function loadNear(q) {
    setMsg('Looking up your area…');
    return N.fetchNear(q).then(function (d) {
      state.near = d;
      setMsg('');
      drawNear();
      if (q.zip) N.saveZip(q.zip);
    }).catch(function (e) { setMsg(e.message, true); });
  }
  $('zip-form').addEventListener('submit', function (ev) {
    ev.preventDefault();
    const z = $('zip-input').value.trim();
    if (!/^\d{5}$/.test(z)) { setMsg('Enter a 5-digit US ZIP code.', true); return; }
    loadNear({ zip: z });
  });
  $('geo-go').addEventListener('click', function () {
    if (!navigator.geolocation) { setMsg('Your browser does not share location. Enter a ZIP instead.', true); return; }
    setMsg('Asking your browser for your location…');
    navigator.geolocation.getCurrentPosition(function (pos) {
      // Round to 2 decimals (~1 km): enough for "nearest station", not a street address.
      const lat = Math.round(pos.coords.latitude * 100) / 100;
      const lon = Math.round(pos.coords.longitude * 100) / 100;
      loadNear({ lat: lat, lon: lon });
    }, function () {
      setMsg('Location was not shared. Enter a ZIP instead.', true);
    }, { timeout: 10000, maximumAge: 600000 });
  });
  (function initZip() {
    const qz = new URLSearchParams(location.search).get('zip');
    const z = (qz && /^\d{5}$/.test(qz)) ? qz : N.savedZip();
    if (z) { $('zip-input').value = z; loadNear({ zip: z }); }
  })();

  // ── Kp chart (canvas) ───────────────────────────────────────
  function kpColor(v) {
    if (v >= 7) return '#ef4444';
    if (v >= 5) return '#c084fc';
    if (v >= 4) return '#4ecbff';
    return '#22c55e';
  }
  function keyToDate(k) { return new Date(k.length === 13 ? k + ':00:00Z' : k); }

  let bars = [];
  function drawKp() {
    const rows = (state.kp && state.kp.rows) || [];
    const cv = $('kp-canvas');
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth, h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    const padL = 26, padR = 6, padT = 8, padB = 22;
    const cw = w - padL - padR, ch = h - padT - padB;
    const y = function (v) { return padT + ch - (v / 9) * ch; };

    g.font = '10px "JetBrains Mono", monospace';
    g.textBaseline = 'middle';
    [0, 3, 5, 7, 9].forEach(function (v) {
      g.strokeStyle = v === 5 ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.07)';
      g.setLineDash(v === 5 ? [4, 4] : []);
      g.beginPath(); g.moveTo(padL, y(v)); g.lineTo(w - padR, y(v)); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.4)';
      g.fillText(String(v), 6, y(v));
    });
    g.setLineDash([]);

    if (!rows.length) {
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.textAlign = 'center';
      g.fillText('No Kp data available for this week.', padL + cw / 2, padT + ch / 2);
      g.textAlign = 'left';
      bars = [];
      return;
    }

    const t1 = Date.now(), t0 = t1 - 7 * DAY;
    const slot = cw / 56; // 56 three-hour slots in 7 days
    const bw = Math.max(2, slot - 2);
    bars = [];
    rows.forEach(function (r) {
      const t = keyToDate(r[0]).getTime();
      if (!(t >= t0 - 3 * 3600000)) return;
      const v = Number(r[3]);
      const x = padL + ((t - t0) / (7 * DAY)) * cw;
      const top = y(Math.max(v, 0.15));
      g.fillStyle = kpColor(v);
      g.globalAlpha = 0.9;
      g.fillRect(x, top, bw, padT + ch - top);
      bars.push({ x: x, w: bw, v: v, t: t });
    });
    g.globalAlpha = 1;

    // Day labels
    g.fillStyle = 'rgba(255,255,255,0.45)';
    g.textAlign = 'center';
    for (let i = 0; i < 7; i++) {
      const d = new Date(t0 + (i + 0.5) * DAY);
      g.fillText(d.toLocaleDateString(undefined, { weekday: 'short' }), padL + (i + 0.5) * (cw / 7), h - 9);
    }
    g.textAlign = 'left';
  }
  $('kp-canvas').addEventListener('mousemove', function (ev) {
    const r = ev.currentTarget.getBoundingClientRect();
    const mx = ev.clientX - r.left;
    const hit = bars.find(function (b) { return mx >= b.x - 1 && mx <= b.x + b.w + 1; });
    const tip = $('kp-tip');
    if (!hit) { tip.style.opacity = 0; return; }
    const when = new Date(hit.t).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    tip.textContent = 'Kp ' + hit.v.toFixed(1) + ' · ' + when;
    tip.style.left = (hit.x + 16 + hit.w / 2) + 'px';
    tip.style.top = (ev.clientY - r.top + 16) + 'px';
    tip.style.opacity = 1;
  });
  $('kp-canvas').addEventListener('mouseleave', function () { $('kp-tip').style.opacity = 0; });
  let resizeT = 0;
  window.addEventListener('resize', function () { clearTimeout(resizeT); resizeT = setTimeout(drawKp, 120); });

  const from7 = new Date(Date.now() - 7 * DAY).toISOString();
  const nowIso = new Date().toISOString();
  N.getJson('/api/signals/kp?from=' + encodeURIComponent(from7) + '&to=' + encodeURIComponent(nowIso))
    .then(function (d) { state.kp = d; drawKp(); })
    .catch(function () { state.kp = { rows: [] }; drawKp(); });

  // ── Quakes carousel ─────────────────────────────────────────
  function drawQuakes() {
    const track = $('quake-track');
    track.textContent = '';
    const lv = N.level();
    const list = state.quakes;
    if (!list.length) {
      track.appendChild(N.el('p', 'now-error', 'No magnitude 4.5+ earthquakes recorded in the last 7 days.'));
      N.wireCarousel($('quake-carousel'));
      return;
    }
    list.forEach(function (q, i) {
      const card = N.el('article', 'quake-card');
      card.id = 'quake-' + i;
      const mag = N.el('div', 'quake-card__mag', Number(q.mag).toFixed(1));
      mag.appendChild(N.el('small', null, lv === 'observer' ? 'MAGNITUDE' : String(q.magType || 'M').toUpperCase()));
      card.appendChild(mag);
      card.appendChild(N.el('p', 'quake-card__place', q.place || 'Unknown location'));
      const depth = Math.round(Number(q.depth) || 0);
      const depthWord = lv === 'observer' ? (depth < 70 ? 'shallow (' + depth + ' km deep)' : 'deep (' + depth + ' km down)') : depth + ' km depth';
      const when = new Date(q.t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      card.appendChild(N.el('p', 'quake-card__meta', N.timeAgo(q.t) + ' · ' + when + ' · ' + depthWord));
      if (lv === 'researcher') {
        card.appendChild(N.el('p', 'quake-card__raw', q.id + ' · ' + q.t + ' · ' + Number(q.lat).toFixed(3) + ', ' + Number(q.lon).toFixed(3)));
      }
      track.appendChild(card);
    });
    N.wireCarousel($('quake-carousel'));
  }
  N.getJson('/api/signals/events/quake?minmag=4.5&from=' + encodeURIComponent(from7) + '&to=' + encodeURIComponent(nowIso))
    .then(function (d) {
      const ev = (d && d.events) || [];
      state.quakes = ev.slice().sort(function (a, b) { return b.mag - a.mag; }).slice(0, 12);
      drawQuakes();
    })
    .catch(function () { state.quakes = []; drawQuakes(); });

  // Perks carousel is static markup.
  N.wireCarousel($('perk-carousel'));
  paintLevel();

  // Subscribers: replace upsell buttons with the cockpit.
  N.getJson('/api/account').then(function (a) {
    if (!a || !a.subscribed) return;
    ['nav-subscribe', 'deeper-subscribe'].forEach(function (id) {
      const b = $(id);
      if (!b) return;
      b.textContent = 'Open cockpit';
      b.onclick = function () { location.href = '/cockpit'; };
    });
    const h = $('h-deeper');
    if (h) h.textContent = 'You have full access';
  }).catch(function () { /* anonymous visitor */ });

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
})();
