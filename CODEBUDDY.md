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
7. **🚫 跑量品 Top3 必须取 ADQ 榜 #1/#2/#3，禁止自作主张挑选**（2026-06-24 用户两次纠正后固化）：
   - 三本代表书 = `WEEK_RANK_LIST[0].data.lists.adq_hot.items[0..3]`，按 rank 顺序，**不可用"销量跳量级 / conv 更高 / 题材更新"等主观理由替换**
   - 角色（黑马/长青/新爆款）和创意切入点可以基于多周轨迹自主判断
   - 但 **"挑哪三本"这个动作零自由度**，永远跟着榜单 #1/#2/#3 走

---

## 6. 优化历程（最新在最上）

> 格式：`日期 | 设备 | 摘要`。设备用 `office` / `home` 标识，便于知道在哪台电脑做的。

| 日期 | 设备 | 摘要 |
|---|---|---|
| 2026-07-15 | office | **周榜单同步 7/13 周（共 27 期）**：跑 `append_week_full.py` 完整解析（ADQ 20 / 微信小店 15 / 潜力 15 / cat_share 教辅71/社科12/童书12/健康4），47 张图 37.85MB→1.41MB。**本周结构性变化**：①**新王登基**——「高中数理化公式法二级结论秒解」首次登榜即直冲 #1，日销 20-30W 最高档、转化 6.6-7.6%，**唯一小程序渠道 Top10 爆款**，高中生付费力+暑期冲刺窗口验证；②**长青回落**——「文化常识 3000 问」6 周 #1 连霸被终结→#2（27 期全在榜纪录仍在）；③**「漫画初中物理」连续在榜 12 周稳居 #3**；④「预备一年级」跌出 Top20（上周还 #2 · 转化跃升 3× 后触顶回落，季节性刚需拐点）。跑量书 Top3 洞察新增 2026-07-13 期 + `HOT_BOOK_BREAKDOWN` 默认切到 7/13。cache buster `v=20260707-rank706b` → `v=20260715-rank713`。 |
| 2026-07-07 | office | **上一次同步 7/6 周（共 26 期）**：下线榜单侧「⭐ 精选」cross-badge；核实并修正 7/6 期跑量书 Top3 霸榜数据（#1 文化常识"7 周连霸"→"6 周连霸 #1"；#2 预备一年级追加"连续在榜 6 周·转化跃升 3×"；#3 漫画初中物理"8 周稳居"→"连续在榜 11 周·本周升至 #3"）。cache buster `v=20260707-rank706b`。（commit ced78cc） |
| 2026-06-24 | office | **第四次 SOP 实战 + 跑量品 Top3 规则固化**：周榜单同步 6/22 周（共 24 期，3 榜全量 adq_hot 20 / weixinshop 15 / potential 15，cat_share 教辅 50 / 社科 30 / 健康 15 / 童书 5 — 社科爆发从 15% 跳到 30%）。**[规则纠错] 第一次提交跑量品挑了 #1/#2/#5（高中文言文销量翻 5 倍）被用户纠正→必须严格按 ADQ Top3 = #1/#2/#3 取**，已固化到 `.codebuddy/rules/project/RULE.mdc` + `CODEBUDDY.md` 第 5 节硬约束 + 第 13 节 SOP Step3。最终三本：①文化常识3000问（5 周连霸 #1）②闷声发大财（新爆款）③预备一年级（4 周连续在榜，幼小衔接刚需）。`_infer_year` 基准 6/15→6/22。30 张图 28.5MB → 0.9MB。 |
| 2026-06-16 | office | **第三次 SOP 实战**：周榜单同步 6/15 周（共 23 期，cat_share 教辅 55 / 童书 15 / 健康 15 / 社科 15，**教辅占比从 6/9 的 45% 升到 55% — 期末复习+暑期预热双引擎**）。三本代表书：①《中国孩子必知的文化常识 3000 问》**4 周连霸** #1（销量 30-40W）— 黑马转长青；②《这样吃长更高》**4 周连霸** #2（10-20W）— 长青基本盘；③《漫画初中物理早知道》**新晋黑马**（6/9 #11 5-10W → 6/15 #3 10-20W）。xlsx 是单 sheet 精简版（与之前多 sheet 110 周表完全不同），新增专用脚本 `scripts/append_week_v2.py` 适配该格式（richData vm 抽图 + ISO 前缀重命名）。`_infer_year` 基准升级到 6/15。20 张图压缩 27.5MB → 0.6MB。 |
| 2026-06-14 | office | **新增 `/api/stats_total` 接口** 返回 since-launch 累计 PV/UV（绕开 Workers subrequest 50 上限）。**优化 `_tracker_lib.js` aggregateStats** 串行 KV.get 改 Promise.all 并发（14d 接口 117s 超时 → 4.6s 出结果，25 倍加速）。新增支持 `range=14d`。全站累计 PV 2135 / UV 369（截至 6/14）。 |
| 2026-06-09 | office | **6/9 部署 bug 修复 + 历史遗留清理**：发现线上 `/select/index.html` 还引用 6/2 留下的版本号副本 `rank-data-v20260602.js` / `select-data-v20260602.js`，导致 6/9 主文件更新对线上无效。彻底修复：①index.html 引用改回主文件名；②删除 3 个孤儿副本（v2.js + 两个 -v20260602.js）；③`_headers` 删掉 `/select/*.js` 兜底通配（会跟精确规则叠加致 cache-control 重复）；④CODEBUDDY 第 14 节「历史遗留」标记为已清理。从此榜单同步 SOP 只改主文件，不再维护副本。 |
| 2026-06-09 | office | **第二次 SOP 实战**：周榜单同步 6/9 周（rank-data.js 共 22 期，6/9 cat_share 手动写入 教辅 45 / 童书 30 / 健康 20 / 社科 5）。三本代表书：①《中国孩子必知的文化常识 3000 问》6/1 #13→6/9 #1，销量跳 7-10 倍**本周最大黑马**；②《减糖饮食》新登榜直冲 #3，conv 13.6% 全榜最高；③《这样吃长更高》3 周连霸长青基本盘。`_infer_year` 基准从 6/1 升级到 6/9。清理 48 张冗余 PNG（73MB）。 |
| 2026-06-02 | office | **预测推荐书单二次更新**：xlsx (2) → 224 本（教辅 40 + 12 / 童书 54 + 4 / 社科 63 / 健康 67），每品类 rank 独立从 1。脚本同步加 PIL 压缩兜底（PNG 也走 300px JPEG q82），256MB → 5MB；recommend-data.js 路径统一 .jpg。 |
| 2026-06-02 | office | **首次 SOP 实战**：周榜单同步 6/1 周（rank-data.js 增量追加 21 期 + HOT_BOOK_BREAKDOWN 新增 6/1 三本代表书 + 默认切到 6/1）。三本代表书：这样吃长更高（健康基本盘）、中国立体书（童书机会盘 · 霸榜 2 周）、漫画帝王家书（童书潜力品 · 霸榜 2 周）。新增 `scripts/append_week_to_rank_data.py`（增量追加 + 协同安全）。修复 `parse_rank_excel.py` 的 `_infer_year` 基准 5/25→6/1（commit 97444aa） |
| 2026-06-02 | office | 大脑文档第 13 节《周榜单同步 SOP》落地 + scripts/extract_predict_books.py 进 repo 智能识别两种布局（commit aa626cc） |
| 2026-06-01 | jiangxinbei | #p4 怪长电商书名导致搜索 0 命中修复 + 图书内容提取报告补齐目录/前言/核心内容（commit 252277c / 20e1392） |
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

