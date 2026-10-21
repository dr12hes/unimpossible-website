(() => {
  'use strict';

  /* ---------- Website read: a real read of a few pages, then the full audit by email ---------- */
  const scanForm = document.getElementById('scan-form');
  if (scanForm) {
    const button = document.getElementById('scan-button');
    const urlField = document.getElementById('scan-url');
    const status = document.getElementById('scan-status');
    const result = document.getElementById('scan-result');
    const reportForm = document.getElementById('report-form');
    const reportStatus = document.getElementById('report-status');
    const reportButton = document.getElementById('report-button');
    const API = (window.UNIMPOSSIBLE && window.UNIMPOSSIBLE.apiOrigin) || '';
    const STEPS = ['Fetching your pages…', 'Reading what you do and who for…', 'Working out what a customer of yours needs to see…', 'Writing up what we noticed…'];
    let scanId = null, poll = null, stepTimer = null;

    const text = (id, v) => { document.getElementById(id).textContent = v || ''; };
    const fill = (el, items, render) => { el.innerHTML = ''; (items || []).forEach((it) => { const li = document.createElement('li'); render(li, it); el.appendChild(li); }); };
    const setBusy = (busy) => { button.disabled = busy; urlField.disabled = busy; button.textContent = busy ? 'Reading…' : (scanId ? 'Read again' : 'Read my site'); };
    const stop = () => { clearInterval(poll); clearInterval(stepTimer); poll = stepTimer = null; };

    const request = async (path, body) => {
      const r = await fetch(API + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
      let data = {};
      try { data = await r.json(); } catch (e) { /* no body */ }
      if (!r.ok) throw new Error(data.error || 'Something went wrong on our side. Please try again in a minute.');
      return data;
    };

    const showRead = (hook) => {
      const pages = (hook.pages_read || []).length;
      if (!hook.readable) {
        text('read-one-line', 'We couldn’t tell what your business does from the pages we read.');
        text('read-detail', hook.unknowns && hook.unknowns.length ? 'Missing: ' + hook.unknowns.join('; ') + '.' : '');
        text('read-confidence', 'That is the finding: if we can’t tell, neither can a customer or an AI assistant. Pages read: ' + pages + '.');
      } else {
        text('read-one-line', hook.one_line);
        text('read-detail', [hook.what_they_do, hook.who_for ? 'For: ' + hook.who_for : '', hook.where ? 'Where: ' + hook.where : ''].filter(Boolean).join(' '));
        text('read-confidence', 'Confidence: ' + hook.confidence + '. ' + (hook.unknowns && hook.unknowns.length ? 'Your site doesn’t say: ' + hook.unknowns.slice(0, 3).join('; ') + '. ' : '') + 'Pages read: ' + pages + '.');
      }
      fill(document.getElementById('read-yardstick'), hook.yardstick, (li, s) => { li.textContent = s; });
      fill(document.getElementById('read-observations'), hook.observations, (li, o) => {
        const point = document.createElement('strong'); point.textContent = o.point; li.appendChild(point);
        const ev = document.createElement('span'); ev.className = 'evidence'; ev.textContent = ' ' + o.evidence; li.appendChild(ev);
        const why = document.createElement('span'); why.className = 'why'; why.textContent = o.why_it_matters; li.appendChild(why);
      });
      result.hidden = false;
    };

    const check = async () => {
      try {
        const scan = await request('/api/scan/' + scanId);
        if (scan.phase === 'reading') return;
        stop(); setBusy(false);
        if (scan.phase === 'failed') { status.textContent = scan.error || 'We couldn’t read that site.'; return; }
        status.textContent = '';
        showRead(scan.hook || {});
      } catch (e) { stop(); setBusy(false); status.textContent = e.message; }
    };

    scanForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      stop();
      result.hidden = true;
      reportStatus.textContent = '';
      reportButton.disabled = false; reportButton.textContent = 'Send me the full audit';
      const url = urlField.value.trim();
      if (!url) { status.textContent = 'Please enter your website address.'; urlField.focus(); return; }
      setBusy(true);
      let i = 0;
      status.textContent = STEPS[0];
      stepTimer = setInterval(() => { i = Math.min(i + 1, STEPS.length - 1); status.textContent = STEPS[i]; }, 4000);
      try {
        const scan = await request('/api/scan', { url });
        scanId = scan.id;
        if (scan.phase !== 'reading') { await check(); return; }
        poll = setInterval(check, 2000);
      } catch (e) { stop(); setBusy(false); status.textContent = e.message; }
    });

    reportForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('report-email').value.trim();
      const name = document.getElementById('report-name').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { reportStatus.textContent = 'Please enter an email address we can send it to.'; document.getElementById('report-email').focus(); return; }
      reportButton.disabled = true;
      reportStatus.textContent = 'Sending…';
      try {
        await request('/api/scan/' + scanId + '/report', { email, name, website: reportForm.elements.website.value });
        reportStatus.textContent = 'Check your inbox for a one-click confirmation. The audit starts when you click it and arrives a few minutes later.';
        reportButton.textContent = 'Sent';
      } catch (e) { reportButton.disabled = false; reportStatus.textContent = e.message; }
    });

    const params = new URLSearchParams(location.search);
    if (params.get('audit') === 'confirmed') {
      status.textContent = 'Thanks, confirmed. We’re reading your competitors now; the audit will arrive by email in a few minutes.';
      document.getElementById('report').scrollIntoView();
    } else if (params.get('audit') === 'invalid') {
      status.textContent = 'That confirmation link isn’t valid any more. Run the read again and we’ll send a fresh one.';
    }
  }

  /* ---------- Chamber button marks the enquiry ---------- */
  const chamber = document.querySelector('[data-chamber]');
  if (chamber) chamber.addEventListener('click', () => {
    const contact = document.getElementById('contact-form');
    if (contact) contact.elements.interest.value = 'Norfolk Chambers free one-hour session';
  });

  /* ---------- Enquiry form ---------- */
  const form = document.getElementById('contact-form');
  if (form) {
    const status = document.getElementById('contact-status');
    const submit = form.querySelector('[type="submit"]');
    const cfg = window.UNIMPOSSIBLE || {};
    let busy = false;
    let complete = false;

    const values = () => {
      const fd = new FormData(form);
      const get = (k) => String(fd.get(k) || '').trim();
      return { name: get('name'), company: get('company'), email: get('email'), message: get('message'), interest: get('interest'), honey: get('website') };
    };

    const valid = (v) => {
      if (!v.name) { status.textContent = 'Please add your name.'; form.elements.name.focus(); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) { status.textContent = 'Please add an email address we can reply to.'; form.elements.email.focus(); return false; }
      return true;
    };

    const viaCore = async (v) => {
      busy = true;
      submit.disabled = true;
      status.textContent = 'Sending…';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const data = { name: v.name, email: v.email, company: v.company, message: v.message, interest: v.interest, source_page: location.pathname };
        const response = await fetch(cfg.coreOrigin + '/api/v1/portal/pages/' + encodeURIComponent(cfg.pageToken) + '/submit', {
          method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': cfg.tenant || 'optaro' },
          body: JSON.stringify({ data, variant: 'a' }), signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error('not confirmed');
        complete = true;
        status.textContent = 'Thank you. We’ll reply within one working day.';
        form.reset();
      } catch (e) {
        status.textContent = 'That didn’t go through. Please try again, or email hello@unimpossible.co.uk.';
      } finally {
        clearTimeout(timeout);
        busy = false;
        submit.disabled = complete;
      }
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (busy || complete) return;
      const v = values();
      if (v.honey) return; // bot
      if (!valid(v)) return;
      if (cfg.pageToken) viaCore(v);
      else status.textContent = 'The enquiry form is temporarily unavailable. Please email hello@unimpossible.co.uk.';
    });
  }
})();
