'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { LanguageSwitcher } from '@/components/common'
import { FileText, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react'
import OAuthButtons from './OAuthButtons'

interface LoginFormProps {
  redirectTo?: string
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useIntegratedAuth()

  // Force dark theme for login page
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      toast.error(t('auth.loginError'))
      return
    }

    try {
      const response = await login(credentials)
      
      if (!response.success) {
        toast.error(response.message || t('auth.loginError'))
      } else {
  toast.success(`Welcome back, ${credentials.username}!`)
  // Redirect back to original page if provided, else to main editor
  window.location.href = redirectTo || '/'
      }
    } catch (_error) {
      toast.error(t('auth.loginError'))
    }
  }

  //FEATURE
  const _isRegistrationDisabled = process.env.NODE_ENV === 'production' 
    ? false // In production, we'll fetch this from an API
    : process.env.DISABLE_REGISTRATION === 'true'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Language Switcher and Back Button */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/'}
          className="h-10 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-slate-300 dark:border-slate-600"
        >
          {t('common.back')}
        </Button>
        <LanguageSwitcher />
      </div>
      
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t('editor.title')}
          </h1>
          <p className="text-slate-400 mt-2">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">{t('auth.username')}</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder={t('auth.usernamePlaceholder')}
                className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">{t('auth.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-slate-600 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className={`w-full h-10 transition-all duration-200 ${
                isLoading 
                  ? 'bg-slate-600 hover:bg-slate-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:cursor-pointer'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('auth.signingIn')}...
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('auth.loginButton')}
                </>
              )}
            </Button>
          </form>

          {/* OAuth Buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">{t('auth.orContinueWith')}</span>
              </div>
            </div>
            <div className="mt-6">
              <OAuthButtons redirectTo={redirectTo} />
            </div>
          </div>

          {/* Register Link - only show if registration is enabled */}
          <div className="mt-6 text-center">
            <span className="text-slate-400">{t('auth.dontHaveAccount')} </span>
            <a
              href="/register"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {t('auth.registerHere')}
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
