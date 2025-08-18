'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { LoginForm } from '@/components/forms'
import { OAuthErrorDialog } from '@/components/common'

function LoginContent() {
  const searchParams = useSearchParams()
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [redirectTo, setRedirectTo] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setOauthError(error)
      setShowErrorDialog(true)
    }
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectTo(redirect)
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

  return (
    <>
  <LoginForm redirectTo={redirectTo || undefined} />
      
      {/* OAuth Error Dialog */}
      <OAuthErrorDialog
        error={oauthError}
        isOpen={showErrorDialog}
        onClose={handleCloseError}
        onRetry={() => {
          setShowErrorDialog(false)
          // Optionally trigger a re-attempt or just close
        }}
        showRetryButton={true}
        autoCloseDelay={45000} // 45 seconds
      />
    </>
  )
}

function LoginLoading() {
  return (
    <div className="dark min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading login page...</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="dark min-h-screen bg-slate-900">
      <Suspense fallback={<LoginLoading />}>
        <LoginContent />
      </Suspense>
    </div>
  )
}
