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
  Copy, 
  Check, 
  Eye, 
  EyeSlash,
  Info
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface WebhookModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingWebhook?: {
    id: string
    url: string
    secret?: string
    events: ('response.created' | 'response.updated')[]
    enabled: boolean
  }
  onSave: (webhook: {
    url: string
    secret?: string
    events: ('response.created' | 'response.updated')[]
    enabled: boolean
  }) => Promise<void>
}

const WEBHOOK_EVENTS = [
  { id: 'response.created', label: 'New submission', description: 'Triggered when a form is submitted' },
  { id: 'response.updated', label: 'Submission updated', description: 'Triggered when a submission is edited' },
]

export function WebhookModal({ 
  open, 
  onOpenChange, 
  existingWebhook,
  onSave 
}: WebhookModalProps) {
  const [url, setUrl] = useState(existingWebhook?.url || '')
  const [secret, setSecret] = useState(existingWebhook?.secret || '')
  const [showSecret, setShowSecret] = useState(false)
  const [events, setEvents] = useState<('response.created' | 'response.updated')[]>(
    existingWebhook?.events || ['response.created']
  )
  const [enabled, setEnabled] = useState(existingWebhook?.enabled ?? true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const isEditing = !!existingWebhook

  const generateSecret = () => {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const newSecret = 'whsec_' + Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
    setSecret(newSecret)
  }

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleEvent = (eventId: 'response.created' | 'response.updated') => {
    setEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    )
  }

  const validateUrl = (urlString: string): boolean => {
    try {
      const parsed = new URL(urlString)
      return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
      return false
    }
  }

  const handleSave = async () => {
    setError('')

    if (!url.trim()) {
      setError('Webhook URL is required')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (http:// or https://)')
      return
    }

    if (events.length === 0) {
      setError('Please select at least one event')
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        url: url.trim(),
        secret: secret || undefined,
        events,
        enabled,
      })
      onOpenChange(false)
    } catch {
      setError('Failed to save webhook. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      setUrl(existingWebhook?.url || '')
      setSecret(existingWebhook?.secret || '')
      setEvents(existingWebhook?.events || ['response.created'])
      setEnabled(existingWebhook?.enabled ?? true)
      setError('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Webhook' : 'Add Webhook'}</DialogTitle>
          <DialogDescription>
            Configure a webhook endpoint to receive real-time notifications when events occur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Endpoint URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-server.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={cn(error && !url && "border-red-500")}
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll send POST requests to this URL when events occur.
            </p>
          </div>

          {/* Signing Secret */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="webhook-secret">Signing Secret (Optional)</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={generateSecret}
                className="h-7 text-xs"
              >
                Generate
              </Button>
            </div>
            <div className="relative">
              <Input
                id="webhook-secret"
                type={showSecret ? 'text' : 'password'}
                placeholder="whsec_..."
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? (
                    <EyeSlash className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                {secret && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={copySecret}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this secret to verify webhook signatures and ensure requests come from Tyform.
            </p>
          </div>

          {/* Events */}
          <div className="space-y-3">
            <Label>Events to send</Label>
            <div className="space-y-2">
              {WEBHOOK_EVENTS.map((event) => (
                <label
                  key={event.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    events.includes(event.id as 'response.created' | 'response.updated') 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-border/80"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={events.includes(event.id as 'response.created' | 'response.updated')}
                    onChange={() => toggleEvent(event.id as 'response.created' | 'response.updated')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium text-sm">{event.label}</div>
                    <div className="text-xs text-muted-foreground">{event.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <div className="font-medium text-sm">Enable webhook</div>
              <div className="text-xs text-muted-foreground">
                Temporarily disable without removing
              </div>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Info Box */}
          <div className="flex gap-2 p-3 rounded-lg bg-muted/50">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Webhook payload format</p>
              <p>Each webhook request includes a JSON payload with the event type, timestamp, and relevant data. 
              Requests are signed using HMAC-SHA256 if a secret is provided.</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Webhook'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
