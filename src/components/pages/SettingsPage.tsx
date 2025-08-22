'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'
import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { PageLayout } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, User, Save, Loader2, ArrowLeft, Key, Copy, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { LoginForm } from '@/components/forms'
import { LogoutConfirmModal } from '@/components/common'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, updateUser, updateUserWithConfirmation, isOAuthUser } = useIntegratedAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [pendingLogout, setPendingLogout] = useState<(() => void) | null>(null)
  const [apiToken, setApiToken] = useState<string | null>(null)
  const [isTokenVisible, setIsTokenVisible] = useState(false)
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    profileImage: '',
    language: 'en',
    theme: 'dark' as 'light' | 'dark' | 'system'
  })
  const [imageVisible, setImageVisible] = useState(true)

  const loadApiToken = useCallback(async () => {
    if (!user) return
    try {
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      let response
      if (session?.user) {
        response = await fetch('/api/auth/token', { method: 'GET' })
      } else {
        response = await fetch('/api/auth/token', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        })
      }
      if (response.ok) {
        const data = await response.json()
        setApiToken(data.token || null)
      }
    } catch (error) {
      console.error('Failed to load API token:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        profileImage: user.profileImage || '',
        language: user.language || 'en',
        theme: (user.theme as 'light' | 'dark' | 'system') || 'dark'
      })
      // Load existing API token
      loadApiToken()
    } else {
      // Force dark theme for non-logged in users
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      setFormData(prev => ({ ...prev, theme: 'dark' }))
    }
  }, [user, theme, loadApiToken])

  // Reset image visibility when profile image URL changes
  useEffect(() => {
    setImageVisible(true)
  }, [formData.profileImage])


  const generateApiToken = async () => {
    if (!user) return
    
    setIsGeneratingToken(true)
    try {
      // Check if user is using OAuth
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      
      let response
      if (session?.user) {
        // OAuth user - use session-based authentication
        response = await fetch('/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } else {
        // Credential user - use Bearer token
        response = await fetch('/api/auth/token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
        })
      }
      
      if (response.ok) {
        const data = await response.json()
        setApiToken(data.token)
        toast.success(t('settings.api.tokenGenerated'))
      } else {
        throw new Error('Failed to generate token')
      }
    } catch (error) {
      console.error('Failed to generate API token:', error)
      toast.error(t('settings.api.tokenError'))
    } finally {
      setIsGeneratingToken(false)
    }
  }

  const regenerateApiToken = async () => {
    if (!user) return
    
    setIsGeneratingToken(true)
    try {
      // Check if user is using OAuth
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      
      let response
      if (session?.user) {
        // OAuth user - use session-based authentication
        response = await fetch('/api/auth/token', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      } else {
        // Credential user - use Bearer token
        response = await fetch('/api/auth/token', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
        })
      }
      
      if (response.ok) {
        const data = await response.json()
        setApiToken(data.token)
        toast.success(t('settings.api.tokenRegenerated'))
      } else {
        throw new Error('Failed to regenerate token')
      }
    } catch (error) {
      console.error('Failed to regenerate API token:', error)
      toast.error(t('settings.api.tokenError'))
    } finally {
      setIsGeneratingToken(false)
    }
  }

  const copyApiToken = async () => {
    if (!apiToken) return
    
    try {
      await navigator.clipboard.writeText(apiToken)
      toast.success(t('settings.api.tokenCopied'))
    } catch (error) {
      console.error('Failed to copy token:', error)
      toast.error(t('settings.api.copyError'))
    }
  }

  // If user is not authenticated, show login form with forced dark theme
  if (!user) {
    return (
      <div className="dark">
        <LoginForm />
      </div>
    )
  }

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Update language if changed
      if (formData.language !== user.language) {
        i18n.changeLanguage(formData.language)
      }

      // Update theme if changed
      if (formData.theme !== theme) {
        setTheme(formData.theme)
      }

      const updateData = {
        displayName: formData.displayName,
        profileImage: formData.profileImage,
        language: formData.language,
        theme: formData.theme
      }

      if (isOAuthUser) {
        // For OAuth users, use the confirmation method
        await updateUserWithConfirmation(updateData, (onConfirm) => {
          setPendingLogout(onConfirm)
          setShowLogoutModal(true)
        })
        toast.success(t('settings.notifications.saved'))
      } else {
        // For credential users, normal update
        await updateUser({
          ...user,
          ...updateData
        })
        toast.success(t('settings.notifications.saved'))
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error(t('settings.notifications.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 animate-slide-in-down">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          <Settings className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
            {t('settings.title')}
          </h1>
        </div>

        <div className="grid gap-6 max-w-2xl">
        {/* Profile Section */}
        <Card className="p-6 bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover-lift transition-all animate-fade-in">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            {t('settings.profile')}
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-700 dark:text-slate-300 font-medium">
                {t('settings.displayName')}
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder={t('settings.displayNamePlaceholder')}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 transition-colors focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-medium">
                {t('settings.email')}
              </Label>
              <Input
                id="email"
                value={formData.email}
                readOnly
                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>📧</span>
                Email cannot be changed in demo mode
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileImage" className="text-slate-700 dark:text-slate-300 font-medium">
                {t('settings.profileImage')}
              </Label>
              <Input
                id="profileImage"
                value={formData.profileImage}
                onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                placeholder={t('settings.profileImagePlaceholder')}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 transition-colors focus:ring-2 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              {formData.profileImage && imageVisible && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded animate-scale-in">
                  <Image
                    src={formData.profileImage}
                    alt="Preview"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover hover-scale transition-transform"
                    onError={() => setImageVisible(false)}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Preview</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* API Token Section */}
        <Card className="p-6 bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover-lift transition-all animate-fade-in" style={{ animationDelay: '150ms' }}>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
              <Key className="w-5 h-5 text-white" />
            </div>
            {t('settings.api.title')}
          </h2>
          
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {t('settings.api.description')}
            </p>
            
            {apiToken ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">
                    {t('settings.api.token')}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type={isTokenVisible ? 'text' : 'password'}
                      value={apiToken}
                      readOnly
                      className="flex-1 font-mono text-sm bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTokenVisible(!isTokenVisible)}
                      className="px-3"
                    >
                      {isTokenVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyApiToken}
                      className="px-3"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={regenerateApiToken}
                    disabled={isGeneratingToken}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingToken ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {t('settings.api.regenerate')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {t('settings.api.noToken')}
                </p>
                <Button
                  onClick={generateApiToken}
                  disabled={isGeneratingToken}
                  className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 flex items-center gap-2"
                >
                  {isGeneratingToken ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  {t('settings.api.generate')}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="p-6 bg-white/20 dark:bg-slate-900/30 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover-lift transition-all animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            {t('settings.preferences')}
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="text-slate-700 dark:text-slate-300 font-medium">
                {t('settings.language')}
              </Label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors focus:ring-2 focus:ring-blue-500/20 hover-lift"
                disabled={isLoading}
              >
                <option value="en">🇺🇸 English</option>
                <option value="zh">🇹🇼 中文</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme" className="text-slate-700 dark:text-slate-300 font-medium">
                {t('settings.theme')}
              </Label>
              <select
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' | 'system' })}
                className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors focus:ring-2 focus:ring-blue-500/20 hover-lift"
                disabled={isLoading}
              >
                <option value="system">🖥️ {t('settings.themes.system')}</option>
                <option value="light">☀️ {t('settings.themes.light')}</option>
                <option value="dark">🌙 {t('settings.themes.dark')}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 btn-animate hover-glow flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('common.loading')}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {t('settings.save')}
              </div>
            )}
          </Button>
        </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => {
          setShowLogoutModal(false)
          setPendingLogout(null)
        }}
        onConfirm={() => {
          if (pendingLogout) {
            pendingLogout()
          }
          setShowLogoutModal(false)
          setPendingLogout(null)
        }}
        title={t('settings.confirmLogout.title')}
        description={t('settings.confirmLogout.description')}
      />
    </PageLayout>
  )
}
