import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

function getSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    
    const {
      formId,
      startedAt,
      questionTimes,
      dropOffQuestionId,
      isComplete,
      device,
      browser,
      os,
      country,
      city,
      region,
      latitude,
      longitude,
    } = body
    
    if (!formId) {
      return NextResponse.json({ error: 'Missing formId' }, { status: 400 })
    }
    
    // Store partial/drop-off submission
    const { error } = await supabase
      .from('responses')
      .insert({
        form_id: formId,
        answers: {}, // No answers for drop-off tracking
        metadata: {
          startedAt,
          completedAt: new Date().toISOString(),
          questionTimes: questionTimes || {},
          dropOffQuestionId,
          isComplete: isComplete ?? false,
          device,
          browser,
          os,
          country,
          city,
          region,
          latitude,
          longitude,
          isDropOff: true, // Flag to identify drop-off records
        },
      })
    
    if (error) {
      console.error('Error saving drop-off data:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Drop-off API error:', error)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
