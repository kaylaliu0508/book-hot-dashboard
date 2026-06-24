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

// 🆕 2026-06-24 安全加固（同步 deepseek 代理的逻辑，避免攻击者转火）
const DEFAULT_ALLOWED_HOSTS = ['book-hot-dashboard.pages.dev'];
const PREVIEW_HOST_PATTERN = /^[a-z0-9-]+\.book-hot-dashboard\.pages\.dev$/i;

const rateMap = new Map();
const RATE_LIMIT = 10; // 10 次/分钟/IP（zhipu 单次 ISBN 采集会 8 条并发，10/min 留一定 buffer）
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

function isOriginAllowed(request, env) {
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  let host = '';
  try {
    if (origin) host = new URL(origin).host;
    else if (referer) host = new URL(referer).host;
  } catch (_) { host = ''; }
  const extraHosts = ((env && env.ALLOWED_ORIGIN) || '')
    .split(',').map((s) => s.trim()).filter(Boolean)
    .map((s) => { try { return new URL(s).host; } catch (_) { return s.replace(/^https?:\/\//, '').split('/')[0]; } });
  const allowList = [...DEFAULT_ALLOWED_HOSTS, ...extraHosts];
  if (!host) return false;
  if (allowList.includes(host)) return true;
  if (PREVIEW_HOST_PATTERN.test(host)) return true;
  return false;
}

async function dailyQuotaExceeded(env) {
  if (!env || !env.TRACKER_AGG) return false;
  const quota = parseInt((env && env.ZHIPU_DAILY_QUOTA) || '500', 10); // zhipu 比 deepseek 略高，1 次采集 = 8 条
  const today = new Date().toISOString().slice(0, 10);
  const key = `zh_quota:${today}`;
  try {
    const cur = parseInt((await env.TRACKER_AGG.get(key)) || '0', 10);
    if (cur >= quota) return { exceeded: true, used: cur, quota };
    await env.TRACKER_AGG.put(key, String(cur + 1), { expirationTtl: 86400 * 2 });
    return { exceeded: false, used: cur + 1, quota };
  } catch (e) { return false; }
}

function buildCorsHeaders(env, request) {
  const origin = request.headers.get('origin') || '';
  let allowOrigin = '';
  try {
    if (origin) {
      const host = new URL(origin).host;
      const extraHosts = ((env && env.ALLOWED_ORIGIN) || '')
        .split(',').map((s) => s.trim()).filter(Boolean)
        .map((s) => { try { return new URL(s).host; } catch (_) { return s.replace(/^https?:\/\//, '').split('/')[0]; } });
      const allowList = [...DEFAULT_ALLOWED_HOSTS, ...extraHosts];
      if (allowList.includes(host) || PREVIEW_HOST_PATTERN.test(host)) allowOrigin = origin;
    }
  } catch (_) { /* keep empty */ }
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (allowOrigin) headers['Access-Control-Allow-Origin'] = allowOrigin;
  return headers;
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

  // 🆕 第一道闸：Origin 白名单
  if (!isOriginAllowed(request, env)) {
    return jsonError(403, 'Forbidden: this API is only accessible from book-hot-dashboard.pages.dev', cors);
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
    return jsonError(429, 'Too many requests (10/min/IP). Slow down.', cors);
  }

  // 🆕 第二道闸：日累计熔断
  const quota = await dailyQuotaExceeded(env);
  if (quota && quota.exceeded) {
    return jsonError(503, `Daily quota exceeded (${quota.used}/${quota.quota}).`, cors);
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
