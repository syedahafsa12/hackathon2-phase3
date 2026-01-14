// File: lib/hooks/useChat.ts
// Phase III: AI Chatbot - Chat hook for managing conversations and messages
// Spec: specs/001-competition-todo-app/phase3.md

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { ChatRequest, ChatResponse, Conversation, ChatMessage } from '@/lib/types'

export function useChat(conversationId?: number) {
  const queryClient = useQueryClient()

  // Fetch conversation list
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get<Conversation[]>('/chat/conversations')
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch messages for a specific conversation
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['conversation', conversationId, 'messages'],
    queryFn: async () => {
      if (!conversationId) return []
      const response = await api.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages`)
      return response.data
    },
    enabled: !!conversationId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (request: ChatRequest) => {
      const response = await api.post<ChatResponse>('/chat', request)
      return response.data
    },
    onSuccess: (data) => {
      // Invalidate conversation messages to fetch new messages
      queryClient.invalidateQueries({ queryKey: ['conversation', data.conversation_id, 'messages'] })
      // Invalidate conversations list to update timestamp
      queryClient.invalidateQueries({ queryKey: ['conversations'] })

      // IMPORTANT: Refresh tasks list if chatbot performed any task operations
      // This ensures the dashboard updates immediately after chatbot actions
      queryClient.invalidateQueries({ queryKey: ['tasks'] })

      // Also invalidate tags in case they were updated
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to send message'
      toast.error(message)
    },
  })

  // Delete conversation mutation
  const deleteConversation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/chat/conversations/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Conversation deleted')
    },
    onError: () => {
      toast.error('Failed to delete conversation')
    },
  })

  return {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    sendMessage,
    deleteConversation,
  }
}
