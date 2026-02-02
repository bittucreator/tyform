import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  exchangeGoogleCode, 
  parseOAuthState, 
  getGoogleUserInfo 
} from '@/lib/oauth'

/**
 * Google Sheets OAuth callback
 * GET /api/auth/google-sheets/callback?code=xxx&state=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL('/dashboard?error=oauth_denied', request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard?error=oauth_invalid', request.url)
      )
    }

    // Parse and validate state
    const stateData = parseOAuthState(state)
    if (!stateData) {
      return NextResponse.redirect(
        new URL('/dashboard?error=oauth_invalid_state', request.url)
      )
    }

    // Verify state is not too old (15 minutes max)
    if (Date.now() - stateData.timestamp > 15 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/dashboard?error=oauth_expired', request.url)
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== stateData.userId) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      )
    }

    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(code)
    
    // Get user info
    const userInfo = await getGoogleUserInfo(tokens.access_token)

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Store or update tokens in database
    // Note: oauth_tokens table type not yet in generated types
    const { error: upsertError } = await (supabase as unknown as { from: (table: string) => { upsert: (data: Record<string, unknown>, options?: Record<string, unknown>) => Promise<{ error: Error | null }> } })
      .from('oauth_tokens')
      .upsert({
        user_id: user.id,
        provider: 'google-sheets',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expires_at: expiresAt.toISOString(),
        scope: tokens.scope,
        provider_data: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        },
      }, {
        onConflict: 'user_id,provider',
      })

    if (upsertError) {
      console.error('Failed to store Google tokens:', upsertError)
      return NextResponse.redirect(
        new URL('/dashboard?error=oauth_storage_failed', request.url)
      )
    }

    // Redirect back to integrations page
    const redirectUrl = stateData.formId
      ? `/forms/${stateData.formId}/integrations?connected=google-sheets`
      : '/dashboard?connected=google-sheets'

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_failed', request.url)
    )
  }
}
