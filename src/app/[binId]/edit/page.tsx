import { redirect } from 'next/navigation'

interface LegacyEditPageProps {
  params: Promise<{ binId: string }>
}

export default async function LegacyEditPage({ params }: LegacyEditPageProps) {
  const { binId } = await params
  
  // Redirect to new URL structure
  redirect(`/bin/${binId}/edit`)
}