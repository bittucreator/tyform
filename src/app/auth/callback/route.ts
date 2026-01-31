import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has a workspace, if not create one
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        try {
          const adminClient = getAdminClient()
          
          // Check if user has any workspaces
          const { data: memberships } = await adminClient
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id)
            .limit(1)

          // If no workspaces, create a default one
          if (!memberships || memberships.length === 0) {
            const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            const workspaceName = `${userName}'s Workspace`
            
            // Create workspace using admin client
            const { data: workspace } = await adminClient
              .from('workspaces')
              .insert({
                name: workspaceName,
                slug: user.id,
                icon: '',
                owner_id: user.id
              })
              .select('id')
              .single()

            // Add user as owner
            if (workspace) {
              await adminClient
                .from('workspace_members')
                .insert({
                  workspace_id: workspace.id,
                  user_id: user.id,
                  role: 'owner'
                })
            }
          }
        } catch (e) {
          // Workspace creation failed, but continue - user can create later
          console.error('Failed to create default workspace:', e)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
