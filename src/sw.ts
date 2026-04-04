/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core/clientsClaim';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    networkTimeoutSeconds: 10,
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 300 })],
  }),
);

self.addEventListener('push', (event: PushEvent) => {
  console.log('[WordRealms SW] push', event?.data?.text?.() ?? '');
});
