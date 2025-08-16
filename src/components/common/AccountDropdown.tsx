'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { ClientAuthService } from '@/lib/auth/client-auth'
import { Button } from '@/components/ui/button'
import SettingsPanel from './SettingsPanel'
import Image from 'next/image'
import { 
  User, 
  ChevronDown, 
  FileText, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'


export function AccountDropdown() {
  const { t } = useTranslation()
  const { user, logout, updateUser } = useIntegratedAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!user) return null

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const handleSettings = () => {
    setShowSettings(true)
    setIsOpen(false)
  }

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    if (user) {
      try {
        const result = await ClientAuthService.updateProfile({ theme: newTheme })
        if (result.success && result.user) {
          setIsOpen(false)
          updateUser(result.user)
          return
        }
      } catch (error) {
        console.error('Failed to update theme:', error)
      }
    }
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 flex items-center gap-2 hover:bg-slate-100/30 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-700 bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-inset"
      >
        {user.profileImage ? (
          <Image
            src={user.profileImage}
            alt={user.displayName || 'User'}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {user.displayName}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-2">
            {/* User Info */}
            <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
              <p className="font-medium text-slate-900 dark:text-slate-100">{user.displayName}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => handleNavigation('/docs')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                <FileText className="w-4 h-4" />
                {t('navigation.myDocs')}
              </button>

              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                {t('navigation.settings')}
              </button>

              {/* Theme Selector */}
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t('settings.theme')}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                      theme === 'light' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                      theme === 'dark' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                      theme === 'system' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    Auto
                  </button>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('navigation.logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      <SettingsPanel 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  )
}
