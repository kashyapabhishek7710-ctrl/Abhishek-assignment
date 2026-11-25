// Hero background: a network of nodes (the team) that connect when they drift
// close. Every couple of seconds one node lights up and the glow spreads to the
// nodes it's linked to, which is the "learning together" idea.
//
// Only runs at 768px and up. Below that, Three.js is never downloaded and the
// inline SVG in the hero takes its place.
(() => {
  const dc = window.dc;
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js';
  const desktop = window.matchMedia('(min-width: 768px)');

  let network = null;
  let loading = false;

  const sync = () => {
    if (!desktop.matches) {
      network?.pause();
      return;
    }
    if (network) {
      network.resume();
      return;
    }
    if (loading) return;

    loading = true;
    import(THREE_URL)
      .then((THREE) => { network = createNetwork(THREE, dc.$('#hero-canvas')); })
      .catch((err) => console.warn('Three.js failed to load, hero stays static', err));
  };

  desktop.addEventListener('change', sync);
  sync();

  function createNetwork(THREE, container) {
    const COUNT = 110;
    const LINK_DISTANCE = 2.1;
    const BOUNDS = { x: 7, y: 4.2, z: 3 };
    const MAX_LINKS = COUNT * 8;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (err) {
      console.warn('WebGL not available, hero stays static');
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 10;

    const group = new THREE.Group();
    scene.add(group);

    // nodes
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const heat = new Float32Array(COUNT); // 0 idle, 1 fully lit
    const velocities = [];

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = THREE.MathUtils.randFloatSpread(BOUNDS.x * 2);
      positions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(BOUNDS.y * 2);
      positions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(BOUNDS.z * 2);
      sizes[i] = 0.7 + Math.random() * 0.8;
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.003,
      ));
    }

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    pointGeometry.setAttribute('aHeat', new THREE.BufferAttribute(heat, 1));

    const uniforms = {
      uBase: { value: new THREE.Color() },
      uAccent: { value: new THREE.Color('#FF6B3D') },
      uPixelRatio: { value: renderer.getPixelRatio() },
    };

    // small custom shader so each point is a soft round glow with its own size/heat
    const pointMaterial = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute float aSize;
        attribute float aHeat;
        uniform float uPixelRatio;
        varying float vHeat;

        void main() {
          vHeat = aHeat;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (aSize * 9.0 + aHeat * 10.0) * uPixelRatio * (10.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uBase;
        uniform vec3 uAccent;
        varying float vHeat;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float core = smoothstep(0.22, 0.0, d);
          float glow = smoothstep(0.5, 0.0, d) * 0.45;
          vec3 color = mix(uBase, uAccent, vHeat);
          gl_FragColor = vec4(color, (core + glow) * (0.55 + vHeat * 0.45));
        }
      `,
    });
    group.add(new THREE.Points(pointGeometry, pointMaterial));

    // links: one buffer, refilled every frame (fine at ~6k pair checks)
    const linePositions = new Float32Array(MAX_LINKS * 6);
    const lineColors = new Float32Array(MAX_LINKS * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
    group.add(new THREE.LineSegments(lineGeometry, lineMaterial));

    const baseColor = new THREE.Color();
    const bgColor = new THREE.Color();
    const accentColor = new THREE.Color('#FF6B3D');
    const mixed = new THREE.Color();
    const lineColor = new THREE.Color();

    let running = false;

    // additive blending looks great on dark but vanishes on a light background
    const applyTheme = () => {
      const light = dc.root.dataset.theme === 'light';
      baseColor.set(light ? '#0C1222' : '#F4EFE6');
      bgColor.set(light ? '#F4EFE6' : '#0C1222');
      uniforms.uBase.value.copy(baseColor);

      const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      pointMaterial.blending = blending;
      lineMaterial.blending = blending;
      pointMaterial.needsUpdate = true;
      lineMaterial.needsUpdate = true;

      if (!running) renderer.render(scene, camera);
    };
    document.addEventListener('themechange', applyTheme);

    const pointer = { x: 0, y: 0 };
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (!running) renderer.render(scene, camera);
    };
    new ResizeObserver(resize).observe(container);

    const lightRandomNode = () => { heat[Math.floor(Math.random() * COUNT)] = 1; };
    let nextSpark = 0.6;

    const update = (dt, moving) => {
      if (moving) {
        for (let i = 0; i < COUNT; i++) {
          const v = velocities[i];
          const ix = i * 3;
          positions[ix] += v.x;
          positions[ix + 1] += v.y;
          positions[ix + 2] += v.z;
          if (Math.abs(positions[ix]) > BOUNDS.x) v.x *= -1;
          if (Math.abs(positions[ix + 1]) > BOUNDS.y) v.y *= -1;
          if (Math.abs(positions[ix + 2]) > BOUNDS.z) v.z *= -1;
          heat[i] = Math.max(0, heat[i] - dt * 0.35);
        }

        nextSpark -= dt;
        if (nextSpark <= 0) {
          lightRandomNode();
          nextSpark = 1.6 + Math.random() * 1.6;
        }
      }

      let links = 0;
      for (let a = 0; a < COUNT; a++) {
        for (let b = a + 1; b < COUNT; b++) {
          const dx = positions[a * 3] - positions[b * 3];
          const dy = positions[a * 3 + 1] - positions[b * 3 + 1];
          const dz = positions[a * 3 + 2] - positions[b * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist > LINK_DISTANCE || links >= MAX_LINKS) continue;

          // a lit node passes some of its glow to the nodes it's linked to
          if (moving) {
            if (heat[a] > 0.55 && heat[b] < heat[a] - 0.3) heat[b] = Math.min(1, heat[b] + dt * 1.4);
            if (heat[b] > 0.55 && heat[a] < heat[b] - 0.3) heat[a] = Math.min(1, heat[a] + dt * 1.4);
          }

          const closeness = 1 - dist / LINK_DISTANCE;
          const glow = Math.max(heat[a], heat[b]);

          // blend towards the background colour instead of using alpha,
          // so the same maths works for both blending modes
          mixed.copy(baseColor).lerp(accentColor, glow);
          lineColor.copy(bgColor).lerp(mixed, closeness * (0.35 + glow * 0.65));

          const o = links * 6;
          for (let k = 0; k < 3; k++) {
            linePositions[o + k] = positions[a * 3 + k];
            linePositions[o + 3 + k] = positions[b * 3 + k];
          }
          lineColors[o] = lineColors[o + 3] = lineColor.r;
          lineColors[o + 1] = lineColors[o + 4] = lineColor.g;
          lineColors[o + 2] = lineColors[o + 5] = lineColor.b;
          links++;
        }
      }

      lineGeometry.setDrawRange(0, links * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;
      pointGeometry.attributes.position.needsUpdate = true;
      pointGeometry.attributes.aHeat.needsUpdate = true;
    };

    let rafId = 0;
    let lastTime = 0;
    let elapsed = 0;
    let inView = true;

    const tick = (now) => {
      rafId = requestAnimationFrame(tick);
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
      lastTime = now;
      elapsed += dt;

      // ease towards the pointer, plus a very slow constant spin
      group.rotation.y += (pointer.x * 0.25 + elapsed * 0.02 - group.rotation.y) * 0.03;
      group.rotation.x += (pointer.y * 0.15 - group.rotation.x) * 0.03;

      update(dt, true);
      renderer.render(scene, camera);
    };

    const start = () => {
      if (running || dc.reduceMotion || !inView || document.hidden || !desktop.matches) return;
      running = true;
      lastTime = 0;
      rafId = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    // don't burn GPU when nobody can see it
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start(); else stop();
    }).observe(container);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else start();
    });

    dc.motionQuery.addEventListener('change', (e) => {
      dc.reduceMotion = e.matches;
      if (e.matches) stop(); else start();
    });

    applyTheme();
    resize();

    if (dc.reduceMotion) {
      // one still frame with a few lit nodes
      for (let i = 0; i < 6; i++) lightRandomNode();
      update(0, false);
      renderer.render(scene, camera);
    } else {
      lightRandomNode();
      start();
    }

    return { pause: stop, resume: start };
  }
})();
