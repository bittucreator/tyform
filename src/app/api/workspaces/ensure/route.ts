import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// POST - Ensure user has a workspace, create if not
export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = getAdminClient()

    // Check if user has any workspaces
    const { data: memberships } = await adminClient
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1)

    // If user already has workspaces, return success
    if (memberships && memberships.length > 0) {
      return NextResponse.json({ exists: true })
    }

    // Create default workspace
    const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    const workspaceName = `${userName}'s Workspace`

    const { data: workspace, error: workspaceError } = await adminClient
      .from('workspaces')
      .insert({
        name: workspaceName,
        slug: user.id,
        icon: '',
        owner_id: user.id
      })
      .select('id, name, slug, icon')
      .single()

    if (workspaceError) {
      console.error('Failed to create workspace:', workspaceError)
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
    }

    // Add user as owner
    const { error: memberError } = await adminClient
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner'
      })

    if (memberError) {
      console.error('Failed to add workspace member:', memberError)
      return NextResponse.json({ error: 'Failed to setup workspace' }, { status: 500 })
    }

    return NextResponse.json({ 
      created: true, 
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        icon: workspace.icon,
        role: 'owner',
        isOwner: true
      }
    })

  } catch (error) {
    console.error('Error ensuring workspace:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
