'use client'

import { useEffect, useState } from 'react'
import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { useTheme } from 'next-themes'

export function AuthBasedThemeController() {
  const { user, isLoading } = useIntegratedAuth()
  //WARN
  // const { theme, setTheme, resolvedTheme } = useTheme()
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading) return

    if (!user) {
      // Force dark theme for unauthenticated users
      if (resolvedTheme !== 'dark') {
        setTheme('dark')
      }
      // Also force DOM classes to ensure immediate visual effect
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      // For authenticated users, use their preferred theme
      const userTheme = user.theme === 'system' ? 'dark' : user.theme
      if (resolvedTheme !== userTheme) {
        setTheme(userTheme)
      }
    }
  }, [user, isLoading, resolvedTheme, setTheme, mounted])

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return null
}
