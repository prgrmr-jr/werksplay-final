import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const CACHE_RESET_VERSION = "werksplay-cache-reset-v3";

function hasCacheResetRun() {
    try {
        return localStorage.getItem(CACHE_RESET_VERSION) === "true";
    } catch {
        return false;
    }
}

function markCacheResetDone() {
    try {
        localStorage.setItem(CACHE_RESET_VERSION, "true");
    } catch {
        // Safari private mode or strict settings can block localStorage.
    }
}

async function clearOldSiteDataOnce() {
    if (hasCacheResetRun()) {
        return;
    }

    try {
        if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();

            await Promise.all(
                registrations.map((registration) => registration.unregister())
            );
        }

        if ("caches" in window) {
            const cacheNames = await caches.keys();

            await Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }

        markCacheResetDone();

        window.location.reload();
    } catch (error) {
        console.error("Site data reset failed:", error);
        markCacheResetDone();
    }
}

async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    window.addEventListener("load", async () => {
        try {
            await navigator.serviceWorker.register("/sw.js");
        } catch (error) {
            console.error("Service worker registration failed:", error);
        }
    });
}

async function bootstrap() {
    await clearOldSiteDataOnce();
    await registerServiceWorker();

    ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    );
}

bootstrap();