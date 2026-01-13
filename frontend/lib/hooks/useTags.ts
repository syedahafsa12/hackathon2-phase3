import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Tag } from '@/lib/types'

interface CreateTagData {
  name: string
  color?: string
}

interface UpdateTagData {
  name?: string
  color?: string
}

export function useTags() {
  const queryClient = useQueryClient()

  // Get all tags
  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await api.get<Tag[]>('/tags/')
      return response.data
    },
  })

  // Create tag mutation
  const createTag = useMutation({
    mutationFn: async (data: CreateTagData) => {
      const response = await api.post<Tag>('/tags/', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Tag created successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to create tag'
      toast.error(message)
    },
  })

  // Update tag mutation
  const updateTag = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTagData }) => {
      const response = await api.patch<Tag>(`/tags/${id}/`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tag updated successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to update tag'
      toast.error(message)
    },
  })

  // Delete tag mutation
  const deleteTag = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tags/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Tag deleted successfully!')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to delete tag'
      toast.error(message)
    },
  })

  return {
    tags: tagsQuery.data || [],
    isLoading: tagsQuery.isLoading,
    error: tagsQuery.error,
    createTag,
    updateTag,
    deleteTag,
  }
}
