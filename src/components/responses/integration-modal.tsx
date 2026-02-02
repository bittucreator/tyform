'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Check, 
  Info,
  ArrowSquareOut,
  Warning,
  CircleNotch,
  SignOut,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type IntegrationType = 'google-sheets' | 'notion' | 'slack' | 'discord'

interface OAuthStatus {
  connected: boolean
  email?: string
  name?: string
  workspaceName?: string
  workspaceId?: string
  teamName?: string
  teamId?: string
  username?: string
  guildName?: string
  guildId?: string
  hasWebhook?: boolean
  expiresAt?: string | null
}

interface Resource {
  id: string
  name?: string
  title?: string
  url?: string
  webViewLink?: string
  is_private?: boolean
  is_member?: boolean
  owner?: boolean
  icon?: string
}

interface IntegrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrationType: IntegrationType
  formId: string
  existingIntegration?: {
    id: string
    name: string
    config: Record<string, unknown>
    enabled: boolean
  }
  onSave: (integration: {
    name: string
    type: IntegrationType
    config: Record<string, unknown>
    enabled: boolean
  }) => Promise<void>
}

// All integrations use OAuth
const OAUTH_INTEGRATIONS = ['google-sheets', 'notion', 'slack', 'discord'] as const

const INTEGRATION_INFO: Record<IntegrationType, { 
  title: string
  description: string
  docsUrl: string
  resourceLabel: string
  resourcePlaceholder: string
  icon: 'google' | 'notion' | 'slack' | 'discord'
}> = {
  'google-sheets': {
    title: 'Google Sheets',
    description: 'Automatically send form submissions to a Google Sheets spreadsheet.',
    docsUrl: 'https://docs.google.com/spreadsheets',
    resourceLabel: 'Select Spreadsheet',
    resourcePlaceholder: 'Select a spreadsheet...',
    icon: 'google',
  },
  'notion': {
    title: 'Notion',
    description: 'Send form submissions to a Notion database.',
    docsUrl: 'https://notion.so',
    resourceLabel: 'Select Database',
    resourcePlaceholder: 'Select a database...',
    icon: 'notion',
  },
  'slack': {
    title: 'Slack',
    description: 'Send notifications to a Slack channel when someone submits a response.',
    docsUrl: 'https://slack.com/apps',
    resourceLabel: 'Select Channel',
    resourcePlaceholder: 'Select a channel...',
    icon: 'slack',
  },
  'discord': {
    title: 'Discord',
    description: 'Send notifications to a Discord server when someone submits a response.',
    docsUrl: 'https://discord.com/developers/docs',
    resourceLabel: 'Select Server',
    resourcePlaceholder: 'Select a server...',
    icon: 'discord',
  },
}

