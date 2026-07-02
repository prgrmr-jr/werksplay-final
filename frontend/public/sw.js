const CACHE_NAME = "werksplay_cache_v2";

const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/manifest.json",
    "/icons/werksplay-logo.png",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== "GET") {
        return;
    }

    if (url.origin !== self.location.origin) {
        return;
    }

    const isNavigationRequest =
        request.mode === "navigate" ||
        request.headers.get("accept")?.includes("text/html");

    if (isNavigationRequest) {
        event.respondWith(
            fetch(request).catch(() => caches.match("/index.html"))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            return cachedResponse || fetch(request);
        })
    );
});