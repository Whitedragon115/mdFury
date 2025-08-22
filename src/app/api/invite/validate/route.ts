import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json()

    if (!inviteCode) {
      return NextResponse.json(
        { success: false, message: 'Invite code is required' },
        { status: 400 }
      )
    }

    // Find the invite code in database
    const code = await prisma.inviteCode.findUnique({
      where: { code: inviteCode.trim().toUpperCase() }
    })

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Invalid invite code' },
        { status: 400 }
      )
    }

    if (code.isUsed) {
      return NextResponse.json(
        { success: false, message: 'Invite code has already been used' },
        { status: 400 }
      )
    }

    if (code.expiresAt && code.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, message: 'Invite code has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Valid invite code',
      code: code.code
    })

  } catch (error) {
    console.error('Invite code validation error:', error)
    return NextResponse.json(
      { success: false, message: 'Validation failed' },
      { status: 500 }
    )
  }
}
