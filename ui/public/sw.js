// Service Worker pentru TechAnal PWA - Enhanced Version
const CACHE_NAME = 'techanal-v2.0.0';
const STATIC_CACHE = 'techanal-static-v2';
const DYNAMIC_CACHE = 'techanal-dynamic-v2';
const API_CACHE = 'techanal-api-v2';

// Assets pentru cache - optimizat pentru performance
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/logo96.png',
  '/logo144.png'
];

// API endpoints pentru cache - cu strategii diferite
const API_ENDPOINTS = {
  critical: [
    '/api/ai/status',
    '/api/system/health',
    '/api/auth/verify'
  ],
  important: [
    '/api/ai/providers',
    '/api/system/metrics',
    '/api/user/profile'
  ],
  normal: [
    '/api/ai/analyze',
    '/api/system/logs',
    '/api/user/settings'
  ]
};

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC_FIRST: 'static-first',
  NETWORK_FIRST: 'network-first',
  CACHE_FIRST: 'cache-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache static assets cu strategie optimizată
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Enhanced Service Worker...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache critical API endpoints
      caches.open(API_CACHE).then(cache => {
        console.log('[SW] Caching critical API endpoints');
        return cache.addAll(API_ENDPOINTS.critical);
      })
    ]).then(() => {
      console.log('[SW] All critical assets cached successfully');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Error during installation:', error);
    })
  );
});

// Activate event - clean up old caches și preload important resources
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Enhanced Service Worker...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Preload important resources
      preloadImportantResources(),
      
      // Claim clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service Worker activated successfully');
    })
  );
});

// Fetch event - serve cu strategii avansate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Apply different strategies based on resource type
  if (isStaticAsset(request)) {
    event.respondWith(serveWithStrategy(request, CACHE_STRATEGIES.STATIC_FIRST));
  } else if (isCriticalAPI(request)) {
    event.respondWith(serveWithStrategy(request, CACHE_STRATEGIES.NETWORK_FIRST));
  } else if (isImportantAPI(request)) {
    event.respondWith(serveWithStrategy(request, CACHE_STRATEGIES.STALE_WHILE_REVALIDATE));
  } else if (isNormalAPI(request)) {
    event.respondWith(serveWithStrategy(request, CACHE_STRATEGIES.CACHE_FIRST));
  } else if (isImageRequest(request)) {
    event.respondWith(serveWithStrategy(request, CACHE_STRATEGIES.CACHE_FIRST));
  } else {
    event.respondWith(serveWithStrategy(request, CACHE_STRATEGIES.NETWORK_FIRST));
  }
});

// Enhanced push notification cu rich content
self.addEventListener('push', (event) => {
  console.log('[SW] Enhanced push notification received:', event);

  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Notificare nouă de la TechAnal',
    icon: '/logo192.png',
    badge: '/logo192.png',
    image: data.image || '/logo512.png',
    vibrate: [100, 50, 100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1,
      url: data.url || '/',
      category: data.category || 'general'
    },
    actions: [
      {
        action: 'view',
        title: 'Vezi',
        icon: '/logo192.png'
      },
      {
        action: 'dismiss',
        title: 'Închide',
        icon: '/logo192.png'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    tag: data.tag || 'default',
    renotify: data.renotify || true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'TechAnal', options)
  );
});

// Enhanced notification click cu navigation inteligentă
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Enhanced notification clicked:', event);

  event.notification.close();

  const data = event.notification.data;
  const url = data?.url || '/';

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'dismiss') {
    // Do nothing, notification already closed
  } else {
    // Default action - open app și focus
    event.waitUntil(
      Promise.all([
        clients.openWindow(url),
        clients.matchAll().then(clients => {
          clients.forEach(client => {
            if (client.url.includes(url) && 'focus' in client) {
              return client.focus();
            }
          });
        })
      ])
    );
  }
});

// Enhanced background sync cu retry logic
self.addEventListener('sync', (event) => {
  console.log('[SW] Enhanced background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(performEnhancedBackgroundSync());
  } else if (event.tag === 'data-sync') {
    event.waitUntil(performDataSync());
  } else if (event.tag === 'notification-sync') {
    event.waitUntil(performNotificationSync());
  }
});

