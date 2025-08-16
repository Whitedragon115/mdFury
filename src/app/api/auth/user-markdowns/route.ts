import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { MarkdownStorageService } from '@/lib/api/markdown-storage'

export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database to get the user ID
    const { prisma } = await import('@/lib/prisma')
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const markdowns = await MarkdownStorageService.getUserMarkdowns(user.id)
    
    return NextResponse.json({ success: true, markdowns })
  } catch (error) {
    console.error('Failed to get OAuth user markdowns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
