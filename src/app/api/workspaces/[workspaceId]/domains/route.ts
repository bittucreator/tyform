import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// GET /api/workspaces/:workspaceId/domains - List all domains
export async function GET(
    request: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId } = await params
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

    // Get all domains for the workspace
    const { data: domains, error } = await adminClient
        .from('workspace_domains')
        .select('id, domain, status, created_at, verified_at')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching domains:', error)
        return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 })
    }

    return NextResponse.json({ domains })
}

// POST /api/workspaces/:workspaceId/domains - Add a new domain
export async function POST(
    request: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId } = await params
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

    try {
        const { domain } = await request.json()
        
        if (!domain || typeof domain !== 'string') {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
        }

        // Validate domain format
        const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i
        if (!domainRegex.test(domain)) {
            return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
        }

        // Check if domain already exists
        const { data: existingDomain } = await adminClient
            .from('workspace_domains')
            .select('id')
            .eq('domain', domain.toLowerCase())
            .single()

        if (existingDomain) {
            return NextResponse.json({ error: 'Domain is already in use' }, { status: 409 })
        }

        // Generate unique verification token
        const verificationToken = `tyform-verify-${crypto.randomBytes(16).toString('hex')}`

        // Create the domain
        const { data: newDomain, error } = await adminClient
            .from('workspace_domains')
            .insert({
                workspace_id: workspaceId,
                domain: domain.toLowerCase(),
                verification_token: verificationToken,
                status: 'pending',
                created_by: user.id,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating domain:', error)
            return NextResponse.json({ error: 'Failed to add domain' }, { status: 500 })
        }

        return NextResponse.json({ domain: newDomain }, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}
