/* Accessibility helper for the cockpit: ESC closes the topmost open dialog and
   Tab is kept inside dialogs marked aria-modal. Plain JS because the Observatory
   site has no Lume build step (same exemption as pricing.js). */
(function () {
  'use strict';

  // [overlay element id, close button id] — topmost (last in list) wins.
  var DIALOGS = [
    ['legend-info-overlay', 'legend-info-close'],
    ['ledger-info-overlay', 'ledger-info-close'],
    ['corr-detail-overlay', 'corr-detail-close'],
    ['modal-overlay', 'modal-close'],
    ['manage-sub-modal', null],
    ['email-alerts-modal', 'ea-close'],
    ['download-modal', null],
    ['weather-advisory-modal', 'advisory-close'],
    ['weather-filter-modal', 'filter-modal-close'],
    ['local-station-modal', 'station-modal-close'],
    ['timezone-picker-modal', 'tz-modal-close'],
  ];

  function isOpen(el) {
    if (!el) return false;
    var cs = window.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    // Overlays that stay in the DOM and toggle an "--open"/"--visible"/"--active" modifier class.
    var hasState = false, cls = el.className || '';
    if (typeof cls === 'string' && /overlay/.test(cls)) {
      hasState = /--(open|visible|active)\b/.test(cls);
      return hasState;
    }
    return true; // inline display:flex dialogs
  }

  function topmostOpen() {
    for (var i = DIALOGS.length - 1; i >= 0; i--) {
      var el = document.getElementById(DIALOGS[i][0]);
      if (isOpen(el)) return { el: el, closeId: DIALOGS[i][1] };
    }
    return null;
  }

  function closeDialog(d) {
    var btn = d.closeId ? document.getElementById(d.closeId) : null;
    if (!btn) btn = d.el.querySelector('[id$="close"], [id$="dismiss"], .modal__close, .weather-modal__close');
    if (btn) btn.click(); else d.el.style.display = 'none';
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var d = topmostOpen();
      if (d) { closeDialog(d); e.preventDefault(); }
      return;
    }
    if (e.key !== 'Tab') return;
    var modal = document.querySelector('[aria-modal="true"]');
    var open = null;
    var all = document.querySelectorAll('[aria-modal="true"]');
    for (var i = 0; i < all.length; i++) { if (window.getComputedStyle(all[i]).display !== 'none') open = all[i]; }
    if (!open) return;
    var f = open.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
    var focusable = [];
    for (var j = 0; j < f.length; j++) { if (f[j].offsetParent !== null) focusable.push(f[j]); }
    if (!focusable.length) return;
    var first = focusable[0], last = focusable[focusable.length - 1];
    if (!open.contains(document.activeElement)) { first.focus(); e.preventDefault(); return; }
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });

  // Move focus into a dialog when it opens so keyboard / screen-reader users land inside it.
  var obs = new MutationObserver(function (muts) {
    muts.forEach(function (m) {
      var t = m.target;
      if (t.getAttribute && t.getAttribute('aria-modal') === 'true' && window.getComputedStyle(t).display !== 'none') {
        var btn = t.querySelector('button, [href], input');
        if (btn && !t.contains(document.activeElement)) btn.focus();
      }
    });
  });
  document.querySelectorAll('[aria-modal="true"]').forEach(function (el) {
    obs.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
  });
})();
