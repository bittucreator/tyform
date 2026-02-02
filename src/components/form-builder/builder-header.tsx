'use client'

import Link from 'next/link'
import { useFormBuilder } from '@/store/form-builder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  House, 
  Play, 
  SpinnerGap,
  Eyedropper,
  Swatches,
  GitBranch,
  Plug,
  Gear,
  ShareNetwork,
  ChartBar,
} from '@phosphor-icons/react'
import { useState } from 'react'

interface FormBuilderHeaderProps {
  onSave: () => Promise<void>
  onPublish: () => Promise<void>
  isPublished: boolean
  isDirty: boolean
  showThemeEditor: boolean
  onToggleThemeEditor: () => void
  showLogicPanel: boolean
  onToggleLogicPanel: () => void
  showSettingsPanel: boolean
  onToggleSettingsPanel: () => void
  showSharePanel: boolean
  onToggleSharePanel: () => void
  onCloseAllPanels: () => void
}

export function FormBuilderHeader({
  onSave,
  onPublish,
  isPublished,
  isDirty,
  showThemeEditor,
  onToggleThemeEditor,
  showLogicPanel,
  onToggleLogicPanel,
  showSettingsPanel,
  onToggleSettingsPanel,
  showSharePanel,
  onToggleSharePanel,
  onCloseAllPanels,
}: FormBuilderHeaderProps) {
  const { form, setTitle } = useFormBuilder()
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Check if any panel is open
  const isInBuildMode = !showThemeEditor && !showSettingsPanel && !showSharePanel

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
    <header className="bg-background border-b border-border">
      {/* Top row - Form title */}
      <div className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <House className="h-4 w-4" weight="duotone" />
            </Button>
          </Link>
          <Input
            value={form.title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base font-medium border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 w-48 h-8 px-2"
            placeholder="Untitled Form"
          />
          {isDirty && (
            <span className="text-xs text-muted-foreground">•</span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center">
          <nav className="flex items-center gap-1">
            <Button 
              variant={isInBuildMode && !showThemeEditor ? 'secondary' : 'ghost'}
              size="sm" 
              className="text-sm font-medium text-foreground"
              onClick={onCloseAllPanels}
            >
              <Eyedropper className="h-4 w-4 mr-1" />
              Build
            </Button>
            <Button 
              variant={showThemeEditor ? 'secondary' : 'ghost'}
              size="sm"
              onClick={onToggleThemeEditor}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <Swatches className="h-4 w-4 mr-1" />
              Design
            </Button>
            <Button 
              variant={showLogicPanel ? 'secondary' : 'ghost'}
              size="sm" 
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={onToggleLogicPanel}
            >
              <GitBranch className="h-4 w-4 mr-1" />
              Logic
            </Button>
            <Button 
              variant="ghost"
              size="sm" 
              className="text-sm text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={`/forms/${form?.id}/integrations`}>
                <Plug className="h-4 w-4 mr-1" />
                Integrations
              </Link>
            </Button>
            <Button 
              variant={showSettingsPanel ? 'secondary' : 'ghost'}
              size="sm" 
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={onToggleSettingsPanel}
            >
              <Gear className="h-4 w-4 mr-1" />
              Settings
            </Button>
            <Button 
              variant={showSharePanel ? 'secondary' : 'ghost'}
              size="sm" 
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={onToggleSharePanel}
            >
              <ShareNetwork className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button 
              variant="ghost"
              size="sm" 
              className="text-sm text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={`/forms/${form?.id}/responses`}>
                <ChartBar className="h-4 w-4 mr-1" />
                Results
              </Link>
            </Button>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {form.id && (
            <Link href={`/forms/${form.id}/preview`} target="_blank">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Play className="h-4 w-4" />
              </Button>
            </Link>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
          
          <Button
            variant={isPublished ? 'outline' : 'default'}
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing}
            className="gap-2"
          >
            {isPublishing && (
              <SpinnerGap className="h-4 w-4 animate-spin" />
            )}
            {isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>
    </header>
  )
}
