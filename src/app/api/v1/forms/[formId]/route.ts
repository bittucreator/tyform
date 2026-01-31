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

// GET /api/v1/forms/:formId - Get form details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const auth = await verifyApiKey(request)
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { formId } = await params
  const adminClient = createAdminClient()

  const { data: form, error } = await adminClient
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('workspace_id', auth.workspaceId)
    .single()

  if (error || !form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  return NextResponse.json({ data: form })
}

// PATCH /api/v1/forms/:formId - Update a form
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const auth = await verifyApiKey(request)
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { formId } = await params

  try {
    const body = await request.json()
    const { title, description, fields, status } = body

    const adminClient = createAdminClient()

    // Verify form belongs to workspace
    const { data: existingForm } = await adminClient
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('workspace_id', auth.workspaceId)
      .single()

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (fields !== undefined) updateData.fields = fields
    if (status !== undefined) {
      updateData.status = status
      if (status === 'published') {
        updateData.published_at = new Date().toISOString()
      }
    }

    const { data: form, error } = await adminClient
      .from('forms')
      .update(updateData)
      .eq('id', formId)
      .eq('workspace_id', auth.workspaceId)
      .select()
      .single()

    if (error) {
      console.error('Error updating form:', error)
      return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
    }

    return NextResponse.json({ data: form })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

// DELETE /api/v1/forms/:formId - Delete a form
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ formId: string }> }
) {
  const auth = await verifyApiKey(request)
  
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { formId } = await params
  const adminClient = createAdminClient()

  // Verify form belongs to workspace
  const { data: existingForm } = await adminClient
    .from('forms')
    .select('id')
    .eq('id', formId)
    .eq('workspace_id', auth.workspaceId)
    .single()

  if (!existingForm) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  const { error } = await adminClient
    .from('forms')
    .delete()
    .eq('id', formId)
    .eq('workspace_id', auth.workspaceId)

  if (error) {
    console.error('Error deleting form:', error)
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
