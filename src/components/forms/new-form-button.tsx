'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Form } from '@/types/database'

export function NewFormButton() {
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
    <Button onClick={handleCreateForm} size="sm" className="h-8 text-[12px]">
      
      New Form
    </Button>
  )
}
