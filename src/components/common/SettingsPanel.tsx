'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { LogoutConfirmModal } from './LogoutConfirmModal'
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
  Loader2,
  Key,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Shield
} from 'lucide-react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { t, i18n } = useTranslation()
  const { user, updateUser, updateUserWithConfirmation, updateTheme, authType, isOAuthUser } = useIntegratedAuth()
  const { theme, setTheme } = useTheme()
  const { setPreview, clearPreview } = useBackgroundPreview()
  const [activeCategory, setActiveCategory] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false) // Track if form has been initialized
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [pendingLogout, setPendingLogout] = useState<(() => void) | null>(null)
  const [apiToken, setApiToken] = useState<string | null>(null)
  const [isTokenVisible, setIsTokenVisible] = useState(false)
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  // Email change states  
  const [newEmail, setNewEmail] = useState('')
  const [isChangingEmail, setIsChangingEmail] = useState(false)
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

  // Only initialize form data once when user is first loaded
  useEffect(() => {
    if (user && !hasInitialized) {
      
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
      // Load API token when user is loaded
      loadApiToken()
    }
  }, [user, theme, hasInitialized, loadApiToken])

  // Add debugging for user changes
  useEffect(() => {
    if (hasInitialized) {
      // User object changed after form initialization
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
  }, [isOpen, clearPreview])

  const handleClose = () => {
    clearPreview()
    setHasInitialized(false) // Reset initialization flag when closing
    onClose()
  }

  if (!user) return null

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

  const changePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error(t('settings.password.allFieldsRequired'))
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('settings.password.passwordMismatch'))
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('settings.password.passwordTooShort'))
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(t('settings.password.success'))
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(result.error || t('settings.password.error'))
      }
    } catch (error) {
      console.error('Change password error:', error)
      toast.error(t('settings.password.error'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  const changeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error(t('settings.emailChange.invalidEmail'))
      return
    }

    setIsChangingEmail(true)
    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newEmail })
      })

      const result = await response.json()
      if (result.success) {
        toast.success(t('settings.emailChange.success'))
        setNewEmail('')
        // Update form data with new email
        setFormData(prev => ({ ...prev, email: newEmail }))
      } else {
        toast.error(result.error || t('settings.emailChange.error'))
      }
    } catch (error) {
      console.error('Change email error:', error)
      toast.error(t('settings.emailChange.error'))
    } finally {
      setIsChangingEmail(false)
    }
  }

  const categories = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'account', label: t('settings.account'), icon: Shield },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'language', label: t('settings.language'), icon: Globe },
    { id: 'background', label: t('settings.background'), icon: ImageIcon },
    { id: 'api', label: t('settings.api.title'), icon: Key }
  ]

  const handleSave = async () => {
    if (!user) return

    setIsLoading(true)
    try {

      // Update language if changed
      if (formData.language !== user.language) {
        i18n.changeLanguage(formData.language)
      }

      // Update theme using next-themes and dedicated theme function
      if (formData.theme !== theme) {
        setTheme(formData.theme)
        updateTheme(formData.theme)
      }

      const updateData = {
        displayName: formData.displayName,
        profileImage: formData.profileImage,
        language: formData.language,
        backgroundImage: formData.backgroundImage,
        backgroundBlur: formData.backgroundBlur,
        backgroundBrightness: formData.backgroundBrightness,
        backgroundOpacity: formData.backgroundOpacity
      }

      // Check if profile-related fields (displayName or profileImage) have changed
      const profileChanged = (
        formData.displayName !== user.displayName ||
        formData.profileImage !== user.profileImage
      )

      console.log('SettingsPanel - isOAuthUser:', isOAuthUser)
      console.log('SettingsPanel - profileChanged:', profileChanged)
      console.log('SettingsPanel - updateData:', updateData)

      if (isOAuthUser && profileChanged) {
        console.log('Using OAuth update with confirmation modal (profile changed)')
        // For OAuth users with profile changes, use the confirmation method
        await updateUserWithConfirmation(updateData, (onConfirm) => {
          console.log('Setting up logout modal from SettingsPanel')
          setPendingLogout(() => onConfirm)
          setShowLogoutModal(true)
        })
        toast.success(t('settings.notifications.saved'))
      } else {
        console.log('Using normal update (no profile changes or credential user)')
        // For all other cases, normal update
        await updateUser(updateData)
        toast.success(t('settings.notifications.saved'))
      }

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
          disabled={authType === 'oauth'}
          className="mt-2 opacity-50"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {authType === 'oauth' ? 'Email cannot be changed for OAuth accounts' : 'Email can be changed in Account settings'}
        </p>
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

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
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
            <p className="text-sm text-slate-600 dark:text-slate-400">
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
    </div>
  )

  const renderAccountSettings = () => (
    <div className="space-y-6">
      {authType === 'credentials' ? (
        <>
          {/* Email change for credentials users */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('settings.emailChange.changeTitle')}</h3>
            <div>
              <Label htmlFor="newEmail">{t('settings.emailChange.newEmail')}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t('settings.emailChange.newEmailPlaceholder')}
                  className="flex-1"
                />
                <Button
                  onClick={changeEmail}
                  disabled={isChangingEmail || !newEmail}
                  className="min-w-20"
                >
                  {isChangingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    t('settings.emailChange.change')
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Password change for credentials users */}
          <div className="border-t pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('settings.password.changeTitle')}</h3>
              <div>
                <Label htmlFor="currentPassword">{t('settings.password.current')}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder={t('settings.password.currentPlaceholder')}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">{t('settings.password.new')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder={t('settings.password.newPlaceholder')}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('settings.password.confirm')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder={t('settings.password.confirmPlaceholder')}
                  className="mt-2"
                />
              </div>
              <Button
                onClick={changePassword}
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('settings.password.change')
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Shield className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
            {t('settings.accountSettings.oauthOnly')}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {t('settings.accountSettings.oauthDescription')}
          </p>
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeCategory) {
      case 'profile':
        return renderProfileSettings()
      case 'account':
        return renderAccountSettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'language':
        return renderLanguageSettings()
      case 'background':
        return renderBackgroundSettings()
      case 'api':
        return renderApiSettings()
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
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {/* Mobile Header */}
            <div className="sm:hidden p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-shrink-0">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {t('settings.title')}
              </h2>
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar min-h-0">
              <div className="mb-6 flex-shrink-0">
                <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">
                  {categories.find(c => c.id === activeCategory)?.label}
                </h3>
              </div>

              <div className="pb-4">
                {renderContent()}
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-end gap-3 p-4 sm:p-6 pt-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm flex-shrink-0">
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
    </>
  )
}
