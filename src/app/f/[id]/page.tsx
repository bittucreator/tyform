import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormViewer } from '@/components/form-viewer'
import { FormClosed } from '@/components/form-viewer/form-closed'
import { checkFormAccess } from '@/lib/form-access'
import type { Form } from '@/types/database'

interface FormPageProps {
  params: Promise<{ id: string }>
}

export default async function FormPage({ params }: FormPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: formData, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error || !formData) {
    notFound()
  }

  const form = formData as Form

  // Get submission count for limit checking
  const { count: submissionCount } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('form_id', id)

  // Check form access
  const accessStatus = checkFormAccess(form.settings, submissionCount || 0)
  
  if (!accessStatus.isOpen) {
    return <FormClosed message={accessStatus.message} theme={form.settings.theme} />
  }

  return <FormViewer form={form} submissionCount={submissionCount || 0} />
}
