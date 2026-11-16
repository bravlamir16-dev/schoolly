self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// --- ТЕСТОВЫЙ КОД ---
self.addEventListener('push', function(event) {
  const options = {
    body: 'ЭТО ТЕСТОВЫЙ ТЕКСТ! Если ты это видишь, значит всё работает!',
    icon: '/schoolly/public/icon.svg',
    vibrate: [200, 100, 200]
  };
  event.waitUntil(
    self.registration.showNotification('Schoolly ТЕСТ', options)
  );
});
