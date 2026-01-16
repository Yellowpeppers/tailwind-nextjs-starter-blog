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

  // --- Centralized Data Engine ---
  // Calculates real analytics for Pro users, or returns high-fidelity mock data for Preview
  const analyticsData = (() => {
    // If NOT Pro, return static Mock Data immediately
    if (!isPro) {
      return {
        totalMinutes: 21777,
        peakHour: 9, // 9:00 AM
        // Mock data matching the "Apple Screen Time" look we fixed previously
        hourlyData: [0, 0, 0, 0, 0, 0, 5, 25, 45, 60, 50, 20, 18, 35, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        topTasks: [
          [lang === 'zh' ? '编程' : 'Coding', 5760],
          [lang === 'zh' ? '深度工作' : 'Deep Work', 5216],
          [lang === 'zh' ? '会议' : 'Meeting', 4800],
          [lang === 'zh' ? '阅读' : 'Reading', 3600],
          [lang === 'zh' ? '运动' : 'Exercise', 2401],
        ] as [string, number][],
      }
    }

    // --- Real Pro Logic ---
    const hourlyStats = new Array(24).fill(0)
    const taskMap = new Map<string, number>()
    let totalMins = 0

    // Use local midnight for Today
    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1

    sessions.forEach((s) => {
      // 1. Accumulate Total Minutes & Top Tasks
      const name = s.taskName || (lang === 'zh' ? '普通专注' : 'General Focus')
      taskMap.set(name, (taskMap.get(name) || 0) + s.durationMinutes)
      totalMins += s.durationMinutes

      // 2. Calculate Hourly Distribution (Precise splitting)
      const sStart = Number(s.startTime)
      const sEnd = sStart + Number(s.durationMinutes) * 60 * 1000

      // Find overlap between session and Today
      const overlapStart = Math.max(sStart, dayStart)
      const overlapEnd = Math.min(sEnd, dayEnd)

      if (overlapStart < overlapEnd) {
        let current = overlapStart
        while (current < overlapEnd) {
          const currentHourStart = new Date(current)
          currentHourStart.setMinutes(0, 0, 0)
          currentHourStart.setMilliseconds(0)

          const nextHourStart = new Date(currentHourStart)
          nextHourStart.setHours(currentHourStart.getHours() + 1)

          // Determine how much of this specific hour is covered
          const chunkEnd = Math.min(overlapEnd, nextHourStart.getTime())
          const chunkMinutes = (chunkEnd - current) / (1000 * 60)

          const hourIdx = currentHourStart.getHours()
          if (hourIdx >= 0 && hourIdx < 24) {
            hourlyStats[hourIdx] += chunkMinutes
          }
          current = chunkEnd
        }
      }
    })

    const sortedTasks = Array.from(taskMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // Find peak hour
    const maxVal = Math.max(...hourlyStats)
    const pkh = maxVal > 0 ? hourlyStats.indexOf(maxVal) : -1

    return {
      totalMinutes: totalMins,
      peakHour: pkh,
      hourlyData: hourlyStats,
      topTasks: sortedTasks as [string, number][],
    }
  })()

  const { totalMinutes, peakHour, hourlyData, topTasks } = analyticsData

  const [taskStats, setTaskStats] = useState<{
    totalArchived: number
    totalCompleted: number
    completionRate: number
    byWeek: { week: string; completed: number; total: number }[]
  } | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  // Load Weekly Stats (or Mock)
  useEffect(() => {
    // Mock Weekly Stats for Preview
    if (!isPro) {
      setTaskStats({
        totalArchived: 142,
        totalCompleted: 128,
        completionRate: 88,
        byWeek: [
          { week: lang === 'zh' ? '第1周' : 'W1', completed: 20, total: 22 },
          { week: lang === 'zh' ? '第2周' : 'W2', completed: 25, total: 28 },
          { week: lang === 'zh' ? '第3周' : 'W3', completed: 30, total: 32 },
          { week: lang === 'zh' ? '第4周' : 'W4', completed: 28, total: 30 },
        ],
      })
      setIsLoading(false)
      return
    }

    if (!user) {
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
  }, [user, isPro, lang])

  // Logic for the Overlay Content (Gate)
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
        title: lang === 'zh' ? '升级 Focus Lab Pro' : 'Upgrade to Focus Lab Pro',
        desc:
          lang === 'zh' ? (
            <>
              解锁{' '}
              <span className="font-bold text-gray-800 dark:text-gray-200">无限次 BuBu AI</span>{' '}
              对话、<span className="font-bold text-gray-800 dark:text-gray-200">语音输入</span>
              ，以及包含{' '}
              <span className="font-bold text-gray-800 dark:text-gray-200">24小时分布</span> 与{' '}
              <span className="font-bold text-gray-800 dark:text-gray-200">完成率</span>{' '}
              的专业报表。
            </>
          ) : (
            <>
              Unlock{' '}
              <span className="font-bold text-gray-800 dark:text-gray-200">Unlimited BuBu AI</span>,{' '}
              <span className="font-bold text-gray-800 dark:text-gray-200">Voice Input</span>, and{' '}
              <span className="font-bold text-gray-800 dark:text-gray-200">Advanced Analytics</span>{' '}
              with 24h distribution & completion trends.
            </>
          ),
        action: lang === 'zh' ? '开启 7 天免费试用' : 'Start 7-Day Free Trial',
        handler: onUpgrade,
      }

  const maxTaskDuration = topTasks.length > 0 ? topTasks[0][1] : 60

  return (
    <div
      className={`relative rounded-3xl border p-8 transition-all ${
        isPro
          ? 'border-amber-100 bg-gradient-to-br from-amber-50/50 via-transparent to-transparent dark:border-amber-900/20 dark:from-amber-900/10'
          : 'overflow-hidden border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/50'
      }`}
    >
      {/* Preview Mode Overlay - Rendered ON TOP of the charts */}
      {!isPro && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 p-6 dark:bg-gray-900/40">
          <div className="pointer-events-auto max-w-sm rounded-2xl border border-amber-100 bg-white p-6 text-center shadow-xl dark:border-amber-900/30 dark:bg-gray-800">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl dark:bg-amber-900/30">
              {isLoginGate ? '🔐' : '👑'}
            </div>
            <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              {gateContent.title}
            </h4>
            <p className="mb-6 text-sm text-gray-500">
              {isLoginGate
                ? lang === 'zh'
                  ? '登录后即可查看您的专属数据报表'
                  : 'Sign in to view your personal analytics'
                : lang === 'zh'
                  ? '当前展示为模拟数据。升级 Pro 解锁您的真实数据分析。'
                  : 'Showing simulated data. Upgrade to Pro to unlock your real analytics.'}
            </p>
            {gateContent.handler && (
              <button
                onClick={gateContent.handler}
                className="w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-amber-500/25"
              >
                {gateContent.action}
              </button>
            )}
            {!isLoginGate && (
              <div className="mt-3 text-[10px] text-gray-400">
                {lang === 'zh' ? '* 仅用于功能演示' : '* For demonstration only'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Mode Badge */}
      {!isPro && !isLoginGate && (
        <div className="absolute top-0 right-0 z-10 rounded-bl-xl bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-900 dark:text-amber-400">
          {lang === 'zh' ? '模拟数据预览' : 'Preview Mode'}
        </div>
      )}

      <div className="space-y-8 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
              <span className="icon-[solar--crown-bold] h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                {lang === 'zh' ? 'Pro 专属报表' : 'Pro Reports'}
              </h3>
              <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
                {lang === 'zh' ? '尊享会员数据分析' : 'Premium Analytics'}
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Completion Rate */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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

          {/* Peak Hour */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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

          {/* Total Focus Time */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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

        {/* Hourly Distribution Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
          <h4 className="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {lang === 'zh' ? '24 小时专注分布' : '24-Hour Focus Distribution'}
          </h4>
          <p className="mb-4 text-[10px] text-gray-400">
            {lang === 'zh' ? '今日每小时专注时长 (上限 60m)' : "Today's focus per hour (Max 60m)"}
          </p>
          <div className="flex h-24 w-full items-end gap-1 px-1">
            {hourlyData.map((val, hour) => {
              // Scale height against 60 mins (Apple Screen Time style)
              const height = Math.min((val / 60) * 100, 100)
              const isPeak = hour === peakHour && val > 0
              const isNow = hour === new Date().getHours()

              return (
                <div
                  key={`hour-${hour}`}
                  className="group relative flex h-full flex-1 flex-col items-center justify-end"
                  style={{ minWidth: '4px' }}
                  title={`${hour}:00 - ${hour}:59 (${formatDuration(val)})`}
                >
                  <div
                    className={`w-full rounded-t-[2px] ${
                      isPeak
                        ? 'bg-amber-500 shadow-sm'
                        : isNow
                          ? 'bg-amber-400 ring-1 ring-amber-400'
                          : val > 0
                            ? 'bg-amber-500/80 dark:bg-amber-600'
                            : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    style={{ height: `${val > 0 ? Math.max(height, 18) : 8}%` }}
                  />
                  {hour % 6 === 0 && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-medium text-gray-400">
                      {hour}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-8 text-center text-[10px] font-medium tracking-wider text-gray-400 uppercase">
            {lang === 'zh' ? '小时 (24H)' : 'Hour (24H)'}
          </div>
        </div>

        {/* Task Ranking & Trends */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Top Tasks */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
            <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {lang === 'zh' ? '最常专注的任务' : 'Top Focus Tasks'}
            </h4>
            {topTasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-xs text-gray-400">--</div>
            ) : (
              <div className="space-y-3">
                {topTasks.map(([name, minutes], idx) => (
                  <div key={name} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate font-medium text-gray-700 dark:text-gray-300">
                        {idx + 1}. {name}
                      </span>
                      <span className="text-gray-500">{formatDuration(minutes)}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${(minutes / maxTaskDuration) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Task Trend */}
          {taskStats && taskStats.byWeek.length > 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
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
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/50">
              <span className="text-xs text-gray-400">
                {lang === 'zh' ? '暂无周数据' : 'No weekly data'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
