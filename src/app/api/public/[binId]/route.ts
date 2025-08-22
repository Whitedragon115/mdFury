import { NextRequest, NextResponse } from 'next/server'
import { MarkdownStorageService } from '@/lib/api/markdown-storage'
import { AuthService } from '@/lib/auth/index'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'

async function getUserFromAuth(request: NextRequest) {
  // First try to get user from Bearer token (credential authentication)
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (token) {
    const user = await AuthService.getUserByToken(token)
    if (user) {
      return user
    }
  }
  
  // If no token or token invalid, try to get user from NextAuth session (OAuth)
  try {
    const session = await getServerSession(authConfig)
    if (session?.user?.email) {
      // Get full user data from database using the session user email
      const user = await AuthService.getUserByEmail(session.user.email)
      return user
    }
  } catch (error) {
    console.error('Failed to get session:', error)
  }
  
  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ binId: string }> }
) {
  try {
    const { binId } = await params
    const url = new URL(request.url)
    const password = url.searchParams.get('password')
    
    // Get user from token if provided
    const user = await getUserFromAuth(request)
    const result = await MarkdownStorageService.getPublicMarkdown(
      binId, 
      password || undefined,
      user?.id
    )
    
    if (!result.success) {
      if (result.requiresAuth) {
        return NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        )
      }
      if (result.accessDenied) {
        return NextResponse.json(
          { success: false, message: 'Access denied' },
          { status: 403 }
        )
      }
      if (result.passwordRequired) {
        return NextResponse.json(
          { success: false, message: result.message || 'Password required' },
          { status: 406 }
        )
      }
      // For any other failure, return 404 to not reveal the existence of private bins
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
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
