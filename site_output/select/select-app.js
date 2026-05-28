// ==================== 选品池 ====================
let pool = [];
// 选品池中被勾选的索引集合（用于批量移除）
let poolSelected = new Set();
// 防抖：避免高频点击时反复整表重渲染选品池
let _poolRenderTimer = null;
function schedulePoolRender() {
  if (_poolRenderTimer) clearTimeout(_poolRenderTimer);
  // 仅当选品池 section 可见时才走整表渲染；不可见时只刷新计数
  const visible = document.getElementById('section-pool')?.classList.contains('active');
  if (!visible) return;
  _poolRenderTimer = setTimeout(() => {
    renderPool();
    _poolRenderTimer = null;
  }, 60);
}

// 客单价统一格式化：所有数字保留 1 位小数（"399" → "399.0"，"89-159" → "89.0-159.0"，"39.9" 不变）
function formatPrice(v) {
  if (v == null || v === '') return '';
  return String(v).replace(/(\d+\.?\d*)/g, m => {
    const n = parseFloat(m);
    return isNaN(n) ? m : n.toFixed(1);
  });
}

function addToPool(book, source) {
  const wasInPool = pool.some(p => p.title === book.title);
  if (wasInPool) {
    pool = pool.filter(p => p.title !== book.title);
  } else {
    pool.push({...book, source: source || 'unknown', addedAt: new Date().toISOString()});
  }
  // 埋点：加入/移除选品池
  try{ if(window.tracker) window.tracker.feature('select_pool_toggle', {action: wasInPool?'remove':'add', title: (book.title||'').slice(0,30), isbn: book.isbn||'', source: source||''}, null, 'select_hub'); }catch(e){}
  // 池数量变化后选中索引可能错位，简单做法是清空选中
  poolSelected.clear();
  // 仅更新轻量计数（O(1) 操作），避免整表重绘
  const navEl = document.getElementById('poolCountNav');
  const heroEl = document.getElementById('heroPoolCount');
  const subEl = document.getElementById('subtabPoolCount');
  if (navEl) navEl.textContent = pool.length;
  if (heroEl) heroEl.textContent = pool.length;
  if (subEl) subEl.textContent = pool.length;
  // 高亮反馈：右上方"🛒 选品池"按钮 + Hero 已选品计数 短暂 pulse
  const navBtn = document.querySelector('.topnav .pool-btn');
  if (navBtn) {
    navBtn.classList.remove('pool-btn-pulse');
    void navBtn.offsetWidth; // 强制重排，确保动画能重新触发
    navBtn.classList.add('pool-btn-pulse');
  }
  [heroEl, navEl, subEl].forEach(el => {
    if (!el) return;
    el.classList.remove('pool-count-pulse');
    void el.offsetWidth;
    el.classList.add('pool-count-pulse');
  });
  // 仅当选品池可见时才异步重绘表格
  schedulePoolRender();
}

// 兼容保留：原有 updatePoolUI 入口仍可用，但不再走在 addToPool 主路径里
function updatePoolUI() {
  const navEl = document.getElementById('poolCountNav');
  const heroEl = document.getElementById('heroPoolCount');
  const subEl = document.getElementById('subtabPoolCount');
  if (navEl) navEl.textContent = pool.length;
  if (heroEl) heroEl.textContent = pool.length;
  if (subEl) subEl.textContent = pool.length;
  renderPool();
}

function refreshActiveCards() {
  // 不再做整表重渲染。按钮态由点击事件即时翻转 + 卡片切换 tab 时由对应 render 函数兜底
}

function renderPool() {
  const body = document.getElementById('poolBody');
  if (!body) return;
  if (pool.length === 0) {
    body.innerHTML = `<div class="pool-empty"><div class="pool-empty-icon">🛒</div><p style="font-size:15px;color:#6b7280;">选品池为空</p><p style="margin-top:6px;font-size:12px;">从「选品 ISBN 池」加书～</p></div>`;
    return;
  }
  const selectedCount = poolSelected.size;
  const allSelected = selectedCount > 0 && selectedCount === pool.length;
  const partialSelected = selectedCount > 0 && selectedCount < pool.length;
  body.innerHTML = `
    <div class="toolbar">
      <span style="color:#374151;font-size:13px;">已选 <strong style="color:#3b82f6;">${pool.length}</strong> 本 · ISBN 完整 <strong style="color:#10b981;">${pool.filter(p=>p.isbn).length}</strong>${selectedCount?` · <span style="color:#ef4444;">勾选 <strong>${selectedCount}</strong> 本</span>`:''}</span>
      <button class="toolbar-btn success" onclick="exportPool('csv')">📥 CSV</button>
      <button class="toolbar-btn success" onclick="exportPool('json')">📥 JSON</button>
      <button class="toolbar-btn pool-batch-remove ${selectedCount?'':'is-disabled'}" id="poolBatchRemoveBtn" type="button" onclick="batchRemovePool()" ${selectedCount?'':'disabled'} title="移除已勾选的图书">🗑 批量移除${selectedCount?` (${selectedCount})`:''}</button>
      <div class="send-creative-wrap" style="margin-left:auto;position:relative;display:inline-block;">
        <button class="toolbar-btn send-creative-btn" id="sendCreativeBtn" type="button" onclick="togglePoolSendMenu(event)">🚀 一键送至创意生产中心 <span style="margin-left:4px;font-size:10px;">▾</span></button>
        <div class="send-creative-menu" id="sendCreativeMenu" style="display:none;position:absolute;right:0;top:100%;margin-top:4px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);min-width:240px;z-index:20;overflow:hidden;">
          <div style="padding:8px 12px;font-size:11px;color:#9ca3af;background:#f9fafb;border-bottom:1px solid #f3f4f6;">选择目标模块（队列模式）</div>
          <button class="send-creative-item" type="button" onclick="sendPoolToCreative('p4')" style="display:block;width:100%;text-align:left;padding:10px 14px;font-size:13px;background:#fff;border:none;cursor:pointer;color:#111827;border-bottom:1px solid #f3f4f6;">
            <span style="font-weight:600;">📚 图书内容提取</span>
            <div style="font-size:11px;color:#6b7280;margin-top:2px;">逐本 ISBN 自动检索全维度图书内容${selectedCount?'（仅送勾选项）':'（送全部）'}</div>
          </button>
          <button class="send-creative-item" type="button" onclick="sendPoolToCreative('p6')" style="display:block;width:100%;text-align:left;padding:10px 14px;font-size:13px;background:#fff;border:none;cursor:pointer;color:#111827;">
            <span style="font-weight:600;">📐 图片文案生成</span>
            <div style="font-size:11px;color:#6b7280;margin-top:2px;">逐本 ISBN 生成 4 版本 22 条横版大图文案${selectedCount?'（仅送勾选项）':'（送全部）'}</div>
          </button>
        </div>
      </div>
      <button class="toolbar-btn" onclick="if(confirm('确定清空整个选品池？')){pool=[];poolSelected.clear();updatePoolUI();}">清空</button>
    </div>
    <table class="pool-table">
      <thead><tr>
        <th class="col-check"><input type="checkbox" class="pool-check-all" id="poolCheckAll" ${allSelected?'checked':''} onclick="togglePoolSelectAll(this.checked)" title="${allSelected?'取消全选':'全选'}"></th>
        <th>#</th><th>封面</th><th>书名</th><th>品类</th><th>来源</th><th>ISBN</th><th>潜力分</th><th>状态</th><th>操作</th>
      </tr></thead>
      <tbody>
        ${pool.map((b, i) => {
          const cat = b.top_cat || mapToTopCat(b.cat||'');
          const checked = poolSelected.has(i);
          return `<tr class="${checked?'pool-row-selected':''}">
            <td class="col-check"><input type="checkbox" class="pool-row-check" ${checked?'checked':''} data-pool-idx="${i}" onclick="togglePoolRowSelect(${i}, this.checked)"></td>
            <td style="font-weight:700;color:#3b82f6;">${i+1}</td>
            <td><img class="pool-cover-mini" src="${bookCover(b)}" alt=""/></td>
            <td style="max-width:300px;line-height:1.4;">${b.title}</td>
            <td><span class="cat-tag ${cat}">${cat}</span></td>
            <td><span style="font-size:11px;background:#f3f4f6;padding:2px 6px;border-radius:4px;color:#4b5563;">${b.source}</span></td>
            <td style="font-family:'SF Mono',monospace;font-size:11px;color:${b.isbn?'#059669':'#f59e0b'};">${b.isbn || '⚠ 待补'}</td>
            <td>${b.score ? '<strong style="color:#3b82f6;">'+b.score+'</strong>' : '-'}</td>
            <td><span class="status-pill">待评估</span></td>
            <td><button class="toolbar-btn" style="padding:3px 8px;font-size:11px;" onclick="removePoolItem(${i})">移除</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  // 全选 checkbox 的 indeterminate 视觉态（部分勾选时半选）
  const allBox = document.getElementById('poolCheckAll');
  if (allBox) allBox.indeterminate = partialSelected;
}

// 单行勾选切换
function togglePoolRowSelect(idx, checked) {
  if (checked) poolSelected.add(idx);
  else poolSelected.delete(idx);
  renderPool();
}
// 全选/取消全选
function togglePoolSelectAll(checked) {
  if (checked) {
    pool.forEach((_, i) => poolSelected.add(i));
  } else {
    poolSelected.clear();
  }
  renderPool();
}
// 单本移除（保持选中索引一致性）
function removePoolItem(idx) {
  pool.splice(idx, 1);
  // 重建选中集合：原索引 < idx 不变；原索引 == idx 删除；原索引 > idx 减 1
  const newSel = new Set();
  poolSelected.forEach(i => {
    if (i < idx) newSel.add(i);
    else if (i > idx) newSel.add(i - 1);
  });
  poolSelected = newSel;
  updatePoolUI();
}
// 批量移除已勾选项
function batchRemovePool() {
  if (!poolSelected.size) return;
  if (!confirm(`确定批量移除已勾选的 ${poolSelected.size} 本？`)) return;
  const sorted = Array.from(poolSelected).sort((a,b) => b - a); // 倒序删除
  sorted.forEach(i => pool.splice(i, 1));
  poolSelected.clear();
  updatePoolUI();
}
window.togglePoolRowSelect = togglePoolRowSelect;
window.togglePoolSelectAll = togglePoolSelectAll;
window.removePoolItem = removePoolItem;
window.batchRemovePool = batchRemovePool;

// 下拉菜单开关
function togglePoolSendMenu(e) {
  if (e) e.stopPropagation();
  const m = document.getElementById('sendCreativeMenu');
  if (!m) return;
  m.style.display = m.style.display === 'none' ? 'block' : 'none';
}
// 全局点击关闭
document.addEventListener('click', e => {
  const wrap = document.querySelector('.send-creative-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const m = document.getElementById('sendCreativeMenu');
    if (m) m.style.display = 'none';
  }
});

