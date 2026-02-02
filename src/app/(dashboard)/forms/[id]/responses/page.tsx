import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormTabsLayout } from '@/components/responses/form-tabs-layout'
import { ResponsesView } from '@/components/responses/responses-view'
import { getWorkspacePlanAccess } from '@/lib/plan-access'
import type { Form, Response } from '@/types/database'

interface ResponsesPageProps {
  params: Promise<{ id: string }>
}

export default async function ResponsesPage({ params }: ResponsesPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: formData, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (formError || !formData) {
    redirect('/dashboard')
  }

  const form = formData as Form

  // Get plan access to check for Pro features
  let isPro = false
  if (form.workspace_id) {
    const planAccess = await getWorkspacePlanAccess(form.workspace_id)
    isPro = planAccess.canUse('partialSubmissions')
  }

  const { data: responsesData } = await supabase
    .from('responses')
    .select('*')
    .eq('form_id', id)
    .order('submitted_at', { ascending: false })

  const responses = (responsesData || []) as Response[]

  const completedCount = responses.filter(r => r.metadata?.isComplete !== false).length
  const partialCount = responses.length - completedCount

  return (
    <FormTabsLayout form={form}>
      <ResponsesView 
        form={form} 
        responses={responses}
        completedCount={completedCount}
        partialCount={partialCount}
        isPro={isPro}
      />
    </FormTabsLayout>
  )
}
