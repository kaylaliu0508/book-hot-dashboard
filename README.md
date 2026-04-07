# 📊 图书热点营销工作台

> **自动抓取全网热搜 + 自动标注图书类目相关度 + 每日自动更新的云端热点工作台**

## ✨ 功能亮点

- 🔥 **三大平台实时热榜**：微信生态(搜狗) + 抖音 + 百度，各取 TOP20
- 🏷️ **智能类目标注**：20+ 图书类目关键词自动匹配（童书/教辅/养生/AI/法律等）
- 📊 **相关度分级**：高(红)/中(橙)/低(灰) 三级视觉区分
- 📝 **一键文案生成**：按类目找热点 → 自动生成前贴文案参考
- 📈 **利用率分析**：上传脚本文件，自动检测热点覆盖率
- ☁️ **云端全自动**：GitHub Actions 定时执行 + Vercel CDN 全球分发

---

## 🏗️ 架构总览

```
┌──────────────────────────────────────────────────────────────┐
│                    GitHub Actions (定时器)                     │
│              每天 02:30 UTC = 北京时间 10:30                   │
│                         ↓ 触发                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │ 1. 抓取热搜   │ →  │ 2. 渲染HTML   │ →  │ 3. Git提交    │     │
│  │ 鬼鬼API x3   │    │ 模板+数据替换  │    │ push到main   │     │
│  └──────────────┘    └──────────────┘    └──────┬───────┘     │
│                                                  │             │
└──────────────────────────────────────────────────┼─────────────┘
                                                   │ 变更推送
                                                   ↓
┌──────────────────────────────────────────────────────────────┐
│                      Vercel (CDN 托管)                        │
│                    自动构建 & 全球分发                          │
│                         ↓                                     │
│               🌐 https://你的域名.vercel.app                   │
│            （或绑定自定义域名）                                  │
│                                                              │
│  用户打开 → 看到最新热点数据（URL不变）                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 项目结构

```
site-updater/
├── .github/
│   └── workflows/
│       └── hot-update.yml       # ⚡ GitHub Actions 定时工作流
├── templates/
│   └── hot_dashboard_template.html  # 📄 HTML模板（含占位符）
├── data/
│   └── hot_data.json            # 📊 API数据缓存（自动生成）
├── site_output/
│   └── index.html               # ✅ 云端最终页面（Vercel托管）
├── backups/                     # 📦 历史备份
├── logs/                        # 📝 运行日志
├── hot_update.py                # 🔧 核心更新脚本（双模式）
├── update_site.py               # 🔧 备用更新脚本
├── vercel.json                  # 🚀 Vercel 部署配置
├── .gitignore                   # Git 忽略规则
└── README.md                    # 本文件
```

---

## 🚀 快速开始（三步上线）

### 第一步：Fork / Clone 到你的 GitHub

```bash
git clone https://github.com/你的用户名/site-updater.git
cd site-updater
```

### 第二步：连接 Vercel

**方法 A — Vercel CLI（推荐）：**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel

# 绑定 GitHub 仓库后，每次 push 自动部署
vercel link
```

**方法 B — Vercel 网页版（更简单）：**

