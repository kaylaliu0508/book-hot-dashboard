// 周榜数据（从 /Users/wangziyue/Desktop/图书榜单.xlsx 提取）
const WEEK_RANK_DATA = {
  "cat_share": [
    {
      "cat": "健康",
      "share": 13.0
    },
    {
      "cat": "童书",
      "share": 29.0
    },
    {
      "cat": "社科",
      "share": 22.0
    },
    {
      "cat": "教辅",
      "share": 36.0
    }
  ],
  "lists": {
    "adq_hot": {
      "name": "ADQ热投优品榜",
      "subtitle": "近一周ADQ热投优品 🔥🔥🔥",
      "items": [
        {
          "rank": 1,
          "title": "我们的中国立体书+环游世界立体书",
          "cat": "童书-幼儿认知书/立体书",
          "price": "89-159",
          "image": "rank-images/image1.jpg",
          "sales_range": "10-20W",
          "sales_idx": "9.6999999999999993",
          "conv": "7.5-8.5%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 2,
          "title": "66篇英语故事记2100词",
          "cat": "教辅/考试-初中教辅-初中英语教辅",
          "price": "399",
          "image": "rank-images/image3.jpg",
          "sales_range": "10-20W",
          "sales_idx": "9.6999999999999993",
          "conv": "1.9-2.9%",
          "channel_or_roi": "小程序"
        },
        {
          "rank": 3,
          "title": "漫画帝王家书",
          "cat": "童书-儿童成长/教育书",
          "price": "39.9",
          "image": "rank-images/image5.jpg",
          "sales_range": "10-20W",
          "sales_idx": "9.6999999999999993",
          "conv": "10.6-11.6%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 4,
          "title": "中国传统文化临摹字帖",
          "cat": "人文社科-艺术-书法篆刻",
          "price": "27.9",
          "image": "rank-images/image7.jpg",
          "sales_range": "10-20W",
          "sales_idx": "9.8000000000000007",
          "conv": "9.7-10.7%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 5,
          "title": "孩子反霸凌话术500句+戒掉弱者感+踢猫效应",
          "cat": "育儿-家庭教育",
          "price": "99",
          "image": "rank-images/image9.jpg",
          "sales_range": "10-20W",
          "sales_idx": "9.6999999999999993",
          "conv": "7.8-8.8%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 6,
          "title": "中国孩子必知的文化常识3000问",
          "cat": "人文社科-文学/小说/文化传播-中国文化/民俗",
          "price": "79",
          "image": "rank-images/image11.jpg",
          "sales_range": "5-10W",
          "sales_idx": "9.6999999999999993",
          "conv": "5.8-6.8%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 7,
          "title": "漫画初中物理早知道",
          "cat": "教辅/考试-初中教辅-初中多科教辅",
          "price": "75.8-199.8",
          "image": "rank-images/image13.jpg",
          "sales_range": "5-10W",
          "sales_idx": "9.6",
          "conv": "5.6-6.9%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 8,
          "title": "【国学精粹】国学经典十册",
          "cat": "人文社科-文学/小说/文化传播-外国文学/小说",
          "price": "99",
          "image": "rank-images/image15.jpg",
          "sales_range": "5-10W",
          "sales_idx": "9.6",
          "conv": "3.8-4.8%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 9,
          "title": "减糖饮食",
          "cat": "生活-养生保健-饮食健康",
          "price": "39.799999999999997",
          "image": "rank-images/image17.jpg",
          "sales_range": "5-10W",
          "sales_idx": "9.6",
          "conv": "9.8-10.9%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 10,
          "title": "二十四节气健康吃法",
          "cat": "生活-养生保健-中医养生",
          "price": "39.9",
          "image": "rank-images/image19.jpg",
          "sales_range": "5-10W",
          "sales_idx": "9.6",
          "conv": "4.8-5.8%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 11,
          "title": "一碗好汤养全家",
          "cat": "生活-养生保健-饮食健康",
          "price": "29.9",
          "image": "rank-images/image21.jpg",
          "sales_range": "5-10W",
          "sales_idx": "9.5",
          "conv": "9.6-12.3%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 12,
          "title": "托举而非掌控",
          "cat": "育儿-家庭教育",
          "price": "39.799999999999997",
          "image": "rank-images/image23.jpg",
          "sales_range": "5-10W",
          "sales_idx": "9.5",
          "conv": "12.4-14.4%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 13,
          "title": "儿童趣味百科",
          "cat": "童书-科普百科",
          "price": "59.9",
          "image": "rank-images/image25.jpg",
          "sales_range": "1-5W",
          "sales_idx": "9.5",
          "conv": "5.1-6.5%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 14,
          "title": "漫画讲透易经养生+反骨养生+中国民间草药方",
          "cat": "生活-养生保健-中医养生",
          "price": "99",
          "image": "rank-images/image27.jpg",
          "sales_range": "1-5W",
          "sales_idx": "9.5",
          "conv": "11.2-13.6%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 15,
          "title": "二十四节气养生食补+念念不忘一碗汤",
          "cat": "生活-养生保健-中医养生",
          "price": "99",
          "image": "rank-images/image29.jpg",
          "sales_range": "1-5W",
          "sales_idx": "9.5",
          "conv": "6.1-7.1%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 16,
          "title": "你有多自律就有多自由+你的坚持终将美好",
          "cat": "人文社科-自我实现/励志",
          "price": "35.8-55.8",
          "image": "rank-images/image31.jpg",
          "sales_range": "1-5W",
          "sales_idx": "9.5",
          "conv": "7.7-8.7%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 17,
          "title": "小学数学速算巧算技巧口诀",
          "cat": "教辅/考试-小学教辅-小学数学教辅",
          "price": "29.9",
          "image": "rank-images/image32.jpg",
          "sales_range": "1-5W",
          "sales_idx": "9.5",
          "conv": "10.5-12.3%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 18,
          "title": "一图秒懂小学英语语法",
          "cat": "教辅/考试-小学教辅-小学英语教辅",
          "price": "22",
          "image": "rank-images/image33.jpg",
          "sales_range": "1-5W",
          "sales_idx": "9.5",
          "conv": "6.6-8.8%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 19,
          "title": "万唯答题模版速记活用",
          "cat": "教辅/考试-初中教辅-初中多科教辅",
          "price": "38.8-71.8",
          "image": "rank-images/image34.jpg",
          "sales_range": "1-5W",
          "sales_idx": "9.5",
          "conv": "7.2-8.2%",
          "channel_or_roi": "微信小店"
        },
        {
          "rank": 20,
          "title": "人民日报里的中考作文热点素材",
          "cat": "教辅/考试-初中教辅-初中语文教辅",
          "price": "39.8-59.8",
          "image": "rank-images/image35.jpg",
          "sales_range": "1-5W",
          "sales_idx": "9.5",
          "conv": "8.3-9.3%",
          "channel_or_roi": "微信小店"
        }
      ]
    },
    "forecast": {
      "name": "预测爆品榜单",
      "subtitle": "去年下一周期，ADQ x 各媒体平台热投优品",
      "items": [
        {
          "rank": 1,
          "title": "【专属】中国人应知道的国学知识：于古典中觅今意，于国学内寻人生",
          "image": "rank-images/image2.jpg"
        },
        {
          "rank": 2,
          "title": "孩子，你要懂点儿人情世故:培养社交情商 提升成长软实力",
          "image": "rank-images/image4.jpg"
        },
        {
          "rank": 3,
          "title": "换个方式说 破解沟通难题 简单易学那里就用的高情商沟通模版",
          "image": "rank-images/image6.jpg"
        },
        {
          "rank": 4,
          "title": "正版 高手接话  全是一问一答场景话术  情商口才社交宝典",
          "image": "rank-images/image8.jpg"
        },
        {
          "rank": 5,
          "title": "辽宁省中考冲刺模拟试卷9科*8-10套卷小四门考前提分复习点石成金",
          "image": "rank-images/image10.jpg"
        },
        {
          "rank": 6,
          "title": "拒绝霸凌+学会自救（两本装）增强儿童自我保护反霸凌意识童书绘本",
          "image": "rank-images/image12.jpg"
        },
        {
          "rank": 7,
          "title": "2026新版课堂笔记一二三四五六下册语文部编版数学英语通用版",
          "image": "rank-images/image14.jpg"
        },
        {
          "rank": 8,
          "title": "预备一年级入学准备幼升小同步专项训练语文数学幼小衔接每日一练",
          "image": "rank-images/image16.jpg"
        },
        {
          "rank": 9,
          "title": "【漫画中华文化1000问】知识百科文学国学常识青少年课外读物",
          "image": "rank-images/image18.jpg"
        },
        {
          "rank": 10,
          "title": "【高手接话】一问一答多场景巧妙应对话术 情商口才社交宝典",
          "image": "rank-images/image20.jpg"
        },
        {
          "rank": 11,
          "title": "DK时间线上的全球史",
          "image": "rank-images/image22.jpg"
        },
        {
          "rank": 12,
          "title": "高中思维知识大盘点",
          "image": "rank-images/image24.jpg"
        },
        {
          "rank": 13,
          "title": "漫画中华文化1000问+小学生必背分级文学常识+课本里的百科常识",
          "image": "rank-images/image26.jpg"
        },
        {
          "rank": 14,
          "title": "学之舟 小学生知识通",
          "image": "rank-images/image28.jpg"
        },
        {
          "rank": 15,
          "title": "你好 蛤蟆先生",
          "image": "rank-images/image30.jpg"
        }
      ]
    },
    "weixinshop": {
      "name": "腾讯营销（小店版）榜单",
      "subtitle": "近一周腾讯广告（小店版）爆品榜单，无转化不扣费",
      "items": [
        {
          "rank": 1,
          "title": "开心【课本里的必背成语】助背漫画知识拓展一本掌握小学6年成语",
          "cat": "教辅/考试-小学教辅-小学语文教辅",
          "price": "31.9",
          "image": "rank-images/image36.jpg",
          "sales_range": "5-10W",
          "sales_idx": "9.8000000000000007",
          "conv": "10.9-11.9%",
          "channel_or_roi": "1.5-1.7"
        },
        {
          "rank": 2,
          "title": "宋兆普保健小妙招中医养生预防杂症妙方出版社直发书官方正版图书",
          "cat": "生活-养生保健-中医养生",
          "price": "48-88",
          "image": "rank-images/image38.jpg",
          "sales_range": "5-10W",
          "sales_idx": "9.6999999999999993",
          "conv": "11.2-12.3%",
          "channel_or_roi": "2.0-2.2"
        },
        {
          "rank": 3,
          "title": "26新版人民日报【中考作文热点素材】语文英语热点预测高分范文模板",
          "cat": "教辅/考试-初中教辅-初中语文教辅",
          "price": "39.8-59.8",
          "image": "rank-images/image35.jpg",
          "sales_range": "5-6W",
          "sales_idx": "9.6999999999999993",
          "conv": "10.3-11.3%",
          "channel_or_roi": "1.5-1.7"
        },
        {
          "rank": 4,
          "title": "罗浮山泰学·诵读本《道德经》·《论语》·《易经》·《孝经》",
          "cat": "人文社科-文学/小说/文化传播-国学/古籍",
          "price": "189.2",
          "image": "rank-images/image41.jpg",
          "sales_range": "5-6W",
          "sales_idx": "9.8000000000000007",
          "conv": "1.1-2.1",
          "channel_or_roi": "2.3-2.5"
        },
        {
          "rank": 5,
          "title": "开心【一图秒懂小学英语语法】小学口诀速记趣味漫画语法书全国通用",
          "cat": "教辅/考试-小学教辅-小学英语教辅",
          "price": "29.8",
          "image": "rank-images/image43.jpg",
          "sales_range": "3-4W",
          "sales_idx": "9.6999999999999993",
          "conv": "3.7-4.7%",
          "channel_or_roi": "1.5-1.8"
        },
        {
          "rank": 6,
          "title": "人呐 用极短的时间，读懂极深的人心。 莫言 时隔6年新小说",
          "cat": "人文社科-文学/小说/文化传播-中国文学/小说",
          "price": "59.9",
          "image": "rank-images/image45.jpg",
          "sales_range": "3-4W",
          "sales_idx": "9.6999999999999993",
          "conv": "5.9-6.9%",
          "channel_or_roi": "1.8-2.0"
        },
        {
          "rank": 7,
          "title": "[全8册]诺贝尔获奖文学作品选淬炼一个时代的智慧与锋芒献给所有不愿停止思考的灵魂",
          "cat": "人文社科-文学/小说/文化传播-外国文学/小说",
          "price": "128",
          "image": "rank-images/image47.jpg",
          "sales_range": "3-4W",
          "sales_idx": "9.6",
          "conv": "5.2-6.2%",
          "channel_or_roi": "1.8-2.0"
        },
        {
          "rank": 8,
          "title": "开心【漫画初中生物+地理+物理+化学】1:1漫改图解教材提前学知识点",
          "cat": "教辅/考试-初中教辅-其他初中教辅",
          "price": "198",
          "image": "rank-images/image49.jpg",
          "sales_range": "3-4W",
          "sales_idx": "9.6",
          "conv": "7.4-8.4%",
          "channel_or_roi": "1.5-1.8"
        },
        {
          "rank": 9,
          "title": "书梦家【100篇英语故事记初中2000词】每日听读中外经典趣味故事默写单词",
          "cat": "教辅/考试-初中教辅-初中英语教辅",
          "price": "19.8-69.8",
          "image": "rank-images/image51.jpg",
          "sales_range": "1-2W",
          "sales_idx": "9.6",
          "conv": "10.9-11.9%",
          "channel_or_roi": "1.6-1.9"
        },
        {
          "rank": 10,
          "title": "一本【初中期末逆袭卷】7-8年级下册全科期末提分视频精讲",
          "cat": "教辅/考试-初中教辅-初中多科教辅",
          "price": "44.8",
          "image": "rank-images/image53.jpg",
          "sales_range": "1-2W",
          "sales_idx": "9.6",
          "conv": "6.8-7.8%",
          "channel_or_roi": "1.5-1.8"
        },
        {
          "rank": 11,
          "title": "一本26新版【中考临考30天抢分攻略】三大抢分攻略考前高效提分",
          "cat": "教辅/考试-初中教辅-初中多科教辅",
          "price": "49.6",
          "image": "rank-images/image55.jpg",
          "sales_range": "1-2W",
          "sales_idx": "9.6",
          "conv": "8.8-9.8%",
          "channel_or_roi": "2.4-2.6"
        },
        {
          "rank": 12,
          "title": "2025新初中五大科核心考点一本通 高频考点语数英物化 含视频精讲",
          "cat": "教辅/考试-初中教辅-初中多科教辅",
          "price": "49.8",
          "image": "rank-images/image57.jpg",
          "sales_range": "1-2W",
          "sales_idx": "9.5",
          "conv": "4.3-5.3%",
          "channel_or_roi": "1.6-1.8"
        },
        {
          "rank": 13,
          "title": "一本【中考预测卷】2026初三临考冲刺复习考前提分省市专版",
          "cat": "教辅/考试-初中教辅-其他初中教辅",
          "price": "149",
          "image": "rank-images/image59.jpg",
          "sales_range": "1-2W",
          "sales_idx": "9.5",
          "conv": "3.1-4.1%",
          "channel_or_roi": "1.6-1.8"
        },
        {
          "rank": 14,
          "title": "地图上的中国通史（豪华精装印签版）图文并茂 百幅地图 20余朝兴衰更替",
          "cat": "人文社科-历史",
          "price": "199",
          "image": "rank-images/image61.jpg",
          "sales_range": "1-2W",
          "sales_idx": "9.5",
          "conv": "3.7-4.7%",
          "channel_or_roi": "1.6-1.8"
        },
        {
          "rank": 15,
          "title": "正版 豪华精装全10册 世界经典文学名著 世界经典文学小说 封面烫金刷边版",
          "cat": "人文社科-文学/小说/文化传播-中国文学/小说",
          "price": "9.9-114",
          "image": "rank-images/image63.jpg",
          "sales_range": "1-2W",
          "sales_idx": "9.5",
          "conv": "1.7-2.7%",
          "channel_or_roi": "1.7-1.9"
        }
      ]
    },
    "potential": {
      "name": "潜力爆品",
      "subtitle": "在ADQ尚未投放/少量投放的各媒体平台图书短视频带货爆品",
      "items": [
        {
          "rank": 1,
          "title": "皮面本A5笔记本本子新款学生ins风简约手账本大学生大号记事本",
          "cat": "教辅/考试-其他教辅书籍",
          "price": "18.8-48.8",
          "image": "rank-images/image37.jpg"
        },
        {
          "rank": 2,
          "title": "幼小衔接看图说话阅读看图讲故事一句话日记诵读写作训练大字注音",
          "cat": "童书-学前启蒙/幼小衔接",
          "price": "39",
          "image": "rank-images/image39.jpg"
        },
        {
          "rank": 3,
          "title": "歇后语幽默笑话谜语大全益智动脑3-8岁趣味漫画逻辑表达力训练",
          "cat": "童书-儿童文学",
          "price": "25.8-30.8",
          "image": "rank-images/image40.jpg"
        },
        {
          "rank": 4,
          "title": "2026新德爷3套卷张天德新高考临考预测卷数学语文英语押题+答题卡",
          "cat": "教辅/考试-高中教辅-高中多科教辅",
          "price": "39.8-99",
          "image": "rank-images/image42.jpg"
        },
        {
          "rank": 5,
          "title": "开心【搞定期末核心考点】小学3-5年级下册语文数学二合一 速记速练",
          "cat": "教辅/考试-小学教辅-小学数学教辅",
          "price": "25.8-3.58",
          "image": "rank-images/image44.jpg"
        },
        {
          "rank": 6,
          "title": "白鹿原 初版复刻丨陈忠实逝世十周年纪念版 93版 平装 内外双封",
          "cat": "人文社科-文学/小说/文化传播-中国文学/小说",
          "price": "26.8",
          "image": "rank-images/image46.jpg"
        },
        {
          "rank": 7,
          "title": "2026新版小学期末冲刺卷下册语数英三合一大小卷高频考点押题冲刺",
          "cat": "教辅/考试-小学教辅-小学多科教辅",
          "price": "25.8-38.5",
          "image": "rank-images/image48.jpg"
        },
        {
          "rank": 8,
          "title": "100以内加减法进退位不进不退位横式竖式脱式应用题数学专项训练",
          "cat": "教辅/考试-小学教辅-小学数学教辅",
          "price": "39.799999999999997",
          "image": "rank-images/image50.jpg"
        },
        {
          "rank": 9,
          "title": "一本【15天期末考前冲刺】1-6年级下册语数英提分复习规划录播视频",
          "cat": "教辅/考试-小学教辅-小学多科教辅",
          "price": "18.2-51.3",
          "image": "rank-images/image52.jpg"
        },
        {
          "rank": 10,
          "title": "生命里的第一课 培养孩子的人生观价值观 指引人生方向培养思维",
          "cat": "童书-儿童成长/教育书",
          "price": "27.8",
          "image": "rank-images/image54.jpg"
        },
        {
          "rank": 11,
          "title": "唐棠良品A4牛皮笔记本a5加厚本学生26新款初高中生草稿纸薄脆本",
          "cat": "教辅/考试-其他教辅书籍",
          "price": "17.5-37.5",
          "image": "rank-images/image56.jpg"
        },
        {
          "rank": 12,
          "title": "孩子不能去的第二现场：给孩子的安全避险指南 练就识别危险意识",
          "cat": "童书-儿童成长/教育书",
          "price": "32.5",
          "image": "rank-images/image58.jpg"
        },
        {
          "rank": 13,
          "title": "正版【你好！蛤蟆探长】6-13岁小学生课外书儿童逻辑思维 通透人性",
          "cat": "童书-儿童成长/教育书",
          "price": "50",
          "image": "rank-images/image60.jpg"
        },
        {
          "rank": 14,
          "title": "千门八将:窥天机 布天局 处世有道职场谋略翻身逆袭荣枯鉴书籍",
          "cat": "社科综合/国学谋略",
          "price": "25.8",
          "image": "rank-images/image62.jpg"
        },
        {
          "rank": 15,
          "title": "结绳技巧图鉴正版 结绳大全彩图版绳结编织技巧实用教程指南书籍",
          "cat": "生活-日常生活-娱乐时尚",
          "price": "159",
          "image": "rank-images/image64.jpg"
        }
      ]
    }
  },
  "week_label": "2026-05-12 至 05-18"
};
