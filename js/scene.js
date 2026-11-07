// Welcome scene (design/MASTER.md): coloured CV sheets float in 3D, follow the pointer,
// and gather into a stack that rushes at the screen when the visitor says yes.
// Three.js is imported on demand (import map in index.html); any failure leaves the SVG sheet in place.
window.TTU_SCENE = (() => {
  'use strict';
  const COLORS = ['#5b2eff', '#ff6b2c', '#d9338a', '#00a6b8', '#1f6bff', '#13a35a', '#ffc21a', '#f0386b'];
  const SHAPES = ['#ffd23f', '#1fc59a', '#ff6b2c', '#ff4f9a', '#5b2eff', '#00a6b8'];
  let S = null; // live scene state

  const webgl = () => {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
  };
  const easeOutBack = t => { const c = 1.6; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const clamp01 = t => Math.max(0, Math.min(1, t));

  // A small CV drawn on a canvas: four layouts, so the sheets do not look cloned.
  function drawSheet(THREE, color, k) {
    const W = 420, H = 594, c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const bar = (x, y, w, h, fill) => { g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fill(); };
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    const soft = '#dcd6ee', dark = '#17123b';
    if (k % 4 === 0) { // full-width header band
      g.fillStyle = color; g.fillRect(0, 0, W, 150);
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(78, 75, 44, 0, Math.PI * 2); g.fill();
      bar(140, 52, 190, 22, '#ffffff'); bar(140, 88, 120, 12, 'rgba(255,255,255,.7)');
      for (let i = 0; i < 4; i++) { bar(36, 190 + i * 96, 90, 14, color); bar(36, 220 + i * 96, 340, 9, soft); bar(36, 240 + i * 96, 290, 9, soft); }
    } else if (k % 4 === 1) { // coloured sidebar
      g.fillStyle = color; g.fillRect(0, 0, 140, H);
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(70, 80, 42, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 6; i++) bar(24, 160 + i * 34, 70 + (i % 3) * 14, 9, 'rgba(255,255,255,.75)');
      bar(170, 50, 200, 24, dark); bar(170, 88, 130, 12, color);
      for (let i = 0; i < 4; i++) { bar(170, 150 + i * 104, 100, 13, dark); bar(170, 178 + i * 104, 210, 9, soft); bar(170, 198 + i * 104, 180, 9, soft); }
    } else if (k % 4 === 2) { // centred name, thin rule
      bar(110, 54, 200, 26, dark); bar(150, 94, 120, 12, color);
      g.fillStyle = color; g.fillRect(36, 130, W - 72, 4);
      for (let i = 0; i < 5; i++) { bar(36, 162 + i * 84, 80, 13, color); bar(36, 188 + i * 84, 348, 9, soft); bar(36, 206 + i * 84, 300, 9, soft); }
    } else { // timeline
      bar(36, 46, 230, 26, dark); bar(36, 84, 150, 12, color);
      g.fillStyle = color; g.beginPath(); g.arc(340, 70, 38, 0, Math.PI * 2); g.fill();
      g.fillStyle = soft; g.fillRect(52, 140, 3, 410);
      for (let i = 0; i < 5; i++) { g.fillStyle = color; g.beginPath(); g.arc(53, 152 + i * 84, 9, 0, Math.PI * 2); g.fill(); bar(78, 144 + i * 84, 140, 13, dark); bar(78, 170 + i * 84, 300, 9, soft); }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  // Screen point (CSS px) -> world point on the z = 0 plane.
  function toWorld(THREE, camera, x, y) {
    const v = new THREE.Vector3((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1, 0.5).unproject(camera);
    const dir = v.sub(camera.position).normalize();
    return camera.position.clone().add(dir.multiplyScalar(-camera.position.z / dir.z));
  }

  async function start(host, anchor) {
    if (S || !host || !webgl()) return false;
    let THREE;
    try {
      THREE = await Promise.race([import('three'), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 8000))]);
    } catch { return false; }
    if (S || !document.body.contains(anchor) || anchor.closest('[hidden]')) return false;
    try { S = build(THREE, host, anchor); } catch { S = null; return false; }
    return true;
  }

  function build(THREE, host, anchor) {
    const phone = Math.min(innerWidth, innerHeight) < 700;
    const renderer = new THREE.WebGLRenderer({ antialias: !phone, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, phone ? 1.5 : 2));
    renderer.setSize(innerWidth, innerHeight);
    host.append(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 0, 14);
    camera.updateMatrixWorld(); // place() unprojects before the first render
    scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc4ff, 2.4));
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(4, 6, 8);
    scene.add(sun);

    const field = new THREE.Group(); // centred on the art column
    scene.add(field);
    const sheetGeo = new THREE.PlaneGeometry(2.1, 2.97);
    const count = phone ? 6 : 9;
    const sheets = [];
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshStandardMaterial({ map: drawSheet(THREE, COLORS[i % COLORS.length], i), roughness: 0.9, metalness: 0, transparent: true, side: THREE.DoubleSide });
      const m = new THREE.Mesh(sheetGeo, mat);
      const a = (i / count) * Math.PI * 2 + 0.4;
      const ring = i === 0 ? 0 : 1;
      m.userData = {
        base: new THREE.Vector3(Math.cos(a) * ring, Math.sin(a) * ring * 0.9, i === 0 ? 1.2 : -1.6 + (i % 3) * 0.9),
        rot: new THREE.Euler((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.7),
        speed: 0.25 + Math.random() * 0.35, phase: Math.random() * Math.PI * 2, delay: i * 0.09
      };
      field.add(m); sheets.push(m);
    }
    const shapes = [];
    const shapeGeos = [new THREE.IcosahedronGeometry(0.28, 0), new THREE.TorusGeometry(0.24, 0.1, 12, 28), new THREE.SphereGeometry(0.22, 20, 14)];
    for (let i = 0; i < (phone ? 4 : 8); i++) {
      const mat = new THREE.MeshStandardMaterial({ color: SHAPES[i % SHAPES.length], roughness: 0.45, metalness: 0.05, transparent: true });
      const m = new THREE.Mesh(shapeGeos[i % shapeGeos.length], mat);
      const a = (i / 8) * Math.PI * 2;
      m.userData = { base: new THREE.Vector3(Math.cos(a) * 1.25, Math.sin(a) * 1.15, -0.5 + (i % 2) * 2.2), speed: 0.5 + Math.random() * 0.6, phase: Math.random() * 6, delay: 0.5 + i * 0.06 };
      field.add(m); shapes.push(m);
    }

    // Spread the field over the art column (whatever the layout).
    const spread = new THREE.Vector2(1, 1);
    function place() {
      const r = anchor.getBoundingClientRect();
      const w = Math.max(r.width, phone ? 300 : 360), h = Math.max(r.height, phone ? 200 : 420);
      const c = toWorld(THREE, camera, r.left + r.width / 2, r.top + r.height / 2);
      const e = toWorld(THREE, camera, r.left + r.width / 2 + w / 2, r.top + r.height / 2 - h / 2);
      field.position.set(c.x, c.y, 0);
      spread.set(Math.abs(e.x - c.x), Math.abs(e.y - c.y));
      const scale = Math.min(1.2, Math.max(0.55, spread.y / 2.6));
      sheets.forEach(m => m.scale.setScalar(scale));
    }
    place();

    const pointer = { x: 0, y: 0 };
    const onMove = e => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; };
    const onResize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); camera.updateMatrixWorld(); renderer.setSize(innerWidth, innerHeight); place(); };
    const onVis = () => renderer.setAnimationLoop(document.hidden ? null : loop);
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);

    let t0 = null, gatherAt = null, gatherDone = null;
    const tmp = new THREE.Vector3(), stack = new THREE.Vector3();
    function loop(now) {
      if (t0 === null) t0 = now;
      const t = (now - t0) / 1000;
      field.rotation.y += (pointer.x * 0.28 - field.rotation.y) * 0.05;
      field.rotation.x += (pointer.y * 0.16 - field.rotation.x) * 0.05;
      const g = gatherAt === null ? 0 : (now - gatherAt) / 1000;
      sheets.forEach((m, i) => {
        const u = m.userData, enter = easeOutBack(clamp01((t - u.delay) / 1.1));
        const bob = Math.sin(t * u.speed + u.phase);
        tmp.set(u.base.x * spread.x, u.base.y * spread.y + bob * 0.18, u.base.z);
        tmp.y -= (1 - enter) * 7;
        let rx = u.rot.x + bob * 0.08, ry = u.rot.y + Math.sin(t * u.speed * 0.7 + u.phase) * 0.18, rz = u.rot.z;
        if (gatherAt !== null) { // stack at the centre, then rush at the camera
          const k = easeInOut(clamp01(g / 0.55));
          tmp.lerp(stack.set(0, 0, i * 0.04), k);
          rx *= 1 - k; ry *= 1 - k; rz = rz * (1 - k) + (i % 2 ? 0.04 : -0.04) * k;
          const fly = clamp01((g - 0.45) / 0.45);
          tmp.z += fly * fly * 11;
          m.material.opacity = 1 - clamp01((g - 0.6) / 0.3);
        }
        m.position.copy(tmp);
        m.rotation.set(rx, ry, rz);
      });
      shapes.forEach(m => {
        const u = m.userData, enter = easeOutBack(clamp01((t - u.delay) / 0.9));
        m.position.set(u.base.x * spread.x, u.base.y * spread.y + Math.sin(t * u.speed + u.phase) * 0.25, u.base.z);
        m.scale.setScalar(Math.max(0.001, enter));
        m.rotation.x = t * u.speed; m.rotation.y = t * u.speed * 0.8;
        if (gatherAt !== null) { m.position.multiplyScalar(1 + g * 2.5); m.material.opacity = 1 - clamp01(g / 0.5); }
      });
      renderer.render(scene, camera);
      if (gatherAt !== null && g >= 0.95 && gatherDone) { const done = gatherDone; gatherDone = null; done(); }
    }
    renderer.setAnimationLoop(loop);

    function dispose() {
      renderer.setAnimationLoop(null);
      removeEventListener('pointermove', onMove);
      removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse(o => { if (o.isMesh) { o.material.map?.dispose(); o.material.dispose(); } });
      sheetGeo.dispose(); shapeGeos.forEach(g => g.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    }
    function gather() {
      if (gatherAt !== null) return Promise.resolve();
      return new Promise(res => { gatherAt = performance.now(); gatherDone = res; setTimeout(() => { if (gatherDone) { gatherDone = null; res(); } }, 1500); });
    }
    return { dispose, gather };
  }

  return {
    start,
    get active() { return !!S; },
    async leave() { if (!S) return; const s = S; await s.gather(); s.dispose(); if (S === s) S = null; },
    stop() { if (S) { S.dispose(); S = null; } }
  };
})();
