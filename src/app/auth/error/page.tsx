'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Home, 
  Mail,
  Users,
  Shield,
  Unlink
} from 'lucide-react'

// OAuth error types and their details
const oauthErrors = {
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'An account with the same email address already exists but is not linked to this OAuth provider.',
    icon: Unlink,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    solutions: [
      'Try signing in with your existing account credentials',
      'If you have multiple accounts with the same email, contact support',
      'You can link your OAuth account after logging in with your existing account'
    ]
  },
  OAuthSignin: {
    title: 'OAuth Sign In Error',
    description: 'There was an error during the OAuth sign-in process.',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    solutions: [
      'Check your internet connection',
      'Try signing in again',
      'Clear your browser cache and cookies',
      'Make sure you\'re using a supported browser'
    ]
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'There was an error processing the OAuth callback from the provider.',
    icon: RefreshCw,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    solutions: [
      'The authorization was cancelled or failed',
      'Try the sign-in process again',
      'Check if the OAuth provider is experiencing issues',
      'Contact support if the problem persists'
    ]
  },
  OAuthCreateAccount: {
    title: 'Account Creation Error',
    description: 'Failed to create a new account with the OAuth provider.',
    icon: Users,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    solutions: [
      'An account with this email may already exist',
      'Try signing in instead of creating a new account',
      'Check if OAuth registration is enabled',
      'Contact support for assistance'
    ]
  },
  EmailCreateAccount: {
    title: 'Email Account Error',
    description: 'There was an error creating an account with email.',
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    solutions: [
      'Check if the email address is valid',
      'An account with this email may already exist',
      'Try using a different email address',
      'Contact support if needed'
    ]
  },
  Signin: {
    title: 'Sign In Error',
    description: 'There was an error during the sign-in process.',
    icon: Shield,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
    solutions: [
      'Check your credentials and try again',
      'Make sure your account is active',
      'Reset your password if needed',
      'Contact support for help'
    ]
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    description: 'The credentials you provided are incorrect.',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    solutions: [
      'Double-check your username and password',
      'Make sure Caps Lock is off',
      'Try resetting your password',
      'Contact support if you need help'
    ]
  },
  default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during authentication.',
    icon: AlertTriangle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
    solutions: [
      'Try refreshing the page',
      'Clear your browser cache',
      'Try again in a few minutes',
      'Contact support if the problem persists'
    ]
  }
}

type OAuthErrorType = keyof typeof oauthErrors

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(true)
  
  const error = searchParams.get('error') as OAuthErrorType || 'default'
  const errorInfo = oauthErrors[error] || oauthErrors.default
  const IconComponent = errorInfo.icon

  const handleGoHome = useCallback(() => {
    setShowDialog(false)
    router.push('/')
  }, [router])

  const handleTryAgain = useCallback(() => {
    setShowDialog(false)
    router.push('/login')
  }, [router])

  useEffect(() => {
    // Auto-close dialog after 30 seconds if user doesn't interact
    const timeout = setTimeout(() => {
      handleGoHome()
    }, 30000)

    return () => clearTimeout(timeout)
  }, [handleGoHome])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className={`p-2 rounded-lg ${errorInfo.bgColor} ${errorInfo.borderColor} border`}>
                <IconComponent className={`w-6 h-6 ${errorInfo.color}`} />
              </div>
              {errorInfo.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              {errorInfo.description}
            </p>

            {/* Error Details */}
            <Card className={`p-4 ${errorInfo.bgColor} ${errorInfo.borderColor} border`}>
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                  Error Code: {error}
                </h4>
                
                <div className="space-y-1">
                  <h5 className="font-medium text-xs text-slate-700 dark:text-slate-300">
                    Possible Solutions:
                  </h5>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    {errorInfo.solutions.map((solution, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-1">•</span>
                        <span>{solution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleTryAgain}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fallback content when dialog is closed */}
      {!showDialog && (
        <Card className="max-w-md w-full p-6 bg-white/10 dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <div className="text-center space-y-4">
            <div className={`w-16 h-16 mx-auto p-4 rounded-full ${errorInfo.bgColor} ${errorInfo.borderColor} border`}>
              <IconComponent className={`w-8 h-8 ${errorInfo.color}`} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {errorInfo.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {errorInfo.description}
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleTryAgain}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

// Loading component for Suspense fallback
function AuthErrorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 bg-white/10 dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-700">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto p-4 rounded-full bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Loading...
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Processing authentication error details
          </p>
        </div>
      </Card>
    </div>
  )
}

// Main export component with Suspense boundary
export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorLoading />}>
      <AuthErrorContent />
    </Suspense>
  )
}
