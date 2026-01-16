'use client'

import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import type { FocusItem } from './focusStationStorage'

export type ArchivedTask = {
  id: string
  user_id: string
  original_id: string
  content: string
  type: 'text' | 'image'
  created_at: string
  completed_at: string | null
  archived_at: string
  archive_reason: 'deleted' | 'completed_cleanup' | 'manual'
  metadata: Record<string, unknown>
}

export type ArchiveReason = 'deleted' | 'completed_cleanup' | 'manual'

/**
 * 归档单个任务
 */
export const archiveTask = async (
  task: FocusItem,
  user: User,
  reason: ArchiveReason = 'deleted'
): Promise<boolean> => {
  try {
    const supabase = createClient()

    const { error } = await supabase.from('archived_tasks').insert({
      user_id: user.id,
      original_id: task.id,
      content: task.content,
      type: task.type,
      created_at: task.created_at || new Date().toISOString(),
      completed_at: task.completed_at ? new Date(task.completed_at).toISOString() : null,
      archive_reason: reason,
      metadata: { position: task.position },
    })

    if (error) {
      console.error('[Archive] Failed to archive task:', error.message)
      return false
    }

    return true
  } catch (e) {
    console.error('[Archive] Error archiving task:', e)
    return false
  }
}

/**
 * 批量归档任务
 */
export const archiveTasks = async (
  tasks: FocusItem[],
  user: User,
  reason: ArchiveReason = 'deleted'
): Promise<boolean> => {
  if (tasks.length === 0) return true

  try {
    const supabase = createClient()

    const records = tasks.map((task) => ({
      user_id: user.id,
      original_id: task.id,
      content: task.content,
      type: task.type,
      created_at: task.created_at || new Date().toISOString(),
      completed_at: task.completed_at ? new Date(task.completed_at).toISOString() : null,
      archive_reason: reason,
      metadata: { position: task.position },
    }))

    const { error } = await supabase.from('archived_tasks').insert(records)

    if (error) {
      console.error('[Archive] Failed to archive tasks:', error.message)
      return false
    }

    return true
  } catch (e) {
    console.error('[Archive] Error archiving tasks:', e)
    return false
  }
}

/**
 * 获取用户的归档任务（用于报表）
 */
export const fetchArchivedTasks = async (
  user: User,
  options: {
    limit?: number
    offset?: number
    startDate?: Date
    endDate?: Date
  } = {}
): Promise<ArchivedTask[]> => {
  try {
    const supabase = createClient()
    const { limit = 1000, offset = 0, startDate, endDate } = options

    let query = supabase
      .from('archived_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('archived_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (startDate) {
      query = query.gte('archived_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('archived_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('[Archive] Failed to fetch archived tasks:', error.message)
      return []
    }

    return (data || []) as ArchivedTask[]
  } catch (e) {
    console.error('[Archive] Error fetching archived tasks:', e)
    return []
  }
}

/**
 * 获取归档任务统计数据（用于 Pro 报表）
 */
export const getArchivedTasksStats = async (
  user: User,
  days: number = 30
): Promise<{
  totalArchived: number
  totalCompleted: number
  completionRate: number
  byWeek: { week: string; completed: number; total: number }[]
}> => {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const tasks = await fetchArchivedTasks(user, { startDate, endDate })

    const totalArchived = tasks.length
    const totalCompleted = tasks.filter((t) => t.completed_at !== null).length
    const completionRate =
      totalArchived > 0 ? Math.round((totalCompleted / totalArchived) * 100) : 0

    // 按周统计
    const weeklyStats = new Map<string, { completed: number; total: number }>()

    tasks.forEach((task) => {
      const date = new Date(task.archived_at)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weeklyStats.has(weekKey)) {
        weeklyStats.set(weekKey, { completed: 0, total: 0 })
      }

      const stats = weeklyStats.get(weekKey)!
      stats.total++
      if (task.completed_at) {
        stats.completed++
      }
    })

    const byWeek = Array.from(weeklyStats.entries())
      .map(([week, stats]) => ({ week, ...stats }))
      .sort((a, b) => a.week.localeCompare(b.week))

    return {
      totalArchived,
      totalCompleted,
      completionRate,
      byWeek,
    }
  } catch (e) {
    console.error('[Archive] Error getting stats:', e)
    return {
      totalArchived: 0,
      totalCompleted: 0,
      completionRate: 0,
      byWeek: [],
    }
  }
}
