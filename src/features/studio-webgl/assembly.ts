import * as THREE from 'three'

/* ============================================================
   ASSEMBLY — metal shards that keep re-forming.
   Five formations (four problems, then the fix). The words are
   sampled from a <canvas> (real font shaping), so the Arabic stays
   correct — no TextGeometry, no broken joins.
   ============================================================ */

const WORD_WIDTH = 8.6
const CORNERS = [
  [5.6, 3.1, 1.6],
  [-5.6, 2.9, 0.7],
  [5.6, -2.9, -1.3],
  [-5.6, -3.2, -0.4],
]

export interface AssemblyHandle {
  setFrame: (phase: number, assemble: number) => void
  setPointer: (x: number, y: number) => void
  setHover: (value: number) => void
  resize: () => void
  render: (time: number) => void
  dispose: () => void
}

interface AssemblyOptions {
  canvas: HTMLCanvasElement
  /** four problem words + the fix, in order */
  words: string[]
  count: number
}

export function createAssembly({ canvas, words, count }: AssemblyOptions): AssemblyHandle {
  /* Three r187 needs WebGL2. Check it on the real canvas first so a
     machine without it falls back quietly instead of throwing inside
     the renderer constructor. */
  const context = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  if (!context) throw new Error('WebGL2 is not available')

  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.38

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120)
  camera.position.set(0, 0, 11)

  const group = new THREE.Group()
  scene.add(group)

  /* ── environment: a studio softbox room, brand-yellow key ───── */
  const envScene = new THREE.Scene()
  const panels: THREE.Mesh[] = []

  const addPanel = (color: string, power: number, pos: [number, number, number], size: [number, number]) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(power),
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), material)
    mesh.position.set(...pos)
    mesh.lookAt(0, 0, 0)
    envScene.add(mesh)
    panels.push(mesh)
  }

  /* strip lights, not a flat box: plates at different angles catch
     different bands, which is what makes chrome read as chrome */
  addPanel('#ffffff', 3.2, [0, 3.6, 12], [34, 3.2])
  addPanel('#ffffff', 1.5, [0, -5.2, 11], [30, 2])
  addPanel('#fbe23d', 3.1, [7, 5, 4], [10, 14])
  addPanel('#ffffff', 2.0, [-8, 3, -6], [14, 2.2])
  addPanel('#ffffff', 1.1, [0, 10, 0], [20, 20])
  addPanel('#dfe6ff', 1.0, [-9, -5, 5], [10, 8])
  addPanel('#fbe23d', 1.1, [0, -9, 2], [18, 8])

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envMap = pmrem.fromScene(envScene, 0.04)
  scene.environment = envMap.texture
  panels.forEach((panel) => {
    panel.geometry.dispose()
    ;(panel.material as THREE.Material).dispose()
  })
  pmrem.dispose()

  const key = new THREE.DirectionalLight(0xfff3c4, 2.0)
  key.position.set(4, 6, 6)
  scene.add(key)

  const rim = new THREE.DirectionalLight(0xfbe23d, 1.9)
  rim.position.set(-5, -3, -4)
  scene.add(rim)

  const fill = new THREE.HemisphereLight(0xe3e7f2, 0x241f18, 0.8)
  scene.add(fill)

  /* ── sample the five formations ────────────────────────────── */
  const sampled = words.map((word) => sampleText(word, count))
  const targets = sampled.map((item) => item.points)
  const spreadX = WORD_WIDTH
  const spreadY = Math.max(...sampled.map((item) => item.height), 2)

  const deals = targets.map((points) => {
    const shuffled = points.slice()
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const swap = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = swap
    }
    return shuffled
  })

  /* ── build instances ───────────────────────────────────────── */
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 1,
    roughness: 0.16,
    envMapIntensity: 2.0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.16,
    /* just a breath of oil-slick — full rainbow reads as confetti */
    iridescence: 0.14,
    iridescenceIOR: 1.5,
    iridescenceThicknessRange: [180, 420],
    flatShading: true,
  })

  const uniforms = {
    uPhase: { value: 0 },
    uAssemble: { value: 0 },
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(40, 40) },
    uHover: { value: 0 },
  }

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uPhase = uniforms.uPhase
    shader.uniforms.uAssemble = uniforms.uAssemble
    shader.uniforms.uTime = uniforms.uTime
    shader.uniforms.uMouse = uniforms.uMouse
    shader.uniforms.uHover = uniforms.uHover

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        /* glsl */ `
        #include <common>
        uniform float uPhase;
        uniform float uAssemble;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uHover;
        attribute vec3 aStart;
        attribute vec3 aT0;
        attribute vec3 aT1;
        attribute vec3 aT2;
        attribute vec3 aT3;
        attribute vec3 aT4;
        attribute vec4 aQuat;
        /* x = delay, y = seed — packed: WebGL only guarantees 16 attrs */
        attribute vec2 aRand;

        float gAng;
        vec3 gAxis;
        float gBurst;

        float hash11(float p) {
          p = fract(p * 0.1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
        }

        float easeOutCubic(float x) {
          return 1.0 - pow(1.0 - x, 3.0);
        }

        vec3 rotAxis(vec3 v, vec3 axis, float a) {
          float c = cos(a);
          float s = sin(a);
          return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
        }

        vec3 rotQuat(vec3 v, vec4 q) {
          return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
        }

        /* pick the formation pair we are between and blend it */
        vec3 formation(float p) {
          if (p <= 0.0) return aT0;
          if (p < 1.0) return mix(aT0, aT1, smoothstep(0.0, 1.0, p));
          if (p < 2.0) return mix(aT1, aT2, smoothstep(0.0, 1.0, p - 1.0));
          if (p < 3.0) return mix(aT2, aT3, smoothstep(0.0, 1.0, p - 2.0));
          if (p < 4.0) return mix(aT3, aT4, smoothstep(0.0, 1.0, p - 3.0));
          return aT4;
        }
        `,
      )
      .replace(
        '#include <beginnormal_vertex>',
        /* glsl */ `
        #include <beginnormal_vertex>
        float tNormal = clamp((uAssemble - aRand.x) / max(1.0 - aRand.x, 0.001), 0.0, 1.0);
        gBurst = sin(fract(uPhase) * 3.14159265) * smoothstep(0.0, 0.12, uAssemble);
        gAng = uTime * (0.14 + aRand.y * 0.5) * (1.0 - easeOutCubic(tNormal)) + gBurst * (5.0 + aRand.y * 9.0);
        gAxis = normalize(vec3(sin(aRand.y * 12.9), cos(aRand.y * 7.3), sin(aRand.y * 3.7) + 0.2));
        objectNormal = rotAxis(rotQuat(objectNormal, aQuat), gAxis, gAng);
        `,
      )
      .replace(
        '#include <begin_vertex>',
        /* glsl */ `
        float t = clamp((uAssemble - aRand.x) / max(1.0 - aRand.x, 0.001), 0.0, 1.0);
        float e = easeOutCubic(t);
        vec3 target = formation(uPhase);
        vec3 pos = mix(aStart, target, e);
        float loose = 1.0 - e;

        /* each re-formation shatters outward before it lands */
        vec3 dir = normalize(pos + vec3(0.0001));
        pos += dir * gBurst * (0.85 + aRand.y * 1.1);
        pos.z += gBurst * (aRand.y - 0.5) * 1.6;

        pos += vec3(
          sin(uTime * 0.55 + aRand.y * 6.2831),
          cos(uTime * 0.47 + aRand.y * 5.113),
          sin(uTime * 0.61 + aRand.y * 4.117)
        ) * (loose * 0.2 + gBurst * 0.06);

        vec2 md = pos.xy - uMouse;
        float mdist = length(md);
        float push = smoothstep(1.35, 0.0, mdist) * uHover * (0.5 + 0.5 * loose);
        pos.xy += normalize(md + vec2(0.0001)) * push * 0.7;

        /* plate dimensions come from the seed: thin, irregular shards */
        vec3 shardScale = vec3(
          0.062 + hash11(aRand.y * 31.7) * 0.105,
          0.020 + hash11(aRand.y * 71.3 + 3.0) * 0.046,
          0.006 + hash11(aRand.y * 53.9 + 7.0) * 0.014
        );

        vec3 shard = rotAxis(rotQuat(position * shardScale, aQuat), gAxis, gAng);
        vec3 transformed = pos + shard;
        `,
      )
  }

  const mesh = new THREE.InstancedMesh(geometry, material, count)
  mesh.frustumCulled = false
  mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage)

  const identity = new THREE.Matrix4()
  for (let i = 0; i < count; i += 1) identity.toArray(mesh.instanceMatrix.array, i * 16)

  const starts = new Float32Array(count * 3)
  const formationTargets = Array.from({ length: 5 }, () => new Float32Array(count * 3))
  const quats = new Float32Array(count * 4)
  const rand = new Float32Array(count * 2)

  const quat = new THREE.Quaternion()
  const euler = new THREE.Euler()
  const palette = [
    new THREE.Color('#24241f'),
    new THREE.Color('#8a877d'),
    new THREE.Color('#f0eee6'),
    new THREE.Color('#fbe23d'),
  ]
  const color = new THREE.Color()

  for (let i = 0; i < count; i += 1) {
    const point = deals[0][i % deals[0].length]
    const jitterX = (Math.random() - 0.5) * (spreadX / 220)
    const jitterY = (Math.random() - 0.5) * (spreadY / 220)

    const cluster = Math.min(3, Math.max(0, Math.floor(((point[0] + spreadX / 2) / spreadX) * 4)))
    const anchor = CORNERS[cluster]

    const radius = 1.6
    starts[i * 3] = anchor[0] + (Math.random() - 0.5) * radius * 2
    starts[i * 3 + 1] = anchor[1] + (Math.random() - 0.5) * radius * 1.7
    starts[i * 3 + 2] = anchor[2] + (Math.random() - 0.5) * radius * 2

    const z = (Math.random() - 0.5) * 0.16

    deals.forEach((points, formation) => {
      const target = points[i % points.length]
      const array = formationTargets[formation]
      array[i * 3] = target[0] + jitterX
      array[i * 3 + 1] = target[1] + jitterY
      array[i * 3 + 2] = z
    })

    /* flat plates facing the camera: the glyph reads as a metal
       mosaic instead of a furball */
    euler.set((Math.random() - 0.5) * 0.62, (Math.random() - 0.5) * 0.62, Math.random() * Math.PI * 2)
    quat.setFromEuler(euler)
    quats[i * 4] = quat.x
    quats[i * 4 + 1] = quat.y
    quats[i * 4 + 2] = quat.z
    quats[i * 4 + 3] = quat.w

    rand[i * 2] = 0.02 + (3 - cluster) * 0.09 + Math.random() * 0.14
    rand[i * 2 + 1] = Math.random()

    const roll = Math.random()
    const tint = roll > 0.94 ? palette[3] : roll > 0.82 ? palette[2] : roll > 0.45 ? palette[1] : palette[0]
    color.copy(tint)
    mesh.setColorAt(i, color)
  }

  geometry.setAttribute('aStart', new THREE.InstancedBufferAttribute(starts, 3))
  formationTargets.forEach((array, index) => {
    geometry.setAttribute(`aT${index}`, new THREE.InstancedBufferAttribute(array, 3))
  })
  geometry.setAttribute('aQuat', new THREE.InstancedBufferAttribute(quats, 4))
  geometry.setAttribute('aRand', new THREE.InstancedBufferAttribute(rand, 2))

  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  group.add(mesh)

  /* ── framing ───────────────────────────────────────────────── */
  let fitScale = 1

  const tanHalfFov = () => Math.tan((camera.fov * Math.PI) / 360)

  const resize = () => {
    const parent = canvas.parentElement
    const width = parent?.clientWidth || window.innerWidth
    const height = parent?.clientHeight || window.innerHeight

    renderer.setSize(width, height, false)
    camera.aspect = width / Math.max(height, 1)
    camera.updateProjectionMatrix()

    const halfWidth = tanHalfFov() * camera.position.z * camera.aspect
    const halfHeight = tanHalfFov() * camera.position.z

    /* Leave room for the HUD: width AND height are capped so a tall
       word can never run under the type. */
    const widthShare = camera.aspect < 1.15 ? 0.9 : 0.72
    const heightShare = camera.aspect < 1.15 ? 0.26 : 0.44

    fitScale = Math.min(
      1.4,
      (halfWidth * 2 * widthShare) / spreadX,
      (halfHeight * 2 * heightShare) / spreadY,
    )
    group.scale.setScalar(fitScale)
  }

  resize()

  /* ── pointer ───────────────────────────────────────────────── */
  const pointer = new THREE.Vector2()
  const rotation = new THREE.Vector2()
  let hover = 0
  let hoverTarget = 0

  const setPointer = (x: number, y: number) => {
    const width = canvas.clientWidth || window.innerWidth
    const height = canvas.clientHeight || window.innerHeight
    const nx = (x / width) * 2 - 1
    const ny = -((y / height) * 2 - 1)

    const halfHeight = tanHalfFov() * camera.position.z
    pointer.set((nx * halfHeight * camera.aspect) / fitScale, (ny * halfHeight) / fitScale)
    rotation.set(ny * -0.16, nx * 0.3)
    hoverTarget = 1
  }

  const setHover = (value: number) => {
    hoverTarget = value
  }

  /* ── render ────────────────────────────────────────────────── */
  let targetPhase = 0
  let targetAssemble = 0
  let currentPhase = 0
  let currentAssemble = 0

  const setFrame = (phase: number, assemble: number) => {
    targetPhase = Math.min(4, Math.max(0, phase))
    targetAssemble = Math.min(1, Math.max(0, assemble))
  }

  const render = (time: number) => {
    /* different damping per axis: the shatter snaps, the landing settles */
    currentPhase += (targetPhase - currentPhase) * 0.09
    currentAssemble += (targetAssemble - currentAssemble) * 0.075
    hover += (hoverTarget - hover) * 0.08

    uniforms.uPhase.value = currentPhase
    uniforms.uAssemble.value = currentAssemble
    uniforms.uTime.value = time
    uniforms.uHover.value = hover
    uniforms.uMouse.value.lerp(pointer, 0.12)

    group.rotation.y += (rotation.y - group.rotation.y) * 0.06
    group.rotation.x += (rotation.x - group.rotation.x) * 0.06

    renderer.render(scene, camera)
  }

  const dispose = () => {
    geometry.dispose()
    material.dispose()
    envMap.texture.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    scene.clear()
  }

  return { setFrame, setPointer, setHover, resize, render, dispose }
}

