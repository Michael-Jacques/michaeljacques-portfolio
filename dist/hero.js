/* Hero: three.js card ring + Anton title on cylinder + character plane */
import * as THREE from 'three';

const canvas = document.querySelector('.carousel-canvas');
const stage = document.querySelector('.carousel-stage');
const wheel = document.querySelector('.screen-wheel');
const hero = document.querySelector('.work-hero');
const page = document.querySelector('.page');
const WORDS = JSON.parse(page.dataset.words || '["DIGITAL"]');
const STATIC_WORD = 'PRODUCER';
const META_L = 'DIGITAL MANAGER', META_R = 'CREATIVE PRODUCER';
const TYPING_COLOR = '#DB0508', TEXT_COLOR = '#000000';
const mobile = () => window.matchMedia('(max-width:760px)').matches;
const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile() ? 3 : 1.75));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
camera.position.set(0, 0, -4);
camera.lookAt(0, 0, 1);

const pivot = new THREE.Group(); pivot.position.y = .28; scene.add(pivot);
const ring = new THREE.Group(); pivot.add(ring);
const R = 7.2, CARD_W = 1.34, CARD_H = 3.02, CARD_R = .14;
const N = mobile() ? 16 : 26;
const loader = new THREE.TextureLoader();

/* rounded rect shape */
function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}
const cardGeo = new THREE.ShapeGeometry(roundedRect(CARD_W, CARD_H, CARD_R), 12);
// remap uv to 0..1 across the card
{ const uv = cardGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + CARD_W / 2) / CARD_W, (uv.getY(i) + CARD_H / 2) / CARD_H); }
const outlineGeo = new THREE.ShapeGeometry(roundedRect(CARD_W + .012, CARD_H + .012, CARD_R + .006), 12);

const cardVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const cardFrag = `uniform sampler2D map; uniform float uSat; uniform float uOpacity; uniform vec2 uScale; uniform vec2 uOffset; varying vec2 vUv;
  void main(){ vec2 uv = vUv * uScale + uOffset; vec4 c = texture2D(map, uv); float g = dot(c.rgb, vec3(.299,.587,.114));
  vec3 col = mix(vec3(g), c.rgb, uSat); gl_FragColor = vec4(col, c.a * uOpacity); }`;

const cards = [];
const imgs = []; for (let i = 1; i <= 13; i++) imgs.push(`assets/cards/${i}.webp`);
let loadedTex = 0; const texCache = {};
function getTex(src, cb) {
  if (texCache[src]) { cb(texCache[src]); return; }
  loader.load(src, t => { t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4; texCache[src] = t; loadedTex++; cb(t); }, undefined, () => { loadedTex++; cb(null); });
}
for (let i = 0; i < N; i++) {
  const a = i * Math.PI * 2 / N;
  const mat = new THREE.ShaderMaterial({ vertexShader: cardVert, fragmentShader: cardFrag, transparent: true,
    uniforms: { map: { value: null }, uSat: { value: 0 }, uOpacity: { value: .62 }, uScale: { value: new THREE.Vector2(1, 1) }, uOffset: { value: new THREE.Vector2(0, 0) } } });
  const mesh = new THREE.Mesh(cardGeo, mat);
  const outline = new THREE.Mesh(outlineGeo, new THREE.MeshBasicMaterial({ color: 0xb8b8b8, transparent: true, opacity: .42 }));
  outline.position.z = -.002;
  const g = new THREE.Group();
  g.add(outline); g.add(mesh);
  g.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
  g.rotation.y = a + Math.PI;
  ring.add(g);
  const card = { g, mesh, mat, outline, hover: 0, target: 0 };
  cards.push(card);
  getTex(imgs[i % 13], t => {
    if (!t) return;
    const iw = t.image.width, ih = t.image.height, ar = CARD_W / CARD_H;
    let sx = 1, sy = 1, ox = 0, oy = 0;
    if (iw / ih > ar) { sx = (ih * ar) / iw; ox = (1 - sx) / 2; } else { sy = (iw / ar) / ih; oy = (1 - sy) / 2; }
    mat.uniforms.map.value = t; mat.uniforms.uScale.value.set(sx, sy); mat.uniforms.uOffset.value.set(ox, oy);
  });
}
if (mobile()) { ring.scale.setScalar(1.2); ring.position.y = -1.2; cards.forEach(c => c.g.scale.set(1.45, 1.31, 1)); }

