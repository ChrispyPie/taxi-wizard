self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open("tw-0.1.0").then(function (c) {
      return c.addAll([
        "./",
        "index.html",
        "css/shell.css",
        "js/shell.js",
        "js/registry.js",
        "manifest.webmanifest"
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return hit || fetch(e.request);
    })
  );
});
