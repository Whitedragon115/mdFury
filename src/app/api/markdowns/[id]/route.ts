import { NextRequest, NextResponse } from 'next/server'
import { MarkdownStorageService } from '@/lib/api/markdown-storage'
import { AuthService } from '@/lib/auth/index'

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return null
  }
  
  return await AuthService.getUserByToken(token)
}

export async function   GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    const { id } = await params
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }    const { id } = await params
    const data = await request.json()
    
    // Validate that password-protected documents cannot be private
    if (data.password && data.isPublic === false) {
      return NextResponse.json(
        { success: false, message: 'Password-protected documents must be public' },
        { status: 400 }
      )
    }
    
    const result = await MarkdownStorageService.updateMarkdown(id, user.id, data)
    
    if (!result.success) {
      // If the document was not found or access denied, return 404
      if (result.message?.includes('not found') || result.message?.includes('access denied')) {
        return NextResponse.json(result, { status: 404 })
      }
      // For other errors, return 400
      return NextResponse.json(result, { status: 400 })
    }
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = await params
    
    const result = await MarkdownStorageService.deleteMarkdown(id, user.id)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Delete markdown API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
