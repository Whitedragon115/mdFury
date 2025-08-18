'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User, LoginCredentials, RegisterCredentials, AuthResponse, ClientAuthService } from '@/lib/auth/client-auth'

interface UserUpdateData {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  displayName?: string
  profileImage?: string
  backgroundImage?: string
  backgroundBlur?: number
  backgroundBrightness?: number
  backgroundOpacity?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (_credentials: LoginCredentials) => Promise<AuthResponse>
  register: (_credentials: RegisterCredentials) => Promise<AuthResponse>
  logout: () => void
  isAuthenticated: boolean
  updateUser: (_user: User) => void
  // OAuth user overrides for immediate UI updates
  oauthUserOverrides: Partial<UserUpdateData>
  setOAuthUserOverrides: React.Dispatch<React.SetStateAction<Partial<UserUpdateData>>>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  // OAuth user overrides for immediate UI updates without session refresh
  // Load from localStorage on initialization
  const [oauthUserOverrides, setOAuthUserOverridesState] = useState<Partial<UserUpdateData>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('oauth_user_overrides')
        return stored ? JSON.parse(stored) : {}
      } catch {
        return {}
      }
    }
    return {}
  })

  // Wrapper to persist to localStorage when oauthUserOverrides changes
  const setOAuthUserOverrides = useCallback((
    value: Partial<UserUpdateData> | ((prev: Partial<UserUpdateData>) => Partial<UserUpdateData>)
  ) => {
    setOAuthUserOverridesState(prevState => {
      const newState = typeof value === 'function' ? value(prevState) : value
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('oauth_user_overrides', JSON.stringify(newState))
        } catch (error) {
          console.error('Failed to persist oauthUserOverrides to localStorage:', error)
        }
      }
      return newState
    })
  }, [])

  // Check for existing token on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        
        if (token) {
          const response = await ClientAuthService.verifyToken(token)
          
          if (response.success && response.user) {
            setUser(response.user)
          } else {
            localStorage.removeItem('auth_token')
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await ClientAuthService.login(credentials)
      
      if (response.success && response.user && response.token) {
        setUser(response.user)
        localStorage.setItem('auth_token', response.token)
        
        // Clear any existing NextAuth session to avoid conflicts
        try {
          const { signOut } = await import('next-auth/react')
          await signOut({ redirect: false })
        } catch (error) {
          console.warn('Failed to clear OAuth session:', error)
        }
      }
      
      return response
    } catch (_error) {
      return {
        success: false,
        message: 'Login failed'
      }
    }
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await ClientAuthService.register(credentials)
      
      if (response.success && response.user && response.token) {
        setUser(response.user)
        localStorage.setItem('auth_token', response.token)
        
        // Clear any existing NextAuth session to avoid conflicts
        try {
          const { signOut } = await import('next-auth/react')
          await signOut({ redirect: false })
        } catch (error) {
          console.warn('Failed to clear OAuth session:', error)
        }
      }
      
      return response
    } catch (_error) {
      return {
        success: false,
        message: 'Registration failed'
      }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('auth_token')
  }, [])

  const updateUser = useCallback(async (updatedUser: User) => {
    try {
      const token = localStorage.getItem('auth_token')
      
      // For OAuth users, we don't have a token, so just update local state
      if (!token) {
        setUser(updatedUser)
        return
      }

      // For traditional login users, optimistically update local state first
      setUser(updatedUser)
      
      // Then update via API in background
      const response = await ClientAuthService.updateProfile(updatedUser)
      
      if (response.success && response.user && response.token) {
        setUser(response.user)
        localStorage.setItem('auth_token', response.token)
      }
      // If API fails, keep the optimistic update
    } catch (error) {
      console.error('Failed to update user:', error)
      // Keep the optimistic update even if API call fails
    }
  }, [])

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated,
      updateUser,
      oauthUserOverrides,
      setOAuthUserOverrides,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
