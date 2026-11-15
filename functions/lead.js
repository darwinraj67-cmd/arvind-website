'use strict';
/**
 * POST /.netlify/functions/lead
 * Called by the chatbot once name + phone + service are collected.
 * - If LEAD_WEBHOOK_URL is set (Zapier / Make / Google Apps Script / Slack...), the lead is forwarded there.
 * - Otherwise it is written to the Netlify function log (Netlify dashboard -> Functions -> lead -> Logs).
 */
const { sanitizeLead } = require('../lib/prompt');
const hits = new Map();
const json = (statusCode, obj) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(obj) });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });
  const h = event.headers || {};
  const ip = String(h['x-nf-client-connection-ip'] || h['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 3600000); arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  if (arr.length > 5) return json(429, { error: 'rate_limited' });

  let body; try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'bad_request' }); }
  const lead = sanitizeLead(body.lead);
  if (!lead.name || !lead.phone || !lead.service) return json(400, { error: 'incomplete' });

  const payload = { source: 'arunplastics-website-chatbot', receivedAt: new Date().toISOString(), lead };
  const hook = process.env.LEAD_WEBHOOK_URL;
  if (hook) {
    try {
      await fetch(hook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10000) });
    } catch (e) { console.error('Lead webhook failed'); }
  } else {
    console.log('NEW LEAD', JSON.stringify(payload));
  }
  return json(200, { ok: true });
};
