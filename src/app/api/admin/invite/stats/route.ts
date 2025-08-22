import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inviteKey } = body

    // Verify admin access
    if (inviteKey !== process.env.INVITE_KEY) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Get statistics
    const totalCodes = await prisma.inviteCode.count()
    const usedCodes = await prisma.inviteCode.count({
      where: { isUsed: true }
    })
    const expiredCodes = await prisma.inviteCode.count({
      where: {
        isUsed: false,
        expiresAt: {
          lt: new Date()
        }
      }
    })
    const activeCodes = totalCodes - usedCodes - expiredCodes

    // Get recent invite codes with details
    const recentCodes = await prisma.inviteCode.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        usedByUser: {
          select: {
            username: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCodes,
        active: activeCodes,
        used: usedCodes,
        expired: expiredCodes
      },
      recentCodes: recentCodes.map(code => ({
        id: code.id,
        code: code.code,
        isUsed: code.isUsed,
        usedBy: code.usedByUser?.username || null,
        usedByEmail: code.usedByUser?.email || null,
        usedAt: code.usedAt,
        expiresAt: code.expiresAt,
        createdAt: code.createdAt,
        isExpired: code.expiresAt ? new Date() > code.expiresAt : false
      }))
    })

  } catch (error) {
    console.error('Error fetching invite stats:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
