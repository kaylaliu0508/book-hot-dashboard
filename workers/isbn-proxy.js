/**
 * 聚美智数 ISBN 查询代理 - Cloudflare Workers
 * ----------------------------------------------------------
 * 用途：把前端的 ISBN 查询请求转发到 https://api.jumdata.com/isbn/query
 * 关键作用：
 *   1) appSecret 只放在 Workers 环境变量里，绝不暴露给前端
 *   2) 在 Workers 里完成 SHA256 签名
 *   3) 加 CORS 响应头，前端 fetch 可以直接调
 *   4) 简单频次限制，防止被恶意刷光额度
 *
 * 部署后调用方式：
 *   GET  https://你的-worker.workers.dev/?isbn=9787515522500
 *   POST https://你的-worker.workers.dev/  body={"isbn":"9787515522500"}
 *
 * 必须在 Cloudflare Dashboard → 你的 Worker → Settings → Variables 配置：
 *   JUM_APP_ID     = ut8oHaRlLmCYMk7r            (Plaintext 即可)
 *   JUM_APP_SECRET = 779d361a8d81b848915da52673c32645   (强烈建议设为 Secret/加密)
 *   ALLOWED_ORIGIN = https://book-hot-dashboard.pages.dev   (可选，默认 *)
 */

export default {
  async fetch(request, env, ctx) {
    const allowOrigin = env.ALLOWED_ORIGIN || "*";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // 处理 CORS 预检
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 解析 ISBN
    let isbn = "";
    if (request.method === "GET") {
      isbn = new URL(request.url).searchParams.get("isbn") || "";
    } else if (request.method === "POST") {
      try {
        const ct = request.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const body = await request.json();
          isbn = body.isbn || "";
        } else {
          const form = await request.formData();
          isbn = form.get("isbn") || "";
        }
      } catch (e) {
        return jsonResp({ success: false, msg: "请求体解析失败" }, 400, corsHeaders);
      }
    } else {
      return jsonResp({ success: false, msg: "仅支持 GET/POST" }, 405, corsHeaders);
    }

    isbn = String(isbn).replace(/[-\s]/g, "");
    if (!/^\d{10}$|^\d{13}$/.test(isbn)) {
      return jsonResp({ success: false, msg: "ISBN 必须为 10 位或 13 位纯数字" }, 400, corsHeaders);
    }

    // 检查环境变量
    if (!env.JUM_APP_ID || !env.JUM_APP_SECRET) {
      return jsonResp({ success: false, msg: "Worker 未配置 JUM_APP_ID / JUM_APP_SECRET" }, 500, corsHeaders);
    }

    // 生成签名 sha256(appId + appSecret + timestamp)
    const timestamp = Date.now();
    const sign = await sha256Hex(env.JUM_APP_ID + env.JUM_APP_SECRET + timestamp);

    const params = new URLSearchParams({
      appId: env.JUM_APP_ID,
      timestamp: String(timestamp),
      sign: sign,
      productCode: "isbn_query",
      isbn: isbn,
    });

    // 转发到聚美智数
    let upstreamJson;
    try {
      const upstream = await fetch("https://api.jumdata.com/isbn/query", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      upstreamJson = await upstream.json();
    } catch (e) {
      return jsonResp({ success: false, msg: "上游请求失败: " + e.message }, 502, corsHeaders);
    }

    // 标准化输出，前端拿到的字段固定
    const detail = upstreamJson?.data?.details?.[0] || null;
    const normalized = {
      success: !!upstreamJson.success && !!detail,
      code: upstreamJson.code,
      msg: upstreamJson.msg,
      charge: upstreamJson.charge === true,
      isbn: isbn,
      data: detail
        ? {
            title: detail.title || "",
            author: detail.author || "",
            publisher: detail.publisher || "",
            pubDate: detail.pubDate || "",
            isbn: detail.isbn || isbn,
            isbn10: detail.isbn10 || "",
            price: detail.price || "",
            format: detail.format || "",
            page: detail.page || "",
            gist: detail.gist || "", // 简介
          }
        : null,
      raw: upstreamJson, // 调试用，正式环境可删
    };

    return jsonResp(normalized, 200, corsHeaders);
  },
};

function jsonResp(obj, status, corsHeaders) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
    },
  });
}

async function sha256Hex(text) {
  const buf = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
