// 當你修改了遊戲內容 (index.html) 或圖片，記得要改這裡的版本號 (例如 v6 -> v7)
// 改了版本號，瀏覽器才會知道要重新下載新的檔案，並更新快取倉庫
const CACHE_NAME = 'evoji-demo-v7-best-effort'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  // 新增下面這些外部材質網址，讓管理員可以離線抓取它們
  'https://www.transparenttextures.com/patterns/lined-paper-2.png',
  'https://www.transparenttextures.com/patterns/football-no-lines.png',
  'https://www.transparenttextures.com/patterns/gravel.png',
  'https://www.transparenttextures.com/patterns/dark-leather.png'
];

// 1. 安裝 (Install)：盡可能下載檔案 (Best Effort)
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 開始快取檔案 (包括外部材質網址)...');
        
        const cachePromises = ASSETS_TO_CACHE.map(url => {
          return fetch(url).then(response => {
            if (!response.ok) {
              throw new Error(`Request for ${url} failed with status ${response.status}`);
            }
            return cache.put(url, response);
          }).catch(err => {
            console.warn(`[SW] 警告: 無法快取 ${url}，但不影響其他檔案。`, err);
          });
        });

        return Promise.all(cachePromises);
      })
  );
});

// 2. 啟動 (Activate)：刪除舊版本的快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] 刪除舊快取:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

// 3. 抓取 (Fetch)：快取優先策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
