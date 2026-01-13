// File: components/TagsManager.tsx
// Spec: specs/001-competition-todo-app/file.md § FR-3.2 (Task Tags)

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Edit2, Check } from 'lucide-react'
import { useTags } from '@/lib/hooks/useTags'
import type { Tag } from '@/lib/types'

const TAG_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
]

export function TagsManager() {
  const { tags, createTag, updateTag, deleteTag } = useTags()
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0].value)
  const [editingTag, setEditingTag] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const handleCreateTag = () => {
    if (!newTagName.trim()) return

    createTag.mutate(
      { name: newTagName.trim(), color: selectedColor },
      {
        onSuccess: () => {
          setNewTagName('')
          setSelectedColor(TAG_COLORS[0].value)
        },
      }
    )
  }

  const handleUpdateTag = (tagId: number) => {
    if (!editName.trim()) return

    updateTag.mutate(
      { id: tagId, data: { name: editName.trim() } },
      {
        onSuccess: () => {
          setEditingTag(null)
          setEditName('')
        },
      }
    )
  }

  const handleDeleteTag = (tagId: number) => {
    if (confirm('Delete this tag? It will be removed from all tasks.')) {
      deleteTag.mutate(tagId)
    }
  }

  const startEditing = (tag: Tag) => {
    setEditingTag(tag.id)
    setEditName(tag.name)
  }

  const cancelEditing = () => {
    setEditingTag(null)
    setEditName('')
  }

  return (
    <div className="space-y-4">
      {/* Create New Tag */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Create New Tag
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            placeholder="Tag name..."
            maxLength={30}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />

          {/* Color Picker */}
          <div className="flex gap-1 items-center">
            {TAG_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  selectedColor === color.value
                    ? 'border-gray-900 dark:border-white scale-110'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateTag}
            disabled={!newTagName.trim() || createTag.isPending}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tag</span>
          </motion.button>
        </div>
      </div>

      {/* Tags List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Your Tags ({tags?.length || 0})
        </h3>

        {!tags || tags.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No tags yet. Create your first tag above!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {tags.map((tag) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  {editingTag === tag.id ? (
                    // Edit Mode
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-700 border-2 border-blue-500 rounded-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateTag(tag.id)
                          if (e.key === 'Escape') cancelEditing()
                        }}
                        className="w-24 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateTag(tag.id)}
                        className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded-full transition-colors"
                      >
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium"
                      style={{ backgroundColor: tag.color || '#3B82F6' }}
                    >
                      <span>{tag.name}</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(tag)}
                          className="p-1 hover:bg-white/20 rounded-full transition-colors"
                          title="Edit tag"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(tag.id)}
                          className="p-1 hover:bg-white/20 rounded-full transition-colors"
                          title="Delete tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
