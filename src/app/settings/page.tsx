'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import SettingsPage from '@/components/SettingsPage'

export default function Settings() {
  return (
    <AuthProvider>
      <SettingsPage />
    </AuthProvider>
  )
}
