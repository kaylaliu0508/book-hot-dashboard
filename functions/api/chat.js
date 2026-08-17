/**
 * Cloudflare Pages Function: /api/chat
 * 图书灵感中心 AI 营销助手 - 聊天 API
 * 
 * 使用 DeepSeek API 作为 LLM + 图书专属知识库 RAG
 * 使用妙问 API 作为腾讯营销专业问答
 */
import { BOOK_FAQ } from './_faq_data.js';

// ── 安全加固（2026-08-17）：CORS 白名单 + 单 IP 限流 + 每日配额熔断 + 邀请码校验 ──
const ALLOWED_ORIGINS = [
  "https://book-hot-dashboard.pages.dev",
  "http://localhost:8788",
  "http://127.0.0.1:8788"
];

function pickOrigin(request) {
  const o = request.headers.get("Origin") || "";
  return ALLOWED_ORIGINS.includes(o) ? o : ALLOWED_ORIGINS[0];
}

// 滑动窗口限流：每 IP 每分钟最多 10 次（isolate 内存级，防脚本刷量）
const rateBuckets = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    rateBuckets.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateBuckets.set(ip, hits);
  if (rateBuckets.size > 5000) rateBuckets.clear();
  return false;
}

// 全站每日配额熔断（isolate 内存级计数，防 IP 池绕过单 IP 限流）
let dailyCounter = { date: "", count: 0 };

function hitDailyQuota(limit) {
  const today = new Date().toISOString().slice(0, 10);
  if (dailyCounter.date !== today) dailyCounter = { date: today, count: 0 };
  dailyCounter.count += 1;
  return dailyCounter.count > limit;
}

// ── 意图路由 ──
const INTENT_RULES = [
  {
    intent: "MIAOWEN_AUDIT",
    keywords: ["预审", "拒审", "审核状态", "素材审核", "能不能过审", "过不过审", "素材修复", "审核结果", "违规点", "拒绝原因", "帮我审", "审一下", "素材违规", "审核被拒", "修改建议", "审核通过吗"],
    agentType: "AUDIT"
  },
  {
    intent: "MIAOWEN_DIAGNOSE",
    keywords: ["投放诊断", "广告诊断", "不起量", "掉量", "跑不出去", "跑量差", "消耗低", "adgroup_id", "单条广告", "这条广告", "某条广告", "起量慢", "花不出去", "投不出去", "诊断一下"],
    agentType: "DIAGNOSE"
  },
  {
    intent: "MIAOWEN_ANALYSE",
    keywords: ["深度分析", "账户分析", "投放分析", "对比分析", "环比", "同比", "账户整体", "账户表现", "和上周对比", "和上个月对比", "和昨天对比", "综合分析", "全面分析", "分析一下我的账户"],
    agentType: "ACCOUNT_ANALYSE"
  },
  {
    intent: "MIAOWEN_DATA",
    keywords: ["消耗", "花费", "报表", "数据查询", "查一下数据", "帮我查数据", "转化率", "点击率", "曝光量", "下单量", "成交量", "今天数据", "昨天数据", "本周数据", "账户消耗", "投放消耗", "roi多少", "花了多少", "花了几块", "小时报表", "天级报表", "开户行业", "账号信息", "账户信息", "帮我查下", "查下消耗", "查下数据"],
    agentType: "DATA_QUERY"
  },
  {
    intent: "MIAOWEN_CREATIVE",
    keywords: ["创意灵感", "爆款创意", "优秀创意", "top创意", "创意案例", "参考素材", "大盘创意", "优质素材", "素材参考", "哪类素材好", "什么样的视频", "爆款视频", "视频参考", "图书营销案例", "优秀案例", "好的案例"],
    agentType: "CREATIVE_INSPIRATION"
  },
  {
    intent: "BOOK_KB",
    keywords: ["百宝箱", "图书赛道", "图书行业", "图书商家", "开学季", "isbn", "出版物经营许可", "书号", "灵感中心", "口播脚本", "图片文案", "脚本生成器", "文案生成器", "ai预审", "风控审核", "受众人群", "人群定位", "ams合规", "直播中控台", "中控台数据", "净成交roi", "1小时退货", "小店订单下发", "聚好麦", "禾量", "多多提", "3s快滑率", "3秒快滑", "快滑率", "黄金3s", "视频素材公式", "投诉率阈值", "投诉率", "清退", "0.6%", "1.3%", "永久清退", "换品", "出版物", "图书资质", "图书产品能力", "图书加白", "图书智投", "小程序直购", "微信小店链路", "发货24小时", "建站保证金", "adq违规词", "违规词", "图书审核", "教育行业审核", "黑词赦免", "禁投词", "黑词提报", "选品", "选品地图", "拓品", "组品", "爆品", "客单", "客单价", "roi大概", "跑什么书", "什么书能跑", "榜单", "热投", "热投优品", "周榜", "爆品榜", "成人赛道", "成人教育", "代投", "服务商", "暑期", "暑假", "六一", "高考", "端午", "期末", "开学季", "暑期策略", "暑期选品", "暑期创意", "节点", "营销密码", "投放密码", "选品密码", "内容密码", "增长密码", "合规密码", "冷启动", "爆量", "增长", "弹幕", "轮播卡片", "标签组件", "图文广告", "数据外显", "浮层卡片", "广告专用视频号", "跨主体授权", "激励视频", "二跳直播间", "评论管理", "ocpa学习状态", "学习期", "学习中", "建议关停", "ocpc", "ocpm", "智能出价", "开白", "加白", "申请开白", "产品能力申请", "能力申请", "艾米智投", "净成交", "直播快推", "智投扶持", "roi开白", "一方跑量"],
    agentType: null
  },
  {
    intent: "MIAOWEN_PLAIN",
    keywords: ["开户", "充值", "资质审核", "账户权限", "账户设置", "朋友圈营销", "朋友圈广告", "视频号营销", "视频号广告", "公众号营销", "公众号广告", "微信广告", "出价策略", "定向设置", "人群包", "dmp", "自定义人群", "lookalike", "版位", "落地页", "h5", "小程序投放", "营销政策", "营销规范", "内容审核规范", "违规处罚", "保证金扣罚", "违规分级", "腾讯营销", "腾讯广告", "adq", "微信广告平台", "投放教程", "新手入门", "如何投放", "竞价投放", "合约投放"],
    agentType: null
  }
];

