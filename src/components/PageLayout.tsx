'use client'

import { useAuth } from '@/contexts/AuthContext'
import { AccountDropdown } from '@/components/AccountDropdown'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'

interface PageLayoutProps {
  children: React.ReactNode
  showHeader?: boolean
}

export function PageLayout({ children, showHeader = true }: PageLayoutProps) {
  const { user } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen transition-all duration-500">
      {showHeader && (
        <header className="border-b border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t('editor.title')}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                {user && <AccountDropdown />}
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="container mx-auto p-4 min-h-[calc(100vh-80px)]">
        {children}
      </main>
    </div>
  )
}
