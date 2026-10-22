const C = "readalong-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "src/styles.css", "src/app.js", "src/logic.js", "src/glossary.js", "src/passages.js"];
self.addEventListener("install", (e) => e.waitUntil(caches.open(C).then((c) => c.addAll(FILES))));
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k))))));
self.addEventListener("fetch", (e) => e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))));
