export interface ConfettiParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rot: number
  vr: number
  shape: boolean
}

export function createBurst(w: number, h: number, n = 180): ConfettiParticle[] {
  const cols = ['#ff9fb4', '#ffd7a7', '#c9f7d9', '#bcd9ff', '#f6b2ff', '#fff']
  const arr: ConfettiParticle[] = []
  for (let i = 0; i < n; i++) {
    arr.push({
      x: Math.random() * w,
      y: h * (0.25 + Math.random() * 0.35),
      vx: (Math.random() - 0.5) * 7.5,
      vy: -(Math.random() * 10 + 4.5),
      size: 6 + Math.random() * 8,
      color: cols[Math.floor(Math.random() * cols.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.32,
      shape: Math.random() > 0.45,
    })
  }
  return arr
}
