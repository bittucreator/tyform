import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// POST - Track a form view
export async function POST(request: NextRequest) {
  try {
    const adminClient = getAdminClient()
    const body = await request.json()
    
    const { 
      formId, 
      visitorId, 
      event, // 'view' | 'start' | 'complete' | 'dropoff'
      dropOffQuestionId,
      timeSpentSeconds,
      metadata 
    } = body

    if (!formId) {
      return NextResponse.json({ error: 'Missing formId' }, { status: 400 })
    }

    // Get request info
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''

    // Detect device type from user agent
    let deviceType = 'desktop'
    if (/mobile/i.test(userAgent)) {
      deviceType = 'mobile'
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet'
    }

    // For 'start', 'complete', or 'dropoff' events, update existing view record
    if (event === 'start' || event === 'complete' || event === 'dropoff') {
      // Try to update existing view from same visitor
      const { data: existingView } = await adminClient
        .from('form_views')
        .select('id')
        .eq('form_id', formId)
        .eq('visitor_id', visitorId)
        .order('viewed_at', { ascending: false })
        .limit(1)
        .single()

      if (existingView) {
        const updateData: Record<string, unknown> = {}
        
        if (event === 'start') {
          updateData.started_form = true
        } else if (event === 'complete') {
          updateData.completed_form = true
          if (timeSpentSeconds) updateData.time_spent_seconds = timeSpentSeconds
        } else if (event === 'dropoff') {
          updateData.drop_off_question_id = dropOffQuestionId
          if (timeSpentSeconds) updateData.time_spent_seconds = timeSpentSeconds
        }

        await adminClient
          .from('form_views')
          .update(updateData)
          .eq('id', existingView.id)

        return NextResponse.json({ success: true, updated: true })
      }
    }

    // Insert new view record
    const { error } = await adminClient
      .from('form_views')
      .insert({
        form_id: formId,
        visitor_id: visitorId || crypto.randomUUID(),
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer,
        device_type: deviceType,
        started_form: event === 'start',
        completed_form: event === 'complete',
        drop_off_question_id: event === 'dropoff' ? dropOffQuestionId : null,
        time_spent_seconds: timeSpentSeconds || null,
        metadata: metadata || {},
      })

    if (error) {
      console.error('Form view insert error:', error)
      return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Form view tracking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
