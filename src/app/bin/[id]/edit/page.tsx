'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { IntegratedMarkdownService } from '@/lib/api'
import { SavedMarkdown } from '@/types'
import MarkdownPreviewer from '@/components/MarkdownPreviewer'
import { BackgroundLayer } from '@/components/layout'
import { useBackgroundPreview } from '@/hooks/useBackgroundPreview'
import toast from 'react-hot-toast'

function EditPageContent() {
  const { id } = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useIntegratedAuth()
  const { previewState } = useBackgroundPreview()
  const [document, setDocument] = useState<SavedMarkdown | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)

  const loadDocument = useCallback(async () => {
    if (!id || typeof id !== 'string' || !user) return

    try {
      setIsLoading(true)
      
      // Get user's documents and find the one with matching binId
      const userDocs = await IntegratedMarkdownService.getUserMarkdowns()
      const doc = userDocs.find((d: SavedMarkdown) => d.binId === id || d.id === id)
      
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
  }, [id, user, router]) // Include user dependency

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push(`/bin/${id}`)
      return
    }

    loadDocument()
  }, [id, user, authLoading, router, loadDocument])

  // Use preview state if available, otherwise fall back to user settings
  const backgroundSettings = previewState || {
    backgroundImage: user?.backgroundImage,
    backgroundBlur: user?.backgroundBlur,
    backgroundBrightness: user?.backgroundBrightness,
    backgroundOpacity: user?.backgroundOpacity
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BackgroundLayer
          backgroundImage={backgroundSettings.backgroundImage}
          backgroundBlur={backgroundSettings.backgroundBlur}
          backgroundBrightness={backgroundSettings.backgroundBrightness}
          backgroundOpacity={backgroundSettings.backgroundOpacity}
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
          backgroundImage={backgroundSettings.backgroundImage}
          backgroundBlur={backgroundSettings.backgroundBlur}
          backgroundBrightness={backgroundSettings.backgroundBrightness}
          backgroundOpacity={backgroundSettings.backgroundOpacity}
        />
        <div className="text-center relative z-10">
          <p className="text-red-600 dark:text-red-400">Access denied</p>
        </div>
      </div>
    )
  }

  // Main editor view - copy the structure from App.tsx
  return (
    <>
      {/* Background Layer with preview support */}
      <BackgroundLayer
        backgroundImage={backgroundSettings.backgroundImage}
        backgroundBlur={backgroundSettings.backgroundBlur}
        backgroundBrightness={backgroundSettings.backgroundBrightness}
        backgroundOpacity={backgroundSettings.backgroundOpacity}
      />
      
      <div className="animate-fade-in relative z-10">
        <MarkdownPreviewer initialDocument={document} isEditMode={true} />
      </div>
    </>
  )
}

export default function EditPage() {
  return <EditPageContent />
}
