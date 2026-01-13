// File: components/ChatInput.tsx
// Phase III: AI Chatbot - Message input component
// Spec: specs/001-competition-todo-app/phase3.md

'use client'

import { useState, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled, placeholder = 'Type a message...' }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    const trimmed = message.trim()
    if (trimmed && !disabled) {
      onSend(trimmed)
      setMessage('')
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        style={{
          minHeight: '44px',
          maxHeight: '120px',
        }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement
          target.style.height = 'auto'
          target.style.height = Math.min(target.scrollHeight, 120) + 'px'
        }}
      />

      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        aria-label="Send message"
      >
        {disabled ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
