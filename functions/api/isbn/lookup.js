/**
 * ISBN 多源兜底查询代理 - Pages Functions
 *
 * 数据源（已加超时 + 并行优先策略）：
 *   1) data.isbn.work          —— 国内库（含 bookDesc/pages/words 等富字段，限流时直接 fail-fast）
 *   2) 豆瓣 book.douban.com    —— 服务端 fetch + og:title + #info + .intro
 *   3) 当当 search.dangdang.com —— GBK 列表 → 详情，对新书覆盖最广
 *   4) Google Books            —— 国内不稳，但 CF Workers 边缘可访问
 *
 * 路由：GET /api/isbn/lookup?isbn=9787115694966
 * 返回：{ok, source, sourceUrl, ..., attempted: [{source, ok, reason}]}
 */

const RATE_LIMIT = 60;       // 每 IP 每分钟 60 次（识别 + 用户重试足够）
const RATE_WINDOW_MS = 60 * 1000;
const rateMap = new Map();

// ⏱️ 单源超时（避免 CF Workers 总执行时间 30s 上限被某个挂起的源拖死）
const SOURCE_TIMEOUT_MS = 4500; // 单源 4.5s，4 源并行 = 整体 ≤ 5s 内必出结果

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

function buildCors(env, request) {
  const allowed = (env && env.ALLOWED_ORIGIN) || '*';
  const origin = request.headers.get('origin') || '';
  let allowOrigin = '*';
  if (allowed !== '*') {
    const list = allowed.split(',').map((s) => s.trim()).filter(Boolean);
    allowOrigin = list.includes(origin) ? origin : list[0] || '*';
  }
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function jsonResp(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  });
}

// 给任意 fetch 加超时（CF Workers 支持 AbortSignal.timeout，这里用 AbortController 兼容）
function fetchWithTimeout(url, opts, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs || SOURCE_TIMEOUT_MS);
  return fetch(url, { ...(opts || {}), signal: ctrl.signal })
    .finally(() => clearTimeout(t));
}

// ---------------- 数据源 1：data.isbn.work（优先级最高，给更长超时） ----------------
// 🧹 全局：电商卖点尾巴清洗（isbn.work / 当当 共用）
//
// 设计思路：不依赖关键词枚举（'给孩子'/'秘籍'/'告别焦虑'…会写不完），
// 改用**纯结构化规则**识别"真书名 + 电商卖点尾巴"的通用模式。
//
// 真书名特征：长度通常 ≤ 8 字、是连续语义单元、内部不含明显的句子停顿。
// 电商污染特征：在真书名后接一长串描述句，常用 6 种结构标记中的 ≥1 个：
//   ① 空格分隔卖点（'这样吃长更高 给孩子的长高营养食谱…'）
//   ② '给X的'/'写给'/'送给' 介词结构（电商写卖点最常用的中文语法）
//   ③ '0-18岁' / '3-6岁' / '7-9年级' 数字-数字+受众范围
//   ④ '，、；！？' 等中文句子停顿标点
//   ⑤ '：—－·' 副标题分隔符
//   ⑥ 纯连续中文 > 12 字且无任何分隔符（电商把"真书名 + N 段卖点"首尾相连的特征）
//
// 阈值 8：≤ 8 字一律不动（中国出版业 95% 主书名在 8 字内，避免误伤）。
function trimEcommerceTail(t) {
  if (!t) return t;
  if (t.length <= 8) return t; // ≤ 8 字一律不动（百年孤独、解忧杂货店、如何阅读一本书 等正常书名）

  // 规则 1：空格分割（最可靠的电商分隔信号）
  //   电商通常在真书名后用空格分隔卖点描述，首空格前 2-15 字即真书名。
  const firstSpace = t.search(/[\s\u3000]/);
  if (firstSpace >= 2 && firstSpace < 16) return t.slice(0, firstSpace).trim();

  // 规则 2：'给X的' / '写给' / '送给' 介词结构（中文电商卖点的标志性语法）
  const giveM = t.match(/(写给|送给|给\S{1,4}的)/);
  if (giveM && giveM.index >= 2 && giveM.index <= 16) return t.slice(0, giveM.index).trim();

  // 规则 3：数字-数字+岁/年级（"0-18岁"、"3-6岁"、"7-9年级"等受众范围标记）
  const numM = t.match(/\d+\s*[\-—~]\s*\d+\s*[岁年级]/);
  if (numM && numM.index >= 2) return t.slice(0, numM.index).trim();

  // 规则 4：中文句子停顿标点（真书名内极少出现）
  const punctIdx = t.search(/[，、；！？]/);
  if (punctIdx >= 2 && punctIdx < 16) return t.slice(0, punctIdx).trim();

  // 规则 5：副标题分隔符（'：' '—' '－' '·'）→ 切到主书名
  const subTitleM = t.match(/[：—－·]/);
  if (subTitleM && subTitleM.index >= 2 && subTitleM.index <= 16) return t.slice(0, subTitleM.index).trim();

  // 🆕 规则 6：纯连续中文 > 12 字且无任何分隔符 → 截到前 8 字
  //   中文出版业事实规律：真书名一旦超过 12 字几乎必带分隔符（副标题/空格/标点）
  //   12+ 字纯连续中文 = 电商把"真书名 + N 段卖点"直接首尾相连的强特征
  //   典型案例：「漫画帝王家书修言行练处世谋略」(14字) - "修言行练处世谋略" 是电商加的卖点
  //   保守截至前 8 字（边界书如「高效能人士的七个习惯」10字 / 「你所不知道的关于猫的一切」12字 仍能不被切到）
  if (t.length > 12 && /^[\u4e00-\u9fa5]+$/.test(t)) {
    return t.slice(0, 8).trim();
  }

  // 规则 7：兜底（前 6 个规则都没命中但仍 > 25 字 → 取前 12 字保住基本可读性）
  if (t.length > 25) return t.slice(0, 12).trim();

  return t;
}

