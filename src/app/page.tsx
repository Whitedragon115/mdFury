'use client'

import App from '@/components/App'
import { OAuthErrorDialog } from '@/components/common'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function PageContent() {
  const { data: _session, status } = useSession()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setOauthError(error)
      setShowErrorDialog(true)
    }
  }, [searchParams])

  const handleCloseError = () => {
    setShowErrorDialog(false)
    setOauthError(null)
    // Clean up URL without error parameter
    const url = new URL(window.location.href)
    url.searchParams.delete('error')
    window.history.replaceState({}, '', url.toString())
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <App />
      
      {/* OAuth Error Dialog */}
      <OAuthErrorDialog
        error={oauthError}
        isOpen={showErrorDialog}
        onClose={handleCloseError}
        onRetry={() => {
          window.location.href = '/login'
        }}
        showRetryButton={true}
        autoCloseDelay={30000} // 30 seconds
      />
    </>
  )
}

function HomeLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <PageContent />
    </Suspense>
  )
}
