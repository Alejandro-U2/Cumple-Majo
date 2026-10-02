import { useEffect, useRef, useState } from 'react'
import type { ConfettiParticle } from '@/utils/confetti'
import { createBurst } from '@/utils/confetti'

export function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particles, setParticles] = useState<ConfettiParticle[]>([])
  const [running, setRunning] = useState(false)
  const rafRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    if (!running || particles.length === 0) {
      if (particles.length === 0 && running) {
        setRunning(false)
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const loop = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const next = particles
        .map((p) => ({
          ...p,
          vy: p.vy + 0.33,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vx: p.vx * 0.985,
          rot: p.rot + p.vr,
        }))
        .filter((p) => p.y < h + 40)

      setParticles(next)

      for (const p of next) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, 1 - (p.y / h) * 0.65)
        ctx.fillStyle = p.color
        if (p.shape) {
          ctx.fillRect(-p.size / 2, -p.size * 0.9, p.size, p.size * 1.8)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      if (next.length > 0) {
        rafRef.current = requestAnimationFrame(loop)
      } else {
        setRunning(false)
        ctx.clearRect(0, 0, w, h)
      }
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [running, particles])

  const burst = (n = 180) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setParticles((prev) => [...prev, ...createBurst(canvas.width, canvas.height, n)])
    setRunning(true)
  }

  useEffect(() => {
    const handler = () => burst(180)
    window.addEventListener('confetti:burst', handler as EventListener)
    return () => window.removeEventListener('confetti:burst', handler as EventListener)
  }, [])

  return <canvas id="confetti" ref={canvasRef} />
}
