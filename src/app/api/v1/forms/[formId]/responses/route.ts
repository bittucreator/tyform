import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Verify API key helper
async function verifyApiKey(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 }
  }

  const apiKey = authHeader.replace('Bearer ', '')
  
  if (!apiKey.startsWith('tf_')) {
    return { error: 'Invalid API key format', status: 401 }
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
  const adminClient = createAdminClient()

  const { data: keyData, error } = await adminClient
    .from('api_keys')
    .select('id, workspace_id')
    .eq('key_hash', keyHash)
    .single()

  if (error || !keyData) {
    return { error: 'Invalid API key', status: 401 }
  }

  // Update last used timestamp
  await adminClient
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id)

  return { workspaceId: keyData.workspace_id, keyId: keyData.id }
}

// GET /api/v1/forms/:formId/responses - Get form responses
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const auth = await verifyApiKey(request)
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { formId } = await params
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '100')
  const offset = parseInt(searchParams.get('offset') || '0')

  const adminClient = createAdminClient()

  // Verify form belongs to workspace
  const { data: form } = await adminClient
    .from('forms')
    .select('id')
    .eq('id', formId)
    .eq('workspace_id', auth.workspaceId)
    .single()

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  // Get total count
  const { count } = await adminClient
    .from('form_responses')
    .select('id', { count: 'exact', head: true })
    .eq('form_id', formId)

  // Get responses
  const { data: responses, error } = await adminClient
    .from('form_responses')
    .select('id, data, created_at, updated_at')
    .eq('form_id', formId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })
  }

  return NextResponse.json({ 
    data: responses,
    meta: {
      total: count || 0,
      limit,
      offset,
    }
  })
}
