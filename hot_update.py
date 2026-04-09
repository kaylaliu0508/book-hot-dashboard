#!/usr/bin/env python3
"""
图书热点营销工作台 - 定时数据更新脚本

功能：
  - 从数据源获取最新热搜数据（微信生态 / 抖音 / 百度）
  - 自动标注图书类目相关度和匹配类目标签
  - 渲染生成完整HTML，URL保持不变

数据源支持：
  - JSON文件 (默认，适合手动编辑或API缓存)
  - API接口 (自动拉取)
  - SQLite/MySQL 数据库

定时执行：
  crontab -e 添加：
    0 8 * * * cd /path/to/site-updater && python3 hot_update.py >> logs/update.log 2>&1

依赖：
  pip install jinja2 requests beautifulsoup4
"""

import json
import os
import re
import shutil
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any

# ============================================================
#                        配置区
# ============================================================

# --- 路径配置 ---
BASE_DIR = Path(__file__).parent
TEMPLATE_FILE = BASE_DIR / "templates" / "hot_dashboard_template.html"

# ===== 输出模式切换 =====
# 环境变量 HOT_OUTPUT_MODE 控制：
#   - 未设置或 = "local"(默认): 输出到微信临时文件目录(本地Mac使用)
#   - = "cloud": 输出到 site_output/ 目录(GitHub Actions + Vercel 云部署)
OUTPUT_MODE = os.environ.get("HOT_OUTPUT_MODE", "local")

if OUTPUT_MODE == "cloud":
    # 云模式：输出到项目内 site_output/ 目录，由 Vercel 托管
    _OUTPUT_DIR = BASE_DIR / "site_output"
    OUTPUT_FILE = _OUTPUT_DIR / "index.html"
else:
    # 本地模式：输出到微信临时文件目录（文件名固定，链接不变）
    _OUTPUT_DIR = Path(
        "/Users/kayla/Library/Containers/com.tencent.xinWeChat/Data/Library/Application Support/com.tencent.xinWeChat/"
        "2.0b4.0.9/ca831fa7c4537afee279714759edeb43/Message/MessageTemp/"
        "ca831fa7c4537afee279714759edeb43/File"
    )
    OUTPUT_FILE = _OUTPUT_DIR / "全网热点与图书营销_20260401.html"
BACKUP_DIR = BASE_DIR / "backups"
LOG_DIR = BASE_DIR / "logs"

# --- 数据源配置 ---
DATA_SOURCE = "auto"  # "auto" (公网API自动抓取) | "json" | "api" | "database"
JSON_DATA_FILE = BASE_DIR / "data" / "hot_data.json"

# --- 公网热搜API配置（auto模式使用）---
HOT_API_CONFIG = {
    # 鬼鬼API - 免费聚合热榜，支持百度/抖音/搜狗(微信生态)/头条/微博等
    "base_url": "https://api.guiguiya.com/api/hotlist",
    # 平台映射：我们的名称 → API的type参数
    "platform_map": {
        "wechat": "sogou",   # 搜狗热搜 = 微信生态
        "douyin": "douyin",
        "baidu": "baidu",
    },
    # 每个平台抓取条数
    "fetch_count": 20,
    # 请求超时秒数
    "timeout": 15,
}

# 数据库配置（可选）
DB_TYPE = os.environ.get("HOT_DB_TYPE", "sqlite")  # sqlite | mysql
DB_PATH = os.environ.get("HOT_DB_PATH", str(BASE_DIR / "data" / "hot_dashboard.db"))

# --- 类目关键词映射（用于自动标注相关度和标签）---
CATEGORY_KEYWORDS: Dict[str, Dict[str, Any]] = {
    "童书-科普百科": {"keywords": ["科学", "科普", "天文", "地理", "动物", "植物", "恐龙", "太空", "实验"], "relevance": "高"},
    "童书-故事绘本": {"keywords": ["绘本", "故事", "儿童", "孩子", "绘本", "节日", "英雄", "色彩"], "relevance": "高"},
    "童书-儿童成长": {"keywords": ["成长", "孩子", "儿童", "青春期", "勇敢", "自信", "体重", "跳水"], "relevance": "中"},
    "生活-养生保健": {"keywords": ["养生", "健康", "睡眠", "午睡", "饮食", "节气", "清明", "中医", "减糖"], "relevance": "高"},
    "生活-体育运动": {"keywords": ["体育", "运动", "足球", "篮球", "世界杯", "乒乓球", "赛车", "奥运"], "relevance": "低"},
    "生活-旅游/地图": {"keywords": ["旅游", "地图", "高铁", "景区", "台湾", "台海", "西安", "沿江"], "relevance": "中"},
    "人文社科-法律": {"keywords": ["法律", "新规", "法规", "遗嘱", "继承", "安全带", "消费", "物业", "交通"], "relevance": "高"},
    "人文社科-政治/军事": {"keywords": ["军事", "政治", "台海", "两岸", "伊朗", "战争", "国防部", "机密"], "relevance": "中"},
    "人文社科-历史": {"keywords": ["历史", "周年", "文物", "盘库", "博物馆", "明清", "朝代", "意大利"], "relevance": "中"},
    "人文社科-传记": {"keywords": ["传记", "张雪", "创业", "裁员", "职场", "全红婵", "运动员"], "relevance": "中"},
    "人文社科-管理": {"keywords": ["管理", "企业", "裁员", "甲骨文", "创业"], "relevance": "中"},
    "人文社科-自我实现/励志": {"keywords": ["励志", "自我实现", "勇气", "勇敢", "焦虑", "乐起来", "反脆弱"], "relevance": "中"},
    "人文社科-心理学": {"keywords": ["心理", "早恋", "青春期", "情绪", "抑郁", "emo"], "relevance": "中"},
    "人文社科-国学/古籍": {"keywords": ["国学", "古籍", "诗词", "清明", "传统", "经典", "道德经"], "relevance": "中"},
    "人文社科-经济/金融": {"keywords": ["经济", "金融", "投资", "消费", "网购", "小卡宴"], "relevance": "低"},
    "人文社科-艺术-绘画": {"keywords": ["艺术", "绘画", "colorwalk", "色彩", "审美", "书法"], "relevance": "中"},
    "人文社科-文学/小说": {"keywords": ["文学", "小说", "四月", "春天", "书单", "阅读"], "relevance": "低"},
    "自然科技-计算机/网络": {"keywords": ["AI", "人工智能", "源码", "Claude", "Sora", "DeepSeek", "计算机", "网络", "信息", "泄露"], "relevance": "中"},
    "自然科技-自然科学": {"keywords": ["极光", "磁暴", "天文", "自然科学"], "relevance": "高"},
    "自然科技-工业技术": {"keywords": ["高铁", "工业", "机车", "制造", "工程", "达喀尔"], "relevance": "中"},
    "自然科技-医学": {"keywords": ["医学", "健康", "养生", "睡眠"], "relevance": "中"},
    "教辅/考试": {"keywords": ["教育部", "学校", "考试", "作文", "教辅", "中考", "期中", "思维导图"], "relevance": "高"},
    "育儿-家庭教育": {"keywords": ["育儿", "家庭教育", "家长", "孩子", "早恋", "青春期", "食堂"], "relevance": "高"},
}

