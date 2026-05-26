/**
 * Pages Function: /api/feedback
 * - POST：接收图图智能体问题反馈（产品功能/审核规则/投放问题/数据报表/其他问题），写入 KV
 * - GET ：列出反馈（供 /admin/feedback 后台查看），需邀请码认证
 *
 * KV 存储结构（复用 TRACKER_AGG）：
 *   - 单条：  ai_fb:item:{date}:{uuid}  → 完整 JSON
 *   - 日期索引：ai_fb:index:{date}     → [id1, id2, ...]
 *   - 日期列表：ai_fb:index:dates      → [20260526, ...]
 *
 * 保留期：90 天
 */
import { CORS, json, preflight, dayKey } from './_tracker_lib.js';

const MAX_TEXT_LEN = 2000;
const RETENTION_DAYS = 90;

function uuid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8) +
    Math.random().toString(36).slice(2, 6)
  );
}

function sanitize(s, max) {
  if (s == null) return '';
  return String(s).slice(0, max || MAX_TEXT_LEN);
}

function isAuthed(request, env) {
  const code = request.headers.get('X-Invite-Code') || '';
  const token = request.headers.get('X-Admin-Token') || '';
  const adminToken = env.ADMIN_TOKEN || '';
  // 支持 env.INVITE_CODE，未配置时回退到主站邀请码
  const inviteCode = env.INVITE_CODE || env.SITE_INVITE_CODE || '6688';
  return code === inviteCode || (!!adminToken && token === adminToken);
}

export const onRequestOptions = () => preflight();

// ============ POST: 提交反馈 ============
export const onRequestPost = async ({ request, env, waitUntil }) => {
  let body;
  try {
    body = JSON.parse(await request.text());
  } catch (e) {
    return json({ ok: false, detail: 'bad_json' }, 400);
  }

  const type    = sanitize(body.type, 50);
  const content = sanitize(body.content, MAX_TEXT_LEN);
  const contact = sanitize(body.contact, 200);

  if (!content) return json({ ok: false, detail: '内容不能为空' }, 400);
  if (!type)    return json({ ok: false, detail: '请选择反馈类型' }, 400);

  const kv = env.TRACKER_AGG;
  if (!kv) {
    // KV 未绑定时返回成功（不阻断用户体验，管理员后台为空）
    console.warn('[feedback] TRACKER_AGG KV not bound');
    return json({ ok: true, id: 'noop' });
  }

  const id      = uuid();
  const date    = dayKey();  // e.g. "20260526"
  const itemKey = `ai_fb:item:${date}:${id}`;
  const idxKey  = `ai_fb:index:${date}`;
  const datesKey = 'ai_fb:index:dates';
  const expSec  = RETENTION_DAYS * 86400;

  const item = {
    id, date, type, content, contact,
    status: 'new',
    created_at: new Date().toISOString(),
    ua: request.headers.get('user-agent') || '',
  };

  // 写入 KV（并行）
  waitUntil(Promise.all([
    kv.put(itemKey, JSON.stringify(item), { expirationTtl: expSec }),
    (async () => {
      const raw = await kv.get(idxKey);
      const ids = raw ? JSON.parse(raw) : [];
      ids.unshift(id);
      await kv.put(idxKey, JSON.stringify(ids.slice(0, 5000)), { expirationTtl: expSec });
    })(),
    (async () => {
      const raw = await kv.get(datesKey);
      const dates = raw ? JSON.parse(raw) : [];
      if (!dates.includes(date)) {
        dates.unshift(date);
        await kv.put(datesKey, JSON.stringify(dates.slice(0, 365)));
      }
    })(),
  ]));

  return json({ ok: true, id });
};

// ============ GET: 查询反馈列表（需认证）============
export const onRequestGet = async ({ request, env }) => {
  if (!isAuthed(request, env)) {
    return json({ ok: false, detail: 'unauthorized' }, 401);
  }

  const kv = env.TRACKER_AGG;
  if (!kv) return json({ ok: true, items: [], dates: [] });

  const url    = new URL(request.url);
  const date   = url.searchParams.get('date') || dayKey();
  const limit  = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500);

  // 获取日期列表
  const datesRaw = await kv.get('ai_fb:index:dates');
  const dates = datesRaw ? JSON.parse(datesRaw) : [];

  // 获取当天索引
  const idxRaw = await kv.get(`ai_fb:index:${date}`);
  const ids = idxRaw ? JSON.parse(idxRaw) : [];

  // 批量读取
  const items = (
    await Promise.all(
      ids.slice(0, limit).map(id =>
        kv.get(`ai_fb:item:${date}:${id}`).then(v => (v ? JSON.parse(v) : null))
      )
    )
  ).filter(Boolean);

  return json({ ok: true, date, dates, items, total: ids.length });
};
