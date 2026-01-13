'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Task } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface TaskItemProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: number) => void
  onSelect?: (id: number, selected: boolean) => void
  isSelected?: boolean
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false
}) => {
  const queryClient = useQueryClient()
  const [isExpanded, setIsExpanded] = useState(false)

  // Toggle task completion
  const toggleTaskCompletion = useMutation({
    mutationFn: async (completed: boolean) => {
      const response = await api.patch<Task>(`/tasks/${task.id}/`, { completed })
      return response.data
    },
    onMutate: async (completed) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previousTasks = queryClient.getQueryData(['tasks'])

      queryClient.setQueryData(['tasks'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.map((t: Task) =>
            t.id === task.id ? { ...t, completed } : t
          ),
        }
      })

      return { previousTasks }
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      toast.error('Failed to update task')
    },
    onSuccess: () => {
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task marked as complete')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const priorityColors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-l-red-500',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-l-yellow-500',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-l-green-500'
  }

  const priorityBorderColors = {
    high: 'border-l-4 border-l-red-500',
    medium: 'border-l-4 border-l-yellow-500',
    low: 'border-l-4 border-l-green-500'
  }

  const handleToggle = () => {
    toggleTaskCompletion.mutate(!task.completed)
  }

  const formatDueDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffTime = d.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  const isDueToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString()
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl backdrop-blur-sm ${isSelected ? 'border-blue-500 ring-4 ring-blue-200 dark:ring-blue-900' : 'border-gray-100 dark:border-gray-700'
        } ${task.completed ? 'opacity-70' : ''} ${priorityBorderColors[task.priority]}`}
    >
      {/* Priority indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${task.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
          task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
            'bg-gradient-to-r from-green-500 to-emerald-500'
        }`} />

      <div className="p-5 pt-6">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(task.id, e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* Completion checkbox */}
          <motion.button
            onClick={handleToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${task.completed
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-transparent shadow-md'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
          >
            {task.completed && (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`text-base font-medium cursor-pointer ${task.completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-white'
                  }`}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {task.title}
              </h3>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(task)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                  title="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(task.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Priority */}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${priorityColors[task.priority]}`}
              >
                {task.priority.toUpperCase()}
              </motion.span>

              {/* Category */}
              {task.category && (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 rounded-full shadow-sm"
                >
                  📁 {task.category}
                </motion.span>
              )}

              {/* Due date */}
              {task.due_date && (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${isOverdue
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse'
                      : isDueToday
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    }`}
                >
                  📅 {formatDueDate(task.due_date)}
                </motion.span>
              )}

              {/* Estimated time */}
              {task.estimated_minutes && (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-full"
                >
                  ⏱️ {task.estimated_minutes}m
                </motion.span>
              )}

              {/* Tags */}
              {task.tags?.map(tag => (
                <motion.span
                  key={tag.id}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 text-xs font-medium rounded-full shadow-sm backdrop-blur-sm"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}30` : '#e5e7eb',
                    color: tag.color || '#374151',
                    border: `1.5px solid ${tag.color || '#d1d5db'}`
                  }}
                >
                  #{tag.name}
                </motion.span>
              ))}
            </div>

            {/* Description (expandable) */}
            {task.description && isExpanded && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {task.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