# 平台颜色映射
PLATFORM_STYLES = {
    "微信生态": {"bg": "#07c160", "short": "微"},
    "抖音热榜": {"bg": "#000000", "short": "抖"},
    "百度热搜": {"bg": "#2196f3", "short": "百"},
}


# ============================================================
#                     工具函数
# ============================================================

def ensure_dirs():
    """确保所需目录存在"""
    # 云模式下不需要创建微信临时目录
    if OUTPUT_MODE == "cloud":
        for d in [OUTPUT_FILE.parent, BACKUP_DIR, LOG_DIR, JSON_DATA_FILE.parent]:
            d.mkdir(parents=True, exist_ok=True)
    else:
        for d in [OUTPUT_FILE.parent, BACKUP_DIR, LOG_DIR, JSON_DATA_FILE.parent]:
            d.mkdir(parents=True, exist_ok=True)


def log(message: str, level: str = "INFO"):
    """日志输出"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] [{level}] {message}"
    print(line)
    
    # 同时写入日志文件
    log_file = LOG_DIR / f"update_{datetime.now().strftime('%Y%m%d')}.log"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def backup_existing():
    """备份当前输出文件"""
    if not OUTPUT_FILE.exists():
        return None
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"hot_dashboard_{timestamp}.html"
    shutil.copy2(OUTPUT_FILE, backup_path)
    log(f"已备份到 {backup_path.name}")
    return backup_path


def match_categories(title: str) -> tuple:
    """
    根据标题匹配图书类目和相关度
    返回: (matched_tags_list, highest_relevance)
    """
    title_lower = title.lower()
    matched_tags = []
    highest_rel = "—"
    rel_order = {"高": 3, "中": 2, "低": 1, "—": 0}
    
    for cat_name, cat_info in CATEGORY_KEYWORDS.items():
        for kw in cat_info["keywords"]:
            if kw.lower() in title_lower:
                matched_tags.append(cat_name)
                rel = cat_info["relevance"]
                if rel_order.get(rel, 0) > rel_order.get(highest_rel, 0):
                    highest_rel = rel
                break  # 每个类别只匹配一次
    
    return matched_tags, highest_rel


def generate_category_html(tags: List[str], direction: str = "") -> str:
    """生成类目标签HTML"""
    if not tags:
        return ""
    
    tags_html = "".join(
        f'<span class="cat-tag">{t}</span>' for t in tags[:4]  # 最多显示4个标签
    )
    
    # 如果 direction 内容和已显示的标签重复，就不再重复显示
    if direction:
        dir_parts = [p.strip() for p in direction.replace(" · ", ",").split(",")]
        # 去掉和 tags 完全相同的部分
        unique_parts = [p for p in dir_parts if p not in tags[:4]]
        if unique_parts:
            return f'<span class="dir">{tags_html} {" · ".join(unique_parts)}</span>'
    
    return f'<span class="dir">{tags_html}</span>'


def generate_relevance_badge(relevance: str) -> str:
    """生成相关度徽章HTML"""
    rel_classes = {
        "高": "rel-h",
        "中": "rel-m",
        "低": "rel-l",
        "—": "rel-n",
    }
    cls = rel_classes.get(relevance, "rel-n")
    return f'<span class="{cls}">{relevance}</span>'


def generate_row_class(relevance: str) -> str:
    """根据相关度返回行样式类"""
    row_classes = {
        "高": "rh",
        "中": "rm",
        "低": "rl",
        "—": "",
    }
    return row_classes.get(relevance, "")


# ============================================================
#                   数据获取层
# ============================================================

class HotDataFetcher:
    """热搜数据获取器 - 支持多数据源"""
    
    # ================================================================
    #  auto 模式：从公网免费API自动抓取热搜数据
    # ================================================================
    
    # 备用API列表（按优先级排序，主API失败时自动切换）
    BACKUP_APIS = [
        {
            "name": "鬼鬼API",
            "base_url": "https://api.guiguiya.com/api/hotlist",
            "platform_map": {"wechat": "sogou", "douyin": "douyin", "baidu": "baidu"},
            "data_key": "data",
            "title_field": "title",
            "hot_field": "hot",
            "url_field": "url",
            "index_field": "index",
        },
        {
            "name": "小尘API",
            "base_url": "https://api.xcvts.cn/api/hotlist",
            "platform_map": {"wechat": "sogou", "douyin": "douyin", "baidu": "baidu"},
            "data_key": "data",
            "title_field": "title",
            "hot_field": "hot",
            "url_field": "url",
            "index_field": "index",
        },
    ]
    
    @staticmethod
    def _fetch_from_public_api(api_config: dict, platform: str, 
                                api_type: str, count: int = 20) -> List[Dict]:
        """
        从单个公网API抓取指定平台的热搜数据
        
        Args:
            api_config: API配置字典
            platform: 平台名称 (wechat/douyin/baidu)
            api_type: 该平台在API中的type参数名
            count: 获取条数
        
        Returns:
            标准化的热搜列表 [{"rank":1,"title":"...","url":"...","heat":"..."},...]
        """
        import urllib.request
        import urllib.error
        
        base_url = api_config["base_url"]
        url = f"{base_url}?type={api_type}"
        
        log(f"  📡 请求 {api_config['name']} → {platform}({api_type})")
        
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json, text/plain, */*",
                }
            )
            with urllib.request.urlopen(req, timeout=HOT_API_CONFIG.get("timeout", 15)) as resp:
                raw = resp.read().decode("utf-8")
                result = json.loads(raw)
            
            # 校验响应
            if not result.get("success", True):
                log(f"  ⚠️ {api_config['name']} 返回失败: {result.get('message', '未知错误')}", "WARN")
                return []
            
            # 提取数据列表
            data_key = api_config.get("data_key", "data")
            items = result.get(data_key, [])
            
            if not items:
                log(f"  ⚠️ {api_config['name']} 返回空列表", "WARN")
                return []
            
            # 标准化字段
            title_field = api_config.get("title_field", "title")
            hot_field = api_config.get("hot_field", "hot")
            url_field = api_config.get("url_field", "url")
            index_field = api_config.get("index_field", "index")
            
            standardized = []
            for item in items[:count]:
                standardized.append({
                    "rank": item.get(index_field, len(standardized) + 1),
                    "title": item.get(title_field, ""),
                    "url": item.get(url_field, ""),
                    "heat": item.get(hot_field, ""),
                })
            
            log(f"  ✅ {api_config['name']} 成功获取 {len(standardized)} 条 {platform} 热搜")
            return standardized
            
        except urllib.error.URLError as e:
            log(f"  ❌ {api_config['name']} 网络错误: {e.reason}", "ERROR")
            return []
        except json.JSONDecodeError as e:
            log(f"  ❌ {api_config['name']} JSON解析失败: {e}", "ERROR")
            return []
        except Exception as e:
            log(f"  ❌ {api_config['name']} 未知错误: {e}", "ERROR")
            return []
    
    @staticmethod
    def from_auto() -> Dict:
        """
        自动模式：从公网API抓取三平台热搜数据
        支持主备API自动切换，并将结果保存到JSON文件作为缓存
        """
        import copy
        
        result = {"wechat": [], "douyin": [], "baidu": []}
        platform_map = HOT_API_CONFIG.get("platform_map", 
            HotDataFetcher.BACKUP_APIS[0]["platform_map"])
        fetch_count = HOT_API_CONFIG.get("fetch_count", 20)
        
        for platform, api_type in platform_map.items():
            fetched = None
            
            # 遍历所有备用API，直到成功为止
            for api_cfg in HotDataFetcher.BACKUP_APIS:
                # 确认该API支持这个平台类型
                if api_type not in list(api_cfg["platform_map"].values()):
                    continue
                
                items = HotDataFetcher._fetch_from_public_api(
                    api_cfg, platform, api_type, fetch_count
                )
                
                if items:
                    fetched = items
                    break
            
            if fetched:
                result[platform] = fetched
            else:
                log(f"  ⚠️ 所有API都无法获取{platform}热搜，尝试使用JSON缓存", "WARN")
                # 尝试从本地JSON缓存读取该平台的数据
                cached = HotDataFetcher._read_cached_platform(platform)
                if cached:
                    result[platform] = cached
                    log(f"  ✅ 使用{platform}的JSON缓存数据 ({len(cached)}条)")
        
        total = sum(len(v) for v in result.values())
        log(f"🎉 公网API自动抓取完成：共获取 {total} 条热搜数据")
        
        # ===== 将结果保存到JSON文件（作为缓存）=====
        try:
            HotDataFetcher._save_auto_result(result)
            log(f"💾 数据已缓存到 {JSON_DATA_FILE.name}")
        except Exception as e:
            log(f"⚠️ 保存缓存失败: {e}", "WARN")
        
        return result
    
    @staticmethod
    def _read_cached_platform(platform: str) -> List[Dict]:
        """从本地JSON缓存读取指定平台的旧数据"""
        if not JSON_DATA_FILE.exists():
            return []
        try:
            with open(JSON_DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            cached_items = data.get(platform, [])
            if cached_items:
                log(f"  📦 从缓存读取到 {len(cached_items)} 条 {platform} 历史数据")
            return cached_items
        except Exception:
            return []
    
    @staticmethod
    def _save_auto_result(data: Dict):
        """将auto模式获取的数据保存为标准JSON格式"""
        now = datetime.now()
        output = {
            "date": now.strftime("%Y-%m-%d"),
            "updated_at": now.strftime("%Y-%m-%dT%H:%M:%S"),
            "source": "auto-api",
            "wechat": data.get("wechat", []),
            "douyin": data.get("douyin", []),
            "baidu": data.get("baidu", []),
        }
        JSON_DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(JSON_DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
    
    # ================================================================
    #  json 模式：从本地JSON文件读取
    # ================================================================
    
    @staticmethod
    def from_json() -> Dict:
        """从JSON文件读取数据"""
        if not JSON_DATA_FILE.exists():
            log(f"JSON数据文件不存在: {JSON_DATA_FILE}", "WARN")
            return HotDataFetcher._empty_data()
        
        with open(JSON_DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        log(f"从JSON读取数据成功，包含 {len(data.get('wechat', []))} 条微信 + "
            f"{len(data.get('douyin', []))} 条抖音 + {len(data.get('baidu', []))} 条百度热搜")
        return data
    
    @staticmethod
    def from_api() -> Dict:
        """从API接口获取数据（示例结构）"""
        import requests
        
        result = {"wechat": [], "douyin": [], "baidu": []}
        apis = {
            "wechat": os.environ.get("WECHAT_HOT_API", ""),
            "douyin": os.environ.get("DOUYIN_HOT_API", ""),
            "baidu": os.environ.get("BAIDU_HOT_API", ""),
        }
        
        for platform, url in apis.items():
            if not url:
                log(f"{platform} API未配置，跳过", "WARN")
                continue
            try:
                resp = requests.get(url, timeout=15)
                resp.raise_for_status()
                result[platform] = resp.json().get("data", resp.json())
                log(f"API获取 {platform} 热搜 {len(result[platform])} 条")
            except Exception as e:
                log(f"API获取 {platform} 失败: {e}", "ERROR")
        
        return result
    
    @staticmethod
    def from_database() -> Dict:
        """从数据库读取数据"""
        db_type = DB_TYPE
        
        if db_type == "sqlite":
            import sqlite3
            
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            result = {"wechat": [], "douyin": [], "baidu": []}
            
            for platform in result.keys():
                cursor.execute("""
                    SELECT rank, title, url, heat, category_tags, direction, relevance
                    FROM hot_searches 
                    WHERE platform = ? AND date = date('now')
                    ORDER BY rank ASC
                    LIMIT 30
                """, (platform,))
                
                rows = cursor.fetchall()
                for row in rows:
                    result[platform].append({
                        "rank": row["rank"],
                        "title": row["title"],
                        "url": row["url"] or "",
                        "heat": row["heat"] or "",
                        "category_tags": row["category_tags"] or "",
                        "direction": row["direction"] or "",
                        "relevance": row["relevance"] or "—",
                    })
            
            conn.close()
            total = sum(len(v) for v in result.values())
            log(f"从SQLite数据库读取 {total} 条热搜数据")
            return result
        
        elif db_type == "mysql":
            try:
                import mysql.connector
                conn = mysql.connector.connect(
                    host=os.environ.get("HOT_DB_HOST", "localhost"),
                    user=os.environ.get("HOT_DB_USER", "root"),
                    password=os.environ.get("HOT_DB_PASSWORD", ""),
                    database=os.environ.get("HOT_DB_NAME", "hot_db"),
                    charset='utf8mb4',
                )
                cursor = conn.cursor(dictionary=True)
                
                result = {"wechat": [], "douyin": [], "baidu": []}
                for platform in result.keys():
                    cursor.execute("""
                        SELECT rank, title, url, heat, category_tags, direction, relevance
                        FROM hot_searches 
                        WHERE platform = ? AND date = CURDATE()
                        ORDER BY rank ASC
                        LIMIT 30
                    """, (platform,))
                    result[platform] = cursor.fetchall()
                
                conn.close()
                total = sum(len(v) for v in result.values())
                log(f"MySQL读取 {total} 条热搜数据")
                return result
            except ImportError:
                log("mysql-connector-python 未安装，回退到空数据", "ERROR")
                return HotDataFetcher._empty_data()
            except Exception as e:
                log(f"MySQL连接失败: {e}", "ERROR")
                return HotDataFetcher._empty_data()
        
        else:
            log(f"不支持的数据库类型: {db_type}", "ERROR")
            return HotDataFetcher._empty_data()
    
    @staticmethod
    def _empty_data() -> Dict:
        """返回空数据结构"""
        return {
            "wechat": [],
            "douyin": [],
            "baidu": [],
        }


# ============================================================
#                   数据处理 & 标注
# ============================================================

def process_hot_items(items: List[Dict], platform: str) -> List[Dict]:
    """
    处理单条热搜数据：
      - 自动匹配图书类目
      - 自动计算相关度
      - 补充缺失字段
    """
    processed = []
    
    for idx, item in enumerate(items):
        title = item.get("title", "")
        rank = item.get("rank", idx + 1)
        
        # 如果已有标注则使用已有数据，否则自动标注
        existing_tags = item.get("category_tags", "")
        existing_rel = item.get("relevance", "")
        existing_dir = item.get("direction", "")
        
        if existing_tags and existing_rel:
            tags = existing_tags.split(",") if isinstance(existing_tags, str) else existing_tags
            relevance = existing_rel
            direction = existing_dir
        else:
            # 自动匹配类目
            tags, relevance = match_categories(title)
            direction = item.get("direction", "")
            # 如果没有方向说明，尝试从标签推断
            if not direction and tags:
                # 取前两个标签作为简短描述
                direction = " · ".join(tags[:2])
        
        processed.append({
            "rank": rank,
            "title": title,
            "url": item.get("url", ""),
            "heat": item.get("heat", ""),
            "tags": tags,
            "relevance": relevance,
            "direction": direction,
            "row_class": generate_row_class(relevance),
        })
    
    return processed


# ============================================================
#                AI 前贴文案生成（智谱 GLM API）
# ============================================================

# --- 敏感话题黑名单：匹配到的热点若包含以下关键词，直接跳过不用于文案生成 ---
# 来源：V6规则文档 - 时政政治敏感 / 外交军事 / 负面社会事件 / 涉台涉政
SENSITIVE_TOPIC_BLACKLIST = [
    # === 时政政治 ===
    "中央", "巡视", "纪委", "监察", "中纪委", "反腐", "落马",
    # === 外交军事 ===
    "访华", "访问朝鲜", "访朝", "访美", "外交", "国防部", "军事", "军队", "解放军",
    "霍尔木兹海峡", "伊朗", "黎巴嫩", "以色列", "联合国谴责",
    # === 涉台涉港涉藏 ===
    "台湾", "台海", "两岸", "一国两制", "港独", "台独",
    # === 负面社会事件 ===
    "造假", "诈骗", "骗局", "曝光黑", "被查", "判了", "死刑", "致死", "死亡",
    "坠楼", "自杀", "他杀", "事故", "灾难", "伤亡",
    # === 军人/英雄人物（不得商用） ===
    "将军", "逝世", "烈士", "牺牲", "军人", "退役战神",
    # === 医疗负面 ===
    "黑中医", "医疗事故", "医闹", "假药",
    # === 教育政策敏感（禁止借势） ===
    "教育部", "双减", "新课改", "升学政策", "新政", "新规",
    # === 金融风险 ===
    "暴跌", "崩盘", "金融危机", "跑路", "非法集资",
    # === 仿新闻/官方样式 ===
    "紧急通知", "最新通知", "重要公告", "红头文件",
]

# --- 文案审核过滤器：AI 输出的文案如果命中以下模式，标记为违规并过滤 ---
# 来源：V6规则文档 - 全行业通用虚假夸大 + 教育行业 + 阅读短剧行业
COPY_FILTER_RULES = {
    # --- 绝对化用语 / 极限词 ---
    "absolute": [
        r"最\s*(好|棒|强|优|全|新|火|畅销|权威|专业|有效)",
        r"(绝对|一定|肯定|必须|唯一|第一|顶级|领先|极致|完美|永久|彻底)",
        r"全网?(最|第一|独家|仅此|空前)",
        r"100%", r"百分百", r"零风险", r"0风险",
    ],
    # --- 虚假效果承诺 / 结果保证 ---
    "effect_promise": [
        r"\d+\s*天(学会|掌握|学会|变|瘦|涨|提|升)",
        r"(看完|读完|学完)(就|即|立刻|马上)(变|会|能|提|升)",
        r"(保过|稳过|一次通过|不过退费|押题密卷)",
        r"(成绩|分数|排名)(蹭蹭|突飞猛进|稳拿|暴涨|飙升)",
        r"(薪资翻倍|年入|月入|赚\d+)",
        r"解决所有?问题?", r"治(好|愈|愈?)\s*(全部|一切|所有)",
    ],
    # --- 焦虑营销 / 制造恐慌 ---
    "anxiety": [
        r"不(买|读|看|学|做|用).{0,5}(就)?(晚|亏|落后|后悔|来不及|out|淘汰)",
        r"再不.{0,4}(就|就真的|晚了|来不及|落后|错过)",
        r"别人家?.{0,3}(孩子|家长|人).{0,5}(都|已经|全)在?",
        r"你还不知道.{0,3}(吗|吧|？)\s*$",  # 句尾反问焦虑
        r"大部分?人.{0,10}(不知道|不了解|不清楚|后悔|亏了)",
    ],
    # --- 饥饿营销 / 虚假稀缺 ---
    "scarcity": [
        r"(仅|只|仅剩|只剩|最后|马上|即将|马上).{0,4}(几?\d?\s*(本|套|份|个|名|位)|断货|下架|售罄|结束|失效|过期)",
        r"(限时|限量|秒杀|抢购|手慢无|库存紧张)",
    ],
    # --- 虚构人设 / 虚假事件 ---
    "fake_persona": [
        r"\d+\s*岁.{0,6}(老奶奶|奶奶|老人|大爷|爷爷|老头).{0,20}(还在|吃|用|推荐)",
        r"(震惊医学界|填补.*空白|突破.*壁垒|解密|机密|高层重视)",
        r"(发往.{0,10}(海外|国外|德国|美国).{0,10}(又运回来|低价甩卖))",
    ],
    # --- K12 学科培训暗示（教育专项）---
    "k12_violation": [
        r"(保过|稳上|冲刺|考入|考上).{0,5}(985|211|清华|北大|重点|名校)",
        r"(提升成绩|提高分数|成绩飞跃|学科能力|稳坐年级前排)",
        r"(超前学习|抢跑|弯道超车)",
    ],
    # --- 价格违规 ---
    "price_violation": [
        r"\d\.\d\s*元",  # 过低价格（如9.9元、1元等）
        r"(免费|0元|不要钱).{0,5}(领|送|拿|带回家)",
    ],
}

import re as _re_module

def _is_sensitive_topic(title: str) -> bool:
    """检查热搜标题是否属于敏感话题，若是则不应用于文案生成"""
    for keyword in SENSITIVE_TOPIC_BLACKLIST:
        if keyword in title:
            return True
    return False


def _audit_copy(copy_text: str) -> tuple:
    """
    审核单条文案，返回 (is_pass: bool, violations: list[str])
    
    基于 V6 规则文档的审核红线对 AI 输出进行后处理过滤：
    - 绝对化用语 / 极限词
    - 虚假效果承诺
    - 焦虑营销
    - 饥饿营销
    - 虚构人设
    - K12培训暗示
    - 价格违规
    """
    violations = []
    text = copy_text
    
    for rule_name, patterns in COPY_FILTER_RULES.items():
        for pattern in patterns:
            matches = _re_module.findall(pattern, text)
            if matches:
                violations.append(f"[{rule_name}] 命中: '{matches[0]}'")
    
    return len(violations) == 0, violations


def _filter_copies(copies: List[str]) -> List[str]:
    """
    对 AI 生成的文案列表进行审核过滤
    返回过滤后的合规文案列表
    """
    passed = []
    for i, copy in enumerate(copies):
        is_pass, violations = _audit_copy(copy)
        if is_pass:
            passed.append(copy)
        else:
            log(f"  ⚠️ 文案第{i+1}条未通过审核: {'; '.join(violations)}", "WARN")
    
    return passed


def _sanitize_matched_hots(all_items: List[Dict]) -> tuple:
    """
    过滤掉敏感话题的热点，只返回安全可用的热点
    
    返回: (safe_items: List[Dict], filtered_titles: Set[str])
    """
    safe_hots = []
    filtered_titles = set()
    
    for item in all_items:
        title = item.get("title", "")
        if _is_sensitive_topic(title):
            filtered_titles.add(title)
            log(f"  🔒 过滤敏感话题: {title}", "WARN")
            continue
        safe_hots.append(item)
    
    return safe_hots, filtered_titles


# 页面2使用的图书类目及其匹配关键词（和模板中的 DB 保持一致）
PAGE2_CATEGORIES = {
    "泛健康": {
        "hotKw": ["养生", "健康", "感冒", "输液", "睡眠", "午睡", "饮食", "节气", "春天", "过敏", "保健", "穴位", "按摩", "中医", "减糖"],
        "bookDesc": "养生保健/穴位按摩/节气饮食/健康科普类图书",
    },
    "童书": {
        "hotKw": ["孩子", "儿童", "科学", "太空", "火箭", "卫星", "恐龙", "绘本", "动物", "植物", "实验", "极光", "磁暴", "航天", "极地", "发射", "英雄"],
        "bookDesc": "少儿科普/绘本/儿童文学/学前启蒙类图书",
    },
    "教辅": {
        "hotKw": ["教育", "学校", "考试", "作文", "教辅", "期中", "思维", "学生", "读书", "历史", "地理", "知识", "文化", "常识"],
        "bookDesc": "中小学教辅/课外阅读/综合素养类图书",
    },
    "育儿": {
        "hotKw": ["孩子", "家长", "教育", "亲子", "成长", "青春期", "早恋", "食堂", "家庭", "团圆", "母亲", "父亲", "儿子", "女儿", "产假", "假期"],
        "bookDesc": "家庭教育/亲子沟通/育儿方法类图书",
    },
    "法律": {
        "hotKw": ["法律", "法规", "新规", "遗嘱", "继承", "安全带", "消费", "物业", "交通", "婚姻", "房产", "离婚", "维权", "合同", "报警", "产假", "公司"],
        "bookDesc": "法律常识/婚姻财产/消费维权/劳动权益类图书",
    },
    "AI": {
        "hotKw": ["AI", "人工智能", "源码", "Claude", "Sora", "DeepSeek", "计算机", "网络", "信息", "泄露", "科技", "芯片", "算力", "大模型", "航天", "发射", "卫星", "极地"],
        "bookDesc": "人工智能科普/前沿科技/计算机/互联网类图书",
    },
}

# AI API 配置（智谱 GLM-4.7-Flash，最新免费模型，无限调用）
AI_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
AI_MODEL = "glm-4.7-flash"
AI_API_KEY_ENV = "ZHIPU_API_KEY"  # 环境变量名


def _match_hots_for_category(cat_info: Dict, all_items: List[Dict], top_n: int = 5) -> List[str]:
    """为一个类目从全部热搜中匹配最相关的 top_n 条标题（已过滤敏感话题）"""
    hot_kw = cat_info["hotKw"]
    scored = []
    seen = set()
    for item in all_items:
        title = item["title"]
        # 跳过敏感话题
        if _is_sensitive_topic(title):
            continue
        if title in seen:
            continue
        score = sum(1 for kw in hot_kw if kw.lower() in title.lower())
        # 加上类目标签匹配
        if item.get("tags"):
            score += len(item["tags"])
        if score > 0:
            scored.append((title, score))
            seen.add(title)
    scored.sort(key=lambda x: -x[1])
    return [t for t, s in scored[:top_n]]


# V6 审核规则详细版 Prompt（基于全行业通用+教育行业+阅读短剧规则文档）
V6_AUDIT_RULES_PROMPT = """## 腾讯广告 V6 审核红线（基于最新 V6 规则文档，严格遵守）

