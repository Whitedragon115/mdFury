'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { AuthBasedThemeController } from '@/components/providers'
import { SettingsPage } from '@/components/pages'

export default function Settings() {
  return (
    <AuthProvider>
      <AuthBasedThemeController />
      <SettingsPage />
    </AuthProvider>
  )
}
