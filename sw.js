const CACHE = 'greenthumb-shell-v2';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/greenthumb-logo.jpeg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).catch(() => caches.match('./index.html'))));
});
