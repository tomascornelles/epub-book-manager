/* ePub Book Manager — service worker
 * Strategy: the app shell is precached on install. Afterwards every same-origin
 * GET is served stale-while-revalidate: instant offline/cached response, with the
 * cache refreshed in the background. Bump CACHE_VERSION when the shell changes
 * in a way that must not be served stale.
 */
const CACHE_VERSION = "v2";
const CACHE = `epub-book-manager-${CACHE_VERSION}`;
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./favicon.ico"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });

    const network = fetch(req)
      .then(res => {
        if (res.ok && res.type === "basic") cache.put(req, res.clone());
        return res;
      })
      .catch(() => null);

    event.waitUntil(network);
    if (cached) return cached;

    const fresh = await network;
    if (fresh) return fresh;
    // Sin caché y sin red: la navegación cae en la app; el resto falla limpiamente.
    if (req.mode === "navigate") return (await cache.match("./index.html")) || Response.error();
    return Response.error();
  })());
});
