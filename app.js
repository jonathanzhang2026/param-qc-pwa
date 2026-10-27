/* 我的检测参数 —— 纯前端 PWA，无构建步骤、无后端、数据存本地 IndexedDB。
   页面：主页面(参数→方法 折叠目录) / 详情(四大板块) / 后台(记录·字段·导入·备份)。 */
(function () {
  const $app = document.getElementById('app');

  /* ---------- 基础工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function go(hash) { location.hash = '#' + hash; }
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; $app.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove('show'), 1800);
  }
  function appbar(title, back) {
    return `<header class="appbar">
      ${back ? `<button class="appbar-back" data-act="back" aria-label="返回">‹</button>` : `<span class="appbar-back"></span>`}
      <div class="appbar-title">${esc(title)}</div>
      <span class="appbar-back"></span>
    </header>`;
  }
  function groupFields(fields) {
    const map = {};
    for (const f of fields) (map[f.group] = map[f.group] || []).push(f);
    return Object.keys(map).map((g) => ({ group: g, fields: map[g] }));
  }
  const HIDDEN = (v) => v === '' || v == null;
  const SHOWN = (v) => !HIDDEN(v) && v !== '/';
  const disp = (v) => (v === '/' ? '—' : esc(v));
  // 空字段统一以灰色「暂无」占位（字段名照常显示，方便知道哪些待补录）
  const valHtml = (v) => (!SHOWN(v) ? '<span class="val-empty">暂无</span>' : disp(v));
  const TYPE_LABEL = { text: '文本', number: '数字', date: '日期', select: '单选', multiselect: '多选', pairs: '多行配对' };
  function fmtSize(n) {
    n = Number(n) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
    return (n / 1024 / 1024).toFixed(2) + ' MB';
  }

  /* ---------- 标准库分类 ---------- */
  // 首次启动写入的默认分类；之后用户可自行增、改名、删除
  const DEFAULT_CATEGORIES = ['基础规范', '水和废水', '土壤', '空气', '固体废物'];
  const UNCAT = '__uncat__'; // 未归类（老数据）的虚拟分组

  async function ensureDefaultCategories() {
    const seeded = await DB.getMeta('categoriesSeeded');
    const list = await DB.listCategories();
    if (seeded || list.length) return;
    let sort = 0;
    for (const name of DEFAULT_CATEGORIES) {
      await DB.putCategory({ id: 'cat_' + sort + '_' + Date.now().toString(36), name, sort: sort++ });
    }
    await DB.setMeta('categoriesSeeded', 1);
  }

  /* ---------- 标准原文的删除：同时清掉方法记录里的绑定，避免留下打不开的死链 ---------- */
  async function countPdfUsage(pdfId) {
    const recs = await DB.getAllRecords();
    return (recs || []).filter((r) => r && r.data && String(r.data.std_pdf_id || '') === pdfId).length;
  }
  async function deletePdfSafely(pdfId) {
    const recs = await DB.getAllRecords();
    for (const r of recs || []) {
      if (r && r.data && String(r.data.std_pdf_id || '') === pdfId) {
        const d = Object.assign({}, r.data);
        delete d.std_pdf_id; // 解绑后该记录详情页自动回退到「默认标准」
        await DB.putRecord({ id: r.id, data: d });
      }
    }
    await DB.deletePdf(pdfId);
    const defId = await DB.getMeta('defaultPdfId');
    if (defId === pdfId) { // 删掉的正好是默认标准，就把默认让给剩下的第一份
      const rest = await DB.listPdfs();
      await DB.setMeta('defaultPdfId', rest.length ? rest[0].id : '');
    }
  }

  /* ---------- 左滑条目：露出「重命名 / 删除」 ---------- */
  const SWIPE_W = 148; // 右侧操作区宽度，和 CSS 里 .lib-actions 保持一致
  function setSwipeX(item, x, animate) {
    const inner = item.querySelector('.lib-item-inner');
    if (!inner) return;
    inner.style.transition = animate ? 'transform .2s ease' : 'none';
    inner.style.transform = 'translateX(' + x + 'px)';
  }
  function closeAllSwipe(scope) {
    (scope || document).querySelectorAll('.lib-item.swiped').forEach((it) => {
      it.classList.remove('swiped');
      setSwipeX(it, 0, true);
    });
  }
  // 用指针事件统一处理手指与鼠标拖动；纵向滚动交给 CSS 的 touch-action: pan-y
  function bindSwipeItem(item) {
    const inner = item.querySelector('.lib-item-inner');
    if (!inner || item.dataset.swipeBound === '1') return;
    item.dataset.swipeBound = '1';
    let startX = 0, startY = 0, base = 0, cur = 0, active = false, axis = null, moved = false;

    function onStart(p) {
      active = true; axis = null; moved = false;
      startX = p.clientX; startY = p.clientY;
      base = item.classList.contains('swiped') ? -SWIPE_W : 0;
      cur = base;
    }
    function onMove(p) {
      if (!active) return;
      const dx = p.clientX - startX, dy = p.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'x') closeAllSwipe(item.parentElement); // 同一时间只滑开一个
      }
      if (axis !== 'x') { active = false; return; }
      moved = true;
      let x = base + dx;
      if (x > 0) x = 0;
      if (x < -SWIPE_W - 20) x = -SWIPE_W - 20; // 允许轻微超拉，松手回弹
      cur = x;
      setSwipeX(item, x, false);
    }
    function onEnd() {
      if (!active) return;
      active = false;
      if (axis !== 'x') return;
      const open = item.classList.contains('swiped');
      if (open) {
        if (cur > -SWIPE_W + 40) { item.classList.remove('swiped'); setSwipeX(item, 0, true); }
        else setSwipeX(item, -SWIPE_W, true);
      } else if (cur < -40) { item.classList.add('swiped'); setSwipeX(item, -SWIPE_W, true); }
      else setSwipeX(item, 0, true);
      if (moved) { // 标记一下，避免滑动结束时被当成点击而误打开文件
        item.dataset.moved = '1';
        setTimeout(() => { item.dataset.moved = '0'; }, 80);
      }
    }

    if (window.PointerEvent) {
      item.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.cat-move') || e.target.closest('.lib-actions')) return; // 下拉框/按钮不触发滑动
        onStart(e);
        try { item.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      });
      item.addEventListener('pointermove', (e) => { if (active) onMove(e); });
      item.addEventListener('pointerup', onEnd);
      item.addEventListener('pointercancel', onEnd);
    } else { // 老浏览器兜底：触摸事件
      item.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1 || e.target.closest('.cat-move') || e.target.closest('.lib-actions')) return;
        onStart(e.touches[0]);
      }, { passive: true });
      item.addEventListener('touchmove', (e) => { if (e.touches.length === 1) onMove(e.touches[0]); }, { passive: true });
      item.addEventListener('touchend', onEnd);
      item.addEventListener('touchcancel', onEnd);
    }
  }

  // 按名称排序：中文按拼音、编号里的数字按数值大小（GB 7475 排在 GB 11893 前）
  function sortByName(list) {
    return (list || []).slice().sort((a, b) =>
      String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans-CN', { numeric: true, sensitivity: 'base' }));
  }

  // 把 PDF 按分类分组，返回 [{id, name, docs}]，未归类的放最后；组内按名称排序
  async function groupPdfsByCategory() {
    const [raw, cats] = await Promise.all([DB.listPdfs(), DB.listCategories()]);
    const docs = sortByName(raw);
    const map = new Map(cats.map((c) => [c.id, { id: c.id, name: c.name, docs: [] }]));
    const rest = [];
    for (const d of docs) {
      const bucket = d.category && map.has(d.category) ? map.get(d.category) : null;
      if (bucket) bucket.docs.push(d); else rest.push(d);
    }
    const out = cats.map((c) => map.get(c.id)).filter(Boolean);
    if (rest.length) out.push({ id: UNCAT, name: '未分类', docs: rest });
    return { groups: out, cats, total: docs.length };
  }

  /* ---------- 路由 ---------- */
  function route() {
    const h = location.hash.slice(1) || '/';
    const qi = h.indexOf('?');
    const path = qi < 0 ? h : h.slice(0, qi);
    const params = new URLSearchParams(qi < 0 ? '' : h.slice(qi + 1));
    return { path: path || '/', params };
  }

  async function render() {
    const { path, params } = route();
    try {
      if (path === '/' || path === '') return await home();
      if (path === '/detail') return await detail(params.get('id'));
      if (path === '/manage') return await manage(params.get('tab') || 'records');
      if (path === '/record/edit') return await recordEdit(params.get('id'));
      if (path === '/field/new') return await fieldEdit(params.get('id'));
      if (path === '/import') return await importPage();
      if (path === '/backup') return await backupPage();
      if (path === '/library') return await library();
    } catch (e) {
      console.error(e);
      $app.innerHTML = `<div class="boot">出错了：${esc(e.message || e)}</div>`;
    }
  }

  /* ---------- 详情四大板块（固定顺序；字段为空则显示灰色「暂无」） ----------
     板块：基本信息 / 样品信息 / 标准曲线 / 质控措施
     items 里的字符串 = 单个字段；{label,keys} = 板块内的小版块 */
  const DETAIL_SECTIONS = [
    { title: '基本信息', items: [
      'applicable_type', 'rr_lod', 'rr_loq', 'detect_range', 'rr_round', 'rr_nd'
    ] },
    { title: '样品信息', items: [
      'sample_collection', 'storage_pairs'
    ] },
    { title: '标准曲线', items: [
      'ss_solutions', 'qc_curve_points'
    ] },
    { title: '质控措施', items: [
      'qc_blank',
      { label: '平行', keys: ['qc_parallel', 'qc_parallel_tol'] },
      { label: '加标', keys: ['qc_spike_count', 'qc_spike_conc', 'qc_spike_vol', 'qc_spike_amount', 'qc_spike_range'] },
      { label: '校核点', keys: ['qc_check_conc', 'qc_check_dev_type', 'qc_check_dev_value'] },
      { label: '质控样品', keys: ['qc_qc_count', 'qc_qc_no', 'qc_true_value'] }
    ] }
  ];

  /* ---------- 板块与小版块 ----------
     四大板块由 DETAIL_SECTIONS 定义；用户新增的字段带 f.group（板块名）+ f.sub（小版块名，可空）。
     例如 group='质控措施'、sub='加标' → 该字段出现在「质控措施 → 加标」里。 */
  const SECTION_TITLES = DETAIL_SECTIONS.map((s) => s.title);
  // 内置字段属于哪个小版块（由固定结构推导，让新增/编辑页与详情页口径一致）
  const KEY_SUB = {};
  for (const sec of DETAIL_SECTIONS) {
    for (const it of sec.items) if (typeof it === 'object' && it.label) it.keys.forEach((k) => { KEY_SUB[k] = it.label; });
  }
  const subOf = (f) => (f && (f.sub || KEY_SUB[f.key])) || '';
  // 核心字段：删了首页目录和详情标题就没了，禁止删除（可改名/换板块）
  const isCoreField = (f) => !!f && (f.key === 'param_name' || f.key === 'method'
    || f.name === '参数' || f.name === '方法(标准号)');

  // 某个板块下可选的小版块（固定结构里定义的 + 已有字段用过的）
  function subOptionsOf(group, fields) {
    const out = [];
    const sec = DETAIL_SECTIONS.find((s) => s.title === group);
    if (sec) for (const it of sec.items) if (typeof it === 'object' && it.label && out.indexOf(it.label) < 0) out.push(it.label);
    for (const f of fields || []) if (f.group === group && f.sub && out.indexOf(f.sub) < 0) out.push(f.sub);
    return out;
  }

  // 动态拼出详情页要显示的板块：固定结构在前，用户新增字段按 sub 插进对应小版块
  function buildDetailSections(fields, excludeKeys) {
    const fixedKeys = new Set();
    for (const sec of DETAIL_SECTIONS) {
      for (const it of sec.items) {
        if (typeof it === 'string') fixedKeys.add(it);
        else it.keys.forEach((k) => fixedKeys.add(k));
      }
    }
    for (const k of excludeKeys || []) fixedKeys.add(k); // 如「参数 / 方法」，已在详情头部显示，不在板块里重复
    const extras = (fields || []).filter((f) => !f.hidden && !fixedKeys.has(f.key));
    const pack = (list) => { // 把一批字段按 sub 排成 [{label?,keys}]
      const items = [];
      for (const f of list) {
        if (!f.sub) { items.push({ keys: [f.key] }); continue; }
        let t = items.find((i) => i.label === f.sub);
        if (!t) { t = { label: f.sub, keys: [] }; items.push(t); }
        t.keys.push(f.key);
      }
      return items;
    };
    const out = [];
    for (const sec of DETAIL_SECTIONS) {
      const items = sec.items.map((it) => (typeof it === 'string' ? { keys: [it] } : { label: it.label, keys: it.keys.slice() }));
      const mine = extras.filter((f) => f.group === sec.title);
      for (const it of pack(mine)) {
        if (it.label) { // 已有同名小版块就并入，否则追加到板块末尾
          const t = items.find((i) => i.label === it.label);
          if (t) t.keys = t.keys.concat(it.keys); else items.push(it);
        } else items.push(it);
      }
      out.push({ title: sec.title, items });
    }
    const others = extras.filter((f) => SECTION_TITLES.indexOf(f.group) < 0);
    if (others.length) out.push({ title: '其他信息', items: pack(others) });
    return out;
  }

  /* ---------- 删除字段：同时记住"别再被种子补回来" ---------- */
  async function countFieldUsage(key) {
    const recs = await DB.getAllRecords();
    return (recs || []).filter((r) => {
      const v = r && r.data ? r.data[key] : undefined;
      if (v == null) return false;
      if (Array.isArray(v)) return v.length > 0;
      return String(v).trim() !== '';
    }).length;
  }
  async function deleteFieldSafely(key) {
    await DB.deleteField(key);
    const del = (await DB.getMeta('deletedFields')) || [];
    if (del.indexOf(key) < 0) { del.push(key); await DB.setMeta('deletedFields', del); }
  }

  /* ---------- 主页面：参数→方法 两级折叠目录 ---------- */
  async function home() {
    const [fields, records, lib] = await Promise.all([
      DB.getAllFields(), DB.getAllRecords(), groupPdfsByCategory()
    ]);
    const paramKey = (fields.find((f) => f.name === '参数') || {}).key || 'param_name';
    const methodKey = (fields.find((f) => f.name === '方法(标准号)') || {}).key || 'method';

    // 按参数分组
    const groups = {};
    for (const r of records) {
      const p = (r.data[paramKey] || '').trim() || '未命名参数';
      (groups[p] = groups[p] || []).push(r);
    }
    const paramNames = Object.keys(groups).sort((a, b) => a.localeCompare(b, 'zh'));

    $app.innerHTML = `
      ${appbar('我的检测参数')}
      <div class="searchwrap">
        <input id="q" class="search" type="search" placeholder="搜参数名 / 方法名 / 任意内容" />
      </div>
      <button class="entry-card" data-act="library">
        <span class="entry-icon">📚</span>
        <span class="entry-main">
          <span class="entry-title">标准库</span>
          <span class="entry-sub">共 ${lib.total} 份标准 · ${lib.groups.length} 个分类</span>
        </span>
        <span class="entry-arrow">›</span>
      </button>
      <div id="tree" class="tree"></div>
      <button class="fab" data-act="manage" aria-label="管理">⚙</button>
    `;

    const treeEl = $app.querySelector('#tree');
    const expanded = {}; // 参数名 -> 是否已展开（默认折叠）

    function renderTree() {
      const q = ($app.querySelector('#q').value || '').trim().toLowerCase();
      let html = '';
      for (const p of paramNames) {
        const items = groups[p].filter((r) => {
          if (!q) return true;
          const hay = (p + ' ' + (r.data[methodKey] || '') + ' ' + Object.values(r.data).join(' ')).toLowerCase();
          return hay.includes(q);
        });
        if (!items.length) continue;
        const open = expanded[p] === true;
        html += `<div class="tree-group${open ? ' open' : ''}">
          <div class="tree-parent" data-param="${esc(p)}">
            <span class="chevron">▸</span>
            <span class="tree-parent-name">${esc(p)}</span>
            <span class="count">${items.length}</span>
          </div>
          ${open ? `<div class="tree-children">${items.map((r) => `
            <div class="tree-child" data-id="${r.id}">
              <span class="dot">•</span><span class="tree-child-name">${disp(r.data[methodKey])}</span>
            </div>`).join('')}</div>` : ''}
        </div>`;
      }
      treeEl.innerHTML = html || `<div class="empty">没有匹配的记录</div>`;
      treeEl.querySelectorAll('.tree-parent').forEach((el) =>
        el.addEventListener('click', () => { expanded[el.dataset.param] = expanded[el.dataset.param] !== true; renderTree(); }));
      treeEl.querySelectorAll('.tree-child').forEach((el) =>
        el.addEventListener('click', () => go('/detail?id=' + el.dataset.id)));
    }
    $app.querySelector('#q').addEventListener('input', renderTree);
    $app.querySelector('[data-act="manage"]').addEventListener('click', () => go('/manage'));
    $app.querySelector('[data-act="library"]').addEventListener('click', () => go('/library'));
    renderTree();
  }

  /* ---------- 标准库：按分类查看已上传的标准 PDF ---------- */
  async function library() {
    let { groups, cats, total } = await groupPdfsByCategory();
    const expanded = {}; // 分类 id -> 是否展开（默认全部折叠）

    $app.innerHTML = `
      ${appbar('标准库', true)}
      <div class="searchwrap">
        <input id="lq" class="search" type="search" placeholder="搜标准名称" />
      </div>
      <div class="lib-actions">
        <button class="btn btn-primary" data-act="upload">＋ 上传标准</button>
        <button class="btn" data-act="catman">管理分类</button>
      </div>
      <div id="uploader" class="uploader" hidden>
        <div class="uploader-inner">
          <label class="label">选择分类</label>
          <select id="upCat" class="input">${cats.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select>
          <label class="label">选择 PDF 文件（可多选）</label>
          <input id="upFile" class="input" type="file" accept="application/pdf,.pdf" multiple />
          <div class="uploader-btns">
            <button class="btn btn-primary" data-act="doUp" disabled>上传到该分类</button>
            <button class="btn" data-act="cancelUp">取消</button>
          </div>
        </div>
      </div>
      <div id="catman" class="catman" hidden>
        <div class="catman-inner">
          ${cats.map((c) => `<div class="cat-row" data-id="${esc(c.id)}">
            <span class="cat-name">${esc(c.name)}</span>
            <button class="linkbtn" data-rename="${esc(c.id)}">改名</button>
            <button class="linkbtn danger" data-catdel="${esc(c.id)}">删除</button>
          </div>`).join('') || '<div class="empty">还没有分类</div>'}
          <button class="btn btn-primary block" data-act="addcat">＋ 新增分类</button>
          <p class="hint">删除分类不会删除里面的 PDF，它们会移到「未分类」；改名后已归入的文件自动跟随。</p>
        </div>
      </div>
      <p class="hint libhint">点击打开标准全文，<strong>向左滑动条目</strong>可重命名或删除。</p>
      <div id="libtree" class="tree libtree"></div>
    `;
    $app.querySelector('[data-act="back"]').addEventListener('click', () => go('/'));

    const treeEl = $app.querySelector('#libtree');

    function renderLib() {
      const q = ($app.querySelector('#lq').value || '').trim().toLowerCase();
      let html = '';
      for (const g of groups) {
        const docs = g.docs.filter((d) => !q || (d.name || '').toLowerCase().includes(q));
        if (!docs.length) continue;
        const open = expanded[g.id] === true;
        html += `<div class="tree-group${open ? ' open' : ''}">
          <div class="tree-parent" data-cat="${esc(g.id)}">
            <span class="chevron">▸</span>
            <span class="tree-parent-name">${esc(g.name)}</span>
            <span class="count">${docs.length}</span>
          </div>
          ${open ? `<div class="tree-children">${docs.map((d) => `
            <div class="lib-item" data-pdf="${esc(d.id)}">
              <div class="lib-item-inner">
                <span class="dot">📄</span><span class="tree-child-name">${esc(d.name)}</span>
                <span class="tree-child-sub">${fmtSize(d.size)}</span>
                <select class="cat-move" data-movefrom="${esc(d.id)}" aria-label="移动到分类">
                  <option value="">未分类</option>
                  ${cats.map((c) => `<option value="${esc(c.id)}"${d.category === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}
                </select>
              </div>
              <div class="lib-actions">
                <button class="sw-act sw-rename" data-pdfrename="${esc(d.id)}">重命名</button>
                <button class="sw-act sw-del" data-pdfdel="${esc(d.id)}">删除</button>
              </div>
            </div>`).join('')}</div>` : ''}
        </div>`;
      }
      treeEl.innerHTML = html || `<div class="empty">${total ? '没有匹配的标准' : '还没有上传标准，点上方「＋ 上传标准」'}</div>`;
      treeEl.querySelectorAll('.tree-parent').forEach((el) =>
        el.addEventListener('click', () => { expanded[el.dataset.cat] = expanded[el.dataset.cat] !== true; renderLib(); }));
      // 左滑条目：露出「重命名 / 删除」
      treeEl.querySelectorAll('.lib-item').forEach(bindSwipeItem);
      treeEl.querySelectorAll('.lib-item-inner').forEach((el) =>
        el.addEventListener('click', async (e) => {
          if (e.target.closest('.cat-move')) return; // 点移动分类下拉时不打开文件
          const item = el.closest('.lib-item');
          const opened = treeEl.querySelector('.lib-item.swiped');
          if (opened) { closeAllSwipe(treeEl); if (opened !== item) return; } // 有滑开的条目：先收起，本轮不打开文件
          if (item.classList.contains('swiped')) return;
          if (item.dataset.moved === '1') return; // 刚滑动过，不算点击
          const doc = await DB.getPdf(item.dataset.pdf);
          if (!doc) { toast('文件已不存在'); return; }
          openPdfViewer(doc, doc.name);
        }));
      // 重命名标准（只改显示名，文件本身不动）
      treeEl.querySelectorAll('[data-pdfrename]').forEach((b) => b.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = b.dataset.pdfrename;
        const doc = await DB.getPdf(id);
        if (!doc) { toast('文件已不存在'); return; }
        const name = (prompt('重命名为：', doc.name) || '').trim();
        if (!name || name === doc.name) { closeAllSwipe(treeEl); return; }
        await DB.putPdf(Object.assign({}, doc, { name }));
        toast('已重命名');
        await refreshLib();
      }));
      // 删除标准：会同时解绑引用它的方法记录
      treeEl.querySelectorAll('[data-pdfdel]').forEach((b) => b.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = b.dataset.pdfdel;
        const doc = await DB.getPdf(id);
        if (!doc) { toast('文件已不存在'); return; }
        const used = await countPdfUsage(id);
        const msg = used
          ? '删除标准「' + doc.name + '」？\n有 ' + used + ' 条方法记录正在引用它，删除后这些记录会回退到默认标准。'
          : '删除标准「' + doc.name + '」？此操作不可恢复。';
        if (!confirm(msg)) { closeAllSwipe(treeEl); return; }
        await deletePdfSafely(id);
        toast('已删除');
        await refreshLib();
      }));
      // 直接把文件移到别的分类
      treeEl.querySelectorAll('.cat-move').forEach((sel) =>
        sel.addEventListener('change', async (e) => {
          e.stopPropagation();
          const doc = await DB.getPdf(sel.dataset.movefrom);
          if (!doc) return;
          await DB.putPdf(Object.assign({}, doc, { category: sel.value || null }));
          toast('已移动到：' + (sel.options[sel.selectedIndex].text || '未分类'));
          await refreshLib();
        }));
    }

    // 重新取数据后重绘，保持各分类展开状态
    async function refreshLib() {
      const keep = Object.assign({}, expanded);
      const fresh = await groupPdfsByCategory();
      groups = fresh.groups; cats = fresh.cats; total = fresh.total;
      Object.keys(keep).forEach((k) => { expanded[k] = keep[k]; });
      renderLib();
    }

    // 上传区
    const upBox = $app.querySelector('#uploader');
    const upFile = $app.querySelector('#upFile');
    const doUp = $app.querySelector('[data-act="doUp"]');
    $app.querySelector('[data-act="upload"]').addEventListener('click', () => {
      upBox.hidden = !upBox.hidden;
      if (!upBox.hidden) upBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    $app.querySelector('[data-act="cancelUp"]').addEventListener('click', () => { upBox.hidden = true; upFile.value = ''; doUp.disabled = true; });
    upFile.addEventListener('change', () => { doUp.disabled = !upFile.files.length; });
    doUp.addEventListener('click', async () => {
      const files = Array.from(upFile.files || []);
      if (!files.length) return;
      const catId = $app.querySelector('#upCat').value;
      doUp.disabled = true;
      for (const f of files) {
        const id = 'pdf_' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
        await DB.putPdf({ id, name: f.name, size: f.size, blob: f, category: catId });
      }
      toast('已上传 ' + files.length + ' 份标准');
      library(); // 重新渲染
    });

    // 分类管理
    const catBox = $app.querySelector('#catman');
    $app.querySelector('[data-act="catman"]').addEventListener('click', () => { catBox.hidden = !catBox.hidden; });
    $app.querySelector('[data-act="addcat"]').addEventListener('click', async () => {
      const name = (prompt('新分类名称：') || '').trim();
      if (!name) return;
      const maxSort = cats.reduce((m, c) => Math.max(m, c.sort || 0), 0);
      await DB.putCategory({ id: 'cat_' + Date.now().toString(36), name, sort: maxSort + 1 });
      toast('已新增分类：' + name);
      library();
    });
    catBox.querySelectorAll('[data-rename]').forEach((b) => b.addEventListener('click', async () => {
      const cur = cats.find((c) => c.id === b.dataset.rename);
      const name = (prompt('修改为：', cur ? cur.name : '') || '').trim();
      if (!name || !cur) return;
      await DB.putCategory(Object.assign({}, cur, { name }));
      toast('已改名'); library();
    }));
    catBox.querySelectorAll('[data-catdel]').forEach((b) => b.addEventListener('click', async () => {
      const cur = cats.find((c) => c.id === b.dataset.catdel);
      if (!cur) return;
      if (!confirm('删除分类「' + cur.name + '」？其中文件会移到「未分类」，不会被删除。')) return;
      await DB.deleteCategory(cur.id);
      toast('已删除分类'); library();
    }));

    $app.querySelector('#lq').addEventListener('input', renderLib);
    renderLib();
  }

  /* ---------- 详情页：四大板块 ---------- */
  async function detail(id) {
    const [fields, rec] = await Promise.all([DB.getAllFields(), DB.getRecord(id)]);
    if (!rec) { go('/'); return; }
    const fByKey = Object.fromEntries(fields.map((f) => [f.key, f]));
    const paramKey = (fields.find((f) => f.name === '参数') || {}).key || 'param_name';
    const methodKey = (fields.find((f) => f.name === '方法(标准号)') || {}).key || 'method';

    // 多行配对字段（如 样品保存：保存方式/保存时效；标准溶液：名称/浓度/时效）
    function renderPairs(f) {
      const v = rec.data[f.key];
      const rows = Array.isArray(v)
        ? v.filter((r) => r && Object.values(r).some((x) => String(x == null ? '' : x).trim()))
        : [];
      if (!rows.length) {
        return `<div class="field-row"><div class="field-label">${esc(f.name)}</div><div class="field-value">${valHtml('')}</div></div>`;
      }
      const subs = f.subs || [];
      const head = subs.map((s) => `<th>${esc(s.label)}</th>`).join('');
      const bodyHtml = rows.map((r) =>
        '<tr>' + subs.map((s) => `<td>${valHtml(r[s.k])}</td>`).join('') + '</tr>').join('');
      return `<div class="sub-label">${esc(f.name)}</div>
        <table class="pair-table"><thead><tr>${head}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
    }

    // 多选字段（如 适用类型）：以标签展示
    function renderMulti(f) {
      const v = rec.data[f.key];
      const arr = Array.isArray(v) ? v.filter(Boolean)
        : (String(v == null ? '' : v).trim() ? [String(v).trim()] : []);
      const inner = arr.length
        ? arr.map((x) => `<span class="chip">${esc(x)}</span>`).join('')
        : valHtml('');
      return `<div class="field-row"><div class="field-label">${esc(f.name)}</div><div class="field-value"><div class="chips">${inner}</div></div></div>`;
    }

    function renderField(f) {
      if (f.type === 'pairs') return renderPairs(f);
      if (f.type === 'multiselect') return renderMulti(f);
      // 无论有无值都显示该字段；无值时显示灰色「暂无」，方便知道哪些待补录
      return `<div class="field-row"><div class="field-label">${esc(f.name)}</div><div class="field-value">${valHtml(rec.data[f.key])}</div></div>`;
    }

    function fieldRows(keys) {
      return keys.map((k) => (fByKey[k] ? renderField(fByKey[k]) : '')).join('');
    }

    let sectionsHtml = '';
    // 四大板块 + 用户新增字段（新增字段按所属小版块插进去，没有小版块的平铺在板块末尾）
    for (const sec of buildDetailSections(fields, [paramKey, methodKey])) {
      let body = '';
      for (const it of sec.items) {
        const inner = fieldRows(it.keys);
        if (!inner) continue;
        // 小版块：小标题 + 平铺字段（无背景色块）
        if (it.label) body += `<div class="sub-label">${esc(it.label)}</div>${inner}`;
        else body += inner;
      }
      if (!body) continue;
      sectionsHtml += `<div class="group">
        <div class="group-title">${esc(sec.title)}</div>
        ${body}
      </div>`;
    }
    if (!sectionsHtml) sectionsHtml = '<div class="empty">该记录暂无填写内容</div>';

    const methodVal = rec.data[methodKey];
    const hasMethod = SHOWN(methodVal);

    $app.innerHTML = `
      ${appbar('方法详情', true)}
      <div class="detail">
        <div class="detail-head">
          <div class="detail-param">${disp(rec.data[paramKey])}</div>
          <div class="detail-method-row">
            <span class="detail-method">${hasMethod ? disp(methodVal) : '<span class="dm-empty">暂无标准编号</span>'}</span>
            ${(hasMethod || rec.data.std_pdf_id) ? `<button class="view-btn" data-act="viewstd">查看</button>` : ''}
          </div>
        </div>
        ${sectionsHtml}
      </div>
      <div class="actions">
        <button class="btn btn-primary" data-act="edit">编辑</button>
      </div>
      <p class="del-hint">需要删除这条记录？请到右下角 ⚙「后台管理 → 记录管理」中删除，避免误触。</p>
    `;
    $app.querySelector('[data-act="back"]').addEventListener('click', () => go('/'));
    const viewBtn = $app.querySelector('[data-act="viewstd"]');
    if (viewBtn) viewBtn.addEventListener('click', async () => {
      const doc = await resolveStdPdf(rec);
      if (!doc) { toast('还没有标准原文，可在编辑页「上传标准原文」，或在后台「标准原文」中上传'); return; }
      openPdfViewer(doc, String(methodVal || rec.data[paramKey] || ''));
    });
    // 基本信息板块末尾：显示本条绑定的标准原文文件名
    (async () => {
      const first = $app.querySelector('.group');
      if (!first) return;
      let name = '';
      if (rec.data.std_pdf_id) {
        const doc = await DB.getPdf(rec.data.std_pdf_id);
        if (doc) name = doc.name;
      }
      const row = document.createElement('div');
      row.className = 'field-row';
      row.innerHTML = `<div class="field-label">标准原文</div><div class="field-value">${name ? esc(name) : valHtml('')}</div>`;
      first.appendChild(row);
    })();
    $app.querySelector('[data-act="edit"]').addEventListener('click', () => go('/record/edit?id=' + id));
  }

  /* ---------- 标准原文（PDF）：本地查看 ----------
     用 pdf.js 渲染到 canvas，而不是 iframe——iframe 依赖浏览器内置 PDF 插件，
     在部分内置预览面板和 iOS Safari 上会一片空白（点「查看」没反应）。 */
  let _pdfUrl = null;
  let _pdfDoc = null;

  function ensurePdfWorker() {
    const lib = window.pdfjsLib;
    if (!lib) return false;
    if (!lib.GlobalWorkerOptions.workerSrc) lib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
    return true;
  }

  // 当前该看哪一份：优先本条记录自己绑定的 PDF，其次后台「默认」文件，最后取最新一份
  async function resolveStdPdf(rec) {
    const bound = rec && rec.data && rec.data.std_pdf_id;
    if (bound) {
      const doc = await DB.getPdf(bound);
      if (doc) return doc;
    }
    const list = await DB.listPdfs();
    if (!list.length) return null;
    const defId = await DB.getMeta('defaultPdfId');
    return list.find((x) => x.id === defId) || list[0];
  }

  function pdfModal() {
    let modal = document.getElementById('pdfModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pdfModal';
      modal.className = 'pdf-modal';
      modal.innerHTML = `
        <div class="pdf-bar">
          <button class="pdf-close" data-act="pdfclose" aria-label="关闭">×</button>
          <div class="pdf-title" data-role="title">标准原文</div>
          <a class="pdf-open" data-act="pdfnew" target="_blank" rel="noopener">新窗口打开</a>
        </div>
        <div class="pdf-body" data-role="body"></div>
        <div class="pdf-note" data-role="note"></div>`;
      document.body.appendChild(modal);
      modal.querySelector('[data-act="pdfclose"]').addEventListener('click', () => {
        modal.classList.remove('show');
        if (_pdfDoc) { try { _pdfDoc.destroy(); } catch (e) {} _pdfDoc = null; }
      });
    }
    return modal;
  }

  async function openPdfViewer(doc, stdNo) {
    const modal = pdfModal();
    // 规范 MIME：类型不对时某些浏览器会把 PDF 当下载而不是显示
    let blob = doc.blob;
    if (blob && blob.type !== 'application/pdf') blob = blob.slice(0, blob.size, 'application/pdf');
    if (_pdfUrl) { URL.revokeObjectURL(_pdfUrl); _pdfUrl = null; }
    if (_pdfDoc) { try { _pdfDoc.destroy(); } catch (e) {} _pdfDoc = null; }
    _pdfUrl = URL.createObjectURL(blob);

    const body = modal.querySelector('[data-role="body"]');
    modal.querySelector('[data-role="title"]').textContent = stdNo ? stdNo : '标准原文';
    modal.querySelector('[data-act="pdfnew"]').href = _pdfUrl;
    modal.querySelector('[data-role="note"]').textContent = doc.name || '';
    modal.classList.add('show');
    body.innerHTML = '<div class="pdf-loading">正在渲染第 1 页…</div>';

    if (!ensurePdfWorker()) {
      body.innerHTML = '<div class="pdf-loading">PDF 渲染库未加载，请点右上角「新窗口打开」查看。</div>';
      return;
    }
    try {
      const data = new Uint8Array(await blob.arrayBuffer());
      const pdf = await window.pdfjsLib.getDocument({ data }).promise;
      _pdfDoc = pdf;
      // 进度提示常驻第一个子节点，已渲染的页面依次插到它前面
      body.innerHTML = '<div class="pdf-loading" data-role="prog">正在渲染第 1 页…</div>';
      const prog = body.querySelector('[data-role="prog"]');
      const cssW = body.clientWidth || 360;
      const dpi = window.devicePixelRatio || 1;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const base = page.getViewport({ scale: 1 });
        const v = page.getViewport({ scale: (cssW / base.width) * dpi });
        const cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.floor(v.width));
        cv.height = Math.max(1, Math.floor(v.height));
        cv.className = 'pdf-page';
        body.insertBefore(cv, prog);
        await page.render({ canvasContext: cv.getContext('2d'), viewport: v }).promise;
        if (i < pdf.numPages) prog.textContent = `正在渲染第 ${i + 1} / ${pdf.numPages} 页…`;
      }
      prog.remove();
      modal.querySelector('[data-role="note"]').textContent = (doc.name || '') + ' · 共 ' + pdf.numPages + ' 页';
    } catch (e) {
      console.error('PDF 渲染失败', e);
      body.innerHTML = `<div class="pdf-loading">渲染失败，请点右上角「新窗口打开」查看。<br>
        <span style="font-size:12px;opacity:.8">${esc((e && e.message) || e)}</span></div>`;
    }
  }

  /* ---------- 后台管理（页签） ---------- */
  async function manage(tab) {
    const tabs = [['records', '记录管理'], ['fields', '字段管理'], ['import', '数据导入'], ['pdfs', '标准原文'], ['backup', '备份恢复']];
    $app.innerHTML = `
      ${appbar('后台管理', true)}
      <nav class="tabs">
        ${tabs.map(([k, label]) => `<button class="tab ${k === tab ? 'active' : ''}" data-tab="${k}">${label}</button>`).join('')}
      </nav>
      <div id="tabbody" class="tabbody"></div>
    `;
    $app.querySelector('[data-act="back"]').addEventListener('click', () => go('/'));
    $app.querySelectorAll('.tab').forEach((b) =>
      b.addEventListener('click', () => go('/manage?tab=' + b.dataset.tab)));

    const body = $app.querySelector('#tabbody');
    if (tab === 'records') {
      const [fields, records] = await Promise.all([DB.getAllFields(), DB.getAllRecords()]);
      const paramKey = (fields.find((f) => f.name === '参数') || {}).key || 'param_name';
      const methodKey = (fields.find((f) => f.name === '方法(标准号)') || {}).key || 'method';
      const sorted = records.slice().sort((a, b) => String(a.data[paramKey]).localeCompare(String(b.data[paramKey])));
      body.innerHTML = `
        <button class="btn btn-primary block" data-act="add">＋ 新增记录</button>
        <div class="list">
          ${sorted.map((r) => `<div class="row" data-id="${r.id}">
            <div class="row-main"><div class="row-title">${disp(r.data[paramKey])}</div><div class="row-sub">${disp(r.data[methodKey])}</div></div>
            <button class="row-del" data-del="${r.id}" aria-label="删除">🗑</button>
          </div>`).join('') || '<div class="empty">还没有记录</div>'}
        </div>`;
      body.querySelector('[data-act="add"]').addEventListener('click', () => go('/record/edit'));
      body.querySelectorAll('.row').forEach((row) =>
        row.addEventListener('click', (e) => {
          if (e.target.dataset.del) return;
          go('/record/edit?id=' + row.dataset.id);
        }));
      body.querySelectorAll('[data-del]').forEach((b) =>
        b.addEventListener('click', async (e) => {
          e.stopPropagation();
          if (!confirm('删除这条记录？')) return;
          await DB.deleteRecord(b.dataset.del); toast('已删除'); manage('records');
        }));
    } else if (tab === 'fields') {
      const fields = await DB.getAllFields();
      const groups = groupFields(fields);
      body.innerHTML = `
        <button class="btn btn-primary block" data-act="add">＋ 新增字段</button>
        ${groups.map((g) => {
          const fs = g.fields.filter((f) => !f.hidden);
          if (!fs.length) return '';
          return `<div class="group">
          <div class="group-title">${esc(g.group)}</div>
          ${fs.map((f) => `<div class="row field-manage-row" data-key="${esc(f.key)}">
            <div class="row-main">
              <div class="row-title">${esc(f.name)}${f.unit ? ' <span class="unit">(' + esc(f.unit) + ')</span>' : ''}</div>
              <div class="row-sub">${esc(TYPE_LABEL[f.type] || f.type || '文本')}${subOf(f) ? ' · ' + esc(subOf(f)) : ''}${f.filterable ? ' · 可筛选' : ''}</div>
            </div>
            <button class="row-del" data-fdel="${esc(f.key)}" aria-label="删除字段">🗑</button>
          </div>`).join('')}
        </div>`;}).join('')}
        <p class="hint">点某一行可改名 / 换板块 / 换小版块；点 🗑 删除字段。删除只移除字段本身，记录里已填的内容不会被清掉（只是不再显示）。</p>`;
      body.querySelector('[data-act="add"]').addEventListener('click', () => go('/field/new'));
      // 点行 = 编辑该字段（改名称 / 归属 / 单位 / 选项）
      body.querySelectorAll('.field-manage-row').forEach((row) =>
        row.addEventListener('click', (e) => {
          if (e.target.closest('[data-fdel]')) return;
          go('/field/new?id=' + encodeURIComponent(row.dataset.key));
        }));
      body.querySelectorAll('[data-fdel]').forEach((b) =>
        b.addEventListener('click', async (e) => {
          e.stopPropagation();
          const f = fields.find((x) => x.key === b.dataset.fdel);
          if (!f) return;
          if (isCoreField(f)) { toast('「' + f.name + '」是核心字段，不能删除'); return; }
          const used = await countFieldUsage(f.key);
          const msg = '删除字段「' + f.name + '」？'
            + (used ? '\n有 ' + used + ' 条记录填过这个字段，删除后这些内容不再显示（记录本身不删）。' : '')
            + '\n删除后可在「＋ 新增字段」里重新加回来。';
          if (!confirm(msg)) return;
          await deleteFieldSafely(f.key);
          toast('已删除字段：' + f.name);
          manage('fields');
        }));
    } else if (tab === 'import') {
      body.innerHTML = `<div class="pad"><p class="hint">在「数据导入」页选择本页签下方的入口，或点下方按钮开始导入 Excel/CSV。</p>
        <button class="btn btn-primary block" data-act="go">开始导入</button></div>`;
      body.querySelector('[data-act="go"]').addEventListener('click', () => go('/import'));
    } else if (tab === 'pdfs') {
      const [list, defId, cats] = await Promise.all([DB.listPdfs(), DB.getMeta('defaultPdfId'), DB.listCategories()]);
      const catName = (id) => (cats.find((c) => c.id === id) || {}).name || '未分类';
      body.innerHTML = `
        <div class="group"><div class="group-title">上传标准原文 PDF</div>
          <p class="hint">上传的 PDF 只保存在这台设备的本地数据库中，不会联网上传。上传后自动设为默认；
             详情页点「查看」即打开<strong>默认</strong>的那份（供未单独绑定标准的方法使用）。
             也可到首页「标准库」按分类上传与浏览。</p>
          <div class="form-row"><label class="label">归入分类</label>
            <select id="pdfCat" class="input">${cats.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select>
          </div>
          <input id="pdf" class="input" type="file" accept="application/pdf,.pdf" multiple />
          <button class="btn btn-primary block" data-act="up" disabled id="doUp">上传并设为默认</button>
        </div>
        <div class="group"><div class="group-title">已保存（${list.length}）</div>
          ${list.map((d) => `<div class="row">
            <div class="row-main">
              <div class="row-title">${esc(d.name)}</div>
              <div class="row-sub">${esc(catName(d.category))} · ${fmtSize(d.size)}${d.id === defId ? ' · 默认' : ''}${d.builtin ? ' · 内置' : ''}</div>
            </div>
            ${d.id === defId ? '' : `<button class="linkbtn" data-def="${esc(d.id)}">设为默认</button>`}
            <button class="row-del" data-del="${esc(d.id)}" aria-label="删除">🗑</button>
          </div>`).join('') || '<div class="empty">还没有标准原文</div>'}
        </div>`;

      const pdfInput = body.querySelector('#pdf');
      const doUp = body.querySelector('#doUp');
      pdfInput.addEventListener('change', () => { doUp.disabled = !pdfInput.files[0]; });
      doUp.addEventListener('click', async () => {
        const files = Array.from(pdfInput.files || []);
        if (!files.length) return;
        const catId = body.querySelector('#pdfCat').value;
        doUp.disabled = true;
        let lastId = null;
        for (const f of files) {
          lastId = 'pdf_' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
          await DB.putPdf({ id: lastId, name: f.name, size: f.size, blob: f, category: catId });
        }
        await DB.setMeta('defaultPdfId', lastId);
        toast('已上传 ' + files.length + ' 份并设为默认');
        manage('pdfs');
      });
      body.querySelectorAll('[data-def]').forEach((b) => b.addEventListener('click', async () => {
        await DB.setMeta('defaultPdfId', b.dataset.def); toast('已设为默认'); manage('pdfs');
      }));
      body.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
        const doc = await DB.getPdf(b.dataset.del);
        const used = await countPdfUsage(b.dataset.del);
        const nm = doc ? doc.name : '这份标准';
        const msg = used
          ? '删除标准「' + nm + '」？\n有 ' + used + ' 条方法记录正在引用它，删除后这些记录会回退到默认标准。'
          : '删除标准「' + nm + '」？';
        if (!confirm(msg)) return;
        await deletePdfSafely(b.dataset.del);
        toast('已删除'); manage('pdfs');
      }));
    } else if (tab === 'backup') {
      body.innerHTML = `<div class="pad"><p class="hint">在「备份恢复」页导出/导入备份文件，或点下方按钮。</p>
        <button class="btn btn-primary block" data-act="go">备份与恢复</button></div>`;
      body.querySelector('[data-act="go"]').addEventListener('click', () => go('/backup'));
    }
  }

  /* ---------- 记录编辑（新增/修改） ---------- */
  /* ---------- 从「标准库」挑选已上传的标准原文 ----------
     编辑记录时优先从标准库里选，避免同一种标准反复上传占空间。 */
  async function openLibPicker(onPick) {
    const [rawDocs, cats] = await Promise.all([DB.listPdfs(), DB.listCategories()]);
    const docs = sortByName(rawDocs);
    let modal = document.getElementById('libPickModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'libPickModal';
      modal.className = 'pdf-modal'; // 复用 PDF 浮层的外观与显示逻辑
      document.body.appendChild(modal);
    }
    const byCat = {};
    for (const d of docs) { const k = d.category || UNCAT; (byCat[k] = byCat[k] || []).push(d); }
    const groups = cats.map((c) => ({ id: c.id, name: c.name, docs: byCat[c.id] || [] }));
    if (byCat[UNCAT] && byCat[UNCAT].length) groups.push({ id: UNCAT, name: '未分类', docs: byCat[UNCAT] });

    modal.innerHTML = `
      <div class="pdf-bar">
        <button class="pdf-close" data-act="pickclose" aria-label="关闭">×</button>
        <div class="pdf-title">从标准库选择</div>
        <span class="pick-count">共 ${docs.length} 份</span>
      </div>
      <div class="pick-body">
        ${docs.length ? groups.filter((g) => g.docs.length).map((g) => `
          <div class="pick-group">
            <div class="pick-group-title">${esc(g.name)}<span class="pick-n">${g.docs.length}</span></div>
            ${g.docs.map((d) => `<div class="pick-item${d.id === curPickId() ? ' on' : ''}" data-id="${esc(d.id)}">
              <span class="dot">📄</span>
              <span class="pick-item-name">${esc(d.name)}</span>
              <span class="pick-item-sub">${fmtSize(d.size)}</span>
            </div>`).join('')}
          </div>`).join('') : '<div class="empty">标准库里还没有文件，请点「从手机上传」</div>'}
      </div>`;
    modal.classList.add('show');
    modal.querySelector('[data-act="pickclose"]').addEventListener('click', () => modal.classList.remove('show'));
    modal.querySelectorAll('.pick-item').forEach((el) => el.addEventListener('click', () => {
      modal.classList.remove('show');
      onPick(el.dataset.id);
    }));
  }
  let _curPickId = '';
  const curPickId = () => _curPickId;

  async function recordEdit(id) {
    const fields = await DB.getAllFields();
    const rec = id ? await DB.getRecord(id) : null;
    const data = (rec && rec.data) || {};
    const visible = fields.filter((f) => !f.hidden); // 旧字段已隐藏，不再出现在表单里
    const groups = groupFields(visible);
    // 板块内按小版块再分一层（如 质控措施 → 平行 / 加标 / 校核点），与详情页结构一致
    function splitBySub(fs) {
      const out = [];
      for (const f of fs) {
        const s = subOf(f);
        let t = out.find((x) => x.sub === s);
        if (!t) { t = { sub: s, fields: [] }; out.push(t); }
        t.fields.push(f);
      }
      return out;
    }

    // 多行配对里的一行（如 保存方式 / 保存时效）
    function pairRow(subs, r) {
      r = r || {};
      return `<div class="pair-row">
        ${subs.map((s) => `<input class="input" data-sub="${esc(s.k)}" placeholder="${esc(s.label)}"
           value="${esc(r[s.k] == null ? '' : r[s.k])}" />`).join('')}
        <button type="button" class="row-del" data-delrow aria-label="删除该行">🗑</button>
      </div>`;
    }

    function formField(f) {
      const val = data[f.key];
      if (f.type === 'select') {
        const v = String(val == null ? '' : val);
        return `<div class="form-row">
          <label class="label">${esc(f.name)}${f.unit ? ' (' + esc(f.unit) + ')' : ''}</label>
          <select class="input" name="f_${esc(f.key)}">
            <option value="">（未选择）</option>
            ${(f.options || []).map((o) => `<option value="${esc(o)}"${v === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}
          </select>
        </div>`;
      }
      if (f.type === 'multiselect') {
        const arr = Array.isArray(val) ? val : (String(val == null ? '' : val).trim() ? [String(val).trim()] : []);
        return `<div class="form-row">
          <label class="label">${esc(f.name)}</label>
          <div class="checks">
            ${(f.options || []).map((o) => `<label class="chk${arr.indexOf(o) >= 0 ? ' on' : ''}">
              <input type="checkbox" name="ms_${esc(f.key)}" value="${esc(o)}" ${arr.indexOf(o) >= 0 ? 'checked' : ''} />
              <span>${esc(o)}</span></label>`).join('')}
          </div>
        </div>`;
      }
      if (f.type === 'pairs') {
        const rows = Array.isArray(val) ? val : [];
        const subs = f.subs || [];
        return `<div class="form-row">
          <label class="label">${esc(f.name)}</label>
          <div class="pairs" data-pairs="${esc(f.key)}" data-subs="${esc(subs.map((s) => s.k).join(','))}">
            ${(rows.length ? rows : [{}]).map((r) => pairRow(subs, r)).join('')}
          </div>
          <button type="button" class="btn btn-mini" data-addpair="${esc(f.key)}">＋ 增加一行</button>
        </div>`;
      }
      const v = Array.isArray(val) ? '' : (val == null ? '' : val);
      return `<div class="form-row">
        <label class="label">${esc(f.name)}${f.unit ? ' (' + esc(f.unit) + ')' : ''}</label>
        <input class="input" name="f_${esc(f.key)}" value="${esc(v)}" />
      </div>`;
    }

    // 本条记录绑定的标准原文 PDF（存 pdfs 表，data.std_pdf_id 只存 id）
    let stdPdfId = String(data.std_pdf_id || '');

    $app.innerHTML = `
      ${appbar(id ? '编辑记录' : '新增记录', true)}
      <form id="form" class="form">
        ${groups.map((g) => `<div class="group">
          <div class="group-title">${esc(g.group)}</div>
          ${splitBySub(g.fields).map((sg) => (sg.sub ? `<div class="sub-label">${esc(sg.sub)}</div>` : '') + sg.fields.map(formField).join('')).join('')}
          ${(g.group === '基本信息' || g.group === '基础信息') ? `
          <div class="form-row">
            <label class="label">标准原文（PDF）</label>
            <div class="pdf-up">
              <div class="pdf-up-name" data-role="pdfname">未上传</div>
              <div class="pdf-up-btns">
                <button type="button" class="btn btn-mini btn-mini-primary" data-act="picklib">从标准库选择</button>
                <button type="button" class="btn btn-mini" data-act="pickpdf">从手机上传</button>
                <button type="button" class="btn btn-mini btn-mini-danger" data-act="clearpdf" hidden>移除</button>
              </div>
              <div class="pdf-up-tip">优先从标准库选择；库里没有再「从手机上传」，上传后会自动加入标准库（未分类）。</div>
            </div>
            <input type="file" id="pdfInput" accept="application/pdf,.pdf" hidden />
          </div>` : ''}
        </div>`).join('')}
        <div class="actions">
          <button type="submit" class="btn btn-primary">保存</button>
          <button type="button" class="btn" data-act="cancel">取消</button>
        </div>
      </form>`;

    const form = $app.querySelector('#form');
    // 配对行：增删
    form.addEventListener('click', (e) => {
      const add = e.target.closest('[data-addpair]');
      if (add) {
        const box = form.querySelector(`[data-pairs="${add.dataset.addpair}"]`);
        const subs = (box.dataset.subs || '').split(',').filter(Boolean).map((k) => ({ k, label: k }));
        box.insertAdjacentHTML('beforeend', pairRow(subs, {}));
        return;
      }
      const del = e.target.closest('[data-delrow]');
      if (del) {
        const row = del.closest('.pair-row');
        const box = row.parentElement;
        if (box.querySelectorAll('.pair-row').length > 1) row.remove();
        else row.querySelectorAll('input').forEach((i) => { i.value = ''; }); // 最后一行只清空
      }
    });
    // 多选：勾选时同步高亮样式
    form.addEventListener('change', (e) => {
      const cb = e.target.closest('input[type="checkbox"]');
      if (cb && cb.name && cb.name.indexOf('ms_') === 0) {
        const lab = cb.closest('.chk');
        if (lab) lab.classList.toggle('on', cb.checked);
      }
    });

    // ---- 标准原文：为这一条方法单独上传/绑定 PDF（存本地 IndexedDB，不联网）----
    const pdfInput = form.querySelector('#pdfInput');
    const pdfNameEl = form.querySelector('[data-role="pdfname"]');
    const clearBtn = form.querySelector('[data-act="clearpdf"]');
    function paintPdf(name, pid) {
      _curPickId = pid || '';
      if (!pdfNameEl) return;
      pdfNameEl.textContent = name || '未上传';
      pdfNameEl.classList.toggle('on', !!name);
      if (clearBtn) clearBtn.hidden = !name;
    }
    (async () => {
      if (!pdfNameEl || !stdPdfId) return;
      const doc = await DB.getPdf(stdPdfId);
      if (doc) paintPdf(doc.name, doc.id); else { stdPdfId = ''; paintPdf('', ''); }
    })();
    form.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="picklib"]')) {
        DB.listPdfs().then(async (docs) => {
          if (!docs.length) { toast('标准库里还没有文件，请点「从手机上传」'); return; }
          await openLibPicker(async (pid) => {
            const doc = await DB.getPdf(pid);
            if (!doc) { toast('文件已不存在'); return; }
            stdPdfId = pid;
            paintPdf(doc.name, pid);
            toast('已绑定：' + doc.name);
          });
        });
        return;
      }
      if (e.target.closest('[data-act="pickpdf"]')) { pdfInput && pdfInput.click(); return; }
      if (e.target.closest('[data-act="clearpdf"]')) {
        stdPdfId = '';
        paintPdf('', '');
        toast('已解除绑定（文件仍留在标准原文库，可在后台删除）');
      }
    });
    if (pdfInput) pdfInput.addEventListener('change', async () => {
      const file = pdfInput.files && pdfInput.files[0];
      if (!file) return;
      const isPdf = /\.pdf$/i.test(file.name) || file.type === 'application/pdf';
      if (!isPdf) { toast('请选择 PDF 文件'); pdfInput.value = ''; return; }
      const pid = 'pdf_' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
      // 上传的文件同时进入「标准库」（未分类），之后可在标准库里移到对应分类
      await DB.putPdf({ id: pid, name: file.name, size: file.size, blob: file, uploadedAt: Date.now() });
      stdPdfId = pid;
      paintPdf(file.name, pid);
      toast('已上传并加入标准库：' + file.name);
      pdfInput.value = '';
    });

    $app.querySelector('[data-act="back"]').addEventListener('click', () => go(id ? '/detail?id=' + id : '/manage?tab=records'));
    $app.querySelector('[data-act="cancel"]').addEventListener('click', () => go(id ? '/detail?id=' + id : '/manage?tab=records'));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newData = {};
      for (const f of visible) {
        if (f.type === 'multiselect') {
          newData[f.key] = fd.getAll('ms_' + f.key).map(String);
        } else if (f.type === 'pairs') {
          const box = form.querySelector(`[data-pairs="${f.key}"]`);
          newData[f.key] = [...box.querySelectorAll('.pair-row')].map((row) => {
            const o = {};
            row.querySelectorAll('input[data-sub]').forEach((inp) => { o[inp.dataset.sub] = inp.value.trim(); });
            return o;
          }).filter((o) => Object.values(o).some((x) => x));
        } else {
          newData[f.key] = (fd.get('f_' + f.key) || '').toString().trim();
        }
      }
      // 隐藏的旧字段原样保留，避免历史数据被清空
      for (const f of fields) if (f.hidden && data[f.key] !== undefined) newData[f.key] = data[f.key];
      newData.std_pdf_id = stdPdfId; // 本条绑定的标准原文 PDF
      await DB.putRecord({ id: id ? Number(id) : undefined, data: newData });
      toast('已保存');
      go(id ? '/detail?id=' + id : '/');
    });
  }

  /* ---------- 字段新增 ---------- */
  /* ---------- 新增 / 编辑字段 ----------
     新增字段可以指定：四大板块（基本信息/样品信息/标准曲线/质控措施）+ 板块内的小版块（如 加标、校核点），
     也可以选「不分子版块」直接放在板块下，或现场新建一个小版块。 */
  async function fieldEdit(id) {
    const fields = await DB.getAllFields();
    const cur = id ? fields.find((f) => f.key === id) : null;
    const editing = !!cur;
    const knownGroups = [...new Set(fields.map((f) => f.group).filter(Boolean))];
    const groupList = SECTION_TITLES.concat(knownGroups.filter((g) => SECTION_TITLES.indexOf(g) < 0));
    const curGroup = cur ? (cur.group || '其他信息') : '基本信息';
    const curSub = cur ? (cur.sub || '') : '';
    const curType = cur ? (cur.type || 'text') : 'text';
    const curExtra = cur
      ? (cur.type === 'multiselect' ? (cur.options || []).join(',')
        : cur.type === 'pairs' ? (cur.subs || []).map((s) => s.label).join(',') : '')
      : '';

    function subOptionsHtml(group, sel) {
      const list = subOptionsOf(group, fields);
      return `<option value=""${sel ? '' : ' selected'}>（不分子版块，直接放在板块下）</option>`
        + list.map((s) => `<option value="${esc(s)}"${s === sel ? ' selected' : ''}>${esc(s)}</option>`).join('')
        + '<option value="__new__">＋ 新建小版块…</option>';
    }

    $app.innerHTML = `
      ${appbar(editing ? '编辑字段' : '新增字段', true)}
      <form id="form" class="form">
        <div class="form-row"><label class="label">字段名称 *</label><input class="input" name="name" required
          placeholder="如：前处理方法" value="${esc(cur ? cur.name : '')}" /></div>
        <div class="form-row"><label class="label">所属板块</label>
          <select class="input" id="fGroup">
            ${groupList.map((g) => `<option value="${esc(g)}"${g === curGroup ? ' selected' : ''}>${esc(g)}</option>`).join('')}
            <option value="__new__">＋ 新建板块…</option>
          </select>
        </div>
        <div class="form-row"><label class="label">板块内的小版块</label>
          <select class="input" id="fSub" name="sub">${subOptionsHtml(curGroup, curSub)}</select>
          <div class="hint" style="margin:6px 0 0">例：板块选「质控措施」，小版块选「加标」，该字段就会出现在详情页「质控措施 → 加标」里。</div>
        </div>
        ${editing ? `<div class="form-row"><label class="label">类型</label>
          <div class="input input-static">${esc(TYPE_LABEL[curType] || curType)}（已存数据，不支持改类型）</div></div>`
        : `<div class="form-row"><label class="label">类型</label>
          <select class="input" name="type">
            <option value="text">文本</option><option value="number">数字</option>
            <option value="date">日期</option><option value="select">单选</option>
            <option value="multiselect">多选（可勾选多个）</option>
            <option value="pairs">多行配对（表格，如 方式/时效）</option>
          </select></div>`}
        ${(!editing || curType === 'select' || curType === 'multiselect' || curType === 'pairs') ? `
        <div class="form-row"><label class="label">选项 / 子字段</label>
          <input class="input" name="extra" placeholder="多选填选项；多行配对填子字段名，逗号分隔" value="${esc(curExtra)}" />
          <div class="hint" style="margin:6px 0 0">例：多选填「地表水,地下水,工业废水」；多行配对填「保存方式,保存时效」</div>
        </div>` : ''}
        <div class="form-row"><label class="label">单位（可选）</label><input class="input" name="unit"
          placeholder="如：mg/L" value="${esc(cur ? (cur.unit || '') : '')}" /></div>
        <div class="form-row check"><label><input type="checkbox" name="filterable" ${cur && cur.filterable ? 'checked' : ''} /> 参与首页筛选</label></div>
        <div class="actions">
          <button type="submit" class="btn btn-primary">保存</button>
          ${editing ? `<button type="button" class="btn btn-danger" data-act="del">删除该字段</button>` : ''}
          <button type="button" class="btn" data-act="cancel">取消</button>
        </div>
      </form>`;
    $app.querySelector('[data-act="back"]').addEventListener('click', () => go('/manage?tab=fields'));
    $app.querySelector('[data-act="cancel"]').addEventListener('click', () => go('/manage?tab=fields'));

    const groupSel = $app.querySelector('#fGroup');
    const subSel = $app.querySelector('#fSub');
    groupSel.addEventListener('change', async () => {
      let g = groupSel.value;
      if (g === '__new__') {
        g = (prompt('新板块名称：') || '').trim();
        if (!g) { groupSel.value = curGroup; return; }
        if (groupList.indexOf(g) < 0) {
          groupSel.insertBefore(new Option(g, g), groupSel.lastChild);
        }
        groupSel.value = g;
      }
      subSel.innerHTML = subOptionsHtml(g, '');
    });
    // 选「＋ 新建小版块…」时现场起名
    subSel.addEventListener('change', () => {
      if (subSel.value !== '__new__') return;
      const s = (prompt('新小版块名称：', '') || '').trim();
      if (!s) { subSel.value = ''; return; }
      const opt = new Option(s, s);
      subSel.insertBefore(opt, subSel.lastChild);
      subSel.value = s;
    });

    const delBtn = $app.querySelector('[data-act="del"]');
    if (delBtn) delBtn.addEventListener('click', async () => {
      if (isCoreField(cur)) { toast('「' + cur.name + '」是核心字段，不能删除'); return; }
      const used = await countFieldUsage(cur.key);
      const msg = '删除字段「' + cur.name + '」？'
        + (used ? '\n有 ' + used + ' 条记录填过这个字段，删除后这些内容不再显示（记录本身不删）。' : '');
      if (!confirm(msg)) return;
      await deleteFieldSafely(cur.key);
      toast('已删除字段'); go('/manage?tab=fields');
    });

    $app.querySelector('#form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = (fd.get('name') || '').toString().trim();
      if (!name) { toast('请填写字段名称'); return; }
      let group = (fd.get('group') || groupSel.value || '').toString().trim();
      if (group === '__new__') group = (prompt('新板块名称：') || '').trim() || '其他信息';
      let sub = (fd.get('sub') || '').toString().trim();
      if (sub === '__new__') sub = (prompt('新小版块名称：') || '').trim();
      const list = ((fd.get('extra') || '').toString())
        .split(/[,，]/).map((s) => s.trim()).filter(Boolean);
      const type = editing ? curType : (fd.get('type') || 'text');

      const base = {
        name,
        group: group || '其他信息',
        sub: sub || '',
        unit: (fd.get('unit') || '').toString().trim(),
        filterable: !!fd.get('filterable')
      };
      if (editing) {
        const next = Object.assign({}, cur, base, { type: curType });
        if (curType === 'select' || curType === 'multiselect') next.options = list;
        if (curType === 'pairs') next.subs = list.map((s, i) => ({ k: 'c' + (i + 1), label: s }));
        await DB.putField(next);
        toast('字段已更新');
      } else {
        const key = 'f_' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
        const sort = (fields.reduce((m, f) => Math.max(m, f.sort || 0), 0)) + 1;
        const f = Object.assign({ key, type, sort }, base);
        if (type === 'multiselect') f.options = list;
        if (type === 'pairs') f.subs = list.map((s, i) => ({ k: 'c' + (i + 1), label: s }));
        await DB.putField(f);
        toast('字段已添加');
      }
      go('/manage?tab=fields');
    });
  }

  /* ---------- 数据导入（Excel/CSV + 列映射） ---------- */
  async function importPage() {
    const fields = await DB.getAllFields();
    $app.innerHTML = `
      ${appbar('数据导入', true)}
      <div class="pad">
        <p class="hint">选择 Excel(.xlsx/.xls) 或 CSV 文件，下方会列出每一列，请把它对应到 App 里的字段（或选择“忽略”/“新建字段”）。</p>
        <input id="file" class="input" type="file" accept=".xlsx,.xls,.csv" />
        <div id="map"></div>
        <div id="preview"></div>
        <div class="actions"><button class="btn btn-primary block" id="doImport" disabled>导入</button></div>
      </div>`;
    $app.querySelector('[data-act="back"]').addEventListener('click', () => go('/manage?tab=import'));
    const fileInput = $app.querySelector('#file');
    const mapEl = $app.querySelector('#map');
    const previewEl = $app.querySelector('#preview');
    const doBtn = $app.querySelector('#doImport');

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      doBtn.disabled = true; mapEl.innerHTML = ''; previewEl.innerHTML = '';
      try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (rows.length < 2) { toast('文件没有可导入的数据行'); return; }
        const headers = rows[0].map((h, i) => (h === '' || h == null) ? ('列' + (i + 1)) : String(h));
        const dataRows = rows.slice(1).filter((r) => r.some((c) => String(c).trim() !== ''));

        // 多行配对字段按“子字段”单独列出，可把 Excel 的两列分别映射到 保存方式 / 保存时效
        const opts = [];
        for (const f of fields) {
          if (f.hidden) continue;
          if (f.type === 'pairs' && f.subs && f.subs.length) {
            for (const s of f.subs) {
              opts.push(`<option value="${esc(f.key)}:${esc(s.k)}">${esc(f.name)}·${esc(s.label)}（${esc(f.group)}）</option>`);
            }
          } else {
            opts.push(`<option value="${esc(f.key)}">${esc(f.name)}（${esc(f.group)}）</option>`);
          }
        }
        const fieldOpts = opts.join('');
        mapEl.innerHTML = `<div class="group"><div class="group-title">列映射</div>
          ${headers.map((h, i) => `<div class="form-row">
            <label class="label">${esc(h)}</label>
            <select class="input" data-col="${i}">
              <option value="">— 忽略 —</option>
              ${fieldOpts}
              <option value="__new__">＋ 新建字段（用表头名）</option>
            </select>
          </div>`).join('')}
        </div>`;

        const selects = [...mapEl.querySelectorAll('select[data-col]')];
        function buildPreview() {
          const mapping = selects.map((s) => ({ col: +s.dataset.col, val: s.value }));
          const head = mapping.filter((m) => m.val).map((m) => {
            if (m.val === '__new__') return headers[m.col];
            const i = m.val.indexOf(':');
            if (i > 0) {
              const f = fields.find((x) => x.key === m.val.slice(0, i));
              const s = ((f && f.subs) || []).find((x) => x.k === m.val.slice(i + 1));
              return (f ? f.name : '') + '·' + (s ? s.label : m.val.slice(i + 1));
            }
            return (fields.find((f) => f.key === m.val) || {}).name || m.val;
          });
          const bodyRows = dataRows.slice(0, 5).map((r) =>
            '<tr>' + mapping.filter((m) => m.val).map((m) => `<td>${esc(r[m.col])}</td>`).join('') + '</tr>').join('');
          previewEl.innerHTML = `<div class="group"><div class="group-title">预览（前 5 行）</div>
            <div class="table-scroll"><table class="preview-table"><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
            <tbody>${bodyRows || '<tr><td>无数据</td></tr>'}</tbody></table></div></div>`;
          doBtn.disabled = !mapping.some((m) => m.val);
        }
        selects.forEach((s) => s.addEventListener('change', buildPreview));
        buildPreview();

        doBtn.onclick = async () => {
          doBtn.disabled = true;
          const mapping = selects.map((s) => ({ col: +s.dataset.col, val: s.value }));
          const newFields = [];
          // 先创建“新建字段”
          for (const m of mapping) {
            if (m.val === '__new__') {
              const key = 'f_' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
              const nm = headers[m.col];
              const sort = (fields.reduce((mx, f) => Math.max(mx, f.sort || 0), 0)) + 1;
              await DB.putField({ key, name: nm, group: '导入', type: 'text', unit: '', filterable: false, sort });
              m.resolved = key; newFields.push(key);
            } else {
              m.resolved = m.val;
            }
          }
          let count = 0;
          for (const r of dataRows) {
            const data = {};
            const pairAcc = {};
            for (const m of mapping) {
              if (!m.resolved) continue;
              const raw = String(r[m.col] == null ? '' : r[m.col]).trim();
              const i = m.resolved.indexOf(':');
              if (i > 0) {
                const k = m.resolved.slice(0, i), sub = m.resolved.slice(i + 1);
                (pairAcc[k] = pairAcc[k] || {})[sub] = raw;
              } else {
                data[m.resolved] = raw;
              }
            }
            // 映射到配对子字段的列，合成该字段的一行
            for (const k of Object.keys(pairAcc)) {
              if (Object.values(pairAcc[k]).some((x) => x)) data[k] = [pairAcc[k]];
            }
            // 多选字段：文本按顿号/逗号拆成数组
            for (const f of fields) {
              if (f.type === 'multiselect' && typeof data[f.key] === 'string') data[f.key] = toArray(data[f.key]);
            }
            const hasValue = Object.values(data).some((v) => (Array.isArray(v) ? v.length : v !== ''));
            if (hasValue) { await DB.putRecord({ data }); count++; }
          }
          toast('成功导入 ' + count + ' 条');
          go('/');
        };
      } catch (e) {
        console.error(e); toast('解析失败：' + (e.message || e));
      }
    });
  }

  /* ---------- 备份与恢复 ---------- */
  async function backupPage() {
    $app.innerHTML = `
      ${appbar('备份与恢复', true)}
      <div class="pad">
        <div class="group"><div class="group-title">导出备份</div>
          <p class="hint">把当前全部字段与记录导出成一个 JSON 文件，存到手机/电脑/网盘。完全离线，数据不会上传到任何服务器。
             <br><strong>注：</strong>标准原文 PDF 体积较大，不随备份导出，请另行保留原始 PDF 文件。</p>
          <button class="btn btn-primary block" data-act="export">导出 JSON 备份</button>
        </div>
        <div class="group"><div class="group-title">从备份恢复</div>
          <p class="hint">选择之前导出的 JSON 备份文件，将<strong>覆盖</strong>当前所有数据。恢复前建议先导出一份当前备份。</p>
          <input id="bk" class="input" type="file" accept=".json,application/json" />
          <button class="btn btn-danger block" data-act="import" disabled id="doRestore">恢复（覆盖）</button>
        </div>
      </div>`;
    $app.querySelector('[data-act="back"]').addEventListener('click', () => go('/manage?tab=backup'));

    $app.querySelector('[data-act="export"]').addEventListener('click', async () => {
      const [fields, records] = await Promise.all([DB.getAllFields(), DB.getAllRecords()]);
      const payload = { app: 'param-qc', version: 1, exportedAt: new Date().toISOString(), fields, records };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = URL.createObjectURL(blob);
      a.download = `我的检测参数_备份_${stamp}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('已导出备份文件');
    });

    const bk = $app.querySelector('#bk');
    const doRestore = $app.querySelector('#doRestore');
    bk.addEventListener('change', () => { doRestore.disabled = !bk.files[0]; });
    doRestore.addEventListener('click', async () => {
      const file = bk.files[0]; if (!file) return;
      if (!confirm('恢复将覆盖当前全部数据，确定继续？')) return;
      try {
        const text = await file.text();
        const payload = JSON.parse(text);
        if (!payload.fields || !payload.records) { toast('文件格式不正确'); return; }
        await DB.clearAll();
        let sort = 0;
        for (const f of payload.fields) { if (f.sort == null) f.sort = sort++; await DB.putField(f); }
        for (const r of payload.records) { await DB.putRecord({ data: r.data }); }
        await DB.setMeta('seeded', true);
        toast('恢复完成，共 ' + payload.records.length + ' 条');
        go('/');
      } catch (e) { console.error(e); toast('恢复失败：' + (e.message || e)); }
    });
  }

  /* ---------- 字段补齐：保证种子里的新字段也进入已有库 ---------- */
  async function ensureFieldsFromSeed() {
    const existing = await DB.getAllFields();
    const have = new Set(existing.map((f) => f.key));
    const deleted = new Set((await DB.getMeta('deletedFields')) || []); // 用户删掉的字段不再补回来
    for (const sf of ((window.SEED_DATA || {}).fields || [])) {
      if (deleted.has(sf.key)) continue;
      if (!have.has(sf.key)) { await DB.putField(Object.assign({}, sf)); continue; }
      // 已存在但定义变了（如「适用类型」由文本改为多选）→ 以种子为准更新定义
      const cur = existing.find((f) => f.key === sf.key);
      const same = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);
      // 定义变了（改名 / 改板块 / 改类型 / 上下线）→ 以种子为准更新，历史数据不丢
      if (cur && (cur.type !== sf.type || !!cur.hidden !== !!sf.hidden
        || cur.name !== sf.name || cur.group !== sf.group
        || !same(cur.subs, sf.subs) || !same(cur.options, sf.options))) {
        await DB.putField(Object.assign({}, cur, {
          name: sf.name, group: sf.group,
          type: sf.type, subs: sf.subs, options: sf.options, hidden: !!sf.hidden
        }));
      }
    }
  }

  /* ---------- 旧数据迁移：把旧文本字段搬进新的多行配对 / 多选结构 ---------- */
  const CONC_RE = /^\s*([\d.]+)\s*(mg\/L|ug\/mL|µg\/mL|μg\/mL|g\/L|ug\/L|μg\/L|µg\/L|mg\/l|g\/l)\s*(.*)$/i;
  // "50 mg/L 6个月" → { conc:'50 mg/L', expiry:'6个月' }（旧表里浓度和时效写在同一格）
  function splitConcExp(v) {
    v = String(v == null ? '' : v).trim();
    if (!v || v === '/') return { conc: '', expiry: '' };
    const m = v.match(CONC_RE);
    if (m) return { conc: (m[1] + ' ' + m[2]).trim(), expiry: (m[3] || '').trim() };
    if (/现用现配|市售|个月|月|周|年|天|小时|\d+\s*h|\d+\s*d/i.test(v)) return { conc: '', expiry: v };
    return { conc: v, expiry: '' };
  }
  // "24h 冷冻1月" → [{method:'常温',period:'24h'},{method:'冷冻',period:'1月'}]
  function parseStorage(v) {
    v = String(v == null ? '' : v).trim();
    if (!v || v === '/') return [];
    if (v === '现场') return [{ method: '现场', period: '' }];
    const rows = [];
    const tokenRe = /(常温|冷藏|冷冻|避光|现场)|(\d+\s*(?:个月|月|周|天|小时|h|d|m|年))/g;
    let m, lastMethod = null, pendingDur = null;
    while ((m = tokenRe.exec(v))) {
      if (m[1]) {
        if (pendingDur) { rows.push({ method: lastMethod || '常温', period: pendingDur }); pendingDur = null; }
        lastMethod = m[1];
      } else if (m[2]) {
        if (lastMethod) { rows.push({ method: lastMethod, period: m[2] }); lastMethod = null; }
        else pendingDur = m[2];
      }
    }
    if (pendingDur) rows.push({ method: lastMethod || '常温', period: pendingDur });
    if (lastMethod) rows.push({ method: lastMethod, period: '' });
    if (!rows.length) rows.push({ method: '', period: v });
    return rows;
  }
  function toArray(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    const s = String(v == null ? '' : v).trim();
    if (!s || s === '/') return [];
    return s.split(/[、,，/;；\s]+/).filter(Boolean);
  }

  async function migrateRecordData() {
    const records = await DB.getAllRecords();
    let n = 0;
    for (const r of records) {
      const d = r.data || {};
      let changed = false;
      if (!Array.isArray(d.storage_pairs)) {
        const rows = parseStorage(d.sample_storage);
        const sm = String(d.save_method == null ? '' : d.save_method).trim();
        if (sm && sm !== '/' && rows.length && !rows[0].method) rows[0].method = sm;
        if (sm && sm !== '/' && !rows.length) rows.push({ method: sm, period: '' });
        d.storage_pairs = rows; changed = true;
      }
      if (!Array.isArray(d.ss_solutions)) {
        const rows = [];
        [['储备液', d.ss_reserve], ['中间液', d.ss_middle], ['使用液', d.ss_use]].forEach(([name, val]) => {
          const p = splitConcExp(val);
          if (p.conc || p.expiry) rows.push({ name, conc: p.conc, expiry: p.expiry });
        });
        d.ss_solutions = rows; changed = true;
      }
      if (!Array.isArray(d.applicable_type)) { d.applicable_type = toArray(d.applicable_type); changed = true; }
      // 校核点细分：旧「校核点」文本值迁到「校核浓度」
      const cp = String(d.qc_checkpoint == null ? '' : d.qc_checkpoint).trim();
      if (cp && cp !== '/' && d.qc_check_conc === undefined) { d.qc_check_conc = cp; changed = true; }
      if (changed) { await DB.putRecord({ id: r.id, data: d }); n++; }
    }
    return n;
  }

  /* ---------- 内置标准原文：首次启动把内置 PDF 存进本地库（后台可替换/删除） ---------- */
  const BUILTIN_PDF_ASSET = 'assets/standards/gb7475-87.pdf';
  const BUILTIN_PDF_NAME = 'GB 7475-87 水质 铜、锌、铅、镉的测定 原子吸收分光光度法.pdf';
  async function ensureDefaultPdf() {
    const list = await DB.listPdfs();
    if (list.length) return; // 已存在标准原文就不覆盖（老数据留在「未分类」，可在标准库里自行移动）
    try {
      const res = await fetch(BUILTIN_PDF_ASSET);
      if (!res.ok) return;
      const blob = await res.blob();
      const id = 'builtin_gb7475_87';
      const cat = (await DB.listCategories()).find((c) => c.name === '水和废水');
      await DB.putPdf({ id, name: BUILTIN_PDF_NAME, size: blob.size, blob, builtin: true, category: cat ? cat.id : null });
      const defId = await DB.getMeta('defaultPdfId');
      if (!defId) await DB.setMeta('defaultPdfId', id);
    } catch (e) { console.warn('内置标准原文未载入', e); }
  }

  /* ---------- 初始化 ---------- */
  /* 代码版本一致性自检：
     若浏览器读到的是旧缓存里的 db.js（例如只更新了 app.js、或缓存没刷新），
     app.js 会调用 db.js 里还不存在的新方法而白屏报错（如 DB.listCategories is not a function）。
     这里主动检测，发现不一致就清掉旧缓存并注销 Service Worker，然后自动重载一次拿到最新代码。 */
  async function ensureFreshRuntime() {
    const ok = typeof DB === 'object' && DB
      && typeof DB.listCategories === 'function'
      && typeof DB.getMeta === 'function';
    if (ok) return true;

    const flag = 'pq_runtime_healed';
    if (sessionStorage.getItem(flag)) { // 已自愈过一次，别再重载，避免死循环
      $app.innerHTML = `<div class="boot">代码版本不一致：请连网后强制刷新（Ctrl+Shift+R），
        或在手机设置里清除本站点数据后重新打开。</div>`;
      return false;
    }
    sessionStorage.setItem(flag, '1');
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      }
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (e) { console.warn('清理旧缓存失败（可忽略）', e); }
    location.reload();
    return false;
  }

  async function init() {
    $app.innerHTML = `<div class="boot">正在加载本地数据…</div>`;
    if (!(await ensureFreshRuntime())) return;
    try { await seedIfNeeded(); } catch (e) { console.error('seed error', e); }
    try { await ensureFieldsFromSeed(); } catch (e) { console.error('ensure error', e); }
    try { const n = await migrateRecordData(); if (n) console.log('已迁移记录', n, '条'); } catch (e) { console.error('migrate error', e); }
    try { await ensureDefaultCategories(); } catch (e) { console.error('category seed error', e); }
    try { await ensureDefaultPdf(); } catch (e) { console.error('pdf seed error', e); }
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        // 发现新版本：安装完成后（且当前已有旧版本在管），自动刷新一次拿到最新代码
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              toast('已更新到新版本，正在刷新…');
              setTimeout(() => location.reload(), 700);
            }
          });
        });
      }).catch(() => {});
    }
    window.addEventListener('hashchange', render);
    await render();
  }
  init();
})();
