const APP_VERSION = '2.9.1';
const ASSET_VERSION = '2.9.1';
const SHELL_CACHE = `gearstorm-shell-v${APP_VERSION}`;
const RUNTIME_CACHE = `gearstorm-runtime-v${ASSET_VERSION}`;
const GENERATED_RUNTIME_PREFIX = new URL(`./assets/generated/v${ASSET_VERSION}/`, self.registration.scope).pathname;
const CORE_ASSETS = [
  './index.html',
  './pwa-update-v2.9.1.js',
  './styles.css',
  './story.js',
  './expansion-story.js',
  './boss-roster.js',
  './game.js',
  './manifest.webmanifest',
  './assets/gearstorm-icon.svg',
  './assets/gearstorm-icon-192.png',
  './assets/gearstorm-icon-512.png',
  './assets/gearstorm-key-art.png',
  `./assets/generated/v${ASSET_VERSION}/asset-manifest.json`,
];
const CORE_PATHS = new Set(CORE_ASSETS.map(asset => new URL(asset, self.registration.scope).pathname));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(CORE_ASSETS)));
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
  if (event.data === 'SKIP_WAITING' || event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

function canonicalRequest(url) {
  return new Request(url.origin + url.pathname, { method: 'GET' });
}

async function cacheFirstRuntime(request, url) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cacheKey = canonicalRequest(url);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const response = await fetch(request);
  const contentType = response.headers.get('content-type') || '';
  if (response.ok && response.type === 'basic' && /^image\/webp(?:;|$)/i.test(contentType)) {
    await cache.put(cacheKey, response.clone());
  }
  return response;
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put('./index.html', response.clone());
    }
    return response;
  } catch {
    return (await caches.match('./index.html')) || Response.error();
  }
}

async function staleWhileRevalidateShell(request, url, event) {
  const cache = await caches.open(SHELL_CACHE);
  const cacheKey = canonicalRequest(url);
  const cached = await cache.match(cacheKey);
  const network = fetch(request).then(async response => {
    if (response.ok && response.type === 'basic') await cache.put(cacheKey, response.clone());
    return response;
  });
  if (!cached) return network;
  event.waitUntil(network.catch(() => undefined));
  return cached;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith(GENERATED_RUNTIME_PREFIX) && url.pathname.endsWith('.webp')) {
    event.respondWith(cacheFirstRuntime(request, url));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (CORE_PATHS.has(url.pathname)) {
    event.respondWith(staleWhileRevalidateShell(request, url, event));
  }
});
