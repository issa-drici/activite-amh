// Service Worker personnalisé pour les notifications de mise à jour
const CACHE_NAME = 'amh-app-v1';

// Écouter l'installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

// Écouter l'activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression du cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Écouter les messages du client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Mise à jour forcée demandée');
    self.skipWaiting();
  }
});

// Stratégie de cache : Network First avec fallback
self.addEventListener('fetch', (event) => {
  // Ne pas intercepter les requêtes API
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback vers le cache
        return caches.match(event.request);
      })
  );
}); 