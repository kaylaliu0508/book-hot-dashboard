# 📊 站点埋点 & 数据看板 使用手册

## 1. 我是谁

`book-hot-dashboard` 站点的轻量埋点系统。**4 个 tab 各自独立统计** PV / UV / 按钮点击 / 功能使用次数 / 停留时长 / 设备 / 来源，数据 90 天自动过期。

不依赖第三方分析平台，全部跑在 Cloudflare Pages（含 Pages Functions 和 KV）。

---

## 2. 在哪看数据

| 链接 | 用途 |
|---|---|
| https://book-hot-dashboard.pages.dev/stats/ | **每天看这个**：可视化看板 |
| https://book-hot-dashboard.pages.dev/api/stats?range=7d&tab=all | 原始数据 JSON（程序消费） |
| https://book-hot-dashboard.pages.dev/api/health | 健康检查 |

看板顶部时间范围切换：今日 / 7 天 / 30 天 / 90 天。

---

## 3. 已经埋了哪些事件

### 4 个 Tab（自动统计 PV/UV/停留/设备/来源）

| tab_id | 名字 | 入口 |
|---|---|---|
| `book_extract` | 图书内容提取 | `index.html#p4` |
| `script_gen` | 一键生成口播脚本 | `index.html#p5` |
| `ai_audit` | AI 预审 | `index.html#p3` |
| `summer` | 暑期专栏 | `/summer/` |

### 按钮点击事件（自动通过 `data-track` 属性捕获）

**book_extract**：`isbn_collect_run`（开始采集）/ `isbn_copy`（复制报告）/ `isbn_download`（下载报告）

**script_gen**：`script_generate_run`（生成）/ `script_copy_all`（复制全部）/ `script_export_md`（导出MD）/ `script_demo`（示例）

**ai_audit**：`audit_run`（开始预审）/ `audit_load_sample`（示例文案）/ `audit_upload_file`（上传文件）/ `audit_clear`（清空）

**summer**：`summer_nav_calendar/scripts/tags`（侧边栏导航）/ `script_group_expand`（展开脚本组）/ `keyframe_view`（查看关键帧）/ `dim_card_jump`（点维度卡片）

---

## 4. 想加新事件？1 行 HTML 搞定

### 简单按钮点击

在按钮上加 `data-track` 属性：

```html
<button data-track="my_new_event" data-track-tab="book_extract">点我</button>
```

点击时自动上报。**不用写任何 JS**。

### 业务事件（带额外数据）

在你的 JS 函数里调用：

```javascript
window.tracker.feature('event_name', { meta_key: 'meta_val' }, value, 'tab_id');
```

例子（在生成脚本成功后）：
```javascript
window.tracker.feature('script_generate_success', { chars: 500 }, null, 'script_gen');
```

---

## 5. 项目结构

```
book-hot-dashboard/
├── functions/
│   └── api/
│       ├── _tracker_lib.js   ← 共享逻辑（KV 读写 + 聚合）
│       ├── track.js           ← POST /api/track（上报）
│       ├── stats.js           ← GET /api/stats（查询）
│       └── health.js          ← GET /api/health
├── site_output/
│   ├── assets/tracker.js      ← 前端 SDK
│   ├── stats/index.html       ← 看板
│   ├── index.html             ← 主站（已注入 tracker + data-track）
│   └── summer/index.html      ← 暑期专栏（同上）
└── workers/tracker-api/       ← 旧的独立 Worker（已被 Pages Functions 替代，可删可留）
```

---

## 6. 部署 / 更新

**前端代码改动**（HTML/CSS/JS）：

```bash
cd /Users/jiangxinbei/WorkBuddy/repos/book-hot-dashboard
git add -A && git commit -m "your message" && git push origin main
```

GitHub 会触发 Cloudflare Pages 自动构建（约 1-2 分钟）。

**Pages Functions 改动**（functions/api/*.js）：同上，一起 git push 就行，Cloudflare 会重新构建。

**KV 数据要清空**（不常用）：去 Cloudflare 网页 → KV → `tracker-api-TRACKER_AGG` → 浏览数据手动删除指定 key。

---

## 7. 关键技术信息（出问题时排查用）

- **KV namespace**：`tracker-api-TRACKER_AGG`（id `2360767d707143e394cf90766faf418c`）
  - 已绑定到 Pages 项目的 `TRACKER_AGG` 变量
  - TTL：90 天自动过期
- **CORS**：Pages Functions 端 `Access-Control-Allow-Origin: *`，对所有 origin 开放
- **上报方式**：fetch + keepalive + `Content-Type: text/plain`（避开 preflight）
- **匿名 ID**：localStorage `bk_uid`（30 天滚动）+ sessionStorage `bk_sid`（30 分钟无活动失效）
- **不收集**：手机号 / 邮箱 / 姓名 / IP / 任何敏感信息

---

## 8. 数据 Schema（KV key 命名）

| Key | Value | 用途 |
|---|---|---|
| `pv:{tab}:{YYYYMMDD}` | Number | 当日 PV |
| `pv:{tab}:total` | Number | 累计 PV |
| `uv:{tab}:{YYYYMMDD}` | Array<uid> | 当日去重用户 |
| `evt:{tab}:{name}:{YYYYMMDD}` | Number | 事件计数 |
| `stay:{tab}:{YYYYMMDD}` | `{count, sumMs}` | 平均停留 |
| `bounce:{tab}:{YYYYMMDD}` | `{sessions, bounced, sids}` | 跳出率 |
| `device:{tab}:{YYYYMMDD}` | `{mobile, desktop, tablet}` | 设备分布 |
| `ref:{tab}:{YYYYMMDD}` | `{host: count}` | 来源 host |

---

## 9. 后续迁移到腾讯云 COS + EdgeOne

**站点**：把 `site_output/` 整体上传 COS bucket，EdgeOne 接管 CDN。

**API（3 个方案）**：

- **方案 A（最省事）**：API 继续走 Cloudflare Pages，前端打跨域请求（CORS 已 `*`）
- **方案 B**：用 EdgeOne 边缘函数路由 `/api/*` 转发到 Cloudflare
- **方案 C（彻底）**：把 `functions/api/*.js` 改写成腾讯云 SCF 云函数，用 COS 当 KV 替代

详细方案在 `workers/tracker-api/README.md`。

---

## 10. 常见问题

### Q：看板打不开 / 数据为空？

1. 先访问 https://book-hot-dashboard.pages.dev/api/health 确认 API 活着
2. 再访问 https://book-hot-dashboard.pages.dev/api/stats?range=1d&tab=all 看 JSON 是否有数据
3. 如果 health 是 200 但 stats 全 0：说明刚部署还没数据，去主站点几个 tab 等 5 秒再看

### Q：怎么知道某个事件埋点是否生效？

打开 Chrome → ⌥⌘I → Network 标签 → 输入 `track` → 点你想测的按钮 → 应该看到一条 POST `/api/track` 状态 200。

### Q：Cloudflare Pages 自动构建没触发？

去 https://dash.cloudflare.com → Workers & Pages → book-hot-dashboard → Deployments，看最新一条状态。如果显示 "Failed"，点进去看构建日志。

### Q：UV 数字看着比预期低？

UV 用 `localStorage.bk_uid` 去重。**用户清浏览器缓存 / 隐身模式 / 换浏览器** = 新 UV。这是行业通用算法。
