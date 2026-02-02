import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormTabsLayout } from '@/components/responses/form-tabs-layout'
import { InsightsView } from '@/components/responses/insights-view'
import type { Form, Response } from '@/types/database'

interface InsightsPageProps {
  params: Promise<{ id: string }>
}

export default async function InsightsPage({ params }: InsightsPageProps) {
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

  const { data: responsesData } = await supabase
    .from('responses')
    .select('*')
    .eq('form_id', id)
    .order('submitted_at', { ascending: false })

  const responses = (responsesData || []) as Response[]

  return (
    <FormTabsLayout form={form}>
      <InsightsView form={form} responses={responses} />
    </FormTabsLayout>
  )
}
