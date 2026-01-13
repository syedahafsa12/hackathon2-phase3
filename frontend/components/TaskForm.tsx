'use client'

import React, { useState, useEffect } from 'react'
import { Task } from '@/lib/types'
import { useTasks } from '@/lib/hooks/useTasks'
import { useTags } from '@/lib/hooks/useTags'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

interface TaskFormProps {
  task?: Task
  onClose: () => void
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { createTask, updateTask } = useTasks()
  const { tags } = useTags()

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium' as 'high' | 'medium' | 'low',
    category: task?.category || '',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
    estimated_minutes: task?.estimated_minutes?.toString() || '',
    tag_ids: task?.tags?.map(t => t.id) || [] as number[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 500) {
      newErrors.title = 'Title must be less than 500 characters'
    }

    if (formData.estimated_minutes && parseInt(formData.estimated_minutes) <= 0) {
      newErrors.estimated_minutes = 'Estimated time must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const data = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      category: formData.category.trim() || undefined,
      due_date: formData.due_date || undefined,
      estimated_minutes: formData.estimated_minutes ? parseInt(formData.estimated_minutes) : undefined,
      tag_ids: formData.tag_ids
    }

    if (task) {
      await updateTask.mutateAsync({ id: task.id, data })
    } else {
      await createTask.mutateAsync(data)
    }

    onClose()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const toggleTag = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }))
  }

  const isLoading = createTask.isPending || updateTask.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title *"
        name="title"
        value={formData.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Enter task title"
        autoFocus
        disabled={isLoading}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add more details..."
          rows={4}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-white"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <Input
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Work, Personal"
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Due Date"
          name="due_date"
          type="datetime-local"
          value={formData.due_date}
          onChange={handleChange}
          disabled={isLoading}
        />

        <Input
          label="Estimated Time (minutes)"
          name="estimated_minutes"
          type="number"
          value={formData.estimated_minutes}
          onChange={handleChange}
          placeholder="60"
          min="1"
          error={errors.estimated_minutes}
          disabled={isLoading}
        />
      </div>

      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                disabled={isLoading}
                className={`px-3 py-1 text-sm rounded-full transition-all ${
                  formData.tag_ids.includes(tag.id)
                    ? 'ring-2 ring-blue-500'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: tag.color ? `${tag.color}40` : '#e5e7eb',
                  color: tag.color || '#374151'
                }}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
