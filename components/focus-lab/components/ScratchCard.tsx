import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useThemeColor } from '@/context/ThemeColorContext'
import { readStationStorage, FocusItem } from '../focusStationStorage'
import { TicketIcon } from '../icons'
import { FocusTaskCard } from '../FocusStation'

type ScratchCardProps = {
  onStartFocus?: (task: string, id: string) => void
  onFlipBack: () => void
  className?: string
}

export const ScratchCard = ({ onStartFocus, onFlipBack, className }: ScratchCardProps) => {
  const { user } = useAuth()
  const { uiStyle } = useThemeColor()
  const isCartoon = uiStyle === 'cartoon'
  const isWarm = uiStyle === 'warm'
  const { t } = useTranslation()

  const [targetTask, setTargetTask] = useState<FocusItem | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize: Pick a random task
  useEffect(() => {
    const allItems = readStationStorage(user?.id)
    const activeItems = allItems.filter((i) => !i.completed)

    if (activeItems.length > 0) {
      const randomItem = activeItems[Math.floor(Math.random() * activeItems.length)]
      setTargetTask(randomItem)
    } else {
      setTargetTask(null)
    }
  }, [user?.id])

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !targetTask) return

    const overlayColor = isCartoon ? '#000000' : '#333333'

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.fillStyle = overlayColor
    ctx.fillRect(0, 0, width, height)

    ctx.globalCompositeOperation = 'destination-out'
  }, [targetTask, isCartoon])

  const checkRevealProgress = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    let transparentPixels = 0
    const totalPixels = data.length / 4

    for (let i = 0; i < totalPixels; i += 10) {
      if (data[i * 4 + 3] === 0) transparentPixels++
    }

    if (transparentPixels / (totalPixels / 10) > 0.4) {
      setIsRevealed(true)
    }
  }

  const lastPosition = useRef<{ x: number; y: number } | null>(null)

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas || isRevealed) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineWidth = 70
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    if (lastPosition.current) {
      ctx.moveTo(lastPosition.current.x, lastPosition.current.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    } else {
      ctx.arc(x, y, 35, 0, Math.PI * 2)
      ctx.fill()
    }

    lastPosition.current = { x, y }
    checkRevealProgress()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        lastPosition.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
        scratch(e.clientX, e.clientY)
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1) {
      lastPosition.current = null
      return
    }
    scratch(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    lastPosition.current = null
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      lastPosition.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      }
      scratch(touch.clientX, touch.clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    scratch(touch.clientX, touch.clientY)
  }

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className ?? 'rounded-2xl'}`}
    >
      {!targetTask ? (
        <div className="flex flex-col items-center">
          <span className="mb-2 text-4xl">😴</span>
          <p className="text-gray-500">
            {t.focusLab.widgets.todo.emptyTitle || 'No tasks available'}
          </p>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 z-0 flex items-center justify-center p-4">
            <FocusTaskCard
              item={targetTask}
              onToggleAction={() => {}}
              onRemoveAction={() => {}}
              onStartFocusAction={onStartFocus}
              variant="reward"
              isWarm={isWarm}
              isGreen={uiStyle === 'green'}
              isBlue={uiStyle === 'blue'}
              isCartoon={isCartoon}
            />
          </div>

          <div
            ref={containerRef}
            role="button"
            tabIndex={0}
            className={`absolute inset-0 z-10 flex cursor-none items-center justify-center transition-opacity duration-700 ${
              isRevealed ? 'pointer-events-none invisible opacity-0' : 'visible opacity-100'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            <canvas ref={canvasRef} className="absolute inset-0 block touch-none" />

            <div className="pointer-events-none absolute flex flex-col items-center">
              <span className="text-4xl">✨</span>
              <p
                className={`mt-2 text-lg font-bold ${
                  isCartoon ? 'text-white mix-blend-difference' : 'text-white'
                }`}
              >
                Scratch to Reveal
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
