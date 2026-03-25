const CACHE_NAME = 'aman-notebook-v2'; // Version badal diya
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1024/1024824.png' // Aapka logo URL
];

// 1. Install Event: Saari zaroori files save karein
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); 
});

// 2. Activate Event: Purana cache delete karein (Update logic)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// 3. Fetch Event: Pehle cache check karein, fir network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Agar cache mein hai to wahi dikhao, varna fetch karo
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Nayi files ko bhi cache mein add karte jao
          cache.put(event.request.url, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
      // Agar internet nahi hai aur file cache mein bhi nahi hai
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