function exportPool(fmt) {
  // 埋点：选品池导出
  try{ if(window.tracker) window.tracker.feature('select_pool_export', {fmt: fmt, count: pool.length}, null, 'select_hub'); }catch(e){}
  const date = new Date().toISOString().slice(0,10);
  if (fmt === 'csv') {
    const csv = 'rank,title,isbn,top_cat,source,score,price\n' +
      pool.map((b,i) => `${i+1},"${b.title}",${b.isbn||''},${b.top_cat||mapToTopCat(b.cat||'')},"${b.source}",${b.score||''},${b.price||''}`).join('\n');
    download('选品池_'+date+'.csv', '\uFEFF'+csv, 'text/csv');
  } else {
    download('选品池_'+date+'.json', JSON.stringify(pool, null, 2), 'application/json');
  }
}
function download(name, content, type) {
  const blob = new Blob([content], {type});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

// ==================== 书卡 ====================
function renderBookCard(b, opts) {
  opts = opts || {};
  const cat = b.top_cat || mapToTopCat(b.cat||'') || '其他';
  const cover = bookCover({...b, top_cat: cat});
  const tag = b.tag === 'hot' ? '<div class="book-tag-corner hot">HOT</div>' :
              b.tag === 'potential' ? '<div class="book-tag-corner potential">潜力</div>' :
              b.tag === 'new' ? '<div class="book-tag-corner new">NEW</div>' : '';
  const scoreHtml = opts.withScore && b.score ? `
    <div style="display:flex;align-items:center;gap:5px;margin-top:5px;">
      <div style="flex:1;height:3px;background:#f3f4f6;border-radius:2px;overflow:hidden;">
        <div style="height:100%;background:linear-gradient(90deg,#10b981,#3b82f6,#8b5cf6);border-radius:2px;width:${b.score}%"></div>
      </div>
      <div style="font-size:11px;font-weight:700;color:#3b82f6;">${b.score}</div>
    </div>` : '';
  const isbnHtml = b.isbn 
    ? `<div class="book-isbn"><span>${b.isbn}</span><span class="ok">✓</span></div>`
    : `<div class="book-isbn"><span style="color:#9ca3af;">ISBN 待补</span><span class="miss">补全→</span></div>`;
  const convHtml = b.conv && b.conv !== '-' ? `<div class="book-metric metric-conv">⚡ ${b.conv}</div>` : '';
  const roiHtml = b.roi ? `<div class="book-metric metric-roi">💰 ROI ${b.roi}</div>` : '';
  const priceHtml = b.price ? `<div class="book-price">¥${formatPrice(b.price)}</div>` : '';
  const inPool = pool.some(p => p.title === b.title);
  const safeBook = JSON.stringify(b).replace(/"/g, '&quot;');
  return `
    <div class="book-card">
      <div class="book-cover">
        <img src="${cover}" alt=""/>
        <div class="book-rank-badge ${b.rank<=3?'gold':''}">#${b.rank}</div>
        ${tag}
      </div>
      <div class="book-info">
        <div class="book-title" title="${b.title}">${b.title}</div>
        <div class="book-cat-row">
          <span class="cat-tag ${cat}">${cat}</span>
          ${b.cat ? '<span style="color:#9ca3af;font-size:10px;">'+b.cat.split('-').slice(-1)[0]+'</span>' : ''}
        </div>
        ${priceHtml}${convHtml}${roiHtml}${scoreHtml}
        ${isbnHtml}
      </div>
      <div class="book-actions">
        <button class="book-btn primary ${inPool?'added':''}" data-book='${safeBook}' data-source="${opts.source||'榜单'}">${inPool?'✓ 已加入':'+ 加入选品池'}</button>
      </div>
    </div>`;
}

// 用事件代理处理"加入选品池"按钮（解决 onclick 转义问题）
// 优化：点击瞬间立即翻转按钮态，避免等待重渲染造成的延迟感
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-book]');
  if (!btn) return;
  try {
    const book = JSON.parse(btn.dataset.book.replace(/&quot;/g, '"'));
    // ① 立即翻转该按钮 + 同 title 的所有按钮（同一本书可能在多处出现）
    const isAdd = !pool.some(p => p.title === book.title);
    document.querySelectorAll('[data-book]').forEach(b => {
      try {
        const bk = JSON.parse(b.dataset.book.replace(/&quot;/g, '"'));
        if (bk.title === book.title) {
          if (isAdd) {
            b.classList.add('added');
            b.textContent = '✓ 已加入';
          } else {
            b.classList.remove('added');
            b.textContent = '+ 加入选品池';
          }
        }
      } catch (e2) {}
    });
    // ② 微动效：被点击按钮 pulse
    btn.classList.add('book-btn-pulse');
    setTimeout(() => btn.classList.remove('book-btn-pulse'), 400);
    // ③ 数据操作交给 addToPool（已经做了轻量更新+防抖整表渲染）
    addToPool(book, btn.dataset.source);
  } catch (err) { console.error('Parse error:', err); }
});

// ==================== 推荐书单（按品类分组）====================
function getRecommendBooks() {
  if (typeof RECOMMEND_BOOKS === 'undefined') return [];
  const result = [];
  let rank = 1;
  // 顺序：教辅 → 童书 → 健康 → 社科（教辅放童书前，与左侧栏分组一致）
  const orderedSheets = ['教辅推荐书单', '童书推荐书单', '健康推荐书单', '社科推荐书单'];
  for (const sheetName of orderedSheets) {
    const list = RECOMMEND_BOOKS[sheetName] || [];
    const topCat = sheetName.replace('推荐书单', '');
    list.forEach(b => result.push({
      rank: rank++,
      title: b.title, isbn: b.isbn, author: b.author, publisher: b.publisher,
      cat: topCat, top_cat: topCat, image: b.image,
      ams_status: b.ams_status,
      recommend_time: b.recommend_time,  // 推荐投放时间（6月/Q1/Q2 等）
      platform: b.platform                  // 平台（京东/当当 等）
    }));
  }
  return result;
}

// ==================== 周榜数据：来自 WEEK_RANK_LIST（多周）====================
let currentWeekIndex = 0;  // 默认第一周（最新）
function getCurrentWeekData() {
  if (typeof WEEK_RANK_LIST !== 'undefined' && WEEK_RANK_LIST[currentWeekIndex]) {
    return WEEK_RANK_LIST[currentWeekIndex].data;
  }
  return (typeof WEEK_RANK_DATA !== 'undefined') ? WEEK_RANK_DATA : null;
}
function getRankItems(rankKey) {
  if (rankKey === 'recommend') {
    return {
      name: '推荐书单',
      subtitle: '基于市场情况精选 · 来自《推荐书单》数据库（按品类分组）',
      items: getRecommendBooks()
    };
  }
  const wd = getCurrentWeekData();
  if (!wd) return null;
  return wd.lists[rankKey];
}

// 榜单字段配置（不同榜单显示不同列，与 Excel 一致）
const RANK_COLUMNS = {
  adq_hot: {
    style: 'blue',
    cols: [
      {key:'rank', label:'#', cls:'col-rank'},
      {key:'image', label:'商品图片', cls:'col-image'},
      {key:'title', label:'书名', cls:'col-title'},
      {key:'isbn', label:'ISBN', cls:'col-isbn'},
      {key:'cat', label:'类目信息', cls:'col-cat'},
      {key:'price', label:'客单价(元)', cls:'col-price'},
      {key:'sales_range', label:'日销售额', cls:''},
      {key:'sales_idx', label:'销量指数', cls:''},
      {key:'conv', label:'转化率', cls:'col-conv'},
      {key:'channel_or_roi', label:'链路', cls:''},
      {key:'action', label:'操作', cls:'col-action'}
    ]
  },
  weixinshop: {
    style: 'green',
    cols: [
      {key:'rank', label:'#', cls:'col-rank'},
      {key:'image', label:'商品图片', cls:'col-image'},
      {key:'title', label:'书名', cls:'col-title'},
      {key:'isbn', label:'ISBN', cls:'col-isbn'},
      {key:'cat', label:'类目信息', cls:'col-cat'},
      {key:'price', label:'客单价(元)', cls:'col-price'},
      {key:'sales_range', label:'日销售额', cls:''},
      {key:'sales_idx', label:'销量指数', cls:''},
      {key:'conv', label:'转化率', cls:'col-conv'},
      {key:'channel_or_roi', label:'ROI', cls:'col-roi'},
      {key:'action', label:'操作', cls:'col-action'}
    ]
  },
  potential: {
    style: 'orange',
    cols: [
      {key:'rank', label:'#', cls:'col-rank'},
      {key:'image', label:'商品图片', cls:'col-image'},
      {key:'title', label:'书名', cls:'col-title'},
      {key:'isbn', label:'ISBN', cls:'col-isbn'},
      {key:'cat', label:'类目信息', cls:'col-cat'},
      {key:'price', label:'客单价(元)', cls:'col-price'},
      {key:'action', label:'操作', cls:'col-action'}
    ]
  },
  forecast: {
    style: 'purple',
    cols: [
      {key:'rank', label:'#', cls:'col-rank'},
      {key:'image', label:'商品图片', cls:'col-image'},
      {key:'title', label:'书名', cls:'col-title'},
      {key:'isbn', label:'ISBN', cls:'col-isbn'},
      {key:'action', label:'操作', cls:'col-action'}
    ]
  },
  recommend: {
    style: 'cyan',
    cols: [
      {key:'rank', label:'#', cls:'col-rank'},
      {key:'image', label:'商品图片', cls:'col-image'},
      {key:'title', label:'书名', cls:'col-title'},
      {key:'author', label:'作者', cls:'col-cat'},
      {key:'publisher', label:'出版社', cls:'col-cat'},
      {key:'isbn', label:'ISBN', cls:'col-isbn'},
      {key:'ams_status', label:'AMS准入', cls:''},
      {key:'recommend_time', label:'推荐投放时间', cls:'col-rec-time'},
      {key:'action', label:'操作', cls:'col-action'}
    ]
  },
  // 教辅 / 童书：不展示 AMS 准入列（用户要求）
  recommend_no_ams: {
    style: 'cyan',
    cols: [
      {key:'rank', label:'#', cls:'col-rank'},
      {key:'image', label:'商品图片', cls:'col-image'},
      {key:'title', label:'书名', cls:'col-title'},
      {key:'author', label:'作者', cls:'col-cat'},
      {key:'publisher', label:'出版社', cls:'col-cat'},
      {key:'isbn', label:'ISBN', cls:'col-isbn'},
      {key:'recommend_time', label:'推荐投放时间', cls:'col-rec-time'},
      {key:'action', label:'操作', cls:'col-action'}
    ]
  }
};

function escapeHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ==================== 交叉索引：推荐书单 ↔ 实战榜单（基于 ISBN + 书名）====================
// 优化方向二：两个模块通过 ISBN 互相打通标记
//   - 在榜书：当周 ADQ 热投 + 微信小店 + 潜力 + 预测 中出现的书
//   - 推荐书单中的书：getRecommendBooks() 全集
let _crossIndex = null;
function _normTitle(t) {
  return String(t||'').replace(/\s+/g,'').replace(/[（(].*?[)）]/g,'').toLowerCase();
}
function buildCrossIndex() {
  const onRankIsbn = new Set(), onRankTitle = new Set();
  if (typeof WEEK_RANK_LIST !== 'undefined') {
    const cur = WEEK_RANK_LIST[currentWeekIndex] && WEEK_RANK_LIST[currentWeekIndex].data;
    if (cur && cur.lists) {
      ['adq_hot','weixinshop','potential','forecast'].forEach(k => {
        const list = cur.lists[k];
        if (list && list.items) {
          list.items.forEach(it => {
            if (it.isbn) onRankIsbn.add(String(it.isbn).trim());
            if (it.title) onRankTitle.add(_normTitle(it.title));
          });
        }
      });
    }
  }
  const recIsbn = new Set(), recTitle = new Set();
  const recBooks = (typeof getRecommendBooks === 'function') ? getRecommendBooks() : [];
  recBooks.forEach(b => {
    if (b.isbn) recIsbn.add(String(b.isbn).trim());
    if (b.title) recTitle.add(_normTitle(b.title));
  });
  _crossIndex = { onRankIsbn, onRankTitle, recIsbn, recTitle };
  return _crossIndex;
}
function getCrossIndex() {
  if (!_crossIndex) buildCrossIndex();
  return _crossIndex;
}
// 该书是否出现在本周榜单中
function isOnRank(item) {
  const idx = getCrossIndex();
  if (item.isbn && idx.onRankIsbn.has(String(item.isbn).trim())) return true;
  if (item.title && idx.onRankTitle.has(_normTitle(item.title))) return true;
  return false;
}
// 该书是否出现在推荐书单中
function isInRecommend(item) {
  const idx = getCrossIndex();
  if (item.isbn && idx.recIsbn.has(String(item.isbn).trim())) return true;
  if (item.title && idx.recTitle.has(_normTitle(item.title))) return true;
  return false;
}