/* ---- text on cylinder ---- */
function makeTextTexture(text, opts = {}) {
  const font = opts.font || `400 210px Anton, "Arial Black", Impact, sans-serif`;
  const pad = opts.pad ?? 15, height = opts.height ?? 293;
  const c = document.createElement('canvas'); const ctx = c.getContext('2d');
  ctx.font = font; ctx.letterSpacing = opts.spacing || '-0.04em';
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  c.width = Math.max(2, w); c.height = height;
  ctx.font = font; ctx.letterSpacing = opts.spacing || '-0.04em';
  ctx.textBaseline = 'middle';
  // draw characters individually to colour the typing state
  let x = pad;
  const chars = opts.chars || text.split('').map(ch => ({ ch, color: opts.color || TEXT_COLOR }));
  for (const { ch, color, outline } of chars) {
    const cw = ctx.measureText(ch).width;
    if (outline) { ctx.lineWidth = 6; ctx.strokeStyle = color; ctx.strokeText(ch, x, height / 2 + 6); }
    else { ctx.fillStyle = color; ctx.fillText(ch, x, height / 2 + 6); }
    x += cw;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.minFilter = THREE.LinearFilter; t.anisotropy = 8;
  return { tex: t, w: c.width, h: c.height };
}
const textGroup = new THREE.Group(); pivot.add(textGroup);
const TITLE_Y = 1.62, STRIP_H = 1, PX_PER_UNIT = 293 / STRIP_H; // strip height 1 unit == 293px
function makeStrip(texInfo, y, h, order) {
  const arc = (texInfo.w / PX_PER_UNIT * (h / STRIP_H)) / R; // arc length in radians
  const geo = new THREE.CylinderGeometry(R, R, h, 96, 1, true, 0, arc);
  const mat = new THREE.MeshBasicMaterial({ map: texInfo.tex, transparent: true, depthTest: false, depthWrite: false, side: THREE.BackSide, opacity: 0 });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = order; m.position.y = y;
  // CylinderGeometry with thetaStart faces outward; we view from inside → BackSide, flip uv x
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
  m.userData.arc = arc; return m;
}
let wordMesh = null, staticMesh = null;
const GAP = 3 / PX_PER_UNIT / R; // 3px gap in radians
function layoutTitle(wordArc, staticArc, immediate) {
  // both centred on angle PI (the far side, which faces the camera at +Z)... camera looks +Z so far side centre = angle 0 in our cylinder (z=+R)
  // a strip spans cylinder angles [rotation.y, rotation.y + arc]; +angle = +x = screen LEFT (camera looks down +z)
  const total = wordArc + GAP + staticArc;
  const staticRot = -total / 2;                 // right half
  const wordRot = -total / 2 + staticArc + GAP; // left half
  if (wordMesh) { wordMesh.userData.targetRot = wordRot; if (immediate) wordMesh.rotation.y = wordRot; }
  if (staticMesh) { staticMesh.userData.targetRot = staticRot; if (immediate) staticMesh.rotation.y = staticRot; }
}
function buildStatic() {
  const info = makeTextTexture(STATIC_WORD);
  staticMesh = makeStrip(info, TITLE_Y, STRIP_H, 10); textGroup.add(staticMesh);
}
function setWord(chars) {
  const text = chars.map(c => c.ch).join('');
  const info = makeTextTexture(text || ' ', { chars });
  const old = wordMesh;
  wordMesh = makeStrip(info, TITLE_Y, STRIP_H, 10); textGroup.add(wordMesh);
  if (old) { wordMesh.material.opacity = old.material.opacity; wordMesh.rotation.y = old.rotation.y; textGroup.remove(old); old.geometry.dispose(); old.material.map.dispose(); old.material.dispose(); }
  layoutTitle(wordMesh.userData.arc, staticMesh.userData.arc, !old);
}
/* meta ring */
const META_Y = -1.9, META_H = .24;
let metaL = null, metaR = null;
function buildMeta() {
  if (mobile()) return;
  const f = `600 52px Montserrat, sans-serif`;
  const li = makeTextTexture(META_L, { font: f, spacing: '0.04em', height: 70, pad: 12 });
  const ri = makeTextTexture(META_R, { font: f, spacing: '0.04em', height: 70, pad: 12 });
  const pxu = 70 / META_H;
  const mk = (info) => { const arc = (info.w / pxu) / R; const geo = new THREE.CylinderGeometry(R, R, META_H, 64, 1, true, 0, arc);
    const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: info.tex, transparent: true, depthTest: false, depthWrite: false, side: THREE.BackSide, opacity: 0 }));
    m.renderOrder = 11; m.position.y = META_Y; m.userData.arc = arc; return m; };
  metaL = mk(li); metaR = mk(ri); textGroup.add(metaL); textGroup.add(metaR);
  const gap = .5; // rad between the two strings
  metaL.rotation.y = gap / 2;                          // left of centre
  metaR.rotation.y = -(gap / 2 + metaR.userData.arc);  // right of centre
}
document.fonts.ready.then(() => { buildStatic(); setWord(WORDS[0].split('').map(ch => ({ ch, color: TEXT_COLOR }))); buildMeta(); mobileLayout(); heroReady(); });
function mobileLayout() {
  if (!mobile()) return;
  // stacked: word above, PRODUCER below, both centred
  textGroup.scale.setScalar(1.22); textGroup.position.y = 2.75 - TITLE_Y * 1.22;
  wordMesh.position.y = TITLE_Y + .5; staticMesh.position.y = TITLE_Y - .5;
  wordMesh.userData.stacked = staticMesh.userData.stacked = true;
  wordMesh.rotation.y = -wordMesh.userData.arc / 2; staticMesh.rotation.y = -staticMesh.userData.arc / 2;
  wordMesh.userData.targetRot = wordMesh.rotation.y; staticMesh.userData.targetRot = staticMesh.rotation.y;
}

