// File: components/BulkActionsBar.tsx
// Spec: specs/001-competition-todo-app/file.md § FR-3.6 (Bulk Operations)

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Trash2, X } from 'lucide-react'

interface BulkActionsBarProps {
  selectedCount: number
  onMarkComplete: () => void
  onMarkIncomplete: () => void
  onDelete: () => void
  onClearSelection: () => void
}

export function BulkActionsBar({
  selectedCount,
  onMarkComplete,
  onMarkIncomplete,
  onDelete,
  onClearSelection,
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-4">
            {/* Selection Count */}
            <div className="flex items-center gap-2 pr-4 border-r border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {selectedCount}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                selected
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMarkComplete}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMarkIncomplete}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                <Circle className="w-4 h-4" />
                <span>Incomplete</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </motion.button>
            </div>

            {/* Clear Selection */}
            <button
              onClick={onClearSelection}
              className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