function renderRankCell(item, col, listName) {
  const v = item[col.key];
  if (col.key === 'rank') {
    const r = parseInt(item.rank);
    if (r === 1) return `<span class="rank-1">${r}</span>`;
    if (r === 2) return `<span class="rank-2">${r}</span>`;
    if (r === 3) return `<span class="rank-3">${r}</span>`;
    return `<span>${r}</span>`;
  }
  if (col.key === 'image') {
    const cat = item.top_cat || mapToTopCat(item.cat||'');
    const cover = item.image ? item.image : bookCover({...item, top_cat:cat});
    return `<img src="${cover}" alt="" loading="lazy"/>`;
  }
  if (col.key === 'title') {
    // ★ 优化方向二：跨模块交叉标记
    //   - 榜单中的书 → 若同时在推荐书单 → 加「⭐ 精选」
    //   - 推荐书单中的书 → 若同时在本周榜单 → 加「✅ 本周在跑」
    const isRecList = listName === '推荐书单' || listName === '适配腾讯生态推荐书单';
    let badge = '';
    if (!isRecList && isInRecommend(item)) {
      badge = `<span class="cross-badge cb-rec" title="本书同时在推荐书单中（适配腾讯生态）">⭐ 精选</span>`;
    } else if (isRecList && isOnRank(item)) {
      badge = `<span class="cross-badge cb-onrank" title="本书本周已出现在 ADQ 热投 / 小店 / 潜力 / 预测榜单">✅ 在跑</span>`;
    }
    return `<div class="title-text">${escapeHtml(v||'')}${badge}</div>`;
  }
  if (col.key === 'cat') {
    if (!v) return '-';
    const cat = item.top_cat || mapToTopCat(v||'');
    return `<span class="cat-tag ${cat}" style="font-size:9px;margin-bottom:2px;">${cat}</span><div style="margin-top:2px;font-size:11px;color:#6b7280;">${escapeHtml(v)}</div>`;
  }
  if (col.key === 'isbn') {
    return v ? `<span style="font-family:'SF Mono',monospace;font-size:11px;color:#059669;">${v}</span>` : '<span style="color:#f59e0b;font-size:11px;">⚠</span>';
  }
  if (col.key === 'sales_idx') {
    if (!v) return '-';
    const num = parseFloat(v);
    return isNaN(num) ? '-' : num.toFixed(1);
  }
  if (col.key === 'price') {
    if (!v) return '-';
    return formatPrice(v);
  }
  if (col.key === 'ams_status') {
    if (!v) return '-';
    const text = String(v);
    let cls = 'ams-warn';
    if (text === '准入' || text.includes('全流量')) cls = 'ams-ok';
    else if (text.includes('禁止')) cls = 'ams-ban';
    return `<span class="ams-cell ${cls}">${escapeHtml(text)}</span>`;
  }
  if (col.key === 'recommend_time') {
    if (!v) return '-';
    const t = String(v).trim();
    // 颜色按时间维度区分：6月/当月→绿、Q1/Q2→蓝
    let cls = 'rec-time-cell';
    if (/月/.test(t)) cls += ' is-month';
    else if (/Q[1-4]/i.test(t)) cls += ' is-quarter';
    return `<span class="${cls}">${escapeHtml(t)}</span>`;
  }
  if (col.key === 'action') {
    const inPool = pool.some(p => p.title === item.title);
    const safeBook = escapeHtml(JSON.stringify(item));
    return `<button class="${inPool?'added':''}" data-book="${safeBook}" data-source="${listName}">${inPool?'✓ 已加入':'+ 加入选品池'}</button>`;
  }
  return v ? escapeHtml(v) : '-';
}

