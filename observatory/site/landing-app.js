/**
 * ═══════════════════════════════════════════════════════════
 *  Truth Observatory — Frontend Application
 *  DarkWave Studios LLC — Copyright 2026
 *
 *  Compiled from app.lume (source of truth)
 *  Architecture: DDA 42-Doctrine
 * ═══════════════════════════════════════════════════════════
 */

(function observatory() {
  'use strict';

  // ── Scroll Reveal Engine ─────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });

  // ── 3D Tilt Card Engine ──────────────────────────────────
  const cards = document.querySelectorAll('.stream-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = ((y - centerY) / centerY) * -8;
      const tiltY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });

  // ── Ken Burns Slideshow ────────────────────────────────────
  const slides = document.querySelectorAll('.hero__slide');
  if (slides.length > 1) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('hero__slide--active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('hero__slide--active');
    }, 8000);
  }

  // ── Carousel Navigation ────────────────────────────────────
  // For each .carousel-wrapper, wire up arrows and dots
  const wrappers = document.querySelectorAll('.carousel-wrapper');

  wrappers.forEach((wrapper) => {
    const carousel = wrapper.querySelector('.stream-carousel');
    const cards = carousel.querySelectorAll('.stream-card');
    const prevBtn = wrapper.querySelector('.carousel-arrow--prev');
    const nextBtn = wrapper.querySelector('.carousel-arrow--next');
    const dotsContainer = wrapper.querySelector('.carousel-dots');
    const navContainer = wrapper.querySelector('.carousel-nav');

    if (!carousel || cards.length === 0) return;

    // Check if carousel actually overflows — hide nav if all cards fit
    function checkOverflow() {
      const hasOverflow = carousel.scrollWidth > carousel.clientWidth + 4;
      if (navContainer) {
        navContainer.style.display = hasOverflow ? 'flex' : 'none';
      }
    }

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    // Generate dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' carousel-dot--active' : '');
      dot.setAttribute('aria-label', 'Go to card ' + (i + 1));
      dot.addEventListener('click', () => scrollToCard(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    function updateDots() {
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(carousel).gap) || 16;
      const activeIndex = Math.round(scrollLeft / cardWidth);

      dots.forEach((dot, i) => {
        dot.classList.toggle('carousel-dot--active', i === activeIndex);
      });
    }

    function scrollToCard(index) {
      const cardWidth = cards[0].offsetWidth + (parseInt(getComputedStyle(carousel).gap) || 16);
      carousel.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    }

    // Arrow handlers
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + (parseInt(getComputedStyle(carousel).gap) || 16);
        carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const cardWidth = cards[0].offsetWidth + (parseInt(getComputedStyle(carousel).gap) || 16);
        carousel.scrollBy({ left: cardWidth, behavior: 'smooth' });
      });
    }

    // Update dots on scroll
    carousel.addEventListener('scroll', () => {
      requestAnimationFrame(updateDots);
    });
  });

  // ── Card Click-Through Navigation ──────────────────────────
  // Live cards navigate to their detail page; planned cards do nothing.
  document.querySelectorAll('.stream-card[data-stream]').forEach((card) => {
    // Only make "Live" cards clickable (not --planned)
    if (card.classList.contains('stream-card--planned')) return;

    card.style.cursor = 'pointer';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');

    card.addEventListener('click', () => {
      const streamId = card.getAttribute('data-stream');
      if (streamId) window.location.href = `stream?stream=${streamId}`;
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // ── Live Feed Metrics on Cards ────────────────────────────
  const FEEDS_API = 'https://observatory-sentinel.tlid.io/api/feeds';

  // Map card data-stream IDs → server feed IDs (where they differ)
  const FEED_ID_MAP = {
    seismic: 'earthquake',
    iono: 'ionosonde',
    blitz: 'blitzortung',
    haarp: 'heater',
    chemistry: 'deposition',
  };

  function formatAge(ms) {
    if (!ms || ms < 0) return '—';
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
  }

  async function fetchFeedMetrics() {
    try {
      const res = await fetch(FEEDS_API);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.feeds) return;

      // Build lookup by server feed ID
      const feedMap = {};
      data.feeds.forEach((f) => { feedMap[f.id] = f; });

      // Inject metrics into each card
      document.querySelectorAll('.stream-card[data-stream]').forEach((card) => {
        const cardId = card.getAttribute('data-stream');
        const serverId = FEED_ID_MAP[cardId] || cardId;
        const feed = feedMap[serverId];
        if (!feed) return;

        // Find or create the live-metric element
        let metricEl = card.querySelector('.stream-card__live-metric');
        if (!metricEl) {
          metricEl = document.createElement('div');
          metricEl.className = 'stream-card__live-metric';
          metricEl.style.cssText = 'display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0 0;margin-top:0.4rem;border-top:1px solid rgba(255,255,255,0.06);font-family:var(--font-mono);font-size:0.65rem;color:var(--text-muted);letter-spacing:0.03em;';
          const body = card.querySelector('.stream-card__body');
          if (body) body.appendChild(metricEl);
        }

        // Status indicator
        const statusColor = feed.status === 'live' ? '#00ff88' : feed.status === 'stale' ? '#f0a030' : '#ff4444';
        const statusLabel = feed.status === 'live' ? 'LIVE' : feed.status === 'stale' ? 'STALE' : 'OFFLINE';

        metricEl.innerHTML = `
          <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};box-shadow:0 0 4px ${statusColor};flex-shrink:0;"></span>
          <span>${statusLabel}</span>
          <span style="color:rgba(255,255,255,0.15);">·</span>
          <span>${formatAge(feed.ageMs)}</span>
          <span style="color:rgba(255,255,255,0.15);">·</span>
          <span>${feed.entries} entries</span>
        `;

        // Update the dot indicator color based on live status
        const dot = card.querySelector('.stream-card__dot');
        if (dot && feed.status !== 'live') {
          dot.style.background = statusColor;
          dot.style.boxShadow = `0 0 6px ${statusColor}`;
        }
      });
    } catch (err) {
      console.warn('[Observatory] Feed metrics:', err.message);
    }
  }

  // Fetch on load and every 60s
  fetchFeedMetrics();
  setInterval(fetchFeedMetrics, 60000);

  // ── Correlation Engine — Pattern Fetcher ──────────────────
  const CORRELATION_API = 'https://observatory-sentinel.tlid.io/api/correlations';
  const EVENTS_API = 'https://observatory-sentinel.tlid.io/api/events';

  async function fetchCorrelations() {
    try {
      const res = await fetch(CORRELATION_API);
      if (!res.ok) return;
      const data = await res.json();

      // Update stats
      const el = (id) => document.getElementById(id);
      if (data.totalObservations != null) el('corr-observations').textContent = data.totalObservations.toLocaleString();
      if (data.totalDeviations != null) el('corr-deviations').textContent = data.totalDeviations.toLocaleString();
      if (data.patterns) el('corr-patterns').textContent = data.patterns.length;

      // Render pattern cards
      const carousel = document.getElementById('pattern-carousel');
      if (!carousel || !data.patterns || data.patterns.length === 0) return;

      carousel.innerHTML = '';

      data.patterns.forEach((pattern) => {
        const confColor = pattern.confidence === 'HIGH' ? '#00ff88'
          : pattern.confidence === 'MODERATE' ? '#f0a030'
          : '#888';

        const feedTags = (pattern.domains || []).map(d =>
          '<span style="display:inline-block;padding:0.15rem 0.5rem;font-size:0.65rem;font-family:var(--font-mono);border:1px solid var(--border-dim);border-radius:100px;margin:0.15rem;letter-spacing:0.05em;">' + d + '</span>'
        ).join('');

        const lagText = pattern.avgLagMinutes === 0 ? 'Simultaneous'
          : pattern.avgLagMinutes > 0 ? `+${pattern.avgLagMinutes}m lag`
          : `${pattern.avgLagMinutes}m lag`;

        const card = document.createElement('article');
        card.className = 'stream-card reveal visible';
        card.style.cssText = 'min-width: 320px; max-width: 420px; flex-shrink: 0;';
        card.innerHTML = `
          <div class="stream-card__color-bar" style="background: ${confColor};"></div>
          <div class="stream-card__body" style="padding: 1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
              <h3 class="stream-card__title" style="font-size:1rem;">${pattern.title}</h3>
              <span style="font-family:var(--font-mono);font-size:0.65rem;padding:0.2rem 0.5rem;border-radius:100px;border:1px solid ${confColor};color:${confColor};text-transform:uppercase;letter-spacing:0.08em;">${pattern.confidence}</span>
            </div>
            <p class="stream-card__desc" style="font-size:0.8rem;line-height:1.5;margin-bottom:0.75rem;">${pattern.summary}</p>
            <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border-dim);border-radius:var(--radius-md);padding:0.75rem;margin-bottom:0.75rem;">
              <p style="font-family:var(--font-mono);font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-muted);margin-bottom:0.35rem;">⚖ Skeptic Engine</p>
              <p style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">${pattern.skepticNote || 'No counter-explanation generated.'}</p>
            </div>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
              ${feedTags}
              <span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-muted);margin-left:auto;">${pattern.occurrences} events · ${lagText}</span>
            </div>
            <p style="font-family:var(--font-mono);font-size:0.6rem;color:var(--text-muted);margin-top:0.5rem;text-transform:uppercase;letter-spacing:0.08em;">${pattern.verdict || 'CORRELATION OBSERVED — NOT CAUSATION'}</p>
          </div>
        `;
        carousel.appendChild(card);
      });

      // Re-init carousel for the new pattern cards
      initPatternCarousel();
    } catch (err) {
      console.warn('[Observatory] Correlation fetch:', err.message);
    }
  }

  function initPatternCarousel() {
    const wrapper = document.querySelector('#correlation-engine .carousel-wrapper');
    if (!wrapper) return;
    const carousel = wrapper.querySelector('.stream-carousel');
    const cards = carousel.querySelectorAll('.stream-card');
    const prevBtn = wrapper.querySelector('.carousel-arrow--prev');
    const nextBtn = wrapper.querySelector('.carousel-arrow--next');
    const dotsContainer = wrapper.querySelector('.carousel-dots');

    if (cards.length <= 1) return;
    const cardWidth = cards[0].offsetWidth + 16;

    if (prevBtn) prevBtn.addEventListener('click', () => carousel.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => carousel.scrollBy({ left: cardWidth, behavior: 'smooth' }));

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      const pages = Math.ceil(cards.length / Math.max(1, Math.floor(carousel.offsetWidth / cardWidth)));
      for (let i = 0; i < Math.min(pages, 12); i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:var(--text-muted);cursor:pointer;transition:background 0.3s;';
        dot.addEventListener('click', () => carousel.scrollTo({ left: i * cardWidth * Math.floor(carousel.offsetWidth / cardWidth), behavior: 'smooth' }));
        dotsContainer.appendChild(dot);
      }
      carousel.addEventListener('scroll', () => {
        const page = Math.round(carousel.scrollLeft / (cardWidth * Math.floor(carousel.offsetWidth / cardWidth)));
        dotsContainer.querySelectorAll('.carousel-dot').forEach((d, j) => {
          d.style.background = j === page ? 'var(--text-primary)' : 'var(--text-muted)';
        });
      });
    }
  }

  // Fetch correlations on load and every 60s
  fetchCorrelations();
  setInterval(fetchCorrelations, 60000);

  console.log('✦ Truth Observatory — online');
})();
