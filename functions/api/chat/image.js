/**
 * Cloudflare Pages Function: /api/chat/image
 * 图片素材预审接口（简化版）
 * 
 * 由于 Pages Functions 限制，图片预审功能在线上版采用简化逻辑：
 * 接收图片+文本，转换为文本描述后走普通 chat 接口
 */

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: corsHeaders() });

export async function onRequestPost(context) {
  const { request } = context;
  
  try {
    const formData = await request.formData();
    const message = formData.get('message') || '';
    const image = formData.get('image');
    
    // 简化处理：返回引导信息
    const reply = `📸 **图片素材预审**\n\n您上传了一张广告素材图片${message ? `，并询问：${message}` : ''}。\n\n💡 **预审建议**：\n- 文字内容请避免极限词（最、第一、唯一等）\n- 避免功效承诺（包治、根治、立刻见效等）\n- 避免迷信噱头（开光、转运、风水等）\n- K12 教培素材请避免承诺成绩提升\n- 图书品类避免「禁书」「绝版」等敏感表述\n\n如需更详细的素材审核建议，请：\n1. 复制图片中的文字内容直接发给我做文本审核\n2. 或访问主站「**AI预审**」TAB 进行批量预审\n3. 联系腾讯营销对接运营进行人工审核\n\n（说明：线上版图片识别能力暂未开放，请使用文本预审获得更准确的反馈）`;
    
    return new Response(JSON.stringify({
      content: reply,
      source: 'miaowen_audit',
      intent_label: '✅ 素材审核引导',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      content: '😅 图片审核处理失败，请改用文本输入审核内容～',
      source: 'error',
      detail: err.message,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
}
