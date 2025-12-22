'use client'

import { useCallback, useMemo, useRef } from 'react'
import type { IConfettiOptions, Shape } from 'canvas-confetti'

type CelebrationVariant = 'confetti' | 'sakura' | 'fireworks'

type CelebrationOptions = Partial<
  Pick<
    IConfettiOptions,
    | 'particleCount'
    | 'spread'
    | 'angle'
    | 'origin'
    | 'colors'
    | 'scalar'
    | 'startVelocity'
    | 'ticks'
    | 'gravity'
    | 'drift'
    | 'zIndex'
    | 'decay'
  >
> & {
  variant?: CelebrationVariant
  respectMotionPreference?: boolean
}

// 基础烟花配置
const baseOptions: IConfettiOptions = {
  particleCount: 80,
  spread: 70,
  origin: { y: 0.7 },
  disableForReducedMotion: true,
}

const sakuraColors = ['#fdf2f8', '#fce7f3', '#f9a8d4', '#f472b6', '#fb7185']
const fireworksColors = ['#fef08a', '#facc15', '#fb7185', '#38bdf8', '#a78bfa', '#34d399']

export function useCelebration() {
  const confettiLibRef = useRef<typeof import('canvas-confetti') | null>(null)
  const confettiFireRef = useRef<ReturnType<(typeof import('canvas-confetti'))['create']> | null>(
    null
  )
  const loaderRef = useRef<
    Promise<{
      lib: typeof import('canvas-confetti')
      fire: ReturnType<(typeof import('canvas-confetti'))['create']>
    } | null>
  >(null)
  const petalShapeRef = useRef<Shape | null>(null)
  const lastFiredRef = useRef(0)

  const loadConfetti = useCallback((): Promise<{
    lib: typeof import('canvas-confetti')
    fire: ReturnType<(typeof import('canvas-confetti'))['create']>
  } | null> => {
    if (confettiLibRef.current && confettiFireRef.current) {
      return Promise.resolve({
        lib: confettiLibRef.current,
        fire: confettiFireRef.current,
      })
    }
    if (loaderRef.current) return loaderRef.current

    loaderRef.current = import('canvas-confetti')
      .then((mod) => {
        const lib = mod.default || (mod as unknown as typeof import('canvas-confetti'))
        const fire = lib.create(undefined, { useWorker: false, resize: true })
        confettiLibRef.current = lib
        confettiFireRef.current = fire
        return { lib, fire }
      })
      .catch((e) => {
        console.error('Failed to load confetti module', e)
        return null
      })
      .finally(() => {
        loaderRef.current = null
      })

    return loaderRef.current
  }, [])

  const ensurePetalShape = useCallback(async (): Promise<Shape | null> => {
    if (petalShapeRef.current) return petalShapeRef.current
    const result = await loadConfetti()
    if (!result) return null
    const { lib } = result
    if (!lib.shapeFromPath) return null

    const path = 'M16 0 C 8 8, 6 16, 10 24 C 14 32, 22 32, 24 24 C 26 16, 24 8, 16 0 Z'
    const matrix = typeof DOMMatrix !== 'undefined' ? new DOMMatrix().scale(0.8, 1.05) : undefined
    const shape = matrix ? lib.shapeFromPath({ path, matrix }) : lib.shapeFromPath(path)
    petalShapeRef.current = shape
    return shape
  }, [loadConfetti])

  const shoot = useCallback(
    (options?: CelebrationOptions, skipThrottle = false) => {
      const now = Date.now()
      if (!skipThrottle) {
        if (now - lastFiredRef.current < 1200) return
        lastFiredRef.current = now
      }

      const run = async () => {
        const result = await loadConfetti()
        if (!result) return
        const { fire } = result

        const { variant = 'fireworks', ...rest } = options ?? {}
        if (variant === 'fireworks') {
          const baseCount = rest.particleCount ?? 120
          const baseSpread = rest.spread ?? 95
          const baseVelocity = rest.startVelocity ?? 36
          const baseDecay = rest.decay ?? 0.89
          const baseGravity = rest.gravity ?? 0.9
          const baseTicks = rest.ticks ?? 320
          const baseScalar = rest.scalar ?? 1
          const colors = rest.colors ?? fireworksColors
          const zIndex = rest.zIndex ?? 1400
          const disable = rest.respectMotionPreference ?? false

          const randomOrigin = () => ({
            x: Math.random() * 0.8 + 0.1,
            y: Math.random() * 0.25 + 0.05,
          })

          const fireShot = (payload?: Partial<IConfettiOptions>) =>
            fire({
              ...baseOptions,
              particleCount: baseCount,
              spread: baseSpread,
              startVelocity: baseVelocity,
              decay: baseDecay,
              gravity: baseGravity,
              ticks: baseTicks,
              scalar: baseScalar,
              drift: rest.drift ?? (Math.random() - 0.5) * 0.9,
              origin: randomOrigin(),
              colors,
              zIndex,
              disableForReducedMotion: disable,
              ...rest,
              ...payload,
            })

          fireShot()
          const sequence = [
            {
              delay: 140,
              payload: {
                particleCount: Math.round(baseCount * 0.6),
                spread: baseSpread + 15,
                startVelocity: baseVelocity + 6,
                scalar: baseScalar * 1.05,
                origin: randomOrigin(),
              },
            },
            {
              delay: 280,
              payload: {
                particleCount: Math.round(baseCount * 0.55),
                spread: baseSpread + 25,
                startVelocity: baseVelocity + 10,
                decay: baseDecay + 0.02,
                origin: { x: Math.random() > 0.5 ? 0.2 : 0.8, y: 0.12 },
              },
            },
            {
              delay: 420,
              payload: {
                particleCount: Math.round(baseCount * 0.5),
                spread: baseSpread + 18,
                startVelocity: baseVelocity + 4,
                origin: randomOrigin(),
              },
            },
            {
              delay: 620,
              payload: {
                particleCount: Math.round(baseCount * 0.45),
                spread: baseSpread + 28,
                startVelocity: baseVelocity + 8,
                decay: baseDecay + 0.015,
                scalar: baseScalar * 1.08,
                origin: { x: Math.random() * 0.9 + 0.05, y: 0.18 },
              },
            },
            {
              delay: 820,
              payload: {
                particleCount: Math.round(baseCount * 0.4),
                spread: baseSpread + 35,
                startVelocity: baseVelocity + 12,
                decay: baseDecay + 0.025,
                scalar: baseScalar * 0.9,
                gravity: baseGravity + 0.08,
                origin: { x: 0.5, y: 0.12 },
              },
            },
          ]

          sequence.forEach(({ delay, payload }) => {
            setTimeout(() => fireShot(payload), delay)
          })
          return
        }
        if (variant === 'sakura') {
          const petalShape = (await ensurePetalShape()) ?? 'circle'
          const origin = rest.origin ?? { x: Math.random() * 0.9 + 0.05, y: 0.05 }

          fire({
            ...baseOptions,
            particleCount: rest.particleCount ?? 26,
            spread: rest.spread ?? 150,
            startVelocity: rest.startVelocity ?? 14,
            decay: rest.decay ?? 0.9,
            gravity: rest.gravity ?? 0.5,
            drift: rest.drift ?? (Math.random() - 0.5) * 1.25,
            scalar: rest.scalar ?? 1 + Math.random() * 0.2,
            ticks: rest.ticks ?? 420,
            origin,
            colors: rest.colors ?? sakuraColors,
            shapes: [petalShape],
            zIndex: rest.zIndex ?? 1300,
            disableForReducedMotion: rest.respectMotionPreference ?? false,
          })
          return
        }

        fire({
          ...baseOptions,
          ...rest,
          disableForReducedMotion: rest.respectMotionPreference ?? false,
        })
      }

      run()
    },
    [ensurePetalShape, loadConfetti]
  )

  const fire = useCallback((options?: CelebrationOptions) => shoot(options, false), [shoot])

  const burst = useCallback(
    (options?: CelebrationOptions) => {
      const variant = options?.variant ?? 'fireworks'
      if (variant === 'fireworks') {
        shoot({ ...options, variant }, false)
        return
      }
      const baseAngle = options?.angle ?? 90
      const spread = options?.spread ?? (variant === 'sakura' ? 110 : 80)
      const baseCount =
        options?.particleCount ?? (variant === 'sakura' ? 18 : (baseOptions.particleCount ?? 80))
      const sideCount = Math.max(8, Math.round(baseCount * 0.5))

      shoot(
        {
          ...options,
          particleCount: baseCount,
          spread,
          angle: baseAngle,
        },
        false
      )

      setTimeout(
        () =>
          shoot(
            {
              ...options,
              particleCount: sideCount,
              angle: baseAngle - 25,
              spread: spread + 10,
            },
            true
          ),
        200
      )

      setTimeout(
        () =>
          shoot(
            {
              ...options,
              particleCount: sideCount,
              angle: baseAngle + 25,
              spread: spread + 10,
            },
            true
          ),
        420
      )

      if (variant === 'sakura') {
        setTimeout(
          () =>
            shoot(
              {
                ...options,
                particleCount: Math.max(12, Math.round(baseCount * 0.45)),
                angle: baseAngle + (Math.random() > 0.5 ? 18 : -18),
                spread: spread + 20,
                origin: { x: Math.random() * 0.9 + 0.05, y: 0.1 },
                startVelocity: 11,
              },
              true
            ),
          680
        )
      }
    },
    [shoot]
  )

  const preload = useCallback(() => {
    loadConfetti()
    ensurePetalShape()
  }, [ensurePetalShape, loadConfetti])

  return useMemo(
    () => ({
      celebrate: fire,
      burst,
      preload,
    }),
    [burst, fire, preload]
  )
}
