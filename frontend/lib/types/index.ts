export interface User {
  id: string
  name?: string
  email: string
  created_at: string
}

export interface Task {
  id: number
  user_id: string
  title: string
  description?: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  category?: string
  due_date?: string
  estimated_minutes?: number
  tags?: Tag[]
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  user_id: string
  name: string
  color?: string
  created_at: string
}

export interface AuthResponse {
  user: User
  token: string
  expires_at: string
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  completed: number
  pending: number
}

// Phase III - AI Chatbot Types
export interface ChatMessage {
  id?: number
  role: 'user' | 'assistant' | 'system'
  content: string
  tool_calls?: any[]
  created_at?: string
}

export interface ChatRequest {
  message: string
  conversation_id?: number
}

export interface ChatResponse {
  conversation_id: number
  response: string
  tool_calls?: any[]
}

export interface Conversation {
  id: number
  title: string
  created_at: string
  updated_at: string
}
