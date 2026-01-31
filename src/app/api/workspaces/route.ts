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

interface Workspace {
  id: string
  name: string
  slug: string
  icon: string
  owner_id: string
  created_at: string
}

interface WorkspaceMember {
  workspace_id: string
  role: string
  workspaces: Workspace
}

export async function GET() {
  try {
    const supabase = await createClient()
    const adminClient = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Query workspaces using admin client to bypass RLS
    const { data: membershipData, error } = await adminClient
      .from('workspace_members')
      .select(`
        workspace_id,
        role,
        workspaces (
          id,
          name,
          slug,
          icon,
          owner_id,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    // If table doesn't exist or error, try to create a workspace
    if (error) {
      console.error('Workspace query error:', error.message)
    }

    const memberships = (membershipData || []) as unknown as WorkspaceMember[]
    
    // If no workspaces found, create one
    if (memberships.length === 0) {
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
      const workspaceName = `${userName}'s Workspace`
      
      // Create workspace using admin client
      const { data: newWorkspace, error: createError } = await adminClient
        .from('workspaces')
        .insert({
          name: workspaceName,
          slug: user.id,
          icon: '',
          owner_id: user.id
        })
        .select('id, name, slug, icon, owner_id')
        .single()

      if (createError) {
        console.error('Failed to create workspace:', createError)
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
      }

      // Add user as owner
      await adminClient
        .from('workspace_members')
        .insert({
          workspace_id: newWorkspace.id,
          user_id: user.id,
          role: 'owner'
        })

      return NextResponse.json({ 
        workspaces: [{
          id: newWorkspace.id,
          name: newWorkspace.name,
          slug: newWorkspace.slug,
          icon: newWorkspace.icon,
          role: 'owner',
          isOwner: true,
        }]
      })
    }
    
    const workspaces = memberships.map((m) => ({
      id: m.workspaces.id,
      name: m.workspaces.name,
      slug: m.workspaces.slug,
      icon: m.workspaces.icon,
      role: m.role,
      isOwner: m.workspaces.owner_id === user.id,
    }))

    return NextResponse.json({ workspaces })

  } catch (error) {
    console.error('Error fetching workspaces:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, icon = '' } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Workspace name is required' }, { status: 400 })
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Check for unique slug and generate one if needed
    let slug = baseSlug
    let counter = 0
    while (true) {
      const { data: existing } = await adminClient
        .from('workspaces')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existing) break
      counter++
      slug = `${baseSlug}-${counter}`
    }

    // Create workspace using admin client
    const { data: workspaceData, error: workspaceError } = await adminClient
      .from('workspaces')
      .insert({
        name: name.trim(),
        slug,
        icon,
        owner_id: user.id,
      })
      .select()
      .single()

    if (workspaceError) {
      console.error('Failed to create workspace:', workspaceError)
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
    }

    const workspace = workspaceData as Workspace

    // Add user as owner member
    const { error: memberError } = await adminClient
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      console.error('Failed to add owner as member:', memberError)
      // Rollback workspace creation
      await adminClient.from('workspaces').delete().eq('id', workspace.id)
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        icon: workspace.icon,
        role: 'owner',
        isOwner: true,
      },
    })

  } catch (error) {
    console.error('Error creating workspace:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
