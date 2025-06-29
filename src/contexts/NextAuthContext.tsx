'use client'

import React, { createContext, useContext } from 'react'
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react'
import { User, LoginCredentials, AuthResponse, ClientAuthService } from '@/lib/client-auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()

  const user: User | null = session?.user ? {
    id: (session.user as any).id || '',
    username: (session.user as any).username || session.user.email?.split('@')[0] || '',
    email: session.user.email || '',
    displayName: (session.user as any).displayName || session.user.name || '',
    profileImage: session.user.image || undefined,
    language: (session.user as any).language || 'en',
    theme: (session.user as any).theme || 'dark',
    backgroundImage: (session.user as any).backgroundImage,
    backgroundBlur: (session.user as any).backgroundBlur || 0,
    backgroundBrightness: (session.user as any).backgroundBrightness || 70,
    backgroundOpacity: (session.user as any).backgroundOpacity || 0.1,
  } : null

  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const result = await signIn('credentials', {
        username: credentials.username,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        return {
          success: false,
          message: 'Invalid credentials'
        }
      }

      return {
        success: true,
        message: 'Login successful'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Login failed'
      }
    }
  }

  const loginWithGoogle = async () => {
    await signIn('google')
  }

  const logout = async () => {
    await signOut()
  }

  const updateUser = async (updatedUser: User) => {
    // Update user through API
    try {
      await ClientAuthService.updateProfile(updatedUser)
      // Note: Session will be updated on next request due to NextAuth callbacks
    } catch (error) {
      console.error('Failed to update user:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      loginWithGoogle,
      logout,
      isAuthenticated,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
