import { AuthProvider } from '@/contexts/AuthContext'
import { AuthBasedThemeController } from '@/components/providers'
import { LoginForm } from '@/components/forms'

export default function LoginPage() {
  return (
    <div className="dark min-h-screen bg-slate-900">
      <AuthProvider>
        <AuthBasedThemeController />
        <LoginForm />
      </AuthProvider>
    </div>
  )
}
