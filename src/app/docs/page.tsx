'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { AuthBasedThemeController } from '@/components/AuthBasedThemeController'
import DocumentsPage from '@/components/DocumentsPage'

export default function DocsPage() {
  return (
    <AuthProvider>
      <AuthBasedThemeController />
      <DocumentsPage />
    </AuthProvider>
  )
}
