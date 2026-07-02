// 大盘投放效率 Benchmark（图书行业 · 视频号下单链路）
// 来源：图书选品指南内部数据
// 结构：多期数据，按 period_id 索引；默认指向最新一期（latest）

// =============== 期次列表（最新在前）===============
const BENCH_PERIODS = [
  { id: '2026-06-16-to-30', label: '6月16日 - 6月30日', short: '6/16-6/30', isLatest: true },
  { id: '2026-06-01-to-15', label: '6月1日 - 6月15日',   short: '6/1-6/15', isLatest: false },
  { id: '2026-05',           label: '5月（全月）',        short: '5月',      isLatest: false }
];

// =============== 1. 品类 × 客单价 链路数据（按期）===============
const BENCH_CAT_PRICE_BY_PERIOD = {
  '2026-06-16-to-30': {
    title: '图书下单 og 视频号版位客单价链路数据【6月16日-6月30日】',
    priceRanges: [
      {
        range: '0元-50元区间',
        items: [
          {cat:'教辅', share:55, cpm:48,  ctr:2.1, cvr:9.8,  roi:1.6},
          {cat:'童书', share:19, cpm:46,  ctr:1.8, cvr:10.1, roi:1.5},
          {cat:'社科', share:14, cpm:37,  ctr:1.8, cvr:8.8,  roi:1.5},
          {cat:'健康', share:12, cpm:51,  ctr:3.2, cvr:6.8,  roi:1.6},
          {cat:'整体', share:100,cpm:46,  ctr:2.1, cvr:9.2,  roi:1.6, isTotal:true}
        ]
      },
      {
        range: '50元-100元区间',
        items: [
          {cat:'教辅', share:69, cpm:57,  ctr:1.6, cvr:9.8,  roi:1.7},
          {cat:'童书', share:18, cpm:57,  ctr:1.3, cvr:10.1, roi:1.6},
          {cat:'社科', share:9,  cpm:48,  ctr:1.7, cvr:6.6,  roi:1.6},
          {cat:'健康', share:4,  cpm:65,  ctr:3.4, cvr:5.7,  roi:2.0},
          {cat:'整体', share:100,cpm:56,  ctr:1.6, cvr:9.2,  roi:1.7, isTotal:true}
        ]
      },
      {
        range: '100元-150元',
        items: [
          {cat:'教辅', share:92, cpm:60,  ctr:1.2, cvr:6.8,  roi:1.7},
          {cat:'童书', share:1,  cpm:72,  ctr:1.6, cvr:5.9,  roi:1.5},
          {cat:'社科', share:5,  cpm:50,  ctr:1.4, cvr:5.6,  roi:1.9},
          {cat:'健康', share:1,  cpm:52,  ctr:1.3, cvr:6.8,  roi:1.9},
          {cat:'整体', share:100,cpm:60,  ctr:1.2, cvr:6.7,  roi:1.7, isTotal:true}
        ]
      },
      {
        range: '150元-300元',
        items: [
          {cat:'教辅', share:77, cpm:63,  ctr:1.4, cvr:4.7,  roi:1.8},
          {cat:'童书', share:2,  cpm:78,  ctr:1.5, cvr:4.4,  roi:2.2},
          {cat:'社科', share:19, cpm:91,  ctr:1.3, cvr:4.1,  roi:1.5},
          {cat:'健康', share:1,  cpm:102, ctr:1.5, cvr:5.7,  roi:1.7},
          {cat:'整体', share:100,cpm:68,  ctr:1.4, cvr:4.6,  roi:1.7, isTotal:true}
        ]
      },
      {
        range: '300元以上',
        items: [
          {cat:'教辅', share:81, cpm:97,  ctr:1.7, cvr:3.3,  roi:2.1},
          {cat:'童书', share:3,  cpm:604, ctr:1.4, cvr:12.6, roi:1.5},
          {cat:'社科', share:16, cpm:317, ctr:1.6, cvr:6.0,  roi:1.6},
          {cat:'健康', share:0,  cpm:null,ctr:null,cvr:null, roi:null},
          {cat:'整体', share:100,cpm:113, ctr:1.7, cvr:3.5,  roi:2.0, isTotal:true}
        ]
      }
    ]
  },
  '2026-06-01-to-15': {
    title: '图书下单 og 视频号版位客单价链路数据【6月1日-6月15日】',
    priceRanges: [
      {
        range: '0元-50元区间',
        items: [
          {cat:'教辅', share:54, cpm:56,  ctr:2.6, cvr:8.3,  roi:1.6},
          {cat:'童书', share:17, cpm:58,  ctr:2.0, cvr:10.0, roi:1.5},
          {cat:'社科', share:12, cpm:51,  ctr:1.9, cvr:6.5,  roi:1.6},
          {cat:'健康', share:16, cpm:67,  ctr:3.1, cvr:8.4,  roi:1.6},
          {cat:'整体', share:100,cpm:58,  ctr:2.5, cvr:8.6,  roi:1.5, isTotal:true}
        ]
      },
      {
        range: '50元-100元区间',
        items: [
          {cat:'教辅', share:51, cpm:54,  ctr:1.7, cvr:7.3,  roi:1.7},
          {cat:'童书', share:15, cpm:58,  ctr:1.8, cvr:8.7,  roi:1.6},
          {cat:'社科', share:33, cpm:59,  ctr:2.7, cvr:5.0,  roi:1.6},
          {cat:'健康', share:1,  cpm:33,  ctr:1.9, cvr:6.8,  roi:2.1},
          {cat:'整体', share:100,cpm:56,  ctr:2.0, cvr:6.5,  roi:1.6, isTotal:true}
        ]
      },
      {
        range: '100元-150元',
        items: [
          {cat:'教辅', share:93, cpm:60,  ctr:1.7, cvr:5.4,  roi:1.5},
          {cat:'童书', share:0,  cpm:null,ctr:null,cvr:null, roi:null},
          {cat:'社科', share:7,  cpm:76,  ctr:1.5, cvr:5.4,  roi:null},
          {cat:'健康', share:0,  cpm:null,ctr:null,cvr:null, roi:null},
          {cat:'整体', share:100,cpm:79,  ctr:1.7, cvr:5.4,  roi:1.5, isTotal:true}
        ]
      },
      {
        range: '150元-300元',
        items: [
          {cat:'教辅', share:50, cpm:63,  ctr:1.7, cvr:3.1,  roi:1.7},
          {cat:'童书', share:2,  cpm:36,  ctr:1.2, cvr:2.6,  roi:1.6},
          {cat:'社科', share:48, cpm:112, ctr:1.3, cvr:5.2,  roi:1.6},
          {cat:'健康', share:1,  cpm:27,  ctr:1.5, cvr:4.7,  roi:1.5},
          {cat:'整体', share:100,cpm:77,  ctr:1.5, cvr:3.7,  roi:1.5, isTotal:true}
        ]
      },
      {
        range: '300元以上',
        items: [
          {cat:'教辅', share:50, cpm:248, ctr:1.7, cvr:6.4,  roi:1.5},
          {cat:'童书', share:8,  cpm:338, ctr:0.8, cvr:11.4, roi:1.5},
          {cat:'社科', share:43, cpm:228, ctr:1.5, cvr:null, roi:null},
          {cat:'健康', share:0,  cpm:null,ctr:null,cvr:null, roi:null},
          {cat:'整体', share:100,cpm:243, ctr:1.3, cvr:5.9,  roi:1.5, isTotal:true}
        ]
      }
    ]
  },
  '2026-05': {
    title: '5月图书下单 og 视频号版位客单价链路数据',
    priceRanges: [
      {
        range: '0元-50元区间',
        items: [
          {cat:'教辅', share:38, cpm:50, ctr:1.7, cvr:10.4, roi:1.5},
          {cat:'童书', share:23, cpm:70, ctr:2.5, cvr:8.9,  roi:1.5},
          {cat:'社科', share:11, cpm:70, ctr:2.5, cvr:9.5,  roi:1.5},
          {cat:'健康', share:28, cpm:79, ctr:3.6, cvr:8.1,  roi:1.6},
          {cat:'整体', share:100,cpm:63, ctr:2.4, cvr:9.2,  roi:1.5, isTotal:true}
        ]
      },
      {
        range: '50元-100元区间',
        items: [
          {cat:'教辅', share:53, cpm:56, ctr:1.8, cvr:6.8, roi:1.6},
          {cat:'童书', share:19, cpm:70, ctr:2.4, cvr:7.9, roi:1.6},
          {cat:'社科', share:27, cpm:52, ctr:1.9, cvr:6.4, roi:1.6},
          {cat:'健康', share:1,  cpm:35, ctr:1.6, cvr:6.9, roi:1.9},
          {cat:'整体', share:100,cpm:56, ctr:1.9, cvr:6.9, roi:1.6, isTotal:true}
        ]
      },
      {
        range: '100元-150元',
        items: [
          {cat:'教辅', share:40, cpm:82,  ctr:1.6, cvr:4.3, roi:1.5},
          {cat:'童书', share:38, cpm:123, ctr:2.7, cvr:8.1, roi:1.8},
          {cat:'社科', share:22, cpm:85,  ctr:1.5, cvr:5.8, roi:1.5},
          {cat:'健康', share:0,  cpm:91,  ctr:1.3, cvr:7.7, roi:1.5},
          {cat:'整体', share:100,cpm:95,  ctr:1.9, cvr:6.2, roi:1.6, isTotal:true}
        ]
      },
      {
        range: '150元-300元',
        items: [
          {cat:'教辅', share:65, cpm:94,  ctr:1.7, cvr:3.6, roi:1.5},
          {cat:'童书', share:6,  cpm:116, ctr:1.5, cvr:5.1, roi:1.5},
          {cat:'社科', share:29, cpm:68,  ctr:1.8, cvr:4.8, roi:2.0},
          {cat:'健康', share:0,  cpm:18,  ctr:0.9, cvr:3.1, roi:2.8},
          {cat:'整体', share:100,cpm:86,  ctr:1.7, cvr:4.1, roi:1.6, isTotal:true}
        ]
      },
      {
        range: '300元以上',
        items: [
          {cat:'教辅', share:57, cpm:460, ctr:1.6, cvr:8.9,  roi:1.5},
          {cat:'童书', share:9,  cpm:557, ctr:1.4, cvr:10.7, roi:1.5},
          {cat:'社科', share:34, cpm:212, ctr:1.4, cvr:5.1,  roi:1.5},
          {cat:'健康', share:0,  cpm:null,ctr:null,cvr:null, roi:null},
          {cat:'整体', share:100,cpm:332, ctr:1.5, cvr:7.0,  roi:1.5, isTotal:true}
        ]
      }
    ]
  }
};

