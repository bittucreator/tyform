'use client'

import { useState } from 'react'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Envelope,
  WebhooksLogo,
  Table,
  FileText,
  CreditCard,
  Plus,
  Trash,
  ArrowRight,
  Check,
  SpinnerGap,
  ArrowSquareOut,
  ClockCounterClockwise,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { WebhookLogsDialog } from './webhook-logs-dialog'

interface Integration {
  id: string
  type: 'email' | 'webhook' | 'sheets' | 'notion' | 'stripe'
  name: string
  enabled: boolean
  config: Record<string, unknown>
}

interface IntegrationsPanelProps {
  open: boolean
  onClose: () => void
}

const integrationTextTs = [
  {
    type: 'email' as const,
    name: 'Email',
    description: 'PaperPlaneTilt and receive emails for each submission.',
    icon: Envelope,
    color: 'bg-green-500',
    configurable: true,
  },
  {
    type: 'webhook' as const,
    name: 'Webhook',
    description: 'Receive a webhook for all submissions.',
    icon: WebhooksLogo,
    color: 'bg-gray-700',
    configurable: true,
  },
  {
    type: 'sheets' as const,
    name: 'Google Sheets',
    description: 'Sync all your submissions to a Google Sheet stored on your Google Drive.',
    icon: Table,
    color: 'bg-green-600',
    configurable: true,
  },
  {
    type: 'notion' as const,
    name: 'Notion',
    description: 'Sync form responses directly to a Notion database.',
    icon: FileText,
    color: 'bg-gray-900',
    configurable: true,
  },
  {
    type: 'stripe' as const,
    name: 'Stripe',
    description: 'Collect payments from your form using Stripe.',
    icon: CreditCard,
    color: 'bg-purple-600',
    isPro: true,
    configurable: true,
  },
]

