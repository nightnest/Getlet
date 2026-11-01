/* Consent, GA4 loader, tracking helper and UTM capture. Loads nothing from Google until analytics consent is given. */
(function () {
  'use strict';
  var CFG = window.GETLET_CONFIG || {};
  var KEY = 'getlet_consent_v1';
  var UTM_KEY = 'getlet_utm_v1';
  var BLOCKED = /^(name|full_?name|email|phone|tel|address|postcode|message|description|notes|first_?name|last_?name)$/i;

  function safeGet(store, key) { try { return store.getItem(key); } catch (e) { return null; } }
  function safeSet(store, key, val) { try { store.setItem(key, val); } catch (e) { /* storage unavailable */ } }

  function readConsent() {
    var raw = safeGet(window.localStorage, KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }
  function writeConsent(analytics) {
    safeSet(window.localStorage, KEY, JSON.stringify({ analytics: !!analytics, ts: Date.now() }));
  }

  /* ---- UTM capture (source, medium, campaign) ---- */
  function captureUtm() {
    var p = new URLSearchParams(window.location.search), found = {}, any = false;
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
      var v = p.get(k);
      if (v) { found[k] = v.slice(0, 80); any = true; }
    });
    if (any) safeSet(window.sessionStorage, UTM_KEY, JSON.stringify(found));
  }
  function getUtm() {
    var raw = safeGet(window.sessionStorage, UTM_KEY);
    try { return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
  }

  /* ---- GA4: the Google tag is in <head> on every page (see build.js) with Consent Mode.
     Analytics storage is denied by default; we only ever update it from the banner choice. ---- */
  function setGaConsent(granted) {
    if (CFG.gaMeasurementId && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
    }
  }
  function analyticsAllowed() { var c = readConsent(); return !!(c && c.analytics); }

  /* ---- tracking helper: never sends personal data ---- */
  function track(name, params) {
    if (!CFG.gaMeasurementId || !analyticsAllowed() || typeof window.gtag !== 'function') return;
    var clean = {}, utm = getUtm();
    Object.keys(params || {}).forEach(function (k) {
      if (!BLOCKED.test(k)) clean[k] = typeof params[k] === 'string' ? params[k].slice(0, 60) : params[k];
    });
    if (utm.utm_source) clean.campaign_source = utm.utm_source;
    if (utm.utm_medium) clean.campaign_medium = utm.utm_medium;
    if (utm.utm_campaign) clean.campaign_name = utm.utm_campaign;
    window.gtag('event', name, clean);
    if (name === 'landlord_enquiry') window.gtag('event', 'generate_lead', Object.assign({ audience_type: 'landlord' }, clean));
  }
  window.GT = { track: track, getUtm: getUtm };

  /* ---- cookie banner ---- */
  function initBanner() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    var accept = document.getElementById('cookie-accept');
    var reject = document.getElementById('cookie-reject');
    var toggle = document.getElementById('cookie-toggle');
    var manage = document.getElementById('cookie-manage');
    var save = document.getElementById('cookie-save');
    var box = document.getElementById('ck-analytics');
    var lastFocus = null;

    function show() { lastFocus = document.activeElement; banner.hidden = false; var c = readConsent(); box.checked = !!(c && c.analytics); accept.focus({ preventScroll: true }); }
    function close(analytics) {
      writeConsent(analytics);
      banner.hidden = true;
      setGaConsent(analytics);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    accept.addEventListener('click', function () { close(true); });
    reject.addEventListener('click', function () { close(false); });
    save.addEventListener('click', function () { close(box.checked); });
    toggle.addEventListener('click', function () {
      var open = manage.hidden;
      manage.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
    });
    banner.addEventListener('keydown', function (e) { if (e.key === 'Escape') { banner.hidden = true; } });
    document.querySelectorAll('[data-cookie-manage]').forEach(function (b) {
      b.addEventListener('click', function () { manage.hidden = false; toggle.setAttribute('aria-expanded', 'true'); show(); });
    });
    if (!readConsent()) { banner.hidden = false; }
  }

  /* ---- generic CTA / phone tracking ---- */
  function initClicks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-cta],a[href^="tel:"]') : null;
      if (!a) return;
      if (a.matches('a[href^="tel:"]')) track('phone_click', {});
      if (a.getAttribute('data-cta')) track('cta_click', { cta_id: a.getAttribute('data-cta') });
    });
  }

  captureUtm();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initBanner(); initClicks(); });
  else { initBanner(); initClicks(); }
})();
