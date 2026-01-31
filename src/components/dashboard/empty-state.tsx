'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Form } from '@/types/database'

export function EmptyState() {
  const router = useRouter()
  const supabase = createClient()

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
    <div className="border border-dashed border-border/50 rounded-lg p-8 text-center">
      <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-4">
        <FileText className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.5} />
      </div>
      <h3 className="font-medium text-[14px] tracking-tight mb-1">
        No forms yet
      </h3>
      <p className="text-muted-foreground/70 text-[12px] max-w-sm mx-auto mb-4">
        Create your first form to start collecting responses from your audience
      </p>
      <Button onClick={handleCreateForm} size="sm" className="h-8 text-[12px]">
        
        Create your first form
      </Button>
    </div>
  )
}
