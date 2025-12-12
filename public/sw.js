// Service Worker for Punter's Journal PWA
// Version: 1.0.0

const CACHE_NAME = 'punters-journal-v1';
const RUNTIME_CACHE = 'punters-journal-runtime-v1';
const DATA_CACHE = 'punters-journal-data-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/bets',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('[Service Worker] Cache addAll error:', err);
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old caches that don't match current version
            return (
              cacheName !== CACHE_NAME &&
              cacheName !== RUNTIME_CACHE &&
              cacheName !== DATA_CACHE
            );
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except for our API)
  if (url.origin !== location.origin && !url.pathname.startsWith('/api/')) {
    return;
  }

  // Handle API requests (bets data)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('supabase')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Clone the response
            const responseToCache = response.clone();

            // Cache successful GET requests for bets data
            if (
              request.method === 'GET' &&
              response.status === 200 &&
              (url.pathname.includes('bets') ||
                url.pathname.includes('supabase') ||
                url.pathname.includes('insights'))
            ) {
              cache.put(request, responseToCache);
            }

            return response;
          })
          .catch(() => {
            // If network fails, try to serve from cache
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline response if no cache
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'You are offline. Showing cached data.',
                }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' },
                }
              );
            });
          });
      })
    );
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If offline, try to serve from cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback to index.html for SPA routing
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Handle static assets (JS, CSS, images, fonts)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline fallback for images
          if (request.destination === 'image') {
            return new Response('', { status: 404 });
          }
        });
    })
  );
});

// Background sync for offline bet submissions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bets') {
    event.waitUntil(syncBets());
  }
});

async function syncBets() {
  // This would sync any pending bets that were created offline
  // Implementation would depend on your offline storage strategy
  console.log('[Service Worker] Syncing bets...');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
  };

  event.waitUntil(
    self.registration.showNotification('Punter\'s Journal', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

