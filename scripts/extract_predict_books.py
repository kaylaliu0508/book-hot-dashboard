#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解析 data/predict_recommend_2026.xlsx，按 4 个品类（教辅/童书/社科/健康）：
  1. 提取每条 ISBN 数据
  2. 把 xlsx 内嵌图片按行号锚点抽出来 → repo/site_output/select/book-images/recbook_predict_xxx.jpg
  3. 生成 repo/site_output/select/recommend-data.js（按品类 key，rank 在每个品类内独立从 1 开始）
"""
import os, re, json, shutil, zipfile
from xml.etree import ElementTree as ET
from python_calamine import CalamineWorkbook
import sys

# 智能识别脚本所在位置，支持两种场景：
#  A) 脚本在 工作区根目录/scripts/ → REPO_ROOT 是工作区根目录，repo 子目录在 REPO_ROOT/repo
#  B) 脚本在 repo/scripts/ → REPO_ROOT 是 repo 目录，repo 子目录就是 REPO_ROOT 自身
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT = os.path.dirname(SCRIPT_DIR)
if os.path.isdir(os.path.join(PARENT, 'repo', 'site_output')):
    # 场景 A：工作区根目录布局
    REPO_ROOT = PARENT
    SITE_OUTPUT = os.path.join(REPO_ROOT, 'repo', 'site_output')
elif os.path.isdir(os.path.join(PARENT, 'site_output')):
    # 场景 B：repo 内布局
    REPO_ROOT = PARENT
    SITE_OUTPUT = os.path.join(REPO_ROOT, 'site_output')
else:
    raise RuntimeError('无法定位 site_output 目录，请检查项目结构')

# 支持命令行参数：python3 scripts/extract_predict_books.py [path/to/some.xlsx]
# 不传参时默认读 data/predict_recommend_2026.xlsx
DEFAULT_XLSX = os.path.join(REPO_ROOT, 'data', 'predict_recommend_2026.xlsx')
XLSX = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_XLSX
if not os.path.isabs(XLSX):
    XLSX = os.path.join(REPO_ROOT, XLSX)
print(f'📄 读取 xlsx: {XLSX}')
print(f'📁 输出目录: {SITE_OUTPUT}')

IMG_OUT = os.path.join(SITE_OUTPUT, 'select', 'book-images')
JS_OUT  = os.path.join(SITE_OUTPUT, 'select', 'recommend-data.js')

NS = {
    'a':   'http://schemas.openxmlformats.org/drawingml/2006/main',
    'xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
    'r':   'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
}

CAT_ORDER = ['教辅', '童书', '社科', '健康']
CAT_KEY = {
    '教辅': '教辅推荐书单',
    '童书': '童书推荐书单',
    '社科': '社科推荐书单',
    '健康': '健康推荐书单',
}

# ---------- 1. 解析每个 sheet 的表格数据 ----------
def parse_table(name):
    wb = CalamineWorkbook.from_path(XLSX)
    ws = wb.get_sheet_by_name(name)
    rows = ws.to_python()
    header_idx = None
    for i, row in enumerate(rows):
        if any(str(c).strip() == '书名' for c in row if c):
            header_idx = i
            break
    if header_idx is None:
        return None, []
    headers = [str(c or '').strip() for c in rows[header_idx]]
    data = []
    for row_idx, row in enumerate(rows[header_idx+1:], start=header_idx+2):  # +2 = 1-based 的下一行
        if not any(c for c in row): continue
        rec = {'_row1based': row_idx}
        for i, h in enumerate(headers):
            if i < len(row) and row[i] is not None:
                v = str(row[i]).strip().replace('\n', ' ').strip()
                if v: rec[h] = v
        if rec.get('书名') or rec.get('ISBN'):
            data.append(rec)
    return headers, data

# ---------- 2. 解析每个 sheet 的 drawing.xml，建立 row→image 文件 ----------
def parse_drawing_for_sheet(z, sheet_xml_path):
    """从 sheet 的 _rels 找到 drawing.xml 的相对路径，再解析 drawing.xml 的所有 anchor"""
    base = os.path.basename(sheet_xml_path)  # e.g. sheet2.xml
    rels_path = f'xl/worksheets/_rels/{base}.rels'
    if rels_path not in z.namelist():
        return {}
    rels_xml = z.read(rels_path).decode('utf-8')
    drawing_rel = re.search(r'Target="([^"]+drawing[^"]+\.xml)"', rels_xml)
    if not drawing_rel:
        return {}
    # 把相对路径 ../drawings/drawing2.xml 解析成绝对 zip 路径
    rel_target = drawing_rel.group(1)
    if rel_target.startswith('../'):
        drawing_path = 'xl/' + rel_target[3:]
    else:
        drawing_path = 'xl/worksheets/' + rel_target
    drawing_path = os.path.normpath(drawing_path).replace('\\', '/')
    if drawing_path not in z.namelist():
        return {}
    # 读 drawing 的 _rels（图片 r:embed → media/imageX.png）
    drawing_rels_path = f'xl/drawings/_rels/{os.path.basename(drawing_path)}.rels'
    embed_to_media = {}
    if drawing_rels_path in z.namelist():
        d_rels = z.read(drawing_rels_path).decode('utf-8')
        # 注意：不能用 [^/]+，因为 Type 的 URL 里就有 /，会让正则匹配不到
        for m in re.finditer(r'Id="([^"]+)"[^>]*Target="([^"]+)"', d_rels):
            rid, target = m.group(1), m.group(2)
            if 'media' in target:
                # ../media/image1.png 或 media/image1.png
                if target.startswith('../'):
                    target = 'xl/' + target[3:]
                else:
                    target = 'xl/drawings/' + target
                embed_to_media[rid] = os.path.normpath(target).replace('\\', '/')
    # 解析 drawing.xml 中所有 anchor（oneCellAnchor / twoCellAnchor），取 row + r:embed
    d_xml = z.read(drawing_path).decode('utf-8')
    root = ET.fromstring(d_xml)
    row_to_image = {}
    for anchor_tag in ['{%s}oneCellAnchor' % NS['xdr'], '{%s}twoCellAnchor' % NS['xdr']]:
        for anchor in root.iter(anchor_tag):
            from_el = anchor.find('xdr:from', NS)
            if from_el is None: continue
            row_el = from_el.find('xdr:row', NS)
            if row_el is None or row_el.text is None: continue
            row_idx_0based = int(row_el.text)
            row_idx_1based = row_idx_0based + 1
            # 找 a:blip r:embed
            blip = anchor.find('.//a:blip', NS)
            if blip is None: continue
            rid = blip.get('{%s}embed' % NS['r'])
            if not rid or rid not in embed_to_media: continue
            media_path = embed_to_media[rid]
            row_to_image[row_idx_1based] = media_path
    return row_to_image

def build_sheet_xml_map(z):
    """把 workbook.xml 中 sheet 名 → sheet*.xml 的映射建出来（用 ET 解析更稳）"""
    PKG = 'http://schemas.openxmlformats.org/package/2006/relationships'
    R   = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    SS  = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'

    rels_root = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
    rid_to_target = {}
    for rel in rels_root.findall('{%s}Relationship' % PKG):
        target = rel.get('Target') or ''
        if 'worksheets/sheet' in target:
            rid_to_target[rel.get('Id')] = 'xl/' + target.lstrip('/')

    wb_root = ET.fromstring(z.read('xl/workbook.xml'))
    name_to_sheet = {}
    sheets_el = wb_root.find('{%s}sheets' % SS)
    if sheets_el is not None:
        for sh in sheets_el.findall('{%s}sheet' % SS):
            rid = sh.get('{%s}id' % R)
            if rid and rid in rid_to_target:
                name_to_sheet[sh.get('name')] = rid_to_target[rid]
    return name_to_sheet

# ---------- 3. 主流程：抽数据 + 抽图片 + 写 JS ----------
def main():
    os.makedirs(IMG_OUT, exist_ok=True)
    z = zipfile.ZipFile(XLSX)
    name_to_sheet = build_sheet_xml_map(z)
    print('Sheet 映射:', name_to_sheet)

    out_data = {}
    img_counter = 0

    for cat in CAT_ORDER:
        headers, records = parse_table(cat)
        if not records:
            print(f'⚠️ {cat} 解析失败')
            continue
        sheet_xml = name_to_sheet.get(cat)
        row_to_image = parse_drawing_for_sheet(z, sheet_xml) if sheet_xml else {}
        print(f'📚 {cat}: 数据 {len(records)} 条，图片锚点 {len(row_to_image)} 个')

        items = []
        for idx, rec in enumerate(records, start=1):
            row1 = rec.get('_row1based')
            img_field = ''
            if row1 in row_to_image:
                src_in_zip = row_to_image[row1]
                ext = os.path.splitext(src_in_zip)[1].lower() or '.jpg'
                img_counter += 1
                fname = f'recbook_predict_{cat}_{idx}{ext}'
                # 兼容旧路径前缀
                with z.open(src_in_zip) as fr:
                    with open(os.path.join(IMG_OUT, fname), 'wb') as fw:
                        fw.write(fr.read())
                img_field = f'book-images/{fname}'

            isbn_raw = (rec.get('ISBN') or rec.get('isbn编码') or '').strip()
            # 处理 8820220913.0 这种科学计数法残留
            if isbn_raw.endswith('.0'): isbn_raw = isbn_raw[:-2]
            isbn_raw = re.sub(r'[\s\-]', '', isbn_raw)

            item = {
                'title': rec.get('书名', '').strip(),
                'rank': idx,
            }
            if rec.get('作者'): item['author'] = rec['作者']
            if rec.get('出版社'): item['publisher'] = rec['出版社']
            if img_field: item['image'] = img_field
            if rec.get('adq准入情况'): item['ams_status'] = rec['adq准入情况']
            if rec.get('推荐投放时间'): item['recommend_time'] = rec['推荐投放时间']
            if isbn_raw: item['isbn'] = isbn_raw
            items.append(item)

        out_data[CAT_KEY[cat]] = items

    # 写 JS（保持原有顺序：童书 / 教辅 / 社科 / 健康）
    js_order = ['童书推荐书单','教辅推荐书单','社科推荐书单','健康推荐书单']
    body = {}
    for k in js_order:
        if k in out_data:
            body[k] = out_data[k]

    js_text = (
        '// 推荐书单数据（来自《【腾讯图书】预测推荐书单 (1).xlsx》）\n'
        '// 4 大品类 + ISBN + 推荐投放时间，每个品类内 rank 独立从 1 开始\n'
        f'// 生成时间: {os.popen("date +\"%Y-%m-%d %H:%M:%S\"").read().strip()}\n'
        '\n'
        'const RECOMMEND_BOOKS = '
        + json.dumps(body, ensure_ascii=False, indent=2)
        + ';\n'
    )
    with open(JS_OUT, 'w', encoding='utf-8') as f:
        f.write(js_text)
    print(f'\n✅ 已写入 {JS_OUT}')
    print(f'✅ 共抽取图片 {img_counter} 张到 {IMG_OUT}')
    for k, v in body.items():
        print(f'   - {k}: {len(v)} 条')

if __name__ == '__main__':
    main()
