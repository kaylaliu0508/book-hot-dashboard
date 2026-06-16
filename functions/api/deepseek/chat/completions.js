/**
 * DeepSeek Chat Completions 反向代理 - Pages Functions
 * 兼容 EdgeOne Pages Functions 与 Cloudflare Pages Functions
 *
 * 路由：POST /api/deepseek/chat/completions
 * 转发到：https://api.deepseek.com/v1/chat/completions
 *
 * 环境变量（在 Pages 项目设置中配置）：
 *   DEEPSEEK_API_KEY  - DeepSeek 平台 sk- 开头的密钥（必填）
 *   ALLOWED_ORIGIN    - 允许跨域来源（可选，默认放开同源）
 *
 * 安全特性：
 *   1. Key 只存服务端环境变量，前端永远拿不到
 *   2. 限制请求方法、Content-Type、最大 body 长度
 *   3. 透传 SSE 流式响应
 *   4. 简单频率限制（按 IP，每分钟 30 次）
 */

const UPSTREAM = 'https://api.deepseek.com/v1/chat/completions';
const MAX_BODY_BYTES = 256 * 1024; // 256KB —— 联网搜索满命中（如刘震云《咸的玩笑》共 90 条 ~70KB）也能通过；DeepSeek 上游上下文 128K tokens 完全 hold 得住

// 内存级简单限频（边缘函数实例间不共享，仅作软约束）
const rateMap = new Map();
const RATE_LIMIT = 30; // 每窗口最大请求数
const RATE_WINDOW_MS = 60 * 1000; // 1 分钟

function rateLimited(ip) {
  const now = Date.now();
  const rec = rateMap.get(ip);
  if (!rec || now - rec.start > RATE_WINDOW_MS) {
    rateMap.set(ip, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  if (rec.count > RATE_LIMIT) return true;
  return false;
}

function buildCorsHeaders(env, request) {
  const allowed = (env && env.ALLOWED_ORIGIN) || '*';
  const origin = request.headers.get('origin') || '';
  // 如果配置了具体 origin 列表（逗号分隔），按白名单匹配；否则用 *
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

  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (request.method !== 'POST') {
    return jsonError(405, 'Method Not Allowed', cors);
  }

  if (!env || !env.DEEPSEEK_API_KEY) {
    return jsonError(500, 'Server misconfigured: DEEPSEEK_API_KEY missing', cors);
  }

  // 限频
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown';
  if (rateLimited(ip)) {
    return jsonError(429, 'Too many requests, slow down', cors);
  }

  // Content-Type 检查
  const ct = request.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    return jsonError(415, 'Content-Type must be application/json', cors);
  }

  // Body 大小限制
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

  // 强制限制 model 范围，避免被滥用调用昂贵模型
  const allowedModels = ['deepseek-chat', 'deepseek-reasoner'];
  if (payload.model && !allowedModels.includes(payload.model)) {
    return jsonError(400, 'Model not allowed', cors);
  }

  // 转发上游
  const upstreamResp = await fetch(UPSTREAM, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  // 透传响应（支持 SSE 流）
  const respHeaders = new Headers(cors);
  const upstreamCT = upstreamResp.headers.get('content-type') || 'application/json';
  respHeaders.set('Content-Type', upstreamCT);
  // 确保流式响应不被缓冲
  if (upstreamCT.includes('text/event-stream')) {
    respHeaders.set('Cache-Control', 'no-cache, no-transform');
    respHeaders.set('X-Accel-Buffering', 'no');
  }

  return new Response(upstreamResp.body, {
    status: upstreamResp.status,
    headers: respHeaders,
  });
}
