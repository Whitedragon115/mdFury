import { NextRequest, NextResponse } from 'next/server'
import { MarkdownStorageService } from '@/lib/markdown-storage'
import { AuthService } from '@/lib/auth'

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return null
  }
  
  return await AuthService.getUserByToken(token)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request)
    const { id } = params
    
    const markdown = await MarkdownStorageService.getMarkdownById(id, user?.id)
    
    if (!markdown) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, markdown })
  } catch (error) {
    console.error('Get markdown API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const data = await request.json()
    
    const result = await MarkdownStorageService.updateMarkdown(id, user.id, data)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Update markdown API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    
    const result = await MarkdownStorageService.deleteMarkdown(id, user.id)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Delete markdown API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
