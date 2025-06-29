'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { AccountDropdown } from '@/components/AccountDropdown'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import BinControls from '@/components/BinControls'
import { ClientMarkdownService, SavedMarkdown } from '@/lib/client-markdown'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FileText, 
  Eye, 
  Copy, 
  Download, 
  Split,
  Maximize2,
  LogIn,
  Save,
  Share2
} from 'lucide-react'

const initialMarkdown = `# 🎉 Welcome to mdFury

## Features

This is a **beautiful** and *modern* markdown editor with:

- ✅ Live preview
- ✅ Syntax highlighting
- ✅ GitHub Flavored Markdown
- ✅ Responsive design
- ✅ Dark/Light mode
- ✅ Copy and download functions
- ✅ Document saving and management

### Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

### Table

| Feature | Status | Description |
|---------|--------|-------------|
| Live Preview | ✅ | Real-time markdown rendering |
| Syntax Highlight | ✅ | Code syntax highlighting |
| Export | ✅ | Download as markdown file |
| Save Documents | ✅ | Save and manage your documents |

### Links and Images

[Visit GitHub](https://github.com)

> This is a blockquote. It's great for highlighting important information.

### Math (if needed)
You can add math expressions like \`E = mc²\`

---

**Start editing** in the left panel to see the magic happen! ✨
`

