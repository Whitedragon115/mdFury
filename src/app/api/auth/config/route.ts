import { NextResponse } from 'next/server'

export async function GET() {
  const isRegistrationDisabled = process.env.DISABLE_REGISTRATION === 'true'
  const isOAuthRegistrationDisabled = process.env.DISABLE_OAUTH_REGISTRATION === 'true'
  const allowGuestMode = process.env.ALLOW_GUEST_MODE !== 'false'
  
  return NextResponse.json({
    registrationDisabled: isRegistrationDisabled,
    oauthRegistrationDisabled: isOAuthRegistrationDisabled,
    allowGuestMode: allowGuestMode,
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    oauthProviders: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      github: !!process.env.GITHUB_CLIENT_ID
    }
  })
}
