/**
 * 智谱（BigModel）联网搜索代理 - Pages Functions
 * 兼容 EdgeOne Pages Functions 与 Cloudflare Pages Functions
 *
 * 路由：POST /api/zhipu/search
 * 转发到：https://open.bigmodel.cn/api/paas/v4/tools
 *
 * 环境变量：
 *   ZHIPU_API_KEY  - 智谱平台 API Key（必填）
 *   ALLOWED_ORIGIN - 允许跨域来源（可选）
 */

const UPSTREAM = 'https://open.bigmodel.cn/api/paas/v4/tools';
const MAX_BODY_BYTES = 32 * 1024;

const rateMap = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

function rateLimited(ip) {
  const now = Date.now();
  const rec = rateMap.get(ip);
  if (!rec || now - rec.start > RATE_WINDOW_MS) {
    rateMap.set(ip, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > RATE_LIMIT;
}

function buildCorsHeaders(env, request) {
  const allowed = (env && env.ALLOWED_ORIGIN) || '*';
  const origin = request.headers.get('origin') || '';
  let allowOrigin = '*';
  if (allowed !== '*') {
    const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
    allowOrigin = list.includes(origin) ? origin : list[0] || '*';
  }
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonError(status, message, cors) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const cors = buildCorsHeaders(env, request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== 'POST') {
    return jsonError(405, 'Method Not Allowed', cors);
  }
  if (!env || !env.ZHIPU_API_KEY) {
    return jsonError(500, 'Server misconfigured: ZHIPU_API_KEY missing', cors);
  }

  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown';
  if (rateLimited(ip)) {
    return jsonError(429, 'Too many requests', cors);
  }

  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return jsonError(415, 'Content-Type must be application/json', cors);
  }

  const bodyText = await request.text();
  if (bodyText.length > MAX_BODY_BYTES) {
    return jsonError(413, 'Request body too large', cors);
  }

  let payload;
  try {
    payload = JSON.parse(bodyText);
  } catch (e) {
    return jsonError(400, 'Invalid JSON body', cors);
  }

  // 仅允许 search_std/search_pro/web-search-pro 等搜索类工具
  const allowedTools = ['search_std', 'search_pro', 'web_search', 'web-search-pro', 'web-search-prime'];
  if (payload.tool && !allowedTools.includes(payload.tool)) {
    return jsonError(400, 'Tool not allowed', cors);
  }

  const upstreamResp = await fetch(UPSTREAM, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.ZHIPU_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const respHeaders = new Headers(cors);
  respHeaders.set(
    'Content-Type',
    upstreamResp.headers.get('content-type') || 'application/json'
  );

  return new Response(upstreamResp.body, {
    status: upstreamResp.status,
    headers: respHeaders,
  });
}
