// File: components/TaskStatistics.tsx
// Spec: specs/001-competition-todo-app/file.md § FR-3.7 (Task Statistics Dashboard)

'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, TrendingUp, Calendar } from 'lucide-react'
import type { Task } from '@/lib/types'

interface TaskStatisticsProps {
  tasks: Task[]
}

export function TaskStatistics({ tasks }: TaskStatisticsProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Today's tasks
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTasks = tasks.filter((t) => {
    if (!t.due_date) return false
    const dueDate = new Date(t.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate.getTime() === today.getTime()
  })

  // Overdue tasks
  const overdueTasks = tasks.filter((t) => {
    if (!t.due_date || t.completed) return false
    const dueDate = new Date(t.due_date)
    return dueDate < new Date()
  })

  // High priority pending tasks
  const highPriorityPending = tasks.filter(
    (t) => !t.completed && t.priority === 'high'
  ).length

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: Circle,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      label: 'Completed',
      value: completedTasks,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      label: 'Pending',
      value: pendingTasks,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      label: 'Due Today',
      value: todayTasks.length,
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Overall Progress
          </h3>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {completionPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-sm text-gray-600 dark:text-gray-400">
          <span>{completedTasks} completed</span>
          <span>{pendingTasks} remaining</span>
        </div>

        {/* Additional Insights */}
        {(overdueTasks.length > 0 || highPriorityPending > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {overdueTasks.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>{overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            {highPriorityPending > 0 && (
              <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                <span>{highPriorityPending} high priority task{highPriorityPending !== 1 ? 's' : ''} pending</span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
