/* Hero galaxy from a real simulation: FIRE-2 m12i at z = 0, built by galaxy-build/extract_m12i.py:
   60k star particles sampled by FSPS light, 25k cold gas particles, and the dark matter as a
   ray-marched density volume whose texture churns with the halo's measured velocity dispersion
   and rotation.
   With the halo on, the arm pattern turns at a fixed pattern speed and each star and gas particle
   moves about its place in it: its real velocity relative to the pattern, bounded into an epicycle
   at the local epicyclic frequency. This keeps the arms (an artistic simplification: free orbits in
   a smooth potential would wind them up) while every particle still visibly moves.
   With the halo off, they are released onto orbits in the stars + gas mass alone. Drag to rotate. */
import * as THREE from 'three';
import { loadGalaxy, dotTexture, makeFog } from './galaxy-data.js?v=1';

const G = 4.30091e-6;              // kpc (km/s)^2 / Msun
const KPC_PER_KMS_MYR = 1 / 977.8; // 1 km/s for 1 Myr, in kpc
const MYR_PER_SEC = 15;            // simulated time per real second
const PATTERN_SPEED = 25;          // km/s/kpc; the arm pattern's turning with the halo on (~ the Milky Way's spiral pattern speed)
const MAX_EPI_STARS = 2.5, MAX_EPI_GAS = 1.0;   // kpc; caps on epicycle size (fast halo stars; keep the gas arms crisp)
const FLOW_PERIOD = 30;            // Myr; the fog texture's drift restarts on this cycle (two offset phases, crossfaded)
const DM_GLOW = .07;               // dark matter fog brightness per kpc of path
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = s => document.querySelector(s);
const hero = $('.hero'), toyCanvas = $('#gal'), hb = $('#halo'), rc = $('#rc');

// enclosed mass M(<r), linear interpolation in r on the extraction's log grid
function massTable(p, withDM) {
  const r = Float64Array.from(p.r), m = r.map((_, i) => p.star[i] + p.gas[i] + (withDM ? p.dm[i] : 0));
  return x => {
    if (x <= r[0]) return m[0] * (x / r[0]) ** 3;
    if (x >= r[r.length - 1]) return m[m.length - 1];
    let lo = 0, hi = r.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (r[mid] > x) hi = mid; else lo = mid; }
    return m[lo] + (m[hi] - m[lo]) * (x - r[lo]) / (r[hi] - r[lo]);
  };
}

function drawRotationCurve(prof) {
  rc.replaceChildren();
  const NS = 'http://www.w3.org/2000/svg', mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const X = r => 34 + r / 25 * 196, Y = v => 122 - v / 300 * 112, ax = (x1, y1, x2, y2) => rc.append(mk('line', { x1, y1, x2, y2, class: 'ax' }));
  const txt = (x, y, s, a = {}) => { const t = mk('text', { x, y, ...a }); t.textContent = s; rc.append(t); return t; };
  ax(34, 122, 230, 122); ax(34, 122, 34, 8);
  [0, 10, 20].forEach(r => { ax(X(r), 122, X(r), 125); txt(X(r), 135, r, { 'text-anchor': 'middle' }); });
  [0, 100, 200, 300].forEach(v => { ax(31, Y(v), 34, Y(v)); txt(28, Y(v) + 3, v, { 'text-anchor': 'end' }); });
  txt(230, 148, 'radius (kpc)', { 'text-anchor': 'end' }); txt(38, 6, 'circular speed (km/s)');
  const mTot = massTable(prof, true), mBar = massTable(prof, false);
  let pt = '', pv = '';
  for (let i = 1; i <= 100; i++) {
    const r = i * .25;
    pt += (i > 1 ? 'L' : 'M') + X(r).toFixed(1) + ' ' + Y(Math.sqrt(G * mTot(r) / r)).toFixed(1);
    pv += (i > 1 ? 'L' : 'M') + X(r).toFixed(1) + ' ' + Y(Math.sqrt(G * mBar(r) / r)).toFixed(1);
  }
  const tot = mk('path', { d: pt, class: 'tot' }), vis = mk('path', { d: pv, class: 'vis' });
  rc.append(vis, tot);
  const lt = txt(X(25), Y(Math.sqrt(G * mTot(25) / 25)) - 8, 'stars + gas + dark matter', { 'text-anchor': 'end' }); lt.style.fill = '#93A2FF';
  const lv = txt(X(25), Y(Math.sqrt(G * mBar(25) / 25)) + 14, 'stars + gas only', { 'text-anchor': 'end' }); lv.style.fill = '#FF8A4C';
  return { tot, lt };
}

