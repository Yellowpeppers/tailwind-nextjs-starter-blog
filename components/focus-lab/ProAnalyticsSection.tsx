'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/context/LanguageContext'
import { getArchivedTasksStats, type ArchivedTask } from './archivedTasksStorage'
import type { FocusSession } from './focusStorage'

import { User } from '@supabase/supabase-js'

interface ProAnalyticsSectionProps {
  sessions: FocusSession[]
  isPro: boolean
  onUpgrade?: () => void
  user?: User | null
  onLogin?: () => void
}

// 格式化时长
const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export const ProAnalyticsSection = ({
  sessions,
  isPro,
  onUpgrade,
  user,
  onLogin,
}: ProAnalyticsSectionProps) => {
  const { language: lang } = useTranslation()

  const [taskStats, setTaskStats] = useState<{
    totalArchived: number
    totalCompleted: number
    completionRate: number
    byWeek: { week: string; completed: number; total: number }[]
  } | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  // 加载归档任务统计
  useEffect(() => {
    if (!user || !isPro) {
      setIsLoading(false)
      return
    }

    const loadStats = async () => {
      try {
        const stats = await getArchivedTasksStats(user, 30)
        setTaskStats(stats)
      } catch (e) {
        console.error('Failed to load task stats:', e)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [user, isPro])

  // 计算高效时段分析
  const getEfficiencyByHour = () => {
    const hourlyStats = new Array(24).fill(0)
    sessions.forEach((s) => {
      const hour = new Date(s.startTime).getHours()
      hourlyStats[hour] += s.durationMinutes
    })
    return hourlyStats
  }

  const hourlyData = getEfficiencyByHour()
  const peakHour = hourlyData.indexOf(Math.max(...hourlyData))
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0)

  // 非 Pro 用户或未登录用户显示模糊预览
  if (!user || !isPro) {
    // 未登录：注册墙状态
    // 已登录未付费：付费墙状态
    const isLoginGate = !user

    const gateContent = isLoginGate
      ? {
          title: lang === 'zh' ? '登录解锁详细报表' : 'Login to Unlock Reports',
          desc:
            lang === 'zh'
              ? '登录后即可启用云端同步，并升级解锁任务完成率、高效时段分析等'
              : 'Login to enable cloud sync and upgrade to unlock completion rates, peak hours analysis and more',
          action: lang === 'zh' ? '立即登录' : 'Login Now',
          handler: onLogin,
        }
      : {
          title: lang === 'zh' ? '解锁详细报表' : 'Unlock Detailed Reports',
          desc:
            lang === 'zh'
              ? '升级 Pro 查看任务完成率、高效时段分析等'
              : 'Upgrade to Pro for completion rates, peak hours, and more',
          action: lang === 'zh' ? '升级 Pro' : 'Upgrade to Pro',
          handler: onUpgrade,
        }

    return (
      <div className="relative mt-6">
        {/* 模糊预览 */}
        <div className="pointer-events-none blur-sm select-none">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="text-sm font-medium text-gray-500">任务完成率</div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">78%</div>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="text-sm font-medium text-gray-500">高效时段</div>
              <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                上午 10 点
              </div>
            </div>
          </div>
          <div className="mt-4 h-32 rounded-xl bg-gray-50 dark:bg-gray-800/50" />
        </div>

        {/* 升级/登录 提示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
          <div className="px-4 text-center">
            <span className="text-4xl">{isLoginGate ? '🔐' : '📊'}</span>
            <h4 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
              {gateContent.title}
            </h4>
            <p className="mt-1 text-sm text-gray-500">{gateContent.desc}</p>
            {gateContent.handler && (
              <button
                onClick={gateContent.handler}
                className={`mt-4 rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors ${
                  isLoginGate
                    ? 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                    : 'bg-primary-500 hover:bg-primary-600'
                }`}
              >
                {gateContent.action}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Pro 用户显示完整报表
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 space-y-4"
    >
      <h3 className="text-primary-600 dark:text-primary-400 flex items-center gap-2 font-bold">
        <span className="icon-[solar--crown-bold] h-5 w-5" />
        {lang === 'zh' ? 'Pro 专属报表' : 'Pro Reports'}
      </h3>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* 任务完成率 */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {lang === 'zh' ? '任务完成率' : 'Completion Rate'}
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {isLoading ? (
              <span className="animate-pulse">--</span>
            ) : (
              `${taskStats?.completionRate ?? 0}%`
            )}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {lang === 'zh' ? '过去 30 天' : 'Last 30 days'}
          </div>
        </div>

        {/* 高效时段 */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {lang === 'zh' ? '高效时段' : 'Peak Hour'}
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {hourlyData[peakHour] > 0 ? (
              <>
                {peakHour}:00
                <span className="ml-1 text-sm font-normal text-gray-400">
                  ({formatDuration(hourlyData[peakHour])})
                </span>
              </>
            ) : (
              <span className="text-gray-400">--</span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {lang === 'zh' ? '专注最多的时段' : 'Most focused hour'}
          </div>
        </div>

        {/* 总专注时长 */}
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {lang === 'zh' ? '总专注时长' : 'Total Focus Time'}
          </div>
          <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {formatDuration(totalMinutes)}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {lang === 'zh' ? '历史累计' : 'All time'}
          </div>
        </div>
      </div>

      {/* 时段分布图 */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
        <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          {lang === 'zh' ? '24 小时专注分布' : '24-Hour Focus Distribution'}
        </h4>
        <div className="flex h-24 items-end gap-1">
          {hourlyData.map((minutes, hour) => {
            const maxMinutes = Math.max(...hourlyData, 1)
            const height = (minutes / maxMinutes) * 100
            const isPeak = hour === peakHour && minutes > 0

            return (
              <div
                key={hour}
                className="group relative flex-1"
                title={`${hour}:00 - ${formatDuration(minutes)}`}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isPeak
                      ? 'bg-primary-500'
                      : 'bg-primary-100 hover:bg-primary-300 dark:bg-primary-900/30 dark:hover:bg-primary-700'
                  }`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                {hour % 6 === 0 && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-gray-400">
                    {hour}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-6 text-center text-xs text-gray-400">
          {lang === 'zh' ? '小时' : 'Hour'}
        </div>
      </div>

      {/* 任务完成趋势 */}
      {taskStats && taskStats.byWeek.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {lang === 'zh' ? '每周任务趋势' : 'Weekly Task Trend'}
          </h4>
          <div className="space-y-2">
            {taskStats.byWeek.slice(-4).map((week) => (
              <div key={week.week} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-gray-500">{week.week}</span>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="bg-primary-500 h-full rounded-full transition-all"
                      style={{
                        width: `${week.total > 0 ? (week.completed / week.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="w-16 shrink-0 text-right text-xs text-gray-500">
                  {week.completed}/{week.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
