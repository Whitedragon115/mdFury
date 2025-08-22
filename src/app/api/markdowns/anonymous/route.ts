import { NextRequest, NextResponse } from 'next/server'
import { MarkdownStorageService } from '@/lib/api/markdown-storage'

export async function POST(request: NextRequest) {
  try {
    // Check if public mode is enabled
    const publicModeEnabled = process.env.PUBLIC_MODE === 'true'
    
    if (!publicModeEnabled) {
      return NextResponse.json(
        { success: false, message: 'Public mode is disabled' },
        { status: 403 }
      )
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      )
    }
    
    // Force public mode requirements for anonymous markdowns
    const anonymousMarkdownData = {
      ...data,
      isPublic: true, // Always public for anonymous markdowns
      userId: null, // No user association
      tags: data.tags || [], // Default to empty array if no tags
    }
    
    // Validate that password-protected documents are public (redundant but safe)
    if (anonymousMarkdownData.password && anonymousMarkdownData.isPublic === false) {
      return NextResponse.json(
        { success: false, message: 'Password-protected documents must be public' },
        { status: 400 }
      )
    }
    
    const result = await MarkdownStorageService.saveAnonymousMarkdown(anonymousMarkdownData)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Save anonymous markdown API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
