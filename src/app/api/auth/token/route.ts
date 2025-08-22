import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth/index'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/auth-config'
import crypto from 'crypto'

async function getUserFromAuth(request: NextRequest) {
  // First try to get user from Bearer token (credential authentication)
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (token) {
    const user = await AuthService.getUserByToken(token)
    if (user) {
      return user
    }
  }
  
  // If no token or token invalid, try to get user from NextAuth session (OAuth)
  try {
    const session = await getServerSession(authConfig)
    if (session?.user?.email) {
      // Get full user data from database using the session user email
      const user = await AuthService.getUserByEmail(session.user.email)
      return user
    }
  } catch (error) {
    console.error('Failed to get session:', error)
  }
  
  return null
}

// Generate a secure API token
function generateApiToken(): string {
  return 'mdf_' + crypto.randomBytes(32).toString('hex')
}

// GET - Retrieve current API token
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's current API token from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { apiToken: true }
    })

    return NextResponse.json({
      success: true,
      token: dbUser?.apiToken || null
    })
  } catch (error) {
    console.error('Get API token error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Generate new API token
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Generate new API token
    const apiToken = generateApiToken()

    // Update user's API token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { apiToken }
    })

    return NextResponse.json({
      success: true,
      token: apiToken,
      message: 'API token generated successfully'
    })
  } catch (error) {
    console.error('Generate API token error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Regenerate API token
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Generate new API token
    const apiToken = generateApiToken()

    // Update user's API token in database
    await prisma.user.update({
      where: { id: user.id },
      data: { apiToken }
    })

    return NextResponse.json({
      success: true,
      token: apiToken,
      message: 'API token regenerated successfully'
    })
  } catch (error) {
    console.error('Regenerate API token error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove API token
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Remove user's API token from database
    await prisma.user.update({
      where: { id: user.id },
      data: { apiToken: null }
    })

    return NextResponse.json({
      success: true,
      message: 'API token removed successfully'
    })
  } catch (error) {
    console.error('Delete API token error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
