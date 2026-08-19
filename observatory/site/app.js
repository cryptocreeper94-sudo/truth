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

    // Initialize AtmosCore engine
    AtmosCore.init();
    AtmosCoreViz.init('atmoscore-ring');

    await this.fetchAll();
    setInterval(() => this.fetchAll(), this.refreshInterval);
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
  initMap() {
    this.map = L.map('map', {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
    });

    // Base layer — CartoDB dark
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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
        return { text: 'IMAGING', color: 'var(--signal-cyan)' };

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
        return { text: 'REPORTING', color: 'var(--signal-cyan)' };

      case 'ionosonde':
        if (rate > avg * 2) return { text: 'TEC ELEVATED', color: 'var(--signal-stale)' };
        return { text: 'NORMAL TEC', color: 'var(--signal-live)' };

      case 'schumann':
        if (rate > avg * 2) return { text: 'RESONANCE SPIKE', color: 'var(--signal-stale)' };
        return { text: 'BASELINE', color: 'var(--signal-live)' };

      case 'aircraft':
        return { text: `${feed.entries} TRACKED`, color: 'var(--signal-cyan)' };

      case 'notam':
        if (feed.entries > 20) return { text: 'HIGH ACTIVITY', color: 'var(--signal-stale)' };
        return { text: `${feed.entries} ACTIVE`, color: 'var(--signal-live)' };

      case 'celltower':
        return { text: 'MONITORING', color: 'var(--signal-cyan)' };

      case 'heater':
        if (feed.entries > 0) return { text: 'FACILITY ACTIVE', color: 'var(--signal-stale)' };
        return { text: 'NO ACTIVITY', color: 'var(--text-dim)' };

      case 'metals':
        if (rate > avg * 1.5 && avg > 0) return { text: 'ELEVATED TRACE', color: 'var(--signal-stale)' };
        return { text: 'BASELINE', color: 'var(--signal-live)' };

      case 'ecology':
        return { text: 'INDEXING', color: 'var(--signal-cyan)' };

      case 'deposition':
        return { text: 'SAMPLING', color: 'var(--signal-cyan)' };

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

  // ── Render Correlations ──────────────────────────────────────
  renderCorrelations(data) {
    const track = document.getElementById('corr-track');
    const dots = document.getElementById('corr-dots');
    const patterns = data.patterns || data.events || [];

    document.getElementById('corr-count').textContent = `${patterns.length} patterns`;

    if (patterns.length === 0) {
      track.innerHTML = `<div class="corr-card corr-card--empty">
        <p class="corr-card__msg">${data.message || 'Correlation engine is modeling baselines. Patterns appear as deviations are identified.'}</p>
      </div>`;
      dots.innerHTML = '';
      return;
    }

    track.innerHTML = '';
    dots.innerHTML = '';

    patterns.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'corr-card';
      const confColor = p.confidence > 0.7 ? 'var(--signal-live)' : p.confidence > 0.4 ? 'var(--signal-stale)' : 'var(--text-dim)';
      card.innerHTML = `
        <div class="corr-card__title">${p.title || 'Pattern Detected'}</div>
        <div class="corr-card__confidence" style="color: ${confColor}">CONFIDENCE: ${((p.confidence || 0) * 100).toFixed(1)}% · ${p.verdict || 'ANALYZING'}</div>
        <div class="corr-card__summary">${p.summary || ''}</div>
        ${p.skepticNote ? `<div class="corr-card__skeptic">${p.skepticNote}</div>` : ''}
      `;
      track.appendChild(card);

      const dot = document.createElement('div');
      dot.className = `corr-dot${i === 0 ? ' corr-dot--active' : ''}`;
      dots.appendChild(dot);
    });
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

    // Correlation carousel
    const track = document.getElementById('corr-track');
    document.getElementById('corr-prev').addEventListener('click', () => track.scrollBy({ left: -320, behavior: 'smooth' }));
    document.getElementById('corr-next').addEventListener('click', () => track.scrollBy({ left: 320, behavior: 'smooth' }));

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
          }, 100);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        document.getElementById('legend-info-overlay').classList.remove('legend-info-overlay--open');
      }
    });
  },

  // ── Utilities ────────────────────────────────────────────────
  timeAgo(isoStr) {
    if (!isoStr) return '—';
    const ms = Date.now() - new Date(isoStr).getTime();
    if (ms < 60000) return `${Math.floor(ms / 1000)}s ago`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
    if (ms < 86400000) return `${Math.floor(ms / 3600000)}h ago`;
    return `${Math.floor(ms / 86400000)}d ago`;
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Observatory.init());
} else {
  Observatory.init();
}