/* ---- character ---- */
let charMesh = null;
const CHAR_H = 3.72, CHAR_ASPECT = 1217 / 2462, CHAR_Y = -.82;
if (!mobile()) {
  getTex('assets/characters/hero-character.webp', t => {
    if (!t) return;
    const geo = new THREE.PlaneGeometry(CHAR_H * CHAR_ASPECT, CHAR_H);
    const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    charMesh = new THREE.Mesh(geo, mat); charMesh.renderOrder = 120; charMesh.rotation.y = Math.PI;
    charMesh.position.set(0, CHAR_Y, 5.02);
    scene.add(charMesh);
  });
}

/* ---- sizing ---- */
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.fov = w < 600 ? 46 : 34;
  // shift view so the ring centre aligns with .screen-wheel centre (canvas extends 252px above / 180 below the wheel)
  camera.setViewOffset(w, h, 0, -46, w, h);
  camera.updateProjectionMatrix();
}
resize(); window.addEventListener('resize', resize);

/* ---- state ---- */
let angle = 0, speed = 0, vel = 0, surgeT = -1, textFadeT = -1, charVisible = false, exploring = false;
let cursorX = 0, cursorY = 0, cX = 0, cY = 0, textPhase = false;
window.addEventListener('hero:surge', () => { surgeT = performance.now(); textFadeT = performance.now(); });
window.addEventListener('hero:character', () => { charVisible = true; });
window.addEventListener('hero:text', () => { textPhase = true; });
window.addEventListener('hero:explore', () => { exploring = true; startWordCycle(); });
function heroReady() { window.dispatchEvent(new CustomEvent('hero:ready')); }

/* pointer tilt */
if (finePointer) {
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); cursorX = ((e.clientX - r.left) / r.width - .5) * 2; cursorY = ((e.clientY - r.top) / r.height - .5) * 2; });
  hero.addEventListener('pointerleave', () => { cursorX = 0; cursorY = 0; });
}

