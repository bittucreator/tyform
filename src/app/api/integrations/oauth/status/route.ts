import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  listGoogleSheets, 
  listNotionDatabases,
  listSlackChannels,
  getDiscordGuilds,
  refreshGoogleToken,
  refreshDiscordToken 
} from '@/lib/oauth'

interface OAuthToken {
  id: string
  provider: string
  access_token: string
  refresh_token: string | null
  expires_at: string | null
  provider_data: Record<string, unknown>
}

/**
 * Get OAuth connection status for all providers
 * GET /api/integrations/oauth/status
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all OAuth tokens for the user
    const { data: tokens, error } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    const typedTokens = (tokens || []) as OAuthToken[]

    // Build status for each provider
    const googleToken = typedTokens.find(t => t.provider === 'google-sheets')
    const notionToken = typedTokens.find(t => t.provider === 'notion')
    const slackToken = typedTokens.find(t => t.provider === 'slack')
    const discordToken = typedTokens.find(t => t.provider === 'discord')

    const status = {
      'google-sheets': {
        connected: !!googleToken,
        email: googleToken?.provider_data?.email || null,
        name: googleToken?.provider_data?.name || null,
        expiresAt: googleToken?.expires_at || null,
      },
      notion: {
        connected: !!notionToken,
        workspaceName: notionToken?.provider_data?.workspace_name || null,
        workspaceId: notionToken?.provider_data?.workspace_id || null,
      },
      slack: {
        connected: !!slackToken,
        teamName: slackToken?.provider_data?.team_name || null,
        teamId: slackToken?.provider_data?.team_id || null,
        hasWebhook: !!slackToken?.provider_data?.incoming_webhook,
      },
      discord: {
        connected: !!discordToken,
        username: discordToken?.provider_data?.user 
          ? (discordToken.provider_data.user as { username?: string })?.username 
          : null,
        guildName: discordToken?.provider_data?.guild
          ? (discordToken.provider_data.guild as { name?: string })?.name
          : null,
        guildId: discordToken?.provider_data?.guild
          ? (discordToken.provider_data.guild as { id?: string })?.id
          : null,
        hasWebhook: !!discordToken?.provider_data?.webhook,
        expiresAt: discordToken?.expires_at || null,
      },
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to get OAuth status:', error)
    return NextResponse.json(
      { error: 'Failed to get OAuth status' },
      { status: 500 }
    )
  }
}

/**
 * Disconnect an OAuth provider
 * DELETE /api/integrations/oauth/status?provider=google-sheets
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider || !['google-sheets', 'notion', 'slack', 'discord'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', provider)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to disconnect OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}

/**
 * List available resources (sheets, databases, channels, guilds)
 * POST /api/integrations/oauth/status
 * Body: { provider: 'google-sheets' | 'notion' | 'slack' | 'discord' }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider } = await request.json()

    if (!provider || !['google-sheets', 'notion', 'slack', 'discord'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      )
    }

    // Get token for the provider
    const { data: tokenData, error: tokenError } = await supabase
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', provider)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Provider not connected' },
        { status: 404 }
      )
    }

    const token = tokenData as OAuthToken
    let accessToken = token.access_token

    // Check if Google token needs refresh
    if (provider === 'google-sheets' && token.expires_at) {
      const expiresAt = new Date(token.expires_at)
      const now = new Date()
      
      // Refresh if expires in less than 5 minutes
      if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        if (token.refresh_token) {
          try {
            const refreshed = await refreshGoogleToken(token.refresh_token)
            accessToken = refreshed.access_token
            
            // Update stored token (oauth_tokens type not in generated types)
            const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000)
            await (supabase as unknown as { from: (table: string) => { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<void> } } })
              .from('oauth_tokens')
              .update({
                access_token: refreshed.access_token,
                expires_at: newExpiresAt.toISOString(),
              })
              .eq('id', token.id)
          } catch (refreshError) {
            console.error('Failed to refresh Google token:', refreshError)
            return NextResponse.json(
              { error: 'Token expired, please reconnect' },
              { status: 401 }
            )
          }
        } else {
          return NextResponse.json(
            { error: 'Token expired, please reconnect' },
            { status: 401 }
          )
        }
      }
    }

    // Check if Discord token needs refresh
    if (provider === 'discord' && token.expires_at) {
      const expiresAt = new Date(token.expires_at)
      const now = new Date()
      
      // Refresh if expires in less than 5 minutes
      if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        if (token.refresh_token) {
          try {
            const refreshed = await refreshDiscordToken(token.refresh_token)
            accessToken = refreshed.access_token
            
            // Update stored token
            const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000)
            await (supabase as unknown as { from: (table: string) => { update: (data: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<void> } } })
              .from('oauth_tokens')
              .update({
                access_token: refreshed.access_token,
                refresh_token: refreshed.refresh_token,
                expires_at: newExpiresAt.toISOString(),
              })
              .eq('id', token.id)
          } catch (refreshError) {
            console.error('Failed to refresh Discord token:', refreshError)
            return NextResponse.json(
              { error: 'Token expired, please reconnect' },
              { status: 401 }
            )
          }
        } else {
          return NextResponse.json(
            { error: 'Token expired, please reconnect' },
            { status: 401 }
          )
        }
      }
    }

    // List resources based on provider
    if (provider === 'google-sheets') {
      const sheets = await listGoogleSheets(accessToken)
      return NextResponse.json({ resources: sheets })
    } else if (provider === 'notion') {
      const databases = await listNotionDatabases(accessToken)
      return NextResponse.json({ resources: databases })
    } else if (provider === 'slack') {
      const channels = await listSlackChannels(accessToken)
      return NextResponse.json({ resources: channels })
    } else if (provider === 'discord') {
      const guilds = await getDiscordGuilds(accessToken)
      return NextResponse.json({ resources: guilds })
    }

    return NextResponse.json({ resources: [] })
  } catch (error) {
    console.error('Failed to list resources:', error)
    return NextResponse.json(
      { error: 'Failed to list resources' },
      { status: 500 }
    )
  }
}
