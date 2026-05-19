// ==================== 4 大品类映射 ====================
const CAT_KEYWORDS = {
  '教辅': ['教辅','考试','小学语文','小学数学','小学英语','小学多科','初中','高中','期末','中考','高考','字帖','教材','学习用品','试卷'],
  '童书': ['童书','儿童','幼儿','立体书','学前','幼小衔接','科普百科','绘本','低幼','启蒙'],
  '健康': ['养生','保健','饮食','减糖','节气','中医','营养','生活','健康','医','祛湿','睡眠','体质'],
  '社科': ['人文','社科','文学','小说','国学','古籍','历史','励志','自我实现','艺术','管理','育儿','家庭教育','沟通','情商','心理','哲学','经济']
};
function mapToTopCat(catStr) {
  if (!catStr) return '其他';
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
function getCurrentWeek(){return WEEKS[currentWeekIdx].data;}
function getRankData(){return getCurrentWeek().lists;}

// ==================== 12 月节奏（数值=各品类消耗占比%，每月合计100%） ====================
const MONTHS_DATA = [
  {m:'1月',  total:55, 教辅:55, 童书:25, 健康:8,  社科:12, season:'寒假', focus:'童书+绘本（春节送礼）+ 寒假预习'},
  {m:'2月',  total:42, 教辅:30, 童书:50, 健康:8,  社科:12, season:'开学季', focus:'春节亲子读物，国学传统文化'},
  {m:'3月',  total:55, 教辅:60, 童书:18, 健康:8,  社科:14, season:'开学季', focus:'教辅春季冲刺，少儿英语'},
  {m:'4月',  total:55, 教辅:48, 童书:22, 健康:8,  社科:22, season:'4·23 读书日', focus:'人文社科爆发期，低客单引流'},
  {m:'5月',  total:60, 教辅:55, 童书:25, 健康:8,  社科:12, season:'母亲节/期中', focus:'教辅期中，亲子家庭教育'},
  {m:'6月',  total:90, 教辅:36, 童书:29, 健康:13, 社科:22, season:'考试季·暑期', focus:'教辅期末+童书六一双引擎', current:true},
  {m:'7月',  total:78, 教辅:25, 童书:50, 健康:12, 社科:13, season:'暑期', focus:'童书暑期亲子阅读高峰'},
  {m:'8月',  total:65, 教辅:42, 童书:35, 健康:10, 社科:13, season:'暑期收尾', focus:'教辅+童书共振'},
  {m:'9月',  total:88, 教辅:60, 童书:18, 健康:8,  社科:14, season:'开学季', focus:'教辅强势开学季'},
  {m:'10月', total:65, 教辅:30, 童书:18, 健康:25, 社科:27, season:'国庆/重阳', focus:'重阳节健康养生爆发，社科长假阅读'},
  {m:'11月', total:62, 教辅:25, 童书:18, 健康:28, 社科:29, season:'双11/立冬', focus:'社科双11爆发，健康冬补黄金期'},
  {m:'12月', total:60, 教辅:28, 童书:18, 健康:30, 社科:24, season:'年末/考试', focus:'健康年终送礼，社科年度盘点'}
];

// ==================== 6 月节点 × 目标人群画像（重点新增）====================
const NODES_PERSONA = [
  {
    date:'6月1日', name:'六一儿童节', icon:'🎈', countdown:'14天', urgent:true,
    cat:'童书',
    primaryPersona:'年轻爸妈（28-38岁，一二线，月入1.5w+）',
    secondaryPersona:'⭐ 爷爷奶奶/姥姥姥爷（55+岁，孙辈情感投射）',
    tertiaryPersona:'25-35岁姑姨/教师朋友（送外甥/学生礼物）',
    insight:'<strong>代际营销机会点：</strong>50-65岁银发用户在618窗口期书籍消费同比+47%（来自蝉妈妈数据），其中87%是为孙辈购买，购书决策被动接受儿女推荐。<strong>建议</strong>：短视频可双版本投放——给爸妈看「育儿专家推荐」、给爷爷奶奶看「孙女最爱、爷爷买的书让全家骄傲」。',
    creative:'童趣礼盒包装 + 亲子共读场景 + 限时送礼优惠',
    representativeBooks:[
      {title:'我们的中国立体书',isbn:'9787521748459'},
      {title:'漫画帝王家书',isbn:'9787515366692'}
    ]
  },
  {
    date:'6月7-9日', name:'高考', icon:'🎓', countdown:'20天', urgent:true,
    cat:'教辅',
    primaryPersona:'高三家长（45-55岁，焦虑型决策者）',
    secondaryPersona:'高三考生（17-19岁，自主搜索）',
    tertiaryPersona:'⭐ 高一/高二家长（提前布局型，受高考热度激发）',
    insight:'<strong>窗口期短但客单极高：</strong>高考前 7 天搜索"高考志愿"日均 380w+，"状元笔记"客单价均值 99-199元，远高于日常 30-60 元水位。<strong>建议</strong>：6/1 起重点投高一/高二家长（蓝海人群），用"提前 2 年规划，避免临阵磨枪"切焦虑点。',
    creative:'状元IP出镜 + 真题命中率背书 + 名校录取案例',
    representativeBooks:[
      {title:'2026新德爷高考预测卷',isbn:'9787570619900'},
      {title:'张雪峰初中提分笔记',isbn:'9787570528127'}
    ]
  },
  {
    date:'6月19日', name:'端午节', icon:'🍡', countdown:'32天',
    cat:'社科',
    primaryPersona:'中产家庭妈妈（30-45岁，注重传统文化教育）',
    secondaryPersona:'国学爱好者（35-55岁，男女均衡）',
    tertiaryPersona:'高知白领（25-35岁，悦己消费 + 文化标签）',
    insight:'<strong>文化属性 + 礼品场景双驱动：</strong>端午前 10 天「国学礼盒」「线装古籍」搜索量同比 +156%。建议高客单精装版（189-299元）锁定礼品场景。',
    creative:'传统文化氛围拍摄 + 名家朗诵 + 烫金精装礼盒',
    representativeBooks:[
      {title:'中国传统文化临摹字帖',isbn:'9787546433219'},
      {title:'罗浮山泰学诵读本',isbn:'9787550031234'}
    ]
  },
  {
    date:'6月20-30日', name:'期末考试', icon:'📝', countdown:'33天', urgent:true,
    cat:'教辅',
    primaryPersona:'小学/初中家长（30-45岁，高频复购）',
    secondaryPersona:'⭐ 学生本人（自购率随年级递增，初中 25%、高中 40%）',
    tertiaryPersona:'托管老师/班主任（推荐力极强）',
    insight:'<strong>全月持续高峰：</strong>6/15 起进入采购集中期，6/22 达全月峰值，单日转化指数较月初提升 2.3 倍。<strong>建议</strong>：6/15 前完成创意备货，6/15-6/30 全力铺量，重点投学生家长 LBS 周边书店、家长群、班级群。',
    creative:'痛点提问（"考前 7 天还来得及吗？"）+ 学霸出镜 + 限时折扣',
    representativeBooks:[
      {title:'一本初中期末逆袭卷',isbn:'9787570617357'},
      {title:'2026新版小学期末冲刺卷',isbn:'9787570623211'}
    ]
  },
  {
    date:'6月25日起', name:'暑期预热', icon:'☀️', countdown:'38天',
    cat:'童书',
    primaryPersona:'有 5-12 岁孩子的妈妈（30-42岁，亲子阅读型）',
    secondaryPersona:'幼小衔接家长（4-7岁孩子，焦虑型）',
    tertiaryPersona:'⭐ 老师群体（暑期书单推荐者，KOC 价值高）',
    insight:'<strong>从 6/25 持续到 8/31：</strong>暑期是童书全年第一高峰，超过双11。"暑假书单""课外阅读"日搜索量持续 2 个月不衰减。<strong>建议</strong>：组品策略——同 IP 系列 2-3 本套装客单提升 60%+。',
    creative:'专家书单 + 同系列组品 + 暑期阅读打卡场景',
    representativeBooks:[
      {title:'幼小衔接看图说话',isbn:'9787570427536'},
      {title:'漫画中华文化1000问',isbn:'9787570610228'}
    ]
  }
];

// ==================== 本周 ADQ Top3 跑量书洞察（基于实际素材）====================
const HOT_BOOK_BREAKDOWN = [
  {
    role:'#1 童书·立体书',
    roleClass:'basic',
    title:'我们的中国立体书 + 环游世界立体书',
    isbn:'9787521748459',
    image:'rank-images/image1.jpg',
    cat:'童书',
    stats:[
      {icon:'💰', label:'客单', val:'¥89-159'},
      {icon:'📊', label:'日销', val:'10-20W'},
      {icon:'📈', label:'指数', val:'9.7', cls:'hot'},
      {icon:'🎯', label:'转化', val:'7.5-8.5%', cls:'hot'}
    ],
    persona:[
      {icon:'👩', label:'核心', val:'3-8岁孩子妈'},
      {icon:'👴', label:'代际', val:'⭐爷奶给孙买'},
      {icon:'🎁', label:'场景', val:'六一送礼'},
      {icon:'💸', label:'敏感度', val:'低'}
    ],
    creativeRefs:[
      {label:'实际素材1', url:'https://adsmind.gdtimg.com/ads_svp_video__0b53wyaicaaazuam7wqezjvbvnqeqg3abaka.f0.mp4?dis_k=cc239dac64b430352f2b74d0720c38d5&dis_t=1778667167&m=685a8de007d3f3ecca0f631c6447acbc&sha256=d0338ba479292b75a631cea7354b3cb395c775f089003ad4f551d16d11ca3aec'},
      {label:'实际素材2', url:'https://adsmind.gdtimg.com/ads_svp_video__0b53hiad4aaaoaago3aejjvbuoqehy5aapsa.f0.mp4?dis_k=980edc9ff39f860248e6d2b66e50feac&dis_t=1778669909&m=b533838c605748fcd18c56492e28232e&sha256=0a0389ffe4c1a2de7b1f439101bc1ee06d5544c73834b807b87ecab5ae970191'}
    ],
    script:[
      {emoji:'🎬', step:'开场3s', content:'立体书"哇塞"瞬间打开，孩子惊呼+大人镜头反应'},
      {emoji:'🎯', step:'痛点', content:'"光绘本看腻了？" / "出去玩贵又累"'},
      {emoji:'💡', step:'方案', content:'国家地理+全景立体，"在家逛遍中国和世界"'},
      {emoji:'❤️', step:'共情', content:'代际钩子："爷爷买的书，孙女抱着不放手"'},
      {emoji:'🛒', step:'促单', content:'六一专属，加赠世界版套装，限量500套'}
    ],
    sellingPoints:[
      {icon:'🎨', label:'视觉冲击', val:'立体翻页"哇塞感"，礼物属性强'},
      {icon:'🌍', label:'内容稀缺', val:'国家地理级 = 启蒙+格局'},
      {icon:'💎', label:'价格定位', val:'¥89-159 送礼不掉价'},
      {icon:'👥', label:'人群双购', val:'妈妈+爷爷奶奶 双重决策'}
    ]
  },
  {
    role:'#2 教辅·暑期英语',
    roleClass:'opportunity',
    title:'66 篇英语故事记 2100 词',
    isbn:'9787521335156',
    image:'rank-images/image3.jpg',
    cat:'教辅',
    stats:[
      {icon:'💰', label:'客单', val:'¥399'},
      {icon:'📊', label:'日销', val:'10-20W'},
      {icon:'📈', label:'指数', val:'9.7', cls:'hot'},
      {icon:'🎯', label:'转化', val:'1.9-2.9%'}
    ],
    persona:[
      {icon:'👩', label:'核心', val:'10-15岁孩子妈'},
      {icon:'😟', label:'类型', val:'焦虑型'},
      {icon:'☀️', label:'场景', val:'暑期英语补'},
      {icon:'💸', label:'敏感度', val:'中高'}
    ],
    creativeRefs:[
      {label:'实际素材', url:'https://adsmind.gdtimg.com/ads_svp_video__0bc3j4adqaaakyabz5yejzvbutyehbhqaoca.f0.mp4?dis_k=797b35abc568aeafc82f04e0294a5368&dis_t=1778656293&m=0cecd21e0cac54b9a65a0bcb45125724&sha256=e7cfd352962029389fbda7811555bf86ca2fb4354d5005190d8bfde1c36e62e3'}
    ],
    script:[
      {emoji:'🎬', step:'开场3s', content:'孩子背单词痛苦表情 vs 读故事专注眼神 强对比'},
      {emoji:'🎯', step:'痛点', content:'"孩子背了忘、忘了背，1万遍都没用"'},
      {emoji:'💡', step:'方案', content:'66个有趣故事 = 2100词初中考纲，寓教于乐'},
      {emoji:'📚', step:'演示', content:'翻书展示故事插图+词汇标注，"每天1篇"'},
      {emoji:'💰', step:'锚定', content:'"线下英语班1期¥3999，这本¥399顶1学期"'}
    ],
    sellingPoints:[
      {icon:'📖', label:'形式创新', val:'故事代替死记硬背'},
      {icon:'🎯', label:'考纲对标', val:'2100词=初中3年核心'},
      {icon:'☀️', label:'季节锚定', val:'暑期60天通关'},
      {icon:'💎', label:'价格锚定', val:'对比线下班10倍性价比'}
    ]
  },
  {
    role:'#3 童书·历史人文',
    roleClass:'opportunity',
    title:'漫画帝王家书',
    isbn:'9787515366692',
    image:'rank-images/image5.jpg',
    cat:'童书',
    stats:[
      {icon:'💰', label:'客单', val:'¥39.9'},
      {icon:'📊', label:'日销', val:'10-20W'},
      {icon:'📈', label:'指数', val:'9.7', cls:'hot'},
      {icon:'🎯', label:'转化', val:'10.6-11.6%', cls:'hot'}
    ],
    persona:[
      {icon:'👦', label:'核心', val:'8-14岁男孩妈'},
      {icon:'📊', label:'占比', val:'73%'},
      {icon:'😟', label:'痛点', val:'孩子不爱读书'},
      {icon:'💸', label:'敏感度', val:'低'}
    ],
    creativeRefs:[
      {label:'实际素材', url:'https://adsmind.gdtimg.com/ads_svp_video__0bc3eyaaaaaanaainbpmyvurujqeaataaaca.f0.mp4?dis_k=3cf359d6117e60011415e9f8494ffdf3&dis_t=1777259196&m=d52d4f1a400925a15037fdfd93d1cc38&sha256=b1f47534eb8ffaa2077bf495ad1166c7e1dbabd5a13403daf46f450353c43657'}
    ],
    script:[
      {emoji:'🎬', step:'开场3s', content:'"别人家孩子在读这本提认知，你家娃还在刷短视频？"'},
      {emoji:'🎯', step:'痛点', content:'"孩子格局有限"+"信息差落后"双重焦虑'},
      {emoji:'💡', step:'方案', content:'帝王家书=现成成长教科书，男孩天然爱看'},
      {emoji:'👨‍👦', step:'共情', content:'"自己说他不听，但帝王说他听"父子代沟梗'},
      {emoji:'🛒', step:'促单', content:'"39.9元=1顿快餐，换孩子一辈子格局"'}
    ],
    sellingPoints:[
      {icon:'📜', label:'题材稀缺', val:'帝王+漫画+家书 三合一'},
      {icon:'👦', label:'男孩定向', val:'避开红海女童市场'},
      {icon:'💸', label:'低客单', val:'¥39.9 决策门槛低'},
      {icon:'❤️', label:'情感角度', val:'家书=父母情感教育'}
    ]
  }
];

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

// ==================== 重点品类深度分析（教辅前置 · 6月暑期视角）====================
const DEEP_CATS = [
  // ========= 教辅 3 卡（暑期主战场，前置）=========
  {role:'基本盘', name:'教辅 · 重难点专项提升', icon:'🎯', headClass:'basic', cat:'教辅',
    stats:'30w/d · cvr 11.2%',
    sellingPoint:'解暑期补差 + 拔高焦虑',
    subCats:['初中数学压轴题','高中函数/导数专题','英语完形+阅读','物理力学/电学'],
    tips:[
      '⭐ <strong>专项 = 暑期最大刚需</strong>，每个家庭都怕"差科目越拖越差"',
      '组品策略：单科 ¥69-99，3科套装 ¥199-299',
      '直播话术："开学差 1 科 = 中高考少 30 分"',
      '6/20 暑假启动 → 7月专项突击 → 8月模考收割三段节奏'
    ]},
  {role:'机会盘', name:'教辅 · 衔接预备预习', icon:'🔗', headClass:'opportunity', cat:'教辅',
    stats:'25w/d · cvr 9.5%',
    sellingPoint:'幼小/小升初/初升高 三大焦虑窗口',
    subCats:['幼小衔接看图说话','新初一预习教材','新高一数理化预备','开学前30天计划'],
    tips:[
      '<strong>抓"过渡期"焦虑</strong>：父母最怕孩子掉队',
      '组品逻辑：新年级语数英三本套（¥99-159 高复购）',
      '加赠"开学复习计划表 + 教师答疑群"提升 ROI',
      '6月起冲幼小/初升高，7月起冲小升初，8月延续'
    ]},
  {role:'潜力品', name:'教辅 · 工具书（字帖/单词/速记）', icon:'📔', headClass:'potential', cat:'教辅',
    stats:'15w/d · cvr 13.8%',
    sellingPoint:'⭐ 高转化低客单 · 直播链路核心组品',
    subCats:['硬笔字帖（暑假练字）','英语单词速记口诀','古诗词100首速记','公式定理大全'],
    tips:[
      '⭐ <strong>转化率 13.8% 全教辅最高</strong>，¥9.9-29.9 决策几乎无门槛',
      '直播间"加赠"标配：买专项书加赠工具书',
      '抓"假期不能荒废"心态："暑假30天 = 一手好字/2100词通关"',
      '组品 + 套装 = 客单价拉升关键（单本¥19 → 套装¥99）'
    ]},
  // ========= 童书 3 卡 =========
  {role:'基本盘', name:'童书 · 成长教育', icon:'🌱', headClass:'basic', cat:'童书',
    stats:'20w/d · cvr 10.4%',
    sellingPoint:'解情绪 + 成长焦虑',
    subCats:['心理素养','励志成长'],
    tips:['漫画形态+口诀化卖点','概念化标题（如《梅拉宾法则》）']},
  {role:'机会盘', name:'童书 · 功能童书', icon:'📖', headClass:'opportunity', cat:'童书',
    stats:'10w/d · cvr 6.7%',
    sellingPoint:'解学业 / 衔接焦虑',
    subCats:['科普百科','国学经典','文化常识'],
    tips:['同系列组品 2-3 本','语文/英语素养重点']},
  {role:'潜力品', name:'童书 · 趣味阅读启蒙', icon:'🎨', headClass:'potential', cat:'童书',
    stats:'5w/d · cvr 10.4%',
    sellingPoint:'解陪伴 / 动手趣味',
    subCats:['立体书','点读发声','绘本','益智游戏'],
    tips:['品质精装高客单','官媒/IP背书']}
];
