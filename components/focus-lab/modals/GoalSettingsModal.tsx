'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/context/LanguageContext'

export interface GoalSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  // Goal values
  tempGoalHours: string
  tempTaskGoal: string
  onTempGoalHoursChange: (value: string) => void
  onTempTaskGoalChange: (value: string) => void
  // Progress
  currentProgressHours: number
  progressPercentage: number
  tasksCompletedToday: number
  taskProgressPercentage: number
  // Streak and Reward
  streak: number
  rewardUnlocked: boolean
  // Actions
  onSave: () => void
}

export const GoalSettingsModal = ({
  isOpen,
  onClose,
  tempGoalHours,
  tempTaskGoal,
  onTempGoalHoursChange,
  onTempTaskGoalChange,
  currentProgressHours,
  progressPercentage,
  tasksCompletedToday,
  taskProgressPercentage,
  streak,
  rewardUnlocked,
  onSave,
}: GoalSettingsModalProps) => {
  const { t } = useTranslation()

  const formatHours = (value: number) => (Math.round(value * 10) / 10).toFixed(1)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white p-0 shadow-2xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-50 p-6 px-8 dark:border-gray-800/50">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                  {t.focusLab.widgets.goal.modalTitle}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-400">
                  {t.focusLab.widgets.goal.modalSubtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left Column: Settings */}
              <div className="flex flex-col justify-center gap-12 border-b border-gray-50 p-8 md:border-r md:border-b-0 dark:border-gray-800/50">
                <div className="space-y-12">
                  {/* Goal 1: Hours */}
                  <div className="group">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="icon-[solar--clock-circle-bold-duotone] text-primary-500 text-2xl" />
                        <label className="text-sm font-black tracking-widest text-gray-400 uppercase">
                          {t.focusLab.widgets.goal.hours}
                        </label>
                      </div>
                      <span className="text-primary-500 text-2xl font-black">{tempGoalHours}h</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="12"
                      step="0.5"
                      value={tempGoalHours}
                      onChange={(e) => onTempGoalHoursChange(e.target.value)}
                      className="accent-primary-500 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 dark:bg-gray-800"
                    />
                    <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-400 uppercase opacity-60">
                      <span>
                        {t.focusLab.widgets.goal.current}: {formatHours(currentProgressHours)}h
                      </span>
                      <span>
                        {t.focusLab.widgets.goal.progress}:{' '}
                        {Math.min(100, Math.round(progressPercentage))}%
                      </span>
                    </div>
                  </div>

                  {/* Goal 2: Tasks */}
                  <div className="group">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="icon-[solar--checklist-minimalistic-bold-duotone] text-2xl text-emerald-500" />
                        <label className="text-sm font-black tracking-widest text-gray-400 uppercase">
                          {t.focusLab.widgets.goal.tasks}
                        </label>
                      </div>
                      <span className="text-2xl font-black text-emerald-500">{tempTaskGoal}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={tempTaskGoal}
                      onChange={(e) => onTempTaskGoalChange(e.target.value)}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-emerald-500 dark:bg-gray-800"
                    />
                    <div className="mt-4 flex items-center justify-between text-xs font-bold text-gray-400 uppercase opacity-60">
                      <span>
                        {t.focusLab.widgets.goal.completed}: {tasksCompletedToday}
                      </span>
                      <span>
                        {t.focusLab.widgets.goal.progress}:{' '}
                        {Math.min(100, Math.round(taskProgressPercentage))}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & Reward */}
              <div className="bg-gray-50/50 p-6 dark:bg-gray-900/50">
                <div className="flex h-full flex-col gap-4">
                  {/* Streak Bento Card */}
                  <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800/50">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-900/20"
                    >
                      <span className="icon-[solar--fire-bold-duotone] text-4xl text-orange-500" />
                    </motion.div>
                    <div className="text-center">
                      <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        {t.focusLab.widgets.goal.streak}
                      </div>
                      <div className="text-4xl font-black text-gray-900 dark:text-white">
                        {streak}{' '}
                        <span className="text-base font-bold text-gray-400">
                          {streak === 1
                            ? t.focusLab.widgets.goal.streakDay
                            : t.focusLab.widgets.goal.streakDays}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reward Bento Card */}
                  <div
                    className={cn(
                      'group relative flex flex-1 items-center gap-4 overflow-hidden rounded-3xl border p-5 transition-all duration-500',
                      rewardUnlocked
                        ? 'border-amber-100 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-900/10'
                        : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-800/50'
                    )}
                  >
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-2xl dark:bg-gray-800">
                      <span
                        className={cn(
                          'transition-transform duration-500 group-hover:scale-110',
                          rewardUnlocked
                            ? 'icon-[solar--magic-stick-3-bold-duotone] text-amber-500'
                            : 'icon-[solar--box-linear] text-gray-400'
                        )}
                      />
                    </div>
                    <div className="relative z-10">
                      <div className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                        {t.focusLab.widgets.goal.reward}
                      </div>
                      <div className="text-sm font-black text-gray-900 dark:text-white">
                        {rewardUnlocked
                          ? t.focusLab.widgets.goal.rewardUnlocked
                          : t.focusLab.widgets.goal.rewardLocked}
                      </div>
                    </div>

                    {/* Decal background icon */}
                    <span className="icon-[solar--medal-ribbons-star-bold] absolute -right-2 -bottom-2 text-6xl text-gray-100 opacity-20 dark:text-gray-800" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 bg-gray-50/50 p-6 px-8 dark:bg-gray-900/50">
              <button
                onClick={onClose}
                className="rounded-full px-5 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                {t.auth.profile.cancel}
              </button>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />
              <button
                onClick={onSave}
                className="bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 rounded-full px-10 py-3 text-sm font-black text-white shadow-lg transition-all active:scale-95"
              >
                {t.focusLab.widgets.goal.save}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
