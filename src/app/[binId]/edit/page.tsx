'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ClientMarkdownService } from '@/lib/client-markdown'
import { SavedMarkdown } from '@/lib/client-markdown'
import { AuthProvider } from '@/contexts/AuthContext'
import MarkdownPreviewer from '@/components/MarkdownPreviewer'
import toast from 'react-hot-toast'

function EditPageContent() {
  const { binId } = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [document, setDocument] = useState<SavedMarkdown | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push(`/${binId}`)
      return
    }

    loadDocument()
  }, [binId, user, authLoading])

  const loadDocument = async () => {
    if (!binId || typeof binId !== 'string' || !user) return

    try {
      setIsLoading(true)
      
      // Get user's documents and find the one with matching binId
      const userDocs = await ClientMarkdownService.getUserMarkdowns()
      const doc = userDocs.find(d => d.binId === binId || d.id === binId)
      
      if (!doc) {
        toast.error('Document not found or you do not have permission to edit')
        router.push(`/${binId}`)
        return
      }

      if (doc.userId !== user.id) {
        toast.error('You do not have permission to edit this document')
        router.push(`/${binId}`)
        return
      }

      setDocument(doc)
      setHasPermission(true)
      
      // Copy view link to clipboard
      const viewUrl = `${window.location.origin}/${binId}`
      try {
        await navigator.clipboard.writeText(viewUrl)
        toast.success('View link copied to clipboard')
      } catch (err) {
        console.warn('Failed to copy to clipboard:', err)
      }
      
    } catch (error) {
      console.error('Failed to load document:', error)
      toast.error('Failed to load document')
      router.push(`/${binId}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading document...</p>
        </div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Access denied</p>
        </div>
      </div>
    )
  }

  return <MarkdownPreviewer initialDocument={document} />
}

export default function EditPage() {
  return (
    <AuthProvider>
      <EditPageContent />
    </AuthProvider>
  )
}
