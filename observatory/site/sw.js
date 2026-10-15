// Truth Observatory — Service Worker
// Caches shell assets for offline splash + fast reload
const CACHE_NAME = 'observatory-v21';
const SHELL_ASSETS = [
  '/',
  '/landing.css',
  '/style.css',
  '/levels.js',
  '/app.js',
  '/cockpit',
  '/assets/icon-512.jpg',
  '/today',
  '/now.js',
  '/now.css',
  '/today.js',
  '/home.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // API: network only, with an offline JSON fallback
  if (req.url.includes('/api/')) {
    event.respondWith(
      fetch(req).catch(() => new Response('{"offline":true}', {
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }
  // Pages + assets: network-first so deploys show up immediately;
  // fall back to the cached copy only when offline.
  event.respondWith(
    fetch(req).then(res => {
      if (res && res.ok && new URL(req.url).origin === self.location.origin) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req))
  );
});