export default function MarkdownPreviewer({ initialDocument }: { initialDocument?: SavedMarkdown | null }) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const searchParams = useSearchParams()
  const documentId = searchParams.get('doc')
  const [markdown, setMarkdown] = useState(initialMarkdown)
  const [currentDocId, setCurrentDocId] = useState<string>()
  const [currentDocTitle, setCurrentDocTitle] = useState('')
  const [currentBinId, setCurrentBinId] = useState('')
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const [binPassword, setBinPassword] = useState('')
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const [isClient, setIsClient] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const isAuthenticated = !!user

  // Generate random bin ID
  const generateBinId = () => {
    return ClientMarkdownService.generateId()
  }

  // Set generated bin ID to state
  const setGeneratedBinId = () => {
    setCurrentBinId(generateBinId())
  }

  useEffect(() => {
    setIsClient(true)
    // Don't generate initial bin ID - only when user clicks save
  }, [])

  // Load document if documentId is provided or if initialDocument is passed
  useEffect(() => {
    if (initialDocument) {
      // Load from initialDocument prop (for edit page)
      setMarkdown(initialDocument.content)
      setCurrentDocId(initialDocument.id)
      setCurrentDocTitle(initialDocument.title)
      setCurrentBinId(initialDocument.binId || initialDocument.id)
      setCurrentTags(initialDocument.tags || [])
      setIsPublic(initialDocument.isPublic)
      // Show placeholder for password if document has one, but don't show actual password
      setBinPassword(initialDocument.password ? '••••••••' : '')
    } else if (documentId && user) {
      loadDocument(documentId)
    } else if (!documentId && !initialDocument) {
      // Reset to initial state when creating new document
      setMarkdown(initialMarkdown)
      setCurrentDocId(undefined)
      setCurrentDocTitle('')
      setCurrentBinId('')
      setCurrentTags([])
      setIsPublic(true) // Default to public
      setBinPassword('')
      // Don't generate bin ID until save
    }
  }, [documentId, user, initialDocument])

  const loadDocument = async (docId: string) => {
    if (!user) return
    
    try {
      // Note: This needs to be adjusted since we don't have getMarkdownById in client service
      // For now, we'll get all user markdowns and find the one we need
      const markdowns = await ClientMarkdownService.getUserMarkdowns()
      const doc = markdowns.find(m => m.id === docId)
      
      if (doc) {
        setMarkdown(doc.content)
        setCurrentDocId(doc.id)
        setCurrentDocTitle(doc.title)
        setCurrentBinId(doc.binId || doc.id) // Use binId if available, fallback to id
        setCurrentTags(doc.tags || [])
        setIsPublic(doc.isPublic || false)
        // Show placeholder for password if document has one, but don't show actual password
        setBinPassword(doc.password ? '••••••••' : '')
      } else {
        toast.error('Document not found')
        // Could redirect or show error
      }
    } catch (error) {
      toast.error('Failed to load document')
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      toast.success(t('editor.notifications.copied'))
    } catch (err) {
      console.error('Failed to copy text: ', err)
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = currentDocTitle ? `${currentDocTitle}.md` : 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(t('editor.notifications.downloaded'))
  }

  const shareDocument = async () => {
    if (!currentBinId) {
      toast.error('Please save the document first to get a share link')
      return
    }

    const previewUrl = `${window.location.origin}/bin/${currentBinId}`
    
    try {
      await navigator.clipboard.writeText(previewUrl)
      toast.success('Preview link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy share link')
    }
  }

  const handleSave = async () => {
    if (!user) {
      toast.error(t('editor.notifications.loginRequired'))
      return
    }

    if (!currentDocTitle.trim()) {
      toast.error('Please enter a title for your document')
      return
    }

    // Generate bin ID if not provided by user
    let binId = currentBinId.trim()
    if (!binId) {
      binId = generateBinId()
      setCurrentBinId(binId)
    }

    // Validate binId format
    const validation = ClientMarkdownService.validateBinId(binId)
    if (!validation.valid) {
      toast.error(validation.message || 'Invalid bin ID format')
      return
    }

    setIsSaving(true)
    try {
      // Handle password - if it's placeholder, don't include it in update
      let passwordToSave: string | undefined = undefined
      if (binPassword && binPassword !== '••••••••') {
        passwordToSave = binPassword
      } else if (binPassword === '') {
        passwordToSave = '' // Explicitly remove password
      }
      // If binPassword is '••••••••', we don't include password in the update

      const saveData = {
        title: currentDocTitle,
        content: markdown,
        tags: currentTags,
        isPublic: isPublic,
        binId: binId,
        ...(passwordToSave !== undefined && { password: passwordToSave })
      }

      if (currentDocId) {
        // Update existing document
        const result = await ClientMarkdownService.updateMarkdown(currentDocId, saveData)
        
        if (result.success) {
          // Update URL if binId changed
          if (result.markdown && result.markdown.binId) {
            setCurrentBinId(result.markdown.binId)
            window.history.replaceState(null, '', `/bin/${result.markdown.binId}/edit`)
          }
          const previewUrl = `${window.location.origin}/bin/${binId}`
          // Auto copy to clipboard
          try {
            await navigator.clipboard.writeText(previewUrl)
            toast.success(t('editor.notifications.updated'))
          } catch (err) {
            toast.success(t('editor.notifications.updated'))
          }
        } else {
          toast.error(result.message || 'Failed to update document')
        }
      } else {
        // Create new document
        const result = await ClientMarkdownService.saveMarkdown(saveData)
        
        if (result.success && result.markdown) {
          setCurrentDocId(result.markdown.id)
          setCurrentBinId(result.markdown.binId || result.markdown.id)
          // Redirect to edit page
          const binId = result.markdown.binId || result.markdown.id
          window.location.href = `/bin/${binId}/edit`
          const previewUrl = `${window.location.origin}/bin/${binId}`
          // Auto copy view link to clipboard
          try {
            await navigator.clipboard.writeText(previewUrl)
            toast.success(t('editor.notifications.saved'))
          } catch (err) {
            toast.success(t('editor.notifications.saved'))
          }
        } else {
          toast.error(result.message || 'Failed to save document')
        }
      }
    } catch (error) {
      toast.error('Failed to save document')
    } finally {
      setIsSaving(false)
    }
  }

  const handleNewDocument = () => {
    // Reset to initial state and clear URL
    setMarkdown(initialMarkdown)
    setCurrentDocId(undefined)
    setCurrentDocTitle('')
    setCurrentTags([])
    setIsPublic(true) // Default to public
    setBinPassword('')
    setCurrentBinId('') // Don't generate ID until save
    window.history.replaceState(null, '', '/')
  }

  const handleLogin = () => {
    // Navigate to login page
    window.location.href = '/login'
  }

  if (!isClient) {
    return <div className="min-h-screen" />
  }

  return (
    <div className="min-h-screen transition-all duration-500">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">              
            <button 
              onClick={handleNewDocument}
              className="flex items-center gap-3 group transition-all duration-200 hover:scale-105"
              title="Create new document"
            >
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg group-hover:shadow-lg transition-all duration-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-200">
                  {t('editor.title')}
                </h1>
              </div>
            </button>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {isAuthenticated ? (
                <AccountDropdown />
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogin}
                  className="h-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-none hover:from-blue-600 hover:to-purple-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('editor.actions.login')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 flex-1 pb-8">
        {/* Editor Toolbar - Floating above content */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-4 mb-2.5">
          {/* Left: View Mode Buttons */}
          <div className="flex bg-gray-900/30 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-300 dark:border-slate-600 rounded-lg p-1 shadow-lg">
            <Button
              variant={viewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('edit')}
              className="h-9 flex-1 md:flex-none"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('editor.viewModes.edit')}
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              className="h-9 flex-1 md:flex-none"
            >
              <Split className="w-4 h-4 mr-2" />
              {t('editor.viewModes.split')}
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="h-9 flex-1 md:flex-none"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('editor.viewModes.preview')}
            </Button>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard} 
              title={t('editor.actions.copy')} 
              className="h-9 whitespace-nowrap bg-gray-900/30 dark:bg-slate-900/50 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-lg hover:bg-gray-800/50 dark:hover:bg-slate-700/70 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset"
            >
              <Copy className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('editor.actions.copy')}</span>
              <span className="sm:hidden">Copy</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadMarkdown} 
              title={t('editor.actions.download')} 
              className="h-9 whitespace-nowrap bg-gray-900/30 dark:bg-slate-900/50 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-lg hover:bg-gray-800/50 dark:hover:bg-slate-700/70 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('editor.actions.download')}</span>
              <span className="sm:hidden">Download</span>
            </Button>
            {currentBinId && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={shareDocument} 
                title="Share document"
                className="h-9 whitespace-nowrap bg-gray-900/30 dark:bg-slate-900/50 backdrop-blur-sm border-slate-300 dark:border-slate-600 shadow-lg hover:bg-gray-800/50 dark:hover:bg-slate-700/70 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset"
              >
                <Share2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
                <span className="sm:hidden">Share</span>
              </Button>
            )}
          </div>
        </div>

        {/* Bin Controls - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="mt-4 mb-6">
            <BinControls
              title={currentDocTitle}
              binId={currentBinId}
              tags={currentTags}
              isPublic={isPublic}
              hasPassword={!!binPassword}
              password={binPassword}
              isLoading={isSaving}
              onTitleChange={setCurrentDocTitle}
              onBinIdChange={setCurrentBinId}
              onTagsChange={setCurrentTags}
              onPublicChange={setIsPublic}
              onPasswordChange={setBinPassword}
              onSave={handleSave}
              onGenerateId={setGeneratedBinId}
            />
          </div>
        )}

        <div className="grid gap-6 min-h-[calc(100vh-280px)]">
          {viewMode === 'split' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full animate-fade-in view-mode-transition">
              {/* Editor Panel */}
              <Card className="p-6 bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {t('editor.labels.editor')}
                  </h2>
                  <div className="text-sm text-slate-500 dark:text-slate-400 animate-fade-in">
                    {markdown.length} {t('common.characters')}
                  </div>
                </div>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Type your markdown here..."
                  className="h-full min-h-[300px] md:min-h-[500px] resize-none font-mono text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </Card>

              {/* Preview Panel */}
              <Card className="p-6 bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    {t('editor.labels.preview')}
                  </h2>                <Button variant="outline" size="sm" onClick={() => setViewMode('preview')} className="h-9">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                </div>
                <div className="h-full min-h-[300px] md:min-h-[500px] overflow-auto custom-scrollbar">
                  <div className="markdown-content animate-fade-in">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {viewMode === 'edit' && (
            <Card className="p-6 bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl h-full animate-slide-in-left view-mode-transition">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t('editor.labels.editor')}
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400 animate-fade-in">
                  {markdown.length} {t('common.characters')}
                </div>
              </div>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Type your markdown here..."
                className="h-full min-h-[400px] md:min-h-[600px] resize-none font-mono text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </Card>
          )}

          {viewMode === 'preview' && (
            <Card className="p-6 bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl h-full animate-slide-in-right view-mode-transition">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {t('editor.labels.preview')}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setViewMode('split')} className="h-9">
                  <Split className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-full min-h-[400px] md:min-h-[600px] overflow-auto custom-scrollbar">
                <div className="markdown-content animate-fade-in">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight, rehypeRaw]}
                  >
                    {markdown}
                  </ReactMarkdown>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