/* ============================================================
   Text → points. Arabic is shaped by the browser before we read
   the pixels, so the geometry follows the real letterforms.
   ============================================================ */
function sampleText(text: string, target = 7600, step = 3) {
  const width = 1600
  const height = 720
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return { points: [[0, 0]] as [number, number][], width: WORD_WIDTH, height: 2 }

  const size = /[\u0600-\u06FF]/.test(text) ? 380 : 300
  context.fillStyle = '#ffffff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `700 ${size}px Changa, "Space Grotesk", sans-serif`
  context.fillText(text, width / 2, height / 2 + size * 0.08)

  const data = context.getImageData(0, 0, width, height).data
  const raw: [number, number][] = []

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] > 140) raw.push([x, y])
    }
  }

  if (raw.length === 0) return { points: [[0, 0]] as [number, number][], width: WORD_WIDTH, height: 2 }

  /* One shard per sampled pixel, spread evenly over the whole glyph.
     Taking every nth point (instead of a random subset) keeps every
     letter solid — no holes, no patchy dots. */
  const points: [number, number][] = []
  const stride = raw.length / Math.min(target, raw.length)

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const [x, y] of raw) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  const boxWidth = Math.max(maxX - minX, 1)
  const boxHeight = Math.max(maxY - minY, 1)
  const scale = WORD_WIDTH / boxWidth
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  const total = Math.min(target, raw.length)
  for (let i = 0; i < total; i += 1) {
    const [x, y] = raw[Math.min(raw.length - 1, Math.floor(i * stride))]
    points.push([(x - centerX) * scale, (centerY - y) * scale])
  }

  return { points, width: WORD_WIDTH, height: boxHeight * scale }
}
