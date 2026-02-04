'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Form } from '@/types/database'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AIFormGeneratorDialog } from '@/components/ai-form-generator-dialog'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function NewFormButton() {
  const router = useRouter()
  const supabase = createClient()
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  const handleCreateForm = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('forms')
      .insert({
        user_id: user.id,
        title: 'Untitled Form',
        questions: [],
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

    if (error) {
      console.error('Form creation error:', error)
      toast.error(`Failed to create form: ${error.message}`)
    } else if (data) {
      const form = data as Form
      router.push(`/forms/${form.id}/edit`)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="h-8 text-[12px] gap-1">
            <Plus className="h-3.5 w-3.5" weight="bold" />
            New Form
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCreateForm} className="gap-2">
            <Plus className="h-4 w-4" />
            Blank Form
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowAIGenerator(true)} className="gap-2">
            <Sparkle className="h-4 w-4" weight="fill" />
            Generate with AI
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AIFormGeneratorDialog
        open={showAIGenerator}
        onOpenChange={setShowAIGenerator}
        onFormCreated={(formId) => {
          setShowAIGenerator(false)
          router.push(`/forms/${formId}/edit`)
        }}
      />
    </>
  )
}
