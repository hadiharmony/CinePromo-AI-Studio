/* PromoReel Studio AI - Production Service Worker
 * - Caches static application shell only (relative paths compatible with GitHub Pages subpaths)
 * - Strictly NEVER caches private user data, Firebase API calls, auth tokens, or AI backend responses
 * - Cleans up outdated caches automatically on activation
 */

const CACHE_VERSION = "promoreel-shell-v1.1.0";
const APP_SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

const NEVER_CACHE_HOSTS = [
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "firebasestorage.googleapis.com",
  "generativelanguage.googleapis.com",
  "cloudfunctions.net",
  "run.app"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                (key.startsWith("promoreel-shell-") || key.startsWith("howitworks-shell-")) &&
                key !== CACHE_VERSION
            )
            .map((oldKey) => caches.delete(oldKey))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isSensitiveOrDynamicRequest(request, url) {
  if (request.method !== "GET") return true;
  if (request.headers.has("Authorization")) return true;
  if (url.pathname.includes("/api/")) return true;
  if (NEVER_CACHE_HOSTS.some((host) => url.hostname.includes(host))) return true;
  if (url.origin !== self.location.origin) return true;
  return false;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (isSensitiveOrDynamicRequest(request, url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put("./index.html", copy));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
