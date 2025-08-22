import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { inviteKey, expiryHours } = await request.json()

    // Verify invite key
    if (!inviteKey || inviteKey !== process.env.INVITE_KEY) {
      return NextResponse.json(
        { success: false, message: 'Invalid invite key' },
        { status: 403 }
      )
    }

    // Generate unique invite code
    const timestamp = Date.now()
    const randomString = crypto.randomBytes(8).toString('hex')
    const dataToHash = `${inviteKey}:${timestamp}:${randomString}`
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex')
    const code = hash.substring(0, 12).toUpperCase()

    // Calculate expiration
    let expiresAt: Date | null = null
    if (expiryHours && expiryHours > 0) {
      expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000)
    }

    // Save to database
    await prisma.inviteCode.create({
      data: {
        code,
        expiresAt,
        isUsed: false
      }
    })

    return NextResponse.json({
      success: true,
      code,
      expiresAt: expiresAt?.toISOString() || null
    })

  } catch (error) {
    console.error('Invite code generation error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate invite code' },
      { status: 500 }
    )
  }
}
