/* Classic view: open the head, items spill out with no overlap, click one for its card. */
(function () {
  const P = window.MJ_HEAD || { items: [] };
  const wrap = document.querySelector('.headwrap');
  const head = document.querySelector('.head');
  const spill = document.querySelector('.spill');
  const veil = document.querySelector('.cardveil');
  const closeAll = document.querySelector('.closeall');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7"/></svg>';
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const rnd = (i, k) => { const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };

  /* ---------- build the buttons ---------- */
  const nodes = P.items.map((it, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'spill__it';
    b.dataset.slug = it.slug;
    b.setAttribute('aria-label', it.title);
    b.style.setProperty('--r', ((rnd(i, 4) - .5) * 22).toFixed(1) + 'deg');
    b.style.setProperty('--i', String(P.items.length - i));
    b.style.setProperty('--from', (40 + rnd(i, 5) * 70).toFixed(0) + 'px');
    b.innerHTML = `<img src="${P.base}${it.slug}.webp" alt="" loading="eager" decoding="async">`;
    b.addEventListener('click', e => { e.stopPropagation(); openCard(it); });
    spill.appendChild(b);
    return b;
  });
  const doodles = document.createElement('img');
  doodles.className = 'spill__doodles'; doodles.src = P.doodles; doodles.alt = '';
  doodles.setAttribute('aria-hidden', 'true');
  spill.appendChild(doodles);

  /* ---------- lay them out so none overlap ---------- */
  const CAP_AR = 1.0616;   // the cap artwork's width / height
  function layout() {
    const faceEl = document.querySelector('.head__face');
    const faceBox = faceEl.getBoundingClientRect();
    if (!faceBox.width) return;
    const barBottom = document.querySelector('.bar').getBoundingClientRect().bottom;
    const headW = faceBox.width;

    // the plume is a tight column: wide enough to hold the items, no wider
    const wantW = Math.min(innerWidth * 0.94, headW * 3.05);
    const top = barBottom + 12;
    const deep = matchMedia('(max-width:860px)').matches ? 0.04 : 0.17;
    const bottom = faceBox.top + faceBox.height * deep;   // items reach down into the open skull
    const wantH = Math.max(170, bottom - top);
    spill.style.width = Math.round(wantW) + 'px';
    spill.style.height = Math.round(wantH) + 'px';
    // anchor the column explicitly: CSS percentages drift as the head resizes
    spill.style.bottom = Math.round(faceBox.bottom - bottom) + 'px';

    // park the lifted cap at the top of that column, and tell CSS where it goes
    const narrow = matchMedia('(max-width:860px)').matches;
    const capFrac = narrow ? 0.74 : 0.96;
    wrap.style.setProperty('--cap-w', (capFrac * 100).toFixed(1) + '%');
    const capW = headW * capFrac, capH = capW / CAP_AR;
    const capTopWanted = top + 2;
    wrap.style.setProperty('--cap-open-y', Math.round(capTopWanted - faceBox.top) + 'px');

    const W = spill.clientWidth, H = spill.clientHeight;
    if (!W || !H) return;
    const n = P.items.length;
    // size budget: fill about a quarter of the area, clamped to something legible
    // size items off the head so they always read at the same scale as the face
    const base = Math.max(48, Math.min(headW * 0.38, Math.sqrt((W * H * 0.34) / n)));
    const pad = Math.max(7, base * 0.10);

    const boxes = P.items.map((it, i) => {
      const ar = it.ar || 1;
      const scale = 0.88 + rnd(i, 6) * 0.26;
      let w = base * scale, h = w / ar;
      if (h > base * 1.55) { h = base * 1.55; w = h * ar; }
      if (w < base * 0.66) { w = base * 0.66; h = w / ar; }   // tall items stay legible
      // seed on a symmetric fan rising out of the cavity, widest at the top
      // rank alternates outward from the centre: 0, +1, -1, +2, -2 ...
      const half = Math.floor(i / 2) + (i % 2);
      const side = i % 2 === 0 ? -1 : 1;
      const k = n <= 1 ? 0 : (half / Math.ceil(n / 2)) * side;   // -1 .. 1
      const climb = 1 - Math.abs(k) * 0.55;                       // middle rides highest
      return {
        w, h,
        x: W / 2 + k * (W * 0.46) + (rnd(i, 1) - .5) * W * 0.05,
        y: H - climb * H * 0.80 - H * 0.08 + (rnd(i, 2) - .5) * H * 0.10
      };
    });

    // the lifted cap is an obstacle the items must flow around
    const sbox = spill.getBoundingClientRect();
    boxes.push({
      w: capW * 1.10, h: capH * 1.08,
      x: faceBox.left + faceBox.width / 2 - sbox.left,
      y: capTopWanted + capH / 2 - sbox.top,
      pinned: true
    });

    const clamp = () => { for (let i = 0; i < n; i++) {
      boxes[i].x = Math.max(boxes[i].w / 2, Math.min(W - boxes[i].w / 2, boxes[i].x));
      boxes[i].y = Math.max(boxes[i].h / 2, Math.min(H - boxes[i].h / 2, boxes[i].y)); } };

    const hits = () => {
      const out = [];
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.pinned && b.pinned) continue;
        if (Math.abs(b.x - a.x) < (a.w + b.w) / 2 + pad &&
            Math.abs(b.y - a.y) < (a.h + b.h) / 2 + pad) out.push([i, j]);
      }
      return out;
    };

    const relax = (passes, kick) => {
      for (let p = 0; p < passes; p++) {
        const hs = hits();
        if (!hs.length) return true;
        for (const [i, j] of hs) {
          const a = boxes[i], b = boxes[j];
          const needX = (a.w + b.w) / 2 + pad, needY = (a.h + b.h) / 2 + pad;
          let dx = b.x - a.x, dy = b.y - a.y;
          if (dx === 0 && dy === 0) { dx = (rnd(i + j, 9) - .5) || .5; dy = .5; }
          const ox = needX - Math.abs(dx), oy = needY - Math.abs(dy);
          const wa = a.pinned ? 0 : (b.pinned ? 1 : .5), wb = b.pinned ? 0 : (a.pinned ? 1 : .5);
          if (ox / needX < oy / needY) {
            const s = (ox + 1.2) * (dx < 0 ? -1 : 1);
            a.x -= s * wa; b.x += s * wb;
            if (kick) { a.y -= (rnd(i, 7) - .5) * kick * wa; b.y += (rnd(j, 8) - .5) * kick * wb; }
          } else {
            const s = (oy + 1.2) * (dy < 0 ? -1 : 1);
            a.y -= s * wa; b.y += s * wb;
            if (kick) { a.x -= (rnd(i, 7) - .5) * kick * wa; b.x += (rnd(j, 8) - .5) * kick * wb; }
          }
        }
        clamp();
      }
      return !hits().length;
    };

    // relax; if a pair stays stuck, shrink the offenders a little and try again
    for (let attempt = 0; attempt < 8; attempt++) {
      if (relax(300, attempt ? 2.4 : 0)) break;
      for (const [i, j] of hits()) {
        for (const k of [i, j]) {
          if (boxes[k].pinned || boxes[k].w <= base * 0.60) continue;
          boxes[k].w *= 0.95; boxes[k].h *= 0.95;
        }
      }
      clamp();
    }

    boxes.slice(0, n).forEach((bx, i) => {
      const el = nodes[i];
      el.style.setProperty('--w', (bx.w / W * 100).toFixed(3) + '%');
      el.style.setProperty('--x', (bx.x / W * 100).toFixed(3) + '%');
      el.style.setProperty('--y', (bx.y / H * 100).toFixed(3) + '%');
    });
  }
  layout();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 160); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

  /* ---------- open / close ---------- */
  let open = false;
  function setOpen(v) {
    open = v;
    wrap.classList.toggle('is-open', v);
    document.body.classList.toggle('head-open', v);
    head.setAttribute('aria-expanded', v ? 'true' : 'false');
    if (v) layout();
  }
  head.addEventListener('click', () => setOpen(!open));
  closeAll.addEventListener('click', () => { closeCard(); setOpen(false); });

  /* ---------- item card ---------- */
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
    const x = veil.querySelector('.itemcard__x');
    x.addEventListener('click', closeCard);
    x.focus();
  }
  function closeCard() { veil.classList.remove('is-on'); veil.innerHTML = ''; }
  veil.addEventListener('click', e => { if (e.target === veil) closeCard(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (veil.classList.contains('is-on')) closeCard(); else if (open) setOpen(false);
  });

  if (location.hash === '#open') setOpen(true);
})();
