/* sw.js */
const version="1.0";
const CACHE_NAME = 'sound-maker-'+version;

const urlsToCache = [
    'firebase-messaging-sw.js',
    'index.html',
    'main.css',
    'firebase-messaging.html',
    'manifest.json',
    'google_assistant_logo.png',
    'keys.js',
    'register_sw.js',
    'sw.js',
    'scripts/firebasefcm.js',
    'scripts/playbulbCandle.js',
    'scripts/playword.js',
    'scripts/text.js',
    'scripts/two.js',
    'scripts/webaudio-tinysynth.js',
    'bower_components/webcomponentsjs/webcomponents.js',
    'bower_components/x-webmidi/x-webmidirequestaccess.html',
    'bower_components/x-webmidi/x-webmidioutput.html',
    'bower_components/x-webmidi/x-webmidiinput.html',
    'bower_components/polymer/polymer.html',
    'bower_components/polymer/polymer-micro.html',
    'bower_components/polymer/polymer-mini.html'
];
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then( cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then( response => {
            if (response) {
                //console.log("[return cache] ", (response.url).split("/").pop());
                return response;
            }
            let fetchRequest = event.request.clone();

            return fetch(fetchRequest).then( response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                let responseToCache = response.clone();
                caches.open(CACHE_NAME).then( cache => {
                    cache.put(event.request, responseToCache);
                });
                return response;
            });
        })
    );
});
