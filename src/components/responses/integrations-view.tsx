'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { 
  ClockCounterClockwise, 
  PencilSimple, 
  Trash,
  WebhooksLogo,
  Link as LinkIcon
} from '@phosphor-icons/react'
import { WebhookModal } from './webhook-modal'
import { IntegrationModal } from './integration-modal'
import type { Form, Webhook, Integration } from '@/types/database'

type IntegrationType = 'google-sheets' | 'notion' | 'slack' | 'discord'

interface IntegrationsViewProps {
  form: Form
}

interface ConnectedIntegration {
  id: string
  name: string
  type: string
  icon: React.ReactNode
  enabled: boolean
  warning?: string
  data?: Webhook | { id?: string; name: string; type: string; enabled: boolean }
}

interface AvailableIntegration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

// Icon wrapper for consistent sizing
function IntegrationIcon({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div 
      className="w-10 h-10 rounded-lg flex items-center justify-center border bg-white"
    >
      {children}
    </div>
  )
}

// Integration icons using public SVGs
function GoogleSheetsIcon() {
  return (
    <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center">
      <Image src="/sheets.svg" alt="Google Sheets" width={22} height={22} />
    </div>
  )
}

function NotionIcon() {
  return (
    <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center">
      <Image src="/notion.svg" alt="Notion" width={22} height={22} />
    </div>
  )
}

function SlackIcon() {
  return (
    <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center">
      <Image src="/slack.svg" alt="Slack" width={28} height={28} />
    </div>
  )
}

function DiscordIcon() {
  return (
    <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center">
      <Image src="/discord.svg" alt="Discord" width={28} height={28} />
    </div>
  )
}

function WebhookIcon() {
  return (
    <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center">
      <WebhooksLogo className="w-7 h-7 text-[#6366F1]" weight="bold" />
    </div>
  )
}

const availableIntegrations: AvailableIntegration[] = [
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Send submissions to a sheet',
    icon: <GoogleSheetsIcon />,
    color: '#0F9D58',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Send submissions to Notion',
    icon: <NotionIcon />,
    color: '#000000',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send Slack messages for new submissions',
    icon: <SlackIcon />,
    color: '#4A154B',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Send Discord messages for new submissions',
    icon: <DiscordIcon />,
    color: '#5865F2',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Send events for new submissions to HTTP endpoints',
    icon: <WebhookIcon />,
    color: '#6366F1',
  },
]

function IntegrationCard({ integration, onConnect }: { integration: AvailableIntegration; onConnect: () => void }) {
  return (
    <div className="flex flex-col">
      <div className="mb-3">{integration.icon}</div>
      <h3 className="font-medium mb-1">{integration.name}</h3>
      <p className="text-sm text-muted-foreground mb-2">{integration.description}</p>
      <button 
        onClick={onConnect}
        className="text-sm text-primary font-medium hover:underline self-start"
      >
        Connect
      </button>
    </div>
  )
}