// =============== 2. 客单价 × 链路 消耗数据（按期）===============
const BENCH_PRICE_CHANNEL_BY_PERIOD = {
  '2026-06-16-to-30': {
    title: '图书客单价 × 链路消耗占比【6月16日-6月30日】',
    blocks: [
      {
        range: '0元-50元', share:33, cpm:45, ctr:2.1, cvr:9.2, roi:1.6,
        sub: [
          {channel:'小店直购', share:92, cpm:46, ctr:2.2, cvr:8.9,  roi:1.6},
          {channel:'直播',     share:8,  cpm:41, ctr:1.6, cvr:12.4, roi:1.5}
        ]
      },
      {
        range: '50元-100元', share:29, cpm:57, ctr:1.6, cvr:9.2, roi:1.7,
        sub: [
          {channel:'小店直购', share:78, cpm:57, ctr:1.6, cvr:9.3, roi:1.7},
          {channel:'直播',     share:22, cpm:57, ctr:1.6, cvr:8.9, roi:1.6}
        ]
      },
      {
        range: '100元-150元', share:16, cpm:60, ctr:1.2, cvr:6.7, roi:1.7,
        sub: [
          {channel:'小店直购', share:26, cpm:57, ctr:1.3, cvr:6.3, roi:1.8},
          {channel:'直播',     share:74, cpm:61, ctr:1.2, cvr:6.9, roi:1.7}
        ]
      },
      {
        range: '150元-300元', share:15, cpm:71, ctr:1.4, cvr:4.7, roi:1.7,
        sub: [
          {channel:'小店直购',   share:29, cpm:75,  ctr:1.4, cvr:4.3, roi:1.6},
          {channel:'直播',       share:52, cpm:58,  ctr:1.4, cvr:4.7, roi:1.8},
          {channel:'小程序直购', share:19, cpm:146, ctr:1.7, cvr:5.8, roi:1.5}
        ]
      },
      {
        range: '300元以上', share:7, cpm:112, ctr:1.7, cvr:3.5, roi:2.2,
        sub: [
          {channel:'小店直购',   share:6,  cpm:126, ctr:2.3, cvr:2.8,  roi:3.0},
          {channel:'直播',       share:63, cpm:82,  ctr:1.7, cvr:3.0,  roi:2.5},
          {channel:'小程序直购', share:31, cpm:410, ctr:1.1, cvr:10.8, roi:1.5}
        ]
      }
    ]
  },
  '2026-06-01-to-15': {
    title: '图书客单价 × 链路消耗占比【6月1日-6月15日】',
    blocks: [
      {
        range: '0元-50元', share:47, cpm:57, ctr:2.5, cvr:8.6, roi:1.5,
        sub: [
          {channel:'小店直购', share:94, cpm:58, ctr:2.5, cvr:8.4, roi:1.6},
          {channel:'直播',     share:7,  cpm:55, ctr:2.0, cvr:11.1,roi:1.5}
        ]
      },
      {
        range: '50元-100元', share:22, cpm:56, ctr:2.0, cvr:6.5, roi:1.6,
        sub: [
          {channel:'小店直购',   share:87, cpm:54, ctr:2.0, cvr:6.5, roi:1.7},
          {channel:'直播',       share:17, cpm:69, ctr:1.7, cvr:6.1, roi:1.5},
          {channel:'小程序直购', share:2,  cpm:59, ctr:1.8, cvr:4.4, roi:1.5}
        ]
      },
      {
        range: '100元-150元', share:21, cpm:10, ctr:1.7, cvr:5.3, roi:1.5,
        sub: [
          {channel:'小店直购',   share:14, cpm:75, ctr:1.5, cvr:5.8, roi:1.6},
          {channel:'直播',       share:85, cpm:81, ctr:1.7, cvr:5.2, roi:1.5},
          {channel:'小程序直购', share:0,  cpm:null,ctr:null,cvr:null,roi:null}
        ]
      },
      {
        range: '150元-300元', share:5, cpm:7, ctr:1.5, cvr:3.7, roi:1.5,
        sub: [
          {channel:'小店直购',   share:46, cpm:109, ctr:1.5, cvr:5.3, roi:1.5},
          {channel:'直播',       share:47, cpm:58,  ctr:1.6, cvr:2.9, roi:1.8},
          {channel:'小程序直购', share:7,  cpm:113, ctr:1.2, cvr:4.9, roi:1.5}
        ]
      },
      {
        range: '300元以上', share:5, cpm:239, ctr:1.3, cvr:6.0, roi:1.6,
        sub: [
          {channel:'小店直购',   share:7,  cpm:118, ctr:2.0, cvr:6.0, roi:2.0},
          {channel:'直播',       share:6,  cpm:67,  ctr:1.2, cvr:4.7, roi:3.5},
          {channel:'小程序直购', share:87, cpm:326, ctr:1.5, cvr:6.0, roi:1.5}
        ]
      }
    ]
  },
  '2026-05': {
    title: '5月图书客单价 × 链路消耗占比',
    blocks: [
      {
        range: '0元-50元', share:45, cpm:62, ctr:2.4, cvr:9.0, roi:1.5,
        sub: [
          {channel:'小店直购', share:95, cpm:62, ctr:2.5, cvr:9.0, roi:1.5},
          {channel:'直播',     share:5,  cpm:59, ctr:1.6, cvr:9.3, roi:1.6}
        ]
      },
      {
        range: '50元-100元', share:26, cpm:57, ctr:1.9, cvr:7.0, roi:1.6,
        sub: [
          {channel:'小店直购',   share:84, cpm:57, ctr:2.0, cvr:7.0, roi:1.6},
          {channel:'直播',       share:12, cpm:57, ctr:1.8, cvr:7.1, roi:1.6},
          {channel:'小程序直购', share:4,  cpm:69, ctr:1.9, cvr:5.5, roi:1.6}
        ]
      },
      {
        range: '100元-150元', share:14, cpm:94, ctr:1.9, cvr:6.1, roi:1.5,
        sub: [
          {channel:'小店直购',   share:62, cpm:104, ctr:2.2, cvr:7.1, roi:1.6},
          {channel:'直播',       share:37, cpm:81,  ctr:1.5, cvr:4.2, roi:1.5},
          {channel:'小程序直购', share:0,  cpm:131, ctr:1.0, cvr:7.9, roi:1.6}
        ]
      },
      {
        range: '150元-300元', share:9, cpm:105, ctr:1.5, cvr:4.5, roi:1.5,
        sub: [
          {channel:'小店直购',   share:45, cpm:103, ctr:1.6, cvr:4.7, roi:1.5},
          {channel:'直播',       share:47, cpm:98,  ctr:1.3, cvr:4.2, roi:1.5},
          {channel:'小程序直购', share:8,  cpm:208, ctr:2.1, cvr:6.1, roi:1.5}
        ]
      },
      {
        range: '300元以上', share:6, cpm:327, ctr:1.5, cvr:7.0, roi:1.5,
        sub: [
          {channel:'小店直购',   share:5,  cpm:146, ctr:1.7, cvr:4.2, roi:2.4},
          {channel:'直播',       share:1,  cpm:106, ctr:0.8, cvr:3.6, roi:2.0},
          {channel:'小程序直购', share:95, cpm:355, ctr:1.5, cvr:7.4, roi:1.5}
        ]
      }
    ]
  }
};

