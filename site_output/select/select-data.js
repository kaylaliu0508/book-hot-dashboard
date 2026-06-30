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
  {m:'6月',  total:90, 教辅:50, 童书:30, 健康:10, 社科:10, season:'考试季·暑期', focus:'教辅暑期衔接+期末冲刺主线'},
  {m:'7月',  total:85, 教辅:60, 童书:16, 健康:10, 社科:14, season:'暑期', focus:'暑期教辅主导：衔接升学+专项提升+多学段细分，童书承接亲子阅读', current:true},
  {m:'8月',  total:65, 教辅:42, 童书:35, 健康:10, 社科:13, season:'暑期收尾', focus:'教辅+童书共振'},
  {m:'9月',  total:80, 教辅:60, 童书:18, 健康:8,  社科:14, season:'开学季', focus:'教辅强势开学季'},
  {m:'10月', total:65, 教辅:20, 童书:18, 健康:30, 社科:32, season:'国庆/重阳', focus:'重阳节健康养生爆发，社科长假阅读'},
  {m:'11月', total:62, 教辅:15, 童书:18, 健康:33, 社科:34, season:'双11/立冬', focus:'社科双11爆发，健康冬补黄金期'},
  {m:'12月', total:60, 教辅:18, 童书:18, 健康:35, 社科:29, season:'年末/考试', focus:'健康年终送礼，社科年度盘点'}
];

