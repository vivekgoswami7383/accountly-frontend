const BUILD_ID = '__BUILD_ID__';
const STATIC_CACHE = 'accountly-static';
const SHELL_CACHE = 'accountly-shell';
const FONT_CACHE = 'accountly-fonts';
const MAX_STATIC_ENTRIES = 300;
const SHELL_FILES = ['/manifest.json', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/favicon.svg'];

const assetUrlsFrom = async () => {
  const response = await fetch('/asset-manifest.json', { cache: 'no-store' });
  const manifest = await response.json();
  return Object.values(manifest.files || {}).filter((url) => typeof url === 'string' && url.startsWith('/static/') && /\.(js|css)$/.test(url));
};

const precache = async () => {
  const shell = await caches.open(SHELL_CACHE);
  const staticCache = await caches.open(STATIC_CACHE);
  const response = await fetch('/', { cache: 'no-store' });
  await shell.put('/', response);
  const urls = await assetUrlsFrom();
  await Promise.all(
    urls.map(async (url) => {
      if (await staticCache.match(url)) return;
      await staticCache.add(url).catch(() => undefined);
    })
  );
  await Promise.all(SHELL_FILES.map((url) => shell.add(url).catch(() => undefined)));
};

const trimStatic = async () => {
  const cache = await caches.open(STATIC_CACHE);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_STATIC_ENTRIES)).map((key) => cache.delete(key)));
};

self.addEventListener('install', (event) => {
  event.waitUntil(precache().catch(() => undefined).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(trimStatic().then(() => self.clients.claim()));
});

const networkFirstShell = async (request) => {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put('/', response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match('/');
    if (cached) return cached;
    throw error;
  }
};

const cacheFirst = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
};

const staleWhileRevalidate = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || refresh;
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    }
    return;
  }

  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstShell(request));
    return;
  }

  if (url.pathname.startsWith('/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
});
