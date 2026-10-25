// Service worker ringkas: simpan cangkerang app (halaman, manifest, ikon) supaya dibuka dengan pantas.
// Data dashboard sentiasa diambil terus daripada Apps Script, tidak disimpan di sini.
const CACHE = 'data-guru-kedah-v1';
const CANGKERANG = [
  './', 'index.html', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'icons/icon-maskable-192.png', 'icons/icon-maskable-512.png', 'icons/favicon-32.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CANGKERANG)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;   // Apps Script tidak disentuh
  // Rangkaian dahulu supaya kemas kini index.html terus berkesan; cache jika luar talian
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const salinan = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, salinan));
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});