// ==================== 6 月节点 × 目标人群画像（重点新增）====================
const NODES_PERSONA = [
  {
    date:'6月1日', name:'六一儿童节', icon:'🎈', countdown:'14天', urgent:true,
    cat:'童书',
    targetAudience:'3-12 岁孩子的家长（28-45 岁，一二线为主）+ 55+ 岁长辈（孙辈情感投射型送礼人群）',
    selectionStrategy:'<strong>核心选品：</strong>立体书 / 科普百科 / 漫画国学三件套，¥99-159 价位带覆盖六一礼品消费的主流区间。<br/><strong>组品逻辑：</strong>主推「妈妈日常买」+「长辈送礼买」双场景适配的产品——画面有质感、礼盒包装、单品 SKU 可独立成礼，礼品装客单较日常款高约 30%。',
    creativeIdea:'<strong>主图方向：</strong>用「三代同读」画面替代单一亲子镜头，礼盒 + 家庭情感张力作为视觉主体。<br/><strong>钩子结构：</strong>节日限时立减 + 礼盒开箱画面，弱化课程感强化送礼感。',
    representativeBooks:[
      {title:'我们的中国立体书',isbn:'9787521748459'},
      {title:'漫画帝王家书',isbn:'9787515366692'}
    ]
  },
  {
    date:'6月7-9日', name:'高考', icon:'🎓', countdown:'20天', urgent:true,
    cat:'教辅',
    targetAudience:'高三家长（45-55 岁，焦虑型决策者）+ 高一/高二家长（提前布局型，受高考热度激发）',
    selectionStrategy:'<strong>核心选品：</strong>状元笔记 / 真题预测 / 志愿填报三大子赛道，客单价 99-199 元，高于日常 30-60 元水位。<br/><strong>组品逻辑：</strong>高三家长承接短窗口高客单 SKU（志愿填报指南、状元笔记套装），高一/高二家长承接长周期布局 SKU（学科衔接、提前预习），两类家长分别对应不同组合。',
    creativeIdea:'<strong>主图方向：</strong>状元 IP 出镜 + 真题命中率背书 + 名校录取案例。<br/><strong>钩子结构：</strong>「提前 2 年规划」角度切入家长长期教育规划话题，搜索高峰期（高考前 7 天「高考志愿」日均 380w+）配合精准词承接。',
    representativeBooks:[
      {title:'2026新德爷高考预测卷',isbn:'9787570619900'},
      {title:'张雪峰初中提分笔记',isbn:'9787570528127'}
    ]
  },
  {
    date:'6月19日', name:'端午节', icon:'🍡', countdown:'32天',
    cat:'社科',
    targetAudience:'30-45 岁中产家庭妈妈（注重传统文化教育）+ 25-35 岁高知白领（悦己消费 + 文化标签）',
    selectionStrategy:'<strong>核心选品：</strong>国学礼盒 / 线装古籍 / 烫金精装是端午溢价主力，端午前 10 天搜索同比 +156%，189-299 元礼品版相对更适配该窗口。<br/><strong>组品逻辑：</strong>家庭妈妈承接亲子共读型国学读本，高知白领承接收藏级精装版（自购悦己 + 送礼一书两用），同一类目下用不同 SKU 覆盖两个细分需求。',
    creativeIdea:'<strong>主图方向：</strong>名家朗诵 + 传统纹样视觉，把「礼物」与「文化身份」双重叠加，强化收藏属性。<br/><strong>钩子结构：</strong>烫金精装开箱镜头 + 节令氛围（粽香、艾草），适合短视频节奏铺陈。',
    representativeBooks:[
      {title:'中国传统文化临摹字帖',isbn:'9787546433219'},
      {title:'罗浮山泰学诵读本',isbn:'9787550031234'}
    ]
  },
  {
    date:'6月20-30日', name:'期末考试', icon:'📝', countdown:'33天', urgent:true,
    cat:'教辅',
    targetAudience:'30-45 岁小学/初中生家长（高频复购型，关注阶段性提分需求）',
    selectionStrategy:'<strong>核心选品：</strong>逆袭卷 / 真题模考 / 错题本三类，客单 39-69 元，cvr 高于品类均值约 2 倍，6/15 起进入集中采购，6/22 接近月内峰值。<br/><strong>组品逻辑：</strong>按学段精细化推荐——小学家长侧重「期末冲刺套卷 + 答题模板」，初中家长侧重「分章节专项训练 + 错题归纳本」，组品价位 ¥39-99 适配高频复购节奏。',
    creativeIdea:'<strong>主图方向：</strong>痛点提问（「考前 7 天还来得及吗？」）+ 学霸出镜 + 限时折扣。<br/><strong>钩子结构：</strong>三秒钩子结构（提问 → 解决方案 → 限时优惠），适配高频信息流投放。',
    representativeBooks:[
      {title:'一本初中期末逆袭卷',isbn:'9787570617357'},
      {title:'2026新版小学期末冲刺卷',isbn:'9787570623211'}
    ]
  },
  {
    date:'6月25日起', name:'暑期预热', icon:'☀️', countdown:'38天',
    cat:'童书',
    targetAudience:'30-42 岁有 5-12 岁孩子的妈妈（亲子阅读型）+ 4-7 岁幼小衔接孩子的妈妈（学段过渡型）',
    selectionStrategy:'<strong>核心选品：</strong>同 IP 系列 2-3 本套装，客单较单本提升 60% 以上；「暑假书单」「课外阅读」搜索连续 2 个月不衰减。<br/><strong>组品逻辑：</strong>亲子阅读型妈妈承接「同 IP 系列组品」（提升整体阅读完成度），幼小衔接妈妈承接「拼音 + 数学 + 看图说话三件套」（学段过渡刚需），两个细分人群对应不同组品逻辑。',
    creativeIdea:'<strong>主图方向：</strong>暑期阅读打卡场景 + 同系列组品视觉，强调「一暑假读完一系列」的成就感。<br/><strong>钩子结构：</strong>套装价对比单本提升的视觉化表达 + 限时立减，适配长周期承接。',
    representativeBooks:[
      {title:'幼小衔接看图说话',isbn:'9787570427536'},
      {title:'漫画中华文化1000问',isbn:'9787570610228'}
    ]
  }
];

// ==================== 选品 by 周节奏图（按月切换 · W1-W4 × 品类优先级）====================
// 设计原则：
//   1. 节点≠开跑日，前置投放（lead）提示该单元格"几号开始铺品"
//   2. 痛点（pain）= 目标人群的钩子，直接作为创意/标题灵感
//   3. 部分单元格跨多周（span 字段），表示该方向贯穿整月
//   4. 2026-06-30 起新增 7 月节奏：教辅主线=衔接升学+专项提升+多学段细分；童书=暑期亲子阅读高峰
//
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

