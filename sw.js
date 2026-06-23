// WornSecret Service Worker
const CACHE = 'wornsecret-v1';
const PRECACHE = [
  '/',
  '/annunci',
  '/blog',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install: pre-cache core pages
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE).catch(function () {});
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
  console.log('[WornSecret] SW attivo');
});

// Fetch strategy:
// - Navigation (HTML pages): network-first, fall back to cache, then offline page
// - Other (images, css): cache-first, fall back to network
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  // Never cache API calls (counter) or Formspree
  var url = new URL(req.url);
  if (url.pathname.startsWith('/api/') || url.hostname.indexOf('formspree') !== -1 || url.hostname.indexOf('supabase') !== -1) {
    return; // let it go straight to network
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (cached) {
            return cached || caches.match('/offline.html');
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      return cached || fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
    })
  );
});
