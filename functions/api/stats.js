/**
 * Pages Function: GET /api/stats?range=1d|7d|30d|90d&tab=all|book_extract|...
 */
import { CORS, json, preflight, aggregateStats } from './_tracker_lib.js';

export const onRequestOptions = () => preflight();

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const range = url.searchParams.get('range') || '7d';
  const tab = url.searchParams.get('tab') || 'all';
  const data = await aggregateStats(env, range, tab);
  return json(data);
};
