import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/context/LanguageContext'
import { useThemeColor, UIStyle } from '@/context/ThemeColorContext'
import { UseTaskBreakerResult } from '../hooks/useTaskBreaker'
import { MagicIcon, ArrowLaunchIcon, PlusIcon } from '../icons'

export const TaskBreakerWidget = ({
  taskBreaker,
  uiStyle,
  isResultView,
}: {
  taskBreaker: UseTaskBreakerResult
  uiStyle?: UIStyle
  isResultView: boolean
}) => {
  const isWarm = uiStyle === 'warm'
  const isGreen = uiStyle === 'green'
  const isBlue = uiStyle === 'blue'
  const isCartoon = uiStyle === 'cartoon'
  const { t, language: lang } = useTranslation()

  const { state, actions } = taskBreaker
  const { task, visibleSteps, isLoading, error, isTransferring, hasTransferred, transferStatus } =
    state
  const { setTask, handleBreakDown, handleTransferToTodo, handleReset } = actions

  if (isResultView) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-stretch gap-4">
          {/* Left: Task Content Area */}
          <div
            className={`${isCartoon ? 'border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-primary-50 dark:bg-primary-900/20'} relative flex flex-1 items-center justify-center rounded-[24px] p-6`}
          >
            <p
              className={`text-center text-sm leading-relaxed font-bold ${isCartoon ? 'text-black' : 'text-gray-900 dark:text-gray-100'}`}
            >
              {task}
            </p>
          </div>

          {/* Right: Iconic Actions */}
          <div className="flex shrink-0 flex-col gap-2">
            <button
              onClick={handleTransferToTodo}
              disabled={visibleSteps.length === 0 || isLoading || isTransferring || hasTransferred}
              className={`${
                isCartoon
                  ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 shadow-sm transition-all'
              } flex h-[48px] w-[48px] items-center justify-center rounded-2xl disabled:opacity-30`}
              title={t.focusLab.widgets.taskBreaker.transferButton}
            >
              {isTransferring ? (
                <span className="border-primary-500/60 border-t-primary-500 h-4 w-4 animate-spin rounded-full border-2" />
              ) : (
                <ArrowLaunchIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={handleReset}
              className={`${
                isCartoon
                  ? 'border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]'
                  : 'bg-gray-50 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-600 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300'
              } flex h-[48px] w-[48px] items-center justify-center rounded-2xl`}
              title={t.focusLab.widgets.taskBreaker.newTask}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        {transferStatus !== 'idle' && (
          <p
            className={`text-xs font-semibold ${
              transferStatus === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-500 dark:text-red-400'
            }`}
          >
            {transferStatus === 'success'
              ? t.focusLab.widgets.taskBreaker.transferSuccess
              : t.focusLab.widgets.taskBreaker.transferError}
          </p>
        )}

        <div
          className={`no-scrollbar flex-1 overflow-y-auto rounded-2xl border ${isCartoon ? 'border-2 border-black' : 'border-dashed border-gray-200 dark:border-gray-700'} p-1 pr-2 [&::-webkit-scrollbar]:hidden`}
        >
          {isLoading ? (
            <div
              className={`flex h-full flex-col items-center justify-center gap-3 ${isWarm || isGreen || isBlue ? 'text-white/70' : 'text-gray-400'}`}
            >
              <div className="border-primary-200 border-t-primary-500 h-8 w-8 animate-spin rounded-full border-4" />
              <p className="text-xs font-medium">{t.focusLab.widgets.taskBreaker.summoning}</p>
            </div>
          ) : (
            <ul className="space-y-2 p-2">
              {visibleSteps.map((step, index) => (
                <TaskStepItem key={`${step}-${index}`} step={step} />
              ))}
              {error && <p className="p-2 text-xs text-red-500">{error}</p>}
            </ul>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col pb-0">
      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-xl flex-col items-center gap-2">
          <div
            className={`${isWarm ? 'bg-white/10 text-[#C27B4A]' : isGreen ? 'bg-[#F8F9F7] text-[#7A9F7A]' : isBlue ? 'bg-[#E0EEF8] text-[#5B84B1]' : isCartoon ? 'border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black' : 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'} flex h-12 w-12 items-center justify-center rounded-2xl`}
          >
            <MagicIcon className="h-6 w-6" />
          </div>

          <h3
            className={`text-lg font-bold ${isCartoon ? 'text-white' : isWarm || isGreen || isBlue ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}
          >
            {t.focusLab.widgets.taskBreaker.overwhelmed}
          </h3>

          <textarea
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder={
              lang === 'zh'
                ? '输入任务，AI帮你拆解步骤...\n\n例如： 打扫整个公寓...'
                : 'Enter a task, AI breaks it down...\n\ne.g., Clean the entire apartment...'
            }
            className={`${
              isWarm || isGreen || isBlue
                ? 'focus:ring-accent border-white/10 bg-white/10 text-white placeholder:text-white/50'
                : isCartoon
                  ? 'border-2 border-black bg-white text-black placeholder:text-gray-400 focus:ring-0 dark:border-white dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500'
                  : 'focus:border-primary-500 focus:ring-primary-500 border-gray-100 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus:bg-gray-800'
            } no-scrollbar mt-1 h-24 w-full resize-none rounded-2xl border px-3 py-3 text-sm focus:ring-2 focus:outline-none`}
          />
        </div>
      </div>

      <div className="mt-auto flex justify-center pt-2 pb-0">
        <button
          type="button"
          onClick={handleBreakDown}
          disabled={!task.trim()}
          className={`flex w-auto min-w-[100px] items-center justify-center gap-2 px-4 py-2 text-sm font-bold shadow-lg transition-all active:scale-95 disabled:active:scale-100 dark:shadow-none ${
            isWarm
              ? 'rounded-lg bg-[#C27B4A] text-white shadow-[#C27B4A]/30 hover:bg-[#A6663E]'
              : isGreen
                ? 'rounded-lg bg-[#7A9F7A] text-white shadow-[#7A9F7A]/30 hover:bg-[#688868]'
                : isBlue
                  ? 'rounded-lg bg-[#5B84B1] text-white shadow-[#5B84B1]/30 hover:bg-[#4A6E94]'
                  : isCartoon
                    ? 'rounded-lg bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none dark:bg-white dark:text-black dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                    : 'bg-primary-500 shadow-primary-500/30 hover:bg-primary-600 rounded-full text-white dark:text-white'
          }`}
        >
          {t.focusLab.widgets.taskBreaker.button}
        </button>
      </div>
    </div>
  )
}

const TaskStepItem = ({ step }: { step: string }) => {
  const [isChecked, setIsChecked] = useState(false)
  const { uiStyle } = useThemeColor()
  const isCartoon = uiStyle === 'cartoon'
  const isCustomAi = isCartoon || uiStyle === 'warm' || uiStyle === 'green' || uiStyle === 'blue'

  return (
    <motion.li
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsChecked(!isChecked)}
      className={`group flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors ${
        isCustomAi
          ? isCartoon
            ? 'hover:bg-black/5 dark:hover:bg-white/5'
            : 'hover:bg-white/10 dark:hover:bg-white/10'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => {}} // Handled by parent onClick
        className={`pointer-events-none h-5 w-5 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 ${
          isCustomAi
            ? isCartoon
              ? 'text-black focus:ring-black dark:text-white dark:focus:ring-white'
              : 'text-white focus:ring-white'
            : 'text-primary-500 focus:ring-primary-500'
        }`}
      />
      <span
        className={`text-sm transition-all ${
          isChecked
            ? isCartoon
              ? 'text-gray-400 line-through dark:text-gray-500'
              : isCustomAi
                ? 'text-white/50 line-through'
                : 'text-gray-400 line-through dark:text-gray-500'
            : isCartoon
              ? 'text-black group-hover:text-black dark:text-white dark:group-hover:text-white'
              : isCustomAi
                ? 'text-white group-hover:text-white'
                : 'text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100'
        } `}
      >
        {step}
      </span>
    </motion.li>
  )
}
