/**
 * TRUTH Observatory — Dashboard Application
 * DarkWave Studios LLC — Copyright 2026
 *
 * Polls the Observatory API, renders feed status cards with sparklines,
 * detected patterns, and manages carousel navigation + 3D tilt effects.
 */

(function() {
  'use strict';

  const API_BASE = '';  // Same origin
  const POLL_INTERVAL = 30000;  // 30 seconds

  // ═══════════════════════════════════════════════════════════════════════
  // Reveal Observer
  // ═══════════════════════════════════════════════════════════════════════
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
    });
  }, 100);

  // ═══════════════════════════════════════════════════════════════════════
  // 3D Tilt Effect
  // ═══════════════════════════════════════════════════════════════════════
  function applyTilt(card) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Sparkline Renderer (Canvas)
  // ═══════════════════════════════════════════════════════════════════════
  function renderSparkline(canvas, data, status) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;
    ctx.clearRect(0, 0, w, h);

    if (!data || data.length === 0) return;

    const max = Math.max(...data, 1);
    const barW = Math.floor(w / data.length) - 1;
    const colorMap = { live: '#2ecc71', stale: '#e67e22', offline: '#e74c3c' };
    const baseColor = colorMap[status] || '#888';

    for (let i = 0; i < data.length; i++) {
      const barH = (data[i] / max) * (h - 4);
      const x = i * (barW + 1);
      const y = h - barH;

      // Gradient: stronger for more recent bars
      const alpha = 0.25 + (i / data.length) * 0.75;
      ctx.fillStyle = baseColor;
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, y, barW, barH);
    }
    ctx.globalAlpha = 1;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Time Formatter
  // ═══════════════════════════════════════════════════════════════════════
  function timeAgo(ts) {
    if (!ts) return 'never';
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return Math.floor(diff / 86400000) + 'd ago';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Feed Grid Renderer
  // ═══════════════════════════════════════════════════════════════════════
  function renderFeeds(data) {
    const grid = document.getElementById('feed-grid');
    if (!data || !data.feeds) {
      grid.innerHTML = '<div class="feed-loading">Unable to connect to sensor array</div>';
      return;
    }

    grid.innerHTML = '';

    data.feeds.forEach(feed => {
      const card = document.createElement('div');
      card.className = 'feed-card';
      card.innerHTML = `
        <div class="feed-icon">${feed.icon}</div>
        <div class="feed-name">${feed.name}</div>
        <div class="feed-domain">${feed.domain}</div>
        <div class="feed-meta">
          <div class="feed-status-badge ${feed.status}">
            <div class="badge-dot"></div>
            ${feed.status.toUpperCase()}
          </div>
          <div class="feed-entries">${feed.entries.toLocaleString()} records</div>
        </div>
        <div class="feed-last">Last: ${timeAgo(feed.last)}</div>
        <div class="sparkline-wrap">
          <canvas class="sparkline-canvas"></canvas>
        </div>
      `;

      grid.appendChild(card);
      applyTilt(card);

      // Render sparkline after DOM insertion
      requestAnimationFrame(() => {
        const canvas = card.querySelector('.sparkline-canvas');
        if (canvas) renderSparkline(canvas, feed.sparkline, feed.status);
      });
    });

    // Update hero stats
    const statsEl = document.getElementById('hero-stats');
    const liveCount = data.feeds.filter(f => f.status === 'live').length;
    const totalEntries = data.feeds.reduce((sum, f) => sum + f.entries, 0);
    statsEl.innerHTML = `
      <div class="hero-stat">
        <div class="hero-stat-value">${data.total}</div>
        <div class="hero-stat-label">SENSOR FEEDS</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">${liveCount}</div>
        <div class="hero-stat-label">LIVE</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">${formatCount(totalEntries)}</div>
        <div class="hero-stat-label">TOTAL RECORDS</div>
      </div>
      <div class="hero-stat">
        <div class="hero-stat-value">SHA-256</div>
        <div class="hero-stat-label">HASH ALGORITHM</div>
      </div>
    `;

    // Update nav status
    const navDot = document.getElementById('nav-dot');
    const navText = document.getElementById('nav-status-text');
    if (liveCount > 0) {
      navDot.className = 'status-dot live';
      navText.textContent = liveCount + '/' + data.total + ' LIVE';
    } else {
      navDot.className = 'status-dot';
      navText.textContent = 'OFFLINE';
    }

    // Build carousel dots
    buildCarouselDots('feed-grid', 'feeds-dots', 'feeds-prev', 'feeds-next');
  }

  function formatCount(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Pattern Renderer
  // ═══════════════════════════════════════════════════════════════════════
  function renderPatterns(data) {
    const carousel = document.getElementById('pattern-carousel');
    const nav = document.getElementById('pattern-nav');

    if (!data || !data.events || data.events.length === 0) {
      carousel.innerHTML = `
        <div class="pattern-empty">
          Pattern engine is collecting baseline data.<br>
          Correlations will appear here when 2+ feeds show coincident anomalies.
        </div>
      `;
      nav.style.display = 'none';
      return;
    }

    nav.style.display = 'flex';
    carousel.innerHTML = '';

    data.events.forEach(evt => {
      const card = document.createElement('div');
      card.className = 'pattern-card';

      const feedTags = (evt.feeds || []).map(f =>
        '<span class="pattern-feed-tag">' + f + '</span>'
      ).join('');

      card.innerHTML = `
        <div class="pattern-title">${evt.title || 'Unnamed Pattern'}</div>
        <div class="pattern-confidence">${(evt.confidence || 'UNKNOWN').toUpperCase()}</div>
        <div class="pattern-summary">${evt.summary || ''}</div>
        <div class="pattern-skeptic">
          <strong>⚖ Skeptic:</strong> ${evt.skepticNote || 'No counter-explanation generated.'}
        </div>
        <div class="pattern-feeds">${feedTags}</div>
      `;

      carousel.appendChild(card);
      applyTilt(card);
    });

    buildCarouselDots('pattern-carousel', 'patterns-dots', 'patterns-prev', 'patterns-next');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Carousel Navigation
  // ═══════════════════════════════════════════════════════════════════════
  function buildCarouselDots(trackId, dotsId, prevId, nextId) {
    const track = document.getElementById(trackId);
    const dotsContainer = document.getElementById(dotsId);
    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);

    if (!track || !dotsContainer) return;

    const cards = track.children;
    const count = cards.length;
    if (count <= 1) { dotsContainer.innerHTML = ''; return; }

    // How many dots? Based on visible cards
    const cardWidth = cards[0] ? cards[0].offsetWidth + 12 : 280;
    const visible = Math.floor(track.offsetWidth / cardWidth) || 1;
    const pages = Math.ceil(count / visible);

    dotsContainer.innerHTML = '';
    for (let i = 0; i < Math.min(pages, 12); i++) {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        track.scrollTo({ left: i * cardWidth * visible, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
    }

    // Scroll handler to update dots
    track.addEventListener('scroll', () => {
      const scrollPos = track.scrollLeft;
      const currentPage = Math.round(scrollPos / (cardWidth * visible));
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentPage);
      });
    });

    // Arrow buttons
    if (prevBtn) prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Data Fetching
  // ═══════════════════════════════════════════════════════════════════════
  async function fetchFeeds() {
    try {
      const res = await fetch(API_BASE + '/api/feeds');
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      renderFeeds(data);
    } catch (err) {
      console.error('[Observatory] Feed fetch error:', err);
      renderFeeds(null);
    }
  }

  async function fetchPatterns() {
    try {
      const res = await fetch(API_BASE + '/api/events');
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      renderPatterns(data);
    } catch (err) {
      console.error('[Observatory] Pattern fetch error:', err);
      renderPatterns(null);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Init
  // ═══════════════════════════════════════════════════════════════════════
  fetchFeeds();
  fetchPatterns();

  // Poll
  setInterval(fetchFeeds, POLL_INTERVAL);
  setInterval(fetchPatterns, POLL_INTERVAL * 2);

  // Handle window resize for sparklines
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      document.querySelectorAll('.sparkline-canvas').forEach(c => {
        // Re-render on resize — data is in feed status, but for now just clear
        // Next fetch cycle will re-render
      });
    }, 250);
  });

})();