### 一、绝对化用语（❌ 直接拒审）
- 禁止：最好、最棒、最强、最优、最全、最新、最火、最畅销、最权威、最专业、最有效
- 禁止：绝对、肯定、必须、唯一、第一、顶级、领先、极致、完美、永久、彻底
- 禁止：全网第一/独家/仅此/空前、100%、百分百、零风险
- ✅ 替代：畅销、热门、备受喜爱、广受好评、值得关注

### 二、虚假夸大 / 效果承诺（❌ 直接拒审）
- 禁止：3天学会/5天掌握/X天变瘦/读完就变/看完就会
- 禁止：保过/稳过/一次通过/不过退费/押题密卷/押题准
- 禁止：成绩突飞猛进/分数蹭蹭涨/稳拿年级前排/想不考高分都难
- 禁止：薪资翻倍/年入百万/赚大钱/买房买车
- 禁止：解决所有问题/治好一切/效果立竿见影
- ✅ 替代：助力学习/陪伴阅读之旅/帮助了解/有助于拓展认知

### 三、焦虑营销 / 制造恐慌（❌ 直接拒审）
- 禁止：不买就晚了/再不读就落后了/别人家孩子都在看
- 禁止：你还不知道吧？(反问式焦虑)
- 禁止：大部分人都后悔了/很多人不知道(暗示信息差恐慌)
- ✅ 替代：翻开下一页，发现新可能/今天开始也不晚

