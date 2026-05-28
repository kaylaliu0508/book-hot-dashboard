/**
 * ISBN 多源兜底查询代理 - Pages Functions
 *
 * 背景：
 *   - 前端原本直连 https://data.isbn.work/openApi/getInfoByIsbn 。
 *   - 该接口的 appKey 配额会耗尽（返回 {code:1, msg:"请求过快..."}），
 *     一旦限流前端的"自动识别书名"全部失败，导致采集流程整体卡住。
 *   - Google Books 在国内访问不稳定，无法做兜底。
 *
 * 本接口顺序尝试：
 *   1) data.isbn.work          —— 国内库（含 bookDesc/pages/words 等富字段）
 *   2) 豆瓣 book.douban.com    —— 服务端 fetch 后解析 og:title + #info + .intro
 *   3) Google Books            —— 国内不稳，但服务端环境（CF Workers）可访问
 *
 * 路由：GET /api/isbn/lookup?isbn=9787521748390
 * 返回：统一结构 {ok, source, sourceUrl, title, authors, publisher, date,
 *                 bookDesc, pages, words, format, binding, price, clcName,
 *                 edition, pressPlace, language, attempted: [{source, ok, reason}]}
 */

const RATE_LIMIT = 60;       // 每 IP 每分钟 60 次（识别 + 用户重试足够）
const RATE_WINDOW_MS = 60 * 1000;
const rateMap = new Map();

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

