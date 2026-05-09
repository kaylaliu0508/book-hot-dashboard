# tracker-api 数据 Schema

## 一、四个 Tab 编号

| tab_id | 名称 | 入口 |
|---|---|---|
| `book_extract` | 图书内容提取 | `index.html#p4` |
| `script_gen` | 一键生成口播脚本 | `index.html#p5` |
| `ai_audit` | AI预审 | `index.html#p3` |
| `summer` | 暑期专栏 | `/summer/` |

## 二、上报事件结构（POST /api/track）

### 通用字段
```jsonc
{
  "ts": 1715228400000,        // 客户端时间戳
  "uid": "u_xxxx",            // localStorage 持久 30 天
  "sid": "s_xxxx",            // 会话 30 分钟无活动失效
  "tab": "book_extract",      // 4 选 1
  "type": "pv|tab_view|click|feature|stay|error",
  "name": "isbn_collect_run", // 事件名（type=click/feature 必填）
  "value": 12.3,              // 数值（如停留时长秒、字数）
  "meta": { "k":"v" },        // 业务自定义
  "ua": "...",                // navigator.userAgent
  "ref": "https://...",       // document.referrer
  "url": "https://.../#p4",
  "vw": 1920, "vh": 900,      // 视口
  "dpr": 2,
  "lang": "zh-CN"
}
```

### 事件类型
- `pv` ：页面整体加载（DOMContentLoaded 一次）
- `tab_view` ：切到某个 tab，等价于"虚拟 PV"
- `click` ：按钮点击
- `feature` ：功能使用（业务事件）
- `stay` ：tab 离开/页面卸载时上报停留时长（毫秒），`value` = 活跃毫秒数
- `error` ：JS 报错

## 三、KV 聚合 Key

> KV 命名空间：`TRACKER_AGG`
> TTL: 90 天（90 × 86400 = 7776000 秒）

| Key 模式 | Value | 含义 |
|---|---|---|
| `pv:{tab}:{YYYYMMDD}` | `Number` | 当日 PV |
| `pv:{tab}:total` | `Number` | 累计 PV |
| `uv:{tab}:{YYYYMMDD}` | `Set<uid>`（用 `JSON.stringify` 存数组） | 当日去重用户 |
| `uv:{tab}:total` | `Set<uid>` | 累计 UV（30 天内） |
| `evt:{tab}:{name}:{YYYYMMDD}` | `Number` | 当日事件计数 |
| `evt:{tab}:{name}:total` | `Number` | 累计事件计数 |
| `stay:{tab}:{YYYYMMDD}` | `{count, sumMs}` | 平均停留 = sumMs/count |
| `bounce:{tab}:{YYYYMMDD}` | `{sessions, bounced}` | 跳出率 |
| `device:{tab}:{YYYYMMDD}` | `{mobile, desktop, tablet}` | 设备分布 |
| `ref:{tab}:{YYYYMMDD}` | `{host: count}` | 来源 |
| `index:dates` | `[YYYYMMDD,...]` | 有数据的日期列表 |

> **降级写入策略**：UV 集合不会无限增长；每日 UV Set 上限 50000，超出忽略。

## 四、R2 原始日志（可选）

> Bucket: `tracker-raw`
> Key: `{YYYYMMDD}/{HH}/{sid}-{uuid}.json`
> Lifecycle: 90 天自动删除

每条 = 一次 `/api/track` body。

## 五、API 路由

| Method | Path | 说明 |
|---|---|---|
| POST | `/api/track` | 上报事件（支持 sendBeacon 的 `text/plain;application/json`） |
| GET  | `/api/stats?range=7d&tab=all` | 看板查询（聚合数据） |
| GET  | `/api/stats/raw?date=YYYYMMDD&tab=xx&limit=100` | 调试用（看原始日志，非必需） |
| GET  | `/api/health` | 健康检查 |

### `/api/stats` 返回
```jsonc
{
  "range": "7d",
  "from": "20260503",
  "to":   "20260509",
  "tabs": {
    "book_extract": {
      "pv":  1234,
      "uv":  456,
      "stayAvgSec": 88.2,
      "bounceRate": 0.32,
      "events": { "isbn_collect_run": 220, "isbn_collect_success": 198 },
      "devices":  { "mobile":300,"desktop":140,"tablet":16 },
      "referrers":{ "direct":120,"e.qq.com":50 },
      "trend": [ {"date":"20260503","pv":150,"uv":60}, ... ]
    },
    "script_gen": { ... },
    "ai_audit":   { ... },
    "summer":     { ... }
  }
}
```

## 六、CORS

允许来源（环境变量 `ALLOWED_ORIGINS`）：
- `https://book-hot-dashboard.pages.dev`
- `https://*.workers.dev`（调试）
- 后续腾讯云正式域名（如 `https://book.example.com`）

## 七、迁移到腾讯云路线（COS + EdgeOne）

1. **静态站点** → 部署到 COS bucket，EdgeOne 接管 CDN
2. **/api/\*** → EdgeOne 边缘函数转发到 Cloudflare Worker，**或**改写为腾讯云 SCF + COS（用 COS 当 KV 替代，事件按日期 append 到 JSON）
3. **客户端零改动** → tracker.js 上报路径已是相对路径 `/api/track`
