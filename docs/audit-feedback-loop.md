# AI 预审反馈闭环 · 使用说明

> 让用户「最少 2 步」反馈 AI 预审判得准不准 → 您一键采纳 → AI 复审下次自动判准。

## 一、改动了什么

### 前端（用户侧）
1. **每条预审结果尾部** 新增 `👍 判得准 / 🚩 判错了` 按钮：
   - `👍`：1 次点击即沉淀正样本，零额外输入
   - `🚩`：弹出极简反馈卡，**只有 2 步 + 1 个选填**：
     - ① 哪里错了：误杀 / 漏判
     - ② 一句话原因（可不填）
2. **AI 复审 prompt 自动注入 few-shot 学习样本**（来自后台已采纳的反馈），让相同/同义案例下次必判准。

> 注：用户期望的"正确判定"由 `error_type` 自动推导：
> - 误杀 → should_pass
> - 漏判 → should_reject

### 后端（Pages Functions）
- `POST /api/audit_feedback`：接收反馈，写入 KV `TRACKER_AGG`
- `GET  /api/audit_feedback?op=list`：管理后台拉列表（需 `X-Admin-Token` 头）
- `PATCH /api/audit_feedback`：管理后台采纳 / 拒绝（需 `X-Admin-Token` 头）
- `GET  /api/audit_learned_cases`：暴露已采纳学习池给前端 prompt 注入（公开只读）

### 管理后台
**入口**：`https://book-hot-dashboard.pages.dev/admin/audit-feedback/`

> 注：与线上已有的 `/admin/feedback` 反馈记录管理页**完全并存、互不干扰**，本后台只负责 AI 预审 tab 的反馈。

- 用 `ADMIN_TOKEN` 登录（存在浏览器 localStorage）
- 「📊 反馈数据」+「📚 AI 学习池」两个板块切换
- 列表：状态/错误类型过滤 + 按时间倒序
- 详情：原文、命中规则、用户备注全部呈现
- 一键操作：✅ 采纳并加入学习池 / ❌ 拒绝 / ↩ 重置为待处理

---

## 二、上线前需做的配置

### 1. 设置管理员 Token

在 Cloudflare Pages → Settings → Environment variables 加：

```
ADMIN_TOKEN = <您自定义的一串随机字符串，至少 20 位>
```

或者：`AUDIT_FEEDBACK_ADMIN_TOKEN`（两个名字 functions 都认）

### 2. 确认 KV 已绑定

Pages → Settings → Functions → KV namespace bindings：

```
变量名: TRACKER_AGG
namespace id: 2360767d707143e394cf90766faf418c
```

（已存在，复用即可，无需新建。）

---

## 三、闭环工作流程

### 用户侧（最少 2 步）
```
预审完毕 → 看到判错的条目
  └─ 点 🚩 判错了
      └─ 选「误杀 / 漏判 / 建议错」
          └─ （可不填原因，直接提交）
```

### 您侧（3 步采纳）
```
1. 打开 /admin/audit-feedback/ 输入 ADMIN_TOKEN
2. 看左侧"待处理"列表，点开一条看详情
3. 写一句话备注（可不填），点 "✅ 采纳"
```

### AI 自动学习（无感）
```
下次有用户运行 AI 复审时：
  → 前端自动 fetch /api/audit_learned_cases
  → 把最近 20 条已采纳样本拼到 system prompt 的"已采纳人工反馈样本"区
  → DeepSeek 对同义/近似文案直接按学习池判定
```

---

## 四、数据保留与隐私

- 反馈详情：默认保留 90 天（由 `RETENTION_DAYS` 控制，与现有埋点一致）
- 学习池：上限 200 条，按时间倒序保留
- 用户原文：只在反馈中存储，不与 uid 关联
- 不存 IP，UA 截断至 200 字符

---

## 五、埋点事件

新增的 tracker.feature 事件（tab=`ai_audit`）：

| 事件名 | 触发时机 | meta |
|---|---|---|
| `audit_feedback_thumb_up` | 用户点 👍 判得准 | - |
| `audit_feedback_thumb_down` | 用户点 🚩 判错了（打开弹窗） | - |
| `audit_feedback_modal_open` | 反馈弹窗打开 | `type: rule_hit / overall` |
| `audit_feedback_good` | 提交"判得准" | `rule_version, rule_ids` |
| `audit_feedback_bad_false_positive` | 提交"误杀" | `verdict, rule_ids, note_len` |
| `audit_feedback_bad_false_negative` | 提交"漏判" | 同上 |