---

## 13. 🆕 周榜单同步 SOP（用户口令："榜单同步"）

> 用户的预测推荐书单维护在腾讯企微在线文档（https://doc.weixin.qq.com/sheet/e3_AWsAewbeAMY48OWAY7uSzurF1VF2A?tab=wuq1tk）。
> 该文档需登录鉴权，CodeBuddy 工作区无法直接 fetch，所以采用 **半自动 SOP**：用户导出 xlsx → 拖给 CodeBuddy → 一键同步并部署。

### 用户的触发条件

当用户说出以下任一句话时，立即按本 SOP 执行：
- **"榜单同步"** / **"同步榜单"** / **"同步选品台数据"** / **"周榜单更新"**

且对话中附带了一个 **xlsx 文件**（一般是从企微文档导出的「2026 教育行业图书选品指南-直购链路」）。

### CodeBuddy 自动执行步骤

#### Step 1：把 xlsx 落到工作区

把用户上传的 xlsx 复制到 `data/predict_recommend_YYYYMMDD.xlsx`（按当天日期命名），便于追溯历史。

#### Step 2：跑提取脚本

脚本位于工作区根目录（**不在 repo 内**，不进 git）：`scripts/extract_predict_books.py`

```bash
cd /Users/wangziyue/CodeBuddy/20260518163935
# 把用户的 xlsx 拷到 data/ 目录（也可以直接传绝对路径）
python3 scripts/extract_predict_books.py data/predict_recommend_YYYYMMDD.xlsx
```

