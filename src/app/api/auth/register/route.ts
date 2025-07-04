import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/index'

export async function POST(request: NextRequest) {
  try {
    // Check if registration is disabled
    if (process.env.DISABLE_REGISTRATION === 'true') {
      return NextResponse.json(
        { success: false, message: 'Registration is currently disabled' },
        { status: 403 }
      )
    }

    const { username, email, password, confirmPassword, displayName } = await request.json()

    if (!username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    const result = await AuthService.register({ 
      username, 
      email, 
      password, 
      confirmPassword,
      displayName 
    })
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
