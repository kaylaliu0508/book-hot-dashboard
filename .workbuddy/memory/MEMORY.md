# site-updater 项目长期记忆

## 项目架构
- **核心脚本**: hot_update.py — 每日抓取热搜 + 渲染HTML + 图书类目标注
- **数据源**: 鬼鬼API（主）+ 小尘API（备用），抓微信(搜狗)/抖音/百度热搜
- **双模式**: HOT_OUTPUT_MODE=local（微信临时目录） / cloud（site_output/index.html）
- **云端架构**: GitHub Actions 定时任务 + Vercel 静态托管
- **GitHub 仓库**: https://github.com/kaylaliu0508/book-hot-dashboard
- **公网链接**: https://site-updater.vercel.app
- **Vercel 项目**: kayliu0508s-projects/site-updater (team 账号)
- **Actions 定时**: 每天 UTC 02:30 = 北京时间 10:30

## 已知问题
- ~~Vercel 尚未关联 GitHub 仓库~~ → ✅ 已关联（2026-04-08，GitHub App 方式）
- gh CLI 位于 /tmp/gh_extracted/gh_2.63.2_macOS_arm64/bin/gh（重启后会丢失）
- Vercel CLI 位于 /Users/kayla/.workbuddy/binaries/node/workspace/node_modules/.bin/vercel

## 用户偏好
- 更新于 2026-04-08
