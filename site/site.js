(() => {
  'use strict';

  /* ---------- Website scan demo (example scores, same state machine as the design) ---------- */
  const scanForm = document.getElementById('scan-form');
  if (scanForm) {
    const button = document.getElementById('scan-button');
    const urlField = document.getElementById('scan-url');
    const rows = Array.from(document.querySelectorAll('#checks li'));
    const result = document.getElementById('scan-result');
    const STEP = 650;
    let timers = [];
    let phase = 0; // 0 idle, 1..7 rows revealed, 8 done

    const render = () => {
      rows.forEach((row, i) => {
        const bar = row.querySelector('.bar');
        const score = Number(bar.dataset.score);
        const shown = phase > i;
        bar.style.width = (shown ? score : 0) + '%';
        bar.classList.toggle('low', score < 50);
        row.querySelector('.score').textContent = shown ? String(score) : '';
      });
      const running = phase > 0 && phase < 8;
      button.textContent = running ? 'Reading your site' : (phase >= 8 ? 'Scan again' : 'Scan my site');
      button.disabled = running;
      result.hidden = phase < 8;
    };

    scanForm.addEventListener('submit', (event) => {
      event.preventDefault();
      timers.forEach(clearTimeout);
      timers = [];
      phase = 0;
      render();
      for (let i = 1; i <= 8; i++) {
        timers.push(setTimeout(() => { phase = i; render(); }, STEP * i));
      }
    });

    // Carry the scanned address into the enquiry so the full report can be sent.
    const cta = document.getElementById('scan-cta');
    if (cta) cta.addEventListener('click', () => {
      const site = urlField.value.trim();
      const contact = document.getElementById('contact-form');
      if (!contact) return;
      contact.elements.interest.value = site ? 'Website report for ' + site : 'Website report';
      const message = contact.elements.message;
      if (!message.value) message.value = site ? 'Please send me the full website report for ' + site + '.' : 'Please send me the full website report.';
    });
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

    const viaMail = (v) => {
      const subject = v.interest || 'Conversation with UNimpossible';
      const body = [
        'Name: ' + v.name,
        'Company: ' + (v.company || '-'),
        'Email: ' + v.email,
        '',
        v.message || 'What takes up too much of our time: ',
      ].join('\n');
      location.href = 'mailto:hello@unimpossible.co.uk?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.textContent = 'Your email app should open with the message filled in. If it doesn’t, email hello@unimpossible.co.uk.';
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
      if (cfg.pageToken) viaCore(v); else viaMail(v);
    });
  }
})();
