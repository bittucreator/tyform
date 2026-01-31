import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// DELETE - Remove a member from the workspace
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params
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
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 })
    }

    // Get the member to be removed
    const { data: memberToRemove } = await adminClient
      .from('workspace_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)
      .single()

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot remove the owner
    if (memberToRemove.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove the workspace owner' }, { status: 400 })
    }

    // Admins cannot remove other admins (only owner can)
    if (memberToRemove.role === 'admin' && membership.role !== 'owner') {
      return NextResponse.json({ error: 'Only the owner can remove admins' }, { status: 403 })
    }

    // Delete the member
    const { error } = await adminClient
      .from('workspace_members')
      .delete()
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)

    if (error) {
      console.error('Error removing member:', error)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/workspaces/[workspaceId]/members/[memberId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a member's role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const { workspaceId, memberId } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { role } = await request.json()

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Only owner can change roles
    const { data: membership } = await adminClient
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'owner') {
      return NextResponse.json({ error: 'Only the owner can change member roles' }, { status: 403 })
    }

    // Get the member to be updated
    const { data: memberToUpdate } = await adminClient
      .from('workspace_members')
      .select('role')
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)
      .single()

    if (!memberToUpdate) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Cannot change owner's role
    if (memberToUpdate.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change the owner role' }, { status: 400 })
    }

    // Update the role
    const { error } = await adminClient
      .from('workspace_members')
      .update({ role })
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)

    if (error) {
      console.error('Error updating member role:', error)
      return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in PATCH /api/workspaces/[workspaceId]/members/[memberId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
