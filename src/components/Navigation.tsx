'use client'

import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigation } from '@/contexts/NavigationContext'
import { Button } from '@/components/ui/button'
import { FileText, FolderOpen, Settings, LogOut, User } from 'lucide-react'

export function Navigation() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { currentPage, setCurrentPage } = useNavigation()

  if (!user) return null

  const navigationItems = [
    {
      id: 'editor' as const,
      label: t('navigation.editor'),
      icon: FileText
    },
    {
      id: 'documents' as const,
      label: t('navigation.myDocs'),
      icon: FolderOpen
    },
    {
      id: 'settings' as const,
      label: t('navigation.settings'),
      icon: Settings
    }
  ]

  return (
    <nav className="flex items-center gap-2 animate-fade-in">
      {/* Navigation Items */}
      <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage(item.id)}
              className="h-8 btn-animate transition-all hover-scale"
              title={item.label}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">{item.label}</span>
            </Button>
          )
        })}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const currentIndex = navigationItems.findIndex(item => item.id === currentPage)
            const nextIndex = (currentIndex + 1) % navigationItems.length
            setCurrentPage(navigationItems[nextIndex].id)
          }}
          className="btn-animate hover-scale"
        >
          {(() => {
            const currentItem = navigationItems.find(item => item.id === currentPage)
            if (currentItem) {
              const Icon = currentItem.icon
              return <Icon className="w-4 h-4" />
            }
            return <FileText className="w-4 h-4" />
          })()}
        </Button>
      </div>

      {/* User Info */}
      <div className="hidden md:flex items-center gap-3 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg animate-slide-in-right">
        {user.profileImage ? (
          <img 
            src={user.profileImage} 
            alt={user.displayName}
            className="w-6 h-6 rounded-full object-cover hover-scale transition-transform"
          />
        ) : (
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {user.displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {user.displayName}
        </span>
      </div>

      {/* Logout Button */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={logout} 
        title={t('navigation.logout')}
        className="btn-animate hover-scale text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <LogOut className="w-4 h-4" />
      </Button>
    </nav>
  )
}
