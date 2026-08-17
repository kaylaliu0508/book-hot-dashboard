/**
 * 图图 · 图书行业智能助手 - 全站悬浮组件
 * 引入方式：<script src="/assets/tutu-chat.js"></script>
 * 在任何页面引入后，会在右下角注入悬浮按钮，点击展开全屏聊天窗口。
 * 跨页面持久化：对话历史保存在 sessionStorage（同标签页内切页面对话不丢失）
 */
(function(){
  // 防止重复注入
  if (window.__TUTU_CHAT_INJECTED__) return;
  window.__TUTU_CHAT_INJECTED__ = true;

  // 如果当前页面是 /ai/（独立营销助手页），不注入悬浮按钮（它自己有）
  // 检测方式：iframe 嵌入或 /ai/ 路径
  if (location.pathname === '/ai/' || location.pathname === '/ai/index.html') return;

  // 如果当前页面在 iframe 中（被父页面嵌入），不注入悬浮按钮
  // 因为父页面已经有全局图图按钮，避免重叠显示两个
  try {
    if (window.top !== window.self) return;
  } catch(e) {
    // 跨域 iframe 也直接退出
    return;
  }

  var API_BASE = window.location.origin;

  // ============ 注入样式 ============
  var STYLE = `
.tutu-fab{position:fixed;bottom:28px;right:28px;z-index:9998;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif}
.tutu-fab-btn{width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#E63946 0%,#C1374A 100%);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(230,57,70,.5);display:flex;align-items:center;justify-content:center;transition:all .3s cubic-bezier(.34,1.56,.64,1);animation:tutuFabPulse 3s ease-in-out infinite;position:relative}
@keyframes tutuFabPulse{0%{box-shadow:0 4px 20px rgba(230,57,70,.5),0 0 0 0 rgba(230,57,70,.4)}50%{box-shadow:0 4px 20px rgba(230,57,70,.5),0 0 0 14px rgba(230,57,70,0)}100%{box-shadow:0 4px 20px rgba(230,57,70,.5),0 0 0 0 rgba(230,57,70,0)}}
.tutu-fab-btn:hover{transform:scale(1.1)}
.tutu-fab-btn:active{transform:scale(.95)}
.tutu-fab-icon{font-size:26px;transition:all .3s;line-height:1}
.tutu-fab-badge{position:absolute;top:-4px;right:-4px;width:18px;height:18px;background:#FF3B30;border-radius:50%;border:2px solid white;font-size:10px;color:white;display:flex;align-items:center;justify-content:center;font-weight:700}
.tutu-fab-tip{position:absolute;right:74px;top:50%;transform:translateY(-50%);background:#1a1a2e;color:#fff;padding:7px 12px;border-radius:10px;font-size:12px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;font-weight:500}
.tutu-fab-tip::after{content:"";position:absolute;left:100%;top:50%;transform:translateY(-50%);border:6px solid transparent;border-left-color:#1a1a2e}
.tutu-fab:hover .tutu-fab-tip{opacity:1;transform:translateY(-50%) translateX(-4px)}

.tutu-chat{position:fixed;inset:0;width:100%;height:100%;background:#fff;display:flex;flex-direction:column;z-index:9999;overflow:hidden;transform:scale(.97) translateY(16px);opacity:0;pointer-events:none;transition:all .28s cubic-bezier(.34,1.56,.64,1);font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Helvetica Neue',sans-serif;color:#1A1A2E}
.tutu-chat.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}
.tutu-chat *{box-sizing:border-box}
.tutu-header{background:linear-gradient(135deg,#E63946 0%,#C1374A 100%);padding:14px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}
.tutu-avatar{width:42px;height:42px;background:rgba(255,255,255,.2);border-radius:50%;border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.tutu-info{flex:1}
.tutu-name{font-size:15px;font-weight:700;color:#fff}
.tutu-status{font-size:11px;color:rgba(255,255,255,.85);display:flex;align-items:center;gap:4px;margin-top:2px}
.tutu-status-dot{width:7px;height:7px;background:#4ADE80;border-radius:50%;animation:tutuStatusPulse 2s infinite}
@keyframes tutuStatusPulse{0%,100%{opacity:1}50%{opacity:.4}}
.tutu-actions{display:flex;gap:6px}
.tutu-act-btn{background:rgba(255,255,255,.15);border:0;border-radius:8px;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s;width:36px;height:36px;font-size:17px}
.tutu-act-btn:hover{background:rgba(255,255,255,.28)}
.tutu-cap{background:linear-gradient(90deg,#ECFDF5,#F5F3FF);border-bottom:1px solid #E5E7EB;padding:8px 14px;display:flex;align-items:center;gap:8px;flex-shrink:0;flex-wrap:wrap}
.tutu-cap-label{font-size:10px;color:#6B7280;font-weight:600;flex-shrink:0}
.tutu-cap-badge{padding:3px 9px;border-radius:100px;font-size:11px;font-weight:500;flex-shrink:0}
.tutu-cap-book{background:#ECFDF5;color:#059669;border:1px solid rgba(5,150,105,.25)}
.tutu-cap-mw{background:#F5F3FF;color:#7C3AED;border:1px solid rgba(124,58,237,.25)}
.tutu-quick{padding:10px 14px 8px;background:#FEECEE;border-bottom:1px solid rgba(230,57,70,.12);flex-shrink:0}
.tutu-quick-label{font-size:10px;color:#6B7280;margin-bottom:7px;font-weight:600}
.tutu-chips{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
.tutu-chips::-webkit-scrollbar{display:none}
.tutu-chip{padding:5px 11px;background:white;border-radius:100px;font-size:12px;cursor:pointer;white-space:nowrap;transition:all .2s;flex-shrink:0;border:1px solid rgba(5,150,105,.4);color:#059669}
.tutu-chip:hover{background:#059669;color:white}
.tutu-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:14px;scroll-behavior:smooth;background:#F7F8FC}
.tutu-msgs::-webkit-scrollbar{width:3px}
.tutu-msgs::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:3px}
.tutu-msg{display:flex;gap:9px;animation:tutuMsgIn .3s ease}
@keyframes tutuMsgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.tutu-msg.user{flex-direction:row-reverse}
.tutu-msg-av{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;margin-top:2px}
.tutu-msg.bot .tutu-msg-av{background:linear-gradient(135deg,#E63946,#C1374A)}
.tutu-msg.user .tutu-msg-av{background:linear-gradient(135deg,#2D3A8C,#4F64D8);font-size:11px;color:white;font-weight:700}
.tutu-msg-body{max-width:80%}
.tutu-bubble{padding:10px 13px;border-radius:16px;font-size:14px;line-height:1.65;word-break:break-word;color:#1A1A2E}
.tutu-msg.bot .tutu-bubble{background:#fff;border-radius:4px 16px 16px 16px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.tutu-msg.user .tutu-bubble{background:linear-gradient(135deg,#E63946,#C1374A);color:white;border-radius:16px 4px 16px 16px}
.tutu-bubble a{color:#E63946;text-decoration:underline}
.tutu-msg.user .tutu-bubble a{color:rgba(255,255,255,.95)}
.tutu-bubble strong{font-weight:600}
.tutu-bubble code{background:rgba(0,0,0,.06);padding:1px 5px;border-radius:4px;font-size:13px}
.tutu-msg.user .tutu-bubble code{background:rgba(255,255,255,.2)}
.tutu-msg-time{font-size:10px;color:#6B7280;margin-top:4px;padding:0 3px}
.tutu-msg.user .tutu-msg-time{text-align:right}
.tutu-typing{display:flex;align-items:center;gap:5px;padding:11px 13px;background:#fff;border-radius:4px 16px 16px 16px;width:fit-content;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.tutu-tdot{width:7px;height:7px;background:#6B7280;border-radius:50%;animation:tutuDot 1.2s infinite}
.tutu-tdot:nth-child(2){animation-delay:.2s}
.tutu-tdot:nth-child(3){animation-delay:.4s}
@keyframes tutuDot{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-5px);opacity:1}}
.tutu-input-area{border-top:1px solid #E5E7EB;padding:11px 14px;background:white;flex-shrink:0}
.tutu-input-row{display:flex;align-items:flex-end;gap:7px}
.tutu-input{flex:1;border:1.5px solid #E5E7EB;border-radius:12px;padding:9px 13px;font-size:14px;outline:none;resize:none;min-height:38px;max-height:110px;line-height:1.5;font-family:inherit;color:#1A1A2E;transition:border-color .2s;overflow-y:auto}
.tutu-input:focus{border-color:#E63946}
.tutu-input::placeholder{color:#B0B7C3}
.tutu-send{width:38px;height:38px;background:linear-gradient(135deg,#E63946,#C1374A);border:0;border-radius:11px;color:white;cursor:pointer;font-size:17px;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.tutu-send:hover:not(:disabled){transform:scale(1.08);box-shadow:0 4px 12px rgba(230,57,70,.4)}
.tutu-send:disabled{opacity:.5;cursor:not-allowed}
.tutu-input-hint{font-size:10px;color:#6B7280;margin-top:5px;text-align:center}
.tutu-welcome{background:linear-gradient(135deg,#FEECEE,#fff);border:1px solid rgba(230,57,70,.2);border-radius:14px;padding:14px}
.tutu-welcome-emoji{font-size:28px;margin-bottom:6px}
.tutu-welcome-title{font-size:14px;font-weight:700;color:#1A1A2E;margin-bottom:4px}
.tutu-welcome-desc{font-size:12px;color:#6B7280;line-height:1.6}
.tutu-w-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
.tutu-w-btn{display:flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid;border-radius:9px;cursor:pointer;font-size:12px;font-weight:500;text-align:left;transition:all .2s;background:#fff}
.tutu-w-btn:hover{transform:translateY(-1px);box-shadow:0 4px 8px rgba(0,0,0,.08)}
@media (max-width:480px){.tutu-fab{bottom:20px;right:16px}}
`;
  var styleEl = document.createElement('style');
  styleEl.id = 'tutu-chat-style';
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  // ============ 注入 DOM ============
  var HTML = ''
    + '<div class="tutu-fab" id="tutuFab">'
    +   '<button class="tutu-fab-btn" id="tutuFabBtn" type="button" aria-label="打开图图智能助手">'
    +     '<span class="tutu-fab-icon">📚</span>'
    +     '<span class="tutu-fab-badge" id="tutuFabBadge">1</span>'
    +   '</button>'
    +   '<span class="tutu-fab-tip">图图 · AI 助手随问随答</span>'
    + '</div>'
    + '<div class="tutu-chat" id="tutuChat">'
    +   '<div class="tutu-header">'
    +     '<div class="tutu-avatar">🐰</div>'
    +     '<div class="tutu-info">'
    +       '<div class="tutu-name">图图 · 图书行业智能助手</div>'
    +       '<div class="tutu-status"><span class="tutu-status-dot"></span>图书专属知识库 × 妙问 AI 双引擎</div>'
    +     '</div>'
    +     '<div class="tutu-actions">'
    +       '<button class="tutu-act-btn" id="tutuClearBtn" type="button" title="清空对话">🗑</button>'
    +       '<button class="tutu-act-btn" id="tutuCloseBtn" type="button" title="关闭" style="font-size:20px;font-weight:700;width:40px;height:40px">✕</button>'
    +     '</div>'
    +   '</div>'
    +   '<div class="tutu-cap">'
    +     '<span class="tutu-cap-label">能力：</span>'
    +     '<span class="tutu-cap-badge tutu-cap-book">📚 图书专属知识</span>'
    +     '<span class="tutu-cap-badge tutu-cap-book">🔥 爆品榜单</span>'
    +     '<span class="tutu-cap-badge tutu-cap-book">📋 能力开白</span>'
    +     '<span class="tutu-cap-badge tutu-cap-book">🚫 黑词赦免</span>'
    +     '<span class="tutu-cap-badge tutu-cap-mw">🔍 营销规则</span>'
    +     '<span class="tutu-cap-badge tutu-cap-mw">📺 视频号投放</span>'
    +   '</div>'
    +   '<div class="tutu-quick">'
    +     '<div class="tutu-quick-label">💡 快捷提问 · 点击直接发送</div>'
    +     '<div class="tutu-chips" id="tutuChips"></div>'
    +   '</div>'
    +   '<div class="tutu-msgs" id="tutuMsgs"></div>'
    +   '<div class="tutu-input-area">'
    +     '<div class="tutu-input-row">'
    +       '<textarea class="tutu-input" id="tutuInput" placeholder="问图书投放、审核、数据、创意... 都可以！" rows="1"></textarea>'
    +       '<button class="tutu-send" id="tutuSendBtn" type="button">➤</button>'
    +     '</div>'
    +     '<div class="tutu-input-hint">Enter 发送 · Shift+Enter 换行</div>'
    +   '</div>'
    + '</div>';

  function init() {
    var wrap = document.createElement('div');
    wrap.innerHTML = HTML;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    var fabBtn = document.getElementById('tutuFabBtn');
    var fabBadge = document.getElementById('tutuFabBadge');
    var fab = document.getElementById('tutuFab');
    var chat = document.getElementById('tutuChat');
    var msgs = document.getElementById('tutuMsgs');
    var input = document.getElementById('tutuInput');
    var sendBtn = document.getElementById('tutuSendBtn');
    var clearBtn = document.getElementById('tutuClearBtn');
    var closeBtn = document.getElementById('tutuCloseBtn');
    var chipsBox = document.getElementById('tutuChips');

    var QUICK_QUESTIONS = [
      ['🔥 本周爆品', '最新的图书热投榜单有什么爆品推荐？'],
      ['☀️ 暑期策略', '2026年暑期图书投放策略和时间节奏是什么？'],
      ['📋 能力开白', '图书行业有哪些产品能力可以申请开白？'],
      ['🚫 黑词赦免', '我的广告素材有个词被判为黑词了，如何申请黑词赦免？'],
      ['📚 开学季策略', '开学季图书投放策略和各品类选品建议是什么？'],
      ['✅ 审核被拒', '营销审核常见拒绝原因有哪些？如何催审复审？'],
      ['📺 视频号投放', '视频号原生广告有哪些新能力？怎么投放？'],
      ['🔑 营销密码', '图书行业营销密码是什么？如何从选品到爆量？'],
    ];
    QUICK_QUESTIONS.forEach(function(q){
      var c = document.createElement('div');
      c.className = 'tutu-chip';
      c.textContent = q[0];
      c.onclick = function(){ input.value = q[1]; sendMessage(); };
      chipsBox.appendChild(c);
    });

    var isOpen = false;
    var isLoading = false;
    var HISTORY_KEY = 'tutu_chat_history_v1';
    var conversationHistory = [];
    try {
      var saved = sessionStorage.getItem(HISTORY_KEY);
      if (saved) conversationHistory = JSON.parse(saved) || [];
    } catch(e){}

    function fmtTime(d){ return d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}); }
    function renderMd(text){
      return text
        .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
        .replace(/`([^`]+)`/g,'<code>$1</code>')
        .replace(/^#{1,3} (.*$)/gm,'<strong>$1</strong>')
        .replace(/^[-•] (.*$)/gm,'• $1')
        .replace(/^\d+\. (.*$)/gm,'• $1')
        .replace(/(https?:\/\/[^\s<\u3000-\u303F\uFF00-\uFFEF\u2000-\u206F]+)/g, function(url){
          url = url.replace(/[，。！？、；：""''）】》]+$/, '');
          return '<a href="'+url+'" target="_blank" rel="noopener">'+(url.length>50?url.substring(0,50)+'...':url)+'</a>';
        })
        .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
    }
    function escHtml(s){ return s.replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

    function addMsg(role, content, intentLabel){
      var div = document.createElement('div');
      div.className = 'tutu-msg ' + role;
      var av = role==='bot' ? '<div class="tutu-msg-av">🐰</div>' : '<div class="tutu-msg-av">商</div>';
      var badge = '';
      if (role==='bot' && intentLabel) {
        badge = '<div style="display:inline-block;padding:2px 8px;background:#ECFDF5;color:#059669;border-radius:100px;font-size:10px;margin-bottom:5px">'+escHtml(intentLabel)+'</div>';
      }
      div.innerHTML = av + '<div class="tutu-msg-body">' + badge + '<div class="tutu-bubble">' + renderMd(content) + '</div><div class="tutu-msg-time">'+fmtTime(new Date())+'</div></div>';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function showTyping(label){
      var div = document.createElement('div');
      div.className = 'tutu-msg bot'; div.id = 'tutuTyping';
      div.innerHTML = '<div class="tutu-msg-av">🐰</div><div class="tutu-msg-body"><div style="font-size:10px;color:#9CA3AF;margin-bottom:4px">'+escHtml(label||'思考中...')+'</div><div class="tutu-typing"><span class="tutu-tdot"></span><span class="tutu-tdot"></span><span class="tutu-tdot"></span></div></div>';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function removeTyping(){ var e = document.getElementById('tutuTyping'); if (e) e.remove(); }

    function renderWelcome(){
      msgs.innerHTML = '';
      var div = document.createElement('div');
      div.className = 'tutu-msg bot';
      div.innerHTML = ''
        + '<div class="tutu-msg-av">🐰</div>'
        + '<div class="tutu-msg-body">'
        +   '<div class="tutu-welcome">'
        +     '<div class="tutu-welcome-emoji">👋</div>'
        +     '<div class="tutu-welcome-title">嗨！我是图图，图书灵感中心的专属 AI 助手</div>'
        +     '<div class="tutu-welcome-desc">我融合了 <strong>图书行业知识库</strong> × <strong>妙问 AI 引擎</strong>，可以帮你解答选品、投放、审核、数据等所有图书营销问题 📚</div>'
        +     '<div class="tutu-w-grid">'
        +       '<div class="tutu-w-btn" data-q="图书专属百宝箱有哪些功能？审核规则、链路、开学季策略有哪些？" style="background:#ECFDF5;border-color:rgba(5,150,105,.2);color:#065F46">📚 百宝箱规则速查</div>'
        +       '<div class="tutu-w-btn" data-q="最新的图书热投榜单有什么爆品推荐？本周TOP8是什么？" style="background:#FFF7ED;border-color:rgba(245,158,11,.2);color:#92400E">🔥 本周爆品榜单</div>'
        +       '<div class="tutu-w-btn" data-q="图书行业有哪些产品能力可以申请开白？怎么提报？" style="background:#F5F3FF;border-color:rgba(124,58,237,.2);color:#5B21B6">📋 能力开白申请</div>'
        +       '<div class="tutu-w-btn" data-q="图书行业营销密码是什么？如何从选品到爆量？" style="background:#FFF0F6;border-color:rgba(236,72,153,.2);color:#9D174D">🔑 营销密码解锁</div>'
        +     '</div>'
        +   '</div>'
        +   '<div class="tutu-msg-time">'+fmtTime(new Date())+'</div>'
        + '</div>';
      msgs.appendChild(div);
      // 绑定 welcome 卡片按钮
      div.querySelectorAll('.tutu-w-btn').forEach(function(btn){
        btn.onclick = function(){ input.value = btn.getAttribute('data-q'); sendMessage(); };
      });
    }

    function rebuildFromHistory(){
      msgs.innerHTML = '';
      if (!conversationHistory.length) {
        renderWelcome();
        return;
      }
      conversationHistory.forEach(function(m){
        addMsg(m.role==='assistant'?'bot':'user', m.content);
      });
    }
    rebuildFromHistory();

    function persist(){
      try{ sessionStorage.setItem(HISTORY_KEY, JSON.stringify(conversationHistory.slice(-30))); }catch(e){}
    }

    function toggleChat(){
      isOpen = !isOpen;
      if (isOpen) {
        chat.classList.add('open');
        fab.style.display = 'none';
        if (fabBadge) fabBadge.style.display = 'none';
        setTimeout(function(){ try{ input.focus(); }catch(e){} }, 400);
      } else {
        chat.classList.remove('open');
        fab.style.display = '';
      }
    }

    async function sendMessage(){
      var text = input.value.trim();
      if (!text || isLoading) return;
      input.value = '';
      input.style.height = 'auto';
      addMsg('user', text);
      conversationHistory.push({role:'user', content:text});
      persist();
      isLoading = true;
      sendBtn.disabled = true;

      var hint = '正在思考...';
      if (/消耗|数据|报表|roi|花费/i.test(text)) hint='📊 正在查询数据...';
      else if (/诊断|不起量|掉量/i.test(text)) hint='🔬 正在进行投放诊断...';
      else if (/创意|灵感|案例/i.test(text)) hint='🎨 正在寻找优秀创意...';
      else if (/审核|预审|过审/i.test(text)) hint='✅ 正在查询审核规则...';
      else if (/图书|开学|百宝箱|选品|暑期/i.test(text)) hint='📚 检索图书专属知识...';
      showTyping(hint);

      try {
        var chatHeaders = {'Content-Type':'application/json'};
        try { var ic = sessionStorage.getItem('bhd_invite_code_v2'); if (ic) chatHeaders['X-Invite-Code'] = ic; } catch(_){}
        var res = await fetch(API_BASE+'/api/chat', {
          method:'POST',
          headers:chatHeaders,
          body: JSON.stringify({messages: conversationHistory.slice(-10)}),
        });
        if (res.status === 403) { try { sessionStorage.removeItem('bhd_invite_code_v2'); } catch(_){} location.reload(); return; }
        var data = await res.json();
        removeTyping();
        var reply = data.content || data.detail || '抱歉，暂时没有收到回复，请稍后再试～';
        addMsg('bot', reply, data.intent_label);
        conversationHistory.push({role:'assistant', content:reply});
        persist();
      } catch(err) {
        removeTyping();
        addMsg('bot', '😅 连接出了点问题，请稍后再试～\n\n如需帮助，请联系您的腾讯营销对接运营同学。', '⚠️ 连接异常');
      }
      isLoading = false;
      sendBtn.disabled = false;
    }

    function clearChat(){
      if (!confirm('确认清空对话？')) return;
      conversationHistory = [];
      persist();
      renderWelcome();
    }

    fabBtn.onclick = toggleChat;
    closeBtn.onclick = toggleChat;
    clearBtn.onclick = clearChat;
    sendBtn.onclick = sendMessage;
    input.addEventListener('keydown', function(e){
      if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    input.addEventListener('input', function(){
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 110) + 'px';
    });

    // 暴露给页面调用：让卡片/按钮可通过 window.tutuAsk('xxx问题') 直接打开并发问
    window.tutuOpen = function(){ if (!isOpen) toggleChat(); };
    window.tutuAsk = function(q){
      if (!isOpen) toggleChat();
      setTimeout(function(){
        input.value = q;
        sendMessage();
      }, isOpen ? 50 : 450);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
