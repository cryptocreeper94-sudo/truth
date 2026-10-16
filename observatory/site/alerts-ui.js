/* Email alerts panel for the cockpit (opt-in). Plain JS because the Observatory
   site has no Lume build step (same exemption as pricing.js and a11y.js).
   Talks to /api/alerts/prefs, /api/alerts/test. Chrome is monochrome by design. */
(function () {
  'use strict';

  var css = ''
    + '#email-alerts-modal{display:none;position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.72);align-items:center;justify-content:center;padding:12px;}'
    + '#email-alerts-modal .ea{background:#0d0d0d;border:1px solid #e8e8e8;max-width:460px;width:100%;max-height:92vh;overflow-y:auto;padding:22px;font-family:var(--font-mono,monospace);color:#e8e8e8;}'
    + '#email-alerts-modal h3{margin:0 0 6px;font-size:1rem;letter-spacing:.06em;font-weight:600;}'
    + '#email-alerts-modal .ea__sub{margin:0 0 16px;font-size:.72rem;line-height:1.55;color:#9a9a9a;}'
    + '#email-alerts-modal .ea__master{display:flex;gap:10px;align-items:center;padding:12px;border:1px solid #3a3a3a;margin-bottom:12px;font-size:.78rem;letter-spacing:.04em;}'
    + '#email-alerts-modal .ea__row{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;padding:10px 0;border-top:1px solid #242424;font-size:.76rem;}'
    + '#email-alerts-modal .ea__row label.ea__lbl{display:flex;gap:10px;align-items:center;flex:1 1 200px;cursor:pointer;}'
    + '#email-alerts-modal .ea__hint{flex-basis:100%;margin:0 0 0 26px;font-size:.66rem;color:#8a8a8a;line-height:1.5;}'
    + '#email-alerts-modal input[type=checkbox]{width:16px;height:16px;accent-color:#e8e8e8;flex:none;}'
    + '#email-alerts-modal select,#email-alerts-modal input[type=text]{background:#0d0d0d;color:#e8e8e8;border:1px solid #4a4a4a;padding:6px 8px;font-family:inherit;font-size:.74rem;border-radius:0;}'
    + '#email-alerts-modal input[type=text]{width:84px;letter-spacing:.08em;}'
    + '#email-alerts-modal :disabled{opacity:.45;}'
    + '#email-alerts-modal .ea__btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}'
    + '#email-alerts-modal button{padding:.65rem 1rem;background:transparent;border:1px solid #e8e8e8;color:#e8e8e8;font-family:inherit;font-size:.72rem;letter-spacing:.06em;cursor:pointer;border-radius:0;transition:background .12s,color .12s;}'
    + '#email-alerts-modal button:hover:not(:disabled),#email-alerts-modal button:focus-visible{background:#e8e8e8;color:#0d0d0d;outline:none;}'
    + '#email-alerts-modal button.ea__primary{background:#e8e8e8;color:#0d0d0d;font-weight:600;}'
    + '#email-alerts-modal button.ea__primary:hover:not(:disabled){background:#fff;}'
    + '#email-alerts-modal .ea__msg{min-height:1.2em;margin:12px 0 0;font-size:.72rem;line-height:1.5;color:#cfcfcf;}'
    + '#email-alerts-modal .ea__msg.is-err{color:#ff6b6b;}';

  var HTML = ''
    + '<div class="ea" role="document">'
    + '<h3 id="ea-title">EMAIL ALERTS</h3>'
    + '<p class="ea__sub" id="ea-sub">Off until you turn it on. You choose what is sent. Every email has a one-click unsubscribe link, and we send at most 12 a day.</p>'
    + '<form id="ea-form" autocomplete="off">'
    + '<div class="ea__master"><input type="checkbox" id="ea-enabled"><label for="ea-enabled">Send me email alerts</label></div>'
    + '<div class="ea__row"><label class="ea__lbl"><input type="checkbox" id="ea-weather"><span>Weather warnings at my ZIP</span></label>'
    + '<input type="text" id="ea-zip" inputmode="numeric" maxlength="5" placeholder="ZIP" aria-label="ZIP code">'
    + '<select id="ea-wmin" aria-label="Minimum severity"><option value="moderate">Moderate and up</option><option value="severe">Severe and up</option><option value="extreme">Extreme only</option></select>'
    + '<p class="ea__hint">National Weather Service warnings for your exact location. Severe and up covers tornado and severe thunderstorm warnings.</p></div>'
    + '<div class="ea__row"><label class="ea__lbl"><input type="checkbox" id="ea-brief"><span>Daily brief at 7:00 am my time</span></label>'
    + '<select id="ea-blevel" aria-label="Brief detail level"><option value="observer">Observer</option><option value="analyst">Analyst</option><option value="researcher">Researcher</option></select></div>'
    + '<div class="ea__row"><label class="ea__lbl"><input type="checkbox" id="ea-quakes"><span>Earthquakes worldwide</span></label>'
    + '<select id="ea-qmin" aria-label="Minimum magnitude"><option value="5">M5.0 and up</option><option value="5.5">M5.5 and up</option><option value="6">M6.0 and up</option><option value="6.5">M6.5 and up</option><option value="7">M7.0 and up</option></select></div>'
    + '<div class="ea__row"><label class="ea__lbl"><input type="checkbox" id="ea-space"><span>Geomagnetic storm, G3 or higher</span></label></div>'
    + '<div class="ea__row"><label class="ea__lbl"><input type="checkbox" id="ea-volcano"><span>US volcano watch or warning</span></label></div>'
    + '<p class="ea__msg" id="ea-msg" role="status" aria-live="polite"></p>'
    + '<div class="ea__btns">'
    + '<button type="submit" class="ea__primary" id="ea-save">SAVE</button>'
    + '<button type="button" id="ea-test">SEND TEST EMAIL</button>'
    + '<button type="button" id="ea-close">CLOSE</button>'
    + '</div></form></div>';

  var $ = function (id) { return document.getElementById(id); };
  var loaded = false;

  function msg(text, err) {
    var m = $('ea-msg'); if (!m) return;
    m.textContent = text || ''; m.className = 'ea__msg' + (err ? ' is-err' : '');
  }

  function sync() {
    var on = $('ea-enabled').checked;
    ['ea-weather', 'ea-brief', 'ea-quakes', 'ea-space', 'ea-volcano'].forEach(function (id) { $(id).disabled = !on; });
    $('ea-zip').disabled = !on || !$('ea-weather').checked;
    $('ea-wmin').disabled = !on || !$('ea-weather').checked;
    $('ea-blevel').disabled = !on || !$('ea-brief').checked;
    $('ea-qmin').disabled = !on || !$('ea-quakes').checked;
  }

  function fill(p) {
    $('ea-enabled').checked = !!p.enabled;
    $('ea-weather').checked = !!p.weather;
    $('ea-zip').value = p.zip || '';
    $('ea-wmin').value = p.weather_min || 'severe';
    $('ea-brief').checked = !!p.brief;
    $('ea-blevel').value = p.brief_level || 'observer';
    $('ea-quakes').checked = !!p.quakes;
    var q = String(p.quake_min || 5);
    $('ea-qmin').value = ['5', '5.5', '6', '6.5', '7'].indexOf(q) >= 0 ? q : '5';
    $('ea-space').checked = !!p.space;
    $('ea-volcano').checked = !!p.volcano;
    sync();
  }

  function read() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { /* default server side */ }
    return {
      enabled: $('ea-enabled').checked, weather: $('ea-weather').checked, zip: $('ea-zip').value.trim(),
      weather_min: $('ea-wmin').value, brief: $('ea-brief').checked, brief_level: $('ea-blevel').value,
      quakes: $('ea-quakes').checked, quake_min: Number($('ea-qmin').value),
      space: $('ea-space').checked, volcano: $('ea-volcano').checked, tz: tz
    };
  }

  function api(path, opts) {
    opts = opts || {}; opts.credentials = 'same-origin';
    return fetch(path, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, body: j }; });
    });
  }

  function load() {
    msg('Loading…');
    return api('/api/alerts/prefs').then(function (r) {
      if (r.status === 401) {
        msg('Sign in with your subscriber email to use alerts.', true);
        $('ea-save').disabled = true; $('ea-test').disabled = true; return;
      }
      if (r.status !== 200) { msg('Could not load your settings. Try again.', true); return; }
      loaded = true;
      $('ea-sub').textContent = 'Sent to ' + r.body.email + '. Off until you turn it on. You choose what is sent. Every email has a one-click unsubscribe link, and we send at most 12 a day.';
      fill(r.body.prefs); msg('');
    }).catch(function () { msg('Connection error. Try again.', true); });
  }

  function open() {
    var m = $('email-alerts-modal'); if (!m) return;
    m.style.display = 'flex';
    var d = $('topbar-drawer'); if (d) d.classList.remove('topbar-drawer--open');
    load().then(function () { var f = $('ea-enabled'); if (f) f.focus(); });
  }
  function close() {
    var m = $('email-alerts-modal'); if (m) m.style.display = 'none';
    if (location.hash === '#email-alerts') history.replaceState(null, '', location.pathname + location.search);
  }

  function save(e) {
    e.preventDefault();
    var body = read();
    $('ea-save').disabled = true; msg('Saving…');
    api('/api/alerts/prefs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        $('ea-save').disabled = false;
        if (r.status === 200 && r.body.ok) {
          fill(r.body.prefs);
          msg(r.body.prefs.enabled ? 'Saved. Alerts are on' + (r.body.prefs.place && r.body.prefs.weather ? ' for ' + r.body.prefs.place : '') + '.' : 'Saved. Alerts are off.');
        } else { msg(r.body.error || 'Could not save. Try again.', true); }
      }).catch(function () { $('ea-save').disabled = false; msg('Connection error. Try again.', true); });
  }

  function test() {
    $('ea-test').disabled = true; msg('Sending test…');
    api('/api/alerts/test', { method: 'POST' }).then(function (r) {
      $('ea-test').disabled = false;
      msg(r.status === 200 ? 'Test sent. Check your inbox (and spam folder the first time).' : (r.body.error || 'Could not send.'), r.status !== 200);
    }).catch(function () { $('ea-test').disabled = false; msg('Connection error. Try again.', true); });
  }

  function addEntryPoints() {
    var topRight = document.querySelector('.topbar__right');
    var acct = $('manage-sub-btn');
    if (topRight && acct && !$('email-alerts-btn')) {
      var b = document.createElement('button');
      b.className = 'topbar__action-btn topbar__action-btn--desktop';
      b.id = 'email-alerts-btn'; b.type = 'button'; b.textContent = 'ALERTS';
      b.title = 'Choose which alerts reach your email';
      b.addEventListener('click', open);
      acct.parentNode.insertBefore(b, acct);
    }
    var drawer = $('topbar-drawer'), mob = $('manage-sub-btn-mobile');
    if (drawer && mob && !$('email-alerts-btn-mobile')) {
      var m = document.createElement('button');
      m.id = 'email-alerts-btn-mobile'; m.type = 'button'; m.textContent = '✉ EMAIL ALERTS';
      m.addEventListener('click', open);
      mob.parentNode.insertBefore(m, mob);
    }
  }

  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var modal = document.createElement('div');
    modal.id = 'email-alerts-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'ea-title');
    modal.innerHTML = HTML;
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    $('ea-close').addEventListener('click', close);
    $('ea-form').addEventListener('submit', save);
    $('ea-test').addEventListener('click', test);
    ['ea-enabled', 'ea-weather', 'ea-brief', 'ea-quakes'].forEach(function (id) { $(id).addEventListener('change', sync); });
    addEntryPoints();
    if (location.hash === '#email-alerts') open();
    window.addEventListener('hashchange', function () { if (location.hash === '#email-alerts') open(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
