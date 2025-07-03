import { NextRequest, NextResponse } from 'next/server'
import { MarkdownStorageService } from '@/lib/api/markdown-storage'
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
  { params }: { params: { binId: string } }
) {
  try {
    const { binId } = params
    const url = new URL(request.url)
    const password = url.searchParams.get('password')
    
    // Get user from token if provided
    const user = await getUserFromToken(request)
    
    const result = await MarkdownStorageService.getPublicMarkdown(
      binId, 
      password || undefined,
      user?.id
    )
    
    if (!result.success) {
      if (result.requiresAuth) {
        return NextResponse.json(result, { status: 401 })
      }
      if (result.accessDenied) {
        return NextResponse.json(result, { status: 403 })
      }
      if (result.passwordRequired) {
        return NextResponse.json(result, { status: 423 }) // Locked
      }
      return NextResponse.json(result, { status: 404 })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Get public markdown API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
