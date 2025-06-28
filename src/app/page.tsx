import { AuthProvider } from '@/contexts/AuthContext'
import App from '@/components/App'

export default function Home() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
