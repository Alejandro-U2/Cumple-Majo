import { useCallback, useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { clamp } from '@/utils/math'

export type ProgressListener = (progress: number) => void

export interface ScrollProgress {
  targetRef: RefObject<HTMLElement>
  progressRef: RefObject<number>
  subscribe: (listener: ProgressListener) => () => void
}

export function useScrollProgress<T extends HTMLElement>(): ScrollProgress {
  const targetRef = useRef<T>(null)
  const progressRef = useRef(0)
  const listenersRef = useRef(new Set<ProgressListener>())

  const subscribe = useCallback((listener: ProgressListener) => {
    listenersRef.current.add(listener)
    listener(progressRef.current)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  useEffect(() => {
    const el = targetRef.current
    if (!el) return

    let frame = 0
    let last = -1

    const update = () => {
      frame = 0
      const rect = el.getBoundingClientRect()
      const travel = Math.max(1, el.offsetHeight - window.innerHeight)
      const next = clamp(-rect.top / travel)
      if (next === last) return
      last = next
      progressRef.current = next
      listenersRef.current.forEach((listener) => listener(next))
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return { targetRef, progressRef, subscribe }
}