// ===== 当月切换：6/30 起切到 7 月初版（用户需求"马上7月，基于6月逻辑给7月初版"）=====
// 切换规则：月份 >= 7 或 (6 月且 >= 30 号) 显示 7 月节奏；否则显示 6 月
(function () {
  try {
    var now = new Date();
    var m = now.getMonth() + 1; // 1-12
    var d = now.getDate();
    if (m >= 7 || (m === 6 && d >= 30)) {
      window.WEEK_RHYTHM = WEEK_RHYTHM_JULY;
    } else {
      window.WEEK_RHYTHM = WEEK_RHYTHM_JUNE;
    }
  } catch (e) {
    window.WEEK_RHYTHM = WEEK_RHYTHM_JUNE;
  }
})();
// 同时暴露全局变量名（兼容 var 引用方式）
var WEEK_RHYTHM = window.WEEK_RHYTHM;

// ==================== ADQ Top3 跑量书洞察（按周次组织 · 仅最新两期展示）====================
// 渲染顺序：封面 → 数据条 → 目标人群 → 创意核心（合规警示语紧随其后）
// key = ISO 日期；前端按 currentWeekIndex 取 WEEK_RANK_LIST[idx].iso 自动匹配
const HOT_BOOK_BREAKDOWN_BY_WEEK = {
  // ===== 6/29 周（最新）=====
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
      creativeCore:'采访学霸创新形式 — 让初中/中考学霸现场出镜接受抽问（聚焦中考考点原题语文常识），学霸们对答如流，反向戳中家长「我家孩子答不上来」的焦虑',
      creativeWarning:'⚠️ 不可拍摄孩子答错时的难堪表情，避免负面对比'
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
      creativeCore:'打认知信息差 — 「这些常识孩子答不上，但同龄人都会」。3000 问体系化补足语文素养盲区，戳中家长「怕娃见识比同龄人窄」的焦虑',
      creativeWarning:'⚠️ 不可拍摄孩子答错时的难堪表情，避免负面对比'
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
      creativeCore:'打认知信息差 — 「这些常识孩子答不上，但同龄人都会」。3000 问体系化补足语文素养盲区，戳中家长「怕娃见识比同龄人窄」的焦虑',
      creativeWarning:'⚠️ 不可拍摄孩子答错时的难堪表情，避免负面对比'
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
      creativeCore:'锁定家中「喂饭主理人」 — 给一份按年龄分段照着做的长高食谱：婴幼儿、学龄、青春期每天吃什么直接抄作业',
      creativeWarning:'⚠️ 不得承诺具体长高厘米数，避免量化承诺'
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
      creativeCore:'打认知信息差 — 「这些常识孩子答不上，但同龄人都会」。3000 问体系化补足语文素养盲区，戳中家长「怕娃见识比同龄人窄」的焦虑',
      creativeWarning:'⚠️ 不可拍摄孩子答错时的难堪表情，避免负面对比'
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
      creativeCore:'锁定 25-45 岁体重管理 / 抗糖人群 — 给一份可立刻照做的减糖行动方案：早中晚怎么吃、外卖怎么挑、嘴馋怎么替换',
      creativeWarning:'⚠️ 不得宣称治疗糖尿病等病理效果'
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
      creativeCore:'锁定家中「喂饭主理人」 — 给一份按年龄分段照着做的长高食谱：婴幼儿、学龄、青春期每天吃什么直接抄作业',
      creativeWarning:'⚠️ 不得承诺具体长高厘米数，避免量化承诺'
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
      creativeCore:'抓住孩子成长黄金期 — 适配 0-18 岁全年龄段长高食谱（婴幼儿辅食 → 学龄营养餐 → 青春期补钙增高方案）；「你懒孩子就矮」直击家长行动力痛点，¥50 低门槛即下单',
      creativeWarning:'⚠️ 不得承诺具体长高厘米数，避免"X 个月长高 X cm"等量化承诺'
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
      creativeCore:'列举老板/职场办公室的布置摆放建议：工位朝向、办公桌物品摆放、绿植/装饰位等实用技巧 → 翻页讲解 + 中式家居美学',
      creativeWarning:'⚠️ 不可涉及封建迷信'
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
const HOT_BOOK_BREAKDOWN = HOT_BOOK_BREAKDOWN_BY_WEEK['2026-06-29'];

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

// ==================== 重点品类深度选品思路（7月暑期视角 · 教辅前置 · 每品类 3 张同构）====================
const DEEP_CATS = [
  // ========= 教辅 3 卡（暑期主战场，前置）=========
  {role:'基本盘', name:'教辅 · 衔接升学（多学段细分）', icon:'🎓', headClass:'basic', cat:'教辅',
    sellingPoint:'幼升小 / 小升初 / 初升高 三档暑期升学过渡',
    subCats:['幼升小：拼音 / 看图说话 / 20 以内加减','小升初：分班题 / 初一预备 / 衔接教材','初升高：高一一轮预习 / 英语词汇 / 数学衔接'],
    tips:[
      '<strong>选品思路</strong>：围绕"准小一/准初一/准高一"三档独立刚需，按学段精细化推荐而非通配',
      '<strong>人群需求</strong>：家长怕"暑期不衔接、秋季掉队"，对"成体系的学段过渡方案"有强心智'
    ]},
  {role:'机会盘', name:'教辅 · 专项突破（学科专题）', icon:'📝', headClass:'opportunity', cat:'教辅',
    sellingPoint:'暑期 60 天补弱科 · 高频复购品类',
    subCats:['小学：计算 / 阅读理解 / 看图写话专项','初中：数理化专题 / 古诗文言文 / 英语阅读','高中：数学专项 / 英语长难句 / 物化一轮'],
    tips:[
      '<strong>选品思路</strong>：按学科切分专项书，弱科补习与强科拔高同时承接',
      '<strong>人群需求</strong>：家长把暑假视为"补弱科最后窗口"，单科决策路径短、复购周期短'
    ]},
  {role:'潜力品', name:'教辅 · 高中扩量 + 非K12 试探', icon:'🔥', headClass:'potential', cat:'教辅',
    sellingPoint:'高客单 + 强决策人群 · 效率梯队加码',
    subCats:['高中：一轮复习启动品 / 高考真题 / 状元笔记','非K12：四六级 / 考研 / 考公 / 执业药师','成人自学场景下的工具书'],
    tips:[
      '<strong>选品思路</strong>：高中段离升学最近、付费力强；非K12 借暑假成年人自学窗口铺品',
      '<strong>人群需求</strong>：高中家长重"权威背书 + 真题命中率"；非K12 学员重"过关率 + 答疑服务"'
    ]},
  // ========= 童书 3 卡（成长教育+思维启蒙 / 低龄启蒙衔接 / 同 IP 套装）=========
  {role:'基本盘', name:'童书 · 成长教育 + 思维启蒙', icon:'🌱', headClass:'basic', cat:'童书',
    sellingPoint:'家长情商焦虑刚需 · 童书最稳的基本盘',
    subCats:['思维启蒙：破局思维 / 顶尖思维 / 财商启蒙','为人处世：人情世故 / 礼仪教养 / 内驱力','情商成长：表达绘本 / 心理 / 情绪管理'],
    tips:[
      '<strong>选品思路</strong>：抓"娃情商低 / 没主见 / 不会说话"的家长焦虑，成长教育是 7 月童书最确定的需求池',
      '<strong>人群需求</strong>：30-45 岁妈妈不只买"会写作业的娃"，更想买"会做人会说话的娃"'
    ]},
  {role:'机会盘', name:'童书 · 低龄启蒙衔接（暑期 9 月入学倒计时）', icon:'👶', headClass:'opportunity', cat:'童书',
    sellingPoint:'准小一刚需 + 低龄启蒙黄金窗口',
    subCats:['幼小衔接：拼音 / 识字 / 看图说话 / 20 以内加减','低龄思维启蒙：数学思维 / 逻辑游戏 / 早教绘本','生活科学：生活中的物理 等启蒙科普'],
    tips:[
      '<strong>选品思路</strong>：准小一"9 月入学倒计时" + 低龄"启蒙黄金窗口"两个人群同时启动',
      '<strong>人群需求</strong>：低龄家长决策频次高，关注"娃能不能跟上 / 是否赢在起跑线"'
    ]},
  {role:'潜力品', name:'童书 · 同 IP 系列套装（亲子阅读）', icon:'📚', headClass:'potential', cat:'童书',
    sellingPoint:'套装承接亲子阅读高峰 · 7 月童书稳态形态',
    subCats:['经典儿童文学套装（安徒生 / 格林童话 / 稻草人）','红色经典少儿版（小鲤鱼跳龙门 等）','科普百科 / 自然历史套装','成长教育系列绘本'],
    tips:[
      '<strong>选品思路</strong>：同 IP 套装比单本更打动家长，是 7 月童书的稳态承接形态',
      '<strong>人群需求</strong>：妈妈想要"一暑假读完一系列"的完成感与体系感'
    ]},
  // ========= 社科 3 卡（赚钱创富 / 国学古为今用 / 职场人际）=========
  {role:'基本盘', name:'社科 · 赚钱创富选题（整月主线）', icon:'💰', headClass:'basic', cat:'社科',
    sellingPoint:'⭐ 大盘已验证优势选题 · 长青高景气',
    subCats:['副业实操 / 个人 IP 打造','投资理财入门','负债翻盘 / 年入百万 / 潮汕思维','开口即成交 / 渔樵问对'],
    tips:[
      '<strong>选品思路</strong>：近一年大盘多次跑出爆款，7 月整月铺底；强调"可落地的实操"而非空泛理论',
      '<strong>人群需求</strong>：25-40 岁打工人「年中 KPI 焦虑」+「搞钱副业」长青诉求'
    ]},
  {role:'机会盘', name:'社科 · 国学经典（古为今用的实操智慧）', icon:'🏛', headClass:'opportunity', cat:'社科',
    sellingPoint:'前半月承接 · 社科长青基本盘',
    subCats:['为人处世智慧（鬼谷子 / 曾国藩 / 围炉夜话）','帝王家训 / 家书家训（写给孩子和打工人）','古典哲学落地（道德经 / 论语 实用版）'],
    tips:[
      '<strong>选品思路</strong>：把国学从"经典朗读"切到"古为今用的实操智慧"，对接现代焦虑',
      '<strong>人群需求</strong>：家长想"给娃做文化启蒙"；打工人想"用古人智慧解现代焦虑"'
    ]},
  {role:'潜力品', name:'社科 · 职场人际交往能力', icon:'💼', headClass:'potential', cat:'社科',
    sellingPoint:'后半月承接 · 非应试类社科稳态需求',
    subCats:['沟通表达 / 高情商对话 / 接话回话','向上管理 / 跨部门协作','说话之道 / 提问的力量'],
    tips:[
      '<strong>选品思路</strong>：聚焦"职场新人 + 中层人际困境"的高频痛点，避免理论化沟通学',
      '<strong>人群需求</strong>：25-35 岁职场新人「人际困境」高频，决策快、情绪共鸣强'
    ]},
  // ========= 健康 3 卡（家常菜 / 果蔬营养 / 节气+居家）=========
  {role:'基本盘', name:'健康 · 家常菜（家庭主理人主线）', icon:'🍲', headClass:'basic', cat:'健康',
    sellingPoint:'家庭餐桌日常刚需 · 健康品类最稳的基本盘',
    subCats:['夏季家常菜 / 最爱吃的家常菜','四季蒸菜 / 精选家常菜','美食文化（舌尖上的中国 等）'],
    tips:[
      '<strong>选品思路</strong>：主打"换花样、上桌简单、家人爱吃"，回避治病养生话术',
      '<strong>人群需求</strong>：家庭主理人"夏天没胃口想换花样"，关注"省时 + 全家都爱吃"'
    ]},
  {role:'机会盘', name:'健康 · 果蔬汁 + 营养代餐（体态管理）', icon:'🥤', headClass:'opportunity', cat:'健康',
    sellingPoint:'夏季轻食心智 · 体态 + 营养双承接',
    subCats:['果蔬汁 / 能量果蔬汁','豆浆 / 米糊 / 营养代餐','轻食 / 减脂家常'],
    tips:[
      '<strong>选品思路</strong>：抓"夏季想清爽 / 想轻一点"的心智，强调原料家庭可获得、做法简单',
      '<strong>人群需求</strong>：25-45 岁女性体态管理 + 家庭主理人"想给家人营养换花样"'
    ]},
  {role:'潜力品', name:'健康 · 24 节气吃法 + 居家生活', icon:'🌿', headClass:'potential', cat:'健康',
    sellingPoint:'节气心智双峰 7/7 小暑 + 7/23 大暑 · 居家慢生活承接',
    subCats:['24 节气吃法 / 节气养生药茶','节气美食专题（夏季版 等）','阳台种菜 / 种花 / 香草'],
    tips:[
      '<strong>选品思路</strong>：借节气节点做内容钩子；居家种植承接"治愈系慢生活"心智',
      '<strong>人群需求</strong>：30-50 岁家庭主妇关注节气应季吃法；都市白领追"阳台治愈感"'
    ]}
];
