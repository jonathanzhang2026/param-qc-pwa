/* 本地数据层：IndexedDB。数据只存在手机/浏览器本地，永不联网上传。
   动态字段核心：fields 存字段定义；records 每条把各字段值以 JSON 存于 data 列。
   新增字段 = 仅往 fields 加一条，历史记录自动兼容（缺的字段显示空）。 */
(function (global) {
  const DB_NAME = 'param_qc_db';
  const DB_VERSION = 2; // v2：新增 pdfs（标准原文 PDF 文件，本地保存）
  let _db = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      if (_db) return resolve(_db);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('fields')) {
          db.createObjectStore('fields', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('records')) {
          const rs = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
          rs.createIndex('updatedAt', 'updatedAt');
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'k' });
        }
        // 标准原文 PDF：{ id, name, size, blob, uploadedAt, builtin }
        if (!db.objectStoreNames.contains('pdfs')) {
          db.createObjectStore('pdfs', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => { _db = req.result; resolve(_db); };
      req.onerror = () => reject(req.error);
    });
  }

  function store(name, mode) {
    return openDB().then((db) => db.transaction(name, mode).objectStore(name));
  }
  function p(req) {
    return new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
  }

  const DB = {
    getAllFields() {
      return store('fields', 'readonly').then((s) => p(s.getAll())).then((a) => (a || []).sort((x, y) => (x.sort || 0) - (y.sort || 0)));
    },
    putField(f) { return store('fields', 'readwrite').then((s) => p(s.put(f))); },
    deleteField(key) { return store('fields', 'readwrite').then((s) => p(s.delete(key))); },
    getAllRecords() { return store('records', 'readonly').then((s) => p(s.getAll())); },
    getRecord(id) { return store('records', 'readonly').then((s) => p(s.get(Number(id)))); },
    putRecord(r) {
      return store('records', 'readwrite').then((s) => {
        if (!r.id) r.createdAt = Date.now();
        r.updatedAt = Date.now();
        return p(s.put(r));
      });
    },
    deleteRecord(id) { return store('records', 'readwrite').then((s) => p(s.delete(Number(id)))); },
    /* ---- 标准原文 PDF ---- */
    listPdfs() {
      return store('pdfs', 'readonly').then((s) => p(s.getAll()))
        .then((a) => (a || []).sort((x, y) => (y.uploadedAt || 0) - (x.uploadedAt || 0)));
    },
    getPdf(id) { return store('pdfs', 'readonly').then((s) => p(s.get(id))); },
    putPdf(doc) {
      doc.uploadedAt = doc.uploadedAt || Date.now();
      return store('pdfs', 'readwrite').then((s) => p(s.put(doc)));
    },
    deletePdf(id) { return store('pdfs', 'readwrite').then((s) => p(s.delete(id))); },
    getMeta(k) { return store('meta', 'readonly').then((s) => p(s.get(k))).then((v) => (v ? v.v : null)); },
    setMeta(k, v) { return store('meta', 'readwrite').then((s) => p(s.put({ k, v }))); },
    // 备份恢复用：只清字段与记录；标准原文 PDF 单独保留，避免恢复数据时误删标准文件
    clearAll() {
      return openDB().then((db) => new Promise((res, rej) => {
        const t = db.transaction(['fields', 'records', 'meta'], 'readwrite');
        t.objectStore('fields').clear();
        t.objectStore('records').clear();
        t.objectStore('meta').clear();
        t.oncomplete = () => res();
        t.onerror = () => rej(t.error);
      }));
    }
  };

  // 首次启动：若未灌过种子，从内置 seed.js 写入字段与记录
  async function seedIfNeeded() {
    const seeded = await DB.getMeta('seeded');
    if (seeded) return false;
    const data = global.SEED_DATA || { fields: [], records: [] };
    let sort = 0;
    for (const f of data.fields) { f.sort = sort++; await DB.putField(f); }
    for (const r of data.records) { await DB.putRecord({ data: r.data }); }
    await DB.setMeta('seeded', true);
    await DB.setMeta('schemaVersion', 1);
    return true;
  }

  global.DB = DB;
  global.seedIfNeeded = seedIfNeeded;
})(window);
