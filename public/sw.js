self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

self.addEventListener('push', function(event) {
  const options = {
    body: 'ТЕКСТ ИЗ КОДА! ВСЁ РАБОТАЕТ!',
    icon: '/schoolly/public/icon.svg', 
    badge: '/schoolly/public/icon.svg', 
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification('Schoolly ТЕСТ', options)
  );
});
