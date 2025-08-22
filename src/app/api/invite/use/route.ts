import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, usedBy } = await request.json()

    if (!inviteCode) {
      return NextResponse.json(
        { success: false, message: 'Invite code is required' },
        { status: 400 }
      )
    }

    // Verify the invite code exists and is not already used
    const existingCode = await prisma.inviteCode.findUnique({
      where: { code: inviteCode.trim().toUpperCase() }
    })

    if (!existingCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid invite code' },
        { status: 400 }
      )
    }

    if (existingCode.isUsed) {
      return NextResponse.json(
        { success: false, message: 'Invite code has already been used' },
        { status: 400 }
      )
    }

    // Check if user exists if usedBy is provided
    let validUsedBy = null
    if (usedBy) {
      const user = await prisma.user.findUnique({
        where: { id: usedBy }
      })
      if (user) {
        validUsedBy = usedBy
      }
    }

    // Mark code as used
    const updatedCode = await prisma.inviteCode.update({
      where: { code: inviteCode.trim().toUpperCase() },
      data: {
        isUsed: true,
        usedBy: validUsedBy,
        usedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Invite code marked as used',
      code: updatedCode
    })

  } catch (error) {
    console.error('Mark invite code as used error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to mark code as used' },
      { status: 500 }
    )
  }
}
