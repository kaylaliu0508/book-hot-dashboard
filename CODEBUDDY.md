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
| 2026-10-15 | office | **灵感中心 AI 生成模块集中修复**（commits `3193b46` `9b2faaf` `d4ae647` `083ce81` `bcaba42`）：① **思维链吃光 token（总根因）**：6/29 `4b5e5b3` 把 deepseek 代理强制改写为 `deepseek-v4-flash`，该模型**默认开启思维链**，`reasoning_tokens` 计入 `max_tokens` → 非流式返回 `finish_reason=length` + 空 content（口播脚本「返回格式异常」），流式则先长时间只吐 `reasoning_content`（图书内容提取卡在 30%「第3步：基于联网数据生成报告」）。修复：`functions/api/deepseek/chat/completions.js` 对未显式指定的请求统一注入 `thinking:{type:'disabled'}`，`functions/api/chat.js`（AI 营销助手）同步；前端 `scriptCallAI`/`callApi` 也显式关闭，空内容时报明确错误（不再「采集完成 0 字」）。② **智谱搜索限流**：单次 ISBN 采集 = 1 识别 + 8 主查询 + 最多 8 降级宽搜 ≈ 17 次，原 10/min/IP 正常使用即 429 → 调到 30（日熔断兜底）。③ **图片文案 ISBN 识别必失败**：`_titleSpaceToComma`（`d3b67a2` 新增）嵌套定义在 p4 `autoLookupISBN` 内，p6 顶层 `adCleanName` 调用时 ReferenceError，被 try/catch 静默吞掉 → 回退浏览器直连 isbn.work（**无 CORS 头必失败**）/ Google（429）→「无法识别该ISBN」。已提升为顶层函数；`runAdGen` 改为复用 `adAutoLookup`（走 `/api/isbn/lookup` 代理）并加并发去重。④ **ISBN 代理超时**：CF 边缘回源 isbn.work 成功约 2.7s、慢时 >7s，超时 7→10s；前端 `fetchIsbnLookup` 遇 timeout 失败自动重试 1 次。**验证**：线上无注入回归——内容提取 52s 出 5 维报告、口播 15s 出 3×4 候选、图片文案 26s 出四版本、AI 预审语义复审 9s 完成。**教训**：换模型后必须回归所有 LLM 调用点；`try{}catch(e){}` 空吞异常会把 ReferenceError 伪装成「数据源失败」，排查先在页面里直接调函数看异常。AI 营销助手需邀请码，未做端到端验证。 |
| 2026-10-30 | office | **修复 10/19+10/26「腾讯营销（小店版）热投榜」无图片/ISBN（列错位）**（commit `91bb8f0`）：用户反馈小店版榜 15 条全部不显示封面。**根因链**：`parse_rank_excel_v2.parse_block` 有两条列映射路径——传了 `header_row` 就按**表头文字动态映射**（HEADER_ALIASES 能认出「图书ISBN编号」列），没传就退化到**位置 schema**；而 weixinshop 的位置 schema `['rank','title','cat','price','image',...]` **不含 isbn**，一旦退化就 C列(ISBN)→cat、D列(cat)→price 整体错位、image 读空。`weixin_header` 来自 `weixin_title`，而 `weixin_title = find_title_row(0, ['微信小店广告热投','小店版','腾讯营销（小店版）'])`——**本期小店榜标题文案变成「【微信小店-小店投放】热投优品」，三个关键词全不匹配** → `weixin_title=None` → `weixin_header=None` → 退化错位。更隐蔽的是：数据行兜底 `weixin_start,weixin_end=25,39` 恰好命中本期布局，所以 title 照常解析出来、只有 isbn/image 错位，页面看着"有书名没图"。**修复**：`weixin_title` 关键词补 `'微信小店'`/`'小店投放'`（覆盖各种标题变体）。⚠️ **不能用 '热投优品' 做关键词**——ADQ 榜标题「爆品榜单：近一周ADQ热投优品」也含它，`find_title_row` 从 r=1 扫会先命中 ADQ 标题行；用 '微信小店'/'小店投放' 安全（ADQ 标题不含）。**修复手法**：改脚本后直接重跑 `FORCE_YEAR=2026 append_week_multisheet`——该脚本**同 iso 自动覆盖**（by_iso 字典，不会重复追加），干净地用正确数据覆盖这两期、新抽 26 张小店榜封面，adq/potential/cat_share 不变仍 42 期。bump `rank-data 20261030-rank1026 → -rank1026b`。**启示**：以后加周榜，验证**不能只看 adq_hot**，要抽查 weixinshop/potential 的 image+isbn 覆盖率（本次正因只验了 adq Top3 而漏掉）。浏览器验证小店榜图片：榜在未激活容器里 `img.naturalWidth=0x0` 属懒加载正常（非坏图），最可靠是 iframe 内 `new Image()` 加载实测（本次 300x306 解码成功）；注意并发 new Image 会偶发 onerror 抖动，需单张加 `?cb=` 重试复核。 |\n| 2026-10-30 | office | **11 月预测上线（预算分配 + 周节奏图）**（commit `c1b7c57` + `645f183`）：用户要求先拟初版、确认后才推送（本轮经两次迭代定稿）。**定稿参数**：整月强度 `total=62`（维持占位，**不因双11上调**——用户明确"不过分强调双11"）；品类占比 **教辅25 / 健康30 / 社科25 / 童书20**（合计100）；节奏图优先级 **教辅P0 / 健康P0 / 社科P1 / 童书P1**（注意优先级与占比不完全对应，是用户按抓手重要性指定的）。**改动点**：① `select-data.js` `MONTHS_DATA` 11月行（占比+focus 文案，`current:true` 从 10月 移到 11月——全年节奏图 `chartYearTrend` 靠这个高亮当月）；② 新建 `WEEK_RHYTHM_NOV`（4周×4品类，立冬11/7+双11 11/11+小雪11/22+感恩11/26；双11 **不喊"全年大促"**，落到品质囤书/精品绘本礼盒/知识礼盒；日历送礼贯穿教辅古诗词&励志金句日历·社科2027精品日历·童书儿童日历；下旬进寒假预习/亲子阅读预热）；③ 注册表 `WEEK_RHYTHM_MONTHS` 11月置顶=当期、10月转往期；④ **默认切月自执行函数**新增 `m>=11||(m===10&&d>=28)` 分支 + catch fallback 同步切 NOV（当前 10/30 已切 11月）。用户 4 点引导全部落地（童书早教启蒙/识字；教辅语文作文/古诗词日历/励志金句日历/数理化硬提分；社科企管书/年末企业复盘/规划新年布局；全品类寒假预热）。**⚠️ 关键坑：预算分配有两处数据源，必须同时改**——除 `MONTHS_DATA`（驱动全年节奏折线图）外，`index.html` 的「品类预算建议」KPI 面板（`#future-block-insight`，第 474-485 行）是**独立硬编码**的、**不读 MONTHS_DATA**，只改 js 会导致页面 KPI 仍显示上月旧值（本次就先漏改、页面仍显示"教辅30%/期中备考"，`645f183` 补修）；同步要改的还有该面板标题「X月品类预算建议·本月(X)→下月(X+1)」、左侧导航 `rsn-name`、banner「预判 X 月」文案、周节奏图标题 `#rhythmMonthLabel` 静态默认值。**全站 title/h1「2026年10月」保持不动**：代表当前运营月（最新榜单10/26、推荐书单仍10月），10月底做11月预测属正常"提前布局"，不矛盾。bump `select-data 20260928-oct10e → 20261030-nov-forecast`。**验证坑复现**：CF 构建中途 curl 多次拿到**截断文件**（HTTP 000 网络抖动 + size 偏小如 102275/36918），**必须循环重试到 size == 本地字节数**（本次 select-data.js 本地 113767）再做 node 解析，否则 `new Function` 会因文件截在半行报 SyntaxError。浏览器验证：预算面板 KPI 25%/20%/25%/30%、标题「11月…本月(11月)→下月(12月)」、节奏图 label「11 月」、节奏图含古诗词日历/早教启蒙/企业管理等 11月专属内容，默认切月 `WEEK_RHYTHM_DEFAULT_KEY=2026-11`。 |\n| 2026-10-30 | office | **推荐书单补充 11月期新书 114 本（4 品类）**（commit `a3dfe2a`）：数据源 `~/Downloads/【腾讯图书】2026预测书单（月维度准入评估） (1).xlsx`（11月期，591MB，5 sheet：`3.16新增AI书籍` + 教辅/童书/社科/健康，474 张图）。沿用**只补新书**策略（按 ISBN 归一化去重，已有书月份/ams/rank 一律不动）：教辅 +45、童书 +23、社科 +20、健康 +26，**库 421→535 本**（童书116/教辅135/社科120/健康164）。新脚本 `scripts/prepend_recommend_nov2026.py`（repo 外不入库）。**⚠️ 与 9-10月期脚本的两个关键差异（必须单开脚本，不能复用 `prepend_recommend_oct2026.py`）**：① **图片机制变了**——旧文件是 Excel365 `_localImage`（`xl/metadata.xml` + richData 链），本文件**没有 metadata.xml / richData**，474 张全走传统 `drawing` 锚定（5 个 drawing），`build_chain` 必须容错否则 `KeyError: 'xl/metadata.xml'`；② **drawing 媒体路径会静默丢图**——drawing xml 位于 `xl/drawings/`，其 `_rels` 的 Target 形如 `media/image112.png`（**相对 drawing 自身目录，且没有 `../` 前缀**），正确路径是 `xl/drawings/media/image112.png`，旧脚本拼成 `xl/media/...` → 不在 namelist → `mp` 变 None → **新书有图 0 张**（不报错，静默失败）。修正后 **114/114 本封面全部提取成功**。**未入库 45 本**：源表缺 ISBN（教辅1/社科3/**健康41**），按 ISBN 去重策略无法收录，其中含《本草纲目》节气养生年历等日历类书——**日历类缺口仍未补上**（需源表补 ISBN 才能入）。**「3.16新增AI书籍」sheet 12 本中 11 本已在库、1 本新书（deepseek+AI炒股一本通）按上次口径跳过**（不属于 4 大品类，无对应分组）。**bump `recommend-data 20260928-forecast910 → 20261030-forecast1114`**。**验证坑**：CF 构建中途 curl 会拿到**截断文件**（本次先拿到 36918 字节、node 解析报 `SyntaxError: "image": ;`，完整应为 135954 字节），**不要据此判定失败，等构建完成后重试**即可（重拉即 135954/4230 行，与本地一致）。**推荐书单的浏览器验证入口**：不是直接可见的 tab——要先切选品台内 `subtab`「榜单中心」，再点左侧 `⭐ 未来推荐书单（月维度）` 分组下的 4 个品类 item（📖教辅/🧸童书/🌿健康/🏛社科）；`getRankItems('recommend')` 走 `RECOMMEND_BOOKS`（`select-app.js:292`）。验证结果：渲染 252 张封面、首图 `forecast-教辅-9787570123001.jpg`（= 11月新书《初中学霸手账》）、页面含《本草纲目百病食疗1000问》。**另注**：库内跨品类重复 ISBN 37 条（唯一 454 / 条目 535），属历史累积（同书在不同品类各记一次），本次未改动。 |\n| 2026-10-30 | office | **周榜单同步 10/19 + 10/26（第 41、42 期）**（commit `7da6685`）：数据源 `~/Desktop/近双周榜单.xlsx`（**2 个 sheet `10月19日`/`10月26日`**，各 ADQ20+小店15+潜力15，68 张内嵌图 46.2MB→1.99MB，每期 35 张）。照旧用 **`FORCE_YEAR=2026 python3 scripts/append_week_multisheet.py <xlsx>`**。期数 40→**42**。**cat_share 走势**（10/13→10/19→10/26）：教辅 25→**40**→28、健康 35→28→34、社科 30→22→26、童书 10→10→12。**跑量书洞察**新增 `2026-10-26`/`2026-10-19`（均严格 ADQ Top3，已校验 ISBN 与转化率一致）：《我是中国人 所以我知道》23 期在榜，10/19 跌 #3 后 10/26 重回 #1，**但转化连续两期下滑 8.6-9.6%→6.6-7.8%→4.7-5.7%（近三月最低）**，量在效率退，是素材疲劳/人群泛化信号，已在洞察里写成提醒；《抗炎饮食》10 期在榜、10/19 首次登顶 #1、10/26 回落 #2，转化稳在 9.8-10.3%；《本草入膳》4 期 #10→#7→#7→**#3** 单调爬升（本期最值得跟的上升品，49-69 元食疗切入）；《漫画讲透易经养生+中医养生1000问》11 期老品 10/19 冲到 #2 历史最高（**99 元高客单进 Top2**）后回落 #8。fallback 切到 10/26。**bump `rank-data 20261015-rank1013 → 20261030-rank1026`**。**本次新确认的两个认知**：① **Top3 图片序号不连续是正常的**——本期 10/19 的 Top3 是 `image2/image8/image1`（上期是连续的 1/2/3）。图片经 `richValueRel` 的 **vm index 按单元格引用**映射（`parse_rank_excel_v2.load_xlsx_meta` 第 118 行 `vm_to_img`），`rename_and_compress_images` 只做 `{iso}-{stem}.jpg` 重命名、不重排对应关系。**交叉验证法**：同一本书跨期应指向同一 media（抗炎饮食 10/19 与 10/26 都是 image2、我是中国人均 image1 ✅）。② **`cls:'down'` 在洞察 stats 里是无效的**——CSS 只定义了 `.kpi-sub.down`，没有 `.stat-chip.down`（stats 渲染走 `select-app.js:1253` 的 `stat-chip ${s.cls}`），写了不报错但无样式；已改回中性，别再给 stats 塞未定义的 cls。**验证坑**：curl 单张图片偶发 `HTTP 000`（本次 `2026-10-26-image2` 首次 000、重试 200 且 size 与本地一致），**是网络抖动不是部署失败，务必重试 2-3 次再下结论**。浏览器验证：首页 iframe `#selectIframe` → 切「选品工作台」tab 等加载 → 榜单期数下拉 **42** 且默认选中「10月26日 \| 2026-10-20 至 10-26」，`.hot-card` 三张 ISBN 与 ADQ Top3 一致、「🔥 霸榜 23/10/4 周」自动计算正确；大盘切换器仍为「10月1日 - 10月15日 最新」（未受影响）。 |\n| 2026-10-23 | office | **大盘链路指标同步 10/1-10/15（新增 `2026-10-01-to-15` 期，commit `3b24b92`）**：数据源 `~/Desktop/10月1日-10月15日大盘指标.xlsx`（单 sheet，**左右两表并排**）。左表 A-F = 品类×客单价（A 段名、B-F = 品类/消耗占比/CPM/CTR/CVR/ROI，段头在 row 2/9/15/21/27，**仅第 1 段有表头行「品类」需跳过**，每段跟 教辅/童书/社科/健康/整体 5 行）；右表 H-M = 客单价×链路（H 段名、I-M 数据，段头在 row 3/7/11/15/19，**段头行自带该区间整体数据**，后跟 小店直购/直播/直购 3 行）。**⚠️ 左右两表段头行是错开的**（左 2/9/15/21/27 vs 右 3/7/11/15/19），不能按同一套行号解析。新脚本 `scripts/parse_oct_bench.py`（**按列字母 A-F/H-M 定位**）+ `scripts/render_oct_bench_js.py`（生成片段并插入 bench-data.js；scripts/ 在 repo 外不入库）。**⚠️ 不能复用 `parse_sep_bench.py`**：那版硬编码右表「段名 col8(I)、数据 col9-13(J-N)」，本表右表是段名 H、数据 I-M，**整体偏移 1 列**，照搬会静默读到错列（不报错但全错）。单位换算与历史期一致：share×100(百分比)、cpm 原样、ctr×100、cvr×100、roi 原样，均 1 位小数。**⚠️ 数据修正（已与用户确认）**：0元-50元区间·**健康 ROI 源表 16.0 → 1.6**。判定依据：该区间整体 ROI 仅 1.5，而健康占 46% 消耗（按 16 加权整体应在 8 左右，与 1.5 矛盾）；历史 9/1-9/15 同期健康 1.5，其余价格段健康 1.6/2.0/1.8/2.9 → 1.6 手误。期次 8→**9**，新期置顶 `isLatest:true`、9/1-9/15 转 `false`；**`CURRENT_BENCH_PERIOD` 由 `BENCH_PERIODS.find(p=>p.isLatest)` 驱动**（bench-data.js:821），所以只需改 isLatest 即可自动切到新期，兜底常量 `BENCH_CAT_PRICE`/`BENCH_PRICE_CHANNEL` 也会跟着走。**bump cache buster `bench-data 20260924-bench915 → 20261023-bench1015`**。验证：curl 取线上 bench-data.js 用 node 执行校验（期数 9 / isLatest 唯一 / 各区间占比合计均 100 / 健康 roi=1.6）+ **浏览器实际渲染**（首页 iframe `#selectIframe` → 切到「选品工作台」tab 并等加载 → 期间切换器 9 个按钮，首个「10月1日 - 10月15日 最新」且 active；表格渲染健康行 `46% 53 3.1% 6.2% 1.6`；点第 2 个按钮切回 9 月期正常，教辅 `64% 44 1.7% 11.2% 1.5`）。**环境坑（复用上次）**：首页 378KB，`playwright open` 后需 **sleep 20s+** 等 `readyState=complete`，过早 eval 拿到空 DOM；iframe 是 `loading="lazy"`，必须先把 `pg-pselect` 设为可见（`.pg` 去 on、给它加 on）才会真正加载；`const` 声明不挂 window，iframe 内 `W.BENCH_PERIODS` 取不到（显示 '-' 属正常），要查 DOM 而非变量。 |\n| 2026-10-15 | office | **周榜单同步 10/08 + 10/13（第 39、40 期）**（commit `12cdeef`）：数据源 `~/Desktop/周榜单更新.xlsx`，**2 个 sheet（`10月8日` / `10月13日`）**，各 ADQ 20 / 小店 15 / 潜力 15，70 张内嵌图 68.75MB→2.69MB（10/08 49 张、10/13 48 张）。用 **`FORCE_YEAR=2026 python3 scripts/append_week_multisheet.py <xlsx>`**（多 sheet 一次追加，脚本按 sheet 名解析日期、升序后合并、新的最靠前）。**⚠️ 必须带 `FORCE_YEAR=2026`**：`parse_rank_excel_v2._infer_year` 默认规则是「5/25 之后（含 6-12 月）归 2025」，不带会写成 `2025-10-08/13` 并插到列表末尾（看起来像没生效）。结果 38→**40 期**。**cat_share 三期走势**：9/28 教辅29/童书36/健康11/社科24 → 10/08 教辅**37**/童书12/健康25/社科25（开学回流，教辅冲高）→ 10/13 教辅25/童书10/健康**35**/社科**30**（长假后教辅回落、健康重新登顶、社科持续走强）。**跑量书洞察**新增 `2026-10-13` 与 `2026-10-08` 两期（均严格 ADQ Top3，脚本校验 ISBN 一致）：《我是中国人 所以我知道》**21 期在榜**，7-8 月连续霸榜 #1，9 月回落 #2-#4，**10/08 重回 #1**（日销 30-40W 为近期高位，教辅开学季回流）；《抗炎饮食》8 期在榜长期 Top3（50 元，自用 + 送长辈双场景）；《抗炎食物清单》3 期在榜、9/28 曾登顶 #1，转化 10.8-12.3% 为三书最高（40 元引流款）。fallback 常量切到 10/13。**bump cache buster `rank-data 20260928-rank928 → 20261015-rank1013`**，4 分钟后 curl 验证线上「共 40 期数据」+ 两期 iso/label + cat_share + Top3 + 封面 200，全部通过。**两个环境坑**：① **`/select/` 直开会被邀请码校验 `location.replace('/')` 跳回首页**（select/index.html:55，仅 `window.top===window.self` 且非 localhost 时触发）——浏览器直接 goto `/select/` 一定拿不到选品台，正确验证方式是首页 iframe（`#selectIframe`，在「选品工作台」tab 内且 `loading="lazy"`，需先切 tab 并等加载）或 `curl -sL`（308 需跟随）；② 首页 `index.html` 达 378KB，playwright `open` 后 `document.readyState` 常仍为 `loading`，eval 过早会拿到空 DOM，需 sleep 10s+。 |\n| 2026-09-28 | office | **周榜单同步 9/28（第 38 期）**：数据源 `~/Desktop/图书周榜单9.28.xlsx`（**单 sheet `Sheet1`**，布局：ADQ = A-J 列行 3-22、微信小店 = A-J 列行 25-39、**潜力榜 = L-Q 列行 25-39**，与 9 月三期一致；F/Q 图片列显示 `#VALUE!`，走 `_localImage` 富数据，49 张内嵌图）。用 **`python3 scripts/append_week_full.py <xlsx> 2026-09-28`**（单 sheet + 指定 ISO 日期的场景就用它，**不需要 `FORCE_YEAR`**，日期由参数给定）。脚本靠 `find_title_row` 动态定位三块：A 列找「爆品榜单：近一周ADQ」→ADQ、A 列找「腾讯营销（小店版）」→小店、K/L 列找「潜力爆品」→潜力；cat_share 从 r1-r3 找含「类目占比 / 品类」的列、右 1 列读占比（本次落在 L/M 列行 4-8）。结果：37→**38 期**，ADQ 20 / 小店 15 / 潜力 15，49 张图 30.28MB→1.37MB。**cat_share 剧烈变化**：童书 **11→36** 爆发、健康 **35→11** 大幅回落（教辅 32→29、社科 22→24）——开学季教辅短爆发后，长假前童书（亲子共读 / 百科套装）接棒。**跑量书洞察**新增 `HOT_BOOK_BREAKDOWN_BY_WEEK['2026-09-28']`（严格 ADQ Top3，已用脚本校验 ISBN 完全一致）：#1《抗炎食物清单》40 元 10-20W 转化 10.2-12.3%（**首次登榜即 #1**）/ #2《抗炎饮食》50 元（**连续 3 期 #1 后回落 #2**）/ #3《我是中国人 所以我知道》40 元（**19 期在榜超长青**，6 月起长期霸榜 #1，本期回落 #3）。fallback 常量 `HOT_BOOK_BREAKDOWN` 切到 9/28（避免重现 9/03「跑量书显示旧期数据」）。bump cache buster `rank-data 20260924-rankimg → 20260928-rank928`，commit `b74399d`，4 分钟后 curl 验证线上「共 38 期数据」+ `iso 2026-09-28` + label `9月28日 \| 2026-09-22 至 09-28` + 三张封面 200。**两个坑提醒**：① 本次 xlsx 的 L 列**同时承载三块内容**——「10月预测推荐书单」（L1 / M2）+「类目占比趋势」（L3 标题、L4-M8 数据）+ 潜力榜（L23 标题、L24 表头、L25-Q39 数据），**别把 L1 的预测书单误当潜力榜标题**（潜力榜关键词是「潜力爆品」在 L23）；② `vm` 有 1 处重复（F31 vm=20，与 F22 相同），核对后是**同一本书同 ISBN**——人民日报中考语文作文源题 `9787511590473` 同时出现在 ADQ #20 与小店 #7，图片复用正确、不是错位（遇到 vm 重复先查 ISBN 再判断是否真错位）。 |
| 2026-09-28 | office | **10 月选品台上线 + 全年趋势图校正 + 新增日历选品方向**（commit `5165132`）：① 全站 9 月 → 10 月切换：title / H1 / 品类预算建议 KPI（**教辅30 童书20 社科20 健康30**）/ by 周节奏图标签；② 新增 `WEEK_RHYTHM_OCT`（10 月 by 周节奏图，教辅/健康/童书/社科 四行，每行 span 合计 4）；③ **全年趋势图校正（重要认知，下次别再踩）**：堆叠柱高度 = 四个品类拆分值之和，**恒等于 100（拆分值是占比，不是总量）**，所以 12 根柱子一样高、只表达品类结构；**高低差异全在折线 `total` 上**——想改某月「高度」要动 `total`，不是拆分值。用户要求「6 月最高」时，正确做法是**压低 9 月（100→80）**；我第一版误把 6 月 `total` 提到 110，反而因 `yAxis` 写死 `max:100` 让折线超出上限被裁（用户反馈「6 月高得显示都不完整」）。最终 6 月保持 90 为全年峰值、9 月压至 80，并顺手把 `yAxis.max` 100→110，给恒高 100 的柱子留 10 的余量（原本正好贴死顶边）。④ **新增日历选品方向**：社科 W3-W4「📅 日历 · 节日送礼 + 年末预热」（故宫/诗词/插画/生肖，10/16 起铺品，跑 双11 → 元旦 → 春节长线）；健康 W4「📅 花草日历 · 银发修身养性」（花卉/植物图鉴日历，接住霜降后送长辈那条线）；⑤ 深度选品方向 `DEEP_CATS` 同步 10 月视角，社科国学卡 + 健康霜降送礼卡各加一条日历 subCat 与 tip——**受 `.formula-grid` 固定 `repeat(3,1fr)` 三列约束（每品类同构 3 张：基本盘/机会盘/潜力品），日历并入现有卡而非新增第 4 张**，否则会掉到第二行只剩 1 张配 2 个空位。bump cache buster `select-data 20260928-oct10e` / `select-app 20260928-oct10c`。**验证坑**：`curl https://book-hot-dashboard.pages.dev/select/index.html` 返回 **308 重定向到 `/select/`**，不带 `-L` 会拿到空内容、误判成部署失败，必须 `curl -sL`。push 后 4 分钟验证：线上 title `2026年10月` + 两个 cache buster + select-data.js 含「日历」9 处 / `6月 total:90` / `9月 total:80` + select-app.js `max:110`，全部通过。**遗留**：书库 421 本中日历类 0 本，方向卡已上但书单里没实物（见待办）。 |
| 2026-09-28 | office | **预测推荐书单补充 9-10月新书（346→421 本）**：数据源 `~/Downloads/【腾讯图书】2026预测书单（月维度准入评估）.xlsx`（**5 个 sheet：3.16新增AI书籍 / 教辅 / 童书 / 社科 / 健康**）。用户确认策略 = **只补新书**（按 ISBN 归一化去重追加，已有 346 本的月份/准入/rank 一律不动）+ **AI sheet 12 本保持原分类**（这 12 本 ISBN 全已在库中，不建新分类）。结果：新增 **75 本**（教辅7·10月 / 童书14·10月10+9月4 / 社科5·Q4 / 健康49·10月29+9月19），**75 本全部提取到内嵌封面**（600px JPEG q82，4.1MB）。新脚本 `scripts/prepend_recommend_oct2026.py`。**四个坑（下次复用必看）**：① **自闭合 `<c ... />` 标签会让 `(.*?)</c>` 正则跨标签错位**——必须先从原始 XML 抽 `vm` 属性，再 `re.sub(r'<c\b[^>]*/>','',s)` 删自闭合标签解析数值，顺序反了就全乱；② **同一个 xlsx 里图片机制不统一**——教辅走 `_localImage`（vm 链，见上一条 9/24 记录），童书/社科/健康走**传统 drawing 锚定**（`xl/drawings/drawing1-4.xml`，vm 全为 0），两种都要实现，按「vm 优先、回退 drawing 行号」兜底；③ **drawing XML 带 `xdr:` 命名空间前缀**（`<xdr:oneCellAnchor>` / `<xdr:row>`），正则必须写成 `<(?:xdr:)?row>` 才匹配得到（踩过一次，drawing map 全是 0）；④ Excel 内部有重复 ISBN（健康 135 行 → 仅 49 本新增，40 行是同书重复/跨月份重列），必须边遍历边 `exist.add()` 做内部去重，另外月份值有 `7月份` 需规范化成 `7月`。**遗留待办**：`forecast-images/` 里 62 个 8 月遗留 PNG **未压缩共 113MB**（单张最大 3.1MB，平均 1.8MB），与本次新增的 40KB 级 JPEG 严重不协调、拖慢书单页加载；因用户要求「已有书不动」（改 image 字段算动），本次未处理，待用户点头后再压缩并同步改 62 条 `image` 路径。 |
| 2026-09-24 | office | **修复周榜大量缺图（根因：xlsx 内嵌图片从未被提取）**：用户反馈「周榜单好多图片都未显示」。排查先排除了两个假因——图片文件引用 0 缺失（非破图路径）、`bookCover()` 三级兜底正常。真因是**解析脚本看到图片列是 `#VALUE!` 就放弃，压根没读 xlsx 里内嵌的 95 张图**。该 xlsx 用 Excel365/WPS 的 **`_localImage` 富数据**存图（特点：无 drawing、无 `cellimages.xml`、无 `<f>` 公式，F/Q 列只显示 `#VALUE!`，但 `xl/media/` 有图）。**完整关联链（已验证可复现）**：单元格 `vm="N"` → `xl/metadata.xml` `<valueMetadata>` 第 N 个 bk 的 `<rc v="M"/>` → 同文件 `<futureMetadata>` 第 M 个 bk 的 `<xlrd:rvb i="K"/>` → `richData/rdrichvalue.xml` 第 K 个 rv 的**首个** `<v>`（= LocalImageIdentifier L）→ `richValueRel.xml` 第 L 个 `<rel r:id>` → `_rels/richValueRel.xml.rels` → `../media/imageXX.png`。行位映射：F 行 3-22→ADQ 1-20、F 行 25-39→小店 1-15、Q 行 25-39→潜力 1-15（每 sheet 一致）。新脚本 `scripts/extract_sep_week_images.py` 提取 **149 张**（转 JPEG 长边 600 / q82，命名 `{iso}-image{N}.jpg`）并回填 → **9 月三期 50/50 全有图**；再用 `scripts/backfill_isbn_images.py` 按 ISBN（精确 + 归一化）把新图回填老期，8/31 从 31/50 → **46/50**（剩 4 条潜力榜书为该期独有、无同源图，走 SVG 兜底）。**两个坑**：① 解析 `WEEK_RANK_LIST` 找数组边界**不能用括号计数**（书名含 `[` `]` 会错位报 "Extra data"），必须用 `json.JSONDecoder().raw_decode(text, start)`；② vm 值可能等于条目数导致越界（sheet3 有 1 条），需判空跳过。 |
| 2026-09-24 | office | **新增 9 月三期周榜（34→37 期）**：从 `~/Desktop/9月三周周榜单.xlsx`（**3 个 sheet：`9.1-9.7` / `9.8-9.14` / `9.15-9.21`**）用新脚本 `scripts/parse_sep_rank.py`（由 `parse_aug_rank.py` 改造）批量追加 → `2026-09-07` / `2026-09-14` / `2026-09-21`（倒序插入，最新 9/21 在前）。每期 ADQ 20 / 小店 15 / 潜力 15。**cat_share 趋势值得关注**：教辅 49→37→32 递减、健康 20→29→35 递增（开学季教辅短爆发后回落，秋冬养生快速崛起，抗炎饮食连续 3 期霸榜 #1 且日销升到 30-40W）。**新脚本两处升级**：① 多 sheet 支持（sheet 名 `9.15-9.21` 正则解析起止日期，ISO 取结束日，自动倒序插）；② `clean()` 增加**字面 `\r`/`\n` 剥离**（修复 9/03 踩的「历史 isbn 带 `\r\n` 脏前缀导致按 ISBN 复用封面失配」坑）。图片列仍是 `#VALUE!` 无实体图 → 按 ISBN 复用历史封面（9/21 复用 19 张 / 9/14 20 张 / 9/7 25 张，其余走 `bookCover()` 兜底；三期 Top1《抗炎饮食》图片均复用成功无缺失）。**同步补跑量书洞察** `HOT_BOOK_BREAKDOWN_BY_WEEK['2026-09-21']` + `['2026-09-14']`（严格 = 当期 ADQ Top3，已脚本校验一致），fallback 常量指向 9/21 —— 避免重现 9/03 用户指出的「跑量书显示旧期数据」问题。bump cache buster `20260903-rank831 → 20260924-rank921`。 |
| 2026-09-24 | office | **新增 9/1-9/15 大盘指标（共 8 期）**：从 `~/Desktop/9.1-9.15大盘指标数据.xlsx`（单 sheet Sheet1）解析追加到 `bench-data.js` 的 `BENCH_CAT_PRICE_BY_PERIOD['2026-09-01-to-15']` + `BENCH_PRICE_CHANNEL_BY_PERIOD['2026-09-01-to-15']`，`BENCH_PERIODS` 新增该期并设 `isLatest: true`（8/16-8/31 转 false，`CURRENT_BENCH_PERIOD` 自动跟随）。**新脚本** `scripts/parse_sep_bench.py`（由 `parse_aug_bench.py` sed 改 SRC + **右表列偏移 7→8**）。**本期表格与 8 月两处不同**：① 右表在 **I 列段名/链路名 + J-N 数据**（上期是 H-M，列偏移差 1）；② 链路只有 **小店直购/直播/直购 3 个**（上期 5 个，含拼多多CID/小程序直购）。左表仍是 A-F（段头合并 A-F，仅首档有表头行，脚本已兼容）。bump cache buster `20260903-bench831 → 20260924-bench915`。 |
| 2026-09-03 | office | **8/31 跑量书洞察更正 + 补 Top1 图片**：8/31 期「跑量书洞察」此前 fallback 到 7/13 旧数据，已补 `HOT_BOOK_BREAKDOWN_BY_WEEK['2026-08-31']` = 8/31 ADQ 前三（#1 很冷门的知识·潜力转正 / #2 文化常识3000问·长青回落 / #3 抗炎饮食·跃升劲品），兼容常量 `HOT_BOOK_BREAKDOWN` 默认指向 8/31；ADQ Top1《很冷门的知识》图片复用 8/24 潜力榜封面 `2026-08-24-image22.jpg` 补齐（ADQ #1 + 潜力 #9 两处）。**坑**：ISBN 复用时被历史数据里 `\r\n` 脏前缀干扰失配，clean 需 strip 掉字面 `\r`/`\n`。 |
| 2026-09-03 | office | **9 月选品台整体更新 + 8/31 周榜 + 8/16-8/31 大盘指标**：① 9 月品类预算占比调整为 教辅 40% / 健康 30% / 童书 15% / 社科 15%（开学短爆发 + 秋冬养生主线），周节奏图 `WEEK_RHYTHM_SEP` 与深度选品 `DEEP_CATS` 全部切 9 月口径；② 健康加「阳台种花种菜 / 家庭园艺」方向（周节奏 W1 + 深度基本盘，不碰医疗治病话术），教辅语文方向加「实时热点作文素材 + 课外阅读积累」（周节奏 W1-W2 语文主推 + 语文专项卡）；③ 新增 8/16-8/31 大盘指标到 `bench-data.js`（共 7 期，`BENCH_CAT_PRICE_BY_PERIOD` + `BENCH_PRICE_CHANNEL_BY_PERIOD`，`scripts/parse_aug_bench.py` 解析单期 xlsx，左表 A:F 品类×客单价、右表 H:M 客单价×链路，share/ctr/cvr 需 ×100）；④ 新增 8/31 周榜到 `rank-data.js`（共 34 期，ADQ 20 / 小店 15 / 潜力 15，cat_share 教辅39/童书21/健康17/社科23，`scripts/parse_aug_rank.py` 解析，**图片按 ISBN 复用历史封面 29 张、无匹配留空走 `bookCover()` 兜底**——本次 xlsx 图片列全是 `#VALUE!` 无实体图）；⑤ bump cache buster：rank `20260824-rank824→20260903-rank831`、bench `20260820-bench815→20260903-bench831`、select `20260803-hotbook-slim→20260903-select0903`。 |
| 2026-08-31 | office | **新增 8/24 周榜（共 33 期）**：从 `~/Desktop/8月24日周榜单.xlsx`（**单 sheet 且 sheet 名为 Sheet1**，非日期命名）用 `FORCE_YEAR=2026 python3 scripts/append_week_multisheet.py` 追加。**新坑 + 修复**：脚本原只按 sheet 名解析日期，sheet 名 Sheet1 会跳过；已给 `scripts/append_week_multisheet.py` 加文件名兜底（去扩展名 → 去掉"周榜单"字样 → `parse_sheet_name_to_date`），单 sheet 文件也能从文件名 `8月24日` 提取日期。ADQ 20/微信小店 15/潜力 15，新增 48 张封面，cat_share 教辅32/童书17/健康16/社科35。bump cache buster `20260818-rank818 → 20260824-rank824`。commit `68ad399`，4 分钟 curl 验证通过。**注意**：scripts/ 在工作区根目录不在 repo 内，脚本改动不入库（仅本地生效）。 |
| 2026-08-20 | office | **新增 8/1-8/15 大盘链路指标（共 6 期）**：从 `~/Desktop/8.1-8.15链路数据.xlsx`（单 sheet，左侧品类×客单价 A:F、右侧客单价×链路 H:M）手工解析追加到 `site_output/select/bench-data.js` 的 `BENCH_CAT_PRICE_BY_PERIOD['2026-08-01-to-15']` + `BENCH_PRICE_CHANNEL_BY_PERIOD['2026-08-01-to-15']`。5 档客单价（0-50/50-100/100-150/150-300/300+），链路含小店直购/直播/直购/拼多多CID/小程序直购。bump cache buster：`20260715-rank713b → 20260820-bench815`。commit `f6c84e8`，4 分钟后 curl 验证线上 title `8月1日-8月15日` 出现、cache buster 正确。**注意**：bench-data.js 无自动解析脚本，每次都是手工编辑 JS 追加新期。 |
| 2026-08-18 | office | **新增 8/10 + 8/18 两期周榜（共 32 期）**：从 `~/Desktop/周榜单.xlsx`（含 `8月10日`/`8月18日` 两 sheet）用 `scripts/append_week_multisheet.py` 增量追加。**坑**：脚本默认年份识别成 2025，必须 `FORCE_YEAR=2026 python3 ...` 才对；首次跑错要 `git checkout -- rank-data.js` + `find rank-images -name '2025-08-1[08]-*' -delete` 清干净再重跑。共 20+15+15 条 / 期，新增 97 张压缩封面（8/10 49 张 + 8/18 48 张，40MB→1.4MB / 35MB→1.4MB）。cat_share：8/10 教辅29/童书19/健康15/社科37；8/18 教辅33/童书22/健康10/社科34。按 8/17 教训 bump cache buster：`rank-data.js?v=20260803-rank803 → 20260818-rank818`。commit `97dc1af`（push 前先 `git pull --rebase` 掉家里/其他会话推的 4 个 summer/安全加固 commit，无冲突）。4 分钟后 curl 全部验证通过。 |
| 2026-08-17 | office | **CF Pages 长期同步断链根因定位 + 修复**：用户反馈选品台线上又退回 6 月版本（title `2026年6月`、脚本无 `?v=...` cache buster、rank-data.js generated `2026-06-16 11:58` / 23 期）。诊断：线上对应本地 commit `41eac91`（6/16 前后），此后 20+ commit（7 月品类、8 月上线、周节奏图、8/3 周榜、跑量书精简等）全部未上线。**根因**：8/12 用的 `git commit --allow-empty` 空 commit **无法可靠触发 CF Pages 重新构建**——CF 对无 diff 的 push 会跳过 build（no-op deployment），当时 curl 到的新版本其实来自更早某次 partial 部署的边缘节点缓存，缓存过期后就退回旧的稳定部署产物。**修复**：在 `site_output/select/index.html` 加一行诊断 marker `<!-- deploy-marker: 20260817-diag-a -->`（真实 diff）→ push → 4 分钟后 curl 验证 marker 出现 + title `2026年8月` + 所有 cache buster 正确 + rank-data.js 30 期 8/3。移除 marker 后 commit `5e2898d`/`b?`. **教训（下次遇到 CF 不同步的正确姿势）**：① 不要用 `git commit --allow-empty`；② 修改实际文件（哪怕只是 bump cache buster 或加一行 HTML 注释）；③ 至少等 5 分钟再 curl 验证；④ 同时检查 `curl select/index.html \| grep title` 和 `curl rank-data.js \| head -3` 两处时间戳，确认多个文件版本对得上号才算真的同步。 |
| 2026-08-03 | office | **跑量书洞察创意核心精简 + 警示语移除**：用户反馈——① 部分 `creativeCore` 200+ 字，反复强调 `#X / 连霸 / N 周在榜 / 日销 / 转化` 等榜单成绩（与上方 `stats` 徽章数据重复）；② `creativeWarning`（⚠️ 结论/公式类内容严禁夸大"必考""押题"...）过于沉重不适合日常汇报语境。变更：① 重写 6 条冗长 `creativeCore`（07-13 三条 + 07-06 三条）为纯创意要点（60 字左右），去除霸榜表述、只保留人群定位 + 创意主打 + 落点情绪；② 用正则 `,\n\s+creativeWarning:'⚠️[^']*'` 一次性移除全部 12 条 `creativeWarning` 字段（含前一行 `creativeCore` 尾逗号）；③ lint 零错误；④ cache buster: `20260803-hotbook-slim`。commit `c3ab615`。 |
| 2026-08-03 | office | **周榜单 8/3 追加（第 30 期）**：数据源 `~/Desktop/8月3日周榜单.xlsx`（单 sheet `Sheet1`）。用 `append_week_full.py <xlsx> 2026-08-03` 一键完成——ADQ Top20 + 微信小店 Top15 + 潜力 Top15，49 张图片压缩 37.90MB→1.40MB，类目占比 教辅 36% / 社科 33% / 童书 20% / 健康 11%。ADQ Top3：①《中国孩子必知的文化常识 3000 问》79 元 20-30W；②《副业上岸》40 元 10-20W；③《高中数理化公式法二级结论秒解+高中知识思维导图》65-188 元 10-20W。cache buster: `20260803-rank803`。commit `8d3fb9e`。 |
| 2026-08-03 | office | **8 月核心洞察改名为「8 月品类预算建议」+ 月份口径切换到 8 月**：① 已进入 8 月但副标题还写「本月（7 月）→ 下月（8 月）」，全部改为「本月（8 月）→ 下月（9 月）」；② 标题「💡 8 月 核心洞察」→「📐 8 月 品类预算建议」（避免与底部灰底预算行语义重复）；③ 左侧右悬浮导航同步更新为「📐 8 月品类预算建议 · 本月选品策略」；④ 删除底部灰底预算建议行（`教辅 30% · 童书 25% · 社科 25% · 健康 20%` 数值已被 KPI 卡片 + 新标题完整表达）；⑤ 保留右下角灰色引导文案「↓ 具体选题方向 & 周度节奏详见下方「选品周节奏图」」；⑥ 顶部「看趋势」横幅文案同步：`本月核心洞察` → `本月品类预算建议`。cache buster: `20260803-rename-budget`。commit `9e25ea0`。 |
| 2026-08-03 | office | **8 月核心洞察与周节奏图信息分层去重**：用户反馈两者内容重复——核心洞察下方 4 张品类洞察卡的芯片式选题标签（如"物理化学 / 字帖 / 多版本教材同步"等），与「选品周节奏图」的 `items` 内容几乎完全一致。重新划分：**核心洞察 = 一句话洞察 + 预算建议（宏观视角）**；**周节奏图 = 具体选题方向 + 按周展开（战术执行）**。变更：① 删除整个 `cat-insight-grid`（4 张品类洞察卡 + 全部芯片标签块，约 65 行）；② KPI 卡 `sub` 从 5-8 字短标签扩展到一句话洞察（12-16 字），一次性表达清楚该品类核心趋势；③ 预算建议栏右侧新增引导文案「↓ 具体选题方向 & 周度节奏详见下方「选品周节奏图」」。cache buster: `20260803-insight-dedup`。commit `aaa0ddf`。 |
| 2026-08-03 | office | **8 月柱线对齐修复 + 核心洞察卡片式美化**：① **柱线对齐 bug**：全年赛道节奏图（`chartYearTrend`）8 月柱状顶点约 40，与曲线值 63 不对齐——`MONTHS_DATA[8月]` 的 4 品类字段被误写成"占比×total/100"的绝对指数（教辅 22/童书 11/健康 13/社科 17，合计 63），而其他月份都是占比（合计 100）；由于柱高 = 占比 × total / 100，8 月被"双重折算"变成 63×63/100≈40。修正为**真实占比 30/25/20/25**（与新的核心洞察面板一致），柱高恢复到 63，与曲线完全对齐。② **核心洞察面板视觉重构**：KPI 卡片 `sub` 从长句压缩为 5-8 字短标签；移除下方冗长的 `insight-banner` 长段落；新增 **4 张品类洞察卡（2×2 网格）**——每卡包含图标 + 品类名 + 占比 + 一句洞察 + **芯片式选题方向标签**（`border-radius:12px` 圆角胶囊），按品类主色系配色渐变背景；预算建议单独一栏弱化处理（灰底 + 侧边线）。消除了 KPI sub 与洞察正文的信息重复。cache buster: `20260803-aug-align-fix`。commit `b0485fd`。 |
| 2026-08-03 | office | **8 月周节奏图精简表达（对齐双周会品类洞察口径）**：把 `select-data.js` 里 `WEEK_RHYTHM_AUG` 全量重写为精简版——① weeks 顶部四周主题重写为「暑期超车 / 立秋换季 / 开学决策 / 开学峰值」；② 教辅保留 3 周结构，`items` 从长句改为关键词短句（W1-W2 暑期超车：重点笔记 / 物理化学 / 字帖 + 衔接末班车；W3 教材同步；W4 语文选题回升）；③ 童书从 3 组精简为 2 组（收心主线 + 60-100 元同系列组品）；④ 社科重构为「情绪价值 + 实操工具」双主线（心理疗愈 / 国学 / 职场人际 / 财商副业）；⑤ 健康 direction/pain/lead 都精简到一行；⑥ 所有 `pain` 从长段落改为一句话结论，`lead` 精简到 10 字内；⑦ cache buster 更新为 `20260803-rhythm-aug-slim`。commit `359cd78`。 |
| 2026-08-03 | office | **8 月核心洞察面板品类洞察结构化升级**：品类占比按双周会最新口径校正（教辅 35→30% / 童书 17→25% / 社科 27→25% / 健康 21→20%），并把原单一段落"选品策略"改造为**每类 `[趋势洞察] + [选题方向]` 双段结构**——① 教辅：上旬鸡娃焦虑续单（笔记 / 盘点 / 物理化学 / 字帖），下旬开学教材同步 + 语文选题回升；② 童书：假期过半场景切换 → 收心痛点，聚焦心理 / 习惯 / 社会适应类成长童书，60-100 元同系列组品，创意上升到认知格局；③ 社科：高温浮躁 →「避世」或「求生」双诉求，情绪价值 + 实操工具双主线（心理疗愈 / 国学古为今用 / 职场人际 / 财商副业）；④ 健康：秋老虎 + 立秋换季小高峰，聚焦食疗 / 祛湿防燥 / 节气养生 / 体质改善。仅改 `index.html`，无脚本联动。commit `455c1f5`。 |
| 2026-08-03 | office | **大盘指标 7 月两期同步**：新增 `2026-07-16-to-31`（设为 `isLatest: true`，默认展示）+ `2026-07-01-to-15` 两期到 `bench-data.js`，期次切换器扩展至 5 期。数据源 `~/Desktop/7月大盘指标数据.xlsx`（单 sheet 上下两块布局：左 = 7/16-31，右 = 7/1-15）。含 品类×客单价 5 档 + 客单价×链路 5 档双表。**新增专用脚本** `scripts/parse_july_bench.py`（zipfile + shared 索引 → 智能识别左右两块 col0）。**健康 300 元以上档**两期均为空/-，处理为全 `null`。commit `dfddbde`。 |
| 2026-08-03 | office | **8 月趋势 + 8 月推荐书单同步**：8 月节奏图 `WEEK_RHYTHM_AUG`（W1-W4，主题：立秋+处暑+开学季，教辅 P0 / 童书 P0 / 社科 P1 / 健康 P2），63 本 8 月推荐书 prepend 到 4 品类分组（教辅 22 / 童书 11 / 社科 17 / 健康 13，rank 从 1 重开）。xlsx 解析踩坑：①sheet 隐藏属性 `state="hidden"` 让原正则失配→改宽松；②rels 里 Type 属性含 URL 里的 `/` 打断 `[^/]*`→改 `[^>]*?`；③首行合并说明单元格→扫描找含"书名"的行作表头。index.html 8 处 7 月→8 月。commit `372d2f4`。 |
| 2026-08-03 | office | **周榜单 7/21 + 7/27 两期同步**：追加到 `rank-data.js`（共 29 期）。踩坑：`_infer_year` 把 7 月误判为 2025 年→通过 `FORCE_YEAR=2026` 环境变量注入修复，撤销错误数据后重跑。commit `d2d8582`。 |
| 2026-07-15 | office | **周榜单同步 7/13 周（共 27 期）**：跑 `append_week_full.py` 完整解析（ADQ 20 / 微信小店 15 / 潜力 15 / cat_share 教辅71/社科12/童书12/健康4），47 张图 37.85MB→1.41MB。**本周结构性变化**：①**新王登基**——「高中数理化公式法二级结论秒解」首次登榜即直冲 #1，日销 20-30W 最高档、转化 6.6-7.6%，**唯一小程序渠道 Top10 爆款**，家长（准高一/高二/高三妈妈）为主的暑期冲刺付费窗口验证；②**长青回落**——「文化常识 3000 问」6 周 #1 连霸被终结→#2（27 期全在榜纪录仍在）；③**「漫画初中物理」连续在榜 12 周稳居 #3**；④「预备一年级」跌出 Top20（上周还 #2 · 转化跃升 3× 后触顶回落，季节性刚需拐点）。跑量书 Top3 洞察新增 2026-07-13 期 + `HOT_BOOK_BREAKDOWN` 默认切到 7/13。cache buster `v=20260707-rank706b` → `v=20260715-rank713`。 |
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

- [ ] **日历类书缺实物**：10 月社科 / 健康已上线日历选品方向（社科=节日年末送礼，健康=银发花草图鉴），但 `recommend-data.js` 421 本里**日历类 0 本**，方向卡与推荐书单脱节、点进去看不到实物。待用户给书单（书名+ISBN）后补进对应品类，或先把「日历 / 台历 / 挂历 / 年历」加进 `CAT_MAP` 社科关键词（现有 0 本，改了不影响存量数据）。
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
| 改预测推荐书单（4 大品类 421 本） | `site_output/select/recommend-data.js` |
| 按月增补预测书单（新书+内嵌封面） | `python3 scripts/prepend_recommend_oct2026.py`（改脚本里的 `SRC` 指向新 xlsx；同 xlsx 内 vm 链与 drawing 锚定两种图片机制都支持） |
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