async function fetchIsbnWork(isbn) {
  // 私人 appKey（5100 次额度，2026-06-02 领取，独享配额避免与公共 key 抢资源）
  const url = 'https://data.isbn.work/openApi/getInfoByIsbn?isbn=' + isbn + '&appKey=69b68942b3314eb79000850365a50047';
  // isbn.work 是国内库覆盖最广的源，给 7s 超时（比其他源多 2.5s），4 源并行整体仍 ≤ 7s
  const r = await fetchWithTimeout(url, { cf: { cacheTtl: 0 } }, 7000);
  if (!r.ok) return { ok: false, reason: 'HTTP ' + r.status };
  const data = await r.json().catch(() => null);
  if (!data) return { ok: false, reason: 'invalid json' };
  if (data.code !== 0 || !data.data || !data.data.bookName) {
    // 把 isbn.work 的原始 msg 透传给前端（如"未找到图书信息" / "次数不足"等）
    return { ok: false, reason: data.msg || ('code=' + data.code) };
  }
  const d = data.data;
  if (/次数不足|请求过快|api|key/i.test(d.bookName)) return { ok: false, reason: 'limited' };
  // 清洗 bookName 的电商卖点尾巴（ISBN 国内库给的 bookName 几乎照抄电商标题，常含一长串卖点）
  const cleanedTitle = trimEcommerceTail(String(d.bookName || '').trim());
  return {
    ok: true,
    source: 'ISBN国内数据库 (data.isbn.work)',
    sourceUrl: 'https://data.isbn.work/',
    title: cleanedTitle || String(d.bookName || '').trim(),
    authors: d.author || '',
    publisher: d.press || '',
    date: d.pressDate || '',
    bookDesc: d.bookDesc || '',
    pages: d.pages || '',
    words: d.words || '',
    format: d.format || '',
    binding: d.binding || '',
    price: d.price ? (d.price / 100).toFixed(2) + '元' : '',
    clcName: d.clcName || '',
    edition: d.edition || '',
    pressPlace: d.pressPlace || '',
    language: d.language || '',
  };
}

// ---------------- 数据源 2：豆瓣 ----------------
function pickAttr(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : '';
}
function decodeHtml(s) {
  return String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}
function stripTags(s) { return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }

function parseDoubanInfo(html, label) {
  const re = new RegExp('<span class="pl">\\s*' + label + '\\s*:?\\s*</span>([\\s\\S]*?)<br', 'i');
  const m = html.match(re);
  if (!m) return '';
  return stripTags(decodeHtml(m[1])).replace(/^[:：\s]+/, '').trim();
}

