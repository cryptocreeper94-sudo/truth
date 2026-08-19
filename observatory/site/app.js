/**
 * ═══════════════════════════════════════════════════════════════
 *  TRUTH OBSERVATORY — Cockpit Controller v2
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  [01] Identity    → OBSERVATORY_COCKPIT
 *  [14] Determinacy → Same API data → same render
 *  [32] Integrity   → Raw manifest data displayed unmodified
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
    ionosonde: 'assets/geomag.jpg',
    schumann: 'assets/geomag.jpg',
    surface: 'assets/nexrad.jpg',
    blitzortung: 'assets/lightning.jpg',
    aircraft: 'assets/goes.jpg',
    notam: 'assets/nexrad.jpg',
    celltower: 'assets/grid.jpg',
    heater: 'assets/goes.jpg',
    metals: 'assets/seismic.jpg',
    ecology: 'assets/geomag.jpg',
    deposition: 'assets/nexrad.jpg',
  },

  // ── State ────────────────────────────────────────────────────
  feeds: [],
  correlations: [],
  map: null,
  mapLayers: {},
  markers: { earthquakes: [], lightning: [] },
  refreshInterval: 60000,
  currentFilter: 'all',

  // ── Init ─────────────────────────────────────────────────────
  async init() {
    this.startClock();
    this.initMap();
    this.bindEvents();
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

  // ── Map Init with Layer Controls ─────────────────────────────
  initMap() {
    this.map = L.map('map', {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
    });

    // Base layer — CartoDB dark
    const baseDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(this.map);

    // NOAA Radar overlay
    this.mapLayers.radar = L.tileLayer.wms('https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi', {
      layers: 'nexrad-n0q-900913',
      format: 'image/png',
      transparent: true,
      opacity: 0.6,
      attribution: 'NOAA/NWS',
    });

    // GOES Satellite IR overlay
    this.mapLayers.satellite = L.tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-vis-1km-900913/{z}/{x}/{y}.png', {
      opacity: 0.4,
      maxZoom: 8,
    });

    // Temperature overlay
    this.mapLayers.temp = L.tileLayer('https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=demo', {
      opacity: 0.4,
      maxZoom: 19,
    });

    // Default: show radar
    this.mapLayers.radar.addTo(this.map);

    // Update layer count
    this.updateLayerCount();
  },

  updateLayerCount() {
    let count = 0;
    Object.values(this.mapLayers).forEach(layer => {
      if (this.map.hasLayer(layer)) count++;
    });
    document.getElementById('map-layers').textContent = `${count + 1} layers active`;
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
        this.renderFeeds();
        this.updateTopbar(feedsRes);
        this.updateMapOverlays();
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

  // ── Render Feed Tiles ────────────────────────────────────────
  renderFeeds() {
    const grid = document.getElementById('bento-grid');
    grid.innerHTML = '';

    for (const feed of this.feeds) {
      const tile = document.createElement('div');
      tile.className = `bento-tile bento-tile--${feed.status}`;
      tile.dataset.domain = feed.domain;
      tile.dataset.feedId = feed.id;

      if (this.currentFilter !== 'all' && feed.domain !== this.currentFilter) {
        tile.dataset.hidden = 'true';
      }

      const ago = this.timeAgo(feed.last);
      const sparkId = `spark-${feed.id}`;
      const imgSrc = this.feedImages[feed.id] || 'assets/nexrad.jpg';
      const conditionText = this.getConditionText(feed);

      tile.innerHTML = `
        <div class="bento-tile__image-wrap">
          <img class="bento-tile__image" src="${imgSrc}" alt="${feed.name}" loading="lazy">
          <div class="bento-tile__image-overlay"></div>
          <span class="bento-tile__badge bento-tile__badge--${feed.status}">${feed.status.toUpperCase()}</span>
        </div>
        <div class="bento-tile__content">
          <div class="bento-tile__name">${feed.name}</div>
          <div class="bento-tile__domain">${feed.domain}</div>
          ${conditionText ? `<div class="bento-tile__condition" style="color: ${conditionText.color}">${conditionText.text}</div>` : ''}
          <canvas class="bento-tile__sparkline" id="${sparkId}" width="200" height="28"></canvas>
          <div class="bento-tile__footer">
            <span class="bento-tile__entries">${feed.entries} obs</span>
            <span class="bento-tile__ago">${ago}</span>
          </div>
        </div>
      `;

      // 3D tilt effect
      tile.addEventListener('mousemove', (e) => this.handleTilt(e, tile));
      tile.addEventListener('mouseleave', () => {
        tile.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
      });
      tile.addEventListener('click', () => this.openDetail(feed));
      grid.appendChild(tile);

      requestAnimationFrame(() => this.drawSparkline(sparkId, feed.sparkline, feed.status));
    }
  },

  // ── 3D Tilt Effect ───────────────────────────────────────────
  handleTilt(e, tile) {
    const rect = tile.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    tile.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  },

  // ── Condition Text (data-driven) ─────────────────────────────
  getConditionText(feed) {
    if (feed.status === 'offline') return { text: 'NO DATA', color: 'var(--signal-offline)' };

    const rate = feed.sparkline ? feed.sparkline[feed.sparkline.length - 1] || 0 : 0;
    const avg = feed.sparkline ? feed.sparkline.reduce((a, b) => a + b, 0) / feed.sparkline.length : 0;

    if (feed.id === 'earthquake') {
      if (feed.entries > 20) return { text: `${feed.entries} EVENTS — ELEVATED`, color: 'var(--signal-stale)' };
      return { text: `${feed.entries} events — normal`, color: 'var(--signal-live)' };
    }
    if (feed.id === 'solar') {
      if (rate > avg * 2) return { text: 'ELEVATED ACTIVITY', color: 'var(--signal-stale)' };
      return { text: 'NOMINAL', color: 'var(--signal-live)' };
    }
    if (feed.id === 'geomag') {
      if (rate > avg * 2) return { text: 'STORM CONDITIONS', color: 'var(--signal-offline)' };
      return { text: 'QUIET', color: 'var(--signal-live)' };
    }
    if (feed.id === 'grid') {
      return { text: 'GRID MONITORING', color: 'var(--signal-cyan)' };
    }
    if (rate > avg * 1.5 && avg > 0) {
      return { text: 'HIGH ACTIVITY', color: 'var(--signal-stale)' };
    }
    if (rate === 0 && feed.status === 'live') {
      return { text: 'COLLECTING', color: 'var(--text-dim)' };
    }
    return null;
  },

  // ── Draw Sparkline ───────────────────────────────────────────
  drawSparkline(canvasId, data, status) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !data?.length) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
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

    // Gradient fill
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

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 4);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = `rgba(${color}, 0.8)`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 4);
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.5)`;
      ctx.fill();
    });

    // Hour labels
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

  // ── Render Correlations ──────────────────────────────────────
  renderCorrelations(data) {
    const track = document.getElementById('corr-track');
    const dots = document.getElementById('corr-dots');
    const patterns = data.patterns || data.events || [];

    document.getElementById('corr-count').textContent = `${patterns.length} patterns`;
    document.getElementById('stat-corr').textContent = patterns.length > 0 ? `${patterns.length} ACTIVE` : 'MODELING';

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

    // Earthquake markers
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
            color: color,
            fillColor: color,
            fillOpacity: 0.35,
            weight: 1.5,
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
  },

  // ── Bind Events ──────────────────────────────────────────────
  bindEvents() {
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-back').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });

    // Domain filters
    document.getElementById('domain-filters').addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      this.currentFilter = btn.dataset.domain;
      document.querySelectorAll('.bento-tile').forEach(tile => {
        tile.dataset.hidden = (this.currentFilter !== 'all' && tile.dataset.domain !== this.currentFilter) ? 'true' : 'false';
      });
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
    });

    // Correlation carousel
    const track = document.getElementById('corr-track');
    document.getElementById('corr-prev').addEventListener('click', () => track.scrollBy({ left: -320, behavior: 'smooth' }));
    document.getElementById('corr-next').addEventListener('click', () => track.scrollBy({ left: 320, behavior: 'smooth' }));

    // Bottom nav
    document.querySelectorAll('.bottomnav__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bottomnav__btn').forEach(b => b.classList.remove('bottomnav__btn--active'));
        btn.classList.add('bottomnav__btn--active');
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
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
