'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
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

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await ClientAuthService.login(credentials)
      
      if (response.success && response.user && response.token) {
        setUser(response.user)
        localStorage.setItem('auth_token', response.token)
      }
      
      return response
    } catch (error) {
      return {
        success: false,
        message: 'Login failed'
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  const updateUser = async (updatedUser: User) => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No auth token')
      }

      const response = await ClientAuthService.updateProfile(updatedUser)
      
      if (response.success && response.user && response.token) {
        setUser(response.user)
        localStorage.setItem('auth_token', response.token)
      }
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAuthenticated,
      updateUser,
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
