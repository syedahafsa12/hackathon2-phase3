// File: components/Chatbot.tsx
// Phase III: AI Chatbot - Main chatbot component with conversation management
// Spec: specs/001-competition-todo-app/phase3.md

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Trash2, Plus, Loader2, History } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useChat } from '@/lib/hooks/useChat'

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
}

export function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>()
  const [showConversationList, setShowConversationList] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    conversations,
    conversationsLoading,
    messages,
    messagesLoading,
    sendMessage,
    deleteConversation,
  } = useChat(currentConversationId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle sending a message
  const handleSendMessage = async (messageText: string) => {
    try {
      const response = await sendMessage.mutateAsync({
        message: messageText,
        conversation_id: currentConversationId,
      })

      // If this was a new conversation, set the conversation ID
      if (!currentConversationId) {
        setCurrentConversationId(response.conversation_id)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Handle starting a new conversation
  const handleNewConversation = () => {
    setCurrentConversationId(undefined)
    setShowConversationList(false)
  }

  // Handle deleting a conversation
  const handleDeleteConversation = async (id: number) => {
    if (confirm('Delete this conversation?')) {
      await deleteConversation.mutateAsync(id)
      if (currentConversationId === id) {
        setCurrentConversationId(undefined)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />

          {/* Chatbot Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed bottom-4 right-4 w-full md:w-[400px] h-[600px] max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-500 to-purple-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI Assistant</h3>
                  <p className="text-xs text-white/80">
                    {currentConversationId ? 'Active conversation' : 'New conversation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* New Conversation Button */}
                <button
                  onClick={handleNewConversation}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                  title="New conversation"
                >
                  <Plus className="w-5 h-5 text-white" />
                </button>

                {/* Toggle Conversation List */}
                <button
                  onClick={() => setShowConversationList(!showConversationList)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors relative"
                  title="View conversations"
                >
                  <History className="w-5 h-5 text-white" />
                  {(conversations?.length || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-gray-900">
                      {conversations?.length}
                    </span>
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Conversation List Sidebar */}
              <AnimatePresence>
                {showConversationList && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '40%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="border-r border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    <div className="h-full overflow-y-auto p-2">
                      {conversationsLoading ? (
                        <div className="flex items-center justify-center h-20">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                      ) : conversations && conversations.length > 0 ? (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            className={`w-full p-2 rounded-lg mb-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group cursor-pointer border-2 ${currentConversationId === conv.id
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 shadow-sm'
                                : 'border-transparent'
                              }`}
                          >
                            <div className="flex items-start justify-between">
                              <div
                                className="flex-1 min-w-0"
                                onClick={() => {
                                  setCurrentConversationId(conv.id)
                                  setShowConversationList(false)
                                }}
                              >
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {conv.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(conv.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteConversation(conv.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                                aria-label="Delete conversation"
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center p-4">
                          No conversations yet
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                  ) : messages && messages.length > 0 ? (
                    <>
                      {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Start a conversation
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs">
                        I can help you manage your tasks with natural language. Try:
                      </p>
                      <div className="space-y-2 text-sm text-left">
                        <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                          "Add a task to buy groceries"
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                          "Show me all my pending tasks"
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                          "Mark task 3 as complete"
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={sendMessage.isPending}
                  placeholder="Ask me anything about your tasks..."
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
