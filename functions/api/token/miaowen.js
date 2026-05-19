/**
 * /api/token/miaowen - 保存妙问 Token（前端 session 级别）
 */
export async function onRequestPost(context) {
  const { request } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, detail: "无效请求" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  const token = (body.token || "").trim();
  if (!token) {
    return new Response(JSON.stringify({ ok: false, detail: "Token 不能为空" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }

  // 线上版 Token 通过前端 session 传递，这里仅返回成功
  return new Response(JSON.stringify({ ok: true, message: "妙问 Token 保存成功 ✅" }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