// =============== 当前期次状态 + 向后兼容旧引用 ===============
let CURRENT_BENCH_PERIOD = (BENCH_PERIODS.find(p => p.isLatest) || BENCH_PERIODS[0]).id;

// 旧引用兜底：BENCH_CAT_PRICE / BENCH_PRICE_CHANNEL 始终指向"当前期"的数据
// 渲染时建议直接调 getCurrentBenchCatPrice() / getCurrentBenchPriceChannel()
function getCurrentBenchCatPrice() {
  return BENCH_CAT_PRICE_BY_PERIOD[CURRENT_BENCH_PERIOD] || BENCH_CAT_PRICE_BY_PERIOD[BENCH_PERIODS[0].id];
}
function getCurrentBenchPriceChannel() {
  return BENCH_PRICE_CHANNEL_BY_PERIOD[CURRENT_BENCH_PERIOD] || BENCH_PRICE_CHANNEL_BY_PERIOD[BENCH_PERIODS[0].id];
}
function setBenchPeriod(pid) {
  if (BENCH_CAT_PRICE_BY_PERIOD[pid]) {
    CURRENT_BENCH_PERIOD = pid;
    // 同步刷新旧全局引用，保证未升级的代码也拿到最新
    if (typeof window !== 'undefined') {
      window.BENCH_CAT_PRICE = getCurrentBenchCatPrice();
      window.BENCH_PRICE_CHANNEL = getCurrentBenchPriceChannel();
    }
    return true;
  }
  return false;
}

// 兼容旧代码：直接定义 BENCH_CAT_PRICE / BENCH_PRICE_CHANNEL 指向当前期
const BENCH_CAT_PRICE = getCurrentBenchCatPrice();
const BENCH_PRICE_CHANNEL = getCurrentBenchPriceChannel();
