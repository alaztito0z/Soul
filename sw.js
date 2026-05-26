self.addEventListener('install', e => e.waitUntil(caches.open('soul-v1').then(c => c.addAll([
    '/',
    '/index.html',
    '/catalogo.html',
    '/style.css',
    '/catalogo.css',
    '/main.js',
    '/catalogo.js',
    '/shared.js'
]))));

self.addEventListener('fetch', e => e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
));