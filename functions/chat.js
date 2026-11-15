'use strict';
/**
 * POST /.netlify/functions/chat
 * Website -> this secure endpoint -> Anthropic (Claude) API -> reply back to the chatbot.
 * The API key lives ONLY in the ANTHROPIC_API_KEY environment variable on the server.
 */
const knowledge = require('../lib/knowledge');
const { buildSystemPrompt, sanitizeLead, cleanMessages, parseModelReply } = require('../lib/prompt');

const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-5-5'; // change in Netlify env vars if you like
const hits = new Map(); // best-effort per-IP rate limit (resets when the function cold-starts)

function tooMany(ip, perMinute) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > perMinute;
}
const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(503, { error: 'not_configured' });

  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  if (allowed.length && origin && !allowed.includes(origin)) return json(403, { error: 'forbidden' });

  const h = event.headers || {};
  const ip = String(h['x-nf-client-connection-ip'] || h['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (tooMany(ip, 12)) return json(429, { error: 'rate_limited' });

  if ((event.body || '').length > 2500000) return json(413, { error: 'too_large' });
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (e) { return json(400, { error: 'bad_request' }); }

  const { messages, image } = cleanMessages(body.messages, body.image);
  if (!messages.length) return json(400, { error: 'no_messages' });

  const system = buildSystemPrompt(knowledge, body.lead);
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));
  if (image) {
    const last = apiMessages[apiMessages.length - 1];
    last.content = [
      { type: 'image', source: { type: 'base64', media_type: image.media_type, data: image.data } },
      { type: 'text', text: last.content },
    ];
  }

  let res;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 700, system, messages: apiMessages }),
      signal: AbortSignal.timeout(25000),
    });
  } catch (e) {
    return json(504, { error: 'upstream_timeout' });
  }
  if (!res.ok) {
    console.error('Anthropic API error', res.status); // status only - never log keys or customer text
    return json(502, { error: 'upstream_error' });
  }
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  const out = parseModelReply(text);
  if (!out.lead) out.lead = sanitizeLead(body.lead);
  return json(200, out);
};
