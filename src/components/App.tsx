'use client'

import { useAuth } from '@/contexts/AuthContext'
import MarkdownPreviewer from './MarkdownPreviewer'
import LoginForm from './LoginForm'
import { Loader2 } from 'lucide-react'

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-lg text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <MarkdownPreviewer /> : <LoginForm />
}
