'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Settings() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to main page since settings are now in the modal
    router.replace('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting to main page...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
          Settings are now available in the user menu
        </p>
      </div>
    </div>
  )
}
