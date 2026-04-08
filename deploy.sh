#!/bin/bash
# ============================================================
#  📊 图书热点工作台 - 一键云端部署脚本
#  执行方式: 打开终端，运行:
#    cd /Users/kayla/WorkBuddy/20260407104321/site-updater
#    bash deploy.sh
# ============================================================

set -e
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'

GH="/tmp/gh_extracted/gh_2.63.2_macOS_arm64/bin/gh"
VERCEL="/Users/kayla/.workbuddy/binaries/node/workspace/node_modules/.bin/vercel"
export PATH="/Users/kayla/.workbuddy/binaries/node/versions/22.12.0/bin:$PATH"

echo ""
echo "============================================================"
echo -e "  ${BOLD}📊 图书热点工作台 - 云端部署${NC}"
echo "============================================================"
echo ""

# ============================================================
#  Step 1: GitHub 登录
# ============================================================
echo -e "${CYAN}━━━ Step 1/4: 登录 GitHub ━━━${NC}"
echo ""

if "$GH" auth status 2>/dev/null; then
    echo -e "${GREEN}✅ 已登录 GitHub${NC}"
else
    echo "即将打开浏览器进行 GitHub 授权..."
    echo -e "${YELLOW}请在浏览器中完成授权后回到终端${NC}"
    echo ""
    "$GH" auth login --hostname github.com --git-protocol https --web
    echo ""
    echo -e "${GREEN}✅ GitHub 登录成功！${NC}"
fi
echo ""

# ============================================================
#  Step 2: 创建 GitHub 远程仓库 + 推送
# ============================================================
echo -e "${CYAN}━━━ Step 2/4: 创建 GitHub 仓库并推送代码 ━━━${NC}"
echo ""

cd /Users/kayla/WorkBuddy/20260407104321/site-updater

# 获取 GitHub 用户名
GH_USER=$("$GH" api user -q .login 2>/dev/null || echo "")
if [ -z "$GH_USER" ]; then
    echo -e "${RED}❌ 无法获取 GitHub 用户名，请确认登录成功${NC}"
    exit 1
fi
echo "GitHub 用户: $GH_USER"

# 检查仓库是否已存在
REPO_EXISTS=$("$GH" repo view "$GH_USER/book-hot-dashboard" --json name 2>/dev/null && echo "yes" || echo "no")

if [ "$REPO_EXISTS" = "no" ]; then
    echo "创建远程仓库: $GH_USER/book-hot-dashboard ..."
    "$GH" repo create book-hot-dashboard --public --description "📊 图书热点营销工作台 - 自动抓取全网热搜 + 图书类目智能标注" --source=. --remote=origin --push
    echo -e "${GREEN}✅ 仓库创建成功并已推送！${NC}"
else
    echo "仓库已存在，直接推送..."
    # 确保远程配置正确
    git remote set-url origin "https://github.com/$GH_USER/book-hot-dashboard.git" 2>/dev/null || \
    git remote add origin "https://github.com/$GH_USER/book-hot-dashboard.git" 2>/dev/null || true
    git push -u origin main
    echo -e "${GREEN}✅ 代码已推送！${NC}"
fi

REPO_URL="https://github.com/$GH_USER/book-hot-dashboard"
echo ""
echo -e "仓库地址: ${BOLD}$REPO_URL${NC}"
echo ""

# ============================================================
#  Step 3: 登录 Vercel
# ============================================================
echo -e "${CYAN}━━━ Step 3/4: 登录 Vercel ━━━${NC}"
echo ""

if "$VERCEL" whoami 2>/dev/null; then
    echo -e "${GREEN}✅ 已登录 Vercel${NC}"
else
    echo "即将打开浏览器进行 Vercel 授权..."
    echo -e "${YELLOW}请在浏览器中完成登录后回到终端${NC}"
    echo ""
    "$VERCEL" login
    echo ""
    echo -e "${GREEN}✅ Vercel 登录成功！${NC}"
fi
echo ""

# ============================================================
#  Step 4: 部署到 Vercel
# ============================================================
echo -e "${CYAN}━━━ Step 4/4: 部署到 Vercel ━━━${NC}"
echo ""

cd /Users/kayla/WorkBuddy/20260407104321/site-updater

echo "正在部署到 Vercel..."
DEPLOY_OUTPUT=$("$VERCEL" deploy --yes --prod 2>&1)
echo "$DEPLOY_OUTPUT"

# 提取部署URL
PROD_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://[a-zA-Z0-9-]+\.vercel\.app' | head -1)

echo ""
echo "============================================================"
echo -e "  ${GREEN}${BOLD}🎉 部署完成！${NC}"
echo "============================================================"
echo ""
echo -e "  📦 GitHub 仓库:  ${BOLD}$REPO_URL${NC}"
if [ -n "$PROD_URL" ]; then
    echo -e "  🌐 公网访问链接: ${BOLD}$PROD_URL${NC}"
fi
echo ""
echo -e "  ${YELLOW}💡 后续每天 10:30 GitHub Actions 自动抓取热搜数据,"
echo -e "     推送到 GitHub 后 Vercel 自动重新部署${NC}"
echo ""
echo "============================================================"
echo ""

# 关联 Vercel 和 GitHub（使后续 push 自动触发 Vercel 构建）
echo -e "${CYAN}🔗 关联 GitHub 仓库和 Vercel...${NC}"
echo -e "${YELLOW}建议你到 Vercel 控制台手动连接 GitHub 仓库:${NC}"
echo "   1. 打开 https://vercel.com/dashboard"
echo "   2. 进入刚部署的项目"
echo "   3. Settings → Git → Connected Git Repository"
echo "   4. 选择 $GH_USER/book-hot-dashboard"
echo ""
echo "连接后，每次 GitHub Actions 推送代码变更，Vercel 会自动构建部署！"
echo ""
