/* ARUN PLASTICS - main.js
   Easy settings are at the top. */
(function () {
  'use strict';
  var WHATSAPP = '918610470488';   // EDIT: WhatsApp number with country code, no + or spaces
  var SLIDE_DELAY = 8000;          // EDIT: milliseconds between hero slides (8000 = 8 seconds)
  var INTRO_TIME = 3000;           // EDIT: how long the welcome screen shows

  function $(s) { return document.querySelector(s); }
  function $$(s) { return document.querySelectorAll(s); }

  /* ---- Hero slider ---- */
  var slides = $$('.slide'), dots = $('#dots'), bar = $('#bar'), cur = 0, timer;
  bar.style.animationDuration = SLIDE_DELAY + 'ms';
  slides.forEach(function (_, k) {
    var d = document.createElement('button');
    d.className = 'dot'; d.setAttribute('aria-label', 'Slide ' + (k + 1));
    d.onclick = function () { go(k); };
    dots.appendChild(d);
  });
  function go(k) {
    cur = (k + slides.length) % slides.length;
    slides.forEach(function (s, j) { s.classList.toggle('on', j === cur); });
    dots.childNodes.forEach(function (d, j) { d.classList.toggle('on', j === cur); });
    bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run');
    clearInterval(timer);
    timer = setInterval(function () { go(cur + 1); }, SLIDE_DELAY);
  }
  $('#nx').onclick = function () { go(cur + 1); };
  $('#pv').onclick = function () { go(cur - 1); };
  go(0);

  /* ---- Welcome screen ---- */
  function enter() {
    var n = $('#intro');
    if (n.classList.contains('out')) return;
    n.classList.add('out');
    document.body.classList.remove('lock');
    go(0);
  }
  setTimeout(enter, INTRO_TIME);

  /* ---- Client logo sliders: duplicate the logos so the loop is endless ---- */
  $$('.mt').forEach(function (t) { t.innerHTML += t.innerHTML; });

  /* ---- Gallery filter + full-size viewer ---- */
  var tiles = $$('.tile'), btns = $$('#flt button'), lb = $('#lb');
  function showCat(cat) {
    var n = 0;
    tiles.forEach(function (t) {
      var on = t.dataset.cat === cat;
      t.classList.toggle('hide', !on);
      if (on) t.style.animationDelay = (n++ * 60) + 'ms';
    });
  }
  btns.forEach(function (b) {
    b.onclick = function () {
      btns.forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      showCat(b.dataset.cat);
    };
  });
  tiles.forEach(function (t) {
    t.onclick = function () {
      var im = t.querySelector('img');
      lb.querySelector('img').src = im.src;
      lb.querySelector('img').alt = im.alt;
      lb.classList.add('on');
    };
  });
  lb.onclick = function () { lb.classList.remove('on'); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('on'); });


  /* ---- "View all ..." links: open the portfolio on the matching category ---- */
  $$('a[data-cat]').forEach(function (a) {
    a.addEventListener('click', function () {
      var b = document.querySelector('#flt button[data-cat="' + a.dataset.cat + '"]');
      if (b) b.click();
    });
  });

  /* ---- Scroll reveal + number counters ---- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .15 });
  $$('.rv').forEach(function (e) { io.observe(e); });
  var co = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      co.unobserve(e.target);
      var el = e.target, n = +el.dataset.n, c = 0, st = Math.ceil(n / 50);
      var t = setInterval(function () { c = Math.min(n, c + st); el.textContent = c + '+'; if (c >= n) clearInterval(t); }, 30);
    });
  });
  $$('[data-n]').forEach(function (e) { co.observe(e); });

  /* ---- Contact form -> WhatsApp ---- */
  $('#f').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = 'Hello Arun Plastics, I am ' + $('#n').value + ' (' + $('#p').value + '). I need: ' + $('#s').value + '. ' + $('#m').value;
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank');
  });
})();
