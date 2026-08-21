/* LiverLogger service worker — cache-first app shell so the whole app works
   with the phone in airplane mode after the first successful load. Bump
   CACHE_NAME whenever the shipped files change so old caches get replaced. */
var CACHE_NAME = "liverlogger-v2";
var APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./logic.js",
  "./i18n.js",
  "./chart.umd.min.js",
  "./manifest.webmanifest",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Cache-first, falling back to network, falling back to the cached shell
// page for navigations (so a stale offline load never shows a browser error).
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request)
        .then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          }
          return response;
        })
        .catch(function () {
          if (event.request.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});
