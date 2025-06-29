'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { PageLayout } from '@/components/PageLayout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MarkdownStorageService, SavedMarkdown } from '@/lib/markdown-storage'
import { 
  FolderOpen, 
  Search, 
  Plus, 
  Calendar, 
  Tag, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  Copy,
  Loader2,
  ArrowLeft
} from 'lucide-react'
import LoginForm from '@/components/LoginForm'

export default function DocumentsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<SavedMarkdown[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)

  const loadDocuments = useCallback(async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const userDocs = await MarkdownStorageService.getUserMarkdowns(user.id)
      setDocuments(userDocs)
    } catch (error) {
      toast.error('Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      const loadUserDocuments = async () => {
        setIsLoading(true)
        try {
          const userDocs = await MarkdownStorageService.getUserMarkdowns(user.id)
          setDocuments(userDocs)
        } catch (error) {
          toast.error('Failed to load documents')
        } finally {
          setIsLoading(false)
        }
      }
      
      loadUserDocuments()
    }
  }, [user])

  // If user is not authenticated, show login form
  if (!user) {
    return <LoginForm />
  }

  const handleSearch = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const results = await MarkdownStorageService.searchMarkdowns(user.id, searchQuery)
      setDocuments(results)
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (docId: string) => {
    router.push(`/?doc=${docId}`)
  }

  const handleDelete = async (docId: string) => {
    if (!user) return

    try {
      const result = await MarkdownStorageService.deleteMarkdown(docId, user.id)
      if (result.success) {
        toast.success('Document deleted successfully')
        loadDocuments()
      } else {
        toast.error(result.message || 'Failed to delete document')
      }
    } catch (error) {
      toast.error('Failed to delete document')
    } finally {
      setDeleteDialogOpen(null)
    }
  }

  const handleDuplicate = async (doc: SavedMarkdown) => {
    if (!user) return

    try {
      const result = await MarkdownStorageService.saveMarkdown(user.id, {
        title: `${doc.title} (Copy)`,
        content: doc.content,
        tags: doc.tags,
        isPublic: false
      })
      
      if (result.success) {
        toast.success('Document duplicated successfully')
        loadDocuments()
      } else {
        toast.error('Failed to duplicate document')
      }
    } catch (error) {
      toast.error('Failed to duplicate document')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-lg text-slate-600 dark:text-slate-400">{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  return (
    <PageLayout>
      <div className="space-y-6 animate-fade-in-up max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-in-down">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          <FolderOpen className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
            {t('documents.title')}
          </h1>
        </div>
        <Button
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 btn-animate hover-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('documents.createNew')}
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 animate-fade-in hover-lift transition-all">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('documents.search')}
              className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 transition-colors"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading} className="btn-animate hover-scale">
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Documents List */}
      {documents.length === 0 ? (
        <Card className="p-12 text-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 animate-bounce-in">
          <FolderOpen className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
            {t('documents.empty')}
          </h3>
          <p className="text-slate-500 dark:text-slate-500 mb-6">
            {t('documents.emptyDesc')}
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 btn-animate hover-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('documents.createNew')}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc, index) => (
            <Card 
              key={doc.id} 
              className="p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 card-hover transition-all"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fade-in-up 0.4s ease-out forwards'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {doc.isPublic ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs animate-scale-in">
                          <Eye className="w-3 h-3" />
                          {t('documents.public')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs animate-scale-in">
                          <EyeOff className="w-3 h-3" />
                          {t('documents.private')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {t('documents.lastModified')}: {formatDate(doc.updatedAt)}
                    </div>
                  </div>

                  {doc.tags.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <div className="flex gap-1 flex-wrap">
                        {doc.tags.map((tag, tagIndex) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs animate-scale-in hover-scale transition-transform cursor-pointer"
                            style={{ animationDelay: `${(index * 100) + (tagIndex * 50)}ms` }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {doc.content.substring(0, 150)}...
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(doc.id)}
                    title={t('documents.actions.edit')}
                    className="btn-animate hover-scale hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(doc)}
                    title={t('documents.actions.duplicate')}
                    className="btn-animate hover-scale hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(doc.id)}
                    title={t('documents.actions.delete')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 btn-animate hover-scale"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
                {t('documents.deleteDialog.title')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {t('documents.deleteDialog.message')}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(null)}
                  className="flex-1"
                >
                  {t('documents.deleteDialog.cancel')}
                </Button>
                <Button
                  onClick={() => handleDelete(deleteDialogOpen)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {t('documents.deleteDialog.delete')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      </div>
    </PageLayout>
  )
}
