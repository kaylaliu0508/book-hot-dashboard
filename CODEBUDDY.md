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
| 2026-05-29 | office | 推荐书单换为预测推荐书单（教辅28/童书50/社科63/健康67=208本）+ 每个品类 rank 独立从 1；xlsx 嵌入封面 230MB→4.8MB（300px JPEG q82）；提取脚本落地 `scripts/extract_predict_books.py`（commit b19f76a） |
| 2026-05-28 | office | AI 预审 PROFANITY_2 规则上下文豁免（当妈的/做妈的/咱当妈的等家长身份称呼不再误判为粗话）（commit e7bc13c） |
| 2026-05-28 | office | 榜单中心左导航「重点品类深度」→「重点品类选品方向」（commit 860f014） |
| 2026-05-28 | office | ISBN 多源代理 4 源并行 + 单源 4.5s 超时（修复 hang 死，整体 ≤7s 必出结果）+ 失败提示用真实 attempted 链路渲染 + 增加豆瓣/当当/京东 一键查询按钮 + 「书单中心」→「榜单中心」（commit 2e52461 / 23a24df） |
| 2026-05-28 | office | 节奏图精简（突出选品 + 精炼痛点）+ 跑量书洞察移到小店版热投榜后 + 当月推荐书单改名未来推荐书单 + 删除预测爆品（commit bbafecf） |
| 2026-05-28 | office | 6 月核心洞察占比微调（教辅50/童书30/社科10/健康10）+ 7 月调整为教辅35/童书30/社科23 + Q4 调高社科健康/调低教辅；教辅深度选品 3 卡精简到 3 行结构（选品思路/核心需求/组品策略）（commit ed76534 / e59d5a1） |
| 2026-05-27 | office | 选品池→#p4/#p6 队列接力修复（creative-inbox.js 引入 + 挂载点 + go() 切 tab 时 refresh）+ W1-W4 节奏图分两行排版（暑期阶段 + 节日）+ 5/18 #2 替换为正版英语故事 2100 词图片（commit 9125704） |
| 2026-05-27 | office | 5/18 周跑量书洞察图片串了修复 + 5/25/18 周创意核心去除客单/链路/转化数据 + 5/18 #3 帝王家书恢复用户原版创意（commit 8d61bb9 / 8fcb5a8） |
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

- [ ] **PDD-CID 行动指南页面**：用户 5/29 想新建独立页面（参考截图：腾讯营销紫色横幅 + 1️⃣ 自归因接入 + 2️⃣ 投放建议 7 个维度卡 + 出价类型 A/B 双卡 + 3️⃣ 专属扶持），字体偏大版式。任务被中断，未实施。
- [ ] **CF Pages 部署回退**：用户 5/29 在 CF 控制台手动 Rollback 到 b19f76a 那次部署（hash `7e9027dd`）。需观察后续 main 推送是否正常自动构建。
- [ ] 暑期专栏 `/summer/` 页面体验优化
- [ ] AI 预审规则继续打磨（当前版本：参见 `functions/api/zhipu/` 内 prompt + `site_output/index.html` 内 PROFANITY_1~6 / ABS_1~2 / TIPHOOK_* / SHANYAN_* 等规则数组）
- [ ] 限频逻辑评估（当前 30 次/分钟是否够）
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

---

## 11. 🆕 另一台 Mac 首次接入指引（重要）

> 适用场景：你在新的 Mac（家里 / 出差用）上第一次拉这个项目，让 CodeBuddy 接续办公室电脑的"大脑"。

### Step 1：克隆仓库

```bash
# 在新电脑上选一个工作目录（路径可以随意，下面的目录名仅供参考）
mkdir -p ~/CodeBuddy && cd ~/CodeBuddy
git clone https://github.com/kaylaliu0508/book-hot-dashboard.git
cd book-hot-dashboard
git log --oneline -5    # 应该看到最新 commit b19f76a 或之后的
```

### Step 2：用 CodeBuddy IDE 打开这个目录

直接在 CodeBuddy IDE 里 **File → Open Folder...** 选 `~/CodeBuddy/book-hot-dashboard/`。
打开后 CodeBuddy 会自动检测到根目录的 `.codebuddy/rules/project/RULE.mdc` 并应用为项目级规则。

