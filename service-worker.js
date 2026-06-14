const CACHE_NAME = 'absensi-fa-v1';

// Daftar file yang akan disimpan untuk akses luring
const ASSET_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js',
  '/20260614_163211.png',
  '/20260614_163211.png'
];

// Pasang cache saat pertama kali dibuka
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSET_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Aktifkan dan hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(oldKey => caches.delete(oldKey))
      );
    }).then(() => self.clients.claim())
  );
});

// Ambil data: gunakan cache jika tidak ada internet
self.addEventListener('fetch', event => {
  const request = event.request;

  // Jangan cache data Firebase
  if (request.url.includes('firebasedatabase.app')) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // Simpan salinan ke cache jika berhasil
        const salinan = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, salinan));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