> 脚本支持命令行参数：第 1 个参数 = xlsx 路径，省略则默认读 `data/predict_recommend_2026.xlsx`。

脚本会自动：
- 解析 4 个 sheet（教辅/童书/社科/健康）
- 抽取每行 ISBN + 标题 + 作者 + 出版社 + 推荐投放时间 + AMS 准入情况
- 抽取每行的嵌入封面图，自动 JPEG 压缩到 300px 宽
- 写入 `repo/site_output/select/recommend-data.js`，每品类 rank 独立从 1

#### Step 3：自动产出本周【跑量书洞察】草稿

**🚫 硬性规则（2026-06-24 用户两次纠正后固化，零自由度）**：

**三本代表书 = ADQ 榜 #1 / #2 / #3，按 rank 顺序取，不允许替换。**

```python
# 取数代码（必须严格按此逻辑）
items = WEEK_RANK_LIST[0]['data']['lists']['adq_hot']['items']
top3 = items[:3]   # 永远是 rank 1/2/3
```

**禁止理由**：
- ❌ "#5 销量翻 5 倍，比 #3 更亮眼" → 不行
- ❌ "#3 数据下滑了，换 #4" → 不行
- ❌ "题材重复，换不同品类" → 不行
- ❌ "新登榜更有故事" → 不行

**允许自主判断的部分**（只在"已固定的三本"内做）：
- ✅ 角色标签（基本盘 / 机会盘 / 潜力盘 / 长青基本盘 / 新爆款 / 黑马 / 季节性刚需 等）— 基于多周霸榜轨迹
- ✅ persona（目标人群描述）— 基于品类 + 客单价场景推断
- ✅ creativeCore（创意切入点）— 按"明确受众 + 行动指南 / 认知信息差"两套话术框架（2026-06-09 用户敲定）
- ✅ creativeWarning（合规警示）— 健康/医疗类必加

基于以上规则产出 `HOT_BOOK_BREAKDOWN_BY_WEEK['YYYY-MM-DD']` 草稿，仿照 `select-data.js` 现有结构：

```js
{
  week: '2026-XX-XX',  // 本周 ISO
  top3: [
    {
      role:'#1 童书·立体书',     // 角色定位（基本盘/机会盘/潜力盘）
      roleClass:'basic',
      title:'XXX',
      isbn:'97870000XXXXX',
      image:'rank-images/imageXXX.jpg',
      cat:'童书',
      stats:[
        {icon:'💰', label:'客单', val:'¥XXX'},
        {icon:'📊', label:'日销售额', val:'XX-XXW', cls:'hot'},
        {icon:'🎯', label:'转化', val:'X.X-X.X%', cls:'hot'}
      ],
      persona:'目标人群一句话（年龄段+身份+场景）',
      creativeCore:'创意公式：场景切入 + 产品价值 + 用户感受'
    },
    // ...×3
  ]
}
```

**洞察生成原则**：
- 客单/销售额/转化等数据**必须基于真实数据**（从 xlsx 中提取或对照已有 ADQ 实战榜数据），不要瞎编
- 目标人群和创意核心可以基于 AI 推演，但要符合该书的品类常识
- 严禁出现广告法违禁词（保过/必上岸/包过/最/第一/独家），AI 预审规则会拦
- 客单价主推 50-150 元区间（用户上次明确要求过）

#### Step 4：把【跑量书洞察】草稿展示给用户确认

把生成的 3 张代表书卡内容渲染成 markdown 表格 + 改写建议给用户：

