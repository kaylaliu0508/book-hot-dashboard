/**
 * Pages Function: GET /api/audit_learned_cases
 * - 返回最近最多 N 条「已采纳」反馈，作为 AI 语义复审的 few-shot 示例。
 * - 公开只读（不暴露 ua/page 等元数据，仅返回 text + 期望判定）。
 * - 前端在 callAIAudit 时拼到 system prompt 里。
 */
import { CORS, json, preflight } from './_tracker_lib.js';

export const onRequestOptions = () => preflight();

export const onRequestGet = async ({ request, env }) => {
  const KV = env.TRACKER_AGG;
  if (!KV) return json({ ok: 1, cases: [] }); // 没绑定 KV 也不阻塞前端

  const url = new URL(request.url);
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));

  const pool = (await KV.get('audit_fb:learned_pool', 'json')) || [];
  const cases = pool.slice(0, limit).map((x) => ({
    text: x.text,
    verdict_user: x.verdict_user, // should_pass | should_warn | should_reject
    error_type: x.error_type,     // false_positive | false_negative | bad_fix
    reason: x.admin_note || x.user_note || '',
  }));

  return json({ ok: 1, cases, total: pool.length });
};

export const onRequest = async ({ request }) => {
  if (request.method === 'OPTIONS') return preflight();
  return new Response('Method Not Allowed', { status: 405, headers: CORS });
};
