'use client'

import React, { useState } from 'react'
import { useTags } from '@/lib/hooks/useTags'
import { Input } from './ui/Input'
import { Button } from './ui/Button'

const predefinedColors = [
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#EAB308', // yellow
  '#84CC16', // lime
  '#10B981', // green
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#A855F7', // purple
  '#EC4899', // pink
  '#F43F5E', // rose
]

export const TagManager: React.FC = () => {
  const { tags, createTag, updateTag, deleteTag } = useTags()

  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(predefinedColors[0])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [error, setError] = useState('')

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newTagName.trim()) {
      setError('Tag name is required')
      return
    }

    try {
      await createTag.mutateAsync({
        name: newTagName.trim(),
        color: newTagColor
      })
      setNewTagName('')
      setNewTagColor(predefinedColors[0])
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create tag')
    }
  }

  const handleStartEdit = (id: number, name: string, color: string | null) => {
    setEditingId(id)
    setEditName(name)
    setEditColor(color || predefinedColors[0])
    setError('')
  }

  const handleSaveEdit = async (id: number) => {
    setError('')

    if (!editName.trim()) {
      setError('Tag name is required')
      return
    }

    try {
      await updateTag.mutateAsync({
        id,
        data: {
          name: editName.trim(),
          color: editColor
        }
      })
      setEditingId(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update tag')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setError('')
  }

  const handleDeleteTag = async (id: number, name: string) => {
    if (confirm(`Delete tag "${name}"? This will remove it from all tasks.`)) {
      await deleteTag.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create New Tag */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New Tag
        </h3>
        <form onSubmit={handleCreateTag} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                error={error}
                disabled={createTag.isPending}
              />
            </div>
            <div>
              <select
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                disabled={createTag.isPending}
                className="h-10 px-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                style={{ backgroundColor: newTagColor + '40' }}
              >
                {predefinedColors.map(color => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              isLoading={createTag.isPending}
              disabled={!newTagName.trim()}
            >
              Add Tag
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Preview:</span>
            <span
              className="px-3 py-1 text-sm font-medium rounded-full"
              style={{
                backgroundColor: newTagColor + '40',
                color: newTagColor
              }}
            >
              #{newTagName || 'tag-name'}
            </span>
          </div>
        </form>
      </div>

      {/* Existing Tags */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Tags ({tags.length})
        </h3>

        {tags.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No tags yet. Create your first tag above!
          </p>
        ) : (
          <div className="space-y-2">
            {tags.map(tag => (
              <div
                key={tag.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                {editingId === tag.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      style={{ backgroundColor: editColor + '40' }}
                    >
                      {predefinedColors.map(color => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(tag.id)}
                      isLoading={updateTag.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <span
                      className="px-3 py-1 text-sm font-medium rounded-full"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}40` : '#e5e7eb',
                        color: tag.color || '#374151'
                      }}
                    >
                      #{tag.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">
                      Created {new Date(tag.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleStartEdit(tag.id, tag.name, tag.color || null)}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Edit tag"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete tag"
                      disabled={deleteTag.isPending}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
