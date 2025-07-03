'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { AuthBasedThemeController } from '@/components/providers'
import { DocumentsPage } from '@/components/pages'

export default function DocsPage() {
  return (
    <AuthProvider>
      <AuthBasedThemeController />
      <DocumentsPage />
    </AuthProvider>
  )
}
