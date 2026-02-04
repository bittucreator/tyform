'use client'

import { useState } from 'react'
import { Loader2, Wand2 } from 'lucide-react'
import { Crown } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { useAIFormGenerator } from '@/hooks/use-ai'
import { createClient } from '@/lib/supabase/client'
import { usePlanAccess } from '@/lib/use-plan-access'
import type { Form } from '@/types/database'
import { useRouter } from 'next/navigation'

interface AIFormGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFormCreated?: (formId: string) => void
}

const EXAMPLE_PROMPTS = [
  'A customer satisfaction survey for a SaaS product',
  'Employee onboarding feedback form',
  'Event registration form with dietary preferences',
  'Product feedback survey with NPS score',
  'Job application form for a marketing role',
]

export function AIFormGeneratorDialog({ 
  open, 
  onOpenChange, 
  onFormCreated 
}: AIFormGeneratorDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [questionCount, setQuestionCount] = useState([5])
  const [isCreating, setIsCreating] = useState(false)
  
  const router = useRouter()
  const { isGenerating, error, generateForm } = useAIFormGenerator()
  const { canUse, isLoading: planLoading, getUpgradeMessage } = usePlanAccess()
  
  const hasAIAccess = canUse('aiFeatures')
  const upgradeMessage = getUpgradeMessage('aiFeatures')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the form you want to create')
      return
    }

    const generatedForm = await generateForm(prompt, questionCount[0])
    
    if (!generatedForm) {
      toast.error(error || 'Failed to generate form. Please try again.')
      return
    }

    // Create the form in the database
    setIsCreating(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Insert the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          title: generatedForm.title,
          description: generatedForm.description,
          user_id: user.id,
          questions: generatedForm.questions.map((q, index) => ({
            ...q,
            id: crypto.randomUUID(),
            order_index: index,
          })),
          settings: {
            showProgressBar: true,
            showQuestionNumbers: true,
            shuffleQuestions: false,
            theme: {
              primaryColor: '#000000',
              backgroundColor: '#ffffff',
              textColor: '#000000',
              fontFamily: 'Inter',
            },
          },
        })
        .select()
        .single()

      if (formError || !form) {
        throw new Error(formError?.message || 'Failed to create form')
      }

      const typedForm = form as Form

      toast.success(`"${generatedForm.title}" has been created with ${generatedForm.questions.length} questions`)

      onOpenChange(false)
      setPrompt('')
      
      if (onFormCreated) {
        onFormCreated(typedForm.id)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save form')
    } finally {
      setIsCreating(false)
    }
  }

  const handleExamplePromptClick = (example: string) => {
    setPrompt(example)
  }

  const isLoading = isGenerating || isCreating || planLoading

  // Show upgrade prompt if user doesn't have AI access
  if (!planLoading && !hasAIAccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary" weight="fill" />
            </div>
            <DialogTitle className="mb-2">{upgradeMessage?.title || 'Pro Feature'}</DialogTitle>
            <DialogDescription className="mb-6">
              {upgradeMessage?.description || 'Upgrade to Pro to unlock AI-powered form generation.'}
            </DialogDescription>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => router.push('/billing')} className="gap-2">
                <Crown className="h-4 w-4" weight="fill" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>
            Generate Form with AI
          </DialogTitle>
          <DialogDescription>
            Describe the form you want to create and AI will generate it for you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Describe your form</Label>
            <Textarea
              id="prompt"
              placeholder="E.g., A customer feedback survey for an e-commerce store with questions about product quality, delivery experience, and customer service..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Try an example</Label>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExamplePromptClick(example)}
                  disabled={isLoading}
                  className="text-xs px-2 py-1 rounded-full bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  {example.length > 40 ? example.slice(0, 40) + '...' : example}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Number of questions</Label>
              <span className="text-sm font-medium">{questionCount[0]}</span>
            </div>
            <Slider
              value={questionCount}
              onValueChange={setQuestionCount}
              min={3}
              max={15}
              step={1}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              AI will generate approximately {questionCount[0]} questions based on your description
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isGenerating ? 'Generating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Form
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