### 四、饥饿营销 / 虚假稀缺（⚠️ 需资质）
- 禁止：仅剩XX本/马上断货/马上下架/最后X小时/限量抢购
- ⚠️ 如需使用"售完即止""售完下架"需提交活动备案资质
- ✅ 无资质时可用：数量有限/感兴趣速看

### 五、虚构人设 / 虚假事件（❌ 直接拒审）
- 禁止：110岁老奶奶推荐/震惊医学界的发明/填补XX界空白
- 禁止：发往海外又运回来了/解密/高层重视研发
- 禁止：人生逆袭剧场(穷→富)/情感导师自述经历
- ✅ 替代：真实读者证言/客观描述书籍内容特色

### 六、K12 学科培训（教育专项 ❌ 直接拒审）
- 禁止：保上985/211/冲刺名校/提升分数/成绩飞跃
- 禁止：超前学习/弯道超车/替代校内教学
- 禁止：暗示可提高学科能力/考试通过率
- ✅ 允许：实物书籍+"XX节"描述(如19.9元=物理大全+9节课)
- ✅ 允许：课外阅读/兴趣拓展/亲子共读/文化启蒙

### 七、价格违规
- 养生书价格不得低于19.9元
- "免费领""0元购"需活动备案资质
- 文案中不要出现具体价格数字

