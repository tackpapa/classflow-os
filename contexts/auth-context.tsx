'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Types
export interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'manager' | 'teacher' | 'staff' | 'student' | 'parent'
}

export interface Organization {
  id: string
  name: string
  type: 'academy' | 'learning_center' | 'study_cafe' | 'tutoring'
}

export interface AuthState {
  user: User | null
  org: Organization | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 세션 확인 함수
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // 쿠키 포함
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setOrg(data.org)
      } else {
        setUser(null)
        setOrg(null)
      }
    } catch (error) {
      console.error('[Auth] Session refresh error:', error)
      setUser(null)
      setOrg(null)
    }
  }, [])

  // 초기 세션 확인
  useEffect(() => {
    const initAuth = async () => {
      await refreshSession()
      setIsLoading(false)
    }

    initAuth()
  }, [refreshSession])

  // 로그인 함수
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setOrg(data.org)
        return { success: true }
      } else {
        return { success: false, error: data.error || '로그인에 실패했습니다' }
      }
    } catch (error) {
      console.error('[Auth] Login error:', error)
      return { success: false, error: '로그인 중 오류가 발생했습니다' }
    }
  }, [])

  // 로그아웃 함수
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('[Auth] Logout error:', error)
    } finally {
      setUser(null)
      setOrg(null)
      router.push('/login')
      router.refresh()
    }
  }, [router])

  const value: AuthContextType = {
    user,
    org,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