const HYBRID_TRIGGERS = ["审核", "驳回", "复审", "催审", "黑词", "敏感词", "素材", "视频", "创意", "脚本", "链路", "转化", "roi", "怎么优化", "如何提升", "有什么建议"];

function detectIntent(query) {
  const q = query.toLowerCase().trim();
  for (const rule of INTENT_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (q.includes(kw.toLowerCase())) score += 2;
    }
    if (score >= 2) {
      return { intent: rule.intent, agentType: rule.agentType, score };
    }
  }
  const hybridScore = HYBRID_TRIGGERS.filter(kw => q.includes(kw)).length;
  if (hybridScore >= 1) return { intent: "HYBRID", agentType: null, score: hybridScore };
  return { intent: "MIAOWEN_PLAIN", agentType: null, score: 0 };
}

function getIntentLabel(intent) {
  const labels = {
    "BOOK_KB": "📚 图书专属知识",
    "MIAOWEN_PLAIN": "🔍 营销规则查询",
    "MIAOWEN_DATA": "📊 投放数据查询",
    "MIAOWEN_ANALYSE": "📈 账户深度分析",
    "MIAOWEN_DIAGNOSE": "🔬 投放诊断",
    "MIAOWEN_CREATIVE": "🎨 创意灵感",
    "MIAOWEN_AUDIT": "✅ 素材审核",
    "HYBRID": "🔀 综合解答",
  };
  return labels[intent] || "💬 智能问答";
}

// ── FAQ 知识库（从 _faq_data.js 导入）──

// ── RAG 检索 ──
const KEYWORDS_MAP = {
  "报表看数": ["报表", "数据", "统计", "口径", "gap", "订单量", "roi", "中控台"],
  "审核规则": ["审核", "驳回", "拒审", "催审", "复审", "黑词", "违规", "敏感词", "预审", "合规"],
  "创意制作": ["创意", "素材", "视频", "封面", "快滑率", "脚本", "3s", "黄金", "口播", "文案"],
  "投放链路": ["链路", "小程序", "小店", "cid", "直购", "线索", "聚好麦", "禾量"],
  "发货与售后": ["发货", "售后", "投诉", "物流", "处罚", "投诉率", "清退"],
  "开户资质": ["开户", "资质", "许可证", "isbn", "出版物"],
  "投放优化": ["不起量", "优化", "出价", "定向", "学习期", "跑量", "掉量", "选品"],
  "产品能力": ["产品", "加白", "智投", "全域通", "视频号", "原生视频", "分人群"],
};

