/* Site interactions: mobile menu, FAQ accordion, plan comparison, scroll reveal, one-off view events. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function track(n, p) { if (window.GT) window.GT.track(n, p); }

  /* ---- mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  var mq = window.matchMedia('(max-width: 1020px)');
  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setNav(false); toggle.focus(); }
    });
    mq.addEventListener('change', function () { setNav(false); });
    // keep tab order inside the open mobile menu
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !mq.matches || !nav.classList.contains('is-open')) return;
      var f = Array.prototype.slice.call(nav.querySelectorAll('a'));
      f.unshift(toggle);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    if (!mq.matches) { /* desktop: nav always visible via CSS */ }
  }

  /* ---- FAQ accordion (button + aria-expanded) ---- */
  var n = 0;
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    if (!q || !a) return;
    n += 1;
    var id = 'faq-' + n + '-' + Math.random().toString(36).slice(2, 6);
    q.id = id + '-q'; a.id = id + '-a';
    q.setAttribute('aria-controls', a.id);
    q.setAttribute('aria-expanded', 'false');
    a.setAttribute('role', 'region');
    a.setAttribute('aria-labelledby', q.id);
    a.hidden = true;
    q.addEventListener('click', function () {
      var open = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!open));
      a.hidden = open;
    });
  });
  // open FAQ from hash (e.g. /faq/#landlord)
  document.querySelectorAll('[data-faq-open-all]').forEach(function (b) {
    b.addEventListener('click', function () {
      var allOpen = b.getAttribute('aria-pressed') === 'true';
      b.setAttribute('aria-pressed', String(!allOpen));
      b.textContent = allOpen ? 'Expand all answers' : 'Collapse all answers';
      document.querySelectorAll('.faq-q').forEach(function (q) {
        q.setAttribute('aria-expanded', String(!allOpen));
        document.getElementById(q.getAttribute('aria-controls')).hidden = allOpen;
      });
    });
  });

  /* ---- plan comparison toggle ---- */
  var cmp = document.querySelector('[data-compare]');
  if (cmp) {
    var table = cmp.querySelector('table.compare');
    var btns = cmp.querySelectorAll('[data-view-btn]');
    var used = false;
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        table.setAttribute('data-view', b.getAttribute('data-view-btn'));
        btns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        if (!used) { used = true; track('plan_comparison_used', { view: b.getAttribute('data-view-btn') }); }
      });
    });
    table.querySelectorAll('tbody tr').forEach(function (r) {
      r.addEventListener('mouseenter', function () { if (!used) { used = true; track('plan_comparison_used', { view: 'hover' }); } }, { once: true });
    });
  }

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) { /* nothing */ }
  else if (reduce || !('IntersectionObserver' in window)) { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el, i) {
      var d = el.getAttribute('data-delay');
      if (d) el.style.transitionDelay = d + 'ms';
      io.observe(el);
    });
  }

  /* ---- one-off view events ---- */
  document.querySelectorAll('[data-track-view]').forEach(function (el) {
    if (!('IntersectionObserver' in window)) return;
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { track(el.getAttribute('data-track-view'), {}); o.disconnect(); }
    }, { threshold: 0.5 });
    o.observe(el);
  });
})();
