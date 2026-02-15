const CACHE_NAME = "cartera-offline-v1";

const urlsToCache = [
  "/",
  "/index.html"
];

// INSTALACIÓN
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// ACTIVAR
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// OFFLINE REAL
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match("/index.html"))
  );
});