function ragSearch(query, faqData, topK = 3) {
  const q = query.toLowerCase();
  const scores = [];
  for (const faq of faqData) {
    let score = 0;
    const text = (faq.question + faq.answer + faq.category).toLowerCase();
    for (const char of q) {
      if (char !== ' ' && char !== '，' && char !== '。' && text.includes(char)) score += 1;
    }
    for (const [, kws] of Object.entries(KEYWORDS_MAP)) {
      for (const kw of kws) {
        if (q.includes(kw) && text.includes(kw)) score += 5;
      }
    }
    scores.push({ score, faq });
  }
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topK).filter(s => s.score > 0).map(s => s.faq);
}

// ── DeepSeek API 调用 ──
async function callDeepSeek(messages, apiKey) {
  const resp = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-v4-flash", // 2026-06-26 优化: 切到 v4-flash，成本降 ~90%（A/B 已验证）
      messages,
      max_tokens: 1500,
      temperature: 0.7
    })
  });
  if (!resp.ok) {
    throw new Error(`DeepSeek API error: ${resp.status} ${await resp.text()}`);
  }
  const data = await resp.json();
  return data.choices[0].message.content;
}

// ── 妙问 API 调用（HTTP 版） ──
async function callMiaowen(query, agentType, token, agentParams) {
  const payload = { query };
  if (agentType) payload.agent_type = agentType;
  if (agentParams) payload.agent_params = agentParams;

  const resp = await fetch("https://api.miaowen.qq.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    return { ok: false, message: `妙问 API ${resp.status}` };
  }

  const data = await resp.json();
  if (data.code && data.code !== 0) {
    return { ok: false, message: data.message || "妙问返回错误" };
  }

  const content = data?.data?.answer || data?.answer || data?.content || "";
  return { ok: true, content };
}

// ── System Prompt ──
const BOOK_SYSTEM_PROMPT = `你是"图图"，图书灵感中心官方智能助手，专门帮助图书行业商家解决腾讯营销投放问题。

性格特点：亲切活泼、专业严谨，偶尔用 emoji，像朋友一样交流 📚
语言风格：简洁清晰，复杂问题用列表/步骤展示

专业领域：
- 图书行业营销审核规则与合规（百宝箱内容）
- ADQ / 微信广告投放操作
- 投放数据报表解读（ROI、订单口径等）
- 创意素材制作（黄金3S公式、快滑率优化）
- 投放链路（小程序直购、微信小店、CID）
- 发货售后规范与投诉率管理
- 图书行业特殊产品能力（智投、全域通、加白）

术语使用规范：
- 品牌/平台名称：腾讯营销、朋友圈营销、视频号营销、公众号营销
- 小店特殊：小店投放
- 业务模式：竞价投放、合约投放
- 操作动词：投放、曝光、转化

重要提示：
1. 以下【图书专属知识库】为你的核心依据，请优先参考
2. 知识库未覆盖的内容，基于腾讯营销专业知识回答，并注明「仅供参考，以官方最新规定为准」
3. 每次回答图书行业相关专属知识时，必须在回答最后附上以下一行：
---
📖 **图书百宝箱**：https://doc.weixin.qq.com/sheet/e3_ARQAcAYdADQCNZz0W7RYCTpqftLNo?scode=AJEAIQdfAAo6Qdb0c2ANoA7waBACc&tab=ine1mz

【图书专属知识库】
{KNOWLEDGE}`;

const BAOBAO_LINK = "\n\n---\n📖 **图书百宝箱**：https://doc.weixin.qq.com/sheet/e3_ARQAcAYdADQCNZz0W7RYCTpqftLNo?scode=AJEAIQdfAAo6Qdb0c2ANoA7waBACc&tab=ine1mz";

