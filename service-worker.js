// Service Worker for PWA
const CACHE_NAME = '99dan-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/js/landmarks.js',
    '/js/virtualPlayers.js',
    '/js/storage.js',
    '/js/statistics.js',
    '/js/rating.js',
    '/js/analytics.js',
    '/js/dataSync.js',
    '/js/game.js',
    '/js/modes/daily.js',
    '/js/modes/stepByStep.js',
    '/js/modes/weakness.js',
    '/js/modes/practice.js',
    '/js/modes/perfect.js',
    '/js/ui.js',
    '/js/app.js'
];

// 설치 이벤트: 모든 리소스 캐싱
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('[Service Worker] Installed successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// 활성화 이벤트: 이전 캐시 삭제
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activated successfully');
            return self.clients.claim();
        })
    );
});

// Fetch 이벤트: Cache First 전략
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에 있으면 캐시 반환
                if (response) {
                    return response;
                }

                // 캐시에 없으면 네트워크 요청
                return fetch(event.request)
                    .then(response => {
                        // 유효한 응답이 아니면 그대로 반환
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 응답 복사 (스트림은 한 번만 사용 가능)
                        const responseToCache = response.clone();

                        // 캐시에 저장
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('[Service Worker] Fetch failed:', error);
                        // 오프라인 폴백 페이지 (선택적)
                        // return caches.match('/offline.html');
                    });
            })
    );
});

// 메시지 이벤트: 캐시 업데이트 등
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
