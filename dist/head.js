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
  const doodles = [0, 1, 2, 3].map(k => {
    const d = document.createElement('img');
    d.className = 'spill__doodles'; d.src = P.doodles; d.alt = '';
    d.setAttribute('aria-hidden', 'true');
    d.style.setProperty('--dr', [-10, 166, 18, -150][k] + 'deg');
    spill.appendChild(d);
    return d;
  });

  const nodes = P.items.map((it, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'spill__it';
    b.dataset.slug = it.slug;
    b.setAttribute('aria-label', it.title);
    b.style.setProperty('--r', ((rnd(i, 4) - .5) * 22).toFixed(1) + 'deg');
    b.style.setProperty('--i', String(i));                       // out: near the head first
    b.style.setProperty('--back', String(P.items.length - i));   // in: furthest first
    b.innerHTML = `<img src="${P.base}${it.slug}.webp" alt="" loading="eager" decoding="async">`;
    b.addEventListener('click', e => { e.stopPropagation(); openCard(it); });
    spill.appendChild(b);
    return b;
  });

  /* ---------- lay them out so none overlap ---------- */
  const CAP_AR = 1.0616;   // the cap artwork's width / height

  function layout() {
    const faceEl = document.querySelector('.head__face');
    const faceBox = faceEl.getBoundingClientRect();
    if (!faceBox.width) return;
    const bar = document.querySelector('.bar').getBoundingClientRect();
    const headW = faceBox.width;
    const narrow = matchMedia('(max-width:860px)').matches;

    // the cap flies to the very top, centred on the page
    const capFrac = narrow ? 0.74 : 0.96;
    wrap.style.setProperty('--cap-w', (capFrac * 100).toFixed(1) + '%');
    const capW = headW * capFrac, capH = capW / CAP_AR;
    const capTop = bar.bottom + (narrow ? 8 : 12);
    // keep the hover hint clear of the cap, which sticks up past the face box
    wrap.style.setProperty('--hint-lift', Math.round(capH * 0.56 + 14) + 'px');
    wrap.style.setProperty('--cap-open-y', Math.round(capTop - faceBox.top) + 'px');

    // items fill the whole page around the cap and the head
    const gutter = narrow ? 10 : 26;
    const field = {
      l: gutter,
      t: bar.bottom + 8,
      r: innerWidth - gutter,
      b: innerHeight - (narrow ? 84 : 76)
    };
    const W = field.r - field.l, H = Math.max(180, field.b - field.t);
    if (W <= 0) return;

    const n = P.items.length;
    const base = Math.max(46, Math.min(headW * 0.40, Math.sqrt((W * H * 0.17) / n)));
    const pad = Math.max(8, base * 0.12);

    const boxes = P.items.map((it, i) => {
      const ar = it.ar || 1;
      const scale = 0.88 + rnd(i, 6) * 0.26;
      let w = base * scale, h = w / ar;
      if (h > base * 1.55) { h = base * 1.55; w = h * ar; }
      if (w < base * 0.66) { w = base * 0.66; h = w / ar; }
      // seed left and right of centre, alternating, so both halves of the page fill
      const half = Math.floor(i / 2) + (i % 2);
      const side = i % 2 === 0 ? -1 : 1;
      const k = n <= 1 ? 0 : (half / Math.ceil(n / 2)) * side;
      return {
        w, h,
        x: W / 2 + k * (W * 0.46) + (rnd(i, 1) - .5) * W * 0.06,
        y: H * (0.10 + rnd(i, 2) * 0.84)
      };
    });

    // obstacles, in field coordinates: the lifted cap and the head itself
    const ob = (l, t, w, h) => ({ w, h, x: l - field.l + w / 2, y: t - field.t + h / 2, pinned: true });
    boxes.push(ob(faceBox.left + faceBox.width / 2 - capW / 2, capTop, capW * 1.06, capH * 1.04));
    boxes.push(ob(faceBox.left + faceBox.width * 0.04, faceBox.top + faceBox.height * 0.02,
                  faceBox.width * 0.96, faceBox.height));
    const cb = closeAll.getBoundingClientRect();
    if (cb.width) boxes.push(ob(cb.left - 14, cb.top - 12, cb.width + 28, cb.height + 24));

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

    // soft pass: nudge pairs apart until the gaps between them are even
    const ideal = Math.sqrt((W * H) / n) * 0.92;
    for (let p = 0; p < 160; p++) {
      for (let i = 0; i < n; i++) for (let j2 = i + 1; j2 < n; j2++) {
        const a = boxes[i], b = boxes[j2];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.01;
        if (d >= ideal) continue;
        const push = (ideal - d) * 0.06;
        const ux = dx / d, uy = dy / d;
        a.x -= ux * push; a.y -= uy * push;
        b.x += ux * push; b.y += uy * push;
      }
      // keep clear of the cap and the face while spreading
      for (let i = 0; i < n; i++) for (let k = n; k < boxes.length; k++) {
        const a = boxes[i], o = boxes[k];
        const needX = (a.w + o.w) / 2 + pad, needY = (a.h + o.h) / 2 + pad;
        const dx = a.x - o.x, dy = a.y - o.y;
        const ox = needX - Math.abs(dx), oy = needY - Math.abs(dy);
        if (ox <= 0 || oy <= 0) continue;
        if (ox / needX < oy / needY) a.x += (ox + 1) * (dx < 0 ? -1 : 1);
        else a.y += (oy + 1) * (dy < 0 ? -1 : 1);
      }
      clamp();
    }

    for (let attempt = 0; attempt < 8; attempt++) {
      if (relax(320, attempt ? 2.6 : 0)) break;
      for (const [i, j] of hits()) {
        for (const k of [i, j]) {
          if (boxes[k].pinned || boxes[k].w <= base * 0.58) continue;
          boxes[k].w *= 0.95; boxes[k].h *= 0.95;
        }
      }
      clamp();
    }

    // everything flies out of, and back into, this point: the open skull
    const holeX = faceBox.left + faceBox.width / 2;
    const holeY = faceBox.top + faceBox.height * 0.085;

    boxes.slice(0, n).forEach((bx, i) => {
      const el = nodes[i];
      const px = field.l + bx.x, py = field.t + bx.y;
      el.style.setProperty('--w', Math.round(bx.w) + 'px');
      el.style.setProperty('--x', Math.round(px) + 'px');
      el.style.setProperty('--y', Math.round(py) + 'px');
      el.style.setProperty('--dx', Math.round(holeX - px) + 'px');
      el.style.setProperty('--dy', Math.round(holeY - py) + 'px');
    });

    // small squiggle clusters, behind the items, scattered around the head
    const dw = Math.round(Math.min(W * 0.155, headW * 0.62));
    const spots = [[0.23, 0.26], [0.78, 0.30], [0.33, 0.76], [0.70, 0.72]];
    doodles.forEach((d, k) => {
      d.style.setProperty('--dw', dw + 'px');
      d.style.setProperty('--dl', Math.round(field.l + W * spots[k][0]) + 'px');
      d.style.setProperty('--dt', Math.round(field.t + H * spots[k][1]) + 'px');
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
