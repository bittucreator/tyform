import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormBuilder } from '@/components/form-builder'
import type { Form } from '@/types/database'

interface PencilSimpleFormPageProps {
  params: Promise<{ id: string }>
}

export default async function PencilSimpleFormPage({ params }: PencilSimpleFormPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: formData, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !formData) {
    redirect('/dashboard')
  }

  const form = formData as Form

  return <FormBuilder form={form} />
}