function renderRanking(rankKey, bodyId) {
  rankKey = rankKey || 'adq_hot';
  bodyId = bodyId || 'rankBody';
  const data = getRankItems(rankKey);
  const body = document.getElementById(bodyId);
  if (!body) return;
  if (!data || !data.items?.length) {
    // 区分"该榜单全无数据"与"该周此榜单源数据未提供"
    const wd = (typeof getCurrentWeekData === 'function') ? getCurrentWeekData() : null;
    const weekLabel = wd && wd.week_label ? `${wd.week_label}` : '';
    const listName = data?.name || ({adq_hot:'ADQ 热投榜', weixinshop:'腾讯营销（小店版）热投榜', potential:'潜力爆品', forecast:'预测爆品'}[rankKey] || '本榜单');
    const tip = rankKey === 'recommend'
      ? '推荐书单 - 数据接入中'
      : `${listName}（${weekLabel}）该周未采集，请切回最新一周或切换其它周次`;
    body.innerHTML = `<div class="pool-empty"><div class="pool-empty-icon">📭</div><p style="font-size:14px;color:#6b7280;font-weight:600;">${tip}</p><p style="margin-top:6px;font-size:12px;color:#9ca3af;">早期周报仅有 ADQ 单榜单，4 榜完整数据从 <strong style="color:#3b82f6;">3 月 24 日</strong> 起逐步开始采集。</p><button class="toolbar-btn" style="margin-top:10px;" onclick="changeRankWeek(1)">▶ 切到下一周</button></div>`;
    return;
  }
  const cfg = RANK_COLUMNS[rankKey] || RANK_COLUMNS.adq_hot;
  
  // 总数提示（移除 rank-header-bar，因为外层 panel 已有标题 + panel-sub-tip 色块；
  // 周榜内只展示「共 N 本」轻量计数；推荐书单 (recommend) 保留 header-bar）
  const total = data.items.length;
  const isRec = rankKey === 'recommend';

  const headerHtml = isRec ? `
    <div class="rank-header-bar">
      <div class="icon">⭐</div>
      <div class="info">
        <div class="name">${data.name}</div>
        <div class="subtitle">${data.subtitle}</div>
      </div>
      <div class="meta">共 ${total} 本</div>
    </div>` : `<div class="rank-count-line">共 <strong>${total}</strong> 本</div>`;
  
  // 推荐书单按品类分组
  if (rankKey === 'recommend') {
    const groups = {};
    data.items.forEach(it => {
      const c = it.top_cat || mapToTopCat(it.cat||'');
      if (!groups[c]) groups[c] = [];
      groups[c].push(it);
    });
    const order = ['童书','健康','社科','教辅','其他'];
    let html = headerHtml;
    for (const cat of order) {
      if (!groups[cat] || !groups[cat].length) continue;
      html += `
        <div class="rec-group">
          <div class="rec-group-title cat-${cat}">
            ${({童书:'🧸',健康:'🌿',社科:'🏛',教辅:'📖'}[cat]||'📚')} ${cat}推荐书单
            <span class="count">${groups[cat].length} 本</span>
          </div>
          <table class="rank-table-excel style-${cfg.style}">
            <thead><tr>${cfg.cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
            <tbody>
              ${groups[cat].map(it => `<tr>${cfg.cols.map(c => `<td class="${c.cls}">${renderRankCell(it, c, data.name)}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }
    body.innerHTML = html;
    return;
  }
  
  // 普通表格
  body.innerHTML = headerHtml + `
    <table class="rank-table-excel style-${cfg.style}">
      <thead><tr>${cfg.cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>
        ${data.items.map(it => `<tr>${cfg.cols.map(c => `<td class="${c.cls}">${renderRankCell(it, c, data.name)}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>`;
}

// 新版导出：按 key 导出
function exportRankByKey(key) {
  const data = getRankItems(key);
  if (!data) return;
  // 埋点：导出榜单
  try{ if(window.tracker) window.tracker.feature('select_export_rank', {rankKey: k}, null, 'select_hub'); }catch(e){}
  const csv = 'rank,title,isbn,cat,price,sales_idx,conv,channel/roi\n' +
    data.items.map(b => `${b.rank},"${b.title||''}",${b.isbn||''},"${b.cat||''}",${b.price||''},${b.sales_idx||''},${b.conv||''},${b.channel_or_roi||''}`).join('\n');
  download(`${data.name}.csv`, '\uFEFF'+csv, 'text/csv');
}
window.exportRankByKey = exportRankByKey;

function exportCurrentRank() {
  const t = document.querySelector('.rank-tab.active');
  if (t) exportRankByKey(t.dataset.rank);
}

// 更新推荐书单数量
function updateRecCount() {
  const all = getRecommendBooks();
  const child = all.filter(b => b.top_cat === '童书').length;
  const health = all.filter(b => b.top_cat === '健康').length;
  const social = all.filter(b => b.top_cat === '社科').length;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('recCountAll', all.length);
  set('recCountChild', child);
  set('recCountHealth', health);
  set('recCountSocial', social);
}

// ==================== 推荐书单（选品板块）====================
// 按品类返回对应的列配置：教辅/童书 不显示 AMS；健康/社科 显示 AMS
function getRecommendCfg(cat) {
  return (cat === '教辅' || cat === '童书')
    ? RANK_COLUMNS.recommend_no_ams
    : RANK_COLUMNS.recommend;
}

function renderRecommend(recKey, bodyId) {
  recKey = recKey || 'all';
  bodyId = bodyId || 'recBody';
  const body = document.getElementById(bodyId);
  if (!body) return;
  
  const all = getRecommendBooks();
  
  if (recKey === 'all') {
    const groups = {};
    all.forEach(it => {
      const c = it.top_cat || mapToTopCat(it.cat||'');
      if (!groups[c]) groups[c] = [];
      groups[c].push(it);
    });
    // 顺序：教辅放童书前
    const order = ['教辅','童书','健康','社科','其他'];
    let html = `
      <div class="rank-header-bar">
        <div class="icon">📋</div>
        <div class="info">
          <div class="name">适配腾讯生态推荐书单（全部）</div>
          <div class="subtitle">综合所有可投放推荐书单，按品类分组展示</div>
        </div>
        <div class="meta">共 ${all.length} 本</div>
      </div>`;
    for (const cat of order) {
      if (!groups[cat] || !groups[cat].length) continue;
      const cfg = getRecommendCfg(cat);
      html += `
        <div class="rec-group">
          <div class="rec-group-title cat-${cat}">
            ${({童书:'🧸',健康:'🌿',社科:'🏛',教辅:'📖'}[cat]||'📚')} ${cat}推荐书单
            <span class="count">${groups[cat].length} 本</span>
          </div>
          <table class="rank-table-excel style-cyan">
            <thead><tr>${cfg.cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
            <tbody>
              ${groups[cat].map(it => `<tr>${cfg.cols.map(c => `<td class="${c.cls}">${renderRankCell(it, c, '推荐书单')}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }
    body.innerHTML = html;
    return;
  }
  
  // 按单一品类显示
  const filtered = all.filter(b => b.top_cat === recKey);
  const cfg = getRecommendCfg(recKey);
  const catIcon = {童书:'🧸', 健康:'🌿', 社科:'🏛', 教辅:'📖'}[recKey] || '📚';
  body.innerHTML = `
    <div class="rank-header-bar">
      <div class="icon">${catIcon}</div>
      <div class="info">
        <div class="name">${recKey}推荐书单（去年同期全网精选）</div>
        <div class="subtitle">来源于全网去年当月销量/销售额榜单数据 · ${recKey}赛道精选${(recKey==='健康'||recKey==='社科')?' · 已过 AMS 准入':''}</div>
      </div>
      <div class="meta">共 ${filtered.length} 本</div>
    </div>
    <table class="rank-table-excel style-cyan">
      <thead><tr>${cfg.cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>
        ${filtered.map(it => `<tr>${cfg.cols.map(c => `<td class="${c.cls}">${renderRankCell(it, c, '推荐书单')}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>`;
}

function exportCurrentRec() {
  const tab = document.querySelector('.rec-tab.active[data-rec]');
  if (!tab) return;
  const k = tab.dataset.rec;
  // 埋点：导出推荐书单
  try{ if(window.tracker) window.tracker.feature('select_export_rec', {recKey: k}, null, 'select_hub'); }catch(e){}
  let items = [], name = '';
  if (k === 'all') {
    items = getRecommendBooks(); name = '全部推荐书单';
  } else {
    items = getRecommendBooks().filter(b => b.top_cat === k); name = k+'推荐书单';
  }
  const csv = 'rank,title,isbn,top_cat,author,publisher,ams_status\n' +
    items.map(b => `${b.rank},"${b.title||''}",${b.isbn||''},${b.top_cat||mapToTopCat(b.cat||'')},"${b.author||''}","${b.publisher||''}","${b.ams_status||''}"`).join('\n');
  download(`${name}.csv`, '\uFEFF'+csv, 'text/csv');
}
// 新版导出：按品类导出
function exportRecByCat(cat) {
  const items = getRecommendBooks().filter(b => b.top_cat === cat);
  if (!items.length) return;
  const name = cat + '推荐书单';
  const csv = 'rank,title,isbn,top_cat,author,publisher,ams_status\n' +
    items.map(b => `${b.rank},"${b.title||''}",${b.isbn||''},${b.top_cat||mapToTopCat(b.cat||'')},"${b.author||''}","${b.publisher||''}","${b.ams_status||''}"`).join('\n');
  download(`${name}.csv`, '\uFEFF'+csv, 'text/csv');
}
window.exportRecByCat = exportRecByCat;

// ==================== 跟品板块（潜力 + 预测，带往期）====================
let currentFollowWeek = 0;
function getFollowItems(followKey) {
  // 跟品数据来自 WEEK_RANK_LIST[currentFollowWeek]
  if (typeof WEEK_RANK_LIST === 'undefined') return null;
  const wd = WEEK_RANK_LIST[currentFollowWeek]?.data;
  if (!wd) return null;
  return wd.lists[followKey];
}
function renderFollow(followKey) {
  followKey = followKey || 'potential';
  const body = document.getElementById('followBody');
  if (!body) return;
  const data = getFollowItems(followKey);
  if (!data || !data.items?.length) {
    body.innerHTML = `<div class="pool-empty"><div class="pool-empty-icon">📊</div><p>${followKey==='potential'?'潜力爆品':'预测爆品'} - 数据接入中</p></div>`;
    return;
  }
  const cfg = RANK_COLUMNS[followKey];
  body.innerHTML = `
    <div class="rank-header-bar">
      <div class="icon">${followKey==='potential'?'💎':'🎯'}</div>
      <div class="info">
        <div class="name">${data.name}</div>
        <div class="subtitle">${data.subtitle}</div>
      </div>
      <div class="meta">共 ${data.items.length} 本</div>
    </div>
    <table class="rank-table-excel style-${cfg.style}">
      <thead><tr>${cfg.cols.map(c => `<th>${c.label}</th>`).join('')}</tr></thead>
      <tbody>
        ${data.items.map(it => `<tr>${cfg.cols.map(c => `<td class="${c.cls}">${renderRankCell(it, c, data.name)}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>`;
}
function initFollowWeekSwitcher() {
  const sel = document.getElementById('fwSelect');
  if (!sel || typeof WEEK_RANK_LIST === 'undefined') return;
  sel.innerHTML = WEEK_RANK_LIST.map((w, i) => 
    `<option value="${i}">${w.label}${w.is_current ? '（最新）' : ''}</option>`
  ).join('');
  sel.value = currentFollowWeek;
  updateFollowWeekUI();
}
function onFollowWeekChange(idx) {
  currentFollowWeek = parseInt(idx);
  updateFollowWeekUI();
  const tab = document.querySelector('.rec-tab.active[data-follow]');
  if (tab) renderFollow(tab.dataset.follow);
}
function changeFollowWeek(delta) {
  const next = currentFollowWeek - delta;
  if (next < 0 || next >= WEEK_RANK_LIST.length) return;
  currentFollowWeek = next;
  document.getElementById('fwSelect').value = next;
  onFollowWeekChange(next);
}
function updateFollowWeekUI() {
  const cur = WEEK_RANK_LIST[currentFollowWeek];
  const tag = document.getElementById('fwCurrent');
  if (tag) {
    if (cur.is_current) {
      tag.textContent = '✓ 当前查看：本周（最新）';
      tag.classList.remove('is-history');
    } else {
      tag.textContent = `📜 当前查看：往期 ${cur.short}`;
      tag.classList.add('is-history');
    }
  }
  const prev = document.getElementById('fwPrev');
  const next = document.getElementById('fwNext');
  if (prev) prev.disabled = currentFollowWeek >= WEEK_RANK_LIST.length - 1;
  if (next) next.disabled = currentFollowWeek <= 0;
}
function exportCurrentFollow() {
  const tab = document.querySelector('.rec-tab.active[data-follow]');
  if (!tab) return;
  const k = tab.dataset.follow;
  const data = getFollowItems(k);
  if (!data) return;
  // 埋点：导出跟品书单
  try{ if(window.tracker) window.tracker.feature('select_export_follow', {followKey: k}, null, 'select_hub'); }catch(e){}
  const csv = 'rank,title,isbn,cat,price\n' +
    data.items.map(b => `${b.rank},"${b.title||''}",${b.isbn||''},"${b.cat||''}",${b.price||''}`).join('\n');
  download(`${data.name}_${WEEK_RANK_LIST[currentFollowWeek].short}.csv`, '\uFEFF'+csv, 'text/csv');
}

// Tab 提示更新
function updateTabTip(tipId, tabEl) {
  const el = document.getElementById(tipId);
  if (!el || !tabEl) return;
  const tip = tabEl.dataset.tip;
  if (tip) {
    el.innerHTML = `<strong>💡 ${tabEl.textContent.trim().replace(/\s+\d+$/,'').trim()}：</strong>${tip}`;
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

// ==================== 大盘 Benchmark ====================
function renderBenchmark(key) {
  key = key || 'cat_price';
  const body = document.getElementById('benchBody');
  if (!body) return;
  
  const fmt = (v, suffix='') => v == null ? '—' : (typeof v === 'number' ? v.toFixed(suffix==='%'?1:0) + suffix : v);
  const fmtRoi = (v) => v == null ? '—' : (typeof v === 'number' ? v.toFixed(1) : v);
  
  if (key === 'cat_price' && typeof BENCH_CAT_PRICE !== 'undefined') {
    const d = BENCH_CAT_PRICE;
    let html = `<div class="bench-table-wrap">`;
    d.priceRanges.forEach(pr => {
      html += `
        <div class="bench-block">
          <div class="bench-block-title">
            <span class="price-tag">${pr.range}</span>
          </div>
          <table class="bench-table">
            <thead><tr>
              <th>品类</th><th>消耗占比</th><th>cpm</th><th>ctr</th><th>cvr</th><th>roi</th>
            </tr></thead>
            <tbody>
              ${pr.items.map(it => `
                <tr class="${it.isTotal?'bench-total':''}">
                  <td class="col-cat">${it.cat}</td>
                  <td class="val-share">${it.share}%</td>
                  <td class="val-cpm">${fmt(it.cpm)}</td>
                  <td class="val-ctr">${fmt(it.ctr,'%')}</td>
                  <td class="val-cvr">${fmt(it.cvr,'%')}</td>
                  <td class="val-roi">${fmtRoi(it.roi)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    });
    html += `</div>`;
    body.innerHTML = html;
    return;
  }
  
  if (key === 'price_channel' && typeof BENCH_PRICE_CHANNEL !== 'undefined') {
    const d = BENCH_PRICE_CHANNEL;
    let html = `<div class="bench-table-wrap"><div class="bench-block">
      <table class="bench-table">
        <thead><tr>
          <th>客单 × 链路</th><th>消耗占比</th><th>cpm</th><th>ctr</th><th>cvr</th><th>ROI</th>
        </tr></thead>
        <tbody>`;
    d.blocks.forEach(b => {
      html += `
        <tr class="bench-total">
          <td class="col-cat">${b.range}</td>
          <td class="val-share">${b.share}%</td>
          <td class="val-cpm">${fmt(b.cpm)}</td>
          <td class="val-ctr">${fmt(b.ctr,'%')}</td>
          <td class="val-cvr">${fmt(b.cvr,'%')}</td>
          <td class="val-roi">${fmtRoi(b.roi)}</td>
        </tr>`;
      b.sub.forEach(s => {
        html += `
          <tr class="bench-sub">
            <td class="col-cat">${s.channel}</td>
            <td class="val-share">${s.share}%</td>
            <td class="val-cpm">${fmt(s.cpm)}</td>
            <td class="val-ctr">${fmt(s.ctr,'%')}</td>
            <td class="val-cvr">${fmt(s.cvr,'%')}</td>
            <td class="val-roi">${fmtRoi(s.roi)}</td>
          </tr>`;
      });
    });
    html += `</tbody></table></div></div>`;
    body.innerHTML = html;
    return;
  }
  
  body.innerHTML = '<div style="padding:20px;color:#9ca3af;text-align:center;">数据加载中...</div>';
}

// 类目占比横条 ===================
// 历史归一：成人→社科、养生→健康；当 wd.cat_share 缺失时自动从 ADQ + 小店榜 items 聚合
function renderCatShareBar() {
  const bar = document.getElementById('catShareBar');
  if (!bar) return;
  const wd = getCurrentWeekData();
  let share = wd ? wd.cat_share : null;

  // 类目归一函数：把所有非 4 大类的（含"成人/养生"）映射回 4 大
  const normalize = (catName) => {
    if (!catName) return '社科';
    if (catName.includes('成人')) return '社科';
    if (catName.includes('养生')) return '健康';
    if (['教辅','童书','健康','社科'].includes(catName)) return catName;
    // 兜底：用 mapToTopCat
    return (typeof mapToTopCat === 'function') ? mapToTopCat(catName) : '社科';
  };

  // 已有 cat_share：归一并合并同名
  if (share && share.length) {
    const merged = {};
    share.forEach(s => {
      const k = normalize(s.cat);
      if (k === '其他') return;
      merged[k] = (merged[k] || 0) + Number(s.share || 0);
    });
    share = Object.keys(merged).map(k => ({ cat:k, share: merged[k] }));
  } else if (wd && wd.lists) {
    // 自动从当周 ADQ + 小店榜聚合
    const counts = { '教辅':0, '童书':0, '健康':0, '社科':0 };
    let total = 0;
    ['adq_hot','weixinshop'].forEach(key => {
      const items = wd.lists[key]?.items || [];
      items.forEach(it => {
        const k = normalize(it.cat || it.top_cat || '');
        if (counts[k] !== undefined) {
          counts[k] += 1;
          total += 1;
        }
      });
    });
    if (total > 0) {
      share = ['教辅','童书','健康','社科']
        .map(k => ({ cat:k, share: counts[k] / total * 100 }))
        .filter(s => s.share > 0);
    }
  }

  if (!share || !share.length) {
    bar.innerHTML = `<div style="padding:14px;color:#9ca3af;font-size:12px;text-align:center;background:#f9fafb;border-radius:6px;">本周类目占比数据不足，已展示榜单详情。</div>`;
    return;
  }

  // 按占比降序
  share.sort((a, b) => b.share - a.share);

  const colorMap = { '童书':'#f59e0b', '教辅':'#ef4444', '健康':'#10b981', '社科':'#8b5cf6' };
  bar.innerHTML = share.map(s => {
    const w = s.share;
    const color = colorMap[s.cat] || '#6b7280';
    return `<div class="cat-share-seg" style="background:${color};flex:${w};">
      <div class="label">${s.cat}</div>
      <div class="pct">${w.toFixed(1)}%</div>
    </div>`;
  }).join('');
}

// ==================== 6 月选品 by 周节奏图（替代旧的节点×人群画像）====================
function renderWeekRhythm() {
  const grid = document.getElementById('weekRhythmGrid');
  if (!grid || typeof WEEK_RHYTHM === 'undefined') return;

  const { weeks, rows } = WEEK_RHYTHM;
  const weekIdx = {}; weeks.forEach((w,i) => weekIdx[w.key] = i + 1); // 第 1 列是品类标签列

  // 表头
  let html = `
    <div class="wr-corner">📅 选品节奏</div>
  ` + weeks.map(w => `
    <div class="wr-week-head">
      <div class="wr-wk-summer">${w.key} · ${w.summer || w.name || ''}</div>
      ${w.festival ? `<div class="wr-wk-festival">${w.festival}</div>` : ''}
      <div class="wr-wk-date">${w.date}</div>
    </div>
  `).join('');

  // 数据行
  rows.forEach(row => {
    // 品类标签列
    const prioCls = row.priority.toLowerCase(); // p0 / p1 / p2
    // ★ 优化方向三：每行品类标签列底部增加「查看对应书单」链接
    //   推荐书单含 教辅/童书/健康/社科 四大品类，每个都有独立 panel
    const recKey = ['教辅','童书','健康','社科'].indexOf(row.cat) >= 0 ? row.cat : 'all';
    const jumpLabel = recKey === 'all' ? '全部书单' : (row.cat + '书单');
    html += `
      <div class="wr-cat-head ${row.colorClass}">
        <div class="wr-cat-icon">${row.icon}</div>
        <div class="wr-cat-name">${row.cat}</div>
        <span class="wr-prio ${prioCls}">${row.priority}</span>
        <a class="wr-cat-jump" href="#" data-wr-jump="${recKey}" data-wr-cat="${row.cat}" title="跳转到推荐书单 · ${jumpLabel}">📚 ${jumpLabel} →</a>
      </div>
    `;

    // 单元格按 W1-W4 顺序铺；考虑 span 跨列：先建一个 covered 数组
    const covered = { W1:false, W2:false, W3:false, W4:false };
    // 把 cells 按 week 排序（其实数据已是顺序）
    const cells = row.cells.slice().sort((a,b) => weekIdx[a.week] - weekIdx[b.week]);
    cells.forEach(c => {
      const span = c.span || 1;
      const startCol = weekIdx[c.week] + 1; // grid 第 1 列是品类列，所以 W1 实际是第 2 列，weekIdx[W1]=1+1=2
      const styleSpan = span > 1 ? `style="grid-column: span ${span};"` : '';
      // 标记 covered
      const startNum = parseInt(c.week.replace('W',''));
      for (let i = 0; i < span; i++) covered['W'+(startNum+i)] = true;

      if (c.empty) {
        html += `<div class="wr-cell empty" ${styleSpan}>${c.note || '—'}</div>`;
      } else if (c.groups && c.groups.length) {
        // 多分组：紧凑模式 —— 标题 + items 同一行（顿号分隔），痛点紧贴
        const groupsHtml = c.groups.map(g => {
          const inline = g.items && g.items.length
            ? `<span class="wr-group-inline">${g.items.join('、')}</span>`
            : (g.body ? `<span class="wr-group-inline">${g.body}</span>` : '');
          return `
            <div class="wr-group">
              <div class="wr-group-line"><span class="wr-group-title">${g.title}</span>${inline ? '：' + inline : ''}</div>
              ${g.pain ? `<div class="wr-cell-pain">${g.pain}</div>` : ''}
            </div>
          `;
        }).join('');
        html += `
          <div class="wr-cell ${row.colorClass}" ${styleSpan}>
            ${groupsHtml}
            ${c.lead ? `<div class="wr-cell-lead">${c.lead.replace(/^⏰\s*/,'')}</div>` : ''}
          </div>
        `;
      } else {
        html += `
          <div class="wr-cell ${row.colorClass}" ${styleSpan}>
            <div class="wr-cell-direction">${c.direction}</div>
            ${c.pain  ? `<div class="wr-cell-pain">${c.pain}</div>`   : ''}
            ${c.lead  ? `<div class="wr-cell-lead">${c.lead.replace(/^⏰\s*/,'')}</div>` : ''}
          </div>
        `;
      }
    });
  });

  grid.innerHTML = html;
}

// ==================== 典型跑量书拆解（精简版 · 仅最新 2 期展示）====================
// 计算某 ISBN/书名在 ADQ 榜上连续上榜的周数（从最新一周往前数）
function computeBookStreak(isbn, title) {
  if (typeof WEEK_RANK_LIST === 'undefined') return 0;
  // 从 currentWeekIndex 起往前（数组中是倒序：[0]=最新）
  let streak = 0;
  for (let i = currentWeekIndex; i < WEEK_RANK_LIST.length; i++) {
    const items = WEEK_RANK_LIST[i]?.data?.lists?.adq_hot?.items || [];
    let match = false;
    for (const it of items) {
      if (isbn && String(it.isbn || '') === String(isbn)) { match = true; break; }
      if (title && it.title && (it.title.includes(title.split('+')[0].trim()) || title.includes(it.title))) {
        match = true; break;
      }
    }
    if (match) streak++;
    else break;
  }
  return streak;
}

function renderHotBookBreakdown() {
  const panel = document.getElementById('hub-block-hot-insight');
  const sideNav = document.querySelector('#hubSideNav .rsn-item[data-target="hub-block-hot-insight"]');
  // 仅在最新 2 期（currentWeekIndex 0 / 1）展示；往期隐藏整个模块 + 左侧栏入口
  const visible = currentWeekIndex <= 1;
  if (panel) panel.style.display = visible ? '' : 'none';
  if (sideNav) sideNav.style.display = visible ? '' : 'none';
  if (!visible) return;

  // 根据当前周次取对应跑量书数据；fallback 顺序：按周 map → 兼容旧 const → 空数组
  const curIso = (typeof WEEK_RANK_LIST !== 'undefined' && WEEK_RANK_LIST[currentWeekIndex])
    ? WEEK_RANK_LIST[currentWeekIndex].iso : null;
  let books = [];
  if (typeof HOT_BOOK_BREAKDOWN_BY_WEEK !== 'undefined' && curIso && HOT_BOOK_BREAKDOWN_BY_WEEK[curIso]) {
    books = HOT_BOOK_BREAKDOWN_BY_WEEK[curIso];
  } else if (typeof HOT_BOOK_BREAKDOWN !== 'undefined') {
    books = HOT_BOOK_BREAKDOWN;
  }

  if (!books.length) {
    document.getElementById('hotBookBreakdown').innerHTML = `<div class="pool-empty"><p style="color:#9ca3af;font-size:13px;">本期跑量书洞察待补充</p></div>`;
    return;
  }

  const html = `<div class="bd-grid-3">` + books.map(b => {
    const cat = b.cat || '童书';
    const cover = b.image || bookCover({title:b.title, isbn:b.isbn, top_cat:cat});
    const personaText = (typeof b.persona === 'string') ? b.persona : (b.persona && b.persona.core) || '';
    // 计算霸榜周数（>=2 周才显示徽章）
    const streak = computeBookStreak(b.isbn, b.title);
    const streakBadge = streak >= 2
      ? `<span class="streak-badge" title="该书已连续 ${streak} 周上 ADQ 热投榜">🔥 霸榜 ${streak} 周</span>`
      : '';
    return `
    <div class="hot-card hot-card-slim">
      <div class="hot-head">
        <img class="hot-cover" src="${cover}" alt="${b.title}" onerror="this.src='${bookCover({title:b.title, isbn:b.isbn, top_cat:cat})}'"/>
        <div class="hot-meta">
          <div class="hot-tags-row">
            <span class="role-tag ${b.roleClass}">${b.role}</span>
            ${streakBadge}
          </div>
          <h3>${b.title}</h3>
          <div class="hot-isbn">📕 ${b.isbn}</div>
        </div>
      </div>

      <div class="hot-stats">
        ${b.stats.map(s => {
          let val = s.val;
          if (s.label === '客单' || s.label === '低客单') {
            val = String(val).replace(/¥/g, '').trim();
            val = '¥' + formatPrice(val);
          }
          return `<div class="stat-chip ${s.cls||''}"><span class="ic">${s.icon}</span><span class="lb">${s.label}</span><span class="vl">${val}</span></div>`;
        }).join('')}
      </div>

      ${personaText ? `<div class="hot-line hot-line-persona"><span class="hl-tag">👥 目标人群</span><span class="hl-text">${escapeHtml(personaText)}</span></div>` : ''}
      ${b.creativeCore ? `<div class="hot-line hot-line-creative"><span class="hl-tag">📹 创意核心</span><span class="hl-text">${escapeHtml(b.creativeCore)}</span></div>` : ''}
      ${b.creativeWarning ? `<div class="hot-line hot-line-warning"><span class="hl-text">${escapeHtml(b.creativeWarning)}</span></div>` : ''}
    </div>`;
  }).join('') + `</div>`;
  document.getElementById('hotBookBreakdown').innerHTML = html;
}

// ==================== 重点品类深度卡 ====================
function renderDeepCats() {
  // 按一级品类分组
  const groups = {};
  DEEP_CATS.forEach(d => {
    const c = d.cat || '童书';
    (groups[c] = groups[c] || []).push(d);
  });
  const order = ['教辅','童书','健康','社科'];
  const catIcons = {童书:'🧸', 教辅:'📖', 健康:'🌿', 社科:'🏛'};
  const catColors = {童书:'#f59e0b', 教辅:'#ef4444', 健康:'#10b981', 社科:'#8b5cf6'};
  const cardHtml = d => `
    <div class="formula-card">
      <div class="formula-head ${d.headClass}">
        <div class="role">${d.icon} ${d.role}</div>
        <h3>${d.name.replace(/^(童书|教辅|健康|社科)\s*·\s*/,'')}</h3>
      </div>
      <div class="formula-row">
        <div class="l">🎯 核心卖点</div>
        <div class="c"><strong style="color:#3b82f6;">${d.sellingPoint}</strong></div>
      </div>
      <div class="formula-row">
        <div class="l">📂 细分赛道</div>
        <div class="c">${d.subCats.join('、')}</div>
      </div>
      <div class="formula-row">
        <div class="l">💡 Tips</div>
        <div class="c">${d.tips.map(t => '• ' + t).join('<br/>')}</div>
      </div>
    </div>`;
  let html = '';
  for (const cat of order) {
    if (!groups[cat]) continue;
    html += `
      <div class="deep-group">
        <div class="deep-group-title" style="border-left:4px solid ${catColors[cat]};">
          ${catIcons[cat]} <strong>${cat}</strong> 品类深度选品思路
          <span class="count">${groups[cat].length} 个赛道</span>
        </div>
        <div class="formula-grid">
          ${groups[cat].map(cardHtml).join('')}
        </div>
      </div>`;
  }
  document.getElementById('deepGrid').innerHTML = html;
}

// ==================== Hub（榜单中心）渲染 ====================
// 一次性渲染所有 9 个 panel，并联动左侧栏
function renderHub() {
  // 每个渲染独立 try，单个失败不挡其他
  const safeRender = (fn, label) => {
    try { fn(); } catch (e) { console.error('[renderHub] ' + label + ' 失败:', e); }
  };
  safeRender(() => renderRanking('adq_hot',     'rankBodyAdq'),       'ADQ 热投');
  safeRender(() => renderRanking('weixinshop',  'rankBodyShop'),      '微信小店');
  safeRender(() => renderRanking('potential',   'rankBodyPotential'), '潜力爆品');
  safeRender(() => renderRecommend('教辅', 'recBodyEdu'),    '教辅推荐');
  safeRender(() => renderRecommend('童书', 'recBodyChild'),  '童书推荐');
  safeRender(() => renderRecommend('健康', 'recBodyHealth'), '健康推荐');
  safeRender(() => renderRecommend('社科', 'recBodySocial'), '社科推荐');
  safeRender(() => renderCatShareBar(),          '类目占比');
  safeRender(() => renderHotBookBreakdown(),     '跑量书洞察');
  safeRender(() => renderBenchmark('cat_price'), '大盘指标');
  safeRender(() => syncHubSideCount(),  '左侧栏数量');
  safeRender(() => observeHubAnchors(), '锚点观察');
}

// 同步左侧栏数量徽章
function syncHubSideCount() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  // 榜单数量
  const wd = (typeof getCurrentWeekData === 'function') ? getCurrentWeekData() : null;
  if (wd && wd.lists) {
    set('rsnCountAdq', wd.lists.adq_hot?.items?.length || 0);
    set('rsnCountShop', wd.lists.weixinshop?.items?.length || 0);
    set('rsnCountPotential', wd.lists.potential?.items?.length || 0);
  }
  // 榜单中心 banner 周次徽章
  const tag = document.getElementById('hubIntroWeekTag');
  if (tag) {
    if (wd && wd.week_label) {
      const cur = (typeof WEEK_RANK_LIST !== 'undefined') ? WEEK_RANK_LIST[currentWeekIndex] : null;
      const isLatest = cur && cur.is_current;
      tag.textContent = (isLatest ? '本周 · ' : '往期 · ') + wd.week_label;
      tag.style.background = isLatest
        ? 'linear-gradient(135deg, #10b981, #059669)'
        : 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
  }
  // 推荐书单数量
  const all = (typeof getRecommendBooks === 'function') ? getRecommendBooks() : [];
  set('rsnCountChild', all.filter(b => b.top_cat === '童书').length);
  set('rsnCountEdu', all.filter(b => b.top_cat === '教辅').length);
  set('rsnCountHealth', all.filter(b => b.top_cat === '健康').length);
  set('rsnCountSocial', all.filter(b => b.top_cat === '社科').length);
}

// 滚动到 panel 时高亮对应左侧栏项
let _hubObserver = null;
function observeHubAnchors() {
  if (_hubObserver) _hubObserver.disconnect();
  const sidebar = document.getElementById('hubSideNav');
  if (!sidebar) return;
  const targets = Array.from(sidebar.querySelectorAll('.rsn-item[data-target]'));
  if (!targets.length) return;
  const map = {};
  targets.forEach(a => { map[a.dataset.target] = a; });
  const panels = targets.map(a => document.getElementById(a.dataset.target)).filter(Boolean);
  _hubObserver = new IntersectionObserver(entries => {
    // 取最大可见比例的那个
    let bestEntry = null;
    entries.forEach(en => {
      if (en.isIntersecting) {
        if (!bestEntry || en.intersectionRatio > bestEntry.intersectionRatio) bestEntry = en;
      }
    });
    if (bestEntry) {
      const id = bestEntry.target.id;
      targets.forEach(a => a.classList.toggle('active', a.dataset.target === id));
    }
  }, { rootMargin: '-100px 0px -60% 0px', threshold: [0, 0.25, 0.5] });
  panels.forEach(p => _hubObserver.observe(p));
}

// ==================== Hub 关键词搜索 ====================
// 跨所有 7 榜单 + 精选书单 检索（书名/ISBN/作者），点击结果定位锚点+高亮该行
let _hubSearchDebounce = null;
function initHubSearch() {
  const input = document.getElementById('hubSearchInput');
  const clearBtn = document.getElementById('hubSearchClear');
  const result = document.getElementById('hubSearchResult');
  const bar = document.getElementById('hubSearchBar');
  if (!input || !result) return;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn.style.display = q ? 'inline-flex' : 'none';
    clearTimeout(_hubSearchDebounce);
    _hubSearchDebounce = setTimeout(() => doHubSearch(q), 150);
  });
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    result.style.display = 'none';
    result.innerHTML = '';
    input.focus();
  });
  // 点击外部关闭浮层
  document.addEventListener('click', e => {
    if (!e.target.closest('#hubSearchBar')) {
      result.style.display = 'none';
    }
  });
  input.addEventListener('focus', () => {
    if (input.value.trim() && result.innerHTML) result.style.display = 'block';
  });
  // Esc 关闭
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { result.style.display = 'none'; }
  });

  // sticky 卡顶视觉反馈（IntersectionObserver 监听一个哨兵）
  if (bar && 'IntersectionObserver' in window) {
    // 在 bar 之前插入哨兵元素
    let sentinel = document.getElementById('hubSearchSentinel');
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.id = 'hubSearchSentinel';
      sentinel.style.cssText = 'height:1px;margin-bottom:-1px;';
      bar.parentNode.insertBefore(sentinel, bar);
    }
    new IntersectionObserver(([entry]) => {
      bar.classList.toggle('is-stuck', !entry.isIntersecting);
    }, { threshold: [0] }).observe(sentinel);
  }
}

// 收集所有可搜索条目：榜单（含周）+ 精选书单
function collectHubSearchPool() {
  const pool = [];
  // 1) 当前周次榜单（4 个）
  const wd = (typeof getCurrentWeekData === 'function') ? getCurrentWeekData() : null;
  const RANK_META = [
    { key: 'adq_hot',    listName: 'ADQ 热投榜',           anchor: 'hub-block-rank-adq',       bodyId: 'rankBodyAdq' },
    { key: 'weixinshop', listName: '腾讯营销（小店版）热投榜', anchor: 'hub-block-rank-shop',      bodyId: 'rankBodyShop' },
    { key: 'potential',  listName: '潜力爆品',             anchor: 'hub-block-follow-potential',bodyId: 'rankBodyPotential' },
  ];
  if (wd && wd.lists) {
    RANK_META.forEach(meta => {
      const list = wd.lists[meta.key];
      if (!list || !list.items) return;
      list.items.forEach((it, idx) => {
        pool.push({
          title: it.title || '',
          isbn: it.isbn || '',
          author: it.author || '',
          cat: it.cat || it.top_cat || '',
          rank: it.rank || (idx + 1),
          listName: meta.listName,
          listGroup: '实战 / 潜力榜单',
          anchor: meta.anchor,
          bodyId: meta.bodyId,
        });
      });
    });
  }
  // 2) 精选书单（3 类）
  const REC_META = [
    { cat: '教辅', listName: '教辅推荐',   anchor: 'hub-block-rec-edu',    bodyId: 'recBodyEdu' },
    { cat: '童书', listName: '童书推荐',   anchor: 'hub-block-rec-child',  bodyId: 'recBodyChild' },
    { cat: '健康', listName: '健康推荐',   anchor: 'hub-block-rec-health', bodyId: 'recBodyHealth' },
    { cat: '社科', listName: '社科推荐',   anchor: 'hub-block-rec-social', bodyId: 'recBodySocial' },
  ];
  const allRec = (typeof getRecommendBooks === 'function') ? getRecommendBooks() : [];
  REC_META.forEach(meta => {
    allRec.filter(b => b.top_cat === meta.cat).forEach((it, idx) => {
      pool.push({
        title: it.title || '',
        isbn: it.isbn || '',
        author: it.author || '',
        cat: it.cat || it.top_cat || meta.cat,
        rank: it.rank || (idx + 1),
        listName: meta.listName,
        listGroup: '精选书单',
        anchor: meta.anchor,
        bodyId: meta.bodyId,
      });
    });
  });
  return pool;
}

function doHubSearch(q) {
  const result = document.getElementById('hubSearchResult');
  if (!result) return;
  if (!q || q.length < 1) { result.style.display = 'none'; result.innerHTML = ''; return; }

  const qLower = q.toLowerCase();
  const all = collectHubSearchPool();
  const hits = all.filter(it => {
    return (it.title && it.title.toLowerCase().includes(qLower))
        || (it.isbn && String(it.isbn).includes(q))
        || (it.author && it.author.toLowerCase().includes(qLower));
  });

  if (!hits.length) {
    result.innerHTML = `<div class="hsb-result-empty">😶 未找到 "<strong>${escapeHtml(q)}</strong>" 相关的书目<br><span style="font-size:11.5px;color:#9ca3af;">可尝试：换关键词 / 输入完整 ISBN / 切换榜单周次</span></div>`;
    result.style.display = 'block';
    return;
  }

  // 限制最多 50 条；按所属分组聚合
  const limited = hits.slice(0, 50);
  const grouped = {};
  limited.forEach(h => {
    if (!grouped[h.listName]) grouped[h.listName] = [];
    grouped[h.listName].push(h);
  });

  // 关键词高亮
  const hl = (text) => {
    if (!text) return '';
    const safe = escapeHtml(String(text));
    if (!q) return safe;
    const re = new RegExp(q.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    return safe.replace(re, m => `<em>${m}</em>`);
  };

  let html = `<div class="hsb-result-summary">共找到 <strong>${hits.length}</strong> 本匹配 "<strong>${escapeHtml(q)}</strong>"${hits.length > 50 ? '，仅显示前 50 条' : ''}</div>`;
  for (const listName of Object.keys(grouped)) {
    html += `<div class="hsb-result-group">${listName} · ${grouped[listName].length} 本</div>`;
    grouped[listName].forEach(h => {
      const meta = [];
      if (h.isbn) meta.push(`<span class="hsbi-isbn">${hl(h.isbn)}</span>`);
      if (h.cat)  meta.push(`<span>${escapeHtml(h.cat)}</span>`);
      if (h.author) meta.push(`<span>${hl(h.author)}</span>`);
      meta.push(`<span class="hsbi-list">${escapeHtml(h.listName)}</span>`);
      html += `
        <div class="hsb-result-item"
             data-anchor="${h.anchor}"
             data-body-id="${h.bodyId}"
             data-isbn="${escapeHtml(h.isbn||'')}"
             data-title="${escapeHtml(h.title||'')}">
          <span class="hsbi-rank">${h.rank}</span>
          <div class="hsbi-body">
            <div class="hsbi-title">${hl(h.title)}</div>
            <div class="hsbi-meta">${meta.join('')}</div>
          </div>
          <span class="hsbi-go">跳转 →</span>
        </div>`;
    });
  }
  result.innerHTML = html;
  result.style.display = 'block';

  // 绑定点击跳转
  result.querySelectorAll('.hsb-result-item').forEach(el => {
    el.addEventListener('click', () => {
      gotoHubSearchHit(el.dataset.anchor, el.dataset.bodyId, el.dataset.isbn, el.dataset.title);
      result.style.display = 'none';
    });
  });
}

// 跳转到对应锚点 panel + 高亮匹配行
function gotoHubSearchHit(anchorId, bodyId, isbn, title) {
  // 确保在榜单中心 section
  if (!document.getElementById('section-hub')?.classList.contains('active')) {
    switchSection('hub');
  }
  setTimeout(() => {
    const panel = document.getElementById(anchorId);
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // 高亮命中行
    setTimeout(() => highlightHitRow(bodyId, isbn, title), 320);
  }, 100);
}

function highlightHitRow(bodyId, isbn, title) {
  const body = document.getElementById(bodyId);
  if (!body) return;
  // 清旧高亮
  body.querySelectorAll('tr.hsb-hit').forEach(tr => tr.classList.remove('hsb-hit'));
  const trList = body.querySelectorAll('tbody tr');
  let hitTr = null;
  trList.forEach(tr => {
    const text = tr.textContent || '';
    const matchIsbn = isbn && text.includes(isbn);
    const matchTitle = title && text.includes(title);
    if (!hitTr && (matchIsbn || matchTitle)) hitTr = tr;
  });
  if (hitTr) {
    hitTr.classList.add('hsb-hit');
    // 滚到行（如果当前 panel 滚动锚点错过该行）
    setTimeout(() => {
      try { hitTr.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    }, 80);
    // 5 秒后移除
    setTimeout(() => hitTr.classList.remove('hsb-hit'), 5200);
  }
}

// ==================== Tab 切换 ====================
function switchSection(name) {
  document.querySelectorAll('.subtab').forEach(t => t.classList.toggle('active', t.dataset.section === name));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === 'section-'+name));
  // 埋点：子 tab 切换上报
  try{ if(window.tracker) window.tracker.setTab('select_hub'); }catch(e){}
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    if (name === 'hub') {
      renderHub();
    }
    if (name === 'future') initFuture();
    if (name === 'pool') {
      // 切到选品池时做一次完整渲染（其他 section 时不渲染以提升性能）
      renderPool();
    }
  }, 60);
}
document.querySelectorAll('.subtab').forEach(t => t.addEventListener('click', () => switchSection(t.dataset.section)));

// ==================== 周切换（已移除UI，仅保留数据初始化）====================
function initWeekSelect() {
  const lbl = document.getElementById('rankWeekLabel');
  if (lbl) lbl.textContent = WEEKS[0].data.label;
  const sku = document.getElementById('statSku');
  if (sku) sku.textContent = totalSku();
  updateRecCount();
}
function totalSku() {
  return Object.values(getCurrentWeek().lists).reduce((s,l) => s + (l.items?.length||0), 0);
}
function onWeekChange(idx) {
  currentWeekIdx = parseInt(idx);
  const lbl = document.getElementById('rankWeekLabel');
  if (lbl) lbl.textContent = getCurrentWeek().label;
  const sku = document.getElementById('statSku');
  if (sku) sku.textContent = totalSku();
  updateRecCount();
  if (document.getElementById('section-past').classList.contains('active')) {
    renderRanking(document.querySelector('#section-past .rank-tab.active').dataset.rank);
    renderCatShareBar();
  }
}
function changeWeek(delta) { /* no-op: 周切换UI已移除 */ }

// ==================== 榜单周切换器 ====================
// 计算每周完整度：4 榜单 = 完整 ✓；ADQ 单榜 = 仅 ADQ
function getWeekCompleteness(w) {
  const lists = w?.data?.lists || {};
  let n = 0;
  ['adq_hot','weixinshop','potential','forecast'].forEach(k => {
    if ((lists[k]?.items || []).length > 0) n++;
  });
  return n;
}
function initRankWeekSwitcher() {
  const sel = document.getElementById('wsSelect');
  if (!sel || typeof WEEK_RANK_LIST === 'undefined') return;
  sel.innerHTML = WEEK_RANK_LIST.map((w, i) => {
    const n = getWeekCompleteness(w);
    let badge = '';
    if (w.is_current) badge = '（最新 · 4 榜全）';
    else if (n >= 4) badge = '（4 榜全）';
    else if (n >= 2) badge = `（${n} 榜）`;
    else badge = '（仅 ADQ）';
    return `<option value="${i}" data-complete="${n}">${w.label}${badge}</option>`;
  }).join('');
  sel.value = currentWeekIndex;
  updateRankWeekUI();
}
function onRankWeekChange(idx) {
  currentWeekIndex = parseInt(idx);
  updateRankWeekUI();
  // 重新构建跨模块索引（在榜书随当周数据变动）
  buildCrossIndex();
  // 在 hub 中：4 个榜单 + 类目占比 + 跑量书洞察都需要重渲染
  if (document.getElementById('section-hub')?.classList.contains('active')) {
    renderRanking('adq_hot',     'rankBodyAdq');
    renderRanking('weixinshop',  'rankBodyShop');
    renderRanking('potential',   'rankBodyPotential');
    renderCatShareBar();
    renderHotBookBreakdown();  // 重判：往期周次会自动隐藏
    syncHubSideCount();
  }
  // 同步更新 rankWeekLabel
  const lbl = document.getElementById('rankWeekLabel');
  if (lbl && WEEK_RANK_LIST[currentWeekIndex]) lbl.textContent = WEEK_RANK_LIST[currentWeekIndex].data.week_label;
  // 周次变更后，若搜索框有关键词则重搜（数据池变化）
  const si = document.getElementById('hubSearchInput');
  if (si && si.value.trim()) doHubSearch(si.value.trim());
}
function changeRankWeek(delta) {
  // delta: -1=上一周(更早,index+1)  +1=下一周(更近,index-1)
  const next = currentWeekIndex - delta;
  if (next < 0 || next >= WEEK_RANK_LIST.length) return;
  currentWeekIndex = next;
  document.getElementById('wsSelect').value = next;
  onRankWeekChange(next);
}
function updateRankWeekUI() {
  const cur = WEEK_RANK_LIST[currentWeekIndex];
  const tag = document.getElementById('wsCurrent');
  const n = getWeekCompleteness(cur);
  if (tag) {
    let extra = '';
    if (n < 4) extra = ` · ⚠️ ${n === 1 ? '仅 ADQ 单榜' : n + ' 榜'}`;
    if (cur.is_current) {
      tag.textContent = '✓ 当前查看：本周（最新）' + extra;
      tag.classList.remove('is-history');
    } else {
      tag.textContent = `📜 当前查看：往期 ${cur.short}${extra}`;
      tag.classList.add('is-history');
    }
  }
  // 同步 ADQ 榜单标题旁的周次显示（修复初始加载时显示 hard-code 旧日期的 bug）
  const rwl = document.getElementById('rankWeekLabel');
  if (rwl && cur && cur.data && cur.data.week_label) {
    rwl.textContent = cur.data.week_label;
  }
  // 同步榜单中心 banner 的周次徽章
  const introTag = document.getElementById('hubIntroWeekTag');
  if (introTag && cur && cur.data && cur.data.week_label) {
    const isLatest = cur.is_current;
    introTag.textContent = (isLatest ? '本周 · ' : '往期 · ') + cur.data.week_label;
    introTag.style.background = isLatest
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : 'linear-gradient(135deg, #f59e0b, #d97706)';
  }
  const prev = document.getElementById('wsPrev');  // 上一周(更早) - 应当 index+1
  const next = document.getElementById('wsNext');  // 下一周(更近) - 应当 index-1
  if (prev) prev.disabled = currentWeekIndex >= WEEK_RANK_LIST.length - 1;
  if (next) next.disabled = currentWeekIndex <= 0;
}

// ==================== 榜单 Tab 事件 ====================
document.querySelectorAll('.rank-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.rank-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    renderRanking(t.dataset.rank);
    updateTabTip('tabTipPast', t);
  });
});

// ==================== 推荐书单 Tab 事件（选品 + 跟品 双板块）====================
// 选品板块（data-rec）
document.querySelectorAll('.rec-tab[data-rec]').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.rec-tab[data-rec]').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    renderRecommend(t.dataset.rec);
    updateTabTip('tabTipRec', t);
  });
});
// 跟品板块（data-follow）
document.querySelectorAll('.rec-tab[data-follow]').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.rec-tab[data-follow]').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    renderFollow(t.dataset.follow);
    updateTabTip('tabTipFollow', t);
  });
});

