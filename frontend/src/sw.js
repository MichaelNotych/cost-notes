import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';

// ensures that any new versions of a service worker
// will take over the page and become activated immediately.
self.skipWaiting();

// allow to publish a new service worker and have it control
// already-open web pages as soon as it activates
clientsClaim();

// Automatically clears old caches when a new version of the app ships
cleanupOutdatedCaches();

// This injects the Vite-compiled static assets (HTML/CSS/JS) into the SW cache
// Without this, the app won't work offline at all!
precacheAndRoute(self.__WB_MANIFEST);

// -------------------------------------------------------------
// SPA NAVIGATION ROUTE
// This is critical. It tells the SW: "Any time the user navigates 
// to a new page (like /dashboard), always serve index.html"
// so that the Vue Router can take over.
// -------------------------------------------------------------
try {
  registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));
} catch (e) {
  // Catch error in dev mode if index.html is missing from manifest
  console.log('Navigation route error:', e);
}

// -------------------------------------------------------------
// 1. CACHE API 'GET' REQUESTS (Aggressive Cache)
// Network-first strategy so users always get fresh data if online, 
// but instantly falls back to cached data if offline.
// -------------------------------------------------------------
registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/') && request.method === 'GET',
  new NetworkFirst({
    cacheName: 'api-get-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,          // Keep the latest 50 API requests
        maxAgeSeconds: 24 * 60 * 60 // Cache for 24 hours
      })
    ]
  })
);

// -------------------------------------------------------------
// 2. BACKGROUND SYNC FOR 'POST', 'PUT', 'DELETE' MUTATIONS
// If the user goes offline and adds an expense, the SW catches
// the failed request, saves it in IndexedDB, and retries once back online.
// -------------------------------------------------------------
const bgSyncPlugin = new BackgroundSyncPlugin('cost-notes-offline-queue', {
  maxRetentionTime: 24 * 60 // Retry for up to 24 Hours
});

registerRoute(
  ({ url, request }) => 
    url.pathname.startsWith('/api/') && 
    ['POST', 'PUT', 'DELETE'].includes(request.method),
  new NetworkOnly({
    plugins: [bgSyncPlugin]
  })
);
