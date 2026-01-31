import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// DELETE /api/workspaces/:workspaceId/domains/:domainId - Remove a domain
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ workspaceId: string; domainId: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId, domainId } = await params
    const adminClient = createAdminClient()

    // Verify user is admin or owner
    const { data: member } = await adminClient
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

    if (!member || !['owner', 'admin'].includes(member.role)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Delete the domain
    const { error } = await adminClient
        .from('workspace_domains')
        .delete()
        .eq('id', domainId)
        .eq('workspace_id', workspaceId)

    if (error) {
        console.error('Error deleting domain:', error)
        return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