### 八、对比贬低（❌ 直接拒审）
- 禁止：比报班强100倍/比其他家好/比XX有效
- 禁止："学前vs学后"效果对比展示
- ✅ 替代：只突出自身优势，不提竞品

### 九、仿新闻/政策借用（❌ 直接拒审）
- 禁止：快讯/独家报道/紧急通知/最新通知等新闻标题样式
- 禁止：借时政热点营销（巡视/外交/政策/民生事件）
- 禁止：政府指定/国补/政策补贴/新课改等政策关联表述
- ✅ 替代：正常广告文案风格/文化/生活/中性话题借势

### 十、第二人称定向规范
- ❌ "30-40岁的你"/"20岁的你"（年龄+你直接定向）
- ✅ "想要阅读的你"/"渴望成长的你"/"要装修的你们"（愿景+泛指）
"""


def generate_ai_copies(all_items: List[Dict]) -> Dict[str, List[str]]:
    """
    调用智谱 GLM API 为每个图书类目生成结合今日热搜的前贴文案
    
    改进点（基于V6规则文档）：
    1. 预过滤敏感话题（时政/军事/负面事件），不用于文案生成
    2. 增强版审核规则 Prompt（从6条扩展到10大类50+细则）
    3. 输出后处理审核过滤器，对AI输出逐条校验
    
    返回: {"泛健康": ["文案1", "文案2", ...], "童书": [...], ...}
    如果 API 不可用或失败，返回空字典（模板中会使用硬编码的兜底文案）
    """
    api_key = os.environ.get(AI_API_KEY_ENV, "")
    if not api_key:
        log(f"⚠️ 未设置 {AI_API_KEY_ENV}，跳过 AI 文案生成（使用模板默认文案）", "WARN")
        return {}
    
    import urllib.request
    import urllib.error
    import time
    
    result = {}
    
    # ===== 预过滤：移除敏感话题热点 =====
    safe_items, filtered_titles = _sanitize_matched_hots(all_items)
    if filtered_titles:
        log(f"🔒 已过滤 {len(filtered_titles)} 条敏感话题热点，剩余 {len(safe_items)} 条可用于文案生成")
    
    for idx, (cat_name, cat_info) in enumerate(PAGE2_CATEGORIES.items()):
        # 请求间隔：避免触发限速（Too Many Requests）
        if idx > 0:
            time.sleep(8)
        
        # 为该类目匹配今日安全热搜
        matched_hots = _match_hots_for_category(cat_info, safe_items)
        if not matched_hots:
            log(f"  ⚠️ 类目[{cat_name}]无匹配安全热搜，跳过", "WARN")
            continue
        
        hots_text = "\n".join(f"  - {t}" for t in matched_hots)
        
        prompt = f"""你是一名图书广告的资深文案策划。请根据今日热搜话题，为「{cat_info['bookDesc']}」撰写10条前贴视频广告文案。

