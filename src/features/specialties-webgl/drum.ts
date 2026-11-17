import * as THREE from 'three'

/**
 * SPECIALTIES — the revolving drum.
 *
 * Four printed sheets sit on a shared vertical axis, each a segment of one
 * cylinder. Scroll spins the drum; the sheet closest to the front is sharp,
 * the others are ghosts of themselves. Every sheet is printed on the front
 * and black on the back, so a plate arriving from the side first reads as a
 * curved dark surface and only reveals its print once it turns toward you.
 */

export interface DrumHandle {
  setProgress: (progress: number) => void
  render: (time: number) => void
  resize: () => void
  dispose: () => void
}

interface DrumOptions {
  canvas: HTMLCanvasElement
  images: string[]
  onActive?: (index: number) => void
}

const STEP = Math.PI / 2
/** the plates are 900 × 1112 — keep their aspect or the print smears */
const SHEET_H = 2.8
const SHEET_W = SHEET_H * (900 / 1112)

/** one cylinder for the whole drum: each sheet is a 70° slice of it */
const RADIUS = 1.86
const ARC = SHEET_W / RADIUS

const OFFSETS = [0.035, -0.02, 0.05, -0.045]
const ECHO_RADIUS = RADIUS - 0.62
const ECHO_OFFSETS = [0.16, -0.13, 0.14, -0.17]

/** how much of the carousel's height the printed plate fills */
const FILL = 0.76

interface Panel {
  angle: number
  echoAngle: number
  object: THREE.Object3D
  material: THREE.ShaderMaterial
  echo: THREE.ShaderMaterial
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalView;

