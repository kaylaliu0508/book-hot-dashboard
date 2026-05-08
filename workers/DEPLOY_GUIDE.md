# Cloudflare Workers 部署指南（聚美智数 ISBN 代理）

> 目的：把聚美智数的 ISBN 查询接口搭一个**前端可直接调用**的代理 URL。
> 重点：appSecret 永远只存在 Workers 环境变量里，不会进入 GitHub 仓库 / 前端代码 / 浏览器。
> 全程免费（Cloudflare Workers 免费额度 = 每天 10 万次请求，对 ISBN 查询场景绰绰有余）。

---

## 阶段 0｜准备（5 分钟）

1. 浏览器打开 <https://dash.cloudflare.com/sign-up>
2. 用邮箱注册一个 Cloudflare 账号（免费），完成邮箱验证
3. 登录进 Dashboard

> 你之前已经在 CF Pages 部署过 `book-hot-dashboard`，所以这一步**大概率已经有账号了**，直接登录即可。

---

## 阶段 1｜创建 Worker（3 分钟）

1. 左侧菜单点 **Workers & Pages** → **Overview**
2. 右上角点 **Create application** → 选 **Create Worker**
3. **Name** 填：`isbn-proxy`（这个名字会变成你的 Worker 公网域名前缀）
4. 下方 **Starter** 选默认的 `Hello World!` 模板
5. 点 **Deploy**（先随便部署一下，让它存在）
6. 部署完成后页面上方会有提示，点 **Edit code**（或 **Continue to project** → 顶部 **Quick edit**）

---

## 阶段 2｜粘贴代码（2 分钟）

1. 进入在线编辑器后，左边能看到一个 `worker.js`（或 `index.js`）
2. **全选删除**默认代码
3. 打开本地文件 `workers/isbn-proxy.js`，**全文复制**
4. 粘贴到 CF 编辑器里
5. 右上角点 **Save and Deploy** → 弹窗里再点一次 **Save and Deploy**

---

## 阶段 3｜配置环境变量（关键，2 分钟）

> ⚠️ 这一步是把 appSecret 安全藏好的核心。

1. 部署成功后，回到 Worker 详情页（左上角面包屑点 `isbn-proxy`）
2. 顶部点 **Settings** 标签
3. 左边列表点 **Variables and Secrets**（旧版叫 **Environment Variables**）
4. 点 **Add variable**，依次添加 3 条：

| Variable name      | Type           | Value                                            |
| ------------------ | -------------- | ------------------------------------------------ |
| `JUM_APP_ID`       | **Plaintext**  | `ut8oHaRlLmCYMk7r`                               |
| `JUM_APP_SECRET`   | **Secret** ✅  | `779d361a8d81b848915da52673c32645`               |
| `ALLOWED_ORIGIN`   | **Plaintext**  | `https://book-hot-dashboard.pages.dev`           |

> **`JUM_APP_SECRET` 一定要选 Secret 类型**，加密存储 + 不可读取。
> `ALLOWED_ORIGIN` 限定只允许你的页面调用，防别人盗刷你的额度。
> 调试期间想用本地浏览器开 file:// 测试，可以临时填 `*`。

5. 三条都加完后，点 **Deploy**（重新部署一次让变量生效）

---

## 阶段 4｜拿到公网 URL 并验证（1 分钟）

1. 回到 Worker 详情页 **Overview** 标签
2. 顶部能看到一行 **xxx.workers.dev** 的 URL，比如：
   ```
   https://isbn-proxy.kaylaliu0508.workers.dev
   ```
3. 把这个 URL 记下来。
4. **快速验证**：浏览器直接访问
   ```
   https://isbn-proxy.kaylaliu0508.workers.dev/?isbn=9787515522500
   ```
   应该返回类似：
   ```json
   {
     "success": true,
     "data": {
       "title": "高分贝英语 2021年12月大学英语六级真题全刷...",
       "author": "高分贝大学英语研究院",
       ...
     }
   }
   ```

> 如果返回 `Worker 未配置 JUM_APP_ID / JUM_APP_SECRET`，回到阶段 3 检查变量名拼写。
> 如果返回 CORS 错误，把 `ALLOWED_ORIGIN` 临时改成 `*` 排查。

---

## 阶段 5｜把 URL 告诉我

把你拿到的 Worker URL 私聊发给我（类似 `https://isbn-proxy.xxx.workers.dev`），
我把 `site_output/index.html` 和 `templates/hot_dashboard_template.html` 里的 ISBN 查询逻辑改成走这个代理，
聚美智数会作为**第一优先**数据源（最稳），保留当当 / isbn.work / Google Books 作为兜底。

---

## 注意事项

- **免费 50 次配额**已经被本地测试用掉 3 次（剩 48 次，只有 `success:true` 才扣，查无数据不扣）
- 想升级到 ¥30/2000 次，去 jumdata.com → 控制台 → 充值
- Worker 部署后**改代码无需重新配环境变量**，变量是单独存储的
- 如果你重置了 appSecret，只需要回到阶段 3 改 `JUM_APP_SECRET` 那一条就行，前端不用动
