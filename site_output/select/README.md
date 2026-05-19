# 图书选品台 · 部署说明

> 交付时间：2026-05-19
> 版本：v1.0（含 89 周历史榜单数据）

## 📦 包内容

```
prototype-dist/
├── select.html              ← 主入口页面
├── select.css               ← 全部样式
├── select-app.js            ← 渲染逻辑（约 1200 行）
├── select-data.js           ← 6 月节点 / 跑量书 / 深度品类 / 月度趋势数据
├── rank-data.js             ← 89 周实战榜单数据（5/18 → 2025-05-19）
├── recommend-data.js        ← 推荐书单（选品 + 跟品）
├── recommend.json           ← 备用 JSON
├── bench-data.js            ← 大盘 Benchmark 数据
├── isbn-image-map.js        ← ISBN → 封面图映射
├── book-images/             ← 推荐书单封面（141 张 JPEG）
└── rank-images/             ← 榜单书封面（1386 张 JPEG）
```

总大小 **36 MB**（图片均已等比缩到 300px 宽 + JPEG q75 压缩）。

## 🚀 部署方式

**纯静态站，无任何后端依赖**。直接把整个 `prototype-dist/` 目录上传到任意静态托管即可：

### 选项 A：作为子路径接入现有站点（推荐）
比如挂在 `https://your-domain.com/select/` 下：
```
your-site/
└── select/                  ← 把 prototype-dist 下所有文件放这里
    ├── select.html
    ├── select.css
    └── ...
```
访问 `https://your-domain.com/select/select.html` 即可（或把 `select.html` 重命名为 `index.html`）。

### 选项 B：独立部署（Cloudflare Pages / EdgeOne / GitHub Pages）
1. 把 `prototype-dist/` 重命名为 `dist/` 或 `public/`
2. 推到 Git 仓库
3. 平台自动构建（无需 build 命令，根目录直接 serve）

## ⚠️ 注意事项

1. **路径全部相对**：所有 `book-images/...` `rank-images/...` 都是相对路径，不要把图片目录单独移走。
2. **没有 build 步骤**：直接 serve 静态文件即可，不需要 npm install / webpack。
3. **首屏依赖加载顺序**（已在 `select.html` 写死）：
   ```
   isbn-image-map.js → rank-data.js → bench-data.js
   → recommend-data.js → select-data.js → select-app.js
   ```
4. **echarts 走 CDN**（select.html 里已经引用 jsdelivr CDN），如果部署在内网环境需要换成内网 CDN 或下载到本地。

## 🔄 后续数据更新流程

每周二有新数据时：
1. 把新一周的 sheet 加到源 Excel `2026 教育行业图书选品指南-直购链路.xlsx`
2. 运行 `scripts/parse_rank_excel.py`（在原仓库）→ 生成新的 `rank-data.js` + 提取图片到 `rank-images/`
3. 运行 `scripts/build_dist.py` → 压图 + 打包 → 重新部署

## 📋 主要功能模块

- **看过去**：本周类目占比 / 跑量书洞察 / 实战榜单（89 周可查询）/ 大盘 Benchmark
- **看未来**：全年节奏 / 6 月核心洞察 / 5 大节点 × 人群 × 选品策略 / 重点品类深度选品
- **推荐书单**：选品（适配腾讯生态）/ 跟品（潜力 + 预测爆品）
- **选品池**：跨榜单加书 + CSV/JSON 导出 + 一键送至创意生产中心

## 📞 联系人

- 数据 / 内容：王紫月
- 部署 / 发布：Kayla

---

**免责声明**：本平台数据来源于历史投放观察，仅作选品参考，所有图书及相关指标等均为脱敏后估算区间，不构成实际投放建议。
