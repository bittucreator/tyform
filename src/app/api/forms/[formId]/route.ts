import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// GET - Get a single form by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const supabase = await createClient()
    const { formId } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('user_id', user.id)
      .single()

    if (error || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Error in GET /api/forms/[formId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update a form
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const supabase = await createClient()
    const adminClient = getAdminClient()
    const { formId } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: existingForm } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('user_id', user.id)
      .single()

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, fields, settings, is_published, theme } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (fields !== undefined) updateData.fields = fields
    if (settings !== undefined) updateData.settings = settings
    if (is_published !== undefined) updateData.is_published = is_published
    if (theme !== undefined) updateData.theme = theme

    const { data: form, error } = await adminClient
      .from('forms')
      .update(updateData)
      .eq('id', formId)
      .select()
      .single()

    if (error) {
      console.error('Error updating form:', error)
      return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error('Error in PATCH /api/forms/[formId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update a form (alias for PATCH)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ formId: string }> }
) {
  return PATCH(request, context)
}

// DELETE - Delete a form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const supabase = await createClient()
    const adminClient = getAdminClient()
    const { formId } = await params
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify ownership
    const { data: existingForm } = await supabase
      .from('forms')
      .select('id')
      .eq('id', formId)
      .eq('user_id', user.id)
      .single()

    if (!existingForm) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const { error } = await adminClient
      .from('forms')
      .delete()
      .eq('id', formId)

    if (error) {
      console.error('Error deleting form:', error)
      return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/forms/[formId]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