async function start() {
  const canvas = document.createElement('canvas');
  canvas.id = 'gal3d';
  canvas.setAttribute('aria-label', 'Simulated Milky Way-mass galaxy (FIRE-2 m12i) in 3D; drag to rotate');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' }); }
  catch (_) { return; } // no WebGL: the toy galaxy stays
  const { meta, sp, sv, gp, gv, rgb, dmVol } = await loadGalaxy();

  window.toyGalaxy?.stop();
  const stage = $('#cosmos-stage') || hero;   // the stage shared with the research zoom (zoom3d.js)
  stage.append(canvas); hero.classList.add('sim');
  $('.ctrl p').textContent = `A simulated Milky Way-mass galaxy (FIRE-2 m12i): ${meta.nStars.toLocaleString('en')} star particles picked and coloured by their light, ` +
    'cold gas in pink, the density of dark matter as blue fog.';
  $('#galaxy-credit').innerHTML = 'The galaxy above is the FIRE-2 m12i simulation (<a href="https://ui.adsabs.harvard.edu/abs/2016ApJ...827L..23W/abstract">Wetzel et al. 2016</a>), ' +
    'downsampled from the <a href="https://flathub.flatironinstitute.org/fire">FIRE-2 public data release</a> (Wetzel et al. 2023, 2025; CC BY 4.0). ' +
    'Star light from <a href="https://github.com/cconroy20/fsps">FSPS</a> (Conroy et al. 2009, 2010) at each particle\'s age and metallicity, without dust. ' +
    'With the halo on, the arm pattern turns at a fixed pattern speed while each star and gas cloud moves about its place in it, an artistic simplification that keeps the arms; ' +
    'switching the halo off releases the stars and gas onto orbits in a spherical approximation of the stars and gas mass alone. ' +
    'The dark matter fog churns at the halo\'s measured velocity dispersion.';
  renderer.setClearColor(0x04060e, 1);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(20, 1, .1, 2000);
  const world = new THREE.Group(); scene.add(world);
  const disk = new THREE.Group(); world.add(disk);   // stars + gas; turned rigidly while the halo is on
  const tex = dotTexture();

  // stars
  const ns = meta.nStars, pos = Float32Array.from(sp), vel = Float32Array.from(sv);
  // stars were sampled in proportion to their light, so each point gets the same brightness;
  // its colour is its own FSPS (i, r, g) flux ratio
  const col = new Float32Array(ns * 3);
  for (let i = 0; i < ns * 3; i++) col[i] = rgb[i] / 255 * meta.colorScale * .3;
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  sGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const sMat = new THREE.PointsMaterial({ size: .16, map: tex, vertexColors: true, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending });
  disk.add(new THREE.Points(sGeo, sMat));

  // cold gas (T < 2e4 K) in the disk: soft pink, like the glow of star-forming gas
  const ng = meta.nGas, gpos = Float32Array.from(gp), gvel = Float32Array.from(gv);
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(gpos, 3));
  const gMat = new THREE.PointsMaterial({ size: .9, map: tex, color: 0xff5f8f, transparent: true, opacity: .13, depthWrite: false, blending: THREE.AdditiveBlending });
  disk.add(new THREE.Points(gGeo, gMat));

  // dark matter as a glowing fog (galaxy-data.js)
  const fog = makeFog(meta, dmVol, { glow: DM_GLOW, flowPeriod: FLOW_PERIOD }), dMat = fog.material;
  world.add(fog);
  // The fog is the costliest thing to draw (a 64-step ray march per pixel) and it is soft anyway, so
  // it is drawn at half resolution into its own image (layer 1) and added over the scene, smoothed.
  fog.layers.set(1);
  const fogRT = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
  const fogQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { t: { value: fogRT.texture } },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform sampler2D t; varying vec2 vUv; void main() { gl_FragColor = texture2D(t, vUv); }',
    blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true,
  }));
  const fogScene = new THREE.Scene(), fogCam = new THREE.Camera(); fogScene.add(fogQuad);

  const inset = drawRotationCurve(meta.profile);
  const mWith = massTable(meta.profile, true), mWithout = massTable(meta.profile, false);

  // epicycles about the turning pattern: amplitude = (velocity relative to the pattern) / kappa,
  // with kappa = sqrt(2) v_c / R (flat-rotation-curve epicyclic frequency), in rad per Myr
  // each particle starts at a random point of its epicycle: with a common start, all particles at
  // one radius would oscillate in step and ripple out as rings around the centre
  function epicycles(P, V, n, cap) {
    const amp = new Float32Array(n * 3), kap = new Float32Array(n), phase = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = P[3 * i], y = P[3 * i + 1], R = Math.max(.5, Math.hypot(x, y)), r = Math.max(.5, Math.hypot(x, y, P[3 * i + 2]));
      const k = Math.SQRT2 * Math.sqrt(G * mWith(r) / r) / R;
      const rel = [V[3 * i] + PATTERN_SPEED * y, V[3 * i + 1] - PATTERN_SPEED * x, V[3 * i + 2]];
      const m = Math.hypot(...rel) / k, f = m > cap ? cap / m : 1;
      for (let j = 0; j < 3; j++) amp[3 * i + j] = rel[j] / k * f;
      kap[i] = k / 977.8; phase[i] = Math.random() * 2 * Math.PI;
    }
    return { amp, kap, phase };
  }
  const sEpi = epicycles(sp, sv, ns, MAX_EPI_STARS), gEpi = epicycles(gp, gv, ng, MAX_EPI_GAS);
  let tEpi = 0;
  // where each particle sits at tEpi = 0: the target of the glide back after the halo returns
  const at0 = (P0, E, n) => P0.map((x, i) => x + E.amp[i] * Math.sin(E.phase[(i / 3) | 0]));
  const sp0 = at0(sp, sEpi, ns), gp0 = at0(gp, gEpi, ng);
  // The epicycles run on the GPU: the position buffers hold the snapshot and the vertex shader adds
  // amp * sin(kappa t + phase), so nothing is recomputed or re-uploaded per frame. The CPU only moves
  // the particles itself while the halo is off (or gliding back), and then the shader's offset is off.
  const epi = { t: { value: 0 }, on: { value: 1 } };
  for (const [geo, E] of [[sGeo, sEpi], [gGeo, gEpi]]) {
    geo.setAttribute('epiAmp', new THREE.BufferAttribute(E.amp, 3));
    geo.setAttribute('epiK', new THREE.BufferAttribute(E.kap, 1));
    geo.setAttribute('epiPh', new THREE.BufferAttribute(E.phase, 1));
  }
  for (const m of [sMat, gMat]) m.onBeforeCompile = sh => {
    sh.uniforms.epiT = epi.t; sh.uniforms.epiOn = epi.on;
    sh.vertexShader = 'attribute vec3 epiAmp; attribute float epiK; attribute float epiPh; uniform float epiT; uniform float epiOn;\n' +
      sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  transformed += epiAmp * sin(epiK * epiT + epiPh) * epiOn;');
  };
  let dirty = false;                               // CPU positions changed: upload them
  const useGpuEpicycles = () => { pos.set(sp); gpos.set(gp); epi.on.value = 1; dirty = true; };
  useGpuEpicycles();
  function placeEpicycles() {                      // the same offsets on the CPU, when handing over to it
    for (const [P, P0, E, n] of [[pos, sp, sEpi, ns], [gpos, gp, gEpi, ng]])
      for (let i = 0; i < n; i++) {
        const sn = Math.sin(E.kap[i] * tEpi + E.phase[i]);
        P[3 * i] = P0[3 * i] + E.amp[3 * i] * sn; P[3 * i + 1] = P0[3 * i + 1] + E.amp[3 * i + 1] * sn; P[3 * i + 2] = P0[3 * i + 2] + E.amp[3 * i + 2] * sn;
      }
  }
  let halo = true, haloA = 1, reset = 0;

  // the Sun: 8.2 kpc out in the disk plane, on a circular orbit in the same direction as the disk,
  // placed on the side facing the camera; it is integrated with the stars below
  const R_SUN = 8.2, vSun = Math.sqrt(G * mWith(R_SUN) / R_SUN), th0 = -2.2;
  const sun0 = [R_SUN * Math.cos(th0), R_SUN * Math.sin(th0), 0], sunV0 = [-vSun * Math.sin(th0), vSun * Math.cos(th0), 0];
  const sunP = sun0.slice(), sunV = sunV0.slice();
  // (the hero shows no Sun marker; the research zoom labels it "you are here" and dives from it to Earth)
  hb.onclick = () => {
    halo = !halo; hb.setAttribute('aria-checked', halo);
    inset.tot.style.opacity = halo ? 1 : .25; inset.lt.style.opacity = halo ? 1 : .35;
    if (halo) { reset = 1; tEpi = 0; } // glide the stars back to the snapshot, then resume turning
    else {               // release: bake the epicycles and the disk's current turn into positions and velocities
      if (epi.on.value) { placeEpicycles(); epi.on.value = 0; }
      const c = Math.cos(disk.rotation.z), s = Math.sin(disk.rotation.z);
      for (const [P, V, n] of [[pos, vel, ns], [gpos, gvel, ng]]) for (let i = 0; i < n * 3; i += 3) {
        const x = P[i], y = P[i + 1], vx = V[i], vy = V[i + 1];
        P[i] = c * x - s * y; P[i + 1] = s * x + c * y; V[i] = c * vx - s * vy; V[i + 1] = s * vx + c * vy;
      }
      disk.rotation.z = 0;
    }
    if (RM) { haloA = halo ? 1 : 0; dMat.uniforms.glow.value = DM_GLOW * haloA; draw(); }
  };

  // camera: drag to rotate around the galaxy; starts inclined like the toy
  let az = -.4, el = .8, dist = 64;
  const place = () => {
    camera.position.set(dist * Math.cos(el) * Math.sin(az), dist * Math.cos(el) * Math.cos(az) * -1, dist * Math.sin(el));
    camera.up.set(0, 0, 1); camera.lookAt(0, 0, 0);
  };
  let drag = null;
  canvas.addEventListener('pointerdown', e => { if (cosmos.zooming) return; drag = [e.clientX, e.clientY, az, el]; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!drag || cosmos.zooming) return;
    az = drag[2] - (e.clientX - drag[0]) * .006;
    el = Math.max(-1.45, Math.min(1.45, drag[3] + (e.clientY - drag[1]) * .006));
    place(); if (RM) draw();
  });
  const end = () => { drag = null; };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

  function size() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    // at most ~3.5 million pixels: sharp on retina laptops, and 4K screens don't render 30 million
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2, Math.sqrt(3.5e6 / (w * h)))); renderer.setSize(w, h, false);
    const pr = renderer.getPixelRatio(); fogRT.setSize(Math.max(1, Math.round(w * pr / 2)), Math.max(1, Math.round(h * pr / 2)));
    camera.aspect = w / h;
    // on wide screens put the galaxy on the right, clear of the name, like the toy did
    if (w > 860) camera.setViewOffset(w, h, -w * .18, 0, w, h); else camera.clearViewOffset();
    sMat.size = w > 860 ? .3 : .34;
    camera.updateProjectionMatrix(); draw();
  }

  // leapfrog in the spherical enclosed-mass profile
  // units: kpc, km/s; one time unit is 1 kpc/(km/s) = 977.8 Myr
  function kickDrift(p, v, n, M, h) {
    for (let i = 0; i < n; i += 3) {
      const x = p[i], y = p[i + 1], z = p[i + 2], r2 = x * x + y * y + z * z + .01, r = Math.sqrt(r2);
      if (r > 120) continue; // escaped once the halo was removed; leave it be
      const a = -G * M(r) / (r2 * r) * h;
      v[i] += a * x; v[i + 1] += a * y; v[i + 2] += a * z;
      p[i] += v[i] * h; p[i + 1] += v[i + 1] * h; p[i + 2] += v[i + 2] * h;
    }
  }
  function step(dtMyr) {
    const subs = Math.ceil(dtMyr / .5), h = dtMyr / subs * KPC_PER_KMS_MYR, M = halo ? mWith : mWithout;
    for (let s = 0; s < subs; s++) {
      if (!halo) { kickDrift(pos, vel, ns * 3, M, h); kickDrift(gpos, gvel, ng * 3, M, h); }
      kickDrift(sunP, sunV, 3, M, h);   // the Sun always follows its own orbit
    }
  }

  function draw() {
    renderer.render(scene, camera);                 // everything but the fog
    let fogOn = dMat.uniforms.glow.value > 1e-4; for (let o = fog; o && fogOn; o = o.parent) fogOn = o.visible;
    if (!fogOn) return;
    renderer.setRenderTarget(fogRT); renderer.setClearColor(0x000000, 0);
    camera.layers.set(1); renderer.render(scene, camera); camera.layers.set(0);
    renderer.setRenderTarget(null); renderer.setClearColor(0x04060e, 1);
    renderer.autoClear = false; renderer.render(fogScene, fogCam); renderer.autoClear = true;
  }

  let last = 0, raf = 0, vis = true, speed = 1;
  function loop(ts) {
    const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts;
    if (reset > 0) {
      reset = Math.max(0, reset - dt * 1.2);
      const f = 1 - reset;
      const k = Math.min(1, dt * 3 + f * f * .2);
      for (let i = 0; i < ns * 3; i++) { pos[i] += (sp0[i] - pos[i]) * k; vel[i] = sv[i]; }
      for (let i = 0; i < ng * 3; i++) { gpos[i] += (gp0[i] - gpos[i]) * k; gvel[i] = gv[i]; }
      for (let j = 0; j < 3; j++) { sunP[j] += (sun0[j] - sunP[j]) * Math.min(1, dt * 3 + f * f * .2); sunV[j] = sunV0[j]; }
      dirty = true;
      if (reset === 0) { tEpi = 0; vel.set(sv); gvel.set(gv); sunP.splice(0, 3, ...sun0); useGpuEpicycles(); }
    } else {
      const myr = dt * MYR_PER_SEC * speed;   // the research zoom slows the galaxy almost to a stop
      step(myr);
      if (halo) { disk.rotation.z += PATTERN_SPEED / 977.8 * myr; tEpi += myr; epi.t.value = tEpi; }
      else dirty = true;                       // halo off: the CPU integrates the orbits
    }
    dMat.uniforms.time.value += dt * MYR_PER_SEC * speed;
    haloA += ((halo ? 1 : 0) - haloA) * Math.min(1, dt * 2.5);
    dMat.uniforms.glow.value = DM_GLOW * haloA;
    if (dirty) { sGeo.attributes.position.needsUpdate = true; gGeo.attributes.position.needsUpdate = true; dirty = false; }
    for (const f of cosmos.hooks) f(dt);
    draw();
    raf = vis ? requestAnimationFrame(loop) : 0; if (!vis) last = 0;
  }

  // shared with the research zoom (zoom3d.js), which adds its own levels to this scene, moves the
  // camera and scales `world` once its section scrolls in; hooks run every frame before drawing
  const cosmos = window.cosmos3d = {   // (not window.cosmos: that is the #cosmos element)
    scene, camera, world, canvas, stage, hooks: [], zooming: false,
    view: () => ({ az, el, dist }), place,
    starSize: () => (canvas.clientWidth > 860 ? .3 : .34), gasSize: .9, sMat, gMat, fog: dMat,
    resize: size,
    sun: sunP, sun0, disk, setHalo: on => { if (halo !== on) hb.click(); },
    setSpeed: v => { speed = v; },
    // back to the simulation snapshot, where the spiral arms are sharpest
    resetToSnapshot: () => { reset = 0; tEpi = 0; epi.t.value = 0; disk.rotation.z = 0; vel.set(sv); gvel.set(gv); sunP.splice(0, 3, ...sun0); sunV.splice(0, 3, ...sunV0); useGpuEpicycles(); },
  };
  new ResizeObserver(size).observe(canvas);
  place(); size();
  dispatchEvent(new Event('cosmos-ready'));
  if (!RM) {
    new IntersectionObserver(es => { vis = es[0].isIntersecting && !document.hidden; if (vis && !raf) raf = requestAnimationFrame(loop); }).observe(canvas);
    document.addEventListener('visibilitychange', () => { vis = !document.hidden; if (vis && !raf) raf = requestAnimationFrame(loop); });
  }
}

start().catch(() => {}); // any failure leaves the toy galaxy running
