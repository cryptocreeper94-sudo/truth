/* AtmosCore explainer: a "HOW TO READ" button on the AtmosCore panel that opens a
   plain-language guide, plus the one-line "scored for your location from..." basis.
   Plain JS because the Observatory site has no Lume build step (same exemption as
   pricing.js, a11y.js, alerts-ui.js). Monochrome chrome; color only for data. */
(function () {
  'use strict';

  var css = ''
    + '#atmoscore-help-modal{display:none;position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.74);align-items:center;justify-content:center;padding:12px;}'
    + '#atmoscore-help-modal .ah{background:#0d0d0d;border:1px solid #e8e8e8;max-width:620px;width:100%;max-height:92vh;overflow-y:auto;padding:22px 24px;font-family:var(--font-mono,monospace);color:#e8e8e8;font-size:.78rem;line-height:1.65;}'
    + '#atmoscore-help-modal h3{margin:0 0 4px;font-size:1rem;letter-spacing:.06em;font-weight:600;}'
    + '#atmoscore-help-modal h4{margin:20px 0 6px;font-size:.74rem;letter-spacing:.1em;color:#fff;border-top:1px solid #2a2a2a;padding-top:14px;}'
    + '#atmoscore-help-modal p{margin:0 0 8px;color:#cfcfcf;}'
    + '#atmoscore-help-modal .ah__lead{color:#e8e8e8;font-size:.82rem;}'
    + '#atmoscore-help-modal table{width:100%;border-collapse:collapse;margin:6px 0 4px;}'
    + '#atmoscore-help-modal td{padding:6px 8px 6px 0;vertical-align:top;border-bottom:1px solid #1f1f1f;color:#cfcfcf;}'
    + '#atmoscore-help-modal td:first-child{white-space:nowrap;color:#e8e8e8;width:1%;padding-right:14px;}'
    + '#atmoscore-help-modal .ah__good{color:#87CEEB;}#atmoscore-help-modal .ah__mid{color:#b8b8b8;}#atmoscore-help-modal .ah__poor{color:#b5524c;}'
    + '#atmoscore-help-modal button{margin-top:18px;padding:.65rem 1.1rem;background:transparent;border:1px solid #e8e8e8;color:#e8e8e8;font-family:inherit;font-size:.72rem;letter-spacing:.06em;cursor:pointer;border-radius:0;transition:background .12s,color .12s;}'
    + '#atmoscore-help-modal button:hover,#atmoscore-help-modal button:focus-visible{background:#e8e8e8;color:#0d0d0d;outline:none;}'
    + '.atmoscore-help-btn{margin-left:8px;padding:3px 9px;background:transparent;border:1px solid #8a8a8a;color:#e8e8e8;font-family:var(--font-mono,monospace);font-size:.62rem;letter-spacing:.08em;cursor:pointer;border-radius:0;transition:background .12s,color .12s;}'
    + '.atmoscore-help-btn:hover,.atmoscore-help-btn:focus-visible{background:#e8e8e8;color:#0d0d0d;outline:none;}'
    + '#atmoscore-basis{margin-top:10px;font-size:.62rem;line-height:1.5;color:#8a8a8a;text-align:center;}';

  var HTML = ''
    + '<div class="ah" role="document">'
    + '<h3 id="ah-title">HOW TO READ ATMOSCORE</h3>'
    + '<p class="ah__lead">AtmosCore answers one question: <strong>how good are conditions right now, where you are, for watching the sky and being outside?</strong> It is not a forecast, and it is not a safety guarantee. Official warnings always override it.</p>'

    + '<h4>IS IT BASED ON MY LOCATION?</h4>'
    + '<p>Yes. Set your ZIP (or use GPS) in the bar at the top of the cockpit. The score then uses the <strong>nearest NOAA airport weather station within 100 miles</strong> of that spot, plus any National Weather Service warnings in effect at that spot. The line under the score tells you which station, how far away, and when it last reported.</p>'
    + '<p>With no ZIP set, or with no recent station report, there is no score. It shows a dash instead of a number. We do not guess.</p>'

    + '<h4>THE SCORE</h4>'
    + '<p>One number from <strong>-1.00</strong> (worst) to <strong>+1.00</strong> (best). Higher is better for observing.</p>'
    + '<table>'
    + '<tr><td class="ah__good">above +0.20</td><td><strong>Good.</strong> Clear air, calm enough, nothing in the way.</td></tr>'
    + '<tr><td class="ah__mid">+0.20 to -0.30</td><td><strong>So-so.</strong> Usable, but something is holding it back. Look at the four groups below to see what.</td></tr>'
    + '<tr><td class="ah__poor">below -0.30</td><td><strong>Poor.</strong> Expect limited visibility or rough conditions.</td></tr>'
    + '</table>'
    + '<p>Two things force <strong>Poor</strong> no matter what the number says: a safety flag (see below), or visibility so bad that you cannot see anyway.</p>'
    + '<p>The arrow shows the change since the last refresh: up is improving, down is degrading, a dot is steady.</p>'

    + '<h4>THE FOUR GROUPS</h4>'
    + '<table>'
    + '<tr><td>Heat energy</td><td>Temperature, air pressure, humidity, and how close the air is to its dew point. Extremes and fast pressure shifts score lower.</td></tr>'
    + '<tr><td>Light and visibility</td><td>How far you can see, plus fog, haze, smoke or dust. This group counts the most.</td></tr>'
    + '<tr><td>Wind and movement</td><td>Steady wind, gusts, gust spread, and whether it is raining or snowing.</td></tr>'
    + '<tr><td>Stability</td><td>Time of day where you are (pre-dawn air is calmest, mid-afternoon is roughest) and the geomagnetic field (NOAA Kp). The Kp part is national, not local.</td></tr>'
    + '</table>'
    + '<p>The group with the lowest number is what is holding your score down.</p>'

    + '<h4>THE RING</h4>'
    + '<p>Each of the 42 bars is one measurement. A bar pointing out is good, pointing in is poor, and the longer the bar, the stronger the reading. A dot with no bar means that measurement has no live source yet. <strong>Right now about 13 of the 42 have live data</strong>, and the badge in the header shows the exact count. We leave the rest empty instead of filling them with made-up numbers.</p>'

    + '<h4>SAFETY FLAGS</h4>'
    + '<p>A red bar under the score appears when a flag is active. It means one of these: a Severe or Extreme National Weather Service warning for your location (tornado, severe thunderstorm, flash flood, winter storm and similar), or extreme wind, strong gusts or extreme temperature at the nearest station. When one is active the status is always Poor. Follow your local warnings first.</p>'

    + '<h4>HOW TO USE IT</h4>'
    + '<p>Check it before you head out to watch the sky, fly a drone, or plan time outside. Good means go. So-so means read the four groups. Poor means wait, or check the flag. Then confirm with the local radar and warnings in the cockpit.</p>'
    + '<p>Limits: it uses one station that may be miles away, and a hill or a lake between you and the station can change things. It does not predict the next hour.</p>'
    + '<button type="button" id="ah-close">CLOSE</button>'
    + '</div>';

  var $ = function (id) { return document.getElementById(id); };

  function open() { var m = $('atmoscore-help-modal'); if (m) { m.style.display = 'flex'; var c = $('ah-close'); if (c) c.focus({ preventScroll: true }); var box = m.querySelector('.ah'); if (box) box.scrollTop = 0; } }
  function close() { var m = $('atmoscore-help-modal'); if (m) m.style.display = 'none'; }

  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

    var modal = document.createElement('div');
    modal.id = 'atmoscore-help-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'ah-title');
    modal.innerHTML = HTML;
    document.body.appendChild(modal);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    $('ah-close').addEventListener('click', close);

    var badge = $('atmoscore-provenance');
    if (badge && badge.parentNode && !$('atmoscore-help-btn')) {
      var b = document.createElement('button');
      b.type = 'button'; b.id = 'atmoscore-help-btn'; b.className = 'atmoscore-help-btn';
      b.textContent = '? HOW TO READ'; b.title = 'What the score means and how to use it';
      b.addEventListener('click', open);
      badge.parentNode.insertBefore(b, badge.nextSibling);
    }

    var trend = $('atmoscore-suit-trend');
    if (trend && trend.parentNode && !$('atmoscore-basis')) {
      var d = document.createElement('div'); d.id = 'atmoscore-basis'; d.setAttribute('aria-live', 'polite');
      trend.parentNode.appendChild(d);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
