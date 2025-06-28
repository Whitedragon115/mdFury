'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Eye, 
  Copy, 
  Download, 
  Moon, 
  Sun,
  Split,
  Maximize2,
  RotateCcw,
  LogOut,
  User
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

const initialMarkdown = `# 🎉 Welcome to Markdown Previewer

## Features

This is a **beautiful** and *modern* markdown previewer with:

- ✅ Live preview
- ✅ Syntax highlighting
- ✅ GitHub Flavored Markdown
- ✅ Responsive design
- ✅ Dark/Light mode
- ✅ Copy and download functions

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

### Links and Images

[Visit GitHub](https://github.com)

> This is a blockquote. It's great for highlighting important information.

### Math (if needed)
You can add math expressions like \`E = mc²\`

---

**Start editing** in the left panel to see the magic happen! ✨
`

export default function MarkdownPreviewer() {
  const { t } = useTranslation()
  const [markdown, setMarkdown] = useState(initialMarkdown)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split')
  const [isClient, setIsClient] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    setIsClient(true)
    // Check for saved dark mode preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
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
    a.download = 'document.md'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(t('editor.notifications.downloaded'))
  }

  const resetContent = () => {
    setMarkdown(initialMarkdown)
    toast.success(t('editor.notifications.reset'))
  }

  const handleLogout = () => {
    logout()
    toast.success(t('editor.notifications.loggedOut'))
  }

  if (!isClient) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-all duration-500">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('editor.title')}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Live markdown editor with instant preview
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <LanguageSwitcher />
              
              {/* User Info */}
              <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user?.username}
                </span>
              </div>

              {/* View Mode Buttons */}
              <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <Button
                  variant={viewMode === 'edit' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('edit')}
                  className="h-8"
                  title={t('editor.viewModes.edit')}
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                  className="h-8"
                  title={t('editor.viewModes.split')}
                >
                  <Split className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('preview')}
                  className="h-8"
                  title={t('editor.viewModes.preview')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <Button variant="outline" size="sm" onClick={copyToClipboard} title={t('editor.actions.copy')}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={downloadMarkdown} title={t('editor.actions.download')}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetContent} title={t('editor.actions.reset')}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleDarkMode} title={isDarkMode ? t('common.lightMode') : t('common.darkMode')}>
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} title={t('editor.actions.logout')}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <div className="grid gap-6 h-[calc(100vh-140px)]">
          {viewMode === 'split' && (
            <div className="grid md:grid-cols-2 gap-6 h-full">
              {/* Editor Panel */}
              <Card className="p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Editor
                  </h2>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {markdown.length} characters
                  </div>
                </div>
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Type your markdown here..."
                  className="h-full min-h-[500px] resize-none font-mono text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </Card>

              {/* Preview Panel */}
              <Card className="p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Preview
                  </h2>
                  <Button variant="outline" size="sm" onClick={() => setViewMode('preview')}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="h-full min-h-[500px] overflow-auto">
                  <div className="markdown-content">
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
            <Card className="p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Editor
                </h2>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {markdown.length} characters
                </div>
              </div>
              <Textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Type your markdown here..."
                className="h-full min-h-[600px] resize-none font-mono text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </Card>
          )}

          {viewMode === 'preview' && (
            <Card className="p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview
                </h2>
                <Button variant="outline" size="sm" onClick={() => setViewMode('split')}>
                  <Split className="w-4 h-4" />
                </Button>
              </div>
              <div className="h-full min-h-[600px] overflow-auto">
                <div className="markdown-content">
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
