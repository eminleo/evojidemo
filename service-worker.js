// 記得版本號升級到 v9，強制瀏覽器更新快取倉庫
const CACHE_NAME = 'evoji-demo-v9-folder-assets'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  // 使用資料夾路徑存放的材質圖片
  './assets/lined-paper-2.png',
  './assets/football-no-lines.png',
  './assets/gravel.png',
  './assets/dark-leather.png'
];

// 1. 安裝 (Install)：下載所有清單中的檔案並儲存至快取
self.addEventListener('install', (event) => {
  // 強制立即接管，讓更新更快生效
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 正在將資產搬進 v9 倉庫...');
        
        // 使用 Promise.all 確保所有檔案都嘗試下載
        const cachePromises = ASSETS_TO_CACHE.map(url => {
          return fetch(url).then(response => {
            if (!response.ok) {
              throw new Error(`無法抓取資源: ${url}`);
            }
            return cache.put(url, response);
          }).catch(err => {
            console.warn(`[SW] 警告: 快取 ${url} 失敗，請確認資料夾名稱與檔案是否存在。`, err);
          });
        });

        return Promise.all(cachePromises);
      })
  );
});

// 2. 啟動 (Activate)：刪除舊版本的快取空間，釋放裝置容量
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

// 3. 抓取 (Fetch)：策略為「快取優先」，離線重整時會直接從倉庫拿圖
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果倉庫裡有，就直接給（秒開且離線可用）
        if (response) {
          return response;
        }
        // 如果倉庫沒有，才去網路上抓
        return fetch(event.request);
      })
  );
});
