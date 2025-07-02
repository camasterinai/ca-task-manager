const CACHE_NAME = 'ca-task-manager-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/dashboard.css',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/notifications.js',
  '/js/profile.js',
  '/js/reports.js',
  '/js/supabase-config.js',
  '/js/tasks.js',
  '/pages/login.html',
  '/pages/register.html',
  '/pages/forgot-password.html',
  '/pages/update-password.html',
  '/pages/tasks.html',
  '/pages/create-task.html',
  '/pages/reports.html',
  '/pages/profile.html',
  '/dashboard/admin.html',
  '/dashboard/senior.html',
  '/dashboard/junior.html',
  '/dashboard/staff.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});