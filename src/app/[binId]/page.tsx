import { redirect } from 'next/navigation'

interface LegacyBinPageProps {
  params: Promise<{ binId: string }>
}

export default async function LegacyBinPage({ params }: LegacyBinPageProps) {
  const { binId } = await params
  
  // Redirect to new URL structure
  redirect(`/bin/${binId}`)
}