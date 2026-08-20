const SHELL_CACHE = 'gearstorm-shell-v2.2.0';
const RUNTIME_CACHE = 'gearstorm-runtime-v2.2.0';
const GENERATED_RUNTIME_PREFIX = new URL('./assets/generated/v2.2.0/', self.registration.scope).pathname;
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './game.js',
  './manifest.webmanifest',
  './assets/gearstorm-icon.svg',
  './assets/gearstorm-icon-192.png',
  './assets/gearstorm-icon-512.png',
  './assets/gearstorm-key-art.png',
  './assets/generated/v2.2.0/asset-manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => (key.startsWith('gearstorm-shell-') || key.startsWith('gearstorm-runtime-')) && key !== SHELL_CACHE && key !== RUNTIME_CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

async function cacheFirstRuntime(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  const contentType = response.headers.get('content-type') || '';
  if (response.ok && response.type === 'basic' && /^image\/webp(?:;|$)/i.test(contentType)) {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith(GENERATED_RUNTIME_PREFIX) && url.pathname.endsWith('.webp')) {
    event.respondWith(cacheFirstRuntime(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(SHELL_CACHE);
          await cache.put('./index.html', response.clone());
        }
        return response;
      } catch {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
