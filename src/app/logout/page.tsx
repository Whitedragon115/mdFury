'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useAuth } from '@/contexts/AuthContext'

export default function LogoutPage() {
  const { data: session } = useSession()
  const { logout: customLogout } = useAuth()
  const [step, setStep] = useState<'loading' | 'done'>('loading')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      // Small delay to show loading state
      await new Promise(r => setTimeout(r, 600))
      try {
        if (session) {
          await signOut({ redirect: false })
        }
      } finally {
        customLogout()
        if (!cancelled) {
          setStep('done')
        }
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [session, customLogout])

  // Auto-redirect to Home shortly after showing "done"
  useEffect(() => {
    if (step === 'done') {
      const timer = setTimeout(() => {
        window.location.href = '/'
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [step])

  return (
    <div className="dark min-h-screen bg-slate-900 flex items-center justify-center">
      {step === 'loading' ? (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Signing you out...</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="mx-auto mb-4 text-slate-200 text-xl">You have been signed out</div>
          <p className="text-gray-400">Redirecting to Home...</p>
          <a className="text-blue-400 hover:text-blue-300" href="/">Return now</a>
        </div>
      )}
    </div>
  )
}
