// ==================== 选品池 ====================
let pool = [];

function addToPool(book, source) {
  if (pool.some(p => p.title === book.title)) {
    pool = pool.filter(p => p.title !== book.title);
  } else {
    pool.push({...book, source: source || 'unknown', addedAt: new Date().toISOString()});
  }
  updatePoolUI();
  refreshActiveCards();
}

function refreshActiveCards() {
  const sec = document.querySelector('.subtab.active').dataset.section;
  if (sec === 'pool-list') {
    const activeTab = document.querySelector('.rank-tab.active');
    if (activeTab) renderRanking(activeTab.dataset.rank);
  }
}

function updatePoolUI() {
  document.getElementById('poolCountNav').textContent = pool.length;
  document.getElementById('heroPoolCount').textContent = pool.length;
  renderPool();
}

function renderPool() {
  const body = document.getElementById('poolBody');
  if (!body) return;
  if (pool.length === 0) {
    body.innerHTML = `<div class="pool-empty"><div class="pool-empty-icon">🛒</div><p style="font-size:15px;color:#6b7280;">选品池为空</p><p style="margin-top:6px;font-size:12px;">从「选品 ISBN 池」加书～</p></div>`;
    return;
  }
  body.innerHTML = `
    <div class="toolbar">
      <span style="color:#374151;font-size:13px;">已选 <strong style="color:#3b82f6;">${pool.length}</strong> 本 · ISBN 完整 <strong style="color:#10b981;">${pool.filter(p=>p.isbn).length}</strong></span>
      <button class="toolbar-btn success" onclick="exportPool('csv')">📥 CSV</button>
      <button class="toolbar-btn success" onclick="exportPool('json')">📥 JSON</button>
      <button class="toolbar-btn" style="background:linear-gradient(135deg,#ef4444,#dc2626);border-color:#dc2626;color:#fff;font-weight:600;margin-left:auto;" onclick="alert('已透传 '+pool.length+' 个 ISBN 到创意生产中心')">🚀 一键送至创意生产中心</button>
      <button class="toolbar-btn" onclick="if(confirm('确定清空？')){pool=[];updatePoolUI();}">清空</button>
    </div>
    <table class="pool-table">
      <thead><tr><th>#</th><th>封面</th><th>书名</th><th>品类</th><th>来源</th><th>ISBN</th><th>潜力分</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>
        ${pool.map((b, i) => {
          const cat = b.top_cat || mapToTopCat(b.cat||'');
          return `<tr>
            <td style="font-weight:700;color:#3b82f6;">${i+1}</td>
            <td><img class="pool-cover-mini" src="${bookCover(b)}" alt=""/></td>
            <td style="max-width:300px;line-height:1.4;">${b.title}</td>
            <td><span class="cat-tag ${cat}">${cat}</span></td>
            <td><span style="font-size:11px;background:#f3f4f6;padding:2px 6px;border-radius:4px;color:#4b5563;">${b.source}</span></td>
            <td style="font-family:'SF Mono',monospace;font-size:11px;color:${b.isbn?'#059669':'#f59e0b'};">${b.isbn || '⚠ 待补'}</td>
            <td>${b.score ? '<strong style="color:#3b82f6;">'+b.score+'</strong>' : '-'}</td>
            <td><span class="status-pill">待评估</span></td>
            <td><button class="toolbar-btn" style="padding:3px 8px;font-size:11px;" onclick="pool.splice(${i},1);updatePoolUI();">移除</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function exportPool(fmt) {
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
  const priceHtml = b.price ? `<div class="book-price">¥${b.price}</div>` : '';
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
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-book]');
  if (btn) {
    try {
      const book = JSON.parse(btn.dataset.book.replace(/&quot;/g, '"'));
      addToPool(book, btn.dataset.source);
    } catch (err) { console.error('Parse error:', err); }
  }
});

// ==================== 推荐书单（按品类分组）====================
function getRecommendBooks() {
  if (typeof RECOMMEND_BOOKS === 'undefined') return [];
  const result = [];
  let rank = 1;
  const orderedSheets = ['童书推荐书单', '健康推荐书单', '社科推荐书单'];
  for (const sheetName of orderedSheets) {
    const list = RECOMMEND_BOOKS[sheetName] || [];
    const topCat = sheetName.replace('推荐书单', '');
    list.forEach(b => result.push({
      rank: rank++,
      title: b.title, isbn: b.isbn, author: b.author, publisher: b.publisher,
      cat: topCat, top_cat: topCat, image: b.image,
      ams_status: b.ams_status, date: b.recommend_date
    }));
  }
  return result;
}

