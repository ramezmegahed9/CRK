(() => {
  const { leads, updated, csrf } = window.CRK;
  const STATUSES = ['new', 'contacted', 'replied', 'meeting', 'proposal', 'won', 'lost', 'skip'];
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '';
  const digits = p => String(p).replace(/\(.*?\)/g, '').replace(/[^\d+]/g, '');
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const modal = $('#modal');
  let current = null;

  $('#updated').textContent = updated ? `Last research run: ${updated}` : '';
  STATUSES.forEach(s => $('#f-status').insertAdjacentHTML('beforeend', `<option value="${s}">${cap(s)}</option>`));
  [...new Set(leads.map(l => l.added))].sort().reverse()
    .forEach(d => $('#f-day').insertAdjacentHTML('beforeend', `<option>${esc(d)}</option>`));

  function stats() {
    const cnt = k => leads.filter(l => l.country === k).length;
    const items = [
      ['Total leads', leads.length], ['Added last run', leads.filter(l => l.added === updated).length],
      ['Kuwait', cnt('Kuwait')], ['Lebanon', cnt('Lebanon')],
      ['In pipeline', leads.filter(l => ['contacted', 'replied', 'meeting', 'proposal'].includes(l.status)).length],
      ['Won', leads.filter(l => l.status === 'won').length]
    ];
    $('#stats').innerHTML = items.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
  }

  function tile(l) {
    return `<button class="tile st-${esc(l.status)}" data-id="${esc(l.id)}">
      <span class="tile-top"><span class="chip">${esc(l.country)}</span><span class="status-dot">${esc(l.status)}</span></span>
      <span class="tile-name">${esc(l.company)}</span>
      <span class="tile-sector">${esc(l.sector)}</span>
      <span class="tile-sum">${esc(l.summary || l.signal)}</span>
      <span class="tile-foot">${(l.services || []).slice(0, 2).map(s => `<i>${esc(s)}</i>`).join('')}<em>added ${esc(l.added)}</em></span>
    </button>`;
  }

  function render() {
    const q = $('#q').value.trim().toLowerCase();
    const f = { country: $('#f-country').value, status: $('#f-status').value, added: $('#f-day').value };
    const rows = leads.filter(l =>
      Object.entries(f).every(([k, v]) => !v || l[k] === v) &&
      (!q || [l.company, l.sector, l.city, l.signal].join(' ').toLowerCase().includes(q)));
    $('#grid').innerHTML = rows.map(tile).join('');
    $('#empty').hidden = rows.length > 0;
    stats();
  }

  const link = (label, url) => { const u = safeUrl(url); return u ? `<a class="pill-link" href="${esc(u)}" target="_blank" rel="noopener">${label}</a>` : ''; };

  function detail(l) {
    const c = l.contacts || {};
    const emails = c.emails || [], phones = c.phones || [];
    const links = [link('Website', c.website), link('Instagram', c.instagram), link('LinkedIn', c.linkedin), link('Link page', c.other)].filter(Boolean).join('');
    const mailto = e => `mailto:${encodeURIComponent(e)}?subject=${encodeURIComponent(l.email_subject || '')}&body=${encodeURIComponent(l.message_en || '')}`;
    const wa = p => `https://wa.me/${digits(p).replace('+', '')}?text=${encodeURIComponent(l.message_en || '')}`;
    const opts = STATUSES.map(s => `<option value="${s}" ${s === l.status ? 'selected' : ''}>${cap(s)}</option>`).join('');

    return `
      <header class="m-head">
        <div>
          <div class="m-tags"><span class="chip">${esc(l.country)}</span><span class="chip">Tier ${esc(l.tier)}</span><span class="muted">added ${esc(l.added)}</span></div>
          <h2 id="m-title">${esc(l.company)}</h2>
          <p class="muted">${esc(l.sector)} · ${esc(l.city)}</p>
        </div>
        <button class="x" data-close aria-label="Close">×</button>
      </header>

      <nav class="tabs" role="tablist">
        <button role="tab" class="on" data-tab="overview">Overview</button>
        <button role="tab" data-tab="email">Email <small>${emails.length}</small></button>
        <button role="tab" data-tab="mobile">Mobile <small>${phones.length}</small></button>
        <button role="tab" data-tab="sources">Sources <small>${(l.evidence || []).length}</small></button>
      </nav>

      <section class="pane" data-pane="overview">
        <div class="services">${(l.services || []).map(s => `<span>${esc(s)}</span>`).join('')}</div>
        <h3>Why now</h3><p>${esc(l.signal)}</p>
        <h3>Our angle</h3><p>${esc(l.angle)}</p>
        <h3>Decision maker</h3><p>${esc(c.decision_maker || '—')}</p>
        ${links ? `<div class="links">${links}</div>` : ''}
      </section>

      <section class="pane" data-pane="email" hidden>
        ${emails.length ? emails.map(e => `<div class="row"><a href="mailto:${esc(e)}">${esc(e)}</a><span><button class="btn small" data-copy-text="${esc(e)}">Copy</button> <a class="btn small dark" href="${esc(mailto(e))}">Open email</a></span></div>`).join('')
          : `<p class="muted">No public email found yet. Use Mobile or Instagram for first contact.</p>`}
        <h3>Subject</h3>
        <div class="row"><span>${esc(l.email_subject || '')}</span><button class="btn small" data-copy="subject">Copy</button></div>
        <h3>Message</h3>
        <div class="msg"><p>${esc(l.message_en)}</p><button class="btn small" data-copy="message">Copy message</button></div>
      </section>

      <section class="pane" data-pane="mobile" hidden>
        ${phones.length ? phones.map(p => `<div class="row"><a href="tel:${esc(digits(p))}">${esc(p)}</a><span><button class="btn small" data-copy-text="${esc(p)}">Copy</button> <a class="btn small dark" target="_blank" rel="noopener" href="${esc(wa(p))}">WhatsApp</a></span></div>`).join('')
          : `<p class="muted">No public number found yet.</p>`}
        ${safeUrl(c.whatsapp) ? `<div class="row"><span>WhatsApp Business link</span><a class="btn small dark" target="_blank" rel="noopener" href="${esc(c.whatsapp)}">Open</a></div>` : ''}
        <h3>Message</h3>
        <div class="msg"><p>${esc(l.message_en)}</p><button class="btn small" data-copy="message">Copy message</button></div>
      </section>

      <section class="pane" data-pane="sources" hidden>
        <ul class="ev">${(l.evidence || []).map(e => `<li>${link(esc(e.title), e.url) || esc(e.title)} <span class="muted">${esc(e.date)}</span></li>`).join('')}</ul>
      </section>

      <footer class="m-foot">
        <label>Status<select class="status">${opts}</select></label>
        <label class="grow">Notes<textarea class="note" rows="2" placeholder="Who you spoke to, next step…">${esc(l.note)}</textarea></label>
      </footer>`;
  }

  function open(id) {
    current = leads.find(l => l.id === id);
    if (!current) return;
    $('#m-body').innerHTML = detail(current);
    modal.showModal();
  }

  function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => el.hidden = true, 1800); }
  const copy = t => navigator.clipboard.writeText(t).then(() => toast('Copied'));

  async function save(patch) {
    const l = current;
    try {
      const r = await fetch('api.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: l.id, csrf, ...patch }) });
      if (!r.ok) throw new Error(r.status);
      Object.assign(l, patch); render(); toast('Saved');
    } catch (e) { toast('Could not save. Please log in again'); }
  }

  $('#grid').addEventListener('click', e => { const t = e.target.closest('.tile'); if (t) open(t.dataset.id); });

  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('[data-close]')) return modal.close();
    const tab = e.target.closest('[data-tab]');
    if (tab) {
      modal.querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b === tab));
      modal.querySelectorAll('[data-pane]').forEach(p => p.hidden = p.dataset.pane !== tab.dataset.tab);
      return;
    }
    const c = e.target.closest('[data-copy],[data-copy-text]');
    if (c) copy(c.dataset.copyText ?? (c.dataset.copy === 'subject' ? current.email_subject : current.message_en));
  });
  modal.addEventListener('change', e => {
    if (e.target.matches('.status')) save({ status: e.target.value });
    if (e.target.matches('.note')) save({ note: e.target.value });
  });

  ['#q', '#f-country', '#f-status', '#f-day'].forEach(s => $(s).addEventListener('input', render));
  render();
})();
