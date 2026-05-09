/**
 * tracker-api — Cloudflare Worker
 * 接收 /api/track 上报，写入 KV 聚合（可选 R2 原始日志）
 * 提供 /api/stats 聚合查询
 */

const VALID_TABS = new Set(['book_extract', 'script_gen', 'ai_audit', 'summer']);
const VALID_TYPES = new Set(['pv', 'tab_view', 'click', 'feature', 'stay', 'error']);
const UV_DAILY_CAP = 50000;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    try {
      if (url.pathname === '/api/health') {
        return json({ ok: true, ts: Date.now() }, 200, cors);
      }
      if (url.pathname === '/api/track' && request.method === 'POST') {
        return await handleTrack(request, env, ctx, cors);
      }
      if (url.pathname === '/api/stats' && request.method === 'GET') {
        return await handleStats(url, env, cors);
      }
      return json({ error: 'not_found' }, 404, cors);
    } catch (e) {
      return json({ error: 'internal', msg: String(e && e.message || e) }, 500, cors);
    }
  },
};

// =================== CORS ===================
function corsHeaders(request, env) {
  const origin = request.headers.get('origin') || '*';
  // 埋点接口不涉及 cookie/凭证，直接回显请求方的 Origin（等效 *，但避免某些严格浏览器拒绝 *）
  return {
    'Access-Control-Allow-Origin': origin === '*' ? '*' : origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Origin, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}
function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...(extra || {}) },
  });
}
function dayKey(ts) {
  const d = new Date(ts || Date.now());
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

// =================== /api/track ===================
async function handleTrack(request, env, ctx, cors) {
  const ttl = (parseInt(env.RETENTION_DAYS || '90', 10) || 90) * 86400;
  let body;
  try {
    // sendBeacon(blob(type:application/json)) 或 fetch(application/json)
    // 也兼容 text/plain（有些浏览器 sendBeacon 会转为此类型）
    const raw = await request.text();
    body = JSON.parse(raw);
  } catch (e) {
    return json({ error: 'bad_json' }, 400, cors);
  }
  if (!body || typeof body !== 'object') {
    return json({ error: 'bad_body' }, 400, cors);
  }
  const tab = body.tab;
  const type = body.type;
  if (!VALID_TABS.has(tab)) return json({ error: 'bad_tab' }, 400, cors);
  if (!VALID_TYPES.has(type)) return json({ error: 'bad_type' }, 400, cors);

  const ts = +body.ts || Date.now();
  const date = dayKey(ts);
  const uid = String(body.uid || '').slice(0, 64);
  const sid = String(body.sid || '').slice(0, 64);

  // 异步推进，不阻塞响应
  ctx.waitUntil(persist(env, body, tab, type, date, uid, sid, ttl));

  // 索引日期
  ctx.waitUntil(addDateIndex(env, date, ttl));

  // 原始日志（可选）
  if ((env.ENABLE_RAW_LOG || 'false') === 'true' && env.TRACKER_RAW) {
    try {
      const hour = String(new Date(ts).getUTCHours()).padStart(2, '0');
      const k = `${date}/${hour}/${sid || 'no-sid'}-${Math.random().toString(36).slice(2, 10)}.json`;
      ctx.waitUntil(env.TRACKER_RAW.put(k, JSON.stringify(body)));
    } catch (e) {}
  }

  return json({ ok: 1 }, 200, cors);
}

async function persist(env, body, tab, type, date, uid, sid, ttl) {
  const KV = env.TRACKER_AGG;
  if (!KV) return;
  const opt = { expirationTtl: ttl };

  // PV
  if (type === 'pv' || type === 'tab_view') {
    await incr(KV, `pv:${tab}:${date}`, 1, opt);
    await incr(KV, `pv:${tab}:total`, 1, opt);
    if (uid) {
      await addToSet(KV, `uv:${tab}:${date}`, uid, UV_DAILY_CAP, opt);
      await addToSet(KV, `uv:${tab}:total`, uid, UV_DAILY_CAP * 5, opt);
    }
    // 设备 / 来源
    const dev = (body.dev || 'desktop').toLowerCase();
    await mergeMap(KV, `device:${tab}:${date}`, dev, 1, opt);
    const refHost = parseHost(body.ref);
    await mergeMap(KV, `ref:${tab}:${date}`, refHost || 'direct', 1, opt);

    // 跳出率：每个 sid 第一次 PV 进入「sessions」；如果后续没有第二次事件且停留 < 10s，则记 bounced
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

  // 事件计数
  if (type === 'click' || type === 'feature') {
    const name = String(body.name || 'unknown').slice(0, 64);
    await incr(KV, `evt:${tab}:${name}:${date}`, 1, opt);
    await incr(KV, `evt:${tab}:${name}:total`, 1, opt);
    // 该 sid 不再算 bounced
    if (sid) {
      const bk = `bounce:${tab}:${date}`;
      const cur = await KV.get(bk, 'json');
      if (cur && cur.sids && cur.sids.includes(sid)) {
        cur.activeSids = cur.activeSids || [];
        if (!cur.activeSids.includes(sid)) cur.activeSids.push(sid);
        await KV.put(bk, JSON.stringify(cur), opt);
      }
    }
  }

  // 停留时长
  if (type === 'stay') {
    const ms = Math.max(0, Math.min(+body.value || 0, 6 * 60 * 60 * 1000)); // 单次 ≤ 6 小时
    if (ms > 0) {
      const sk = `stay:${tab}:${date}`;
      const cur = (await KV.get(sk, 'json')) || { count: 0, sumMs: 0 };
      cur.count += 1;
      cur.sumMs += ms;
      await KV.put(sk, JSON.stringify(cur), opt);

      // 跳出率第二次判定：停留 < 10s 视为 bounced
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
}

// =================== KV helpers ===================
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
async function addDateIndex(env, date, ttl) {
  const KV = env.TRACKER_AGG;
  if (!KV) return;
  const arr = (await KV.get('index:dates', 'json')) || [];
  if (arr.includes(date)) return;
  arr.push(date);
  if (arr.length > 400) arr.shift();
  await KV.put('index:dates', JSON.stringify(arr), { expirationTtl: ttl });
}
function parseHost(u) {
  if (!u) return '';
  try {
    return new URL(u).host;
  } catch (e) {
    return '';
  }
}

// =================== /api/stats ===================
async function handleStats(url, env, cors) {
  const KV = env.TRACKER_AGG;
  if (!KV) return json({ error: 'no_kv' }, 500, cors);

  const range = url.searchParams.get('range') || '7d'; // 1d | 7d | 30d | 90d
  const tabFilter = url.searchParams.get('tab') || 'all';

  const days = ({ '1d': 1, '7d': 7, '30d': 30, '90d': 90 })[range] || 7;
  const today = new Date();
  const dateList = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    dateList.push(dayKey(d.getTime()));
  }

  const tabs = tabFilter === 'all' ? Array.from(VALID_TABS) : [tabFilter];
  const result = {
    range,
    from: dateList[0],
    to: dateList[dateList.length - 1],
    tabs: {},
  };

  for (const tab of tabs) {
    const tabAgg = {
      pv: 0,
      uv: 0,
      stayAvgSec: 0,
      bounceRate: 0,
      events: {},
      devices: {},
      referrers: {},
      trend: [],
    };
    const uvSet = new Set();
    let staySumMs = 0,
      stayCount = 0,
      sessSum = 0,
      bouncedSum = 0;

    for (const date of dateList) {
      const pv = parseInt((await KV.get(`pv:${tab}:${date}`)) || '0', 10) || 0;
      const dayUvArr = (await KV.get(`uv:${tab}:${date}`, 'json')) || [];
      dayUvArr.forEach((u) => uvSet.add(u));

      tabAgg.trend.push({ date, pv, uv: dayUvArr.length });

      const stayObj = (await KV.get(`stay:${tab}:${date}`, 'json')) || null;
      if (stayObj) {
        staySumMs += stayObj.sumMs || 0;
        stayCount += stayObj.count || 0;
      }

      const dev = (await KV.get(`device:${tab}:${date}`, 'json')) || {};
      Object.keys(dev).forEach((k) => (tabAgg.devices[k] = (tabAgg.devices[k] || 0) + dev[k]));

      const ref = (await KV.get(`ref:${tab}:${date}`, 'json')) || {};
      Object.keys(ref).forEach((k) => (tabAgg.referrers[k] = (tabAgg.referrers[k] || 0) + ref[k]));

      const bn = (await KV.get(`bounce:${tab}:${date}`, 'json')) || null;
      if (bn) {
        sessSum += bn.sessions || 0;
        bouncedSum += bn.bounced || 0;
      }

      tabAgg.pv += pv;
    }
    tabAgg.uv = uvSet.size;
    tabAgg.stayAvgSec = stayCount ? Math.round((staySumMs / stayCount / 1000) * 10) / 10 : 0;
    tabAgg.bounceRate = sessSum ? Math.round((bouncedSum / sessSum) * 1000) / 1000 : 0;

    // 事件聚合：list 出该 tab 所有事件 key
    const evList = await KV.list({ prefix: `evt:${tab}:` });
    for (const k of evList.keys) {
      // key 形如 evt:{tab}:{name}:{date}
      const parts = k.name.split(':');
      const name = parts[2];
      const d = parts[3];
      if (d === 'total' || dateList.includes(d)) {
        if (d === 'total') continue; // 累计单独提供
        const v = parseInt((await KV.get(k.name)) || '0', 10) || 0;
        tabAgg.events[name] = (tabAgg.events[name] || 0) + v;
      }
    }

    result.tabs[tab] = tabAgg;
  }

  return json(result, 200, cors);
}
