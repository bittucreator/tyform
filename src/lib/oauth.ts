/**
 * OAuth configuration and utilities for Google Sheets, Notion, Slack, and Discord
 */

// Google OAuth configuration
export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google-sheets/callback`,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
}

// Notion OAuth configuration
export const NOTION_OAUTH_CONFIG = {
  clientId: process.env.NOTION_CLIENT_ID || '',
  clientSecret: process.env.NOTION_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/notion/callback`,
  authUrl: 'https://api.notion.com/v1/oauth/authorize',
  tokenUrl: 'https://api.notion.com/v1/oauth/token',
}

// Slack OAuth configuration
export const SLACK_OAUTH_CONFIG = {
  clientId: process.env.SLACK_CLIENT_ID || '',
  clientSecret: process.env.SLACK_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/slack/callback`,
  scopes: [
    'incoming-webhook',
    'channels:read',
    'chat:write',
    'team:read',
  ],
  userScopes: [],
  authUrl: 'https://slack.com/oauth/v2/authorize',
  tokenUrl: 'https://slack.com/api/oauth.v2.access',
}

// Discord OAuth configuration
export const DISCORD_OAUTH_CONFIG = {
  clientId: process.env.DISCORD_CLIENT_ID || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`,
  scopes: ['webhook.incoming', 'identify', 'guilds'],
  authUrl: 'https://discord.com/api/oauth2/authorize',
  tokenUrl: 'https://discord.com/api/oauth2/token',
}

/**
 * Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  
  return `${GOOGLE_OAUTH_CONFIG.authUrl}?${params.toString()}`
}

/**
 * Generate Notion OAuth authorization URL
 */
export function getNotionAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: NOTION_OAUTH_CONFIG.clientId,
    redirect_uri: NOTION_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    owner: 'user',
    state,
  })
  
  return `${NOTION_OAUTH_CONFIG.authUrl}?${params.toString()}`
}

/**
 * Generate Slack OAuth authorization URL
 */
export function getSlackAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: SLACK_OAUTH_CONFIG.clientId,
    redirect_uri: SLACK_OAUTH_CONFIG.redirectUri,
    scope: SLACK_OAUTH_CONFIG.scopes.join(','),
    state,
  })
  
  return `${SLACK_OAUTH_CONFIG.authUrl}?${params.toString()}`
}

/**
 * Generate Discord OAuth authorization URL
 */
export function getDiscordAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: DISCORD_OAUTH_CONFIG.clientId,
    redirect_uri: DISCORD_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: DISCORD_OAUTH_CONFIG.scopes.join(' '),
    state,
  })
  
  return `${DISCORD_OAUTH_CONFIG.authUrl}?${params.toString()}`
}

/**
 * Exchange Google authorization code for tokens
 */
export async function exchangeGoogleCode(code: string): Promise<{
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}> {
  const response = await fetch(GOOGLE_OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
      redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange Google code: ${error}`)
  }

  return response.json()
}

/**
 * Exchange Notion authorization code for tokens
 */
export async function exchangeNotionCode(code: string): Promise<{
  access_token: string
  token_type: string
  bot_id: string
  workspace_id: string
  workspace_name?: string
  workspace_icon?: string
  owner: {
    type: string
    user?: {
      id: string
      name?: string
      avatar_url?: string
      person?: { email?: string }
    }
  }
}> {
  const credentials = Buffer.from(
    `${NOTION_OAUTH_CONFIG.clientId}:${NOTION_OAUTH_CONFIG.clientSecret}`
  ).toString('base64')

  const response = await fetch(NOTION_OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: NOTION_OAUTH_CONFIG.redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange Notion code: ${error}`)
  }

  return response.json()
}

/**
 * Refresh Google access token
 */
