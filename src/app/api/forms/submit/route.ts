import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { triggerWebhooks } from '@/lib/webhooks'
import { sendFormNotifications } from '@/lib/form-notifications'
import type { Form, Response as FormResponse, Json } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { formId, answers, metadata } = body as {
      formId: string
      answers: Record<string, Json>
      metadata?: Record<string, unknown>
    }
    
    if (!formId) {
      return NextResponse.json({ error: 'Missing formId' }, { status: 400 })
    }
    
    // Get the form to check settings and webhooks
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single()
    
    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }
    
    const formData = form as Form
    
    // Check if form is published
    if (!formData.is_published) {
      return NextResponse.json({ error: 'Form is not published' }, { status: 403 })
    }
    
    // Get IP address for duplicate detection
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check for duplicate submissions if enabled
    if (formData.settings.preventDuplicates && ip !== 'unknown') {
      const { data: existingResponses } = await supabase
        .from('responses')
        .select('id')
        .eq('form_id', formId)
        .contains('metadata', { ip })
        .limit(1)
      
      if (existingResponses && existingResponses.length > 0) {
        return NextResponse.json({ 
          error: 'You have already submitted this form',
          code: 'DUPLICATE_SUBMISSION'
        }, { status: 409 })
      }
    }
    
    // Insert the response
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        form_id: formId,
        answers,
        metadata: {
          ...metadata,
          ip,
        },
      })
      .select()
      .single()
    
    if (responseError) {
      console.error('Response insert error:', responseError)
      return NextResponse.json({ error: 'Failed to save response' }, { status: 500 })
    }
    
    // Trigger webhooks asynchronously (don't wait for them)
    if (formData.settings.webhooks && formData.settings.webhooks.length > 0) {
      // Fire and forget - don't await
      triggerWebhooks(formData, response as FormResponse, 'response.created')
        .catch((err) => console.error('Webhook error:', err))
    }
    
    // Send email notifications asynchronously
    if (formData.settings.emailNotifications?.enabled || formData.settings.responderEmail?.enabled) {
      // Fire and forget - don't await
      sendFormNotifications(formData, response as FormResponse)
        .catch((err) => console.error('Email notification error:', err))
    }
    
    return NextResponse.json({
      success: true,
      responseId: (response as FormResponse).id,
    })
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
