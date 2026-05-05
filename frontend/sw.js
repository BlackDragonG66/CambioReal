const CACHE_NAME = "reto-diario-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/css/main.css",
  "/js/app.js",
  "/js/api.js",
  "/js/auth.js",
  "/js/dashboard.js",
  "/js/calendar.js",
  "/js/rewards.js",
  "/js/profile.js",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) return; // Never cache API calls
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
