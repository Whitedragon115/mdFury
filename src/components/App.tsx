'use client'

import MarkdownPreviewer from './MarkdownPreviewer'
import { BackgroundLayer } from '@/components/layout'
import { Loader2 } from 'lucide-react'
import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { useBackgroundPreview } from '@/hooks/useBackgroundPreview'

export default function App() {
  const { isLoading, user } = useIntegratedAuth()
  const { previewState } = useBackgroundPreview()

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

  // Use preview state if available, otherwise fall back to user settings
  const backgroundSettings = previewState || {
    backgroundImage: user?.backgroundImage,
    backgroundBlur: user?.backgroundBlur,
    backgroundBrightness: user?.backgroundBrightness,
    backgroundOpacity: user?.backgroundOpacity
  }

  // Always show the editor - save functionality is restricted based on authentication
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
        <MarkdownPreviewer />
      </div>
    </>
  )
}
