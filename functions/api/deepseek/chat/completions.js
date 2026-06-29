/**
 * DeepSeek Chat Completions 反向代理 - Pages Functions
 * 兼容 EdgeOne Pages Functions 与 Cloudflare Pages Functions
 *
 * 路由：POST /api/deepseek/chat/completions
 * 转发到：https://api.deepseek.com/v1/chat/completions
 *
 * 环境变量：
 *   DEEPSEEK_API_KEY  - DeepSeek 平台 sk- 开头的密钥（必填）
 *   ALLOWED_ORIGIN    - 允许跨域来源（可选，默认 'https://book-hot-dashboard.pages.dev'）
 *   DAILY_QUOTA       - 当日请求次数熔断阈值（可选，默认 300）
 *
 * 安全特性（2026-06-24 加固，根因：当日被恶意外部刷量 570 次烧光¥107）：
 *   1. Key 只存服务端环境变量
 *   2. 🆕 Origin/Referer 强校验：只允许 book-hot-dashboard.pages.dev 调用
 *   3. 🆕 限流收紧：30→5 次/分钟/IP（正常用户够用）
 *   4. 🆕 日累计熔断：每天总请求超 DAILY_QUOTA 自动 503（KV-backed）
 *   5. 限制 model 范围 + body 256KB 上限
 *
 * 模型策略（2026-06-29）：全量强制改写为 deepseek-v4-flash
 *   根因：6 月仍 3102 次 pro 调用烧光 ¥108.97；flash A/B 验证质量 OK，成本降 ~90%
 *   行为：请求体里 model 字段无论传什么，都会被改写为 'deepseek-v4-flash' 再转发
 */

const UPSTREAM = 'https://api.deepseek.com/v1/chat/completions';
const MAX_BODY_BYTES = 256 * 1024;

// 默认放行域（生产域名 + CF Pages 预览域）
const DEFAULT_ALLOWED_HOSTS = [
  'book-hot-dashboard.pages.dev',
];
// 同时放行所有 *.book-hot-dashboard.pages.dev 子域（CF preview deployment）
const PREVIEW_HOST_PATTERN = /^[a-z0-9-]+\.book-hot-dashboard\.pages\.dev$/i;

// 内存级限流（边缘实例间不共享，仅作软约束）
const rateMap = new Map();
const RATE_LIMIT = 5; // 5 次/分钟/IP（收紧 6x，正常用户用不到 5/min，攻击者寸步难行）
const RATE_WINDOW_MS = 60 * 1000;

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

// 🆕 Origin/Referer 校验：必须来自我们的站点
function isOriginAllowed(request, env) {
  const origin = request.headers.get('origin') || '';
  const referer = request.headers.get('referer') || '';
  // 优先解析 origin，没 origin 就解 referer 的 host
  let host = '';
  try {
    if (origin) host = new URL(origin).host;
    else if (referer) host = new URL(referer).host;
  } catch (_) { host = ''; }

  // env.ALLOWED_ORIGIN 配置（逗号分隔的 origin 列表）会被叠加进白名单
  const extraHosts = ((env && env.ALLOWED_ORIGIN) || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => { try { return new URL(s).host; } catch (_) { return s.replace(/^https?:\/\//, '').split('/')[0]; } });

  const allowList = [...DEFAULT_ALLOWED_HOSTS, ...extraHosts];

  if (!host) return false; // 没 origin 也没 referer，必然是脚本 / curl
  if (allowList.includes(host)) return true;
  if (PREVIEW_HOST_PATTERN.test(host)) return true;
  return false;
}

// 🆕 日累计熔断：用 TRACKER_AGG KV 存当日累计计数
async function dailyQuotaExceeded(env) {
  if (!env || !env.TRACKER_AGG) return false; // KV 未绑定时跳过（防御性）
  const quota = parseInt((env && env.DAILY_QUOTA) || '300', 10);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC（够用）
  const key = `ds_quota:${today}`;
  try {
    const cur = parseInt((await env.TRACKER_AGG.get(key)) || '0', 10);
    if (cur >= quota) return { exceeded: true, used: cur, quota };
    // 自增（注意：KV 不是原子操作，并发下可能轻微偏差，但作为熔断阈值够用）
    await env.TRACKER_AGG.put(key, String(cur + 1), { expirationTtl: 86400 * 2 });
    return { exceeded: false, used: cur + 1, quota };
  } catch (e) {
    return false; // KV 异常时放行，避免误杀
  }
}

function buildCorsHeaders(env, request) {
  const origin = request.headers.get('origin') || '';
  // 只有 origin 在白名单时才回 ACAO（其他情况不放 CORS）
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

  // 🆕 第一道闸：Origin/Referer 白名单（挡掉 curl / 直接打 API 的攻击者）
  if (!isOriginAllowed(request, env)) {
    return jsonError(403, 'Forbidden: this API is only accessible from book-hot-dashboard.pages.dev', cors);
  }

  if (!env || !env.DEEPSEEK_API_KEY) {
    return jsonError(500, 'Server misconfigured: DEEPSEEK_API_KEY missing', cors);
  }

  // IP 限频（5/min/IP，挡掉单 IP 突刺）
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown';
  if (rateLimited(ip)) {
    return jsonError(429, 'Too many requests (5/min/IP). Slow down.', cors);
  }

  // 🆕 第二道闸：日累计熔断（防分布式刷量）
  const quota = await dailyQuotaExceeded(env);
  if (quota && quota.exceeded) {
    return jsonError(
      503,
      `Daily quota exceeded (${quota.used}/${quota.quota}). Service will resume tomorrow UTC.`,
      cors
    );
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

  // 2026-06-29 优化: 强制只走 v4-flash（成本降 ~90%，A/B 已验证质量 OK）
  // 任何传 pro/chat/reasoner 的请求都自动改写为 v4-flash，对调用方完全透明
  const FLASH_MODEL = 'deepseek-v4-flash';
  const allowedModels = [FLASH_MODEL, 'deepseek-v4-flash']; // 白名单收紧
  if (payload.model && !allowedModels.includes(payload.model)) {
    // 降级到 flash 并继续放行（不报错，保持调用方无感）
    payload.model = FLASH_MODEL;
  } else if (!payload.model) {
    payload.model = FLASH_MODEL;
  }

  const upstreamResp = await fetch(UPSTREAM, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const respHeaders = new Headers(cors);
  const upstreamCT = upstreamResp.headers.get('content-type') || 'application/json';
  respHeaders.set('Content-Type', upstreamCT);
  if (upstreamCT.includes('text/event-stream')) {
    respHeaders.set('Cache-Control', 'no-cache, no-transform');
    respHeaders.set('X-Accel-Buffering', 'no');
  }

  return new Response(upstreamResp.body, {
    status: upstreamResp.status,
    headers: respHeaders,
  });
}
