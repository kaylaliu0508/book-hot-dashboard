// ==================== 4 大品类映射 ====================
// 历史归一规则：「成人」→ 社科；「养生」→ 健康（覆盖往期所有榜单）
const CAT_KEYWORDS = {
  '教辅': ['教辅','考试','小学语文','小学数学','小学英语','小学多科','初中','高中','期末','中考','高考','字帖','教材','学习用品','试卷','会考'],
  '童书': ['童书','儿童','幼儿','立体书','学前','幼小衔接','科普百科','绘本','低幼','启蒙','早教','少儿','故事'],
  '健康': ['养生','保健','饮食','减糖','节气','中医','营养','生活','健康','医','祛湿','睡眠','体质'],
  '社科': ['成人','人文','社科','文学','小说','国学','古籍','历史','励志','自我实现','艺术','管理','育儿','家庭教育','沟通','情商','心理','哲学','经济','文化','民俗','投资理财','经管','社会科学','口才','教育','旅游','地图','杂志','文摘','计算机','编程','职业技能']
};
function mapToTopCat(catStr) {
  if (!catStr) return '其他';
  // 强制纠错：包含「成人」一律 → 社科；包含「养生」一律 → 健康
  if (catStr.includes('成人')) return '社科';
  if (catStr.includes('养生')) return '健康';
  for (const [top, kws] of Object.entries(CAT_KEYWORDS)) {
    for (const kw of kws) if (catStr.includes(kw)) return top;
  }
  return '其他';
}

const CAT_COLOR = { 教辅:'#ef4444', 童书:'#f59e0b', 健康:'#10b981', 社科:'#8b5cf6', 其他:'#94a3b8' };
const CAT_ICON  = { 教辅:'📖', 童书:'🧸', 健康:'🌿', 社科:'🏛', 其他:'📚' };