async function fetchDouban(isbn) {
  const url = 'https://book.douban.com/isbn/' + isbn + '/';
  const r = await fetchWithTimeout(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9',
    },
    cf: { cacheTtl: 86400 },
  });
  if (!r.ok) return { ok: false, reason: 'HTTP ' + r.status };
  const finalUrl = r.url || url;
  if (!/\/subject\//.test(finalUrl)) return { ok: false, reason: 'not found (no subject)' };
  const html = await r.text();
  const title = pickAttr(html, /<meta property="og:title"\s+content="([^"]+)"/);
  if (!title) return { ok: false, reason: 'no og:title (maybe blocked)' };
  const ogUrl = pickAttr(html, /<meta property="og:url"\s+content="([^"]+)"/) || finalUrl;

  const authors = parseDoubanInfo(html, '作者');
  const publisher = parseDoubanInfo(html, '出版社');
  const date = parseDoubanInfo(html, '出版年');
  const pages = parseDoubanInfo(html, '页数');
  const price = parseDoubanInfo(html, '定价');
  const binding = parseDoubanInfo(html, '装帧');

  let bookDesc = '';
  const introM = html.match(/<div class="intro">([\s\S]*?)<\/div>/);
  if (introM) {
    const paras = introM[1].match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
    bookDesc = paras.map((p) => stripTags(decodeHtml(p))).filter(Boolean).join('\n').trim();
    bookDesc = bookDesc.replace(/\(展开全部\)\s*$/, '').trim();
  }

  return {
    ok: true,
    source: '豆瓣读书',
    sourceUrl: ogUrl,
    title: decodeHtml(title).trim(),
    authors,
    publisher,
    date,
    bookDesc,
    pages,
    words: '',
    format: '',
    binding,
    price,
    clcName: '',
    edition: '',
    pressPlace: '',
    language: '',
  };
}