// ==================== 周榜数据：来自 WEEK_RANK_DATA（图书榜单.xlsx）====================
function getRankItems(rankKey) {
  if (rankKey === 'recommend') {
    return {
      name: '推荐书单',
      subtitle: '基于市场情况精选 · 来自《推荐书单》数据库（共 160 本，按品类分组）',
      items: getRecommendBooks()
    };
  }
  if (typeof WEEK_RANK_DATA === 'undefined') return null;
  return WEEK_RANK_DATA.lists[rankKey];
}

// 榜单字段配置（不同榜单显示不同列，与 Excel 一致）
const RANK_COLUMNS = {
  adq_hot: {
    style: 'blue',
    cols: [
      {key:'rank', label:'#', cls:'col-rank'},
      {key:'image', label:'商品图片', cls:'col-image'},
      {key:'title', label:'书名', cls:'col-title'},
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
      {key:'isbn', label:'ISBN', cls:''},
      {key:'ams_status', label:'AMS准入', cls:''},
      {key:'action', label:'操作', cls:'col-action'}
    ]
  }
};

function escapeHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
    return `<div class="title-text">${escapeHtml(v||'')}</div>`;
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
  if (col.key === 'ams_status') {
    const ok = v && (v === '准入' || v.includes('全流量'));
    return v ? `<span style="font-size:11px;padding:2px 6px;border-radius:4px;background:${ok?'#d1fae5':'#fef3c7'};color:${ok?'#065f46':'#92400e'};">${escapeHtml(v.slice(0,10))}</span>` : '-';
  }
  if (col.key === 'action') {
    const inPool = pool.some(p => p.title === item.title);
    const safeBook = escapeHtml(JSON.stringify(item));
    return `<button class="${inPool?'added':''}" data-book="${safeBook}" data-source="${listName}">${inPool?'✓ 已加':'+ 加入'}</button>`;
  }
  return v ? escapeHtml(v) : '-';
}

