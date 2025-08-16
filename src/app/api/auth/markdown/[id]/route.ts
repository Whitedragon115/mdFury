import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { MarkdownStorageService } from '@/lib/api/markdown-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    
    const markdown = await MarkdownStorageService.getMarkdownById(id, user.id)
    
    if (!markdown) {
      return NextResponse.json(
        { success: false, message: 'Document not found or access denied' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, markdown })
  } catch (error) {
    console.error('Failed to get OAuth markdown by ID:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
