import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exchangeNotionCode, parseOAuthState } from '@/lib/oauth'

/**
 * Notion OAuth callback
 * GET /api/auth/notion/callback?code=xxx&state=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Notion OAuth error:', error)
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
    const tokenResponse = await exchangeNotionCode(code)

    // Store or update tokens in database
    // Note: oauth_tokens table type not yet in generated types
    // Notion tokens don't expire, so no expires_at
    const { error: upsertError } = await (supabase as unknown as { from: (table: string) => { upsert: (data: Record<string, unknown>, options?: Record<string, unknown>) => Promise<{ error: Error | null }> } })
      .from('oauth_tokens')
      .upsert({
        user_id: user.id,
        provider: 'notion',
        access_token: tokenResponse.access_token,
        refresh_token: null, // Notion doesn't use refresh tokens
        token_type: tokenResponse.token_type,
        expires_at: null, // Notion tokens don't expire
        scope: null,
        provider_data: {
          bot_id: tokenResponse.bot_id,
          workspace_id: tokenResponse.workspace_id,
          workspace_name: tokenResponse.workspace_name,
          workspace_icon: tokenResponse.workspace_icon,
          owner: tokenResponse.owner,
        },
      }, {
        onConflict: 'user_id,provider',
      })

    if (upsertError) {
      console.error('Failed to store Notion tokens:', upsertError)
      return NextResponse.redirect(
        new URL('/dashboard?error=oauth_storage_failed', request.url)
      )
    }

    // Redirect back to integrations page
    const redirectUrl = stateData.formId
      ? `/forms/${stateData.formId}/integrations?connected=notion`
      : '/dashboard?connected=notion'

    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error('Notion OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_failed', request.url)
    )
  }
}
