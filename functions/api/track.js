/**
 * Pages Function: POST /api/track
 * 同源接收埋点上报
 */
import { CORS, json, preflight, persistEvent } from './_tracker_lib.js';

export const onRequestOptions = () => preflight();

export const onRequestPost = async ({ request, env, waitUntil }) => {
  let body;
  try {
    const raw = await request.text();
    body = JSON.parse(raw);
  } catch (e) {
    return json({ error: 'bad_json' }, 400);
  }
  if (!body || typeof body !== 'object') return json({ error: 'bad_body' }, 400);

  // 异步写入 KV，不阻塞响应
  const p = persistEvent(env, body);
  if (waitUntil) waitUntil(p);
  else await p;

  return json({ ok: 1 });
};

// 其他方法直接拒绝（带 CORS）
export const onRequest = async ({ request }) => {
  if (request.method === 'OPTIONS') return preflight();
  return new Response('Method Not Allowed', { status: 405, headers: CORS });
};
