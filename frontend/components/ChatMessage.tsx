// File: components/ChatMessage.tsx
// Phase III: AI Chatbot - Individual message component
// Spec: specs/001-competition-todo-app/phase3.md

'use client'

import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/lib/types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600'
            : 'bg-gradient-to-br from-green-500 to-teal-600'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 max-w-[80%] ${
          isUser ? 'text-right' : 'text-left'
        }`}
      >
        <div
          className={`inline-block px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-tr-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
          } shadow-sm`}
        >
          <p className="whitespace-pre-wrap break-words text-sm">
            {message.content}
          </p>
        </div>

        {/* Tool Calls Indicator */}
        {isAssistant && message.tool_calls && message.tool_calls.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Used {message.tool_calls.length} tool{message.tool_calls.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Timestamp */}
        {message.created_at && (
          <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
