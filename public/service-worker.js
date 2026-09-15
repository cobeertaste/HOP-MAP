const CACHE_VERSION = 'v5';
const STATIC_CACHE_NAME = `hop-map-static-${CACHE_VERSION}`;
const RUNTIME_CACHE_NAME = `hop-map-runtime-${CACHE_VERSION}`;
const API_CACHE_NAME = `hop-map-api-${CACHE_VERSION}`;

const CURRENT_CACHES = [STATIC_CACHE_NAME, RUNTIME_CACHE_NAME, API_CACHE_NAME];

// Recursos essenciais do App Shell para pré-carregamento imediato
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/manifest.json',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
  '/og-image.png'
];

// Evento de Instalação: Pré-cache de recursos estáticos e ativação imediata
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log(`[Service Worker] Pré-caching de recursos App Shell (${STATIC_CACHE_NAME})`);
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Aviso de cache parcial:', err);
      });
    })
  );
});

// Evento de Ativação: Eliminação de caches obsoletas e controlo imediato dos clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!CURRENT_CACHES.includes(cacheName)) {
            console.log('[Service Worker] A eliminar cache antiga e obsoleta:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Determina o namespace de cache adequado com base no URL
function getTargetCacheName(url) {
  if (url.pathname.startsWith('/api/')) {
    return API_CACHE_NAME;
  }
  return RUNTIME_CACHE_NAME;
}

// Estratégia Stale-While-Revalidate para carregamento instantâneo
async function staleWhileRevalidate(request) {
  const url = new URL(request.url);
  const cacheName = getTargetCacheName(url);

  // 1. Abrir a cache designada e procurar resposta em cache
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // 2. Disparar a busca na rede em segundo plano para revalidar/atualizar
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      // Armazenar na cache se for resposta bem-sucedida (status 200 ou opaca cross-origin)
      if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
        try {
          await cache.put(request, networkResponse.clone());
        } catch (cacheErr) {
          console.warn('[Service Worker] Falha ao guardar em cache:', request.url, cacheErr);
        }
      }
      return networkResponse;
    })
    .catch((fetchError) => {
      // Se a rede falhar e não houver cache, tentar fallback de navegação HTML
      if (!cachedResponse) {
        if (request.mode === 'navigate' || request.destination === 'document') {
          return caches.match('/index.html');
        }
      }
      console.warn('[Service Worker] Rede indisponível, a usar versão em cache:', request.url);
      return null;
    });

  // 3. Se existir em cache, responde IMEDIATAMENTE (0ms) enquanto revalida em segundo plano
  if (cachedResponse) {
    return cachedResponse;
  }

  // Se ainda não estiver em cache, aguarda a resposta da rede
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }

  // Fallback final para navegação SPA offline
  if (request.mode === 'navigate' || request.destination === 'document') {
    const spaFallback = await caches.match('/index.html');
    if (spaFallback) return spaFallback;
  }

  return new Response('HOP-MAP: Conteúdo indisponível offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
  });
}

// Evento Fetch: Interceta pedidos GET com Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Apenas requisições GET utilizam Stale-While-Revalidate (mutações POST/PUT/DELETE vão diretas à rede)
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Ignorar protocolos especiais como extensões ou data URIs
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});
