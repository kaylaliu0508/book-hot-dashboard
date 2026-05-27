// 推荐书单数据（来自《【腾讯图书】精选推荐书单.xlsx》，含 4 大品类 + ISBN + 推荐投放时间）
// 生成时间: 2026-05-27 17:29:52

const RECOMMEND_BOOKS = {
  "童书推荐书单": [
    {
      "title": "漫画山海经",
      "publisher": "三环出版社",
      "image": "book-images/recbook_image13.jpg",
      "recommend_time": "6月",
      "isbn": "9787807732389",
      "rank": 1
    },
    {
      "title": "意林励志",
      "publisher": "长江出版社",
      "image": "book-images/recbook_image14.jpg",
      "recommend_time": "6月",
      "isbn": "9787500183617",
      "rank": 2
    },
    {
      "title": "【全彩10册】3-6岁幼儿绘本儿童情绪管理",
      "author": "张芳",
      "publisher": "应急管理出版社",
      "image": "book-images/recbook_image15.jpg",
      "recommend_time": "6月",
      "isbn": "9787523712313",
      "rank": 3
    },
    {
      "title": "我命由我不由天",
      "author": "(法)圣·埃克苏佩里著;胡跃编译",
      "publisher": "应急管理出版社",
      "image": "book-images/recbook_image16.jpg",
      "recommend_time": "6月",
      "isbn": "9787502086572",
      "rank": 4
    },
    {
      "title": "朝花夕拾",
      "publisher": "朝华出版社",
      "image": "book-images/recbook_image17.jpg",
      "recommend_time": "6月",
      "isbn": "9787520520072",
      "rank": 5
    },
    {
      "title": "蛤蟆先生去看心理医生",
      "author": "罗伯特・戴博德（英）",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_image18.jpg",
      "recommend_time": "6月",
      "isbn": "9787559652070",
      "rank": 6
    },
    {
      "title": "青春期情绪密码",
      "author": "丽莎・达穆尔（美）",
      "publisher": "湖南教育出版社",
      "image": "book-images/recbook_image19.jpg",
      "recommend_time": "6月",
      "isbn": "9787575400978",
      "rank": 7
    },
    {
      "title": "情绪低落，怎么办？—— 青少年应对抑郁情绪指南",
      "author": "杰奎琳・B. 托纳、克莱尔・A.B. 弗里兰（美）",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_image20.jpg",
      "recommend_time": "6月",
      "isbn": "9787122322142",
      "rank": 8
    },
    {
      "title": "做不暴躁的孩子（漫画版）",
      "author": "张琦",
      "publisher": "北方妇女儿童出版社",
      "image": "book-images/recbook_image21.jpg",
      "recommend_time": "6月",
      "isbn": "9787558564587",
      "rank": 9
    },
    {
      "title": "和情绪做朋友：6–12 岁情绪管理书",
      "author": "琳恩・莱昂斯（美）",
      "publisher": "中国轻工业出版社",
      "image": "book-images/recbook_image22.jpg",
      "recommend_time": "6月",
      "isbn": "9787518439674",
      "rank": 10
    },
    {
      "title": "自驱型成长：如何科学有效培养孩子的自律",
      "author": "威廉・斯蒂克斯鲁德、奈德・约翰逊（美）",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_image23.jpg",
      "recommend_time": "6月",
      "isbn": "9787559622561",
      "rank": 11
    },
    {
      "title": "情绪急救：应对各种日常心理伤害的策略与方法",
      "author": "盖伊・温奇（美）",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_image24.jpg",
      "recommend_time": "6月",
      "isbn": "9787550254194",
      "rank": 12
    },
    {
      "title": "了不起的我：自我发展的心理学",
      "author": "陈海贤",
      "publisher": "中信出版社",
      "image": "book-images/recbook_image25.jpg",
      "recommend_time": "6月",
      "isbn": "9787508699675",
      "rank": 13
    },
    {
      "title": "被讨厌的勇气",
      "author": "岸见一郎、古贺史健（日）",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_image26.jpg",
      "recommend_time": "6月",
      "isbn": "9787111491605",
      "rank": 14
    },
    {
      "title": "每一次不服输，都在改写命运",
      "author": "意林编辑部",
      "publisher": "吉林摄影出版社",
      "image": "book-images/recbook_image27.jpg",
      "recommend_time": "6月",
      "isbn": "9787549848768",
      "rank": 15
    },
    {
      "title": "写给青少年的心理自愈书",
      "author": "王萍",
      "publisher": "中国纺织出版社",
      "image": "book-images/recbook_image28.jpg",
      "recommend_time": "6月",
      "isbn": "9787518083587",
      "rank": 16
    },
    {
      "title": "我到底怎么了：青少年心理健康指南",
      "author": "奥利维亚・格雷（英）",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_image29.jpg",
      "recommend_time": "6月",
      "isbn": "9787559648646",
      "rank": 17
    },
    {
      "title": "坦率地说：给青少年的心理手册",
      "author": "尼尔斯・英格曼、玛丽安娜・英格曼（挪威）",
      "publisher": "中信出版社",
      "image": "book-images/recbook_image30.jpg",
      "recommend_time": "6月",
      "isbn": "9787521738940",
      "rank": 18
    },
    {
      "title": "青少年正念：每天 10 分钟，让孩子更专注、更平和、更有韧性",
      "author": "珍妮・玛丽・巴蒂斯汀（美）",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_image31.jpg",
      "recommend_time": "6月",
      "isbn": "9787111734599",
      "rank": 19
    },
    {
      "title": "渡过：青少年抑郁康复家庭指南",
      "author": "张进、渡过团队",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_image32.jpg",
      "recommend_time": "6月",
      "isbn": "9787111766323",
      "rank": 20
    },
    {
      "title": "与青春期和解：如何解决青春期关键问题",
      "author": "凯文・莱曼（美）",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_image33.jpg",
      "recommend_time": "6月",
      "isbn": "9787115539648",
      "rank": 21
    },
    {
      "title": "青春期心理学：青少年的成长、发展和面临的问题（原书第 14 版）",
      "author": "金・盖尔・多金（美）",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_image34.jpg",
      "recommend_time": "6月",
      "isbn": "9787111689706",
      "rank": 22
    },
    {
      "title": "男生，我大声对你说",
      "author": "毕淑敏",
      "publisher": "中国妇女出版社",
      "image": "book-images/recbook_image35.jpg",
      "recommend_time": "6月",
      "isbn": "9787512713524",
      "rank": 23
    },
    {
      "title": "女生，我悄悄对你说",
      "author": "毕淑敏",
      "publisher": "中国妇女出版社",
      "image": "book-images/recbook_image36.jpg",
      "recommend_time": "6月",
      "isbn": "9787512713531",
      "rank": 24
    },
    {
      "title": "青春期不烦恼：给孩子的心理成长手册（漫画版）",
      "author": "李付沐瞳、奚铭霞",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_image37.jpg",
      "recommend_time": "6月",
      "isbn": "9787115650481",
      "rank": 25
    },
    {
      "title": "我的情绪小怪兽",
      "author": "文·图/[西班牙]安娜·耶纳斯译/叶淑吟",
      "publisher": "四川少年儿童出版社",
      "image": "book-images/recbook_image38.jpg",
      "recommend_time": "6月",
      "isbn": "9787572808470",
      "rank": 26
    },
    {
      "title": "大中华寻宝系列",
      "author": "孙家裕",
      "publisher": "二十一世纪出版社集团",
      "image": "book-images/recbook_image39.jpg",
      "recommend_time": "6月",
      "isbn": "9787556869817",
      "rank": 27
    },
    {
      "title": "十万个为什么",
      "author": "十万个为什么编辑出版中心",
      "publisher": "少年儿童出版社",
      "image": "book-images/recbook_image40.jpg",
      "recommend_time": "6月",
      "isbn": "9787558911002",
      "rank": 28
    },
    {
      "title": "三国演义绘本",
      "publisher": "中信出版集团",
      "image": "book-images/recbook_image41.jpg",
      "recommend_time": "6月",
      "isbn": "2025112700420",
      "rank": 29
    },
    {
      "title": "100层的房子系列",
      "author": "岩井俊雄著",
      "publisher": "北京科学技术出版社",
      "image": "book-images/recbook_image42.jpg",
      "recommend_time": "6月",
      "isbn": "9787571439316",
      "rank": 30
    },
    {
      "title": "我想去看海/想有颗星星/有个弟弟/找回太阳/爱小黑",
      "author": "[法]克利斯提昂·约里波瓦心文 [法]克利斯提昂·艾利旌众图郑迪蔚公译",
      "publisher": "二十一世纪出版社",
      "image": "book-images/recbook_image43.jpg",
      "recommend_time": "6月",
      "isbn": "7556805002313",
      "rank": 31
    },
    {
      "title": "米吴科学漫画·奇妙万象篇",
      "author": "未华童书",
      "publisher": "二十一世纪出版社集团",
      "image": "book-images/recbook_image44.jpg",
      "recommend_time": "6月",
      "isbn": "14453643",
      "rank": 32
    },
    {
      "title": "青蛙和蟾蜍",
      "author": "文·图/[美]艾诺·洛贝尔 译/潘人木党英台",
      "publisher": "明天出版社",
      "image": "book-images/recbook_image45.jpg",
      "recommend_time": "6月",
      "isbn": "9787570807864",
      "rank": 33
    },
    {
      "title": "中国儿童百科全书",
      "author": "《中国儿童百科全书》编委会",
      "publisher": "中国大百科全书出版社",
      "image": "book-images/recbook_image46.jpg",
      "recommend_time": "6月",
      "isbn": "9787520211130",
      "rank": 34
    },
    {
      "title": "儿童科学大百科",
      "author": "巨童文化",
      "publisher": "中国大百科全书出版社",
      "image": "book-images/recbook_image47.jpg",
      "recommend_time": "6月",
      "isbn": "9787545577341",
      "rank": 35
    },
    {
      "title": "彩虹色的花",
      "publisher": "二十一世纪出版社集团",
      "image": "book-images/recbook_image48.jpg",
      "recommend_time": "6月",
      "isbn": "9787556834280",
      "rank": 36
    },
    {
      "title": "思考世界的孩子",
      "publisher": "中信出版集团",
      "image": "book-images/recbook_image49.jpg",
      "recommend_time": "6月",
      "isbn": "9787521757477",
      "rank": 37
    },
    {
      "title": "怪兽商业街从小培养孩子财商学习经营",
      "publisher": "天地出版社",
      "image": "book-images/recbook_image50.jpg",
      "recommend_time": "6月",
      "isbn": "9787545566949",
      "rank": 38
    },
    {
      "title": "有趣的物理",
      "publisher": "北京日报出版社",
      "image": "book-images/recbook_image51.jpg",
      "recommend_time": "6月",
      "isbn": "9787547731710",
      "rank": 39
    },
    {
      "title": "给孩子的科幻绘本",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_image52.jpg",
      "recommend_time": "6月",
      "isbn": "20220061E",
      "rank": 40
    },
    {
      "title": "DK儿童海洋百科全书",
      "publisher": "中国大百科全书出版社",
      "image": "book-images/recbook_image53.jpg",
      "recommend_time": "6月",
      "isbn": "9787520200851",
      "rank": 41
    },
    {
      "title": "大中国美食环游记",
      "author": "海豚传媒",
      "publisher": "新星出版社",
      "image": "book-images/recbook_image54.jpg",
      "recommend_time": "6月",
      "isbn": "9787513362412",
      "rank": 42
    },
    {
      "title": "神奇校车小百科",
      "author": "[美]汤姆·杰克逊著，[美]卡罗琳·布拉肯绘",
      "publisher": "贵州人民出版社",
      "image": "book-images/recbook_image55.jpg",
      "recommend_time": "6月",
      "isbn": "9787221175670",
      "rank": 43
    }
  ],
  "教辅推荐书单": [
    {
      "title": "初中提分笔记",
      "author": "峰阅教研组",
      "publisher": "浙江大学出版社",
      "image": "book-images/recbook_image56.jpg",
      "recommend_time": "6月",
      "isbn": "9787308257770",
      "rank": 1
    },
    {
      "title": "不一样的九九乘除法",
      "author": "徐志兴",
      "publisher": "北京日报出版社",
      "image": "book-images/recbook_image57.jpg",
      "recommend_time": "6月",
      "isbn": "9787547752500",
      "rank": 2
    },
    {
      "title": "作文与素材",
      "author": "峰阅教研组",
      "publisher": "山东大学出版社",
      "image": "book-images/recbook_image58.jpg",
      "recommend_time": "6月",
      "isbn": "9787557033453",
      "rank": 3
    },
    {
      "title": "初中秒解数理化",
      "author": "刘大勇",
      "publisher": "延边教育出版社",
      "image": "book-images/recbook_image59.jpg",
      "recommend_time": "6月",
      "isbn": "9787572448317",
      "rank": 4
    },
    {
      "title": "漫画趣味数理化启蒙",
      "publisher": "广东旅游出版社",
      "image": "book-images/recbook_image60.jpg",
      "recommend_time": "6月",
      "isbn": "9787570538577",
      "rank": 5
    },
    {
      "title": "小学同步作文练字贴",
      "publisher": "陕西人民美术出版社",
      "image": "book-images/recbook_image61.jpg",
      "recommend_time": "6月",
      "isbn": "9787536843929",
      "rank": 6
    },
    {
      "title": "背记清单.初中历史",
      "author": "徐春龙",
      "publisher": "北京时代华文书局",
      "image": "book-images/recbook_image62.jpg",
      "recommend_time": "6月",
      "isbn": "9787569958454",
      "rank": 7
    },
    {
      "title": "语数英人教版教材",
      "publisher": "人民教育出版社",
      "image": "book-images/recbook_image63.jpg",
      "recommend_time": "6月",
      "isbn": "9787107397547",
      "rank": 8
    },
    {
      "title": "新课堂笔记",
      "publisher": "青岛出版社",
      "image": "book-images/recbook_image64.jpg",
      "recommend_time": "6月",
      "isbn": "9787573633507",
      "rank": 9
    }
  ],
  "社科推荐书单": [
    {
      "platform": "京东",
      "title": "零基础玩转OpenClaw",
      "author": "向安玲  张诗瑶   张亚男",
      "publisher": "中信出版社",
      "image": "book-images/recbook_image65.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521739282",
      "rank": 1
    },
    {
      "title": "AI中国方案",
      "author": "薛澜",
      "publisher": "中信出版集团",
      "image": "book-images/recbook_image66.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521779813",
      "rank": 2
    },
    {
      "title": "AI训练师手册",
      "author": "谷建阳",
      "publisher": "北京大学出版社",
      "image": "book-images/recbook_image67.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787301351925",
      "rank": 3
    },
    {
      "title": "养龙虾OpenClaw与AI智能体时代",
      "author": "杜雨",
      "publisher": "中译出版社",
      "image": "book-images/recbook_image68.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787500186021",
      "rank": 4
    },
    {
      "platform": "京东",
      "title": "deepseek+AI炒股一本通",
      "author": "恒盛杰资讯",
      "publisher": "北京理工大学出版社",
      "image": "book-images/recbook_image1.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787576352795",
      "rank": 5
    },
    {
      "title": "Agent设计模式",
      "author": "黄佳",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_image2.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787115690470",
      "rank": 6
    },
    {
      "title": "AI未来进行式:李开复陈楸帆新书",
      "author": "李开复;陈楸帆",
      "publisher": "浙江人民出版社",
      "image": "book-images/recbook_image3.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787213101625",
      "rank": 7
    },
    {
      "title": "智能涌现:AI时代的思考与探索",
      "author": "张亚勤",
      "publisher": "中信出版社。",
      "image": "book-images/recbook_image5.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521774412",
      "rank": 8
    },
    {
      "title": "OpenClaw AI助理一本通",
      "author": "刘宸 龙汀汀 王啸啸",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_image6.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787122503312",
      "rank": 9
    },
    {
      "title": "手把手教你养“龙虾”从零开始驾驭OpenClaw",
      "author": "丁俊松",
      "publisher": "山西科学技术出版社",
      "image": "book-images/recbook_image7.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787516932391",
      "rank": 10
    },
    {
      "title": "玩爆你的龙虾  最强 OpenClaw",
      "author": "胡嘉玺",
      "image": "book-images/recbook_image8.jpg",
      "ams_status": "需补充进口备案文号",
      "recommend_time": "Q1",
      "isbn": "9786267889022",
      "rank": 11
    },
    {
      "platform": "淘宝",
      "title": "AI掘金",
      "author": "千海",
      "publisher": "中国纺织出版社有限公司",
      "image": "book-images/recbook_image9.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787522935324",
      "rank": 12
    },
    {
      "title": "AI赚钱攻略",
      "author": "千赋AI-老曹，九度",
      "publisher": "北京日报出版社",
      "image": "book-images/recbook_image11.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787547752807",
      "rank": 13
    },
    {
      "title": "富爸爸穷爸爸(新版)",
      "author": "(美)罗伯特·清崎  译者:萧明",
      "publisher": "四川人民出版社",
      "image": "book-images/recbook_image72.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787220114045",
      "rank": 14
    },
    {
      "title": "给孩子的人工智能",
      "author": "陈智涛，存一",
      "publisher": "台海出版社",
      "image": "book-images/recbook_image73.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787516841624",
      "rank": 15
    },
    {
      "title": "智能简史：进化、AI与人脑的突破",
      "author": "[美]麦克斯·班尼特(Max Bennett)  译者:林桥津",
      "publisher": "中译出版社",
      "image": "book-images/recbook_image74.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787500181699",
      "rank": 16
    },
    {
      "title": "DeepSeek从入门到精通",
      "author": "徐昕张",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_image75.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787301361504",
      "rank": 17
    },
    {
      "title": "漫画AI",
      "author": "师鲁贝尔",
      "publisher": "百花洲文艺出版社",
      "image": "book-images/recbook_image76.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787550056589",
      "rank": 18
    },
    {
      "title": "AI工程大模型应用开发实战",
      "author": "[越]奇普·萱(ChipHuyen)  译者:宝玉",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_image77.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787115686398",
      "rank": 19
    },
    {
      "title": "智人之上一一从石器时代到AI时代的信息网络简史",
      "author": "[以]尤瓦尔·赫拉利  译者:林俊宏",
      "publisher": "中信出版集团",
      "image": "book-images/recbook_image78.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521768527",
      "rank": 20
    },
    {
      "title": "一人公司:AI时代赚钱新方向",
      "author": "究慈",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_image80.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787513951944",
      "rank": 21
    },
    {
      "title": "用ai赚钱",
      "author": "芙朗",
      "publisher": "江苏凤凰文艺出版社",
      "image": "book-images/recbook_image82.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787559499158",
      "rank": 22
    },
    {
      "title": "玩“赚”AI",
      "author": "老曹，赵亦初",
      "publisher": "北京日报出版社",
      "image": "book-images/recbook_image84.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787547753835",
      "rank": 23
    },
    {
      "title": "快速玩转DeepSeek 7天从新手到高手",
      "author": "焦海利",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_image85.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513949507",
      "rank": 24
    },
    {
      "title": "用AI赚钱 普通人的新财库",
      "author": "林开平，马新",
      "publisher": "中国画报出版社",
      "image": "book-images/recbook_image86.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521015775",
      "rank": 25
    },
    {
      "title": "从0到1用AI赚钱",
      "author": "高效笑笑",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_image88.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513948944",
      "rank": 26
    },
    {
      "title": "零基础玩转AI赚钱36招",
      "author": "陈光锋",
      "publisher": "团结出版社",
      "image": "book-images/recbook_image90.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787523423110",
      "rank": 27
    },
    {
      "title": "DeepSeek实用操作指南书",
      "author": "焦海利",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_image91.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513949163",
      "rank": 28
    },
    {
      "title": "StatQuest 图解机器学习（全彩）",
      "publisher": "电子工业出版社",
      "image": "book-images/recbook_image92.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787121497643",
      "rank": 29
    },
    {
      "title": "人工智能",
      "author": "师鲁贝尔",
      "publisher": "百花洲文艺出版社",
      "image": "book-images/recbook_image93.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787302686750",
      "rank": 30
    },
    {
      "title": "AI职场神器：高效办公实战手册",
      "author": "海川",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_image94.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787122491954",
      "rank": 31
    },
    {
      "title": "零基础DeepSeek从入门到精通",
      "author": "民辰",
      "publisher": "中國西報土版社",
      "image": "book-images/recbook_image95.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787558593697",
      "rank": 32
    },
    {
      "title": "人人都能学AI",
      "author": "左歌,罗杰,庄肃常",
      "publisher": "北方妇女儿童出版社",
      "image": "book-images/recbook_image96.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787558593697",
      "rank": 33
    },
    {
      "title": "用ai赚钱",
      "author": "芙朗",
      "publisher": "江苏凤凰文艺出版社",
      "image": "book-images/recbook_image82.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787559499158",
      "rank": 34
    },
    {
      "title": "小学生秒懂新科技和AI人工智能",
      "author": "催钟雷",
      "publisher": "吉林美术出版社",
      "image": "book-images/recbook_image98.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787557597870",
      "rank": 35
    },
    {
      "title": "从0到1用AI赚钱",
      "author": "高效笑笑",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_image99.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513948944",
      "rank": 36
    },
    {
      "title": "DeepSeek实用操作指南书",
      "author": "焦海利",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_image91.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513949163",
      "rank": 37
    },
    {
      "title": "一人公司:AI时代赚钱新方向",
      "author": "究慈",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_image80.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787513951944",
      "rank": 38
    },
    {
      "title": "AI时代安全导航",
      "author": "佟丽华",
      "publisher": "中国少年儿童出版社",
      "image": "book-images/recbook_image101.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787524801467",
      "rank": 39
    },
    {
      "title": "DeepSeek实用操作指南",
      "author": "李尚龙",
      "publisher": "台海出版社",
      "image": "book-images/recbook_image102.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787301361504",
      "rank": 40
    },
    {
      "title": "懒商：AI赋能下的财富密码",
      "author": "冯慧娟",
      "publisher": "华文出版社",
      "image": "book-images/recbook_image103.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787507563351",
      "rank": 41
    }
  ],
  "健康推荐书单": [
    {
      "title": "二十四节气养生药茶",
      "author": "王晨",
      "publisher": "中医古籍出版社",
      "image": "book-images/recbook_image105.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787515224536",
      "rank": 1
    },
    {
      "title": "美食课（夏季版）",
      "author": "徐文兵",
      "publisher": "广东科技出版社",
      "image": "book-images/recbook_image108.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787535979828",
      "rank": 2
    },
    {
      "title": "舌尖上的中国",
      "author": "陈志田",
      "publisher": "中国华侨出版社",
      "image": "book-images/recbook_image110.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787511371898",
      "rank": 3
    },
    {
      "title": "百吃不厌的能量果蔬汁",
      "publisher": "青岛出版社",
      "image": "book-images/recbook_image111.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787543682078",
      "rank": 4
    },
    {
      "title": "全身穴位一找就准",
      "author": "姜庆荣",
      "publisher": "四川科学技术出版社",
      "image": "book-images/recbook_image113.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787572713576",
      "rank": 5
    },
    {
      "title": "养生豆浆米糊果蔬汁一本全",
      "author": "万平",
      "publisher": "重庆出版社",
      "image": "book-images/recbook_image115.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787229060718",
      "rank": 6
    },
    {
      "title": "1500种中草药野外识别彩色图鉴",
      "author": "岳桂华，王柳萍，杨高华",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_image116.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787122302977",
      "rank": 7
    },
    {
      "title": "四季蒸菜",
      "author": "余静,编",
      "publisher": "黑龙江科学技术出版社",
      "image": "book-images/recbook_image117.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787571902742",
      "rank": 8
    },
    {
      "title": "老年人饮食营养一本通",
      "author": "刘英华 徐庆",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_image119.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787122351098",
      "rank": 9
    },
    {
      "title": "中老年人必知的365个养生法",
      "author": "李柏",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_image120.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787122250087",
      "rank": 10
    },
    {
      "title": "吃土:强健肠道、提升免疫的整体健康革命",
      "author": "(美)乔希·阿克斯  译者:王凌波;魏宁",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_image121.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787559611680",
      "rank": 11
    },
    {
      "title": "精选家常菜",
      "author": "高杰",
      "publisher": "中国轻工业出版社",
      "image": "book-images/recbook_image122.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787518424412",
      "rank": 12
    },
    {
      "title": "中草药全图鉴",
      "author": "温玉波，李海涛",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_image123.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787553742601",
      "rank": 13
    },
    {
      "title": "阳台种菜种花种香草",
      "author": "白虹",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_image124.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787550258433",
      "rank": 14
    },
    {
      "title": "零基础学养花",
      "author": "王意成",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_image125.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787571321727",
      "rank": 15
    },
    {
      "title": "四书五经 精装",
      "publisher": "辽海出版社",
      "image": "book-images/recbook_image126.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787545136852",
      "rank": 16
    },
    {
      "title": "怀孕一天一页",
      "author": "马良坤",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_image127.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787553785622",
      "rank": 17
    },
    {
      "title": "老子道德经解-禅解儒道丛书",
      "publisher": "崇文书局",
      "image": "book-images/recbook_image128.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787540340018",
      "rank": 18
    },
    {
      "title": "吕祖秘注道德经心传",
      "publisher": "华龄出版社",
      "image": "book-images/recbook_image129.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787516929339",
      "rank": 19
    },
    {
      "title": "孝经诵读本",
      "publisher": "文华出版社",
      "image": "book-images/recbook_image130.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787507560046",
      "rank": 20
    },
    {
      "title": "漫画讲透黄帝内经",
      "author": "张嘉铭 王婧",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_image132.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 21
    },
    {
      "title": "身体重置",
      "author": "[美]斯蒂芬·佩内里   海蒂·斯科尔尼克  译者: 余茗雯",
      "publisher": "中译出版社",
      "image": "book-images/recbook_image133.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 22
    },
    {
      "title": "控糖革命",
      "author": "(法)杰西·安佐斯佩   译者:张艳娟",
      "publisher": "浙江科学技术出版社",
      "image": "book-images/recbook_image134.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 23
    },
    {
      "title": "《本草纲目》节气养生年历",
      "author": "蔡志忠 周学林",
      "publisher": "天津科学技术出版社",
      "image": "book-images/recbook_image135.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 24
    },
    {
      "title": "预防衰老   从50岁开始",
      "author": "(日)和田秀树  译者:王雯婷",
      "publisher": "东方出版社",
      "image": "book-images/recbook_image137.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 25
    },
    {
      "title": "救命!逆转和预防致命疾病的科学饮食",
      "author": "(美)迈克尔·格雷格;(美)吉恩·斯通  译者:谢宜晖;张家绮",
      "publisher": "电子工业出版社",
      "image": "book-images/recbook_image138.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 26
    },
    {
      "title": "黄帝内经全集(全译图解版)",
      "author": "肖建喜，紫图",
      "publisher": "吉林科学技术出版社",
      "image": "book-images/recbook_image139.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 27
    },
    {
      "title": "血糖控制一本就够",
      "author": "李宁，李乃适",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_image140.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 28
    },
    {
      "platform": "抖音",
      "title": "二十四节气健康吃法",
      "author": "朱荣",
      "publisher": "中国织纺出版社",
      "image": "book-images/recbook_image141.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 29
    },
    {
      "title": "中医养身妙招",
      "author": "解谢",
      "publisher": "新疆科学技术出版社",
      "image": "book-images/recbook_image142.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 30
    },
    {
      "title": "实用中草药图谱与手册应用",
      "author": "胡贵荣",
      "publisher": "贵州科技出版社",
      "image": "book-images/recbook_image143.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 31
    },
    {
      "title": "漫画讲透黄帝内经",
      "author": "张嘉铭 王婧",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_image147.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 32
    },
    {
      "title": "饮食术：减糖生活",
      "author": "何银萍",
      "publisher": "吉林科学技术出版社",
      "image": "book-images/recbook_image148.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 33
    },
    {
      "title": "别让慢病找上你",
      "author": "斯蒂芬 科佩基  译者:管秀兰  李杰",
      "publisher": "浙江科学技术出版社",
      "image": "book-images/recbook_image150.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 34
    },
    {
      "title": "保健小妙招",
      "author": "宋兆普",
      "publisher": "河南科学技术出版社",
      "image": "book-images/recbook_image152.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 35
    },
    {
      "title": "黄帝内经",
      "author": "李爱勇, 编著",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_image153.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 36
    },
    {
      "title": "腿脚有病看这本就够",
      "author": "张威",
      "publisher": "天津科学技术出版社",
      "image": "book-images/recbook_image158.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 37
    },
    {
      "title": "保健小妙招",
      "author": "宋兆普",
      "publisher": "河南科学技术出版社",
      "image": "book-images/recbook_image159.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 38
    },
    {
      "platform": "天猫",
      "title": "中医养生食疗大全",
      "author": "李素云",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_image161.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 39
    },
    {
      "title": "抗炎食物",
      "author": "(美) 利兹·斯特雷特 (Lizzie Streit)  译者：董乐乐",
      "publisher": "科学技术文献出版社",
      "image": "book-images/recbook_image162.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 40
    },
    {
      "title": "《本草纲目》节气养生年历",
      "author": "蔡志忠 周学林",
      "publisher": "天津科学技术出版社",
      "image": "book-images/recbook_image135.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 41
    },
    {
      "title": "黄帝内经",
      "author": "马寅中",
      "publisher": "科学普及出版社",
      "image": "book-images/recbook_image163.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 42
    },
    {
      "title": "漫画讲透黄帝内经",
      "author": "张嘉铭 王婧",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_image132.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 43
    },
    {
      "title": "智慧生活-3秒精准取穴",
      "author": "李哲",
      "publisher": "中国科学技术出版社",
      "image": "book-images/recbook_image164.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 44
    },
    {
      "title": "黄帝内经",
      "author": "郭刚",
      "publisher": "岳麓书社",
      "image": "book-images/recbook_image166.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 45
    },
    {
      "title": "这书能让你戒烟",
      "author": "[英]亚伦·卡尔(Allen Carr)   译者： 严冬冬",
      "publisher": "北京联合出版有限责任公司",
      "image": "book-images/recbook_image167.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "rank": 46
    }
  ]
};
