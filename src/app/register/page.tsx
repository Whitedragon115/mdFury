import { RegisterForm } from '@/components/forms'
import Link from 'next/link'

export default function RegisterPage() {
  // Check if registration is disabled
  const isRegistrationDisabled = process.env.DISABLE_REGISTRATION === 'true'

  if (isRegistrationDisabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Registration Disabled</h1>
            <p className="text-slate-400 mt-2">New account registration is currently disabled.</p>
          </div>
          <div className="space-y-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Login
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <RegisterForm />
}
