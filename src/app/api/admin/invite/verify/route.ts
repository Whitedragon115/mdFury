import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { inviteKey } = await request.json()

    if (!inviteKey || inviteKey !== process.env.INVITE_KEY) {
      return NextResponse.json(
        { success: false, message: 'Invalid invite key' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Invite key verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Verification failed' },
      { status: 500 }
    )
  }
}
