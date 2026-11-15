/* ARUN PLASTICS - mobile menu + back-to-top button (used on every page) */
(function () {
  'use strict';
  function init() {
    /* ---------- Mobile menu: built from the links already in the top bar ---------- */
    var header = document.querySelector('header'), wrap = header && header.querySelector('.wrap'), nav = header && header.querySelector('nav');
    if (wrap && nav) {
      var links = nav.querySelectorAll('a:not(.btn)');
      var burger = document.createElement('button');
      burger.type = 'button'; burger.className = 'burger'; burger.setAttribute('aria-label', 'Open menu');
      burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-controls', 'mnav');
      burger.innerHTML = '<span></span><span></span><span></span>';
      var panel = document.createElement('div'); panel.className = 'mnav'; panel.id = 'mnav';
      links.forEach(function (a) {
        var c = document.createElement('a'); c.href = a.getAttribute('href'); c.textContent = a.textContent; panel.appendChild(c);
      });
      wrap.appendChild(burger); header.appendChild(panel);
      var setOpen = function (v) {
        burger.classList.toggle('on', v); panel.classList.toggle('on', v);
        burger.setAttribute('aria-expanded', v ? 'true' : 'false'); burger.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
      };
      burger.onclick = function (e) { e.stopPropagation(); setOpen(!panel.classList.contains('on')); };
      panel.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
      document.addEventListener('click', function (e) { if (!header.contains(e.target)) setOpen(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
      window.addEventListener('resize', function () { if (window.innerWidth > 720) setOpen(false); });
    }

    /* ---------- Back-to-top arrow (bottom right) ---------- */
    var fab = document.querySelector('.fab');
    if (!fab) { fab = document.createElement('div'); fab.className = 'fab'; document.body.appendChild(fab); }
    var up = document.createElement('button');
    up.type = 'button'; up.className = 'totop'; up.setAttribute('aria-label', 'Back to top');
    up.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    fab.insertBefore(up, fab.firstChild);
    up.onclick = function () { window.scrollTo({ top: 0, behavior: 'smooth' }); };
    var onScroll = function () { up.classList.toggle('on', window.pageYOffset > 500); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
