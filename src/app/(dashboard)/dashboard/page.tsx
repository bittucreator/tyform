import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormsList } from '@/components/forms/forms-list'
import { EmptyState } from '@/components/forms/empty-state'
import { NewFormButton } from '@/components/forms/new-form-button'
import type { Form, Response } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: formsData } = await supabase
    .from('forms')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const forms = (formsData || []) as Form[]

  // Get response counts
  const formIds = forms.map(f => f.id)
  const { data: responsesData } = await supabase
    .from('responses')
    .select('form_id')
    .in('form_id', formIds.length > 0 ? formIds : ['none'])

  const responses = (responsesData || []) as Pick<Response, 'form_id'>[]
  
  // Calculate stats
  const totalForms = forms.length
  const publishedForms = forms.filter(f => f.is_published).length
  const draftForms = forms.filter(f => !f.is_published).length
  const totalResponses = responses.length

  // Create response count map
  const responseCountMap = responses.reduce((acc, r) => {
    acc[r.form_id] = (acc[r.form_id] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-5 p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[17px] font-semibold tracking-tight">Forms</h1>
          <p className="text-[13px] text-muted-foreground/80 mt-0.5">
            Create and manage your forms
          </p>
        </div>
        <NewFormButton />
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-border/50 rounded-lg bg-card overflow-hidden divide-x divide-border/50">
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Total</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{totalForms}</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Published</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{publishedForms}</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Drafts</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{draftForms}</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Responses</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{totalResponses}</p>
        </div>
      </div>

      {forms.length > 0 ? (
        <FormsList forms={forms} responseCountMap={responseCountMap} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