// ── 主处理逻辑 ──
export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = pickOrigin(request);

  // 限流：超出频率直接 429
  const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
  if (isRateLimited(clientIP)) {
    return new Response(JSON.stringify({
      content: "⏱️ 操作太频繁啦，请 1 分钟后再试～",
      source: "rate_limit",
      intent_label: "⏱️ 限流保护"
    }), { status: 429, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin } });
  }

  // 邀请码服务端校验（配置 INVITE_CODE 环境变量后强制生效）
  const INVITE_CODE = env.INVITE_CODE || "";
  if (INVITE_CODE && request.headers.get("X-Invite-Code") !== INVITE_CODE) {
    return new Response(JSON.stringify({
      content: "🔒 邀请码无效或已过期，请刷新页面重新输入",
      source: "auth",
      intent_label: "🔒 访问受限"
    }), { status: 403, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin } });
  }

  // 全站每日配额熔断：超限全站暂停，防止大规模刷量
  const dailyLimit = parseInt(env.DAILY_QUOTA || "500", 10);
  if (hitDailyQuota(dailyLimit)) {
    return new Response(JSON.stringify({
      content: "😴 今日服务额度已用完，请明天再来～\n\n如有紧急需求请联系管理员。",
      source: "quota",
      intent_label: "😴 配额熔断"
    }), { status: 429, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin } });
  }
  
  const DEEPSEEK_KEY = env.DEEPSEEK_API_KEY;
  const MIAOWEN_TOKEN = env.MIAOWEN_TOKEN || ""; // 安全加固：不再硬编码兜底 Token
  
  if (!DEEPSEEK_KEY) {
    return new Response(JSON.stringify({ 
      content: "⚠️ 服务配置异常，请联系管理员设置 DEEPSEEK_API_KEY", 
      source: "error" 
    }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin } });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "无效请求" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  // 输入加固：最多保留最近 12 条消息，单条截断至 2000 字符，防止超大 history 烧 token
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-12)
    .map(m => ({
      role: m && m.role === "assistant" ? "assistant" : "user",
      content: String((m && m.content) || "").slice(0, 2000)
    }));
  const userMsgs = messages.filter(m => m.role === "user");
  if (!userMsgs.length) {
    return new Response(JSON.stringify({ error: "消息不能为空" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const query = userMsgs[userMsgs.length - 1].content;
  // 2026-06-26 优化: history 截断到最近 12 条（前端最多传 10+1 轮，这里设 12 留余量）
  const history = messages.slice(-12, -1).map(m => ({ role: m.role, content: m.content }));

  // Token 绑定指令
  const tokenMatch = query.match(/绑定[Tt]oken\s*(sk-mw-[a-zA-Z0-9]+)/);
  if (tokenMatch) {
    return jsonResponse({
      content: `✅ **Token 绑定成功！**\n\n您的专属 Token 已生效（\`${tokenMatch[1].slice(0, 12)}...\`），现在可以查询您账户下的投放数据了。\n\n试试问我：\n• 「帮我查最近7天的消耗数据」\n• 「分析我的账户最近的投放情况」`,
      source: "system",
      intent_label: "🔑 Token 绑定",
      session_token: tokenMatch[1]
    });
  }

  // 意图路由
  const intentInfo = detectIntent(query);
  const { intent, agentType } = intentInfo;
  const label = getIntentLabel(intent);

  try {
    let result;

    if (intent === "BOOK_KB" || intent === "HYBRID") {
      // 图书知识库 + DeepSeek
      result = await handleBookKB(query, history, DEEPSEEK_KEY, MIAOWEN_TOKEN, intent === "HYBRID");
    } else if (agentType) {
      // 妙问专项 Agent
      const mwResult = await callMiaowen(query, agentType, body.session_token || MIAOWEN_TOKEN);
      if (mwResult.ok && mwResult.content) {
        result = { content: mwResult.content, source: "miaowen_agent" };
      } else {
        // 妙问失败，DeepSeek 兜底
        result = await handleBookKB(query, history, DEEPSEEK_KEY, MIAOWEN_TOKEN, false);
      }
    } else {
      // 妙问通用问答
      const mwResult = await callMiaowen(query, null, body.session_token || MIAOWEN_TOKEN);
      if (mwResult.ok && mwResult.content) {
        result = { content: mwResult.content, source: "miaowen_plain" };
      } else {
        result = await handleBookKB(query, history, DEEPSEEK_KEY, MIAOWEN_TOKEN, false);
      }
    }

    result.intent_label = label;
    return jsonResponse(result);

  } catch (err) {
    return jsonResponse({
      content: `😅 服务暂时出了小问题，请稍后再试～\n\n错误信息：${err.message}`,
      source: "error",
      intent_label: "⚠️ 服务异常"
    });
  }
}

// GET：轻量校验邀请码（前端邀请门专用，不消耗 LLM 额度）
export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = pickOrigin(request);
  const INVITE_CODE = env.INVITE_CODE || "";
  const ok = !INVITE_CODE || request.headers.get("X-Invite-Code") === INVITE_CODE;
  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 403,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin }
  });
}

