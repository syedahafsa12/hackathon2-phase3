// File: lib/better-auth.ts
// Spec: specs/001-competition-todo-app/file.md § FR-1 (Authentication)
//
// Custom authentication client for FastAPI JWT backend
// Provides simple auth API using axios client

import api from '@/lib/api'
import type { User, AuthResponse } from '@/lib/types'

interface BetterAuthSession {
  user: User | null
  session: {
    token: string
    expiresAt: string
  } | null
}

class BetterAuthClient {
  private sessionKey = 'auth_session'

  // Get current session from localStorage
  private getStoredSession(): BetterAuthSession | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(this.sessionKey)
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  // Store session to localStorage
  private setStoredSession(data: AuthResponse): BetterAuthSession {
    const session: BetterAuthSession = {
      user: data.user,
      session: {
        token: data.token,
        expiresAt: data.expires_at,
      },
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token) // For backward compatibility
      localStorage.setItem(this.sessionKey, JSON.stringify(session))
    }
    return session
  }

  // Clear session
  private clearSession() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem(this.sessionKey)
    }
  }

  // Sign up with email and password
  async signUp(email: string, password: string, name?: string): Promise<BetterAuthSession> {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', {
        email,
        password,
        name,
      })
      return this.setStoredSession(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Signup failed')
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<BetterAuthSession> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email,
        password,
      })
      return this.setStoredSession(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    this.clearSession()
  }

  // Get current session
  async getSession(): Promise<BetterAuthSession | null> {
    const stored = this.getStoredSession()
    if (!stored?.session?.token) return null

    // Verify token is still valid by fetching current user
    try {
      const response = await api.get<User>('/auth/me')
      return {
        user: response.data,
        session: stored.session,
      }
    } catch {
      this.clearSession()
      return null
    }
  }

  // Update session (refresh user data)
  async updateSession(): Promise<BetterAuthSession | null> {
    return this.getSession()
  }
}

// Export singleton instance
export const betterAuth = new BetterAuthClient()

// Export convenience methods
export const signUp = (email: string, password: string, name?: string) =>
  betterAuth.signUp(email, password, name)

export const signIn = (email: string, password: string) =>
  betterAuth.signIn(email, password)

export const signOut = () => betterAuth.signOut()

export const getSession = () => betterAuth.getSession()
