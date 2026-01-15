import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useThemeColor } from '@/context/ThemeColorContext'
import { readStationStorage, FocusItem } from '../focusStationStorage'
import { TicketIcon } from '../icons'

type ScratchCardProps = {
  onStartFocus?: (task: string, id: string) => void
  onFlipBack: () => void
}

export const ScratchCard = ({ onStartFocus, onFlipBack }: ScratchCardProps) => {
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
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white dark:bg-gray-800">
      {/* Revealed Content (Underneath) */}
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        {targetTask ? (
          <>
            <div className="mb-4">
              <TicketIcon className="h-10 w-10 text-yellow-500" />
            </div>
            <h3 className="mb-2 text-sm font-bold tracking-wider text-gray-400 uppercase">
              Your Task
            </h3>
            <p
              className={`line-clamp-4 text-2xl font-black ${isCartoon ? 'text-black dark:text-white' : 'text-gray-900 dark:text-white'}`}
            >
              {targetTask.content}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => onStartFocus?.(targetTask.content, targetTask.id)}
                className={`rounded-lg px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 ${
                  isWarm ? 'bg-[#C27B4A]' : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                Let's do it!
              </button>
              <button
                onClick={onFlipBack}
                className="rounded-lg bg-gray-100 px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Skip
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <span className="mb-2 text-4xl">😴</span>
            <p className="text-gray-500">No tasks available</p>
            <button
              onClick={onFlipBack}
              className="mt-4 rounded-lg bg-gray-100 px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200"
            >
              Back
            </button>
          </div>
        )}
      </div>

      {/* Scratch Layer (Overlay) */}
      <div
        ref={containerRef}
        role="button"
        tabIndex={0}
        className={`absolute inset-0 z-10 flex cursor-none items-center justify-center transition-opacity duration-700 ${
          isRevealed ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block touch-none" />

        <div className="pointer-events-none absolute flex flex-col items-center">
          <span className="text-4xl">✨</span>
          <p
            className={`mt-2 text-lg font-bold ${isCartoon ? 'text-white mix-blend-difference' : 'text-white'}`}
          >
            Scratch to Reveal
          </p>
        </div>
      </div>
    </div>
  )
}
