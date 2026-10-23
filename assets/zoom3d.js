/* Research zoom: the hero's galaxy (galaxy3d.js, FIRE-2 m12i) carries on as the research section
   scrolls in: it zooms out to the cosmic web, back into the galaxy, and down through the Solar System
   to Earth, while a card introduces each of the three stops. It draws into the hero's scene, on the
   stage the two sections share, so there is no cut between them.
   Scroll progress p (0..1) sets z, the log10 of the visible half-height in metres. Each level is its
   own group in its own units (web: Mpc, galaxy: kpc, Solar System: AU, Earth: Earth radii), scaled to
   the current z and faded in and out around its range, so the levels read as one continuous zoom.
   At p = 0 everything is exactly the hero's view.
   Test hook: ?zoomp=0.5 freezes p and pins the stage over the whole window. */
import * as THREE from 'three';
import { dotTexture } from './galaxy-data.js?v=1';

const $ = s => document.querySelector(s);
const zoom = $('#zoom'), labelsEl = $('#zlabels'), scaleEl = $('#zscale');
const cards = [...zoom.querySelectorAll('.zcard')].map(el => ({ el, at: el.dataset.at.split(',').map(Number) }));
const forced = new URLSearchParams(location.search).get('zoomp');

const M_PER = { web: 3.086e22, gal: 3.086e19, sol: 1.496e11, earth: 6.371e6 };   // metres per unit: Mpc, kpc, AU, Earth radius
const DIST = 64, FOV = 20, HALF = DIST * Math.tan(FOV / 2 * Math.PI / 180);   // the hero's camera; visible half-height (kpc)
const Z_HERO = Math.log10(HALF * M_PER.gal);   // the hero's view, about 10^20.5 m

// starts at the hero's view and zooms out to the cosmic web as the hero scrolls away; then three
// stops (web, galaxy, Earth),
// passing through the Solar System on the way down
const ZKEYS = [[0, Z_HERO], [.12, 24.15], [.3, 24.0], [.42, 20.75], [.6, 20.6], [.63, 20.45], [.67, 12.6], [.69, 12.4], [.74, 7.35], [1, 7.2]];
const SUN_AT = [.6, .63];       // the view slides from the Galactic Center to the Sun here
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function zAt(p) {
  for (let i = 1; i < ZKEYS.length; i++) if (p <= ZKEYS[i][0]) {
    const [p0, z0] = ZKEYS[i - 1], [p1, z1] = ZKEYS[i];
    return z0 + (z1 - z0) * smooth(p0, p1, p);
  }
  return ZKEYS[ZKEYS.length - 1][1];
}
const window_ = (p, a, b, f = .025) => smooth(a, a + f, p) * (1 - smooth(b - f, b, p));

