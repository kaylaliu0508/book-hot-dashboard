// 大盘投放效率 Benchmark（5月图书行业 · 视频号 og 链路）
// 来源：图书选品指南内部数据

// 1. 品类 × 客单价 链路数据
const BENCH_CAT_PRICE = {
  title: '5月图书下单 og 视频号版位客单价链路数据',
  priceRanges: [
    {
      range: '0元-50元区间',
      items: [
        {cat:'教辅', share:38, cpm:50, ctr:1.7, cvr:10.4, roi:1.5},
        {cat:'童书', share:23, cpm:70, ctr:2.5, cvr:8.9, roi:1.5},
        {cat:'社科', share:11, cpm:70, ctr:2.5, cvr:9.5, roi:1.5},
        {cat:'健康', share:28, cpm:79, ctr:3.6, cvr:8.1, roi:1.6},
        {cat:'整体', share:100, cpm:63, ctr:2.4, cvr:9.2, roi:1.5, isTotal:true}
      ]
    },
    {
      range: '50元-100元区间',
      items: [
        {cat:'教辅', share:53, cpm:56, ctr:1.8, cvr:6.8, roi:1.6},
        {cat:'童书', share:19, cpm:70, ctr:2.4, cvr:7.9, roi:1.6},
        {cat:'社科', share:27, cpm:52, ctr:1.9, cvr:6.4, roi:1.6},
        {cat:'健康', share:1, cpm:35, ctr:1.6, cvr:6.9, roi:1.9},
        {cat:'整体', share:100, cpm:56, ctr:1.9, cvr:6.9, roi:1.6, isTotal:true}
      ]
    },
    {
      range: '100元-150元',
      items: [
        {cat:'教辅', share:40, cpm:82, ctr:1.6, cvr:4.3, roi:1.5},
        {cat:'童书', share:38, cpm:123, ctr:2.7, cvr:8.1, roi:1.8},
        {cat:'社科', share:22, cpm:85, ctr:1.5, cvr:5.8, roi:1.5},
        {cat:'健康', share:0, cpm:91, ctr:1.3, cvr:7.7, roi:1.5},
        {cat:'整体', share:100, cpm:95, ctr:1.9, cvr:6.2, roi:1.6, isTotal:true}
      ]
    },
    {
      range: '150元-300元',
      items: [
        {cat:'教辅', share:65, cpm:94, ctr:1.7, cvr:3.6, roi:1.5},
        {cat:'童书', share:6, cpm:116, ctr:1.5, cvr:5.1, roi:1.5},
        {cat:'社科', share:29, cpm:68, ctr:1.8, cvr:4.8, roi:2.0},
        {cat:'健康', share:0, cpm:18, ctr:0.9, cvr:3.1, roi:2.8},
        {cat:'整体', share:100, cpm:86, ctr:1.7, cvr:4.1, roi:1.6, isTotal:true}
      ]
    },
    {
      range: '300元以上',
      items: [
        {cat:'教辅', share:57, cpm:460, ctr:1.6, cvr:8.9, roi:1.5},
        {cat:'童书', share:9, cpm:557, ctr:1.4, cvr:10.7, roi:1.5},
        {cat:'社科', share:34, cpm:212, ctr:1.4, cvr:5.1, roi:1.5},
        {cat:'健康', share:0, cpm:null, ctr:null, cvr:null, roi:null},
        {cat:'整体', share:100, cpm:332, ctr:1.5, cvr:7.0, roi:1.5, isTotal:true}
      ]
    }
  ]
};

// 2. 客单价 × 链路 消耗数据
const BENCH_PRICE_CHANNEL = {
  title: '5月图书客单价 × 链路消耗占比',
  blocks: [
    {
      range: '0元-50元', share:45, cpm:62, ctr:2.4, cvr:9.0, roi:1.5,
      sub: [
        {channel:'小店直购', share:95, cpm:62, ctr:2.5, cvr:9.0, roi:1.5},
        {channel:'直播', share:5, cpm:59, ctr:1.6, cvr:9.3, roi:1.6}
      ]
    },
    {
      range: '50元-100元', share:26, cpm:57, ctr:1.9, cvr:7.0, roi:1.6,
      sub: [
        {channel:'小店直购', share:84, cpm:57, ctr:2.0, cvr:7.0, roi:1.6},
        {channel:'直播', share:12, cpm:57, ctr:1.8, cvr:7.1, roi:1.6},
        {channel:'小程序直购', share:4, cpm:69, ctr:1.9, cvr:5.5, roi:1.6}
      ]
    },
    {
      range: '100元-150元', share:14, cpm:94, ctr:1.9, cvr:6.1, roi:1.5,
      sub: [
        {channel:'小店直购', share:62, cpm:104, ctr:2.2, cvr:7.1, roi:1.6},
        {channel:'直播', share:37, cpm:81, ctr:1.5, cvr:4.2, roi:1.5},
        {channel:'小程序直购', share:0, cpm:131, ctr:1.0, cvr:7.9, roi:1.6}
      ]
    },
    {
      range: '150元-300元', share:9, cpm:105, ctr:1.5, cvr:4.5, roi:1.5,
      sub: [
        {channel:'小店直购', share:45, cpm:103, ctr:1.6, cvr:4.7, roi:1.5},
        {channel:'直播', share:47, cpm:98, ctr:1.3, cvr:4.2, roi:1.5},
        {channel:'小程序直购', share:8, cpm:208, ctr:2.1, cvr:6.1, roi:1.5}
      ]
    },
    {
      range: '300元以上', share:6, cpm:327, ctr:1.5, cvr:7.0, roi:1.5,
      sub: [
        {channel:'小店直购', share:5, cpm:146, ctr:1.7, cvr:4.2, roi:2.4},
        {channel:'直播', share:1, cpm:106, ctr:0.8, cvr:3.6, roi:2.0},
        {channel:'小程序直购', share:95, cpm:355, ctr:1.5, cvr:7.4, roi:1.5}
      ]
    }
  ]
};
