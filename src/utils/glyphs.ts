export function makeGlyphTargets(text: string, w: number, h: number): Array<{ x: number; y: number }> {
  const off = document.createElement('canvas')
  const ctx = off.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  off.width = 1400
  off.height = 1500
  ctx.font = '900 1240px Arial, Helvetica, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText(text, 700, 760)
  const data = ctx.getImageData(0, 0, 1400, 1500).data

  let minX = 1400,
    maxX = 0,
    minY = 1500,
    maxY = 0
  for (let y = 0; y < 1500; y += 2) {
    for (let x = 0; x < 1400; x += 2) {
      if (data[(y * 1400 + x) * 4 + 3] > 120) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  const bw = maxX - minX
  const bh = maxY - minY
  const vmin = Math.min(w, h)
  const safeW = Math.min(vmin * (vmin < 480 ? 0.72 : vmin < 700 ? 0.6 : 0.48), w * 0.6)
  const safeH = Math.min(vmin * (vmin < 480 ? 0.62 : vmin < 700 ? 0.5 : 0.42), h * 0.6)
  const scale = Math.min(safeW / bw, safeH / bh)
  let step = w < 480 ? 4 : w < 700 ? 3 : 2
  if (vmin < 420) step = 4
  const raw: Array<{ x: number; y: number }> = []

  for (let y = minY; y <= maxY; y += step) {
    for (let x = minX; x <= maxX; x += step) {
      if (data[(y * 1400 + x) * 4 + 3] > 120) {
        raw.push({
          x: (x - (minX + bw / 2)) * scale,
          y: -(y - (minY + bh / 2)) * scale,
        })
      }
    }
  }

  let maxParticles = w < 480 ? 1600 : w < 700 ? 2400 : 9000
  if (vmin < 380) maxParticles = 1400
  const stride = Math.max(1, Math.ceil(raw.length / maxParticles))
  const targets: Array<{ x: number; y: number }> = []
  for (let i = 0; i < raw.length; i += stride) {
    targets.push(raw[i])
  }
  return targets
}

export function makeInfinityTargets(w: number, h: number): Array<{ x: number; y: number }> {
  const off = document.createElement('canvas')
  const ctx = off.getContext('2d', { willReadFrequently: true })
  if (!ctx) return []
  const W = 1600,
    H = 1600
  off.width = W
  off.height = H
  ctx.strokeStyle = '#fff'
  ctx.lineCap = 'round'
  ctx.lineWidth = 176
  const cy = 800,
    r = 348
  ctx.beginPath()
  ctx.arc(800 - r, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(800 + r, cy, r, 0, Math.PI * 2)
  ctx.stroke()

  const data = ctx.getImageData(0, 0, W, H).data
  let minX = W,
    maxX = 0,
    minY = H,
    maxY = 0
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 110) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  const bw = maxX - minX
  const bh = maxY - minY
  const vmin = Math.min(w, h)
  const safeW = Math.min(vmin * (vmin < 480 ? 0.56 : vmin < 700 ? 0.46 : 0.38), w * 0.5)
  const safeH = Math.min(vmin * (vmin < 480 ? 0.44 : vmin < 700 ? 0.36 : 0.32), h * 0.45)
  const scale = Math.min(safeW / bw, safeH / bh)
  let step = w < 480 ? 4 : w < 700 ? 3 : 2
  if (vmin < 420) step = 4
  const raw: Array<{ x: number; y: number }> = []
  for (let y = minY; y <= maxY; y += step) {
    for (let x = minX; x <= maxX; x += step) {
      if (data[(y * W + x) * 4 + 3] > 110) {
        raw.push({ x: (x - (minX + bw / 2)) * scale, y: -(y - (minY + bh / 2)) * scale })
      }
    }
  }

  let maxParticles = w < 480 ? 1400 : w < 700 ? 1900 : 7200
  if (vmin < 380) maxParticles = 1200
  const stride = Math.max(1, Math.ceil(raw.length / maxParticles))
  const targets: Array<{ x: number; y: number }> = []
  for (let i = 0; i < raw.length; i += stride) {
    targets.push(raw[i])
  }
  return targets
}
