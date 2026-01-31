import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import dns from 'dns'
import { promisify } from 'util'

const resolveCname = promisify(dns.resolveCname)
const resolveTxt = promisify(dns.resolveTxt)

const EXPECTED_CNAME = 'cname.tyform.com'
const TXT_RECORD_NAME = '_tyform'

// POST /api/workspaces/:workspaceId/domains/:domainId/verify - Verify domain DNS
export async function POST(
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
        .select('*')
        .eq('id', domainId)
        .eq('workspace_id', workspaceId)
        .single()

    if (domainError || !domain) {
        return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    let cnameValid = false
    let txtValid = false

    // Check CNAME record
    try {
        const records = await resolveCname(domain.domain)
        cnameValid = records.some(record => 
            record.toLowerCase() === EXPECTED_CNAME || 
            record.toLowerCase().endsWith('.' + EXPECTED_CNAME)
        )
    } catch {
        // CNAME not found
    }

    // Check TXT record at _tyform.{domain}
    try {
        const txtDomain = `${TXT_RECORD_NAME}.${domain.domain}`
        const records = await resolveTxt(txtDomain)
        const flatRecords = records.map(r => r.join(''))
        txtValid = flatRecords.some(record => record === domain.verification_token)
    } catch {
        // TXT not found
    }

    // Require TXT record for verification (proves ownership)
    const status: 'verified' | 'failed' = txtValid ? 'verified' : 'failed'
    const verified_at = txtValid ? new Date().toISOString() : null

    // Update domain status
    const { error: updateError } = await adminClient
        .from('workspace_domains')
        .update({ 
            status, 
            verified_at,
            last_verified_at: new Date().toISOString()
        })
        .eq('id', domainId)

    if (updateError) {
        console.error('Error updating domain status:', updateError)
        return NextResponse.json({ error: 'Failed to update domain' }, { status: 500 })
    }

    return NextResponse.json({ 
        status, 
        verified_at,
        details: {
            cname: { valid: cnameValid, expected: EXPECTED_CNAME },
            txt: { valid: txtValid, recordName: `${TXT_RECORD_NAME}.${domain.domain}` }
        }
    })
}