export function IntegrationModal({ 
  open, 
  onOpenChange, 
  integrationType,
  formId,
  existingIntegration,
  onSave 
}: IntegrationModalProps) {
  const info = INTEGRATION_INFO[integrationType]
  const isEditing = !!existingIntegration
  const searchParams = useSearchParams()

  // OAuth state
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<string>(
    (existingIntegration?.config?.resourceId as string) || ''
  )
  const [isLoadingOAuth, setIsLoadingOAuth] = useState(false)
  const [isLoadingResources, setIsLoadingResources] = useState(false)

  // Common state
  const [enabled, setEnabled] = useState(existingIntegration?.enabled ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  // Check OAuth status when modal opens
  useEffect(() => {
    if (open) {
      fetchOAuthStatus()
    }
  }, [open, integrationType])

  // Check for OAuth callback in URL
  useEffect(() => {
    const connected = searchParams.get('connected')
    if (connected === integrationType) {
      fetchOAuthStatus()
    }
  }, [searchParams, integrationType])

  const fetchOAuthStatus = async () => {
    setIsLoadingOAuth(true)
    try {
      const response = await fetch('/api/integrations/oauth/status')
      if (response.ok) {
        const data = await response.json()
        const status = data[integrationType] as OAuthStatus
        setOauthStatus(status)
        
        // Load resources if connected
        if (status?.connected) {
          fetchResources()
        }
      }
    } catch (err) {
      console.error('Failed to fetch OAuth status:', err)
    } finally {
      setIsLoadingOAuth(false)
    }
  }

  const fetchResources = async () => {
    setIsLoadingResources(true)
    try {
      const response = await fetch('/api/integrations/oauth/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: integrationType }),
      })
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources || [])
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err)
    } finally {
      setIsLoadingResources(false)
    }
  }

  const handleConnect = () => {
    // Redirect to OAuth flow
    window.location.href = `/api/auth/${integrationType}?formId=${formId}`
  }

  const handleDisconnect = async () => {
    try {
      await fetch(`/api/integrations/oauth/status?provider=${integrationType}`, {
        method: 'DELETE',
      })
      setOauthStatus({ connected: false })
      setResources([])
      setSelectedResource('')
    } catch (err) {
      console.error('Failed to disconnect:', err)
    }
  }

  const validateForm = () => {
    if (!oauthStatus?.connected) {
      setError('Please connect your account first')
      return false
    }
    if (!selectedResource) {
      setError(`Please select ${info.resourceLabel.toLowerCase().replace('select ', '')}`)
      return false
    }
    return true
  }

  const handleTestConnection = async () => {
    if (!validateForm()) return

    setTestStatus('testing')
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: integrationType,
          config: { resourceId: selectedResource },
        }),
      })

      if (response.ok) {
        setTestStatus('success')
        setTimeout(() => setTestStatus('idle'), 3000)
      } else {
        setTestStatus('error')
        const data = await response.json()
        setError(data.error || 'Connection test failed')
      }
    } catch {
      setTestStatus('error')
      setError('Failed to test connection')
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    setError('')
    
    try {
      const selectedRes = resources.find(r => r.id === selectedResource)
      const config = { 
        resourceId: selectedResource,
        resourceName: selectedRes?.name || selectedRes?.title,
      }

      await onSave({
        name: info.title,
        type: integrationType,
        config,
        enabled,
      })
      onOpenChange(false)
    } catch {
      setError('Failed to save integration. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setError('')
      setTestStatus('idle')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${info.title}` : `Connect ${info.title}`}
          </DialogTitle>
          <DialogDescription>
            {info.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <Warning className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* OAuth Flow for all integrations */}
          {isLoadingOAuth ? (
            <div className="flex items-center justify-center py-8">
              <CircleNotch className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : oauthStatus?.connected ? (
            <div className="space-y-4">
              {/* Connected account info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center">
                    {info.icon === 'google' && <Image src="/sheets.svg" alt="Google Sheets" width={22} height={22} />}
                    {info.icon === 'notion' && <Image src="/notion.svg" alt="Notion" width={22} height={22} />}
                    {info.icon === 'slack' && <Image src="/slack.svg" alt="Slack" width={28} height={28} />}
                    {info.icon === 'discord' && <Image src="/discord.svg" alt="Discord" width={28} height={28} />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {oauthStatus.email || 
                       oauthStatus.workspaceName || 
                       oauthStatus.teamName || 
                       oauthStatus.username ||
                       oauthStatus.guildName ||
                       'Connected'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {integrationType === 'google-sheets' && 'Google Account'}
                      {integrationType === 'notion' && 'Notion Workspace'}
                      {integrationType === 'slack' && 'Slack Workspace'}
                      {integrationType === 'discord' && 'Discord Account'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <SignOut className="w-4 h-4 mr-1" />
                  Disconnect
                </Button>
              </div>

              {/* Resource selection */}
              <div className="space-y-2">
                <Label>
                  {info.resourceLabel}
                  <span className="text-destructive ml-1">*</span>
                </Label>
                {isLoadingResources ? (
                  <div className="flex items-center gap-2 p-3 border rounded-md text-muted-foreground">
                    <CircleNotch className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <Select value={selectedResource} onValueChange={setSelectedResource}>
                    <SelectTrigger>
                      <SelectValue placeholder={info.resourcePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name || resource.title}
                          {resource.is_private && ' 🔒'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  {integrationType === 'google-sheets' && 'New submissions will be added as rows to this spreadsheet'}
                  {integrationType === 'notion' && 'New submissions will be added as entries to this database'}
                  {integrationType === 'slack' && 'Notifications will be sent to this channel'}
                  {integrationType === 'discord' && 'Notifications will be sent to this server'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                {info.icon === 'google' && <Image src="/sheets.svg" alt="Google Sheets" width={32} height={32} />}
                {info.icon === 'notion' && <Image src="/notion.svg" alt="Notion" width={32} height={32} />}
                {info.icon === 'slack' && <Image src="/slack.svg" alt="Slack" width={32} height={32} />}
                {info.icon === 'discord' && <Image src="/discord.svg" alt="Discord" width={32} height={32} />}
              </div>
              <div className="text-center">
                <p className="font-medium">Connect your {info.title} account</p>
                <p className="text-sm text-muted-foreground">
                  {integrationType === 'google-sheets' && "We'll ask for permission to access your spreadsheets"}
                  {integrationType === 'notion' && "We'll ask for permission to access your databases"}
                  {integrationType === 'slack' && "We'll ask for permission to send messages to your workspace"}
                  {integrationType === 'discord' && "We'll ask for permission to send messages to your server"}
                </p>
              </div>
              <Button onClick={handleConnect}>
                Connect {info.title}
              </Button>
            </div>
          )}

          {/* Enable/Disable toggle - show when connected */}
          {oauthStatus?.connected && (
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Enable integration</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically send data when form is submitted
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving || !oauthStatus?.connected}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
