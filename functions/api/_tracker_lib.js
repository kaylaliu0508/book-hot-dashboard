/**
 * 埋点共享逻辑（Pages Functions 版本，复用之前 Worker 同款 KV）
 * 必须在 Pages 项目里绑定 KV：变量名 TRACKER_AGG，namespace id = 2360767d707143e394cf90766faf418c
 */

// 注：新增 tab 时务必同步更新 site_output/stats/index.html 的 TAB_LABELS / TAB_COLORS
// 已知 tab：原始 4 个 + 2026-05 起新增的 select_hub / ad_copy / ai_assistant
export const VALID_TABS = new Set([
  'book_extract',  // 📚 图书内容提取
  'script_gen',    // 🎬 一键生成口播脚本
  'ai_audit',      // 🛡️ AI预审
  'summer',        // 📅 暑期专栏
  'select_hub',    // 🛒 图书选品台（NEW）
  'ad_copy',       // 📐 图片文案生成（NEW）
  'ai_assistant',  // 🤖 AI营销助手（NEW）
]);
export const VALID_TYPES = new Set(['pv', 'tab_view', 'click', 'feature', 'stay', 'error']);
const UV_DAILY_CAP = 50000;

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};

export function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS, ...extra },
  });
}
export function preflight() {
  return new Response(null, { status: 204, headers: CORS });
}
export function dayKey(ts) {
  const d = new Date(ts || Date.now());
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
}

// =================== 写入 KV ===================
// KV 缺失时的告警节流：每 5 分钟 console 一次（CF Functions 没有持久内存，
// 这里靠模块级变量在单实例内做轻量节流，足够让 Real-time Logs 看到红字告警）
let _kvMissingLogTs = 0;
function logKvMissingOnce(ctx) {
  const now = Date.now();
  if (now - _kvMissingLogTs < 5 * 60 * 1000) return;
  _kvMissingLogTs = now;
  // 在 Cloudflare Pages → Functions → Real-time Logs 里能直接看到这条
  console.error(
    '[tracker] FATAL: env.TRACKER_AGG KV binding is MISSING. ' +
    'All track events are being SILENTLY DROPPED. ' +
    'Check Cloudflare Dashboard → Pages → book-hot-dashboard → Settings → Bindings, ' +
    'or verify wrangler.toml at repo root is being applied. ctx=' + (ctx || 'unknown')
  );
}

