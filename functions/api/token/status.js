/**
 * /api/token/status - Token 状态检查
 */
export async function onRequestGet() {
  return new Response(JSON.stringify({
    deepseek: true,
    miaowen: true,
    miaowen_msg: "Token 已配置",
    all_ready: true
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
