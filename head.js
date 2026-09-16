/* Classic view: open the head, items spill out, click one for its card. */
(function () {
  const P = window.MJ_HEAD || { items: [] };
  const stage = document.querySelector('.headwrap');
  const head = document.querySelector('.head');
  const spill = document.querySelector('.spill');
  const veil = document.querySelector('.cardveil');
  const closeAll = document.querySelector('.closeall');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* scatter items in a loose upward cluster, deterministic so it never reflows oddly */
  const N = P.items.length;
  const seed = (i, k) => { const x = Math.sin((i + 1) * (k + 3.7)) * 10000; return x - Math.floor(x); };
  P.items.forEach((it, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'spill__it';
    b.dataset.slug = it.slug;
    b.setAttribute('aria-label', it.title);
    // columns of 3 with jitter; wider near the top so it reads as a plume
    const row = Math.floor(i / 3), col = i % 3;
    const t = i / Math.max(1, N - 1);
    const spread = 18 + t * 26;
    const x = 50 + (col - 1) * spread + (seed(i, 1) - .5) * 17;
    const y = 88 - t * 82 + (seed(i, 2) - .5) * 8;
    b.style.setProperty('--x', x.toFixed(2) + '%');
    b.style.setProperty('--y', y.toFixed(2) + '%');
    b.style.setProperty('--w', (15 + seed(i, 3) * 9).toFixed(1) + '%');
    b.style.setProperty('--r', ((seed(i, 4) - .5) * 26).toFixed(1) + 'deg');
    b.style.setProperty('--i', String(N - i));
    b.innerHTML = `<img src="${P.base}${it.slug}.webp" alt="" loading="lazy" decoding="async">`;
    b.addEventListener('click', e => { e.stopPropagation(); openCard(it); });
    spill.appendChild(b);
  });
  const doodles = document.createElement('img');
  doodles.className = 'spill__doodles'; doodles.src = P.doodles; doodles.alt = ''; doodles.setAttribute('aria-hidden', 'true');
  spill.appendChild(doodles);

  /* open / close the head */
  let open = false;
  function setOpen(v) {
    open = v;
    stage.classList.toggle('is-open', v);
    document.body.classList.toggle('head-open', v);
    head.setAttribute('aria-expanded', v ? 'true' : 'false');
  }
  head.addEventListener('click', () => setOpen(!open));
  closeAll.addEventListener('click', () => { closeCard(); setOpen(false); });

  /* item card */
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7"/></svg>';
  function openCard(it) {
    veil.innerHTML = `<article class="itemcard" role="dialog" aria-modal="true" aria-label="${esc(it.title)}">
      <div class="itemcard__pic"><img src="${P.art}${it.slug}.webp" alt=""></div>
      <span class="itemcard__eyebrow">${esc(it.client)}</span>
      <h3>${esc(it.title)}</h3>
      <p>${esc(it.blurb)}</p>
      <div class="itemcard__meta">${it.meta.map(m => `<span>${esc(m[0])}: ${esc(m[1])}</span>`).join('')}</div>
      <div class="itemcard__foot">
        <a class="itemcard__go" href="case/${it.slug}.html">Open the case ${ARROW}</a>
        <button class="itemcard__x" type="button">Close &times;</button>
      </div></article>`;
    veil.classList.add('is-on');
    veil.querySelector('.itemcard__x').addEventListener('click', closeCard);
    veil.querySelector('.itemcard__x').focus();
  }
  function closeCard() { veil.classList.remove('is-on'); veil.innerHTML = ''; }
  veil.addEventListener('click', e => { if (e.target === veil) closeCard(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (veil.classList.contains('is-on')) closeCard(); else if (open) setOpen(false);
  });
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* open on load for anyone arriving with #open, and give a nudge after a beat */
  if (location.hash === '#open') setOpen(true);
  else if (!reduced) setTimeout(() => { if (!open) head.classList.add('is-nudging'); }, 2600);
})();
