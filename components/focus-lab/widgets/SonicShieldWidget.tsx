import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import { useThemeColor } from '@/context/ThemeColorContext'
import { UseSoundSystemResult } from '../hooks/useSoundSystem'
import { SoundVisualizer } from '../components/SoundVisualizer'

export const SonicShieldWidget = ({
  sound,
  isFlipped,
  onFlip,
}: {
  sound: UseSoundSystemResult
  isFlipped: boolean
  onFlip: (v: boolean) => void
}) => {
  const { t } = useTranslation()
  const { uiStyle } = useThemeColor()
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
  const isBlue = uiStyle === 'blue'
  const isCartoon = uiStyle === 'cartoon'

  const { state, actions } = sound
  const { activeTracks, masterVolume, isSoundEnabled, allSounds, isGlobalPlaying } = state
  const { toggleTrack, updateTrackVolume, updateMasterVolume, toggleMasterPlayback } = actions

  const tSounds = t.sounds
  const activeCount = Object.keys(activeTracks).length

  return (
    <div className="@container relative flex h-full flex-col">
      <AnimatePresence mode="wait">
        {isFlipped ? (
          // BACK: Sound Grid
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="flex h-full flex-col gap-3"
          >
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pt-2 pr-1 [&::-webkit-scrollbar]:hidden">
              <div className="grid grid-cols-1 gap-2 @[180px]:grid-cols-2 @[300px]:grid-cols-3">
                {allSounds.map((soundItem) => {
                  const isActive = !!activeTracks[soundItem.id]
                  const track = activeTracks[soundItem.id]

                  return (
                    <div
                      key={soundItem.id}
                      className={`group relative flex items-center justify-between gap-2 rounded-xl border p-2 transition-all ${
                        isActive
                          ? isWarm
                            ? 'border-[#C27B4A] bg-[#F5F2EC]'
                            : isGreen
                              ? 'border-[#7A9F7A] bg-[#F8F9F7]'
                              : isBlue
                                ? 'border-[#5B84B1] bg-[#E0EEF8]'
                                : isCartoon
                                  ? 'border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                                  : 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                          : isCartoon
                            ? 'border-2 border-black bg-white hover:bg-gray-100 dark:border-white dark:bg-gray-900 dark:hover:bg-gray-800'
                            : 'hover:border-primary-200 dark:hover:border-primary-900 border-gray-100 bg-white hover:shadow-sm dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <button
                        onClick={() => toggleTrack(soundItem.id)}
                        className="flex flex-1 items-center text-left"
                      >
                        <span
                          className={`text-xs font-bold ${
                            isActive
                              ? isWarm
                                ? 'text-[#C27B4A]'
                                : isGreen
                                  ? 'text-[#7A9F7A]'
                                  : isBlue
                                    ? 'text-[#5B84B1]'
                                    : isCartoon
                                      ? 'text-white dark:text-black'
                                      : 'text-primary-700 dark:text-primary-300'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {tSounds[soundItem.name as keyof typeof tSounds] || soundItem.name}
                        </span>
                      </button>

                      {isActive && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={track.volume}
                            onChange={(e) =>
                              updateTrackVolume(soundItem.id, parseFloat(e.target.value))
                            }
                            onClick={(e) => e.stopPropagation()}
                            className={`${
                              isWarm
                                ? 'bg-[#C27B4A]/30 accent-[#C27B4A]'
                                : isGreen
                                  ? 'bg-[#7A9F7A]/30 accent-[#7A9F7A]'
                                  : isBlue
                                    ? 'bg-[#5B84B1]/30 accent-[#5B84B1]'
                                    : isCartoon
                                      ? 'bg-white/30 accent-white dark:bg-black/30 dark:accent-black'
                                      : 'bg-primary-200 accent-primary-600 dark:bg-primary-900 dark:accent-primary-400'
                            } h-1 w-14 cursor-pointer rounded-full`}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          // FRONT: Visualizer & Master Volume
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex h-full flex-col justify-center"
          >
            <div className="relative flex h-full w-full flex-col justify-between">
              {/* Center: Visualizer */}
              <div className="flex flex-1 flex-col items-center justify-center pt-8">
                <SoundVisualizer
                  activeCount={isGlobalPlaying ? activeCount : 0}
                  uiStyle={uiStyle}
                />
              </div>

              {/* Bottom: Controls */}
              <div className="flex w-full items-center gap-4 pt-4">
                {/* Play/Pause Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMasterPlayback()
                  }}
                  className="flex h-12 w-12 items-center justify-center text-gray-900 transition-colors hover:opacity-80 dark:text-white"
                  title={isSoundEnabled ? 'Pause' : 'Play'}
                >
                  {isSoundEnabled ? (
                    <span className="icon-[solar--pause-bold] text-2xl" />
                  ) : (
                    <span className="icon-[solar--play-bold] ml-1 text-2xl" />
                  )}
                </button>

                {/* Horizontal Volume Slider */}
                <div className="group flex flex-1 justify-end">
                  <div
                    className="relative h-2 w-full max-w-[120px] cursor-pointer rounded-full bg-gray-100 dark:bg-gray-800"
                    onPointerDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const handleMove = (moveEvent: PointerEvent) => {
                        const width = rect.width
                        const left = rect.left
                        const clientX = moveEvent.clientX
                        const percentage = Math.max(0, Math.min(1, (clientX - left) / width))
                        updateMasterVolume(percentage)
                      }

                      handleMove(e.nativeEvent)

                      const handleUp = () => {
                        window.removeEventListener('pointermove', handleMove)
                        window.removeEventListener('pointerup', handleUp)
                      }

                      window.addEventListener('pointermove', handleMove)
                      window.addEventListener('pointerup', handleUp)
                    }}
                  >
                    <div
                      className={`${isWarm ? 'group-hover:bg-[#C27B4A]' : isGreen ? 'group-hover:bg-[#7A9F7A]' : isBlue ? 'group-hover:bg-[#5B84B1]' : isCartoon ? 'group-hover:bg-black dark:group-hover:bg-white' : 'group-hover:bg-primary-500 dark:group-hover:bg-primary-400'} absolute left-0 h-full rounded-full bg-gray-300 transition-all dark:bg-gray-600`}
                      style={{ width: `${masterVolume * 100}%` }}
                    />
                    <div
                      className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-gray-200"
                      style={{ left: `calc(${masterVolume * 100}% - 7px)` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
