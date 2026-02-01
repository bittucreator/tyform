import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ResponsesTable } from '@/components/responses/table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, PencilSimple, Eye, Share } from '@phosphor-icons/react/dist/ssr'
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
    <div className="space-y-5 p-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight">{form.title}</h1>
            <p className="text-[13px] text-muted-foreground/80 mt-0.5">
              {responses.length} {responses.length === 1 ? 'response' : 'responses'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/forms/${id}/preview`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </Link>
          <Link href={`/forms/${id}/edit`}>
            <Button variant="outline" size="sm">
              <PencilSimple className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          {form.is_published && (
            <Button variant="default" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border border-border/50 rounded-lg bg-card overflow-hidden divide-x divide-border/50">
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Total</span>
          <p className="text-lg font-semibold tabular-nums mt-1">{responses.length}</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Today</span>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {responses.filter(r => {
              const today = new Date()
              const submitted = new Date(r.submitted_at)
              return submitted.toDateString() === today.toDateString()
            }).length}
          </p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">This Week</span>
          <p className="text-lg font-semibold tabular-nums mt-1">
            {responses.filter(r => {
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              return new Date(r.submitted_at) >= weekAgo
            }).length}
          </p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Status</span>
          <p className="text-lg font-semibold tabular-nums mt-1">
            <span className={form.is_published ? 'text-green-600' : 'text-yellow-600'}>
              {form.is_published ? 'Live' : 'Draft'}
            </span>
          </p>
        </div>
      </div>

      {/* Responses Table */}
      <ResponsesTable form={form} responses={responses} />
    </div>
  )
}