// Message event pentru communication cu main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCaches());
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

// Helper functions
function isStaticAsset(request) {
  return STATIC_ASSETS.some(asset => request.url.includes(asset));
}

function isCriticalAPI(request) {
  return API_ENDPOINTS.critical.some(api => request.url.includes(api));
}

function isImportantAPI(request) {
  return API_ENDPOINTS.important.some(api => request.url.includes(api));
}

function isNormalAPI(request) {
  return API_ENDPOINTS.normal.some(api => request.url.includes(api));
}

function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

// Cache strategies implementation
async function serveWithStrategy(request, strategy) {
  try {
    switch (strategy) {
      case CACHE_STRATEGIES.STATIC_FIRST:
        return await serveStaticFirst(request);
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await serveNetworkFirst(request);
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await serveCacheFirst(request);
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await serveStaleWhileRevalidate(request);
      default:
        return await serveNetworkFirst(request);
    }
  } catch (error) {
    console.error(`[SW] Error serving request with strategy ${strategy}:`, error);
    return new Response('Service Unavailable', { status: 503 });
  }
}

async function serveStaticFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline - Static asset not available', { status: 503 });
  }
}

async function serveNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline - Resource not available', { status: 503 });
  }
}

async function serveCacheFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline - Resource not available', { status: 503 });
  }
}

async function serveStaleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Return cached response immediately if available
  if (cachedResponse) {
    // Revalidate in background
    fetch(request).then(async (networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
    }).catch(console.error);
    
    return cachedResponse;
  }

  // If no cache, try network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline - Resource not available', { status: 503 });
  }
}

// Enhanced background sync functions
async function performEnhancedBackgroundSync() {
  try {
    console.log('[SW] Performing enhanced background sync...');

    const pendingData = await getPendingData();
    const results = [];

    for (const data of pendingData) {
      try {
        const result = await syncData(data);
        results.push({ success: true, data: result });
        await removePendingData(data.id);
      } catch (error) {
        console.error('[SW] Error syncing data:', error);
        results.push({ success: false, data, error: error.message });
      }
    }

    console.log('[SW] Enhanced background sync completed:', results);
    
    // Show notification with results
    if (results.length > 0) {
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      if (successCount > 0) {
        await self.registration.showNotification('Sync Completed', {
          body: `Successfully synced ${successCount}/${totalCount} items`,
          icon: '/logo192.png',
          tag: 'sync-complete'
        });
      }
    }
  } catch (error) {
    console.error('[SW] Enhanced background sync failed:', error);
  }
}

async function performDataSync() {
  try {
    console.log('[SW] Performing data sync...');
    // Implement data synchronization logic
  } catch (error) {
    console.error('[SW] Data sync failed:', error);
  }
}

async function performNotificationSync() {
  try {
    console.log('[SW] Performing notification sync...');
    // Implement notification synchronization logic
  } catch (error) {
    console.error('[SW] Notification sync failed:', error);
  }
}

// Cache management functions
async function preloadImportantResources() {
  try {
    const cache = await caches.open(API_CACHE);
    const promises = API_ENDPOINTS.important.map(endpoint => {
      return fetch(endpoint).then(response => {
        if (response.ok) {
          return cache.put(endpoint, response);
        }
      }).catch(console.error);
    });
    
    await Promise.all(promises);
    console.log('[SW] Important resources preloaded');
  } catch (error) {
    console.error('[SW] Error preloading resources:', error);
  }
}

async function updateCaches() {
  try {
    console.log('[SW] Updating caches...');
    // Implement cache update logic
  } catch (error) {
    console.error('[SW] Error updating caches:', error);
  }
}

async function clearAllCaches() {
  try {
    console.log('[SW] Clearing all caches...');
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Error clearing caches:', error);
  }
}

// Mock functions for background sync
async function getPendingData() {
  // In real app, get from IndexedDB
  return [];
}

async function syncData(data) {
  // In real app, sync with server
  console.log('[SW] Syncing data:', data);
}

async function removePendingData(id) {
  // In real app, remove from IndexedDB
  console.log('[SW] Removing pending data:', id);
}

console.log('[SW] Enhanced Service Worker loaded successfully');

