/* Shared by the hero galaxy (galaxy3d.js) and the research zoom (zoom3d.js): loading the FIRE-2 m12i
   data built by galaxy-build/extract_m12i.py, the soft point sprite, and the dark matter fog. */
import * as THREE from 'three';

export const DATA_V = 6;   // bump when galaxy-build/extract_m12i.py rewrites the data

let loading = null;
// fetched once per page, whichever module asks first
export function loadGalaxy() {
  loading = loading || (async () => {
    const [meta, buf, vol] = await Promise.all([
      fetch(`assets/galaxy/m12i.json?v=${DATA_V}`).then(r => r.json()),
      fetch(`assets/galaxy/m12i.bin?v=${DATA_V}`).then(r => r.arrayBuffer()),
      fetch(`assets/galaxy/m12i_dm.bin?v=${DATA_V}`).then(r => r.arrayBuffer()),
    ]);
    const ns = meta.nStars, nd = meta.nDM, ng = meta.nGas, i16 = new Int16Array(buf, 0, (ns + nd + ng) * 6);
    let o = 0;
    const take = (n, scale) => { const a = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) a[i] = i16[o + i] * scale; o += n * 3; return a; };
    const sp = take(ns, meta.posScaleStars), sv = take(ns, meta.velScale); take(nd, 0); take(nd, 0); // no DM particles: it's a volume now
    const gp = take(ng, meta.posScaleGas), gv = take(ng, meta.velScale);
    const rgb = new Uint8Array(buf, o * 2, ns * 3);
    return { meta, sp, sv, gp, gv, rgb, dmVol: new Uint8Array(vol) };
  })();
  return loading;
}

export function dotTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

// Dark matter as a glowing fog: the smoothed density of all the simulation's dark matter inside
// 40 kpc (a 64^3 log-density texture), ray-marched along each line of sight in the fog's own
// coordinates (kpc), so the mesh can be moved and scaled. The halo is in equilibrium, so its density
// is steady; a churning texture is displaced in each region by the halo's measured 1-D velocity
// dispersion (random directions) and its slight mean rotation, both functions of radius.
// Set material.uniforms.time (Myr) to animate and .glow for brightness.
export function makeFog(meta, dmVol, { glow = .07, flowPeriod = 30 } = {}) {
  const dv = meta.dmVolume, half = dv.halfWidth;
  const dTex = new THREE.Data3DTexture(dmVol, dv.n, dv.n, dv.n);
  dTex.format = THREE.RedFormat; dTex.type = THREE.UnsignedByteType;
  dTex.minFilter = dTex.magFilter = THREE.LinearFilter; dTex.unpackAlignment = 1; dTex.needsUpdate = true;
  const NN = 32, nz = new Uint8Array(NN ** 3), raw = Float32Array.from({ length: NN ** 3 }, Math.random);
  for (let z = 0; z < NN; z++) for (let y = 0; y < NN; y++) for (let x = 0; x < NN; x++) {
    let a = 0; for (let d = -1; d <= 1; d++) a += raw[((z + d + NN) % NN) * NN * NN + y * NN + x] + raw[z * NN * NN + ((y + d + NN) % NN) * NN + x] + raw[z * NN * NN + y * NN + (x + d + NN) % NN];
    nz[z * NN * NN + y * NN + x] = Math.round(a / 9 * 255);
  }
  const nTex = new THREE.Data3DTexture(nz, NN, NN, NN);
  nTex.format = THREE.RedFormat; nTex.type = THREE.UnsignedByteType; nTex.unpackAlignment = 1;
  nTex.minFilter = nTex.magFilter = THREE.LinearFilter; nTex.wrapS = nTex.wrapT = nTex.wrapR = THREE.RepeatWrapping; nTex.needsUpdate = true;
  const fl = meta.dmFlow || { r: [1, 40], vphi: [0, 0], sigma: [150, 150] };
  const pad = a => { const o = a.slice(0, 8); while (o.length < 8) o.push(o[o.length - 1]); return o; };
  const material = new THREE.ShaderMaterial({
    uniforms: { vol: { value: dTex }, halfW: { value: half }, glow: { value: glow }, tint: { value: new THREE.Color(0x5a6cff) },
      noise: { value: nTex }, time: { value: 0 }, camObj: { value: new THREE.Vector3() },
      fr: { value: pad(fl.r) }, fv: { value: pad(fl.vphi) }, fs: { value: pad(fl.sigma) } },
    vertexShader: `varying vec3 vPos;
      void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `precision highp sampler3D;
      uniform sampler3D vol; uniform sampler3D noise; uniform float halfW; uniform float glow; uniform vec3 tint;
      uniform float time; uniform vec3 camObj; uniform float fr[8]; uniform float fv[8]; uniform float fs[8]; varying vec3 vPos;
      float prof(float r, float f[8]) {          // piecewise-linear profile in radius
        if (r <= fr[0]) return f[0];
        for (int k = 1; k < 8; k++) if (r < fr[k]) return mix(f[k - 1], f[k], (r - fr[k - 1]) / (fr[k] - fr[k - 1]));
        return f[7];
      }
      float churn(vec3 p) {
        float r = length(p), R = max(length(p.xy), 1.0), sig = prof(r, fs), om = prof(r, fv) / R;
        float n = 0.0, wsum = 0.0;
        for (int k = 0; k < 2; k++) {
          float tau = fract(time / ${flowPeriod.toFixed(1)} + 0.5 * float(k)), w = 1.0 - abs(2.0 * tau - 1.0);
          float t = tau * ${flowPeriod.toFixed(1)} / 977.8;           // in kpc/(km/s)
          float a = -om * t; vec3 q = vec3(cos(a) * p.x - sin(a) * p.y, sin(a) * p.x + cos(a) * p.y, p.z);
          vec3 dir = k == 0 ? vec3(0.62, -0.51, 0.59) : vec3(-0.44, 0.71, -0.55);
          n += w * texture(noise, (q - dir * sig * t + float(k) * 7.3) / 48.0).r; wsum += w;
        }
        return n / wsum;
      }
      void main() {
        vec3 ro = camObj, rd = normalize(vPos - ro), inv = 1.0 / rd;
        vec3 t0 = (-halfW - ro) * inv, t1 = (halfW - ro) * inv, lo = min(t0, t1), hi = max(t0, t1);
        float tn = max(max(max(lo.x, lo.y), lo.z), 0.0), tf = min(min(hi.x, hi.y), hi.z);
        if (tf <= tn) discard;
        const int N = 64; float dt = (tf - tn) / float(N), acc = 0.0;
        for (int i = 0; i < N; i++) {
          vec3 p = ro + rd * (tn + (float(i) + 0.5) * dt);
          float d = texture(vol, p / (2.0 * halfW) + 0.5).r;   // log density, 0..1
          float e = d * d; e *= e * d;                         // d^5: the dense centre glows most
          float c = churn(p); acc += e * (0.05 + 4.0 * c * c * c) * smoothstep(halfW, 0.55 * halfW, length(p)) * dt;   // fade out well before the box edge
        }
        gl_FragColor = vec4(tint * acc * glow, 1.0);
      }`,
    side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(2 * half, 2 * half, 2 * half), material);
  mesh.renderOrder = -1;
  const inv = new THREE.Matrix4();
  // the camera in the fog's own coordinates, so the ray-march works wherever the mesh is placed
  mesh.onBeforeRender = (r, s, cam) => { inv.copy(mesh.matrixWorld).invert(); material.uniforms.camObj.value.setFromMatrixPosition(cam.matrixWorld).applyMatrix4(inv); };
  return mesh;
}
