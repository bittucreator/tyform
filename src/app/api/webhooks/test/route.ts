import { NextRequest, NextResponse } from 'next/server'
import { testWebhook } from '@/lib/webhooks'
import type { Webhook } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { webhook, formId, formTitle } = body as {
      webhook: Webhook
      formId: string
      formTitle: string
    }
    
    if (!webhook?.url) {
      return NextResponse.json({ error: 'Missing webhook URL' }, { status: 400 })
    }
    
    // Validate URL
    try {
      new URL(webhook.url)
    } catch {
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 })
    }
    
    const result = await testWebhook(webhook, formId, formTitle)
    
    return NextResponse.json({
      success: result.success,
      statusCode: result.statusCode,
      error: result.error,
    })
  } catch (error) {
    console.error('Webhook test error:', error)
    return NextResponse.json({ error: 'Failed to test webhook' }, { status: 500 })
  }
}
