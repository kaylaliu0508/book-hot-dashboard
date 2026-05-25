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

### 7 个 Tab（自动统计 PV/UV/停留/设备/来源）

| tab_id | 名字 | 入口 |
|---|---|---|
| `book_extract` | 📚 图书内容提取 | `index.html#p4` |
| `script_gen` | 🎬 一键生成口播脚本 | `index.html#p5` |
| `ad_copy` | 📐 图片文案生成 | `index.html#p6` |
| `ai_audit` | 🛡️ AI 预审 | `index.html#p3` |
| `select_hub` | 🛒 图书选品台 | `index.html#pselect`（iframe → `/select/`） |
| `ai_assistant` | 🤖 AI 营销助手 | `index.html#pai`（iframe → `/ai/`） |
| `summer` | 📅 暑期专栏 | `/summer/` |

> ⚠️ 新增 tab 时 **必须同步** 改 3 个地方：
> 1. `functions/api/_tracker_lib.js` 的 `VALID_TABS`（否则后端会丢弃上报）
> 2. `site_output/index.html` 的 `TRACK_TAB_MAP`（让 `go()` 切换时 `tracker.setTab` 拿到正确 tab id）
> 3. `site_output/stats/index.html` 的 `TAB_LABELS / TAB_COLORS / .tab-color-*`（让看板能展示）

### 按钮点击事件（自动通过 `data-track` 属性捕获）

**book_extract**：`isbn_collect_run`（开始采集）/ `isbn_copy`（复制报告）/ `isbn_download`（下载报告）

**script_gen**：`script_generate_run`（生成）/ `script_copy_all`（复制全部）/ `script_export_md`（导出MD）/ `script_demo`（示例）

**ad_copy（NEW）**：`ad_copy_run`（生成图片文案）/ `ad_copy_all`（复制全部）/ `ad_copy_export_md`（导出MD）

**ai_audit**：`audit_run`（开始预审）/ `audit_load_sample`（示例文案）/ `audit_upload_file`（上传文件）/ `audit_clear`（清空）

**select_hub / ai_assistant**：本身是 iframe 嵌入的子站，子站如需埋点请在子站源码里调用 `parent.tracker.feature(name, meta, value, 'select_hub')` 或自己引入 tracker.js。

**summer**：`summer_nav_calendar/scripts/tags`（侧边栏导航）/ `script_group_expand`（展开脚本组）/ `keyframe_view`（查看关键帧）/ `dim_card_jump`（点维度卡片）

### 业务 feature 事件（带额外 meta）

| 事件名 | tab | meta 字段 |
|---|---|---|
| `audit_run` | `ai_audit` | `chars` |
| `isbn_collect_run` | `book_extract` | `isbn_len`, `has_title` |
| `isbn_query` | `book_extract` | `isbn`, `title` ← **驱动 ISBN Top 看板** |
| `script_generate_run` | `script_gen` | `chars`, `audience` |
| `ad_copy_run` | `ad_copy` | `isbn_len`, `has_title` |

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

按顺序排查（**这是 2026-05-25 实战定位流程**，必照做）：

#### Step 1 · 看 health 接口看 KV 是否绑定（最重要）

访问 https://book-hot-dashboard.pages.dev/api/health ，正常应返回：

```json
{
  "ok": true,
  "ts": ...,
  "checks": {
    "kv_binding": "bound",   // ← 必须是 "bound"
    "kv_probe": "ok",        // ← 必须是 "ok"
    "retention_days": "90"
  }
}
```

**如果 `kv_binding` 是 `"MISSING"`** → 说明 Pages 项目没把 KV namespace 绑定到 `TRACKER_AGG` 变量名上，所有上报会被静默丢弃。立刻按 Step 1.1 修复。

#### Step 1.1 · 修复 KV 绑定（必须人工去 Cloudflare Dashboard 操作，无法 git push 修）

1. 登录 https://dash.cloudflare.com → 左侧 **Workers & Pages**
2. 选中 **book-hot-dashboard** 项目 → **Settings** → **Bindings**（旧版叫 Functions → KV namespace bindings）
3. 点 **Add binding**，类型选 **KV namespace**
4. 填：
   - Variable name：`TRACKER_AGG`（**严格一致**，区分大小写）
   - KV namespace：`tracker-api-TRACKER_AGG`（id = `2360767d707143e394cf90766faf418c`）
5. **两个 environment（Production + Preview）都要加**，否则只有生产能写
6. 保存后必须 **Redeploy** 一次（Deployments → 最新部署 → ⋯ → Retry deployment），新绑定才会对线上生效
7. 再访问 `/api/health`，`kv_binding` 应变成 `"bound"`、`kv_probe` 应变成 `"ok"`

#### Step 2 · 看 stats API 是否还在 no_kv

访问 https://book-hot-dashboard.pages.dev/api/stats?range=1d&tab=all

- 返回 `{"error":"no_kv"}` → 回 Step 1.1，KV 没绑好
- 返回 `{"range":"1d", ..., "tabs":{}}` 但 tabs 全空 → 见 Step 3
- 返回正常含数据 → 一切就绪

#### Step 3 · 自测一次上报链路

```bash
curl -X POST https://book-hot-dashboard.pages.dev/api/track \
  -H "Content-Type: text/plain;charset=UTF-8" \
  -d '{"type":"pv","tab":"book_extract","ts":'$(date +%s)'000,"uid":"u_smoke","sid":"s_smoke","dev":"desktop"}'
```

- 期望返回 `{"ok":1}`
- 等 10 秒后再查 stats，对应 tab 的 `pv` 应 +1
- 如果 pv 没动 → Cloudflare Dashboard → Workers & Pages → book-hot-dashboard → Functions → **Real-time Logs**，复现一次访问主站，看是否打印了 `bad_tab` / `no_kv` 之类的错误

#### Step 4 · 前端埋点是否打出去

DevTools → Network → 过滤 `track` → 切几次 tab、点几下"开始采集"，应看到一连串 `POST /api/track` 都是 200。
如果一条都没有：
- 看页面源码 view-source 里是否有 `<script src="/assets/tracker.js">`
- 看 Console 是否有 `window.tracker` 对象（直接在 Console 敲 `tracker` 应能看到 `{setTab, pv, click, feature, error}`）

### Q：怎么知道某个事件埋点是否生效？

打开 Chrome → ⌥⌘I → Network 标签 → 输入 `track` → 点你想测的按钮 → 应该看到一条 POST `/api/track` 状态 200。

### Q：Cloudflare Pages 自动构建没触发？

去 https://dash.cloudflare.com → Workers & Pages → book-hot-dashboard → Deployments，看最新一条状态。如果显示 "Failed"，点进去看构建日志。

### Q：UV 数字看着比预期低？

UV 用 `localStorage.bk_uid` 去重。**用户清浏览器缓存 / 隐身模式 / 换浏览器** = 新 UV。这是行业通用算法。
