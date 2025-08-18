'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import toast from 'react-hot-toast'
import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { useBackgroundPreview } from '@/hooks/useBackgroundPreview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { 
  Settings, 
  User, 
  Palette, 
  Globe, 
  Image as ImageIcon,
  Monitor,
  Sun,
  Moon,
  Save,
  Loader2
} from 'lucide-react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { t, i18n } = useTranslation()
  const { user, updateUser, updateTheme } = useIntegratedAuth()
  const { theme, setTheme } = useTheme()
  const { setPreview, clearPreview } = useBackgroundPreview()
  const [activeCategory, setActiveCategory] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false) // Track if form has been initialized
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    profileImage: '',
    language: 'en',
    theme: 'system' as 'light' | 'dark' | 'system',
    backgroundImage: '',
    backgroundBlur: 0,
    backgroundBrightness: 70, // Consistent default
    backgroundOpacity: 0.1 // Add opacity control
  })

  // Only initialize form data once when user is first loaded
  useEffect(() => {
    if (user && !hasInitialized) {
      console.log('🎯 Initializing settings form with user data:', {
        userId: user.id,
        displayName: user.displayName,
        backgroundImage: user.backgroundImage,
        backgroundBlur: user.backgroundBlur,
        backgroundBrightness: user.backgroundBrightness,
        backgroundOpacity: user.backgroundOpacity
      })
      
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        profileImage: user.profileImage || '',
        language: user.language || 'en',
        theme: (theme as 'light' | 'dark' | 'system') || 'dark',
        backgroundImage: user.backgroundImage || '',
        backgroundBlur: user.backgroundBlur ?? 0,
        backgroundBrightness: user.backgroundBrightness ?? 70,
        backgroundOpacity: user.backgroundOpacity ?? 0.1
      })
      setHasInitialized(true)
    }
  }, [user, theme, hasInitialized])

  // Add debugging for user changes
  useEffect(() => {
    if (hasInitialized) {
      console.log('⚠️ User object changed after form initialization:', {
        userId: user?.id,
        userDisplayName: user?.displayName,
        userBackgroundImage: user?.backgroundImage,
        hasInitialized
      })
    }
  }, [user, hasInitialized])

  // Reset initialization flag when dialog opens/closes to allow re-initialization
  useEffect(() => {
    if (!isOpen) {
      setHasInitialized(false)
    }
  }, [isOpen])

  // Update background preview when settings change
  useEffect(() => {
    if (isOpen && formData.backgroundImage) {
      setPreview({
        backgroundImage: formData.backgroundImage,
        backgroundBlur: formData.backgroundBlur,
        backgroundBrightness: formData.backgroundBrightness,
        backgroundOpacity: formData.backgroundOpacity
      })
    } else if (!isOpen) {
      clearPreview()
    }
  }, [isOpen, formData.backgroundImage, formData.backgroundBlur, formData.backgroundBrightness, formData.backgroundOpacity, setPreview, clearPreview])

  // Clean up preview when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (!isOpen) {
        clearPreview()
      }
    }
  }, [isOpen])

  const handleClose = () => {
    clearPreview()
    setHasInitialized(false) // Reset initialization flag when closing
    onClose()
  }

  if (!user) return null

  const categories = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'language', label: t('settings.language'), icon: Globe },
    { id: 'background', label: t('settings.background'), icon: ImageIcon }
  ]

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      console.log('💾 Saving settings:', {
        displayName: formData.displayName,
        profileImage: formData.profileImage,
        language: formData.language,
        backgroundImage: formData.backgroundImage,
        backgroundBlur: formData.backgroundBlur,
        backgroundBrightness: formData.backgroundBrightness,
        backgroundOpacity: formData.backgroundOpacity
      })

      // Update language if changed
      if (formData.language !== user.language) {
        i18n.changeLanguage(formData.language)
      }

      // Update theme using next-themes and dedicated theme function
      if (formData.theme !== theme) {
        setTheme(formData.theme)
        updateTheme(formData.theme)
      }

      // Persist non-theme profile fields
      await updateUser({
        displayName: formData.displayName,
        profileImage: formData.profileImage,
        language: formData.language,
        backgroundImage: formData.backgroundImage,
        backgroundBlur: formData.backgroundBlur,
        backgroundBrightness: formData.backgroundBrightness,
        backgroundOpacity: formData.backgroundOpacity
      })

      console.log('✅ Settings saved successfully')
      toast.success(t('settings.notifications.saved'))
      clearPreview() // Clear preview after successful save
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error(t('settings.notifications.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="displayName">{t('settings.displayName')}</Label>
        <Input
          id="displayName"
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          placeholder={t('settings.displayNamePlaceholder')}
          className="mt-2"
        />
      </div>
      
      <div>
        <Label htmlFor="email">{t('settings.email')}</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled
          className="mt-2 opacity-50"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Email cannot be changed</p>
      </div>

      <div>
        <Label htmlFor="profileImage">{t('settings.profileImage')}</Label>
        <Input
          id="profileImage"
          value={formData.profileImage}
          onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
          placeholder={t('settings.profileImagePlaceholder')}
          className="mt-2"
        />
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <Label>{t('settings.theme')}</Label>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: t('settings.themes.light'), icon: Sun },
            { value: 'dark', label: t('settings.themes.dark'), icon: Moon },
            { value: 'system', label: t('settings.themes.system'), icon: Monitor }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFormData({ ...formData, theme: value as 'light' | 'dark' | 'system' })}
              className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                formData.theme === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div>
        <Label>{t('settings.language')}</Label>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {[
            { value: 'en', label: 'English', flag: '🇺🇸' },
            { value: 'zh', label: '中文', flag: '🇨🇳' }
          ].map(({ value, label, flag }) => (
            <button
              key={value}
              onClick={() => setFormData({ ...formData, language: value })}
              className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                formData.language === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span className="text-2xl mb-2 block">{flag}</span>
              <p className="text-sm font-medium">{label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBackgroundSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="backgroundImage">{t('settings.backgroundImage')}</Label>
        <Input
          id="backgroundImage"
          value={formData.backgroundImage}
          onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.value })}
          placeholder={t('settings.backgroundImagePlaceholder')}
          className="mt-2"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settings.backgroundImageDesc')}
        </p>
      </div>

      {formData.backgroundImage && (
        <>
          <div>
            <Label>{t('settings.backgroundBlur')}: {formData.backgroundBlur}px</Label>
            <div className="mt-2">
              <Slider
                value={[formData.backgroundBlur]}
                onValueChange={(value) => setFormData({ ...formData, backgroundBlur: value[0] })}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>0px</span>
              <span>20px</span>
            </div>
          </div>

          <div>
            <Label>{t('settings.backgroundBrightness')}: {formData.backgroundBrightness}%</Label>
            <div className="mt-2">
              <Slider
                value={[formData.backgroundBrightness]}
                onValueChange={(value) => setFormData({ ...formData, backgroundBrightness: value[0] })}
                max={100}
                min={10}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <Label>{t('settings.backgroundOpacity')}: {Math.round(formData.backgroundOpacity * 100)}%</Label>
            <div className="mt-2">
              <Slider
                value={[formData.backgroundOpacity]}
                onValueChange={(value) => setFormData({ ...formData, backgroundOpacity: value[0] })}
                max={1}
                min={0}
                step={0.05}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </>
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeCategory) {
      case 'profile':
        return renderProfileSettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'language':
        return renderLanguageSettings()
      case 'background':
        return renderBackgroundSettings()
      default:
        return renderProfileSettings()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] max-h-[800px] p-0 overflow-hidden sm:rounded-lg">
        <div className="flex h-full flex-col sm:flex-row">
          {/* Sidebar */}
          <div className="w-full sm:w-64 sm:min-w-64 bg-slate-50 dark:bg-slate-800 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-700 p-4 flex-shrink-0 overflow-y-auto max-h-32 sm:max-h-full custom-scrollbar">
            <DialogHeader className="mb-6 hidden sm:block">
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('settings.title')}
              </DialogTitle>
            </DialogHeader>

            <nav className="flex gap-2 sm:flex-col sm:space-y-2 overflow-x-auto sm:overflow-x-visible custom-scrollbar">
              {categories.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveCategory(id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 whitespace-nowrap sm:w-full ${
                    activeCategory === id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-[1.02]'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <div className="sm:hidden p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('settings.title')}
              </h2>
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
                  {categories.find(c => c.id === activeCategory)?.label}
                </h3>
              </div>

              {renderContent()}
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-end gap-3 p-4 sm:p-6 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <Button variant="outline" onClick={handleClose} className="min-w-20">
                {t('settings.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={isLoading} className="min-w-20">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('settings.save')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
