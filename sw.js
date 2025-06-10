const CACHE_NAME = 'knetenking-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/vertraege.html',
  '/to-do.html',
  '/Einkaufsliste.html',
  '/settings.html',
  '/script.js',
  '/sw-register.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
