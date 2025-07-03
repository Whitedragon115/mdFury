import { AuthProvider } from '@/contexts/AuthContext'
import { AuthBasedThemeController } from '@/components/providers'
import App from '@/components/App'

export default function Home() {
  return (
    <AuthProvider>
      <AuthBasedThemeController />
      <App />
    </AuthProvider>
  )
}
