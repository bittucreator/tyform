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

// GET - List all forms for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    let query = supabase
      .from('forms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId)
    }

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    if (status === 'published') {
      query = query.eq('is_published', true)
    } else if (status === 'draft') {
      query = query.eq('is_published', false)
    }

    const { data: forms, error } = await query

    if (error) {
      console.error('Error fetching forms:', error)
      return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 })
    }

    return NextResponse.json({ forms })
  } catch (error) {
    console.error('Error in GET /api/forms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new form
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, workspaceId } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Form title is required' }, { status: 400 })
    }

    const adminClient = getAdminClient()

    const formData: Record<string, unknown> = {
      title: title.trim(),
      user_id: user.id,
      fields: [],
      is_published: false,
    }

    if (workspaceId) {
      formData.workspace_id = workspaceId
    }

    const { data: form, error } = await adminClient
      .from('forms')
      .insert(formData)
      .select()
      .single()

    if (error) {
      console.error('Error creating form:', error)
      return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
    }

    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/forms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
