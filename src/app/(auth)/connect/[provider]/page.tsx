'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CircleNotch, ArrowsClockwise, Plus } from '@phosphor-icons/react'
import Link from 'next/link'

interface OAuthStatus {
  connected: boolean
  email?: string
  name?: string
  workspaceName?: string
  teamName?: string
  guildName?: string
  username?: string
}

interface Resource {
  id: string
  name?: string
  title?: string
}

const PROVIDER_INFO = {
  'google-sheets': {
    name: 'Google Sheets',
    description: 'Send your Tyform form responses straight to Google Sheets.',
    docsUrl: 'https://docs.tyform.com/integrations/google-sheets',
    iconPath: '/sheets.svg',
    buttonText: 'Log in to Google',
    buttonColor: 'bg-[#1a73e8] hover:bg-[#1557b0]',
    connectButtonText: 'Connect with Google Sheets',
    resourceLabel: 'Select spreadsheet',
    resourcePlaceholder: 'Create a new spreadsheet',
    showExportOption: true,
    accountLabel: 'Google',
  },
  notion: {
    name: 'Notion',
    description: 'Send your Tyform form responses straight to Notion.',
    docsUrl: 'https://docs.tyform.com/integrations/notion',
    iconPath: '/notion.svg',
    buttonText: 'Log in to Notion',
    buttonColor: 'bg-black hover:bg-gray-800',
    connectButtonText: 'Connect with Notion',
    resourceLabel: 'Select database',
    resourcePlaceholder: 'Select a database',
    showExportOption: true,
    accountLabel: 'Notion',
  },
  slack: {
    name: 'Slack',
    description: 'Send notifications to Slack when someone submits your form.',
    docsUrl: 'https://docs.tyform.com/integrations/slack',
    iconPath: '/slack.svg',
    buttonText: 'Log in to Slack',
    buttonColor: 'bg-[#4A154B] hover:bg-[#3a1039]',
    connectButtonText: 'Connect with Slack',
    resourceLabel: 'Select channel',
    resourcePlaceholder: 'Select a channel',
    showExportOption: false,
    accountLabel: 'Slack',
  },
  discord: {
    name: 'Discord',
    description: 'Send notifications to Discord when someone submits your form.',
    docsUrl: 'https://docs.tyform.com/integrations/discord',
    iconPath: '/discord.svg',
    buttonText: 'Log in to Discord',
    buttonColor: 'bg-[#5865F2] hover:bg-[#4752c4]',
    connectButtonText: 'Connect with Discord',
    resourceLabel: 'Select server',
    resourcePlaceholder: 'Select a server',
    showExportOption: false,
    accountLabel: 'Discord',
  },
}

