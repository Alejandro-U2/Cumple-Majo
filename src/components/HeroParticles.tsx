import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { particleVertexShader } from '@/shaders/particle.vert'
import { particleFragmentShader } from '@/shaders/particle.frag'
import { makeGlyphTargets, makeInfinityTargets } from '@/utils/glyphs'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { clamp, ease } from '@/utils/math'

interface HeroParticlesProps {
  progressRef: RefObject<number>
  onConfettiTrigger: () => void
}

export function HeroParticles({ progressRef, onConfettiTrigger }: HeroParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const confettiFiredRef = useRef(false)
  const draggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartYRef = useRef(0)
  const dragStartRotXRef = useRef(0)
  const dragStartRotYRef = useRef(0)
  const returnRotationRef = useRef(false)
  const confettiTriggerRef = useRef(onConfettiTrigger)

  useEffect(() => {
    confettiTriggerRef.current = onConfettiTrigger
  }, [onConfettiTrigger])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let w = window.innerWidth
    let h = window.innerHeight
    let renderer: THREE.WebGLRenderer
    let scene: THREE.Scene
    let camera: THREE.PerspectiveCamera
    let galaxy: THREE.Points
    let material: THREE.ShaderMaterial
    let geometry: THREE.BufferGeometry
    let orbitDust: THREE.Points
    let orbitMaterial: THREE.PointsMaterial
    let orbitGeometry: THREE.BufferGeometry
    const basePositions: number[] = []
    const points: Array<{ phase: number }> = []
    const mouse = new THREE.Vector2(-10, -10)
    const raycaster = new THREE.Raycaster()
    const clock = new THREE.Clock()
    let rafId = 0

    const stage = canvas.parentElement
    let heroFades: HTMLElement[] = []
    let infFades: HTMLElement[] = []
    let scrollCue: HTMLElement | null = null
    let scrollMessage: HTMLElement | null = null
    let peopleSection: HTMLElement | null = null
    let infinityStartProgress = 0.82
    let infinityLabelStartProgress = 0.92
    const lastOpacity = new Map<HTMLElement, number>()
    let messageShown = false

    const collectOverlays = () => {
      if (!stage) return
      heroFades = Array.from(stage.querySelectorAll<HTMLElement>('[data-hero-fade]'))
      infFades = Array.from(stage.querySelectorAll<HTMLElement>('[data-inf-fade]'))
      scrollCue = stage.querySelector<HTMLElement>('[data-scroll-cue]')
      scrollMessage = stage.querySelector<HTMLElement>('[data-scroll-message]')
      peopleSection = stage.parentElement?.querySelector<HTMLElement>('.people-section') ?? null
      lastOpacity.clear()
      messageShown = false
      updateFinaleProgress()
    }

    const applyOpacity = (el: HTMLElement | null, value: number) => {
      if (!el) return
      const v = Math.round(value * 1000) / 1000
      if (lastOpacity.get(el) === v) return
      lastOpacity.set(el, v)
      el.style.opacity = String(v)
    }

    const applyOpacityAll = (els: HTMLElement[], value: number) => {
      for (let i = 0; i < els.length; i++) applyOpacity(els[i], value)
    }

    const setMessageShown = (show: boolean) => {
      if (!scrollMessage || messageShown === show) return
      messageShown = show
      scrollMessage.classList.toggle('show', show)
    }

    const updateFinaleProgress = () => {
      const hero = stage?.parentElement
      if (!hero || !peopleSection) return
      const travel = Math.max(1, hero.offsetHeight - window.innerHeight)
      const heroTop = hero.getBoundingClientRect().top
      const peopleBottom = peopleSection.getBoundingClientRect().bottom - heroTop
      infinityStartProgress = clamp(peopleBottom / travel, 0, 0.98)
      infinityLabelStartProgress = infinityStartProgress + (1 - infinityStartProgress) * 0.42
    }

    const init = () => {
      scene = new THREE.Scene()
      scene.fog = new THREE.FogExp2(0x04060a, 0.00075)
      const vmin = Math.min(w, h)
      let fov = 38
      if (vmin < 420) fov = 44
      else if (vmin < 600) fov = 42
      else if (vmin < 900) fov = 40
      else fov = 38
      camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 3000)
      let camZ = 17
      if (vmin < 420) camZ = 20
      else if (vmin < 600) camZ = 18.5
      else if (vmin < 900) camZ = 17.5
      else camZ = 17
      camera.position.set(0, 0, camZ)
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h, false)
      ;(renderer as any).outputEncoding = THREE.sRGBEncoding
      renderer.setClearColor(0x000000, 0)
      const targets = makeGlyphTargets('3', w, h)
      const targets2 = makeInfinityTargets(w, h)
      const count = targets.length
      const c2 = targets2.length
      geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(count * 3)
      const scales = new Float32Array(count)
      const randomness = new Float32Array(count * 3)
      const spreads = new Float32Array(count * 3)
      const glyph2Arr = new Float32Array(count * 3)
      const warms = new Float32Array(count)
      const flows = new Float32Array(count)
      basePositions.length = 0
      points.length = 0
      for (let i = 0; i < count; i++) {
        const t = targets[i]
        const i3 = i * 3
        const t2 = targets2[Math.min(c2 - 1, Math.floor((i * c2) / count))]
        const z = (Math.random() - 0.5) * 0.32
        positions[i3] = t.x * 0.0125
        positions[i3 + 1] = t.y * 0.0125
        positions[i3 + 2] = z
        glyph2Arr[i3] = t2.x * 0.0125 * 0.85
        glyph2Arr[i3 + 1] = t2.y * 0.0125 * 0.85
        glyph2Arr[i3 + 2] = (Math.random() - 0.5) * 0.26
        const jitter = 0.015
        randomness[i3] = (Math.random() - 0.5) * jitter
        randomness[i3 + 1] = (Math.random() - 0.5) * jitter
        randomness[i3 + 2] = (Math.random() - 0.5) * jitter * 0.35
        const sizeRoll = Math.random()
        if (sizeRoll < 0.58) {
          scales[i] = 0.28 + Math.random() * 0.55
        } else if (sizeRoll < 0.92) {
          scales[i] = 0.78 + Math.random() * 0.75
        } else {
          scales[i] = 1.55 + Math.random() * 1.35
        }
        warms[i] = Math.random() > 0.82 ? 1 : 0
        flows[i] = ((i / count) + Math.random() * 0.08) % 1.0
        const angle = Math.random() * Math.PI * 2
        const radial = Math.pow(Math.random(), 0.52) * (7.5 + Math.random() * 4)
        const vertical = (Math.random() - 0.5) * (2.4 + radial * 0.28)
        const sx = Math.cos(angle) * radial
        const sy = vertical
        const sz = Math.sin(angle) * radial * 0.72 + (Math.random() - 0.5) * 1.6
        spreads[i3] = sx
        spreads[i3 + 1] = sy
        spreads[i3 + 2] = sz
        basePositions.push(positions[i3], positions[i3 + 1], positions[i3 + 2])
        points.push({ phase: Math.random() * Math.PI * 2 })
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
      geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
      geometry.setAttribute('aSpread', new THREE.BufferAttribute(spreads, 3))
      geometry.setAttribute('aGlyph2', new THREE.BufferAttribute(glyph2Arr, 3))
      geometry.setAttribute('aWarm', new THREE.BufferAttribute(warms, 1))
      geometry.setAttribute('aFlow', new THREE.BufferAttribute(flows, 1))
      material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: (40 + Math.min(w, h) * 0.012) * renderer.getPixelRatio() },
          uSpread: { value: 0 },
          uSpread2: { value: 0 },
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
      })
      galaxy = new THREE.Points(geometry, material)
      scene.add(galaxy)
      const dustCount = w < 700 ? 450 : 1100
      const dpos = new Float32Array(dustCount * 3)
      const dsize = new Float32Array(dustCount)
      for (let i = 0; i < dustCount; i++) {
        const a = Math.random() * Math.PI * 2
        const r = 5 + Math.random() * 8
        dpos[i * 3] = Math.cos(a) * r
        dpos[i * 3 + 1] = (Math.random() - 0.5) * (1.2 + r * 0.17)
        dpos[i * 3 + 2] = Math.sin(a) * r * 0.68
        dsize[i] = Math.random() * 0.7 + 0.25
      }
      orbitGeometry = new THREE.BufferGeometry()
      orbitGeometry.setAttribute('position', new THREE.BufferAttribute(dpos, 3))
      orbitGeometry.setAttribute('aSize', new THREE.BufferAttribute(dsize, 1))
      orbitMaterial = new THREE.PointsMaterial({
        color: 0xc9a3d6,
        size: 0.035,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
      orbitDust = new THREE.Points(orbitGeometry, orbitMaterial)
      orbitDust.rotation.x = -0.18
      scene.add(orbitDust)
    }

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      if (camera) {
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.setSize(w, h, false)
      }
      updateFinaleProgress()
    }

    const pointerMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / w) * 2 - 1
      mouse.y = -(e.clientY / h) * 2 + 1
    }

    const pointerLeave = () => {
      mouse.set(-10, -10)
    }

    const onDown = (e: PointerEvent) => {
      // Touch input belongs to page navigation; keep drag rotation for desktop mice.
      if (reduced || e.pointerType !== 'mouse') return
      draggingRef.current = true
      returnRotationRef.current = false
      dragStartXRef.current = e.clientX
      dragStartYRef.current = e.clientY
      dragStartRotXRef.current = galaxy.rotation.x
      dragStartRotYRef.current = galaxy.rotation.y
      canvas.setPointerCapture?.(e.pointerId)
      canvas.style.cursor = 'grabbing'
    }

    const onMoveDrag = (e: PointerEvent) => {
      if (!draggingRef.current) return
      e.preventDefault?.()
      const dx = e.clientX - dragStartXRef.current
      const dy = e.clientY - dragStartYRef.current
      const sensitivity = window.innerWidth < 600 ? 0.012 : 0.009
      galaxy.rotation.y = dragStartRotYRef.current + dx * sensitivity
      galaxy.rotation.x = dragStartRotXRef.current + dy * sensitivity
      galaxy.rotation.x = THREE.MathUtils.clamp(galaxy.rotation.x, -1.15, 1.15)
      galaxy.rotation.y = THREE.MathUtils.clamp(galaxy.rotation.y, -1.65, 1.65)
    }

    const release = (e: PointerEvent) => {
      if (!draggingRef.current) return
      draggingRef.current = false
      returnRotationRef.current = true
      canvas.releasePointerCapture?.(e.pointerId)
      canvas.style.cursor = 'crosshair'
    }

    const onLostPointerCapture = () => {
      if (draggingRef.current) {
        draggingRef.current = false
        returnRotationRef.current = true
        canvas.style.cursor = 'crosshair'
      }
    }

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      const p = progressRef.current ?? 0
      const s1 = ease(clamp((p - 0.03) / 0.28))
      const s2 = ease(clamp((p - infinityStartProgress) / Math.max(0.001, 1 - infinityStartProgress)))
      ;(material.uniforms.uTime as THREE.IUniform).value = reduced ? 0 : elapsed
      ;(material.uniforms.uSpread as THREE.IUniform).value = s1
      ;(material.uniforms.uSpread2 as THREE.IUniform).value = s2
      if (draggingRef.current) {
        returnRotationRef.current = false
      } else {
        const k = reduced ? 0.1 : 0.08
        const drift = s1 > 0.02 && s2 < 0.02 ? 0.45 + 0.18 * Math.sin(elapsed * 0.25) : 0
        galaxy.rotation.x += (0 - galaxy.rotation.x) * k
        galaxy.rotation.y += (drift - galaxy.rotation.y) * k
        galaxy.rotation.z += (0 - galaxy.rotation.z) * k
        if (Math.abs(galaxy.rotation.x) < 0.0005) galaxy.rotation.x = 0
        if (Math.abs(galaxy.rotation.z) < 0.0005) galaxy.rotation.z = 0
      }
      if (!reduced) {
        orbitDust.rotation.y += 0.00016
        orbitDust.rotation.z += 0.000035
      }
      setMessageShown(s1 > 0.28 && s1 < 0.84)
      applyOpacity(scrollCue, Math.max(0, 1 - s1 * 2.2))
      applyOpacityAll(heroFades, Math.max(0, 1 - s1 * 2.6))
      const infFade = clamp((p - infinityLabelStartProgress) / Math.max(0.001, 1 - infinityLabelStartProgress))
      applyOpacityAll(infFades, infFade)
      if (infFade > 0.6 && !confettiFiredRef.current) {
        confettiFiredRef.current = true
        confettiTriggerRef.current()
      }
      const posArr = geometry.attributes.position.array as Float32Array
      if (!reduced) {
        raycaster.setFromCamera(mouse, camera)
        const hit = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(16))
        for (let i = 0; i < points.length; i++) {
          const i3 = i * 3
          const bx = basePositions[i3]
          const by = basePositions[i3 + 1]
          const bz = basePositions[i3 + 2]
          const dx = bx - hit.x
          const dy = by - hit.y
          const d = Math.sqrt(dx * dx + dy * dy)
          const radius = 0.95
          let rx = 0,
            ry = 0
          if (d < radius) {
            const q = (1 - d / radius) ** 2
            rx = (dx / (d || 1)) * q * 0.28
            ry = (dy / (d || 1)) * q * 0.28
          }
          posArr[i3] = bx + rx
          posArr[i3 + 1] = by + ry
          posArr[i3 + 2] = bz
        }
        ;(geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true
      }
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }

    init()
    resize()
    collectOverlays()
    animate()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', pointerMove, { passive: true })
    window.addEventListener('pointerleave', pointerLeave, { passive: true })
    canvas.addEventListener('pointerdown', onDown, { passive: true })
    canvas.addEventListener('pointermove', onMoveDrag, { passive: false })
    canvas.addEventListener('pointerup', release, { passive: true })
    canvas.addEventListener('pointercancel', release, { passive: true })
    canvas.addEventListener('lostpointercapture', onLostPointerCapture)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', pointerMove)
      window.removeEventListener('pointerleave', pointerLeave)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMoveDrag)
      canvas.removeEventListener('pointerup', release)
      canvas.removeEventListener('pointercancel', release)
      canvas.removeEventListener('lostpointercapture', onLostPointerCapture)
      geometry?.dispose()
      material?.dispose()
      orbitGeometry?.dispose()
      orbitMaterial?.dispose()
      renderer?.dispose()
    }
  }, [reduced])

  return <canvas ref={canvasRef} className="particle-canvas no-select" aria-label="Composición de partículas formando el número 3" />
}
