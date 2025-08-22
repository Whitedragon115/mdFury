import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { 
      theme, 
      language, 
      displayName,
      profileImage,
      backgroundImage, 
      backgroundBlur, 
      backgroundBrightness, 
      backgroundOpacity 
    } = data

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        theme,
        language,
        displayName,
        profileImage,
        backgroundImage,
        backgroundBlur,
        backgroundBrightness,
        backgroundOpacity,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Failed to update OAuth user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
