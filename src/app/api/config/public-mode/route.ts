import { NextResponse } from 'next/server'

export async function GET() {
  const publicModeEnabled = process.env.PUBLIC_MODE === 'true'
  
  return NextResponse.json({ 
    enabled: publicModeEnabled 
  })
}