export function IntegrationsView({ form }: IntegrationsViewProps) {
  const router = useRouter()
  const [webhookModalOpen, setWebhookModalOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [integrationModalOpen, setIntegrationModalOpen] = useState(false)
  const [selectedIntegrationType, setSelectedIntegrationType] = useState<IntegrationType | null>(null)
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null)
  
  // OAuth connected integrations
  const [oauthIntegrations, setOauthIntegrations] = useState<{
    provider: string
    name: string
    resourceName?: string
    enabled: boolean
    warning?: string
  }[]>([])

  // Get webhooks from form settings
  const webhooks = form.settings.webhooks || []
  const integrations = form.settings.integrations || []
  
  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'google-sheets': return 'Google Sheets'
      case 'notion': return 'Notion'
      case 'slack': return 'Slack'
      case 'discord': return 'Discord'
      default: return provider
    }
  }

  // Fetch OAuth status for all providers
  useEffect(() => {
    const fetchOAuthStatus = async () => {
      try {
        const res = await fetch('/api/integrations/oauth/status')
        if (!res.ok) return
        
        const data = await res.json()
        const connected: typeof oauthIntegrations = []
        
        const providers = ['google-sheets', 'notion', 'slack', 'discord'] as const
        
        for (const provider of providers) {
          const providerStatus = data[provider]
          if (providerStatus?.connected) {
            // Find if there's a saved integration config for this provider
            const savedConfig = integrations.find(i => i.type === provider)
            connected.push({
              provider,
              name: getProviderDisplayName(provider),
              resourceName: providerStatus.email || providerStatus.workspaceName || providerStatus.teamName || providerStatus.guildName || providerStatus.username,
              enabled: savedConfig?.enabled ?? true,
              warning: undefined,
            })
          }
        }
        
        setOauthIntegrations(connected)
      } catch {
        // Ignore errors
      }
    }
    
    fetchOAuthStatus()
  }, [integrations])

  // Get icon for integration type
  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'google-sheets':
      case 'sheets':
        return <GoogleSheetsIcon />
      case 'notion':
        return <NotionIcon />
      case 'slack':
        return <SlackIcon />
      case 'discord':
        return <DiscordIcon />
      default:
        return <NotionIcon />
    }
  }

  // Build connected integrations from webhooks, saved integrations, and OAuth connections
  const connectedIntegrations: ConnectedIntegration[] = [
    // Webhooks
    ...webhooks.map((webhook, idx) => ({
      id: webhook.id || `webhook-${idx}`,
      name: 'Webhook',
      type: 'webhook',
      icon: <WebhookIcon />,
      enabled: webhook.enabled,
      warning: undefined,
      data: webhook,
    })),
    // OAuth-connected integrations (Google Sheets, Notion, Slack, Discord)
    ...oauthIntegrations.map((oauth) => {
      const savedConfig = integrations.find(i => i.type === oauth.provider)
      return {
        id: `oauth-${oauth.provider}`,
        name: oauth.resourceName ? `${oauth.name} - ${oauth.resourceName}` : oauth.name,
        type: oauth.provider,
        icon: getIntegrationIcon(oauth.provider),
        enabled: savedConfig?.enabled ?? oauth.enabled,
        warning: oauth.warning,
        data: savedConfig || { id: `oauth-${oauth.provider}`, name: oauth.name, type: oauth.provider, enabled: oauth.enabled },
      }
    }),
    // Other saved integrations (that aren't OAuth-based)
    ...integrations
      .filter(int => !['google-sheets', 'notion', 'slack', 'discord'].includes(int.type))
      .map((int, idx) => ({
        id: int.id || `int-${idx}`,
        name: int.name,
        type: int.type,
        icon: getIntegrationIcon(int.type),
        enabled: int.enabled,
        warning: undefined,
        data: int,
      })),
  ]

  const handleConnect = (integrationId: string) => {
    if (integrationId === 'webhooks') {
      setEditingWebhook(null)
      setWebhookModalOpen(true)
    } else if (['google-sheets', 'notion', 'slack', 'discord'].includes(integrationId)) {
      // Go to intermediate connect page
      window.location.href = `/connect/${integrationId}?formId=${form.id}`
    }
  }

  const handleEditWebhook = (webhook: Webhook) => {
    setEditingWebhook(webhook)
    setWebhookModalOpen(true)
  }

  const handleEditIntegration = (integration: Integration) => {
    // Only open modal for editing (to select resource like spreadsheet/database)
    if (['google-sheets', 'notion', 'slack', 'discord'].includes(integration.type)) {
      setSelectedIntegrationType(integration.type as IntegrationType)
      setEditingIntegration(integration)
      setIntegrationModalOpen(true)
    }
  }

  const handleSaveIntegration = async (integrationData: {
    name: string
    type: IntegrationType
    config: Record<string, unknown>
    enabled: boolean
  }) => {
    const newIntegration: Integration = {
      id: editingIntegration?.id || crypto.randomUUID(),
      name: integrationData.name,
      type: integrationData.type as Integration['type'],
      config: integrationData.config,
      enabled: integrationData.enabled,
    }

    let updatedIntegrations: Integration[]
    if (editingIntegration) {
      updatedIntegrations = integrations.map(i => 
        i.id === editingIntegration.id ? newIntegration : i
      )
    } else {
      updatedIntegrations = [...integrations, newIntegration]
    }

    const response = await fetch(`/api/forms/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          ...form.settings,
          integrations: updatedIntegrations,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save integration')
    }

    router.refresh()
  }

  const handleDeleteIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return

    // Check if this is an OAuth integration
    if (integrationId.startsWith('oauth-')) {
      const provider = integrationId.replace('oauth-', '')
      // Disconnect OAuth
      await fetch(`/api/integrations/oauth/status?provider=${provider}`, {
        method: 'DELETE',
      })
      // Refresh to update the list
      setOauthIntegrations(prev => prev.filter(i => i.provider !== provider))
      router.refresh()
      return
    }

    const updatedIntegrations = integrations.filter(i => i.id !== integrationId)

    const response = await fetch(`/api/forms/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          ...form.settings,
          integrations: updatedIntegrations,
        },
      }),
    })

    if (response.ok) {
      router.refresh()
    }
  }

  const handleToggleIntegration = async (integrationId: string, enabled: boolean) => {
    // For OAuth integrations, save enabled state to form settings
    if (integrationId.startsWith('oauth-')) {
      const provider = integrationId.replace('oauth-', '')
      
      // Find or create an integration config for this OAuth provider
      const existingConfig = integrations.find(i => i.type === provider)
      
      let updatedIntegrations: Integration[]
      if (existingConfig) {
        updatedIntegrations = integrations.map(i => 
          i.type === provider ? { ...i, enabled } : i
        )
      } else {
        // Create a new integration config for this OAuth provider
        updatedIntegrations = [...integrations, {
          id: crypto.randomUUID(),
          name: getProviderDisplayName(provider),
          type: provider as Integration['type'],
          config: {},
          enabled,
        }]
      }
      
      await fetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ...form.settings,
            integrations: updatedIntegrations,
          },
        }),
      })
      
      // Update local state immediately for responsiveness
      setOauthIntegrations(prev => prev.map(i => 
        i.provider === provider ? { ...i, enabled } : i
      ))
      
      router.refresh()
      return
    }
    
    const updatedIntegrations = integrations.map(i => 
      i.id === integrationId ? { ...i, enabled } : i
    )

    await fetch(`/api/forms/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          ...form.settings,
          integrations: updatedIntegrations,
        },
      }),
    })

    router.refresh()
  }

  const handleSaveWebhook = async (webhookData: {
    url: string
    secret?: string
    events: ('response.created' | 'response.updated')[]
    enabled: boolean
  }) => {
    const newWebhook: Webhook = {
      id: editingWebhook?.id || crypto.randomUUID(),
      url: webhookData.url,
      secret: webhookData.secret,
      events: webhookData.events,
      enabled: webhookData.enabled,
    }

    let updatedWebhooks: Webhook[]
    if (editingWebhook) {
      updatedWebhooks = webhooks.map(w => w.id === editingWebhook.id ? newWebhook : w)
    } else {
      updatedWebhooks = [...webhooks, newWebhook]
    }

    const response = await fetch(`/api/forms/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          ...form.settings,
          webhooks: updatedWebhooks,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save webhook')
    }

    router.refresh()
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    const updatedWebhooks = webhooks.filter(w => w.id !== webhookId)

    const response = await fetch(`/api/forms/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          ...form.settings,
          webhooks: updatedWebhooks,
        },
      }),
    })

    if (response.ok) {
      router.refresh()
    }
  }

  const handleToggleWebhook = async (webhookId: string, enabled: boolean) => {
    const updatedWebhooks = webhooks.map(w => 
      w.id === webhookId ? { ...w, enabled } : w
    )

    await fetch(`/api/forms/${form.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: {
          ...form.settings,
          webhooks: updatedWebhooks,
        },
      }),
    })

    router.refresh()
  }

  return (
    <div className="space-y-10">
      {/* Webhook Modal */}
      <WebhookModal
        open={webhookModalOpen}
        onOpenChange={setWebhookModalOpen}
        existingWebhook={editingWebhook ? {
          id: editingWebhook.id || '',
          url: editingWebhook.url,
          secret: editingWebhook.secret,
          events: editingWebhook.events || ['response.created'],
          enabled: editingWebhook.enabled,
        } : undefined}
        onSave={handleSaveWebhook}
      />

      {/* Integration Modal for Google Sheets, Notion, Slack, Discord */}
      {selectedIntegrationType && (
        <IntegrationModal
          open={integrationModalOpen}
          onOpenChange={setIntegrationModalOpen}
          integrationType={selectedIntegrationType}
          formId={form.id}
          existingIntegration={editingIntegration ? {
            id: editingIntegration.id,
            name: editingIntegration.name,
            config: editingIntegration.config,
            enabled: editingIntegration.enabled,
          } : undefined}
          onSave={handleSaveIntegration}
        />
      )}

      {/* My Connections */}
      <section>
        <h2 className="text-lg font-semibold mb-2">My connections</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Here are all the integrations connected to this form. You can easily enable or disable an integration and track submission sync requests using the event history log.
        </p>
        
        {connectedIntegrations.length > 0 ? (
          <div className="space-y-0">
            {connectedIntegrations.map((integration) => (
              <div key={integration.id} className="flex items-start justify-between py-4 border-b border-border/50">
                <div className="flex items-start gap-3">
                  {integration.icon}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{integration.name}</h3>
                      {integration.warning && (
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </div>
                    {integration.type === 'webhook' && integration.data && (
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        {(integration.data as Webhook).url.substring(0, 50)}
                        {(integration.data as Webhook).url.length > 50 ? '...' : ''}
                      </p>
                    )}
                    {integration.type !== 'webhook' && integration.data && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {integration.enabled ? 'Active' : 'Paused'}
                      </p>
                    )}
                    {integration.warning && (
                      <p className="text-sm text-red-500 mt-1">{integration.warning}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={integration.enabled} 
                    onCheckedChange={(enabled) => {
                      if (integration.type === 'webhook') {
                        handleToggleWebhook(integration.id, enabled)
                      } else {
                        handleToggleIntegration(integration.id, enabled)
                      }
                    }} 
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <ClockCounterClockwise className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => {
                      if (integration.type === 'webhook' && integration.data) {
                        handleEditWebhook(integration.data as Webhook)
                      } else if (integration.data) {
                        handleEditIntegration(integration.data as Integration)
                      }
                    }}
                  >
                    <PencilSimple className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-red-500"
                    onClick={() => {
                      if (integration.type === 'webhook') {
                        handleDeleteWebhook(integration.id)
                      } else {
                        handleDeleteIntegration(integration.id)
                      }
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-border rounded-lg">
            <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No integrations connected yet</p>
            <p className="text-xs text-muted-foreground mt-1">Connect an integration below to get started</p>
          </div>
        )}
      </section>

      {/* Discover Integrations */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Discover integrations</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Make Tyform even more powerful by using these tools. Check out our{' '}
          <a href="/roadmap" className="underline hover:text-foreground">roadmap</a>{' '}
          for upcoming integrations and to request new ones.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableIntegrations.map((integration) => (
            <IntegrationCard 
              key={integration.id} 
              integration={integration} 
              onConnect={() => handleConnect(integration.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