## 今日匹配热搜（已过滤敏感话题，可安全借势）
{hots_text}

## 文案要求
1. 每条约80-120字，共10条
2. 语言风格：口语化、有感染力、能吸引用户停留
3. 写作技巧：反常识开头/信息差钩子/设问反问/场景代入
4. 每条文案必须自然结合至少一个今日热搜话题引入图书推荐
5. 落点到图书产品，用"这本书""这套书"等泛指，不编造具体书名
6. 不使用任何具体价格数字

{V6_AUDIT_RULES_PROMPT}

## 输出格式
只输出10条合规文案，每条一行，用数字编号。如果某条无法确保合规，请替换为其他表达方式。
1. 文案内容
2. 文案内容
...
"""
        
        try:
            req_body = json.dumps({
                "model": AI_MODEL,
                "messages": [
                    {"role": "system", "content": "你是专业的图书广告文案策划师，精通腾讯广告V6审核规则，擅长结合热点话题撰写完全合规的广告前贴文案。你的文案通过率极高。"},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.75,
                "max_tokens": 3500,
            }).encode("utf-8")
            
            req = urllib.request.Request(
                AI_API_URL,
                data=req_body,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                method="POST",
            )
            
            log(f"  🤖 正在为[{cat_name}]生成 AI 文案（匹配{len(matched_hots)}条安全热搜）...")
            
            with urllib.request.urlopen(req, timeout=90) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
            
            content = resp_data.get("choices", [{}])[0].get("message", {}).get("content", "")
            
            # 解析文案：提取编号行
            raw_copies = []
            for line in content.strip().split("\n"):
                line = line.strip()
                if not line:
                    continue
                cleaned = _re_module.sub(r"^\d+[\.\、\)\]]\s*", "", line).strip()
                if len(cleaned) > 30:  # 有效文案至少30字
                    raw_copies.append(cleaned)
            
            # ===== 后处理审核过滤 =====
            passed_copies = _filter_copies(raw_copies)
            
            if passed_copies:
                result[cat_name] = passed_copies[:10]
                filtered_count = len(raw_copies) - len(passed_copies)
                log_msg = f"  ✅ [{cat_name}] 输出{len(raw_copies)}条 → 审核通过{len(passed_copies)}条"
                if filtered_count > 0:
                    log_msg += f"（过滤{filtered_count}条违规）"
                log(log_msg)
            else:
                log(f"  ⚠️ [{cat_name}] AI返回的全部文案均未通过审核过滤，该类目跳过", "WARN")
                
        except urllib.error.URLError as e:
            log(f"  ❌ [{cat_name}] API网络错误: {e.reason}", "ERROR")
        except Exception as e:
            log(f"  ❌ [{cat_name}] AI文案生成失败: {e}", "ERROR")
    
    total = sum(len(v) for v in result.values())
    if total > 0:
        log(f"🤖 AI文案生成完成（V6审核增强版）：{len(result)} 个类目共 {total} 条合规文案")
    
    return result


# ============================================================
#                   HTML 渲染引擎
# ============================================================

class DashboardRenderer:
    """工作台HTML渲染器"""
    
    def __init__(self, template_path: Path):
        self.template_path = template_path
        self.template_content = ""
        self._load_template()
    
    def _load_template(self):
        """加载HTML模板"""
        if not self.template_path.exists():
            log(f"模板文件不存在: {self.template_path}", "ERROR")
            raise FileNotFoundError(f"Template not found: {self.template_path}")
        
        with open(self.template_path, "r", encoding="utf-8") as f:
            self.template_content = f.read()
        
        log(f"加载模板成功: {self.template_path.name}")
    
    def render_column(self, platform_name: str, platform_key: str, 
                      items: List[Dict], source_url: str) -> str:
        """渲染单个平台的热搜列表列"""
        
        style = PLATFORM_STYLES.get(platform_name, {"bg": "#666", "short": "?"})
        short_name = style["short"]
        bg_color = style["bg"]
        
        # 表头
        html = f"""<div class="col">
