import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';

export interface ContinuumController {
  setMode: (index: number) => void;
  setScrollProgress: (progress: number) => void;
  dispose: () => void;
}

interface ModePalette {
  colorA: Color;
  colorB: Color;
  freq: number;
  amp: number;
  tiltX: number;
  tiltZ: number;
}

function createModes(): ModePalette[] {
  const rootStyles = getComputedStyle(document.documentElement);
  const tok = (name: string, fallback: string) => rootStyles.getPropertyValue(name).trim() || fallback;

  const coral = tok('--c-coral', '#ff6b4a');
  const sky = tok('--c-sky', '#5ec2ff');
  const amber = tok('--c-amber', '#ffaa5c');
  const mint = tok('--c-mint', '#5eead4');

  return [
    // 0: Apps & Web — Coral-Apricot with Luminous Sky counter-rim
    {
      colorA: new Color(coral),
      colorB: new Color(sky),
      freq: 2.15,
      amp: 0.075,
      tiltX: 0.24,
      tiltZ: -0.18,
    },
    // 1: Power BI & Live Intelligence — Glacier Sky with Mint-Iris sheen
    {
      colorA: new Color(sky),
      colorB: new Color(mint),
      freq: 3.05,
      amp: 0.062,
      tiltX: -0.18,
      tiltZ: 0.28,
    },
    // 2: Intelligent Automation — Warm Amber with Coral kinetic flow
    {
      colorA: new Color(amber),
      colorB: new Color(coral),
      freq: 2.6,
      amp: 0.088,
      tiltX: 0.34,
      tiltZ: 0.14,
    },
    // 3: Platform Governance & Cloud — Jade Mint with Sky equilibrium
    {
      colorA: new Color(mint),
      colorB: new Color(sky),
      freq: 1.7,
      amp: 0.052,
      tiltX: -0.1,
      tiltZ: -0.24,
    },
  ];
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uFreq;
  uniform float uAmp;
  uniform vec2 uPointer;

  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec2 vUv;
  varying float vWave;

  float waveField(vec3 p) {
    float w1 = sin(p.x * uFreq + uTime * 1.15) * cos(p.y * uFreq - uTime * 0.85);
    float w2 = sin((p.z * uFreq * 1.35) + uTime * 0.95 + uPointer.x * 1.6);
    return (w1 * 0.62 + w2 * 0.38);
  }

  void main() {
    vUv = uv;

    float w = waveField(position);
    vWave = w;

    // Finite-difference gradient to keep displaced normals silky smooth
    float eps = 0.035;
    vec3 dx = vec3(eps, 0.0, 0.0);
    vec3 dy = vec3(0.0, eps, 0.0);
    vec3 dz = vec3(0.0, 0.0, eps);

    vec3 displaced = position + normal * (w * uAmp);
    vec3 px = (position + dx) + normal * (waveField(position + dx) * uAmp);
    vec3 py = (position + dy) + normal * (waveField(position + dy) * uAmp);
    vec3 pz = (position + dz) + normal * (waveField(position + dz) * uAmp);

    vec3 grad = vec3(
      length(px - displaced) - eps,
      length(py - displaced) - eps,
      length(pz - displaced) - eps
    );
    vec3 smoothNorm = normalize(normal - grad * 3.2);

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vPosW = worldPos.xyz;
    vNormalW = normalize(mat3(modelMatrix) * smoothNorm);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec2 uPointer;

  varying vec3 vNormalW;
  varying vec3 vPosW;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(cameraPosition - vPosW);

    // Key & rim directional studio lights
    vec3 L1 = normalize(vec3(2.2 + uPointer.x * 1.5, 2.8 + uPointer.y * 1.2, 3.2));
    vec3 L2 = normalize(vec3(-2.6, -1.8, 1.6));

    float diff1 = max(dot(N, L1), 0.0);
    float diff2 = max(dot(N, L2), 0.0);

    vec3 H1 = normalize(L1 + V);
    float spec = pow(max(dot(N, H1), 0.0), 46.0);

    // Iridescent Fresnel grazing rim
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.35);

    // Flowing ribbon harmonic pulse along knot length
    float ribbonFlow = 0.5 + 0.5 * sin(vUv.x * 18.84955 - uTime * 1.6);

    vec3 deepVelvet = vec3(0.065, 0.075, 0.145);
    vec3 midSilk = mix(uColorA, uColorB, clamp(0.5 + 0.5 * N.y + vWave * 0.28, 0.0, 1.0));

    vec3 color = deepVelvet;
    color += uColorA * (diff1 * 0.52);
    color += uColorB * (diff2 * 0.34);
    color = mix(color, midSilk, fresnel * 0.86);
    color += mix(uColorB, vec3(1.0, 0.96, 0.92), 0.55) * (ribbonFlow * fresnel * 0.32);
    color += vec3(1.0, 0.95, 0.9) * (spec * 0.62);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const PEARL_VERTEX = /* glsl */ `
  attribute float aScale;
  attribute float aPhase;
  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    vec3 pos = position;
    pos.y += sin(uTime * 0.8 + aPhase) * 0.09;
    pos.x += cos(uTime * 0.65 + aPhase * 1.3) * 0.06;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aScale * uPixelRatio * (15.0 / -mvPosition.z);
    vAlpha = 0.38 + 0.42 * (0.5 + 0.5 * sin(uTime * 1.3 + aPhase));
  }
`;

const PEARL_FRAGMENT = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float glow = pow(1.0 - d * 2.0, 2.1);
    vec3 col = mix(uColorA, uColorB, 0.5);
    gl_FragColor = vec4(col, glow * vAlpha);
  }
