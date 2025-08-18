'use client'

import { useIntegratedAuth } from '@/hooks/useIntegratedAuth'
import { useSession } from 'next-auth/react'

export default function DebugAuthPage() {
  const { user, authType, isLoading, refreshSession } = useIntegratedAuth()
  const { data: session } = useSession()

  if (isLoading) {
    return <div>Loading...</div>
  }

  const handleRefreshSession = async () => {
    if (refreshSession) {
      await refreshSession()
      window.location.reload()
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Information</h1>
      
      <div className="mb-4">
        <button
          onClick={handleRefreshSession}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh Session
        </button>
      </div>
      
      <div className="grid gap-6">
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Auth Type: {authType}</h2>
          
          <h3 className="font-medium mb-2">Integrated User:</h3>
          <pre className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="font-medium mb-2">NextAuth Session:</h3>
          <pre className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}