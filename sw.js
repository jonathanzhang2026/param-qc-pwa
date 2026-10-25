// 离线缓存：首次联网加载后，断网也能打开使用（数据存在 IndexedDB，不在此缓存）。
// 设计要点：联网时所有请求网络优先（永远拿到最新代码），失败才回退缓存；安装容错（单个资源失败不致命）；新版本自动接管。
const CACHE = 'param-qc-v15';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'db.js',
  'seed.js',
  'manifest.webmanifest',
  'icon.svg',
  'icon-180.png',
  'vendor/xlsx.full.min.js',
  'vendor/pdf.min.js',
  'vendor/pdf.worker.min.js',
  'assets/standards/gb7475-87.pdf'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // 新版本安装完立刻激活，不等旧页面关闭
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // 逐个缓存，单个失败不中断整个安装（避免服务器短暂 502 时 SW 装不上、卡死旧版）
    for (const a of ASSETS) {
      try { await c.add(a); } catch (err) { console.warn('[SW] 缓存失败（可忽略）:', a, err && err.message); }
    }
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()) // 立即让所有页面归新 SW 管，服务最新缓存
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 只管同源资源（第三方库等不拦）
  // 网络优先：在线时永远返回最新文件；离线/失败时回退到缓存
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
