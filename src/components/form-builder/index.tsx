'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useFormBuilder } from '@/store/form-builder'
import { FormBuilderHeader } from './builder-header'
import { BlockList } from './block-list'
import { FormPreview } from './form-preview'
import { BlockEditor } from './block-editor'
import { ThemeEditor } from './theme-editor'
import { IntegrationsPanel } from './integrations-panel'
import { SettingsPanel } from './settings-panel'
import { SharePanel } from './share-panel'
import { ResultsPanel } from './results-panel'
import { LogicFlowPanel } from './logic-flow-panel'
import { toast } from 'sonner'
import type { Form } from '@/types/database'

interface FormBuilderProps {
  form: Form
}

export function FormBuilder({ form }: FormBuilderProps) {
  const router = useRouter()
  const supabase = createClient()
  const { setForm, form: currentForm, isDirty, setDirty } = useFormBuilder()
  const [showThemeEditor, setShowThemeEditor] = useState(false)
  const [showWebhookEditor, setShowWebhookEditor] = useState(false)
  const [showLogicPanel, setShowLogicPanel] = useState(false)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [showSharePanel, setShowSharePanel] = useState(false)
  const [showResultsPanel, setShowResultsPanel] = useState(false)
  const [isPublished, setIsPublished] = useState(form.is_published)

  useEffect(() => {
    setForm({
      id: form.id,
      title: form.title,
      description: form.description || '',
      questions: form.questions || [],
      settings: form.settings,
      is_published: form.is_published,
      short_id: (form as any).short_id,
    })
    setIsPublished(form.is_published)
  }, [form, setForm])

  const handleSave = useCallback(async () => {
    const { error } = await supabase
      .from('forms')
      .update({
        title: currentForm.title,
        description: currentForm.description,
        questions: currentForm.questions,
        settings: currentForm.settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id)

    if (error) {
      toast.error('Failed to save form')
    } else {
      toast.success('Form saved')
      setDirty(false)
    }
  }, [supabase, currentForm, form.id, setDirty])

  const handlePublish = async () => {
    const newPublishedState = !isPublished
    const { error } = await supabase
      .from('forms')
      .update({
        is_published: newPublishedState,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id)

    if (error) {
      toast.error('Failed to update form')
    } else {
      setIsPublished(newPublishedState)
      toast.success(newPublishedState ? 'Form published!' : 'Form unpublished')
    }
  }

  // Auto-save on Cmd/Ctrl + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (isDirty) handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDirty, handleSave])

  const handleCloseAllPanels = useCallback(() => {
    setShowThemeEditor(false)
    setShowSettingsPanel(false)
    setShowSharePanel(false)
    setShowResultsPanel(false)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      <FormBuilderHeader
        onSave={handleSave}
        onPublish={handlePublish}
        isPublished={isPublished}
        isDirty={isDirty}
        showThemeEditor={showThemeEditor}
        onToggleThemeEditor={() => setShowThemeEditor(!showThemeEditor)}
        showWebhookEditor={showWebhookEditor}
        onToggleWebhookEditor={() => setShowWebhookEditor(!showWebhookEditor)}
        showLogicPanel={showLogicPanel}
        onToggleLogicPanel={() => setShowLogicPanel(!showLogicPanel)}
        showSettingsPanel={showSettingsPanel}
        onToggleSettingsPanel={() => setShowSettingsPanel(!showSettingsPanel)}
        showSharePanel={showSharePanel}
        onToggleSharePanel={() => setShowSharePanel(!showSharePanel)}
        showResultsPanel={showResultsPanel}
        onToggleResultsPanel={() => setShowResultsPanel(!showResultsPanel)}
        onCloseAllPanels={handleCloseAllPanels}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Block list */}
        <BlockList />
        
        {/* Center - Form preview */}
        <FormPreview />
        
        {/* Right sidebar - Block editor or Theme editor */}
        {showThemeEditor ? (
          <ThemeEditor />
        ) : (
          <BlockEditor />
        )}
      </div>
      
      {/* Integrations Panel */}
      <IntegrationsPanel 
        open={showWebhookEditor} 
        onClose={() => setShowWebhookEditor(false)} 
      />
      
      {/* Settings Panel */}
      <SettingsPanel
        open={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
      />
      
      {/* Share Panel */}
      <SharePanel
        open={showSharePanel}
        onClose={() => setShowSharePanel(false)}
      />
      
      {/* Results Panel */}
      <ResultsPanel
        open={showResultsPanel}
        onClose={() => setShowResultsPanel(false)}
      />
      
      {/* Logic Flow Panel */}
      <LogicFlowPanel
        open={showLogicPanel}
        onClose={() => setShowLogicPanel(false)}
      />
    </div>
  )
}
