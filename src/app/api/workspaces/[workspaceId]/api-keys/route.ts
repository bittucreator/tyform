import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// GET - List all API keys for a workspace
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

    // Get all API keys for this workspace
    const { data: apiKeys, error } = await adminClient
      .from('api_keys')
      .select('id, name, key_prefix, created_at, last_used_at')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
    }

    // Transform API keys - mask the full key, only show prefix
    const transformedKeys = apiKeys?.map(key => ({
      id: key.id,
      name: key.name,
      key: `${key.key_prefix}${'•'.repeat(32)}`, // Show prefix with masked rest
      created_at: key.created_at,
      last_used: key.last_used_at,
    })) || []

    return NextResponse.json({ apiKeys: transformedKeys })
  } catch (error) {
    console.error('Error in GET /api/workspaces/[workspaceId]/api-keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new API key
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

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
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
      return NextResponse.json({ error: 'Only admins can create API keys' }, { status: 403 })
    }

    // Generate a secure API key
    const apiKey = `tf_${crypto.randomBytes(32).toString('hex')}`
    const keyPrefix = apiKey.slice(0, 12) // Store prefix for display
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

    // Insert the API key
    const { data: newKey, error } = await adminClient
      .from('api_keys')
      .insert({
        workspace_id: workspaceId,
        name,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        created_by: user.id,
      })
      .select('id, name, key_prefix, created_at')
      .single()

    if (error) {
      console.error('Error creating API key:', error)
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    // Return the full API key only once (on creation)
    return NextResponse.json({ 
      apiKey: {
        id: newKey.id,
        name: newKey.name,
        key: apiKey, // Full key - only shown once!
        created_at: newKey.created_at,
      }
    })
  } catch (error) {
    console.error('Error in POST /api/workspaces/[workspaceId]/api-keys:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
