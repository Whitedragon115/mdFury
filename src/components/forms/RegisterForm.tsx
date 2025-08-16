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
import { UserPlus, Eye, EyeOff, Loader2, User, Mail, Lock, FileText } from 'lucide-react'
import OAuthButtons from './OAuthButtons'

export default function RegisterForm() {
  const { t } = useTranslation()
  const [credentials, setCredentials] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useIntegratedAuth()

  // Force dark theme for register page
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!credentials.username.trim() || !credentials.email.trim() || !credentials.password.trim() || !credentials.confirmPassword.trim()) {
      toast.error(t('auth.allFieldsRequired'))
      return
    }

    if (credentials.password !== credentials.confirmPassword) {
      toast.error(t('auth.passwordMismatch'))
      return
    }

    if (credentials.password.length < 6) {
      toast.error(t('auth.passwordTooShort'))
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(credentials.email)) {
      toast.error(t('auth.invalidEmail'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await register(credentials)
      
      if (!response.success) {
        toast.error(response.message || t('auth.registerError'))
      } else {
        toast.success(t('auth.registerSuccess'))
        // Redirect to main editor page after successful registration
        window.location.href = '/'
      }
    } catch (_error) {
      toast.error(t('auth.registerError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Join mdFury</h1>
            <p className="text-slate-400 mt-2">{t('auth.createAccount')}</p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex justify-center">
          <LanguageSwitcher />
        </div>

        {/* Registration Form */}
        <Card className="p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                <User className="w-4 h-4 inline mr-2" />
                {t('auth.username')}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={t('auth.usernamePlaceholder')}
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                <Mail className="w-4 h-4 inline mr-2" />
                {t('auth.email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                required
              />
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-300">
                <User className="w-4 h-4 inline mr-2" />
                {t('auth.displayName')} <span className="text-slate-500">({t('auth.optional')})</span>
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder={t('auth.displayNamePlaceholder')}
                value={credentials.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                <Lock className="w-4 h-4 inline mr-2" />
                {t('auth.password')}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.passwordPlaceholder')}
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">
                <Lock className="w-4 h-4 inline mr-2" />
                {t('auth.confirmPassword')}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={credentials.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('auth.registering')}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('auth.register')}
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
              <OAuthButtons />
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-slate-400">{t('auth.alreadyHaveAccount')} </span>
            <a
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {t('auth.loginHere')}
            </a>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>{t('auth.termsAgreement')}</p>
        </div>
      </div>
    </div>
  )
}
