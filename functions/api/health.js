import { json, preflight } from './_tracker_lib.js';

export const onRequestOptions = () => preflight();

// 健康检查：除了 ok/ts，还要把关键 binding 状态暴露出来，方便诊断
// 否则 stats 端 no_kv 时谁都不知道是 binding 丢了还是别的问题
export const onRequestGet = async ({ env }) => {
  const kvBound = !!(env && env.TRACKER_AGG);
  let kvProbe = null;
  if (kvBound) {
    try {
      // 探测一次：读一个固定 key（不存在就返回 null），看 binding 是否能正常调用
      await env.TRACKER_AGG.get('index:dates');
      kvProbe = 'ok';
    } catch (e) {
      kvProbe = 'err:' + (e && e.message ? e.message.slice(0, 80) : 'unknown');
    }
  }
  return json({
    ok: true,
    ts: Date.now(),
    checks: {
      kv_binding: kvBound ? 'bound' : 'MISSING',
      kv_probe: kvProbe,
      retention_days: env?.RETENTION_DAYS || '90(default)',
    },
  });
};
