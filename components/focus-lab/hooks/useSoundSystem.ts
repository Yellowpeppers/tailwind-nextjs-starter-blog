import { useState, useCallback, useEffect, useRef } from 'react'
import { debounce, isEqual } from 'lodash'
import { useTranslation } from '@/context/LanguageContext'
import { useFocusSettingsContext } from '@/components/focus-lab/FocusSettingsContext'
import { ActiveTrack, SoundOption } from '../types'
import { SOUND_LIBRARY } from '../constants'

export const useSoundSystem = () => {
  const { t } = useTranslation()
  const { settings, updateSettings, isLoaded: isSettingsLoaded } = useFocusSettingsContext()

  // State
  const [customSounds, setCustomSounds] = useState<SoundOption[]>([])
  const [activeTracks, setActiveTracks] = useState<Record<string, ActiveTrack>>({})
  const [masterVolume, setMasterVolume] = useState(0.8)
  const isSoundEnabled = settings.focus_lab?.sound?.enabled ?? true

  // Helper: Combine libraries
  const allSounds = [...SOUND_LIBRARY, ...customSounds]

  // Audio Instances Management
  const audioInstances = useRef<Record<string, HTMLAudioElement>>({})

  // Logic Refs
  const isLoaded = useRef(false)
  const isRemoteUpdate = useRef(false)
  const autoPauseAppliedRef = useRef(false)
  const prevSoundSettingsRef = useRef<{
    active_tracks?: Record<string, ActiveTrack>
    master_volume?: number
  }>({})

  // 1. Fetch Custom Sounds
  useEffect(() => {
    const fetchCustomSounds = async () => {
      try {
        const response = await fetch('/api/sounds')
        if (response.ok) {
          const data = await response.json()
          const BRAINWAVE_SOUNDS = new Set(['alpha', 'beta', 'delta', 'gamma', 'theta'])
          const NOISE_SOUNDS = ['white-noise', 'pink', 'brown']

          const newSounds = data.sounds
            .map((file: string) => ({
              id: `custom-${file}`,
              name: file.replace(/\.[^/.]+$/, ''),
              path: `/static/sounds/custom/${file}`,
              detail: 'Custom sound',
            }))
            .sort((a: { name: string }, b: { name: string }) => {
              // Same sorting logic as original
              const isABrainwave = BRAINWAVE_SOUNDS.has(a.name)
              const isBBrainwave = BRAINWAVE_SOUNDS.has(b.name)
              if (isABrainwave && !isBBrainwave) return 1
              if (!isABrainwave && isBBrainwave) return -1
              if (isABrainwave && isBBrainwave) return a.name.localeCompare(b.name)

              const aNoiseIndex = NOISE_SOUNDS.indexOf(a.name)
              const bNoiseIndex = NOISE_SOUNDS.indexOf(b.name)
              if (aNoiseIndex !== -1 && bNoiseIndex !== -1) return aNoiseIndex - bNoiseIndex
              if (aNoiseIndex !== -1 && bNoiseIndex === -1) return 1
              if (aNoiseIndex === -1 && bNoiseIndex !== -1) return -1

              return a.name.localeCompare(b.name)
            })

          setCustomSounds(newSounds)
        }
      } catch (error) {
        console.error('Failed to fetch custom sounds:', error)
      }
    }
    fetchCustomSounds()
  }, [])

  // 2. Load Settings
  useEffect(() => {
    if (!isSettingsLoaded) return
    // Simple version:
    const soundSettings = settings.focus_lab?.sound
    const nextTracks = soundSettings?.active_tracks
    const nextVolume = soundSettings?.master_volume
    const prev = prevSoundSettingsRef.current

    if (!autoPauseAppliedRef.current) {
      const hasTracks = !!nextTracks && Object.keys(nextTracks).length > 0
      const shouldAutoPause = hasTracks && (soundSettings?.enabled ?? true)
      if (shouldAutoPause) {
        updateSettings('focus_lab.sound.enabled', false)
      }
      autoPauseAppliedRef.current = true
    }

    // Check equality to avoid loop
    if (
      isEqual(nextTracks, prev.active_tracks) &&
      nextVolume === prev.master_volume &&
      isLoaded.current
    )
      return

    isRemoteUpdate.current = true
    if (nextTracks) setActiveTracks(nextTracks)
    if (typeof nextVolume === 'number') setMasterVolume(nextVolume)

    prevSoundSettingsRef.current = { active_tracks: nextTracks, master_volume: nextVolume }

    // Give it a moment to stabilize
    if (!isLoaded.current) {
      setTimeout(() => {
        isRemoteUpdate.current = false
        isLoaded.current = true
      }, 50)
    } else {
      isRemoteUpdate.current = false
    }
  }, [isSettingsLoaded, settings.focus_lab?.sound, updateSettings])

  // 3. Save Settings Debounced
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveSoundSettings = useCallback(
    debounce((tracks: Record<string, ActiveTrack>, volume: number) => {
      updateSettings('focus_lab.sound.active_tracks', tracks)
      updateSettings('focus_lab.sound.master_volume', volume)
    }, 1000),
    [updateSettings]
  )

  // 4. Persistence Trigger
  useEffect(() => {
    if (isLoaded.current && !isRemoteUpdate.current && isSettingsLoaded) {
      saveSoundSettings(activeTracks, masterVolume)
    }
  }, [activeTracks, masterVolume, isSettingsLoaded, saveSoundSettings])

  // 5. Actions
  const toggleTrack = useCallback((soundId: string) => {
    setActiveTracks((prev) => {
      if (prev[soundId]) {
        const next = { ...prev }
        delete next[soundId]
        return next
      }
      return {
        ...prev,
        [soundId]: { id: soundId, volume: 0.5, isPlaying: true },
      }
    })
  }, [])

  const updateTrackVolume = useCallback((soundId: string, volume: number) => {
    setActiveTracks((prev) => ({
      ...prev,
      [soundId]: { ...prev[soundId], volume },
    }))
  }, [])

  const updateMasterVolume = useCallback((vol: number) => {
    setMasterVolume(vol)
  }, [])

  const toggleMasterPlayback = useCallback(() => {
    updateSettings('focus_lab.sound.enabled', !isSoundEnabled)
  }, [isSoundEnabled, updateSettings])

  // 6. Audio Sync Logic (Imperative)
  useEffect(() => {
    const instances = audioInstances.current

    // Tracks currently in state
    const targetIds = new Set(Object.keys(activeTracks))

    // A. Remove tracks not in state
    Object.keys(instances).forEach((id) => {
      if (!targetIds.has(id)) {
        const audio = instances[id]
        audio.pause()
        audio.src = '' // Cleanup
        delete instances[id]
      }
    })

    // B. Add/Update tracks
    Object.values(activeTracks).forEach((track) => {
      let audio = instances[track.id]
      if (!audio) {
        // Create new
        const soundDef = allSounds.find((s) => s.id === track.id)
        if (soundDef) {
          audio = new Audio(soundDef.path)
          audio.loop = true
          instances[track.id] = audio
        } else {
          console.warn(`[SoundSystem] Definition not found for ${track.id}`)
          return
        }
      }

      // Sync Volume
      audio.volume = Math.max(0, Math.min(1, track.volume * masterVolume))

      // Sync Play State
      // Should play if: Track is active (it is), Track.isPlaying (it is), AND Master Sound Enabled
      const shouldPlay = track.isPlaying && isSoundEnabled

      if (shouldPlay && audio.paused) {
        audio.play().catch((e) => {
          if (e.name === 'NotAllowedError') {
            console.warn(
              `[SoundSystem] Auto-play blocked for ${track.id}. Waiting for user interaction.`
            )
            // Optional: You could add logic here to properly update state to "paused"
            // or set a flag to retry on next global click.
          } else {
            console.error(`Failed to play ${track.id}:`, e)
          }
        })
      } else if (!shouldPlay && !audio.paused) {
        audio.pause()
      }
    })
  }, [activeTracks, masterVolume, isSoundEnabled, allSounds])

  // 7. BuBu Integration
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBuBuSoundControl = (event: Event) => {
      const detail = (event as CustomEvent).detail as {
        action: string
        sound?: string
        volume?: number
      }

      if (detail.action === 'stop' || detail.action === 'pause') {
        if (detail.sound) {
          const targetSound = allSounds.find(
            (s) => s.name.toLowerCase() === detail.sound?.toLowerCase() || s.id === detail.sound
          )
          if (targetSound) {
            setActiveTracks((prev) => {
              const next = { ...prev }
              delete next[targetSound.id]
              return next
            })
          }
        } else {
          updateSettings('focus_lab.sound.enabled', false)
        }
      } else if (detail.action === 'play') {
        if (!isSoundEnabled) {
          updateSettings('focus_lab.sound.enabled', true)
        }
        if (detail.sound) {
          const targetSound = allSounds.find(
            (s) => s.name.toLowerCase() === detail.sound?.toLowerCase() || s.id === detail.sound
          )
          const bestMatch =
            targetSound ||
            allSounds.find((s) => s.name.toLowerCase().includes(detail.sound!.toLowerCase()))

          if (bestMatch) {
            setActiveTracks((prev) => ({
              ...prev,
              [bestMatch.id]: { id: bestMatch.id, volume: detail.volume || 0.5, isPlaying: true },
            }))
          }
        } else {
          // Resume or Default
          if (Object.keys(activeTracks).length === 0) {
            const rainSound = allSounds.find((s) => s.id === 'rain') || allSounds[0]
            if (rainSound) {
              setActiveTracks({
                [rainSound.id]: { id: rainSound.id, volume: 0.5, isPlaying: true },
              })
            }
          }
        }
      } else if (detail.action === 'volume') {
        if (detail.volume !== undefined) updateMasterVolume(detail.volume)
      }
    }

    window.addEventListener('bubu-sound-control', handleBuBuSoundControl)
    return () => window.removeEventListener('bubu-sound-control', handleBuBuSoundControl)
  }, [allSounds, isSoundEnabled, activeTracks, updateSettings, updateMasterVolume])

  return {
    state: {
      activeTracks,
      masterVolume,
      isSoundEnabled,
      customSounds,
      allSounds,
      isGlobalPlaying: Object.keys(activeTracks).length > 0 && isSoundEnabled, // isGlobalPlaying derived
    },
    actions: {
      toggleTrack,
      updateTrackVolume,
      updateMasterVolume,
      toggleMasterPlayback,
    },
  }
}

export type UseSoundSystemResult = ReturnType<typeof useSoundSystem>