// ---------------- 数据源 1：data.isbn.work ----------------
async function fetchIsbnWork(isbn) {
  const url = 'https://data.isbn.work/openApi/getInfoByIsbn?isbn=' + isbn + '&appKey=ae1718d4587744b0b79f940fbef69e77';
  const r = await fetch(url, { cf: { cacheTtl: 0 } });
  if (!r.ok) return { ok: false, reason: 'HTTP ' + r.status };
  const data = await r.json().catch(() => null);
  if (!data) return { ok: false, reason: 'invalid json' };
  if (data.code !== 0 || !data.data || !data.data.bookName) {
    return { ok: false, reason: data.msg || ('code=' + data.code) };
  }
  const d = data.data;
  if (/次数不足|请求过快|api|key/i.test(d.bookName)) return { ok: false, reason: 'limited' };
  return {
    ok: true,
    source: 'ISBN国内数据库 (data.isbn.work)',
    sourceUrl: 'https://data.isbn.work/',
    title: String(d.bookName || '').trim(),
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
  // 匹配 <span class="pl">{label}:?</span> 之后到下一个 <br/> 或 </span> 之前的纯文本
  const re = new RegExp('<span class="pl">\\s*' + label + '\\s*:?\\s*</span>([\\s\\S]*?)<br', 'i');
  const m = html.match(re);
  if (!m) return '';
  return stripTags(decodeHtml(m[1])).replace(/^[:：\s]+/, '').trim();
}

async function fetchDouban(isbn) {
  const url = 'https://book.douban.com/isbn/' + isbn + '/';
  const r = await fetch(url, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9',
    },
    cf: { cacheTtl: 86400 }, // 豆瓣返回稳定，缓存 1 天
  });
  if (!r.ok) return { ok: false, reason: 'HTTP ' + r.status };
  const finalUrl = r.url || url;
  // 豆瓣对未收录 ISBN 会跳转到 /search?... 而非 subject 页
  if (!/\/subject\//.test(finalUrl)) return { ok: false, reason: 'not found (no subject)' };
  const html = await r.text();
  // 防爬：豆瓣有时返回登录墙，关键字段会缺
  const title = pickAttr(html, /<meta property="og:title"\s+content="([^"]+)"/);
  if (!title) return { ok: false, reason: 'no og:title (maybe blocked)' };
  const ogUrl = pickAttr(html, /<meta property="og:url"\s+content="([^"]+)"/) || finalUrl;

  const authors = parseDoubanInfo(html, '作者');
  const publisher = parseDoubanInfo(html, '出版社');
  const date = parseDoubanInfo(html, '出版年');
  const pages = parseDoubanInfo(html, '页数');
  const price = parseDoubanInfo(html, '定价');
  const binding = parseDoubanInfo(html, '装帧');

  // 简介：取第一个 <div class="intro"> 的全部 <p> 文本
  let bookDesc = '';
  const introM = html.match(/<div class="intro">([\s\S]*?)<\/div>/);
  if (introM) {
    const paras = introM[1].match(/<p[^>]*>([\s\S]*?)<\/p>/g) || [];
    bookDesc = paras.map((p) => stripTags(decodeHtml(p))).filter(Boolean).join('\n').trim();
    // 去掉"(展开全部)"残留
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
// 当当列表对几乎所有正售 ISBN 都有命中，是豆瓣"未收录新书/冷门书"的关键兜底。
// 但列表页对查无此书的 ISBN 也会返回精选推荐 → 必须用详情页里的 ISBN 字段校验匹配。
async function fetchDangdang(isbn) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
    'Accept-Language': 'zh-CN,zh;q=0.9',
  };

  // Step 1: 列表页找第一个商品的 detail URL
  const listUrl = 'http://search.dangdang.com/?key=' + isbn + '&act=input';
  const rL = await fetch(listUrl, { redirect: 'follow', headers });
  if (!rL.ok) return { ok: false, reason: 'list HTTP ' + rL.status };
  const listBuf = await rL.arrayBuffer();
  let listH = '';
  try { listH = new TextDecoder('gbk').decode(listBuf); }
  catch (e) { listH = new TextDecoder('utf-8').decode(listBuf); }

  const ulM = listH.match(/<ul class="bigimg[\s\S]+?<\/ul>/);
  if (!ulM) return { ok: false, reason: 'no result list' };
  // 取前 3 个商品的 detail URL（防第一个是广告位）
  const lis = ulM[0].split(/(?=<li[^>]*ddt-pit)/).filter((s) => /class="name"/.test(s));
  if (!lis.length) return { ok: false, reason: 'no item' };
  const detailUrls = [];
  for (let i = 0; i < Math.min(3, lis.length); i += 1) {
    const uM = lis[i].match(/class="name"[^<]*<a[^>]*href="(\/\/product\.dangdang\.com\/\d+\.html)/);
    if (uM) detailUrls.push('http:' + uM[1]);
  }
  if (!detailUrls.length) return { ok: false, reason: 'no detail url' };

  // Step 2: 依次 fetch 详情页直到找到 ISBN 匹配的商品
  for (const dUrl of detailUrls) {
    try {
      const rD = await fetch(dUrl, { redirect: 'follow', headers });
      if (!rD.ok) continue;
      const dBuf = await rD.arrayBuffer();
      let dH = '';
      try { dH = new TextDecoder('gbk').decode(dBuf); }
      catch (e) { dH = new TextDecoder('utf-8').decode(dBuf); }

      // 校验 ISBN 严格一致（当当部分商品会拼接奇怪后缀，所以用精确 13 位 + 10 位双匹配）
      const iM = dH.match(/I\s?S\s?B\s?N[：:]?\s*(97[89][\-0-9]{10,14})/)
        || dH.match(/国际标准书号[^0-9]{0,10}(97[89][\-0-9]{10,14})/);
      let detectedIsbn = iM ? iM[1].replace(/-/g, '') : '';
      // 截取前 13 位（当当有时把 SKU 数字拼在 ISBN 后）
      if (detectedIsbn.length > 13) detectedIsbn = detectedIsbn.slice(0, 13);
      if (detectedIsbn !== isbn) continue;

      // 标题（h1）
      const h1M = dH.match(/<h1[^>]*>([\s\S]+?)<\/h1>/);
      let title = h1M ? stripTags(decodeHtml(h1M[1])) : '';
      title = title.replace(/\s+/g, ' ').trim();
      if (!title) continue;
      // 提前抓 publisher/authors 是为了从 title 里剥掉它们 → 先 hoist 上来
      // （pubM/auMRaw 解析在下方，这里用闭包后置剥离：放到收尾再 clean）

      // 把详情页 body 之后的内容截出，避免 head 中 <meta description> 的"作者：" 误匹配
      const bodyIdx = dH.indexOf('<body');
      const dB = bodyIdx > 0 ? dH.slice(bodyIdx) : dH;

      // 出版社
      const pubM = dB.match(/出\s*版\s*社[：:]\s*<a[^>]*>([^<]+)<\/a>/)
        || dB.match(/出\s*版\s*社[：:]\s*([\u4e00-\u9fa5A-Za-z0-9·]{2,30})/);
      const publisher = pubM ? decodeHtml(pubM[1]).trim() : '';

      // 作者：在 messbox_info / detail_info_area 内查找；只接受 2-40 字、不含标点符号"，。"开头的纯名字
      const auMRaw = dB.match(/作\s*者[：:]\s*<a[^>]*>([^<]+)<\/a>/)
        || dB.match(/作\s*者[：:]\s*([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9·\s]{1,38})/);
      let authors = '';
      if (auMRaw) {
        authors = decodeHtml(auMRaw[1]).trim();
        // 去掉空作者（如 "，出版社"）和明显的描述噪声
        if (/^[，,。.：:]/.test(authors) || /出版社|简介|书评|当当|价格|图片/.test(authors)) authors = '';
        // 规整化作者字符串：去重复的"编/编著/主编/著/译"标签
        authors = authors
          .replace(/(\s*(编著|主编|主审|编|著|译)\s*){2,}$/g, ' $2')
          .replace(/\s+/g, ' ')
          .trim();
      }

      // 出版日期
      const dtM = dB.match(/出版时间[：:]\s*(\d{4}[-/]\d{1,2}[-/]?\d{0,2})/);
      const date = dtM ? dtM[1].replace(/\//g, '-') : '';

      // 价格
      const prM = dB.match(/当当价[\s\S]{0,80}?&yen;\s*([\d.]+)/);
      const price = prM ? prM[1] + '元' : '';

      // 页数
      const pgM = dB.match(/页\s*数[：:]\s*(\d+)/);
      const pages = pgM ? pgM[1] + '页' : '';

      // 标题二次清理：剥掉尾部"出版社/作者/【新华书店】/正版包邮/ISBN 数字"等噪声
      let cleanTitle = title
        .replace(new RegExp('\\s*' + isbn + '\\s*', 'g'), ' ')   // ISBN 数字
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
        .replace(/\s+(编著|主编|主审|编|著|译)(\s+(编著|主编|主审|编|著|译))*\s*$/g, '')  // 尾部"编 编"/"编 著"
        .replace(/\s+(著|编|主编|主审|译|编著)\s*/g, ' ')
        .replace(/(正版|包邮|现货|新华书店|赠品|套装|平装|精装|博库|文轩|可开发票|官方)+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanTitle) title = cleanTitle;

      // "不详"/"未知" 作者视作没有
      const finalAuthors = /^(不详|未知|佚名)$/.test(authors) ? '' : authors;

      return {
        ok: true,
        source: '当当网',
        sourceUrl: dUrl,
        title,
        authors: finalAuthors,
        publisher,
        date,
        bookDesc: '', // 详情页简介在动态加载块，不强抓
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
  const r = await fetch(url);
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

// ---------------- 主入口 ----------------
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

  const attempted = [];
  // 逐源尝试，命中即返回（豆瓣富字段稍弱于 isbn.work，但稳）
  const sources = [
    { name: 'isbn.work', fn: fetchIsbnWork },
    { name: 'douban', fn: fetchDouban },
    { name: 'dangdang', fn: fetchDangdang },
    { name: 'googleBooks', fn: fetchGoogleBooks },
  ];
  for (const s of sources) {
    try {
      const r = await s.fn(isbn);
      attempted.push({ source: s.name, ok: !!r.ok, reason: r.reason || '' });
      if (r.ok) {
        return jsonResp({ ok: true, ...r, attempted }, 200, cors);
      }
    } catch (e) {
      attempted.push({ source: s.name, ok: false, reason: String((e && e.message) || e).slice(0, 120) });
    }
  }
  return jsonResp({ ok: false, error: 'all sources failed', attempted }, 200, cors);
}

export const onRequest = (ctx) => handle(ctx.request, ctx.env);
