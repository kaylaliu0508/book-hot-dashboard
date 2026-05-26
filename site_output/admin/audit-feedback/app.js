// AI 预审反馈管理后台 - 逻辑
var TOKEN_KEY='audit_admin_token_v1';
var ADMIN_TOKEN='';
var currentList=[];
var currentItem=null;
var poolMode=false;

function $(id){return document.getElementById(id);}
function showToast(msg){var t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},1800);}
function escapeHtml(s){if(s==null)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function fmtTime(ts){if(!ts)return'';var d=new Date(ts);var p=function(n){return n<10?'0'+n:n;};return (d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());}

function init(){
  ADMIN_TOKEN=localStorage.getItem(TOKEN_KEY)||'';
  if(!ADMIN_TOKEN){$('gate').style.display='flex';return;}
  $('main').style.display='block';
  loadList();
}

function saveToken(){
  var v=$('tokenInput').value.trim();
  if(!v){alert('请输入 Token');return;}
  ADMIN_TOKEN=v;localStorage.setItem(TOKEN_KEY,v);
  $('gate').style.display='none';
  $('main').style.display='block';
  loadList();
}

function logout(){
  if(!confirm('确认登出？'))return;
  localStorage.removeItem(TOKEN_KEY);
  location.reload();
}

function api(method,url,body){
  var opt={method:method,headers:{'X-Admin-Token':ADMIN_TOKEN}};
  if(body){opt.headers['Content-Type']='application/json';opt.body=JSON.stringify(body);}
  return fetch(url,opt).then(function(r){
    if(r.status===401){alert('Token 失效，请重新登录');logout();return null;}
    return r.json();
  }).catch(function(){return null;});
}

function loadList(){
  poolMode=false;
  var pb=$('poolBtn'); if(pb) pb.textContent='📚 查看 AI 学习池';
  $('rightPanel').querySelector('h2').textContent='详情';
  $('detailBody').innerHTML='<div class="empty">从左侧选择一条反馈</div>';
  var status=$('filterStatus').value;
  var et=$('filterErrorType').value;
  var url='/api/audit_feedback?op=list&size=200';
  if(status)url+='&status='+encodeURIComponent(status);
  if(et)url+='&error_type='+encodeURIComponent(et);
  $('listBody').innerHTML='<div class="empty">加载中...</div>';
  api('GET',url).then(function(j){
    if(!j||!j.ok){$('listBody').innerHTML='<div class="empty">加载失败</div>';return;}
    currentList=j.items||[];
    renderStats();
    renderList();
  });
}

function renderStats(){
  var s={total:currentList.length,fp:0,fn:0,overall:0,adopted:0};
  currentList.forEach(function(it){
    if(it.error_type==='false_positive')s.fp++;
    else if(it.error_type==='false_negative')s.fn++;
    if(it.feedback_type==='overall')s.overall++;
    if(it.status==='adopted')s.adopted++;
  });
  $('statBar').innerHTML=
    '<div class="stat"><div class="v">'+s.total+'</div><div class="l">当前过滤总数</div></div>'+
    '<div class="stat"><div class="v" style="color:#3fb950">'+s.fp+'</div><div class="l">误杀</div></div>'+
    '<div class="stat"><div class="v" style="color:#f85149">'+s.fn+'</div><div class="l">漏判</div></div>'+
    '<div class="stat"><div class="v" style="color:#3fb950">'+s.adopted+'</div><div class="l">已采纳</div></div>';
  $('listCount').textContent='（共 '+currentList.length+' 条）';
}

function renderList(){
  var lb=$('listBody');
  if(!currentList.length){lb.innerHTML='<div class="empty">暂无数据</div>';return;}
  lb.innerHTML=currentList.map(function(it,i){
    var etag=it.error_type==='false_positive'?'<span class="tag fp">误杀</span>':
             it.error_type==='false_negative'?'<span class="tag fn">漏判</span>':
             it.error_type==='bad_fix'?'<span class="tag bf">建议错</span>':'';
    var sttag=it.status==='adopted'?'<span class="tag adopted">已采纳</span>':
              it.status==='rejected'?'<span class="tag rejected">已拒绝</span>':
              '<span class="tag new">待处理</span>';
    var ftag=it.feedback_type==='overall'?'<span class="tag overall">整体</span>':'';
    var v=it.verdict_user==='should_pass'?'应通过':it.verdict_user==='should_warn'?'应警告':it.verdict_user==='should_reject'?'应拒审':'';
    var vtag=v?'<span class="tag">'+v+'</span>':'';
    var hitTxt=(it.hits||[]).slice(0,2).map(function(h){return '['+(h.cat||'')+']「'+(h.matched||'')+'」';}).join(' ');
    return '<div class="item" onclick="selectItem('+i+')" data-idx="'+i+'">'+
      '<div class="meta">'+sttag+etag+ftag+vtag+'<span style="margin-left:auto">'+fmtTime(it.ts)+'</span></div>'+
      '<div class="text">'+escapeHtml((it.text||'').slice(0,140))+'</div>'+
      (hitTxt?'<div class="note">命中 '+escapeHtml(hitTxt)+'</div>':'')+
      (it.user_note?'<div class="note">💬 '+escapeHtml(it.user_note)+'</div>':'')+
    '</div>';
  }).join('');
}

function selectItem(i){
  document.querySelectorAll('.item').forEach(function(el){el.classList.remove('active');});
  var el=document.querySelector('.item[data-idx="'+i+'"]');
  if(el)el.classList.add('active');
  currentItem=currentList[i];
  renderDetail();
}

function renderDetail(){
  var it=currentItem;
  if(!it){$('detailBody').innerHTML='<div class="empty">从左侧选择一条反馈</div>';return;}
  var v=it.verdict_user==='should_pass'?'通过':it.verdict_user==='should_warn'?'警告':it.verdict_user==='should_reject'?'拒审':'-';
  var et=it.error_type==='false_positive'?'误杀（不该报）':it.error_type==='false_negative'?'漏判（该报没报）':it.error_type==='bad_fix'?'建议不合理':'-';
  var ai=it.ai_recheck?'是':'否';
  var hitHtml=(it.hits||[]).map(function(h){
    return '<span class="hit" title="'+escapeHtml(h.desc||'')+'">['+escapeHtml(h.cat||'')+'] '+escapeHtml(h.matched||'')+(h.level==='reject'?' · 拒审':' · 警告')+'</span>';
  }).join('');
  var actions='';
  if(it.status==='new'){
    actions='<div class="actions">'+
      '<div style="font-size:11.5px;color:#8b949e;font-weight:600">📝 审核备注（选填，会写入学习池）</div>'+
      '<textarea id="adminNote" placeholder="一句话说明为什么这么判，将作为 AI 学习池的 reason 字段...">'+escapeHtml(it.user_note||'')+'</textarea>'+
      '<div class="actions-row">'+
      '<button class="btn-adopt" onclick="doAdopt()">✅ 采纳并加入学习池</button>'+
      '<button class="btn-reject" onclick="doReject()">❌ 拒绝</button>'+
      '</div>'+
      '<div style="font-size:10px;color:#484f58;margin-top:6px">采纳后：本案例会自动写入 AI 复审学习池，下次相同/同义文案会被正确判定</div>'+
      '</div>';
  } else {
    var st=it.status==='adopted'?'<span class="tag adopted">已采纳</span>':'<span class="tag rejected">已拒绝</span>';
    actions='<div class="actions" style="padding-top:12px;border-top:1px solid #21262d;margin-top:14px">'+
      '<div style="font-size:11.5px;color:#8b949e">处理状态：'+st+'</div>'+
      (it.admin_note?'<div style="font-size:11px;color:#c9d1d9;margin-top:6px;padding:6px 8px;background:#0d1117;border-radius:5px">备注：'+escapeHtml(it.admin_note)+'</div>':'')+
      '<div class="actions-row"><button class="btn-reject" onclick="doRevert()">↩ 重新标为待处理</button></div>'+
      '</div>';
  }
  $('detailTitle').textContent='详情 · 第 '+(it.text_status||'?')+' 状态';
  $('detailBody').innerHTML='<div class="detail">'+
    '<div class="field"><div class="l">📄 原文</div><div class="full-text">'+escapeHtml(it.text||'')+'</div></div>'+
    '<div class="field"><div class="l">⚙ 系统当前判定 / 用户期望判定</div><div class="v">'+escapeHtml(it.text_status||'-')+' → <strong style="color:#58a6ff">'+v+'</strong></div></div>'+
    '<div class="field"><div class="l">🚩 错误类型</div><div class="v">'+et+'</div></div>'+
    (hitHtml?'<div class="field"><div class="l">🔥 命中规则</div><div class="hits">'+hitHtml+'</div></div>':'')+
    (it.user_note?'<div class="field"><div class="l">💬 用户备注</div><div class="v">'+escapeHtml(it.user_note)+'</div></div>':'')+
    '<div class="field"><div class="l">📌 元信息</div><div class="v" style="font-size:10.5px;color:#8b949e">规则版本：'+escapeHtml(it.rule_version||'-')+' · AI 复审：'+ai+' · 提交时间：'+fmtTime(it.ts)+' · 反馈类型：'+(it.feedback_type==='overall'?'整体':'命中级')+'</div></div>'+
    actions+
  '</div>';
}

function doAdopt(){
  if(!currentItem)return;
  var note=$('adminNote')?$('adminNote').value.trim():'';
  api('PATCH','/api/audit_feedback',{id:currentItem.id,date:currentItem.date,status:'adopted',admin_note:note}).then(function(j){
    if(j&&j.ok){
      showToast('✅ 已采纳，AI 学习池已更新');
      currentItem=j.item;
      // 更新列表中的条目
      var idx=currentList.findIndex(function(x){return x.id===currentItem.id;});
      if(idx>=0)currentList[idx]=currentItem;
      renderStats();renderList();renderDetail();
    } else {
      showToast('采纳失败，请重试');
    }
  });
}

function doReject(){
  if(!currentItem)return;
  if(!confirm('确认拒绝这条反馈？拒绝后不会进入学习池。'))return;
  var note=$('adminNote')?$('adminNote').value.trim():'';
  api('PATCH','/api/audit_feedback',{id:currentItem.id,date:currentItem.date,status:'rejected',admin_note:note}).then(function(j){
    if(j&&j.ok){
      showToast('已拒绝');
      currentItem=j.item;
      var idx=currentList.findIndex(function(x){return x.id===currentItem.id;});
      if(idx>=0)currentList[idx]=currentItem;
      renderStats();renderList();renderDetail();
    } else {
      showToast('操作失败');
    }
  });
}

function doRevert(){
  if(!currentItem)return;
  api('PATCH','/api/audit_feedback',{id:currentItem.id,date:currentItem.date,status:'new',admin_note:''}).then(function(j){
    if(j&&j.ok){
      showToast('已重置为待处理');
      currentItem=j.item;
      var idx=currentList.findIndex(function(x){return x.id===currentItem.id;});
      if(idx>=0)currentList[idx]=currentItem;
      renderStats();renderList();renderDetail();
    }
  });
}

function togglePool(){
  if(poolMode){ loadList(); var pb=$('poolBtn'); if(pb) pb.textContent='📚 查看 AI 学习池'; return; }
  poolMode=true;
  var pb=$('poolBtn'); if(pb) pb.textContent='📥 返回反馈列表';
  $('rightPanel').querySelector('h2').textContent='📚 AI 学习池';
  $('detailBody').innerHTML='<div class="empty">加载学习池中...</div>';
  fetch('/api/audit_learned_cases?limit=50').then(function(r){return r.json();}).then(function(j){
    var cases=(j&&j.cases)||[];
    if(!cases.length){$('detailBody').innerHTML='<div class="empty">学习池为空。采纳一些反馈后这里会出现样本。</div>';return;}
    var V={should_pass:'通过',should_warn:'警告',should_reject:'拒审'};
    var T={false_positive:'误杀',false_negative:'漏判',bad_fix:'建议错'};
    var html=cases.map(function(c){
      return '<div class="pool-item">'+
        '<div class="pool-text">'+escapeHtml((c.text||'').slice(0,200))+'</div>'+
        '<div class="pool-meta">正确判定：<strong style="color:#3fb950">'+(V[c.verdict_user]||'-')+'</strong>'+
        ' · 类型：'+(T[c.error_type]||'-')+
        (c.reason?' · 原因：'+escapeHtml(c.reason):'')+'</div>'+
        '</div>';
    }).join('');
    $('detailBody').innerHTML=
      '<div style="padding:10px 14px;background:#0d1117;border-bottom:1px solid #21262d;font-size:11px;color:#8b949e">这些样本会被自动注入到 AI 复审 prompt 中（最近 20 条）。当前学习池共 '+cases.length+' 条。</div>'+
      html;
  });
}

init();
