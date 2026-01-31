'use client'

import Link from 'next/link'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Eye, FloppyDisk, Globe, Lock, SpinnerGap, Palette, WebhooksLogo } from '@phosphor-icons/react'
import { useState } from 'react'

interface FormBuilderHeaderProps {
  onSave: () => Promise<void>
  onPublish: () => Promise<void>
  isPublished: boolean
  isDirty: boolean
  showThemeEditor: boolean
  onToggleThemeEditor: () => void
  showWebhookEditor: boolean
  onToggleWebhookEditor: () => void
}

export function FormBuilderHeader({
  onSave,
  onPublish,
  isPublished,
  isDirty,
  showThemeEditor,
  onToggleThemeEditor,
  showWebhookEditor,
  onToggleWebhookEditor,
}: FormBuilderHeaderProps) {
  const { form, setTitle } = useFormBuilder()
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  
  const webhookCount = form.settings.webhooks?.filter(w => w.enabled).length || 0

  const handleSave = async () => {
    setIsSaving(true)
    await onSave()
    setIsSaving(false)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    await onPublish()
    setIsPublishing(false)
  }

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <Input
          value={form.title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-64"
          placeholder="Untitled Form"
        />
        {isDirty && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant={showThemeEditor ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onToggleThemeEditor}
        >
          <Palette className="h-4 w-4 mr-2" />
          Theme
        </Button>

        <Button
          variant={showWebhookEditor ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onToggleWebhookEditor}
        >
          <WebhooksLogo className="h-4 w-4 mr-2" />
          WebhooksLogo
          {webhookCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {webhookCount}
            </Badge>
          )}
        </Button>

        {form.id && (
          <Link href={`/forms/${form.id}/preview`} target="_blank">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? (
            <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FloppyDisk className="h-4 w-4 mr-2" />
          )}
          Save
        </Button>

        <Button
          size="sm"
          onClick={handlePublish}
          disabled={isPublishing}
          variant={isPublished ? 'outline' : 'default'}
        >
          {isPublishing ? (
            <SpinnerGap className="h-4 w-4 mr-2 animate-spin" />
          ) : isPublished ? (
            <Lock className="h-4 w-4 mr-2" />
          ) : (
            <Globe className="h-4 w-4 mr-2" />
          )}
          {isPublished ? 'Unpublish' : 'Publish'}
        </Button>
      </div>
    </header>
  )
}
