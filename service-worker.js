const CACHE_NAME = 'youtube-aggregator-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/scripts.js',
    '/config.json',
    '/manifest.json',
    '/icon.png', // Assuming icon.png will be added
    '/offline.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // Add all core assets to cache
                return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    // For navigation requests, try network first, then cache, then offline page.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request)) // Try cache if network fails
                .catch(() => caches.match('/offline.html')) // Serve offline page if not in cache
        );
        return;
    }

    // For other requests (assets), try cache first, then network.
    // This is a cache-first strategy for static assets.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Serve from cache
                }
                // Not in cache, fetch from network
                return fetch(event.request).then(
                    networkResponse => {
                        // Optionally, cache new assets dynamically if needed
                        // Be careful with caching everything, especially external resources or large files.
                        // For this app, core assets are already cached on install.
                        return networkResponse;
                    }
                );
            })
            .catch(() => {
                // Generic fallback for failed asset fetches, though offline.html is primary for navigation
                if (event.request.url.endsWith('.png') || event.request.url.endsWith('.jpg')) {
                    // Could return a placeholder image if needed
                }
                // For other assets, if not found and network fails, it will naturally fail.
                // offline.html is the main fallback for the app experience.
            })
    );
});
