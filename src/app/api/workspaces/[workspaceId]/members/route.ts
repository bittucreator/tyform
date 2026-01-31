import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: string
  joined_at: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Check if user is a member of this workspace
    const { data: membership } = await adminClient
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this workspace' }, { status: 403 })
    }

    // Fetch all members with profile info
    const { data: membersData, error: membersError } = await adminClient
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('joined_at', { ascending: true })

    if (membersError) {
      console.error('Failed to fetch members:', membersError)
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }

    const members = (membersData || []) as unknown as WorkspaceMember[]

    // Fetch user profiles for all members
    const userIds = members.map(m => m.user_id)
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, full_name, avatar_url, email')
      .in('id', userIds)

    // Transform members with profile info
    const transformedMembers = members.map(member => {
      const profile = profiles?.find(p => p.id === member.user_id)
      return {
        id: member.id,
        email: profile?.email || 'Unknown',
        name: profile?.full_name || null,
        avatar: profile?.avatar_url || null,
        role: member.role,
        joinedAt: member.joined_at,
      }
    })

    // Fetch pending invitations for this workspace
    const { data: invitationsData } = await adminClient
      .from('workspace_invitations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    interface TeamInvitation {
      id: string
      email: string
      role: string
      created_at: string
      expires_at: string
    }

    const invitations = (invitationsData || []) as unknown as TeamInvitation[]

    return NextResponse.json({
      members: transformedMembers,
      invitations,
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar: user.user_metadata?.avatar_url,
      },
    })

  } catch (error) {
    console.error('Error fetching workspace members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Invite a new member to the workspace
export async function POST(
  request: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, role } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 })
    }

    // Check if user exists by email in profiles
    const { data: existingUser } = await adminClient
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Check if already a member
      const { data: existingMember } = await adminClient
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', existingUser.id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
      }

      // Add user directly to workspace
      const { error: addError } = await adminClient
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: existingUser.id,
          role: role || 'member',
        })

      if (addError) {
        console.error('Error adding member:', addError)
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Member added successfully' })
    }

    // Create an invitation for non-existing users
    const { error: inviteError } = await adminClient
      .from('workspace_invitations')
      .insert({
        workspace_id: workspaceId,
        email: email,
        role: role || 'member',
        invited_by: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })

    if (inviteError) {
      // Check if invitation already exists
      if (inviteError.code === '23505') {
        return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 })
      }
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // TODO: Send invitation email

    return NextResponse.json({ success: true, message: 'Invitation sent' })
  } catch (error) {
    console.error('Error in POST /api/workspaces/[workspaceId]/members:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
