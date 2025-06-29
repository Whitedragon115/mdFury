'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { FileText, LogIn, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginForm() {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()

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
        // Redirect to main editor page after successful login
        window.location.href = '/'
      }
    } catch (error) {
      toast.error(t('auth.loginError'))
    }
  }

  const handleDemoLogin = (username: string, password: string) => {
    setCredentials({ username, password })
  }

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
              className="w-full h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  {t('auth.loginButton')}...
                </div>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('auth.loginButton')}
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Demo Accounts */}
        <Card className="p-4 bg-slate-800/30 backdrop-blur-sm border-slate-700">
          <h3 className="font-medium text-slate-200 mb-3">{t('auth.demoAccounts')}</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-10 justify-start text-sm bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-slate-100"
              onClick={() => handleDemoLogin('admin', 'admin123')}
            >
              <span className="font-medium">{t('auth.adminDemo')}:</span>
              <span className="ml-2 text-slate-400">admin / admin123</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-10 justify-start text-sm bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-slate-100"
              onClick={() => handleDemoLogin('demo', 'demo123')}
            >
              <span className="font-medium">{t('auth.userDemo')}:</span>
              <span className="ml-2 text-slate-400">demo / demo123</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
