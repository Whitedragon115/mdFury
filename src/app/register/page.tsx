import { RegisterForm } from '@/components/forms'
import Link from 'next/link'

export default function RegisterPage() {
  // Always show the registration form, it will handle invite code validation internally
  return <RegisterForm />
}
