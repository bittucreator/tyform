import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormTabsLayout } from '@/components/responses/form-tabs-layout'
import { SettingsView } from '@/components/responses/settings-view'
import type { Form } from '@/types/database'

interface SettingsPageProps {
  params: Promise<{ id: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
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

  return (
    <FormTabsLayout form={form}>
      <SettingsView form={form} />
    </FormTabsLayout>
  )
}
