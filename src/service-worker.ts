/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const serviceWorker = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// install service worker
serviceWorker.addEventListener('install', (event) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}
	event.waitUntil(addFilesToCache());
});

// activate service worker
serviceWorker.addEventListener('activate', (event) => {
	async function deleteOldCaches() {
		for (const cacheKey of await caches.keys()) {
			if (cacheKey !== CACHE) {
				await caches.delete(cacheKey);
			}
		}
	}
	event.waitUntil(deleteOldCaches());
});

// listen to fetch events
serviceWorker.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);
		if (ASSETS.includes(url.pathname)) {
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) return cachedResponse; // if the response has been cached just return it?
		}
		try {
			const response = await fetch(event.request);
			const isNotExtension = url.protocol === 'http:';
			const isSuccess = response.status === 200;
			if (isNotExtension && isSuccess) {
				cache.put(event.request, response.clone());
			}
			return response;
		} catch {
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) return cachedResponse;
		}
		return new Response('Not found', { status: 404 });
	}
	event.respondWith(respond());
});

serviceWorker.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		serviceWorker.skipWaiting();
	}
});