// Benchmark Tab 切换
document.querySelectorAll('.bench-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.bench-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    renderBenchmark(t.dataset.bench);
  });
});

// ==================== 推荐书单：左侧锚点导航事件 ====================
function smoothScrollTo(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
}
// 点击「板块」主项 → 滚动到对应 panel（看过去/推荐书单两个 sidebar 都生效）
document.querySelectorAll('.rec-side-nav .rsn-item[data-target]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    // 仅清除同一 sidebar 内的 active
    const sidebar = a.closest('.rec-side-nav');
    if (sidebar) sidebar.querySelectorAll('.rsn-item').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    smoothScrollTo('#' + a.dataset.target);
  });
});
// 点击「分组标题」（实战榜单 / 潜力榜单 / 当月推荐书单 / 投放参考）→ 跳转到对应区域
document.querySelectorAll('.rec-side-nav .rsn-group-link[data-target]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = a.dataset.target;
    smoothScrollTo('#' + target);
  });
});
// 点击子项「童书/健康/社科/全部」→ 切换 rec-tab + 滚动
document.querySelectorAll('.rec-side-nav [data-rec-jump]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const key = a.dataset.recJump;
    const tab = document.querySelector(`.rec-tab[data-rec="${key}"]`);
    if (tab) tab.click();
    document.querySelectorAll('.rsn-sub-item').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    smoothScrollTo('#rec-block-1');
  });
});
// 点击子项「潜力爆品/预测爆品」→ 切换 follow tab + 滚动
document.querySelectorAll('.rec-side-nav [data-follow-jump]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const key = a.dataset.followJump;
    const tab = document.querySelector(`.rec-tab[data-follow="${key}"]`);
    if (tab) tab.click();
    document.querySelectorAll('.rsn-sub-item').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    smoothScrollTo('#rec-block-2');
  });
});
// 同步左侧 count 数字
function syncRecSideCount() {
  const all = (typeof getRecommendBooks === 'function') ? getRecommendBooks() : [];
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('rsnCountChild', all.filter(b => b.top_cat === '童书').length);
  set('rsnCountEdu', all.filter(b => b.top_cat === '教辅').length);
  set('rsnCountHealth', all.filter(b => b.top_cat === '健康').length);
  set('rsnCountSocial', all.filter(b => b.top_cat === '社科').length);
}

