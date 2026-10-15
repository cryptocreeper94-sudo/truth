/**
 * ═══════════════════════════════════════════════════════════
 *  Truth Observatory — Live Status Engine
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  Reads real collector status from /api/feeds (public) and
 *  pulses each homepage card green when its collector is live.
 *  (Previously pinged third-party URLs from the browser, which
 *  did not reflect collector health and exposed an API key.)
 * ═══════════════════════════════════════════════════════════
 */

const LiveStatus = {

  // Homepage card id suffix → /api/feeds feed id
  cardToFeed: {
    nexrad: 'nexrad', goes: 'goes', lightning: 'lightning', surface: 'surface',
    blitz: 'blitzortung', solar: 'solar', geomag: 'geomag', iono: 'ionosonde',
    schumann: 'schumann', seismic: 'earthquake', grid: 'grid', aircraft: 'aircraft',
    notam: 'notam', celltower: 'celltower', haarp: 'heater', metals: 'metals',
    ecology: 'ecology', chemistry: 'deposition',
  },

  async checkAll() {
    let data;
    try {
      const resp = await fetch('/api/feeds');
      if (!resp.ok) return;
      data = await resp.json();
    } catch (err) {
      console.warn('[Observatory] feed status check failed:', err.message);
      return;
    }
    const feeds = Array.isArray(data.feeds) ? data.feeds : [];
    const byId = {};
    feeds.forEach(f => { byId[f.id] = f; });

    for (const [cardId, feedId] of Object.entries(this.cardToFeed)) {
      const f = byId[feedId];
      if (f && f.status === 'live') this.markLive(cardId);
    }

    const total = data.total || feeds.length || 19;
    const live = data.live != null ? data.live : feeds.filter(f => f.status === 'live').length;

    // Update the hero badge count
    const heroCount = document.querySelector('.hero__badge span:last-child');
    if (heroCount) heroCount.textContent = `${live} of ${total} streams live`;

    // Update status bar
    const statStreams = document.getElementById('stat-streams');
    if (statStreams) statStreams.textContent = `${live} / ${total}`;
  },

  markLive(streamId) {
    const card = document.getElementById(`card-${streamId}`);
    if (!card) return;

    // Pulse the dot green
    const dot = card.querySelector('.stream-card__dot');
    if (dot) dot.classList.add('stream-card__dot--live');

    // Update badge to show confirmed
    const badge = card.querySelector('.stream-card__badge');
    if (badge && badge.textContent === 'Live') {
      badge.textContent = '● Live';
      badge.style.background = 'rgba(0, 255, 136, 0.15)';
      badge.style.color = '#00ff88';
      badge.style.borderColor = 'rgba(0, 255, 136, 0.3)';
    }
  },

  init() {
    this.checkAll();
    // Re-check every 5 minutes
    setInterval(() => this.checkAll(), 5 * 60 * 1000);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => LiveStatus.init());
} else {
  LiveStatus.init();
}
