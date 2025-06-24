import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', event => {
  console.log('Service Worker: Received Push Notification...');

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    notificationData = {
      title: 'Banten Storyteller',
      body: 'You have a new notification',
      icon: '/icons/icon-192x192.png',
    };
  }

  const { title, body, icon, badge, data } = notificationData;

  const defaultOptions = {
    icon: icon || '/icons/icon-192x192.png',
    badge: badge || '/icons/icon-144x144.png',
    vibrate: [200, 100, 200],
    data: data || {},
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/icon-144x144.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-144x144.png',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, {
      ...defaultOptions,
      body: body || 'New story available in Banten Storyteller!',
    })
  );
});

self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(console.log('Background sync: Processing offline tasks...'));
  }
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.0' });
  }
});
