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
  },

  // ── State ────────────────────────────────────────────────────
  feeds: [],
  correlations: [],
  map: null,
  mapLayers: {},
  markers: { earthquakes: [], lightning: [] },
  refreshInterval: 60000,

  // ── Init ─────────────────────────────────────────────────────
  async init() {
    this.startClock();
    this.initMap();
    this.bindEvents();
    this.initStatTooltips();
    this.initMobileMapPreview();
    this.initLocation();
    this.initLedger();

    // Initialize AtmosCore engine
    AtmosCore.init();
    AtmosCoreViz.init('atmoscore-ring');

    await this.fetchAll();
    this.fetchLedger();
    setInterval(() => this.fetchAll(), this.refreshInterval);
    setInterval(() => this.fetchLedger(), 60000); // Refresh ledger every 60s
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
  mapStyle: 'light',
  mapTiles: {
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  },

  initMap() {
    this.map = L.map('map', {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
    });

    // Base layer — swappable light/dark
    this.baseLayer = L.tileLayer(this.mapTiles[this.mapStyle], {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(this.map);

    // NOAA Radar
    this.mapLayers.radar = L.tileLayer.wms('https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi', {
      layers: 'nexrad-n0q-900913', format: 'image/png', transparent: true, opacity: 0.6,
    });

    // GOES Visible
    this.mapLayers.satellite = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-vis-1km-900913/{z}/{x}/{y}.png', {
      opacity: 0.4, maxZoom: 8,
    });

    // GOES Infrared — Iowa State tile cache
    this.mapLayers.infrared = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-ir-4km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8,
    });

    // Water Vapor — Iowa State tile cache
    this.mapLayers.watervapor = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-wv-4km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8,
    });

    // Precipitation — RainViewer (free, no API key)
    this.mapLayers.precip = L.tileLayer('', { opacity: 0.5, maxZoom: 18 });
    this._loadRainViewerTiles();

    // Default: show radar
    this.mapLayers.radar.addTo(this.map);

    this.updateLayerCount();
    this.updateDynamicLegend();
  },

  // ── RainViewer precipitation tiles ───────────────────────────
  async _loadRainViewerTiles() {
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await res.json();
      const latest = data.radar.past[data.radar.past.length - 1];
      if (latest) {
        const newLayer = L.tileLayer(`https://tilecache.rainviewer.com${latest.path}/512/{z}/{x}/{y}/2/1_1.png`, {
          opacity: 0.5, maxZoom: 18,
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
    this.baseLayer = L.tileLayer(this.mapTiles[this.mapStyle], {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(this.map);
    // Move base layer below overlays
    this.baseLayer.bringToBack();
    // Update button
    const btn = document.getElementById('map-style-toggle');
    btn.textContent = this.mapStyle === 'light' ? '☀ LIGHT' : '🌙 DARK';
  },

  // ── Dynamic Legend ───────────────────────────────────────────
  updateDynamicLegend() {
    const legend = document.getElementById('map-legend');
    let html = '<div class="map-legend__title">LEGEND</div>';
    let hasActive = false;

    for (const [key, def] of Object.entries(this.layerDefs)) {
      if (!this.mapLayers[key] || !this.map.hasLayer(this.mapLayers[key])) continue;
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
      }
      html += `</div>`;
    }

    // Always show earthquake legend (from map markers)
    if (this.markers.earthquakes.length > 0) {
      hasActive = true;
      html += `<div class="map-legend__section">
        <div class="map-legend__heading">EARTHQUAKES (24H)</div>
        <div class="map-legend__sublabel">Circle size = magnitude</div>
        <div class="map-legend__items">
          <div class="map-legend__item"><span class="map-legend__dot" style="background:#06b6d4;width:8px;height:8px"></span> M2.5–2.9 · Minor</div>
          <div class="map-legend__item"><span class="map-legend__dot" style="background:#ffd60a;width:10px;height:10px"></span> M3.0–3.9 · Light</div>
          <div class="map-legend__item"><span class="map-legend__dot" style="background:#ff9500;width:12px;height:12px"></span> M4.0–4.9 · Moderate</div>
          <div class="map-legend__item"><span class="map-legend__dot" style="background:#ff3b30;width:14px;height:14px"></span> M5.0+ · Strong</div>
        </div>
      </div>`;
    }

    legend.innerHTML = hasActive ? html : '';

    // Bind info buttons
    legend.querySelectorAll('.map-legend__info-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showLayerInfo(btn.dataset.layerInfo);
      });
    });
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

  // ── Update Topbar ────────────────────────────────────────────
  updateTopbar(data) {
    const liveEl = document.getElementById('stat-live');
    const live = data.live || 0;
    liveEl.textContent = `${live}/${data.total || 18}`;
    liveEl.style.color = live === data.total ? 'var(--signal-live)' :
                         live > 0 ? 'var(--signal-stale)' : 'var(--signal-offline)';
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
    if (statusEl) {
      statusEl.textContent = suit.status.toUpperCase();
      statusEl.style.color = suit.status === 'suitable' ? 'var(--ac-optimal)' :
                             suit.status === 'qualified' ? 'var(--ac-advisory)' :
                             suit.status === 'unsuitable' ? 'var(--ac-critical)' : 'var(--text-dim)';
    }
    if (trendEl) {
      const tChar = suit.trend === 'improving' ? '▲ IMPROVING' : suit.trend === 'degrading' ? '▼ DEGRADING' : '● STABLE';
      const tColor = suit.trend === 'improving' ? 'var(--ac-optimal)' : suit.trend === 'degrading' ? 'var(--ac-caution)' : 'var(--text-dim)';
      trendEl.textContent = tChar;
      trendEl.style.color = tColor;
    }

    // Topbar AtmosCore stat
    const acStat = document.getElementById('stat-atmoscore');
    if (acStat) {
      acStat.textContent = suit.status.toUpperCase();
      acStat.style.color = suit.status === 'suitable' ? 'var(--signal-live)' :
                           suit.status === 'qualified' ? 'var(--signal-stale)' : 'var(--signal-offline)';
    }

    const suitStat = document.getElementById('stat-suitability');
    if (suitStat) {
      const v = suit.overall;
      suitStat.textContent = v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2);
      suitStat.style.color = AtmosCore.getBandColor(v);
    }

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
          <span class="feed-carousel__domain">${domain.toUpperCase()}</span>
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

    card.innerHTML = `
      <div class="feed-card__image-wrap">
        <img class="feed-card__image" src="${imgSrc}" alt="${feed.name}" loading="lazy">
        <div class="feed-card__image-overlay"></div>
        <span class="feed-card__badge feed-card__badge--${feed.status}">${feed.status.toUpperCase()}</span>
        <div class="feed-card__name">${feed.name}</div>
      </div>
      <div class="feed-card__content">
        ${condition ? `<div class="feed-card__condition" style="color: ${condition.color}">${condition.text}</div>` : ''}
        <canvas class="feed-card__sparkline" id="${sparkId}" width="200" height="24"></canvas>
        <div class="feed-card__footer">
          <span>${feed.entries} obs</span>
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

  // ── Condition Text (all 18 feeds) ───────────────────────────
  getConditionText(feed) {
    if (feed.status === 'offline') return { text: 'NO DATA', color: 'var(--signal-offline)' };

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

  // ── Draw Large Sparkline (modal) ─────────────────────────────
  drawSparklineLarge(data, status) {
    const canvas = document.getElementById('modal-sparkline');
    if (!canvas || !data?.length) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const max = Math.max(...data, 1);
    const step = w / (data.length - 1 || 1);

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(30, 30, 40, 0.8)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (h / 4) * i);
      ctx.lineTo(w, (h / 4) * i);
      ctx.stroke();
    }

    const color = status === 'live' ? '0, 255, 136' :
                  status === 'stale' ? '255, 149, 0' : '255, 59, 48';

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, `rgba(${color}, 0.2)`);
    gradient.addColorStop(1, `rgba(${color}, 0.02)`);

    ctx.beginPath();
    ctx.moveTo(0, h);
    data.forEach((v, i) => ctx.lineTo(i * step, h - (v / max) * (h - 4)));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 4);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = `rgba(${color}, 0.8)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    data.forEach((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 4);
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.5)`;
      ctx.fill();
    });

    ctx.fillStyle = 'rgba(136, 136, 160, 0.5)';
    ctx.font = '9px JetBrains Mono';
    for (let i = 0; i < data.length; i += 6) {
      ctx.fillText(`-${data.length - i}h`, i * step, h - 2);
    }
  },

  // ── Open Detail Modal ────────────────────────────────────────
  async openDetail(feed) {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('modal-overlay--open');

    const imgSrc = this.feedImages[feed.id] || 'assets/nexrad.jpg';
    document.getElementById('modal-icon').innerHTML = `<img src="${imgSrc}" class="modal__icon-img" alt="">`;
    document.getElementById('modal-title').textContent = feed.name;

    const badge = document.getElementById('modal-badge');
    badge.textContent = feed.status.toUpperCase();
    badge.className = `modal__badge bento-tile__badge--${feed.status}`;

    const meta = document.getElementById('modal-meta');
    const ago = this.timeAgo(feed.last);
    const condition = this.getConditionText(feed);
    meta.innerHTML = `
      <div class="meta-item">
        <div class="meta-item__label">STATUS</div>
        <div class="meta-item__value" style="color: var(--signal-${feed.status === 'live' ? 'live' : feed.status === 'stale' ? 'stale' : 'offline'})">${feed.status.toUpperCase()}</div>
      </div>
      <div class="meta-item">
        <div class="meta-item__label">OBSERVATIONS</div>
        <div class="meta-item__value">${feed.entries}</div>
      </div>
      <div class="meta-item">
        <div class="meta-item__label">LAST UPDATE</div>
        <div class="meta-item__value">${ago}</div>
      </div>
      <div class="meta-item">
        <div class="meta-item__label">DOMAIN</div>
        <div class="meta-item__value">${feed.domain}</div>
      </div>
      <div class="meta-item">
        <div class="meta-item__label">CONDITION</div>
        <div class="meta-item__value" style="color: ${condition?.color || 'var(--text-secondary)'}">${condition?.text || '—'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-item__label">FEED ID</div>
        <div class="meta-item__value" style="font-size: 0.7rem">${feed.id}</div>
      </div>
    `;

    this.drawSparklineLarge(feed.sparkline, feed.status);

    // Store current feed for share button
    this._currentModalFeed = feed;

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
    this.markers.earthquakes.forEach(m => this.map.removeLayer(m));
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
          }).addTo(this.map);
          marker.bindPopup(`
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #e8e8f0; background: #0a0a0e; padding: 8px; border: 1px solid #2a2a38; border-radius: 2px; min-width: 180px;">
              <div style="color: ${color}; font-weight: 700; font-size: 14px; margin-bottom: 4px;">M${mag.toFixed(1)}</div>
              <div style="color: #8888a0; margin-bottom: 2px;">${f.properties.place}</div>
              <div style="color: #555568; font-size: 9px;">${new Date(f.properties.time).toISOString().slice(0, 19)} UTC</div>
            </div>
          `, { className: 'obs-popup' });
          this.markers.earthquakes.push(marker);
        });
      }
    } catch {}

    this.updateLayerCount();
    this.updateDynamicLegend();
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
        const minBottom = 80;
        const maxTop = cockpitRect.height - minBottom - 8; // 8px handle
        const clamped = Math.max(minTop, Math.min(maxTop, newTopHeight));
        cockpit.style.gridTemplateRows = `${clamped}px auto 1fr`;
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
        // Resize AtmosCore ring if switching to atmoscore view
        if (view === 'atmoscore') {
          setTimeout(() => {
            AtmosCoreViz.resize();
            AtmosCoreViz.update(AtmosCore);
          }, 150);
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
      body: `<strong>What this shows:</strong> The number of data feeds currently receiving fresh data, out of 18 total feeds monitored.<br><br>
<strong>LIVE</strong> = received data within expected interval.<br>
<strong>STALE</strong> = data is older than 3× the expected refresh interval.<br>
<strong>OFFLINE</strong> = no data received.<br><br>
Feeds include NEXRAD radar, GOES satellite, solar/SWPC, USGS seismic, lightning, power grid, geomagnetic, ionospheric, Schumann resonance, surface stations, Blitzortung, ADS-B aircraft, NOTAMs, cell towers, and more.`,
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
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(this.previewMap);

    // Add radar overlay to preview
    this.previewRadar = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8,
    }).addTo(this.previewMap);

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

    // Try to lock landscape
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) {}
  },

  closeFullscreenMap() {
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
      zoomControl: true,
    });

    this.fsBaseLayer = L.tileLayer(this.mapTiles[this.fsMapStyle], {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(this.fullscreenMap);

    // Build FS layers
    this.fsMapLayers.radar = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8,
    });
    this.fsMapLayers.satellite = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-vis-1km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8,
    });
    this.fsMapLayers.infrared = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-ir-4km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8,
    });
    this.fsMapLayers.watervapor = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-east-wv-4km-900913/{z}/{x}/{y}.png', {
      opacity: 0.5, maxZoom: 8,
    });
    this.fsMapLayers.precip = L.tileLayer('', { opacity: 0.5, maxZoom: 18 });

    // Default radar
    this.fsMapLayers.radar.addTo(this.fullscreenMap);

    // Wire FS layer toggles
    document.querySelectorAll('[data-fslayer]').forEach(cb => {
      cb.addEventListener('change', () => {
        const layer = this.fsMapLayers[cb.dataset.fslayer];
        if (!layer) return;
        if (cb.checked) layer.addTo(this.fullscreenMap);
        else this.fullscreenMap.removeLayer(layer);
      });
    });

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

  // ── Toggle Fullscreen Map Style ──────────────────────────────
  toggleFullscreenMapStyle() {
    if (!this.fullscreenMap) return;
    this.fsMapStyle = this.fsMapStyle === 'light' ? 'dark' : 'light';
    this.fullscreenMap.removeLayer(this.fsBaseLayer);
    this.fsBaseLayer = L.tileLayer(this.mapTiles[this.fsMapStyle], {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(this.fullscreenMap);
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
        this.fsMapLayers.precip = L.tileLayer(latest.url, { opacity: 0.5, maxZoom: 18 });
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

  startAnimation() {
    if (this.animFrames.length === 0) return;
    this.animActive = true;
    this.animIndex = 0;

    const btn = document.getElementById('anim-toggle');
    btn.classList.add('map-fullscreen__anim-btn--active');
    btn.textContent = '⏸ LOOP';

    // ── Determine which layers to animate ──
    // Check which FS layers are currently active
    const hasRadar = this.fullscreenMap.hasLayer(this.fsMapLayers.radar);
    const hasSatellite = this.fullscreenMap.hasLayer(this.fsMapLayers.satellite);
    const hasInfrared = this.fullscreenMap.hasLayer(this.fsMapLayers.infrared);
    const hasWV = this.fullscreenMap.hasLayer(this.fsMapLayers.watervapor);
    const hasPrecip = this.fullscreenMap.hasLayer(this.fsMapLayers.precip);

    // Remove static layers that will be animated
    if (hasRadar) this.fullscreenMap.removeLayer(this.fsMapLayers.radar);

    // ── Build animation layer stacks ──
    // Precip: use RainViewer frames (already loaded)
    this.animLayers = this.animFrames.map(f =>
      L.tileLayer(f.url, { opacity: 0.5, maxZoom: 18 })
    );

    // NEXRAD: use WMS-T frames synced to RainViewer timestamps
    this.animNexradLayers = [];
    if (hasRadar) {
      this.animNexradLayers = this.animFrames.map(f =>
        this._nexradFrameForTime(f.time)
      );
    }

    // Show first frame of each active animated layer
    this.animLayers[0].addTo(this.fullscreenMap);
    if (this.animNexradLayers.length > 0) {
      this.animNexradLayers[0].addTo(this.fullscreenMap);
    }

    this.animInterval = setInterval(() => {
      // Remove current frame layers
      if (this.animLayers[this.animIndex]) {
        this.fullscreenMap.removeLayer(this.animLayers[this.animIndex]);
      }
      if (this.animNexradLayers[this.animIndex]) {
        this.fullscreenMap.removeLayer(this.animNexradLayers[this.animIndex]);
      }

      // Advance
      this.animIndex = (this.animIndex + 1) % this.animFrames.length;

      // Add next frame layers
      this.animLayers[this.animIndex].addTo(this.fullscreenMap);
      if (this.animNexradLayers[this.animIndex]) {
        this.animNexradLayers[this.animIndex].addTo(this.fullscreenMap);
      }

      // Update label
      const frame = this.animFrames[this.animIndex];
      const label = document.getElementById('anim-label');
      const mins = Math.round((Date.now() - frame.time.getTime()) / 60000);
      label.textContent = mins <= 0 ? 'LIVE' : `-${mins}m`;
      label.style.color = this.animIndex === this.animFrames.length - 1 ? 'var(--signal-live)' : 'var(--brass)';

      // Update dots
      document.querySelectorAll('.anim-bar__dot').forEach((d, i) => {
        d.classList.toggle('anim-bar__dot--active', i === this.animIndex);
      });
    }, 800);
  },

  stopAnimation() {
    this.animActive = false;
    clearInterval(this.animInterval);

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

    // Re-add static layers
    if (this.fullscreenMap && !this.fullscreenMap.hasLayer(this.fsMapLayers.radar)) {
      this.fsMapLayers.radar.addTo(this.fullscreenMap);
    }

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

    badge.textContent = `${data.totalEvents} events`;

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
