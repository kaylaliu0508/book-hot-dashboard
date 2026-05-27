/**
 * Pages Function: GET /api/audit_feedback_stats
 *
 * 公开只读的 AI 预审反馈聚合统计（不含原文敏感数据）。
 * 用于 /stats/ 站点数据看板的「AI 预审反馈」板块。
 *
 * 输出：
 *   - total          总反馈数（最近 N 天）
 *   - good           判得准 计数
 *   - bad_fp         误杀 计数
 *   - bad_fn         漏判 计数
 *   - adopted        已采纳 计数
 *   - new            待处理 计数
 *   - rejected       已拒绝 计数
 *   - byDate         按日期分布 [{date, total, good, bad}]
 *   - byRule         Top 10 命中规则误杀/漏判分布 [{rule_id, cat, fp, fn}]
 *   - recent         最近 10 条记录 [{ts, error_type, status, text, hits, user_note, ...}]
 *
 * 注：根据运营需求，recent 不脱敏 —— 完整返回用户原文 text 与所有命中规则 hits（含 matched），
 *     便于在 /stats/ 直接定位漏判/误杀对应的 AI 审核规则。
 *     仍不暴露 ua / page 等环境字段。
 *
 * 默认看最近 30 天。
 */
import { CORS, json, preflight, dayKey } from './_tracker_lib.js';

export const onRequestOptions = () => preflight();

export const onRequestGet = async ({ request, env }) => {
  const KV = env.TRACKER_AGG;
  if (!KV) return json({ ok: 1, total: 0, byDate: [], byRule: [], recent: [], note: 'no_kv' });

  const url = new URL(request.url);
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get('days') || '30', 10)));

  // 拉日期索引
  const allDates = (await KV.get('audit_fb:index:dates', 'json')) || [];
  const useDates = allDates.slice(0, days);

  // 收集 id
  const ids = [];
  for (const d of useDates) {
    const arr = (await KV.get(`audit_fb:index:${d}`, 'json')) || [];
    for (const id of arr) ids.push({ d, id });
  }

  let total = 0;
  let good = 0, bad_fp = 0, bad_fn = 0;
  let adopted = 0, newCnt = 0, rejected = 0;
  const byDateMap = {}; // date -> {total, good, bad}
  const byRuleMap = {}; // rule_id -> {cat, fp, fn}
  const recent = [];
  const RECENT_LIMIT = 10;

  // 按日期倒序遍历
  for (const { d, id } of ids) {
    const it = await KV.get(`audit_fb:item:${d}:${id}`, 'json');
    if (!it) continue;
    total++;

    const isGood = it.verdict_user === 'accept_ai';
    if (isGood) good++;
    else if (it.error_type === 'false_positive') bad_fp++;
    else if (it.error_type === 'false_negative') bad_fn++;

    if (it.status === 'adopted') adopted++;
    else if (it.status === 'rejected') rejected++;
    else newCnt++;

    // 日期聚合
    const key = it.date || d;
    if (!byDateMap[key]) byDateMap[key] = { date: key, total: 0, good: 0, bad: 0 };
    byDateMap[key].total++;
    if (isGood) byDateMap[key].good++;
    else byDateMap[key].bad++;

    // 规则聚合（按命中规则的第一条计入）
    if (!isGood && Array.isArray(it.hits) && it.hits.length) {
      const h = it.hits[0];
      const rid = h.id || 'unknown';
      if (!byRuleMap[rid]) byRuleMap[rid] = { rule_id: rid, cat: h.cat || '', fp: 0, fn: 0 };
      if (it.error_type === 'false_positive') byRuleMap[rid].fp++;
      else if (it.error_type === 'false_negative') byRuleMap[rid].fn++;
    }

    // recent（不脱敏：返回完整原文 + 所有命中规则）
    if (recent.length < RECENT_LIMIT) {
      const hitCat = (it.hits && it.hits[0] && it.hits[0].cat) || '';
      recent.push({
        ts: it.ts,
        date: it.date,
        feedback_type: it.feedback_type || 'rule_hit',
        verdict_user: isGood ? 'accept_ai' : it.verdict_user || '',
        error_type: it.error_type || '',
        status: it.status || 'new',
        hit_cat: hitCat, // 兼容老前端
        hits: Array.isArray(it.hits) ? it.hits : [],
        text: it.text || '', // 用户输入完整原文
        text_status: it.text_status || '',
        rule_version: it.rule_version || '',
        ai_recheck: !!it.ai_recheck,
        user_note: it.user_note || '',
      });
    }
  }

  const byDate = Object.values(byDateMap).sort((a, b) => a.date.localeCompare(b.date));
  const byRule = Object.values(byRuleMap)
    .map((x) => ({ ...x, total: x.fp + x.fn }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return json({
    ok: 1,
    range_days: days,
    generated_at: Date.now(),
    summary: {
      total,
      good,
      bad: bad_fp + bad_fn,
      bad_fp,
      bad_fn,
      adopted,
      new: newCnt,
      rejected,
      // 派生指标
      good_rate: total > 0 ? Math.round((good / total) * 1000) / 10 : 0,         // %（1 位小数）
      adopt_rate: (bad_fp + bad_fn) > 0 ? Math.round((adopted / (bad_fp + bad_fn)) * 1000) / 10 : 0,
    },
    byDate,
    byRule,
    recent,
  });
};

export const onRequest = async ({ request }) => {
  if (request.method === 'OPTIONS') return preflight();
  return new Response('Method Not Allowed', { status: 405, headers: CORS });
};
