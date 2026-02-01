import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface TeamInvitation {
  id: string
  email: string
  inviter_id: string
  workspace_id: string | null
  role: string
  token: string
  status: string
  expires_at: string
  email_sent: boolean
  email_sent_at: string | null
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
  updated_at: string
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Find the invitation
    const { data: invitationData, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (error || !invitationData) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 })
    }

    const invitation = invitationData as unknown as TeamInvitation

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 })
    }

    // Check if invitation was already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'Invitation has already been accepted' }, { status: 400 })
    }

    // Get inviter info
    const { data: inviter } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', invitation.inviter_id)
      .single()

    // If no profile, try to get from auth
    let inviterName = inviter?.full_name || inviter?.email?.split('@')[0]
    if (!inviterName) {
      // Fall back to a generic name
      inviterName = 'A team member'
    }

    // Get workspace name if workspace_id exists
    let workspaceName = `${inviterName}'s Workspace`
    if (invitation.workspace_id) {
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', invitation.workspace_id)
        .single() as { data: { name: string } | null }
      if (workspace?.name) {
        workspaceName = workspace.name
      }
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        inviterName,
        workspaceName,
        expiresAt: invitation.expires_at,
      },
    })

  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to accept the invitation' }, { status: 401 })
    }

    // Find the invitation
    const { data: invitationData, error: fetchError } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (fetchError || !invitationData) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 })
    }

    const invitation = invitationData as unknown as TeamInvitation

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 })
    }

    // Check if invitation was already accepted
    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'Invitation has already been accepted' }, { status: 400 })
    }

    // Verify the email matches (optional - can be removed for flexibility)
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json({ 
        error: `This invitation was sent to ${invitation.email}. Please sign in with that email address.` 
      }, { status: 403 })
    }

    // Add user to workspace_members if workspace_id exists
    if (invitation.workspace_id) {
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: invitation.workspace_id,
          user_id: user.id,
          role: invitation.role,
        } as never)

      if (memberError) {
        // Check if already a member
        if (memberError.code === '23505') {
          // Already a member, just mark invitation as accepted
        } else {
          console.error('Failed to add workspace member:', memberError)
          return NextResponse.json({ error: 'Failed to join workspace' }, { status: 500 })
        }
      }
    } else {
      // Legacy: Add user to team_members for backwards compatibility
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          email: user.email?.toLowerCase(),
          workspace_owner_id: invitation.inviter_id,
          role: invitation.role,
          invited_by: invitation.inviter_id,
          joined_at: new Date().toISOString(),
        } as never)

      if (memberError) {
        console.error('Failed to add team member:', memberError)
        return NextResponse.json({ error: 'Failed to join workspace' }, { status: 500 })
      }
    }

    // Update invitation status
    await supabase
      .from('team_invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: user.id,
      } as never)
      .eq('id', invitation.id)

    return NextResponse.json({
      success: true,
      message: 'You have successfully joined the workspace!',
    })

  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
