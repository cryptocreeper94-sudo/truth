/**
 * ═══════════════════════════════════════════════════════════════
 *  TRUTH OBSERVATORY — "Right now" renderer (browser glue)
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  Draws tiles produced by lib/now-snapshot.lume (/api/now,
 *  /api/now/near). No wording is invented here: headlines and
 *  details come from the deterministic server module.
 *
 *  42-Doctrine map:
 *    D9  Reference      — renders only server-issued observations
 *    D21 Coherence      — one renderer shared by /today and /
 *    D36 Safety         — all text inserted via textContent (no HTML injection)
 *
 *  Browser DOM glue is plain JS: Lume 1.1 has no async, lambdas,
 *  or event handlers, so it cannot drive the DOM directly.
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  const ZIP_KEY = 'obs-zip';
  const TONE_LABEL = { calm: 'Normal', watch: 'Worth watching', alert: 'Unusual' };

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function timeAgo(iso) {
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return '';
    const mins = Math.round((Date.now() - t) / 60000);
    if (mins < 2) return 'just now';
    if (mins < 60) return mins + ' min ago';
    const hrs = Math.round(mins / 60);
    if (hrs < 36) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
    const days = Math.round(hrs / 24);
    return days + (days === 1 ? ' day ago' : ' days ago');
  }

  async function getJson(url) {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    let body = null;
    try { body = await res.json(); } catch (e) { body = null; }
    if (!res.ok) {
      const msg = body && body.error ? body.error : 'Request failed (' + res.status + ')';
      throw new Error(msg);
    }
    return body;
  }

  function fetchNow() { return getJson('/api/now'); }

  function fetchNear(q) {
    if (q && q.zip) return getJson('/api/now/near?zip=' + encodeURIComponent(q.zip));
    return getJson('/api/now/near?lat=' + encodeURIComponent(q.lat) + '&lon=' + encodeURIComponent(q.lon));
  }

  function level() {
    return (typeof Levels !== 'undefined' && Levels.get()) || 'observer';
  }

  /** Build one tile card. Researcher level also sees the exact timestamp. */
  function tileCard(t, idPrefix) {
    const card = el('article', 'now-tile now-tile--' + (t.tone || 'calm'));
    card.id = idPrefix + '-' + t.id;
    const top = el('div', 'now-tile__top');
    top.appendChild(el('span', 'now-tile__title', t.title));
    top.appendChild(el('span', 'now-tile__tone', TONE_LABEL[t.tone] || ''));
    card.appendChild(top);
    card.appendChild(el('h3', 'now-tile__headline', t.headline));
    card.appendChild(el('p', 'now-tile__detail', t.detail));
    if (t.asOf) {
      const lv = level();
      const when = lv === 'researcher' ? 'As of ' + t.asOf : 'Updated ' + timeAgo(t.asOf);
      card.appendChild(el('p', 'now-tile__asof', when));
    }
    return card;
  }

  function renderTiles(track, tiles, idPrefix) {
    track.textContent = '';
    (tiles || []).forEach(function (t) { track.appendChild(tileCard(t, idPrefix)); });
  }

  /**
   * Wire a carousel: .carousel-wrapper > .now-track + .carousel-nav
   * (prev/next arrows scroll one card; dots track scroll position).
   * Safe to call again after the track is re-rendered.
   */
  function wireCarousel(wrapper) {
    const track = wrapper.querySelector('.now-track');
    const prev = wrapper.querySelector('.carousel-arrow--prev');
    const next = wrapper.querySelector('.carousel-arrow--next');
    const dots = wrapper.querySelector('.carousel-dots');
    if (!track) return;

    function step() {
      const c = track.firstElementChild;
      if (!c) return track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
      return c.getBoundingClientRect().width + gap;
    }
    function pages() { return Math.max(1, Math.ceil((track.scrollWidth - track.clientWidth) / step()) + 1); }
    function current() { return Math.round(track.scrollLeft / step()); }

    function paintDots() {
      if (!dots) return;
      const n = pages();
      if (dots.children.length !== n) {
        dots.textContent = '';
        for (let i = 0; i < n; i++) {
          const d = el('button', 'carousel-dot');
          d.type = 'button';
          d.setAttribute('aria-label', 'Go to card ' + (i + 1));
          d.addEventListener('click', function () { track.scrollTo({ left: i * step(), behavior: 'smooth' }); });
          dots.appendChild(d);
        }
      }
      const cur = Math.min(current(), n - 1);
      Array.prototype.forEach.call(dots.children, function (d, i) {
        d.classList.toggle('carousel-dot--active', i === cur);
      });
    }

    if (!wrapper.dataset.wired) {
      wrapper.dataset.wired = '1';
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
      let raf = 0;
      track.addEventListener('scroll', function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(paintDots);
      }, { passive: true });
      window.addEventListener('resize', paintDots);
    }
    paintDots();
  }

  function savedZip() {
    try { return localStorage.getItem(ZIP_KEY) || ''; } catch (e) { return ''; }
  }
  function saveZip(z) {
    try { localStorage.setItem(ZIP_KEY, z); } catch (e) { /* private mode */ }
  }

  window.ObsNow = {
    fetchNow: fetchNow,
    fetchNear: fetchNear,
    getJson: getJson,
    renderTiles: renderTiles,
    wireCarousel: wireCarousel,
    timeAgo: timeAgo,
    savedZip: savedZip,
    saveZip: saveZip,
    level: level,
    el: el,
  };
})();
