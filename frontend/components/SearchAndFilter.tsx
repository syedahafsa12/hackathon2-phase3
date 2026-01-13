// File: components/SearchAndFilter.tsx
// Spec: specs/001-competition-todo-app/file.md § FR-3.4, FR-3.5 (Search & Filter)

'use client'

import { useState, useEffect } from 'react'
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface TaskFilters {
  search: string
  status: 'all' | 'pending' | 'completed'
  priority: 'all' | 'high' | 'medium' | 'low'
  category: string
  tag: string
  sortBy: 'created' | 'due_date' | 'priority' | 'title'
  sortOrder: 'asc' | 'desc'
}

interface SearchAndFilterProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  categories: string[]
  tags: string[]
}

export function SearchAndFilter({
  filters,
  onFiltersChange,
  categories,
  tags,
}: SearchAndFilterProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchInput })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setSearchInput('')
    onFiltersChange({
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      tag: 'all',
      sortBy: 'created',
      sortOrder: 'desc',
    })
  }

  const activeFilterCount = [
    filters.status !== 'all',
    filters.priority !== 'all',
    filters.category !== 'all',
    filters.tag !== 'all',
    filters.search.length > 0,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-200"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Tasks</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag
                </label>
                <select
                  value={filters.tag}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Tags</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="created">Created Date</option>
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title (A-Z)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {activeFilterCount > 0 && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <FilterTag label={`Search: "${filters.search}"`} onRemove={() => setSearchInput('')} />
          )}
          {filters.status !== 'all' && (
            <FilterTag label={`Status: ${filters.status}`} onRemove={() => handleFilterChange('status', 'all')} />
          )}
          {filters.priority !== 'all' && (
            <FilterTag label={`Priority: ${filters.priority}`} onRemove={() => handleFilterChange('priority', 'all')} />
          )}
          {filters.category !== 'all' && (
            <FilterTag label={`Category: ${filters.category}`} onRemove={() => handleFilterChange('category', 'all')} />
          )}
          {filters.tag !== 'all' && (
            <FilterTag label={`Tag: ${filters.tag}`} onRemove={() => handleFilterChange('tag', 'all')} />
          )}
        </div>
      )}
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  )
}
