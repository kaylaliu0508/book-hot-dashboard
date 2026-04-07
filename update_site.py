#!/usr/bin/env python3
"""
网站定时内容更新脚本 - SSG预渲染方案

功能：
  1. 从数据源（JSON/API/数据库）读取最新内容
  2. 使用Jinja2模板引擎渲染HTML
  3. 输出到指定目录，URL保持不变

使用方式：
  python update_site.py              # 手动执行
  配合 cron 每天自动执行

依赖安装：
  pip install jinja2 requests
"""

import json
import os
import shutil
from datetime import datetime
from pathlib import Path

# ============ 配置区 ============

# 输出目录（生成的HTML放在这里）
OUTPUT_DIR = Path(__file__).parent / "site_output"

# 模板目录
TEMPLATES_DIR = Path(__file__).parent / "templates"

# 数据源配置（可选：JSON文件 / API / 数据库）
DATA_SOURCE = "json"  # "json" | "api" | "database"
JSON_DATA_FILE = Path(__file__).parent / "data" / "news.json"
# API_URL = "https://your-api.com/api/news"

# 要生成的页面配置
PAGES = [
    {
        "template": "news.html",       # 模板文件名
        "output": "news/index.html",   # 输出路径（相对于OUTPUT_DIR）
        "data_key": "news",            # 对应数据源中的key
        "url": "/news/",               # 用户访问的URL（不变）
    },
    {
        "template": "index.html",
        "output": "index.html",
        "data_key": "featured",
        "url": "/",
    },
]

# ============ 数据获取函数 ============

def fetch_data_from_json():
    """从JSON文件读取数据（适合本地编辑/小规模数据）"""
    if not JSON_DATA_FILE.exists():
        return {"news": [], "featured": []}
    with open(JSON_DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def fetch_data_from_api():
    """从API接口拉取数据（适合远程数据源）"""
    import requests
    try:
        resp = requests.get(API_URL, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[ERROR] API请求失败: {e}")
        return {"news": [], "featured": []}


def fetch_data_from_database():
    """从数据库读取数据（适合生产环境）
    
    示例支持 SQLite / MySQL / PostgreSQL
    需要安装对应驱动：
      SQLite: 内置
      MySQL: pip install mysql-connector-python
      PG:    pip install psycopg2
    """
    db_type = os.environ.get("DB_TYPE", "sqlite")
    
    if db_type == "sqlite":
        import sqlite3
        db_path = os.environ.get("DB_PATH", "data/site.db")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT title, summary, content, author, created_at, image_url, category
            FROM news 
            WHERE status = 'published'
            ORDER BY created_at DESC 
            LIMIT 50
        """)
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        conn.close()
        
        news = [dict(zip(columns, row)) for row in rows]
        return {"news": news, "featured": news[:5] if len(news) >= 5 else news}
    
    elif db_type == "mysql":
        import mysql.connector
        conn = mysql.connector.connect(
            host=os.environ.get("DB_HOST", "localhost"),
            user=os.environ.get("DB_USER", "root"),
            password=os.environ.get("DB_PASSWORD", ""),
            database=os.environ.get("DB_NAME", "site_db"),
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT title, summary, content, author, created_at, image_url, category
            FROM news 
            WHERE status = 'published'
            ORDER BY created_at DESC 
            LIMIT 50
        """)
        news = cursor.fetchall()
        conn.close()
        return {"news": news, "featured": news[:5] if len(news) >= 5 else news}
    
    else:
        print(f"[WARN] 不支持的数据库类型: {db_type}")
        return {"news": [], "featured": []}


# ============ 数据处理 ============

def process_data(raw_data):
    """数据处理和格式化"""
    processed = {}
    
    for key in ["news", "featured"]:
        items = raw_data.get(key, [])
        for item in items:
            # 格式化日期
            if "created_at" in item and item["created_at"]:
                try:
                    dt = datetime.fromisoformat(str(item["created_at"]).replace("Z", "+00:00"))
                    item["date_formatted"] = dt.strftime("%Y年%m月%d日")
                    item["time_ago"] = format_time_ago(dt)
                    item["iso_date"] = dt.isoformat()
                except:
                    item["date_formatted"] = str(item.get("created_at", ""))
                    item["time_ago"] = ""
                    item["iso_date"] = ""
            
            # 安全处理缺失字段
            item.setdefault("summary", "")
            item.setdefault("image_url", "")
            item.setdefault("category", "未分类")
            item.setdefault("author", "匿名")
        
        processed[key] = items
    
    # 全局数据
    processed["generated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    processed["generated_iso"] = datetime.now().isoformat()
    
    return processed


def format_time_ago(dt):
    """将日期转换为'X小时前'等相对时间格式"""
    now = datetime.now(dt.tzinfo)
    diff = now - dt
    days = diff.days
    
    if days > 30:
        return f"{days // 30}个月前"
    elif days > 0:
        return f"{days}天前"
    elif diff.seconds > 3600:
        return f"{diff.seconds // 3600}小时前"
    elif diff.seconds > 60:
        return f"{diff.seconds // 60}分钟前"
    else:
        return "刚刚"


# ============ HTML渲染 ============

def render_pages(data):
    """使用Jinja2模板渲染所有页面"""
    from jinja2 import Environment, FileSystemLoader, select_autoenv
    
    if not TEMPLATES_DIR.exists():
        print(f"[ERROR] 模板目录不存在: {TEMPLATES_DIR}")
        return []
    
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoenv(["html", "xml"]),
    )
    
    generated_files = []
    
    for page in PAGES:
        template_name = page["template"]
        output_path = OUTPUT_DIR / page["output"]
        url = page["url"]
        data_key = page["data_key"]
        
        try:
            template = env.get_template(template_name)
            
            # 准备页面特有数据
            context = {
                **data,
                "page_data": data.get(data_key, []),
                "current_url": url,
                "page_title": page.get("title", ""),
            }
            
            html_content = template.render(**context)
            
            # 确保输出目录存在
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 写入文件
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(html_content)
            
            generated_files.append(str(output_path))
            print(f"  ✅ {url} → {output_path} ({len(html_content)} bytes)")
            
        except Exception as e:
            print(f"  ❌ 渲染失败 {template_name}: {e}")
    
    return generated_files


# ============ 主流程 ============

def main():
    print("=" * 60)
    print(f"🔄 网站内容更新开始 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Step 1: 获取数据
    print("\n📡 Step 1: 获取数据...")
    fetchers = {
        "json": fetch_data_from_json,
        "api": fetch_data_from_api,
        "database": fetch_data_from_database,
    }
    fetcher = fetchers.get(DATA_SOURCE, fetch_data_from_json)
    raw_data = fetcher()
    print(f"   获取到 {len(raw_data.get('news', [])) 条新闻数据")
    
    # Step 2: 处理数据
    print("\n🔧 Step 2: 处理数据...")
    data = process_data(raw_data)
    
    # Step 3: 渲染HTML
    print("\n🖥️  Step 3: 渲染HTML页面...")
    generated = render_pages(data)
    
    # 完成
    print("\n" + "=" * 60)
    print(f"✅ 更新完成！共生成 {len(generated)} 个页面")
    print(f"📁 输出目录: {OUTPUT_DIR.absolute()}")
    print("=" * 60)
    
    return generated


if __name__ == "__main__":
    main()
