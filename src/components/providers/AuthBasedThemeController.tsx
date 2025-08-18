'use client'

import { useEffect, useState } from 'react'
import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { useTheme } from 'next-themes'

export function AuthBasedThemeController() {
  const { user, isLoading } = useIntegratedAuth()
  const { setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading) return

    if (!user) {
      // Force dark theme for unauthenticated users
      setTheme('dark')
    } else {
      // For authenticated users, use their preferred theme
      const userTheme = user.theme === 'system' ? 'dark' : (user.theme || 'dark')
      setTheme(userTheme)
    }
  }, [user, isLoading, setTheme, mounted])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return null
}
