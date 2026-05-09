/*!
 * tracker.js — 图书创意灵感中心 埋点 SDK
 * 上报 4 个 tab 的 PV/UV/停留/按钮点击/功能使用
 * 上报路径默认 /api/track（同源），可通过 window.__TRACKER_ENDPOINT 覆盖
 */
(function (w, d) {
  if (w.__TRACKER_LOADED__) return;
  w.__TRACKER_LOADED__ = true;

  // ============ 配置 ============
  var ENDPOINT = w.__TRACKER_ENDPOINT || '/api/track';
  var UID_KEY = 'bk_uid';
  var SID_KEY = 'bk_sid';
  var SID_TIME_KEY = 'bk_sid_t';
  var SESSION_TTL = 30 * 60 * 1000; // 30 分钟无活动失效
  var SAMPLE_RATE = 1.0; // 1.0 = 全量

  // ============ 工具 ============
  function rid() {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 10)
    );
  }
  function getUid() {
    var v = '';
    try {
      v = localStorage.getItem(UID_KEY) || '';
    } catch (e) {}
    if (!v) {
      v = 'u_' + rid();
      try {
        localStorage.setItem(UID_KEY, v);
      } catch (e) {}
    }
    return v;
  }
  function getSid() {
    var now = Date.now();
    var sid = '',
      lastT = 0;
    try {
      sid = sessionStorage.getItem(SID_KEY) || '';
      lastT = +sessionStorage.getItem(SID_TIME_KEY) || 0;
    } catch (e) {}
    if (!sid || now - lastT > SESSION_TTL) {
      sid = 's_' + rid();
    }
    try {
      sessionStorage.setItem(SID_KEY, sid);
      sessionStorage.setItem(SID_TIME_KEY, String(now));
    } catch (e) {}
    return sid;
  }
  function deviceType() {
    var ua = navigator.userAgent || '';
    if (/iPad|Tablet/i.test(ua)) return 'tablet';
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'mobile';
    return 'desktop';
  }
  function commonFields() {
    return {
      ts: Date.now(),
      uid: getUid(),
      sid: getSid(),
      ua: navigator.userAgent || '',
      ref: d.referrer || '',
      url: location.href,
      vw: w.innerWidth || 0,
      vh: w.innerHeight || 0,
      dpr: w.devicePixelRatio || 1,
      lang: navigator.language || '',
      dev: deviceType(),
    };
  }

  // ============ 上报 ============
  function send(payload) {
    if (Math.random() > SAMPLE_RATE) return;
    var body = JSON.stringify(payload);
    try {
      // sendBeacon 在卸载场景下最稳
      // 用 text/plain 避免触发 CORS preflight（application/json 是非简单请求会触发 OPTIONS，sendBeacon 不支持 preflight）
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: 'text/plain;charset=UTF-8' });
        if (navigator.sendBeacon(ENDPOINT, blob)) return;
      }
    } catch (e) {}
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        // text/plain 同样避免 preflight；Worker 端按文本解析 JSON
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: body,
        keepalive: true,
        credentials: 'omit',
        mode: 'cors',
      }).catch(function () {});
    } catch (e) {}
  }

  function track(type, tab, name, value, meta) {
    var p = commonFields();
    p.type = type;
    p.tab = tab || w.__CURRENT_TAB__ || 'unknown';
    if (name) p.name = name;
    if (value !== undefined && value !== null) p.value = value;
    if (meta) p.meta = meta;
    send(p);
  }

  // ============ 停留时长（按 tab） ============
  var stayCtx = { tab: null, startTs: 0, activeMs: 0, hidden: false };
  function startStay(tab) {
    flushStay();
    stayCtx.tab = tab;
    stayCtx.startTs = Date.now();
    stayCtx.activeMs = 0;
    stayCtx.hidden = d.hidden;
  }
  function tickStay() {
    if (stayCtx.tab && !stayCtx.hidden) {
      var now = Date.now();
      stayCtx.activeMs += now - stayCtx.startTs;
      stayCtx.startTs = now;
    }
  }
  function flushStay() {
    if (!stayCtx.tab) return;
    tickStay();
    if (stayCtx.activeMs > 500) {
      track('stay', stayCtx.tab, null, Math.round(stayCtx.activeMs), null);
    }
    stayCtx.tab = null;
    stayCtx.activeMs = 0;
  }
  d.addEventListener('visibilitychange', function () {
    if (d.hidden) {
      tickStay();
      stayCtx.hidden = true;
    } else {
      stayCtx.hidden = false;
      stayCtx.startTs = Date.now();
    }
  });
  w.addEventListener('pagehide', flushStay);
  w.addEventListener('beforeunload', flushStay);

  // ============ 公共 API ============
  var T = {
    setTab: function (tab) {
      w.__CURRENT_TAB__ = tab;
      track('tab_view', tab);
      startStay(tab);
    },
    pv: function (tab) {
      w.__CURRENT_TAB__ = tab || w.__CURRENT_TAB__;
      track('pv', w.__CURRENT_TAB__);
      startStay(w.__CURRENT_TAB__);
    },
    click: function (name, meta, tab) {
      track('click', tab || w.__CURRENT_TAB__, name, null, meta);
    },
    feature: function (name, meta, value, tab) {
      track('feature', tab || w.__CURRENT_TAB__, name, value, meta);
    },
    error: function (msg, meta) {
      track('error', w.__CURRENT_TAB__, msg, null, meta);
    },
  };
  w.tracker = T;

  // ============ 全局错误 ============
  w.addEventListener('error', function (ev) {
    try {
      track('error', w.__CURRENT_TAB__, (ev.message || 'js_error').slice(0, 200), null, {
        src: ev.filename,
        ln: ev.lineno,
      });
    } catch (e) {}
  });

  // ============ 自动按钮埋点：data-track 属性 ============
  // 用法：<button data-track="isbn_collect_run">…</button>
  d.addEventListener(
    'click',
    function (ev) {
      var el = ev.target;
      while (el && el !== d.body) {
        if (el.getAttribute && el.getAttribute('data-track')) {
          var name = el.getAttribute('data-track');
          var tab = el.getAttribute('data-track-tab') || w.__CURRENT_TAB__;
          track('click', tab, name, null, null);
          return;
        }
        el = el.parentNode;
      }
    },
    true
  );
})(window, document);
