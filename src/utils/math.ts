export const clamp = (v: number, a = 0, b = 1): number => Math.max(a, Math.min(b, v))
export const ease = (t: number): number => 1 - Math.pow(1 - t, 3)
