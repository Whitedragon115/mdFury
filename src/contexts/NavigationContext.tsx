'use client'

import { createContext, useContext, useState } from 'react'

type Page = 'editor' | 'documents' | 'settings'

interface NavigationContextType {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  documentId?: string
  setDocumentId: (id?: string) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<Page>('editor')
  const [documentId, setDocumentId] = useState<string>()

  return (
    <NavigationContext.Provider value={{
      currentPage,
      setCurrentPage,
      documentId,
      setDocumentId
    }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
