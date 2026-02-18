// 當你修改了遊戲內容 (index.html) 或圖片，記得要改這裡的版本號 (例如 v5 -> v6)
// 改了版本號，瀏覽器才會知道要重新下載新的檔案
// FIX: 版本號升級為 v7，強制瀏覽器重新下載修復後的 index.html (Radiation/Pollution Fix)
const CACHE_NAME = 'evoji-demo-v7-radiation-fix'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. 安裝 (Install)：盡可能下載檔案 (Best Effort)
// 就算某個檔案失敗 (例如 icon.png 沒放好)，也不會讓整個 SW 安裝失敗，確保遊戲本體至少能玩
self.addEventListener('install', (event) => {
  // 強制立即接管，不用等下次重開瀏覽器，讓更新更快生效
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] 開始快取檔案 (盡力而為模式)...');
        
        // 將每個檔案的下載變成獨立的任務
        const cachePromises = ASSETS_TO_CACHE.map(url => {
          return fetch(url).then(response => {
            // 檢查回應是否正常 (狀態碼 200-299)
            if (!response.ok) {
              throw new Error(`Request for ${url} failed with status ${response.status}`);
            }
            return cache.put(url, response);
          }).catch(err => {
            // 重點：如果某個檔案失敗，只印出警告，不丟出錯誤導致整個安裝失敗
            console.warn(`[SW] 警告: 無法快取 ${url}，但不影響其他檔案。`, err);
          });
        });

        // 等待所有下載任務結束 (無論成功或失敗)
        return Promise.all(cachePromises);
      })
  );
});

// 2. 啟動 (Activate)：刪除舊版本的快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        // 如果發現快取名稱跟現在的不一樣 (例如發現了舊版 v5)，就刪掉
        if (key !== CACHE_NAME) {
          console.log('[SW] 刪除舊快取:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim()) // 讓 SW 立即控制所有頁面
  );
});

// 3. 抓取 (Fetch)：策略為「快取優先」(Cache First)
// 這樣做的好處：
// - 離線模式：完美運作。
// - 網路很慢：不會卡住，直接讀快取，秒開遊戲。
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // A. 如果快取裡有 (例如 index.html)，直接回傳快取檔案 (秒開)
        if (response) {
          return response;
        }
        
        // B. 如果快取裡沒有，才去網路下載 (例如外部連結)
        return fetch(event.request);
      })
  );
});
