const CACHE = "alyx-grimoire-v3";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: always fetch fresh from network, cache only as offline fallback.
// App updates now deploy automatically — no cache clearing ever needed.
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  e.respondWith(
    fetch(e.request)
      .then(networkRes => {
        const copy = networkRes.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return networkRes;
      })
      .catch(() => caches.match(e.request))
  );
});
