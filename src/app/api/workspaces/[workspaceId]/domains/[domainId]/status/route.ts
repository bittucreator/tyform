import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getDomainStatus, isVercelConfigured } from '@/lib/vercel'

// GET /api/workspaces/:workspaceId/domains/:domainId/status - Get domain SSL/config status
export async function GET(
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

    // Verify user has access to workspace
    const { data: member } = await adminClient
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

    if (!member) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get the domain
    const { data: domain, error: domainError } = await adminClient
        .from('workspace_domains')
        .select('domain, status')
        .eq('id', domainId)
        .eq('workspace_id', workspaceId)
        .single()

    if (domainError || !domain) {
        return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    // Check if Vercel is configured
    if (!isVercelConfigured()) {
        return NextResponse.json({
            domainStatus: domain.status,
            vercelConfigured: false,
            sslReady: domain.status === 'verified', // Assume ready if verified without Vercel check
        })
    }

    // Get Vercel status
    const vercelStatus = await getDomainStatus(domain.domain)

    return NextResponse.json({
        domainStatus: domain.status,
        vercelConfigured: true,
        configured: vercelStatus.configured,
        verified: vercelStatus.verified,
        misconfigured: vercelStatus.misconfigured,
        sslReady: vercelStatus.sslReady,
        error: vercelStatus.error,
    })
}