// ==================== 100% 离线 SVG 封面（关键修复）====================
function svgCover(title, isbn, opts) {
  opts = opts || {};
  const t = String(title || '图书').replace(/[<>&"']/g, '').trim();
  const cat = opts.cat || mapToTopCat(t);
  
  // 配色（浅色背景 + 深色字）
  const palette = {
    '教辅': {bg1:'#fef2f2', bg2:'#fecaca', text:'#991b1b', accent:'#dc2626'},
    '童书': {bg1:'#fff7ed', bg2:'#fed7aa', text:'#9a3412', accent:'#ea580c'},
    '健康': {bg1:'#f0fdf4', bg2:'#bbf7d0', text:'#065f46', accent:'#10b981'},
    '社科': {bg1:'#faf5ff', bg2:'#ddd6fe', text:'#5b21b6', accent:'#8b5cf6'},
    '其他': {bg1:'#f8fafc', bg2:'#cbd5e1', text:'#334155', accent:'#64748b'}
  };
  const c = palette[cat] || palette['其他'];
  
  // 提取关键字（去括号）
  const cleaned = t.replace(/【.*?】|\[.*?\]|\(.*?\)|（.*?）|《|》/g, '').trim();
  const compact = cleaned.replace(/\s+/g, '').slice(0, 18);
  
  // 切行（中文每行 5 字，英文/数字适配）
  const lines = [];
  let cur = '';
  for (const ch of compact) {
    cur += ch;
    if (cur.length >= 5) { lines.push(cur); cur = ''; }
    if (lines.length >= 4) break;
  }
  if (cur && lines.length < 4) lines.push(cur);
  
  // 渲染文字行
  const startY = 200 - (lines.length - 1) * 17;
  const lineSvg = lines.map((l, i) => 
    `<text x="150" y="${startY + i * 36}" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="26" font-weight="700" fill="${c.text}" text-anchor="middle">${l}</text>`
  ).join('');
  
  const cleanIsbn = isbn ? String(isbn).replace(/[^\d]/g, '') : '';
  
  // 简化：用纯色背景代替渐变，避免 url(#xxx) 编码问题
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400">
    <rect width="300" height="400" fill="${c.bg1}"/>
    <rect x="0" y="100" width="300" height="200" fill="${c.bg2}" fill-opacity="0.6"/>
    <rect x="20" y="30" width="260" height="340" fill="${c.accent}" fill-opacity="0.05" rx="4"/>
    <rect x="20" y="30" width="260" height="3" fill="${c.accent}"/>
    <rect x="20" y="367" width="260" height="3" fill="${c.accent}"/>
    <text x="150" y="80" font-family="PingFang SC, sans-serif" font-size="13" fill="${c.accent}" fill-opacity="0.7" text-anchor="middle" letter-spacing="3">${cat}</text>
    ${lineSvg}
    <text x="150" y="350" font-family="monospace" font-size="9" fill="${c.text}" fill-opacity="0.4" text-anchor="middle">${cleanIsbn || 'ISBN ----'}</text>
  </svg>`;
  
  // 用 encodeURIComponent 编码（# 会自动变成 %23）
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// 直接导出 - 所有书都通过这个函数取封面（优先真实图，缺失用 SVG）
function bookCover(book) {
  // 1. 直接带 image 字段（推荐书单的书）
  if (book && book.image) return book.image;
  // 2. 通过 ISBN 查真实图
  if (book && book.isbn && typeof ISBN_TO_IMAGE !== 'undefined' && ISBN_TO_IMAGE[book.isbn]) {
    return ISBN_TO_IMAGE[book.isbn];
  }
  // 3. SVG 兜底
  const cat = book.top_cat || mapToTopCat(book.cat || '');
  return svgCover(book.title, book.isbn, {cat});
}

// ==================== 周数据 ====================
const WEEK_2026_05_18 = {
  label:'2026-05-12 至 05-18',
  short:'5月18日(本周)',
  cat_share:[{cat:'教辅',share:35.7},{cat:'童书',share:28.7},{cat:'社科',share:22.3},{cat:'健康',share:13.3}],
  lists:{
    adq_hot:{name:"ADQ 热投优品",subtitle:"近一周ADQ热投优品 🔥🔥🔥",items:[
      {rank:1,title:"我们的中国立体书+环游世界立体书",cat:"童书-幼儿认知书/立体书",price:"89-159",sales:"9.7",conv:"7.5-8.5%",isbn:"9787521748459"},
      {rank:2,title:"66篇英语故事记2100词",cat:"教辅/考试-初中教辅-初中英语教辅",price:"399",sales:"9.7",conv:"1.9-2.9%",isbn:"9787521335156"},
      {rank:3,title:"漫画帝王家书",cat:"童书-儿童成长/教育书",price:"39.9",sales:"9.7",conv:"10.6-11.6%",isbn:"9787515366692"},
      {rank:4,title:"中国传统文化临摹字帖",cat:"人文社科-艺术-书法篆刻",price:"27.9",sales:"9.8",conv:"9.7-10.7%",isbn:"9787546433219"},
      {rank:5,title:"孩子反霸凌话术500句",cat:"育儿-家庭教育",price:"99",sales:"9.7",conv:"7.8-8.8%",isbn:"9787570619146"},
      {rank:6,title:"中国孩子必知的文化常识3000问",cat:"人文社科-中国文化/民俗",price:"79",sales:"9.7",conv:"5.8-6.8%",isbn:"9787570616244"},
      {rank:7,title:"漫画初中物理早知道",cat:"教辅/考试-初中教辅-初中多科教辅",price:"75.8-199.8",sales:"9.6",conv:"5.6-6.9%",isbn:"9787570617784"},
      {rank:8,title:"国学经典十册",cat:"人文社科-外国文学/小说",price:"99",sales:"9.6",conv:"3.8-4.8%",isbn:"9787550299016"},
      {rank:9,title:"减糖饮食",cat:"生活-养生保健-饮食健康",price:"39.8",sales:"9.6",conv:"9.8-10.9%",isbn:"9787521758320"},
      {rank:10,title:"二十四节气健康吃法",cat:"生活-养生保健-中医养生",price:"39.9",sales:"9.6",conv:"4.8-5.8%",isbn:"9787554609095"},
      {rank:11,title:"一碗好汤养全家",cat:"生活-养生保健-饮食健康",price:"29.9",sales:"9.5",conv:"9.6-12.3%",isbn:"9787508663906"},
      {rank:12,title:"托举而非掌控",cat:"育儿-家庭教育",price:"39.8",sales:"9.5",conv:"12.4-14.4%",isbn:"9787521767841"},
      {rank:13,title:"儿童趣味百科",cat:"童书-科普百科",price:"59.9",sales:"9.5",conv:"5.1-6.5%",isbn:"9787558539978"},
      {rank:14,title:"漫画讲透易经养生",cat:"生活-养生保健-中医养生",price:"99",sales:"9.5",conv:"11.2-13.6%",isbn:"9787513946575"},
      {rank:15,title:"二十四节气养生食补",cat:"生活-养生保健-中医养生",price:"99",sales:"9.5",conv:"6.1-7.1%",isbn:"9787554609095"},
      {rank:16,title:"你有多自律就有多自由",cat:"人文社科-自我实现/励志",price:"35.8-55.8",sales:"9.5",conv:"7.7-8.7%",isbn:"9787513939874"},
      {rank:17,title:"小学数学速算巧算技巧口诀",cat:"教辅/考试-小学教辅-小学数学教辅",price:"29.9",sales:"9.5",conv:"10.5-12.3%",isbn:"9787514871142"},
      {rank:18,title:"一图秒懂小学英语语法",cat:"教辅/考试-小学教辅-小学英语教辅",price:"22",sales:"9.5",conv:"6.6-8.8%",isbn:"9787514870305"},
      {rank:19,title:"万唯答题模版速记活用",cat:"教辅/考试-初中教辅-初中多科教辅",price:"38.8-71.8",sales:"9.5",conv:"7.2-8.2%",isbn:"9787570617357"},
      {rank:20,title:"人民日报里的中考作文热点素材",cat:"教辅/考试-初中教辅-初中语文教辅",price:"39.8-59.8",sales:"9.5",conv:"8.3-9.3%",isbn:"9787570617609"}
    ]},
    weixinshop:{name:"微信小店广告热投",subtitle:"无转化不扣费",items:[
      {rank:1,title:"开心 课本里的必背成语",cat:"教辅/考试-小学教辅-小学语文教辅",price:"31.9",sales:"9.8",conv:"10.9-11.9%",roi:"1.5-1.7",isbn:"9787514870305"},
      {rank:2,title:"宋兆普保健小妙招中医养生",cat:"生活-养生保健-中医养生",price:"48-88",sales:"9.7",conv:"11.2-12.3%",roi:"2.0-2.2",isbn:"9787513289054"},
      {rank:3,title:"26新版人民日报中考作文热点素材",cat:"教辅/考试-初中教辅-初中语文教辅",price:"39.8-59.8",sales:"9.7",conv:"10.3-11.3%",roi:"1.9-2.1",isbn:"9787570617609"},
      {rank:4,title:"罗浮山泰学诵读本《道德经》《论语》《易经》",cat:"人文社科-国学/古籍",price:"189.2",sales:"9.7",conv:"1.1-2.1%",roi:"2.3-2.5",isbn:"9787550031234"},
      {rank:5,title:"开心 一图秒懂小学英语语法",cat:"教辅/考试-小学教辅-小学英语教辅",price:"29.8",sales:"9.7",conv:"3.7-4.7%",roi:"1.5-1.8",isbn:"9787514870305"},
      {rank:6,title:"莫言 用极短的时间读懂极深的人心",cat:"人文社科-中国文学/小说",price:"59.9",sales:"9.6",conv:"5.9-6.9%",roi:"1.8-2.0",isbn:"9787539661193"},
      {rank:7,title:"诺贝尔获奖文学作品选",cat:"人文社科-外国文学/小说",price:"128",sales:"9.6",conv:"5.2-6.2%",roi:"1.5-1.7",isbn:"9787550299016"},
      {rank:8,title:"漫画初中生物地理物理化学",cat:"教辅/考试-初中教辅-其他初中教辅",price:"198",sales:"9.6",conv:"7.4-8.4%",roi:"1.5-1.8",isbn:"9787570617784"},
      {rank:9,title:"书梦家 100篇英语故事记初中2000词",cat:"教辅/考试-初中教辅-初中英语教辅",price:"19.8-69.8",sales:"9.5",conv:"10.9-11.9%",roi:"1.6-1.9",isbn:"9787521335156"},
      {rank:10,title:"一本初中期末逆袭卷7-8年级",cat:"教辅/考试-初中教辅-初中多科教辅",price:"44.8",sales:"9.5",conv:"6.8-7.8%",roi:"1.5-1.8",isbn:"9787570617357"},
      {rank:11,title:"一本26新版中考临考30天抢分",cat:"教辅/考试-初中教辅-初中多科教辅",price:"49.6",sales:"9.5",conv:"8.8-9.8%",roi:"2.4-2.6",isbn:"9787570617357"},
      {rank:12,title:"2025新初中五大科核心考点一本通",cat:"教辅/考试-初中教辅-初中多科教辅",price:"49.8",sales:"9.5",conv:"4.3-5.3%",roi:"1.6-1.9",isbn:"9787570617357"},
      {rank:13,title:"一本中考预测卷 2026初三临考",cat:"教辅/考试-初中教辅-其他初中教辅",price:"149",sales:"9.5",conv:"3.7-4.1%",roi:"1.5-1.8",isbn:"9787570617357"},
      {rank:14,title:"地图上的中国通史 豪华精装",cat:"人文社科-历史",price:"199",sales:"9.5",conv:"3.7-4.7%",roi:"1.6-1.8",isbn:"9787521748459"},
      {rank:15,title:"豪华精装10册 世界经典文学名著",cat:"人文社科-中国文学/小说",price:"9.9-114",sales:"9.5",conv:"8.3-9.3%",roi:"1.5-1.8",isbn:"9787550299016"}
    ]},
    potential:{name:"潜力爆品",subtitle:"ADQ未投放/少量投放的各媒体爆品",items:[
      {rank:1,title:"皮面本A5笔记本学生ins风简约手账",cat:"教辅/考试-其他教辅书籍",price:"18.8-48.8",isbn:""},
      {rank:2,title:"幼小衔接看图说话",cat:"童书-学前启蒙/幼小衔接",price:"39",isbn:"9787570427536"},
      {rank:3,title:"歇后语幽默笑话谜语大全 3-8岁",cat:"童书-儿童文学",price:"25.8-30.8",isbn:"9787570617852"},
      {rank:4,title:"2026新德爷3套卷张天德新高考预测",cat:"教辅/考试-高中教辅-高中多科教辅",price:"39.8-99",isbn:"9787570619900"},
      {rank:5,title:"开心 搞定期末核心考点 小学3-5年级",cat:"教辅/考试-小学教辅-小学多科教辅",price:"25.8-35.8",isbn:"9787570623211"},
      {rank:6,title:"白鹿原 陈忠实十周年纪念版",cat:"人文社科-中国文学/小说",price:"26.8",isbn:"9787540481803"},
      {rank:7,title:"2026新版小学期末冲刺卷三合一",cat:"教辅/考试-小学教辅-小学多科教辅",price:"25.8-38.5",isbn:"9787570623211"},
      {rank:8,title:"100以内加减法专项训练",cat:"教辅/考试-小学教辅-小学数学教辅",price:"39.8",isbn:"9787570623211"},
      {rank:9,title:"一本15天期末考前冲刺1-6年级",cat:"教辅/考试-小学教辅-小学多科教辅",price:"18.2-51.3",isbn:"9787570617357"},
      {rank:10,title:"生命里的第一课 培养孩子人生观",cat:"童书-儿童成长/教育书",price:"27.8",isbn:"9787570628186"},
      {rank:11,title:"唐棠良品A4牛皮笔记本",cat:"教辅/考试-其他教辅书籍",price:"17.5-37.5",isbn:""},
      {rank:12,title:"孩子不能去的第二现场 安全避险指南",cat:"童书-儿童成长/教育书",price:"32.5",isbn:"9787570625109"},
      {rank:13,title:"你好蛤蟆探长 6-13岁逻辑思维",cat:"童书-儿童成长/教育书",price:"50",isbn:"9787570619146"},
      {rank:14,title:"千门八将 窥天机 职场谋略",cat:"人文社科-自我实现/励志",price:"25.8",isbn:"9787540496524"},
      {rank:15,title:"结绳技巧图鉴 结绳大全彩图版",cat:"生活-日常生活-娱乐时尚",price:"159",isbn:"9787121432125"}
    ]}
  }
};

// 历史周（mock）
const WEEK_2026_05_11 = JSON.parse(JSON.stringify(WEEK_2026_05_18));
WEEK_2026_05_11.label='2026-05-04 至 05-10'; WEEK_2026_05_11.short='5月11日';
WEEK_2026_05_11.cat_share=[{cat:'教辅',share:38.2},{cat:'童书',share:26.5},{cat:'社科',share:21.8},{cat:'健康',share:13.5}];

const WEEK_2026_05_04 = JSON.parse(JSON.stringify(WEEK_2026_05_18));
WEEK_2026_05_04.label='2026-04-27 至 05-03'; WEEK_2026_05_04.short='5月4日';
WEEK_2026_05_04.cat_share=[{cat:'教辅',share:34.1},{cat:'童书',share:25.0},{cat:'社科',share:24.6},{cat:'健康',share:16.3}];

const WEEKS=[
  {key:'2026-05-18',data:WEEK_2026_05_18},
  {key:'2026-05-11',data:WEEK_2026_05_11},
  {key:'2026-05-04',data:WEEK_2026_05_04}
];
let currentWeekIdx=0;
// 🛡️ 防御性：WEEKS 可能为空 / currentWeekIdx 越界，返回空数据避免崩
function getCurrentWeek(){
  try {
    if (typeof WEEKS !== 'undefined' && WEEKS[currentWeekIdx] && WEEKS[currentWeekIdx].data) {
      return WEEKS[currentWeekIdx].data;
    }
  } catch(e) {}
  // 兜底：从 WEEK_RANK_LIST 取最新一周
  try {
    if (typeof WEEK_RANK_LIST !== 'undefined' && WEEK_RANK_LIST[0] && WEEK_RANK_LIST[0].data) {
      return WEEK_RANK_LIST[0].data;
    }
  } catch(e) {}
  return { lists: {}, label: '', cat_share: [] };
}
function getRankData(){
  const wk = getCurrentWeek();
  return (wk && wk.lists) ? wk.lists : {};
}

// ==================== 12 月节奏（数值=各品类消耗占比%，每月合计100%） ====================
const MONTHS_DATA = [
  {m:'1月',  total:55, 教辅:55, 童书:25, 健康:8,  社科:12, season:'寒假', focus:'童书+绘本（春节送礼）+ 寒假预习'},
  {m:'2月',  total:42, 教辅:30, 童书:50, 健康:8,  社科:12, season:'开学季', focus:'春节亲子读物，国学传统文化'},
  {m:'3月',  total:55, 教辅:60, 童书:18, 健康:8,  社科:14, season:'开学季', focus:'教辅春季冲刺，少儿英语'},
  {m:'4月',  total:55, 教辅:48, 童书:22, 健康:8,  社科:22, season:'4·23 读书日', focus:'人文社科爆发期，低客单引流'},
  {m:'5月',  total:60, 教辅:55, 童书:25, 健康:8,  社科:12, season:'母亲节/期中', focus:'教辅期中，亲子家庭教育'},
  {m:'6月',  total:90, 教辅:50, 童书:30, 健康:10, 社科:10, season:'考试季·暑期', focus:'全年峰值：高考/中考/期末三考叠加 + 暑期衔接提前起量'},
  {m:'7月',  total:85, 教辅:60, 童书:16, 健康:10, 社科:14, season:'暑期', focus:'暑期教辅主导：衔接升学+专项提升+多学段细分，童书承接亲子阅读'},
  {m:'8月',  total:63, 教辅:30, 童书:25, 健康:20, 社科:25, season:'暑期收官+开学倒计时', focus:'教辅收官续单+开学抢跑，童书入学准备，健康秋季食补启动'},
  {m:'9月',  total:80, 教辅:40, 童书:15, 健康:30, 社科:15, season:'开学季+秋冬养生季', focus:'教辅开学短爆发 + 健康秋冬养生主线'},
  {m:'10月', total:65, 教辅:30, 童书:20, 健康:30, 社科:20, season:'国庆长假+重阳', focus:'教辅期中备考 + 健康重阳秋冬进补双主线'},
  {m:'11月', total:62, 教辅:25, 童书:20, 健康:30, 社科:25, season:'双11/立冬/小雪', focus:'教辅双11囤货+语文作文/数理化硬提分+寒假预习前置，健康立冬小雪冬补，社科知识付费+企管年末复盘+2027日历送礼，童书早教启蒙识字+精品绘本礼盒', current:true},
  {m:'12月', total:60, 教辅:18, 童书:18, 健康:35, 社科:29, season:'年末/考试', focus:'健康年终送礼，社科年度盘点'}
];

// ==================== 11 月节点 × 目标人群画像（与 WEEK_RHYTHM_NOV 一致：立冬/双11/小雪/感恩）====================
const NODES_PERSONA = [
  {
    date:'11月7日', name:'立冬', icon:'🍲', countdown:'8天', urgent:true,
    cat:'健康',
    targetAudience:'30-50 岁家庭主理人（入冬给全家进补）+ 45+ 岁轻养生人群（关注冬季食养）',
    selectionStrategy:'<strong>核心选品：</strong>冬令食补 / 温补汤谱 / 膏方养生 / 应季食材，客单 40-69 元，走日常食补路线、不碰医疗治病话术。<br/><strong>组品逻辑：</strong>家庭主理人承接「全家温补家常菜 + 汤粥换花样」，轻养生人群承接「膏方 / 节气食养」，同属健康基本盘但场景互补；立冬起铺底款，顺势接双11冬补囤货。',
    creativeIdea:'<strong>主图方向：</strong>一碗热汤 + 入冬氛围（第一场雪 / 暖光厨房），把「立冬该补了」做成情绪钩子。<br/><strong>钩子结构：</strong>「立冬一碗汤，整冬不怕冷」节气话术切入，适配短视频铺陈。',
    representativeBooks:[
      {title:'本草纲目百病食疗1000问',isbn:'9787523236178'},
      {title:'黄帝内经十二经脉养生法',isbn:'9787229019358'}
    ]
  },
  {
    date:'11月11日', name:'双11 · 教辅囤货', icon:'📐', countdown:'12天', urgent:true,
    cat:'教辅',
    targetAudience:'30-45 岁中小学生家长（趁大促囤整年教辅）+ 高中家长（一轮复习刚需）',
    selectionStrategy:'<strong>核心选品：</strong>数理化专项提分 / 全科套装 / 真题模考 / 错题归纳本，大促价打包客单 60-199 元，高于日常；数理化硬提分决策快、复购稳，是双11教辅囤货的首选。<br/><strong>组品逻辑：</strong>小初家长承接「数理化专项 + 错题本」，高中家长承接「一轮复习 + 真题套装」，按学段 + 版本铺货；大促后无缝接期末复习与寒假预习。',
    creativeIdea:'<strong>主图方向：</strong>「一次囤齐一学期」套装视觉 + 提分案例背书 + 双11立减。<br/><strong>钩子结构：</strong>痛点提问（「偏科怎么补？」）→ 全科解决方案 → 大促限时，三秒钩子适配信息流。',
    representativeBooks:[
      {title:'高中物化生考点默写小纸条',isbn:'9787542168634'},
      {title:'初中学霸手账',isbn:'9787570123001'}
    ]
  },
  {
    date:'11月11日', name:'双11 · 童书礼盒', icon:'📚', countdown:'12天', urgent:true,
    cat:'童书',
    targetAudience:'30-45 岁妈妈（趁大促囤书）+ 55+ 岁长辈（给孙辈送礼）',
    selectionStrategy:'<strong>核心选品：</strong>经典文学套装 / 科普百科 / 立体书精装礼盒，礼盒装客单较日常款高约 30%；双11送礼属性拉满，"一次囤够一整套"完成感强。<br/><strong>组品逻辑：</strong>妈妈承接「同 IP 系列套装」（提升阅读完成度），长辈承接「精装礼盒」（送礼有面子），双场景覆盖；早教启蒙 / 识字款做低客单引流。',
    creativeIdea:'<strong>主图方向：</strong>礼盒开箱 + 三代同读画面，弱化课程感、强化送礼感。<br/><strong>钩子结构：</strong>套装价对比单本的视觉化表达 + 大促立减，适配长周期承接。',
    representativeBooks:[
      {title:'十万个为什么',isbn:'9787558918193'},
      {title:'查理和巧克力工厂',isbn:'9787533259617'}
    ]
  },
  {
    date:'11月22日', name:'小雪', icon:'❄️', countdown:'23天',
    cat:'健康',
    targetAudience:'45+ 岁轻养生 / 慢病人群 + 25-40 岁子女（给长辈买温和食补）',
    selectionStrategy:'<strong>核心选品：</strong>冬季养生 / 驱寒暖身食谱 / 血糖血压日常管理 / 长辈食养，客单 40-88 元；深冬寒气加重，调理与长辈食养需求集中。<br/><strong>组品逻辑：</strong>轻养生人群承接「驱寒暖身食谱」，子女承接「长辈温和食补」，走应季食养路线不碰医疗话术；承接立冬进补、延伸到冬补送礼。',
    creativeIdea:'<strong>主图方向：</strong>小雪节气 + 暖身食材（姜茶 / 羊汤），主打「深冬要调理、给长辈补一补」。<br/><strong>钩子结构：</strong>「小雪到，寒气重」节气切入 + 长辈关怀情感叠加。',
    representativeBooks:[
      {title:'百病不生',isbn:'9787520223812'},
      {title:'小病小痛全扫光',isbn:'9787538891300'}
    ]
  },
  {
    date:'11月26日', name:'感恩节 · 日历送礼 + 年末复盘', icon:'📅', countdown:'27天',
    cat:'社科',
    targetAudience:'25-40 岁职场人（年末复盘 + 规划新年）+ 送礼人群（企业团购 + 个人自购）',
    selectionStrategy:'<strong>核心选品：</strong>2027 日历（故宫 / 诗词 / 插画 / 生肖）+ 企业管理 / 年度复盘 / 新年规划，日历客单 30-98 元、企管书偏高；11 月中旬起是日历送礼主场，叠加年末复盘窗口。<br/><strong>组品逻辑：</strong>送礼人群承接「精品日历」（企业团购 + 个人自购），职场人承接「复盘 + 规划」选题，承接元旦 / 春节送礼与新年布局长线。',
    creativeIdea:'<strong>主图方向：</strong>日历翻页仪式感 + 年末办公桌场景，把「送礼」与「新年规划」双心智叠加。<br/><strong>钩子结构：</strong>「复盘今年、规划明年」+ 日历开箱，适配企业团购与个人自购双话术。',
    representativeBooks:[
      {title:'中国诗历',isbn:'9787580900869'},
      {title:'势道',isbn:'9787558352546'}
    ]
  }
];

// ==================== 选品 by 周节奏图（按月切换 · W1-W4 × 品类优先级）====================
// 设计原则：
//   1. 节点≠开跑日，前置投放（lead）提示该单元格"几号开始铺品"
//   2. 痛点（pain）= 目标人群的钩子，直接作为创意/标题灵感
//   3. 部分单元格跨多周（span 字段），表示该方向贯穿整月
//   4. 2026-06-30 起新增 7 月节奏：教辅主线=衔接升学+专项提升+多学段细分；童书=暑期亲子阅读高峰
//   5. 2026-07-27 新增月份 tab 切换：默认最新月，支持回看往期 5/6 月

// ===== 5 月节奏（往期回看 · 母亲节+520+六一预热 · 教辅期中冲刺+高考前置铺品）=====
const WEEK_RHYTHM_MAY = {
  weeks: [
    { key:'W1', summer:'五一小长假',         festival:'劳动节',     date:'5.1-5.7' },
    { key:'W2', summer:'期中冲刺',           festival:'母亲节 5/11', date:'5.8-5.14' },
    { key:'W3', summer:'520 送礼窗口',       festival:'520',        date:'5.15-5.21' },
    { key:'W4', summer:'六一预热 + 高考倒计时', festival:'',           date:'5.22-5.31' }
  ],
  rows: [
    {
      cat:'教辅', icon:'📖', priority:'P0', colorClass:'wr-cat-color-jiaofu',
      cells: [
        {
          week:'W1', span:2,
          groups: [
            { title:'📝 期中冲刺 + 错题归纳', items:['期中真题卷 / 错题本','单元测评 / 知识点梳理'], pain:'家长怕"期中考砸 家长会没面子"，孩子怕"和同学差距拉开"' },
            { title:'🎓 高考冲刺（最后 30 天）', items:['高考押题卷 / 三年真题','高频考点 / 答题模板'], pain:'高三家长焦虑"最后一个月能不能再提 20 分"' }
          ],
          lead:'⏰ 5/1 起铺期中卷；高考卷 5/8 起前置，冲刺搜索同比 +65%'
        },
        {
          week:'W3', span:1,
          groups: [
            { title:'📚 学科工具书 · 常态', items:['作文素材 / 单词速记','公式口诀 / 阅读理解'], pain:'家长"平时也想给娃补一补基本功"' }
          ],
          lead:'📚 常态铺货款，日销稳定'
        },
        {
          week:'W4', span:1,
          groups: [
            { title:'☀️ 暑期预习前置铺品', items:['小升初分班题 / 初一预备','高一提升 / 高二暑假衔接'], pain:'家长"暑期不规划 秋季必掉队"，提前锁定预习方向' }
          ],
          lead:'⏰ 5/25 起前置暑期预习，搜索同比 +52%（进入 6 月加速）'
        }
      ]
    },
    {
      cat:'童书', icon:'🧸', priority:'P0', colorClass:'wr-cat-color-tongshu',
      cells: [
        {
          week:'W1', span:2,
          groups: [
            { title:'🌸 母亲节亲子共读', items:['亲子情感绘本 / 妈妈主题故事','家庭教育 / 育儿智慧'], pain:'妈妈想"和孩子有仪式感"；孩子想"给妈妈准备礼物"' }
          ],
          lead:'⏰ 5/1 起铺品，母亲节（5/11）当周爆量，搜索同比 +80%'
        },
        {
          week:'W3',
          direction:'520 情感教育：绘本 / 情商启蒙 / 家庭沟通',
          pain:'年轻父母把 520 也当亲子仪式',
          lead:'⏰ 520 短窗口，5/17 起铺品'
        },
        {
          week:'W4',
          direction:'六一预热：立体书 / 科普百科 / 漫画国学',
          pain:'家长提前 1 周开始比价、下单，避免六一当天送不到',
          lead:'⏰ 5/22-27 是六一预热黄金期，5/25 起铺高峰'
        }
      ]
    },
    {
      cat:'社科', icon:'🏛', priority:'P1', colorClass:'wr-cat-color-sheke',
      cells: [
        {
          week:'W1', span:2,
          direction:'职场提升：沟通表达 / 副业理财 / 五一充电',
          pain:'25-40 岁职场人"五一想利用假期充电"',
          lead:'⏰ 五一假期高频阅读窗口，5/1-7 集中投放'
        },
        {
          week:'W3', span:2,
          direction:'520 心理学：亲密关系 / 沟通 / 情感成长',
          pain:'年轻用户"想经营好感情但不会表达"',
          lead:'⏰ 5/15 起铺，520 当周爆量'
        }
      ]
    },
    {
      cat:'健康', icon:'🌿', priority:'P2', colorClass:'wr-cat-color-jiankang',
      cells: [
        {
          week:'W1', span:4,
          direction:'春夏轻食 + 减脂食谱 + 中老年膳食',
          pain:'年轻女性"夏天前要瘦"；家庭主理人"换季食谱换花样"；中老年慢病饮食管理',
          lead:'⏰ 全月铺底款，节气食谱 5/5（立夏）+ 5/21（小满）双峰'
        }
      ]
    }
  ]
};

// ===== 6 月节奏（原版保留）=====
const WEEK_RHYTHM_JUNE = {
  weeks: [
    { key:'W1', summer:'暑期预热',         festival:'六一儿童节', date:'6.1-6.7' },
    { key:'W2', summer:'暑期预热',         festival:'高考',       date:'6.7-6.13' },
    { key:'W3', summer:'暑期核心放量期',   festival:'端午节',     date:'6.14-6.21' },
    { key:'W4', summer:'期末 + 暑期稳定期', festival:'',           date:'6.22-6.30' }
  ],
  rows: [
    {
      cat:'教辅', icon:'📖', priority:'P0', colorClass:'wr-cat-color-jiaofu',
      cells: [
        {
          week:'W1', span:2,
          groups: [
            {
              title:'🎓 高考志愿决策',
              items: [
                '高考志愿填报指南',
                '院校录取数据手册',
                '专业解读 / 就业前景'
              ],
              pain:'高三家长怕"分数浪费 / 选错专业"'
            },
            {
              title:'📝 学科工具书 + 暑期预习',
              items: [
                '作文素材 / 单词速记 / 公式口诀',
                '小升初分班题 / 初一预备 / 高一提升'
              ],
              pain:'家长焦虑"暑期不规划 秋季掉队"，提前找预习方向'
            }
          ],
          lead:'⏰ 6/9 查分起志愿决策爆发；暑期预习 6/1 起前置铺品，搜索同比 +85%'
        },
        {
          week:'W3', span:1,
          groups: [
            {
              title:'☀️ 暑期衔接（核心放量）',
              items: [
                '幼小衔接：拼音 / 习惯养成',
                '小初衔接：分班题 / 初一预备',
                '初高衔接：高一理科 / 英语词汇'
              ],
              pain:'家长怕"暑期不衔接 秋季掉队"'
            }
          ],
          lead:'☀️ 端午后（6/15）核心放量，搜索峰值持续 4-6 周'
        },
        {
          week:'W4', span:1,
          groups: [
            {
              title:'📝 期末冲刺 + 暑期续单',
              items: [
                '期末试卷 / 错题归纳',
                '暑假作业 / 衔接续单'
              ],
              pain:'家长怕"考砸开学被甩开"'
            }
          ],
          lead:'📝 6/22 期末爆量 1 周，6/30 切暑期稳定期，量稳到 8 月底'
        }
      ]
    },
    {
      cat:'童书', icon:'🧸', priority:'P0', colorClass:'wr-cat-color-tongshu',
      cells: [
        {
          week:'W1',
          direction:'六一送礼：立体书 / 科普百科 / 漫画国学',
          pain:'家长想"哄娃开心 + 教育意义"；长辈代际送孙辈',
          lead:'⏰ 5/20-25 铺品，6/1 当日转化'
        },
        {
          week:'W2', span:3,
          groups: [
            {
              title:'📚 功能童书（暑期衔接）',
              items: [
                '国学启蒙 / 文化常识',
                '科普百科 / 自然探索',
                '数学思维 / 阅读理解 / 英文分级'
              ],
              pain:'家长怕暑期"光玩不学"，想假期弯道超车'
            },
            {
              title:'🌱 成长教育童书',
              items: [
                '心理成长 / 情绪管理',
                '为人处事 / 社交能力',
                '励志自驱 / 内驱力培养'
              ],
              pain:'家长发现"孩子叛逆 / 内驱力差"'
            }
          ],
          lead:'⏰ 6/8 起持续铺品，搜索同比 +40%'
        }
      ]
    },
    {
      cat:'社科', icon:'🏛', priority:'P1', colorClass:'wr-cat-color-sheke',
      cells: [
        {
          week:'W1', span:2,
          direction:'职场提升：沟通表达 / 思维方法 / 副业理财',
          pain:'25-40 岁职场人"年中 KPI 焦虑"',
          lead:'⏰ 6 月上旬持续，配合"年中复盘"心智'
        },
        {
          week:'W3', span:2,
          direction:'传统国学："古为今用"解读 + 烫金线装礼盒',
          pain:'家长想"给娃做文化启蒙"；高知白领"古人智慧解现代焦虑"；端午追求"礼物有文化感"',
          lead:'⏰ 端午前 10 天（6/9）起步，搜索同比 +156%，礼盒版可贯穿 W4'
        }
      ]
    },
    {
      cat:'健康', icon:'🌿', priority:'P2', colorClass:'wr-cat-color-jiankang',
      cells: [
        {
          week:'W1', span:4,
          direction:'夏季食谱（轻食 / 减糖 / 24 节气）+ 中老年膳食管理',
          pain:'家庭主理人"夏天没胃口"；中老年关注科学饮食；年轻女性体态管理',
          lead:'⏰ 全月铺底款，节气食谱 6/5（芒种）+ 6/21（夏至）双峰'
        }
      ]
    }
  ]
};

// ===== 7 月节奏（暑期主线 · 教辅衔接升学+专项提升+多学段细分；童书启蒙低龄衔接为重点）=====
// 选品思路：关注细分品的人群刚需与场景理由，不堆指标数字
const WEEK_RHYTHM_JULY = {
  weeks: [
    { key:'W1', summer:'暑期开启',         festival:'',         date:'7.1-7.7' },
    { key:'W2', summer:'暑期核心放量期',   festival:'小暑 7/7', date:'7.8-7.14' },
    { key:'W3', summer:'暑期核心放量期',   festival:'三伏 入伏', date:'7.15-7.22' },
    { key:'W4', summer:'立秋预热 + 开学倒计时启动', festival:'大暑 7/23', date:'7.23-7.31' }
  ],
  rows: [
    {
      cat:'教辅', icon:'📖', priority:'P0', colorClass:'wr-cat-color-jiaofu',
      cells: [
        {
          week:'W1', span:2,
          groups: [
            {
              title:'🎓 衔接升学（暑期黄金窗口）',
              items: [
                '幼升小：拼音 / 看图说话 / 20 以内加减',
                '小升初：分班题 / 初一预备 / 衔接教材',
                '初升高：高一一轮预习 / 英语词汇 / 数学衔接'
              ],
              pain:'家长怕"暑期不衔接 秋季掉队"——准小一/准初一/准高一三档刚需在 7 月同时启动，是教辅暑期最确定的需求池'
            },
            {
              title:'📝 专项突破（学科专题）',
              items: [
                '小学：计算 / 阅读理解 / 看图写话专项',
                '初中：数理化专题 / 古诗文言文 / 英语阅读',
                '高中：数学专项突破 / 英语长难句 / 物化一轮'
              ],
              pain:'暑假是家长心目中"补弱科最后窗口"，专项书价位低、复购高，是教辅基本盘'
            }
          ],
          lead:'⏰ 7/1 起核心放量，衔接 + 专项双线持续 4-6 周'
        },
        {
          week:'W3', span:1,
          groups: [
            {
              title:'🔥 高中扩量 + 非K12 试探',
              items: [
                '高中：一轮复习启动品 / 高考真题 / 状元笔记',
                '非K12：四六级 / 考研 / 考公 / 执业药师'
              ],
              pain:'高中学段离升学最近、家长付费力强；非K12 是成年人自学窗口，两者都是"高客单+强决策"人群，值得加码试探'
            }
          ],
          lead:'☀️ 7 月中起，高中一轮复习心智启动；非K12 借暑假成年学习窗口铺品'
        },
        {
          week:'W4', span:1,
          groups: [
            {
              title:'📚 开学倒计时（多学段续单）',
              items: [
                '幼小：入学准备最后一公里',
                '小学/初中：暑假作业收尾 + 新学期预习',
                '高中：开学摸底卷 / 错题归纳'
              ],
              pain:'家长怕"开学摸底掉队"，多学段同步进入续单窗口'
            }
          ],
          lead:'📝 7/25 起开学倒计时心智启动，量稳到 8 月底'
        }
      ]
    },
    {
      cat:'童书', icon:'🧸', priority:'P0', colorClass:'wr-cat-color-tongshu',
      cells: [
        {
          week:'W1', span:4,
          groups: [
            {
              title:'🌱 成长教育 + 思维启蒙（整月主线 · 跨周稳态）',
              items: [
                '思维启蒙 / 财商启蒙 / 内驱力培养',
                '为人处世 / 礼仪教养',
                '情商成长 / 心理 / 情绪管理'
              ],
              pain:'30-45 岁妈妈普遍焦虑"娃情商低 / 没主见 / 不会说话"——是 7 月童书最确定、最稳的跨周需求池'
            },
            {
              title:'👶 上半月承接 — 低龄启蒙衔接',
              items: [
                '幼小衔接：拼音 / 识字 / 看图说话 / 早期算数',
                '低龄思维启蒙：数学思维 / 逻辑游戏 / 早教绘本',
                '启蒙科普 / 生活科学'
              ],
              pain:'准小一妈妈"9 月入学倒计时"刚需 + 低龄妈妈"启蒙黄金窗口"，上半月集中决策'
            },
            {
              title:'📖 下半月承接 — 同 IP 系列套装（亲子阅读高峰）',
              items: [
                '经典儿童文学套装',
                '红色经典少儿版 / 科普百科套装',
                '成长教育系列绘本套装'
              ],
              pain:'家长想"一暑假读完一系列"的成就感，下半月是套装承接亲子阅读高峰的关键窗口'
            }
          ],
          lead:'⏰ 成长教育整月贯穿；低龄启蒙上半月抢决策、同 IP 套装下半月承接亲子阅读'
        }
      ]
    },
    {
      cat:'社科', icon:'🏛', priority:'P1', colorClass:'wr-cat-color-sheke',
      cells: [
        {
          week:'W1', span:4,
          groups: [
            {
              title:'💰 赚钱创富选题（整月主线 · 大盘已验证优势）',
              items: [
                '副业实操 / 个人 IP 打造',
                '投资理财入门',
                '商业谋略 / 翻盘逆袭题材',
                '成事谋略 / 草根逆袭 / 商业人物传记'
              ],
              pain:'25-40 岁打工人「年中 KPI 焦虑」+「搞钱副业」长青诉求；近一年大盘多次跑出爆款'
            },
            {
              title:'🏛 上半月承接 — 国学经典 · 古为今用的实操智慧',
              items: [
                '为人处世智慧（古人谋略 / 家训类）',
                '帝王家训 / 家书家训',
                '古典哲学落地（白话解读实用版）'
              ],
              pain:'家长想"给娃做文化启蒙"；打工人想"用古人智慧解现代焦虑"'
            },
            {
              title:'💼 下半月承接 — 职场人际交往能力',
              items: [
                '沟通表达 / 高情商对话 / 接话回话',
                '向上管理 / 跨部门协作',
                '说话之道 / 提问的力量'
              ],
              pain:'25-35 岁职场新人「人际困境」高频，承接非应试类社科稳态需求'
            }
          ],
          lead:'⏰ 赚钱创富整月贯穿；国学上半月铺底、职场人际下半月承接'
        }
      ]
    },
    {
      cat:'健康', icon:'🌿', priority:'P2', colorClass:'wr-cat-color-jiankang',
      cells: [
        {
          week:'W1', span:4,
          direction:'夏季食谱方向（家常菜 / 果蔬汁 / 24 节气吃法 / 阳台种菜种花）',
          pain:'家庭主理人"夏天没胃口"想换花样；轻食 / 节气吃法是家庭主理人的暑期高频刚需',
          lead:'⏰ 全月铺底款，节气食谱 7/7（小暑）+ 7/23（大暑）双峰'
        }
      ]
    }
  ]
};

// ===== 月份注册表：最新在前，供节奏图 tab 切换使用 =====
// 每项：key(用于内部标识/URL) · label(tab 显示文案) · sublabel(tab 下方小字) · data(节奏数据)
const WEEK_RHYTHM_AUG = {
  weeks: [
    { key:'W1', summer:'暑期超车 · 鸡娃焦虑高峰',       festival:'',              date:'8.1-8.6' },
    { key:'W2', summer:'立秋换季 · 秋季主题起势',        festival:'立秋 8/7',      date:'8.7-8.13' },
    { key:'W3', summer:'开学决策窗口 · 教材同步回升',    festival:'',              date:'8.14-8.22' },
    { key:'W4', summer:'开学季峰值 · 语文选题回升',      festival:'处暑 8/23',     date:'8.23-8.31' }
  ],
  rows: [
    {
      cat:'教辅', icon:'📖', priority:'P0', colorClass:'wr-cat-color-jiaofu',
      cells: [
        {
          week:'W1', span:2,
          groups: [
            {
              title:'📚 暑期超车 · 专项巩固提分',
              items: [
                '重点笔记 / 知识盘点',
                '物理化学专项 / 字帖',
                '错题归纳 / 提分秘籍'
              ],
              pain:'上旬鸡娃家长焦虑高峰，抢暑期最后超车窗口'
            },
            {
              title:'🎓 衔接末班车',
              items: [
                '小升初 / 分班考',
                '预备高一 / 数理化衔接',
                '幼小衔接 / 一日一练'
              ],
              pain:'衔接类最后决策窗口，家长焦虑达峰'
            }
          ],
          lead:'⏰ 上旬提分焦虑高峰 · 衔接类收官'
        },
        {
          week:'W3', span:1,
          groups: [
            {
              title:'📘 开学教材同步回升',
              items: [
                '多版本教材同步（人教 / 北师大）',
                '新学期一本通 / 预习册',
                '高中一轮复习 / 五三'
              ],
              pain:'临近开学，教材同步系列需求快速回升'
            }
          ],
          lead:'☀️ 教材同步系列加码'
        },
        {
          week:'W4', span:1,
          groups: [
            {
              title:'📝 开学峰值 · 语文选题',
              items: [
                '语文文学常识 / 作文素材',
                '语文百科 / 名著导读',
                '分班考押题 / 摸底卷'
              ],
              pain:'开学季语文选题需求回升，全学段决策峰值'
            }
          ],
          lead:'📝 8/25-8/31 开学峰值 · 语文回升'
        }
      ]
    },
    {
      cat:'童书', icon:'🧸', priority:'P0', colorClass:'wr-cat-color-tongshu',
      cells: [
        {
          week:'W1', span:4,
          groups: [
            {
              title:'💡 成长教育童书（假期收心主线）',
              items: [
                '心理调节 / 情绪管理',
                '好习惯养成 / 时间管理',
                '社会适应 / 校园人际启蒙'
              ],
              pain:'假期过半 · 场景切换 → 收心痛点，帮孩子从暑期乱作息切回学校节奏'
            },
            {
              title:'📦 同系列组品 60-100 元',
              items: [
                '经典儿童文学套装',
                '语文课标必读书目',
                '科普 / 国学启蒙套装'
              ],
              pain:'创意需上升到认知和格局，多本同系列组品客单更优'
            }
          ],
          lead:'⏰ 收心痛点主线 · 同系列组品全月贯穿'
        }
      ]
    },
    {
      cat:'社科', icon:'🏛', priority:'P1', colorClass:'wr-cat-color-sheke',
      cells: [
        {
          week:'W1', span:4,
          groups: [
            {
              title:'💆 情绪价值（避世诉求）',
              items: [
                '心理 / 情绪疗愈',
                '通俗国学 · 古为今用',
                '治愈系人生哲学'
              ],
              pain:'高温浮躁 · 缓解下半年职场 / 生活焦虑'
            },
            {
              title:'🛠 实操工具（求生诉求）',
              items: [
                '职场人际 / 沟通表达',
                '财商 / 副业入门',
                '搞钱创富 / 逆袭翻盘'
              ],
              pain:'提升职场竞争力 · 低成本高价值解决方案'
            }
          ],
          lead:'⏰ 情绪价值 + 实操工具双主线'
        }
      ]
    },
    {
      cat:'健康', icon:'🌿', priority:'P2', colorClass:'wr-cat-color-jiankang',
      cells: [
        {
          week:'W1', span:4,
          direction:'食疗汤谱 / 祛湿防燥 / 节气养生 / 体质改善',
          pain:'秋老虎 + 立秋换季 · 银发族与轻养生年轻人季节性小高峰',
          lead:'⏰ 立秋 8/7 + 处暑 8/23 双节气双峰'
        }
      ]
    }
  ]
};

// ===== 9 月节奏（开学季短爆发 + 秋冬养生主线 · 教辅 P0 40% / 健康 P0 30% / 童书 P1 15% / 社科 P1 15%）=====
const WEEK_RHYTHM_SEP = {
  weeks: [
    { key:'W1', summer:'开学首周 · 教材同步高峰',   festival:'',                       date:'9.1-9.6' },
    { key:'W2', summer:'白露换季 · 教师节感恩',     festival:'白露 9/7 · 教师节 9/10', date:'9.7-9.13' },
    { key:'W3', summer:'中秋前蓄势 · 首次月考',     festival:'',                       date:'9.14-9.22' },
    { key:'W4', summer:'秋分进补 · 中秋送礼双峰',   festival:'秋分 9/23 · 中秋 9/25', date:'9.23-9.30' }
  ],
  rows: [
    {
      cat:'教辅', icon:'📖', priority:'P0', colorClass:'wr-cat-color-jiaofu',
      cells: [
        {
          week:'W1', span:2,
          groups: [
            {
              title:'📚 教材同步',
              items: [
                '多版本教材同步（人教 / 北师大 / 苏教）',
                '新学期一本通 / 预习册 / 默写能手'
              ],
              pain:'开学跟不上、第一单元就掉队'
            },
            {
              title:'✍️ 语文主推',
              items: [
                '阅读理解 / 课外阅读积累',
                '字帖练字 / 硬笔书法',
                '看图写话 / 同步作文',
                '实时热点作文素材'
              ],
              pain:'语文靠长期积累，开学要趁早打牢'
            }
          ],
          lead:'⏰ 9/1-9/13 同步 + 语文双主线'
        },
        {
          week:'W3', span:1,
          groups: [
            {
              title:'📘 首次月考冲刺',
              items: [
                '月考真题卷 / 单元测评',
                '重难点突破 / 答题模板'
              ],
              pain:'第一次月考排名焦虑'
            }
          ],
          lead:'⏰ 9/14 起铺 · 月考冲刺'
        },
        {
          week:'W4', span:1,
          groups: [
            {
              title:'🎯 月考复盘 + 假期作业',
              items: [
                '错题归纳 / 专项突破',
                '国庆作业辅导 / 收心'
              ],
              pain:'月考后查漏补缺 + 长假不断档'
            }
          ],
          lead:'📝 9/21 起复盘承接 · 铺垫国庆'
        }
      ]
    },
    {
      cat:'健康', icon:'🌿', priority:'P0', colorClass:'wr-cat-color-jiankang',
      cells: [
        {
          week:'W1', span:1,
          groups: [
            {
              title:'🍲 换季家常菜 + 阳台种养',
              items: [
                '秋季家常菜 / 应季蔬果',
                '家常食补 / 汤粥换花样',
                '阳台种花种菜 / 家庭园艺'
              ],
              pain:'入秋没胃口、想给全家换花样；阳台种点花草蔬菜'
            }
          ],
          lead:'⏰ 9/1 起铺底款'
        },
        {
          week:'W2', span:2,
          groups: [
            {
              title:'🍐 白露润燥 · 秋冬进补起势',
              items: [
                '润燥汤谱 / 秋季食补',
                '养生茶饮 / 应季食材'
              ],
              pain:'秋燥咽干、想给全家润一润'
            }
          ],
          lead:'⏰ 白露 9/7 起势 · 贯穿中秋前'
        },
        {
          week:'W4', span:1,
          groups: [
            {
              title:'🎁 中秋养生送礼',
              items: [
                '养生礼盒 / 食补礼盒',
                '团圆家宴 / 秋季食单'
              ],
              pain:'送礼有心意 + 全家秋冬进补'
            }
          ],
          lead:'⏰ 秋分 9/23 + 中秋 9/25 双峰'
        }
      ]
    },
    {
      cat:'童书', icon:'🧸', priority:'P1', colorClass:'wr-cat-color-tongshu',
      cells: [
        {
          week:'W1', span:1,
          direction:'🌱 开学收心 · 阅读习惯',
          pain:'从假期切回校园节奏，帮孩子静下心',
          lead:'⏰ 9/1 起铺品'
        },
        {
          week:'W2', span:1,
          direction:'🎁 教师节感恩绘本',
          pain:'师生情感 / 感恩主题',
          lead:'⏰ 教师节 9/10 当周爆量'
        },
        {
          week:'W3', span:2,
          direction:'🌕 中秋亲子共读',
          pain:'中秋主题绘本 / 传统文化 / 团圆故事',
          lead:'⏰ 9/14 起铺 · 中秋前 3 天峰值'
        }
      ]
    },
    {
      cat:'社科', icon:'🏛', priority:'P1', colorClass:'wr-cat-color-sheke',
      cells: [
        {
          week:'W1', span:2,
          direction:'💼 职场金九银十 · 求职晋升',
          pain:'秋招季 + 年终前晋升窗口',
          lead:'⏰ 9 月上旬集中投放'
        },
        {
          week:'W3', span:2,
          direction:'📖 中秋国庆人文 · 送礼',
          pain:'人文历史 / 国学经典 / 家国情怀',
          lead:'⏰ 中秋送礼 + 国庆长假阅读双峰'
        }
      ]
    }
  ]
};

// ===== 10 月节奏图（国庆长假 + 寒露 + 重阳 + 霜降 / 期中备考 + 秋冬进补双主线）=====
const WEEK_RHYTHM_OCT = {
  weeks: [
    { key:'W1', summer:'国庆长假 · 家宴陪伴',   festival:'国庆 10/1',                date:'10.1-10.7'  },
    { key:'W2', summer:'寒露润燥 · 长假收心',   festival:'寒露 10/8',                date:'10.8-10.15' },
    { key:'W3', summer:'重阳敬老 · 霜降进补',   festival:'重阳 10/18 · 霜降 10/23', date:'10.16-10.23'},
    { key:'W4', summer:'期中冲刺 · 月末收官',   festival:'万圣节 10/31',             date:'10.24-10.31'}
  ],
  rows: [
    {
      cat:'教辅', icon:'📖', priority:'P0', colorClass:'wr-cat-color-jiaofu',
      cells: [
        {
          week:'W1', span:2,
          groups: [
            {
              title:'📝 国庆作业 + 收心',
              items: [
                '国庆作业辅导 / 假期计划表',
                '单元复习 / 错题回顾',
                '收心自律 / 时间管理'
              ],
              pain:'长假玩散了心，收假就要测验'
            },
            {
              title:'✍️ 语文持续投入',
              items: [
                '阅读理解 / 课外阅读积累',
                '字帖练字 / 硬笔书法',
                '同步作文 / 好词好句'
              ],
              pain:'语文靠积累，假期是最容易断档的科目'
            }
          ],
          lead:'⏰ 10/1-10/15 作业收心 + 语文不断档'
        },
        {
          week:'W3', span:1,
          groups: [
            {
              title:'📘 期中备考启动',
              items: [
                '期中模拟卷 / 单元测评',
                '重难点突破 / 答题模板'
              ],
              pain:'10 月下旬期中，家长提前两周开始找卷子'
            }
          ],
          lead:'⏰ 10/16 起铺 · 期中前置'
        },
        {
          week:'W4', span:1,
          groups: [
            {
              title:'🎯 期中冲刺 + 考后复盘',
              items: [
                '真题卷 / 押题卷',
                '错题归纳 / 专项补差'
              ],
              pain:'期中考完立刻查漏补缺，不能断档到期末'
            }
          ],
          lead:'📝 10/24 起冲刺 · 承接考后复盘'
        }
      ]
    },
    {
      cat:'健康', icon:'🌿', priority:'P0', colorClass:'wr-cat-color-jiankang',
      cells: [
        {
          week:'W1', span:1,
          groups: [
            {
              title:'🍲 国庆家宴 · 长假饮食',
              items: [
                '家宴菜谱 / 节日硬菜',
                '家常温补 / 汤粥换花样',
                '阳台种花种菜 / 家庭园艺'
              ],
              pain:'长假聚餐多，想做几道拿得出手的家宴菜'
            }
          ],
          lead:'⏰ 10/1 起铺底款'
        },
        {
          week:'W2', span:2,
          groups: [
            {
              title:'🍐 寒露润燥 · 重阳进补',
              items: [
                '润燥汤谱 / 秋冬食补',
                '养生茶饮 / 应季食材',
                '长辈食养 / 温和进补'
              ],
              pain:'秋燥加重 + 想给长辈补一补'
            }
          ],
          lead:'⏰ 寒露 10/8 起势 · 贯穿重阳 10/18'
        },
        {
          week:'W4', span:1,
          groups: [
            {
              title:'🎁 霜降冬补 + 长辈送礼',
              items: [
                '食补礼盒 / 养生礼盒',
                '冬令进补 / 应季好物'
              ],
              pain:'霜降后正式入冬，送长辈实用又有心意'
            },
            {
              title:'📅 花草日历 · 银发修身养性',
              items: [
                '花卉 / 植物图鉴日历',
                '节气养生 / 园艺手账日历'
              ],
              pain:'银发族日常修身养性，也是子女送长辈的心意之选'
            }
          ],
          lead:'⏰ 霜降 10/23 起 · 承接冬季'
        }
      ]
    },
    {
      cat:'童书', icon:'🧸', priority:'P1', colorClass:'wr-cat-color-tongshu',
      cells: [
        {
          week:'W1', span:1,
          direction:'🎡 国庆亲子共读 · 长假陪伴',
          pain:'长假陪娃时间多，想趁机读完一整套',
          lead:'⏰ 10/1 起铺品'
        },
        {
          week:'W2', span:1,
          direction:'🍂 寒露自然科普 · 秋日观察',
          pain:'季节变化是最好的自然课，家长愿为科普买单',
          lead:'⏰ 10/8 当周'
        },
        {
          week:'W3', span:2,
          direction:'🎃 重阳敬老 + 万圣趣味',
          pain:'敬老主题绘本 / 传统文化；月末万圣节趣味科普',
          lead:'⏰ 10/16 起铺 · 万圣 10/31 收尾'
        }
      ]
    },
    {
      cat:'社科', icon:'🏛', priority:'P1', colorClass:'wr-cat-color-sheke',
      cells: [
        {
          week:'W1', span:1,
          direction:'📖 国庆长假阅读 · 人文家国',
          pain:'长假整块时间读人文历史 / 家国情怀 / 国学经典',
          lead:'⏰ 10/1-10/7 长假阅读窗口'
        },
        {
          week:'W2', span:1,
          direction:'💼 Q4 冲刺 · 职场晋升 + 搞钱',
          pain:'季度末冲刺 + 年终晋升窗口，赚钱创富长青诉求',
          lead:'⏰ 10/8 收假起集中投放'
        },
        {
          week:'W3', span:2,
          direction:'📅 日历 · 节日送礼 + 年末预热',
          pain:'元旦 / 春节前送礼刚需，日历兼具实用与仪式感；企业团购 + 个人自购双场景，故宫 / 诗词 / 插画 / 生肖四大方向',
          lead:'⏰ 10/16 起铺品，承接双11预热 → 元旦 → 春节送礼长线'
        }
      ]
    }
  ]
};

// ===== 11 月节奏图（立冬 + 双11 + 小雪 + 感恩 / 优先级：教辅 P0 25% · 健康 P0 30% · 社科 P1 25% · 童书 P1 20%）=====
// 设计：双11不喊"全年大促"，落到品质囤书 / 精品绘本礼盒 / 知识礼盒等具体选品；
//       日历送礼贯穿教辅(古诗词/励志金句日历)·社科(2027精品日历)·童书(儿童日历)；下旬进寒假预习/亲子阅读预热
const WEEK_RHYTHM_NOV = {
  weeks: [
    { key:'W1', summer:'立冬进补 · 双11预热',   festival:'立冬 11/7',    date:'11.1-11.8'   },
    { key:'W2', summer:'双11品质囤书',           festival:'双11 11/11',   date:'11.9-11.15'  },
    { key:'W3', summer:'小雪深冬 · 日历送礼',   festival:'小雪 11/22',   date:'11.16-11.23' },
    { key:'W4', summer:'感恩送礼 · 寒假预热',   festival:'感恩节 11/26', date:'11.24-11.30' }
  ],
  rows: [
    {
      cat:'教辅', icon:'📖', priority:'P0', colorClass:'wr-cat-color-jiaofu',
      cells: [
        {
          week:'W1', span:2,
          groups: [
            {
              title:'📐 双11硬提分 · 数理化专项',
              items: [
                '数理化专项提分 / 全科套装',
                '真题模考 / 错题归纳本',
                '工具书 / 字词典'
              ],
              pain:'双11趁大促囤整年教辅，硬提分刚需优先'
            },
            {
              title:'✍️ 语文作文 · 长期积累',
              items: [
                '同步作文 / 满分范文',
                '阅读理解 / 课外积累',
                '字帖练字 / 好词好句'
              ],
              pain:'语文靠长期积累，大促是囤作文素材的好窗口'
            }
          ],
          lead:'⏰ 11/1 起双11囤货 · 数理化硬提分 + 语文作文双线'
        },
        {
          week:'W3', span:1,
          groups: [
            {
              title:'📅 古诗词日历 · 励志金句日历',
              items: [
                '古诗词日历 / 每日一诗一词',
                '励志金句 / 中高考倒计时日历'
              ],
              pain:'日历兼具实用与仪式感，学生党自用 + 家长送礼双场景'
            }
          ],
          lead:'⏰ 11/16 起铺 · 日历送礼窗口'
        },
        {
          week:'W4', span:1,
          groups: [
            {
              title:'📘 期末复习 + 寒假预习前置',
              items: [
                '期末冲刺卷 / 单元测评',
                '下学期衔接 / 寒假专项训练'
              ],
              pain:'12 月底期末 + 寒假预习刚需，家长提前铺品'
            }
          ],
          lead:'📝 11/24 起前置 · 承接期末到寒假'
        }
      ]
    },
    {
      cat:'健康', icon:'🌿', priority:'P0', colorClass:'wr-cat-color-jiankang',
      cells: [
        {
          week:'W1', span:1,
          groups: [
            {
              title:'🍲 立冬进补启动',
              items: [
                '冬令食补 / 温补汤谱',
                '膏方养生 / 应季食材',
                '家常温补 / 汤粥换花样'
              ],
              pain:'立冬正式入冬，想开始给全家补一补'
            }
          ],
          lead:'⏰ 立冬 11/7 起铺底款'
        },
        {
          week:'W2', span:1,
          groups: [
            {
              title:'🛒 双11冬补囤货',
              items: [
                '养生食疗套装 / 系列组品',
                '精品健康礼盒'
              ],
              pain:'趁双11囤一整季的养生食材与食谱'
            }
          ],
          lead:'⏰ 11/9 双11起量'
        },
        {
          week:'W3', span:1,
          groups: [
            {
              title:'❄️ 小雪深冬调理',
              items: [
                '慢病调理 / 血糖血压管理',
                '长辈食养 / 温和进补'
              ],
              pain:'小雪后寒气加重，慢病人群与长辈调理需求集中'
            }
          ],
          lead:'⏰ 小雪 11/22 起势'
        },
        {
          week:'W4', span:1,
          groups: [
            {
              title:'🎁 冬补送礼 + 年货预热',
              items: [
                '食养礼盒 / 养生礼盒',
                '冬令进补好物'
              ],
              pain:'冬补送长辈实用有心意，顺势承接年货季'
            }
          ],
          lead:'⏰ 11/24 起 · 承接双12/年货'
        }
      ]
    },
    {
      cat:'社科', icon:'🏛', priority:'P1', colorClass:'wr-cat-color-sheke',
      cells: [
        {
          week:'W1', span:1,
          direction:'💼 双11知识预热 · 职场搞钱',
          pain:'季度末职场晋升 + 搞钱创富长青诉求，低客单引流',
          lead:'⏰ 11/1 起铺'
        },
        {
          week:'W2', span:1,
          direction:'📈 企业管理 · 年末企业复盘',
          pain:'企管书/管理方法论，年末企业复盘、团队盘点刚需',
          lead:'⏰ 11/9 双11知识礼盒 + 年度书单'
        },
        {
          week:'W3', span:1,
          direction:'📅 2027 日历送礼',
          pain:'故宫/诗词/生肖精品日历，企业团购 + 个人自购，元旦春节送礼预热',
          lead:'⏰ 11/16 起铺 · 日历送礼主场'
        },
        {
          week:'W4', span:1,
          direction:'🗓️ 规划新年布局 + 年末盘点',
          pain:'新年计划/年度规划 + 年度好书盘点/人物传记，感恩送礼',
          lead:'⏰ 11/24 起 · 年末→新年布局长线'
        }
      ]
    },
    {
      cat:'童书', icon:'🧸', priority:'P1', colorClass:'wr-cat-color-tongshu',
      cells: [
        {
          week:'W1', span:1,
          direction:'🎈 早教启蒙 · 识字认知',
          pain:'早教启蒙/识字认知低龄刚需，双11前先铺引流款',
          lead:'⏰ 11/1 起铺品'
        },
        {
          week:'W2', span:1,
          direction:'📚 精品绘本礼盒爆发',
          pain:'双11送礼属性拉满，经典套装/科普百科/立体书',
          lead:'⏰ 11/9 双11当周'
        },
        {
          week:'W3', span:1,
          direction:'📅 儿童日历 + 识字启蒙延续',
          pain:'儿童成长日历/习惯养成日历，识字早教持续承接',
          lead:'⏰ 11/16 起铺'
        },
        {
          week:'W4', span:1,
          direction:'🧸 寒假亲子阅读预热',
          pain:'桥梁书/分级阅读，寒假长周期亲子共读提前布局',
          lead:'⏰ 11/24 起 · 寒假预热'
        }
      ]
    }
  ]
};

const WEEK_RHYTHM_MONTHS = [
  { key:'2026-11', label:'11 月', sublabel:'当期', data: WEEK_RHYTHM_NOV  },
  { key:'2026-10', label:'10 月', sublabel:'往期', data: WEEK_RHYTHM_OCT  },
  { key:'2026-09', label:'9 月',  sublabel:'往期', data: WEEK_RHYTHM_SEP  },
  { key:'2026-08', label:'8 月',  sublabel:'往期', data: WEEK_RHYTHM_AUG  },
  { key:'2026-07', label:'7 月',  sublabel:'往期', data: WEEK_RHYTHM_JULY },
  { key:'2026-06', label:'6 月',  sublabel:'往期', data: WEEK_RHYTHM_JUNE },
  { key:'2026-05', label:'5 月',  sublabel:'往期', data: WEEK_RHYTHM_MAY  }
];

// ===== 默认当月切换：9/24 起切到 10 月（原逻辑保留，兼容不打开 tab 场景）=====
// 前端如启用 tab 切换器，会以 tab 选中项覆盖 window.WEEK_RHYTHM
(function () {
  try {
    var now = new Date();
    var m = now.getMonth() + 1; // 1-12
    var d = now.getDate();
    if (m >= 11 || (m === 10 && d >= 28)) {
      window.WEEK_RHYTHM = WEEK_RHYTHM_NOV;
      window.WEEK_RHYTHM_DEFAULT_KEY = '2026-11';
    } else if (m >= 10 || (m === 9 && d >= 24)) {
      window.WEEK_RHYTHM = WEEK_RHYTHM_OCT;
      window.WEEK_RHYTHM_DEFAULT_KEY = '2026-10';
    } else if (m === 9) {
      window.WEEK_RHYTHM = WEEK_RHYTHM_SEP;
      window.WEEK_RHYTHM_DEFAULT_KEY = '2026-09';
    } else if (m === 8) {
      window.WEEK_RHYTHM = WEEK_RHYTHM_AUG;
      window.WEEK_RHYTHM_DEFAULT_KEY = '2026-08';
    } else if (m === 7 || (m === 6 && d >= 30)) {
      window.WEEK_RHYTHM = WEEK_RHYTHM_JULY;
      window.WEEK_RHYTHM_DEFAULT_KEY = '2026-07';
    } else if (m === 6) {
      window.WEEK_RHYTHM = WEEK_RHYTHM_JUNE;
      window.WEEK_RHYTHM_DEFAULT_KEY = '2026-06';
    } else if (m === 5) {
      window.WEEK_RHYTHM = WEEK_RHYTHM_MAY;
      window.WEEK_RHYTHM_DEFAULT_KEY = '2026-05';
    } else {
      // 其它月份 fallback 到最新一档
      window.WEEK_RHYTHM = WEEK_RHYTHM_MONTHS[0].data;
      window.WEEK_RHYTHM_DEFAULT_KEY = WEEK_RHYTHM_MONTHS[0].key;
    }
  } catch (e) {
    window.WEEK_RHYTHM = WEEK_RHYTHM_NOV;
    window.WEEK_RHYTHM_DEFAULT_KEY = '2026-11';
  }
})();
// 暴露注册表 + 兼容 var 引用方式
window.WEEK_RHYTHM_MONTHS = WEEK_RHYTHM_MONTHS;
var WEEK_RHYTHM = window.WEEK_RHYTHM;

// ==================== ADQ Top3 跑量书洞察（按周次组织 · 仅最新两期展示）====================
// 渲染顺序：封面 → 数据条 → 目标人群 → 创意核心（合规警示语紧随其后）
// key = ISO 日期；前端按 currentWeekIndex 取 WEEK_RANK_LIST[idx].iso 自动匹配
const HOT_BOOK_BREAKDOWN_BY_WEEK = {
  // ===== 10/26 周（最新）=====
  '2026-10-26': [
    {
      role:'#1 教辅·文化常识 · 重回榜首但转化走弱',
      roleClass:'potential',
      title:'我是中国人 所以我知道',
      isbn:'9787510699450',
      image:'rank-images/2026-10-26-image1.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'4.7-5.7%'},
        {icon:'🏆', label:'霸榜', val:'23 期在榜 · 长期 Top3', cls:'hot'}
      ],
      persona:'中小学生家长（想补大语文与文化常识积累）',
      creativeCore:'⚠️ 本期虽重回 #1，但转化从上期 6.6-7.8% 掉到 4.7-5.7%（近三月最低），量在、效率在退——是素材疲劳或人群泛化的典型信号。建议换素材角度、收紧人群包，别只看着榜首继续加投'
    },
    {
      role:'#2 健康·抗炎饮食 · 稳定长青',
      roleClass:'basic',
      title:'抗炎饮食',
      isbn:'978-7-5687-2193-6',
      image:'rank-images/2026-10-26-image2.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'9.8-10.3%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'10 期在榜 · 上期刚登顶 #1', cls:'hot'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'转化 9.8-10.3% 连续多期稳在 10% 附近，是本榜效率最稳的一本。上期登顶 #1、本期小幅回落 #2 属正常位次波动；「吃对食物就是低成本养生」，50 元客单自用与送长辈双场景'
    },
    {
      role:'#3 健康·中医养生 · 持续爬升至新高',
      roleClass:'potential',
      title:'本草入膳',
      isbn:'9787573628725',
      image:'rank-images/2026-10-26-image3.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'6.5-10.3%', cls:'hot'},
        {icon:'📈', label:'轨迹', val:'4 期在榜 · #10→#7→#7→#3', cls:'hot'}
      ],
      persona:'关注食疗调理、厨房养生的中青年与中老年',
      creativeCore:'四期位次单调爬升（#10→#7→#7→#3），是本期最值得跟的上升品种。「把药材放进一日三餐」的低门槛食疗切入点，49-69 元客单介于引流与利润之间；与 #2 抗炎饮食同属健康赛道但打法互补（吃对 vs 吃补）'
    }
  ],
  // ===== 10/19 周 =====
  '2026-10-19': [
    {
      role:'#1 健康·抗炎饮食 · 登顶榜首',
      roleClass:'potential',
      title:'抗炎饮食',
      isbn:'978-7-5687-2193-6',
      image:'rank-images/2026-10-19-image2.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'8.9-10.3%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'9 期在榜 · 本期首次登顶 #1', cls:'hot'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'从 8/24 的 #14 一路爬到本期 #1，用时 9 期，是健康赛道最稳定的主力款。转化稳在 9-10%，入秋冬进补节点可叠加「送长辈」话术放大 50 元客单'
    },
    {
      role:'#2 健康·中医养生 · 高客单冲上第二',
      roleClass:'potential',
      title:'漫画讲透易经养生+中医养生1000问',
      isbn:'978-7-5236-2313-8',
      image:'rank-images/2026-10-19-image8.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'7.8-8.9%'},
        {icon:'💰', label:'客单', val:'¥99', cls:'hot'}
      ],
      persona:'对中医养生、易经国学感兴趣的中老年与中年自学者',
      creativeCore:'11 期在榜的老品，本期冲到 #2 为历史最高（此前多在 #4-#8）。99 元高客单仍能进 Top2，说明「漫画讲透 + 1000 问」的成体系内容对养生人群有强说服力；下期已回落 #8，属脉冲式爆发'
    },
    {
      role:'#3 教辅·文化常识 · 位次下探',
      roleClass:'basic',
      title:'我是中国人 所以我知道',
      isbn:'9787510699450',
      image:'rank-images/2026-10-19-image1.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'6.6-7.8%'},
        {icon:'🏆', label:'霸榜', val:'22 期在榜 · 前两期连霸 #1 后回落 #3'}
      ],
      persona:'中小学生家长（想补大语文与文化常识积累）',
      creativeCore:'开学季红利退潮，位次从 #1 滑到 #3、转化同步从 8.6-9.6% 降至 6.6-7.8%，量级（10-20W）仍稳但效率连续两期走低，需警惕继续下探'
    }
  ],
  // ===== 10/13 周 =====
  '2026-10-13': [
    {
      role:'#1 教辅·文化常识 · 重回榜首',
      roleClass:'potential',
      title:'我是中国人 所以我知道',
      isbn:'9787510699450',
      image:'rank-images/2026-10-13-image1.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'8.6-9.6%'},
        {icon:'🏆', label:'霸榜', val:'21 期在榜 · 8月连霸 #1 后重回', cls:'hot'}
      ],
      persona:'中小学生家长（想补大语文与文化常识积累）',
      creativeCore:'锁定重视大语文素养的家长 · 文化常识认同感 + 课外积累/考试常识双场景，40 元低客单长线常销；暑期后开学季需求回流，转化较暑期明显走高'
    },
    {
      role:'#2 健康·抗炎饮食 · 稳定长青',
      roleClass:'basic',
      title:'抗炎饮食',
      isbn:'978-7-5687-2193-6',
      image:'rank-images/2026-10-13-image2.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'10.2-12.3%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'8 期在榜 · 长期 Top3', cls:'hot'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'锁定已建立抗炎认知的人群 · 强化「吃对食物就是低成本养生」，50 元客单适配自用与送长辈双场景；入秋冬补节点可延伸送礼话术'
    },
    {
      role:'#3 健康·抗炎饮食 · 同期新品跟随',
      roleClass:'basic',
      title:'抗炎食物清单',
      isbn:'978-7-5236-2187-5',
      image:'rank-images/2026-10-13-image3.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'9.8-12.3%', cls:'hot'},
        {icon:'🆕', label:'轨迹', val:'3 期在榜 · 9/28 曾登顶 #1'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'与 #2 同赛道打法互补 · 主打「照着吃」的清单式方案（一日三餐搭配 + 常见食材替换），40 元低客单低决策门槛，适合做引流款'
    }
  ],
  // ===== 10/8 周 =====
  '2026-10-08': [
    {
      role:'#1 教辅·文化常识 · 开学季回流登顶',
      roleClass:'potential',
      title:'我是中国人 所以我知道',
      isbn:'9787510699450',
      image:'rank-images/2026-10-08-image1.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'30-40W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'8.7-9.8%'},
        {icon:'🏆', label:'霸榜', val:'20 期在榜 · 本期重回 #1', cls:'hot'}
      ],
      persona:'中小学生家长（想补大语文与文化常识积累）',
      creativeCore:'锁定重视大语文素养的家长 · 开学后课内外积累需求集中释放，日销冲到 30-40W 为近期高位，40 元低客单长线常销'
    },
    {
      role:'#2 健康·抗炎饮食 · 稳定长青',
      roleClass:'basic',
      title:'抗炎饮食',
      isbn:'978-7-5687-2193-6',
      image:'rank-images/2026-10-08-image2.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'9.8-10.8%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'7 期在榜 · 长期 Top3', cls:'hot'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'锁定已建立抗炎认知的人群 · 强化「吃对食物就是低成本养生」，50 元客单适配自用与送长辈双场景'
    },
    {
      role:'#3 健康·抗炎饮食 · 同期新品跟随',
      roleClass:'basic',
      title:'抗炎食物清单',
      isbn:'978-7-5236-2187-5',
      image:'rank-images/2026-10-08-image3.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'10.8-12.3%', cls:'hot'},
        {icon:'🆕', label:'轨迹', val:'2 期在榜 · 9/28 曾登顶 #1'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'与 #2 同赛道打法互补 · 主打「照着吃」的清单式方案，转化 10.8-12.3% 为三书中最高，40 元低客单适合做引流款'
    }
  ],
  // ===== 9/28 周 =====
  '2026-09-28': [
    {
      role:'#1 健康·抗炎饮食 · 新晋登顶',
      roleClass:'potential',
      title:'抗炎食物清单',
      isbn:'978-7-5236-2187-5',
      image:'rank-images/2026-09-28-image1.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'10.2-12.3%', cls:'hot'},
        {icon:'💰', label:'客单', val:'¥40'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'锁定抗炎饮食人群 · 主打「照着吃」的清单式方案（一日三餐搭配 + 常见食材替换），40 元低客单低决策门槛'
    },
    {
      role:'#2 健康·抗炎饮食 · 长青回落',
      roleClass:'basic',
      title:'抗炎饮食',
      isbn:'978-7-5687-2193-6',
      image:'rank-images/2026-09-28-image2.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'9.8-10.2%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'连续 3 期 #1 后回落 #2', cls:'hot'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'锁定已建立抗炎认知的人群 · 强化「吃对食物就是低成本养生」，50 元客单适配自用与送长辈双场景'
    },
    {
      role:'#3 教辅·文化常识 · 超长青基本盘',
      roleClass:'basic',
      title:'我是中国人 所以我知道',
      isbn:'9787510699450',
      image:'rank-images/2026-09-28-image3.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'5.5-6.7%'},
        {icon:'🏆', label:'霸榜', val:'19 期在榜 · 长期 Top3', cls:'hot'}
      ],
      persona:'中小学生家长（想补大语文与文化常识积累）',
      creativeCore:'锁定重视大语文素养的家长 · 用文化常识认同感切入，课外积累与考试常识双场景，40 元低客单长线常销'
    }
  ],
  // ===== 9/21 周 =====
  '2026-09-21': [
    {
      role:'#1 健康·抗炎饮食 · 连续霸榜',
      roleClass:'basic',
      title:'抗炎饮食',
      isbn:'978-7-5687-2193-6',
      image:'rank-images/2026-08-24-image14.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'30-40W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'8.5-9.8%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'连续 3 期 #1 · 9 月最强', cls:'hot'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'锁定 25-45 岁健康饮食人群 · 给一份「抗炎怎么吃」照着做的清单（早中晚 + 外卖替换），切入秋冬换季高复购刚需'
    },
    {
      role:'#2 健康·中医养生 · 节气刚需',
      roleClass:'opportunity',
      title:'漫画讲透易经养生+二十四节气养生吃法',
      isbn:'978-7-5236-2313-8',
      image:'rank-images/2026-08-10-image17.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'6.9-7.9%'},
        {icon:'💰', label:'客单', val:'¥99'}
      ],
      persona:'30-55 岁关注节气养生、中医调理的人群',
      creativeCore:'锁定节气养生人群 · 漫画降门槛讲透易经 + 二十四节气吃法，99 元组套适配秋冬进补场景'
    },
    {
      role:'#3 童书·科普百科 · 高客单长青',
      roleClass:'basic',
      title:'会讲故事的经济学',
      isbn:'9787516685921',
      image:'rank-images/2026-08-03-image6.jpg',
      cat:'童书',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'2.5-3.5%'},
        {icon:'💰', label:'客单', val:'¥189-388'}
      ],
      persona:'6-12 岁孩子的家长（想做财商启蒙，愿为高客单组套买单）',
      creativeCore:'锁定财商启蒙家长 · 用故事载体讲经济学降低理解门槛，189-388 元高客单组套，转化偏低需靠内容深度说服'
    }
  ],

  // ===== 9/14 周 =====
  '2026-09-14': [
    {
      role:'#1 健康·抗炎饮食 · 登顶霸榜',
      roleClass:'basic',
      title:'抗炎饮食',
      isbn:'978-7-5687-2193-6',
      image:'rank-images/2026-08-24-image14.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'30-40W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'9.8-10.2%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'8/31 #3 → 9/14 #1', cls:'hot'}
      ],
      persona:'25-45 岁关注抗炎抗衰、换季养生的中青年',
      creativeCore:'锁定 25-45 岁健康饮食人群 · 主打「抗炎怎么吃」照着做的清单，日销跃升到 30-40W 档，健康成 9 月主线'
    },
    {
      role:'#2 社科·文化常识 · 长青',
      roleClass:'basic',
      title:'中国孩子必知的文化常识3000问',
      isbn:'9787510699450',
      image:'rank-images/image89.jpg',
      cat:'社科',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'4.7-5.8%'},
        {icon:'🏆', label:'霸榜', val:'长期在榜 · 本周 #2', cls:'hot'}
      ],
      persona:'6-15 岁孩子的妈妈（关注语文素养、阅读积累）',
      creativeCore:'维持采访学霸抽问形式基本盘 · 结合开学季语文积累补充新素材，防止创意疲劳'
    },
    {
      role:'#3 童书·科普百科 · 高客单组套',
      roleClass:'basic',
      title:'会讲故事的经济学',
      isbn:'9787516685921',
      image:'rank-images/2026-08-03-image6.jpg',
      cat:'童书',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'4.2-5.2%'},
        {icon:'💰', label:'客单', val:'¥189-388'}
      ],
      persona:'6-12 岁孩子的家长（想做财商启蒙，愿为高客单组套买单）',
      creativeCore:'锁定财商启蒙家长 · 故事载体讲经济学降低门槛，189-388 元组套走高客单，靠内容深度补足转化'
    }
  ],

  // ===== 8/31 周 =====
  '2026-08-31': [
    {
      role:'#1 童书·科普百科 · 潜力转正黑马',
      roleClass:'opportunity',
      title:'很冷门的知识',
      isbn:'9787523708293',
      image:'rank-images/2026-08-24-image22.jpg',
      cat:'童书',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'10.2-12.3%', cls:'hot'},
        {icon:'🏆', label:'登顶', val:'潜力爆品转正 · 直冲 #1', cls:'hot'}
      ],
      persona:'中小学生家长（想开拓孩子视野、积累冷门科普知识）',
      creativeCore:'锁定中小学生家长 · 主打「同龄人都答不上来的冷知识」信息差，30 元低客单走量，靠「涨见识」情绪拉动下单'
    },
    {
      role:'#2 社科·文化常识 · 长青回落',
      roleClass:'basic',
      title:'中国孩子必知的文化常识3000问',
      isbn:'9787510699450',
      image:'rank-images/image89.jpg',
      cat:'社科',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'5.8-6.8%'},
        {icon:'🏆', label:'霸榜', val:'8/24 #1 → 8/31 #2 · 长期在榜', cls:'hot'}
      ],
      persona:'6-15 岁孩子的妈妈（关注语文素养、阅读积累）',
      creativeCore:'维持采访学霸抽问形式基本盘 · 结合「开学季语文积累」补充新素材，防止创意疲劳'
    },
    {
      role:'#3 健康·抗炎饮食 · 跃升劲品',
      roleClass:'opportunity',
      title:'抗炎饮食',
      isbn:'978-7-5687-2193-6',
      image:'rank-images/2026-08-24-image14.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'9.8-10.2%', cls:'hot'},
        {icon:'📈', label:'跃升', val:'8/24 #14 → 8/31 #3', cls:'hot'}
      ],
      persona:'25-45 岁关注健康饮食的中青年（抗炎抗衰、换季养生）',
      creativeCore:'锁定 25-45 岁健康饮食人群 · 给一份「抗炎怎么吃」照着做的清单（早中晚 + 外卖替换），切入换季养生刚需'
    }
  ],

  // ===== 7/13 周 =====
  '2026-07-13': [
    {
      role:'#1 教辅·高中多科 · 新王登基',
      roleClass:'opportunity',
      title:'高中数理化公式法二级结论秒解+高中知识思维导图',
      isbn:'9787554948163',
      image:'rank-images/2026-07-13-image1.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'20-30W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'6.6-7.6%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'首次上榜 · 直冲 #1（小程序）', cls:'hot'}
      ],
      persona:'准高一 / 高二 / 高三孩子的妈妈（暑期冲刺、提分刚需）',
      creativeCore:'锁定高中家长 · 主打「一页公式抵一本资料」效率对比 + 学霸口述"考场原题套结论"实证，落点"帮孩子省时间、家长少焦虑"'
    },
    {
      role:'#2 社科·文化常识 · 长青回落',
      roleClass:'basic',
      title:'中国孩子必知的文化常识3000问',
      isbn:'9787510699450',
      image:'rank-images/2026-07-13-image2.jpg',
      cat:'社科',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'5.9-6.9%'},
        {icon:'🏆', label:'霸榜', val:'6 连霸终结 → #2 · 27 期全在榜', cls:'hot'}
      ],
      persona:'6-15 岁孩子的妈妈（关注语文素养、阅读积累）',
      creativeCore:'维持采访学霸抽问形式基本盘 · 结合"新初一/新高一衔接"补充新素材防止创意疲劳'
    },
    {
      role:'#3 教辅·初中物理 · 霸榜劲品',
      roleClass:'basic',
      title:'漫画初中物理早知道',
      isbn:'978-7-5736-3985-1',
      image:'rank-images/2026-07-13-image3.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'2.1-3.5%'},
        {icon:'🏆', label:'霸榜', val:'连续在榜 12 周 · 稳居 #3', cls:'hot'}
      ],
      persona:'准初一 / 初二孩子的妈妈（预习初中物理、消除畏难情绪）',
      creativeCore:'锁定准初一/初二家长 · 漫画降门槛主打「暑假抢跑一步 → 开学不畏难」，配合"初中必背古诗+文言文"组合投放形成"新初一预习全科"打法'
    }
  ],

  // ===== 7/6 周 =====
  '2026-07-06': [
    {
      role:'#1 社科·文化常识 · 长青王者',
      roleClass:'basic',
      title:'中国孩子必知的文化常识3000问',
      isbn:'9787510699450',
      image:'rank-images/2026-07-06-image1.jpg',
      cat:'社科',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'5.1-6.1%'},
        {icon:'🏆', label:'霸榜', val:'6 周连霸 #1', cls:'hot'}
      ],
      persona:'6-15 岁孩子的妈妈（关注语文素养、阅读积累）',
      creativeCore:'采访学霸抽问形式 · 通过「同龄人都会 vs 我家孩子答不上」的信息差焦虑渗透家长语文素养付费意愿'
    },
    {
      role:'#2 童书·幼小衔接 · 转化爆发',
      roleClass:'opportunity',
      title:'预备一年级',
      isbn:'9787575401920',
      image:'rank-images/2026-07-06-image2.jpg',
      cat:'童书',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'9.8-10.9%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'连续在榜 6 周 · 转化跃升 3×', cls:'hot'}
      ],
      persona:'5-6 岁孩子的妈妈（暑期幼升小衔接刚需）',
      creativeCore:'锁定准小一家长 · 延续「暑期 60 天衔接方案」但更聚焦近端行动，让家长看到"9 月开学不慌"的可信节奏'
    },
    {
      role:'#3 教辅·初中物理 · 霸榜劲品',
      roleClass:'basic',
      title:'漫画初中物理早知道',
      isbn:'978-7-5736-3985-1',
      image:'rank-images/2026-07-06-image3.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'1.8-2.8%'},
        {icon:'🏆', label:'霸榜', val:'连续在榜 11 周 · 本周升至 #3', cls:'hot'}
      ],
      persona:'准初一 / 初二孩子的妈妈（预习初中物理、消除畏难情绪）',
      creativeCore:'锁定准初一/初二家长 · 漫画形式降低物理入门门槛，主打「暑假抢跑一步 → 开学不畏难」情绪 + "初中必背古诗+文言文"组合投放'
    }
  ],

  // ===== 6/29 周 =====
  '2026-06-29': [
    {
      role:'#1 社科·文化常识 · 长青王者',
      roleClass:'basic',
      title:'中国孩子必知的文化常识3000问',
      isbn:'9787510699450',
      image:'rank-images/2026-06-29-image1.jpg',
      cat:'社科',
      stats:[
        {icon:'📊', label:'日销售额', val:'20-30W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'5.2-6.2%'},
        {icon:'🏆', label:'霸榜', val:'6 周连霸 #1', cls:'hot'}
      ],
      persona:'6-15 岁孩子的妈妈（关注语文素养、阅读积累）',
      creativeCore:'采访学霸创新形式 — 让初中/中考学霸现场出镜接受抽问（聚焦中考考点原题语文常识），学霸们对答如流，反向戳中家长「我家孩子答不上来」的焦虑'
    },
    {
      role:'#2 童书·幼小衔接 · 季节性刚需',
      roleClass:'basic',
      title:'预备一年级',
      isbn:'9787575401920',
      image:'rank-images/2026-06-29-image2.jpg',
      cat:'童书',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'2.8-3.8%'},
        {icon:'🏆', label:'霸榜', val:'5 周连续 + 晋 #2', cls:'hot'}
      ],
      persona:'5-6 岁孩子的妈妈（暑期幼升小衔接刚需）',
      creativeCore:'暑期教辅打衔接 · 生活场景化对谈 — 学生 / 家长 / 老师 / IP 多角色组合出镜，用生活场景对谈形式呈现，把"幼升小怎么准备"拆成日常可感的具体动作，降低家长决策门槛'
    },
    {
      role:'#3 教辅·初中语文 · 新登榜',
      roleClass:'opportunity',
      title:'初中必背古诗+初中背背文言文',
      isbn:'9787511593351',
      image:'rank-images/2026-06-29-image3.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'9.0-11.0%', cls:'hot'},
        {icon:'📈', label:'新登榜', val:'直冲 #3', cls:'hot'}
      ],
      persona:'准初一 / 初二孩子的妈妈（暑期文言文古诗背诵刚需）',
      creativeCore:'抢跑初中三年文言文 — 主打「利用好暑期，抢跑初中三年的文言文」紧迫感钩子，借人民日报权威背书 + 漫画形式还原文言文场景，让生涩文言文变成孩子愿意主动翻的读物'
    }
  ],

  // ===== 6/22 周 =====
  '2026-06-22': [
    {
      role:'#1 社科·文化常识 · 长青基本盘',
      roleClass:'basic',
      title:'中国孩子必知的文化常识3000问',
      isbn:'9787510699450',
      image:'rank-images/2026-06-22-image1.jpg',
      cat:'社科',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'3.3-4.3%'},
        {icon:'🏆', label:'霸榜', val:'5 周连霸 #1', cls:'hot'}
      ],
      persona:'6-15 岁孩子的妈妈（关注语文素养、阅读积累）',
      creativeCore:'打认知信息差 — 「这些常识孩子答不上，但同龄人都会」。3000 问体系化补足语文素养盲区，戳中家长「怕娃见识比同龄人窄」的焦虑'
    },
    {
      role:'#2 社科·职场谋略 · 新爆款',
      roleClass:'opportunity',
      title:'闷声发大财',
      isbn:'9787558352744',
      image:'rank-images/2026-06-22-image2.jpg',
      cat:'社科',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'9.7-10.7%'},
        {icon:'📈', label:'新登榜', val:'直冲 #2', cls:'hot'}
      ],
      persona:'25-40 岁打工人 / 中小老板（关注职场博弈、副业思维）',
      creativeCore:'锁定打工人 / 中小老板 — 给一份"不显山不露水把钱赚到手"的处世行动指南：管嘴、避坑、借势 3 步法，每步配真实场景'
    },
    {
      role:'#3 教辅·幼小衔接 · 季节性刚需',
      roleClass:'basic',
      title:'预备一年级',
      isbn:'9787575401920',
      image:'rank-images/2026-06-22-image3.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'2.8-3.8%'},
        {icon:'🏆', label:'霸榜', val:'4 周连续在榜', cls:'hot'}
      ],
      persona:'5-6 岁孩子的妈妈（暑期幼升小衔接刚需）',
      creativeCore:'锁定准小一家长 — 给一份暑期 60 天幼升小衔接照着做的方案：拼音、识字、20以内加减分阶段每天打卡，9 月入学不慌'
    }
  ],

  // ===== 6/15 周 =====
  '2026-06-15': [
    {
      role:'#1 社科·文化常识 · 长青基本盘',
      roleClass:'basic',
      title:'中国孩子必知的文化常识3000问',
      isbn:'9787510699450',
      image:'rank-images/2026-06-15-image1.jpg',
      cat:'社科',
      stats:[
        {icon:'📊', label:'日销售额', val:'30-40W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'4.2-5.2%'},
        {icon:'🏆', label:'霸榜', val:'4 周连霸', cls:'hot'}
      ],
      persona:'6-15 岁孩子的妈妈（关注语文素养、阅读积累）',
      creativeCore:'打认知信息差 — 「这些常识孩子答不上，但同龄人都会」。3000 问体系化补足语文素养盲区，戳中家长「怕娃见识比同龄人窄」的焦虑'
    },
    {
      role:'#2 健康·儿童身高营养 · 长青基本盘',
      roleClass:'basic',
      title:'这样吃长更高',
      isbn:'9787500186250',
      image:'rank-images/2026-06-15-image2.jpg',
      cat:'健康',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'9.7-10.7%', cls:'hot'},
        {icon:'🏆', label:'霸榜', val:'4 周连霸', cls:'hot'}
      ],
      persona:'奶奶 + 妈妈（家中"喂饭主理人"）',
      creativeCore:'锁定家中「喂饭主理人」 — 给一份按年龄分段照着做的长高食谱：婴幼儿、学龄、青春期每天吃什么直接抄作业'
    },
    {
      role:'#3 教辅·初中物理 · 新晋黑马',
      roleClass:'opportunity',
      title:'漫画初中物理早知道',
      isbn:'9787573639851',
      image:'rank-images/2026-06-15-image3.jpg',
      cat:'教辅',
      stats:[
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'📈', label:'跳量级', val:'6/9 #11 → 6/15 #3', cls:'hot'},
        {icon:'🎯', label:'转化', val:'3.7-3.5%'}
      ],
      persona:'小升初 + 初一家长（暑期初二物理预习刚需）',
      creativeCore:'锁定小升初 + 初一家长 — 给一份用漫画讲透初中物理重难点的「暑期预习路线图」，让娃开学物理不再坐过山车'
    }
  ],

  // ===== 6/9 周 =====
  '2026-06-09': [
    {
      role:'#1 社科·文化常识 · 黑马',
      roleClass:'basic',
      title:'中国孩子必知的文化常识3000问',
      isbn:'9787510699450',
      image:'rank-images/2026-06-09-image2.jpg',
      cat:'社科',
      stats:[
        {icon:'💰', label:'客单', val:'¥40'},
        {icon:'📊', label:'日销售额', val:'30-40W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'3.2-4.2%'}
      ],
      persona:'6-15 岁孩子的妈妈（关注语文素养、阅读积累）',
      creativeCore:'打认知信息差 — 「这些常识孩子答不上，但同龄人都会」。3000 问体系化补足语文素养盲区，戳中家长「怕娃见识比同龄人窄」的焦虑'
    },
    {
      role:'#2 健康·饮食 · 新爆款',
      roleClass:'opportunity',
      title:'减糖饮食',
      isbn:'9787553215389',
      image:'rank-images/2026-06-09-image4.jpg',
      cat:'健康',
      stats:[
        {icon:'💰', label:'客单', val:'¥39.8'},
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'12.6-13.6%', cls:'hot'}
      ],
      persona:'25-45 岁女性自购（体重管理 / 抗糖抗衰）',
      creativeCore:'锁定 25-45 岁体重管理 / 抗糖人群 — 给一份可立刻照做的减糖行动方案：早中晚怎么吃、外卖怎么挑、嘴馋怎么替换'
    },
    {
      role:'#3 健康·儿童身高营养 · 长青基本盘',
      roleClass:'basic',
      title:'这样吃长更高',
      isbn:'9787500186250',
      image:'rank-images/2026-06-09-image3.jpg',
      cat:'健康',
      stats:[
        {icon:'💰', label:'客单', val:'¥50'},
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'10.6-11.6%', cls:'hot'}
      ],
      persona:'奶奶 + 妈妈（家中"喂饭主理人"）',
      creativeCore:'锁定家中「喂饭主理人」 — 给一份按年龄分段照着做的长高食谱：婴幼儿、学龄、青春期每天吃什么直接抄作业'
    }
  ],

  // ===== 6/1 周 =====
  '2026-06-01': [
    {
      role:'#1 健康·儿童身高营养',
      roleClass:'basic',
      title:'这样吃长更高',
      isbn:'9787500186250',
      image:'rank-images/image259.jpg',
      cat:'健康',
      stats:[
        {icon:'💰', label:'客单', val:'¥50'},
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'10.7-11.7%', cls:'hot'}
      ],
      persona:'奶奶 + 妈妈（家中"喂饭主理人"，关注孩子成长黄金期，怕错过身高敏感窗）',
      creativeCore:'抓住孩子成长黄金期 — 适配 0-18 岁全年龄段长高食谱（婴幼儿辅食 → 学龄营养餐 → 青春期补钙增高方案）；「你懒孩子就矮」直击家长行动力痛点，¥50 低门槛即下单'
    },
    {
      role:'#2 童书·立体书',
      roleClass:'opportunity',
      title:'我们的中国立体书 + 环游世界立体书',
      isbn:'9787555717119',
      image:'rank-images/image87.jpg',
      cat:'童书',
      stats:[
        {icon:'💰', label:'客单', val:'¥89-159'},
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'6.7-7.7%'}
      ],
      persona:'3-8 岁孩子的妈妈自购 + 爷爷奶奶代际送礼（六一节冲刺，临节前最后送礼窗口）',
      creativeCore:'六一儿童节冲刺阶段切入 — 孩子翻立体页惊喜表情 + 中国/世界知识科普沉浸式演示；礼物质感卡位节日价位带（送礼场景强调 ¥89-159 客单）'
    },
    {
      role:'#3 童书·成长教育',
      roleClass:'potential',
      title:'漫画帝王家书',
      isbn:'9787537766289',
      image:'rank-images/image91.jpg',
      cat:'童书',
      stats:[
        {icon:'💰', label:'客单', val:'¥39.9'},
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'7.2-8.2%'}
      ],
      persona:'8-14 岁孩子的妈妈（关注孩子成长教育）',
      creativeCore:'打教育解决方案信息差，主打逆袭翻盘 — 帝王智慧切入，提高孩子为人处事和情商；漫画形态降低阅读门槛'
    }
  ],

  // ===== 5/25 周 =====
  '2026-05-25': [
    {
      role:'#1 童书·立体书',
      roleClass:'basic',
      title:'我们的中国立体书 + 环游世界立体书',
      isbn:'9787555717119',
      image:'rank-images/image233.jpg',
      cat:'童书',
      stats:[
        {icon:'💰', label:'客单', val:'¥89-159'},
        {icon:'📊', label:'日销售额', val:'60-80W', cls:'hot'},
        {icon:'🎯', label:'转化', val:'7.8-8.8%', cls:'hot'}
      ],
      persona:'3-8 岁孩子的妈妈自购 + 爷爷奶奶代际送礼（六一/暑期送礼共振）',
      creativeCore:'六一送礼场景切入 — 孩子翻立体页惊喜表情 + 沉浸式知识科普；礼物质感卡位节日价位带（送礼场景可强调 ¥89-159 客单）'
    },
    {
      role:'#2 社科·家居生活',
      roleClass:'opportunity',
      title:'家相',
      isbn:'9787806537039',
      image:'rank-images/image1694.jpg',
      cat:'社科',
      stats:[
        {icon:'💰', label:'客单', val:'¥48'},
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'12.8-16.8%', cls:'hot'}
      ],
      persona:'中小老板 + 职场人士（关注办公室/工位布置带来的状态加成）',
      creativeCore:'列举老板/职场办公室的布置摆放建议：工位朝向、办公桌物品摆放、绿植/装饰位等实用技巧 → 翻页讲解 + 中式家居美学'
    },
    {
      role:'#3 教辅·会考冲刺',
      roleClass:'basic',
      title:'备战生地会考一本通 + 秒记初中小四门',
      isbn:'97875501958998',
      image:'rank-images/image1695.jpg',
      cat:'教辅',
      stats:[
        {icon:'💰', label:'客单', val:'¥399-499'},
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'💎', label:'链路', val:'小程序直购溢价', cls:'hot'}
      ],
      persona:'初二家长（生地会考冲刺刚需 · 6 月底前必考）',
      creativeCore:'主打初二家长人群，「生地开卷考试推荐带进考场」紧迫切入 → 一本通 + 秒记法解决 4 门零碎，组套适配长周期复习'
    }
  ],

  // ===== 5/18 周（上一期）=====
  '2026-05-18': [
    {
      role:'#1 童书·立体书',
      roleClass:'basic',
      title:'我们的中国立体书 + 环游世界立体书',
      isbn:'9787555717119',
      image:'rank-images/image233.jpg',
      cat:'童书',
      stats:[
        {icon:'💰', label:'客单', val:'¥89-159'},
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'7.5-8.5%', cls:'hot'}
      ],
      persona:'3-8 岁孩子的妈妈自购 + 爷爷奶奶代际送礼（节日送礼共振）',
      creativeCore:'妈妈实拍立体书开箱 + 孩子翻页惊喜表情 + 知识科普沉浸式演示；礼物质感卡位节日价位带（送礼场景可强调 ¥89-159 客单）'
    },
    {
      role:'#2 教辅·暑期英语',
      roleClass:'opportunity',
      title:'66 篇英语故事记 2100 词',
      isbn:'9787521335156',
      image:'rank-images/image_english_2100.jpg',
      cat:'教辅',
      stats:[
        {icon:'💰', label:'客单', val:'¥399'},
        {icon:'📊', label:'日销售额', val:'10-20W', cls:'hot'},
        {icon:'💎', label:'链路', val:'小程序直购溢价', cls:'hot'}
      ],
      persona:'10-15 岁孩子的妈妈（小升初/初中阶段，关注暑期英语成体系学习）',
      creativeCore:'用故事载体讲解词汇，弱化机械记忆 → 2100 词覆盖初中常用，暑期 60 天每日 1 篇节奏轻量'
    },
    {
      role:'#3 童书·历史人文',
      roleClass:'opportunity',
      title:'漫画帝王家书',
      isbn:'9787515366692',
      image:'rank-images/image237.jpg',
      cat:'童书',
      stats:[
        {icon:'💰', label:'客单', val:'¥39.9'},
        {icon:'📊', label:'日销售额', val:'10-20W'},
        {icon:'🎯', label:'转化', val:'10.6-11.6%', cls:'hot'}
      ],
      persona:'8-14 岁孩子的妈妈（关注孩子成长教育）',
      creativeCore:'打教育解决方案信息差，主打逆袭翻盘 — 帝王智慧切入，提高孩子为人处事和情商；漫画形态降低阅读门槛'
    }
  ]
};

// 兼容旧引用（默认指向最新一周）
const HOT_BOOK_BREAKDOWN = HOT_BOOK_BREAKDOWN_BY_WEEK['2026-10-26'];

// ==================== 4 大品类细分类目 ====================
const SUBCAT_DETAIL = {
  '教辅':{color:'#ef4444', subs:[
    {name:'初中多科教辅', sku:185, share:18.5, growth:'+15%'},
    {name:'小学多科教辅', sku:152, share:15.2, growth:'+22%'},
    {name:'初中语文教辅', sku:98, share:9.8, growth:'+8%'},
    {name:'小学英语教辅', sku:78, share:7.8, growth:'+12%'},
    {name:'小学数学教辅', sku:65, share:6.5, growth:'+18%'},
    {name:'高中多科教辅', sku:48, share:4.8, growth:'+5%'},
    {name:'初中英语教辅', sku:42, share:4.2, growth:'+9%'},
    {name:'其他教辅书籍', sku:32, share:3.2, growth:'-3%'}
  ]},
  '童书':{color:'#f59e0b', subs:[
    {name:'儿童成长/教育书', sku:135, share:14.3, growth:'+25%'},
    {name:'科普百科', sku:88, share:9.3, growth:'+18%'},
    {name:'幼儿认知/立体书', sku:62, share:6.6, growth:'+30%'},
    {name:'学前启蒙/幼小衔接', sku:58, share:6.1, growth:'+15%'},
    {name:'儿童文学', sku:42, share:4.4, growth:'+6%'},
    {name:'低幼读物', sku:25, share:2.6, growth:'+10%'}
  ]},
  '健康':{color:'#10b981', subs:[
    {name:'中医养生', sku:55, share:5.5, growth:'+12%'},
    {name:'饮食健康', sku:42, share:4.2, growth:'+18%'},
    {name:'养生保健-其他', sku:25, share:2.5, growth:'+5%'},
    {name:'家庭护理', sku:15, share:1.5, growth:'+3%'}
  ]},
  '社科':{color:'#8b5cf6', subs:[
    {name:'国学/古籍', sku:75, share:7.5, growth:'+20%'},
    {name:'自我实现/励志', sku:62, share:6.2, growth:'+15%'},
    {name:'家庭教育/育儿', sku:48, share:4.8, growth:'+22%'},
    {name:'中国文学/小说', sku:42, share:4.2, growth:'+8%'},
    {name:'历史', sku:35, share:3.5, growth:'+12%'},
    {name:'外国文学/小说', sku:28, share:2.8, growth:'+5%'},
    {name:'艺术-书法篆刻', sku:22, share:2.2, growth:'+18%'}
  ]}
};

// ==================== 重点品类深度选品思路（9月开学季视角 · 教辅语文主推 · 每品类 3 张同构）====================
const DEEP_CATS = [
  // ========= 教辅 3 卡（11 月 P0 · 双11硬提分 + 语文作文/日历 + 寒假预习前置）=========
  {role:'基本盘', name:'教辅 · 数理化硬提分（双11囤货）', icon:'📐', headClass:'basic', cat:'教辅',
    sellingPoint:'双11家长囤整年教辅 · 硬提分刚需优先',
    subCats:['数理化专项提分 / 全科套装','真题模考 / 错题归纳本','工具书 / 字词典'],
    tips:[
      '<strong>选品思路</strong>：双11（11/11）是全年第二大囤货节点，家长趁大促一次性囤整学期教辅，数理化硬提分是决策最快、复购最稳的刚需；按学段 + 版本铺货',
      '<strong>人群需求</strong>：家长怕"偏科拖后腿"，期中考后到期末前（12 月底）正是补差窗口，硬科目提分诉求集中释放'
    ]},
  {role:'机会盘', name:'教辅 · 语文作文 + 日历（长期积累）', icon:'✍️', headClass:'opportunity', cat:'教辅',
    sellingPoint:'语文靠积累 + 日历送礼 · 高复购 + 仪式感',
    subCats:['作文：同步作文 / 满分范文 / 好词好句','阅读理解 / 课外积累 / 名著导读','练字：同步字帖 / 硬笔书法','日历：古诗词日历 / 励志金句 / 中高考倒计时日历'],
    tips:[
      '<strong>选品思路</strong>：语文作文是长线复购品，双11打包"作文素材 + 阅读 + 练字"做囤货；11 月中下旬叠加古诗词日历 / 励志金句日历，学生党自用 + 家长送礼双场景',
      '<strong>人群需求</strong>：家长"语文靠长期积累"心智强；日历兼具实用与仪式感，是低客单高频引流的切入点'
    ]},
  {role:'潜力品', name:'教辅 · 期末复习 + 寒假预习前置', icon:'📘', headClass:'potential', cat:'教辅',
    sellingPoint:'期末→寒假无缝衔接 · 下旬前置铺品',
    subCats:['期末冲刺卷 / 单元测评','下学期衔接 / 寒假专项训练','高中一轮复习 / 非K12 考证'],
    tips:[
      '<strong>选品思路</strong>：11 月下旬（11/24 起）前置铺期末复习，并提前承接寒假预习——12 月底期末 + 寒假衔接是连续刚需，不能断档；高中一轮 / 非K12 考证做高客单梯队',
      '<strong>人群需求</strong>：家长"期末考完立刻进寒假、怕孩子假期落下"，提前为下学期布局'
    ]},
  // ========= 童书 3 卡（11 月 P1 · 早教启蒙识字 / 精品绘本礼盒 / 儿童日历+寒假阅读）=========
  {role:'基本盘', name:'童书 · 早教启蒙 + 识字认知', icon:'🌱', headClass:'basic', cat:'童书',
    sellingPoint:'低龄启蒙刚需 · 童书最稳的基本盘',
    subCats:['早教启蒙：认知卡 / 情商启蒙 / 思维训练','识字认知：识字大王 / 看图识字 / 拼音启蒙','习惯养成：专注力 / 情绪管理 / 为人处世'],
    tips:[
      '<strong>选品思路</strong>：早教启蒙 / 识字认知是低龄家长的确定性需求池，双11前先铺引流款起量；抓"别让娃输在起跑线"的家长焦虑',
      '<strong>人群需求</strong>：0-6 岁孩子的妈妈，关注"启蒙早、识字快、习惯好"，决策高频、客单低、易冲量'
    ]},
  {role:'机会盘', name:'童书 · 精品绘本礼盒（双11送礼）', icon:'📚', headClass:'opportunity', cat:'童书',
    sellingPoint:'双11送礼属性拉满 · 套装客单高于单本',
    subCats:['经典儿童文学套装（安徒生 / 格林童话）','科普百科 / 自然历史套装','立体书 / 互动书 / 精装礼盒'],
    tips:[
      '<strong>选品思路</strong>：双11（11/11）精品绘本礼盒是送礼主力，同 IP 套装比单本更打动家长，礼盒装客单较日常款高约 30%；"一次囤够一整套"完成感强',
      '<strong>人群需求</strong>：妈妈趁大促囤书 + 长辈送礼双场景，关注"成套 + 有质感 + 孩子能读完"'
    ]},
  {role:'潜力品', name:'童书 · 儿童日历 + 寒假亲子阅读', icon:'📅', headClass:'potential', cat:'童书',
    sellingPoint:'日历送礼 + 寒假长周期承接',
    subCats:['儿童成长日历 / 习惯养成日历','冬日主题绘本 / 节气自然观察','寒假亲子共读：桥梁书 / 分级阅读'],
    tips:[
      '<strong>选品思路</strong>：11 月中旬起铺儿童日历（成长 / 习惯养成）承接送礼；下旬（11/24 起）前置寒假亲子阅读，桥梁书 / 分级阅读做长周期承接',
      '<strong>人群需求</strong>：家长想要"每天翻一页"的陪伴仪式感；寒假将至，提前布局亲子共读清单'
    ]},
  // ========= 社科 3 卡（11 月 P1 · 双11知识搞钱 / 企管年末复盘 / 2027日历+新年布局）=========
  {role:'基本盘', name:'社科 · 赚钱创富 + 双11知识付费', icon:'💰', headClass:'basic', cat:'社科',
    sellingPoint:'⭐ 大盘已验证优势选题 · 双11知识囤货',
    subCats:['副业实操 / 个人 IP 打造','投资理财入门 / 负债翻盘','开口即成交 / 潮汕思维 / 渔樵问对'],
    tips:[
      '<strong>选品思路</strong>：近一年大盘多次跑出爆款，11 月整月铺底；双11叠加知识付费囤货心智，强调"可落地的实操"而非空泛理论',
      '<strong>人群需求</strong>：25-40 岁打工人「搞钱 / 副业刚需」长青诉求，大促期学习意愿更强'
    ]},
  {role:'机会盘', name:'社科 · 企业管理 + 年末企业复盘', icon:'📈', headClass:'opportunity', cat:'社科',
    sellingPoint:'年末复盘窗口 · 企管方法论刚需',
    subCats:['管理方法论 / 组织与团队','财税规划 / 劳动用工风险','战略复盘 / 年度经营盘点'],
    tips:[
      '<strong>选品思路</strong>：年末是企业复盘、团队盘点、来年规划的集中窗口，企管书有明确的时点刚需；可做企业团购 + 管理者自购双场景，客单偏高',
      '<strong>人群需求</strong>：企业主 / 中高层管理者"年末要复盘、来年要布局"，关注"方法论能落地、有案例"'
    ]},
  {role:'潜力品', name:'社科 · 2027日历送礼 + 规划新年布局', icon:'📅', headClass:'potential', cat:'社科',
    sellingPoint:'日历送礼主场 · 年末盘点→新年布局长线',
    subCats:['日历：故宫 / 诗词 / 插画 / 生肖（2027）','新年计划 / 年度规划 / 时间管理','年度好书盘点 / 人物传记（感恩送礼）'],
    tips:[
      '<strong>选品思路</strong>：11 月中旬（11/16 起）是 2027 日历送礼主场，企业团购 + 个人自购双场景，承接元旦 / 春节送礼长线；下旬叠加"规划新年布局"选题做年末→新年衔接',
      '<strong>人群需求</strong>：送礼人群要"有文化感 + 实用"；职场人年末想"复盘今年、规划明年"'
    ]},
  // ========= 健康 3 卡（11 月 P0 · 立冬进补 / 小雪深冬调理 / 冬补送礼年货 · 不提医疗治病）=========
  {role:'基本盘', name:'健康 · 立冬进补 + 双11冬补囤货', icon:'🍲', headClass:'basic', cat:'健康',
    sellingPoint:'入冬进补刚需 · 双11囤一整季',
    subCats:['冬令食补 / 温补汤谱','膏方养生 / 应季食材','家常温补 / 汤粥换花样'],
    tips:[
      '<strong>选品思路</strong>：立冬（11/7）正式入冬，主打"开始给全家补一补"；双11（11/11）叠加冬补囤货，走日常食补路线，不碰医疗治病话术',
      '<strong>人群需求</strong>：家庭主理人"入冬要进补 + 趁大促囤食材食谱"，关注"温补、上桌简单、全家都能吃"'
    ]},
  {role:'机会盘', name:'健康 · 小雪深冬调理', icon:'❄️', headClass:'opportunity', cat:'健康',
    sellingPoint:'小雪节点 · 深冬调理 + 长辈食养',
    subCats:['冬季养生 / 驱寒暖身食谱','血糖血压日常管理 / 慢病调理','长辈食养 / 温和进补'],
    tips:[
      '<strong>选品思路</strong>：借小雪（11/22）节点做内容钩子，主打"深冬要调理、给长辈补一补"的应季食养；慢病人群与长辈调理需求在深冬集中',
      '<strong>人群需求</strong>：轻养生人群 + 子女"寒气加重想调理 / 给长辈买点温和食补"'
    ]},
  {role:'潜力品', name:'健康 · 冬补送礼 + 年货预热', icon:'🎁', headClass:'potential', cat:'健康',
    sellingPoint:'冬补送礼心智 · 高客单食养礼盒 + 年货承接',
    subCats:['食补礼盒 / 养生礼盒','冬令进补 / 应季好物','长辈心意礼 / 节气养生日历'],
    tips:[
      '<strong>选品思路</strong>：11 月下旬（11/24 起）抓"送健康"心智，礼品装客单高于日常款，主推可独立成礼的食养礼盒，顺势承接双12 / 年货季',
      '<strong>人群需求</strong>：给长辈送礼人群，关注"有心意 + 实用 + 适合老年人"，节气养生日历是食品之外的非食品送礼选择'
    ]}
];
