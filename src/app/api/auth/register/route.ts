import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/index'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, confirmPassword, displayName, inviteCode } = await request.json()

    // Check if registration is disabled
    if (process.env.DISABLE_REGISTRATION === 'true') {
      // If registration is disabled, require invite code
      if (!inviteCode) {
        return NextResponse.json(
          { success: false, message: 'Invite code is required when registration is disabled' },
          { status: 403 }
        )
      }

      // Validate invite code
      try {
        const validateResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/invite/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode })
        })

        const validation = await validateResponse.json()
        
        if (!validation.success) {
          return NextResponse.json(
            { success: false, message: validation.message },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('Invite code validation error:', error)
        return NextResponse.json(
          { success: false, message: 'Failed to validate invite code' },
          { status: 500 }
        )
      }
    }

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
    
    if (result.success && inviteCode && result.user) {
      // Mark invite code as used
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/invite/use`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            inviteCode, 
            usedBy: result.user.id 
          })
        })
      } catch (error) {
        console.error('Failed to mark invite code as used:', error)
        // Don't fail registration if this fails
      }
    }
    
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
