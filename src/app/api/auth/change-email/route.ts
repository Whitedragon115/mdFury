import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth'

export async function POST(req: NextRequest) {
  try {
    const { newEmail } = await req.json()

    if (!newEmail || !newEmail.includes('@')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid email address is required' 
      }, { status: 400 })
    }

    // Get authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await AuthService.getUserByToken(token)
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    // Update email
    const result = await AuthService.updateUserEmail(user.id, newEmail)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email updated successfully',
        user: result.user 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Failed to update email' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Change email error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
