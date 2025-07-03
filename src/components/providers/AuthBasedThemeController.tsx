'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from 'next-themes'

export function AuthBasedThemeController() {
  const { user, isLoading } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading) return

    if (!user) {
      // Force dark theme for unauthenticated users
      if (theme !== 'dark') {
        setTheme('dark')
      }
      // Also force DOM classes to ensure immediate visual effect
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      // For authenticated users, use their preferred theme
      const userTheme = user.theme === 'system' ? 'dark' : user.theme
      if (theme !== userTheme) {
        setTheme(userTheme)
      }
    }
  }, [user, isLoading, theme, setTheme, mounted])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return null
}