<div class="col-h"><div class="ic" style="background:{bg_color}">{short_name}</div><h3>{platform_name}</h3><a href="{source_url}" target="_blank">查看来源 →</a></div>
<table><thead><tr><th class="rk">#</th><th>热搜话题</th><th style="width:30px">相关</th></tr></thead>
<tbody>
"""
        
        # 数据行
        for item in items:
            rank = item["rank"]
            rank_cls = f"r{rank}" if rank <= 3 else ""
            
            # 链接或纯文本
            if item["url"]:
                title_html = f'<a href="{item["url"]}" target="_blank">{item["title"]}</a>'
            else:
                title_html = item["title"]
            
            # 类目标签 + 方向说明
            dir_html = generate_category_html(item["tags"], item["direction"])
            
            # 相关度徽章
            rel_badge = generate_relevance_badge(item["relevance"])
            
            # 热度值
            heat_html = f'<span class="ht" style="margin-left:auto">{item["heat"]}</span>' if item["heat"] else ""
            
            html += (
                f'<tr class="{item["row_class"]}">'
                f'<td class="rk {rank_cls}">{rank}</td>'
                f'<td class="tp">{title_html}{dir_html}</td>'
                f'<td>{rel_badge}</td>'
                f'</tr>\n'
            )
        
        html += "</tbody></table>\n</div>\n"
        return html
    
    def render(self, data: Dict, extra_context: Dict = None) -> str:
        """
        渲染完整的HTML页面
        
        data 结构:
        {
            "wechat": [{"rank": 1, "title": "...", ...}, ...],
            "douyin": [...],
            "baidu": [...]
        }
        """
        now = datetime.now()
        date_str = now.strftime("%Y.%m.%d")
        generated_at = now.strftime("%Y年%m月%d日 %H:%M")
        
        # 处理各平台数据
        wechat_data = process_hot_items(data.get("wechat", []), "wechat")
        douyin_data = process_hot_items(data.get("douyin", []), "douyin")
        baidu_data = process_hot_items(data.get("baidu", []), "baidu")
        
        # 渲染三列
        columns_html = (
            self.render_column(
                "微信生态", "wechat", wechat_data,
                "https://ie.sogou.com/top/"
            ) +
            self.render_column(
                "抖音热榜", "douyin", douyin_data,
                "https://www.xpaihang.com/platform/douyin"
            ) +
            self.render_column(
                "百度热搜", "baidu", baidu_data,
                "https://top.baidu.com/board?tab=realtime"
            )
        )
        
        # ===== 页面2 数据：生成全平台热点合集JSON（含url、平台、热度）=====
        # 前置审核过滤：敏感话题不传入模板的类目匹配模块
        all_hots_for_page2 = []
        platform_labels = {"wechat": "微信", "douyin": "抖音", "baidu": "百度"}
        filtered_page2_count = 0
        for platform_key, platform_label in platform_labels.items():
            data_list = {"wechat": wechat_data, "douyin": douyin_data, "baidu": baidu_data}[platform_key]
            for item in data_list:
                title = item["title"]
                # 敏感话题过滤：不传给类目找热点模块
                if _is_sensitive_topic(title):
                    filtered_page2_count += 1
                    continue
                all_hots_for_page2.append({
                    "p": platform_label,
                    "t": title,
                    "u": item.get("url", ""),
                    "h": item["heat"] if item["heat"] else "",
                    "tags": item.get("tags", []),
                    "rel": item.get("relevance", "—"),
                })
        if filtered_page2_count > 0:
            log(f"🔒 页面2(类目找热点)已预过滤 {filtered_page2_count} 条敏感话题，剩余 {len(all_hots_for_page2)} 条")
        
        # ===== 页面3 数据：生成所有热点关键词字典（JS对象格式）=====
        all_hot_keywords_js = {}
        all_items = wechat_data + douyin_data + baidu_data
        hot_keywords_map = {
            "科学流言榜": ["科学", "流言", "辟谣", "谣言"],
            "西安高铁": ["西安", "高铁", "米字形"],
            "强磁暴极光": ["极光", "磁暴", "天文"],
            "午睡": ["午睡", "睡眠", "午休"],
            "海空卫士王伟": ["王伟", "81192", "海空", "卫士", "英雄", "牺牲"],
            "4月新规": ["新规", "4月", "法规", "安全带", "旅游新规"],
            "甲骨文裁员": ["甲骨文", "裁员", "失业", "被裁"],
            "台湾抢塑潮": ["台湾", "台海", "两岸", "国台办"],
            "沿江高铁东西大动脉": ["沿江", "高铁", "大动脉"],
            "教育部食堂": ["食堂", "教育部", "学校"],
            "清明": ["清明", "祭祀", "节日"],
            "Colorwalk": ["colorwalk", "色彩", "漫步"],
            "张雪机车": ["张雪", "机车", "达喀尔"],
            "全红婵": ["全红婵", "体重", "跳水"],
            "禁止早恋": ["早恋", "青春期", "恋爱"],
            "Sora关停": ["sora", "ai", "人工智能", "deepseek"],
            "ClaudeCode源码": ["claude", "源码", "ai"],
            "文物盘库": ["文物", "盘库", "国宝", "博物馆"],
            "军事机密运动手表": ["军事", "机密", "手表", "泄露"],
            "旅游新规": ["旅游", "新规", "景区"],
            "遗嘱": ["遗嘱", "继承", "遗产"],
            "安全带": ["安全带", "交通"],
        }
        
        # 用实际热搜标题补充关键词映射
        for item in all_items:
            title = item["title"]
            if title not in hot_keywords_map:
                # 从标题中提取关键词
                keywords = [w for w in title if len(w) > 1][:5]
                if not keywords:
                    keywords = [title.lower()]
                hot_keywords_map[title] = keywords + [title.lower()]
            all_hot_keywords_js[title] = hot_keywords_map[title]
        
        import json as _json
        page2_all_hots_json = _json.dumps(all_hots_for_page2, ensure_ascii=False)
        all_hots_json = _json.dumps(all_hot_keywords_js, ensure_ascii=False)
        
        # ===== 页面2 AI文案：调用 DeepSeek 生成每日前贴文案 =====
        ai_copies = generate_ai_copies(all_items)
        # 将 AI 文案注入模板数据（JSON格式，供 JS 使用）
        ai_copies_json = _json.dumps(ai_copies, ensure_ascii=False) if ai_copies else "{}"
        
        # 替换模板中的占位符
        output = self.template_content
        
        # 基础信息替换
        output = output.replace("{{DATE_STR}}", date_str)
        output = output.replace("{{GENERATED_AT}}", generated_at)
        output = output.replace("{{GENERATED_ISO}}", now.isoformat())
        
        # 核心数据：三列热搜列表
        output = output.replace("{{HOT_COLUMNS}}", columns_html)
        
        # 页面2数据：全平台热点合集（用于类目智能匹配）
        output = output.replace("{{ALL_HOTS_FOR_PAGE2}}", page2_all_hots_json)
        
        # 页面2数据：AI生成的每日前贴文案
        output = output.replace("{{AI_COPIES_JSON}}", ai_copies_json)
        
        # 页面3数据：所有热点关键词（用于文案利用率检测）
        output = output.replace("{{ALL_HOT_KEYWORDS_JSON}}", all_hots_json)
        
        # 统计信息
        total_count = len(wechat_data) + len(douyin_data) + len(baidu_data)
        high_rel_count = sum(
            1 for d in wechat_data + douyin_data + baidu_data 
            if d["relevance"] == "高"
        )
        output = output.replace("{{TOTAL_COUNT}}", str(total_count))
        output = output.replace("{{HIGH_REL_COUNT}}", str(high_rel_count))
        
        # 自定义上下文替换
        if extra_context:
            for key, value in extra_context.items():
                output = output.replace(f"{{{{{key}}}}}", str(value))
        
        log(f"HTML渲染完成：{len(wechat_data)} 微信 + {len(douyin_data)} 抖音 + "
            f"{len(baidu_data)} 百度 = 共 {total_count} 条 | 高相关度 {high_rel_count} 条")
        
        return output


# ============================================================
#                      主流程
# ============================================================

def main():
    """主函数"""
    mode_label = "☁️ 云端模式 (Vercel)" if OUTPUT_MODE == "cloud" else "🏠 本地模式 (微信临时文件)"
    print("=" * 65)
    print(f"🔄 图书热点工作台 - 数据更新开始")
    print(f"   时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   模式: {mode_label}")
    print("=" * 65)
    
    # Step 0: 准备环境
    ensure_dirs()
    
    # Step 1: 备份现有文件
    backup_existing()
    
    # Step 2: 获取数据
    print("\n📡 [Step 1/4] 获取热搜数据...")
    fetchers = {
        "auto": HotDataFetcher.from_auto,
        "json": HotDataFetcher.from_json,
        "api": HotDataFetcher.from_api,
        "database": HotDataFetcher.from_database,
    }
    
    if DATA_SOURCE not in fetchers:
        log(f"⚠️ 未知的DATA_SOURCE: {DATA_SOURCE}，回退到auto模式", "WARN")
        _source = "auto"
    else:
        _source = DATA_SOURCE
    
    # auto模式时显示额外提示
    if _source == "auto":
        print("   🌐 模式: 自动从公网API抓取（百度/抖音/搜狗=微信生态）")
        print(f"   📦 缓存: {JSON_DATA_FILE.name}")
    
    # 云模式提示
    if OUTPUT_MODE == "cloud":
        print(f"   📂 输出目录: {OUTPUT_FILE.parent}")
    else:
        print(f"   📄 输出文件: {OUTPUT_FILE}")
    
    fetcher = fetchers[_source]
    raw_data = fetcher()
    
    # 校验数据
    total_raw = sum(len(v) for v in raw_data.values())
    if total_raw == 0:
        log("⚠️ 未获取到任何数据！将使用空数据渲染（页面将显示暂无内容）", "WARN")
    
    # Step 3: 渲染HTML
    print("\n🖥️  [Step 2/4] 渲染HTML页面...")
    try:
        renderer = DashboardRenderer(TEMPLATE_FILE)
        html_output = renderer.render(raw_data, {
            "UPDATE_FREQUENCY": "每日自动更新",
            "SOURCE_NOTE": f"数据源: {DATA_SOURCE}",
        })
    except FileNotFoundError:
        log("模板文件不存在，无法继续！", "ERROR")
        sys.exit(1)
    
    # Step 4: 写入输出文件
    print("\n💾 [Step 3/4] 写入输出文件...")
    OUTPUT_FILE.write_text(html_output, encoding="utf-8")
    file_size = OUTPUT_FILE.stat().st_size
    
    # 完成
    print("\n" + "=" * 65)
    print(f"✅ 更新完成！")
    print(f"   📄 输出文件: {OUTPUT_FILE}")
    print(f"   📦 文件大小: {file_size:,} bytes ({file_size // 1024} KB)")
    if OUTPUT_MODE == "cloud":
        print(f"   🔗 访问方式: Vercel 自动部署后通过域名访问 index.html")
    else:
        print(f"   🔗 访问链接: 不变（同一文件被内容覆盖）")
    print(f"   📊 数据条数: {total_raw}")
    print(f"   ⏰ 更新时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 65)
    
    return True


if __name__ == "__main__":
    main()
