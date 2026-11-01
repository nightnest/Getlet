/* Form validation and honest submission handling.
   Default: opens the visitor's email app with the enquiry addressed to the business (never claims delivery).
   Live mode only when GETLET_CONFIG.forms.mode === 'live' AND an endpoint returns success. */
(function () {
  'use strict';
  var CFG = window.GETLET_CONFIG || {};
  var FORMS = CFG.forms || { mode: 'demo', endpoint: '' };
  function track(n, p) { if (window.GT) window.GT.track(n, p); }

  var POSTCODE = /^(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]([0-9ABEHMNPRV-Y])?)|[0-9][A-HJKPS-UW]) ?[0-9][ABD-HJLNP-UW-Z]{2})$/i;
  var OUTWARD = /^[A-PR-UWYZ]([0-9]{1,2}|([A-HK-Y][0-9]([0-9ABEHMNPRV-Y])?)|[0-9][A-HJKPS-UW])$/i;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var validators = {
    required: function (v) { return v.trim() ? '' : 'This field is required.'; },
    email: function (v) { return EMAIL.test(v.trim()) ? '' : 'Enter a valid email address, for example name@example.co.uk.'; },
    phone: function (v) {
      var d = v.replace(/[\s()\-]/g, '');
      if (!/^\+?\d+$/.test(d)) return 'Enter a phone number using digits only (spaces and + are fine).';
      var digits = d.replace(/^\+/, '');
      if (digits.length < 10 || digits.length > 15) return 'Enter a phone number with 10 to 15 digits.';
      return '';
    },
    place: function (v) {
      var s = v.trim().toUpperCase().replace(/\s+/g, ' ');
      if (/\d/.test(s)) {
        if (POSTCODE.test(s) || OUTWARD.test(s)) return '';
        return 'Enter a UK postcode (for example SW1A 1AA), the first part of a postcode (for example SW1A), or a town name.';
      }
      return /^[A-Z][A-Z' .\-]{1,}$/.test(s) ? '' : 'Enter a town name or a UK postcode.';
    },
    minlen5: function (v) { return v.trim().length >= 5 ? '' : 'Please give a little more detail (at least 5 characters).'; },
    select: function (v) { return v ? '' : 'Please choose an option.'; },
    radio: function (v) { return v ? '' : 'Please choose one option.'; },
    consent: function (v) { return v ? '' : 'Please confirm you have read the privacy notice so we can respond.'; }
  };

  function fieldValue(field) {
    var type = field.getAttribute('data-type');
    if (type === 'radio') { var r = field.querySelector('input:checked'); return r ? r.value : ''; }
    if (type === 'consent') { return field.querySelector('input').checked ? 'yes' : ''; }
    var el = field.querySelector('input,select,textarea');
    return el ? el.value : '';
  }
  function ensureErrorEl(field) {
    var e = field.querySelector('.error-msg');
    if (!e) {
      e = document.createElement('p');
      e.className = 'error-msg';
      var id = (field.id || ('f' + Math.random().toString(36).slice(2, 7))) + '-error';
      e.id = id;
      e.setAttribute('aria-live', 'polite');
      field.appendChild(e);
    }
    return e;
  }
  function setError(field, msg) {
    var e = ensureErrorEl(field);
    var controls = field.querySelectorAll('input,select,textarea');
    field.classList.toggle('has-error', !!msg);
    e.textContent = msg || '';
    controls.forEach(function (c) {
      if (msg) {
        c.setAttribute('aria-invalid', 'true');
        var ids = (c.getAttribute('data-desc') || '').split(' ').filter(Boolean);
        if (ids.indexOf(e.id) < 0) ids.push(e.id);
        c.setAttribute('aria-describedby', ids.join(' '));
      } else {
        c.removeAttribute('aria-invalid');
        var base = (c.getAttribute('data-desc') || '').trim();
        if (base) c.setAttribute('aria-describedby', base); else c.removeAttribute('aria-describedby');
      }
    });
  }
  function validateField(field) {
    var rules = (field.getAttribute('data-validate') || '').split(' ').filter(Boolean);
    var v = fieldValue(field);
    var mandatory = rules.some(function (r) { return r === 'required' || r === 'select' || r === 'radio' || r === 'consent'; });
    if (!String(v).trim() && !mandatory) { setError(field, ''); return true; }
    for (var i = 0; i < rules.length; i++) {
      var msg = validators[rules[i]](v);
      if (msg) { setError(field, msg); return false; }
    }
    setError(field, '');
    return true;
  }

  function refId() { return 'GL-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase(); }

  function initForm(form) {
    var kind = form.getAttribute('data-form'); // landlord | tenant | repair
    var fields = Array.prototype.slice.call(form.querySelectorAll('.field[data-validate]'));
    var summary = form.querySelector('.form-summary');
    var result = form.querySelector('.form-result');
    var started = false;

    // remember existing described-by ids (hints)
    form.querySelectorAll('input,select,textarea').forEach(function (c) {
      var d = c.getAttribute('aria-describedby'); if (d) c.setAttribute('data-desc', d);
    });
    // UTM hidden fields
    var utm = window.GT ? window.GT.getUtm() : {};
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
      var el = form.querySelector('input[name="' + k + '"]'); if (el && utm[k]) el.value = utm[k];
    });
    var page = form.querySelector('input[name="source_page"]'); if (page) page.value = location.pathname;

    form.addEventListener('focusin', function () {
      if (started) return; started = true; track('form_start', { form_type: kind });
    });
    fields.forEach(function (f) {
      f.addEventListener('focusout', function (e) {
        if (!f.contains(e.relatedTarget) && fieldValue(f).trim() !== '') validateField(f);
      });
      f.addEventListener('input', function () { if (f.classList.contains('has-error')) validateField(f); });
      f.addEventListener('change', function () { if (f.classList.contains('has-error')) validateField(f); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      result.className = 'form-result'; result.innerHTML = '';
      var bad = fields.filter(function (f) { return !validateField(f); });
      if (bad.length) {
        summary.textContent = 'Please correct ' + bad.length + (bad.length === 1 ? ' field' : ' fields') + ' below before sending.';
        summary.classList.add('show');
        summary.setAttribute('tabindex', '-1');
        var first = bad[0].querySelector('input:not([type=hidden]),select,textarea');
        if (first) first.focus();
        return;
      }
      summary.classList.remove('show'); summary.textContent = '';

      var hp = form.querySelector('input[name="website"]');
      var submitBtn = form.querySelector('button[type=submit]');
      if (hp && hp.value) { return; } // bot: do nothing

      var live = FORMS.mode === 'live' && FORMS.endpoint;
      var eventName = kind === 'landlord' ? 'landlord_enquiry' : kind === 'tenant' ? 'tenant_viewing_request' : 'repair_report';
      var data = new FormData(form);
      data.delete('website');
      data.append('reference', refId());
      data.append('_subject', ({ landlord: 'GETLET landlord enquiry', tenant: 'GETLET tenant enquiry', repair: 'GETLET repair report' })[kind] + ' (' + data.get('reference') + ')');

      if (!live) { sendByEmail(); return; }

      submitBtn.disabled = true; submitBtn.textContent = 'Sending…';
      fetch(FORMS.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          result.className = 'form-result live show';
          result.innerHTML = '<h3>Thank you, your enquiry has been sent.</h3><p>Reference: <strong>' + data.get('reference') + '</strong>. We will reply using your preferred contact route.</p>';
          result.setAttribute('tabindex', '-1'); result.focus();
          form.reset(); done('endpoint');
        })
        .catch(function () {
          result.className = 'form-result fail show';
          result.innerHTML = '<h3>Sorry, we could not send that.</h3><p>Your details have not been sent. Please try again in a moment or email us' + (CFG.email ? ' at <a href="mailto:' + CFG.email + '">' + CFG.email + '</a>' : '') + '.</p>';
          result.setAttribute('tabindex', '-1'); result.focus();
        })
        .finally(function () { submitBtn.disabled = false; submitBtn.textContent = submitBtn.getAttribute('data-label'); });

      function done(method) {
        track(eventName, { form_type: kind, method: method, issue_type: kind === 'repair' ? (data.get('issue_type') || '') : undefined });
        track('form_submit_success', { form_type: kind, method: method });
      }
      function sendByEmail() {
        var skip = /^(utm_|source_page|privacy_ack|marketing_consent|website$|_subject)/;
        var titles = { landlord: 'Landlord enquiry', tenant: 'Tenant enquiry', repair: 'Repair report' };
        var lines = [];
        data.forEach(function (v, k) {
          if (skip.test(k) || !String(v).trim()) return;
          lines.push(k.replace(/_/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); }) + ': ' + v);
        });
        if (data.get('marketing_consent')) lines.push('Marketing emails: yes');
        lines.push('', 'Reference: ' + data.get('reference'));
        ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { if (data.get(k)) lines.push(k + ': ' + data.get(k)); });
        var to = CFG.leadsEmail || CFG.email || '';
        var href = 'mailto:' + to + '?subject=' + encodeURIComponent(titles[kind] + ' (' + data.get('reference') + ')') + '&body=' + encodeURIComponent(lines.join('\n').slice(0, 1500));
        result.className = 'form-result live show';
        result.innerHTML = '<h3>One more step: send the email</h3><p>Your email app should now open with your ' + titles[kind].toLowerCase() + ' written out and addressed to <strong>' + to + '</strong>. Please press send to complete it. Nothing reaches us until you do.</p><p>If nothing opened, <a href="' + href + '">use this link</a> or email us directly at ' + to + '.</p>';
        result.setAttribute('tabindex', '-1'); result.focus();
        done('mailto');
        window.location.href = href;
      }
    });
  }

  document.querySelectorAll('form[data-form]').forEach(initForm);

  /* ---- preselect management interest from ?plan= ---- */
  var plan = new URLSearchParams(location.search).get('plan');
  var map = { 'fully-managed': 'fully-managed', limited: 'limited-management', 'limited-management': 'limited-management' };
  if (plan && map[plan]) {
    var r = document.querySelector('input[name="management_interest"][value="' + map[plan] + '"]');
    if (r) r.checked = true;
  }

  /* ---- contact page: landlord / tenant switch ---- */
  var switcher = document.querySelector('[data-audience-switch]');
  if (switcher) {
    var panels = { landlord: document.getElementById('landlord-panel'), tenant: document.getElementById('tenant-panel') };
    var buttons = switcher.querySelectorAll('[data-audience]');
    function show(aud, focus) {
      Object.keys(panels).forEach(function (k) { if (panels[k]) panels[k].hidden = k !== aud; });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-audience') === aud)); });
      if (focus) { var f = panels[aud].querySelector('input[type=text]'); if (f) f.focus({ preventScroll: true }); }
    }
    var q = new URLSearchParams(location.search).get('audience');
    var initial = (q === 'tenant' || location.hash === '#tenant-form') ? 'tenant' : 'landlord';
    show(initial, false);
    buttons.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-audience'), false); }); });
    window.addEventListener('hashchange', function () {
      if (location.hash === '#tenant-form') show('tenant', false);
      if (location.hash === '#landlord-form') show('landlord', false);
    });
  }
})();
