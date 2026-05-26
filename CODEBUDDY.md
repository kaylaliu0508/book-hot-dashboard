# CODEBUDDY 项目共享大脑

> 本文件由 **办公室电脑** 与 **家里电脑** 共同维护，每次切换设备前需更新「上次进展」与「待办」。
> CodeBuddy 启动时会自动读取此文件作为项目上下文。

---

## 1. 项目身份卡

| 项 | 值 |
|---|---|
| 项目名 | 图书热点营销工作台 (book-hot-dashboard) |
| 线上地址 | https://book-hot-dashboard.pages.dev |
| 部署平台 | Cloudflare Pages（已替代旧版 Vercel，README 中 Vercel 描述是历史） |
| Git 仓库 | https://github.com/kaylaliu0508/book-hot-dashboard |
| 默认分支 | `main` |
| 数据自动化 | GitHub Actions 每日定时跑（已被 commit `946b557` 关闭，目前不再自动更新热点） |
| 本地路径（办公室 Mac） | `~/CodeBuddy/20260518163935/repo` |
| 本地路径（家里 Mac） | _（首次 clone 后填写实际路径）_ |

---

## 2. 当前形态（一句话）

一个**纯静态前端 + Cloudflare Pages Functions** 站点，内含 7 个 tab 模块：
图书内容提取 / 一键口播脚本 / 图片文案 / AI 预审 / 图书选品台 / AI 营销助手 / 暑期专栏。
站点带轻量埋点系统（Pages Functions + KV，详见 `TRACKER.md`）。

---

## 3. 技术栈速查

- **前端**：原生 HTML/JS/CSS，部分模块用 iframe 嵌入子页（`/select/`、`/ai/`）
- **后端能力**：Cloudflare Pages Functions（`functions/api/*`）+ Cloudflare Workers（`workers/`）
- **AI 接入**：智谱、DeepSeek（见 `functions/api/zhipu/`、`functions/api/deepseek/`）
- **存储**：Cloudflare KV（埋点 90 天 TTL）
- **构建**：无构建，源即产物。`site_output/` 即站点根。
- **代理**：`workers/isbn-proxy.js`（ISBN 抓取代理）、`workers/tracker-api/`（埋点接收）

---

## 4. 关键目录与文件

```
repo/
├── site_output/           ← 实际部署到 Cloudflare Pages 的站点根
│   ├── index.html         ← 主站（7 tab 切换，含 TRACK_TAB_MAP）
│   ├── select/            ← 图书选品台
│   ├── ai/                ← AI 营销助手
│   ├── summer/            ← 暑期专栏
│   ├── stats/             ← 埋点看板
│   └── assets/
├── functions/api/         ← Pages Functions（后端 API）
│   ├── _tracker_lib.js    ← 埋点白名单 VALID_TABS（新增 tab 必改）
│   ├── track.js           ← 埋点上报
│   ├── stats.js           ← 看板数据
│   ├── chat.js / deepseek / zhipu / token / health.js
├── workers/               ← 独立 Cloudflare Workers
│   ├── isbn-proxy.js
│   └── tracker-api/
├── templates/             ← 老版热点页模板（功能已下线，文件留存）
├── data/                  ← 历史热点缓存
├── output/                ← 历史口播文案
├── docs/                  ← 内部文档
├── README.md              ← 早期 Vercel 版说明（部分已过时，以本文件为准）
├── TRACKER.md             ← 埋点系统手册（新增 tab 必读）
└── CODEBUDDY.md           ← 本文件（共享大脑）
```

---

## 5. 重要约束 / 不踩坑指南

1. **新增 tab 必须同步改 3 处**（来自 `TRACKER.md`）：
   - `functions/api/_tracker_lib.js` → `VALID_TABS`
   - `site_output/index.html` → `TRACK_TAB_MAP`
   - `site_output/stats/index.html` → `TAB_LABELS / TAB_COLORS / .tab-color-*`
