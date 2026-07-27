/**
 * Pages Function: GET /api/stats?range=1d|7d|30d|90d&tab=all|book_extract|...
 *                 GET /api/stats?from=YYYYMMDD&to=YYYYMMDD&tab=all|...
 *   from/to 用于自定义评估周期报告（如 5/4-7/19），优先级高于 range。
 */
import { CORS, json, preflight, aggregateStats } from './_tracker_lib.js';

export const onRequestOptions = () => preflight();

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const range = url.searchParams.get('range') || '7d';
  const tab = url.searchParams.get('tab') || 'all';
  const from = url.searchParams.get('from') || '';
  const to = url.searchParams.get('to') || '';
  const data = await aggregateStats(env, range, tab, { from, to });
  return json(data);
};
