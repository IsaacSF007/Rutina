/* Guarda la app en el teléfono para que abra sin internet. Sube el número de versión al cambiar archivos. */
const V = "rutina-v4";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "bsd-700.woff2", "bsd-800.woff2", "figtree-400.woff2", "figtree-600.woff2", "figtree-700.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const page = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html");
  if (page) {
    e.respondWith((async () => {
      const cache = await caches.open(V), saved = await cache.match("index.html");
      const net = fetch(req).then(r => { if (r.ok) cache.put("index.html", r.clone()); return r; });
      if (!saved) return net;
      const wait = new Promise(res => setTimeout(() => res(saved), 2500));
      return Promise.race([net.catch(() => saved), wait]);
    })());
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })));
});
