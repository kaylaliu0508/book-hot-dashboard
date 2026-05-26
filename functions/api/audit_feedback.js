/**
 * Pages Function: /api/audit_feedback
 * - POST：接收 AI 预审反馈（误杀/漏判/建议错），写入 KV
 * - GET ：列出反馈（供 /admin/audit-feedback 后台用），需邀请码或管理员口令
 *
 * 存储设计（复用 TRACKER_AGG KV）：
 *   - 单条 detail：audit_fb:item:{date}:{uuid}  →  完整 JSON（含原文等敏感字段）
 *   - 日期索引：  audit_fb:index:{date}        →  [id1, id2, ...]
 *   - 全局索引：  audit_fb:index:dates         →  [20260526, 20260527, ...]
 *   - 状态：单条 detail 内 status 字段：new | adopted | rejected
 *
 * 保留期：90 天（由 RETENTION_DAYS 控制，默认 90，与 _tracker_lib 保持一致）
 */
import { CORS, json, preflight, dayKey } from './_tracker_lib.js';

const MAX_TEXT_LEN = 4000;
const MAX_LIST_PAGE = 200;
const PAGE_DEFAULT = 50;
const ADMIN_HEADER = 'X-Admin-Token';

function uuid() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8) +
    Math.random().toString(36).slice(2, 6)
  );
}

function sanitizeText(s, max) {
  if (s == null) return '';
  return String(s).slice(0, max || MAX_TEXT_LEN);
}

function isAdmin(request, env) {
  const t = request.headers.get(ADMIN_HEADER) || '';
  const expect = env.ADMIN_TOKEN || env.AUDIT_FEEDBACK_ADMIN_TOKEN || '';
  return !!expect && t === expect;
}

export const onRequestOptions = () => preflight();

// ============ POST: 提交反馈 ============
export const onRequestPost = async ({ request, env, waitUntil }) => {
  let body;
  try {
    body = JSON.parse(await request.text());
  } catch (e) {
    return json({ error: 'bad_json' }, 400);
  }
  if (!body || typeof body !== 'object') return json({ error: 'bad_body' }, 400);

  const KV = env.TRACKER_AGG;
  if (!KV) return json({ error: 'no_kv' }, 500);

  const ts = +body.ts || Date.now();
  const date = dayKey(ts);
  const id = uuid();

  // 仅保留白名单字段，避免脏数据
  const snap = body.snapshot && typeof body.snapshot === 'object' ? body.snapshot : {};
  const hits = Array.isArray(snap.hits)
    ? snap.hits.slice(0, 30).map((h) => ({
        id: sanitizeText(h.id, 40),
        cat: sanitizeText(h.cat, 40),
        level: sanitizeText(h.level, 20),
        matched: sanitizeText(h.matched, 80),
        desc: sanitizeText(h.desc, 200),
        fix: sanitizeText(h.fix, 200),
      }))
    : [];

  const item = {
    id,
    ts,
    date,
    status: 'new',
    feedback_type: sanitizeText(body.feedback_type, 20) || 'rule_hit',
    verdict_user: sanitizeText(body.verdict_user, 40),
    error_type: sanitizeText(body.error_type, 40),
    user_note: sanitizeText(body.user_note, 240),
    text: sanitizeText(snap.text, MAX_TEXT_LEN),
    text_status: sanitizeText(snap.status, 20),
    rule_version: sanitizeText(snap.rule_version, 40),
    ai_recheck: !!snap.ai_recheck,
    hits,
    ua: sanitizeText(body.ua, 200),
    page: sanitizeText(body.page, 120),
  };

  const ttl = (parseInt(env.RETENTION_DAYS || '90', 10) || 90) * 86400;
  const opt = { expirationTtl: ttl };

  const p = (async () => {
    // 1) detail
    await KV.put(`audit_fb:item:${date}:${id}`, JSON.stringify(item), opt);
    // 2) day index
    const dayIdxKey = `audit_fb:index:${date}`;
    const dayIdx = (await KV.get(dayIdxKey, 'json')) || [];
    dayIdx.unshift(id);
    if (dayIdx.length > 2000) dayIdx.length = 2000;
    await KV.put(dayIdxKey, JSON.stringify(dayIdx), opt);
    // 3) date index
    const datesKey = 'audit_fb:index:dates';
    const dates = (await KV.get(datesKey, 'json')) || [];
    if (!dates.includes(date)) {
      dates.unshift(date);
      if (dates.length > 400) dates.length = 400;
      await KV.put(datesKey, JSON.stringify(dates), opt);
    }
  })();
  if (waitUntil) waitUntil(p); else await p;

  return json({ ok: 1, id });
};

