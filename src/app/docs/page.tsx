'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import DocumentsPage from '@/components/DocumentsPage'

export default function DocsPage() {
  return (
    <AuthProvider>
      <DocumentsPage />
    </AuthProvider>
  )
}