export default function ConnectProviderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const provider = params.provider as string
  const formId = searchParams.get('formId')
  
  const [isLoading, setIsLoading] = useState(true)
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus | null>(null)
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [connectionName, setConnectionName] = useState('')
  const [selectedResource, setSelectedResource] = useState<string>('new')
  const [exportExisting, setExportExisting] = useState(true)
  
  const info = PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO]
  
  // Check OAuth status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/integrations/oauth/status')
        if (res.ok) {
          const data = await res.json()
          const providerStatus = data[provider]
          if (providerStatus?.connected) {
            setOauthStatus(providerStatus)
            // Load resources
            loadResources()
          }
        }
      } catch (error) {
        console.error('Failed to check OAuth status:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider])
  
  const loadResources = async () => {
    setIsLoadingResources(true)
    try {
      const res = await fetch('/api/integrations/oauth/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, action: 'list' }),
      })
      if (res.ok) {
        const data = await res.json()
        setResources(data.resources || [])
      }
    } catch (error) {
      console.error('Failed to load resources:', error)
    } finally {
      setIsLoadingResources(false)
    }
  }
  
  const handleLogin = () => {
    const url = formId 
      ? `/api/auth/${provider}?formId=${formId}`
      : `/api/auth/${provider}`
    window.location.href = url
  }
  
  const handleReconnect = () => {
    handleLogin()
  }
  
  const handleConnect = async () => {
    if (!formId) return
    
    setIsSaving(true)
    try {
      // Get current form settings
      const formRes = await fetch(`/api/forms/${formId}`)
      const formData = await formRes.json()
      
      // Create integration config
      const newIntegration = {
        id: crypto.randomUUID(),
        name: connectionName || info.name,
        type: provider,
        config: {
          resourceId: selectedResource === 'new' ? null : selectedResource,
          resourceName: selectedResource === 'new' 
            ? 'New spreadsheet' 
            : resources.find(r => r.id === selectedResource)?.name || resources.find(r => r.id === selectedResource)?.title,
          exportExisting: info.showExportOption ? exportExisting : false,
        },
        enabled: true,
      }
      
      const currentIntegrations = formData.settings?.integrations || []
      const updatedIntegrations = [
        ...currentIntegrations.filter((i: { type: string }) => i.type !== provider),
        newIntegration,
      ]
      
      // Save to form
      await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ...formData.settings,
            integrations: updatedIntegrations,
          },
        }),
      })
      
      // Redirect back to form integrations
      router.push(`/forms/${formId}/responses?tab=integrations`)
    } catch (error) {
      console.error('Failed to save integration:', error)
    } finally {
      setIsSaving(false)
    }
  }
  
  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Unknown provider</p>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <CircleNotch className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-lg w-full px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Icons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Tyform Logo */}
            <Image 
              src="/logo.svg" 
              alt="Tyform" 
              width={40} 
              height={40} 
              className="rounded-lg"
            />
            
            {/* Dots */}
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            </div>
            
            {/* Provider Icon */}
            <div className="w-10 h-10 rounded-lg border bg-white flex items-center justify-center">
              <Image 
                src={info.iconPath} 
                alt={info.name} 
                width={28} 
                height={28} 
              />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold mb-2">
            Connect with {info.name}
          </h1>
          
          <p className="text-muted-foreground mb-1">
            {info.description}
          </p>
          
          <Link 
            href={info.docsUrl}
            className="text-sm text-muted-foreground hover:text-foreground underline"
            target="_blank"
          >
            Learn about {info.name} integration
          </Link>
        </div>
        
        {/* Not connected - show login button */}
        {!oauthStatus?.connected && (
          <Button 
            onClick={handleLogin}
            className={`w-full ${info.buttonColor} text-white`}
            size="lg"
          >
            {info.buttonText}
          </Button>
        )}
        
        {/* Connected - show configuration form */}
        {oauthStatus?.connected && (
          <div className="space-y-6">
            {/* Connection name */}
            <div className="space-y-2">
              <Label htmlFor="connectionName">Connection name</Label>
              <Input
                id="connectionName"
                placeholder="An optional name describing what the integration is used for"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
              />
            </div>
            
            {/* Select account */}
            <div className="space-y-2">
              <Label>Select {info.accountLabel} account</Label>
              <Select defaultValue="current">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    {oauthStatus.email || oauthStatus.workspaceName || oauthStatus.teamName || oauthStatus.guildName || oauthStatus.username || 'Connected account'}
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-4 text-sm">
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Plus className="w-4 h-4" />
                  Connect new account
                </button>
                <button 
                  onClick={handleReconnect}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <ArrowsClockwise className="w-4 h-4" />
                  Reconnect
                </button>
              </div>
            </div>
            
            {/* Select resource */}
            <div className="space-y-2">
              <Label>{info.resourceLabel}</Label>
              <div className="flex gap-2">
                <Select 
                  value={selectedResource} 
                  onValueChange={setSelectedResource}
                  disabled={isLoadingResources}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={info.resourcePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {provider === 'google-sheets' && (
                      <SelectItem value="new">Create a new spreadsheet</SelectItem>
                    )}
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name || resource.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={loadResources}
                  disabled={isLoadingResources}
                >
                  <ArrowsClockwise className={`w-4 h-4 ${isLoadingResources ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            {/* Export existing submissions */}
            {info.showExportOption && (
              <>
                <div className="border-t border-border" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">Export existing submissions</p>
                    <p className="text-sm text-muted-foreground">
                      Export all form submissions to {info.name}. Note that exporting may take some time for forms with many submissions.
                    </p>
                  </div>
                  <Switch 
                    checked={exportExisting} 
                    onCheckedChange={setExportExisting}
                  />
                </div>
              </>
            )}
            
            {/* Connect button */}
            <Button 
              onClick={handleConnect}
              className={`w-full ${info.buttonColor} text-white`}
              size="lg"
              disabled={isSaving}
            >
              {isSaving ? (
                <CircleNotch className="w-5 h-5 animate-spin" />
              ) : (
                info.connectButtonText
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
