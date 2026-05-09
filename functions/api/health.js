import { json, preflight } from './_tracker_lib.js';

export const onRequestOptions = () => preflight();
export const onRequestGet = () => json({ ok: true, ts: Date.now() });
