const CACHE_NAME = "mi-app-v2";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/css/styles.css",
  "/iconos/icono-192.png",
  "/iconos/icono-512.png",
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

self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Cache first para assets y audios
  event.respondWith(
    caches.match(event.request).then(response => 
      response || fetch(event.request).then(fetchRes => {
        // Runtime caching opcional
        if(event.request.url.startsWith(self.location.origin)){
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, fetchRes.clone()));
        }
        return fetchRes;
      })
    )
  );
});
