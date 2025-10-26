// src/sw.ts  —— 简易离线缓存（vite-plugin-pwa 或 workbox）
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open('static-v1').then(cache =>
      cache.addAll(['/', '/index.html', '/manifest.webmanifest'])
    )
  );
});

self.addEventListener('fetch', (event: any) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(resp => {
      // 只缓存GET的静态资源
      if (req.method === 'GET' && resp.status === 200 && resp.type === 'basic') {
        const respClone = resp.clone();
        caches.open('static-v1').then(cache => cache.put(req, respClone));
      }
      return resp;
    }).catch(() => cached))
  );
});