export function IntegrationsPanel({ open, onClose }: IntegrationsPanelProps) {
  const { form, updateSettings } = useFormBuilder()
  const [configDialog, setConfigDialog] = useState<{
    open: boolean
    type: Integration['type'] | null
    integration: Integration | null
  }>({ open: false, type: null, integration: null })
  const [isSaving, setIsSaving] = useState(false)
  const [webhookLogsOpen, setWebhookLogsOpen] = useState(false)

  const integrations: Integration[] = form.settings.integrations || []

  const updateIntegrations = (newIntegrations: Integration[]) => {
    updateSettings({
      ...form.settings,
      integrations: newIntegrations,
    })
  }

  const getIntegrationsByTextT = (type: Integration['type']) => {
    return integrations.filter((i) => i.type === type)
  }

  const hasIntegration = (type: Integration['type']) => {
    return integrations.some((i) => i.type === type && i.enabled)
  }

  const openConfig = (type: Integration['type'], integration?: Integration) => {
    setConfigDialog({
      open: true,
      type,
      integration: integration || null,
    })
  }

  const closeConfig = () => {
    setConfigDialog({ open: false, type: null, integration: null })
  }

  const saveIntegration = async (integration: Integration) => {
    setIsSaving(true)
    
    try {
      const existingIndex = integrations.findIndex((i) => i.id === integration.id)
      
      if (existingIndex >= 0) {
        const updated = [...integrations]
        updated[existingIndex] = integration
        updateIntegrations(updated)
      } else {
        updateIntegrations([...integrations, integration])
      }
      
      toast.success(`${integration.name} integration saved`)
      closeConfig()
    } catch {
      toast.error('Failed to save integration')
    } finally {
      setIsSaving(false)
    }
  }

  const removeIntegration = (id: string) => {
    updateIntegrations(integrations.filter((i) => i.id !== id))
    toast.success('Integration removed')
  }

  const toggleIntegration = (id: string, enabled: boolean) => {
    const updated = integrations.map((i) =>
      i.id === id ? { ...i, enabled } : i
    )
    updateIntegrations(updated)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full sm:max-w-xl p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle>Integrate form to your favorite tools</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-6">
              <div className="rounded-lg border border-border divide-y divide-border">
                {integrationTextTs.map((integrationTextT) => {
                  const Icon = integrationTextT.icon
                  const existingIntegrations = getIntegrationsByTextT(integrationTextT.type)
                  const isConnected = hasIntegration(integrationTextT.type)

                  return (
                    <div key={integrationTextT.type} className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`h-12 w-12 rounded-xl flex items-center justify-center ${integrationTextT.color}`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {integrationTextT.name}
                            </h3>
                            {integrationTextT.isPro && (
                              <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                                PRO
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {integrationTextT.description}
                          </p>
                        </div>

                        {/* Action */}
                        <div className="flex items-center gap-2">
                          {integrationTextT.type === 'email' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground"
                              onClick={() => openConfig(integrationTextT.type)}
                            >
                              Configure from settings
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          ) : isConnected ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => openConfig(integrationTextT.type, existingIntegrations[0])}
                            >
                              <Check className="h-4 w-4 text-green-500" />
                              Connected
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => openConfig(integrationTextT.type)}
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Show existing integrations */}
                      {existingIntegrations.length > 0 && integrationTextT.type !== 'email' && (
                        <div className="mt-3 pl-16 space-y-2">
                          {existingIntegrations.map((integration) => (
                            <div
                              key={integration.id}
                              className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                            >
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={integration.enabled}
                                  onCheckedChange={(checked) =>
                                    toggleIntegration(integration.id, checked)
                                  }
                                />
                                <span className="text-sm text-foreground">
                                  {integration.config.name as string || integration.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => openConfig(integrationTextT.type, integration)}
                                >
                                  <ArrowSquareOut className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => removeIntegration(integration.id)}
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground"
                              onClick={() => openConfig(integrationTextT.type)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add another
                            </Button>
                            {integrationTextT.type === 'webhook' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                                onClick={() => setWebhookLogsOpen(true)}
                              >
                                <ClockCounterClockwise className="h-4 w-4 mr-1" />
                                View logs
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Configuration Dialogs */}
      <IntegrationConfigDialog
        open={configDialog.open}
        type={configDialog.type}
        integration={configDialog.integration}
        onClose={closeConfig}
        onSave={saveIntegration}
        isSaving={isSaving}
      />

      {/* Webhook Logs Dialog */}
      <WebhookLogsDialog
        open={webhookLogsOpen}
        onClose={() => setWebhookLogsOpen(false)}
        formId={form.id}
      />
    </>
  )
}

interface ConfigDialogProps {
  open: boolean
  type: Integration['type'] | null
  integration: Integration | null
  onClose: () => void
  onSave: (integration: Integration) => void
  isSaving: boolean
}

function IntegrationConfigDialog({
  open,
  type,
  integration,
  onClose,
  onSave,
  isSaving,
}: ConfigDialogProps) {
  const [config, setConfig] = useState<Record<string, unknown>>(
    integration?.config || {}
  )

  // Reset config when dialog opens with new integration
  useState(() => {
    setConfig(integration?.config || {})
  })

  if (!type) return null

  const handleSave = () => {
    const name = integrationTextTs.find((t) => t.type === type)?.name || type
    onSave({
      id: integration?.id || nanoid(),
      type,
      name,
      enabled: integration?.enabled ?? true,
      config,
    })
  }

  const renderConfig = () => {
    switch (type) {
      case 'email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notification Email</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={(config.email as string) || ''}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Receive email notifications for each form submission
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>PaperPlaneTilt confirmation email to respondent</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically send a copy to respondents
                </p>
              </div>
              <Switch
                checked={(config.sendConfirmation as boolean) || false}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, sendConfirmation: checked })
                }
              />
            </div>
          </div>
        )

      case 'webhook':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                type="url"
                placeholder="https://example.com/webhook"
                value={(config.url as string) || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secret (optional)</Label>
              <Input
                type="password"
                placeholder="Webhook secret for signature verification"
                value={(config.secret as string) || ''}
                onChange={(e) => setConfig({ ...config, secret: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Used to sign webhook payloads with HMAC-SHA256
              </p>
            </div>
          </div>
        )

      case 'sheets':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Spreadsheet ID</Label>
              <Input
                placeholder="Enter Google Spreadsheet ID"
                value={(config.spreadsheetId as string) || ''}
                onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Find the ID in your spreadsheet URL: docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
              </p>
            </div>
            <div className="space-y-2">
              <Label>Sheet Name</Label>
              <Input
                placeholder="Sheet1"
                value={(config.sheetName as string) || ''}
                onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
              />
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> You&apos;ll need to set up a Google service account and share 
                the spreadsheet with it. Check our documentation for setup instructions.
              </p>
            </div>
          </div>
        )

      case 'notion':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notion Database ID</Label>
              <Input
                placeholder="Enter Notion database ID"
                value={(config.databaseId as string) || ''}
                onChange={(e) => setConfig({ ...config, databaseId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                The ID from your Notion database URL
              </p>
            </div>
            <div className="space-y-2">
              <Label>Integration Token</Label>
              <Input
                type="password"
                placeholder="secret_..."
                value={(config.token as string) || ''}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Create an integration at notion.so/my-integrations
              </p>
            </div>
          </div>
        )

      case 'stripe':
        return (
          <div className="space-y-4">
            <div className="rounded-md bg-primary/10 p-3 mb-4">
              <p className="text-sm text-primary">
                <strong>PRO Feature:</strong> Stripe payments require a Pro subscription.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Stripe Secret Key</Label>
              <Input
                type="password"
                placeholder="sk_live_..."
                value={(config.secretKey as string) || ''}
                onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Price ID</Label>
              <Input
                placeholder="price_..."
                value={(config.priceId as string) || ''}
                onChange={(e) => setConfig({ ...config, priceId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                The Stripe Price ID for the product to charge
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Test Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Use Stripe test environment
                </p>
              </div>
              <Switch
                checked={(config.testMode as boolean) ?? true}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, testMode: checked })
                }
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const title = integrationTextTs.find((t) => t.type === type)?.name || 'Integration'

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{renderConfig()}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
