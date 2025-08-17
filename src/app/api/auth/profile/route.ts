import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/index'

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  return await AuthService.getUserByToken(token)
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const updates = await request.json()

    // Remove any fields that shouldn't be updated directly
    const { id: _id, username: _username, email: _email, ...allowedUpdates } = updates
    
    const result = await AuthService.updateUserProfile(user.id, allowedUpdates)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Update profile API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
