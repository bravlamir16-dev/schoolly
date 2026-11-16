
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// --- НОВЫЙ КОД ДЛЯ УВЕДОМЛЕНИЙ ---
self.addEventListener('push', function(event) {
  let data = { title: 'Schoolly', body: 'Приближается дедлайн задания!' };
  
  if (event.data) {
    try {
      let payload = event.data.json();
      if (payload.title) data.title = payload.title;
      if (payload.body) data.body = payload.body;
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/schoolly/public/icon.svg', 
    badge: '/schoolly/public/icon.svg',
    vibrate: [200, 100, 200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/schoolly/')
  );
});
