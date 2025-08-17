'use client'

import { useSession, signOut } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
import { useMemo, useCallback } from 'react'

// Extended session user type to cover OAuth + custom fields
interface SessionUser {
  id?: string
  username?: string
  name?: string | null
  email?: string | null
  image?: string | null
  displayName?: string | null
  language?: string | null
  theme?: 'light' | 'dark' | 'system' | null
  backgroundImage?: string | null
  backgroundBlur?: number | null
  backgroundBrightness?: number | null
  backgroundOpacity?: number | null
}

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

export function useIntegratedAuth() {
  const { data: session, status, update: updateSession } = useSession()
  const { user: customUser, logout: customLogout, updateUser, login, register, isLoading: _customLoading } = useAuth()

  const logout = useCallback(async () => {
    if (session) {
      await signOut({ redirect: false })
    }
    customLogout()
    window.location.href = '/login'
  }, [session, customLogout])

  const updateOAuthUser = useCallback(async (updates: UserUpdateData) => {
    try {
      const response = await fetch('/api/auth/update-oauth-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to update OAuth user')
      }
      
      return result
    } catch (error) {
      console.error('Failed to update OAuth user:', error)
      throw error
    }
  }, [])

  const integratedUpdateUser = useCallback(async (updatedUser: UserUpdateData) => {
    try {
      // Priority: credential user first, then OAuth
      if (customUser) {
        // For traditional credential users, use the existing updateUser
        const fullUserData = {
          ...customUser,
          ...updatedUser
        }
        await updateUser(fullUserData)
      } else if (session) {
        // For OAuth users, use the special OAuth update endpoint
        const result = await updateOAuthUser({
          theme: updatedUser.theme,
          language: updatedUser.language,
          displayName: updatedUser.displayName,
          profileImage: updatedUser.profileImage,
          backgroundImage: updatedUser.backgroundImage,
          backgroundBlur: updatedUser.backgroundBlur,
          backgroundBrightness: updatedUser.backgroundBrightness,
          backgroundOpacity: updatedUser.backgroundOpacity
        })
        
        if (result.success) {
          // Force a session refresh to get updated data without page reload
          await updateSession()
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }, [session, customUser, updateOAuthUser, updateUser, updateSession])

  // Memoize the return value to prevent infinite re-renders
  return useMemo(() => {
    // Determine the active authentication method
    // Priority: 1. Active credential user, 2. OAuth session
    let isAuthenticated = false
    let user = null
    let activeAuth = 'none'

    // Check credential authentication first (higher priority)
    if (customUser) {
      isAuthenticated = true
      user = customUser
      activeAuth = 'credentials'
    }
    // Only use OAuth if no credential user is present
    else if (session?.user) {
      isAuthenticated = true
      const sUser = session.user as SessionUser
      user = {
        id: sUser.id || undefined,
        username: sUser.username || sUser.name || undefined,
        email: sUser.email || undefined,
        displayName: sUser.displayName || sUser.name || undefined,
        profileImage: sUser.image || '',
        language: (sUser.language as string) || 'en',
        theme: (sUser.theme as 'light' | 'dark' | 'system') || 'dark',
        backgroundImage: sUser.backgroundImage || undefined,
        backgroundBlur: sUser.backgroundBlur ?? 0,
        backgroundBrightness: sUser.backgroundBrightness ?? 70,
        backgroundOpacity: sUser.backgroundOpacity ?? 0.1
      }
      activeAuth = 'oauth'
    }

    return {
      user,
      isAuthenticated,
      isLoading: status === 'loading',
      logout,
      updateUser: integratedUpdateUser,
      login,
      register,
      authType: activeAuth
    }
  }, [session, customUser, status, logout, integratedUpdateUser, login, register])
}
