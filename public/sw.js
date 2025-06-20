import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

const APP_SHELL_CACHE = 'app-shell-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const appShellFiles = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/styles/styles.css',
  '/src/scripts/index.js',
  '/src/scripts/pages/app.js',
  '/src/scripts/routes/index.js',
  '/src/scripts/utils/index.js',
  '/src/scripts/utils/auth.js',
  '/src/scripts/utils/notification-helper.js',
  '/images/logo-banten.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching App Shell files');
        return cache.addAll(appShellFiles);
      })
      .then(() => {
        console.log('Service Worker: App Shell cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache App Shell', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== APP_SHELL_CACHE &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE
            ) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      caches
        .match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request);
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
  } else if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      caches
        .match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request).then(fetchResponse => {
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return fetchResponse;
          });
        })
        .catch(() => {
          if (request.destination === 'image') {
            return caches.match('/images/logo-banten.png');
          }
          return new Response('Offline content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        })
    );
  } else if (
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com'
  ) {
    event.respondWith(
      new StaleWhileRevalidate({
        cacheName: 'google-fonts',
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxAgeSeconds: 60 * 60 * 24 * 365,
            maxEntries: 30,
          }),
        ],
      }).handle(event)
    );
  } else if (url.origin === 'https://unpkg.com' || url.origin === 'https://cdnjs.cloudflare.com') {
    event.respondWith(
      new CacheFirst({
        cacheName: 'cdn-resources',
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxAgeSeconds: 60 * 60 * 24 * 7,
            maxEntries: 50,
          }),
        ],
      }).handle(event)
    );
  } else {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
            return new Response('Offline content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain',
              }),
            });
          });
        })
    );
  }
});

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
