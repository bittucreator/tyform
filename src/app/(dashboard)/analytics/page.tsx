import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get forms for the selector
  const { data: forms } = await supabase
    .from('forms')
    .select('id, title')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <AnalyticsDashboard forms={forms || []} />
    </div>
  )
}
