/* ============================================================
 * 创意生产中心 · 选品池队列条（接力消费）
 *
 * 数据契约（localStorage 键：bhd_creative_inbox_v1）：
 *   {
 *     version: 1,
 *     source: 'select-workbench',
 *     target: 'p4' | 'p6',
 *     targetName: string,
 *     sentAt: ISO 时间戳,
 *     cursor: 0,
 *     queue: [ { isbn, title, top_cat, price, source, status: 'pending'|'done'|'skip' } ]
 *   }
 *
 * 使用方式：
 *   在主站 #p4 / #p6 的容器内放置一个挂载点：<div data-creative-inbox="p4|p6"></div>
 *   引入本文件后会自动扫描挂载点 + 按 target 渲染队列条 + 自动填入当前游标对应的 ISBN/书名。
 *
 *   每个目标模块的字段映射在下面的 TARGET_FIELDS 中维护。
 * ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'bhd_creative_inbox_v1';

  // 目标模块字段映射：从队列项字段 → DOM input id；以及"标记当前完成"的触发按钮 id
  var TARGET_FIELDS = {
    p4: {
      title: '图书内容提取',
      isbnInputId: 'isbnInput',
      bookTitleInputId: 'bookTitleInput',
      runBtnId: 'isbnBtn',           // 用于在点击「开始采集」后将当前项标记为 done
      sectionId: 'pg-p4'
    },
    p6: {
      title: '图片文案生成',
      isbnInputId: 'adIsbnInput',
      bookTitleInputId: 'adBookTitleInput',
      runBtnId: null,                 // #p6 的按钮没有固定 id，绑定方式见下
      runBtnSelector: '#pg-p6 button[onclick*="runAdGen"]',
      sectionId: 'pg-p6'
    }
  };

  function readInbox() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.queue || !data.queue.length) return null;
      return data;
    } catch (e) {
      return null;
    }
  }
  function writeInbox(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }
  function clearInbox() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }

  // 把 queue[cursor] 自动填入目标模块的 ISBN/书名 input
  function fillCurrent(target, item) {
    var f = TARGET_FIELDS[target];
    if (!f || !item) return;
    var isbnEl = document.getElementById(f.isbnInputId);
    var titleEl = document.getElementById(f.bookTitleInputId);
    if (isbnEl && item.isbn) {
      isbnEl.value = item.isbn;
      // 触发 change 让外层模块（例如 #p4 的 autoLookupISBN）能感知
      try { isbnEl.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
      try { isbnEl.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
    }
    if (titleEl && item.title) {
      titleEl.value = item.title;
      try { titleEl.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    }
  }

  // 渲染队列条 HTML
  function renderBar(mountEl, target, data) {
    var item = data.queue[data.cursor];
    var total = data.queue.length;
    var pos = data.cursor + 1;
    var done = data.queue.filter(function (q) { return q.status === 'done'; }).length;
    var pendingLeft = total - data.cursor;

    mountEl.innerHTML =
      '<div class="ci-bar">' +
        '<div class="ci-bar-left">' +
          '<div class="ci-pill">📥 来自选品池的处理队列</div>' +
          '<div class="ci-progress">' +
            '<span class="ci-pos"><strong>' + pos + '</strong> / ' + total + '</span>' +
            '<span class="ci-done">已完成 ' + done + ' 本</span>' +
            (pendingLeft > 1 ? '<span class="ci-left">还剩 ' + (pendingLeft - 1) + ' 本待处理</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="ci-bar-current">' +
          '<span class="ci-current-label">当前：</span>' +
          '<span class="ci-current-title" title="' + escapeAttr(item.title) + '">' + escapeHtml(item.title || '(无书名)') + '</span>' +
          '<span class="ci-current-isbn">ISBN ' + escapeHtml(item.isbn || '-') + '</span>' +
          (item.top_cat ? '<span class="ci-current-cat">' + escapeHtml(item.top_cat) + '</span>' : '') +
        '</div>' +
        '<div class="ci-bar-right">' +
          '<button type="button" class="ci-btn ci-btn-prev" data-ci-act="prev" ' + (data.cursor === 0 ? 'disabled' : '') + '>◀ 上一本</button>' +
          '<button type="button" class="ci-btn ci-btn-skip" data-ci-act="skip">↷ 跳过</button>' +
          '<button type="button" class="ci-btn ci-btn-done" data-ci-act="done" title="把当前书标记为已处理，并跳到下一本">✓ 处理完，下一本</button>' +
          '<button type="button" class="ci-btn ci-btn-clear" data-ci-act="clear" title="清空整个队列">✕ 清空</button>' +
        '</div>' +
      '</div>' +
      buildQueueList(data);
  }

  function buildQueueList(data) {
    var html = '<div class="ci-queue-list" id="ciQueueList" style="display:none;">';
    data.queue.forEach(function (q, i) {
      var statusCls = i === data.cursor ? 'cur' : (q.status || 'pending');
      var statusText =
        i === data.cursor ? '处理中' :
        q.status === 'done' ? '已完成' :
        q.status === 'skip' ? '已跳过' : '待处理';
      html +=
        '<div class="ci-q-row ' + statusCls + '" data-ci-jump="' + i + '">' +
          '<span class="ci-q-idx">#' + (i + 1) + '</span>' +
          '<span class="ci-q-title" title="' + escapeAttr(q.title) + '">' + escapeHtml(q.title || '(无书名)') + '</span>' +
          '<span class="ci-q-isbn">' + escapeHtml(q.isbn || '-') + '</span>' +
          '<span class="ci-q-status ' + statusCls + '">' + statusText + '</span>' +
        '</div>';
    });
    html += '</div>';
    html += '<div class="ci-toggle-list"><a href="#" data-ci-act="toggle-list">▾ 展开队列详情</a></div>';
    return html;
  }

  function bindEvents(mountEl, target) {
    mountEl.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-ci-act]');
      if (!btn) return;
      e.preventDefault();
      var act = btn.dataset.ciAct;
      var data = readInbox();
      if (!data) return;

      if (act === 'toggle-list') {
        var list = mountEl.querySelector('#ciQueueList');
        var link = btn;
        if (!list) return;
        if (list.style.display === 'none') {
          list.style.display = 'block';
          link.textContent = '▴ 收起队列详情';
        } else {
          list.style.display = 'none';
          link.textContent = '▾ 展开队列详情';
        }
        return;
      }

      if (act === 'clear') {
        if (!confirm('确认清空队列？已完成的处理结果不会被删除。')) return;
        clearInbox();
        mountEl.innerHTML = '';
        return;
      }

      if (act === 'prev') {
        if (data.cursor > 0) {
          data.cursor -= 1;
          writeInbox(data);
          renderBar(mountEl, target, data);
          fillCurrent(target, data.queue[data.cursor]);
        }
        return;
      }

      if (act === 'skip') {
        data.queue[data.cursor].status = 'skip';
        moveNext(mountEl, target, data);
        return;
      }

      if (act === 'done') {
        data.queue[data.cursor].status = 'done';
        moveNext(mountEl, target, data);
        return;
      }

      var jumpIdx = btn.dataset.ciJump;
      if (jumpIdx !== undefined) {
        var idx = parseInt(jumpIdx, 10);
        if (!isNaN(idx) && idx >= 0 && idx < data.queue.length) {
          data.cursor = idx;
          writeInbox(data);
          renderBar(mountEl, target, data);
          fillCurrent(target, data.queue[idx]);
        }
      }
    });
  }

  function moveNext(mountEl, target, data) {
    if (data.cursor < data.queue.length - 1) {
      data.cursor += 1;
      writeInbox(data);
      renderBar(mountEl, target, data);
      fillCurrent(target, data.queue[data.cursor]);
      // 滚回输入区
      var f = TARGET_FIELDS[target];
      var isbnEl = document.getElementById(f.isbnInputId);
      if (isbnEl) {
        try { isbnEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
        try { isbnEl.focus(); } catch (e) {}
      }
    } else {
      // 全部完成
      writeInbox(data);
      renderBar(mountEl, target, data);
      var f2 = TARGET_FIELDS[target];
      mountEl.querySelector('.ci-bar').classList.add('ci-completed');
      var hint = document.createElement('div');
      hint.className = 'ci-completed-hint';
      hint.innerHTML = '🎉 队列已全部处理完毕（' + data.queue.length + ' 本）。' +
        '<a href="#" data-ci-act="clear">清空队列</a>';
      mountEl.appendChild(hint);
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(s) {
    return escapeHtml(s).replace(/"/g, '&quot;');
  }

  // 注入样式（单次）
  function injectStyles() {
    if (document.getElementById('ci-bar-styles')) return;
    var css =
      '.ci-bar{background:linear-gradient(135deg,#fffbeb 0%,#fef3c7 100%);border:1px solid #fbbf24;border-radius:10px;padding:12px 14px;margin-bottom:14px;display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;color:#1f2937;font-size:13px;}' +
      '.ci-bar.ci-completed{background:linear-gradient(135deg,#d1fae5 0%,#a7f3d0 100%);border-color:#10b981;}' +
      '.ci-bar-left{display:flex;flex-direction:column;gap:4px;}' +
      '.ci-pill{background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;padding:3px 10px;border-radius:5px;font-weight:700;font-size:12px;display:inline-block;width:fit-content;box-shadow:0 2px 6px rgba(239,68,68,0.2);}' +
      '.ci-progress{display:flex;gap:8px;align-items:center;font-size:11px;color:#92400e;flex-wrap:wrap;}' +
      '.ci-progress .ci-pos strong{font-size:15px;color:#b45309;}' +
      '.ci-progress .ci-done{background:#dcfce7;color:#166534;padding:1px 7px;border-radius:4px;font-weight:600;}' +
      '.ci-progress .ci-left{background:#fee2e2;color:#b91c1c;padding:1px 7px;border-radius:4px;font-weight:600;}' +
      '.ci-bar-current{display:flex;flex-direction:column;gap:3px;min-width:0;}' +
      '.ci-current-label{font-size:11px;color:#92400e;}' +
      '.ci-current-title{font-weight:700;font-size:14px;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '.ci-current-isbn{font-family:"SF Mono",monospace;font-size:11px;color:#059669;}' +
      '.ci-current-cat{display:inline-block;font-size:10px;background:#e0e7ff;color:#4338ca;padding:1px 6px;border-radius:3px;margin-top:2px;width:fit-content;}' +
      '.ci-bar-right{display:flex;gap:6px;flex-wrap:wrap;}' +
      '.ci-btn{padding:5px 11px;border-radius:6px;border:1px solid #e5e7eb;background:#fff;font-size:12px;color:#374151;cursor:pointer;transition:all .15s;font-weight:600;}' +
      '.ci-btn:hover:not(:disabled){border-color:#3b82f6;color:#2563eb;background:#eff6ff;}' +
      '.ci-btn:disabled{opacity:0.45;cursor:not-allowed;}' +
      '.ci-btn-done{background:linear-gradient(135deg,#10b981,#059669);color:#fff;border-color:#059669;}' +
      '.ci-btn-done:hover{background:linear-gradient(135deg,#059669,#047857);color:#fff;}' +
      '.ci-btn-skip{background:#fff7ed;border-color:#fdba74;color:#c2410c;}' +
      '.ci-btn-clear{background:#fef2f2;border-color:#fecaca;color:#b91c1c;}' +
      '.ci-toggle-list{margin-top:6px;text-align:right;}' +
      '.ci-toggle-list a{font-size:11px;color:#2563eb;text-decoration:none;}' +
      '.ci-toggle-list a:hover{text-decoration:underline;}' +
      '.ci-queue-list{background:#fff;border:1px solid #fde68a;border-radius:8px;padding:6px;margin-top:6px;max-height:240px;overflow-y:auto;}' +
      '.ci-q-row{display:grid;grid-template-columns:40px 1fr 130px 70px;gap:8px;align-items:center;padding:5px 8px;border-radius:5px;font-size:12px;cursor:pointer;}' +
      '.ci-q-row:hover{background:#fef3c7;}' +
      '.ci-q-row.cur{background:#fef3c7;border:1px solid #f59e0b;}' +
      '.ci-q-row.done{opacity:0.55;}' +
      '.ci-q-idx{color:#9ca3af;font-weight:700;}' +
      '.ci-q-title{color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
      '.ci-q-isbn{font-family:"SF Mono",monospace;font-size:11px;color:#059669;}' +
      '.ci-q-status{font-size:10px;padding:1px 6px;border-radius:3px;text-align:center;font-weight:600;}' +
      '.ci-q-status.cur{background:#fbbf24;color:#fff;}' +
      '.ci-q-status.done{background:#dcfce7;color:#166534;}' +
      '.ci-q-status.skip{background:#fee2e2;color:#b91c1c;}' +
      '.ci-q-status.pending{background:#f3f4f6;color:#6b7280;}' +
      '.ci-completed-hint{margin-top:8px;padding:8px 12px;font-size:13px;color:#065f46;background:#ecfdf5;border:1px dashed #10b981;border-radius:8px;text-align:center;}' +
      '.ci-completed-hint a{color:#0369a1;margin-left:8px;}' +
      '@media (max-width:900px){.ci-bar{grid-template-columns:1fr;}.ci-bar-right{justify-content:flex-start;}}';
    var style = document.createElement('style');
    style.id = 'ci-bar-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // 主入口：扫描所有挂载点并初始化
  function init() {
    // 测试模式：?test_inbox=1 时注入一份测试数据（线上也保留，方便快速排查）
    try {
      if (location.search.indexOf('test_inbox=1') !== -1 && !readInbox()) {
        var hashTarget = (location.hash.replace('#','') === 'p6') ? 'p6' : 'p4';
        writeInbox({
          version: 1,
          source: 'select-workbench',
          target: hashTarget,
          targetName: hashTarget==='p4'?'图书内容提取':'图片文案生成',
          sentAt: new Date().toISOString(),
          cursor: 0,
          queue: [
            { isbn: '9787569942514', title: '《家庭教育》（测试）', top_cat: '社科', price: '49.8', source: '测试', status: 'pending' },
            { isbn: '9787544291200', title: '《岛上书店》（测试）', top_cat: '社科', price: '39.0', source: '测试', status: 'pending' },
            { isbn: '9787521700664', title: '《思考，快与慢》（测试）', top_cat: '社科', price: '88.0', source: '测试', status: 'pending' }
          ]
        });
      }
    } catch(e) {}

    var data = readInbox();
    if (!data) return;
    var mounts = document.querySelectorAll('[data-creative-inbox]');
    if (!mounts.length) return;
    mounts.forEach(function (mount) {
      var target = mount.dataset.creativeInbox || data.target;
      // 仅当 inbox 的 target 与挂载点声明一致时渲染
      if (data.target !== target) return;
      injectStyles();
      renderBar(mount, target, data);
      bindEvents(mount, target);
      // 自动填入当前游标
      fillCurrent(target, data.queue[data.cursor]);
    });
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // hashchange 时刷新（用户在主站内切 tab 时也能保证队列条同步）
  window.addEventListener('hashchange', function () {
    init();
  });

  // 暴露给主站调用（用户切换 hash 时主站可主动 refresh）
  window.CreativeInbox = {
    refresh: init,
    read: readInbox,
    clear: function () {
      clearInbox();
      document.querySelectorAll('[data-creative-inbox]').forEach(function (el) {
        el.innerHTML = '';
      });
    }
  };
})();
