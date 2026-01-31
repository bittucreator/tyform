import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// DELETE - Delete an API key
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; keyId: string }> }
) {
  try {
    const { workspaceId, keyId } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Check if user is an admin or owner of this workspace
    const { data: membership } = await adminClient
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Only admins can delete API keys' }, { status: 403 })
    }

    // Delete the API key
    const { error } = await adminClient
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('workspace_id', workspaceId)

    if (error) {
      console.error('Error deleting API key:', error)
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/workspaces/[workspaceId]/api-keys/[keyId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
