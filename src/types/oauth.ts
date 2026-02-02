/**
 * OAuth tokens table types
 * Table: oauth_tokens
 */

export type OAuthProvider = 'google-sheets' | 'notion' | 'slack' | 'discord'

export interface OAuthToken {
  id: string
  user_id: string
  provider: OAuthProvider
  access_token: string
  refresh_token: string | null
  token_type: string
  expires_at: string | null
  scope: string | null
  provider_data: OAuthProviderData
  created_at: string
  updated_at: string
}

// Provider-specific data stored in provider_data JSONB column
export type OAuthProviderData = 
  | GoogleSheetsProviderData 
  | NotionProviderData 
  | SlackProviderData 
  | DiscordProviderData

export interface GoogleSheetsProviderData {
  email: string
  name?: string
  picture?: string
}

export interface NotionProviderData {
  bot_id: string
  workspace_id: string
  workspace_name?: string
  workspace_icon?: string
  owner?: {
    type: string
    user?: {
      id: string
      name?: string
      avatar_url?: string
      person?: { email?: string }
    }
  }
}

export interface SlackProviderData {
  team_id: string
  team_name: string
  user_id: string
  bot_user_id?: string
  app_id?: string
  authed_user?: {
    id: string
    access_token?: string
  }
  incoming_webhook?: {
    channel: string
    channel_id: string
    configuration_url: string
    url: string
  }
}

export interface DiscordProviderData {
  token_type: string
  guild?: {
    id: string
    name: string
    icon?: string
  }
  webhook?: {
    id: string
    token: string
    name: string
    channel_id: string
    guild_id: string
    url: string
  }
  user?: {
    id: string
    username: string
    discriminator: string
    avatar?: string
  }
}

// Insert type (for creating new tokens)
export interface OAuthTokenInsert {
  user_id: string
  provider: OAuthProvider
  access_token: string
  refresh_token?: string | null
  token_type?: string
  expires_at?: string | null
  scope?: string | null
  provider_data?: Record<string, unknown>
}

// Update type (for updating existing tokens)
export interface OAuthTokenUpdate {
  access_token?: string
  refresh_token?: string | null
  token_type?: string
  expires_at?: string | null
  scope?: string | null
  provider_data?: Record<string, unknown>
}

// OAuth status response type
export interface OAuthStatus {
  connected: boolean
  email?: string
  name?: string
  workspaceName?: string
  workspaceId?: string
  teamName?: string
  teamId?: string
  guildName?: string
  guildId?: string
  expiresAt?: string | null
  hasWebhook?: boolean
}

export type OAuthStatusMap = Record<OAuthProvider, OAuthStatus>

// Resource types for listing available sheets/databases/channels
export interface GoogleSheetResource {
  id: string
  name: string
  webViewLink: string
}

export interface NotionDatabaseResource {
  id: string
  title: string
  url: string
}

export interface SlackChannelResource {
  id: string
  name: string
  is_private: boolean
  is_member: boolean
}

export interface DiscordChannelResource {
  id: string
  name: string
  type: number
  guild_id: string
}

export type OAuthResource = 
  | GoogleSheetResource 
  | NotionDatabaseResource 
  | SlackChannelResource 
  | DiscordChannelResource
