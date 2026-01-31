import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/forms/header'
import { ResponsesTable } from '@/components/responses/table'
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

  const { data: responsesData } = await supabase
    .from('responses')
    .select('*')
    .eq('form_id', id)
    .order('submitted_at', { ascending: false })

  const responses = (responsesData || []) as Response[]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{form.title}</h1>
          <p className="text-muted-foreground mt-1">
            {responses.length} responses
          </p>
        </div>

        <ResponsesTable form={form} responses={responses} />
      </main>
    </div>
  )
}
