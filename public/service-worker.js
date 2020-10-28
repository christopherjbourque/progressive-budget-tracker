const FILES_TO_CACHE = [
    "/", 
    "/index.html", 
    "/index.js", 
    "/favicon.ico", 
    "/styles.css", 
    "/icons/icon-192x192.png", 
    "/icons/icon-512x512.png"
];
  
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
  
self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log("Your files were cached.");
                return cache.addAll(FILES_TO_CACHE);
             })
    );
    self.skipWaiting();
});
  
// Clean up old caches
self.addEventListener("activate", function (event) {
    event.waitUntil(
      caches
        .keys()
        .then(function(keyList) {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log("Removing old cache data", key);
                    return caches.delete(key);
                    }
                 })
            );
        })
    );
    self.clients.claim();
});
  
// Fetch
self.addEventListener("fetch", function (event) {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(function(cache) {
                return fetch(event.request)
                    .then(function(response) {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(error => {
                    // Network request failed, try to get it from the cache.
                    return cache.match(event.request);
                    });
            })
            .catch(error => console.log(error))
        );
      return;
    }
    
    // Use cache first for all other requests for performance
    event.respondWith(
        fetch(event.request)
            .catch(function () {
                return caches.match(event.request)
                .then(function (response) {
                    if (response) {
                        return response;
                    } else if (event.request.headers.get("accept").includes("text/html")) {
                        // Return the cached home page for all requests for html pages
                        return caches.match("/");
                    }
                });
            })
    );
});