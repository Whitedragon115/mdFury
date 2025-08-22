import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Current password and new password are required' 
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'New password must be at least 6 characters' 
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

    // Get user with password from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, password: true }
    })

    if (!dbUser || !dbUser.password) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found or no password set' 
      }, { status: 400 })
    }

    // Verify current password
    if (!await bcrypt.compare(currentPassword, dbUser.password)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Current password is incorrect' 
      }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    const result = await AuthService.updateUserPassword(user.id, hashedPassword)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Password updated successfully' })
    } else {
      return NextResponse.json({ success: false, error: result.error || 'Failed to update password' }, { status: 500 })
    }
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
