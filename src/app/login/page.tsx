import { AuthProvider } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  )
}
