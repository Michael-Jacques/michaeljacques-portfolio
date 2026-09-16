/* Michael Jacques portfolio — scroll choreography, header, interactions */
(function () {
  const html = document.documentElement;
  const page = document.querySelector('.page');
  const header = document.querySelector('.site-header');
  const isDesign = page && page.classList.contains('page--design');
  const mqMobile = window.matchMedia('(max-width:760px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setVar = (k, v) => html.style.setProperty(k, v);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- header height ---------- */
  let headerH = 68;
  function measureHeader() {
    if (!header) return;
    const r = header.getBoundingClientRect();
    const h = Math.ceil(r.height) - 2;
    if (h > 0 && h !== headerH) { headerH = h; setVar('--header-height', h + 'px'); }
  }
  if (window.ResizeObserver && header) new ResizeObserver(measureHeader).observe(header);
  measureHeader();

  /* ---------- viewport locks (mobile) ---------- */
  let lastW = 0;
  function lockVh() {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    setVar('--vh-lock', window.innerHeight + 'px');
    setVar('--wheel-h-lock', Math.round(Math.min(window.innerHeight * .66, 500)) + 'px');
  }
  lockVh();
  window.addEventListener('resize', lockVh);

  /* ---------- tabs indicator ---------- */
  const tabs = document.querySelector('.tabs');
  function placeIndicator() {
    if (!tabs) return;
    const active = tabs.querySelector('.tab[aria-current="page"]');
    if (!active) return;
    tabs.style.setProperty('--tab-x', active.offsetLeft + 'px');
    tabs.style.setProperty('--tab-w', active.offsetWidth + 'px');
  }
  placeIndicator();
  window.addEventListener('resize', placeIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeIndicator);

  /* ---------- copy email ---------- */
  document.querySelectorAll('.email-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const email = btn.dataset.email || btn.textContent.trim();
      try { await navigator.clipboard.writeText(email); } catch (e) { location.href = 'mailto:' + email; }
      const t = document.createElement('span'); t.className = 'copy-toast'; t.textContent = 'Copied!';
      btn.appendChild(t); t.addEventListener('animationend', () => t.remove());
    });
  });

  /* ---------- click bounce / burst ---------- */
  function bounce(el) {
    if (reduced) return;
    const r = el.getBoundingClientRect();
    const dim = Math.max(r.width, r.height) || 1;
    el.style.setProperty('--bounce-scale', clamp(1 - 8 / dim, .9, .97));
    el.classList.remove('is-bouncing'); void el.offsetWidth; el.classList.add('is-bouncing');
  }
  function burst(el) {
    if (reduced) return;
    const r = el.getBoundingClientRect();
    const scale = clamp(Math.hypot(r.width, r.height) / 2 / 128, .55, 1);
    const wrap = document.createElement('span'); wrap.className = 'click-burst';
    wrap.style.left = (r.left + r.width / 2) + 'px'; wrap.style.top = (r.top + r.height / 2) + 'px';
    for (let i = 0; i < 8; i++) {
      const a = i * 45; const rad = a * Math.PI / 180;
      // distance to the bounding-box edge along this angle
      const dx = Math.abs(Math.sin(rad)), dy = Math.abs(Math.cos(rad));
      const rEdge = Math.min(dx > 0 ? (r.width / 2) / dx : 1e9, dy > 0 ? (r.height / 2) / dy : 1e9);
      const s = document.createElement('i');
      s.style.setProperty('--a', a + 'deg'); s.style.setProperty('--r', (rEdge + 4) + 'px');
      s.style.transform = ''; s.style.width = (2 * scale) + 'px'; s.style.height = (7 * scale) + 'px';
      wrap.appendChild(s);
    }
    document.body.appendChild(wrap);
    setTimeout(() => wrap.remove(), 400);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-click-bounce]'); if (b) bounce(b);
    const u = e.target.closest('[data-click-burst]'); if (u) { bounce(u); burst(u); }
  });

  /* ---------- mobile info panel ---------- */
  const toggle = document.querySelector('.header-info-toggle');
  const panel = document.querySelector('.header-info-panel');
  const scrim = document.querySelector('.header-info-scrim');
  function setPanel(open) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.classList.toggle('is-open', open); panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    scrim.classList.toggle('is-open', open);
  }
  if (toggle) {
    toggle.addEventListener('click', () => setPanel(toggle.getAttribute('aria-expanded') !== 'true'));
    scrim.addEventListener('click', () => setPanel(false));
  }

  /* ---------- scrolled flag ---------- */
  function scrolledFlag() { if (window.scrollY > 4) html.setAttribute('data-scrolled', ''); else html.removeAttribute('data-scrolled'); }

  /* ---------- design route choreography ---------- */
  if (!isDesign) {
    window.addEventListener('scroll', scrolledFlag, { passive: true }); scrolledFlag();
    html.classList.add('is-ready', 'is-surged', 'is-explore');
    // case pages: mark the open cover as seen so device shows
    return;
  }

  const stack = document.querySelector('.case-stack');
  const sections = Array.from(document.querySelectorAll('.case-section'));
  const footerReveal = document.querySelector('.footer-reveal');
  const inkEls = Array.from(header.querySelectorAll('.logo,.header-location,.tabs-indicator,.tab,.email-copy,.social-link'));
  const firstFrame = sections[0] && sections[0].querySelector('.case-frame');
  const lastSection = sections[sections.length - 1];
  let dockLatchY = -1;
  const written = {};
  function w(k, v) { if (written[k] !== v) { written[k] = v; setVar(k, v); } }
  let ticking = false;

  function update() {
    ticking = false;
    const g = headerH, vh = window.innerHeight, y = window.scrollY;
    const mobile = mqMobile.matches;
    const R = stack.getBoundingClientRect().top;
    const O = footerReveal.getBoundingClientRect().top;
    const G = clamp((vh - R) / Math.max(1, vh - g));
    w('--hero-case-progress', G.toFixed(4));
    w('--hero-cue-stretch-progress', (1 - Math.pow(1 - Math.min(1, G / .07), 3)).toFixed(4));
    // first case dock progress (latched)
    let B = 0;
    if (firstFrame) {
      const N = firstFrame.getBoundingClientRect().top;
      const pe = clamp((g + 174 - N) / 100);
      if (pe >= 1 && dockLatchY < 0) dockLatchY = y;
      if (dockLatchY >= 0 && y < dockLatchY) dockLatchY = -1;
      B = dockLatchY >= 0 ? 1 : pe;
    }
    w('--first-case-dock-progress', B.toFixed(3));
    // footer
    const H = y < g ? 0 : clamp(1 - O / g);
    w('--footer-header-progress', H.toFixed(4));
    const T = O < vh ? 1 : 0;
    w('--footer-reveal-progress', String(T));
    if (T) html.setAttribute('data-footer-reveal', ''); else html.removeAttribute('data-footer-reveal');
    if (O <= g) html.setAttribute('data-header-black', ''); else html.removeAttribute('data-header-black');
    if (lastSection && lastSection.getBoundingClientRect().top <= g) html.setAttribute('data-last-case-docked', ''); else html.removeAttribute('data-last-case-docked');
    scrolledFlag();
    // contour ink split line
    if (!mobile) {
      const hr = header.getBoundingClientRect();
      const qe = hr.top - 2 + (1 - H) * (hr.height + 5);
      inkEls.forEach(el => { const t = el.getBoundingClientRect().top; el.style.setProperty('--fill-local-y', (qe - t).toFixed(1) + 'px'); });
    }
    // seen sections
    sections.forEach((s, i) => {
      const last = i === sections.length - 1;
      let top;
      if (mobile) { const c = s.querySelector('.case-cover__content'); top = c.getBoundingClientRect().top; }
      else top = s.getBoundingClientRect().top;
      const thr = mobile ? vh * .88 : vh * (last ? .5 : .55);
      const seen = top < thr;
      if (seen) s.classList.add('case-section--seen');
      else if (!mobile && !T) s.classList.remove('case-section--seen');
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('header:remeasure', onScroll);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- marquee driven by ring angle (mobile) ---------- */
  const track = document.querySelector('.hero-marquee__track');
  window.__heroRingAngle = 0;
  function marquee() {
    if (track && mqMobile.matches) {
      const half = track.scrollWidth / 2 || 1;
      const x = -((window.__heroRingAngle * 750) % half);
      track.style.transform = 'translateX(' + x + 'px)';
    }
    requestAnimationFrame(marquee);
  }
  requestAnimationFrame(marquee);

  /* ---------- intro timeline ---------- */
  const loader = document.querySelector('.intro-loader');
  const start = performance.now();
  let heroReady = false, imgsReady = false, started = false;
  function tryStart() {
    if (started) return;
    const elapsed = performance.now() - start;
    if (reduced) { finishInstant(); return; }
    if (heroReady && imgsReady && elapsed >= 700) runIntro();
    else if (elapsed > 6000) runIntro(); // safety
  }
  function finishInstant() {
    started = true;
    loader.classList.add('intro-loader--done');
    html.classList.add('is-ready', 'is-surged', 'is-explore');
    window.dispatchEvent(new CustomEvent('hero:surge'));
    window.dispatchEvent(new CustomEvent('hero:explore'));
    update();
  }
  function runIntro() {
    started = true;
    const at = (ms, fn) => setTimeout(fn, ms);
    at(1050, () => { loader.classList.add('intro-loader--transition'); html.classList.add('is-surged'); });
    at(1900, () => loader.classList.add('intro-loader--fade'));
    at(2200, () => { window.dispatchEvent(new CustomEvent('hero:surge')); html.classList.add('is-ready'); });
    at(2550, () => window.dispatchEvent(new CustomEvent('hero:character')));
    at(3000, () => window.dispatchEvent(new CustomEvent('hero:text')));
    at(3150, () => { loader.classList.add('intro-loader--done'); html.classList.add('is-explore'); window.dispatchEvent(new CustomEvent('hero:explore')); update(); });
  }
  window.addEventListener('hero:ready', () => { heroReady = true; tryStart(); });
  // preload a few images
  const pre = ['assets/characters/hero-character.webp', 'assets/cards/1.webp', 'assets/cards/2.webp'];
  let n = 0; pre.forEach(src => { const im = new Image(); im.onload = im.onerror = () => { if (++n >= pre.length) { imgsReady = true; tryStart(); } }; im.src = src; });
  setTimeout(tryStart, 750); setTimeout(tryStart, 6100);
  // if hero.js fails to load (no WebGL / offline CDN), still proceed
  setTimeout(() => { if (!heroReady) { heroReady = true; tryStart(); } }, 4500);

  update();
})();
