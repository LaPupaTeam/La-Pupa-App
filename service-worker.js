const CACHE_NAME = "mi-app-v2";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/styles.css",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/sounds/merienda-time.wav",
  "/sounds/hambre.wav",
  "/sounds/suenio.wav",
  "/sounds/enojo.mp3",
  "/sounds/molestia.wav",
  "/sounds/palabras-bonitas.mp3",
  "/sounds/no-preguntas.mp3",
  "/sounds/beso-cachete-frente.mp3"
];


// --------------------
// Install
// --------------------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        FILES_TO_CACHE.map(file =>
          cache.add(file).catch(err => console.warn("Archivo no cacheado:", file, err))
        )
      ))
      .catch(err => console.error("SW install error:", err))
  );
  self.skipWaiting();
});

// --------------------
// Activate
// --------------------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.map(name => name !== CACHE_NAME ? caches.delete(name) : null)
      )
    )
  );
  self.clients.claim();
});

// --------------------
// Fetch
// --------------------
self.addEventListener("fetch", event => {
  const { request } = event;

  // HTML → Network first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Assets y audios → Cache first + runtime caching
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;

      try {
        const fetchResponse = await fetch(request);
        // solo cachear recursos de nuestro dominio
        if (request.url.startsWith(self.location.origin)) {
          cache.put(request, fetchResponse.clone());
        }
        return fetchResponse;
      } catch (err) {
        console.warn("Fetch falló para", request.url, err);
        return caches.match("/index.html"); // fallback
      }
    })()
  );
});