// ==================== ECharts ====================
const TXT='#374151', AXIS='#e5e7eb', SPLIT='#f3f4f6';

let overviewInit = false;
function initOverview() {
  if (overviewInit) return;
  overviewInit = true;

  const months = MONTHS_DATA.map(m => m.m);
  // 4 大品类浅色 + ECharts 浅色调色板
  const LIGHT_CAT = { '教辅':'#FCA5A5', '童书':'#FCD68A', '健康':'#86EFAC', '社科':'#C4B5FD' };

  // 各品类绝对消耗 = 占比 × total（柱状反映真实消耗，高度=指数趋势）
  const seriesData = ['教辅','童书','健康','社科'].map(cat => 
    MONTHS_DATA.map(m => +(m[cat] * m.total / 100).toFixed(1))
  );

  echarts.init(document.getElementById('chartYearTrend')).setOption({
    backgroundColor:'transparent',
    tooltip:{
      trigger:'axis',
      axisPointer:{type:'shadow'},
      formatter: params => {
        const idx = params[0].dataIndex;
        const m = MONTHS_DATA[idx];
        let html = `<strong style="color:#111827;font-size:14px;">${m.m}</strong> · <span style="color:${m.current?'#ef4444':'#6b7280'};">${m.season}</span><br/><span style="color:#6b7280;font-size:11px;">${m.focus}</span><hr style="margin:6px 0;border:none;border-top:1px dashed #e5e7eb;"/>`;
        params.forEach(p => {
          if (p.seriesType === 'line') {
            html += `<div style="margin-top:6px;padding-top:6px;border-top:1px dashed #e5e7eb;color:#3b82f6;">${p.marker} <strong>总消耗指数: ${p.value}</strong></div>`;
          } else {
            const pct = m[p.seriesName] || 0;
            html += `${p.marker} ${p.seriesName}: <strong>${p.value}</strong> <span style="color:#6b7280;font-size:11px;">(占比 ${pct}%)</span><br/>`;
          }
        });
        return html;
      }
    },
    legend:{
      top:0, textStyle:{color:TXT, fontSize:12},
      data:[
        {name:'教辅', icon:'rect'},
        {name:'童书', icon:'rect'},
        {name:'健康', icon:'rect'},
        {name:'社科', icon:'rect'},
        {name:'总消耗趋势', icon:'circle'}
      ]
    },
    grid:{top:50, bottom:50, left:55, right:50},
    xAxis:[{type:'category', data:months,
      axisLine:{lineStyle:{color:AXIS}}, axisTick:{show:false},
      axisLabel:{color:TXT, fontSize:13, fontWeight:600}}],
    yAxis:[
      {type:'value', name:'总消耗指数', max:100, nameTextStyle:{color:TXT,fontSize:11}, axisLine:{lineStyle:{color:AXIS}}, axisLabel:{color:TXT}, splitLine:{lineStyle:{color:SPLIT}}}
    ],
    series:[
      {name:'教辅', type:'bar', stack:'total', barWidth:'52%',
        itemStyle:{color:LIGHT_CAT['教辅']}, emphasis:{focus:'series'},
        data: seriesData[0]},
      {name:'童书', type:'bar', stack:'total',
        itemStyle:{color:LIGHT_CAT['童书']}, emphasis:{focus:'series'},
        data: seriesData[1]},
      {name:'健康', type:'bar', stack:'total',
        itemStyle:{color:LIGHT_CAT['健康']}, emphasis:{focus:'series'},
        data: seriesData[2]},
      {name:'社科', type:'bar', stack:'total',
        itemStyle:{color:LIGHT_CAT['社科'], borderRadius:[6,6,0,0]}, emphasis:{focus:'series'},
        data: seriesData[3]},
      {name:'总消耗趋势', type:'line', smooth:true,
        symbol:'circle', symbolSize:8,
        lineStyle:{color:'#3b82f6', width:3},
        itemStyle:{color:'#fff', borderColor:'#3b82f6', borderWidth:3},
        emphasis:{scale:1.5},
        z:10, data: MONTHS_DATA.map(m => m.total),
        markPoint:{data:[{type:'max', name:'峰值'}], symbolSize:50, itemStyle:{color:'#ef4444'}, label:{color:'#fff', fontSize:11, fontWeight:700}}
      }
    ]
  });

  // 6 月选品 by 周节奏图
  renderWeekRhythm();
}

