'use client'

import { useAuth } from '@/contexts/AuthContext'
import MarkdownPreviewer from './MarkdownPreviewer'
import { BackgroundLayer } from '@/components/layout'
import { Loader2 } from 'lucide-react'

export default function App() {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-lg text-slate-600 dark:text-slate-400">Loading...</span>
        </div>
      </div>
    )
  }

  // Always show the editor - save functionality is restricted based on authentication
  return (
    <>
      {/* Background Layer */}
      <BackgroundLayer
        backgroundImage={user?.backgroundImage}
        backgroundBlur={user?.backgroundBlur}
        backgroundBrightness={user?.backgroundBrightness}
      />
      
      <div className="animate-fade-in relative z-10">
        <MarkdownPreviewer />
      </div>
    </>
  )
}
