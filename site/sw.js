// ═══════════════════════════════════════════════════════════════════
// TRUTH — Service Worker
// Strategy: Cache shell, network-first for GitHub API data
// ═══════════════════════════════════════════════════════════════════

const CACHE_NAME = 'truth-v4';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/img/icon-512.png',
  '/img/hero-1.png',
  '/img/hero-2.png',
  '/img/hero-3.png',
  '/img/hero-4.png',
];

// Install: cache the app shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // GitHub API & raw content — ALWAYS network-first so data stays fresh
  if (url.hostname === 'api.github.com' || url.hostname === 'raw.githubusercontent.com') {
    e.respondWith(
      fetch(e.request).then(response => {
        // Cache a clone for offline fallback
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => {
        // Offline: serve from cache if available
        return caches.match(e.request);
      })
    );
    return;
  }

  // Google Fonts — cache-first (they never change)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // App shell — stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(cached => {
      const networkFetch = fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});
