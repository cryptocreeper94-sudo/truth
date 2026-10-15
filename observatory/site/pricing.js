/**
 * ═══════════════════════════════════════════════════════════════
 *  Truth Observatory — Pricing (founders counter + checkout link)
 *  Single source of truth for every Subscribe button on the site.
 *  The numbers and the checkout link come from /api/pricing, which
 *  counts real founders in the database. Nothing here is hardcoded
 *  except a last-resort fallback if the API cannot be reached.
 * ═══════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  var FALLBACK_URL = 'https://buy.stripe.com/bJe8wR4Zq2vM83Z3vTfEk00';
  var FALLBACK_PRICE = 4.99;
  var state = null;

  function money(n) { return '$' + Number(n).toFixed(2); }
  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function currentPrice() { return state ? state.current.price : FALLBACK_PRICE; }
  function currentUrl() { return state ? state.current.checkout_url : FALLBACK_URL; }

  // Subscribe buttons everywhere call this.
  window.__subscribe = function () {
    var url = currentUrl();
    if (url) window.location.href = url;
  };

  function foundersLine() {
    if (!state) return '';
    var f = state.founders;
    if (state.sold_out) {
      return 'The founders round is full. Standard price is ' + money(state.standard.price) + '/month.' +
        (state.current.checkout_url ? '' : ' Standard checkout opens soon.');
    }
    if (f.spots_left == null) return '';
    return 'Founders price, kept for as long as you stay subscribed. ' +
      f.spots_left + ' of ' + f.cap + ' spots left.';
  }

  function injectStyle() {
    if (document.getElementById('obs-pricing-style')) return;
    var s = document.createElement('style');
    s.id = 'obs-pricing-style';
    s.textContent = '.pricing-founders{margin:.35rem 0 .9rem;font-size:.78rem;line-height:1.45;color:#d4a054;font-family:var(--font-mono,monospace);letter-spacing:.02em;}';
    document.head.appendChild(s);
  }

  function setBuyButtons() {
    var noUrl = !currentUrl();
    var price = currentPrice();
    var hero = document.getElementById('subscribe-cta');
    if (hero) {
      hero.textContent = noUrl ? 'FOUNDERS ROUND FULL' : '\uD83D\uDD12 SUBSCRIBE \u2014 ' + money(price) + '/MO';
      hero.disabled = noUrl;
    }
    ['plan-pro-cta', 'nav-subscribe', 'deeper-subscribe'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = noUrl ? 'Founders round full' : 'Subscribe';
      el.disabled = noUrl;
    });
  }

  function setPriceText() {
    var p = money(currentPrice());
    $all('#plan-pro .plan-card__price strong, .deeper__price strong').forEach(function (el) { el.textContent = p; });
    $all('[data-sub-price]').forEach(function (el) { el.textContent = p + '/mo'; });
  }

  function setFoundersLines() {
    var text = foundersLine();
    $all('#plan-pro .plan-card__price, .deeper__price').forEach(function (anchor) {
      var next = anchor.nextElementSibling;
      var line = next && next.classList.contains('pricing-founders') ? next : null;
      if (!text) { if (line) line.remove(); return; }
      if (!line) {
        line = document.createElement('p');
        line.className = 'pricing-founders';
        anchor.parentNode.insertBefore(line, anchor.nextSibling);
      }
      line.textContent = text;
    });
  }

  function apply() {
    injectStyle();
    setPriceText();
    setBuyButtons();
    setFoundersLines();
  }

  window.ObsPricing = {
    get: function () { return state; },
    priceText: function () { return money(currentPrice()) + '/mo'; },
    refresh: load,
  };

  function load() {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 4000) : null;
    return fetch('/api/pricing', { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.current && data.founders) { state = data; apply(); }
      })
      .catch(function () { /* keep the static defaults */ })
      .then(function () { if (timer) clearTimeout(timer); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
