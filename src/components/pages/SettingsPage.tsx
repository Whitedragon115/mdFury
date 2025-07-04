'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { PageLayout } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthService } from '@/lib/auth/index'
import { Settings, User, Save, Loader2, ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/forms'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { user, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    profileImage: '',
    language: 'en',
    theme: 'dark' as 'light' | 'dark' | 'system'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        profileImage: user.profileImage || '',
        language: user.language || 'en',
        theme: (user.theme as 'light' | 'dark' | 'system') || 'dark'
      })
    } else {
      // Force dark theme for non-logged in users
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      setFormData(prev => ({ ...prev, theme: 'dark' }))
    }
  }, [user, theme])

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
      const result = await AuthService.updateUserProfile(user.id, {
        displayName: formData.displayName,
        profileImage: formData.profileImage,
        language: formData.language,
        theme: formData.theme
      })

      if (result.success && result.user) {
        // Update language if changed
        if (formData.language !== user.language) {
          i18n.changeLanguage(formData.language)
        }

        // Only allow theme changes for logged in users
        if (formData.theme !== theme) {
          setTheme(formData.theme)
        }

        // Re-login to update the user context
        updateUser(result.user)
        
        toast.success(t('settings.notifications.saved'))
      } else {
        toast.error(result.message || t('settings.notifications.error'))
      }
    } catch (error) {
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
              {formData.profileImage && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded animate-scale-in">
                  <img 
                    src={formData.profileImage} 
                    alt="Preview" 
                    className="w-10 h-10 rounded-full object-cover hover-scale transition-transform"
                    onError={(e) => {
                      e.currentTarget.src = ''
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Preview</span>
                </div>
              )}
            </div>
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
    </PageLayout>
  )
}
