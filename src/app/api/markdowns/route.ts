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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const markdowns = await MarkdownStorageService.getUserMarkdowns(user.id)
    
    return NextResponse.json({ success: true, markdowns })
  } catch (error) {
    console.error('Get markdowns API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }    const data = await request.json()
    
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
    console.error('Save markdown API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
