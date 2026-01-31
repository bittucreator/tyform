import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get active workspace
  const { data: workspacesData } = await supabase
    .from('workspaces')
    .select('id, name, slug')
    .eq('owner_id', user.id)
    .limit(1)
    .single()

  const workspace = workspacesData as { id: string; name: string; slug: string | null } | null
  
  const workspaceProps = workspace ? {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug || '',
  } : null

  return <SettingsForm user={user} workspace={workspaceProps} />
}