// OPTIONS 预检请求
export async function onRequestOptions(context) {
  const origin = pickOrigin(context.request);
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Invite-Code",
    }
  });
}

// ── LRU 响应缓存（2026-06-26 优化）──
// 同 query 在 TTL 内直接返回，省一次 DeepSeek 调用
// 用 Map 维持 LRU，最大 100 条，TTL 30 分钟
const _cache = new Map();
const CACHE_MAX = 100;
const CACHE_TTL_MS = 30 * 60 * 1000;

function cacheKey(query, historyLen, isHybrid) {
  // 简单归一化：去除空格/标点差异
  const norm = query.replace(/[\s，。！？、；：,.!?;:]+/g, '').toLowerCase();
  return `${norm}#h${historyLen}#${isHybrid ? 'H' : 'N'}`;
}

function cacheGet(key) {
  const hit = _cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.t > CACHE_TTL_MS) {
    _cache.delete(key);
    return null;
  }
  // 命中后移到末尾（LRU 语义）
  _cache.delete(key);
  _cache.set(key, hit);
  return hit.v;
}

function cacheSet(key, value) {
  if (_cache.size >= CACHE_MAX) {
    // 删除最久未用的（Map 第一个元素）
    const firstKey = _cache.keys().next().value;
    _cache.delete(firstKey);
  }
  _cache.set(key, { v: value, t: Date.now() });
}

async function handleBookKB(query, history, deepseekKey, miaowenToken, isHybrid) {
  // 2026-06-26 优化: 先查缓存
  const ck = cacheKey(query, history.length, isHybrid);
  const cached = cacheGet(ck);
  if (cached) {
    return { content: cached, source: "book_kb_cache" };
  }

  // 加载 FAQ（从 KV 或内嵌）
  const faqData = getEmbeddedFAQ();
  const faqs = ragSearch(query, faqData, 2); // 2026-06-26 优化: top-3 → top-2，省 ~33% RAG token

  let knowledgeContext = "";
  if (faqs.length > 0) {
    knowledgeContext = faqs.map(f => `【${f.category}】Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
  } else {
    knowledgeContext = "（知识库中未找到直接相关条目，请基于腾讯营销图书行业专业知识回答）";
  }

  const systemContent = BOOK_SYSTEM_PROMPT.replace("{KNOWLEDGE}", knowledgeContext);
  const dsMessages = [{ role: "system", content: systemContent }, ...history, { role: "user", content: query }];

  let content = await callDeepSeek(dsMessages, deepseekKey);
  if (!content.includes("doc.weixin.qq.com")) {
    content += BAOBAO_LINK;
  }

  // HYBRID 模式：补充妙问回答
  if (isHybrid) {
    const mwResult = await callMiaowen(query, null, miaowenToken);
    if (mwResult.ok && mwResult.content && mwResult.content.length > 50) {
      content += `\n\n---\n**📡 腾讯广告官方补充：**\n${mwResult.content}`;
    }
  }

  // 2026-06-26 优化: 写缓存（HYBRID 模式不缓存，因为含妙问实时数据）
  if (!isHybrid) {
    cacheSet(ck, content);
  }
  return { content, source: "book_kb" };
}

function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0]
    }
  });
}

// FAQ 数据来自 _faq_data.js 模块
function getEmbeddedFAQ() {
  return BOOK_FAQ;
}
