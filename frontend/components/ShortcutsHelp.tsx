'use client'

import React from 'react'

interface Shortcut {
  keys: string[]
  description: string
}

const shortcuts: Shortcut[] = [
  { keys: ['N'], description: 'Create new task' },
  { keys: ['T'], description: 'Manage tags' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close modal' },
  { keys: ['Ctrl/⌘', 'A'], description: 'Select all tasks' },
  { keys: ['Ctrl/⌘', 'D'], description: 'Delete selected tasks' },
  { keys: ['1'], description: 'Filter: All tasks' },
  { keys: ['2'], description: 'Filter: Pending tasks' },
  { keys: ['3'], description: 'Filter: Completed tasks' },
]

export const ShortcutsHelp: React.FC = () => {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 dark:text-gray-400">
        Use keyboard shortcuts to navigate and manage your tasks faster.
      </p>

      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded"
          >
            <span className="text-gray-900 dark:text-white">{shortcut.description}</span>
            <div className="flex gap-1">
              {shortcut.keys.map((key, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-gray-400 mx-1">+</span>}
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded shadow-sm">
                    {key}
                  </kbd>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Tip:</strong> Press <kbd className="px-2 py-0.5 text-xs font-semibold bg-white dark:bg-blue-800 border border-blue-300 dark:border-blue-600 rounded">?</kbd> anytime to see this help menu.
        </p>
      </div>
    </div>
  )
}
