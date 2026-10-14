/**
 * ═══════════════════════════════════════════════════════════════
 *  TRUTH OBSERVATORY — Cockpit Controller v3
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  [01] Identity    → OBSERVATORY_COCKPIT
 *  [14] Determinacy → Same API data → same render
 *  [32] Integrity   → Raw manifest data displayed unmodified
 *
 *  v3: AtmosCore backbone, domain carousels, dynamic legend,
 *      expanded map layers, share, rich conditions
 * ═══════════════════════════════════════════════════════════════
 */

const Observatory = {

  switchView(viewName) {
    const btn = document.querySelector(`.bottomnav__btn[data-view="${viewName}"]`);
    if (btn) btn.click();
  },

  // ── Feed Image Mapping ───────────────────────────────────────
  feedImages: {
    nexrad: 'assets/nexrad.jpg',
    goes: 'assets/goes.jpg',
    solar: 'assets/solar.jpg',
    earthquake: 'assets/seismic.jpg',
    lightning: 'assets/lightning.jpg',
    grid: 'assets/grid.jpg',
    geomag: 'assets/geomag.jpg',
    ionosonde: 'assets/ionosonde.jpg',
    schumann: 'assets/schumann.jpg',
    surface: 'assets/surface.jpg',
    blitzortung: 'assets/blitzortung.jpg',
    aircraft: 'assets/aircraft.jpg',
    notam: 'assets/notam.jpg',
    celltower: 'assets/celltower.jpg',
    heater: 'assets/heater.jpg',
    metals: 'assets/metals.jpg',
    ecology: 'assets/ecology.jpg',
    deposition: 'assets/deposition.jpg',
    wildfire: 'assets/wildfire.jpg',
    volcanic: 'assets/volcanic.jpg',
  },

  // ── Domain Config ────────────────────────────────────────────
  domains: {
    'Atmospheric':    { color: '#1E6FA8', order: 1 },
    'Space Weather':  { color: '#D4A017', order: 2 },
    'Geological':     { color: '#D4601A', order: 3 },
    'RF Research':    { color: '#a855f7', order: 4 },
    'Infrastructure': { color: '#5A7A8A', order: 5 },
    'Ecological':     { color: '#06b6d4', order: 6 },
  },

  // ── Layer definitions with legend configs ────────────────────
  layerDefs: {
    radar: {
      name: 'NEXRAD Radar',
      info: { source: 'NOAA NWS via Iowa State Mesonet', what: 'Base reflectivity (N0Q) from 160 WSR-88D radar stations. Shows precipitation intensity.', update: 'Every 5 minutes', attribution: 'NOAA/NWS' },
      legend: { type: 'gradient', heading: 'RADAR REFLECTIVITY', colors: ['#00ff00','#00cc00','#ffff00','#ff9900','#ff0000','#cc0000','#ff00ff'], labels: ['Light','Mod','Heavy','Extreme'] },
    },
    satellite: {
      name: 'GOES Visible',
      info: { source: 'NOAA GOES-East/West via Iowa State', what: 'Visible satellite imagery. Shows cloud cover, fog, and surface features in reflected sunlight.', update: 'Every 5 minutes (daylight only)', attribution: 'NOAA/NESDIS' },
      legend: { type: 'gradient', heading: 'GOES VISIBLE', colors: ['#111','#444','#888','#ccc','#fff'], labels: ['Clear','Thin Cloud','Thick Cloud'] },
    },
    infrared: {
      name: 'GOES Infrared',
      info: { source: 'NOAA GOES-East/West via Iowa State WMS', what: 'Infrared imagery showing cloud-top temperatures. Colder = higher clouds = stronger convection.', update: 'Every 15 minutes', attribution: 'NOAA/NESDIS' },
      legend: { type: 'gradient', heading: 'INFRARED (CLOUD TOP TEMP)', colors: ['#000033','#0000cc','#00ccff','#00ff00','#ffff00','#ff6600','#ff0000'], labels: ['Warm/Low','Mid','Cold/High'] },
    },
    watervapor: {
      name: 'Water Vapor',
      info: { source: 'NOAA GOES via Iowa State WMS', what: 'Mid-level moisture transport in the 6.5-7.0 µm band. Shows atmospheric rivers and dry air intrusions.', update: 'Every 15 minutes', attribution: 'NOAA/NESDIS' },
      legend: { type: 'gradient', heading: 'WATER VAPOR', colors: ['#330000','#663300','#996600','#cccc00','#00cc66','#0066cc','#ffffff'], labels: ['Dry','Moderate','Moist'] },
    },
    precip: {
      name: 'Precipitation',
      info: { source: 'RainViewer Global Radar', what: 'Global precipitation radar composite from weather radar stations worldwide.', update: 'Every 10 minutes', attribution: 'RainViewer' },
      legend: { type: 'gradient', heading: 'PRECIPITATION', colors: ['transparent','#00ccff','#0066ff','#00ff00','#ffff00','#ff0000'], labels: ['None','Light','Mod','Heavy'] },
    },
    fire: {
      name: 'Active Fires',
      info: { source: 'NASA FIRMS via NASA GIBS', what: 'Fire and thermal hotspots detected worldwide by the VIIRS instruments on the NOAA-20 and Suomi NPP satellites (375 m resolution). Shows the most recent full day.', update: 'Daily', attribution: 'NASA FIRMS / GIBS / VIIRS' },
      legend: { type: 'dots', heading: 'ACTIVE FIRES (FIRMS)', items: [{ color: '#ff3b30', label: 'High Confidence' }, { color: '#ff9500', label: 'Nominal' }, { color: '#ffd60a', label: 'Low Confidence' }] },
    },
    heaters: {
      name: 'Ionospheric Heaters',
      info: { source: 'HAARP, EISCAT, Sura, Jicamarca, MU Radar', what: 'Known ionospheric research facilities with high-power RF transmitters. Shows location, power output, and operating frequency.', update: 'Static locations, status checked every 6h', attribution: 'Public Records' },
      legend: { type: 'dots', heading: 'IONOSPHERIC HEATERS', items: [{ color: '#ff4ecf', label: 'Active Facility' }, { color: '#666', label: 'Decommissioned' }] },
    },
    aircraft: {
      name: 'ADS-B Aircraft',
      info: { source: 'ADS-B Exchange (global feed)', what: 'Live aircraft transponder (ADS-B) positions worldwide. Each plane points in its direction of travel and is colored by altitude. Hover for the callsign; click for full flight details. Callsigns appear as labels when zoomed in.', update: 'Every 5–10 minutes', attribution: 'ADS-B Exchange' },
      legend: { type: 'dots', heading: 'AIRCRAFT BY ALTITUDE', items: [
        { color: '#7dffb2', label: 'Below 5,000 ft' },
        { color: '#4ecbff', label: '5,000 – 20,000 ft' },
        { color: '#7f8cff', label: '20,000 – 30,000 ft' },
        { color: '#d08cff', label: 'Above 30,000 ft' },
        { color: '#9aa0a8', label: 'On the ground' },
        { color: '#ffb020', label: 'Military' },
        { color: '#ff3b3b', label: 'Emergency squawk' },
      ] },
    },
    glm: {
      name: 'Lightning (last 15 min)',
      info: { source: 'NOAA GOES-19 (East) and GOES-18 (West) Geostationary Lightning Mapper', what: 'Every lightning flash the GOES satellites detected in the last 15 minutes across the Americas, the Atlantic and the eastern Pacific. Brighter dots are more recent. Where the two satellites overlap, each flash is counted only once.', update: 'Every 5 minutes', attribution: 'NOAA GOES GLM' },
      legend: { type: 'dots', heading: 'LIGHTNING FLASHES (GOES GLM)', items: [{ color: '#fff200', label: 'Under 5 min ago' }, { color: '#ffa500', label: '5 – 10 min ago' }, { color: '#ff5a36', label: '10 – 15 min ago' }] },
    },
    wildfires: {
      name: 'Active Wildfires',
      info: { source: 'NIFC / IRWIN via ESRI ArcGIS', what: 'Active wildfire incidents across the US from the National Interagency Fire Center. Shows fire name, acreage, containment, and cause.', update: 'Every 30 minutes', attribution: 'NIFC / IRWIN' },
      legend: { type: 'dots', heading: 'WILDFIRES (NIFC)', items: [{ color: '#ff5722', label: '>10,000 acres' }, { color: '#ff9800', label: '1,000-10,000' }, { color: '#ffc107', label: '<1,000 acres' }] },
    },
    volcanoes: {
      name: 'Volcanic Activity',
      info: { source: 'USGS Volcano Hazards Program', what: 'US volcanoes with elevated alert levels (ADVISORY, WATCH, or WARNING). Shows alert level, aviation color code, and threat assessment.', update: 'Every hour', attribution: 'USGS VHP' },
      legend: { type: 'dots', heading: 'VOLCANIC ACTIVITY (HI & AK)', items: [{ color: '#f44336', label: 'WARNING' }, { color: '#ff9800', label: 'WATCH' }, { color: '#ffeb3b', label: 'ADVISORY' }] },
    },
    earthquakes: {
      name: 'USGS Earthquakes (24h)',
      info: { source: 'USGS Earthquake Hazards Program', what: 'M2.5+ earthquake events recorded across the globe in the last 24 hours. Circle size and color denote magnitude.', update: 'Every 5 minutes', attribution: 'USGS' },
      legend: { type: 'dots', heading: 'EARTHQUAKES (24H)', items: [
        { color: '#ff3b30', label: 'M5.0+ · Strong' },
        { color: '#ff9500', label: 'M4.0–4.9 · Moderate' },
        { color: '#ffd60a', label: 'M3.0–3.9 · Light' },
        { color: '#06b6d4', label: 'M2.5–2.9 · Minor' },
      ] },
    },
  },

  // ── State ────────────────────────────────────────────────────
  feeds: [],
  correlations: [],
  map: null,
  mapLayers: {},
  markers: { earthquakes: [], lightning: [], heaters: [], aircraft: [], fire: [], wildfires: [], volcanoes: [], glm: [] },
  refreshInterval: 60000,
  _alertLayersActive: [],  // tracks which layers were auto-activated by alerts

  // ── Correlation Layer Groups ────────────────────────────────
  // When a trigger feed shows elevated conditions, related layers auto-activate
  layerCorrelationGroups: {
    'space-weather': {
      name: 'Space Weather Event',
      triggers: ['solar', 'geomag'],
      layers: ['heaters'],  // heaters are the only map-layer feeds in this group
      icon: '☀️',
      description: 'Solar activity or geomagnetic storm detected — showing ionospheric heater facilities for cross-reference.',
    },
    'severe-weather': {
      name: 'Severe Weather',
      triggers: ['nexrad', 'lightning'],
      layers: ['radar', 'precip', 'satellite', 'glm'],
      icon: '⛈️',
      description: 'Severe weather detected — activating radar, precipitation, satellite, and fire layers.',
    },
    'atmospheric-anomaly': {
      name: 'Atmospheric Anomaly',
      triggers: ['heater', 'ionosonde', 'schumann'],
      layers: ['radar', 'heaters', 'aircraft'],
      icon: '📡',
      description: 'Ionospheric or RF activity detected — showing radar, heaters, and aircraft for cross-correlation.',
    },
    'wildfire-event': {
      name: 'Wildfire Activity',
      triggers: ['wildfire'],
      layers: ['fire', 'wildfires', 'satellite'],
      icon: '🔥',
      description: 'Active wildfires detected — showing fire satellite detections, incident map, and satellite imagery.',
    },
    'volcanic-event': {
      name: 'Volcanic Activity',
      triggers: ['volcanic'],
      layers: ['volcanoes', 'satellite', 'infrared'],
      icon: '🌋',
      description: 'Elevated volcanic alert — showing volcanic markers, satellite, and infrared imagery.',
    },
  },

  // ── Init ─────────────────────────────────────────────────────
  async init() {
    this.startClock();
    this.renderSkeletons();
    this.initMap();
    this.bindEvents();
    this.initStatTooltips();
    this.initMobileMapPreview();
    this.initLocation();
    this.initLedger();
    this.initTopbarDrawer();
    this.initWelcome();

    // Initialize AtmosCore engine
    AtmosCore.init();
    AtmosCoreViz.init('atmoscore-ring');

    await this.fetchAll();
    this.fetchLedger();
    this.fetchBrief();
    setInterval(() => this.fetchAll(), this.refreshInterval);
    setInterval(() => this.fetchLedger(), 60000);
    setInterval(() => this.fetchBrief(), 300000); // Refresh brief every 5 min
  },

  // ── Fetch Daily Brief ──────────────────────────────────────
  async fetchBrief() {
    try {
      const res = await fetch('/api/brief');
      if (!res.ok) return;
      const brief = await res.json();

      const level = (typeof Levels !== 'undefined') ? (Levels.get() || 'observer') : 'observer';
      const data = brief.briefs?.[level];
      if (!data) return;

      const bodyEl = document.getElementById('brief-body');
      const badgeEl = document.getElementById('brief-badge');
      const timeEl = document.getElementById('brief-time');
      const footerEl = document.getElementById('brief-footer');
      const certEl = document.getElementById('brief-cert');
      const sourceEl = document.getElementById('brief-source');

      if (bodyEl) bodyEl.textContent = data.text;

      if (badgeEl) {
        if (data.governance && data.governance.decision === 'approved') {
          badgeEl.textContent = '✓ VERIFIED';
          badgeEl.className = 'daily-brief__badge daily-brief__badge--verified';
        } else if (data.source === 'template') {
          badgeEl.textContent = '◆ TEMPLATE';
          badgeEl.className = 'daily-brief__badge daily-brief__badge--template';
        } else {
          badgeEl.textContent = '○ UNVERIFIED';
          badgeEl.className = 'daily-brief__badge daily-brief__badge--unverified';
        }
      }

      if (timeEl && brief.generatedAt) {
        timeEl.textContent = this.timeAgo(brief.generatedAt);
      }

      if (footerEl) footerEl.style.display = 'flex';

      if (certEl && data.governance?.certificateHash) {
        certEl.textContent = `LTC ${data.governance.certificateHash.substring(0, 12)}…`;
        certEl.title = `Lume-V Trust Certificate: ${data.governance.certificateHash}\nInvariants: ${data.governance.invariantsPassed}/${data.governance.invariantsTotal} passed\nLatency: ${data.governance.latency}ms`;
      } else if (certEl) {
        certEl.textContent = '';
      }

      // Show TrustLayer anchor info
      if (brief.trustLayer?.txHash) {
        if (certEl) {
          certEl.textContent += ` → TX ${brief.trustLayer.txHash.substring(0, 10)}…`;
          certEl.title += `\n\nTrustLayer Anchor:\nTX: ${brief.trustLayer.txHash}\nBlock: ${brief.trustLayer.blockHeight || 'pending'}`;
        }
        if (sourceEl) {
          sourceEl.textContent = 'Verified by Lume-V → Anchored on TrustLayer';
        }
      } else if (sourceEl) {
        sourceEl.textContent = data.source === 'ai' ? 'Verified by Lume-V' : 'Deterministic template';
      }
    } catch (err) {
      console.warn('[Observatory] Brief fetch error:', err.message);
    }
  },

  // ── Refresh (re-render for level change) ─────────────────────
  refresh() {
    if (this.feeds && this.feeds.length > 0) {
      this.renderCarousels();
    }
    if (typeof Levels !== 'undefined') Levels.applyLabels();
    if (typeof AtmosCore !== 'undefined' && AtmosCore.suitability) this.updateAtmosCoreUI();
    this.fetchBrief();
  },

  // ── Skeleton Loading States ──────────────────────────────────
  renderSkeletons() {
    const carousels = document.getElementById('feed-carousels');
    if (!carousels || carousels.children.length > 0) return;
    const skeletonHTML = Array(6).fill(
      '<div class="feed-card skeleton-card"><div class="skeleton-shimmer" style="height:60px;border-radius:4px;"></div><div class="skeleton-shimmer" style="height:12px;width:70%;margin-top:8px;border-radius:2px;"></div><div class="skeleton-shimmer" style="height:10px;width:50%;margin-top:6px;border-radius:2px;"></div></div>'
    ).join('');
    carousels.innerHTML = `<div class="feed-domain-group"><div class="feed-domain-label skeleton-shimmer" style="width:120px;height:14px;border-radius:2px;"></div><div class="feed-carousel" style="display:flex;gap:12px;padding:8px 16px;overflow:hidden;">${skeletonHTML}</div></div>`;
  },

  // ── Topbar Mobile Drawer ─────────────────────────────────────
  initTopbarDrawer() {
    const toggle = document.getElementById('topbar-menu-toggle');
    const drawer = document.getElementById('topbar-drawer');
    if (!toggle || !drawer) return;
    toggle.addEventListener('click', () => {
      drawer.classList.toggle('topbar-drawer--open');
      toggle.classList.toggle('topbar-menu-toggle--open');
    });
    // Close drawer when any link/button inside is clicked
    drawer.querySelectorAll('button, a').forEach(el => {
      el.addEventListener('click', () => {
        drawer.classList.remove('topbar-drawer--open');
        toggle.classList.remove('topbar-menu-toggle--open');
      });
    });
  },

  // ── Welcome Onboarding (level-aware, runs after level is chosen) ─
  initWelcome() {
    if (localStorage.getItem('obs_welcomed')) return;
    // First-time visitors pick a level first; the level picker calls
    // Observatory.startTour() once they choose.
    if (typeof Levels !== 'undefined' && Levels.needsOnboarding()) return;
    this.startTour();
  },

  startTour() {
    if (localStorage.getItem('obs_welcomed') || this._tourStarted) return;
    const overlay = document.getElementById('welcome-overlay');
    const stepsWrap = document.getElementById('welcome-steps');
    const nextBtn = document.getElementById('welcome-next');
    const skipBtn = document.getElementById('welcome-dismiss');
    if (!overlay || !stepsWrap || !nextBtn || !skipBtn) return;
    this._tourStarted = true;

    const tour = (typeof Levels !== 'undefined') ? Levels.getTour() : [];
    const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    stepsWrap.innerHTML = tour.map((s, i) => `
      <div class="welcome-step${i === 0 ? ' welcome-step--active' : ''}">
        <span class="welcome-step__icon">${esc(s.icon)}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.text)}</p>
        <span class="welcome-step__count">${i + 1} of ${tour.length}</span>
      </div>`).join('');

    const steps = stepsWrap.querySelectorAll('.welcome-step');
    if (steps.length === 0) return;
    let step = 0;
    nextBtn.textContent = steps.length === 1 ? 'GET STARTED' : 'NEXT →';
    overlay.style.display = 'flex';

    const finish = () => {
      overlay.style.display = 'none';
      localStorage.setItem('obs_welcomed', '1');
    };
    skipBtn.addEventListener('click', finish);
    nextBtn.addEventListener('click', () => {
      steps[step].classList.remove('welcome-step--active');
      step++;
      if (step < steps.length) {
        steps[step].classList.add('welcome-step--active');
        if (step === steps.length - 1) nextBtn.textContent = 'GET STARTED';
      } else {
        finish();
      }
    });
  },

  // ── UTC Clock ────────────────────────────────────────────────
  startClock() {
    const el = document.getElementById('utc-clock');
    const tick = () => {
      const now = new Date();
      el.textContent = now.toISOString().slice(11, 19) + ' UTC';
    };
    tick();
    setInterval(tick, 1000);
  },

  // ── Map Init with Expanded Layers ────────────────────────────
  mapStyle: 'dark',
  mapTiles: {
    light: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    dark:  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  },
  mapTileOpts: {
    light: { maxZoom: 19, noWrap: true, subdomains: 'abc' },
    dark:  { maxZoom: 18, noWrap: true },
  },

  // ── Single-world lock ─────────────────────────────────────────
  // Without this, Leaflet repeats the planet horizontally when you
  // zoom out. Allow slight horizontal breathing room (-195 to 195) so
  // Alaska/Aleutians and the Pacific date-line can center comfortably
  // without hard wall collisions, and never allow a zoom level where
  // the world is narrower than the container.
  _lockWorld(map) {
    const world = L.latLngBounds(L.latLng(-85.0511, -195), L.latLng(85.0511, 195));
    map.setMaxBounds(world);
    map.options.maxBoundsViscosity = 0.85;
    const fit = () => {
      const w = map.getContainer().clientWidth || 512;
      const h = map.getContainer().clientHeight || 256;
      const minZ = Math.max(1, Math.ceil(Math.log2(Math.max(w, h) / 256)));
      map.setMinZoom(minZ);
      if (map.getZoom() < minZ) map.setZoom(minZ);
    };
    fit();
    map.on('resize', fit);
  },

  // ── Edge-Aware Popup Clamping ─────────────────────────────────
  // Ensures any popup opened near container boundaries (e.g. Alaska/
  // Aleutian volcanoes at longitude -176° or markers near top/right edges)
  // dynamically shifts into view without overflowing off-screen.
  // The popup tip pointer is counter-shifted so it stays accurately
  // targeted on the marker coordinate.
  _setupPopupClamping(map) {
    if (!map || map._popupClampingSetup) return;
    map._popupClampingSetup = true;

    const clamp = () => {
      const container = map.getContainer();
      if (!container) return;
      const popups = container.querySelectorAll('.leaflet-popup');
      if (!popups.length) return;

      const mapRect = container.getBoundingClientRect();
      const PAD = 14;

      popups.forEach(popupEl => {
        const curShiftX = parseFloat(popupEl.dataset.shiftX || '0');
        const curShiftY = parseFloat(popupEl.dataset.shiftY || '0');
        const popRect = popupEl.getBoundingClientRect();

        // Calculate natural rect without current margin offsets
        const natLeft = popRect.left - curShiftX;
        const natRight = popRect.right - curShiftX;
        const natTop = popRect.top - curShiftY;

        let shiftX = 0;
        let shiftY = 0;

        // Clamp horizontal
        if (natLeft < mapRect.left + PAD) {
          shiftX = (mapRect.left + PAD) - natLeft;
        } else if (natRight > mapRect.right - PAD) {
          shiftX = (mapRect.right - PAD) - natRight;
        }

        // Clamp vertical (if popup overflows top of map)
        if (natTop < mapRect.top + PAD) {
          shiftY = (mapRect.top + PAD) - natTop;
        }

        popupEl.dataset.shiftX = shiftX;
        popupEl.dataset.shiftY = shiftY;
        popupEl.style.marginLeft = Math.round(shiftX) ? `${Math.round(shiftX)}px` : '';
        popupEl.style.marginTop = Math.round(shiftY) ? `${Math.round(shiftY)}px` : '';

        // Counter-shift tip so it continues pointing at the marker coordinates
        const tip = popupEl.querySelector('.leaflet-popup-tip-container');
        if (tip) {
          if (shiftX !== 0) {
            const maxTipShift = Math.max(0, (popRect.width / 2) - 22);
            const tipShift = Math.max(-maxTipShift, Math.min(maxTipShift, -shiftX));
            tip.style.transform = `translateX(${Math.round(tipShift)}px)`;
          } else {
            tip.style.transform = '';
          }
        }
      });
    };

    map.on('popupopen', () => {
      clamp();
      requestAnimationFrame(clamp);
      setTimeout(clamp, 40);
      setTimeout(clamp, 180);
    });
    map.on('move', clamp);
    map.on('resize', clamp);
    map.on('popupclose', (e) => {
      const el = e.popup && e.popup.getElement && e.popup.getElement();
      if (el) {
        el.dataset.shiftX = 0;
        el.dataset.shiftY = 0;
        el.style.marginLeft = '';
        el.style.marginTop = '';
        const tip = el.querySelector('.leaflet-popup-tip-container');
        if (tip) tip.style.transform = '';
      }
    });
  },

  initMap() {
    this.map = L.map('map', {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    this._lockWorld(this.map);
    this._setupPopupClamping(this.map);

    // Base layer — swappable light/dark
    this.baseLayer = L.tileLayer(this.mapTiles[this.mapStyle],
      this.mapTileOpts[this.mapStyle]
    ).addTo(this.map);

    // NOAA Radar
    this.mapLayers.radar = L.tileLayer.wms('https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi', {
      layers: 'nexrad-n0q-900913', format: 'image/png', transparent: true, opacity: 0.6,
    });

    // GOES Visible
    this.mapLayers.satellite = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-vis-1km-900913/{z}/{x}/{y}.png', {
      opacity: 0.4, maxZoom: 8, noWrap: true,
    });

    // GOES Infrared — Iowa State tile cache
    this.mapLayers.infrared = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-ir-4km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8, noWrap: true,
    });

    // Water Vapor — Iowa State tile cache
    this.mapLayers.watervapor = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-wv-4km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8, noWrap: true,
    });

    // Precipitation — RainViewer (free, no API key)
    this.mapLayers.precip = L.tileLayer('', { opacity: 0.5, maxZoom: 18, noWrap: true });
    this._loadRainViewerTiles();

    // NASA FIRMS active fires (WMS)
    this.mapLayers.fire = this._firmsLayer();

    // Heaters and Aircraft are marker-based layers (L.layerGroup)
    this.mapLayers.heaters = L.layerGroup();
    this.mapLayers.heaters.addTo(this.map);
    this.mapLayers.aircraft = L.layerGroup();
    this.mapLayers.wildfires = L.layerGroup();
    this.mapLayers.volcanoes = L.layerGroup();
    this.mapLayers.glm = L.layerGroup();
    this.mapLayers.earthquakes = L.layerGroup();
    this.mapLayers.earthquakes.addTo(this.map);

    // State/country boundaries + labels overlay (always on over satellite imagery)
    // ESRI Reference overlay — guaranteed compatible with ESRI World Imagery base
    this.boundaryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, noWrap: true, opacity: 0.9, pane: 'overlayPane',
    }).addTo(this.map);

    // Default: show radar + heaters
    this.mapLayers.radar.addTo(this.map);

    // Load geo marker data
    this.loadHeaterMarkers();
    this.loadAircraftMarkers();
    setInterval(() => this.loadAircraftMarkers(), 5 * 60 * 1000);
    this.loadWildfireMarkers();
    this.loadVolcanoMarkers();
    this.loadLightningMarkers();
    setInterval(() => this.loadLightningMarkers(), 5 * 60 * 1000);

    this.updateLayerCount();
    this.updateDynamicLegend();
    this._initLayerTooltips();
  },

  // ── Satellite fire detections — NASA GIBS WMS (VIIRS 375m, no API key) ──
  // The old FIRMS mapserver key was revoked and returned "MAP_KEY is invalid" tiles.
  _firmsLayer() {
    const day = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);
    return L.tileLayer.wms('https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi', {
      layers: 'VIIRS_NOAA20_Thermal_Anomalies_375m_All,VIIRS_SNPP_Thermal_Anomalies_375m_All',
      format: 'image/png', transparent: true, opacity: 0.9, maxZoom: 12, noWrap: true,
      TIME: day,
    });
  },

  // ── Mirror a marker layer from the main map onto the fullscreen map ──
  _mirrorToFs(name) {
    const group = this.fsMapLayers && this.fsMapLayers[name];
    const src = this.markers && this.markers[name];
    if (!group || !src) return;
    group.clearLayers();
    const srcGroup = this.mapLayers && this.mapLayers[name];
    src.forEach(m => {
      if (name === 'aircraft' && srcGroup && !srcGroup.hasLayer(m)) return;
      const opts = Object.assign({}, m.options);
      delete opts.renderer;
      if (name === 'aircraft' || name === 'glm') opts.renderer = this._fsAircraftRenderer || (this._fsAircraftRenderer = L.canvas({ padding: 0.3, tolerance: 3 }));
      const copy = new m.constructor(m.getLatLng(), opts);
      const popup = m.getPopup && m.getPopup();
      if (popup) copy.bindPopup(popup.getContent(), Object.assign({ className: 'obs-popup', maxWidth: 260, autoPanPadding: [20, 20] }, popup.options || {}));
      const tip = m.getTooltip && m.getTooltip();
      if (tip) copy.bindTooltip(tip.getContent(), { direction: 'top', offset: [0, -6], className: tip.options.className });
      group.addLayer(copy);
    });
  },

  // ── Hover / focus / long-press explanations for every layer toggle ──
  _initLayerTooltips() {
    if (this._layerTipsBound) return;
    this._layerTipsBound = true;
    const tip = document.createElement('div');
    tip.className = 'layer-tip';
    tip.id = 'layer-tip';
    tip.setAttribute('role', 'tooltip');
    document.body.appendChild(tip);
    let hideTimer = null;

    const show = (label) => {
      const input = label.querySelector('input[data-layer], input[data-fslayer]');
      if (!input) return;
      const key = input.dataset.layer || input.dataset.fslayer;
      const def = this.layerDefs[key];
      if (!def || !def.info) return;
      clearTimeout(hideTimer);
      tip.innerHTML =
        `<div class="layer-tip__name">${def.name}</div>` +
        `<div class="layer-tip__what">${def.info.what}</div>` +
        `<div class="layer-tip__meta"><span>Source</span>${def.info.source}</div>` +
        `<div class="layer-tip__meta"><span>Updates</span>${def.info.update}</div>` +
        (key === 'aircraft' ? '<div class="layer-tip__note">Subscriber layer</div>' : '');
      tip.classList.add('layer-tip--open');
      const r = label.getBoundingClientRect();
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      let left = Math.min(Math.max(8, r.left + r.width / 2 - tw / 2), window.innerWidth - tw - 8);
      let top = r.bottom + 8;
      if (top + th > window.innerHeight - 8) top = Math.max(8, r.top - th - 8);
      tip.style.left = left + 'px';
      tip.style.top = top + 'px';
      input.setAttribute('aria-describedby', 'layer-tip');
    };
    const hide = (delay = 0) => {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => tip.classList.remove('layer-tip--open'), delay);
    };

    document.querySelectorAll('.layer-toggle').forEach(label => {
      if (!label.querySelector('input[data-layer], input[data-fslayer]')) return;
      label.addEventListener('mouseenter', () => show(label));
      label.addEventListener('mouseleave', () => hide(80));
      label.addEventListener('focusin', () => show(label));
      label.addEventListener('focusout', () => hide());
      let press = null;
      label.addEventListener('touchstart', () => {
        press = setTimeout(() => { show(label); hide(3500); }, 450);
      }, { passive: true });
      label.addEventListener('touchend', () => clearTimeout(press));
      label.addEventListener('touchmove', () => clearTimeout(press), { passive: true });
    });
    document.querySelectorAll('.layer-toggles, .map-fullscreen__toolbar').forEach(el =>
      el.addEventListener('scroll', () => hide(), { passive: true }));
  },

  // ── RainViewer precipitation tiles ───────────────────────────
  async _loadRainViewerTiles() {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await res.json();
      const latest = data.radar.past[data.radar.past.length - 1];
      if (latest) {
        const newLayer = L.tileLayer(`https://tilecache.rainviewer.com${latest.path}/512/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.5, maxZoom: 18, noWrap: true,
        });
        // Swap into mapLayers
        const wasActive = this.map.hasLayer(this.mapLayers.precip);
        if (wasActive) this.map.removeLayer(this.mapLayers.precip);
        this.mapLayers.precip = newLayer;
        if (wasActive) newLayer.addTo(this.map);
      }
    } catch (e) {
      console.warn('[Observatory] RainViewer load failed:', e.message);
    }
  },

  updateLayerCount() {
    let count = 0;
    Object.values(this.mapLayers).forEach(layer => {
      if (this.map.hasLayer(layer)) count++;
    });
    document.getElementById('map-layers').textContent = `${count + 1} layers active`;
  },

  // ── Toggle Map Style (light/dark) ───────────────────────────
  toggleMapStyle() {
    this.mapStyle = this.mapStyle === 'light' ? 'dark' : 'light';
    this.map.removeLayer(this.baseLayer);
    this.baseLayer = L.tileLayer(this.mapTiles[this.mapStyle],
      this.mapTileOpts[this.mapStyle]
    ).addTo(this.map);
    // Move base layer below overlays
    this.baseLayer.bringToBack();
    // Update button
    const btn = document.getElementById('map-style-toggle');
    btn.textContent = this.mapStyle === 'light' ? '☀ LIGHT' : '🌙 DARK';
  },

  // ── Dynamic Legend (Shared for Cockpit & Fullscreen) ────────
  _renderLegend(targetEl, mapInstance, layersMap) {
    if (!targetEl || !mapInstance || !layersMap) return;
    let html = '<div class="map-legend__title">LEGEND</div>';
    let hasActive = false;

    for (const [key, def] of Object.entries(this.layerDefs)) {
      const isLayerOnMap = layersMap[key] && mapInstance.hasLayer(layersMap[key]);
      const isAnimOnMap = this.animActive && (
        (key === 'radar' && this.animNexradLayers && this.animNexradLayers.length > 0) ||
        (key === 'precip' && this.animLayers && this.animLayers.length > 0)
      );

      if (!isLayerOnMap && !isAnimOnMap) continue;
      hasActive = true;
      const leg = def.legend;

      html += `<div class="map-legend__section">`;
      html += `<div class="map-legend__heading">${leg.heading}<button class="map-legend__info-btn" data-layer-info="${key}" title="Layer info">ⓘ</button></div>`;

      if (leg.type === 'gradient') {
        html += `<div class="map-legend__bar">`;
        for (const c of leg.colors) {
          html += `<span style="background:${c}"></span>`;
        }
        html += `</div>`;
        html += `<div class="map-legend__labels">`;
        for (const l of leg.labels) {
          html += `<span>${l}</span>`;
        }
        html += `</div>`;
      } else if (leg.type === 'dots') {
        for (const item of leg.items) {
          html += `<div style="display:flex;align-items:center;gap:6px;margin:3px 0;"><span style="width:8px;height:8px;border-radius:50%;background:${item.color};display:inline-block;flex-shrink:0;"></span><span style="font-size:9px;color:#aaa;">${item.label}</span></div>`;
        }
      }
      html += `</div>`;
    }

    targetEl.innerHTML = hasActive ? html : '';

    // Bind info buttons
    targetEl.querySelectorAll('.map-legend__info-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showLayerInfo(btn.dataset.layerInfo);
      });
    });
  },

  updateDynamicLegend() {
    const legend = document.getElementById('map-legend');
    if (legend && this.map) {
      this._renderLegend(legend, this.map, this.mapLayers);
    }
    const fsLegend = document.getElementById('map-fullscreen-legend');
    if (fsLegend && this.fullscreenMap) {
      this._renderLegend(fsLegend, this.fullscreenMap, this.fsMapLayers);
    }
  },

  showLayerInfo(layerKey) {
    const def = this.layerDefs[layerKey];
    if (!def) return;

    const overlay = document.getElementById('legend-info-overlay');
    document.getElementById('legend-info-title').textContent = def.name;
    document.getElementById('legend-info-body').innerHTML = `
      <div class="info-row"><strong>Source</strong><span>${def.info.source}</span></div>
      <div class="info-row"><strong>What it shows</strong></div>
      <p style="margin: 4px 0 8px; color: var(--text-secondary)">${def.info.what}</p>
      <div class="info-row"><strong>Update freq</strong><span>${def.info.update}</span></div>
      <div class="info-row"><strong>Attribution</strong><span>${def.info.attribution}</span></div>
    `;
    overlay.classList.add('legend-info-overlay--open');
  },

  // ── Fetch All Data ───────────────────────────────────────────
  async fetchAll() {
    try {
      const [feedsRes, corrRes] = await Promise.all([
        fetch('/api/feeds').then(r => r.json()).catch(() => null),
        fetch('/api/correlations').then(r => r.json()).catch(() => null),
      ]);

      if (feedsRes?.feeds) {
        this.feeds = feedsRes.feeds;
        this.renderCarousels();
        this.updateTopbar(feedsRes);
        this.updateMapOverlays();

        // ── AtmosCore compute ──────────────────────────────
        AtmosCore.compute(this.feeds);
        AtmosCoreViz.update(AtmosCore);
        this.updateAtmosCoreUI();

        // Check for alert conditions and auto-activate related layers
        this.checkAlertLayers();
      }

      if (corrRes) {
        this.correlations = corrRes.patterns || corrRes.events || [];
        this.renderCorrelations(corrRes);
      }

      const pulse = document.getElementById('global-pulse');
      pulse.style.background = 'var(--signal-live)';
    } catch (err) {
      console.warn('[Observatory] Fetch error:', err.message);
      const pulse = document.getElementById('global-pulse');
      pulse.style.background = 'var(--signal-stale)';
    }
  },

  // ── Is Feed Elevated? ──────────────────────────────────────
  _isElevated(feed) {
    if (!feed || feed.status === 'offline') return false;
    if (feed.condition && feed.condition.level) return ['watch', 'warn', 'alert'].includes(feed.condition.level) && !/FAILING|STALE/.test(feed.condition.text || '');
    const rate = feed.sparkline ? feed.sparkline[feed.sparkline.length - 1] || 0 : 0;
    const avg = feed.sparkline ? feed.sparkline.reduce((a, b) => a + b, 0) / (feed.sparkline.length || 1) : 0;
    switch (feed.id) {
      case 'earthquake': return feed.entries > 15;
      case 'solar': return rate > avg * 2;
      case 'geomag': return rate > avg * 2;
      case 'nexrad': return rate > avg * 2 && avg > 0;
      case 'lightning': case 'blitzortung': return feed.entries > 10;
      case 'grid': return rate > avg * 1.5 && avg > 0;
      case 'ionosonde': return rate > avg * 2;
      case 'schumann': return rate > avg * 2;
      case 'heater': return feed.entries > 0;
      case 'metals': return rate > avg * 1.5 && avg > 0;
      case 'wildfire': return feed.entries > 0;
      case 'volcanic': return feed.entries > 0;
      case 'notam': return feed.entries > 20;
      default: return rate > avg * 1.5 && avg > 0;
    }
  },

  // ── Smart Alert-Based Layer Activation ──────────────────────
  checkAlertLayers() {
    if (!this.feeds || !this.map) return;

    const triggered = [];
    const layersToActivate = new Set();

    for (const [groupId, group] of Object.entries(this.layerCorrelationGroups)) {
      const triggerFeed = this.feeds.find(f => group.triggers.includes(f.id) && this._isElevated(f));
      if (triggerFeed) {
        triggered.push({ groupId, group, triggerFeed });
        group.layers.forEach(l => layersToActivate.add(l));
      }
    }

    // Activate layers that aren't already on
    const newlyActivated = [];
    for (const layerName of layersToActivate) {
      if (this.mapLayers[layerName] && !this.map.hasLayer(this.mapLayers[layerName])) {
        this.mapLayers[layerName].addTo(this.map);
        newlyActivated.push(layerName);
        // Sync checkbox
        const cb = document.querySelector(`input[data-layer="${layerName}"]`);
        if (cb) cb.checked = true;
      }
    }

    // Track auto-activated layers
    this._alertLayersActive = [...new Set([...this._alertLayersActive, ...newlyActivated])];

    // Show alert notification if new layers were activated
    if (newlyActivated.length > 0 && triggered.length > 0) {
      this._showAlertBanner(triggered, newlyActivated);
      // Expand layer panel if collapsed
      const layerToggles = document.getElementById('layer-toggles');
      const layersBtn = document.getElementById('layers-btn');
      if (layerToggles && layerToggles.classList.contains('layer-toggles--collapsed')) {
        layerToggles.classList.remove('layer-toggles--collapsed');
        if (layersBtn) layersBtn.classList.add('layers-btn--active');
        setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 350);
      }
    }

    this.updateLayerCount();
    this.updateDynamicLegend();
    this.checkLayerDensity();
  },

  // ── Alert Banner ───────────────────────────────────────────
  _showAlertBanner(triggered, newLayers) {
    // Remove existing banner if any
    const existing = document.getElementById('alert-layer-banner');
    if (existing) existing.remove();

    const firstGroup = triggered[0].group;
    const level = (typeof Levels !== 'undefined') ? (Levels.get() || 'observer') : 'researcher';

    let message;
    if (level === 'observer') {
      message = `${firstGroup.icon} Something interesting is happening — we've turned on ${newLayers.length} extra map layer${newLayers.length > 1 ? 's' : ''} to show you the full picture.`;
    } else if (level === 'analyst') {
      message = `${firstGroup.icon} ${firstGroup.name} — Auto-activated ${newLayers.join(', ').toUpperCase()} layers for cross-correlation.`;
    } else {
      message = `${firstGroup.icon} ${firstGroup.name} detected. Auto-enabled: ${newLayers.join(', ').toUpperCase()}. ${firstGroup.description}`;
    }

    const banner = document.createElement('div');
    banner.id = 'alert-layer-banner';
    banner.className = 'alert-layer-banner';
    banner.innerHTML = `
      <span class="alert-layer-banner__text">${message}</span>
      <button class="alert-layer-banner__close" onclick="this.parentElement.remove()">✕</button>
    `;
    const mapPanel = document.getElementById('map-panel');
    if (mapPanel) {
      mapPanel.insertBefore(banner, document.getElementById('map'));
    }

    // Auto-dismiss after 15 seconds
    setTimeout(() => { if (banner.parentElement) banner.remove(); }, 15000);
  },

  // ── Layer Density Warning ──────────────────────────────────
  checkLayerDensity() {
    let activeCount = 0;
    Object.values(this.mapLayers).forEach(layer => {
      if (this.map.hasLayer(layer)) activeCount++;
    });

    // Remove existing warning
    const existing = document.getElementById('layer-density-warning');
    if (existing) existing.remove();

    if (activeCount >= 8) {
      const level = (typeof Levels !== 'undefined') ? (Levels.get() || 'observer') : 'researcher';
      let msg;
      if (activeCount >= 10) {
        msg = level === 'observer'
          ? `🤯 You've got ${activeCount} layers on! This might look like a Jackson Pollock painting. That's okay — sometimes the full picture IS chaotic.`
          : `⚠ ${activeCount} layers active. Full 20-collector overlay may produce visual noise. Data integrity is unaffected — only visual clarity is reduced.`;
      } else {
        msg = level === 'observer'
          ? `📊 ${activeCount} layers active — getting detailed! Some overlays may overlap.`
          : `${activeCount} layers active. Consider disabling unused overlays for clarity.`;
      }

      const warning = document.createElement('div');
      warning.id = 'layer-density-warning';
      warning.className = 'layer-density-warning';
      warning.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()">✕</button>`;

      const mapEl = document.getElementById('map');
      if (mapEl) mapEl.appendChild(warning);
    }
  },

  // ── Update Topbar ────────────────────────────────────────────
  updateTopbar(data) {
    const liveEl = document.getElementById('stat-live');
    const live = data.live || 0;
    liveEl.textContent = `${live}/${data.total || 19}`;
    liveEl.style.color = live === data.total ? 'var(--signal-live)' :
                         live > 0 ? 'var(--signal-stale)' : 'var(--signal-offline)';
    // Update mobile summary card
    const sf = document.getElementById('summary-feeds');
    if (sf) { sf.textContent = `${live}/${data.total || 19}`; sf.style.color = liveEl.style.color; }
  },

  // ── Update AtmosCore UI ──────────────────────────────────────
  updateAtmosCoreUI() {
    const P = AtmosCore.primitives;
    const suit = AtmosCore.suitability;
    const prov = AtmosCore.getProvenanceSummary();

    // Primitive readouts
    for (const key of ['TH', 'OP', 'DY', 'TS']) {
      const el = document.getElementById(`prim-${key}`);
      if (el) {
        const v = P[key].value;
        el.textContent = v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
        el.style.color = AtmosCore.getBandColor(v);
      }
    }

    // Suitability
    const scoreEl = document.getElementById('atmoscore-suit-score');
    const statusEl = document.getElementById('atmoscore-suit-status');
    const trendEl = document.getElementById('atmoscore-suit-trend');

    if (scoreEl) {
      const v = suit.overall;
      scoreEl.textContent = v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
      scoreEl.style.color = AtmosCore.getBandColor(v);
    }
    const hasLevels = (typeof Levels !== 'undefined');
    const word = (s) => hasLevels ? Levels.statusWord(s) : String(s).toUpperCase();

    if (statusEl) {
      statusEl.textContent = hasLevels ? Levels.statusLong(suit.status).toUpperCase() : suit.status.toUpperCase();
      statusEl.style.color = suit.status === 'suitable' ? 'var(--ac-optimal)' :
                             suit.status === 'qualified' ? 'var(--ac-advisory)' :
                             suit.status === 'unsuitable' ? 'var(--ac-critical)' : 'var(--text-dim)';
    }
    if (trendEl) {
      const tChar = hasLevels ? Levels.trendWord(suit.trend) :
        (suit.trend === 'improving' ? '▲ IMPROVING' : suit.trend === 'degrading' ? '▼ DEGRADING' : '● STABLE');
      const tColor = suit.trend === 'improving' ? 'var(--ac-optimal)' : suit.trend === 'degrading' ? 'var(--ac-caution)' : 'var(--text-dim)';
      trendEl.textContent = tChar;
      trendEl.style.color = tColor;
    }

    // Topbar AtmosCore stat
    const acStat = document.getElementById('stat-atmoscore');
    if (acStat) {
      acStat.textContent = word(suit.status);
      acStat.style.color = suit.status === 'suitable' ? 'var(--signal-live)' :
                           suit.status === 'qualified' ? 'var(--signal-stale)' : 'var(--signal-offline)';
    }

    const suitStat = document.getElementById('stat-suitability');
    if (suitStat) {
      const v = suit.overall;
      suitStat.textContent = v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
      suitStat.style.color = AtmosCore.getBandColor(v);
    }

    // Update mobile summary cards
    const sa = document.getElementById('summary-atmoscore');
    if (sa) { sa.textContent = word(suit.status); sa.style.color = acStat ? acStat.style.color : ''; }
    const ss = document.getElementById('summary-suitability');
    if (ss && suitStat) { ss.textContent = suitStat.textContent; ss.style.color = suitStat.style.color; }

    // Provenance badge
    const provEl = document.getElementById('atmoscore-provenance');
    if (provEl) {
      provEl.textContent = `${prov.measured + prov.estimated + prov.derived}/${prov.total} nodes active`;
    }

    // Hard constraint bar
    const hcBar = document.getElementById('atmoscore-hc-bar');
    const hcText = document.getElementById('atmoscore-hc-text');
    const activeHC = Object.entries(AtmosCore.hardConstraints).filter(([, hc]) => hc.active);
    if (activeHC.length > 0 && hcBar && hcText) {
      hcBar.style.display = 'flex';
      hcText.textContent = activeHC.map(([id, hc]) => `${id}: ${hc.reason}`).join(' · ');
    } else if (hcBar) {
      hcBar.style.display = 'none';
    }
  },

  // ── Render Domain Carousels ──────────────────────────────────
  renderCarousels() {
    const container = document.getElementById('feed-carousels');
    container.innerHTML = '';

    // Group feeds by domain
    const grouped = {};
    for (const feed of this.feeds) {
      const domain = feed.domain || 'Other';
      if (!grouped[domain]) grouped[domain] = [];
      grouped[domain].push(feed);
    }

    // Sort domains by configured order
    const sortedDomains = Object.keys(grouped).sort((a, b) => {
      return (this.domains[a]?.order || 99) - (this.domains[b]?.order || 99);
    });

    for (const domain of sortedDomains) {
      const feeds = grouped[domain];
      const domainConf = this.domains[domain] || { color: '#5A7A8A', order: 99 };
      const carouselId = `carousel-${domain.replace(/\s/g, '-').toLowerCase()}`;

      const section = document.createElement('div');
      section.className = 'feed-carousel';
      section.innerHTML = `
        <div class="feed-carousel__header">
          <div class="feed-carousel__domain-bar" style="background: ${domainConf.color}"></div>
          <span class="feed-carousel__domain">${(typeof Levels !== 'undefined' ? Levels.getDomainLabel(domain) : domain).toUpperCase()}</span>
          <span class="feed-carousel__count">${feeds.length} feeds</span>
        </div>
        <div class="feed-carousel__track-wrap">
          <div class="feed-carousel__track" id="${carouselId}"></div>
        </div>
        <div class="feed-carousel__nav">
          <button class="feed-carousel__arrow feed-carousel__arrow--prev" data-carousel="${carouselId}">&#8249;</button>
          <div class="feed-carousel__dots" id="${carouselId}-dots"></div>
          <button class="feed-carousel__arrow feed-carousel__arrow--next" data-carousel="${carouselId}">&#8250;</button>
        </div>
      `;
      container.appendChild(section);

      const track = section.querySelector(`#${carouselId}`);
      const dots = section.querySelector(`#${carouselId}-dots`);

      for (let i = 0; i < feeds.length; i++) {
        const feed = feeds[i];
        const card = this._createFeedCard(feed);
        track.appendChild(card);

        const dot = document.createElement('div');
        dot.className = `feed-carousel__dot${i === 0 ? ' feed-carousel__dot--active' : ''}`;
        dots.appendChild(dot);
      }

      // Arrow handlers
      const prevBtn = section.querySelector('.feed-carousel__arrow--prev');
      const nextBtn = section.querySelector('.feed-carousel__arrow--next');
      prevBtn.addEventListener('click', () => track.scrollBy({ left: -230, behavior: 'smooth' }));
      nextBtn.addEventListener('click', () => track.scrollBy({ left: 230, behavior: 'smooth' }));

      // Scroll dot sync
      track.addEventListener('scroll', () => {
        const scrollLeft = track.scrollLeft;
        const cardWidth = 228;
        const activeIdx = Math.round(scrollLeft / cardWidth);
        dots.querySelectorAll('.feed-carousel__dot').forEach((d, idx) => {
          d.classList.toggle('feed-carousel__dot--active', idx === activeIdx);
        });
      });
    }

    // Append footer clone at bottom of feed scroll
    const footer = document.getElementById('site-footer');
    if (footer) {
      const clone = footer.cloneNode(true);
      clone.removeAttribute('id');
      container.appendChild(clone);
    }
  },

  _createFeedCard(feed) {
    const card = document.createElement('div');
    card.className = `feed-card feed-card--${feed.status}`;

    const ago = this.timeAgo(feed.last);
    const sparkId = `spark-${feed.id}`;
    const imgSrc = this.feedImages[feed.id] || 'assets/nexrad.jpg';
    const condition = this.getConditionText(feed);

    const levelContent = (typeof Levels !== 'undefined') ? Levels.getFeedContent(feed.id) : null;
    const displayName = levelContent ? levelContent.name : feed.name;
    const currentLevel = (typeof Levels !== 'undefined') ? (Levels.get() || 'observer') : 'researcher';
    const whyBlock = (levelContent && levelContent.why && currentLevel !== 'researcher')
      ? `<div class="feed-card__why">${levelContent.why}</div>` : '';

    card.innerHTML = `
      <div class="feed-card__image-wrap">
        <img class="feed-card__image" src="${imgSrc}" alt="${displayName}" loading="lazy">
        <div class="feed-card__image-overlay"></div>
        <span class="feed-card__badge feed-card__badge--${feed.status}">${feed.status.toUpperCase()}</span>
        <div class="feed-card__name">${displayName}</div>
      </div>
      <div class="feed-card__content">
        ${condition ? `<div class="feed-card__condition" style="color: ${condition.color}">${condition.text}</div>` : ''}
        <canvas class="feed-card__sparkline" id="${sparkId}" width="200" height="24"></canvas>
        ${whyBlock}
        <div class="feed-card__footer">
          <span>${currentLevel === 'observer' ? feed.entries + ' readings' : feed.entries + ' obs'}</span>
          <span>${ago}</span>
        </div>
      </div>
      <button class="feed-card__share" title="Share this feed" data-feed-id="${feed.id}">&#9993;</button>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.feed-card__share')) {
        e.stopPropagation();
        this.shareFeed(feed);
        return;
      }
      this.openDetail(feed);
    });

    requestAnimationFrame(() => this.drawSparkline(sparkId, feed.sparkline, feed.status));
    return card;
  },

  // ── Condition Text (all 20 feeds) ───────────────────────────
  _levelColor(level) {
    return ({ ok: 'var(--signal-live)', info: 'var(--brass)', watch: 'var(--signal-yellow)', warn: 'var(--signal-stale)', alert: 'var(--signal-offline)', offline: 'var(--signal-offline)' })[level] || 'var(--text-secondary)';
  },

  getConditionText(feed) {
    if (feed.status === 'offline') return { text: 'NO DATA', color: 'var(--signal-offline)' };
    if (feed.condition && feed.condition.text) return { text: feed.condition.text, color: this._levelColor(feed.condition.level) };

    const rate = feed.sparkline ? feed.sparkline[feed.sparkline.length - 1] || 0 : 0;
    const avg = feed.sparkline ? feed.sparkline.reduce((a, b) => a + b, 0) / (feed.sparkline.length || 1) : 0;

    switch (feed.id) {
      case 'earthquake':
        if (feed.entries > 30) return { text: `${feed.entries} EVENTS — ELEVATED`, color: 'var(--signal-offline)' };
        if (feed.entries > 15) return { text: `${feed.entries} EVENTS — ACTIVE`, color: 'var(--signal-stale)' };
        return { text: `${feed.entries} events — normal`, color: 'var(--signal-live)' };

      case 'solar':
        if (rate > avg * 3) return { text: 'MAJOR ACTIVITY', color: 'var(--signal-offline)' };
        if (rate > avg * 2) return { text: 'ELEVATED ACTIVITY', color: 'var(--signal-stale)' };
        return { text: 'NOMINAL', color: 'var(--signal-live)' };

      case 'geomag':
        if (rate > avg * 3) return { text: 'GEOMAGNETIC STORM', color: 'var(--signal-offline)' };
        if (rate > avg * 2) return { text: 'STORM CONDITIONS', color: 'var(--signal-stale)' };
        if (rate > avg * 1.3) return { text: 'ACTIVE', color: 'var(--signal-yellow)' };
        return { text: 'QUIET', color: 'var(--signal-live)' };

      case 'nexrad':
        if (rate > avg * 2 && avg > 0) return { text: 'SEVERE WEATHER', color: 'var(--signal-offline)' };
        if (rate > 0) return { text: 'ACTIVE PRECIP', color: 'var(--signal-stale)' };
        return { text: 'CLEAR', color: 'var(--signal-live)' };

      case 'goes':
        return { text: 'IMAGING', color: 'var(--brass)' };

      case 'lightning':
      case 'blitzortung':
        if (feed.entries > 50) return { text: 'HIGH DENSITY', color: 'var(--signal-offline)' };
        if (feed.entries > 10) return { text: 'ACTIVE', color: 'var(--signal-stale)' };
        if (feed.entries > 0) return { text: 'SPARSE', color: 'var(--signal-yellow)' };
        return { text: 'CLEAR', color: 'var(--signal-live)' };

      case 'grid':
        if (rate > avg * 1.5 && avg > 0) return { text: 'DEMAND SURGE', color: 'var(--signal-stale)' };
        return { text: 'GRID STABLE', color: 'var(--signal-live)' };

      case 'surface':
        return { text: 'REPORTING', color: 'var(--brass)' };

      case 'ionosonde':
        if (rate > avg * 2) return { text: 'TEC ELEVATED', color: 'var(--signal-stale)' };
        return { text: 'NORMAL TEC', color: 'var(--signal-live)' };

      case 'schumann':
        if (rate > avg * 2) return { text: 'RESONANCE SPIKE', color: 'var(--signal-stale)' };
        return { text: 'BASELINE', color: 'var(--signal-live)' };

      case 'aircraft':
        return { text: `${feed.entries} TRACKED`, color: 'var(--brass)' };

      case 'notam':
        if (feed.entries > 20) return { text: 'HIGH ACTIVITY', color: 'var(--signal-stale)' };
        return { text: `${feed.entries} ACTIVE`, color: 'var(--signal-live)' };

      case 'celltower':
        return { text: 'MONITORING', color: 'var(--brass)' };

      case 'heater':
        if (feed.entries > 0) return { text: 'FACILITY ACTIVE', color: 'var(--signal-stale)' };
        return { text: 'NO ACTIVITY', color: 'var(--text-dim)' };

      case 'metals':
        if (rate > avg * 1.5 && avg > 0) return { text: 'ELEVATED TRACE', color: 'var(--signal-stale)' };
        return { text: 'BASELINE', color: 'var(--signal-live)' };

      case 'ecology':
        return { text: 'INDEXING', color: 'var(--brass)' };

      case 'deposition':
        return { text: 'SAMPLING', color: 'var(--brass)' };

      default:
        if (rate > avg * 1.5 && avg > 0) return { text: 'HIGH ACTIVITY', color: 'var(--signal-stale)' };
        if (rate === 0 && feed.status === 'live') return { text: 'COLLECTING', color: 'var(--text-dim)' };
        return { text: 'ACTIVE', color: 'var(--signal-live)' };
    }
  },

  // ── Draw Sparkline ───────────────────────────────────────────
  drawSparkline(canvasId, data, status) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data?.length) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const max = Math.max(...data, 1);
    const step = w / (data.length - 1 || 1);

    ctx.clearRect(0, 0, w, h);

    const color = status === 'live' ? '0, 255, 136' :
                  status === 'stale' ? '255, 149, 0' : '255, 59, 48';

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, `rgba(${color}, 0.15)`);
    gradient.addColorStop(1, `rgba(${color}, 0.01)`);

    ctx.beginPath();
    ctx.moveTo(0, h);
    data.forEach((v, i) => ctx.lineTo(i * step, h - (v / max) * (h - 3)));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 3);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = `rgba(${color}, 0.7)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // End dot
    if (data.length > 0) {
      const lastX = (data.length - 1) * step;
      const lastY = h - (data[data.length - 1] / max) * (h - 3);
      ctx.beginPath();
      ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${color})`;
      ctx.fill();
    }
  },

  // ── Feed detail chart (modal) ────────────────────────────────
  // Real measurement → labelled line chart with a value axis and units.
  // No measurement → "collection health": successful vs failed pulls per bin.
  _niceTicks(lo, hi, count = 4) {
    if (!(hi > lo)) { hi = lo + 1; }
    const raw = (hi - lo) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(st => st >= raw) || raw;
    const start = Math.floor(lo / step) * step, end = Math.ceil(hi / step) * step;
    const ticks = [];
    for (let v = start; v <= end + step / 2; v += step) ticks.push(+v.toFixed(10));
    return ticks;
  },

  _fmtVal(v) {
    if (v == null || !isFinite(v)) return '—';
    const av = Math.abs(v);
    if (av >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (av >= 1e4) return Math.round(v / 1e3) + 'k';
    if (av >= 1000) return Math.round(v).toLocaleString();
    if (av > 0 && av < 0.01) return v.toExponential(1);
    return String(Math.round(v * 10) / 10);
  },

  drawFeedChart(feed) {
    const canvas = document.getElementById('modal-sparkline');
    if (!canvas) return;
    const box = canvas.parentElement;
    const label = box.querySelector('.modal__sparkline-label');
    let stats = box.querySelector('.modal__chart-stats');
    if (!stats) { stats = document.createElement('div'); stats.className = 'modal__chart-stats'; box.appendChild(stats); }

    const m = feed.measure, hlt = feed.health;
    const dpr = window.devicePixelRatio || 1;
    const W = Math.max(240, box.clientWidth - 32), H = 170;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const padL = 46, padR = 10, padT = 10, padB = 22;
    const pw = W - padL - padR, ph = H - padT - padB;
    ctx.font = '9px "JetBrains Mono", monospace';

    const axis = (ticks, lo, hi, unitLabel) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.fillStyle = 'rgba(160,160,180,0.75)'; ctx.lineWidth = 1;
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ticks.forEach(t => {
        const y = padT + ph - ((t - lo) / (hi - lo)) * ph;
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
        ctx.fillText(this._fmtVal(t), padL - 6, y);
      });
      ctx.save(); ctx.translate(10, padT + ph / 2); ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(160,160,180,0.55)'; ctx.fillText(unitLabel, 0, 0); ctx.restore();
    };
    const timeAxis = (t0, t1, isDays) => {
      ctx.fillStyle = 'rgba(160,160,180,0.65)'; ctx.textBaseline = 'top';
      const n = 4;
      for (let i = 0; i <= n; i++) {
        const t = t0 + (t1 - t0) * (i / n);
        const x = padL + pw * (i / n);
        const d = new Date(t);
        const txt = isDays ? `${d.getUTCMonth() + 1}/${d.getUTCDate()}` : `${String(d.getUTCHours()).padStart(2, '0')}:00`;
        ctx.textAlign = i === 0 ? 'left' : i === n ? 'right' : 'center';
        ctx.fillText(txt, x, padT + ph + 6);
      }
    };

    if (m && m.points && m.points.length) {
      const pts = m.points;
      const vals = pts.map(p => p[1]).filter(v => v != null);
      let lo = m.scaleMin != null ? m.scaleMin : Math.min(0, ...vals);
      let hi = m.scaleMax != null ? m.scaleMax : Math.max(...vals, 1);
      if (m.scaleMin == null && Math.min(...vals) > 0 && Math.min(...vals) > hi * 0.5) lo = Math.min(...vals) * 0.9; // zoom in on narrow ranges (e.g. solar wind)
      const ticks = this._niceTicks(lo, hi);
      lo = ticks[0]; hi = ticks[ticks.length - 1];
      const winMs = m.window === '30d' ? 30 * 86400000 : m.window === '72h' ? 72 * 3600000 : 24 * 3600000;
      const t1 = Math.max(Date.now(), pts.length ? pts[pts.length - 1][0] : 0), t0 = t1 - winMs;
      const X = t => padL + (t1 > t0 ? ((t - t0) / (t1 - t0)) * pw : pw);
      const Y = v => padT + ph - ((v - lo) / (hi - lo)) * ph;
      axis(ticks, lo, hi, m.unit);
      timeAxis(t0, t1, m.res === '1d');

      const isCount = m.unit === 'quakes';
      if (isCount) {
        const bw = Math.max(2, pw / pts.length - 2);
        pts.forEach(p => { if (!p[1]) return; ctx.fillStyle = 'rgba(0,255,136,0.55)'; ctx.fillRect(X(p[0]) - bw / 2, Y(p[1]), bw, padT + ph - Y(p[1])); });
      } else {
        ctx.strokeStyle = 'rgba(0,255,136,0.9)'; ctx.lineWidth = 2; ctx.beginPath();
        let pen = false;
        pts.forEach(p => { if (p[1] == null) { pen = false; return; } const x = X(p[0]), y = Y(p[1]); pen ? ctx.lineTo(x, y) : ctx.moveTo(x, y); pen = true; });
        ctx.stroke();
        ctx.fillStyle = 'rgba(0,255,136,0.85)';
        pts.forEach(p => { if (p[1] == null) return; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 2, 0, Math.PI * 2); ctx.fill(); });
      }
      const span = m.window === '30d' ? 'LAST 30 DAYS' : m.window === '72h' ? 'LAST 72 HOURS' : 'LAST 24 HOURS';
      if (label) label.textContent = `${m.label.toUpperCase()} · ${span} (UTC)`;
      const extra = m.largest ? `<div><span>Largest</span>M${m.largest.mag.toFixed(1)}${m.largest.place ? ' · ' + m.largest.place : ''}</div>` : '';
      stats.innerHTML = `
        <div><span>Now</span>${this._fmtVal(m.current)} ${m.unit}</div>
        ${m.total != null ? `<div><span>24h total</span>${m.total} ${m.unit}</div>` : `<div><span>Low</span>${this._fmtVal(m.min)} ${m.unit}</div><div><span>High</span>${this._fmtVal(m.max)} ${m.unit}</div>`}
        ${extra}
        ${m.source ? `<div class="modal__chart-src"><span>Source</span>${m.source}</div>` : ''}`;
      return;
    }

    if (hlt) {
      const n = hlt.ok.length;
      const maxV = Math.max(1, ...hlt.ok.map((o, i) => o + hlt.gap[i]));
      const ticks = this._niceTicks(0, maxV);
      const hi = ticks[ticks.length - 1];
      axis(ticks, 0, hi, `pulls / ${hlt.binLabel}`);
      const now = Date.now(), size = hlt.binLabel === 'day' ? 86400000 : 3600000;
      timeAxis(now - n * size, now, hlt.binLabel === 'day');
      const bw = Math.max(2, pw / n - 2);
      for (let i = 0; i < n; i++) {
        const x = padL + (i + 0.5) * (pw / n) - bw / 2;
        const okH = (hlt.ok[i] / hi) * ph, gapH = (hlt.gap[i] / hi) * ph;
        ctx.fillStyle = 'rgba(0,255,136,0.55)'; ctx.fillRect(x, padT + ph - okH, bw, okH);
        ctx.fillStyle = 'rgba(255,149,0,0.75)'; ctx.fillRect(x, padT + ph - okH - gapH, bw, gapH);
      }
      if (label) label.textContent = `COLLECTION HEALTH · ${hlt.window === '14d' ? 'LAST 14 DAYS' : 'LAST 24 HOURS'} (UTC)`;
      const pct = hlt.okTotal + hlt.gapTotal ? Math.round((hlt.okTotal / (hlt.okTotal + hlt.gapTotal)) * 100) : 0;
      stats.innerHTML = `
        <div><span style="color:#00ff88;">Successful</span>${hlt.okTotal}</div>
        <div><span style="color:#ff9500;">Failed</span>${hlt.gapTotal}</div>
        <div><span>Success rate</span>${pct}%</div>
        <div class="modal__chart-src">This feed stores images or files, not a single number, so this chart shows whether the source is delivering, not a physical reading.</div>`;
      return;
    }
    if (label) label.textContent = 'NO DATA YET';
    stats.innerHTML = '';
  },

  // Back-compat for any older callers
  drawSparklineLarge() { if (this._currentModalFeed) this.drawFeedChart(this._currentModalFeed); },

  // ── Open Detail Modal ────────────────────────────────────────
  async openDetail(feed) {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('modal-overlay--open');

    const imgSrc = this.feedImages[feed.id] || 'assets/nexrad.jpg';
    document.getElementById('modal-icon').innerHTML = `<img src="${imgSrc}" class="modal__icon-img" alt="">`;
    const levelContent = (typeof Levels !== 'undefined') ? Levels.getFeedContent(feed.id) : null;
    const displayName = levelContent ? levelContent.name : feed.name;
    const currentLevel = (typeof Levels !== 'undefined') ? (Levels.get() || 'observer') : 'researcher';
    const domainLabel = (typeof Levels !== 'undefined') ? Levels.getDomainLabel(feed.domain) : feed.domain;

    document.getElementById('modal-title').textContent = displayName;

    const badge = document.getElementById('modal-badge');
    badge.textContent = feed.status.toUpperCase();
    badge.className = `modal__badge bento-tile__badge--${feed.status}`;

    const whyHtml = (levelContent && levelContent.why && currentLevel !== 'researcher')
      ? `<div class="meta-item" style="grid-column: 1 / -1"><div class="meta-item__label">WHY THIS MATTERS</div><div class="feed-card__why" style="margin-top:4px">${levelContent.why}</div></div>` : '';
    const taglineHtml = (levelContent && levelContent.tagline)
      ? `<div class="meta-item" style="grid-column: 1 / -1"><div class="meta-item__label">${currentLevel === 'observer' ? 'WHAT IS THIS' : 'DESCRIPTION'}</div><div class="meta-item__value" style="font-size: 0.7rem; font-weight: 400; line-height: 1.5">${levelContent.tagline}</div></div>` : '';

    const meta = document.getElementById('modal-meta');
    const ago = this.timeAgo(feed.last);
    const condition = this.getConditionText(feed);
    meta.innerHTML = `
      ${taglineHtml}
      <div class="meta-item">
        <div class="meta-item__label">STATUS</div>
        <div class="meta-item__value" style="color: var(--signal-${feed.status === 'live' ? 'live' : feed.status === 'stale' ? 'stale' : 'offline'})">${feed.status.toUpperCase()}</div>
      </div>
      <div class="meta-item">
        <div class="meta-item__label">${currentLevel === 'observer' ? 'READINGS' : 'OBSERVATIONS'}</div>
        <div class="meta-item__value">${feed.entries}</div>
      </div>
      <div class="meta-item">
        <div class="meta-item__label">LAST UPDATE</div>
        <div class="meta-item__value">${ago}</div>
      </div>
      <div class="meta-item">
        <div class="meta-item__label">${currentLevel === 'observer' ? 'CATEGORY' : 'DOMAIN'}</div>
        <div class="meta-item__value">${domainLabel}</div>
      </div>
      <div class="meta-item">
        <div class="meta-item__label">CONDITION</div>
        <div class="meta-item__value" style="color: ${condition?.color || 'var(--text-secondary)'}">${condition?.text || '—'}</div>
      </div>
      <div class="meta-item researcher-only">
        <div class="meta-item__label">FEED ID</div>
        <div class="meta-item__value" style="font-size: 0.7rem">${feed.id}</div>
      </div>
      ${whyHtml}
    `;

    // Store current feed for share button
    this._currentModalFeed = feed;
    this.drawFeedChart(feed);

    try {
      const res = await fetch(`/api/feed/${feed.id}?limit=50`);
      const data = await res.json();
      const list = document.getElementById('modal-entry-list');
      list.innerHTML = '';

      const entries = (data.recentEntries || []).slice(-15).reverse();
      for (const e of entries) {
        const time = e.retrievedAt || e.timestamp || e.fetchedAt || e.collected_at || '';
        const type = e.type || 'DATA';
        const detail = e.filename || e.source || e.product || e.satellite || JSON.stringify(e).slice(0, 80);
        const hash = e.sha256 ? e.sha256.slice(0, 12) + '…' : '';

        const row = document.createElement('div');
        row.className = 'entry-row';
        row.innerHTML = `
          <span class="entry-row__time">${time ? new Date(time).toISOString().slice(0, 19).replace('T', ' ') : '—'}</span>
          <span class="entry-row__type">${type}</span>
          <span class="entry-row__detail">${detail}</span>
          ${hash ? `<span class="entry-row__hash">${hash}</span>` : ''}
        `;
        list.appendChild(row);
      }

      if (entries.length === 0) {
        list.innerHTML = '<div class="entry-row"><span class="entry-row__detail">No recent observations</span></div>';
      }
    } catch (err) {
      document.getElementById('modal-entry-list').innerHTML =
        '<div class="entry-row"><span class="entry-row__detail" style="color:var(--signal-offline)">Failed to fetch entries</span></div>';
    }
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.remove('modal-overlay--open');
  },

  // ── Share Feature ───────────────────────────────────────────
  async shareFeed(feed) {
    const condition = this.getConditionText(feed);
    const url = `${window.location.origin}/feed/${feed.id}`;
    const text = `Truth Observatory — ${feed.name}\nStatus: ${feed.status.toUpperCase()}\nCondition: ${condition?.text || 'Active'}\n${this.timeAgo(feed.last)}\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `Observatory: ${feed.name}`, text, url });
      } catch (e) {
        if (e.name !== 'AbortError') this._copyToClipboard(text);
      }
    } else {
      this._copyToClipboard(text);
    }
  },

  _copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this._showToast('Copied to clipboard');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      this._showToast('Copied to clipboard');
    });
  },

  _showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--bg-raised);border:1px solid var(--signal-cyan);color:var(--signal-cyan);padding:8px 16px;font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.1em;z-index:9000;animation:fadeIn 0.2s ease';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  },

  // ── Render Correlations (legacy — now served via Event Ledger) ──
  renderCorrelations(data) {
    // Legacy correlation carousel removed. Data now flows through Event Ledger.
    // This method is kept as a no-op for backward compatibility with fetchAll.
    return;
  },

  // ── Map Overlays ─────────────────────────────────────────────
  async updateMapOverlays() {
    if (this.mapLayers.earthquakes) this.markers.earthquakes.forEach(m => this.mapLayers.earthquakes.removeLayer(m));
    this.markers.lightning.forEach(m => this.map.removeLayer(m));
    this.markers.earthquakes = [];
    this.markers.lightning = [];

    try {
      const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
      const data = await res.json();
      if (data?.features) {
        data.features.slice(0, 80).forEach(f => {
          const [lng, lat] = f.geometry.coordinates;
          const mag = f.properties.mag;
          const color = mag >= 5 ? '#ff3b30' : mag >= 4 ? '#ff9500' : mag >= 3 ? '#ffd60a' : '#06b6d4';
          const marker = L.circleMarker([lat, lng], {
            radius: Math.max(4, mag * 3),
            color: color, fillColor: color, fillOpacity: 0.35, weight: 1.5,
          });
          marker.bindPopup(`
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #e8e8f0; background: #0a0a0e; padding: 8px; border: 1px solid #2a2a38; border-radius: 2px; min-width: 180px; max-width: 250px; word-break: break-word;">
              <div style="color: ${color}; font-weight: 700; font-size: 14px; margin-bottom: 4px;">M${mag.toFixed(1)}</div>
              <div style="color: #8888a0; margin-bottom: 2px;">${f.properties.place}</div>
              <div style="color: #555568; font-size: 9px;">${new Date(f.properties.time).toISOString().slice(0, 19)} UTC</div>
            </div>
          `, { className: 'obs-popup', maxWidth: 260, autoPanPadding: [20, 20] });
          if (this.mapLayers.earthquakes) this.mapLayers.earthquakes.addLayer(marker);
          this.markers.earthquakes.push(marker);
        });
      }
      this._mirrorToFs('earthquakes');
    } catch {}

    this.updateLayerCount();
    this.updateDynamicLegend();
  },

  // ── Heater Markers ──────────────────────────────────────────
  async loadHeaterMarkers() {
    try {
      const res = await fetch('/api/geo/heaters');
      const data = await res.json();
      this.markers.heaters.forEach(m => this.mapLayers.heaters.removeLayer(m));
      this.markers.heaters = [];
      (data.heaters || []).forEach(h => {
        const color = h.status === 'decommissioned' ? '#666' : '#ff4ecf';
        const marker = L.circleMarker([h.lat, h.lon], {
          radius: 8, color: color, fillColor: color, fillOpacity: 0.3, weight: 2,
        });
        // Outer pulsing ring for active facilities (non-interactive so clicks pass through)
        if (h.status !== 'decommissioned') {
          const ring = L.circleMarker([h.lat, h.lon], {
            radius: 16, color: '#ff4ecf', fillColor: 'transparent', fillOpacity: 0, weight: 1, opacity: 0.4,
            interactive: false,
          });
          this.mapLayers.heaters.addLayer(ring);
          this.markers.heaters.push(ring);
        }
        marker.bindPopup(`
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#e8e8f0;background:#0a0a0e;padding:10px;border:1px solid #ff4ecf33;border-radius:2px;min-width:180px;max-width:250px;word-break:break-word;">
            <div style="color:#ff4ecf;font-weight:700;font-size:13px;margin-bottom:4px;">⚡ ${h.name}</div>
            <div style="color:#aaa;margin-bottom:2px;">${h.location}</div>
            <div style="color:#888;font-size:9px;">Power: ${h.power}</div>
            <div style="color:#888;font-size:9px;">Freq: ${h.frequency}</div>
            <div style="color:#555;font-size:9px;margin-top:4px;">${h.status.toUpperCase()}</div>
          </div>
        `, { className: 'obs-popup', maxWidth: 260, autoPanPadding: [20, 20] });
        this.mapLayers.heaters.addLayer(marker);
        this.markers.heaters.push(marker);
      });
      this._mirrorToFs('heaters');
      this.updateLayerCount();
      this.updateDynamicLegend();
    } catch (e) { console.warn('[Observatory] Heater load failed:', e.message); }
  },

  // ── Aircraft Markers ────────────────────────────────────────
  // Canvas-drawn plane symbols (thousands of aircraft stay smooth).
  _planeClass() {
    if (this._PlaneMarker) return this._PlaneMarker;
    this._PlaneMarker = L.CircleMarker.extend({
      _updateBounds() {
        const r = this._radius, w = this._clickTolerance();
        const extra = (this.options.label ? 9 + this.options.label.length * 7 : 0);
        this._pxBounds = L.bounds(this._point.subtract([r + w, r + w]), this._point.add([r + w + extra, r + w]));
      },
      _updatePath() {
        const rd = this._renderer;
        if (!rd || !rd._drawing || this._empty()) return;
        const ctx = rd._ctx, p = this._point, o = this.options, s = o.size || 7;
        ctx.save();
        ctx.translate(p.x, p.y);
        if (o.ground) {
          ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = o.fillColor; ctx.fill();
        } else {
          ctx.rotate(((o.heading || 0) * Math.PI) / 180);
          ctx.beginPath();
          // airliner silhouette pointing north, scaled by s
          const pts = [[0,-1],[0.12,-0.72],[0.12,-0.25],[1,0.2],[1,0.36],[0.12,0.12],[0.1,0.62],[0.38,0.84],[0.38,0.96],[0,0.86]];
          ctx.moveTo(pts[0][0] * s, pts[0][1] * s);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] * s, pts[i][1] * s);
          for (let i = pts.length - 2; i > 0; i--) ctx.lineTo(-pts[i][0] * s, pts[i][1] * s);
          ctx.closePath();
          ctx.fillStyle = o.fillColor; ctx.fill();
          ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(0,0,0,0.65)'; ctx.stroke();
        }
        ctx.restore();
        if (o.label && this._map && this._map.getZoom() >= 7) {
          ctx.font = '600 10px "JetBrains Mono", monospace';
          ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.75)';
          ctx.strokeText(o.label, p.x + s + 4, p.y + 3);
          ctx.fillStyle = o.fillColor; ctx.fillText(o.label, p.x + s + 4, p.y + 3);
        }
      },
    });
    return this._PlaneMarker;
  },

  _aircraftColor(a) {
    if (a.emergency || ['7500', '7600', '7700'].includes(a.squawk)) return '#ff3b3b';
    if (a.mil) return '#ffb020';
    if (a.ground) return '#9aa0a8';
    const alt = a.alt || 0;
    if (alt < 5000) return '#7dffb2';
    if (alt < 20000) return '#4ecbff';
    if (alt < 30000) return '#7f8cff';
    return '#d08cff';
  },

  _compass(deg) {
    if (deg == null) return '';
    return ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(deg / 22.5) % 16];
  },

  _aircraftPopup(a, color) {
    const esc = v => String(v == null ? '' : v).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const alt = a.ground ? 'On the ground' : (a.alt != null ? `${a.alt.toLocaleString()} ft` : 'Unknown');
    const vr = a.vrate == null || Math.abs(a.vrate) < 150 ? 'Level' : (a.vrate > 0 ? `▲ Climbing ${a.vrate.toLocaleString()} ft/min` : `▼ Descending ${Math.abs(a.vrate).toLocaleString()} ft/min`);
    const spd = a.speed != null ? `${a.speed} kts (${Math.round(a.speed * 1.15078)} mph)` : 'Unknown';
    const hdg = a.heading != null ? `${a.heading}° ${this._compass(a.heading)}` : 'Unknown';
    const sq = a.squawk ? esc(a.squawk) + (a.emergency || ['7500','7600','7700'].includes(a.squawk) ? ' <span style="color:#ff3b3b;">EMERGENCY</span>' : '') : '—';
    const row = (k, v) => `<div style="display:flex;justify-content:space-between;gap:12px;"><span style="color:#777;">${k}</span><span style="color:#ddd;text-align:right;">${v}</span></div>`;
    return `
      <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#e8e8f0;background:#0a0a0e;padding:10px 12px;border:1px solid ${color}55;border-radius:2px;min-width:230px;line-height:1.7;">
        <div style="color:${color};font-weight:700;font-size:13px;">✈ ${esc(a.flight || a.reg || a.hex.toUpperCase())}${a.mil ? ' <span style="font-size:9px;color:#ffb020;">MILITARY</span>' : ''}</div>
        <div style="color:#aaa;">${esc(a.desc || a.type || 'Aircraft type unknown')}${a.op ? ' · ' + esc(a.op) : ''}</div>
        <div style="color:#666;font-size:9px;letter-spacing:0.08em;margin-bottom:6px;">${esc(this._acClassLabel(a.cls).toUpperCase())}</div>
        ${row('Altitude', alt)}
        ${row('Vertical', vr)}
        ${row('Ground speed', spd)}
        ${row('Heading', hdg)}
        ${row('Registration', esc(a.reg || '—'))}
        ${row('Type code', esc(a.type || '—'))}
        ${row('Squawk', sq)}
        ${row('ICAO hex', esc(a.hex.toUpperCase()))}
        ${row('Position age', a.seen != null ? a.seen + ' s' : '—')}
        <a href="https://globe.adsbexchange.com/?icao=${encodeURIComponent(a.hex)}" target="_blank" rel="noopener"
           style="display:block;margin-top:8px;color:${color};text-decoration:none;border-top:1px solid #222;padding-top:6px;">Track this flight live ↗</a>
      </div>`;
  },

  AIRCRAFT_CLASSES: [
    ['airline', 'Airlines'], ['cargo', 'Cargo'], ['business', 'Business jets'],
    ['private', 'Private & general aviation'], ['helicopter', 'Helicopters'],
    ['military', 'Military'], ['agricultural', 'Agricultural / sprayers'],
    ['glider', 'Gliders & balloons'], ['drone', 'Drones'], ['unknown', 'Unidentified'],
  ],

  _acFilter() {
    if (!this._acFilterState) {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem('obs-ac-filter') || 'null'); } catch {}
      this._acFilterState = {
        includeGround: false, // Default: hide grounded planes to remove airport globs
      };
      this.AIRCRAFT_CLASSES.forEach(([k]) => { this._acFilterState[k] = saved && k in saved ? !!saved[k] : true; });
      if (saved && 'includeGround' in saved) this._acFilterState.includeGround = !!saved.includeGround;
    }
    return this._acFilterState;
  },

  _acClassLabel(k) { const f = this.AIRCRAFT_CLASSES.find(c => c[0] === k); return f ? f[1] : 'Unidentified'; },

  // One Leaflet control per map; both stay in sync through _acFilterState.
  _ensureAircraftFilter(map, layerGroup) {
    if (!map || !layerGroup || layerGroup._filterCtl) return;
    const self = this;
    const Ctl = L.Control.extend({
      options: { position: 'topright' },
      onAdd() {
        const el = L.DomUtil.create('div', 'ac-filter');
        L.DomEvent.disableClickPropagation(el);
        L.DomEvent.disableScrollPropagation(el);
        if (map.getSize().x < 900) el.classList.add('ac-filter--collapsed');
        el.innerHTML = `
          <button class="ac-filter__head" type="button" aria-expanded="true">✈ AIRCRAFT TYPES <span class="ac-filter__total"></span><span class="ac-filter__caret">▾</span></button>
          <div class="ac-filter__body">
            <label class="ac-filter__row ac-filter__row--ground">
              <input type="checkbox" data-ac-ground>
              <span class="ac-filter__name">Include Ground Traffic</span>
              <span class="ac-filter__count" data-ac-count="ground">0</span>
            </label>
            <div class="ac-filter__divider"></div>
            ${self.AIRCRAFT_CLASSES.map(([k, label]) => `
              <label class="ac-filter__row"><input type="checkbox" data-ac-class="${k}">
                <span class="ac-filter__name">${label}</span><span class="ac-filter__count" data-ac-count="${k}">0</span></label>`).join('')}
            <div class="ac-filter__actions"><button type="button" data-ac-all="1">All</button><button type="button" data-ac-all="0">None</button></div>
            <div class="ac-filter__note">Grounded planes hidden by default to declutter airports. Check to include surface taxiway traffic.</div>
          </div>`;
        el.querySelector('.ac-filter__head').addEventListener('click', () => {
          el.classList.toggle('ac-filter--collapsed');
          el.querySelector('.ac-filter__head').setAttribute('aria-expanded', !el.classList.contains('ac-filter--collapsed'));
        });
        el.addEventListener('change', e => {
          if (e.target.dataset && e.target.dataset.acGround !== undefined) {
            self._acFilter().includeGround = e.target.checked;
            self._applyAircraftFilter();
            return;
          }
          const k = e.target.dataset && e.target.dataset.acClass;
          if (!k) return;
          self._acFilter()[k] = e.target.checked;
          self._applyAircraftFilter();
        });
        el.querySelectorAll('[data-ac-all]').forEach(b => b.addEventListener('click', () => {
          const on = b.dataset.acAll === '1';
          Object.keys(self._acFilter()).forEach(k => { self._acFilter()[k] = on; });
          self._applyAircraftFilter();
        }));
        return el;
      },
    });
    const ctl = new Ctl();
    layerGroup._filterCtl = ctl;
    layerGroup.on('add', () => { ctl.addTo(map); this._syncAircraftFilterUI(); });
    layerGroup.on('remove', () => ctl.remove());
    if (map.hasLayer(layerGroup)) { ctl.addTo(map); this._syncAircraftFilterUI(); }
  },

  _syncAircraftFilterUI() {
    const f = this._acFilter();
    const counts = {};
    let groundCount = 0;
    (this._acData || []).forEach(a => {
      if (a.ground) groundCount++;
      counts[a.cls || 'unknown'] = (counts[a.cls || 'unknown'] || 0) + 1;
    });
    let shown = 0;
    (this._acData || []).forEach(a => {
      const want = !!f[a.cls || 'unknown'] && (f.includeGround || !a.ground);
      if (want) shown++;
    });
    document.querySelectorAll('.ac-filter').forEach(el => {
      const gcb = el.querySelector('[data-ac-ground]');
      if (gcb) gcb.checked = !!f.includeGround;
      const gcnt = el.querySelector('[data-ac-count="ground"]');
      if (gcnt) gcnt.textContent = groundCount.toLocaleString();

      el.querySelectorAll('[data-ac-class]').forEach(cb => { cb.checked = !!f[cb.dataset.acClass]; });
      el.querySelectorAll('[data-ac-count]:not([data-ac-count="ground"])').forEach(c => { c.textContent = (counts[c.dataset.acCount] || 0).toLocaleString(); });
      el.querySelectorAll('[data-ac-class]').forEach(cb => cb.closest('label').classList.toggle('ac-filter__row--empty', !counts[cb.dataset.acClass]));
      const tot = el.querySelector('.ac-filter__total');
      if (tot) tot.textContent = `${shown.toLocaleString()} / ${(this._acData || []).length.toLocaleString()}`;
    });
  },

  _applyAircraftFilter() {
    try { localStorage.setItem('obs-ac-filter', JSON.stringify(this._acFilter())); } catch {}
    const f = this._acFilter();
    const group = this.mapLayers.aircraft;
    (this.markers.aircraft || []).forEach(m => {
      const want = !!f[m.options.cls || 'unknown'] && (f.includeGround || !m.options.ground);
      const has = group.hasLayer(m);
      if (want && !has) group.addLayer(m);
      else if (!want && has) group.removeLayer(m);
    });
    this._mirrorToFs('aircraft');
    this._syncAircraftFilterUI();
  },

  async loadAircraftMarkers() {
    try {
      const res = await fetch('/api/geo/aircraft');
      if (res.status === 401) { console.warn('[Observatory] Aircraft layer: not signed in as a subscriber'); return; }
      const data = await res.json();
      this.markers.aircraft.forEach(m => this.mapLayers.aircraft.removeLayer(m));
      this.markers.aircraft = [];
      this._acData = data.aircraft || [];
      const acFilter = this._acFilter();
      const Plane = this._planeClass();
      const renderer = this._aircraftRenderer || (this._aircraftRenderer = L.canvas({ padding: 0.3, tolerance: 3 }));
      (data.aircraft || []).forEach(a => {
        const color = this._aircraftColor(a);
        const urgent = color === '#ff3b3b';
        const marker = new Plane([a.lat, a.lon], {
          radius: urgent ? 10 : 7, size: urgent ? 10 : 7,
          heading: a.heading, ground: a.ground,
          color, fillColor: color, fillOpacity: 1, weight: 0,
          label: a.flight || a.reg || '',
          cls: a.cls || 'unknown',
          renderer,
        });
        marker.bindTooltip(() => {
          const alt = a.ground ? 'ground' : (a.alt != null ? a.alt.toLocaleString() + ' ft' : '—');
          return `<b>${a.flight || a.reg || a.hex.toUpperCase()}</b> · ${alt} · ${a.speed != null ? a.speed + ' kts' : '—'} · ${a.heading != null ? this._compass(a.heading) : ''}`;
        }, { direction: 'top', offset: [0, -6], className: 'aircraft-tip' });
        marker.bindPopup(() => this._aircraftPopup(a, color), { className: 'obs-popup', maxWidth: 300, autoPanPadding: [20, 20] });
        const want = !!acFilter[a.cls || 'unknown'] && (acFilter.includeGround || !a.ground);
        if (want) this.mapLayers.aircraft.addLayer(marker);
        this.markers.aircraft.push(marker);
      });
      if (data.count > 0) console.log(`[Observatory] Plotted ${data.count} aircraft (${data.source || 'ADS-B'})`);
      this._ensureAircraftFilter(this.map, this.mapLayers.aircraft);
      this._mirrorToFs('aircraft');
      this._syncAircraftFilterUI();
      this.updateLayerCount();
      this.updateDynamicLegend();
    } catch (e) { console.warn('[Observatory] Aircraft load failed:', e.message); }
  },

  // ── Wildfire Markers ────────────────────────────────────────
  async loadWildfireMarkers() {
    try {
      const res = await fetch('/api/geo/wildfires');
      const data = await res.json();
      this.markers.wildfires.forEach(m => this.mapLayers.wildfires.removeLayer(m));
      this.markers.wildfires = [];
      (data.fires || []).forEach(f => {
        if (!f.lat || !f.lon) return;
        const acres = f.acres || 0;
        const color = acres > 10000 ? '#ff5722' : acres > 1000 ? '#ff9800' : '#ffc107';
        const radius = Math.min(12, Math.max(4, Math.log10(acres + 1) * 3));
        const marker = L.circleMarker([f.lat, f.lon], {
          radius, color, fillColor: color, fillOpacity: 0.35, weight: 2,
        });
        marker.bindPopup(`
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#e8e8f0;background:#0a0a0e;padding:10px;border:1px solid #ff572233;border-radius:2px;min-width:180px;max-width:250px;word-break:break-word;">
            <div style="color:#ff5722;font-weight:700;font-size:13px;margin-bottom:4px;">🔥 ${f.name}</div>
            <div style="color:#aaa;margin-bottom:2px;">${f.state || 'Unknown location'}</div>
            <div style="color:#888;font-size:9px;">Acres: ${acres.toLocaleString()}</div>
            <div style="color:#888;font-size:9px;">Contained: ${f.contained != null ? f.contained + '%' : 'N/A'}</div>
            <div style="color:#888;font-size:9px;">Cause: ${f.cause || 'Under Investigation'}</div>
            ${f.personnel ? '<div style="color:#555;font-size:9px;">Personnel: ' + f.personnel.toLocaleString() + '</div>' : ''}
            ${f.residences_destroyed ? '<div style="color:#f44;font-size:9px;">Residences Destroyed: ' + f.residences_destroyed + '</div>' : ''}
          </div>
        `, { className: 'obs-popup', maxWidth: 260, autoPanPadding: [20, 20] });
        this.mapLayers.wildfires.addLayer(marker);
        this.markers.wildfires.push(marker);
      });
      if (data.count > 0) console.log(`[Observatory] Plotted ${data.count} wildfires`);
      this._mirrorToFs('wildfires');
      this.updateLayerCount();
      this.updateDynamicLegend();
    } catch (e) { console.warn('[Observatory] Wildfire load failed:', e.message); }
  },

  // ── Lightning flashes (GOES GLM, last 15 min) ───────────────
  async loadLightningMarkers() {
    try {
      const res = await fetch('/api/geo/lightning');
      const data = await res.json();
      this.markers.glm.forEach(m => this.mapLayers.glm.removeLayer(m));
      this.markers.glm = [];
      const renderer = this._glmRenderer || (this._glmRenderer = L.canvas({ padding: 0.3 }));
      // Oldest first so the newest flashes paint on top
      const list = (data.flashes || []).slice().sort((a, b) => b[0] - a[0]);
      list.forEach(([age, lat, lon]) => {
        const fill = age < 300 ? '#fff200' : age < 600 ? '#ffa500' : '#ff5a36';
        const m = L.circleMarker([lat, lon], {
          radius: age < 300 ? 3 : 2.4, color: 'rgba(20,12,0,0.6)', weight: 0.6,
          fillColor: fill, fillOpacity: age < 300 ? 1 : 0.8, interactive: false, renderer,
        });
        this.mapLayers.glm.addLayer(m);
        this.markers.glm.push(m);
      });
      this._glmInfo = { count: data.count || 0, updatedAt: data.updatedAt || null };
      if (data.count > 0) console.log(`[Observatory] Plotted ${data.count} lightning flashes (last ${data.windowMinutes || 15} min)`);
      this._mirrorToFs('glm');
      this.updateLayerCount();
      this.updateDynamicLegend();
    } catch (e) { console.warn('[Observatory] Lightning load failed:', e.message); }
  },

  // ── Volcano Markers ─────────────────────────────────────────
  async loadVolcanoMarkers() {
    try {
      const res = await fetch('/api/geo/volcanoes');
      const data = await res.json();
      this.markers.volcanoes.forEach(m => this.mapLayers.volcanoes.removeLayer(m));
      this.markers.volcanoes = [];
      (data.volcanoes || []).forEach(v => {
        if (!v.lat || !v.lon) return;
        const colorMap = { WARNING: '#f44336', WATCH: '#ff9800', ADVISORY: '#ffeb3b' };
        const color = colorMap[v.alertLevel] || '#e040fb';
        const marker = L.circleMarker([v.lat, v.lon], {
          radius: 9, color, fillColor: color, fillOpacity: 0.35, weight: 2,
        });
        // Triangle-like outer marker for visibility (non-interactive so clicks pass to marker)
        const ring = L.circleMarker([v.lat, v.lon], {
          radius: 16, color, fillColor: 'transparent', fillOpacity: 0, weight: 1, opacity: 0.5,
          interactive: false,
        });
        marker.bindPopup(`
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#e8e8f0;background:#0a0a0e;padding:10px;border:1px solid ${color}33;border-radius:2px;min-width:180px;max-width:250px;word-break:break-word;line-height:1.4;">
            <div style="color:${color};font-weight:700;font-size:13px;margin-bottom:4px;">🌋 ${v.name}</div>
            <div style="color:#aaa;margin-bottom:2px;">${v.region || ''}</div>
            <div style="color:#888;font-size:9px;">Alert: ${v.alertLevel} / ${v.colorCode}</div>
            <div style="color:#888;font-size:9px;">Threat: ${v.threatLevel || 'Unknown'}</div>
            ${v.synopsis ? '<div style="color:#aaa;font-size:9px;margin-top:4px;border-top:1px solid #333;padding-top:4px;line-height:1.35;">' + v.synopsis + '</div>' : ''}
          </div>
        `, { className: 'obs-popup', maxWidth: 260, autoPanPadding: [20, 20] });
        this.mapLayers.volcanoes.addLayer(ring);
        this.mapLayers.volcanoes.addLayer(marker);
        this.markers.volcanoes.push(ring);
        this.markers.volcanoes.push(marker);
      });
      if (data.count > 0) console.log(`[Observatory] Plotted ${data.count} elevated volcanoes (${data.total} monitored)`);
      this._mirrorToFs('volcanoes');
      this.updateLayerCount();
      this.updateDynamicLegend();
    } catch (e) { console.warn('[Observatory] Volcano load failed:', e.message); }
  },

  // ── Bind Events ──────────────────────────────────────────────
  bindEvents() {
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-back').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });

    // Modal share button
    document.getElementById('modal-share').addEventListener('click', () => {
      if (this._currentModalFeed) this.shareFeed(this._currentModalFeed);
    });

    // Legend info modal close
    document.getElementById('legend-info-close').addEventListener('click', () => {
      document.getElementById('legend-info-overlay').classList.remove('legend-info-overlay--open');
    });
    document.getElementById('legend-info-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById('legend-info-overlay').classList.remove('legend-info-overlay--open');
      }
    });

    // Map layer toggles
    document.getElementById('layer-toggles').addEventListener('change', (e) => {
      const cb = e.target;
      const layerName = cb.dataset.layer;
      if (!layerName || !this.mapLayers[layerName]) return;
      if (cb.checked) {
        this.mapLayers[layerName].addTo(this.map);
      } else {
        this.map.removeLayer(this.mapLayers[layerName]);
      }
      this.updateLayerCount();
      this.updateDynamicLegend();
      this.checkLayerDensity();
    });

    // Map style toggle (light/dark)
    document.getElementById('map-style-toggle').addEventListener('click', () => {
      this.toggleMapStyle();
    });

    // Desktop map expand → fullscreen
    document.getElementById('map-expand').addEventListener('click', () => {
      this.openFullscreenMap();
    });

    // Fullscreen map style toggle
    document.getElementById('fullscreen-style-toggle').addEventListener('click', () => {
      this.toggleFullscreenMapStyle();
    });

    // Summary card → bottom nav shortcuts
    document.querySelectorAll('.summary-card[data-goto]').forEach(card => {
      card.addEventListener('click', () => {
        const view = card.dataset.goto;
        const btn = document.querySelector(`.bottomnav__btn[data-view="${view}"]`);
        if (btn) btn.click();
      });
    });

    // ── Cockpit resize handle (drag to resize map/ledger split) ──
    const resizeHandle = document.getElementById('cockpit-resize-handle');
    if (resizeHandle) {
      let dragging = false;
      let startY = 0;
      let startTopHeight = 0;
      const cockpit = document.querySelector('.cockpit');

      const onStart = (e) => {
        dragging = true;
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        startTopHeight = cockpit.querySelector('.cockpit__map').getBoundingClientRect().height;
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      };

      const onMove = (e) => {
        if (!dragging) return;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const delta = clientY - startY;
        const cockpitRect = cockpit.getBoundingClientRect();
        const newTopHeight = startTopHeight + delta;
        const minTop = 120;
        const maxTop = Math.max(minTop, window.innerHeight * 1.5);
        const clamped = Math.max(minTop, Math.min(maxTop, newTopHeight));
        cockpit.style.gridTemplateRows = `${clamped}px auto minmax(360px, auto)`;
        // Invalidate map size so tiles render correctly
        if (this.map) this.map.invalidateSize();
      };

      const onEnd = () => {
        if (!dragging) return;
        dragging = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        if (this.map) this.map.invalidateSize();
      };

      resizeHandle.addEventListener('mousedown', onStart);
      resizeHandle.addEventListener('touchstart', onStart, { passive: false });
      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-map');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('refresh-btn--spin');
        this.updateMapOverlays();
        this.fetchAll().then(() => {
          setTimeout(() => refreshBtn.classList.remove('refresh-btn--spin'), 800);
        });
      });
    }

    // LAYERS button — toggles layer panel visibility
    const layersBtn = document.getElementById('layers-btn');
    const layerToggles = document.getElementById('layer-toggles');
    if (layersBtn && layerToggles) {
      layersBtn.addEventListener('click', () => {
        layerToggles.classList.toggle('layer-toggles--collapsed');
        layersBtn.classList.toggle('layers-btn--active');
        // Invalidate map size after panel toggle animation
        setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 350);
      });
    }

    // Bottom nav — view switching
    document.querySelectorAll('.bottomnav__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bottomnav__btn').forEach(b => b.classList.remove('bottomnav__btn--active'));
        btn.classList.add('bottomnav__btn--active');
        const view = btn.dataset.view;
        const cockpit = document.getElementById('cockpit');

        // Reset inline grid override from drag handle
        cockpit.style.gridTemplateRows = '';
        cockpit.dataset.view = view;

        // Resize map if switching to map view
        if (view === 'map' || view === 'cockpit') {
          setTimeout(() => this.map.invalidateSize(), 100);
        }
        // Auto-open fullscreen map on mobile when Map tab selected
        if (view === 'map' && window.innerWidth < 769) {
          setTimeout(() => this.openFullscreenMap(), 150);
        }
        // Resize AtmosCore ring if switching to atmoscore view
        if (view === 'atmoscore') {
          setTimeout(() => {
            AtmosCoreViz.resize();
            AtmosCoreViz.update(AtmosCore);
            if (typeof this.updateAtmosCoreUI === 'function') this.updateAtmosCoreUI();
          }, 100);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeFullscreenMap();
        document.getElementById('legend-info-overlay').classList.remove('legend-info-overlay--open');
        document.getElementById('stat-tooltip').classList.remove('stat-tooltip--open');
      }
    });
  },

  timeAgo(isoStr) {
    if (!isoStr) return '—';
    const ms = Date.now() - new Date(isoStr).getTime();
    if (ms < 60000) return `${Math.floor(ms / 1000)}s ago`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
    if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
    return `${Math.floor(ms / 86400000)}d ago`;
  },

  // ═══════════════════════════════════════════════════════════════
  // STAT INFO TOOLTIPS — explain every number in the topbar
  // ═══════════════════════════════════════════════════════════════
  statInfoContent: {
    'stat-feeds': {
      title: 'LIVE FEEDS',
      body: `<strong>What this shows:</strong> The number of data feeds currently receiving fresh data, out of 20 total feeds monitored.<br><br>
<strong>LIVE</strong> = received data within expected interval.<br>
<strong>STALE</strong> = data is older than 3× the expected refresh interval.<br>
<strong>OFFLINE</strong> = no data received.<br><br>
Feeds include NEXRAD radar, GOES satellite, solar/SWPC, USGS seismic, lightning, power grid, geomagnetic, ionospheric, Schumann resonance, surface stations, ADS-B aircraft, FAA flight restrictions, cell towers, and more.`,
    },
    'stat-atmoscore': {
      title: 'ATMOSCORE 4/42',
      body: `<strong>What this shows:</strong> The composite atmospheric state score computed by the AtmosCore 4/42 Deterministic Flow Organism.<br><br>
AtmosCore combines 4 physical primitives — <strong>Thermodynamic</strong>, <strong>Optical Propagation</strong>, <strong>Dynamic Stability</strong>, and <strong>Temporal Coherence</strong> — into a single-number assessment of current atmospheric conditions.<br><br>
Score ranges from <strong>0.00</strong> (all feeds offline) to <strong>1.00</strong> (optimal observation conditions). The score updates every 60 seconds from live feed data.`,
    },
    'stat-suitability': {
      title: 'OBSERVATION SUITABILITY',
      body: `<strong>What this shows:</strong> Whether current conditions are suitable for reliable atmospheric observation and data collection.<br><br>
<strong>OPTIMAL</strong> = all primitives favorable, high confidence in data quality.<br>
<strong>ADVISORY</strong> = some conditions degraded, observations possible but less reliable.<br>
<strong>CAUTION</strong> = significant atmospheric disruption detected, use data with awareness.<br>
<strong>CRITICAL</strong> = hard constraint triggered (e.g. geomagnetic storm, extreme convection). Data may be unreliable.<br><br>
This is NOT a weather forecast. It indicates how trustworthy the current sensor data is.`,
    },
    'stat-pulse': {
      title: 'CONNECTION STATUS',
      body: `<strong>What this shows:</strong> The green pulsing dot indicates Observatory is actively connected to its data feeds and refreshing every 60 seconds.<br><br>
If this dot turns <strong>red</strong> or stops pulsing, the connection to the data server may be interrupted.`,
    },
  },

  initStatTooltips() {
    const tooltip = document.getElementById('stat-tooltip');
    const title = document.getElementById('stat-tooltip-title');
    const body = document.getElementById('stat-tooltip-body');
    const closeBtn = document.getElementById('stat-tooltip-close');

    document.querySelectorAll('[data-info]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const key = el.dataset.info;
        const info = this.statInfoContent[key];
        if (!info) return;
        title.textContent = info.title;
        body.innerHTML = info.body;
        tooltip.classList.add('stat-tooltip--open');
      });
    });

    closeBtn.addEventListener('click', () => tooltip.classList.remove('stat-tooltip--open'));
    document.addEventListener('click', (e) => {
      if (!tooltip.contains(e.target) && !e.target.closest('[data-info]')) {
        tooltip.classList.remove('stat-tooltip--open');
      }
    });
  },

  // ═══════════════════════════════════════════════════════════════
  // MOBILE MAP PREVIEW — compact visual-only map at top of page
  // ═══════════════════════════════════════════════════════════════
  previewMap: null,

  initMobileMapPreview() {
    const container = document.getElementById('map-preview-container');
    const preview = document.getElementById('map-preview');
    if (!container || !preview) return;

    // Only init on mobile
    if (window.innerWidth > 768) return;

    const savedLoc = this._getSavedLocation();
    const center = savedLoc ? [savedLoc.lat, savedLoc.lng] : [39.0, -95.0];
    const zoom = savedLoc ? 8 : 4;

    this.previewMap = L.map(container, {
      center, zoom,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
      worldCopyJump: false,
    });
    this._lockWorld(this.previewMap);

    L.tileLayer(this.mapTiles.dark, this.mapTileOpts.dark).addTo(this.previewMap);

    // State/country boundaries on preview map
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, noWrap: true, opacity: 0.9,
    }).addTo(this.previewMap);

    // Add radar overlay to preview
    this.previewRadar = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8, noWrap: true,
    }).addTo(this.previewMap);

    // Floating layers button on preview
    const layersBtn = document.createElement('button');
    layersBtn.className = 'map-preview__layers-btn';
    layersBtn.innerHTML = '⚙ LAYERS';
    layersBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openFullscreenMap();
    });
    preview.appendChild(layersBtn);

    // Tap to open fullscreen
    preview.addEventListener('click', () => this.openFullscreenMap());
  },

  // ═══════════════════════════════════════════════════════════════
  // FULLSCREEN MAP — interactive with animation loop
  // ═══════════════════════════════════════════════════════════════
  fullscreenMap: null,
  fsBaseLayer: null,
  fsMapStyle: 'light',
  fsMapLayers: {},
  animFrames: [],
  animLayers: [],
  animNexradLayers: [],
  animTimestamps: [],
  animIndex: 0,
  animInterval: null,
  animActive: false,

  openFullscreenMap() {
    const overlay = document.getElementById('map-fullscreen');
    overlay.classList.add('map-fullscreen--open');

    if (!this.fullscreenMap) {
      this._initFullscreenMap();
    } else {
      this.fullscreenMap.invalidateSize();
    }
    this._syncLayersToFullscreen();

    // Try to lock landscape
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) {}
  },

  closeFullscreenMap() {
    this._syncLayersFromFullscreen();
    document.getElementById('map-fullscreen').classList.remove('map-fullscreen--open');
    this.stopAnimation();

    // Unlock orientation
    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } catch (e) {}
  },

  _initFullscreenMap() {
    const container = document.getElementById('map-fullscreen-container');
    const savedLoc = this._getSavedLocation();
    const center = savedLoc ? [savedLoc.lat, savedLoc.lng] : [39.0, -95.0];
    const zoom = savedLoc ? 7 : 4;

    this.fullscreenMap = L.map(container, {
      center, zoom,
      preferCanvas: true,
      zoomControl: false,
      worldCopyJump: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(this.fullscreenMap);
    this._lockWorld(this.fullscreenMap);
    this._setupPopupClamping(this.fullscreenMap);

    this.fsBaseLayer = L.tileLayer(this.mapTiles[this.fsMapStyle],
      this.mapTileOpts[this.fsMapStyle]
    ).addTo(this.fullscreenMap);

    // State/country boundaries overlay for fullscreen map
    this.fsBoundaryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19, noWrap: true, opacity: 0.9, pane: 'overlayPane',
    }).addTo(this.fullscreenMap);

    // Build FS layers
    this.fsMapLayers.radar = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8, noWrap: true,
    });
    this.fsMapLayers.satellite = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-vis-1km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8, noWrap: true,
    });
    this.fsMapLayers.infrared = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-ir-4km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8, noWrap: true,
    });
    this.fsMapLayers.watervapor = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-wv-4km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8, noWrap: true,
    });
    this.fsMapLayers.precip = L.tileLayer('', { opacity: 0.5, maxZoom: 18, noWrap: true });
    this.fsMapLayers.fire = this._firmsLayer();

    // Marker layers mirror the main map's data
    ['heaters', 'aircraft', 'wildfires', 'volcanoes', 'glm', 'earthquakes'].forEach(k => {
      this.fsMapLayers[k] = L.layerGroup();
      this._mirrorToFs(k);
    });
    this._ensureAircraftFilter(this.fullscreenMap, this.fsMapLayers.aircraft);

    // Add whatever is checked in the toolbar (radar + research transmitters by default)
    document.querySelectorAll('[data-fslayer]').forEach(cb => {
      const layer = this.fsMapLayers[cb.dataset.fslayer];
      if (cb.checked && layer) layer.addTo(this.fullscreenMap);
    });

    // Wire FS layer toggles
    document.querySelectorAll('[data-fslayer]').forEach(cb => {
      cb.addEventListener('change', () => {
        const layer = this.fsMapLayers[cb.dataset.fslayer];
        if (!layer) return;
        if (cb.checked) layer.addTo(this.fullscreenMap);
        else this.fullscreenMap.removeLayer(layer);
        this.updateDynamicLegend();
      });
    });

    // Sync active layers from the main cockpit map
    this._syncLayersToFullscreen();

    // Close button
    document.getElementById('map-fullscreen-close').addEventListener('click', () => this.closeFullscreenMap());

    // Animation toggle
    document.getElementById('anim-toggle').addEventListener('click', () => {
      if (this.animActive) this.stopAnimation();
      else this.startAnimation();
    });

    // Load RainViewer frames for animation
    this._loadAnimationFrames();

    setTimeout(() => this.fullscreenMap.invalidateSize(), 200);
  },

  // ── Sync layers between Main Map and Fullscreen Map ──────────
  _syncLayersToFullscreen() {
    if (!this.fullscreenMap || !this.fsMapLayers || !this.map) return;
    const keys = ['radar', 'satellite', 'infrared', 'watervapor', 'precip', 'fire', 'heaters', 'aircraft', 'glm', 'wildfires', 'volcanoes', 'earthquakes'];
    keys.forEach(k => {
      const isMainActive = this.mapLayers[k] && this.map.hasLayer(this.mapLayers[k]);
      const cb = document.querySelector(`input[data-fslayer="${k}"]`);
      if (cb) cb.checked = !!isMainActive;
      const fsLayer = this.fsMapLayers[k];
      if (fsLayer) {
        if (isMainActive && !this.fullscreenMap.hasLayer(fsLayer)) {
          fsLayer.addTo(this.fullscreenMap);
        } else if (!isMainActive && this.fullscreenMap.hasLayer(fsLayer)) {
          this.fullscreenMap.removeLayer(fsLayer);
        }
      }
    });
    this.updateDynamicLegend();
  },

  _syncLayersFromFullscreen() {
    if (!this.fullscreenMap || !this.fsMapLayers || !this.map) return;
    const keys = ['radar', 'satellite', 'infrared', 'watervapor', 'precip', 'fire', 'heaters', 'aircraft', 'glm', 'wildfires', 'volcanoes', 'earthquakes'];
    keys.forEach(k => {
      const fsLayer = this.fsMapLayers[k];
      const isFsActive = (fsLayer && this.fullscreenMap.hasLayer(fsLayer)) ||
                         (document.querySelector(`input[data-fslayer="${k}"]`)?.checked);
      const cb = document.querySelector(`input[data-layer="${k}"]`);
      if (cb) cb.checked = !!isFsActive;
      const mainLayer = this.mapLayers[k];
      if (mainLayer) {
        if (isFsActive && !this.map.hasLayer(mainLayer)) {
          mainLayer.addTo(this.map);
        } else if (!isFsActive && this.map.hasLayer(mainLayer)) {
          this.map.removeLayer(mainLayer);
        }
      }
    });
    this.updateLayerCount();
    this.updateDynamicLegend();
  },

  // ── Toggle Fullscreen Map Style ──────────────────────────────
  toggleFullscreenMapStyle() {
    if (!this.fullscreenMap) return;
    this.fsMapStyle = this.fsMapStyle === 'light' ? 'dark' : 'light';
    this.fullscreenMap.removeLayer(this.fsBaseLayer);
    this.fsBaseLayer = L.tileLayer(this.mapTiles[this.fsMapStyle],
      this.mapTileOpts[this.fsMapStyle]
    ).addTo(this.fullscreenMap);
    this.fsBaseLayer.bringToBack();
    const btn = document.getElementById('fullscreen-style-toggle');
    btn.textContent = this.fsMapStyle === 'light' ? '☀ LIGHT' : '🌙 DARK';
  },

  async _loadAnimationFrames() {
    try {
      // ── Generate shared timeline: 24 frames at 5-min intervals (2 hours) ──
      const now = new Date();
      const frameCount = 24;
      const intervalMs = 5 * 60 * 1000; // 5 minutes
      this.animTimestamps = [];
      for (let i = frameCount - 1; i >= 0; i--) {
        const t = new Date(now.getTime() - i * intervalMs);
        // Round down to nearest 5 min
        t.setMinutes(Math.floor(t.getMinutes() / 5) * 5, 0, 0);
        this.animTimestamps.push(t);
      }

      // ── RainViewer frames (precip) ──
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await res.json();
      this.animFrames = data.radar.past.map(f => ({
        path: f.path,
        time: new Date(f.time * 1000),
        url: `https://tilecache.rainviewer.com${f.path}/512/{z}/{x}/{y}/2/1_1.png`,
      }));

      // Also update the precip layer for FS map
      if (this.animFrames.length > 0) {
        const latest = this.animFrames[this.animFrames.length - 1];
        const wasOn = this.fullscreenMap && this.fullscreenMap.hasLayer(this.fsMapLayers.precip);
        if (wasOn) this.fullscreenMap.removeLayer(this.fsMapLayers.precip);
        this.fsMapLayers.precip = L.tileLayer(latest.url, { opacity: 0.5, maxZoom: 18, noWrap: true });
        if (wasOn) this.fsMapLayers.precip.addTo(this.fullscreenMap);
      }

      // ── Build animation dots (use RainViewer frame count as reference) ──
      const track = document.getElementById('anim-track');
      track.innerHTML = '';
      this.animFrames.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'anim-bar__dot' + (i === this.animFrames.length - 1 ? ' anim-bar__dot--active' : '');
        track.appendChild(dot);
      });
    } catch (e) {
      console.warn('[Observatory] Animation frame load failed:', e.message);
    }
  },

  // ── Build a NEXRAD WMS-T layer for a given timestamp ──────────
  _nexradFrameForTime(timestamp) {
    const iso = timestamp.toISOString().replace('.000Z', 'Z');
    return L.tileLayer.wms('https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q-t.cgi', {
      layers: 'nexrad-n0q-wmst',
      format: 'image/png',
      transparent: true,
      opacity: 0.6,
      time: iso,
    });
  },

  // Preload every frame (all layers sit on the map at opacity 0), then flip
  // opacity between frames. No add/remove per tick → no blank flashes.
  startAnimation() {
    if (this.animFrames.length === 0 || !this.fullscreenMap) return;
    const map = this.fullscreenMap;
    this.animActive = true;
    this.animIndex = this.animFrames.length - 1;

    const btn = document.getElementById('anim-toggle');
    btn.classList.add('map-fullscreen__anim-btn--active');
    btn.textContent = '■ STOP';

    const hasRadar = map.hasLayer(this.fsMapLayers.radar);
    const hasPrecip = map.hasLayer(this.fsMapLayers.precip);
    // Animate what the user is looking at; if neither is on, animate radar.
    const doRadar = hasRadar || !hasPrecip;
    const doPrecip = hasPrecip;

    // Hide the static versions while the loop runs; restore them on stop.
    this._animRestore = [];
    if (hasRadar) { map.removeLayer(this.fsMapLayers.radar); this._animRestore.push(this.fsMapLayers.radar); }
    if (hasPrecip) { map.removeLayer(this.fsMapLayers.precip); this._animRestore.push(this.fsMapLayers.precip); }

    const mk = (layer) => { layer.setOpacity(0); layer.addTo(map); return layer; };
    this.animLayers = doPrecip ? this.animFrames.map(f => mk(L.tileLayer(f.url, { opacity: 0, maxZoom: 18, noWrap: true, keepBuffer: 4 }))) : [];
    this.animNexradLayers = doRadar ? this.animFrames.map(f => {
      const l = this._nexradFrameForTime(f.time);
      l.options.noWrap = true; l.options.keepBuffer = 4;
      return mk(l);
    }) : [];

    const all = [...this.animLayers, ...this.animNexradLayers];
    this.updateDynamicLegend();
    const label = document.getElementById('anim-label');
    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (label && this.animActive && !this.animInterval) label.textContent = `LOADING ${Math.min(loaded, all.length)}/${all.length}`;
    };
    all.forEach(l => l.once('load', onLoad));
    if (label) { label.textContent = `LOADING 0/${all.length}`; label.style.color = 'var(--brass)'; }

    const show = (i) => {
      const prev = this._animShown;
      if (this.animLayers[i]) this.animLayers[i].setOpacity(0.55);
      if (this.animNexradLayers[i]) this.animNexradLayers[i].setOpacity(0.6);
      if (prev != null && prev !== i) {
        if (this.animLayers[prev]) this.animLayers[prev].setOpacity(0);
        if (this.animNexradLayers[prev]) this.animNexradLayers[prev].setOpacity(0);
      }
      this._animShown = i;
      const frame = this.animFrames[i];
      const mins = Math.round((Date.now() - frame.time.getTime()) / 60000);
      const last = i === this.animFrames.length - 1;
      if (label) {
        label.textContent = last || mins <= 0 ? 'LIVE' : `-${mins}m`;
        label.style.color = last ? 'var(--signal-live)' : 'var(--brass)';
      }
      document.querySelectorAll('.anim-bar__dot').forEach((d, k) => d.classList.toggle('anim-bar__dot--active', k === i));
    };

    this._animShown = null;
    show(this.animIndex);

    // Start cycling when every frame has loaded (or after 10 s, whichever first)
    const begin = () => {
      if (!this.animActive || this.animInterval) return;
      clearTimeout(this._animWait);
      let hold = 0;
      this.animIndex = 0;
      show(0);
      this.animInterval = setInterval(() => {
        // linger on the live frame so the loop reads clearly
        if (this.animIndex === this.animFrames.length - 1 && hold < 2) { hold++; return; }
        hold = 0;
        this.animIndex = (this.animIndex + 1) % this.animFrames.length;
        show(this.animIndex);
      }, 650);
    };
    this._animWait = setTimeout(begin, 10000);
    const check = setInterval(() => {
      if (!this.animActive) return clearInterval(check);
      if (loaded >= all.length) { clearInterval(check); begin(); }
    }, 200);
  },

  stopAnimation() {
    this.animActive = false;
    clearInterval(this.animInterval);
    this.animInterval = null;
    clearTimeout(this._animWait);
    this._animShown = null;

    const btn = document.getElementById('anim-toggle');
    if (btn) {
      btn.classList.remove('map-fullscreen__anim-btn--active');
      btn.textContent = '▶ LOOP';
    }

    // Remove all precip anim layers
    this.animLayers.forEach(l => {
      if (this.fullscreenMap && this.fullscreenMap.hasLayer(l)) {
        this.fullscreenMap.removeLayer(l);
      }
    });
    this.animLayers = [];

    // Remove all NEXRAD anim layers
    if (this.animNexradLayers) {
      this.animNexradLayers.forEach(l => {
        if (this.fullscreenMap && this.fullscreenMap.hasLayer(l)) {
          this.fullscreenMap.removeLayer(l);
        }
      });
      this.animNexradLayers = [];
    }

    // Restore the static layers that were visible before the loop started
    (this._animRestore || []).forEach(l => {
      if (this.fullscreenMap && !this.fullscreenMap.hasLayer(l)) l.addTo(this.fullscreenMap);
    });
    this._animRestore = [];
    this.updateDynamicLegend();

    // Reset label
    const label = document.getElementById('anim-label');
    if (label) { label.textContent = 'LIVE'; label.style.color = 'var(--signal-live)'; }

    // Reset dots
    const dots = document.querySelectorAll('.anim-bar__dot');
    dots.forEach((d, i) => d.classList.toggle('anim-bar__dot--active', i === dots.length - 1));
  },

  // ═══════════════════════════════════════════════════════════════
  // LOCATION / ZIP CODE — local conditions
  // ═══════════════════════════════════════════════════════════════
  userLocation: null,

  initLocation() {
    const geoBtn = document.getElementById('geo-btn');
    const zipInput = document.getElementById('zip-input');
    const zipSet = document.getElementById('zip-set');
    const status = document.getElementById('location-status');

    if (!geoBtn) return;

    // Restore saved
    const saved = this._getSavedLocation();
    if (saved) {
      this.userLocation = saved;
      if (saved.zip) zipInput.value = saved.zip;
      status.textContent = saved.label || `${saved.lat.toFixed(2)}, ${saved.lng.toFixed(2)}`;
      geoBtn.classList.add('location-bar__geo--active');
    }

    // Geolocation button
    geoBtn.addEventListener('click', () => {
      status.textContent = 'LOCATING...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'GPS' };
          this._saveLocation(this.userLocation);
          this._applyLocation();
          status.textContent = `GPS: ${this.userLocation.lat.toFixed(2)}, ${this.userLocation.lng.toFixed(2)}`;
          geoBtn.classList.add('location-bar__geo--active');
        },
        () => { status.textContent = 'LOCATION DENIED'; },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    });

    // Zip code
    const setZip = () => {
      const zip = zipInput.value.trim();
      if (!/^\d{5}$/.test(zip)) { status.textContent = 'INVALID ZIP'; return; }
      status.textContent = 'LOOKING UP...';
      // Use a free geocoding approach: Nominatim (OpenStreetMap)
      fetch(`https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=US&format=json&limit=1`)
        .then(r => r.json())
        .then(data => {
          if (data.length === 0) { status.textContent = 'ZIP NOT FOUND'; return; }
          this.userLocation = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), zip, label: zip };
          this._saveLocation(this.userLocation);
          this._applyLocation();
          status.textContent = `ZIP ${zip}: ${data[0].display_name.split(',').slice(0, 2).join(',')}`;
          geoBtn.classList.add('location-bar__geo--active');
        })
        .catch(() => { status.textContent = 'LOOKUP FAILED'; });
    };

    zipSet.addEventListener('click', setZip);
    zipInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') setZip(); });
  },

  _applyLocation() {
    if (!this.userLocation) return;
    const { lat, lng } = this.userLocation;

    // Center preview map
    if (this.previewMap) this.previewMap.setView([lat, lng], 8);

    // Center fullscreen map
    if (this.fullscreenMap) this.fullscreenMap.setView([lat, lng], 7);

    // Center desktop map
    if (this.map) this.map.setView([lat, lng], 7);
  },

  _getSavedLocation() {
    try {
      const raw = localStorage.getItem('observatory_location');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  _saveLocation(loc) {
    try { localStorage.setItem('observatory_location', JSON.stringify(loc)); } catch {}
  },

  // ═══════════════════════════════════════════════════════════════
  // EVENT LEDGER — blockchain-style event stream
  // ═══════════════════════════════════════════════════════════════
  ledgerData: null,

  initLedger() {
    // Info button
    const infoBtn = document.getElementById('ledger-info-btn');
    const infoOverlay = document.getElementById('ledger-info-overlay');
    const infoClose = document.getElementById('ledger-info-close');
    if (infoBtn && infoOverlay) {
      infoBtn.addEventListener('click', () => infoOverlay.classList.add('ledger-info-overlay--open'));
      infoClose.addEventListener('click', () => infoOverlay.classList.remove('ledger-info-overlay--open'));
      infoOverlay.addEventListener('click', (e) => {
        if (e.target === infoOverlay) infoOverlay.classList.remove('ledger-info-overlay--open');
      });
    }

    // Correlation detail modal
    const corrOverlay = document.getElementById('corr-detail-overlay');
    const corrClose = document.getElementById('corr-detail-close');
    if (corrOverlay) {
      corrClose.addEventListener('click', () => corrOverlay.classList.remove('corr-detail-overlay--open'));
      corrOverlay.addEventListener('click', (e) => {
        if (e.target === corrOverlay) corrOverlay.classList.remove('corr-detail-overlay--open');
      });
    }
  },

  async fetchLedger() {
    try {
      const res = await fetch('/api/ledger?limit=40');
      const data = await res.json();
      this.ledgerData = data;
      this.renderLedger(data);
    } catch (e) {
      console.warn('[Ledger] Fetch failed:', e.message);
    }
  },

  renderLedger(data) {
    const stream = document.getElementById('ledger-stream');
    const badge = document.getElementById('ledger-count');
    if (!stream || !data) return;

    const n = data.totalEvents ?? (Array.isArray(data.events) ? data.events.length : (Array.isArray(data) ? data.length : 0));
    badge.textContent = `${n} events`;

    if (!data.events || data.events.length === 0) {
      stream.innerHTML = '<div class="ledger-loading">No events in the last 24 hours. Collectors are gathering data.</div>';
      return;
    }

    let html = '';
    let lastBlock = null;

    for (const ev of data.events) {
      // Block separator
      if (ev.block !== lastBlock) {
        if (lastBlock !== null) {
          html += `<div class="ledger-block-sep">BLOCK #${ev.block}</div>`;
        }
        lastBlock = ev.block;
      }

      const time = new Date(ev.at);
      const timeStr = time.toISOString().slice(11, 16) + ' UTC';
      const kindClass = `ledger-event--${ev.kind}`;
      const clickAttr = `onclick="Observatory.openEventDetail(${data.events.indexOf(ev)})"`;

      let feedLabel = ev.feedName;
      let detailHtml = ev.detail || '';
      let badgeHtml = '';

      if (ev.kind === 'correlation') {
        const confClass = ev.confidence === 'HIGH' ? ' ledger-event__corr-badge--high' : '';
        badgeHtml = `<span class="ledger-event__corr-badge${confClass}">${ev.confidence} CORR</span>`;
      } else if (ev.kind === 'deviation') {
        badgeHtml = `<span class="ledger-event__dev-badge">${ev.direction === 'above' ? '↑' : '↓'}${Math.abs(ev.zScore)}σ</span>`;
      }

      html += `
        <div class="ledger-event ${kindClass}" ${clickAttr} style="cursor:pointer">
          <span class="ledger-event__time">${timeStr}</span>
          <span class="ledger-event__icon">${ev.icon || '·'}</span>
          <div class="ledger-event__content">
            <span class="ledger-event__feed">${feedLabel}${badgeHtml}</span>
            <span class="ledger-event__detail">${detailHtml}</span>
          </div>
          <span class="ledger-event__hash">${ev.hash || ''}</span>
        </div>`;
    }

    stream.innerHTML = html;
  },

  openEventDetail(index) {
    if (!this.ledgerData || !this.ledgerData.events[index]) return;
    const ev = this.ledgerData.events[index];

    const overlay = document.getElementById('corr-detail-overlay');
    const title = document.getElementById('corr-detail-title');
    const body = document.getElementById('corr-detail-body');
    const verdict = document.getElementById('corr-detail-verdict');
    const skeptic = document.getElementById('corr-detail-skeptic');

    const kindLabels = { observation: 'OBSERVATION', gap: 'DATA GAP', deviation: 'DEVIATION', correlation: 'CORRELATION' };
    title.textContent = `${kindLabels[ev.kind] || ev.kind.toUpperCase()} — ${ev.feedName || 'Unknown'}`;

    let bodyHtml = '';

    // Common fields
    bodyHtml += `<p><strong>Type:</strong> ${ev.type || ev.kind}</p>`;
    bodyHtml += `<p><strong>Feed:</strong> ${ev.feedName || '—'}</p>`;
    bodyHtml += `<p><strong>Domain:</strong> ${ev.domain || '—'}</p>`;
    bodyHtml += `<p><strong>Timestamp:</strong> ${ev.at || '—'}</p>`;

    if (ev.kind === 'observation') {
      if (ev.source) bodyHtml += `<p><strong>Source:</strong> ${ev.source}</p>`;
      if (ev.bytes) bodyHtml += `<p><strong>Payload:</strong> ${(ev.bytes / 1024).toFixed(1)}KB</p>`;
      if (ev.sha256) bodyHtml += `<p><strong>SHA-256:</strong> <span style="font-size:0.6rem;word-break:break-all">${ev.sha256}</span></p>`;
    } else if (ev.kind === 'gap') {
      if (ev.reason) bodyHtml += `<p><strong>Reason:</strong> ${ev.reason}</p>`;
      bodyHtml += `<p><strong>Status:</strong> Feed did not return data at this collection interval.</p>`;
    } else if (ev.kind === 'deviation') {
      if (ev.zScore) bodyHtml += `<p><strong>Z-Score:</strong> ${ev.zScore}σ ${ev.direction || ''}</p>`;
      if (ev.metric) bodyHtml += `<p><strong>Metric:</strong> ${ev.metric}</p>`;
      if (ev.value != null) bodyHtml += `<p><strong>Observed Value:</strong> ${ev.value}</p>`;
      if (ev.baseline != null) bodyHtml += `<p><strong>Baseline:</strong> ${ev.baseline}</p>`;
    } else if (ev.kind === 'correlation') {
      if (ev.feeds) bodyHtml += `<p><strong>Feeds Involved:</strong> ${ev.feeds.join(', ')}</p>`;
      if (ev.occurrences) bodyHtml += `<p><strong>Occurrences:</strong> ${ev.occurrences} coincident deviations</p>`;
      if (ev.avgLagMinutes != null) bodyHtml += `<p><strong>Average Lag:</strong> ${ev.avgLagMinutes === 0 ? 'Simultaneous' : Math.abs(ev.avgLagMinutes) + ' minutes'}</p>`;
      if (ev.confidence) bodyHtml += `<p><strong>Confidence:</strong> ${ev.confidence}</p>`;
    }

    if (ev.detail) bodyHtml += `<p><strong>Detail:</strong> ${ev.detail}</p>`;
    bodyHtml += `<p><strong>Block:</strong> #${ev.block} &nbsp; <strong>Hash:</strong> ${ev.hash || '—'}</p>`;

    body.innerHTML = bodyHtml;

    if (ev.kind === 'correlation') {
      verdict.textContent = ev.verdict || 'CORRELATION OBSERVED — NOT CAUSATION';
      skeptic.textContent = ev.skepticNote || 'Temporal proximity does not imply causal relationship.';
    } else if (ev.kind === 'deviation') {
      verdict.textContent = 'STATISTICAL DEVIATION FROM BASELINE';
      skeptic.textContent = 'Deviations exceeding 2σ are flagged automatically. This is a statistical observation, not an alert.';
    } else if (ev.kind === 'gap') {
      verdict.textContent = 'DATA GAP RECORDED';
      skeptic.textContent = 'Source did not respond or returned an error. Gap is logged for integrity — no data was interpolated.';
    } else {
      verdict.textContent = 'OBSERVATION RECORDED';
      skeptic.textContent = 'Raw data collected from public source. No modification, no editorialization.';
    }

    overlay.classList.add('corr-detail-overlay--open');
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Observatory.init());
} else {
  Observatory.init();
}
