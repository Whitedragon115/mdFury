'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { SettingsPage } from '@/components/pages'

export default function Settings() {
  return (
    <AuthProvider>
      <SettingsPage />
    </AuthProvider>
  )
}
