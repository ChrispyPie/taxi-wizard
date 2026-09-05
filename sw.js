self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open("tw-0.1.8").then(function (c) {
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
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== "tw-0.1.8"; }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open("tw-0.1.8").then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});
