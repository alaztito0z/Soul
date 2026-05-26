self.addEventListener('install', e => e.waitUntil(caches.open('soul-v2').then(c => c.addAll([
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
]))));

self.addEventListener('fetch', e => e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
));
