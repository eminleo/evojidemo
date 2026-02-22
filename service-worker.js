// 升級到 v10，這會強制瀏覽器發現「有新東西了！」並更新快取
const CACHE_NAME = 'evoji-demo-v10-animation-assets'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './assets/lined-paper-2.png',
  './assets/football-no-lines.png',
  './assets/gravel.png',
  './assets/dark-leather.png',
  
  // --- 新增：所有角色的 PNG 序列動畫圖片 (1-8 幀) ---
  // 玩家 (Blue)
  './assets/character/blue_idle_1.png', './assets/character/blue_idle_2.png', './assets/character/blue_idle_3.png', './assets/character/blue_idle_4.png',
  './assets/character/blue_idle_5.png', './assets/character/blue_idle_6.png', './assets/character/blue_idle_7.png', './assets/character/blue_idle_8.png',
  
  // AI-1 (Red)
  './assets/character/red_idle_1.png', './assets/character/red_idle_2.png', './assets/character/red_idle_3.png', './assets/character/red_idle_4.png',
  './assets/character/red_idle_5.png', './assets/character/red_idle_6.png', './assets/character/red_idle_7.png', './assets/character/red_idle_8.png',
  
  // AI-2 (Yellow)
  './assets/character/yellow_idle_1.png', './assets/character/yellow_idle_2.png', './assets/character/yellow_idle_3.png', './assets/character/yellow_idle_4.png',
  './assets/character/yellow_idle_5.png', './assets/character/yellow_idle_6.png', './assets/character/yellow_idle_7.png', './assets/character/yellow_idle_8.png',
  
  // AI-3 (Green)
  './assets/character/green_idle_1.png', './assets/character/green_idle_2.png', './assets/character/green_idle_3.png', './assets/character/green_idle_4.png',
  './assets/character/green_idle_5.png', './assets/character/green_idle_6.png', './assets/character/green_idle_7.png', './assets/character/green_idle_8.png',
  
  // 獵人 (Hunter - Purple)
  './assets/character/purple_idle_1.png', './assets/character/purple_idle_2.png', './assets/character/purple_idle_3.png', './assets/character/purple_idle_4.png',
  './assets/character/purple_idle_5.png', './assets/character/purple_idle_6.png', './assets/character/purple_idle_7.png', './assets/character/purple_idle_8.png',
  
  // 入侵種 (Invasive - Mud)
  './assets/character/mud_idle_1.png', './assets/character/mud_idle_2.png', './assets/character/mud_idle_3.png', './assets/character/mud_idle_4.png',
  './assets/character/mud_idle_5.png', './assets/character/mud_idle_6.png', './assets/character/mud_idle_7.png', './assets/character/mud_idle_8.png'
];

// 1. 安裝：把新圖片全部存起來
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 正在搬運 v10 的新角色圖片到倉庫...');
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return fetch(url).then(response => {
            if (!response.ok) throw new Error(`找不到檔案: ${url}`);
            return cache.put(url, response);
          }).catch(err => console.warn(`[SW] 快取失敗: ${url}`, err));
        })
      );
    })
  );
});

// 2. 啟動：丟掉舊的 v9 記憶
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[SW] 刪除舊版本倉庫:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

// 3. 抓取：優先從倉庫拿圖片，這樣讀取超快！
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