export async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
  scope: string
  token_type: string
}> {
  const response = await fetch(GOOGLE_OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh Google token: ${error}`)
  }

  return response.json()
}

/**
 * Get Google user info
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  email: string
  name?: string
  picture?: string
}> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get Google user info')
  }

  return response.json()
}

/**
 * List Google Sheets for selection
 */
export async function listGoogleSheets(accessToken: string): Promise<Array<{
  id: string
  name: string
  webViewLink: string
}>> {
  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27&fields=files(id%2Cname%2CwebViewLink)',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Google Sheets API error:', response.status, errorText)
    throw new Error(`Failed to list Google Sheets: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.files || []
}

/**
 * List Notion databases for selection
 */
export async function listNotionDatabases(accessToken: string): Promise<Array<{
  id: string
  title: string
  url: string
}>> {
  const response = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: { value: 'database', property: 'object' },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Notion search API error:', response.status, errorText)
    throw new Error(`Failed to list Notion databases: ${response.status}`)
  }

  const data = await response.json()
  console.log('Notion databases found:', data.results?.length || 0)
  
  return (data.results || []).map((db: {
    id: string
    url: string
    title?: Array<{ plain_text?: string }>
  }) => ({
    id: db.id,
    title: db.title?.[0]?.plain_text || 'Untitled',
    url: db.url,
  }))
}

/**
 * Exchange Slack authorization code for tokens
 */
export async function exchangeSlackCode(code: string): Promise<{
  ok: boolean
  access_token: string
  token_type: string
  scope: string
  bot_user_id: string
  app_id: string
  team: { id: string; name: string }
  authed_user: { id: string; access_token?: string }
  incoming_webhook?: {
    channel: string
    channel_id: string
    configuration_url: string
    url: string
  }
}> {
  const response = await fetch(SLACK_OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: SLACK_OAUTH_CONFIG.clientId,
      client_secret: SLACK_OAUTH_CONFIG.clientSecret,
      redirect_uri: SLACK_OAUTH_CONFIG.redirectUri,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange Slack code: ${error}`)
  }

  const data = await response.json()
  if (!data.ok) {
    throw new Error(`Slack OAuth error: ${data.error}`)
  }

  return data
}

/**
 * Exchange Discord authorization code for tokens
 */
export async function exchangeDiscordCode(code: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
  webhook?: {
    id: string
    token: string
    name: string
    channel_id: string
    guild_id: string
    url: string
  }
  guild?: {
    id: string
    name: string
    icon?: string
  }
}> {
  const response = await fetch(DISCORD_OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: DISCORD_OAUTH_CONFIG.clientId,
      client_secret: DISCORD_OAUTH_CONFIG.clientSecret,
      redirect_uri: DISCORD_OAUTH_CONFIG.redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange Discord code: ${error}`)
  }

  return response.json()
}

/**
 * Get Discord user info
 */
export async function getDiscordUserInfo(accessToken: string): Promise<{
  id: string
  username: string
  discriminator: string
  avatar?: string
  email?: string
}> {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to get Discord user info')
  }

  return response.json()
}

/**
 * Get Discord guilds (servers) the user is in
 */
export async function getDiscordGuilds(accessToken: string): Promise<Array<{
  id: string
  name: string
  icon?: string
  owner: boolean
  permissions: string
}>> {
  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Discord guilds API error:', response.status, errorText)
    throw new Error(`Failed to get Discord guilds: ${response.status} - ${errorText}`)
  }

  return response.json()
}

/**
 * List Slack channels for selection
 */
export async function listSlackChannels(accessToken: string): Promise<Array<{
  id: string
  name: string
  is_private: boolean
  is_member: boolean
}>> {
  const response = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel&exclude_archived=true', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to list Slack channels')
  }

  const data = await response.json()
  if (!data.ok) {
    throw new Error(`Slack API error: ${data.error}`)
  }

  return (data.channels || []).map((ch: {
    id: string
    name: string
    is_private: boolean
    is_member: boolean
  }) => ({
    id: ch.id,
    name: ch.name,
    is_private: ch.is_private,
    is_member: ch.is_member,
  }))
}

/**
 * Refresh Discord access token
 */
export async function refreshDiscordToken(refreshToken: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}> {
  const response = await fetch(DISCORD_OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: DISCORD_OAUTH_CONFIG.clientId,
      client_secret: DISCORD_OAUTH_CONFIG.clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh Discord token: ${error}`)
  }

  return response.json()
}

/**
 * Create state token for OAuth flow (includes form_id for redirect)
 */
export function createOAuthState(userId: string, formId?: string): string {
  const state = {
    userId,
    formId,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(2),
  }
  return Buffer.from(JSON.stringify(state)).toString('base64url')
}

/**
 * Parse OAuth state token
 */
export function parseOAuthState(state: string): {
  userId: string
  formId?: string
  timestamp: number
  nonce: string
} | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf-8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}
