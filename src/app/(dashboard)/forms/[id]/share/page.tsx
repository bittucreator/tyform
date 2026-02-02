import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormTabsLayout } from '@/components/responses/form-tabs-layout'
import { ShareView } from '@/components/responses/share-view'
import type { Form } from '@/types/database'

interface SharePageProps {
  params: Promise<{ id: string }>
}

export default async function SharePage({ params }: SharePageProps) {
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tyform.com'
  const formUrl = form.short_id 
    ? `${baseUrl}/r/${form.short_id}`
    : `${baseUrl}/f/${form.id}`

  return (
    <FormTabsLayout form={form}>
      <ShareView form={form} formUrl={formUrl} />
    </FormTabsLayout>
  )
}
