'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { AuthBasedThemeController } from '@/components/AuthBasedThemeController'
import SettingsPage from '@/components/SettingsPage'

export default function Settings() {
  return (
    <AuthProvider>
      <AuthBasedThemeController />
      <SettingsPage />
    </AuthProvider>
  )
}
