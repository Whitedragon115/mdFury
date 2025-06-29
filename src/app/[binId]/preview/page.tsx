'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function PreviewRedirect() {
  const { binId } = useParams()

  useEffect(() => {
    if (binId && typeof binId === 'string') {
      // Redirect to the main bin page (which shows preview by default)
      window.location.href = `/${binId}`
    }
  }, [binId])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Redirecting to preview...</p>
      </div>
    </div>
  )
}