2. **`site_output/` 是部署根**，所有用户能访问的 HTML/JS/CSS 都在这里。改完直接 commit 即生效。
3. **README.md 提到的 Vercel 是历史**：当前部署在 Cloudflare Pages，请以本文件为准。
4. **bot 自动更新热点已禁用**（commit `946b557`），不要再因为"热点没更新"去改 GH Actions。
5. **邀请码校验是前端逻辑**，不要把它当安全屏障，只是降噪。
6. **AI 调用走 Pages Functions 代理**，前端不直接持有 API Key。修改 prompt 注意改的是 `functions/api/*` 还是前端模板。

---

## 6. 优化历程（最新在最上）

> 格式：`日期 | 设备 | 摘要`。设备用 `office` / `home` 标识，便于知道在哪台电脑做的。

| 日期 | 设备 | 摘要 |
|---|---|---|
| 2026-05-26 | office | 书单中心新增关键词搜索框（跨7榜单+精选书单，命中行高亮5s）+ 各榜单加 by 周更新/6月推荐 备注 + 微信小店榜→腾讯营销（小店版）热投榜 + 选品池/书单中心 banner 对齐（commit 6ae6897） |
| 2026-05-26 | office | Excel 数据更新 100 期 + 新增 ISBN 列 + 自查恢复 13 个被跳过周次（commit e7798ab） |
| 2026-05-25 | office | 加入按钮即时反馈 + 选品池全选/多选/批量移除（commit b7acb6f） |
| 2026-05-25 | office | 修复埋点白名单 + 全量补全主站埋点 + 看板新增 3 个 tab（a66a0d8） |
| 2026-05-22 | office | 选品台框架优化 + 选品池→创意生产中心队列接力（8e4c1ad） |
| 2026-05-21 | office | 删除"自动更新热点数据"功能（946b557） |
| 2026-05-20 | office | 选品台 /select/ 节奏图改造、AI 助手悬浮入口（a1d6e03 等） |

---

## 7. 待办（TODO）

> 切换设备前请先勾掉已完成的、补充新加的。

- [ ] 暑期专栏 `/summer/` 页面体验优化
- [ ] AI 预审规则继续打磨（当前版本：参见 `functions/api/zhipu/` 内 prompt）
- [ ] 限频逻辑评估（当前 30 次/分钟是否够）
- [ ] 选品池→创意生产中心 全链路可用性回归测试
- [ ] 跑量书洞察 next 期数据补齐后接入（用户备注：从下一期开始新增）
- [ ] _（每次切设备前在这里加几条具体计划）_

---

## 8. 待回答的开放问题

- [ ] 是否需要把 README.md 重写为 Cloudflare Pages 版本？还是继续保留为历史归档？
- [ ] 埋点 KV 90 天过期，是否需要建一个长期归档机制？

---

## 9. 双设备协同 SOP（每天必看）

### 离开设备前（commit & push）
```bash
cd ~/CodeBuddy/20260518163935/repo  # 家里电脑路径不同
git status
git add -A
git commit -m "wip: 简短描述今天做了啥"
git push origin main
# 然后更新本文件第 6 节「优化历程」+ 第 7 节「待办」并一起 push
```

### 到达另一台设备时（pull & 接续）
```bash
cd <repo路径>
git pull --rebase origin main
# 打开 CodeBuddy，新对话第一句直接说：
#   "读 CODEBUDDY.md，继续上次的优化工作"
```

### 冲突处理
- 两台设备同时改了同一文件 → `git pull --rebase` 时按提示解决冲突
- 始终保持 `main` 干净；探索性改动开 `feature/xxx` 分支

---

## 10. CodeBuddy 使用约定

- **每次新对话开局**，先让 CodeBuddy 读本文件 + `TRACKER.md`
- 完成一项实质性优化后，**主动让 CodeBuddy 把摘要写入第 6 节**
- 修改 tab 相关逻辑时，**主动提醒 CodeBuddy 同步改 3 处**（见第 5 节第 1 条）
- 部署相关问题，**告诉 CodeBuddy 我们用的是 Cloudflare Pages，不是 Vercel**
