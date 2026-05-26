/**
 * Pages Function: /api/feedback
 * POST: 接收图图智能体问题反馈，写入 KV (TRACKER_AGG)
 * GET:  查询反馈列表（邀请码认证）
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

function respond(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  });
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: CORS_HEADERS });

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function dayKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`;
}

// ============ POST: 提交反馈 ============
export const onRequestPost = async ({ request, env }) => {
  try {
    let body;
    try { body = JSON.parse(await request.text()); }
    catch { return respond({ ok: false, detail: 'bad_json' }, 400); }

    const type    = String(body.type    || '').slice(0, 50);
    const content = String(body.content || '').slice(0, 2000);
    const contact = String(body.contact || '').slice(0, 200);

    if (!content) return respond({ ok: false, detail: '内容不能为空' }, 400);
    if (!type)    return respond({ ok: false, detail: '请选择反馈类型' }, 400);

    const kv = env.TRACKER_AGG;
    const id = makeId();

    if (!kv) {
      // KV 未绑定，仍返回成功避免打断用户
      console.warn('TRACKER_AGG not bound, feedback id:', id);
      return respond({ ok: true, id });
    }

    const date     = dayKey();
    const TTL      = 90 * 86400;
    const itemKey  = `ai_fb:item:${date}:${id}`;
    const idxKey   = `ai_fb:index:${date}`;
    const dateKey  = 'ai_fb:index:dates';

    const item = {
      id, date, type, content, contact,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    // 同步写入（避免 waitUntil 丢失）
    await kv.put(itemKey, JSON.stringify(item), { expirationTtl: TTL });

    const rawIdx = await kv.get(idxKey);
    const ids = rawIdx ? JSON.parse(rawIdx) : [];
    ids.unshift(id);
    await kv.put(idxKey, JSON.stringify(ids.slice(0, 5000)), { expirationTtl: TTL });

    const rawDates = await kv.get(dateKey);
    const dates = rawDates ? JSON.parse(rawDates) : [];
    if (!dates.includes(date)) {
      dates.unshift(date);
      await kv.put(dateKey, JSON.stringify(dates.slice(0, 365)));
    }

    return respond({ ok: true, id });
  } catch (e) {
    console.error('feedback POST error:', e);
    return respond({ ok: false, detail: String(e) }, 500);
  }
};

// ============ GET: 查询反馈列表 ============
export const onRequestGet = async ({ request, env }) => {
  try {
    // 认证：支持 env.INVITE_CODE 或回退到 '6688'
    const code = request.headers.get('X-Invite-Code') || '';
    const adminToken = request.headers.get('X-Admin-Token') || '';
    const inviteCode = env.INVITE_CODE || env.SITE_INVITE_CODE || '6688';
    const envAdmin   = env.ADMIN_TOKEN || '';
    if (code !== inviteCode && !(envAdmin && adminToken === envAdmin)) {
      return respond({ ok: false, detail: 'unauthorized' }, 401);
    }

    const kv = env.TRACKER_AGG;
    if (!kv) return respond({ ok: true, date: dayKey(), dates: [], items: [], total: 0 });

    const url   = new URL(request.url);
    const date  = url.searchParams.get('date') || dayKey();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500);

    const datesRaw = await kv.get('ai_fb:index:dates');
    const dates = datesRaw ? JSON.parse(datesRaw) : [];

    const idxRaw = await kv.get(`ai_fb:index:${date}`);
    const ids = idxRaw ? JSON.parse(idxRaw) : [];

    const items = (
      await Promise.all(
        ids.slice(0, limit).map(id =>
          kv.get(`ai_fb:item:${date}:${id}`).then(v => v ? JSON.parse(v) : null)
        )
      )
    ).filter(Boolean);

    return respond({ ok: true, date, dates, items, total: ids.length });
  } catch (e) {
    console.error('feedback GET error:', e);
    return respond({ ok: false, detail: String(e) }, 500);
  }
};
