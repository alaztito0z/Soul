const CACHE = 'soul-v3';

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll([
        '/',
        '/index.html',
        '/catalogo.html',
        '/admin.html',
        '/style.css',
        '/catalogo.css',
        '/admin.css',
        '/main.js',
        '/catalogo.js',
        '/shared.js',
        '/admin.js'
    ])));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(k => k !== CACHE).map(k => caches.delete(k))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
));
