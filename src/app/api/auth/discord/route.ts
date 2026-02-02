import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDiscordAuthUrl, createOAuthState } from '@/lib/oauth'

/**
 * Initiate Discord OAuth flow
 * GET /api/auth/discord?formId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId') || undefined

    // Create state token with user ID and optional form ID
    const state = createOAuthState(user.id, formId)

    // Redirect to Discord OAuth
    const authUrl = getDiscordAuthUrl(state)
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Discord OAuth init error:', error)
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_failed', request.url)
    )
  }
}
