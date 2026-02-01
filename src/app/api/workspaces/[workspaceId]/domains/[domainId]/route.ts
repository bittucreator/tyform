import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { removeDomainFromVercel, isVercelConfigured } from '@/lib/vercel'

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

    // Get domain name before deleting (for Vercel removal)
    const { data: domain } = await adminClient
        .from('workspace_domains')
        .select('domain')
        .eq('id', domainId)
        .eq('workspace_id', workspaceId)
        .single()

    // Delete the domain from database
    const { error } = await adminClient
        .from('workspace_domains')
        .delete()
        .eq('id', domainId)
        .eq('workspace_id', workspaceId)

    if (error) {
        console.error('Error deleting domain:', error)
        return NextResponse.json({ error: 'Failed to delete domain' }, { status: 500 })
    }

    // Remove domain from Vercel
    if (domain && isVercelConfigured()) {
        const vercelResult = await removeDomainFromVercel(domain.domain)
        if (!vercelResult.success) {
            console.error('Failed to remove domain from Vercel:', vercelResult.error)
            // Don't fail - domain is already deleted from our DB
        }
    }

    return NextResponse.json({ success: true })
}