export async function persistEvent(env, body) {
  const KV = env.TRACKER_AGG;
  if (!KV) {
    logKvMissingOnce('persistEvent');
    return { ok: 0, err: 'no_kv' };
  }
  const ttl = (parseInt(env.RETENTION_DAYS || '90', 10) || 90) * 86400;
  const opt = { expirationTtl: ttl };

  const tab = body.tab;
  const type = body.type;
  if (!VALID_TABS.has(tab)) return { ok: 0, err: 'bad_tab' };
  if (!VALID_TYPES.has(type)) return { ok: 0, err: 'bad_type' };

  const ts = +body.ts || Date.now();
  const date = dayKey(ts);
  const uid = String(body.uid || '').slice(0, 64);
  const sid = String(body.sid || '').slice(0, 64);

  // 索引日期
  await addDateIndex(KV, date, ttl);

  // PV
  if (type === 'pv' || type === 'tab_view') {
    await incr(KV, `pv:${tab}:${date}`, 1, opt);
    await incr(KV, `pv:${tab}:total`, 1, opt);
    if (uid) {
      await addToSet(KV, `uv:${tab}:${date}`, uid, UV_DAILY_CAP, opt);
      await addToSet(KV, `uv:${tab}:total`, uid, UV_DAILY_CAP * 5, opt);
    }
    const dev = (body.dev || 'desktop').toLowerCase();
    await mergeMap(KV, `device:${tab}:${date}`, dev, 1, opt);
    const refHost = parseHost(body.ref);
    await mergeMap(KV, `ref:${tab}:${date}`, refHost || 'direct', 1, opt);

    if (sid) {
      const bk = `bounce:${tab}:${date}`;
      const cur = (await KV.get(bk, 'json')) || { sessions: 0, bounced: 0, sids: [] };
      if (!cur.sids.includes(sid)) {
        cur.sessions += 1;
        if (cur.sids.length < UV_DAILY_CAP) cur.sids.push(sid);
        await KV.put(bk, JSON.stringify(cur), opt);
      }
    }
  }

  if (type === 'click' || type === 'feature') {
    const name = String(body.name || 'unknown').slice(0, 64);
    await incr(KV, `evt:${tab}:${name}:${date}`, 1, opt);
    await incr(KV, `evt:${tab}:${name}:total`, 1, opt);
    if (sid) {
      const bk = `bounce:${tab}:${date}`;
      const cur = await KV.get(bk, 'json');
      if (cur && cur.sids && cur.sids.includes(sid)) {
        cur.activeSids = cur.activeSids || [];
        if (!cur.activeSids.includes(sid)) cur.activeSids.push(sid);
        await KV.put(bk, JSON.stringify(cur), opt);
      }
    }

    // 📚 ISBN 专项统计（分来源独立统计）
    // book_extract/isbn_query             → isbn:book_extract:{date}
    // select_hub/select_pool_toggle(add)  → isbn:select_hub:{date}
    // ad_copy/isbn_query                  → isbn:ad_copy:{date}
    const isbnCollectTabs = {
      book_extract: 'isbn_query',
      select_hub: 'select_pool_toggle',
      ad_copy: 'isbn_query',
    };
    const isbnEventName = isbnCollectTabs[tab];
    if (isbnEventName && name === isbnEventName && body.meta && body.meta.isbn) {
      const action = body.meta.action || '';
      if (tab === 'select_hub' && action !== 'add') {
        // remove 不计入 ISBN 统计
      } else {
        const isbn = String(body.meta.isbn).slice(0, 20).replace(/[^0-9xX]/g, '');
        if (isbn.length >= 10) {
          const title = body.meta.title ? String(body.meta.title).slice(0, 80) : '';
          const dayKeyName = `isbn:${tab}:${date}`;
          const dayMap = (await KV.get(dayKeyName, 'json')) || {};
          if (!dayMap[isbn]) dayMap[isbn] = { count: 0, title: '', lastTs: 0 };
          dayMap[isbn].count += 1;
          dayMap[isbn].lastTs = ts;
          if (title) dayMap[isbn].title = title;
          await KV.put(dayKeyName, JSON.stringify(dayMap), opt);
        }
      }
    }
  }

  if (type === 'stay') {
    const ms = Math.max(0, Math.min(+body.value || 0, 6 * 60 * 60 * 1000));
    if (ms > 0) {
      const sk = `stay:${tab}:${date}`;
      const cur = (await KV.get(sk, 'json')) || { count: 0, sumMs: 0 };
      cur.count += 1;
      cur.sumMs += ms;
      await KV.put(sk, JSON.stringify(cur), opt);
      if (sid && ms < 10 * 1000) {
        const bk = `bounce:${tab}:${date}`;
        const cur2 = await KV.get(bk, 'json');
        if (cur2 && cur2.sids && cur2.sids.includes(sid)) {
          cur2.bouncedSids = cur2.bouncedSids || [];
          if (!cur2.bouncedSids.includes(sid)) {
            cur2.bouncedSids.push(sid);
            cur2.bounced = (cur2.bounced || 0) + 1;
            await KV.put(bk, JSON.stringify(cur2), opt);
          }
        }
      }
    }
  }

  return { ok: 1 };
}

async function incr(KV, key, delta, opt) {
  const cur = parseInt((await KV.get(key)) || '0', 10) || 0;
  await KV.put(key, String(cur + delta), opt);
}
async function addToSet(KV, key, member, cap, opt) {
  const arr = (await KV.get(key, 'json')) || [];
  if (arr.includes(member)) return;
  if (arr.length >= cap) return;
  arr.push(member);
  await KV.put(key, JSON.stringify(arr), opt);
}
async function mergeMap(KV, key, field, delta, opt) {
  const m = (await KV.get(key, 'json')) || {};
  m[field] = (m[field] || 0) + delta;
  await KV.put(key, JSON.stringify(m), opt);
}
async function addDateIndex(KV, date, ttl) {
  const arr = (await KV.get('index:dates', 'json')) || [];
  if (arr.includes(date)) return;
  arr.push(date);
  if (arr.length > 400) arr.shift();
  await KV.put('index:dates', JSON.stringify(arr), { expirationTtl: ttl });
}
function parseHost(u) {
  if (!u) return '';
  try { return new URL(u).host; } catch { return ''; }
}