/* ---------- level 1: a 3D cosmic web (Zel'dovich approximation) ---------- */
// Particles start on a 64^3 grid and move by the displacement field of one Gaussian random field
// (power-law spectrum with a small-scale cutoff, via 3D FFT). The box is recentred on its densest
// knot, which is where the galaxy will appear.
function cosmicWeb() {
  const N = 64, BOX = 200;                       // Mpc
  const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(11);
  const g = () => { let u = 0, v = 0; while (!u) u = rnd(); while (!v) v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  function fft(re, im, inv) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const a = (inv ? 2 : -2) * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
          re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
    if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }
  function fft3(re, im, inv) {          // along x, then y, then z
    const r = new Float64Array(N), c = new Float64Array(N);
    for (const stride of [1, N, N * N]) for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
      const base = stride === 1 ? (a * N + b) * N : stride === N ? a * N * N + b : a * N + b;
      for (let k = 0; k < N; k++) { r[k] = re[base + k * stride]; c[k] = im[base + k * stride]; }
      fft(r, c, inv);
      for (let k = 0; k < N; k++) { re[base + k * stride] = r[k]; im[base + k * stride] = c[k]; }
    }
  }
  const N3 = N ** 3, re = new Float64Array(N3), im = new Float64Array(N3);
  for (let i = 0; i < N3; i++) re[i] = g();
  fft3(re, im, false);
  const kk = i => (i < N / 2 ? i : i - N) * 2 * Math.PI / N;
  const disp = [0, 1, 2].map(() => [new Float64Array(N3), new Float64Array(N3)]);
  let dv = 0;
  for (let z = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const k = [kk(x), kk(y), kk(z)], k2 = k[0] ** 2 + k[1] ** 2 + k[2] ** 2, i = (z * N + y) * N + x;
    if (!k2) continue;
    const amp = Math.pow(k2, -0.8) * Math.exp(-k2 / (2 * .7 * .7)) / k2, a = re[i] * amp, b = im[i] * amp;
    for (let d = 0; d < 3; d++) { disp[d][0][i] = -k[d] * b; disp[d][1][i] = k[d] * a; }   // psi = i k phi
    dv += k2 * k2 * (a * a + b * b);
  }
  for (let d = 0; d < 3; d++) fft3(disp[d][0], disp[d][1], true);
  const D = 1.9 / Math.sqrt(dv / N3 / N3);       // strong enough for sheets, filaments and knots
  const cell = BOX / N, pos = new Float32Array(N3 * 3);
  for (let z = 0, i = 0; z < N; z++) for (let y = 0; y < N; y++) for (let x = 0; x < N; x++, i++) {
    pos[3 * i] = (x + D * disp[0][0][i]) * cell; pos[3 * i + 1] = (y + D * disp[1][0][i]) * cell; pos[3 * i + 2] = (z + D * disp[2][0][i]) * cell;
  }
  // densest knot on a coarse grid; recentre the (periodic) box on it
  const M = 32, cnt = new Uint16Array(M ** 3);
  const wrap = v => ((v % BOX) + BOX) % BOX;
  for (let i = 0; i < N3; i++) cnt[(Math.floor(wrap(pos[3 * i + 2]) / BOX * M) * M + Math.floor(wrap(pos[3 * i + 1]) / BOX * M)) * M + Math.floor(wrap(pos[3 * i]) / BOX * M)]++;
  let best = 0; for (let i = 1; i < cnt.length; i++) if (cnt[i] > cnt[best]) best = i;
  const node = [best % M, Math.floor(best / M) % M, Math.floor(best / M / M)].map(c => (c + .5) * BOX / M);
  let cx = 0, cy = 0, cz = 0, n = 0;            // refine to the particles' mean within the knot's cell
  for (let i = 0; i < N3; i++) {
    const d = [0, 1, 2].map(k => { let v = wrap(pos[3 * i + k]) - node[k]; return v - BOX * Math.round(v / BOX); });
    if (Math.abs(d[0]) < 4 && Math.abs(d[1]) < 4 && Math.abs(d[2]) < 4) { cx += d[0]; cy += d[1]; cz += d[2]; n++; }
  }
  node[0] += cx / n; node[1] += cy / n; node[2] += cz / n;
  for (let i = 0; i < N3; i++) for (let k = 0; k < 3; k++) { let v = wrap(pos[3 * i + k]) - node[k]; pos[3 * i + k] = v - BOX * Math.round(v / BOX); }
  return pos;
}

/* ---------- level 3: a dotted Earth (the site's world map), the LHC and an underground lab ---------- */
const onSphere = (lat, lon, r = 1) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return new THREE.Vector3(r * Math.cos(a) * Math.cos(b), r * Math.cos(a) * Math.sin(b), r * Math.sin(a)); };
function earthDots() {
  const MAP = window.WORLD_MAP, out = [];
  if (!MAP) return new Float32Array();
  const dLon = 360 / MAP.cols;
  MAP.rows.forEach((row, ri) => {
    for (let ci = 0; ci < MAP.cols; ci++) if (parseInt(row[ci >> 2], 16) >> (3 - (ci & 3)) & 1) {
      const v = onSphere(MAP.lat0 - (ri + .5) * MAP.step, -180 + (ci + .5) * dLon, 1.004); out.push(v.x, v.y, v.z);
    }
  });
  return Float32Array.from(out);
}

