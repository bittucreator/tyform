'use client'

import { useState } from 'react'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash, WebhooksLogo, SpinnerGap, CheckCircle, XCircle, Eye, EyeSlash } from '@phosphor-icons/react'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import type { Webhook as WebhookTextT } from '@/types/database'

interface WebhookEditorProps {
  open: boolean
  onClose: () => void
}

export function WebhookEditor({ open, onClose }: WebhookEditorProps) {
  const { form, updateSettings } = useFormBuilder()
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  
  const webhooks = form.settings.webhooks || []
  
  const handleAddWebhook = () => {
    const newWebhook: WebhookTextT = {
      id: nanoid(),
      url: '',
      enabled: true,
      events: ['response.created'],
      headers: {},
      secret: '',
    }
    
    updateSettings({
      webhooks: [...webhooks, newWebhook],
    })
  }
  
  const handleUpdateWebhook = (id: string, updates: Partial<WebhookTextT>) => {
    updateSettings({
      webhooks: webhooks.map((w) => 
        w.id === id ? { ...w, ...updates } : w
      ),
    })
  }
  
  const handleDeleteWebhook = (id: string) => {
    updateSettings({
      webhooks: webhooks.filter((w) => w.id !== id),
    })
  }
  
  const handleTestWebhook = async (webhook: WebhookTextT) => {
    if (!webhook.url) {
      toast.error('Please enter a webhook URL first')
      return
    }
    
    setTestingWebhook(webhook.id)
    
    try {
      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-TextT': 'application/json' },
        body: JSON.stringify({
          webhook,
          formId: form.id,
          formTitle: form.title,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Webhook test successful (Status: ${data.statusCode})`)
      } else {
        toast.error(`Webhook test failed: ${data.error || `Status ${data.statusCode}`}`)
      }
    } catch {
      toast.error('Failed to test webhook')
    } finally {
      setTestingWebhook(null)
    }
  }
  
  const toggleEvent = (webhookId: string, event: 'response.created' | 'response.updated') => {
    const webhook = webhooks.find((w) => w.id === webhookId)
    if (!webhook) return
    
    const hasEvent = webhook.events.includes(event)
    const newEvents = hasEvent 
      ? webhook.events.filter((e) => e !== event)
      : [...webhook.events, event]
    
    // Ensure at least one event is selected
    if (newEvents.length === 0) {
      toast.error('At least one event must be selected')
      return
    }
    
    handleUpdateWebhook(webhookId, { events: newEvents })
  }
  
  const handleAddHeader = (webhookId: string) => {
    const webhook = webhooks.find((w) => w.id === webhookId)
    if (!webhook) return
    
    const headers = webhook.headers || {}
    const headerKey = `X-Custom-Header-${Object.keys(headers).length + 1}`
    
    handleUpdateWebhook(webhookId, {
      headers: { ...headers, [headerKey]: '' },
    })
  }
  
  const handleUpdateHeader = (webhookId: string, oldKey: string, newKey: string, value: string) => {
    const webhook = webhooks.find((w) => w.id === webhookId)
    if (!webhook) return
    
    const headers = { ...webhook.headers }
    if (oldKey !== newKey) {
      delete headers[oldKey]
    }
    headers[newKey] = value
    
    handleUpdateWebhook(webhookId, { headers })
  }
  
  const handleDeleteHeader = (webhookId: string, key: string) => {
    const webhook = webhooks.find((w) => w.id === webhookId)
    if (!webhook) return
    
    const headers = { ...webhook.headers }
    delete headers[key]
    
    handleUpdateWebhook(webhookId, { headers })
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-100 sm:w-140 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <WebhooksLogo className="h-5 w-5" />
            WebhooksLogo
          </SheetTitle>
          <SheetDescription>
            PaperPlaneTilt form responses to external services automatically.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {webhooks.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <WebhooksLogo className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No webhooks configured yet.
              </p>
              <Button onClick={handleAddWebhook}>
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {webhooks.map((webhook, idx) => (
                <AccordionItem 
                  key={webhook.id} 
                  value={webhook.id}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm">
                        Webhook {idx + 1}
                      </span>
                      {webhook.enabled ? (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <XCircle className="h-3 w-3 mr-1" />
                          Disabled
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {/* Enable/Disable */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`enabled-${webhook.id}`}>Enabled</Label>
                      <Switch
                        id={`enabled-${webhook.id}`}
                        checked={webhook.enabled}
                        onCheckedChange={(checked) => 
                          handleUpdateWebhook(webhook.id, { enabled: checked })
                        }
                      />
                    </div>
                    
                    {/* URL */}
                    <div className="space-y-2">
                      <Label htmlFor={`url-${webhook.id}`}>Endpoint URL</Label>
                      <Input
                        id={`url-${webhook.id}`}
                        type="url"
                        placeholder="https://your-server.com/webhook"
                        value={webhook.url}
                        onChange={(e) => 
                          handleUpdateWebhook(webhook.id, { url: e.target.value })
                        }
                      />
                    </div>
                    
                    {/* Events */}
                    <div className="space-y-2">
                      <Label>Trigger on</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`event-created-${webhook.id}`}
                            checked={webhook.events.includes('response.created')}
                            onCheckedChange={() => 
                              toggleEvent(webhook.id, 'response.created')
                            }
                          />
                          <Label 
                            htmlFor={`event-created-${webhook.id}`}
                            className="text-sm font-normal"
                          >
                            New response submitted
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`event-updated-${webhook.id}`}
                            checked={webhook.events.includes('response.updated')}
                            onCheckedChange={() => 
                              toggleEvent(webhook.id, 'response.updated')
                            }
                          />
                          <Label 
                            htmlFor={`event-updated-${webhook.id}`}
                            className="text-sm font-normal"
                          >
                            Response updated
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Secret */}
                    <div className="space-y-2">
                      <Label htmlFor={`secret-${webhook.id}`}>
                        Signing Secret (optional)
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`secret-${webhook.id}`}
                          type={showSecrets[webhook.id] ? 'text' : 'password'}
                          placeholder="Your signing secret"
                          value={webhook.secret || ''}
                          onChange={(e) => 
                            handleUpdateWebhook(webhook.id, { secret: e.target.value })
                          }
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowSecrets(prev => ({
                            ...prev,
                            [webhook.id]: !prev[webhook.id]
                          }))}
                        >
                          {showSecrets[webhook.id] ? (
                            <EyeSlash className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used to sign payloads with HMAC-SHA256 in the X-Webhook-Signature header.
                      </p>
                    </div>
                    
                    {/* Custom Headers */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Custom Headers</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddHeader(webhook.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      {Object.entries(webhook.headers || {}).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <Input
                            placeholder="Header name"
                            value={key}
                            onChange={(e) => 
                              handleUpdateHeader(webhook.id, key, e.target.value, value)
                            }
                            className="flex-1"
                          />
                          <Input
                            placeholder="Value"
                            value={value}
                            onChange={(e) => 
                              handleUpdateHeader(webhook.id, key, key, e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteHeader(webhook.id, key)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook)}
                        disabled={testingWebhook === webhook.id || !webhook.url}
                      >
                        {testingWebhook === webhook.id ? (
                          <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <WebhooksLogo className="h-4 w-4 mr-2" />
                        )}
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
          
          {webhooks.length > 0 && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAddWebhook}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Webhook
            </Button>
          )}
          
          {/* Info box */}
          <div className="p-4 bg-muted/50 rounded-lg text-sm">
            <p className="font-medium mb-2">Webhook Payload</p>
            <p className="text-muted-foreground text-xs mb-2">
              Each webhook receives a POST request with this JSON structure:
            </p>
            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`{
  "event": "response.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "form": { "id": "...", "title": "..." },
  "response": {
    "id": "...",
    "answers": { ... },
    "submitted_at": "..."
  }
}`}
            </pre>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