```markdown
## 本周跑量书洞察草稿（待你确认）

### #1 [品类·主题]
- 📕 书名：xxx | ISBN: xxx
- 数据条：💰 ¥xxx · 📊 xx-xxW · 🎯 x.x-x.x%
- 🎯 目标人群：xxx
- 💡 创意核心：xxx

（×3）

——————————————————
✅ 确认无误请回复"确认部署"
✏️ 想改某条请直接告诉我"#2 创意核心改成：xxx"
```

#### Step 5：用户确认后才 push

只有用户明确说"**确认部署**" / "**OK 部署**" / "**可以发布**" 后，才执行：

```bash
cd /Users/wangziyue/CodeBuddy/20260518163935/repo
git add -A
git commit -m "feat(select): 周榜单同步 YYYYMMDD - 4 大品类 XX 本 + 跑量书洞察 #X 期"
git push origin main
```

CF Pages 几分钟自动构建部署到 https://book-hot-dashboard.pages.dev/select/

#### Step 6：把摘要写进第 6 节优化历程

在 `CODEBUDDY.md` 第 6 节最上面追加一行记录，方便后续追溯每周更新。

### 不要做的事

- ❌ 不要直接 push，**必须等用户确认跑量书洞察文案**
- ❌ 不要瞎编客单价/转化数据 — 没有真实数据时直接标注 `(待补充)` 让用户填
- ❌ 不要把 xlsx 二进制文件 commit 到 git（`data/*.xlsx` 走 .gitignore，仅本地保留）
- ❌ 不要修改 `creativeCore` 里的客单价表述方向，主带 50-150 元（教辅/童书）/ 39-79（社科）/ 29-49（健康）

---

## 14. 🚀 部署自动化（已落地）— push 即生效

### 现状（2026-06-02 起）

通过 `site_output/_headers` 配置，**所有数据 JS push 后 5 分钟内全网自动生效**，无需手动 purge 缓存或加版本号：

| 路径 | CDN 缓存 | 生效时间 |
|---|---|---|
| `/select/rank-data*.js`（含 v 版本副本） | 5 分钟 | push 后 ≤ 5 min |
| `/select/select-data*.js` | 5 分钟 | ≤ 5 min |
| `/select/select-app*.js` | 5 分钟 | ≤ 5 min |
| `/select/recommend-data*.js` | 5 分钟 | ≤ 5 min |
| `/select/bench-data*.js` | 5 分钟 | ≤ 5 min |
| `/index.html` / `/*/index.html` | 1 分钟 | ≤ 1 min |
| 静态资源（图/字体/CSS） | 1 小时 ~ 7 天 | 按变化频率分级 |

### CodeBuddy 在更新代码时不再需要做的事

- ❌ ~~每次手动加 `?v=20260602b` 缓存破坏参数~~
- ❌ ~~每次重命名文件为 `rank-data-v20260602.js` 来绕缓存~~
- ❌ ~~让用户去 CF 控制台 Purge Cache~~
- ❌ ~~让用户去 CF 控制台改 Build output directory~~

### CodeBuddy 仍然要做的事

- ✅ commit + push 后**主动用 curl 验证 5 分钟内线上是否同步**（确认 `_headers` 在新部署里仍有效）：

```bash
# 验证模板（替换 EXPECTED_KEYWORD 为本次更新的关键内容关键词）
curl -sSL "https://book-hot-dashboard.pages.dev/select/rank-data.js" | grep -c "EXPECTED_KEYWORD"
```

- ✅ 如果 5 分钟后 curl 还拿到老内容，**先看 `_headers` 是否被改坏了**（cache-control 应该包含 `s-maxage=300`），其次检查 CF Pages Build output 配置是否变动

### 历史遗留：双文件名同步（已于 2026-06-09 完成清理）

~~`site_output/select/rank-data-v20260602.js` 是 6/2 那天紧急绕 CDN 留下的副本~~

✅ **2026-06-09 已彻底清理**：
- `select/index.html` 引用改回主文件名 `rank-data.js` / `select-data.js`
- 删除三个孤儿副本：`rank-data-v2.js` / `rank-data-v20260602.js` / `select-data-v20260602.js`
- _headers 也清理了 `/select/*.js` 兜底通配（会跟上面精确规则叠加导致响应头出现两次 Cache-Control）

**未来教训**：榜单同步 SOP 只需更新 `rank-data.js` / `select-data.js` 主文件即可，**不要再搞带版本号的副本**——_headers 通配的 5 分钟 CDN 缓存已彻底解决问题。
