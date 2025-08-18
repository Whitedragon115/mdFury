'use client'

import { useSession, signOut } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'
import { useMemo, useCallback, useEffect, useRef } from 'react'

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

// UserUpdateData type - keep it simple for now
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
  const { 
    user: customUser, 
    logout: customLogout, 
    updateUser, 
    login, 
    register, 
    isLoading: _customLoading,
    oauthUserOverrides,
    setOAuthUserOverrides
  } = useAuth()
  // Remove local state since we're now using context
  // const [oauthUserOverrides, setOAuthUserOverrides] = useState<Partial<UserUpdateData>>({})

  // Use ref to store previous user to avoid unnecessary re-renders
  const previousUserRef = useRef<any>(null)

  // Helper function to deep compare user objects
  const usersAreEqual = (user1: any, user2: any): boolean => {
    if (!user1 && !user2) return true
    if (!user1 || !user2) return false
    
    const keys = ['id', 'username', 'email', 'displayName', 'profileImage', 'language', 'theme', 
                  'backgroundImage', 'backgroundBlur', 'backgroundBrightness', 'backgroundOpacity']
    
    return keys.every(key => user1[key] === user2[key])
  }

  const logout = useCallback(async () => {
    // Delegate actual sign-out work to the /logout page for a smoother UX
    window.location.href = '/logout'
  }, [])

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

  // Separate theme update function to avoid any async operations
  const updateTheme = useCallback((newTheme: 'light' | 'dark' | 'system') => {
    // Only update theme optimistically, no API calls
    setOAuthUserOverrides(prev => ({ ...prev, theme: newTheme }))
  }, [setOAuthUserOverrides])

  // Force refresh session for OAuth users
  const refreshSession = useCallback(async () => {
    if (session) {
      await updateSession()
    }
  }, [session, updateSession])

  // Clear OAuth user overrides that might interfere with session data
  const clearIdentityOverrides = useCallback(() => {
    setOAuthUserOverrides(prev => {
      const cleaned = { ...prev }
      // Remove identity fields that should come from session
      delete cleaned.displayName
      delete cleaned.profileImage
      return cleaned
    })
  }, [setOAuthUserOverrides])

  // Clear identity overrides when OAuth session is active
  useEffect(() => {
    if (session?.user && !customUser) {
      clearIdentityOverrides()
    }
  }, [session?.user, customUser, clearIdentityOverrides])

  // Clear all overrides when no user is logged in
  useEffect(() => {
    if (!customUser && !session?.user) {
      setOAuthUserOverrides({})
    }
  }, [customUser, session?.user, setOAuthUserOverrides])

  // Rewrite integratedUpdateUser to use the same optimistic update function as Google OAuth
  const integratedUpdateUser = useCallback(async (updatedUser: UserUpdateData) => {
    // Only update fields that are explicitly provided
    const explicitUpdates = Object.fromEntries(
      Object.entries(updatedUser).filter(([_, value]) => value !== undefined)
    )
    
    // Optimistically update local UI via oauthUserOverrides, including theme
    setOAuthUserOverrides(prev => ({ ...prev, ...explicitUpdates }))
    
    // Create payload excluding 'theme' so that theme changes are not persisted to the DB
    const payload = Object.fromEntries(
      Object.entries(explicitUpdates).filter(([key, value]) => key !== 'theme' && value !== undefined)
    )
    try {
      if (Object.keys(payload).length > 0) {
        if (customUser) {
          // For credential users, persist other fields without theme
          await updateUser({
            ...customUser,
            ...payload
          })
        } else if (session) {
          // For OAuth users, persist other fields using their API
          await updateOAuthUser(payload as UserUpdateData)
        }
      }
    } catch (error) {
      console.error('Failed to update user:', error)
      throw error
    }
  }, [customUser, session, updateUser, updateOAuthUser, setOAuthUserOverrides])

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
      // Merge local optimistic overrides for credential users too
      user = { ...customUser, ...oauthUserOverrides }
      activeAuth = 'credentials'
    }
    // Only use OAuth if no credential user is present
    else if (session?.user) {
      isAuthenticated = true
      const sUser = session.user as SessionUser
      
      // Base user from session
      const baseUser = {
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
      
      // For OAuth users, only apply overrides for specific fields (like theme)
      // Don't override core identity fields like displayName, username, email from session
      const filteredOverrides = Object.fromEntries(
        Object.entries(oauthUserOverrides).filter(([key]) => 
          ['theme', 'language', 'backgroundImage', 'backgroundBlur', 'backgroundBrightness', 'backgroundOpacity'].includes(key)
        )
      )
      
      // Merge local optimistic overrides (but exclude identity fields for OAuth)
      user = { ...baseUser, ...filteredOverrides }
      activeAuth = 'oauth'
      
    }

    // Only return new user object if it's actually different
    if (usersAreEqual(user, previousUserRef.current)) {
      user = previousUserRef.current
    } else {
      previousUserRef.current = user
    }

    return {
      user,
      isAuthenticated,
      isLoading: status === 'loading',
      logout,
      updateUser: integratedUpdateUser,
      updateTheme,
      refreshSession,
      login,
      register,
      authType: activeAuth
    }
  }, [session, customUser, status, oauthUserOverrides, logout, integratedUpdateUser, updateTheme, refreshSession, login, register])
}
