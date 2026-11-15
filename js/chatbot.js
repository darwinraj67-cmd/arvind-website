/* ARUN PLASTICS - AI chat widget
   Website -> secure backend (/.netlify/functions/chat) -> AI API -> reply.
   No API key is ever stored in this file. Edit CONFIG below to customise. */
(function () {
  'use strict';

  var CONFIG = {
    endpoint: '/.netlify/functions/chat',      // your secure backend endpoint
    leadEndpoint: '/.netlify/functions/lead',  // receives a finished enquiry
    whatsapp: '918610470488',                  // EDIT: WhatsApp number (country code, no + or spaces)
    title: 'Arun Plastics',
    subtitle: 'AI Assistant · Online',
    avatar: 'images/favicon.png',
    allowImages: true,
    timeoutMs: 30000,
    nudgeText: 'Hi! 👋 Need help with a sign board or printing?',
    // EDIT: first message shown when the chat opens
    welcome: [
      '👋 Hi! Welcome to Arun Plastics.', '',
      'How can we help you today?', '',
      'You can ask us about:',
      '• LED & Glow Sign Boards',
      '• ACP & Acrylic Sign Boards',
      '• Flex & UV Printing',
      '• Vehicle Branding',
      '• Visiting Cards & Printing',
      '• Rubber Stamps',
      '• Shop & Corporate Branding', '',
      'How can we help you?'
    ].join('\n'),
    // [button label, message sent to the AI, service name used in the WhatsApp message]
    chips: [
      ['LED Sign Board', "I'm interested in an LED sign board.", 'LED Sign Boards'],
      ['Glow Sign Board', 'I need a glow sign board for my shop.', 'Glow Sign Boards'],
      ['ACP Sign Board', "I'd like to know about ACP sign boards.", 'ACP Sign Boards'],
      ['Acrylic Signage', "I'm interested in acrylic signage.", 'Acrylic Signage'],
      ['Flex Printing', 'I need flex printing.', 'Flex Printing'],
      ['UV Printing', "I'm interested in UV printing.", 'UV Printing'],
      ['Vehicle Branding', 'I want vehicle branding.', 'Vehicle Branding'],
      ['Visiting Cards', 'I need visiting cards.', 'Visiting Cards'],
      ['Rubber Stamp', 'I need a rubber stamp.', 'Rubber Stamps'],
      ['Get a Quote', "I'd like to get a quote.", '']
    ]
  };
  var user = window.ARUN_CHAT_CONFIG || {};
  for (var k in user) CONFIG[k] = user[k];

  var LEAD_KEYS = ['name', 'phone', 'service', 'quantity', 'size', 'location', 'notes'];
  var LABELS = { name: 'Name', phone: 'Phone', service: 'Service', quantity: 'Quantity', size: 'Size', location: 'Location', notes: 'Notes' };
  var S = { msgs: [], history: [], lead: {}, hint: '', notified: false, welcomed: false };
  var busy = false, pend = null, el = {};

  /* ---------- storage (keeps the chat while visitor browses other pages) ---------- */
  function save() { try { sessionStorage.setItem('aic_state', JSON.stringify({ msgs: S.msgs.slice(-40), history: S.history.slice(-14), lead: S.lead, hint: S.hint, notified: S.notified, welcomed: S.welcomed })); } catch (e) {} }
  function load() { try { var d = JSON.parse(sessionStorage.getItem('aic_state') || 'null'); if (d) for (var k in d) S[k] = d[k]; } catch (e) {} }

  /* ---------- helpers ---------- */
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function fmt(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
  function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function scroll() { el.body.scrollTop = el.body.scrollHeight; }
  var WA_ICON = '<svg viewBox="0 0 24 24"><path d="M20.5 3.5A11.8 11.8 0 0 0 12 0 11.9 11.9 0 0 0 1.7 17.8L0 24l6.4-1.7A11.9 11.9 0 0 0 12 24a11.9 11.9 0 0 0 8.5-20.5zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4A9.8 9.8 0 1 1 12 21.8zm5.4-7.3c-.3-.1-1.7-.9-2-1s-.5-.1-.7.1-.8 1-1 1.2-.4.2-.7.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.4 3.4 14.7 14.7 0 0 0 5.6 4.9c2.1.9 2.9.9 3.9.8a3.3 3.3 0 0 0 2.2-1.6 2.7 2.7 0 0 0 .2-1.6c-.1-.1-.3-.2-.6-.3z"/></svg>';

  /* ---------- WhatsApp handoff ---------- */
  function waText() {
    var svc = S.lead.service || S.hint;
    var t = 'Hi Arun Plastics, I found you through your website. I would like to enquire about ' + (svc || 'your services') + '.';
    var lines = [];
    LEAD_KEYS.forEach(function (k) { if (k !== 'service' && S.lead[k]) lines.push(LABELS[k] + ': ' + S.lead[k]); });
    return lines.length ? t + '\n\n' + lines.join('\n') : t;
  }
  function waUrl() { return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(waText()); }
  function openWA() { window.open(waUrl(), '_blank', 'noopener'); }

  /* ---------- build UI ---------- */
  function build() {
    var w = h('div', 'aic');
    w.id = 'aic'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Chat with Arun Plastics'); w.setAttribute('aria-hidden', 'true');
    w.innerHTML =
      '<div class="aic-h"><div class="aic-av"><img alt="" src="' + esc(CONFIG.avatar) + '"></div>' +
      '<div class="aic-t"><b>' + esc(CONFIG.title) + '</b><span><i></i>' + esc(CONFIG.subtitle) + '</span></div>' +
      '<button type="button" class="aic-x" aria-label="Minimize chat">&#8211;</button></div>' +
      '<div class="aic-body" aria-live="polite"></div>' +
      '<div class="aic-tools"><button type="button" class="aic-wa">' + WA_ICON + 'Chat on WhatsApp</button></div>' +
      '<div class="aic-pend"><img alt="Attached image"><span style="font-size:12.5px;color:#666;flex:1">Image attached</span><button type="button" aria-label="Remove image">&times;</button></div>' +
      '<form class="aic-f" autocomplete="off">' +
      (CONFIG.allowImages ? '<button type="button" class="aic-att" aria-label="Attach a reference image"><svg viewBox="0 0 24 24"><path d="M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10.5a1 1 0 0 1-2 0V6H10v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6z"/></svg></button><input type="file" accept="image/*" hidden>' : '') +
      '<textarea rows="1" maxlength="800" placeholder="Type your message…" aria-label="Your message"></textarea>' +
      '<button type="submit" class="aic-send" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M2.5 21.5 23 12 2.5 2.5l-.1 7.4L16 12 2.4 14.1z"/></svg></button></form>' +
      '<p class="aic-note">AI assistant. Our team confirms prices and details.</p>';
    document.body.appendChild(w);
    el.win = w; el.body = w.querySelector('.aic-body'); el.input = w.querySelector('textarea'); el.send = w.querySelector('.aic-send');
    el.form = w.querySelector('form'); el.file = w.querySelector('input[type=file]'); el.pend = w.querySelector('.aic-pend');

    w.querySelector('.aic-x').onclick = close;
    w.querySelector('.aic-wa').onclick = openWA;
    el.form.onsubmit = function (e) { e.preventDefault(); send(el.input.value); };
    el.input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(el.input.value); } });
    el.input.addEventListener('input', autosize);
    el.pend.querySelector('button').onclick = function () { pend = null; renderPend(); };
    if (el.file) {
      w.querySelector('.aic-att').onclick = function () { el.file.click(); };
      el.file.onchange = function () { if (el.file.files[0]) readImage(el.file.files[0]); el.file.value = ''; };
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.win.classList.contains('open')) close(); });
  }
  function autosize() { el.input.style.height = 'auto'; el.input.style.height = Math.min(el.input.scrollHeight, 110) + 'px'; }

  /* ---------- messages ---------- */
  function addMsg(role, text, opt) {
    opt = opt || {};
    var m = h('div', 'aic-m ' + (role === 'u' ? 'u' : 'b') + (opt.err ? ' err' : ''));
    var b = h('div', 'aic-bb', (opt.img ? '<img class="aic-pic" alt="Your image" src="' + opt.img + '">' : '') + fmt(text));
    m.appendChild(b); el.body.appendChild(m); scroll();
    return b;
  }
  function typing() { var m = h('div', 'aic-m b aic-typing', '<div class="aic-bb"><i></i><i></i><i></i></div>'); el.body.appendChild(m); scroll(); return m; }
  function clearChips() { var c = el.body.querySelectorAll('.aic-chips'); for (var i = 0; i < c.length; i++) c[i].remove(); }
  function chips(list, first) {
    clearChips();
    if (!list || !list.length) return;
    var box = h('div', 'aic-chips');
    list.forEach(function (c) {
      var label = first ? c[0] : c, b = h('button', 'aic-chip' + (label === 'Get a Quote' ? ' q' : ''), esc(label)); b.type = 'button';
      b.onclick = function () {
        if (first) { S.hint = c[2] || S.hint; send(c[1], true); } else send(label, true);
      };
      box.appendChild(b);
    });
    el.body.appendChild(box); scroll();
  }
  function setBusy(v) { busy = v; el.send.disabled = v; el.input.disabled = v; el.send.classList.toggle('load', v); if (!v && window.innerWidth > 520) el.input.focus(); }

  /* ---------- sending ---------- */
  function send(text, fromChip) {
    text = (text || '').trim();
    if (busy || (!text && !pend)) return;
    if (!text) text = 'I am sharing a reference image.';
    clearChips();
    var img = pend; pend = null; renderPend();
    addMsg('u', text, { img: img && img.url });
    S.msgs.push({ r: 'u', t: text }); S.history.push({ role: 'user', content: text });
    el.input.value = ''; autosize(); save();
    ask(img);
  }
  function ask(img) {
    setBusy(true);
    var tp = typing();
    var transport = window.ARUN_CHAT_TRANSPORT || defaultTransport;
    transport({ messages: S.history.slice(-14), lead: S.lead, image: img ? { media_type: 'image/jpeg', data: img.b64 } : null })
      .then(function (res) {
        tp.remove();
        var reply = (res && res.reply) || '';
        if (!reply) throw new Error('empty');
        S.history.push({ role: 'assistant', content: reply }); S.msgs.push({ r: 'b', t: reply });
        addMsg('b', reply);
        mergeLead(res.lead); save();
        chips(res.suggestions, false);
        maybeLead();
        setBusy(false);
      })
      .catch(function (err) { tp.remove(); showError(err); setBusy(false); });
  }
  function defaultTransport(payload) {
    var ctl = ('AbortController' in window) ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, CONFIG.timeoutMs);
    return fetch(CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined })
      .then(function (r) {
        clearTimeout(timer);
        return r.json().catch(function () { return {}; }).then(function (d) {
          if (!r.ok) { var e = new Error(d.error || 'http_' + r.status); e.code = d.error || ('http_' + r.status); throw e; }
          return d;
        });
      }, function (e) { clearTimeout(timer); e.code = 'network'; throw e; });
  }
  function showError(err) {
    var code = (err && err.code) || 'error';
    var msg = code === 'rate_limited' ? 'You are sending messages very quickly. Please wait a moment and try again.'
      : 'Sorry, our AI assistant is not reachable right now. You can send your enquiry to the Arun Plastics team directly on WhatsApp.';
    var b = addMsg('b', msg, { err: true });
    var re = h('button', 'aic-act re', 'Try again'); re.type = 'button';
    re.onclick = function () { b.parentNode.remove(); ask(null); };
    var wa = h('button', 'aic-act', WA_ICON.replace('<svg', '<svg width="16" height="16" fill="currentColor"') + 'Chat on WhatsApp'); wa.type = 'button'; wa.onclick = openWA;
    var row = h('div'); row.appendChild(re); row.appendChild(wa); b.appendChild(row); scroll();
  }

  /* ---------- leads ---------- */
  function mergeLead(l) { if (!l) return; LEAD_KEYS.forEach(function (k) { if (typeof l[k] === 'string' && l[k].trim()) S.lead[k] = l[k].trim(); }); }
  function maybeLead() {
    if (S.notified || !(S.lead.name && S.lead.phone && S.lead.service)) return;
    S.notified = true; save();
    try { fetch(CONFIG.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lead: S.lead }) }).catch(function () {}); } catch (e) {}
    var c = h('div', 'aic-card', '<b>✅ Your enquiry is ready</b><br>Tap below to send these details to the Arun Plastics team on WhatsApp.');
    var b = h('button', 'aic-act', WA_ICON.replace('<svg', '<svg width="16" height="16" fill="currentColor"') + 'Send enquiry on WhatsApp'); b.type = 'button'; b.onclick = openWA;
    c.appendChild(b); el.body.appendChild(c); scroll();
  }

  /* ---------- image attach (resized in the browser) ---------- */
  function readImage(f) {
    if (!/^image\//.test(f.type)) return;
    var r = new FileReader();
    r.onload = function () {
      var im = new Image();
      im.onload = function () {
        var s = Math.min(1, 1024 / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        var url = c.toDataURL('image/jpeg', 0.8);
        pend = { url: url, b64: url.split(',')[1] }; renderPend();
      };
      im.src = r.result;
    };
    r.readAsDataURL(f);
  }
  function renderPend() { el.pend.classList.toggle('on', !!pend); if (pend) el.pend.querySelector('img').src = pend.url; }

  /* ---------- open / close ---------- */
  var fab;
  function open() {
    el.win.classList.add('open'); el.win.setAttribute('aria-hidden', 'false');
    if (fab) { fab.classList.add('seen'); fab.setAttribute('aria-expanded', 'true'); }
    hideNudge();
    var first = !S.welcomed;
    if (first) {
      S.welcomed = true; addMsg('b', CONFIG.welcome); S.msgs.push({ r: 'b', t: CONFIG.welcome }); chips(CONFIG.chips, true); save();
      el.body.scrollTo({ top: 0, behavior: 'instant' }); // show the start of the welcome message
    }
    setTimeout(function () { if (!first) scroll(); if (window.innerWidth > 520) el.input.focus({ preventScroll: true }); }, 320);
  }
  function close() { el.win.classList.remove('open'); el.win.setAttribute('aria-hidden', 'true'); if (fab) { fab.setAttribute('aria-expanded', 'false'); fab.focus(); } }
  function toggle() { el.win.classList.contains('open') ? close() : open(); }

  var nudge;
  function showNudge() { try { if (sessionStorage.getItem('aic_nudge')) return; sessionStorage.setItem('aic_nudge', '1'); } catch (e) {} if (el.win.classList.contains('open')) return; nudge = h('div', 'aic-nudge', esc(CONFIG.nudgeText)); nudge.onclick = open; document.body.appendChild(nudge); requestAnimationFrame(function () { nudge.classList.add('on'); }); setTimeout(hideNudge, 9000); }
  function hideNudge() { if (nudge) { nudge.classList.remove('on'); var n = nudge; nudge = null; setTimeout(function () { n.remove(); }, 400); } }

  /* ---------- init ---------- */
  function init() {
    load(); build();
    fab = document.getElementById('aic-open');
    if (!fab) { fab = h('button', 'aic-fab', ''); fab.id = 'aic-open'; fab.style.cssText = 'position:fixed;right:18px;bottom:18px;z-index:60'; document.body.appendChild(fab); }
    fab.setAttribute('aria-controls', 'aic'); fab.setAttribute('aria-expanded', 'false');
    fab.onclick = toggle;
    // restore earlier conversation from this browser session
    if (S.welcomed && S.msgs.length) { S.msgs.forEach(function (m) { addMsg(m.r, m.t); }); }
    setTimeout(showNudge, 6000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