### Step 3：开新对话第一句话直接说

> **"读 CODEBUDDY.md 和 TRACKER.md，告诉我现在的项目状态、最近几次优化、待办列表。然后我们继续干活。"**

CodeBuddy 会读取本文件第 1~9 节作为完整上下文，包括：
- 项目身份卡（线上地址 / Git / 部署平台 / 默认分支）
- 当前形态、技术栈、关键目录、关键约束
- 最新优化历程（第 6 节，已记录到本次对话日期）
- 当前待办（第 7 节）
- 双设备协同 SOP（第 9 节）

### Step 4：填补本机本地路径

第 1 节末尾的 `本地路径（家里 Mac）` 字段还没填，第一次在新电脑跑通后告诉 CodeBuddy 把实际路径写进去（例如 `~/CodeBuddy/book-hot-dashboard`），下次切回办公室电脑能一眼看到两台机器的路径。

### Step 5：日常协同（每次离开当前电脑前）

```bash
# 1) commit 当天工作
git add -A && git commit -m "feat(xxx): 摘要"

# 2) 让 CodeBuddy 把今天的优化写入 CODEBUDDY.md 第 6 节
#    （直接说「把今天的优化记到 CODEBUDDY 第 6 节，注明设备 home/office」）

# 3) 一起 push
git add CODEBUDDY.md && git commit --amend --no-edit
git push origin main
```

### Step 6：下次到达另一台电脑时

```bash
cd <项目路径>
git pull --rebase origin main

# 打开 CodeBuddy 新对话第一句：
# "读 CODEBUDDY.md，看下昨天 office 的最后进度和待办，我们继续。"
```

### 🚨 不要做的事

- ❌ **不要** force-push（除非两台机器同时改了同一处冲突且本机版本是对的）
- ❌ **不要** 删除 `.codebuddy/` 目录（这里有项目规则 + automation 配置）
- ❌ **不要** 修改 `.gitignore` 把 `CODEBUDDY.md` / `TRACKER.md` 排除（它们必须进 git）
- ❌ **不要** 把这套规则放到 IDE 全局配置里（项目规则只对本仓库生效，其他项目不会被污染）

---

## 12. 关键链路速查表

| 想做的事 | 去哪个文件 |
|---|---|
| 改主站 7 个 tab 切换 | `site_output/index.html`（`go()` 函数 + `TRACK_TAB_MAP`） |
| 改 ISBN 内容采集 prompt | `site_output/index.html` 的 `isbnSysPrompt()` |
| 改 ISBN 多源识别（4 源代理） | `functions/api/isbn/lookup.js` |
| 改图片文案生成 prompt | `site_output/index.html` 的 `pageGenSysPrompt`/`adCopySysPrompt` 等 |
| 改 AI 预审规则（100+ 条正则） | `site_output/index.html` 的 `RULES = [{id,cat,level,re,desc,fix},...]` 数组 |
| 改 AI 预审语义层 prompt | `site_output/index.html` 的 `SEMANTIC_AUDIT_SYS_PROMPT` |
| 改榜单中心（选品台） | `site_output/select/index.html` + `select-app.js` + `select-data.js` |
| 改本周类目占比/月度趋势 | `site_output/select/select-data.js` 的 `MONTHS_DATA` |
| 改跑量书洞察 | `site_output/select/select-data.js` 的 `HOT_BOOK_BREAKDOWN` |
| 改 6 月节奏图（W1-W4） | `site_output/select/select-data.js` 的 `WEEK_RHYTHM` 的 `weeks/rows` |
| 改预测推荐书单（4 大品类 208 本） | `site_output/select/recommend-data.js` |
| 重新生成预测推荐书单 | `python3 scripts/extract_predict_books.py`（输入 `data/predict_recommend_2026.xlsx`） |
| 改重点品类深度选品 | `site_output/select/select-data.js` 的 `DEEP_CATS` |
| 改埋点白名单（新增 tab 必改） | `functions/api/_tracker_lib.js` 的 `VALID_TABS` |
| 改埋点看板 | `site_output/stats/index.html` |
| 改暑期专栏 | `site_output/summer/index.html` |
| 改 AI 营销助手 | `site_output/ai/index.html` |
| 选品池→创意生产队列 | `site_output/assets/creative-inbox.js` |
