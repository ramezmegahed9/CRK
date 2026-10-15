(() => {
  const { leads, updated, csrf } = window.CRK;
  const STATUSES = ['new', 'contacted', 'replied', 'meeting', 'proposal', 'won', 'lost', 'skip'];
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '';

  $('#updated').textContent = updated ? `Last research run: ${updated}` : '';
  STATUSES.forEach(s => $('#f-status').insertAdjacentHTML('beforeend', `<option value="${s}">${s[0].toUpperCase() + s.slice(1)}</option>`));
  [...new Set(leads.map(l => l.added))].sort().reverse()
    .forEach(d => $('#f-day').insertAdjacentHTML('beforeend', `<option>${esc(d)}</option>`));

  function stats() {
    const today = leads.filter(l => l.added === updated).length;
    const cnt = k => leads.filter(l => l.country === k).length;
    const active = leads.filter(l => ['contacted', 'replied', 'meeting', 'proposal'].includes(l.status)).length;
    const items = [
      ['Total leads', leads.length], ['Added last run', today],
      ['Kuwait', cnt('Kuwait')], ['Lebanon', cnt('Lebanon')],
      ['In pipeline', active], ['Won', leads.filter(l => l.status === 'won').length]
    ];
    $('#stats').innerHTML = items.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join('');
  }

  function link(label, url) { const u = safeUrl(url); return u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${label}</a>` : ''; }

  function card(l) {
    const c = l.contacts || {};
    const links = [link('Website', c.website), link('Instagram', c.instagram), link('LinkedIn', c.linkedin)].filter(Boolean).join('');
    const ev = (l.evidence || []).map(e => `<li>${link(esc(e.title), e.url)} <span class="muted">${esc(e.date)}</span></li>`).join('');
    const opts = STATUSES.map(s => `<option value="${s}" ${s === l.status ? 'selected' : ''}>${s}</option>`).join('');
    return `<article class="lead st-${esc(l.status)}" data-id="${esc(l.id)}">
      <div class="lead-head">
        <div>
          <div class="tags"><span class="pill p-${esc(l.priority)}">${esc(l.priority)}</span><span class="pill">${esc(l.country)}</span><span class="pill">Tier ${esc(l.tier)}</span><span class="muted">added ${esc(l.added)}</span></div>
          <h2>${esc(l.company)}</h2>
          <p class="muted">${esc(l.sector)} · ${esc(l.city)}</p>
        </div>
        <div class="score" title="Fit score"><b>${esc(l.score)}</b><span>fit</span></div>
      </div>
      <div class="services">${(l.services || []).map(s => `<span>${esc(s)}</span>`).join('')}</div>
      <div class="grid2">
        <div><h3>Why now</h3><p>${esc(l.signal)}</p></div>
        <div><h3>Our angle</h3><p>${esc(l.angle)}</p></div>
      </div>
      <div class="contact">
        <div><h3>Decision maker</h3><p>${esc(c.decision_maker || '—')}</p>
          ${c.phone ? `<p>📞 <a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></p>` : ''}
          ${c.email ? `<p>✉️ <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>` : ''}
        </div>
        <div class="links">${links || '<span class="muted">No public links yet</span>'}</div>
      </div>
      <details><summary>Outreach messages</summary>
        <div class="msgs">
          <div class="msg"><div class="msg-h"><b>English</b><button class="btn small" data-copy="en">Copy</button></div><p>${esc(l.message_en)}</p></div>
          <div class="msg ar" dir="rtl" lang="ar"><div class="msg-h"><b>العربية</b><button class="btn small" data-copy="ar">نسخ</button></div><p>${esc(l.message_ar)}</p></div>
        </div>
      </details>
      <details><summary>Sources (${(l.evidence || []).length})</summary><ul class="ev">${ev}</ul></details>
      <div class="lead-foot">
        <label>Status <select class="status">${opts}</select></label>
        <textarea class="note" rows="1" placeholder="Notes (who you spoke to, next step…)">${esc(l.note)}</textarea>
      </div>
    </article>`;
  }

  function render() {
    const q = $('#q').value.trim().toLowerCase();
    const f = { country: $('#f-country').value, priority: $('#f-priority').value, status: $('#f-status').value, added: $('#f-day').value };
    const rows = leads.filter(l =>
      Object.entries(f).every(([k, v]) => !v || l[k] === v) &&
      (!q || [l.company, l.sector, l.city, l.signal].join(' ').toLowerCase().includes(q)));
    $('#list').innerHTML = rows.map(card).join('');
    $('#empty').hidden = rows.length > 0;
    stats();
  }

  function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(el._t); el._t = setTimeout(() => el.hidden = true, 1800); }

  async function save(id, patch) {
    try {
      const r = await fetch('api.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, csrf, ...patch }) });
      if (!r.ok) throw new Error(r.status);
      Object.assign(leads.find(l => l.id === id), patch);
      toast('Saved');
    } catch (e) { toast('Could not save — please log in again'); }
  }

  $('#list').addEventListener('click', e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const l = leads.find(x => x.id === b.closest('.lead').dataset.id);
    navigator.clipboard.writeText(b.dataset.copy === 'ar' ? l.message_ar : l.message_en).then(() => toast('Copied'));
  });
  $('#list').addEventListener('change', e => {
    const card = e.target.closest('.lead'); if (!card) return;
    if (e.target.matches('.status')) { save(card.dataset.id, { status: e.target.value }); card.className = `lead st-${e.target.value}`; stats(); }
    if (e.target.matches('.note')) save(card.dataset.id, { note: e.target.value });
  });
  ['#q', '#f-country', '#f-priority', '#f-status', '#f-day'].forEach(s => $(s).addEventListener('input', render));
  render();
})();
