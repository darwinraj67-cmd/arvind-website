/* ARUN PLASTICS - "Making Videos" players + client testimonial slider.
   Test mode: put the line  window.ARUN_OWNER_TOOLS = true  in a small script tag above this file
   to see "Upload video" and "Add review" tools (items added this way are NOT saved for visitors). */
(function () {
  'use strict';
  var OWNER = !!window.ARUN_OWNER_TOOLS;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return (r || document).querySelectorAll(s); }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  /* ---------- Making Videos ---------- */
  $$('.vbox').forEach(function (box) {
    var v = $('video', box);
    v.addEventListener('error', function () { if (!v.dataset.up) { box.classList.add('empty'); v.removeAttribute('controls'); } });
    v.addEventListener('loadedmetadata', function () { box.classList.remove('empty'); v.setAttribute('controls', ''); });
    if (OWNER) {
      var l = document.createElement('label'); l.className = 'vup'; l.innerHTML = '&#11014; Upload video<input type="file" accept="video/*" hidden>';
      $('input', l).onchange = function (e) {
        var f = e.target.files[0]; if (!f) return;
        v.dataset.up = '1'; v.src = URL.createObjectURL(f); box.classList.remove('empty'); v.setAttribute('controls', ''); v.load();
      };
      box.appendChild(l);
    }
  });
  document.addEventListener('play', function (e) { $$('.vbox video').forEach(function (o) { if (o !== e.target) o.pause(); }); }, true);

  /* ---------- Testimonial slider ---------- */
  var track = $('#rtrack'), dotsBox = $('#rdots'), timer, paused = false;
  if (!track) return;
  function cards() { return $$('.rcard', track); }
  function per() { return window.innerWidth > 1000 ? 3 : window.innerWidth > 640 ? 2 : 1; }
  function stepW() { var c = cards()[0]; return c ? c.getBoundingClientRect().width + 24 : 0; }
  function pagesN() { return Math.max(1, cards().length - per() + 1); }
  function mark() { var k = Math.min(Math.round(track.scrollLeft / (stepW() || 1)), pagesN() - 1); dotsBox.childNodes.forEach(function (d, j) { d.classList.toggle('on', j === k); }); }
  function dots() {
    dotsBox.innerHTML = '';
    for (var i = 0; i < pagesN(); i++) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Review ' + (i + 1));
      (function (i) { b.onclick = function () { track.scrollTo({ left: i * stepW(), behavior: 'smooth' }); }; })(i);
      dotsBox.appendChild(b);
    }
    mark();
  }
  function move(dir) {
    var max = track.scrollWidth - track.clientWidth;
    if (dir > 0 && track.scrollLeft >= max - 4) track.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && track.scrollLeft <= 4) track.scrollTo({ left: max, behavior: 'smooth' });
    else track.scrollBy({ left: dir * stepW(), behavior: 'smooth' });
  }
  track.addEventListener('scroll', mark, { passive: true });
  $('#rprev').onclick = function () { move(-1); }; $('#rnext').onclick = function () { move(1); };
  var wrap = $('#rwrap');
  ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { wrap.addEventListener(ev, function () { paused = true; }, { passive: true }); });
  ['mouseleave', 'focusout', 'touchend'].forEach(function (ev) { wrap.addEventListener(ev, function () { paused = false; }, { passive: true }); });
  timer = setInterval(function () { if (!paused && !document.hidden) move(1); }, 6000);
  window.addEventListener('resize', dots);
  dots();

  /* ---------- Test tool: add a review ---------- */
  if (!OWNER) return;
  var form = $('#rform'), photo = '';
  form.hidden = false;
  function html(r) {
    var stars = '★★★★★'.slice(0, r.rating) + '☆☆☆☆☆'.slice(0, 5 - r.rating);
    var av = r.photo ? '<img class="rav" alt="" src="' + r.photo + '">' : '<span class="rav">' + esc((r.name || '?').charAt(0).toUpperCase()) + '</span>';
    return '<div class="stars" aria-label="' + r.rating + ' out of 5 stars">' + stars + '</div><blockquote>' + esc(r.text) + '</blockquote><figcaption>' + av + '<div><b>' + esc(r.name) + '</b><span>' + esc(r.business || '') + '</span></div></figcaption>';
  }
  function add(r, save) {
    $$('.rcard.sample', track).forEach(function (c) { c.remove(); });
    var c = document.createElement('figure'); c.className = 'rcard'; c.innerHTML = html(r); track.appendChild(c); dots();
    if (save) { try { var a = JSON.parse(localStorage.getItem('arun_reviews') || '[]'); a.push(r); localStorage.setItem('arun_reviews', JSON.stringify(a)); } catch (e) {} track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' }); }
  }
  try { JSON.parse(localStorage.getItem('arun_reviews') || '[]').forEach(function (r) { add(r, false); }); } catch (e) {}
  $('#rp').onchange = function (e) {
    var f = e.target.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () { var im = new Image(); im.onload = function () { var c = document.createElement('canvas'), s = 120, m = Math.min(im.width, im.height); c.width = c.height = s; c.getContext('2d').drawImage(im, (im.width - m) / 2, (im.height - m) / 2, m, m, 0, 0, s, s); photo = c.toDataURL('image/jpeg', .8); $('#rpl').textContent = 'Photo added ✓'; }; im.src = rd.result; };
    rd.readAsDataURL(f);
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    add({ name: $('#rn').value.trim(), business: $('#rb').value.trim(), rating: +$('#rr').value, text: $('#rt').value.trim(), photo: photo }, true);
    form.reset(); photo = ''; $('#rpl').textContent = 'Add photo';
  });
})();
