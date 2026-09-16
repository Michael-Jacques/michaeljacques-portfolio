/* Conversational portfolio engine.
   Answers come from a curated knowledge base (window.MJ). No network calls.
   To upgrade to a live model later, set MJ.endpoint and implement askRemote(). */
(function () {
  const D = window.MJ;
  const scroll = document.querySelector('.chat-scroll');
  const inner = document.querySelector('.chat-inner');
  const hero = document.querySelector('.hero');
  const form = document.querySelector('.composer');
  const input = document.querySelector('#ask');
  const startersBtn = document.querySelector('.starters-btn');
  const starters = document.querySelector('.starters');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7"/></svg>';

  /* ---------- theme ---------- */
  const root = document.documentElement;
  const saved = (() => { try { return localStorage.getItem('mj-mode'); } catch (e) { return null; } })();
  if (saved) root.setAttribute('data-mode', saved);
  document.querySelector('#mode').addEventListener('click', () => {
    const next = root.getAttribute('data-mode') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-mode', next);
    try { localStorage.setItem('mj-mode', next); } catch (e) {}
  });

  /* ---------- matching ---------- */
  const norm = s => ' ' + s.toLowerCase().replace(/[^a-z0-9\s/&.+-]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';

  function match(qRaw) {
    const q = norm(qRaw);
    let best = null, bestScore = 0;
    for (const it of D.intents) {
      let score = 0;
      for (const k of it.kw) if (q.includes(' ' + k) || q.includes(k + ' ') || q.includes(k)) score += (it.w || 1) * (k.length > 6 ? 1.4 : 1);
      if (score > bestScore) { bestScore = score; best = it; }
    }
    // a named project beats a generic intent
    let proj = null, projScore = 0;
    for (const p of D.projects) {
      let s = 0;
      for (const k of p.kw) if (q.includes(k)) s += k.length > 5 ? 3 : 2;
      if (s > projScore) { projScore = s; proj = p; }
    }
    if (proj && projScore >= bestScore) return { kind: 'project', project: proj };
    if (best && bestScore >= 2) return { kind: 'intent', intent: best };
    return { kind: 'fallback' };
  }

  function answerFor(res) {
    if (res.kind === 'project') {
      const p = res.project;
      const lines = [];
      lines.push('**' + p.plain + '** — ' + p.summary);
      if (p.body && p.body[0]) lines.push(p.body[0]);
      if (p.meta && p.meta.length) lines.push(p.meta.map(m => '**' + m[0] + ':** ' + m[1]).join('  ·  '));
      return { text: lines.join('\n\n'), cards: [p.slug], chips: D.projectChips.slice() };
    }
    if (res.kind === 'intent') {
      const it = res.intent;
      return { text: it.a[0], cards: it.cards || [], chips: it.chips || [] };
    }
    return {
      text: "I don't have a good answer for that one — this version of me only knows what Michael has actually shipped.\n\nTry asking about a project, a client, his career, how he runs a production, or what he's looking for next. Or just email him: **michaelsjacques@gmail.com**",
      cards: [], chips: D.starters.slice(0, 3)
    };
  }

  /* ---------- rendering ---------- */
  function md(t) {
    return t.split('\n\n').map(par =>
      '<p>' + par
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>') + '</p>').join('');
  }

  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }

  function addUser(text) {
    const n = el(`<div class="msg msg--me"><div class="bubble"></div></div>`);
    n.querySelector('.bubble').textContent = text;
    inner.appendChild(n); return n;
  }

  function addBot(html) {
    const n = el(`<div class="msg msg--bot"><span class="msg__avatar">${D.logo}</span><div class="bubble">${html}</div></div>`);
    inner.appendChild(n); return n;
  }

  function cardHTML(slug) {
    const p = D.projects.find(x => x.slug === slug); if (!p) return '';
    return `<a class="card" href="case/${p.slug}.html">
      <span class="card__eyebrow">${p.client}</span>
      <span class="card__title">${p.title}</span>
      <p class="card__sum">${p.summary}</p>
      <span class="card__tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</span>
      <span class="card__go">Open case ${ARROW}</span></a>`;
  }

  function toBottom() {
    requestAnimationFrame(() => scroll.scrollTo({ top: scroll.scrollHeight, behavior: reduced ? 'auto' : 'smooth' }));
  }

  let busy = false;
  async function ask(text) {
    if (busy || !text.trim()) return;
    busy = true;
    if (hero && !hero.hidden) { hero.hidden = true; inner.classList.add('is-conversing'); }
    document.querySelectorAll('.chips').forEach(c => c.remove());
    starters.classList.remove('is-open');
    addUser(text.trim());
    input.value = '';
    toBottom();

    const pending = addBot('<span class="thinking"><i></i><i></i><i></i></span>');
    const res = match(text);
    const out = answerFor(res);
    await wait(reduced ? 80 : 460 + Math.random() * 280);
    pending.querySelector('.bubble').innerHTML = md(out.text);
    toBottom();

    if (out.cards.length) {
      await wait(reduced ? 0 : 220);
      const wrap = el(`<div class="cards">${out.cards.map(cardHTML).join('')}</div>`);
      inner.appendChild(wrap); toBottom();
    }
    if (out.chips.length) {
      await wait(reduced ? 0 : 180);
      const wrap = el(`<div class="chips">${out.chips.map(c => `<button class="chip" type="button"></button>`).join('')}</div>`);
      [...wrap.children].forEach((b, i) => { b.textContent = out.chips[i]; b.addEventListener('click', () => ask(out.chips[i])); });
      inner.appendChild(wrap); toBottom();
    }
    busy = false;
    input.focus({ preventScroll: true });
  }
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- wiring ---------- */
  form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); ask(input.value); } });
  startersBtn.addEventListener('click', e => { e.stopPropagation(); starters.classList.toggle('is-open'); });
  document.addEventListener('click', e => { if (!starters.contains(e.target) && e.target !== startersBtn) starters.classList.remove('is-open'); });
  starters.querySelectorAll('button').forEach(b => b.addEventListener('click', () => ask(b.textContent)));
  document.querySelectorAll('[data-ask]').forEach(b => b.addEventListener('click', () => ask(b.dataset.ask)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') starters.classList.remove('is-open'); });

  // deep link: ?q=...
  const q = new URLSearchParams(location.search).get('q');
  if (q) ask(q); else input.focus({ preventScroll: true });
})();
