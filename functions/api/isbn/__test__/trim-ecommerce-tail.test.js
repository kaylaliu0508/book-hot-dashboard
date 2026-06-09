/**
 * 回归测试：trimEcommerceTail（书名清洗）
 *
 * 运行方式：
 *   cd /Users/jiangxinbei/WorkBuddy/repos/book-hot-dashboard
 *   node functions/api/isbn/__test__/trim-ecommerce-tail.test.js
 *
 * 修复目标（2026-06-09）：
 *   书名内"主标 + 空格 + 副标"型不再被无条件砍掉副标
 * 反向保证：
 *   电商尾巴（卖点描述、受众范围、套装版次）仍然要被切掉
 */

// 把待测函数从 lookup.js 抠出来 —— 用 vm 沙盒读源码并 eval 出来，避免 ESM/Workers 全局依赖问题
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'lookup.js'), 'utf8');
// 截取 trimEcommerceTail 函数定义到下一个 async function fetchIsbnWork 之前
const fnStart = src.indexOf('function trimEcommerceTail');
const fnEnd = src.indexOf('async function fetchIsbnWork');
if (fnStart < 0 || fnEnd < 0) {
  console.error('❌ 未能在 lookup.js 中定位 trimEcommerceTail 函数');
  process.exit(1);
}
const fnSrc = src.slice(fnStart, fnEnd);
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fnSrc + '\nthis.trimEcommerceTail = trimEcommerceTail;', sandbox);
const { trimEcommerceTail } = sandbox;

// ---------------- 用例集 ----------------
// 每条 [输入, 期望输出, 说明]
const cases = [
  // ============ 🟢 正向：主+副标题型，必须保留全文 ============
  ['我是中国人 所以我知道', '我是中国人 所以我知道', '【bug 修复】上游用空格代替中文逗号，不应砍掉副标题'],
  ['我是中国人 所以我知道\u3000', '我是中国人 所以我知道', '尾部含全角空格也不影响（trim 处理）'],
  ['活着 就是要好好活着', '活着 就是要好好活着', '主+副标题型，左 2 右 6，无电商特征 → 保留'],
  ['人间值得 12个小习惯', '人间值得 12个小习惯', '右侧虽然含数字，但不是岁/年级 → 保留'],
  ['解忧杂货店 东野圭吾代表作', '解忧杂货店 东野圭吾代表作', '右侧"作家代表作"非电商卖点 → 保留'],

  // ============ 🔴 反向：电商尾巴必须被切掉 ============
  ['这样吃长更高 给孩子的长高营养食谱', '这样吃长更高', '右侧含"给X的"介词 → 切'],
  ['专注力训练 写给3-6岁孩子的认知启蒙', '专注力训练', '右侧含"写给"+"3-6岁" → 切'],
  ['超级飞侠科学绘本 0-3岁亲子启蒙图画书', '超级飞侠科学绘本', '右侧含"0-3岁"受众范围 → 切'],
  ['哈利波特全集 全7册 中文版精装套装', '哈利波特全集', '右侧含"全7册"+"套装" → 切'],
  ['妈妈的爱 正版包邮现货新书速发', '妈妈的爱', '右侧以"正版"开头 → 切'],
  ['育儿百科 0-6岁宝宝养育指南 适合新手父母', '育儿百科', '右侧多空格分段 → 切'],
  ['漫画帝王家书修言行练处世谋略', '漫画帝王家书修言', '> 12 字纯连续中文 → 截前 8 字（规则 6 兜底）'],

  // ============ 🟢 边界：≤ 8 字一律不动 ============
  ['百年孤独', '百年孤独', '≤ 8 字一律不动'],
  ['解忧杂货店', '解忧杂货店', '≤ 8 字一律不动'],
  ['如何阅读一本书', '如何阅读一本书', '7 字主书名'],

  // ============ 🟢 副标题分隔符 ============
  ['人间值得：12个小习惯', '人间值得', '冒号副标题 → 切（规则 5 保留）'],
  ['人间值得—12个小习惯', '人间值得', '破折号副标题 → 切'],

  // ============ 🟢 中文标点 ============
  ['我是中国人，所以我知道', '我是中国人', '中文逗号 → 切到首逗号前（规则 4 保留）'],
];

let pass = 0;
let fail = 0;
const failed = [];
cases.forEach(([input, expect, note], i) => {
  const got = trimEcommerceTail(input);
  if (got === expect) {
    pass += 1;
    console.log(`✅ [${i + 1}/${cases.length}] ${JSON.stringify(input)} → ${JSON.stringify(got)}  // ${note}`);
  } else {
    fail += 1;
    failed.push({ i: i + 1, input, expect, got, note });
    console.log(`❌ [${i + 1}/${cases.length}] ${JSON.stringify(input)}`);
    console.log(`     期望: ${JSON.stringify(expect)}`);
    console.log(`     实际: ${JSON.stringify(got)}`);
    console.log(`     说明: ${note}`);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`测试结果：${pass} 通过 / ${fail} 失败 / ${cases.length} 总计`);
if (fail > 0) {
  console.log('\n❌ 有失败用例，详情：');
  failed.forEach((f) => {
    console.log(`  #${f.i} ${f.note}`);
    console.log(`    输入: ${JSON.stringify(f.input)}`);
    console.log(`    期望: ${JSON.stringify(f.expect)}  实际: ${JSON.stringify(f.got)}`);
  });
  process.exit(1);
}
console.log('🎉 全部通过');