function renderRanking(rankKey) {
  rankKey = rankKey || 'adq_hot';
  const data = getRankItems(rankKey);
  const body = document.getElementById('rankBody');
  if (!data || !data.items?.length) {
    body.innerHTML = `<div class="pool-empty"><div class="pool-empty-icon">📊</div><p>${data?.name||'榜单'} - 数据接入中</p></div>`;
    return;
  }
  const cfg = RANK_COLUMNS[rankKey] || RANK_COLUMNS.adq_hot;
  
  const headerHtml = `
    <div class="rank-header-bar">
      <div class="icon">${rankKey==='recommend'?'⭐':'📊'}</div>
      <div class="info">
        <div class="name">${data.name}</div>
        <div class="subtitle">${data.subtitle}</div>
      </div>
      <div class="meta">共 ${data.items.length} 本</div>
    </div>`;
  
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

function exportCurrentRank() {
  const k = document.querySelector('.rank-tab.active').dataset.rank;
  const data = getRankItems(k);
  if (!data) return;
  const csv = 'rank,title,isbn,cat,price,sales_idx,conv,channel/roi\n' +
    data.items.map(b => `${b.rank},"${b.title||''}",${b.isbn||''},"${b.cat||''}",${b.price||''},${b.sales_idx||''},${b.conv||''},${b.channel_or_roi||''}`).join('\n');
  download(`${data.name}.csv`, '\uFEFF'+csv, 'text/csv');
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

// ==================== 推荐书单（Tab 切换）====================
function renderRecommend(recKey) {
  recKey = recKey || 'all';
  const body = document.getElementById('recBody');
  if (!body) return;
  
  // 潜力 / 预测 直接复用周榜数据
  if (recKey === 'potential' || recKey === 'forecast') {
    const data = getRankItems(recKey);
    if (!data) { body.innerHTML = ''; return; }
    const cfg = RANK_COLUMNS[recKey];
    body.innerHTML = `
      <div class="rank-header-bar">
        <div class="icon">${recKey==='potential'?'💎':'🎯'}</div>
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
    return;
  }
  
  // 推荐书单（按品类筛选 or 全部）
  const all = getRecommendBooks();
  const cfg = RANK_COLUMNS.recommend;
  
  if (recKey === 'all') {
    // 按品类分组
    const groups = {};
    all.forEach(it => {
      const c = it.top_cat || mapToTopCat(it.cat||'');
      if (!groups[c]) groups[c] = [];
      groups[c].push(it);
    });
    const order = ['童书','健康','社科','教辅','其他'];
    let html = `
      <div class="rank-header-bar">
        <div class="icon">📋</div>
        <div class="info">
          <div class="name">全部推荐书单</div>
          <div class="subtitle">综合所有推荐书单，按品类分组展示</div>
        </div>
        <div class="meta">共 ${all.length} 本</div>
      </div>`;
    for (const cat of order) {
      if (!groups[cat] || !groups[cat].length) continue;
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
  const catIcon = {童书:'🧸', 健康:'🌿', 社科:'🏛', 教辅:'📖'}[recKey] || '📚';
  body.innerHTML = `
    <div class="rank-header-bar">
      <div class="icon">${catIcon}</div>
      <div class="info">
        <div class="name">${recKey}推荐书单</div>
        <div class="subtitle">来自《2026 教育行业图书选品指南》${recKey}赛道精选</div>
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
  const tab = document.querySelector('.rec-tab.active');
  if (!tab) return;
  const k = tab.dataset.rec;
  let items = [], name = '';
  if (k === 'potential' || k === 'forecast') {
    const d = getRankItems(k);
    items = d.items; name = d.name;
  } else if (k === 'all') {
    items = getRecommendBooks(); name = '全部推荐书单';
  } else {
    items = getRecommendBooks().filter(b => b.top_cat === k); name = k+'推荐书单';
  }
  const csv = 'rank,title,isbn,top_cat,author,publisher,ams_status\n' +
    items.map(b => `${b.rank},"${b.title||''}",${b.isbn||''},${b.top_cat||mapToTopCat(b.cat||'')},"${b.author||''}","${b.publisher||''}","${b.ams_status||''}"`).join('\n');
  download(`${name}.csv`, '\uFEFF'+csv, 'text/csv');
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

// ==================== 类目占比横条 ====================
function renderCatShareBar() {
  const bar = document.getElementById('catShareBar');
  if (!bar) return;
  const share = (typeof WEEK_RANK_DATA !== 'undefined') ? WEEK_RANK_DATA.cat_share : null;
  if (!share || !share.length) { bar.innerHTML = ''; return; }
  // 映射颜色（养生→健康，成人→社科）
  const colorMap = { '养生':'#10b981', '童书':'#f59e0b', '成人':'#8b5cf6', '教辅':'#ef4444', '健康':'#10b981', '社科':'#8b5cf6' };
  bar.innerHTML = share.map(s => {
    const w = s.share;
    const color = colorMap[s.cat] || '#6b7280';
    return `<div class="cat-share-seg" style="background:${color};flex:${w};">
      <div class="label">${s.cat}</div>
      <div class="pct">${w.toFixed(1)}%</div>
    </div>`;
  }).join('');
}

// ==================== 节点 × 人群画像（单行紧凑版）====================
function renderNodePersona() {
  const list = document.getElementById('nodePersonaList');
  if (!list) return;
  list.innerHTML = NODES_PERSONA.map(n => `
    <div class="np-row-card ${n.urgent?'urgent':''}">
      <div class="np-icon-block">
        <div class="icon">${n.icon}</div>
      </div>
      <div class="np-name-block">
        <div class="date">📍 ${n.date}</div>
        <div class="name">${n.name}</div>
        <div class="cat-line">
          <span class="cat-tag ${n.cat}">${n.cat}</span>
          ${n.urgent ? '<span class="urgent-pill">紧迫</span>' : ''}
        </div>
      </div>
      <div class="np-persona-block">
        <div class="l">👥 目标人群（3层）</div>
        <div class="p1">①核心：${n.primaryPersona}</div>
        <div class="p2">②次要：${n.secondaryPersona}</div>
        <div class="p3">③外围：${n.tertiaryPersona}</div>
      </div>
      <div class="np-insight-block">
        ${n.insight}
        <span class="creative"><strong>✨ 创意公式：</strong>${n.creative}</span>
      </div>
    </div>
  `).join('');
}

// ==================== 典型跑量书拆解 ====================
function renderHotBookBreakdown() {
  const html = `<div class="bd-grid-3">` + HOT_BOOK_BREAKDOWN.map(b => {
    const cat = b.cat || '童书';
    const cover = b.image || bookCover({title:b.title, isbn:b.isbn, top_cat:cat});
    const refsHtml = (b.creativeRefs || []).map(r => 
      `<a href="${r.url}" target="_blank" class="ref-link">🎬 ${r.label}</a>`
    ).join('');
    return `
    <div class="hot-card">
      <!-- 顶部：封面 + 标题 -->
      <div class="hot-head">
        <img class="hot-cover" src="${cover}" alt="${b.title}" onerror="this.src='${bookCover({title:b.title, isbn:b.isbn, top_cat:cat})}'"/>
        <div class="hot-meta">
          <span class="role-tag ${b.roleClass}">${b.role}</span>
          <h3>${b.title}</h3>
          <div class="hot-isbn">📕 ISBN ${b.isbn}</div>
        </div>
      </div>
      
      <!-- 数据条 -->
      <div class="hot-stats">
        ${b.stats.map(s => `<div class="stat-chip ${s.cls||''}"><span class="ic">${s.icon}</span><span class="lb">${s.label}</span><span class="vl">${s.val}</span></div>`).join('')}
      </div>
      
      <!-- 目标人群 -->
      <div class="hot-block">
        <div class="hot-block-title">👥 <span>目标人群</span></div>
        <div class="persona-chips">
          ${b.persona.map(p => `<div class="persona-chip"><span class="ic">${p.icon}</span><span class="lb">${p.label}</span><span class="vl">${p.val}</span></div>`).join('')}
        </div>
      </div>
      
      <!-- 实际跑量素材 -->
      ${refsHtml ? `<div class="hot-block">
        <div class="hot-block-title">🎞️ <span>实际跑量素材</span></div>
        <div class="ref-links">${refsHtml}</div>
      </div>` : ''}
      
      <!-- 创意脚本框架 -->
      <div class="hot-block">
        <div class="hot-block-title">🎬 <span>创意脚本框架</span></div>
        <div class="script-flow">
          ${b.script.map((s, i) => `
            <div class="script-step">
              <div class="step-icon">${s.emoji}</div>
              <div class="step-body">
                <div class="step-name">${s.step}</div>
                <div class="step-desc">${s.content}</div>
              </div>
            </div>
            ${i < b.script.length - 1 ? '<div class="step-arrow">↓</div>' : ''}
          `).join('')}
        </div>
      </div>
      
      <!-- 卖点拆解 -->
      <div class="hot-block">
        <div class="hot-block-title">🎯 <span>卖点拆解</span></div>
        <div class="selling-grid">
          ${b.sellingPoints.map(p => `
            <div class="selling-item">
              <div class="sp-icon">${p.icon}</div>
              <div class="sp-body">
                <div class="sp-label">${p.label}</div>
                <div class="sp-val">${p.val}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
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
        <div class="l">📊 数据情况</div>
        <div class="c"><div class="stats">${d.stats.split(' · ').map(s => `<span ${s.includes('cvr')?'class="hot"':''}>${s}</span>`).join('')}</div></div>
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

// ==================== Tab 切换 ====================
function switchSection(name) {
  document.querySelectorAll('.subtab').forEach(t => t.classList.toggle('active', t.dataset.section === name));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === 'section-'+name));
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
    if (name === 'past') {
      renderCatShareBar();
      // 默认渲染 ADQ 热投
      const tab = document.querySelector('#section-past .rank-tab.active');
      if (tab) {
        renderRanking(tab.dataset.rank);
        updateTabTip('tabTipPast', tab);
      }
      renderHotBookBreakdown();
    }
    if (name === 'future') initFuture();
    if (name === 'recommend') {
      const tab = document.querySelector('.rec-tab.active');
      if (tab) {
        renderRecommend(tab.dataset.rec);
        updateTabTip('tabTipRec', tab);
      }
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

// ==================== 榜单 Tab 事件 ====================
document.querySelectorAll('.rank-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.rank-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    renderRanking(t.dataset.rank);
    updateTabTip('tabTipPast', t);
  });
});

// ==================== 推荐书单 Tab 事件 ====================
document.querySelectorAll('.rec-tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.rec-tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    renderRecommend(t.dataset.rec);
    updateTabTip('tabTipRec', t);
  });
});

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

  // 节点 + 人群画像
  renderNodePersona();
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
renderRanking();
renderCatShareBar();
renderHotBookBreakdown();
updatePoolUI();

// 初始化默认 Tab 提示
const initialPastTab = document.querySelector('#section-past .rank-tab.active');
if (initialPastTab) updateTabTip('tabTipPast', initialPastTab);

window.addEventListener('resize', () => {
  document.querySelectorAll('.chart, .chart-md, .chart-lg, .chart-xl').forEach(el => {
    const inst = echarts.getInstanceByDom(el);
    if (inst) inst.resize();
  });
});
