let cacheName = 'PreviewReading';
let filesToCache =
[
  './index.html',
  './login.html',
  './registrazione.html',
  './shop.html',
  './account.html',
  './recensione.html',
  'main.js',
  './css',
  './images'
];

//starts the service worker and cache all of the app's content
self.addEventListener('install', function(e)
{
  e.waitUntil(caches.open(cacheName).then(function(cache)
  {
      return cache.addAll(filesToCache);
  }));
});

//serves cached content when offline
self.addEventListener('fetch', function(e)
{
  e.respondWith(caches.match(e.request).then(function(response)
  {
      return response || fetch(e.request);
  }));
});
