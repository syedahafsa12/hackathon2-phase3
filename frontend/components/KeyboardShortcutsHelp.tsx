// File: components/KeyboardShortcutsHelp.tsx
// Spec: specs/001-competition-todo-app/file.md § FR-3.10 (Keyboard Shortcuts Help)

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'

interface KeyboardShortcut {
  key: string
  description: string
  ctrl?: boolean
  shift?: boolean
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts: KeyboardShortcut[] = [
  { key: 'N', description: 'Create new task' },
  { key: '/', description: 'Focus search' },
  { key: '?', shift: true, description: 'Show/hide this help' },
  { key: 'D', ctrl: true, description: 'Toggle dark mode' },
  { key: 'Esc', description: 'Close modal or dialog' },
  { key: 'Enter', ctrl: true, description: 'Submit form' },
]

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Keyboard Shortcuts
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Quick navigation and actions
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.ctrl && (
                      <>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                          Ctrl
                        </kbd>
                        <span className="text-gray-400">+</span>
                      </>
                    )}
                    {shortcut.shift && (
                      <>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                          Shift
                        </kbd>
                        <span className="text-gray-400">+</span>
                      </>
                    )}
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm min-w-[2rem] text-center">
                      {shortcut.key}
                    </kbd>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-medium">?</kbd> to toggle this help menu
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
