import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Middleware to verify API key and get workspace
export async function verifyApiKey(request: Request) {
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

  // Find the API key
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

// GET /api/v1/forms - List all forms
export async function GET(request: Request) {
  const auth = await verifyApiKey(request)
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const adminClient = createAdminClient()

  const { data: forms, error } = await adminClient
    .from('forms')
    .select('*')
    .eq('workspace_id', auth.workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json({ error: 'Failed to fetch forms', details: error.message }, { status: 500 })
  }

  // Map is_published to status for API consumers
  const formsWithStatus = forms?.map(form => ({
    id: form.id,
    title: form.title,
    description: form.description,
    status: form.is_published ? 'published' : 'draft',
    created_at: form.created_at,
    updated_at: form.updated_at,
  }))

  return NextResponse.json({ 
    data: formsWithStatus,
    meta: {
      total: forms?.length || 0,
    }
  })
}

// POST /api/v1/forms - Create a new form
export async function POST(request: Request) {
  const auth = await verifyApiKey(request)
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const { title, description, fields } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: form, error } = await adminClient
      .from('forms')
      .insert({
        workspace_id: auth.workspaceId,
        title,
        description: description || '',
        fields: fields || [],
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating form:', error)
      return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
    }

    return NextResponse.json({ data: form }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
