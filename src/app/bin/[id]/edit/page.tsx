'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ClientMarkdownService } from '@/lib/client-markdown'
import { SavedMarkdown } from '@/lib/client-markdown'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthBasedThemeController } from '@/components/AuthBasedThemeController'
import MarkdownPreviewer from '@/components/MarkdownPreviewer'
import BackgroundLayer from '@/components/BackgroundLayer'
import toast from 'react-hot-toast'

function EditPageContent() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [document, setDocument] = useState<SavedMarkdown | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push(`/bin/${id}`)
      return
    }

    loadDocument()
  }, [id, user, authLoading])

  const loadDocument = async () => {
    if (!id || typeof id !== 'string' || !user) return

    try {
      setIsLoading(true)
      
      // Get user's documents and find the one with matching binId
      const userDocs = await ClientMarkdownService.getUserMarkdowns()
      const doc = userDocs.find(d => d.binId === id || d.id === id)
      
      if (!doc) {
        toast.error('Document not found or you do not have permission to edit')
        router.push(`/bin/${id}`)
        return
      }

      if (doc.userId !== user.id) {
        toast.error('You do not have permission to edit this document')
        router.push(`/bin/${id}`)
        return
      }

      setDocument(doc)
      setHasPermission(true)
      
    } catch (error) {
      console.error('Failed to load document:', error)
      toast.error('Failed to load document')
      router.push(`/bin/${id}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundLayer
          backgroundImage={user?.backgroundImage}
          backgroundBlur={user?.backgroundBlur || 0}
          backgroundBrightness={user?.backgroundBrightness || 100}
          backgroundOpacity={user?.backgroundOpacity || 0.3}
        />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading document...</p>
        </div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundLayer
          backgroundImage={user?.backgroundImage}
          backgroundBlur={user?.backgroundBlur || 0}
          backgroundBrightness={user?.backgroundBrightness || 100}
          backgroundOpacity={user?.backgroundOpacity || 0.3}
        />
        <div className="text-center relative z-10">
          <p className="text-red-600 dark:text-red-400">Access denied</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <BackgroundLayer
        backgroundImage={user?.backgroundImage}
        backgroundBlur={user?.backgroundBlur || 0}
        backgroundBrightness={user?.backgroundBrightness || 100}
        backgroundOpacity={user?.backgroundOpacity || 0.3}
      />
      <div className="relative z-10">
        <MarkdownPreviewer initialDocument={document} />
      </div>
    </div>
  )
}

export default function EditPage() {
  return (
    <AuthProvider>
      <AuthBasedThemeController />
      <EditPageContent />
    </AuthProvider>
  )
}