// =================== 查询 KV ===================
export async function aggregateStats(env, range, tabFilter) {
  const KV = env.TRACKER_AGG;
  if (!KV) {
    logKvMissingOnce('aggregateStats');
    return { error: 'no_kv' };
  }

  const days = ({ '1d': 1, '7d': 7, '14d': 14, '30d': 30, '90d': 90 })[range] || 7;
  const today = new Date();
  const dateList = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    dateList.push(dayKey(d.getTime()));
  }

  const tabs = tabFilter === 'all' ? Array.from(VALID_TABS) : [tabFilter];
  const result = { range, from: dateList[0], to: dateList[dateList.length - 1], tabs: {} };

  // 性能优化（2026-06-14）：原先 7 tabs × N 天 × 6 KV.get 全串行，30 天必超时（CF Workers 100s 上限）
  // 改成：每个 tab 内部所有日 × 6 key 都并发拉，tabs 之间也并发
  await Promise.all(tabs.map(async (tab) => {
    const tabAgg = { pv: 0, uv: 0, stayAvgSec: 0, bounceRate: 0, events: {}, devices: {}, referrers: {}, trend: [] };
    const uvSet = new Set();
    let staySumMs = 0, stayCount = 0, sessSum = 0, bouncedSum = 0;

    // 每个 date 并发拉 6 个 key
    const perDay = await Promise.all(dateList.map(async (date) => {
      const [pvRaw, dayUvArr, stayObj, dev, ref, bn] = await Promise.all([
        KV.get(`pv:${tab}:${date}`),
        KV.get(`uv:${tab}:${date}`, 'json'),
        KV.get(`stay:${tab}:${date}`, 'json'),
        KV.get(`device:${tab}:${date}`, 'json'),
        KV.get(`ref:${tab}:${date}`, 'json'),
        KV.get(`bounce:${tab}:${date}`, 'json'),
      ]);
      return { date, pv: parseInt(pvRaw || '0', 10) || 0, dayUvArr: dayUvArr || [], stayObj, dev: dev || {}, ref: ref || {}, bn };
    }));

    for (const d of perDay) {
      d.dayUvArr.forEach((u) => uvSet.add(u));
      tabAgg.trend.push({ date: d.date, pv: d.pv, uv: d.dayUvArr.length });
      if (d.stayObj) { staySumMs += d.stayObj.sumMs || 0; stayCount += d.stayObj.count || 0; }
      Object.keys(d.dev).forEach((k) => (tabAgg.devices[k] = (tabAgg.devices[k] || 0) + d.dev[k]));
      Object.keys(d.ref).forEach((k) => (tabAgg.referrers[k] = (tabAgg.referrers[k] || 0) + d.ref[k]));
      if (d.bn) { sessSum += d.bn.sessions || 0; bouncedSum += d.bn.bounced || 0; }
      tabAgg.pv += d.pv;
    }
    tabAgg.uv = uvSet.size;
    tabAgg.stayAvgSec = stayCount ? Math.round((staySumMs / stayCount / 1000) * 10) / 10 : 0;
    tabAgg.bounceRate = sessSum ? Math.round((bouncedSum / sessSum) * 1000) / 1000 : 0;

    // events: KV.list 后并发取 value
    const evList = await KV.list({ prefix: `evt:${tab}:` });
    const evKeys = evList.keys.filter((k) => {
      const parts = k.name.split(':');
      return parts[3] !== 'total' && dateList.includes(parts[3]);
    });
    const evVals = await Promise.all(evKeys.map((k) => KV.get(k.name)));
    evKeys.forEach((k, i) => {
      const name = k.name.split(':')[2];
      const v = parseInt(evVals[i] || '0', 10) || 0;
      tabAgg.events[name] = (tabAgg.events[name] || 0) + v;
    });

    result.tabs[tab] = tabAgg;
  }));

  // 📚 ISBN 分来源 Top 聚合（并发拉每个 src × 每个 date 的 KV）
  const isbnSources = ['book_extract', 'select_hub', 'ad_copy'];
  const isbnResult = {};
  await Promise.all(isbnSources.map(async (src) => {
    const dayMaps = await Promise.all(dateList.map((date) => KV.get(`isbn:${src}:${date}`, 'json')));
    const agg = {};
    for (const dayMap of dayMaps) {
      if (!dayMap) continue;
      for (const isbn of Object.keys(dayMap)) {
        const entry = dayMap[isbn];
        if (!agg[isbn]) agg[isbn] = { count: 0, title: '', lastTs: 0 };
        agg[isbn].count += entry.count || 0;
        if (entry.title && !agg[isbn].title) agg[isbn].title = entry.title;
        if (entry.lastTs > agg[isbn].lastTs) agg[isbn].lastTs = entry.lastTs;
      }
    }
    isbnResult[src] = Object.keys(agg)
      .map((isbn) => ({ isbn, ...agg[isbn] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
  }));
  // 兼容旧接口：isbnTop 仍为 book_extract 的数据
  result.isbnTop = isbnResult.book_extract || [];
  result.isbnBySource = isbnResult;

  return result;
}
