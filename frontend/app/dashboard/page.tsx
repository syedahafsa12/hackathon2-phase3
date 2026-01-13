'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useTasks } from '@/lib/hooks/useTasks'
import { useTags } from '@/lib/hooks/useTags'
import { Task } from '@/lib/types'
import { TaskItem } from '@/components/TaskItem'
import { TaskForm } from '@/components/TaskForm'
import { TagsManager } from '@/components/TagsManager'
import { SearchAndFilter, type TaskFilters } from '@/components/SearchAndFilter'
import { TaskStatistics } from '@/components/TaskStatistics'
import { BulkActionsBar } from '@/components/BulkActionsBar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { KeyboardShortcutsHelp } from '@/components/KeyboardShortcutsHelp'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import { Chatbot } from '@/components/Chatbot'
import Link from 'next/link'
import { Sparkles, MessageCircle } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, logout } = useAuth()

  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    tag: 'all',
    sortBy: 'created',
    sortOrder: 'desc',
  })

  const { tags } = useTags()

  // Convert frontend filters to API filters (remove 'all' values)
  const apiFilters = {
    search: filters.search || undefined,
    completed: filters.status === 'completed' ? true : filters.status === 'pending' ? false : undefined,
    priority: filters.priority !== 'all' ? filters.priority as 'high' | 'medium' | 'low' : undefined,
    category: filters.category !== 'all' ? filters.category : undefined,
    tag_ids: filters.tag !== 'all' && tags ? tags.filter(t => t.name === filters.tag).map(t => t.id) : undefined,
    sort_by: (filters.sortBy as string) === 'created' ? 'created_at' as const : (filters.sortBy as string) === 'due' ? 'due_date' as const : filters.sortBy as 'priority' | 'title',
    sort_order: filters.sortOrder as 'asc' | 'desc',
  }

  const { tasks, total, completed: completedCount, pending, isLoading, deleteTask, bulkDeleteTasks, bulkUpdateTasks } = useTasks(apiFilters)

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>()
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set())
  const [showTagManager, setShowTagManager] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)



  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])



  const handleCreateTask = () => {
    setEditingTask(undefined)
    setIsTaskModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const handleDeleteTask = async (id: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(id)
      setSelectedTasks(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleSelectTask = (id: number, selected: boolean) => {
    setSelectedTasks(prev => {
      const next = new Set(prev)
      if (selected) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(tasks.map(t => t.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return
    if (confirm(`Delete ${selectedTasks.size} selected tasks?`)) {
      await bulkDeleteTasks.mutateAsync(Array.from(selectedTasks))
      setSelectedTasks(new Set())
    }
  }

  const handleBulkComplete = async () => {
    if (selectedTasks.size === 0) return
    await bulkUpdateTasks.mutateAsync({
      taskIds: Array.from(selectedTasks),
      data: { completed: true }
    })
    setSelectedTasks(new Set())
  }

  const handleBulkIncomplete = async () => {
    if (selectedTasks.size === 0) return
    await bulkUpdateTasks.mutateAsync({
      taskIds: Array.from(selectedTasks),
      data: { completed: false }
    })
    setSelectedTasks(new Set())
  }

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'n', action: handleCreateTask, description: 'Create new task' },
    { key: 't', action: () => setShowTagManager(true), description: 'Manage tags' },
    { key: '?', shift: true, action: () => setShowShortcuts(!showShortcuts), description: 'Show shortcuts' },
    { key: 'd', ctrl: true, action: () => { }, description: 'Toggle dark mode (handled by ThemeToggle)' },
    {
      key: 'Escape', action: () => {
        if (showShortcuts) setShowShortcuts(false)
        if (showTagManager) setShowTagManager(false)
        if (isTaskModalOpen) setIsTaskModalOpen(false)
      }, description: 'Close modal'
    },
  ], true)

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Tasks
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {user.name || user.email}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button onClick={handleCreateTask}>
                + New Task
              </Button>
              <Button variant="secondary" onClick={() => setShowTagManager(true)}>
                Manage Tags
              </Button>
              <Button variant="secondary" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Statistics Dashboard */}
        <TaskStatistics tasks={tasks || []} />

        {/* Search & Filter */}
        <div className="mt-6">
          <SearchAndFilter
            filters={filters}
            onFiltersChange={setFilters}
            categories={['Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Other']}
            tags={tags?.map(t => t.name) || []}
          />
        </div>

        {/* Bulk Actions Bar (Fixed Bottom) */}
        <BulkActionsBar
          selectedCount={selectedTasks.size}
          onMarkComplete={handleBulkComplete}
          onMarkIncomplete={handleBulkIncomplete}
          onDelete={handleBulkDelete}
          onClearSelection={() => setSelectedTasks(new Set())}
        />

        {/* Task List */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tasks ({tasks?.length || 0})</CardTitle>
              {tasks && tasks.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                >
                  {selectedTasks.size === tasks.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            ) : !tasks || tasks.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {filters.search || filters.status !== 'all' ? 'Try adjusting your filters' : 'Get started by creating your first task'}
                </p>
                {!filters.search && filters.status === 'all' && (
                  <Button onClick={handleCreateTask}>
                    Create Your First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <TaskItem
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                      onSelect={handleSelectTask}
                      isSelected={selectedTasks.has(task.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        size="lg"
      >
        <TaskForm
          task={editingTask}
          onClose={() => setIsTaskModalOpen(false)}
        />
      </Modal>

      {/* Tag Manager Modal */}
      <Modal
        isOpen={showTagManager}
        onClose={() => setShowTagManager(false)}
        title="Manage Tags"
        size="lg"
      >
        <TagsManager />
      </Modal>

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* AI Chatbot */}
      <Chatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        {/* AI Chatbot Button */}
        {!isChatbotOpen && (
          <button
            onClick={() => setIsChatbotOpen(true)}
            className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 relative group"
            title="AI Assistant"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
        )}

        {/* Shortcuts hint button */}
        <button
          onClick={() => setShowShortcuts(true)}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
          title="Keyboard shortcuts (Press ?)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
