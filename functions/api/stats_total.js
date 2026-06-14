/**
 * Pages Function: GET /api/stats_total
 * 返回各 tab 自埋点上线以来的累计 PV / UV（读 KV 的 *:total key，不做日级聚合）。
 *
 * 由于 Workers subrequest 上限（免费 50 / 付费 1000），原 stats.js 拉 30d/90d 会超限，
 * 这个接口只读 7 tabs × 2 keys = 14 个 KV.get，秒级返回 since-launch 总数。
 *
 * 注：UV total 受 UV_DAILY_CAP * 5 = 数千 uid 上限限制，超过部分会丢弃，
 *     所以 UV 是「最近覆盖到的累计去重用户数」，PV 是绝对真实累计。
 */
import { CORS, json, preflight, VALID_TABS } from './_tracker_lib.js';

export const onRequestOptions = () => preflight();

export const onRequestGet = async ({ env }) => {
  const KV = env.TRACKER_AGG;
  if (!KV) return json({ error: 'no_kv' });

  const tabs = Array.from(VALID_TABS);
  const result = { tabs: {}, totalPv: 0, totalUv: 0 };

  await Promise.all(tabs.map(async (tab) => {
    const [pvRaw, uvArr] = await Promise.all([
      KV.get(`pv:${tab}:total`),
      KV.get(`uv:${tab}:total`, 'json'),
    ]);
    const pv = parseInt(pvRaw || '0', 10) || 0;
    const uv = Array.isArray(uvArr) ? uvArr.length : 0;
    result.tabs[tab] = { pv, uv };
    result.totalPv += pv;
  }));

  // 全站 UV：合并所有 tab 的 uid set 去重（避免同一用户在多 tab 重复算）
  const allUidSet = new Set();
  await Promise.all(tabs.map(async (tab) => {
    const uvArr = await KV.get(`uv:${tab}:total`, 'json');
    if (Array.isArray(uvArr)) uvArr.forEach((u) => allUidSet.add(u));
  }));
  result.totalUv = allUidSet.size;

  return json(result);
};