// ==================== 看未来：综合初始化 ====================
let futureInit = false;
function initFuture() {
  // 全年趋势图（已在 initOverview 实现，移过来）
  if (!overviewInit) initOverview();
  if (futureInit) return;
  futureInit = true;
  renderDeepCats();
}

function renderCatPie() {
  const share = getCurrentWeek().cat_share;
  echarts.init(document.getElementById('chartCatPie')).setOption({
    backgroundColor:'transparent',
    tooltip:{trigger:'item', formatter:'{b}<br/>占比 {c}%'},
    legend:{bottom:0, textStyle:{color:TXT}, itemWidth:10},
    series:[{
      type:'pie', radius:['50%','75%'], center:['50%','45%'],
      itemStyle:{borderRadius:6, borderColor:'#fff', borderWidth:3},
      label:{color:'#111827', formatter:'{b}\n{c}%', fontSize:13, fontWeight:600},
      labelLine:{lineStyle:{color:'#9ca3af'}},
      data: share.map(s => ({value:s.share, name:s.cat, itemStyle:{color:CAT_COLOR[s.cat]}}))
    }]
  });
}

function renderCatRadar() {
  echarts.init(document.getElementById('chartCatRadar')).setOption({
    backgroundColor:'transparent',
    tooltip:{},
    legend:{textStyle:{color:TXT}, bottom:0, itemWidth:10},
    radar:{
      center:['50%','42%'], radius:'60%',
      indicator:[
        {name:'销量', max:100},
        {name:'转化', max:100},
        {name:'ROI', max:100},
        {name:'客单', max:100},
        {name:'稳定性', max:100}
      ],
      axisName:{color:TXT, fontSize:11},
      splitLine:{lineStyle:{color:SPLIT}},
      splitArea:{show:false},
      axisLine:{lineStyle:{color:AXIS}}
    },
    series:[{type:'radar', symbolSize:5, data:[
      {value:[95,92,75,55,80], name:'教辅', itemStyle:{color:CAT_COLOR['教辅']}, lineStyle:{width:2}, areaStyle:{color:CAT_COLOR['教辅']+'25'}},
      {value:[88,85,70,80,75], name:'童书', itemStyle:{color:CAT_COLOR['童书']}, lineStyle:{width:2}, areaStyle:{color:CAT_COLOR['童书']+'25'}},
      {value:[72,90,85,60,90], name:'健康', itemStyle:{color:CAT_COLOR['健康']}, lineStyle:{width:2}, areaStyle:{color:CAT_COLOR['健康']+'25'}},
      {value:[78,75,82,75,70], name:'社科', itemStyle:{color:CAT_COLOR['社科']}, lineStyle:{width:2}, areaStyle:{color:CAT_COLOR['社科']+'25'}}
    ]}]
  });
}