// ---------------- 数据源 3：当当（列表 → 详情双跳，GBK 编码） ----------------
async function fetchDangdang(isbn) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    'Accept-Language': 'zh-CN,zh;q=0.9',
  };

  const listUrl = 'http://search.dangdang.com/?key=' + isbn + '&act=input';
  const rL = await fetchWithTimeout(listUrl, { redirect: 'follow', headers }, 2500);
  if (!rL.ok) return { ok: false, reason: 'list HTTP ' + rL.status };
  const listBuf = await rL.arrayBuffer();
  let listH = '';
  try { listH = new TextDecoder('gbk').decode(listBuf); }
  catch (e) { listH = new TextDecoder('utf-8').decode(listBuf); }

  const ulM = listH.match(/<ul class="bigimg[\s\S]+?<\/ul>/);
  if (!ulM) return { ok: false, reason: 'no result list' };
  const lis = ulM[0].split(/(?=<li[^>]*ddt-pit)/).filter((s) => /class="name"/.test(s));
  if (!lis.length) return { ok: false, reason: 'no item' };
  const detailUrls = [];
  for (let i = 0; i < Math.min(3, lis.length); i += 1) {
    const uM = lis[i].match(/class="name"[^<]*<a[^>]*href="(\/\/product\.dangdang\.com\/\d+\.html)/);
    if (uM) detailUrls.push('http:' + uM[1]);
  }
  if (!detailUrls.length) return { ok: false, reason: 'no detail url' };

  for (const dUrl of detailUrls) {
    try {
      const rD = await fetchWithTimeout(dUrl, { redirect: 'follow', headers }, 1500);
      if (!rD.ok) continue;
      const dBuf = await rD.arrayBuffer();
      let dH = '';
      try { dH = new TextDecoder('gbk').decode(dBuf); }
      catch (e) { dH = new TextDecoder('utf-8').decode(dBuf); }

      const iM = dH.match(/I\s?S\s?B\s?N[：:]?\s*(97[89][\-0-9]{10,14})/)
        || dH.match(/国际标准书号[^0-9]{0,10}(97[89][\-0-9]{10,14})/);
      let detectedIsbn = iM ? iM[1].replace(/-/g, '') : '';
      if (detectedIsbn.length > 13) detectedIsbn = detectedIsbn.slice(0, 13);
      if (detectedIsbn !== isbn) continue;

      const h1M = dH.match(/<h1[^>]*>([\s\S]+?)<\/h1>/);
      let title = h1M ? stripTags(decodeHtml(h1M[1])) : '';
      title = title.replace(/\s+/g, ' ').trim();
      if (!title) continue;

      const bodyIdx = dH.indexOf('<body');
      const dB = bodyIdx > 0 ? dH.slice(bodyIdx) : dH;

      const pubM = dB.match(/出\s*版\s*社[：:]\s*<a[^>]*>([^<]+)<\/a>/)
        || dB.match(/出\s*版\s*社[：:]\s*([\u4e00-\u9fa5A-Za-z0-9·]{2,30})/);
      const publisher = pubM ? decodeHtml(pubM[1]).trim() : '';

      const auMRaw = dB.match(/作\s*者[：:]\s*<a[^>]*>([^<]+)<\/a>/)
        || dB.match(/作\s*者[：:]\s*([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9·\s]{1,38})/);
      let authors = '';
      if (auMRaw) {
        authors = decodeHtml(auMRaw[1]).trim();
        if (/^[，,。.：:]/.test(authors) || /出版社|简介|书评|当当|价格|图片/.test(authors)) authors = '';
        authors = authors
          .replace(/(\s*(编著|主编|主审|编|著|译)\s*){2,}$/g, ' $2')
          .replace(/\s+/g, ' ')
          .trim();
      }

      const dtM = dB.match(/出版时间[：:]\s*(\d{4}[-/]\d{1,2}[-/]?\d{0,2})/);
      const date = dtM ? dtM[1].replace(/\//g, '-') : '';

      const prM = dB.match(/当当价[\s\S]{0,80}?&yen;\s*([\d.]+)/);
      const price = prM ? prM[1] + '元' : '';

      const pgM = dB.match(/页\s*数[：:]\s*(\d+)/);
      const pages = pgM ? pgM[1] + '页' : '';

      let cleanTitle = title
        .replace(new RegExp('\\s*' + isbn + '\\s*', 'g'), ' ')
        .replace(/【[^】]*】/g, '')
        .replace(/（[^）]*）/g, '')
        .replace(/\([^)]*\)/g, '');
      if (publisher && cleanTitle.indexOf(publisher) >= 0) {
        cleanTitle = cleanTitle.split(publisher).join(' ');
      }
      if (authors && cleanTitle.indexOf(authors) >= 0) {
        cleanTitle = cleanTitle.split(authors).join(' ');
      }
      cleanTitle = cleanTitle
        .replace(/\s+(编著|主编|主审|编|著|译)(\s+(编著|主编|主审|编|著|译))*\s*$/g, '')
        .replace(/\s+(著|编|主编|主审|译|编著)\s*/g, ' ')
        .replace(/(正版|包邮|现货|新华书店|赠品|套装|平装|精装|博库|文轩|可开发票|官方|当当自营|自营同款)+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // 🧹 电商卖点尾巴清洗（共用全局 trimEcommerceTail，见文件顶部）
      const beforeTrim = cleanTitle;
      cleanTitle = trimEcommerceTail(cleanTitle);
      if (cleanTitle && cleanTitle.length >= 2) title = cleanTitle;
      else title = beforeTrim; // 极端情况下不要把书名清空

      const finalAuthors = /^(不详|未知|佚名)$/.test(authors) ? '' : authors;

      return {
        ok: true,
        source: '当当网',
        sourceUrl: dUrl,
        title,
        authors: finalAuthors,
        publisher,
        date,
        bookDesc: '',
        pages,
        words: '',
        format: '',
        binding: '',
        price,
        clcName: '',
        edition: '',
        pressPlace: '',
        language: '',
      };
    } catch (e) { /* try next */ }
  }
  return { ok: false, reason: 'no ISBN match in top-3 details' };
}

// ---------------- 数据源 4：Google Books ----------------
async function fetchGoogleBooks(isbn) {
  const url = 'https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn + '&maxResults=1';
  const r = await fetchWithTimeout(url, {});
  if (!r.ok) return { ok: false, reason: 'HTTP ' + r.status };
  const data = await r.json().catch(() => null);
  if (!data || !data.totalItems || !data.items || !data.items.length) {
    return { ok: false, reason: 'no results' };
  }
  const info = data.items[0].volumeInfo || {};
  if (!info.title) return { ok: false, reason: 'no title' };
  return {
    ok: true,
    source: 'Google Books',
    sourceUrl: 'https://books.google.com/books?isbn=' + isbn,
    title: info.title + (info.subtitle ? ' ' + info.subtitle : ''),
    authors: (info.authors || []).join('/'),
    publisher: info.publisher || '',
    date: info.publishedDate || '',
    bookDesc: info.description || '',
    pages: info.pageCount ? String(info.pageCount) + '页' : '',
    words: '',
    format: '',
    binding: '',
    price: '',
    clcName: (info.categories || []).join('/'),
    edition: '',
    pressPlace: '',
    language: info.language || '',
  };
}

// 数据源元信息（用于失败时给前端渲染清晰链路）
const SOURCE_DEFS = [
  { name: 'isbn.work',   label: 'ISBN国内数据库',   fn: fetchIsbnWork,    priority: 0 },
  { name: 'douban',      label: '豆瓣读书',         fn: fetchDouban,      priority: 1 },
  { name: 'dangdang',    label: '当当网',           fn: fetchDangdang,    priority: 2 },
  { name: 'googleBooks', label: 'Google Books',     fn: fetchGoogleBooks, priority: 3 },
];

// ---------------- 主入口（4 源并行尝试，按优先级取首个命中）----------------
async function handle(request, env) {
  const cors = buildCors(env, request);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }
  if (request.method !== 'GET') {
    return jsonResp({ ok: false, error: 'method not allowed' }, 405, cors);
  }

  const ip = request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')
    || 'unknown';
  if (rateLimited(ip)) {
    return jsonResp({ ok: false, error: 'rate limited (60/min)' }, 429, cors);
  }

  const url = new URL(request.url);
  const isbn = (url.searchParams.get('isbn') || '').trim().replace(/[-\s]/g, '');
  if (!/^\d{10,13}$/.test(isbn)) {
    return jsonResp({ ok: false, error: 'invalid isbn' }, 400, cors);
  }

  // ⚡ 4 源并行尝试 —— 等所有源结束后按优先级返回最优命中
  //    这样单源 hang 不会拖累整体（最差也只等 SOURCE_TIMEOUT_MS）
  const wrap = async (s) => {
    try {
      const r = await s.fn(isbn);
      return { name: s.name, label: s.label, priority: s.priority, ok: !!r.ok, reason: r.reason || '', data: r };
    } catch (e) {
      const msg = String((e && e.name) === 'AbortError' ? 'timeout' : (e && e.message) || e).slice(0, 120);
      return { name: s.name, label: s.label, priority: s.priority, ok: false, reason: msg, data: null };
    }
  };
  const results = await Promise.all(SOURCE_DEFS.map(wrap));

  const attempted = results.map((r) => ({ source: r.name, label: r.label, ok: r.ok, reason: r.reason }));

  // 🎯 书名质量打分（纯结构化，不依赖关键词枚举）
  //
  //    'trimEcommerceTail' 已经按结构截掉电商尾巴，但截后仍可能比同 ISBN 其他源的书名长。
  //    比如 isbn.work 给 '我们生活在(全2册) 中国科幻,侦探小说 天瑞说符'（被规则1切到首空格 = '我们生活在(全2册)'）
  //          豆瓣给 '我们生活在南京'
  //    豆瓣的 7 字 < isbn.work 的 9 字，且更接近真书名。所以我们按"清洗后剩余长度"打分：越短越优。
  //
  //    评分维度：
  //      ① 长度（每超出 12 字 +1 分，长字符更可能是带噪声残留）
  //      ② 含中文标点 / 英文逗号 / 多个空格（说明结构未理清）
  //      ③ 数字+岁/年级/版（说明仍有受众/版次描述残留）
  function titleQualityPenalty(d) {
    if (!d || !d.title) return 100;
    const t = d.title;
    let penalty = 0;
    // ① 长度惩罚：> 8 字开始扣（每多 1 字 +2 分），> 14 大幅扣，> 20 加重
    //    斜率必须足够大让 6 字的源能压过 14 字的源（即使后者优先级更高）
    if (t.length > 8) penalty += (t.length - 8) * 2;
    if (t.length > 14) penalty += 5;
    if (t.length > 20) penalty += 10;
    if (t.length > 30) penalty += 30;
    // ② 内部仍有结构性标点（说明清洗未完全分离真书名 + 描述）
    if (/[，、；！？]/.test(t)) penalty += 8;
    if (/\s.{4,}/.test(t)) penalty += 5; // 含空格+后续 4+ 字
    // ③ 含数字-数字+岁/年级（受众范围残留）
    if (/\d+[\-—~]\d+[岁年级]/.test(t)) penalty += 10;
    return penalty;
  }

  // 🛡️ 源间交叉验证（纯结构化，防止当当/Google Books 等源返回"ISBN 匹配但书名完全不同"的脏数据）
  //
  // 真实案例（9787537766289）：
  //   - isbn.work 返回 '漫画帝王家书修言行练处世谋略'（真书名）
  //   - 当当详情页 ISBN 也是 9787537766289，但返回 '执行力漫画版'（同 ISBN 被错误关联到另一本书）
  //   - 当当 6 字 vs isbn.work 14 字，打分让当当胜出 → 输出错误书名
  //
  // 验证规则（无关键词、零词典）：
  //   isbn.work 是付费数据库，权威性最高，把它作为「锚定基准」。
  //   其他源的 title 必须与 isbn.work title **共享前缀 ≥ 3 字** 或 **互为子串**，否则视为不可信脏数据丢弃。
  //   "执行力漫画版" vs "漫画帝王家书修言行练处世谋略" 前缀 0 字重合、互不为子串 → 当当结果被剔除。
  //   "我们生活在(全2册)" vs "我们生活在南京" 前缀 5 字「我们生活在」重合 → 豆瓣结果保留。
  function sharedPrefixLen(a, b) {
    if (!a || !b) return 0;
    const n = Math.min(a.length, b.length);
    let i = 0;
    while (i < n && a[i] === b[i]) i += 1;
    return i;
  }
  function crossValidate(results) {
    const anchor = results.find((r) => r.ok && r.name === 'isbn.work' && r.data && r.data.title);
    if (!anchor) return results; // 没有 isbn.work 锚 → 不做交叉验证，退回原打分
    const anchorTitle = anchor.data.title;
    return results.map((r) => {
      if (!r.ok || r.name === 'isbn.work') return r;
      const t = (r.data && r.data.title) || '';
      if (!t) return r;
      // 共享前缀 ≥ 3 字 且 含 ≥2 个中文字符（避免 'Python程序设计' vs 'Python编程入门' 因 'Python' 共 6 字虚假命中）
      const sp = sharedPrefixLen(anchorTitle, t);
      const sharedHead = anchorTitle.slice(0, sp);
      const cjkCount = (sharedHead.match(/[\u4e00-\u9fa5]/g) || []).length;
      const prefixOk = sp >= 3 && cjkCount >= 2;
      // 互为子串（短书名是长书名的核心；如锚为'漫画帝王家书修言'，副源为'漫画帝王家书'）
      const isSubstr = anchorTitle.indexOf(t) >= 0 || t.indexOf(anchorTitle) >= 0;
      if (prefixOk || isSubstr) return r;
      // 与锚书名无共同前缀且互不为子串 → 视为同 ISBN 的脏关联（如当当历史商品错关 ISBN）
      return { ...r, ok: false, reason: 'cross-validate-fail: title 与 isbn.work 锚不一致 (' + t + ')', data: null };
    });
  }
  const validated = crossValidate(results);

  // 命中源排序：(原 priority + 标题质量惩罚) 越小越优
  const hit = validated
    .filter((r) => r.ok)
    .map((r) => ({ ...r, score: r.priority + titleQualityPenalty(r.data) }))
    .sort((a, b) => a.score - b.score)[0];
  // attempted 用 validated 的状态（让前端能看到"被交叉验证淘汰"的源）
  const attemptedFinal = validated.map((r) => ({ source: r.name, label: r.label, ok: r.ok, reason: r.reason }));
  if (hit && hit.data) {
    return jsonResp({ ok: true, ...hit.data, attempted: attemptedFinal }, 200, cors);
  }
  return jsonResp({ ok: false, error: 'all sources failed', attempted }, 200, cors);
}

export const onRequest = (ctx) => handle(ctx.request, ctx.env);

