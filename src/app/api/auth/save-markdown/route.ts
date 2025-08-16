import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { MarkdownStorageService } from '@/lib/api/markdown-storage'

export async function POST(request: NextRequest) {
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

    const data = await request.json()
    
    // Validate that password-protected documents cannot be private
    if (data.password && data.isPublic === false) {
      return NextResponse.json(
        { success: false, message: 'Password-protected documents must be public' },
        { status: 400 }
      )
    }
    
    const result = await MarkdownStorageService.saveMarkdown(user.id, data)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to save OAuth markdown:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