// ============ GET: 管理后台读取列表 / 单条 ============
export const onRequestGet = async ({ request, env }) => {
  if (!isAdmin(request, env)) return json({ error: 'unauthorized' }, 401);

  const KV = env.TRACKER_AGG;
  if (!KV) return json({ error: 'no_kv' }, 500);

  const url = new URL(request.url);
  const op = url.searchParams.get('op') || 'list';

  // 单条
  if (op === 'item') {
    const id = url.searchParams.get('id') || '';
    const date = url.searchParams.get('date') || '';
    if (!id || !date) return json({ error: 'missing_params' }, 400);
    const it = await KV.get(`audit_fb:item:${date}:${id}`, 'json');
    return json({ ok: 1, item: it });
  }

  // 列表
  const status = url.searchParams.get('status') || ''; // new | adopted | rejected | ''
  const errorType = url.searchParams.get('error_type') || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(MAX_LIST_PAGE, Math.max(1, parseInt(url.searchParams.get('size') || String(PAGE_DEFAULT), 10)));

  // 默认拉最近 30 天
  const dates = (await KV.get('audit_fb:index:dates', 'json')) || [];
  const useDates = dates.slice(0, 30);

  // 收集 id（按日期倒序）
  const ids = [];
  for (const d of useDates) {
    const arr = (await KV.get(`audit_fb:index:${d}`, 'json')) || [];
    for (const id of arr) ids.push({ d, id });
  }

  const items = [];
  // 顺序拉，避免一次拉过多
  const start = (page - 1) * pageSize;
  let scanned = 0;
  let collected = 0;
  for (const { d, id } of ids) {
    if (collected >= pageSize) break;
    if (scanned > start + pageSize * 4 && items.length >= pageSize) break; // 兜底
    const it = await KV.get(`audit_fb:item:${d}:${id}`, 'json');
    scanned++;
    if (!it) continue;
    if (status && it.status !== status) continue;
    if (errorType && it.error_type !== errorType) continue;
    if (scanned <= start) continue;
    items.push(it);
    collected++;
  }

  return json({
    ok: 1,
    page,
    size: pageSize,
    total_ids: ids.length,
    items,
  });
};

// ============ PATCH: 管理后台更新状态（adopt/reject） ============
export const onRequestPatch = async ({ request, env }) => {
  if (!isAdmin(request, env)) return json({ error: 'unauthorized' }, 401);
  const KV = env.TRACKER_AGG;
  if (!KV) return json({ error: 'no_kv' }, 500);

  let body;
  try {
    body = JSON.parse(await request.text());
  } catch (e) {
    return json({ error: 'bad_json' }, 400);
  }
  const id = sanitizeText(body.id, 40);
  const date = sanitizeText(body.date, 20);
  const newStatus = sanitizeText(body.status, 20);
  const adminNote = sanitizeText(body.admin_note, 240);
  if (!id || !date) return json({ error: 'missing_params' }, 400);
  if (!['new', 'adopted', 'rejected'].includes(newStatus)) return json({ error: 'bad_status' }, 400);

  const key = `audit_fb:item:${date}:${id}`;
  const it = await KV.get(key, 'json');
  if (!it) return json({ error: 'not_found' }, 404);

  it.status = newStatus;
  it.admin_note = adminNote;
  it.adopted_at = Date.now();

  await KV.put(key, JSON.stringify(it));

  // 已采纳 → 同步加进 few-shot 学习池（最近最多 200 条，用于 AI 复审 prompt）
  if (newStatus === 'adopted') {
    const poolKey = 'audit_fb:learned_pool';
    const pool = (await KV.get(poolKey, 'json')) || [];
    const exists = pool.find((x) => x.id === it.id);
    if (!exists) {
      pool.unshift({
        id: it.id,
        text: it.text,
        verdict_user: it.verdict_user,
        error_type: it.error_type,
        hits_summary: (it.hits || []).map((h) => h.cat + ':' + (h.matched || '')).join('; ').slice(0, 200),
        user_note: it.user_note,
        admin_note: adminNote,
        adopted_at: it.adopted_at,
      });
      if (pool.length > 200) pool.length = 200;
      await KV.put(poolKey, JSON.stringify(pool));
    }
  }

  return json({ ok: 1, item: it });
};

// 其它方法
export const onRequest = async ({ request }) => {
  if (request.method === 'OPTIONS') return preflight();
  return new Response('Method Not Allowed', { status: 405, headers: CORS });
};
