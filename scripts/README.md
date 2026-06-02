# scripts/ 工具脚本

## extract_predict_books.py

**用途**：把腾讯企微在线文档导出的 xlsx（《2026 教育行业图书选品指南-直购链路》）解析成 `site_output/select/recommend-data.js`，并自动抽取 + 压缩嵌入封面。

### 用法

```bash
# 在 repo 根目录执行
python3 scripts/extract_predict_books.py path/to/your.xlsx

# 不传参时默认读 data/predict_recommend_2026.xlsx
python3 scripts/extract_predict_books.py
```

### 它会做什么

1. 解析 4 个 sheet（教辅 / 童书 / 社科 / 健康），抽取每行的：
   - 书名、作者、出版社、ISBN、推荐投放时间、AMS 准入情况
2. 抽取每行嵌入的封面图（PNG）
3. 自动用 PIL 压缩到 300px 宽 + JPEG q82（230 MB → 4.8 MB 左右）
4. 写入 `site_output/select/recommend-data.js`，每个品类内 `rank` 从 1 重新计数
5. 同步替换 JS 中的 `.png` 引用为 `.jpg`

### 依赖

```bash
pip3 install python-calamine Pillow
```

### 触发场景

用户在 CodeBuddy 对话中说 **"榜单同步"** + 拖入 xlsx 文件时，CodeBuddy 会按 `CODEBUDDY.md` 第 13 节的 SOP 自动调用本脚本。