`;

export function initContinuum3D(
  stage: HTMLElement,
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
): ContinuumController | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }

  const modes = createModes();
  const isCompact = () => window.innerWidth < 768;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact() ? 1.5 : 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 1, 0.1, 40);
  camera.position.set(0, 0, 5.6);

  const root = new Group();
  scene.add(root);

  // 1. Sculptural Liquid-Silk Torus Knot (proportioned with generous breathing room)
  const knotGeo = new TorusKnotGeometry(1.02, 0.3, 240, 52, 2, 3);
  const uniforms = {
    uTime: { value: 1.4 },
    uFreq: { value: modes[0].freq },
    uAmp: { value: modes[0].amp },
    uColorA: { value: modes[0].colorA.clone() },
    uColorB: { value: modes[0].colorB.clone() },
    uPointer: { value: new Vector2(0, 0) },
  };

  const knotMat = new ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms,
  });

  const sculpture = new Mesh(knotGeo, knotMat);
  root.add(sculpture);

  // 2. Gossamer Orbital Filaments
  const orbitGroup = new Group();
  root.add(orbitGroup);

  const ringGeo1 = new TorusGeometry(2.02, 0.007, 12, 140);
  const ringMat1 = new MeshBasicMaterial({
    color: modes[0].colorA.clone(),
    transparent: true,
    opacity: 0.26,
  });
  const ring1 = new Mesh(ringGeo1, ringMat1);
  ring1.rotation.set(1.12, 0.32, 0.18);
  orbitGroup.add(ring1);

  const ringGeo2 = new TorusGeometry(2.32, 0.006, 12, 140);
  const ringMat2 = new MeshBasicMaterial({
    color: modes[0].colorB.clone(),
    transparent: true,
    opacity: 0.2,
  });
  const ring2 = new Mesh(ringGeo2, ringMat2);
  ring2.rotation.set(-0.92, -0.45, 0.4);
  orbitGroup.add(ring2);

  // 3. Luminous Floating Data Pearls
  const pearlCount = 72;
  const pearlPos = new Float32Array(pearlCount * 3);
  const pearlScale = new Float32Array(pearlCount);
  const pearlPhase = new Float32Array(pearlCount);

  for (let i = 0; i < pearlCount; i++) {
    const theta = (i / pearlCount) * Math.PI * 2 + (i % 5) * 0.31;
    const phi = Math.acos(2 * ((i * 0.6180339) % 1) - 1);
    const r = 1.85 + ((i * 0.37) % 0.95);
    pearlPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pearlPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.78;
    pearlPos[i * 3 + 2] = r * Math.cos(phi) * 0.7;
    pearlScale[i] = 0.7 + (i % 4) * 0.42;
    pearlPhase[i] = i * 0.73;
  }

  const pearlGeo = new BufferGeometry();
  pearlGeo.setAttribute('position', new BufferAttribute(pearlPos, 3));
  pearlGeo.setAttribute('aScale', new BufferAttribute(pearlScale, 1));
  pearlGeo.setAttribute('aPhase', new BufferAttribute(pearlPhase, 1));

  const pearlUniforms = {
    uTime: uniforms.uTime,
    uColorA: uniforms.uColorA,
    uColorB: uniforms.uColorB,
    uPixelRatio: { value: renderer.getPixelRatio() },
  };

  const pearlMat = new ShaderMaterial({
    vertexShader: PEARL_VERTEX,
    fragmentShader: PEARL_FRAGMENT,
    uniforms: pearlUniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const pearls = new Points(pearlGeo, pearlMat);
  root.add(pearls);

  // State & smooth interpolation targets
  let activeMode = modes[0];
  let scrollProg = 0;
  const pointerTarget = new Vector2(0, 0);
  const pointerSmooth = new Vector2(0, 0);

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, isCompact() ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    pearlUniforms.uPixelRatio.value = dpr;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w < 520 ? 6.8 : w < 960 ? 6.4 : 6.15;
    camera.updateProjectionMatrix();
    if (reducedMotion) renderOnce();
  };

  const onPointerMove = (e: PointerEvent) => {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const onPointerLeave = () => {
    pointerTarget.set(0, 0);
  };

  let rafId = 0;
  let inView = true;
  let docVisible = !document.hidden;
  let prevTime = performance.now();

  function renderOnce() {
    uniforms.uColorA.value.copy(activeMode.colorA);
    uniforms.uColorB.value.copy(activeMode.colorB);
    uniforms.uFreq.value = activeMode.freq;
    uniforms.uAmp.value = activeMode.amp;
    ringMat1.color.copy(activeMode.colorA);
    ringMat2.color.copy(activeMode.colorB);
    root.rotation.set(activeMode.tiltX, 0.45, activeMode.tiltZ);
    renderer.render(scene, camera);
  }

  function animate(now: number) {
    rafId = 0;
    if (!inView || !docVisible || reducedMotion) return;

    const dt = Math.min((now - prevTime) * 0.001, 0.05);
    prevTime = now;
    const damp = 1 - Math.exp(-4.5 * dt);

    uniforms.uTime.value += dt;

    pointerSmooth.lerp(pointerTarget, damp);
    uniforms.uPointer.value.copy(pointerSmooth);

    uniforms.uColorA.value.lerp(activeMode.colorA, damp);
    uniforms.uColorB.value.lerp(activeMode.colorB, damp);
    uniforms.uFreq.value = MathUtils.lerp(uniforms.uFreq.value, activeMode.freq, damp);
    uniforms.uAmp.value = MathUtils.lerp(uniforms.uAmp.value, activeMode.amp, damp);

    ringMat1.color.copy(uniforms.uColorA.value);
    ringMat2.color.copy(uniforms.uColorB.value);

    sculpture.rotation.y += dt * 0.24;
    sculpture.rotation.x = MathUtils.lerp(
      sculpture.rotation.x,
      activeMode.tiltX + pointerSmooth.y * 0.28 + scrollProg * 0.45,
      damp,
    );
    sculpture.rotation.z = MathUtils.lerp(
      sculpture.rotation.z,
      activeMode.tiltZ - pointerSmooth.x * 0.25,
      damp,
    );

    orbitGroup.rotation.y -= dt * 0.11;
    orbitGroup.rotation.x = pointerSmooth.y * 0.14;
    pearls.rotation.y += dt * 0.06;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  function startLoop() {
    if (!reducedMotion && inView && docVisible && !rafId) {
      prevTime = performance.now();
      rafId = requestAnimationFrame(animate);
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(stage);
  resize();

  const io = new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      if (inView) startLoop();
      else if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    },
    { threshold: 0.02 },
  );
  io.observe(stage);

  const onVis = () => {
    docVisible = !document.hidden;
    if (docVisible) startLoop();
    else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
  document.addEventListener('visibilitychange', onVis);

  const heroSection = stage.closest('section') ?? stage;
  heroSection.addEventListener('pointermove', onPointerMove as EventListener, { passive: true });
  heroSection.addEventListener('pointerleave', onPointerLeave, { passive: true });

  document.documentElement.classList.add('has-webgl');

  if (reducedMotion) {
    renderOnce();
  } else {
    startLoop();
  }

  return {
    setMode(index: number) {
      activeMode = modes[index % modes.length] ?? modes[0];
      if (reducedMotion) renderOnce();
    },
    setScrollProgress(progress: number) {
      scrollProg = MathUtils.clamp(progress, 0, 1);
    },
    dispose() {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      heroSection.removeEventListener('pointermove', onPointerMove as EventListener);
      heroSection.removeEventListener('pointerleave', onPointerLeave);
      knotGeo.dispose();
      knotMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      pearlGeo.dispose();
      pearlMat.dispose();
      renderer.dispose();
    },
  };
}
