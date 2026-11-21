const CACHE_NAME = 'dotaee-pwa-cache-v5';
const FONT_CACHE_NAME = 'dotaee-fonts-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Non-atomic install: one missing/blocked asset never breaks offline app shell caching
      Promise.allSettled(
        CORE_ASSETS.map((url) =>
          fetch(url, { cache: 'reload' }).then((res) => {
            if (res && res.ok) {
              return cache.put(url, res);
            }
          })
        )
      )
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            // Also purge legacy insecure dotaee-auth-v1 cache automatically
            if (key !== CACHE_NAME && key !== FONT_CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only cache safe GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache GitHub API calls or browser extension requests
  if (url.hostname === 'api.github.com' || !url.protocol.startsWith('http')) {
    return;
  }

  // Google Fonts: stale-while-revalidate with opaque response support (status 0 or 200)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        const networkPromise = fetch(req)
          .then((res) => {
            if (res && (res.status === 200 || res.type === 'opaque')) {
              cache.put(req, res.clone()).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  // Only handle same-origin app assets and navigation; never intercept Vite dev paths
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/')
  ) {
    return;
  }

  // Network-first for HTML navigation with properly awaited offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(req);
          if (networkRes && networkRes.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put('./index.html', networkRes.clone()).catch(() => {});
          }
          return networkRes;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          const fallback = (await cache.match('./index.html')) || (await cache.match('./'));
          if (fallback) return fallback;
          return new Response('حالت آفلاین فعال است و صفحه کش نشده بود.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        }
      })()
    );
    return;
  }

  // Cache-first for Vite-hashed JS/CSS bundles and icons, with network fallback
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const networkRes = await fetch(req);
        if (networkRes && networkRes.ok) {
          cache.put(req, networkRes.clone()).catch(() => {});
        }
        return networkRes;
      } catch {
        return new Response('', { status: 504 });
      }
    })()
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