// ==================== 初始化 ====================
initWeekSelect();
initRankWeekSwitcher();
initFollowWeekSwitcher();
buildCrossIndex();
// 默认 active 是 future（先看趋势）→ 初始化 future
// hub 改为切到时按需渲染（避免初始化时因数据未就绪报错）
try { initFuture(); } catch (e) { console.error('[init] initFuture 失败:', e); }
// 提前预渲染一次 hub，让用户切到 hub 时表格已就绪
try { renderHub(); } catch (e) { console.error('[init] renderHub 失败:', e); }
try { initHubSearch(); } catch (e) { console.error('[init] initHubSearch 失败:', e); }
updatePoolUI();
syncRecSideCount();

// 初始化默认 Tab 提示（hub 架构下已不需要）

window.addEventListener('resize', () => {
  document.querySelectorAll('.chart, .chart-md, .chart-lg, .chart-xl').forEach(el => {
    const inst = echarts.getInstanceByDom(el);
    if (inst) inst.resize();
  });
});

// ==================== ★ 优化方向一：本周决策摘要卡（三视角直达入口）====================
function initDecisionSummary() {
  // 周次标签（基于 WEEK_RANK_LIST 最新一周）
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  if (typeof WEEK_RANK_LIST !== 'undefined' && WEEK_RANK_LIST[0]) {
    const wd = WEEK_RANK_LIST[0].data;
    if (wd && wd.week_label) setText('dsWeekLabel', wd.week_label);
  }
  // 卡片点击跳转
  document.querySelectorAll('.ds-card[data-ds-jump]').forEach(c => {
    c.addEventListener('click', e => {
      e.preventDefault();
      const target = c.dataset.dsJump;
      const anchor = c.dataset.dsAnchor; // 可选：跳转到 hub 的某个具体 panel
      switchSection(target);
      // 等 section 渲染完再滚到锚点
      setTimeout(() => {
        if (anchor) {
          const el = document.getElementById(anchor);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 120);
    });
  });
}
initDecisionSummary();

// ==================== ★ 优化方向三：周节奏图 → 榜单中心跳转 ====================
// 事件代理：点击 [data-wr-jump] 链接 → 切到 hub + 滚到对应品类的精选书单 panel
document.addEventListener('click', e => {
  const link = e.target.closest('[data-wr-jump]');
  if (!link) return;
  e.preventDefault();
  const recKey = link.dataset.wrJump || 'all';
  switchSection('hub');
  setTimeout(() => {
    // 推荐书单的 panel id 映射（教辅暂无独立精选书单，回退到 intro）
    const panelMap = {
      '童书': 'hub-block-rec-child',
      '健康': 'hub-block-rec-health',
      '社科': 'hub-block-rec-social',
      '教辅': 'hub-block-rec-edu',
      'all':  'hub-block-rec-intro'
    };
    const targetId = panelMap[recKey] || 'hub-block-rec-intro';
    const target = document.getElementById(targetId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 120);
});

// ==================== ★ 优化方向四：选品池 → 创意生产中心闭环（队列模式 · 多对一接力）====================
// 数据契约（localStorage 键：bhd_creative_inbox_v1）：
//   {
//     version: 1,
//     source: 'select-workbench',
//     target: 'p4' | 'p6',          // 目标模块
//     sentAt: ISO 时间戳,
//     cursor: 0,                     // 当前游标
//     queue: [
//       { isbn, title, top_cat, price, source, status: 'pending'|'done'|'skip' }
//     ]
//   }
// 主站 #p4 / #p6 顶部的「选品池队列条」会读取该 inbox，自动填入当前游标对应书籍，
// 处理完后用户点「下一本」/「跳过」/「清空队列」推进。
function sendPoolToCreative(target) {
  target = target || 'p4';
  // 埋点：送至创意生产
  try{ if(window.tracker) window.tracker.feature('select_send_creative', {target: target, poolSize: pool.length}, null, 'select_hub'); }catch(e){}
  if (!pool || !pool.length) {
    alert('选品池为空，请先添加 ISBN 到选品池');
    return;
  }
  // 若有勾选则只送勾选项，否则送全部
  const sourceList = poolSelected.size
    ? Array.from(poolSelected).sort((a,b) => a - b).map(i => pool[i]).filter(Boolean)
    : pool;

  const queue = sourceList
    .filter(p => p.isbn) // 只送 ISBN 完整的书（队列模式必须有 ISBN）
    .map(p => ({
      isbn: String(p.isbn).trim(),
      title: p.title || '',
      top_cat: p.top_cat || mapToTopCat(p.cat||'') || '',
      price: p.price || '',
      source: p.source || '',
      status: 'pending'
    }));

  if (!queue.length) {
    alert(poolSelected.size
      ? '勾选的图书中没有 ISBN 完整项，无法送至创意生产中心'
      : '选品池中没有 ISBN 完整的书籍，无法送至创意生产中心');
    return;
  }

  const totalCandidate = sourceList.length;
  const skipped = totalCandidate - queue.length;
  const scopeLabel = poolSelected.size ? `已勾选 ${totalCandidate} 本` : `选品池共 ${totalCandidate} 本`;
  if (skipped > 0) {
    if (!confirm(`${scopeLabel}，其中 ${skipped} 本 ISBN 缺失将被跳过。\n确认送 ${queue.length} 本到「${target==='p4'?'图书内容提取':'图片文案生成'}」？`)) {
      return;
    }
  }

  const targetName = target === 'p4' ? '图书内容提取' : '图片文案生成';
  const payload = {
    version: 1,
    source: 'select-workbench',
    target: target,
    targetName: targetName,
    sentAt: new Date().toISOString(),
    cursor: 0,
    queue: queue
  };
  try {
    localStorage.setItem('bhd_creative_inbox_v1', JSON.stringify(payload));
    sessionStorage.setItem('bhd_creative_inbox_v1', JSON.stringify(payload));
  } catch(e) {}

  // 跳转策略：
  // - 主站（/index.html）通过 iframe 嵌入 /select/，#p4 / #p6 这些 section 在父窗口里
  // - 因此必须让"承载主站的窗口"切到 #p4，本 iframe 跳是无效的
  var targetUrl = location.origin + '/index.html#' + target;

  var jumped = false;
  // ① 优先：父窗口同源 → 调用主站全局 go() 函数（不重载页面）
  try {
    if (window.top && window.top !== window.self) {
      try {
        if (typeof window.top.go === 'function') {
          window.top.go(target);
          jumped = true;
        }
      } catch(e1) {}

      if (!jumped) {
        try {
          window.top.location.hash = '#' + target;
          jumped = true;
        } catch(e2) {}
      }

      if (!jumped) {
        try {
          window.top.location.href = targetUrl;
          jumped = true;
        } catch(e3) {}
      }

      // 主动触发主站重新读取 inbox 渲染队列条
      try {
        if (window.top.CreativeInbox && typeof window.top.CreativeInbox.refresh === 'function') {
          setTimeout(function(){ try { window.top.CreativeInbox.refresh(); } catch(e){} }, 300);
        }
      } catch(e) {}
    }
  } catch(e) {}

  // ② Fallback：当前窗口直接跳转（独立打开 select 页时走这条）
  if (!jumped) {
    try {
      window.location.href = targetUrl;
    } catch(e) {
      window.location.assign(targetUrl);
    }
  }
}
window.sendPoolToCreative = sendPoolToCreative;
window.togglePoolSendMenu = togglePoolSendMenu;
