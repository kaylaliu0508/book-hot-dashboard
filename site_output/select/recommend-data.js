// 推荐书单数据（来自《【腾讯图书】预测推荐书单 (4).xlsx》7月期 + 历史 6月期）
// 4 大品类 + ISBN + 推荐投放时间，每个品类内 rank 独立从 1 开始
// 生成时间: 2026-06-30 17:00:00（追加 7月 59 本：教辅21+童书14+社科15+健康9，社科健康已剔除审核不准入项）

const RECOMMEND_BOOKS = {
  "童书推荐书单": [
    // ===== 童书推荐书单 · 7月新增（14 本，prepended 2026-06-30）=====
    {
      "title": "改变孩子命运的顶尖思维+赢在破局思维",
      "rank": 1,
      "recommend_time": "7月",
      "isbn": "9787519483838"
    },
    {
      "title": "小学生太有意思了 生活中的物理",
      "rank": 2,
      "recommend_time": "7月",
      "isbn": "9787516533994"
    },
    {
      "title": "经典儿童文学 10册",
      "rank": 3,
      "recommend_time": "7月",
      "isbn": "9787570720620"
    },
    {
      "title": "漫画版推恩令",
      "rank": 4,
      "recommend_time": "7月",
      "isbn": "9787221196118"
    },
    {
      "title": "漫画礼仪知识规矩篇+漫画礼仪知识教养篇+漫画应变思维变通篇+漫画应变思维智囊篇",
      "rank": 5,
      "recommend_time": "7月",
      "isbn": "9787574507975"
    },
    {
      "title": "儿童内驱力激发力绘本",
      "rank": 6,
      "recommend_time": "7月",
      "isbn": "9787572326295"
    },
    {
      "title": "漫画少年强者思维狼之魂",
      "rank": 7,
      "recommend_time": "7月",
      "isbn": "9787511040657"
    },
    {
      "title": "爱上表达绘本系列",
      "rank": 8,
      "recommend_time": "7月",
      "isbn": "9787523706329"
    },
    {
      "title": "安徒生童话+稻草人书+格林童话",
      "rank": 9,
      "recommend_time": "7月",
      "isbn": "9787555280354"
    },
    {
      "title": "孩子，你要懂点儿人情世故",
      "rank": 10,
      "recommend_time": "7月",
      "isbn": "9787558760426"
    },
    {
      "title": "小鲤鱼跳龙门",
      "rank": 11,
      "recommend_time": "7月",
      "isbn": "9787576366327"
    },
    {
      "title": "赢在破局思维",
      "rank": 12,
      "recommend_time": "7月",
      "isbn": "9787512519251"
    },
    {
      "title": "我命由我不由天",
      "rank": 13,
      "recommend_time": "7月",
      "isbn": "9787502086572"
    },
    {
      "title": "财商启蒙",
      "rank": 14,
      "recommend_time": "7月",
      "isbn": "9787558197321"
    },
    {
      "title": "桑尼有主意",
      "rank": 1,
      "publisher": "陕西人民教育出版社",
      "image": "book-images/recbook_predict_童书_1.jpg",
      "recommend_time": "6月",
      "isbn": "9787575704472"
    },
    {
      "title": "笑猫日记",
      "rank": 2,
      "publisher": "安徽少年儿童出版社",
      "image": "book-images/recbook_predict_童书_2.jpg",
      "recommend_time": "6月",
      "isbn": "9787570818648"
    },
    {
      "title": "神笔马良",
      "rank": 3,
      "publisher": "应急管理出版社",
      "image": "book-images/recbook_predict_童书_3.jpg",
      "recommend_time": "6月",
      "isbn": "9787107325502"
    },
    {
      "title": "漫画AI趣味物理",
      "rank": 4,
      "publisher": "中译出版社",
      "image": "book-images/recbook_predict_童书_4.jpg",
      "recommend_time": "6月",
      "isbn": "9787500178415"
    },
    {
      "title": "漫画趣味文化常识启蒙书+漫画趣味小四门启蒙书",
      "rank": 5,
      "image": "book-images/recbook_predict_童书_5.jpg",
      "recommend_time": "6月",
      "isbn": "9787570542970"
    },
    {
      "title": "时间管理+礼仪教养+社会情商漫画启蒙书",
      "rank": 6,
      "image": "book-images/recbook_predict_童书_6.jpg",
      "recommend_time": "6月",
      "isbn": "9787549293766"
    },
    {
      "title": "儿童文学世界名著",
      "rank": 7,
      "image": "book-images/recbook_predict_童书_7.jpg",
      "recommend_time": "6月",
      "isbn": "8820220913"
    },
    {
      "title": "财商启蒙",
      "rank": 8,
      "image": "book-images/recbook_predict_童书_8.jpg",
      "recommend_time": "6月",
      "isbn": "9787558197321"
    },
    {
      "title": "写给孩子的古文观止",
      "rank": 9,
      "image": "book-images/recbook_predict_童书_9.jpg",
      "recommend_time": "6月",
      "isbn": "9787548087045"
    },
    {
      "title": "漫画儿童经济学",
      "rank": 10,
      "image": "book-images/recbook_predict_童书_10.jpg",
      "recommend_time": "6月",
      "isbn": "9787569950663"
    },
    {
      "title": "这就是数学小学数学漫画启蒙",
      "rank": 11,
      "image": "book-images/recbook_predict_童书_11.jpg",
      "recommend_time": "6月",
      "isbn": "9787116122215"
    },
    {
      "title": "漫画山海经",
      "rank": 12,
      "publisher": "三环出版社",
      "image": "book-images/recbook_predict_童书_12.jpg",
      "recommend_time": "6月",
      "isbn": "9787807732389"
    },
    {
      "title": "意林励志",
      "rank": 13,
      "publisher": "长江出版社",
      "image": "book-images/recbook_predict_童书_13.jpg",
      "recommend_time": "6月",
      "isbn": "9787500183617"
    },
    {
      "title": "【全彩10册】3-6岁幼儿绘本儿童情绪管理",
      "rank": 14,
      "author": "张芳",
      "publisher": "应急管理出版社",
      "image": "book-images/recbook_predict_童书_14.jpg",
      "recommend_time": "6月",
      "isbn": "9787523712313"
    },
    {
      "title": "我命由我不由天",
      "rank": 15,
      "author": "(法)圣·埃克苏佩里著;胡跃编译",
      "publisher": "应急管理出版社",
      "image": "book-images/recbook_predict_童书_15.jpg",
      "recommend_time": "6月",
      "isbn": "9787502086572"
    },
    {
      "title": "朝花夕拾",
      "rank": 16,
      "publisher": "朝华出版社",
      "image": "book-images/recbook_predict_童书_16.jpg",
      "recommend_time": "6月",
      "isbn": "9787520520072"
    },
    {
      "title": "蛤蟆先生去看心理医生",
      "rank": 17,
      "author": "罗伯特・戴博德（英）",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_predict_童书_17.jpg",
      "recommend_time": "6月",
      "isbn": "9787559652070"
    },
    {
      "title": "青春期情绪密码",
      "rank": 18,
      "author": "丽莎・达穆尔（美）",
      "publisher": "湖南教育出版社",
      "image": "book-images/recbook_predict_童书_18.jpg",
      "recommend_time": "6月",
      "isbn": "9787575400978"
    },
    {
      "title": "情绪低落，怎么办？—— 青少年应对抑郁情绪指南",
      "rank": 19,
      "author": "杰奎琳・B. 托纳、克莱尔・A.B. 弗里兰（美）",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_predict_童书_19.jpg",
      "recommend_time": "6月",
      "isbn": "9787122322142"
    },
    {
      "title": "做不暴躁的孩子（漫画版）",
      "rank": 20,
      "author": "张琦",
      "publisher": "北方妇女儿童出版社",
      "image": "book-images/recbook_predict_童书_20.jpg",
      "recommend_time": "6月",
      "isbn": "9787558564587"
    },
    {
      "title": "和情绪做朋友：6–12 岁情绪管理书",
      "rank": 21,
      "author": "琳恩・莱昂斯（美）",
      "publisher": "中国轻工业出版社",
      "image": "book-images/recbook_predict_童书_21.jpg",
      "recommend_time": "6月",
      "isbn": "9787518439674"
    },
    {
      "title": "自驱型成长：如何科学有效培养孩子的自律",
      "rank": 22,
      "author": "威廉・斯蒂克斯鲁德、奈德・约翰逊（美）",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_predict_童书_22.jpg",
      "recommend_time": "6月",
      "isbn": "9787559622561"
    },
    {
      "title": "情绪急救：应对各种日常心理伤害的策略与方法",
      "rank": 23,
      "author": "盖伊・温奇（美）",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_predict_童书_23.jpg",
      "recommend_time": "6月",
      "isbn": "9787550254194"
    },
    {
      "title": "了不起的我：自我发展的心理学",
      "rank": 24,
      "author": "陈海贤",
      "publisher": "中信出版社",
      "image": "book-images/recbook_predict_童书_24.jpg",
      "recommend_time": "6月",
      "isbn": "9787508699675"
    },
    {
      "title": "被讨厌的勇气",
      "rank": 25,
      "author": "岸见一郎、古贺史健（日）",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_predict_童书_25.jpg",
      "recommend_time": "6月",
      "isbn": "9787111491605"
    },
    {
      "title": "每一次不服输，都在改写命运",
      "rank": 26,
      "author": "意林编辑部",
      "publisher": "吉林摄影出版社",
      "image": "book-images/recbook_predict_童书_26.jpg",
      "recommend_time": "6月",
      "isbn": "9787549848768"
    },
    {
      "title": "写给青少年的心理自愈书",
      "rank": 27,
      "author": "王萍",
      "publisher": "中国纺织出版社",
      "image": "book-images/recbook_predict_童书_27.jpg",
      "recommend_time": "6月",
      "isbn": "9787518083587"
    },
    {
      "title": "我到底怎么了：青少年心理健康指南",
      "rank": 28,
      "author": "奥利维亚・格雷（英）",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_predict_童书_28.jpg",
      "recommend_time": "6月",
      "isbn": "9787559648646"
    },
    {
      "title": "坦率地说：给青少年的心理手册",
      "rank": 29,
      "author": "尼尔斯・英格曼、玛丽安娜・英格曼（挪威）",
      "publisher": "中信出版社",
      "image": "book-images/recbook_predict_童书_29.jpg",
      "recommend_time": "6月",
      "isbn": "9787521738940"
    },
    {
      "title": "青少年正念：每天 10 分钟，让孩子更专注、更平和、更有韧性",
      "rank": 30,
      "author": "珍妮・玛丽・巴蒂斯汀（美）",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_predict_童书_30.jpg",
      "recommend_time": "6月",
      "isbn": "9787111734599"
    },
    {
      "title": "渡过：青少年抑郁康复家庭指南",
      "rank": 31,
      "author": "张进、渡过团队",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_predict_童书_31.jpg",
      "recommend_time": "6月",
      "isbn": "9787111766323"
    },
    {
      "title": "与青春期和解：如何解决青春期关键问题",
      "rank": 32,
      "author": "凯文・莱曼（美）",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_predict_童书_32.jpg",
      "recommend_time": "6月",
      "isbn": "9787115539648"
    },
    {
      "title": "青春期心理学：青少年的成长、发展和面临的问题（原书第 14 版）",
      "rank": 33,
      "author": "金・盖尔・多金（美）",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_predict_童书_33.jpg",
      "recommend_time": "6月",
      "isbn": "9787111689706"
    },
    {
      "title": "男生，我大声对你说",
      "rank": 34,
      "author": "毕淑敏",
      "publisher": "中国妇女出版社",
      "image": "book-images/recbook_predict_童书_34.jpg",
      "recommend_time": "6月",
      "isbn": "9787512713524"
    },
    {
      "title": "女生，我悄悄对你说",
      "rank": 35,
      "author": "毕淑敏",
      "publisher": "中国妇女出版社",
      "image": "book-images/recbook_predict_童书_35.jpg",
      "recommend_time": "6月",
      "isbn": "9787512713531"
    },
    {
      "title": "青春期不烦恼：给孩子的心理成长手册（漫画版）",
      "rank": 36,
      "author": "李付沐瞳、奚铭霞",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_predict_童书_36.jpg",
      "recommend_time": "6月",
      "isbn": "9787115650481"
    },
    {
      "title": "我的情绪小怪兽",
      "rank": 37,
      "author": "文·图/[西班牙]安娜·耶纳斯译/叶淑吟",
      "publisher": "四川少年儿童出版社",
      "image": "book-images/recbook_predict_童书_37.jpg",
      "recommend_time": "6月",
      "isbn": "9787572808470"
    },
    {
      "title": "大中华寻宝系列",
      "rank": 38,
      "author": "孙家裕",
      "publisher": "二十一世纪出版社集团",
      "image": "book-images/recbook_predict_童书_38.jpg",
      "recommend_time": "6月",
      "isbn": "9787556869817"
    },
    {
      "title": "十万个为什么",
      "rank": 39,
      "author": "十万个为什么编辑出版中心",
      "publisher": "少年儿童出版社",
      "image": "book-images/recbook_predict_童书_39.jpg",
      "recommend_time": "6月",
      "isbn": "9787558911002"
    },
    {
      "title": "三国演义绘本",
      "rank": 40,
      "publisher": "中信出版集团",
      "image": "book-images/recbook_predict_童书_40.jpg",
      "recommend_time": "6月",
      "isbn": "2025112700420"
    },
    {
      "title": "100层的房子系列",
      "rank": 41,
      "author": "岩井俊雄著",
      "publisher": "北京科学技术出版社",
      "image": "book-images/recbook_predict_童书_41.jpg",
      "recommend_time": "6月",
      "isbn": "9787571439316"
    },
    {
      "title": "我想去看海/想有颗星星/有个弟弟/找回太阳/爱小黑",
      "rank": 42,
      "author": "[法]克利斯提昂·约里波瓦心文 [法]克利斯提昂·艾利旌众图郑迪蔚公译",
      "publisher": "二十一世纪出版社",
      "image": "book-images/recbook_predict_童书_42.jpg",
      "recommend_time": "6月",
      "isbn": "7556805002313"
    },
    {
      "title": "米吴科学漫画·奇妙万象篇",
      "rank": 43,
      "author": "未华童书",
      "publisher": "二十一世纪出版社集团",
      "image": "book-images/recbook_predict_童书_43.jpg",
      "recommend_time": "6月",
      "isbn": "14453643"
    },
    {
      "title": "青蛙和蟾蜍",
      "rank": 44,
      "author": "文·图/[美]艾诺·洛贝尔 译/潘人木党英台",
      "publisher": "明天出版社",
      "image": "book-images/recbook_predict_童书_44.jpg",
      "recommend_time": "6月",
      "isbn": "9787570807864"
    },
    {
      "title": "中国儿童百科全书",
      "rank": 45,
      "author": "《中国儿童百科全书》编委会",
      "publisher": "中国大百科全书出版社",
      "image": "book-images/recbook_predict_童书_45.jpg",
      "recommend_time": "6月",
      "isbn": "9787520211130"
    },
    {
      "title": "儿童科学大百科",
      "rank": 46,
      "author": "巨童文化",
      "publisher": "中国大百科全书出版社",
      "image": "book-images/recbook_predict_童书_46.jpg",
      "recommend_time": "6月",
      "isbn": "9787545577341"
    },
    {
      "title": "彩虹色的花",
      "rank": 47,
      "publisher": "二十一世纪出版社集团",
      "image": "book-images/recbook_predict_童书_47.jpg",
      "recommend_time": "6月",
      "isbn": "9787556834280"
    },
    {
      "title": "思考世界的孩子",
      "rank": 48,
      "publisher": "中信出版集团",
      "image": "book-images/recbook_predict_童书_48.jpg",
      "recommend_time": "6月",
      "isbn": "9787521757477"
    },
    {
      "title": "怪兽商业街从小培养孩子财商学习经营",
      "rank": 49,
      "publisher": "天地出版社",
      "image": "book-images/recbook_predict_童书_49.jpg",
      "recommend_time": "6月",
      "isbn": "9787545566949"
    },
    {
      "title": "有趣的物理",
      "rank": 50,
      "publisher": "北京日报出版社",
      "image": "book-images/recbook_predict_童书_50.jpg",
      "recommend_time": "6月",
      "isbn": "9787547731710"
    },
    {
      "title": "给孩子的科幻绘本",
      "rank": 51,
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_predict_童书_51.jpg",
      "recommend_time": "6月",
      "isbn": "20220061E"
    },
    {
      "title": "DK儿童海洋百科全书",
      "rank": 52,
      "publisher": "中国大百科全书出版社",
      "image": "book-images/recbook_predict_童书_52.jpg",
      "recommend_time": "6月",
      "isbn": "9787520200851"
    },
    {
      "title": "大中国美食环游记",
      "rank": 53,
      "author": "海豚传媒",
      "publisher": "新星出版社",
      "image": "book-images/recbook_predict_童书_53.jpg",
      "recommend_time": "6月",
      "isbn": "9787513362412"
    },
    {
      "title": "神奇校车小百科",
      "rank": 54,
      "author": "[美]汤姆·杰克逊著，[美]卡罗琳·布拉肯绘",
      "publisher": "贵州人民出版社",
      "image": "book-images/recbook_predict_童书_54.jpg",
      "recommend_time": "6月",
      "isbn": "9787221175670"
    }
  ],
  "教辅推荐书单": [
    // ===== 教辅推荐书单 · 7月新增（21 本，prepended 2026-06-30）=====
    {
      "title": "提分笔记",
      "rank": 1,
      "recommend_time": "7月",
      "isbn": "9787545490572"
    },
    {
      "title": "刘晓艳高考英语",
      "rank": 2,
      "recommend_time": "7月",
      "isbn": "9787577110967"
    },
    {
      "title": "初中学霸手账",
      "rank": 3,
      "recommend_time": "7月",
      "isbn": "9787533090739"
    },
    {
      "title": "学之舟 小学生知识通",
      "rank": 4,
      "recommend_time": "7月",
      "isbn": "9787576231564"
    },
    {
      "title": "秒记初中小四门",
      "rank": 5,
      "recommend_time": "7月",
      "isbn": "9787511040657"
    },
    {
      "title": "妙解数理化",
      "rank": 6,
      "recommend_time": "7月",
      "isbn": "9787572448317"
    },
    {
      "title": "预备新高一",
      "rank": 7,
      "recommend_time": "7月",
      "isbn": "9787572453038"
    },
    {
      "title": "语法提前学+双拼速记",
      "rank": 8,
      "recommend_time": "7月",
      "isbn": "9787575400817"
    },
    {
      "title": "名师教你读名著",
      "rank": 9,
      "recommend_time": "7月",
      "isbn": "9787107384059"
    },
    {
      "title": "考点笔记一本全",
      "rank": 10,
      "recommend_time": "7月",
      "isbn": "9787569962369"
    },
    {
      "title": "作文金句1000例",
      "rank": 11,
      "recommend_time": "7月",
      "isbn": "9787807735816"
    },
    {
      "title": "成大事者 我命由我不由天",
      "rank": 12,
      "recommend_time": "7月",
      "isbn": "9787502086572"
    },
    {
      "title": "【读者】每个人的傍晚都住着故乡的晚霞+【读者】人生只是路过 没有不可放下",
      "rank": 13,
      "recommend_time": "7月",
      "isbn": "9787552708486"
    },
    {
      "title": "课堂笔记",
      "rank": 14,
      "recommend_time": "7月",
      "isbn": "9787511076496"
    },
    {
      "title": "上下册语文数学英语书课本教材",
      "rank": 15,
      "recommend_time": "7月",
      "isbn": "9787518720187"
    },
    {
      "title": "暑假计算",
      "rank": 16,
      "recommend_time": "7月",
      "isbn": "9787556891740"
    },
    {
      "title": "小学语文同步字帖",
      "rank": 17,
      "recommend_time": "7月",
      "isbn": "9787556883066"
    },
    {
      "title": "初中名著导读考点精炼",
      "rank": 18,
      "recommend_time": "7月",
      "isbn": "9787574708549"
    },
    {
      "title": "画图法解应用题",
      "rank": 19,
      "recommend_time": "7月",
      "isbn": "9787548961833"
    },
    {
      "title": "神奇小纸条课课贴",
      "rank": 20,
      "recommend_time": "7月",
      "isbn": "9787580104069"
    },
    {
      "title": "暑期衔接一本通",
      "rank": 21,
      "recommend_time": "7月",
      "isbn": "9787564968205"
    },
    {
      "title": "这才是我要的大学+这才是我要的专业",
      "rank": 1,
      "image": "book-images/recbook_predict_教辅_1.jpg",
      "recommend_time": "6月",
      "isbn": "1191990663105"
    },
    {
      "title": "趣味速记.初中数理化一本全",
      "rank": 2,
      "publisher": "青岛出版社",
      "image": "book-images/recbook_predict_教辅_2.jpg",
      "recommend_time": "6月",
      "isbn": "9787573634375"
    },
    {
      "title": "涂重点预备新三年级英语",
      "rank": 3,
      "publisher": "吉林教育出版社",
      "image": "book-images/recbook_predict_教辅_3.jpg",
      "recommend_time": "6月",
      "isbn": "9787573440570"
    },
    {
      "title": "作文金句小纸条",
      "rank": 4,
      "publisher": "台海出版社",
      "image": "book-images/recbook_predict_教辅_4.jpg",
      "recommend_time": "6月",
      "isbn": "9787516842317"
    },
    {
      "title": "小学教材帮",
      "rank": 5,
      "publisher": "南京师范大学出版社",
      "image": "book-images/recbook_predict_教辅_5.jpg",
      "recommend_time": "6月",
      "isbn": "9787565169922"
    },
    {
      "title": "暑期42天打规划",
      "rank": 6,
      "publisher": "江西人民出版社",
      "image": "book-images/recbook_predict_教辅_6.jpg",
      "recommend_time": "6月",
      "isbn": "9787210164036"
    },
    {
      "title": "看图说话幼小衔接",
      "rank": 7,
      "publisher": "黑龙江美术出版社",
      "image": "book-images/recbook_predict_教辅_7.jpg",
      "recommend_time": "6月",
      "isbn": "9787575509954"
    },
    {
      "title": "预习新初一",
      "rank": 8,
      "publisher": "东北师范大学出版社",
      "image": "book-images/recbook_predict_教辅_8.jpg",
      "recommend_time": "6月",
      "isbn": "9787577123950"
    },
    {
      "title": "学霸速记",
      "rank": 9,
      "publisher": "湖南师范大学出版社",
      "image": "book-images/recbook_predict_教辅_9.jpg",
      "recommend_time": "6月",
      "isbn": "9787564831752"
    },
    {
      "title": "新版随堂笔记下册",
      "rank": 10,
      "publisher": "新疆生产建设兵团出版社",
      "image": "book-images/recbook_predict_教辅_10.jpg",
      "recommend_time": "6月",
      "isbn": "9787557420406"
    },
    {
      "title": "高中预习视频课",
      "rank": 11,
      "publisher": "漓江出版社",
      "image": "book-images/recbook_predict_教辅_11.jpg",
      "recommend_time": "6月",
      "isbn": "9787580108395"
    },
    {
      "title": "文言文古诗词漫画笔记",
      "rank": 12,
      "image": "book-images/recbook_predict_教辅_12.jpg",
      "recommend_time": "6月",
      "isbn": "9787575411578"
    },
    {
      "title": "初中提分笔记",
      "rank": 13,
      "author": "峰阅教研组",
      "publisher": "浙江大学出版社",
      "image": "book-images/recbook_predict_教辅_13.jpg",
      "recommend_time": "6月",
      "isbn": "9787308257770"
    },
    {
      "title": "不一样的九九乘除法",
      "rank": 14,
      "author": "徐志兴",
      "publisher": "北京日报出版社",
      "image": "book-images/recbook_predict_教辅_14.jpg",
      "recommend_time": "6月",
      "isbn": "9787547752500"
    },
    {
      "title": "作文与素材",
      "rank": 15,
      "author": "峰阅教研组",
      "publisher": "山东大学出版社",
      "image": "book-images/recbook_predict_教辅_15.jpg",
      "recommend_time": "6月",
      "isbn": "9787557033453"
    },
    {
      "title": "初中秒解数理化",
      "rank": 16,
      "author": "刘大勇",
      "publisher": "延边教育出版社",
      "image": "book-images/recbook_predict_教辅_16.jpg",
      "recommend_time": "6月",
      "isbn": "9787572448317"
    },
    {
      "title": "漫画趣味数理化启蒙",
      "rank": 17,
      "publisher": "广东旅游出版社",
      "image": "book-images/recbook_predict_教辅_17.jpg",
      "recommend_time": "6月",
      "isbn": "9787570538577"
    },
    {
      "title": "小学同步作文练字贴",
      "rank": 18,
      "publisher": "陕西人民美术出版社",
      "image": "book-images/recbook_predict_教辅_18.jpg",
      "recommend_time": "6月",
      "isbn": "9787536843929"
    },
    {
      "title": "背记清单.初中历史",
      "rank": 19,
      "author": "徐春龙",
      "publisher": "北京时代华文书局",
      "image": "book-images/recbook_predict_教辅_19.jpg",
      "recommend_time": "6月",
      "isbn": "9787569958454"
    },
    {
      "title": "语数英人教版教材",
      "rank": 20,
      "publisher": "人民教育出版社",
      "image": "book-images/recbook_predict_教辅_20.jpg",
      "recommend_time": "6月",
      "isbn": "9787107397547"
    },
    {
      "title": "新课堂笔记",
      "rank": 21,
      "publisher": "青岛出版社",
      "image": "book-images/recbook_predict_教辅_21.jpg",
      "recommend_time": "6月",
      "isbn": "9787573633507"
    },
    {
      "title": "暑假一本通",
      "rank": 22,
      "image": "book-images/recbook_predict_教辅_22.jpg",
      "recommend_time": "6月",
      "isbn": "9787521511604"
    },
    {
      "title": "暑假42天预习规划",
      "rank": 23,
      "image": "book-images/recbook_predict_教辅_23.jpg",
      "recommend_time": "6月",
      "isbn": "9787210169253"
    },
    {
      "title": "【暑假预复习一本通】语数英三科合一",
      "rank": 24,
      "image": "book-images/recbook_predict_教辅_24.jpg",
      "recommend_time": "6月",
      "isbn": "9787572452727"
    },
    {
      "title": "漫画中华文化1000问",
      "rank": 25,
      "image": "book-images/recbook_predict_教辅_25.jpg",
      "recommend_time": "6月",
      "isbn": "9787553699424"
    },
    {
      "title": "小学暑假衔接 语数英预复习一本通",
      "rank": 26,
      "image": "book-images/recbook_predict_教辅_26.jpg",
      "recommend_time": "6月",
      "isbn": "9787571627850"
    },
    {
      "title": "中国文化1000问",
      "rank": 27,
      "image": "book-images/recbook_predict_教辅_27.jpg",
      "recommend_time": "6月",
      "isbn": "9787201204222"
    },
    {
      "title": "高中文言文",
      "rank": 28,
      "image": "book-images/recbook_predict_教辅_28.jpg",
      "recommend_time": "6月",
      "isbn": "9787553981444"
    },
    {
      "title": "预备一年级",
      "rank": 29,
      "image": "book-images/recbook_predict_教辅_29.jpg",
      "recommend_time": "6月",
      "isbn": "9787210162964"
    },
    {
      "title": "预备新初一",
      "rank": 30,
      "image": "book-images/recbook_predict_教辅_30.jpg",
      "recommend_time": "6月",
      "isbn": "9787553980683"
    },
    {
      "title": "幼小衔接语数拼音口算应用题专项训练",
      "rank": 31,
      "image": "book-images/recbook_predict_教辅_31.jpg",
      "recommend_time": "6月",
      "isbn": "9787556880201"
    },
    {
      "title": "文言文导读之古文观止篇+康辉咬文嚼字",
      "rank": 32,
      "image": "book-images/recbook_predict_教辅_32.jpg",
      "recommend_time": "6月",
      "isbn": "9787523705803"
    },
    {
      "title": "秒记初中一本通",
      "rank": 33,
      "image": "book-images/recbook_predict_教辅_33.jpg",
      "recommend_time": "6月",
      "isbn": "9787540896232"
    },
    {
      "title": "这就是数学小学数学漫画启蒙",
      "rank": 34,
      "image": "book-images/recbook_predict_教辅_34.jpg",
      "recommend_time": "6月",
      "isbn": "9787116122215"
    },
    {
      "title": "读者35周年美文珍藏版",
      "rank": 35,
      "image": "book-images/recbook_predict_教辅_35.jpg",
      "recommend_time": "6月",
      "isbn": "9787542247230"
    },
    {
      "title": "大语文素材词典",
      "rank": 36,
      "image": "book-images/recbook_predict_教辅_36.jpg",
      "recommend_time": "6月",
      "isbn": "9787553992426"
    },
    {
      "title": "漫画论语+趣味大百科",
      "rank": 37,
      "image": "book-images/recbook_predict_教辅_37.jpg",
      "recommend_time": "6月",
      "isbn": "9787573908780"
    },
    {
      "title": "小初高必备文学文化常识",
      "rank": 38,
      "image": "book-images/recbook_predict_教辅_38.jpg",
      "recommend_time": "6月",
      "isbn": "9787553998138"
    },
    {
      "title": "高考核心考点专项突破",
      "rank": 39,
      "image": "book-images/recbook_predict_教辅_39.jpg",
      "recommend_time": "6月",
      "isbn": "9787201186801"
    },
    {
      "title": "高中思维知识大盘点",
      "rank": 40,
      "image": "book-images/recbook_predict_教辅_40.jpg",
      "recommend_time": "6月",
      "isbn": "9787548959014"
    }
  ],
  "社科推荐书单": [
    // ===== 社科推荐书单 · 7月新增（15 本，prepended 2026-06-30）=====
    {
      "title": "国学经典精粹10册",
      "rank": 1,
      "recommend_time": "7月",
      "isbn": "9787516909249"
    },
    {
      "title": "回话高手+高情商幽默接话",
      "rank": 2,
      "recommend_time": "7月",
      "isbn": "9787558157851"
    },
    {
      "title": "接话破冰+对答如流",
      "rank": 3,
      "recommend_time": "7月",
      "isbn": "9787559624086"
    },
    {
      "title": "红岩+红星照耀中国",
      "rank": 4,
      "recommend_time": "7月",
      "isbn": "9787540256623"
    },
    {
      "title": "渔樵问对",
      "rank": 5,
      "recommend_time": "7月",
      "isbn": "9787201219561"
    },
    {
      "title": "寒门诡将",
      "rank": 6,
      "recommend_time": "7月",
      "isbn": "9787512519336"
    },
    {
      "title": "负债翻盘",
      "rank": 7,
      "recommend_time": "7月",
      "isbn": "9787531769910"
    },
    {
      "title": "潮汕思维+运筹帷幄",
      "rank": 8,
      "recommend_time": "7月",
      "isbn": "9787531769910"
    },
    {
      "title": "乡土中国",
      "rank": 9,
      "recommend_time": "7月",
      "isbn": "9787555286240"
    },
    {
      "title": "高手接话",
      "rank": 10,
      "recommend_time": "7月",
      "isbn": "9787519310240"
    },
    {
      "title": "幽默接话",
      "rank": 11,
      "recommend_time": "7月",
      "isbn": "9787515843100"
    },
    {
      "title": "国学知识+人文知识",
      "rank": 12,
      "recommend_time": "7月",
      "isbn": "978751803440602"
    },
    {
      "title": "开口即成交",
      "rank": 13,
      "recommend_time": "7月",
      "isbn": "9787547753248"
    },
    {
      "title": "年入百万",
      "rank": 14,
      "recommend_time": "7月",
      "isbn": "978751137924505"
    },
    {
      "title": "天机+成事在谋",
      "rank": 15,
      "recommend_time": "7月",
      "isbn": "9787560395661"
    },
    {
      "title": "乡土中国",
      "rank": 1,
      "publisher": "中国文联出版社",
      "image": "book-images/recbook_predict_社科_1.jpg",
      "recommend_time": "6月",
      "isbn": "9787555286240"
    },
    {
      "title": "懂比爱更重要",
      "rank": 2,
      "image": "book-images/recbook_predict_社科_2.jpg",
      "recommend_time": "6月",
      "isbn": "9787558760297"
    },
    {
      "title": "漫画天机+阳谋",
      "rank": 3,
      "image": "book-images/recbook_predict_社科_3.jpg",
      "recommend_time": "6月",
      "isbn": "9787548483250"
    },
    {
      "title": "寒门诡将",
      "rank": 4,
      "image": "book-images/recbook_predict_社科_4.jpg",
      "recommend_time": "6月",
      "isbn": "9787512519336"
    },
    {
      "title": "泥潭",
      "rank": 5,
      "image": "book-images/recbook_predict_社科_5.jpg",
      "recommend_time": "6月",
      "isbn": "9787580104199"
    },
    {
      "title": "温柔教养+父母的语言+自驱型成长",
      "rank": 6,
      "image": "book-images/recbook_predict_社科_6.jpg",
      "recommend_time": "6月",
      "isbn": "9787513938822"
    },
    {
      "title": "男孩/女孩你该如何保护自己",
      "rank": 7,
      "image": "book-images/recbook_predict_社科_7.jpg",
      "recommend_time": "6月",
      "isbn": "9787516524831"
    },
    {
      "title": "公司控制权与股权布局",
      "rank": 8,
      "image": "book-images/recbook_predict_社科_8.jpg",
      "recommend_time": "6月",
      "isbn": "9787518098095"
    },
    {
      "title": "零基础玩转OpenClaw",
      "rank": 9,
      "author": "向安玲  张诗瑶   张亚男",
      "publisher": "中信出版社",
      "image": "book-images/recbook_predict_社科_9.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521739282"
    },
    {
      "title": "AI中国方案",
      "rank": 10,
      "author": "薛澜",
      "publisher": "中信出版集团",
      "image": "book-images/recbook_predict_社科_10.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521779813"
    },
    {
      "title": "AI训练师手册",
      "rank": 11,
      "author": "谷建阳",
      "publisher": "北京大学出版社",
      "image": "book-images/recbook_predict_社科_11.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787301351925"
    },
    {
      "title": "养龙虾OpenClaw与AI智能体时代",
      "rank": 12,
      "author": "杜雨",
      "publisher": "中译出版社",
      "image": "book-images/recbook_predict_社科_12.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787500186021"
    },
    {
      "title": "deepseek+AI炒股一本通",
      "rank": 13,
      "author": "恒盛杰资讯",
      "publisher": "北京理工大学出版社",
      "image": "book-images/recbook_predict_社科_13.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787576352795"
    },
    {
      "title": "Agent设计模式",
      "rank": 14,
      "author": "黄佳",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_predict_社科_14.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787115690470"
    },
    {
      "title": "AI未来进行式:李开复陈楸帆新书",
      "rank": 15,
      "author": "李开复;陈楸帆",
      "publisher": "浙江人民出版社",
      "image": "book-images/recbook_predict_社科_15.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787213101625"
    },
    {
      "title": "扣子开发AIAgent智能体应用(人工智能技术从书)",
      "rank": 16,
      "author": "宋立桓，王东健，陈铭毅，程东升",
      "publisher": "清华大学出版社",
      "image": "book-images/recbook_predict_社科_16.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787302692188"
    },
    {
      "title": "智能涌现:AI时代的思考与探索",
      "rank": 17,
      "author": "张亚勤",
      "publisher": "中信出版社。",
      "image": "book-images/recbook_predict_社科_17.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521774412"
    },
    {
      "title": "OpenClaw AI助理一本通",
      "rank": 18,
      "author": "刘宸 龙汀汀 王啸啸",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_predict_社科_18.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787122503312"
    },
    {
      "title": "手把手教你养“龙虾”从零开始驾驭OpenClaw",
      "rank": 19,
      "author": "丁俊松",
      "publisher": "山西科学技术出版社",
      "image": "book-images/recbook_predict_社科_19.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787516932391"
    },
    {
      "title": "玩爆你的龙虾  最强 OpenClaw",
      "rank": 20,
      "author": "胡嘉玺",
      "image": "book-images/recbook_predict_社科_20.jpg",
      "ams_status": "需补充进口备案文号",
      "recommend_time": "Q1",
      "isbn": "9786267889022"
    },
    {
      "title": "AI掘金",
      "rank": 21,
      "author": "千海",
      "publisher": "中国纺织出版社有限公司",
      "image": "book-images/recbook_predict_社科_21.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787522935324"
    },
    {
      "title": "豆包AI创富手册",
      "rank": 22,
      "author": "云岫",
      "publisher": "北方妇女儿童出版社",
      "image": "book-images/recbook_predict_社科_22.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787581301139"
    },
    {
      "title": "AI赚钱攻略",
      "rank": 23,
      "author": "千赋AI-老曹，九度",
      "publisher": "北京日报出版社",
      "image": "book-images/recbook_predict_社科_23.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787547752807"
    },
    {
      "title": "成为AI高手：人人都能上手的智能体实战指南",
      "rank": 24,
      "author": "唐舰长",
      "publisher": "电子工业出版社",
      "image": "book-images/recbook_predict_社科_24.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787121513848"
    },
    {
      "title": "豆包AI赚钱手册",
      "rank": 25,
      "author": "秋叶",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_predict_社科_25.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787115691842"
    },
    {
      "title": "豆包高效办公:AI10倍提升工作效率的方法与技巧",
      "rank": 26,
      "author": "沈亲淦;云中江树;蓝衣剑客",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_predict_社科_26.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787111777021"
    },
    {
      "title": "用扣子（Coze）搭建AI Agent （零基础，实战版）――给普通人的智能体入门书",
      "rank": 27,
      "author": "罗健",
      "publisher": "电子工业出版社",
      "image": "book-images/recbook_predict_社科_27.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787121513077"
    },
    {
      "title": "富爸爸穷爸爸(新版)",
      "rank": 28,
      "author": "(美)罗伯特·清崎  译者:萧明",
      "publisher": "四川人民出版社",
      "image": "book-images/recbook_predict_社科_28.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787220114045"
    },
    {
      "title": "给孩子的人工智能",
      "rank": 29,
      "author": "陈智涛，存一",
      "publisher": "台海出版社",
      "image": "book-images/recbook_predict_社科_29.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787516841624"
    },
    {
      "title": "智能简史：进化、AI与人脑的突破",
      "rank": 30,
      "author": "[美]麦克斯·班尼特(Max Bennett)  译者:林桥津",
      "publisher": "中译出版社",
      "image": "book-images/recbook_predict_社科_30.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787500181699"
    },
    {
      "title": "DeepSeek从入门到精通",
      "rank": 31,
      "author": "徐昕张",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_社科_31.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787301361504"
    },
    {
      "title": "漫画AI",
      "rank": 32,
      "author": "师鲁贝尔",
      "publisher": "百花洲文艺出版社",
      "image": "book-images/recbook_predict_社科_32.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787550056589"
    },
    {
      "title": "AI工程大模型应用开发实战",
      "rank": 33,
      "author": "[越]奇普·萱(ChipHuyen)  译者:宝玉",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_predict_社科_33.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787115686398"
    },
    {
      "title": "智人之上一一从石器时代到AI时代的信息网络简史",
      "rank": 34,
      "author": "[以]尤瓦尔·赫拉利  译者:林俊宏",
      "publisher": "中信出版集团",
      "image": "book-images/recbook_predict_社科_34.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521768527"
    },
    {
      "title": "豆包AI赚钱手册",
      "rank": 35,
      "author": "秋叶",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_predict_社科_35.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787115691842"
    },
    {
      "title": "一人公司:AI时代赚钱新方向",
      "rank": 36,
      "author": "究慈",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_社科_36.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787513951944"
    },
    {
      "title": "AI提效手册",
      "rank": 37,
      "author": "秋叶  ，刘晓阳",
      "publisher": "人民邮电出版社",
      "image": "book-images/recbook_predict_社科_37.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787807741053"
    },
    {
      "title": "用ai赚钱",
      "rank": 38,
      "author": "芙朗",
      "publisher": "江苏凤凰文艺出版社",
      "image": "book-images/recbook_predict_社科_38.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787559499158"
    },
    {
      "title": "豆包高效办公",
      "rank": 39,
      "author": "沈亲淦,云中江树,蓝衣剑客",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_predict_社科_39.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787111777021"
    },
    {
      "title": "玩“赚”AI",
      "rank": 40,
      "author": "老曹，赵亦初",
      "publisher": "北京日报出版社",
      "image": "book-images/recbook_predict_社科_40.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787547753835"
    },
    {
      "title": "快速玩转DeepSeek 7天从新手到高手",
      "rank": 41,
      "author": "焦海利",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_社科_41.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513949507"
    },
    {
      "title": "用AI赚钱 普通人的新财库",
      "rank": 42,
      "author": "林开平，马新",
      "publisher": "中国画报出版社",
      "image": "book-images/recbook_predict_社科_42.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787521015775"
    },
    {
      "title": "AI+抖音",
      "rank": 43,
      "author": "梦联",
      "publisher": "中国摄影出版社",
      "image": "book-images/recbook_predict_社科_43.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787522933122"
    },
    {
      "title": "从0到1用AI赚钱",
      "rank": 44,
      "author": "高效笑笑",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_社科_44.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513948944"
    },
    {
      "title": "豆包AI时代创富",
      "rank": 45,
      "author": "李天舒",
      "publisher": "电子工业出版社",
      "image": "book-images/recbook_predict_社科_45.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1"
    },
    {
      "title": "零基础玩转AI赚钱36招",
      "rank": 46,
      "author": "陈光锋",
      "publisher": "团结出版社",
      "image": "book-images/recbook_predict_社科_46.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787523423110"
    },
    {
      "title": "DeepSeek实用操作指南书",
      "rank": 47,
      "author": "焦海利",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_社科_47.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513949163"
    },
    {
      "title": "StatQuest 图解机器学习（全彩）",
      "rank": 48,
      "publisher": "电子工业出版社",
      "image": "book-images/recbook_predict_社科_48.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787121497643"
    },
    {
      "title": "人工智能",
      "rank": 49,
      "author": "师鲁贝尔",
      "publisher": "百花洲文艺出版社",
      "image": "book-images/recbook_predict_社科_49.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787302686750"
    },
    {
      "title": "AI职场神器：高效办公实战手册",
      "rank": 50,
      "author": "海川",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_predict_社科_50.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787122491954"
    },
    {
      "title": "零基础DeepSeek从入门到精通",
      "rank": 51,
      "author": "民辰",
      "publisher": "中國西報土版社",
      "image": "book-images/recbook_predict_社科_51.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787558593697"
    },
    {
      "title": "人人都能学AI",
      "rank": 52,
      "author": "左歌,罗杰,庄肃常",
      "publisher": "北方妇女儿童出版社",
      "image": "book-images/recbook_predict_社科_52.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787558593697"
    },
    {
      "title": "用ai赚钱",
      "rank": 53,
      "author": "芙朗",
      "publisher": "江苏凤凰文艺出版社",
      "image": "book-images/recbook_predict_社科_53.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787559499158"
    },
    {
      "title": "豆包AI时代创富",
      "rank": 54,
      "author": "李天舒",
      "publisher": "电子工业出版社",
      "image": "book-images/recbook_predict_社科_54.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1"
    },
    {
      "title": "小学生秒懂新科技和AI人工智能",
      "rank": 55,
      "author": "催钟雷",
      "publisher": "吉林美术出版社",
      "image": "book-images/recbook_predict_社科_55.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787557597870"
    },
    {
      "title": "从0到1用AI赚钱",
      "rank": 56,
      "author": "高效笑笑",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_社科_56.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513948944"
    },
    {
      "title": "豆包AI赚钱手册",
      "rank": 57,
      "author": "秋叶",
      "publisher": "人民邮电出版社有限公司",
      "image": "book-images/recbook_predict_社科_57.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1",
      "isbn": "9787115691842"
    },
    {
      "title": "豆包从入门到精通",
      "rank": 58,
      "author": "苏小文  ， 乔剑",
      "publisher": "机械工业出版社",
      "image": "book-images/recbook_predict_社科_58.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "recommend_time": "Q1"
    },
    {
      "title": "DeepSeek实用操作指南书",
      "rank": 59,
      "author": "焦海利",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_社科_59.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787513949163"
    },
    {
      "title": "一人公司:AI时代赚钱新方向",
      "rank": 60,
      "author": "究慈",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_社科_60.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787513951944"
    },
    {
      "title": "AI时代安全导航",
      "rank": 61,
      "author": "佟丽华",
      "publisher": "中国少年儿童出版社",
      "image": "book-images/recbook_predict_社科_61.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787524801467"
    },
    {
      "title": "DeepSeek实用操作指南",
      "rank": 62,
      "author": "李尚龙",
      "publisher": "台海出版社",
      "image": "book-images/recbook_predict_社科_62.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "recommend_time": "Q1",
      "isbn": "9787301361504"
    },
    {
      "title": "懒商：AI赋能下的财富密码",
      "rank": 63,
      "author": "冯慧娟",
      "publisher": "华文出版社",
      "image": "book-images/recbook_predict_社科_63.jpg",
      "ams_status": "全流量可投",
      "recommend_time": "Q1",
      "isbn": "9787507563351"
    }
  ],
  "健康推荐书单": [
    // ===== 健康推荐书单 · 7月新增（9 本，prepended 2026-06-30）=====
    {
      "title": "最爱吃的家常菜",
      "rank": 1,
      "recommend_time": "7月",
      "isbn": "9787543689831"
    },
    {
      "title": "二十四节气养生药茶",
      "rank": 2,
      "recommend_time": "7月",
      "isbn": "9787515224536"
    },
    {
      "title": "美食课（夏季版）",
      "rank": 3,
      "recommend_time": "7月",
      "isbn": "9787535979828"
    },
    {
      "title": "舌尖上的中国",
      "rank": 4,
      "recommend_time": "7月",
      "isbn": "9787511371898"
    },
    {
      "title": "百吃不厌的能量果蔬汁",
      "rank": 5,
      "recommend_time": "7月",
      "isbn": "9787543682078"
    },
    {
      "title": "养生豆浆米糊果蔬汁一本全",
      "rank": 6,
      "recommend_time": "7月",
      "isbn": "9787229060718"
    },
    {
      "title": "四季蒸菜",
      "rank": 7,
      "recommend_time": "7月",
      "isbn": "9787571902742"
    },
    {
      "title": "精选家常菜",
      "rank": 8,
      "recommend_time": "7月",
      "isbn": "9787518424412"
    },
    {
      "title": "阳台种菜种花种香草",
      "rank": 9,
      "recommend_time": "7月",
      "isbn": "9787550258433"
    },
    {
      "title": "祛湿三步走：疏肝健脾养肾",
      "rank": 1,
      "author": "许庆友",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_健康_1.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2",
      "isbn": "9787513946247"
    },
    {
      "title": "二十四节气养生药茶",
      "rank": 2,
      "author": "王晨",
      "publisher": "中医古籍出版社",
      "image": "book-images/recbook_predict_健康_2.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787515224536"
    },
    {
      "title": "清热解毒：夏季热病调养方",
      "rank": 3,
      "author": "谢克友",
      "publisher": "华龄出版社",
      "image": "book-images/recbook_predict_健康_3.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2",
      "isbn": "9787516926875"
    },
    {
      "title": "本草一味祛心火",
      "rank": 4,
      "author": "余瀛鳌、陈思燕",
      "publisher": "中国中医药出版社",
      "image": "book-images/recbook_predict_健康_4.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2",
      "isbn": "9787513267894"
    },
    {
      "title": "美食课（夏季版）",
      "rank": 5,
      "author": "徐文兵",
      "publisher": "广东科技出版社",
      "image": "book-images/recbook_predict_健康_5.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787535979828"
    },
    {
      "title": "祛寒湿热瘀无毒一身轻",
      "rank": 6,
      "author": "汉竹",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_predict_健康_6.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "舌尖上的中国",
      "rank": 7,
      "author": "陈志田",
      "publisher": "中国华侨出版社",
      "image": "book-images/recbook_predict_健康_7.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787511371898"
    },
    {
      "title": "百吃不厌的能量果蔬汁",
      "rank": 8,
      "publisher": "青岛出版社",
      "image": "book-images/recbook_predict_健康_8.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787543682078"
    },
    {
      "title": "百病一方灵",
      "rank": 9,
      "author": "刘文华、贾冬",
      "publisher": "辽宁科学技术出版社",
      "image": "book-images/recbook_predict_健康_9.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2",
      "isbn": "9787538170153"
    },
    {
      "title": "全身穴位一找就准",
      "rank": 10,
      "author": "姜庆荣",
      "publisher": "四川科学技术出版社",
      "image": "book-images/recbook_predict_健康_10.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787572713576"
    },
    {
      "title": "千古甄选遗方",
      "rank": 11,
      "publisher": "吉林科学技术出版社",
      "image": "book-images/recbook_predict_健康_11.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2",
      "isbn": "9787574428812"
    },
    {
      "title": "养生豆浆米糊果蔬汁一本全",
      "rank": 12,
      "author": "万平",
      "publisher": "重庆出版社",
      "image": "book-images/recbook_predict_健康_12.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787229060718"
    },
    {
      "title": "1500种中草药野外识别彩色图鉴",
      "rank": 13,
      "author": "岳桂华，王柳萍，杨高华",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_predict_健康_13.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787122302977"
    },
    {
      "title": "四季蒸菜",
      "rank": 14,
      "author": "余静,编",
      "publisher": "黑龙江科学技术出版社",
      "image": "book-images/recbook_predict_健康_14.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787571902742"
    },
    {
      "title": "零基础学中医",
      "rank": 15,
      "author": "马可迅",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_predict_健康_15.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2",
      "isbn": "9787571324261"
    },
    {
      "title": "老年人饮食营养一本通",
      "rank": 16,
      "author": "刘英华 徐庆",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_predict_健康_16.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787122351098"
    },
    {
      "title": "中老年人必知的365个养生法",
      "rank": 17,
      "author": "李柏",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_predict_健康_17.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787122250087"
    },
    {
      "title": "吃土:强健肠道、提升免疫的整体健康革命",
      "rank": 18,
      "author": "(美)乔希·阿克斯  译者:王凌波;魏宁",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_predict_健康_18.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787559611680"
    },
    {
      "title": "精选家常菜",
      "rank": 19,
      "author": "高杰",
      "publisher": "中国轻工业出版社",
      "image": "book-images/recbook_predict_健康_19.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787518424412"
    },
    {
      "title": "中草药全图鉴",
      "rank": 20,
      "author": "温玉波，李海涛",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_predict_健康_20.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787553742601"
    },
    {
      "title": "阳台种菜种花种香草",
      "rank": 21,
      "author": "白虹",
      "publisher": "北京联合出版公司",
      "image": "book-images/recbook_predict_健康_21.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787550258433"
    },
    {
      "title": "零基础学养花",
      "rank": 22,
      "author": "王意成",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_predict_健康_22.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787571321727"
    },
    {
      "title": "四书五经 精装",
      "rank": 23,
      "publisher": "辽海出版社",
      "image": "book-images/recbook_predict_健康_23.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787545136852"
    },
    {
      "title": "怀孕一天一页",
      "rank": 24,
      "author": "马良坤",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_predict_健康_24.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787553785622"
    },
    {
      "title": "老子道德经解-禅解儒道丛书",
      "rank": 25,
      "publisher": "崇文书局",
      "image": "book-images/recbook_predict_健康_25.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787540340018"
    },
    {
      "title": "吕祖秘注道德经心传",
      "rank": 26,
      "publisher": "华龄出版社",
      "image": "book-images/recbook_predict_健康_26.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787516929339"
    },
    {
      "title": "孝经诵读本",
      "rank": 27,
      "publisher": "文华出版社",
      "image": "book-images/recbook_predict_健康_27.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2",
      "isbn": "9787507560046"
    },
    {
      "title": "空腹力",
      "rank": 28,
      "author": "（日）石原结实   译者:安忆",
      "publisher": "天津科学技术出版社",
      "image": "book-images/recbook_predict_健康_28.jpg",
      "ams_status": "减肥类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "漫画讲透黄帝内经",
      "rank": 29,
      "author": "张嘉铭 王婧",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_predict_健康_29.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "身体重置",
      "rank": 30,
      "author": "[美]斯蒂芬·佩内里   海蒂·斯科尔尼克  译者: 余茗雯",
      "publisher": "中译出版社",
      "image": "book-images/recbook_predict_健康_30.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "控糖革命",
      "rank": 31,
      "author": "(法)杰西·安佐斯佩   译者:张艳娟",
      "publisher": "浙江科学技术出版社",
      "image": "book-images/recbook_predict_健康_31.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "《本草纲目》节气养生年历",
      "rank": 32,
      "author": "蔡志忠 周学林",
      "publisher": "天津科学技术出版社",
      "image": "book-images/recbook_predict_健康_32.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "空腹的神奇自愈力",
      "rank": 33,
      "author": "(日)船濑俊介  译者:李萌",
      "publisher": "天津科学技术出版社",
      "image": "book-images/recbook_predict_健康_33.jpg",
      "ams_status": "减肥类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "预防衰老   从50岁开始",
      "rank": 34,
      "author": "(日)和田秀树  译者:王雯婷",
      "publisher": "东方出版社",
      "image": "book-images/recbook_predict_健康_34.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "救命!逆转和预防致命疾病的科学饮食",
      "rank": 35,
      "author": "(美)迈克尔·格雷格;(美)吉恩·斯通  译者:谢宜晖;张家绮",
      "publisher": "电子工业出版社",
      "image": "book-images/recbook_predict_健康_35.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "黄帝内经全集(全译图解版)",
      "rank": 36,
      "author": "肖建喜，紫图",
      "publisher": "吉林科学技术出版社",
      "image": "book-images/recbook_predict_健康_36.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "血糖控制一本就够",
      "rank": 37,
      "author": "李宁，李乃适",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_predict_健康_37.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "二十四节气健康吃法",
      "rank": 38,
      "author": "朱荣",
      "publisher": "中国织纺出版社",
      "image": "book-images/recbook_predict_健康_38.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "中医养身妙招",
      "rank": 39,
      "author": "解谢",
      "publisher": "新疆科学技术出版社",
      "image": "book-images/recbook_predict_健康_39.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "实用中草药图谱与手册应用",
      "rank": 40,
      "author": "胡贵荣",
      "publisher": "贵州科技出版社",
      "image": "book-images/recbook_predict_健康_40.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "性心理学",
      "rank": 41,
      "author": "霭理士 译者:  潘光旦",
      "publisher": "广东旅游出版社",
      "image": "book-images/recbook_predict_健康_41.jpg",
      "ams_status": "性相关书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "李少波真气运行法（第三3版）",
      "rank": 42,
      "author": "李少波   李天晓",
      "publisher": "中国中医药出版社",
      "image": "book-images/recbook_predict_健康_42.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "民间实用祖传秘方：彩图版",
      "rank": 43,
      "author": "郭号，周芳",
      "publisher": "天津科学技术出版社",
      "image": "book-images/recbook_predict_健康_43.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "漫画讲透黄帝内经",
      "rank": 44,
      "author": "张嘉铭 王婧",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_predict_健康_44.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "饮食术：减糖生活",
      "rank": 45,
      "author": "何银萍",
      "publisher": "吉林科学技术出版社",
      "image": "book-images/recbook_predict_健康_45.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "华佗妙方大全",
      "rank": 46,
      "author": "苑百松",
      "publisher": "黑龙江科学技术出版社",
      "image": "book-images/recbook_predict_健康_46.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "别让慢病找上你",
      "rank": 47,
      "author": "斯蒂芬 科佩基  译者:管秀兰  李杰",
      "publisher": "浙江科学技术出版社",
      "image": "book-images/recbook_predict_健康_47.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "徒手按摩治百病",
      "rank": 48,
      "author": "马寅中",
      "publisher": "中国织纺出版社",
      "image": "book-images/recbook_predict_健康_48.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2",
      "isbn": "4/15更新为不支持"
    },
    {
      "title": "保健小妙招",
      "rank": 49,
      "author": "宋兆普",
      "publisher": "河南科学技术出版社",
      "image": "book-images/recbook_predict_健康_49.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "黄帝内经",
      "rank": 50,
      "author": "李爱勇, 编著",
      "publisher": "民主与建设出版社",
      "image": "book-images/recbook_predict_健康_50.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "图解金氏五行升降",
      "rank": 51,
      "author": "金超杰",
      "publisher": "世界图书出版有限公司",
      "image": "book-images/recbook_predict_健康_51.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "特效中药方全集干货",
      "rank": 52,
      "author": "张玉苹   焦明耀",
      "publisher": "中国纺织出版社",
      "image": "book-images/recbook_predict_健康_52.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "梅花医案",
      "rank": 53,
      "author": "骆杰伟, 孟晓嵘, 黄昉萌, 编著",
      "publisher": "福建科学技术出版社",
      "image": "book-images/recbook_predict_健康_53.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "中国秘方全书(第3版)",
      "rank": 54,
      "author": "周洪范",
      "publisher": "科技文献出版社",
      "image": "book-images/recbook_predict_健康_54.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "腿脚有病看这本就够",
      "rank": 55,
      "author": "张威",
      "publisher": "天津科学技术出版社",
      "image": "book-images/recbook_predict_健康_55.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "保健小妙招",
      "rank": 56,
      "author": "宋兆普",
      "publisher": "河南科学技术出版社",
      "image": "book-images/recbook_predict_健康_56.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "刺血治病一本通",
      "rank": 57,
      "author": "刘柏林",
      "publisher": "国文出版社",
      "image": "book-images/recbook_predict_健康_57.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "中医养生食疗大全",
      "rank": 58,
      "author": "李素云",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_predict_健康_58.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "抗炎食物",
      "rank": 59,
      "author": "(美) 利兹·斯特雷特 (Lizzie Streit)  译者：董乐乐",
      "publisher": "科学技术文献出版社",
      "image": "book-images/recbook_predict_健康_59.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "《本草纲目》节气养生年历",
      "rank": 60,
      "author": "蔡志忠 周学林",
      "publisher": "天津科学技术出版社",
      "image": "book-images/recbook_predict_健康_60.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "黄帝内经",
      "rank": 61,
      "author": "马寅中",
      "publisher": "科学普及出版社",
      "image": "book-images/recbook_predict_健康_61.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "漫画讲透黄帝内经",
      "rank": 62,
      "author": "张嘉铭 王婧",
      "publisher": "化学工业出版社",
      "image": "book-images/recbook_predict_健康_62.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "智慧生活-3秒精准取穴",
      "rank": 63,
      "author": "李哲",
      "publisher": "中国科学技术出版社",
      "image": "book-images/recbook_predict_健康_63.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "调脾养肺小儿安",
      "rank": 64,
      "author": "陈秀珍",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/recbook_predict_健康_64.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    },
    {
      "title": "黄帝内经",
      "rank": 65,
      "author": "郭刚",
      "publisher": "岳麓书社",
      "image": "book-images/recbook_predict_健康_65.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "这书能让你戒烟",
      "rank": 66,
      "author": "[英]亚伦·卡尔(Allen Carr)   译者： 严冬冬",
      "publisher": "北京联合出版有限责任公司",
      "image": "book-images/recbook_predict_健康_66.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "recommend_time": "Q2"
    },
    {
      "title": "赤脚土方",
      "rank": 67,
      "author": "孔祥涛",
      "publisher": "辽宁科学技术出版社",
      "image": "book-images/recbook_predict_健康_67.jpg",
      "ams_status": "医疗类书籍禁止投放",
      "recommend_time": "Q2"
    }
  ]
};
