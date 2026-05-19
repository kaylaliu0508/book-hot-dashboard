// 推荐书单数据（含真实封面图，从 Excel 提取）
const RECOMMEND_BOOKS = {
  "童书推荐书单": [
    {
      "rank": 1,
      "title": "蛤蟆先生去看心理医生",
      "author": "罗伯特・戴博德（英）",
      "publisher": "北京联合出版公司",
      "image": "book-images/image1.jpg",
      "ams_status": "准入",
      "isbn": "9787559652070"
    },
    {
      "rank": 2,
      "title": "青春期情绪密码",
      "author": "丽莎・达穆尔（美）",
      "publisher": "湖南教育出版社",
      "image": "book-images/image2.jpg",
      "ams_status": "准入",
      "isbn": "9787575400978"
    },
    {
      "rank": 3,
      "title": "情绪低落，怎么办？—— 青少年应对抑郁情绪指南",
      "author": "杰奎琳・B. 托纳、克莱尔・A.B. 弗里兰（美）",
      "publisher": "化学工业出版社",
      "image": "book-images/image3.jpg",
      "ams_status": "准入",
      "isbn": "9787122322142"
    },
    {
      "rank": 4,
      "title": "做不暴躁的孩子（漫画版）",
      "author": "张琦",
      "publisher": "北方妇女儿童出版社",
      "image": "book-images/image4.jpg",
      "ams_status": "准入",
      "isbn": "9787558564587"
    },
    {
      "rank": 5,
      "title": "和情绪做朋友：6–12 岁情绪管理书",
      "author": "琳恩・莱昂斯（美）",
      "publisher": "中国轻工业出版社",
      "image": "book-images/image5.jpg",
      "ams_status": "准入",
      "isbn": "9787518439674"
    },
    {
      "rank": 6,
      "title": "自驱型成长：如何科学有效培养孩子的自律",
      "author": "威廉・斯蒂克斯鲁德、奈德・约翰逊（美）",
      "publisher": "北京联合出版公司",
      "image": "book-images/image6.jpg",
      "ams_status": "准入",
      "isbn": "9787559622561"
    },
    {
      "rank": 7,
      "title": "情绪急救：应对各种日常心理伤害的策略与方法",
      "author": "盖伊・温奇（美）",
      "publisher": "北京联合出版公司",
      "image": "book-images/image7.jpg",
      "ams_status": "准入",
      "isbn": "9787550254194"
    },
    {
      "rank": 8,
      "title": "了不起的我：自我发展的心理学",
      "author": "陈海贤",
      "publisher": "中信出版社",
      "image": "book-images/image8.jpg",
      "ams_status": "准入",
      "isbn": "9787508699675"
    },
    {
      "rank": 9,
      "title": "被讨厌的勇气",
      "author": "岸见一郎、古贺史健（日）",
      "publisher": "机械工业出版社",
      "image": "book-images/image9.jpg",
      "ams_status": "准入",
      "isbn": "9787111491605"
    },
    {
      "rank": 10,
      "title": "每一次不服输，都在改写命运",
      "author": "意林编辑部",
      "publisher": "吉林摄影出版社",
      "image": "book-images/image10.jpg",
      "ams_status": "准入",
      "isbn": "9787549848768"
    },
    {
      "rank": 11,
      "title": "写给青少年的心理自愈书",
      "author": "王萍",
      "publisher": "中国纺织出版社",
      "image": "book-images/image11.jpg",
      "ams_status": "准入",
      "isbn": "9787518083587"
    },
    {
      "rank": 12,
      "title": "我到底怎么了：青少年心理健康指南",
      "author": "奥利维亚・格雷（英）",
      "publisher": "北京联合出版公司",
      "image": "book-images/image12.jpg",
      "ams_status": "准入",
      "isbn": "9787559648646"
    },
    {
      "rank": 13,
      "title": "坦率地说：给青少年的心理手册",
      "author": "尼尔斯・英格曼、玛丽安娜・英格曼（挪威）",
      "publisher": "中信出版社",
      "image": "book-images/image13.jpg",
      "ams_status": "准入",
      "isbn": "9787521738940"
    },
    {
      "rank": 14,
      "title": "青少年正念：每天 10 分钟，让孩子更专注、更平和、更有韧性",
      "author": "珍妮・玛丽・巴蒂斯汀（美）",
      "publisher": "机械工业出版社",
      "image": "book-images/image14.jpg",
      "ams_status": "准入",
      "isbn": "9787111734599"
    },
    {
      "rank": 15,
      "title": "渡过：青少年抑郁康复家庭指南",
      "author": "张进、渡过团队",
      "publisher": "机械工业出版社",
      "image": "book-images/image15.jpg",
      "ams_status": "准入",
      "isbn": "9787111766323"
    },
    {
      "rank": 16,
      "title": "与青春期和解：如何解决青春期关键问题",
      "author": "凯文・莱曼（美）",
      "publisher": "人民邮电出版社",
      "image": "book-images/image16.jpg",
      "ams_status": "准入",
      "isbn": "9787115539648"
    },
    {
      "rank": 17,
      "title": "青春期心理学：青少年的成长、发展和面临的问题（原书第 14 版）",
      "author": "金・盖尔・多金（美）",
      "publisher": "机械工业出版社",
      "image": "book-images/image17.jpg",
      "ams_status": "准入",
      "isbn": "9787111689706"
    },
    {
      "rank": 18,
      "title": "男生，我大声对你说",
      "author": "毕淑敏",
      "publisher": "中国妇女出版社",
      "image": "book-images/image18.jpg",
      "ams_status": "准入",
      "isbn": "9787512713524"
    },
    {
      "rank": 19,
      "title": "女生，我悄悄对你说",
      "author": "毕淑敏",
      "publisher": "中国妇女出版社",
      "image": "book-images/image19.jpg",
      "ams_status": "准入",
      "isbn": "9787512713531"
    },
    {
      "rank": 20,
      "title": "青春期不烦恼：给孩子的心理成长手册（漫画版）",
      "author": "李付沐瞳、奚铭霞",
      "publisher": "人民邮电出版社",
      "image": "book-images/image20.jpg",
      "ams_status": "准入",
      "isbn": "9787115650481"
    },
    {
      "rank": 21,
      "title": "我的情绪小怪兽",
      "author": "文·图/[西班牙]安娜·耶纳斯译/叶淑吟",
      "publisher": "四川少年儿童出版社",
      "image": "book-images/image21.jpg",
      "ams_status": "准入",
      "isbn": "9787572808470"
    },
    {
      "rank": 22,
      "title": "大中华寻宝系列",
      "author": "孙家裕",
      "publisher": "二十一世纪出版社集团",
      "image": "book-images/image22.jpg",
      "ams_status": "准入",
      "isbn": "9787556869817"
    },
    {
      "rank": 23,
      "title": "十万个为什么",
      "author": "十万个为什么编辑出版中心",
      "publisher": "少年儿童出版社",
      "image": "book-images/image23.jpg",
      "ams_status": "准入",
      "isbn": "9787558911002"
    },
    {
      "rank": 24,
      "title": "三国演义绘本",
      "author": "",
      "publisher": "中信出版集团",
      "image": "book-images/image24.jpg",
      "ams_status": "准入",
      "isbn": "2025112700420"
    },
    {
      "rank": 25,
      "title": "100层的房子系列",
      "author": "岩井俊雄著",
      "publisher": "北京科学技术出版社",
      "image": "book-images/image25.jpg",
      "ams_status": "准入",
      "isbn": "9787571439316"
    },
    {
      "rank": 26,
      "title": "我想去看海/想有颗星星/有个弟弟/找回太阳/爱小黑",
      "author": "[法]克利斯提昂·约里波瓦心文 [法]克利斯提昂·艾利旌众图郑迪蔚公译",
      "publisher": "二十一世纪出版社",
      "image": "book-images/image26.jpg",
      "ams_status": "准入",
      "isbn": "7556805002313"
    },
    {
      "rank": 27,
      "title": "米吴科学漫画·奇妙万象篇",
      "author": "未华童书",
      "publisher": "二十一世纪出版社集团",
      "image": "book-images/image27.jpg",
      "ams_status": "准入",
      "isbn": "14453643"
    },
    {
      "rank": 28,
      "title": "青蛙和蟾蜍",
      "author": "文·图/[美]艾诺·洛贝尔 译/潘人木党英台",
      "publisher": "明天出版社",
      "image": "book-images/image28.jpg",
      "ams_status": "准入",
      "isbn": "9787570807864"
    },
    {
      "rank": 29,
      "title": "中国儿童百科全书",
      "author": "《中国儿童百科全书》编委会",
      "publisher": "中国大百科全书出版社",
      "image": "book-images/image29.jpg",
      "ams_status": "准入",
      "isbn": "9787520211130"
    },
    {
      "rank": 30,
      "title": "儿童科学大百科",
      "author": "巨童文化",
      "publisher": "中国大百科全书出版社",
      "image": "book-images/image30.jpg",
      "ams_status": "准入",
      "isbn": "9787545577341"
    },
    {
      "rank": 31,
      "title": "彩虹色的花",
      "author": "",
      "publisher": "二十一世纪出版社集团",
      "image": "book-images/image31.jpg",
      "ams_status": "准入",
      "isbn": "9787556834280"
    },
    {
      "rank": 32,
      "title": "思考世界的孩子",
      "author": "",
      "publisher": "中信出版集团",
      "image": "book-images/image32.jpg",
      "ams_status": "准入",
      "isbn": "9787521757477"
    },
    {
      "rank": 33,
      "title": "怪兽商业街从小培养孩子财商学习经营",
      "author": "",
      "publisher": "天地出版社",
      "image": "book-images/image33.jpg",
      "ams_status": "准入",
      "isbn": "9787545566949"
    },
    {
      "rank": 34,
      "title": "有趣的物理",
      "author": "",
      "publisher": "北京日报出版社",
      "image": "book-images/image34.jpg",
      "ams_status": "准入",
      "isbn": "9787547731710"
    },
    {
      "rank": 35,
      "title": "给孩子的科幻绘本",
      "author": "",
      "publisher": "人民邮电出版社",
      "image": "book-images/image35.jpg",
      "ams_status": "准入",
      "isbn": "20220061E"
    },
    {
      "rank": 36,
      "title": "DK儿童海洋百科全书",
      "author": "",
      "publisher": "中国大百科全书出版社",
      "image": "book-images/image36.jpg",
      "ams_status": "准入",
      "isbn": "9787520200851"
    },
    {
      "rank": 37,
      "title": "大中国美食环游记",
      "author": "海豚传媒",
      "publisher": "新星出版社",
      "image": "book-images/image37.jpg",
      "ams_status": "准入",
      "isbn": "9787513362412"
    },
    {
      "rank": 38,
      "title": "神奇校车小百科",
      "author": "[美]汤姆·杰克逊著，[美]卡罗琳·布拉肯绘",
      "publisher": "贵州人民出版社",
      "image": "book-images/image38.jpg",
      "ams_status": "准入",
      "isbn": "9787221175670"
    }
  ],
  "健康推荐书单": [
    {
      "rank": 1,
      "title": "二十四节气养生药茶",
      "author": "王晨",
      "publisher": "中医古籍出版社",
      "image": "book-images/image40.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787515224536"
    },
    {
      "rank": 2,
      "title": "美食课（夏季版）",
      "author": "徐文兵",
      "publisher": "广东科技出版社",
      "image": "book-images/image43.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787535979828"
    },
    {
      "rank": 3,
      "title": "舌尖上的中国",
      "author": "陈志田",
      "publisher": "中国华侨出版社",
      "image": "book-images/image45.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787511371898"
    },
    {
      "rank": 4,
      "title": "百吃不厌的能量果蔬汁",
      "author": "",
      "publisher": "青岛出版社",
      "image": "book-images/image46.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787543682078"
    },
    {
      "rank": 5,
      "title": "全身穴位一找就准",
      "author": "姜庆荣",
      "publisher": "四川科学技术出版社",
      "image": "book-images/image48.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787572713576"
    },
    {
      "rank": 6,
      "title": "养生豆浆米糊果蔬汁一本全",
      "author": "万平",
      "publisher": "重庆出版社",
      "image": "book-images/image50.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787229060718"
    },
    {
      "rank": 7,
      "title": "1500种中草药野外识别彩色图鉴",
      "author": "岳桂华，王柳萍，杨高华",
      "publisher": "化学工业出版社",
      "image": "book-images/image51.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787122302977"
    },
    {
      "rank": 8,
      "title": "四季蒸菜",
      "author": "余静,编",
      "publisher": "黑龙江科学技术出版社",
      "image": "book-images/image52.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787571902742"
    },
    {
      "rank": 9,
      "title": "老年人饮食营养一本通",
      "author": "刘英华 徐庆",
      "publisher": "化学工业出版社",
      "image": "book-images/image54.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787122351098"
    },
    {
      "rank": 10,
      "title": "中老年人必知的365个养生法",
      "author": "李柏",
      "publisher": "化学工业出版社",
      "image": "book-images/image55.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787122250087"
    },
    {
      "rank": 11,
      "title": "吃土:强健肠道、提升免疫的整体健康革命",
      "author": "(美)乔希·阿克斯  译者:王凌波;魏宁",
      "publisher": "北京联合出版公司",
      "image": "book-images/image56.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787559611680"
    },
    {
      "rank": 12,
      "title": "精选家常菜",
      "author": "高杰",
      "publisher": "中国轻工业出版社",
      "image": "book-images/image57.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787518424412"
    },
    {
      "rank": 13,
      "title": "中草药全图鉴",
      "author": "温玉波，李海涛",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/image58.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787553742601"
    },
    {
      "rank": 14,
      "title": "阳台种菜种花种香草",
      "author": "白虹",
      "publisher": "北京联合出版公司",
      "image": "book-images/image59.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787550258433"
    },
    {
      "rank": 15,
      "title": "零基础学养花",
      "author": "王意成",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/image60.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787571321727"
    },
    {
      "rank": 16,
      "title": "四书五经 精装",
      "author": "",
      "publisher": "辽海出版社",
      "image": "book-images/image61.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787545136852"
    },
    {
      "rank": 17,
      "title": "怀孕一天一页",
      "author": "马良坤",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/image62.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787553785622"
    },
    {
      "rank": 18,
      "title": "老子道德经解-禅解儒道丛书",
      "author": "",
      "publisher": "崇文书局",
      "image": "book-images/image63.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787540340018"
    },
    {
      "rank": 19,
      "title": "吕祖秘注道德经心传",
      "author": "",
      "publisher": "华龄出版社",
      "image": "book-images/image64.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787516929339"
    },
    {
      "rank": 20,
      "title": "孝经诵读本",
      "author": "",
      "publisher": "文华出版社",
      "image": "book-images/image65.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": "9787507560046"
    },
    {
      "rank": 21,
      "title": "漫画讲透黄帝内经",
      "author": "张嘉铭 王婧",
      "publisher": "化学工业出版社",
      "image": "book-images/image67.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 22,
      "title": "身体重置",
      "author": "[美]斯蒂芬·佩内里   海蒂·斯科尔尼克  译者: 余茗雯",
      "publisher": "中译出版社",
      "image": "book-images/image68.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 23,
      "title": "控糖革命",
      "author": "(法)杰西·安佐斯佩   译者:张艳娟",
      "publisher": "浙江科学技术出版社",
      "image": "book-images/image69.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 24,
      "title": "《本草纲目》节气养生年历",
      "author": "蔡志忠 周学林",
      "publisher": "天津科学技术出版社",
      "image": "book-images/image70.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 25,
      "title": "预防衰老   从50岁开始",
      "author": "(日)和田秀树  译者:王雯婷",
      "publisher": "东方出版社",
      "image": "book-images/image72.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 26,
      "title": "救命!逆转和预防致命疾病的科学饮食",
      "author": "(美)迈克尔·格雷格;(美)吉恩·斯通  译者:谢宜晖;张家绮",
      "publisher": "电子工业出版社",
      "image": "book-images/image73.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 27,
      "title": "黄帝内经全集(全译图解版)",
      "author": "肖建喜，紫图",
      "publisher": "吉林科学技术出版社",
      "image": "book-images/image74.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 28,
      "title": "血糖控制一本就够",
      "author": "李宁，李乃适",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/image75.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 29,
      "title": "二十四节气健康吃法",
      "author": "朱荣",
      "publisher": "中国织纺出版社",
      "image": "book-images/image76.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 30,
      "title": "中医养身妙招",
      "author": "解谢",
      "publisher": "新疆科学技术出版社",
      "image": "book-images/image77.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 31,
      "title": "实用中草药图谱与手册应用",
      "author": "胡贵荣",
      "publisher": "贵州科技出版社",
      "image": "book-images/image78.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 32,
      "title": "漫画讲透黄帝内经",
      "author": "张嘉铭 王婧",
      "publisher": "化学工业出版社",
      "image": "book-images/image82.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 33,
      "title": "饮食术：减糖生活",
      "author": "何银萍",
      "publisher": "吉林科学技术出版社",
      "image": "book-images/image83.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 34,
      "title": "别让慢病找上你",
      "author": "斯蒂芬 科佩基  译者:管秀兰  李杰",
      "publisher": "浙江科学技术出版社",
      "image": "book-images/image85.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 35,
      "title": "保健小妙招",
      "author": "宋兆普",
      "publisher": "河南科学技术出版社",
      "image": "book-images/image87.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 36,
      "title": "黄帝内经",
      "author": "李爱勇, 编著",
      "publisher": "民主与建设出版社",
      "image": "book-images/image88.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 37,
      "title": "腿脚有病看这本就够",
      "author": "张威",
      "publisher": "天津科学技术出版社",
      "image": "book-images/image93.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 38,
      "title": "保健小妙招",
      "author": "宋兆普",
      "publisher": "河南科学技术出版社",
      "image": "book-images/image94.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 39,
      "title": "中医养生食疗大全",
      "author": "李素云",
      "publisher": "江苏凤凰科学技术出版社",
      "image": "book-images/image96.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 40,
      "title": "抗炎食物",
      "author": "(美) 利兹·斯特雷特 (Lizzie Streit)  译者：董乐乐",
      "publisher": "科学技术文献出版社",
      "image": "book-images/image97.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 41,
      "title": "《本草纲目》节气养生年历",
      "author": "蔡志忠 周学林",
      "publisher": "天津科学技术出版社",
      "image": "book-images/image70.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 42,
      "title": "黄帝内经",
      "author": "马寅中",
      "publisher": "科学普及出版社",
      "image": "book-images/image98.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 43,
      "title": "漫画讲透黄帝内经",
      "author": "张嘉铭 王婧",
      "publisher": "化学工业出版社",
      "image": "book-images/image67.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 44,
      "title": "智慧生活-3秒精准取穴",
      "author": "李哲",
      "publisher": "中国科学技术出版社",
      "image": "book-images/image99.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 45,
      "title": "黄帝内经",
      "author": "郭刚",
      "publisher": "岳麓书社",
      "image": "book-images/image101.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    },
    {
      "rank": 46,
      "title": "这书能让你戒烟",
      "author": "[英]亚伦·卡尔(Allen Carr)   译者： 严冬冬",
      "publisher": "北京联合出版有限责任公司",
      "image": "book-images/image102.jpg",
      "ams_status": "普通书籍全流量可投，仅封面初审通过；若内容涉疾病治疗，仍不予支持",
      "isbn": ""
    }
  ],
  "社科推荐书单": [
    {
      "rank": 1,
      "title": "零基础玩转OpenClaw",
      "author": "向安玲  张诗瑶   张亚男",
      "publisher": "中信出版社",
      "image": "book-images/image104.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787521739282"
    },
    {
      "rank": 2,
      "title": "AI中国方案",
      "author": "薛澜",
      "publisher": "中信出版集团",
      "image": "book-images/image105.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787521779813"
    },
    {
      "rank": 3,
      "title": "AI训练师手册",
      "author": "谷建阳",
      "publisher": "北京大学出版社",
      "image": "book-images/image106.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787301351925"
    },
    {
      "rank": 4,
      "title": "养龙虾OpenClaw与AI智能体时代",
      "author": "杜雨",
      "publisher": "中译出版社",
      "image": "book-images/image107.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787500186021"
    },
    {
      "rank": 5,
      "title": "deepseek+AI炒股一本通",
      "author": "恒盛杰资讯",
      "publisher": "北京理工大学出版社",
      "image": "book-images/image108.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "isbn": "9787576352795"
    },
    {
      "rank": 6,
      "title": "Agent设计模式",
      "author": "黄佳",
      "publisher": "人民邮电出版社",
      "image": "book-images/image109.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787115690470"
    },
    {
      "rank": 7,
      "title": "AI未来进行式:李开复陈楸帆新书",
      "author": "李开复;陈楸帆",
      "publisher": "浙江人民出版社",
      "image": "book-images/image110.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787213101625"
    },
    {
      "rank": 8,
      "title": "扣子开发AIAgent智能体应用(人工智能技术从书)",
      "author": "宋立桓，王东健，陈铭毅，程东升",
      "publisher": "清华大学出版社",
      "image": "book-images/image111.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787302692188"
    },
    {
      "rank": 9,
      "title": "智能涌现:AI时代的思考与探索",
      "author": "张亚勤",
      "publisher": "中信出版社。",
      "image": "book-images/image112.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787521774412"
    },
    {
      "rank": 10,
      "title": "OpenClaw AI助理一本通",
      "author": "刘宸 龙汀汀 王啸啸",
      "publisher": "化学工业出版社",
      "image": "book-images/image113.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787122503312"
    },
    {
      "rank": 11,
      "title": "手把手教你养“龙虾”从零开始驾驭OpenClaw",
      "author": "丁俊松",
      "publisher": "山西科学技术出版社",
      "image": "book-images/image114.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787516932391"
    },
    {
      "rank": 12,
      "title": "玩爆你的龙虾  最强 OpenClaw",
      "author": "胡嘉玺",
      "publisher": "",
      "image": "book-images/image115.jpg",
      "ams_status": "需补充进口备案文号",
      "isbn": "9786267889022"
    },
    {
      "rank": 13,
      "title": "AI掘金",
      "author": "千海",
      "publisher": "中国纺织出版社有限公司",
      "image": "book-images/image116.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787522935324"
    },
    {
      "rank": 14,
      "title": "豆包AI创富手册",
      "author": "云岫",
      "publisher": "北方妇女儿童出版社",
      "image": "book-images/image117.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787581301139"
    },
    {
      "rank": 15,
      "title": "AI赚钱攻略",
      "author": "千赋AI-老曹，九度",
      "publisher": "北京日报出版社",
      "image": "book-images/image118.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787547752807"
    },
    {
      "rank": 16,
      "title": "成为AI高手：人人都能上手的智能体实战指南",
      "author": "唐舰长",
      "publisher": "电子工业出版社",
      "image": "book-images/image119.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787121513848"
    },
    {
      "rank": 17,
      "title": "豆包AI赚钱手册",
      "author": "秋叶",
      "publisher": "人民邮电出版社",
      "image": "book-images/image120.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787115691842"
    },
    {
      "rank": 18,
      "title": "豆包高效办公:AI10倍提升工作效率的方法与技巧",
      "author": "沈亲淦;云中江树;蓝衣剑客",
      "publisher": "机械工业出版社",
      "image": "book-images/image121.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787111777021"
    },
    {
      "rank": 19,
      "title": "用扣子（Coze）搭建AI Agent （零基础，实战版）――给普通人的智能体入门书",
      "author": "罗健",
      "publisher": "电子工业出版社",
      "image": "book-images/image122.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787121513077"
    },
    {
      "rank": 20,
      "title": "富爸爸穷爸爸(新版)",
      "author": "(美)罗伯特·清崎  译者:萧明",
      "publisher": "四川人民出版社",
      "image": "book-images/image123.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787220114045"
    },
    {
      "rank": 21,
      "title": "给孩子的人工智能",
      "author": "陈智涛，存一",
      "publisher": "台海出版社",
      "image": "",
      "ams_status": "全流量可投",
      "isbn": "9787516841624"
    },
    {
      "rank": 22,
      "title": "智能简史：进化、AI与人脑的突破",
      "author": "[美]麦克斯·班尼特(Max Bennett)  译者:林桥津",
      "publisher": "中译出版社",
      "image": "",
      "ams_status": "全流量可投",
      "isbn": "9787500181699"
    },
    {
      "rank": 23,
      "title": "DeepSeek从入门到精通",
      "author": "徐昕张",
      "publisher": "民主与建设出版社",
      "image": "",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "isbn": "9787301361504"
    },
    {
      "rank": 24,
      "title": "漫画AI",
      "author": "师鲁贝尔",
      "publisher": "百花洲文艺出版社",
      "image": "",
      "ams_status": "全流量可投",
      "isbn": "9787550056589"
    },
    {
      "rank": 25,
      "title": "AI工程大模型应用开发实战",
      "author": "[越]奇普·萱(ChipHuyen)  译者:宝玉",
      "publisher": "人民邮电出版社",
      "image": "",
      "ams_status": "全流量可投",
      "isbn": "9787115686398"
    },
    {
      "rank": 26,
      "title": "智人之上一一从石器时代到AI时代的信息网络简史",
      "author": "[以]尤瓦尔·赫拉利  译者:林俊宏",
      "publisher": "中信出版集团",
      "image": "",
      "ams_status": "全流量可投",
      "isbn": "9787521768527"
    },
    {
      "rank": 27,
      "title": "豆包AI赚钱手册",
      "author": "秋叶",
      "publisher": "人民邮电出版社",
      "image": "",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787115691842"
    },
    {
      "rank": 28,
      "title": "一人公司:AI时代赚钱新方向",
      "author": "究慈",
      "publisher": "民主与建设出版社",
      "image": "book-images/image124.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787513951944"
    },
    {
      "rank": 29,
      "title": "AI提效手册",
      "author": "秋叶  ，刘晓阳",
      "publisher": "人民邮电出版社",
      "image": "",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787807741053"
    },
    {
      "rank": 30,
      "title": "用ai赚钱",
      "author": "芙朗",
      "publisher": "江苏凤凰文艺出版社",
      "image": "book-images/image125.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787559499158"
    },
    {
      "rank": 31,
      "title": "豆包高效办公",
      "author": "沈亲淦,云中江树,蓝衣剑客",
      "publisher": "机械工业出版社",
      "image": "",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787111777021"
    },
    {
      "rank": 32,
      "title": "玩“赚”AI",
      "author": "老曹，赵亦初",
      "publisher": "北京日报出版社",
      "image": "",
      "ams_status": "全流量可投",
      "isbn": "9787547753835"
    },
    {
      "rank": 33,
      "title": "快速玩转DeepSeek 7天从新手到高手",
      "author": "焦海利",
      "publisher": "民主与建设出版社",
      "image": "",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "isbn": "9787513949507"
    },
    {
      "rank": 34,
      "title": "用AI赚钱 普通人的新财库",
      "author": "林开平，马新",
      "publisher": "中国画报出版社",
      "image": "",
      "ams_status": "全流量可投",
      "isbn": "9787521015775"
    },
    {
      "rank": 35,
      "title": "AI+抖音",
      "author": "梦联",
      "publisher": "中国摄影出版社",
      "image": "",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787522933122"
    },
    {
      "rank": 36,
      "title": "从0到1用AI赚钱",
      "author": "高效笑笑",
      "publisher": "民主与建设出版社",
      "image": "book-images/image126.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "isbn": "9787513948944"
    },
    {
      "rank": 37,
      "title": "豆包AI时代创富",
      "author": "李天舒",
      "publisher": "电子工业出版社",
      "image": "book-images/image127.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": ""
    },
    {
      "rank": 38,
      "title": "零基础玩转AI赚钱36招",
      "author": "陈光锋",
      "publisher": "团结出版社",
      "image": "book-images/image128.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787523423110"
    },
    {
      "rank": 39,
      "title": "DeepSeek实用操作指南书",
      "author": "焦海利",
      "publisher": "民主与建设出版社",
      "image": "book-images/image129.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "isbn": "9787513949163"
    },
    {
      "rank": 40,
      "title": "StatQuest 图解机器学习（全彩）",
      "author": "",
      "publisher": "电子工业出版社",
      "image": "book-images/image130.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787121497643"
    },
    {
      "rank": 41,
      "title": "人工智能",
      "author": "师鲁贝尔",
      "publisher": "百花洲文艺出版社",
      "image": "book-images/image131.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787302686750"
    },
    {
      "rank": 42,
      "title": "AI职场神器：高效办公实战手册",
      "author": "海川",
      "publisher": "化学工业出版社",
      "image": "book-images/image132.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787122491954"
    },
    {
      "rank": 43,
      "title": "零基础DeepSeek从入门到精通",
      "author": "民辰",
      "publisher": "中國西報土版社",
      "image": "book-images/image133.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "isbn": "9787558593697"
    },
    {
      "rank": 44,
      "title": "人人都能学AI",
      "author": "左歌,罗杰,庄肃常",
      "publisher": "北方妇女儿童出版社",
      "image": "book-images/image134.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787558593697"
    },
    {
      "rank": 45,
      "title": "用ai赚钱",
      "author": "芙朗",
      "publisher": "江苏凤凰文艺出版社",
      "image": "book-images/image125.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787559499158"
    },
    {
      "rank": 46,
      "title": "豆包AI时代创富",
      "author": "李天舒",
      "publisher": "电子工业出版社",
      "image": "book-images/image135.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": ""
    },
    {
      "rank": 47,
      "title": "小学生秒懂新科技和AI人工智能",
      "author": "催钟雷",
      "publisher": "吉林美术出版社",
      "image": "book-images/image136.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787557597870"
    },
    {
      "rank": 48,
      "title": "从0到1用AI赚钱",
      "author": "高效笑笑",
      "publisher": "民主与建设出版社",
      "image": "book-images/image137.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "isbn": "9787513948944"
    },
    {
      "rank": 49,
      "title": "豆包AI赚钱手册",
      "author": "秋叶",
      "publisher": "人民邮电出版社有限公司",
      "image": "book-images/image120.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": "9787115691842"
    },
    {
      "rank": 50,
      "title": "豆包从入门到精通",
      "author": "苏小文  ， 乔剑",
      "publisher": "机械工业出版社",
      "image": "book-images/image138.jpg",
      "ams_status": "微信不可投，仅能支持优量汇",
      "isbn": ""
    },
    {
      "rank": 51,
      "title": "DeepSeek实用操作指南书",
      "author": "焦海利",
      "publisher": "民主与建设出版社",
      "image": "book-images/image129.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "isbn": "9787513949163"
    },
    {
      "rank": 52,
      "title": "一人公司:AI时代赚钱新方向",
      "author": "究慈",
      "publisher": "民主与建设出版社",
      "image": "book-images/image124.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787513951944"
    },
    {
      "rank": 53,
      "title": "AI时代安全导航",
      "author": "佟丽华",
      "publisher": "中国少年儿童出版社",
      "image": "book-images/image139.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787524801467"
    },
    {
      "rank": 54,
      "title": "DeepSeek实用操作指南",
      "author": "李尚龙",
      "publisher": "台海出版社",
      "image": "book-images/image140.jpg",
      "ams_status": "全流量可投，DeepSeek需提黑词加白",
      "isbn": "9787301361504"
    },
    {
      "rank": 55,
      "title": "懒商：AI赋能下的财富密码",
      "author": "冯慧娟",
      "publisher": "华文出版社",
      "image": "book-images/image141.jpg",
      "ams_status": "全流量可投",
      "isbn": "9787507563351"
    }
  ],
  "教辅推荐书单": []
};
