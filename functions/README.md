# Pages Functions 使用说明

本目录包含 EdgeOne / Cloudflare Pages Functions，用于代理外部 AI API 调用，**避免在前端暴露 API Key**。

## 路由表

| 前端调用路径 | Function 文件 | 上游 |
|---|---|---|
| `POST /api/deepseek/chat/completions` | `functions/api/deepseek/chat/completions.js` | `https://api.deepseek.com/v1/chat/completions` |
| `POST /api/zhipu/search` | `functions/api/zhipu/search.js` | `https://open.bigmodel.cn/api/paas/v4/tools` |

## 必须配置的环境变量

在 EdgeOne Pages / Cloudflare Pages 项目控制台 → 设置 → 环境变量，**配置以下两个**：

| 变量名 | 类型 | 值 |
|---|---|---|
| `DEEPSEEK_API_KEY` | Secret（加密） | DeepSeek 平台新建的 sk-xxx Key |
| `ZHIPU_API_KEY` | Secret（加密） | 智谱 BigModel 平台 Key |

可选：
- `ALLOWED_ORIGIN`：允许的跨域来源，多个用逗号分隔。例：`https://book.yourdomain.com,https://book-hot-dashboard.pages.dev`。不配置则放开（仅建议公开演示场景）。

## 🚨 重要：上线前必须做的事

1. **作废旧 Key**
   - DeepSeek 平台：登录 https://platform.deepseek.com → API Keys → 删除 `sk-98d29632e5324d81be5b47ebf422f6ab`
   - 智谱 BigModel：登录 https://bigmodel.cn → API Keys → 删除 `7aec8ade98084288bc9f81875088cfde.2kGvUtqbhWOn6Z1p`
   - **这两个旧 Key 已在公网暴露超过几个月，即使已经下线也必须撤销，避免被人继续薅羊毛**

2. **新建 Key 并仅写到 Pages 环境变量**
   - 不要写进任何 `.env` 文件提交到 Git
   - 不要在前端代码任何地方出现

3. **平台速率限制兜底**
   - DeepSeek/智谱 平台层面也建议设置每日消费上限，防止函数被恶意调用刷量
   - 函数已内置每 IP 每分钟 30 次（DeepSeek）/ 20 次（智谱）的软限频

4. **Git 历史中的 Key 仍可被检索**
   - 仅修改文件不能消除 Git 历史记录中的旧 Key
   - 如果仓库是公开的，需要：
     ```bash
     # 用 BFG Repo-Cleaner 清理历史
     bfg --replace-text passwords.txt
     git reflog expire --expire=now --all && git gc --prune=now --aggressive
     git push --force
     ```
   - 但即使清理了，**已经被搜索引擎/Wayback Machine 收录的 Key 等于永久公开**，所以撤销才是最关键的

## 本地测试

EdgeOne / Cloudflare Pages 都有本地 CLI：

```bash
# Cloudflare 方式（最成熟）
npx wrangler pages dev site_output --binding DEEPSEEK_API_KEY=sk-xxx ZHIPU_API_KEY=xxx

# 然后访问 http://localhost:8788
```

部署上去后通过：
```bash
curl -X POST https://book.yourdomain.com/api/deepseek/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"hi"}]}'
```
应返回 DeepSeek 的正常 JSON 响应。如果返回 500 → 检查环境变量没配；429 → 触发限频。

## 安全特性清单

- ✅ Key 仅存服务端环境变量，前端永不接触
- ✅ Body 大小限制（DeepSeek 64KB / 智谱 32KB），防止滥用
- ✅ Model 白名单（仅 `deepseek-chat`、`deepseek-reasoner`）
- ✅ 工具白名单（仅 `search_std/search_pro/web_search`）
- ✅ Content-Type 与 Method 严格校验
- ✅ 每 IP 限频（基础防刷）
- ✅ CORS 可按 Origin 白名单收紧
- ✅ SSE 流式响应正确透传（`X-Accel-Buffering: no`）
