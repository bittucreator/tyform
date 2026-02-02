'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Copy, 
  Check, 
  Info,
  ArrowSquareOut,
  Warning
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type IntegrationType = 'google-sheets' | 'notion' | 'slack' | 'discord'

interface IntegrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrationType: IntegrationType
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

const INTEGRATION_CONFIG: Record<IntegrationType, {
  title: string
  description: string
  docsUrl: string
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'select' | 'textarea'
    placeholder?: string
    required?: boolean
    helpText?: string
    options?: { value: string; label: string }[]
  }>
}> = {
  'google-sheets': {
    title: 'Google Sheets',
    description: 'Automatically send form submissions to a Google Sheets spreadsheet.',
    docsUrl: 'https://docs.google.com/spreadsheets',
    fields: [
      {
        key: 'spreadsheetUrl',
        label: 'Spreadsheet URL',
        type: 'text',
        placeholder: 'https://docs.google.com/spreadsheets/d/...',
        required: true,
        helpText: 'Paste the full URL of your Google Sheets spreadsheet'
      },
      {
        key: 'sheetName',
        label: 'Sheet Name',
        type: 'text',
        placeholder: 'Sheet1',
        helpText: 'Leave empty to use the first sheet'
      },
    ]
  },
  'notion': {
    title: 'Notion',
    description: 'Send form submissions to a Notion database.',
    docsUrl: 'https://notion.so',
    fields: [
      {
        key: 'databaseUrl',
        label: 'Database URL',
        type: 'text',
        placeholder: 'https://notion.so/...',
        required: true,
        helpText: 'Paste the URL of your Notion database'
      },
      {
        key: 'integrationToken',
        label: 'Integration Token',
        type: 'text',
        placeholder: 'secret_...',
        required: true,
        helpText: 'Create an integration at notion.so/my-integrations'
      },
    ]
  },
  'slack': {
    title: 'Slack',
    description: 'Send notifications to a Slack channel when someone submits a response.',
    docsUrl: 'https://api.slack.com/messaging/webhooks',
    fields: [
      {
        key: 'webhookUrl',
        label: 'Webhook URL',
        type: 'text',
        placeholder: 'https://hooks.slack.com/services/...',
        required: true,
        helpText: 'Create an incoming webhook in your Slack workspace'
      },
      {
        key: 'channel',
        label: 'Channel (optional)',
        type: 'text',
        placeholder: '#general',
        helpText: 'Override the default channel (optional)'
      },
      {
        key: 'messageFormat',
        label: 'Message Format',
        type: 'select',
        options: [
          { value: 'summary', label: 'Summary (compact)' },
          { value: 'detailed', label: 'Detailed (all answers)' },
        ]
      },
    ]
  },
  'discord': {
    title: 'Discord',
    description: 'Send notifications to a Discord channel when someone submits a response.',
    docsUrl: 'https://discord.com/developers/docs/resources/webhook',
    fields: [
      {
        key: 'webhookUrl',
        label: 'Webhook URL',
        type: 'text',
        placeholder: 'https://discord.com/api/webhooks/...',
        required: true,
        helpText: 'Create a webhook in your Discord server settings'
      },
      {
        key: 'username',
        label: 'Bot Username (optional)',
        type: 'text',
        placeholder: 'Tyform',
        helpText: 'Custom username for the bot'
      },
      {
        key: 'messageFormat',
        label: 'Message Format',
        type: 'select',
        options: [
          { value: 'embed', label: 'Rich Embed' },
          { value: 'simple', label: 'Simple Text' },
        ]
      },
    ]
  },
}

export function IntegrationModal({ 
  open, 
  onOpenChange, 
  integrationType,
  existingIntegration,
  onSave 
}: IntegrationModalProps) {
  const config = INTEGRATION_CONFIG[integrationType]
  const isEditing = !!existingIntegration

  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    config.fields.forEach(field => {
      initial[field.key] = (existingIntegration?.config?.[field.key] as string) || ''
    })
    return initial
  })
  const [enabled, setEnabled] = useState(existingIntegration?.enabled ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setError('')
  }

  const validateForm = () => {
    for (const field of config.fields) {
      if (field.required && !formData[field.key]) {
        setError(`${field.label} is required`)
        return false
      }
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
          config: formData,
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
      await onSave({
        name: config.title,
        type: integrationType,
        config: formData,
        enabled,
      })
      onOpenChange(false)
    } catch (err) {
      setError('Failed to save integration. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      // Reset form
      const initial: Record<string, string> = {}
      config.fields.forEach(field => {
        initial[field.key] = (existingIntegration?.config?.[field.key] as string) || ''
      })
      setFormData(initial)
      setEnabled(existingIntegration?.enabled ?? true)
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
            {isEditing ? `Edit ${config.title}` : `Connect ${config.title}`}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              <Warning className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Dynamic fields based on integration type */}
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              
              {field.type === 'select' ? (
                <Select
                  value={formData[field.key] || field.options?.[0]?.value}
                  onValueChange={(value) => handleFieldChange(field.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.key}
                  type="text"
                  value={formData[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
              
              {field.helpText && (
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  {field.helpText}
                </p>
              )}
            </div>
          ))}

          {/* Enable/Disable toggle */}
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

          {/* Documentation link */}
          <a
            href={config.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View setup documentation
            <ArrowSquareOut className="w-4 h-4" />
          </a>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isSaving || testStatus === 'testing'}
          >
            {testStatus === 'testing' && 'Testing...'}
            {testStatus === 'success' && (
              <>
                <Check className="w-4 h-4 mr-1" />
                Connected
              </>
            )}
            {testStatus === 'error' && 'Test Failed'}
            {testStatus === 'idle' && 'Test Connection'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
