# tracker-api 部署指南

埋点后端：4 个 tab 的 PV/UV/按钮点击/功能使用/停留时长 + 看板查询。
保留期 90 天。

---

## 一、Cloudflare（当前线上）部署

### 1. 安装 wrangler
```bash
npm i -g wrangler
wrangler login
```

### 2. 创建 KV 命名空间
```bash
cd workers/tracker-api
wrangler kv namespace create TRACKER_AGG
wrangler kv namespace create TRACKER_AGG --preview
```
把返回的两个 id 填到 `wrangler.toml` 的 `id` 与 `preview_id`。

### 3. （可选）创建 R2 桶用于原始日志
```bash
wrangler r2 bucket create tracker-raw
# 然后 uncomment wrangler.toml 中的 [[r2_buckets]] 块
# 并把 ENABLE_RAW_LOG = "true"
```
> R2 lifecycle 通过 Dashboard 设置 90 天自动删除。

### 4. 部署 Worker
```bash
wrangler deploy
```
得到一个 `https://tracker-api.<account>.workers.dev`。

### 5. 把 `/api/*` 路由到本 Worker

在 Cloudflare Pages 工程（`book-hot-dashboard`）上添加 Worker 路由：
- 进入 Pages → Settings → Functions → Service bindings 或 Routes
- 路由 `book-hot-dashboard.pages.dev/api/*` → 绑定 `tracker-api` Worker

或更简单：在 `wrangler.toml` 加 `routes`：
```toml
routes = [
  { pattern = "book-hot-dashboard.pages.dev/api/*", zone_name = "pages.dev" }
]
```
> 实测 `pages.dev` 域不能直接绑 routes，所以推荐方式：在 Pages 项目里用 `_redirects` 或自定义域 + Worker route。

**最稳的做法**（推荐）：把 `tracker.js` 的上报地址改为 Worker 直链：
```html
<script>window.__TRACKER_ENDPOINT__='https://tracker-api.xxx.workers.dev/api/track';</script>
<script src="/assets/tracker.js" defer></script>
```
看板页同理：
```html
<script>window.__STATS_ENDPOINT__='https://tracker-api.xxx.workers.dev/api/stats';</script>
```
（CORS 已在 Worker 端处理）

### 6. 验证
```bash
curl https://tracker-api.xxx.workers.dev/api/health
# {"ok":true,"ts":...}

curl -X POST https://tracker-api.xxx.workers.dev/api/track \
  -H "Content-Type: application/json" \
  -d '{"ts":1715000000000,"uid":"u_test","sid":"s_test","tab":"book_extract","type":"pv","ua":"test","ref":"","url":"https://x"}'
# {"ok":1}

curl 'https://tracker-api.xxx.workers.dev/api/stats?range=1d&tab=all'
```

---

## 二、迁移到腾讯云（COS + EdgeOne）

### 1. 静态站点
- 将 `site_output/` 整体上传 COS bucket
- EdgeOne 添加加速域名指向 COS 源

### 2. /api/\* 后端

**方案 A — 保留 Cloudflare Worker（最省事）**
- tracker.js 与 stats 页直接打 `https://tracker-api.xxx.workers.dev/...`（已用 `__TRACKER_ENDPOINT__`/`__STATS_ENDPOINT__` 解耦）
- EdgeOne 不做反代，前端直连 Worker，CORS 已支持

**方案 B — 用 EdgeOne 边缘函数转发**
- 在 EdgeOne 创建一个边缘函数，路径 `/api/*`，把请求转发到 Worker
- 客户端代码无需变（依然 `/api/track`）

**方案 C — 完全迁到腾讯云（彻底切换）**
- 用 SCF（云函数）+ COS 实现等价逻辑
- COS 当 KV 替代：每日 `evt-{tab}-{name}-{date}.json` 累计；UV 用按日 SET 写入 JSON
- 改造点：把 `src/index.js` 的 `KV.get/put` 替换成 COS SDK 的 `getObject/putObject`
- 量大时可以挪到 TencentDB / Redis

> **重要**：客户端 tracker.js **完全无需改动**，只要 `/api/*` 在新域名下可达即可。

---

## 三、限额与成本（参考）

- Cloudflare Worker 免费额度：10 万请求/天
- KV 免费额度：10 万读 + 1000 写/天
- 假设日访问 200 PV、平均 5 个事件/PV → 约 1000 次写入 → 略超免费额度
- 升级到 Workers Paid（$5/月）即可：1000 万请求 + 1000 万 KV 写

---

## 四、隐私 & 合规说明

- 上报字段不含姓名/手机/邮箱
- UID 为 localStorage 随机 ID（`u_xxxxxx`）
- IP 不主动收集
- 数据保留 90 天后 KV TTL 自动过期；R2 lifecycle 90 天清理
- 看板页无密码访问（按需求）；如需后续加密码可在 Worker 校验 cookie/token

---

## 五、本地调试

```bash
cd workers/tracker-api
wrangler dev --local
# 访问 http://localhost:8787/api/health
```

前端调试时设置：
```js
window.__TRACKER_ENDPOINT__='http://localhost:8787/api/track';
window.__STATS_ENDPOINT__='http://localhost:8787/api/stats';
```