  void main() {
    vUv = uv;
    vNormalView = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform float uHasMap;
  uniform float uBack;
  uniform vec3 uTint;
  uniform vec3 uBackColor;

  varying vec2 vUv;
  varying vec3 vNormalView;

  void main() {
    // the print darkens toward its curved edges — the curve reads as paper
    float edge = abs(vUv.x - 0.5) * 2.0;
    float shade = 1.0 - 0.34 * pow(edge, 1.6);

    // light rakes across the curve: bright at the belly, falling at the ends
    float lambert = max(dot(normalize(vNormalView), vec3(0.0, 0.0, 1.0)), 0.0);
    float light = 0.55 + 0.45 * lambert;

    vec3 print = uBackColor;
    if (uHasMap > 0.5) {
      print = texture2D(uMap, vUv).rgb * uTint;
    }

    float alpha = uOpacity;
    vec3 color;

    if (gl_FrontFacing) {
      color = print * shade * light;
    } else {
      // the back is a dark sheet that dissolves at its top and bottom edge
      float vfade = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
      color = uBackColor;
      alpha = max(uOpacity, uBack * (0.25 + 0.75 * vfade));
    }

    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`

/** A plane bent around a large horizontal cylinder. */
function curvedSheet(width: number, height: number, arc: number, segments: number) {
  const geometry = new THREE.PlaneGeometry(width, height, segments, 1)
  const position = geometry.attributes.position as THREE.BufferAttribute
  const radius = width / arc

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const theta = x / radius
    position.setX(i, Math.sin(theta) * radius)
    position.setZ(i, -(1 - Math.cos(theta)) * radius)
  }

  geometry.computeVertexNormals()
  return geometry
}

function wrapAngle(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}

function sheetMaterial(texture: THREE.Texture | null, tint: number, back: number) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture },
      uOpacity: { value: 1 },
      uHasMap: { value: texture ? 1 : 0 },
      uBack: { value: back },
      uTint: { value: new THREE.Color(tint, tint, tint) },
      uBackColor: { value: new THREE.Color(0.0024, 0.0024, 0.0022) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}

/** A dim, out-of-focus copy of the image — the ghosts behind the sheets. */
function blurTexture(image: HTMLImageElement) {
  const width = 640
  const height = Math.round((width * image.height) / image.width) || 480
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return null

  try {
    context.filter = 'blur(18px)'
  } catch {
    /* no canvas filter — the echo still reads */
  }

  const scale = Math.max(width / image.width, height / image.height) * 1.14
  const drawW = image.width * scale
  const drawH = image.height * scale
  context.drawImage(image, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function createDrum({ canvas, images, onActive }: DrumOptions): DrumHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 80)
  camera.position.set(0, 0, 8)
  camera.lookAt(0, 0, 0)

  const drum = new THREE.Group()
  scene.add(drum)

  const geometry = curvedSheet(SHEET_W, SHEET_H, ARC, 34)
  const panels: Panel[] = []
  const textures: THREE.Texture[] = []
  const loader = new THREE.TextureLoader()

  images.forEach((src, index) => {
    const angle = index * STEP

    const holder = new THREE.Group()
    holder.position.set(
      Math.sin(angle) * RADIUS,
      OFFSETS[index % OFFSETS.length],
      Math.cos(angle) * RADIUS,
    )
    holder.rotation.y = angle
    drum.add(holder)

    const material = sheetMaterial(null, 1, 0.92)
    holder.add(new THREE.Mesh(geometry, material))

    // echo: a blurred ghost on a tighter circle, seen through the gaps
    const echoAngle = angle + STEP / 2
    const echoHolder = new THREE.Group()
    echoHolder.position.set(
      Math.sin(echoAngle) * ECHO_RADIUS,
      ECHO_OFFSETS[index % ECHO_OFFSETS.length],
      Math.cos(echoAngle) * ECHO_RADIUS,
    )
    echoHolder.rotation.y = echoAngle
    drum.add(echoHolder)

    const echo = sheetMaterial(null, 0.5, 0)
    echoHolder.add(new THREE.Mesh(geometry, echo))

    panels.push({ angle, echoAngle, object: holder, material, echo })

    loader.load(src, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
      textures.push(texture)

      material.uniforms.uMap.value = texture
      material.uniforms.uHasMap.value = 1

      const image = texture.image as HTMLImageElement | undefined
      if (image && image.width) {
        const blurred = blurTexture(image)
        if (blurred) {
          textures.push(blurred)
          echo.uniforms.uMap.value = blurred
          echo.uniforms.uHasMap.value = 1
        }
      }
    })
  })

  let current = 0
  let target = 0
  let last = 0
  let active = -1

  const updateFades = () => {
    const rotation = drum.rotation.y

    for (const panel of panels) {
      const distance = Math.abs(wrapAngle(panel.angle + rotation))
      const raw = 1 - Math.min(1, Math.max(0, (distance - 0.16) / 0.92))
      const fade = raw * raw * (3 - 2 * raw)

      const echoDistance = Math.abs(wrapAngle(panel.echoAngle + rotation))
      const echoRaw = 1 - Math.min(1, Math.max(0, (echoDistance - 0.2) / 1))
      const echoFade = echoRaw * echoRaw * (3 - 2 * echoRaw)

      panel.material.uniforms.uOpacity.value = 0.9 + 0.1 * fade
      panel.echo.uniforms.uOpacity.value = 0.015 + 0.05 * echoFade
    }
  }

  const resize = () => {
    const width = canvas.clientWidth || 1
    const height = canvas.clientHeight || 1
    const aspect = width / height
    const halfTan = Math.tan((camera.fov * Math.PI) / 360)

    // distance at which the front plate fills the carousel's height...
    const fill = aspect < 0.95 ? 0.84 : FILL
    const byHeight = SHEET_H / fill / (2 * halfTan)
    // ...but back off if the same plate would be wider than the column
    const byWidth = SHEET_W / 0.9 / (2 * halfTan * Math.max(0.4, aspect))
    const distance = Math.max(byHeight, byWidth)

    renderer.setSize(width, height, false)
    camera.aspect = aspect
    camera.position.z = distance + RADIUS
    camera.updateProjectionMatrix()

    drum.position.y = 0
  }

  const render = (time: number) => {
    // gsap's ticker hands us seconds; the clamp keeps ms-based callers safe
    const delta = last ? Math.min(0.06, Math.max(0.001, time - last)) : 0.016
    last = time

    current += (target - current) * (1 - Math.exp(-9 * delta))
    drum.rotation.y = -current
    updateFades()
    renderer.render(scene, camera)

    const next = Math.min(images.length - 1, Math.max(0, Math.round(current / STEP)))
    if (next !== active) {
      active = next
      onActive?.(next)
    }
  }

  resize()

  return {
    setProgress: (progress) => {
      // hold the plate at the front for the first ~40% of each step,
      // then turn — otherwise the eye keeps catching two half-lit sheets
      const steps = Math.max(1, images.length - 1)
      const scaled = Math.min(1, Math.max(0, progress)) * steps
      const index = Math.min(steps - 1, Math.floor(scaled))
      const local = Math.min(1, Math.max(0, (scaled - index - 0.4) / 0.6))
      const eased = local * local * (3 - 2 * local)

      target = (index + eased) * STEP
    },
    render,
    resize,
    dispose: () => {
      geometry.dispose()
      for (const panel of panels) {
        panel.material.dispose()
        panel.echo.dispose()
      }
      for (const texture of textures) texture.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}
