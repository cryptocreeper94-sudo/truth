/**
 * ═══════════════════════════════════════════════════════════════
 *  TRUTH OBSERVATORY — Cockpit Controller
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  [01] Identity    → OBSERVATORY_COCKPIT
 *  [14] Determinacy → Same API data → same render
 *  [32] Integrity   → Raw manifest data displayed unmodified
 * ═══════════════════════════════════════════════════════════════
 */

const Observatory = {

  // ── State ────────────────────────────────────────────────────
  feeds: [],
  correlations: [],
  map: null,
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

  // ── Map Init ─────────────────────────────────────────────────
  initMap() {
    this.map = L.map('map', {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
    });

    // CartoDB dark tiles — free, Apex-aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(this.map);
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

      // Pulse the global indicator
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

      tile.innerHTML = `
        <div class="bento-tile__header">
          <span class="bento-tile__icon">${feed.icon || '◉'}</span>
          <span class="bento-tile__badge bento-tile__badge--${feed.status}">${feed.status.toUpperCase()}</span>
        </div>
        <div class="bento-tile__name">${feed.name}</div>
        <div class="bento-tile__domain">${feed.domain}</div>
        <canvas class="bento-tile__sparkline" id="${sparkId}" width="200" height="24"></canvas>
        <div class="bento-tile__footer">
          <span class="bento-tile__entries">${feed.entries} obs</span>
          <span class="bento-tile__ago">${ago}</span>
        </div>
      `;

      tile.addEventListener('click', () => this.openDetail(feed));
      grid.appendChild(tile);

      // Draw sparkline
      requestAnimationFrame(() => this.drawSparkline(sparkId, feed.sparkline, feed.status));
    }

    document.getElementById('map-layers').textContent = `${this.feeds.filter(f => f.status === 'live').length} live`;
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

    // Fill
    ctx.beginPath();
    ctx.moveTo(0, h);
    data.forEach((v, i) => {
      ctx.lineTo(i * step, h - (v / max) * (h - 2));
    });
    ctx.lineTo(w, h);
    ctx.closePath();

    const color = status === 'live' ? '0, 255, 136' :
                  status === 'stale' ? '255, 149, 0' : '255, 59, 48';
    ctx.fillStyle = `rgba(${color}, 0.08)`;
    ctx.fill();

    // Line
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 2);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = `rgba(${color}, 0.6)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
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

    // Grid lines
    ctx.strokeStyle = 'rgba(30, 30, 40, 0.8)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (h / 4) * i);
      ctx.lineTo(w, (h / 4) * i);
      ctx.stroke();
    }

    // Fill
    ctx.beginPath();
    ctx.moveTo(0, h);
    data.forEach((v, i) => ctx.lineTo(i * step, h - (v / max) * (h - 4)));
    ctx.lineTo(w, h);
    ctx.closePath();

    const color = status === 'live' ? '0, 255, 136' :
                  status === 'stale' ? '255, 149, 0' : '255, 59, 48';
    ctx.fillStyle = `rgba(${color}, 0.1)`;
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

    // Dots at each point
    data.forEach((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 4);
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, 0.5)`;
      ctx.fill();
    });
  },

  // ── Open Detail Modal ────────────────────────────────────────
  async openDetail(feed) {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('modal-overlay--open');

    document.getElementById('modal-icon').textContent = feed.icon || '◉';
    document.getElementById('modal-title').textContent = feed.name;

    const badge = document.getElementById('modal-badge');
    badge.textContent = feed.status.toUpperCase();
    badge.className = `modal__badge bento-tile__badge--${feed.status}`;

    // Meta
    const meta = document.getElementById('modal-meta');
    const ago = this.timeAgo(feed.last);
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
    `;

    // Sparkline
    this.drawSparklineLarge(feed.sparkline, feed.status);

    // Fetch recent entries
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

  // ── Close Modal ──────────────────────────────────────────────
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
      card.innerHTML = `
        <div class="corr-card__title">${p.title || 'Pattern Detected'}</div>
        <div class="corr-card__confidence">CONFIDENCE: ${((p.confidence || 0) * 100).toFixed(1)}% | ${p.verdict || 'ANALYZING'}</div>
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
    // Clear old markers
    this.markers.earthquakes.forEach(m => this.map.removeLayer(m));
    this.markers.lightning.forEach(m => this.map.removeLayer(m));
    this.markers.earthquakes = [];
    this.markers.lightning = [];

    // Earthquake markers from USGS
    try {
      const res = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
      const data = await res.json();
      if (data?.features) {
        data.features.slice(0, 50).forEach(f => {
          const [lng, lat] = f.geometry.coordinates;
          const mag = f.properties.mag;
          const marker = L.circleMarker([lat, lng], {
            radius: Math.max(3, mag * 2.5),
            color: '#ff3b30',
            fillColor: '#ff3b30',
            fillOpacity: 0.3,
            weight: 1,
          }).addTo(this.map);
          marker.bindPopup(`<b>M${mag}</b><br>${f.properties.place}<br>${new Date(f.properties.time).toISOString().slice(0, 19)}`);
          this.markers.earthquakes.push(marker);
        });
      }
    } catch {}

    // Lightning from Blitzortung (if available)
    try {
      const lightningFeed = this.feeds.find(f => f.id === 'blitzortung');
      if (lightningFeed?.status === 'live') {
        const res = await fetch('/api/feed/blitzortung?limit=20');
        const data = await res.json();
        (data.recentEntries || []).forEach(e => {
          if (e.lat && e.lon) {
            const marker = L.circleMarker([e.lat, e.lon], {
              radius: 2,
              color: '#0af',
              fillColor: '#0af',
              fillOpacity: 0.6,
              weight: 0,
            }).addTo(this.map);
            this.markers.lightning.push(marker);
          }
        });
      }
    } catch {}

    document.getElementById('map-layers').textContent =
      `${this.markers.earthquakes.length} quakes · ${this.markers.lightning.length} strikes`;
  },

  // ── Bind Events ──────────────────────────────────────────────
  bindEvents() {
    // Modal close
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
        if (this.currentFilter === 'all' || tile.dataset.domain === this.currentFilter) {
          tile.dataset.hidden = 'false';
        } else {
          tile.dataset.hidden = 'true';
        }
      });
    });

    // Correlation carousel navigation
    const track = document.getElementById('corr-track');
    document.getElementById('corr-prev').addEventListener('click', () => {
      track.scrollBy({ left: -320, behavior: 'smooth' });
    });
    document.getElementById('corr-next').addEventListener('click', () => {
      track.scrollBy({ left: 320, behavior: 'smooth' });
    });

    // Bottom nav
    document.querySelectorAll('.bottomnav__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bottomnav__btn').forEach(b => b.classList.remove('bottomnav__btn--active'));
        btn.classList.add('bottomnav__btn--active');
        // Future: view switching logic
      });
    });

    // Keyboard: Escape closes modal
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

// ── Boot ───────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Observatory.init());
} else {
  Observatory.init();
}
