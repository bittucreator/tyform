import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

interface WorkspaceRow {
  owner_id: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const supabase = await createClient()
    const adminClient = getAdminClient()
    const { workspaceId } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, icon } = body

    // Check if user owns this workspace
    const { data: workspaceData, error: fetchError } = await adminClient
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const workspace = workspaceData as WorkspaceRow
    if (workspace.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Update workspace using admin client
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (icon !== undefined) updateData.icon = icon
    
    const { data: updatedWorkspace, error } = await adminClient
      .from('workspaces')
      .update(updateData)
      .eq('id', workspaceId)
      .select('id, name, slug, icon, owner_id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, workspace: updatedWorkspace })
  } catch (error) {
    console.error('Error updating workspace:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const supabase = await createClient()
    const adminClient = getAdminClient()
    const { workspaceId } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user owns this workspace
    const { data: workspaceData, error: fetchError } = await adminClient
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const workspace = workspaceData as WorkspaceRow
    if (workspace.owner_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Delete workspace using admin client
    const { error } = await adminClient
      .from('workspaces')
      .delete()
      .eq('id', workspaceId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workspace:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
