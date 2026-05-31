/* ============================================================
   ERIKA ESPINDOLA - sw.js
   Service Worker / PWA Cache
   v3 — CMS Firebase real, legal-loader e cache menos agressivo
   ============================================================ */

const CACHE_NAME = 'erika-site-v3';

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './cms-defaults.js',
  './manifest.json',
  './privacy.html',
  './terms.html',
  './assets/img/erika-hero.jpg',
  './assets/img/erika-experiencia.jpg',
  './assets/img/espaco-consultorio.jpg',
  './assets/img/espaco-jardim.jpg',
  './assets/img/espaco-sala.jpg',
  './assets/img/decorativo-diario.png',
  './assets/img/decorativo-agua.png',
  './assets/icons/favicon.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

async function cacheStaticAssets() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(
    STATIC_ASSETS.map(async (asset) => {
      try {
        const response = await fetch(asset, { cache: 'reload' });
        if (response.ok) {
          await cache.put(asset, response);
        }
      } catch (error) {
        // Optional asset: keep install resilient for GitHub Pages deploys.
      }
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheStaticAssets());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Não cachear admin, Firebase, config local ou APIs externas
  if (
    request.method !== 'GET' ||
    url.pathname.includes('admin') ||
    url.pathname.endsWith('/firebase-config.js') ||
    url.pathname.endsWith('/cms-loader.js') ||
    url.pathname.endsWith('/legal-loader.js') ||
    url.hostname.includes('firestore') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return (await cache.match(request)) || cache.match(fallbackUrl);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetched = fetch(request)
    .then((response) => {
      if (response.ok && response.type === 'basic') {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetched;
}
