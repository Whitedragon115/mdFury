'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Home,
  Users,
  Shield,
  Unlink
} from 'lucide-react'

// OAuth error definitions
const oauthErrorDetails = {
  OAuthAccountNotLinked: {
    title: 'Account Not Linked',
    description: 'An account with this email already exists but is not linked to this OAuth provider.',
    icon: Unlink,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    solutions: [
      'Sign in with your existing credentials first',
      'Link your OAuth account in settings after logging in',
      'Contact support if you need help merging accounts'
    ]
  },
  OAuthSignin: {
    title: 'OAuth Sign In Failed',
    description: 'There was an error during the OAuth authentication process.',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    solutions: [
      'Check your internet connection',
      'Try signing in again',
      'Clear browser cache and cookies if the issue persists'
    ]
  },
  OAuthCallback: {
    title: 'OAuth Callback Error',
    description: 'Failed to process the response from the authentication provider.',
    icon: RefreshCw,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    solutions: [
      'The authorization may have been cancelled',
      'Try the sign-in process again',
      'Make sure popups are enabled in your browser'
    ]
  },
  OAuthCreateAccount: {
    title: 'Account Creation Failed',
    description: 'Could not create a new account with the OAuth provider.',
    icon: Users,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    solutions: [
      'An account with this email may already exist',
      'Try signing in instead of registering',
      'Check if new registrations are currently allowed'
    ]
  },
  CredentialsSignin: {
    title: 'Invalid Credentials',
    description: 'The username or password you entered is incorrect.',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    solutions: [
      'Double-check your username and password',
      'Make sure Caps Lock is off',
      'Try resetting your password if needed'
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
      'Try again in a few minutes'
    ]
  }
}

export type OAuthErrorType = keyof typeof oauthErrorDetails

interface OAuthErrorDialogProps {
  error: string | OAuthErrorType | null
  isOpen: boolean
  onClose: () => void
  onRetry?: () => void
  showRetryButton?: boolean
  autoCloseDelay?: number
}

export function OAuthErrorDialog({ 
  error, 
  isOpen, 
  onClose, 
  onRetry,
  showRetryButton = true,
  autoCloseDelay = 30000 
}: OAuthErrorDialogProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(autoCloseDelay / 1000)

  const errorInfo = error && error in oauthErrorDetails 
    ? oauthErrorDetails[error as OAuthErrorType]
    : oauthErrorDetails.default

  const IconComponent = errorInfo.icon

  useEffect(() => {
    if (!isOpen || !autoCloseDelay) return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, autoCloseDelay, onClose])

  useEffect(() => {
    if (isOpen) {
      setCountdown(autoCloseDelay / 1000)
    }
  }, [isOpen, autoCloseDelay])

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      router.push('/login')
    }
    onClose()
  }

  const handleGoHome = () => {
    router.push('/')
    onClose()
  }

  if (!error) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className={`p-2 rounded-lg ${errorInfo.bgColor} ${errorInfo.borderColor} border`}>
              <IconComponent className={`w-5 h-5 ${errorInfo.color}`} />
            </div>
            {errorInfo.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {errorInfo.description}
          </p>

          {/* Error Details Card */}
          <Card className={`p-3 ${errorInfo.bgColor} ${errorInfo.borderColor} border`}>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                Error Code: {error}
              </h4>
              
              <div className="space-y-1">
                <h5 className="font-medium text-xs text-slate-700 dark:text-slate-300">
                  Suggested Actions:
                </h5>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  {errorInfo.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {showRetryButton && (
              <Button 
                onClick={handleRetry}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button 
              onClick={handleGoHome}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          {/* Auto-close countdown */}
          {autoCloseDelay > 0 && countdown > 0 && (
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              This dialog will close automatically in {countdown} seconds
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default OAuthErrorDialog