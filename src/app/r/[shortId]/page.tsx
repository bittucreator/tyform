import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormViewer } from '@/components/form-viewer'
import { FormClosed } from '@/components/form-viewer/form-closed'
import { checkFormAccess } from '@/lib/form-access'
import { isUUID } from '@/lib/short-id'
import type { Form } from '@/types/database'

interface FormPageProps {
  params: Promise<{ shortId: string }>
}

export default async function ShortFormPage({ params }: FormPageProps) {
  const { shortId } = await params
  const supabase = await createClient()

  // If it's a UUID, redirect to the standard URL
  if (isUUID(shortId)) {
    redirect(`/f/${shortId}`)
  }

  // Look up form by short_id
  const { data: formData, error } = await supabase
    .from('forms')
    .select('*')
    .eq('short_id', shortId)
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
    .eq('form_id', form.id)

  // Check form access
  const accessStatus = checkFormAccess(form.settings, submissionCount || 0)
  
  if (!accessStatus.isOpen) {
    return <FormClosed message={accessStatus.message} theme={form.settings.theme} />
  }

  return (
    <Suspense fallback={<FormLoadingFallback />}>
      <FormViewer form={form} />
    </Suspense>
  )
}

function FormLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>
    </div>
  )
}
