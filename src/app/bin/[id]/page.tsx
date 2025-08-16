'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { ClientMarkdownService } from '@/lib/api'
import { ClientAuthService } from '@/lib/auth/client-auth'
import { AuthProvider } from '@/contexts/AuthContext'
import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { AuthBasedThemeController } from '@/components/providers'
import { PasswordForm } from '@/components/forms/PasswordForm'
import { LoginModal } from '@/components/common'
import { BackgroundLayer } from '@/components/layout'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  ArrowLeft, 
  Lock,
  Eye,
  EyeOff,
  Share2,
  Copy,
  Download,
  Edit
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BinDocument {
  id: string
  title: string
  content: string
  tags: string[]
  isPublic: boolean
  hasPassword: boolean
  createdAt: string
  updatedAt: string
  userId?: string
}

interface OwnerSettings {
  backgroundImage?: string
  backgroundBlur?: number
  backgroundBrightness?: number
  backgroundOpacity?: number
}

function BinPreviewContent() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useIntegratedAuth()
  const [binDocument, setBinDocument] = useState<BinDocument | null>(null)
  const [ownerSettings, setOwnerSettings] = useState<OwnerSettings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [_password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordAttempting, setPasswordAttempting] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  const loadDocument = useCallback(async (binId: string, inputPassword?: string) => {
    setLoading(true)
    setError(null)
    setPasswordError(null)
    setAccessDenied(false)
    
    try {
      // Try to get the document using the client API
      const result = await ClientMarkdownService.getPublicMarkdown(binId, inputPassword)
      
      if (result.success && result.markdown) {
        setBinDocument({
          id: result.markdown.id,
          title: result.markdown.title,
          content: result.markdown.content,
          tags: result.markdown.tags || [],
          isPublic: result.markdown.isPublic || false,
          hasPassword: !!result.markdown.password,
          createdAt: result.markdown.createdAt,
          updatedAt: result.markdown.updatedAt,
          userId: result.markdown.userId
        })
        
        // Load owner's settings for background
        if (result.markdown.userId) {
          try {
            const ownerProfile = await ClientAuthService.getUserProfile(result.markdown.userId)
            if (ownerProfile.success && ownerProfile.user) {
              setOwnerSettings({
                backgroundImage: ownerProfile.user.backgroundImage || undefined,
                backgroundBlur: ownerProfile.user.backgroundBlur || 0,
                backgroundBrightness: ownerProfile.user.backgroundBrightness || 70,
                backgroundOpacity: ownerProfile.user.backgroundOpacity || 0.1
              })
            }
          } catch (err) {
            console.warn('Failed to load owner settings:', err)
          }
        }
        
        setPasswordRequired(false)
        setPasswordError(null)
        setShowLoginModal(false)
        setAccessDenied(false)
      } else if (result.requiresAuth) {
        // Document is private and requires authentication
        setShowLoginModal(true)
        setPasswordRequired(false)
        setPasswordError(null)
        setAccessDenied(false)
      } else if (result.accessDenied) {
        // User is authenticated but doesn't have access
        setAccessDenied(true)
        setShowLoginModal(false)
        setPasswordRequired(false)
        setPasswordError(null)
      } else if (result.passwordRequired) {
        setPasswordRequired(true)
        setPasswordError(null)
        setShowLoginModal(false)
        setAccessDenied(false)
        // If we were trying a password and got password required, it means wrong password
        if (inputPassword) {
          setPasswordError(result.message || 'Incorrect password. Please try again.')
        }
      } else {
        setError(result.message || 'Document not found')
        setPasswordRequired(false)
        setShowLoginModal(false)
        setAccessDenied(false)
      }
    } catch (_err) {
      if (inputPassword && passwordRequired) {
        setPasswordError('Incorrect password. Please try again.')
      } else {
        setError('Failed to load document')
      }
      setShowLoginModal(false)
      setAccessDenied(false)
    } finally {
      setLoading(false)
      setPasswordAttempting(false)
    }
  }, [passwordRequired])

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadDocument(id)
    }
  }, [id, loadDocument])

  const handlePasswordSubmit = (inputPassword: string) => {
    if (!id || typeof id !== 'string') return
    
    setPasswordAttempting(true)
    setPassword(inputPassword)
    loadDocument(id, inputPassword)
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    setAccessDenied(false)
    // Reload the document now that user is authenticated
    if (id && typeof id === 'string') {
      loadDocument(id)
    }
  }

  const copyToClipboard = async () => {
    if (!binDocument) return
    
    try {
      await navigator.clipboard.writeText(binDocument.content)
      toast.success('Content copied to clipboard!')
    } catch (_err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadMarkdown = () => {
    if (!binDocument) return
    
    const blob = new Blob([binDocument.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const element = document.createElement('a')
    element.href = url
    element.download = `${binDocument.title}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(url)
    toast.success('Document downloaded!')
  }

  const shareDocument = async () => {
    const url = window.location.href
    
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied to clipboard!')
    } catch (_err) {
      toast.error('Failed to copy share link')
    }
  }

  if (loading) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading document...</p>
          </div>
        </div>
      </AuthProvider>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Document Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {error}
            </p>
            <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Editor
            </Button>
          </div>
        </div>
    )
  }
  if (passwordRequired) {
    return (
      <div>
        <BackgroundLayer
          backgroundImage={ownerSettings.backgroundImage}
          backgroundBlur={ownerSettings.backgroundBlur || 0}
          backgroundBrightness={ownerSettings.backgroundBrightness || 70}
          backgroundOpacity={ownerSettings.backgroundOpacity || 0.1}
        />
        <PasswordForm
          title="Document Password Required"
          onSubmit={handlePasswordSubmit}
          onCancel={handleBackToHome}
          error={passwordError}
          isLoading={passwordAttempting}
        />
      </div>
    )
  }

  if (accessDenied) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              Access Denied
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You do not have permission to access this document.
            </p>
            <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Editor
            </Button>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen">
        {/* Background Layer */}
        <BackgroundLayer
          backgroundImage={ownerSettings.backgroundImage}
          backgroundBlur={ownerSettings.backgroundBlur || 0}
          backgroundBrightness={ownerSettings.backgroundBrightness || 100}
          backgroundOpacity={ownerSettings.backgroundOpacity || 0.3}
        />
        
        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-20">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Editor
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {binDocument?.title || 'Untitled Document'}
                      </h1>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Bin ID: {id}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {user && binDocument && user.id === binDocument.userId && (
                    <Button variant="default" size="sm" onClick={() => router.push(`/bin/${id}/edit`)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={shareDocument}
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-lg hover:bg-slate-300 dark:hover:bg-slate-600 hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-lg hover:bg-slate-300 dark:hover:bg-slate-600 hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadMarkdown}
                    className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-lg hover:bg-slate-300 dark:hover:bg-slate-600 hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="container mx-auto p-6">
            {binDocument && (
              <>
                {/* Document Meta */}
                <div className="mb-6">
                  {binDocument.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Tags:</span>
                      {binDocument.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      {binDocument.isPublic ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Public
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Private
                        </>
                      )}
                    </span>
                    
                    {binDocument.hasPassword && (
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Password Protected
                      </span>
                    )}
                    
                    <span>
                      Updated: {new Date(binDocument.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Preview Content */}
                <Card className="p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    >
                      {binDocument.content}
                    </ReactMarkdown>
                  </div>
                </Card>
              </>
            )}
          </main>

          {/* Login Modal */}
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
            title="Private Document"
            message="This document is private. Please login to view it."
          />
        </div>
      </div>
  )
}

export default function BinPreviewPage() {
  return (
    <AuthProvider>
      <AuthBasedThemeController />
      <BinPreviewContent />
    </AuthProvider>
  )
}