1. 打开 [vercel.com](https://vercel.com)
2. 点击 **"Import Project"**
3. 选择你 Fork 的仓库
4. **Framework Preset** 选 `Other` 或留空
5. **Output Directory** 留空（默认根目录即可）
6. 点 **Deploy** ✅

### 第三步：激活定时任务

GitHub Actions 默认已配置在 `.github/workflows/hot-update.yml` 中。

推送到 main 后：
- ✅ 每天 **北京时间 10:30** 自动执行
- ✅ 也可以在仓库的 **Actions 页面** 手动触发 `workflow_dispatch`

> 💡 首次建议先手动跑一次验证：进入仓库 → Actions → `📊 热点工作台每日更新` → Run workflow

---

## 🔧 本地开发（双模式支持）

脚本支持两种运行模式，通过环境变量切换：

```bash
# 本地模式（默认）— 输出到微信临时目录
python3 hot_update.py

# 云端模式 — 输出到 site_output/index.html
HOT_OUTPUT_MODE=cloud python3 hot_update.py
```

| 模式 | 环境变量 | 输出路径 | 用途 |
|------|---------|---------|------|
| **本地模式** | 未设置或 `"local"` | 微信临时文件目录 | Mac本地使用，分享到微信 |
| **云模式** | `"cloud"` | `site_output/index.html` | GitHub Actions + Vercel |

---

## ⚙️ 配置说明

### 数据源配置 (`hot_update.py`)

当前使用 **auto 模式**（公网API自动抓取），无需额外配置。

如需修改：

```python
# hot_update.py 第51行
DATA_SOURCE = "auto"  # 可选: "auto" | "json" | "api" | "database"
```

### 定时频率修改

编辑 `.github/workflows/hot-update.yml`：

```yaml
on:
  schedule:
    # cron 格式: 分 时 日 月 周 (UTC时间)
    - cron: '30 2 * * *'  # 当前: 每天 UTC 02:30 = 北京 10:30
    
    # 常用示例:
    # - cron: '0 0 * * *'        # 每天 08:00 北京
    # - cron: '0 */6 * * *'      # 每6小时
    # - cron: '30 8 * * 1-5'     # 工作日 16:30
```

### 类目关键词修改

编辑 `hot_update.py` 中的 `CATEGORY_KEYWORDS` 字典来调整匹配规则。

---

## 🔄 完整数据流

```
GitHub Actions 触发
       ↓
  python3 hot_update.py (HOT_OUTPUT_MODE=cloud)
       ↓
  ┌─────────────────────────────┐
  │ Step 1: 抓取数据            │
  │ • 鬼鬼API → 微信(搜狗) TOP20│
  │ • 鬼鬼API → 抖音 TOP20      │
  │ • 鬼鬼API → 百度 TOP20      │
  │ • 失败则尝试备用小尘API      │
  └──────────────┬──────────────┘
                 ↓
  ┌─────────────────────────────┐
  │ Step 2: 数据处理            │
  │ • 自动匹配图书类目标签       │
  │ • 计算相关度(高/中/低)       │
  │ • 缓存到 data/hot_data.json │
  └──────────────┬──────────────┘
                 ↓
  ┌─────────────────────────────┐
  │ Step 3: 渲染HTML           │
  │ • 加载模板                  │
  │ • 替换所有 {{占位符}}        │
  │ • 输出 site_output/index.html│
  └──────────────┬──────────────┘
                 ↓
  ┌─────────────────────────────┐
  │ Step 4: Git 提交 + 推送     │
  │ • git add + commit          │
  │ • git push to main          │
  └──────────────┬──────────────┘
                 ↓
         Vercel 自动检测变更
                 ↓
         重新构建 + CDN 更新
                 ↓
         用户看到最新内容 ✅
```

---

## 🛠️ 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| API请求失败 | 公网API临时不可用 | 脚本会自动切换备用API；失败则用缓存数据 |
| Vercel部署失败 | index.html未生成 | 检查Actions日志，确认脚本正常完成 |
| 内容不更新 | Git无变化跳过提交 | 正常行为！如果数据没变化就不重复commit |
| 缓存问题 | 浏览器CDN缓存 | vercel.json 已配置 no-cache for index.html |

---

## 📋 成本估算

| 服务 | 免费额度 | 本项目用量 | 费用 |
|------|---------|-----------|------|
| **GitHub Actions** | 2000分钟/月 | ~15分钟/天 × 30 = 450分钟 | **免费** |
| **Vercel** | 100GB带宽/月 | ~50KB/次 × 多次 | **免费** |
| **鬼鬼API** | 免费 | 3次/天 | **免费** |

**总计：完全免费** 💰

---

## 📝 许可证

MIT License — 自由使用、修改和分发。
