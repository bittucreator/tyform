import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { nanoid } from 'nanoid'

interface TeamInvitation {
  id: string
  email: string
  inviter_id: string
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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, role = 'Member', workspaceId } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Check if user is a member of this workspace (and has permission to invite)
    const { data: membershipData } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    const membership = membershipData as { role: string } | null

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'You do not have permission to invite members' }, { status: 403 })
    }

    // Check if invitee is already a member by looking up their profile first
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (profileData) {
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', profileData.id)
        .single()

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a member of this workspace' }, { status: 400 })
      }
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await supabase
      .from('team_invitations')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('workspace_id', workspaceId)
      .eq('status', 'pending')
      .single()

    if (existingInvite) {
      return NextResponse.json({ error: 'An invitation has already been sent to this email' }, { status: 400 })
    }

    // Generate invitation token
    const inviteToken = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Create invitation record
    const { data: invitationData, error: inviteError } = await supabase
      .from('team_invitations')
      .insert({
        email: email.toLowerCase(),
        inviter_id: user.id,
        workspace_id: workspaceId,
        role: role.toLowerCase(),
        token: inviteToken,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      } as never)
      .select()
      .single()
    
    const invitation = invitationData as TeamInvitation | null

    if (inviteError) {
      console.error('Failed to create invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Get inviter info and workspace name
    const inviterName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Someone'
    
    // Get workspace name
    const { data: workspaceData } = await supabase
      .from('workspaces')
      .select('name')
      .eq('id', workspaceId)
      .single()
    
    const workspaceInfo = workspaceData as { name: string } | null
    const workspaceName = workspaceInfo?.name || `${inviterName}'s Workspace`

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteLink = `${baseUrl}/invite/${inviteToken}`

    // Send invitation email via Supabase
    try {
      const adminClient = createAdminClient()
      
      // Use Supabase's invite functionality which sends email via configured SMTP
      const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: inviteLink,
        data: {
          invited_to_workspace: workspaceId,
          invited_by: inviterName,
          workspace_name: workspaceName,
          role: role.toLowerCase(),
        }
      })

      if (inviteError) {
        console.error('Supabase invite error:', inviteError)
        // If user already exists, we still want to send them a notification
        // Fall back to magic link
        if (inviteError.message.includes('already registered')) {
          // User exists, send magic link instead
          const { error: magicLinkError } = await adminClient.auth.admin.generateLink({
            type: 'magiclink',
            email,
            options: {
              redirectTo: inviteLink,
            }
          })
          
          if (magicLinkError) {
            throw magicLinkError
          }
        } else {
          throw inviteError
        }
      }

      // Update invitation to mark email as sent
      await supabase
        .from('team_invitations')
        .update({ email_sent: true, email_sent_at: new Date().toISOString() } as never)
        .eq('id', invitation!.id)

    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
      // Don't fail the request - the invitation was created, just email failed
      return NextResponse.json({
        success: true,
        invitation,
        warning: 'Invitation created but email could not be sent. Please share the invite link manually.',
        inviteLink,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      invitation: {
        id: invitation!.id,
        email: invitation!.email,
        role: invitation!.role,
        expires_at: invitation!.expires_at,
      },
    })

  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all invitations sent by this user
    const { data: invitations, error } = await supabase
      .from('team_invitations')
      .select('*')
      .eq('inviter_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch invitations:', error)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invitationId } = await request.json()

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    // Delete the invitation
    const { error } = await supabase
      .from('team_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('inviter_id', user.id)

    if (error) {
      console.error('Failed to delete invitation:', error)
      return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
