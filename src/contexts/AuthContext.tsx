'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, LoginCredentials, AuthResponse, ClientAuthService } from '@/lib/client-auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => void
  isAuthenticated: boolean
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 檢查本地存儲中的 token
    const checkAuth = async () => {
      const token = localStorage.getItem('auth-token')
      if (token) {
        try {
          const result = await ClientAuthService.verifyToken(token)
          if (result.success && result.user) {
            setUser(result.user)
          } else {
            localStorage.removeItem('auth-token')
          }
        } catch (error) {
          console.error('Failed to verify token:', error)
          localStorage.removeItem('auth-token')
        }
      }
      setIsLoading(false)
    }
    
    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true)
    try {
      const response = await ClientAuthService.login(credentials)
      
      if (response.success && response.user && response.token) {
        setUser(response.user)
        localStorage.setItem('auth-token', response.token)
      }
      
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth-token')
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
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