function start() {
  const C = window.cosmos3d;
  if (!C) return;                                 // the hero galaxy isn't 3D: the ladder stays
  zoom.hidden = false; $('#ladder-wrap').hidden = true;
  if (forced !== null) { zoom.classList.add('zoom-test'); document.body.classList.add('zoomtest'); }
  const { scene, camera, world, canvas } = C, tex = dotTexture();
  const additive = { transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending };

  // level 1
  const web = new THREE.Group(); web.visible = false; scene.add(web);
  const wGeo = new THREE.BufferGeometry();
  // the web takes ~1 s to compute, so it's built in a background thread and the page never stalls;
  // without workers, it's built in idle time (or at once, if the zoom is reached first)
  let webReady = false;
  const setWeb = pos => { if (!webReady) { wGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); webReady = true; } };
  const buildNow = () => setWeb(cosmicWeb());
  try {
    const w = new Worker(URL.createObjectURL(new Blob([`${cosmicWeb};const p=cosmicWeb();postMessage(p,[p.buffer])`], { type: 'text/javascript' })));
    w.onmessage = e => { setWeb(e.data); w.terminate(); };
    w.onerror = () => { w.terminate(); (window.requestIdleCallback || setTimeout)(buildNow); };
  } catch (_) { (window.requestIdleCallback || setTimeout)(buildNow); }
  const wMat = new THREE.PointsMaterial({ size: 1, map: tex, color: 0x9aa8ff, opacity: .55, ...additive });
  web.add(new THREE.Points(wGeo, wMat));

  // level 2 is the hero's galaxy (C.world); the Galactic Center's gamma-ray glow is added to it
  const gc = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xff8a4c, ...additive, opacity: 0 }));
  gc.scale.set(7, 7, 1); world.add(gc);
  const sunLocal = new THREE.Vector3(), Z_AXIS = new THREE.Vector3(0, 0, 1);

  // between the galaxy and Earth: the Solar System, centred on Earth (the Sun 1 AU away)
  const sol = new THREE.Group(); sol.visible = false; scene.add(sol);
  const orbitMat = new THREE.LineBasicMaterial({ color: 0x8f98bf, transparent: true, opacity: 0 }), SUN = new THREE.Vector3(-1, 0, 0);
  for (const a of [.39, .72, 1, 1.52, 5.2, 9.58, 19.2, 30.1]) {   // planetary orbits, AU
    const pts = []; for (let i = 0; i <= 128; i++) { const t = i / 128 * 2 * Math.PI; pts.push(new THREE.Vector3(SUN.x + a * Math.cos(t), a * Math.sin(t), 0)); }
    sol.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), orbitMat));
  }
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xffd78c, ...additive, opacity: 0 }));
  sunGlow.position.copy(SUN); sunGlow.scale.set(.5, .5, 1); sol.add(sunGlow);

  // level 3
  const earth = new THREE.Group(); earth.visible = false; scene.add(earth);
  // the ocean is lit by the Sun (top left of the Earth view), so Earth shows a day and a night side
  const ocean = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.ShaderMaterial({
    uniforms: { sunDir: { value: new THREE.Vector3(-1, 1, 1).normalize() }, opacity: { value: 1 } },
    vertexShader: `varying vec3 vN; void main() { vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 sunDir; uniform float opacity; varying vec3 vN;
      void main() { float d = smoothstep(-.15, .45, dot(normalize(vN), sunDir));   // soft terminator
        gl_FragColor = vec4(mix(vec3(.035, .05, .11), vec3(.16, .27, .62), d), opacity); }`,
    transparent: true }));
  const lGeo = new THREE.BufferGeometry(); lGeo.setAttribute('position', new THREE.BufferAttribute(earthDots(), 3));
  const lMat = new THREE.PointsMaterial({ size: .045, map: tex, color: 0xe2e7ff, transparent: true, depthWrite: false });
  const atmo = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0x3d5cff, ...additive, opacity: .5 })); atmo.scale.set(3.4, 3.4, 1);
  const CERN = [46.23, 6.05], LNGS = [42.45, 13.57];
  // the LHC's 27 km ring, drawn hugely enlarged (3 degrees of arc) so it can be seen
  const ring = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * 2 * Math.PI; ring.push(onSphere(CERN[0] + 3 * Math.sin(a), CERN[1] + 3 * Math.cos(a) / Math.cos(CERN[0] * Math.PI / 180), 1.006)); }
  const lhc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ring), new THREE.LineBasicMaterial({ color: 0xff8a4c, transparent: true }));
  const lab = new THREE.Mesh(new THREE.SphereGeometry(.018, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd78c, transparent: true }));
  lab.position.copy(onSphere(...LNGS, 1.004));
  const land = new THREE.Points(lGeo, lMat);
  atmo.renderOrder = -1; ocean.renderOrder = 0; land.renderOrder = lhc.renderOrder = lab.renderOrder = 1;   // the globe hides the far side's dots
  earth.add(atmo, ocean, land, lhc, lab);
  const earthSun = new THREE.Group(); scene.add(earthSun);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), gr = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    for (let k = 0; k <= 16; k++) { const u = k / 16; gr.addColorStop(u, `rgba(255,255,255,${(Math.exp(-6 * u * u) * (1 - u)).toFixed(4)})`); }   // smooth falloff to exactly 0 at the edge
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512); return new THREE.CanvasTexture(c); })();
  const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb35c, ...additive, opacity: 0 }));
  // a solid bright disc with a short soft edge, so the Sun reads as a Sun rather than a haze
  // drawn at 512 px, so the Sun stays smooth when it is large on screen (4K): a small texture shows banding and blocks
  const disc = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), gr = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    gr.addColorStop(0, '#fffbef'); gr.addColorStop(.5, '#ffe2a0'); gr.addColorStop(.75, 'rgba(255,200,120,.5)'); gr.addColorStop(1, 'rgba(255,170,90,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512); return new THREE.CanvasTexture(c); })();
  // drawn last and not additively, so the wind streaks (in front of it in 3D) don't show through the disc
  const sunCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: disc, transparent: true, depthWrite: false, depthTest: false, opacity: 0 }));
  sunCore.renderOrder = 10;
  sunHalo.scale.set(18, 18, 1); sunCore.scale.set(3, 3, 1); earthSun.add(sunHalo, sunCore);
  const sunNdc = new THREE.Vector3();
  // the dark matter "wind": the Sun moves through the halo at ~230 km/s, so in Earth's frame dark
  // matter streams past from one direction (towards Cygnus); drawn as wind streaks, bright at the head
  // and fading to nothing at the tail, each with its own speed, fading in and out at the edges
  const NW = 180, BOX = 3, windDir = new THREE.Vector3(-.55, .6, -.58).normalize();
  const head = new Float32Array(NW * 3), len = new Float32Array(NW), spd = new Float32Array(NW);
  for (let i = 0; i < NW; i++) { for (let c = 0; c < 3; c++) head[3 * i + c] = (Math.random() - .5) * 2 * BOX; len[i] = .35 + Math.random() * .6; spd[i] = 1.2 + Math.random() * .9; }
  const wPos = new Float32Array(NW * 6), wCol = new Float32Array(NW * 6);
  const windGeo = new THREE.BufferGeometry();
  windGeo.setAttribute('position', new THREE.BufferAttribute(wPos, 3)); windGeo.setAttribute('color', new THREE.BufferAttribute(wCol, 3));
  const windMat = new THREE.LineBasicMaterial({ vertexColors: true, ...additive, opacity: 0 });
  const windPts = new THREE.LineSegments(windGeo, windMat); windPts.visible = false; scene.add(windPts);
  const WC = new THREE.Color(0x8f9cff);
  function blowWind(dt) {
    for (let i = 0; i < NW; i++) {
      let edge = 1;
      for (let c = 0; c < 3; c++) {
        let v = head[3 * i + c] + windDir.getComponent(c) * spd[i] * dt;
        if (v > BOX) v -= 2 * BOX; if (v < -BOX) v += 2 * BOX;
        head[3 * i + c] = v; edge = Math.min(edge, (BOX - Math.abs(v)) / .8);   // fade near the box faces
      }
      const b = Math.max(0, Math.min(1, edge));
      for (let c = 0; c < 3; c++) {
        wPos[6 * i + c] = head[3 * i + c]; wPos[6 * i + 3 + c] = head[3 * i + c] - windDir.getComponent(c) * len[i];
        wCol[6 * i + c] = WC.toArray()[c] * b; wCol[6 * i + 3 + c] = 0;    // head bright, tail dark (invisible when added)
      }
    }
    windGeo.attributes.position.needsUpdate = true; windGeo.attributes.color.needsUpdate = true;
  }

  // HTML labels pinned to 3D points
  // the pill is drawn over the leader line, so a line never crosses the label's text
  const label = (text, cls = '') => { const e = document.createElement('div'); e.className = 'zlabel ' + cls; e.innerHTML = `<span class="pill"><i></i>${text}</span>`; labelsEl.append(e); return e; };
  const L = { sun: label('Sun'), gc: label('Galactic Center', 'hot'), halo: label('dark matter halo', 'dm'),
    sol: label('Sun'), earthSol: label('Earth', 'dm'), earthSun: label('Sun'),
    lhc: label('LHC, CERN', 'hot'), lab: label('underground detectors, Gran Sasso'), wind: label('<svg class="warrow" width="26" height="12" viewBox="0 0 26 12"><path d="M1 6H23M17 1.5L23.5 6L17 10.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg> dark matter wind, ~230 km/s', 'dm') };
  const windArrow = L.wind.querySelector('.warrow'), wa = new THREE.Vector3(), wb = new THREE.Vector3();
  const tmp = new THREE.Vector3(); let pinFresh = false;
  // Labels don't follow the camera once shown: each tracks its target only while fading in (the zoom
  // is still settling), then stays put on screen until it fades out (the camera barely drifts at a stop)
  // off = [dx, dy]: place the label that far from its target, with a thin leader line back to it
  function pin(el, obj, local, alpha, off, track) {
    if (alpha <= .01) { el.style.opacity = 0; el._at = null; el._fixed = false; return; }
    if (!el._at || !el._fixed || track) {
      if (!pinFresh) { scene.updateMatrixWorld(); camera.updateMatrixWorld(); pinFresh = true; }
      tmp.copy(local); obj.localToWorld(tmp); tmp.project(camera);
      if (tmp.z >= 1) { el.style.opacity = 0; return; }
      // in the label layer's own coordinates (it and the canvas need not share an origin)
      const cr = canvas.getBoundingClientRect(), lr = labelsEl.getBoundingClientRect();
      el._at = [cr.left - lr.left + (tmp.x + 1) / 2 * cr.width, cr.top - lr.top + (1 - tmp.y) / 2 * cr.height];
      const tgt = el._at.slice();
      if (off) { el._at[0] += off[0]; el._at[1] += off[1]; }
      // keep the whole label on screen (and clear of the card where it sits under the scene)
      const W = lr.width, H = lr.height, stacked = W <= 760 || (H > W && W <= 1100);
      if (!el._bw) { el.style.transform = 'none'; el._bw = el.offsetWidth; el._bh = el.offsetHeight; }   // measured once
      const bw = el._bw, bh = el._bh;
      el._at[0] = Math.max(12, Math.min(W - bw - 6, el._at[0]));
      el._at[1] = Math.max(70, Math.min((stacked ? H * .62 : H - 40) - bh, el._at[1]));
      const dx = tgt[0] - el._at[0], dy = tgt[1] - el._at[1], len = Math.hypot(dx, dy) - 9;   // leader stops just short of the target
      let ld = el.querySelector('.lead');
      if ((off || len > 30) && len > 6) {
        if (!ld) { ld = document.createElement('b'); ld.className = 'lead'; el.prepend(ld); }
        ld.style.display = ''; ld.style.width = `${len}px`; ld.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
      } else if (ld) ld.style.display = 'none';
      el._fixed = alpha > .97;
      el.style.transform = `translate3d(${el._at[0].toFixed(1)}px, ${el._at[1].toFixed(1)}px, 0)`;
    }
    el.style.opacity = alpha;
  }


  // the zoom-out (p up to P_OUT) happens while the hero scrolls away; the rest over the research section
  const P_OUT = ZKEYS[1][0], hero = $('#top'), cosmosEl = $('#cosmos');
  const progress = () => {
    if (forced !== null) return +forced;
    const y = -cosmosEl.getBoundingClientRect().top, h = hero.offsetHeight;
    if (y < h) return Math.max(0, y / h) * P_OUT;
    const r = zoom.getBoundingClientRect();
    return P_OUT + (1 - P_OUT) * Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
  };
  // Stops: when scrolling ends between two of them, glide on to the next one in the direction of
  // travel (hero, cosmic web, galaxy, Earth, then the next section, after which scrolling is free)
  const STOPS_P = [0, .21, .51, .87];
  const pageY = el => el.getBoundingClientRect().top + scrollY;
  const yOf = p => {                              // inverse of progress(), in page pixels
    const top = pageY(cosmosEl), h = hero.offsetHeight;
    return p <= P_OUT ? top + p / P_OUT * h : top + h + (p - P_OUT) / (1 - P_OUT) * (zoom.offsetHeight - innerHeight);
  };
  // ---- scroll controller for the zoom (from the hero to the start of the next section) ----
  // Inside this zone it drives the scroll itself, so it can tell a flick from a hold:
  //  - trackpad / touch: the page follows the fingers 1:1; released with speed (a flick, or the OS's
  //    momentum stream, recognised by its steadily shrinking deltas) it glides on to the next stop,
  //    starting at the gesture's own speed and easing to rest, with no pause in between;
  //    released still (held, then lifted) it stays if near a stop, else eases to the next one
  //  - mouse wheel: each notch glides one stop
  //  - scrollbar or keys: when they stop, it eases to the next stop in their direction
  // Any new input during a glide hands control straight back. Outside the zone scrolling is native.
  const NEAR = () => innerHeight * .35;             // within this of a stop, the page may rest anywhere
  // measured once, and again only when the page's size changes (each measurement forces a layout)
  let stopsCache = null;
  const stopsY = () => stopsCache || (stopsCache = [...STOPS_P.map(yOf), pageY($('#now'))]);
  new ResizeObserver(() => { stopsCache = null; }).observe(document.body);
  const inZone = (y, d) => { const st = stopsY(); return !(y >= st[st.length - 1] - 1 && d > 0) && !(y <= st[0] + 1 && d < 0) && y < st[st.length - 1] + 1; };
  const nextStop = (y, d) => { const st = stopsY(); return d > 0 ? st.find(v => v > y + 2) : [...st].reverse().find(v => v < y - 2); };
  const nearStop = y => stopsY().find(v => Math.abs(v - y) < NEAR());
  let glide = null, lastDir = 1;
  const own = { y: null };                         // the scroll position we set ourselves
  const go = y => { own.y = Math.round(y); scrollTo({ top: own.y, behavior: 'instant' }); };
  // cubic Hermite from (y0, v0) to (y1, 0): starts at the gesture's speed, ends at rest
  function glideTo(y1, v0 = 0) {
    stopGlide();
    const y0 = scrollY, d = y1 - y0;
    if (Math.abs(d) < 1) return;
    if (v0 * d < 0) v0 = 0;                       // never start by moving away from the target
    const T = Math.max(900, Math.min(1800, Math.abs(d) * 1.4 + 500, v0 ? 2.6 * Math.abs(d / v0) : 1e9));
    // a starting speed above 2.5 d / T would carry the curve past the stop and back: cap it there
    if (Math.abs(v0) * T > 2.5 * Math.abs(d)) v0 = Math.sign(v0) * 2.5 * Math.abs(d) / T;
    let t0 = null;
    const step = now => {
      if (t0 === null) t0 = now;
      const u = Math.min(1, (now - t0) / T), u2 = u * u, u3 = u2 * u;
      go((2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * T * v0 + (-2 * u3 + 3 * u2) * y1);
      glide = u < 1 ? requestAnimationFrame(step) : null;
    };
    glide = requestAnimationFrame(step);
  }
  function stopGlide() { if (glide) { cancelAnimationFrame(glide); glide = null; } }
  function release(v) {                            // v: px per ms at release
    const y = scrollY, d = Math.abs(v) > .02 ? Math.sign(v) : lastDir;
    const land = y + v * 325, next = nextStop(y, d);   // where the gesture's own momentum would come to rest
    if (next !== undefined && (land - next) * d >= 0) { glideTo(next, v); return; }   // never past the next stop
    if (nearStop(land) !== undefined) {            // still within a stop's zone: just coast there and rest
      if (Math.abs(land - y) > 2) glideTo(land, v);
      return;
    }
    if (next !== undefined) glideTo(next, Math.abs(v) > .25 ? v : 0);   // otherwise on to the next stop
  }
  if (forced === null) {
    // wheel and trackpad
    let w = [], wIdle = 0, momentumTaken = false, lastEv = null;   // lastEv: the latest wheel event, recorded or not
    // leave scrolling alone while the CV (or any other dialog) is open: it scrolls itself
    const busy = e => document.querySelector('dialog[open]') || e.target.closest?.('dialog');
    addEventListener('wheel', e => {
      if (e.ctrlKey || busy(e)) return;            // pinch zoom, or the CV
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      if (!inZone(scrollY, dy)) { stopGlide(); return; }
      e.preventDefault();
      const now = performance.now(), prev = lastEv; lastEv = { t: now, dy };
      const fresh = !prev || now - prev.t > 140 || Math.abs(dy) > Math.abs(prev.dy) * 1.25 + 2 || Math.sign(dy) !== Math.sign(prev.dy);
      if (glide && !fresh) return;                 // the momentum tail of a gesture we've taken over
      // any new input (a pause, a speed-up or a change of direction) is the user again: hand back fully
      if (fresh) { stopGlide(); w = []; momentumTaken = false; }
      if (momentumTaken) return;                   // the rest of a momentum tail, after its glide ended
      w.push({ t: now, dy }); if (w.length > 8) w.shift();
      lastDir = Math.sign(dy) || lastDir;
      // a mouse wheel: big, whole-notch steps with gaps between them
      if (e.deltaMode === 1 || (Math.abs(dy) >= 100 && Number.isInteger(e.deltaY) && w.length === 1)) {
        const t = nextStop(scrollY, Math.sign(dy)); if (t !== undefined) glideTo(t, 0); momentumTaken = true; return;
      }
      go(scrollY + dy);
      // the OS's momentum: a clean run of closely spaced events, each a few per cent smaller than the
      // last (a finger slowing down is far noisier than this)
      const n = w.length;
      if (n >= 5 && w.slice(-5).every((s, k, a) => !k || (Math.abs(s.dy) <= Math.abs(a[k - 1].dy) * .97 && s.t - a[k - 1].t < 40))) {
        const dt = Math.max(8, (w[n - 1].t - w[n - 4].t) / 3), v = w.slice(-3).reduce((a, s) => a + s.dy, 0) / 3 / dt;
        momentumTaken = true; release(v); return;
      }
      clearTimeout(wIdle);
      // events stopped with no momentum stream: the fingers were held still, then lifted
      wIdle = setTimeout(() => { if (!momentumTaken && !glide) release(0); }, 140);
    }, { passive: false });

    // touch
    let tp = null;
    addEventListener('touchstart', e => { stopGlide(); tp = e.touches.length === 1 && !busy(e) ? { y: e.touches[0].clientY, s: [] } : null; }, { passive: true });
    addEventListener('touchmove', e => {
      if (!tp) return;
      const cy = e.touches[0].clientY, dy = tp.y - cy;
      if (!inZone(scrollY, dy)) { tp.y = cy; return; }
      e.preventDefault(); tp.y = cy; go(scrollY + dy);
      lastDir = Math.sign(dy) || lastDir;
      tp.s.push({ t: performance.now(), y: scrollY }); if (tp.s.length > 6) tp.s.shift();
    }, { passive: false });
    addEventListener('touchend', () => {
      if (!tp || tp.s.length < 2) { tp = null; return; }
      const a = tp.s[0], b = tp.s[tp.s.length - 1], stale = performance.now() - b.t > 80;
      tp = null; release(stale ? 0 : (b.y - a.y) / Math.max(8, b.t - a.t));
    }, { passive: true });

    // anything else that scrolls (scrollbar, keys, links): settle once it stops
    let sIdle = 0, sLast = scrollY;
    addEventListener('scroll', () => {
      if (own.y !== null && Math.abs(scrollY - own.y) < 2) return;   // our own movement
      own.y = null; if (glide) return;
      const d = scrollY - sLast; if (Math.abs(d) > 1) lastDir = Math.sign(d); sLast = scrollY;
      clearTimeout(sIdle);
      sIdle = setTimeout(() => { if (!glide && !tp && inZone(scrollY, 0)) release(0); }, 260);
    }, { passive: true });
    for (const ev of ['keydown', 'pointerdown']) addEventListener(ev, stopGlide, { passive: true });
  }

  let pS = progress(), t = 0, wasZooming = false, snapped = false;
  const fmtZ = z => `10<sup>${Math.round(z)}</sup> m`;

  // runs inside the hero's frame loop, just before it draws
  C.hooks.push(dt => {
    pinFresh = false;
    const p = progress(); pS += (p - pS) * Math.min(1, dt * 7); if (Math.abs(p - pS) < 1e-4) pS = p;
    const zooming = pS > 1e-3;
    C.zooming = zooming;
    if (!zooming) {
      if (wasZooming) {                           // hand the view back to the hero, exactly as it was
        world.scale.setScalar(1); world.position.set(0, 0, 0); world.visible = true; C.place(); C.resize();
        C.sMat.size = C.starSize(); C.gMat.size = C.gasSize; C.sMat.opacity = .6; C.gMat.opacity = .13;
        web.visible = sol.visible = earth.visible = windPts.visible = earthSun.visible = false; gc.material.opacity = 0;
        C.setSpeed(1); snapped = false;
        for (const e of Object.values(L)) e.style.opacity = 0;
      }
      wasZooming = false; return;
    }
    if (!wasZooming) { C.setHalo(true); C.setSpeed(.08); if (!webReady) buildNow(); }   // galaxy intact and almost still; the web built
    wasZooming = true; t += dt;
    const z = zAt(pS), s = u => u * HALF / 10 ** z, hv = C.view();
    // while the galaxy is a dot inside the cosmic web, quietly reset it to the snapshot, so it
    // arrives at its stop with the simulation's sharpest arms
    if (!snapped && z > 23) { C.resetToSnapshot(); snapped = true; }

    // camera: from the hero's angle and held still (so labels stay on their targets); flatter for the web and Earth
    const az = hv.az, el = hv.el + (.32 - hv.el) * smooth(21.2, 23.4, z) + (.3 - hv.el) * smooth(11, 8.5, z);
    camera.position.set(DIST * Math.cos(el) * Math.sin(az), -DIST * Math.cos(el) * Math.cos(az), DIST * Math.sin(el));
    camera.up.set(0, 0, 1); camera.lookAt(0, 0, 0);
    // phones and portrait tablets stack the card under the scene, so raise the scene; else keep the hero's framing
    const cw = canvas.clientWidth, ch = canvas.clientHeight, stacked = cw <= 760 || (ch > cw && cw <= 1100);
    if (stacked) camera.setViewOffset(cw, ch, 0, ch * .17 * smooth(0, P_OUT, pS), cw, ch);   // raised gradually during the zoom-out
    else if (cw > 860) camera.setViewOffset(cw, ch, -cw * .18, 0, cw, ch); else camera.clearViewOffset();   // as the hero
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();   // so this frame's projections use it

    // level 1
    const aWeb = smooth(21.4, 22.7, z);   // in early, so the web surrounds the galaxy as it shrinks
    web.visible = aWeb > .003;
    if (web.visible) { const k = s(M_PER.web); web.scale.setScalar(k); web.rotation.z = .02 * t; wMat.size = Math.min(1.4 * k, .9); wMat.opacity = .55 * aWeb; }   // capped, so the points don't balloon

    // level 2: the hero's galaxy
    const aGal = (1 - smooth(23.0, 23.7, z)) * smooth(16.5, 18.6, z);
    world.visible = aGal > .003;
    if (world.visible) {
      const k = s(M_PER.gal), f = smooth(...SUN_AT, pS);
      // the Sun turns with the disk (the zoom shows the galaxy turning, almost still), so it keeps its place among the arms
      sunLocal.set(...C.sun0).applyAxisAngle(Z_AXIS, C.disk.rotation.z);
      world.scale.setScalar(k); world.position.copy(sunLocal).multiplyScalar(-k * f);   // keep the focus (centre, then Sun) in view
      C.sMat.size = C.starSize() * k; C.gMat.size = C.gasSize * k; C.sMat.opacity = .6 * aGal; C.gMat.opacity = .13 * aGal;
      C.fog.uniforms.glow.value *= aGal * (1 + .4 * smooth(.42, .46, pS));
      gc.material.opacity = .9 * aGal * smooth(.42, .46, pS) * (1 - smooth(.6, .63, pS));
    }
    const stop2 = aGal * smooth(.42, .46, pS) * (1 - smooth(.6, .63, pS));
    pin(L.sun, world, sunLocal, stop2, [-40, 44], true); pin(L.gc, world, new THREE.Vector3(0, 0, 0), stop2, [46, -58]); pin(L.halo, world, new THREE.Vector3(9, 13, 4), stop2);

    // the Solar System
    const aSol = (1 - smooth(13.6, 15.5, z)) * smooth(9.6, 11.2, z);
    sol.visible = aSol > .003;
    if (sol.visible) { sol.scale.setScalar(s(M_PER.sol)); orbitMat.opacity = .5 * aSol; sunGlow.material.opacity = aSol; }
    pin(L.sol, sol, SUN, aSol); pin(L.earthSol, sol, new THREE.Vector3(), aSol * (1 - smooth(10.8, 11.6, z)));

    // level 3
    const aE = 1 - smooth(9.2, 11.5, z);
    earth.visible = aE > .003;
    if (earth.visible) {
      const k = s(M_PER.earth); earth.scale.setScalar(k);
      // turn Europe (CERN, Gran Sasso) towards the camera with north up: map the frame
      // (Europe, north, east) onto (towards camera, up, right)
      const frameOf = (a, up) => { const b = up.clone().addScaledVector(a, -up.dot(a)).normalize(); return new THREE.Matrix4().makeBasis(a, b, a.clone().cross(b)); };
      const Z = new THREE.Vector3(0, 0, 1), from = frameOf(onSphere(44, 10), Z), to = frameOf(camera.position.clone().normalize(), Z);
      earth.quaternion.setFromRotationMatrix(to.multiply(from.transpose()));
      ocean.material.uniforms.opacity.value = aE; lMat.opacity = aE; lMat.size = .045 * k; atmo.material.opacity = .45 * aE;
      lhc.material.opacity = lab.material.opacity = aE * smooth(.74, .78, pS);
      // the Sun, seen above and left of Earth, placed beside it and a little towards us, so the
      // face we see is mostly in daylight with the terminator across it
      const st = canvas.clientWidth <= 760 || (canvas.clientHeight > canvas.clientWidth && canvas.clientWidth <= 1100);
      sunNdc.set(st ? -.62 : -.06, st ? .86 : .74, .5).unproject(camera).sub(camera.position).normalize();   // above Earth's left, clear of the cards (top left corner when stacked)
      earthSun.position.copy(camera.position).addScaledVector(sunNdc, 52);
      ocean.material.uniforms.sunDir.value.copy(earthSun.position).normalize();
    }
    earthSun.visible = earth.visible; sunHalo.material.opacity = .55 * aE * smooth(.72, .78, pS); sunCore.material.opacity = aE * smooth(.72, .78, pS);
    pin(L.earthSun, scene, earthSun.position, aE * smooth(.74, .78, pS), [-70, 50]);
    const aWind = aE * smooth(.74, .78, pS);
    windPts.visible = aWind > .003;
    if (windPts.visible) { windMat.opacity = .6 * aWind; windPts.scale.setScalar(s(M_PER.earth)); blowWind(dt); }
    pin(L.lhc, earth, onSphere(...CERN, 1.006), aWind, [-82, -46]); pin(L.lab, earth, onSphere(...LNGS, 1.004), aWind, [44, 40]);
    // the label sits upwind, where the streaks come from, with an arrow turned to the streaks' direction
    pin(L.wind, scene, windDir.clone().multiplyScalar(-1.25 * s(M_PER.earth)), aWind); if (aWind <= .01) windArrow._set = false;
    if (aWind > .01 && !windArrow._set) {
      windArrow._set = aWind > .97;
      wa.set(0, 0, 0).project(camera); wb.copy(windDir).multiplyScalar(s(M_PER.earth)).project(camera);
      const ang = Math.atan2(-(wb.y - wa.y) * canvas.clientHeight, (wb.x - wa.x) * canvas.clientWidth);
      windArrow.style.transform = `rotate(${ang}rad)`;
    }

    // cards and the scale readout
    for (const c of cards) {
      const o = c.at[0] <= 0 ? 1 - smooth(c.at[1] - .025, c.at[1], pS) : window_(pS, ...c.at);
      if (Math.abs(o - (c.o ?? -1)) < .002) continue;   // unchanged: no restyle
      c.o = o; c.el.style.opacity = o; c.el.style.setProperty('--dy', `${(1 - o) * (pS < (c.at[0] + c.at[1]) / 2 ? 24 : -24)}px`);
    }
    const lvl = z > 22.6 ? 'the cosmic web' : z > 19.5 ? 'the Milky Way' : z > 11.5 && z < 14 ? 'the Solar System' : z < 9 ? 'Earth' : '';
    const sc = `${fmtZ(z)}<small>${lvl || 'zooming'}</small>`;
    if (sc !== scaleEl._html) scaleEl.innerHTML = scaleEl._html = sc;
  });
}

// the hero galaxy (galaxy3d.js) loads first; start once its scene exists
if (window.cosmos3d) start(); else addEventListener('cosmos-ready', start, { once: true });
