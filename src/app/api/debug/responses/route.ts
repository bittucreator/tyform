import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

// DEBUG ONLY - Remove in production
export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  
  // Check API key auth
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 })
  }
  
  const apiKey = authHeader.replace('Bearer ', '')
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
  
  const { data: keyData } = await supabase
    .from('api_keys')
    .select('workspace_id')
    .eq('key_hash', keyHash)
    .single()
    
  if (!keyData) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const formId = request.nextUrl.searchParams.get('formId')
  
  if (!formId) {
    return NextResponse.json({ error: 'Missing formId' }, { status: 400 })
  }

  // Get form (verify belongs to workspace)
  const { data: form } = await supabase
    .from('forms')
    .select('id, title, questions')
    .eq('id', formId)
    .eq('workspace_id', keyData.workspace_id)
    .single()

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  // Get all responses with full data
  const { data: responses, error } = await supabase
    .from('responses')
    .select('*')
    .eq('form_id', formId)
    .order('submitted_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Map question IDs to titles for easy debugging
  const questionMap = Object.fromEntries(
    form.questions.map((q: { id: string; title: string }) => [q.id, q.title])
  )

  return NextResponse.json({
    form: {
      id: form.id,
      title: form.title,
      questionMap,
    },
    responses: responses?.map(r => ({
      id: r.id,
      submitted_at: r.submitted_at,
      answers: r.answers,
      answersWithTitles: Object.fromEntries(
        Object.entries(r.answers || {}).map(([key, value]) => [
          questionMap[key] || key,
          value
        ])
      ),
      metadata: r.metadata,
    })),
    totalCount: responses?.length || 0,
  })
}