/* drag / wheel interaction */
const raycaster = new THREE.Raycaster(); const ndc = new THREE.Vector2();
let dragging = false, dragStartX = 0, dragStartAngle = 0, lastX = 0, lastT = 0, hovered = null;
function azimuth(x) { const w = canvas.clientWidth; const f = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect; return Math.atan2(((x / w) - .5) * 2 * f, 1); }
function pick(e) {
  const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(cards.map(c => c.mesh), false);
  return hits.length ? cards.find(c => c.mesh === hits[0].object) : null;
}
if (finePointer) {
  canvas.addEventListener('pointermove', e => {
    if (dragging) { const a = azimuth(e.clientX); angle = dragStartAngle + (a - dragStartX); const now = performance.now(); vel = (e.clientX - lastX) / Math.max(1, now - lastT) * 8; lastX = e.clientX; lastT = now; return; }
    const c = pick(e); hovered = c; canvas.classList.toggle('carousel-canvas--hovering', !!c);
  });
  canvas.addEventListener('pointerdown', e => { const c = pick(e); if (!c) return; dragging = true; canvas.setPointerCapture(e.pointerId); canvas.classList.add('carousel-canvas--dragging'); dragStartX = azimuth(e.clientX); dragStartAngle = angle; lastX = e.clientX; lastT = performance.now(); vel = 0; });
  const end = e => { if (!dragging) return; dragging = false; canvas.classList.remove('carousel-canvas--dragging'); vel = THREE.MathUtils.clamp(vel, -6.5, 6.5); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('wheel', e => {
    const r = canvas.getBoundingClientRect(); const fy = (e.clientY - r.top) / r.height;
    const dx = e.shiftKey ? e.deltaY : e.deltaX; if (Math.abs(dx) < 1 || fy < .36 || fy > .82) return;
    e.preventDefault(); const d = dx * .00075; angle += d * .35; vel += d * 7;
  }, { passive: false });
}

/* word cycle (typewriter) */
let wordIdx = 0, cycleTimer = null;
function startWordCycle() {
  if (cycleTimer || reduced) return;
  cycleTimer = setInterval(nextWord, 3000);
}
let animating = false;
function nextWord() {
  if (animating) return; animating = true;
  const oldW = WORDS[wordIdx]; wordIdx = (wordIdx + 1) % WORDS.length; const newW = WORDS[wordIdx];
  let chars = oldW.split('').map(ch => ({ ch, color: TEXT_COLOR }));
  const eraseStep = 32, typeStep = 58;
  let i = chars.length;
  const erase = () => { if (i > 0) { i--; chars = chars.slice(0, i); setWord(chars); setTimeout(erase, eraseStep); } else type(0); };
  const type = (k) => {
    if (k <= newW.length) {
      const typed = newW.slice(0, k).split('').map(ch => ({ ch, color: TYPING_COLOR }));
      if (k < newW.length) typed.push({ ch: newW[k], color: TEXT_COLOR, outline: true });
      setWord(typed); setTimeout(() => type(k + 1), typeStep);
    } else { setTimeout(() => { setWord(newW.split('').map(ch => ({ ch, color: TEXT_COLOR }))); animating = false; }, 140); }
  };
  erase();
}

/* ---- render loop ---- */
const easeOutQuad = t => 1 - (1 - t) * (1 - t);
let last = performance.now();
function frameInner(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  // spin
  if (surgeT >= 0) {
    const t = Math.min(1, (now - surgeT) / 3600);
    const s0 = mobile() ? 2.5 : 4.1;
    speed = s0 + (.095 - s0) * easeOutQuad(t);
  }
  if (!dragging) { angle += (speed + vel) * dt; vel *= Math.exp(-1.45 * dt); }
  ring.rotation.y = angle;
  window.__heroRingAngle = angle;
  // tilt
  if (finePointer && textPhase) { cX += (cursorX - cX) * .075; cY += (cursorY - cY) * .075; }
  pivot.rotation.x += ((cY * -.075) - pivot.rotation.x) * .08;
  pivot.rotation.y += ((cX * .14) - pivot.rotation.y) * .08;
  // cards hover
  for (const c of cards) {
    c.target = (c === hovered) ? 1 : 0;
    c.hover += (c.target - c.hover) * .16;
    c.mat.uniforms.uSat.value = c.hover; c.mat.uniforms.uOpacity.value = .62 + .38 * c.hover;
    const s = 1 + .045 * c.hover; c.g.scale.set(mobile() ? 1.45 * s : s, mobile() ? 1.31 * s : s, 1);
    c.outline.material.opacity = .42 + .43 * c.hover; c.outline.material.color.setHex(c.hover > .5 ? 0xf6f6f6 : 0xb8b8b8);
  }
  // text fade-in
  if (textFadeT >= 0) {
    const t = Math.min(1, (now - textFadeT) / 720), e = easeOutQuad(t);
    for (const m of [wordMesh, staticMesh, metaL, metaR]) if (m) { m.material.opacity = e; m.scale.setScalar(.965 + .035 * e); if (!m.userData.stacked) m.position.y = (m === metaL || m === metaR ? META_Y : TITLE_Y) - .28 * (1 - e); }
  }
  for (const m of [wordMesh, staticMesh]) if (m && m.userData.targetRot !== undefined) m.rotation.y += (m.userData.targetRot - m.rotation.y) * .12;
  // character
  if (charMesh) charMesh.material.opacity += ((charVisible ? 1 : 0) - charMesh.material.opacity) * .18;
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
function frame(now) { try { frameInner(now); } catch (e) { window.__heroErr = String(e && e.stack || e); if (!window.__heroErrLogged) { window.__heroErrLogged = 1; console.error('hero frame error', e); } } }
requestAnimationFrame(frame);
window.__hero = { scene, camera, cards, ring, pivot, textGroup, get wordMesh(){return wordMesh}, get staticMesh(){return staticMesh}, get charMesh(){return charMesh}, get state(){return {angle,speed,surgeT,textFadeT,charVisible,exploring,loadedTex}} };
