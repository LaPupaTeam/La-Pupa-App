const CACHE_NAME = "mi-app-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/styles.css",

  // audios
  "/sounds/merienda-time.wav",
  "/sounds/hambre.wav",
  "/sounds/suenio.wav",
  "/sounds/enojo.mp3",
  "/sounds/molestia.wav",
  "/sounds/palabras-bonitas.mp3",
  "/sounds/no-preguntas.mp3",
  "/sounds/beso-cachete-frente.mp3"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});