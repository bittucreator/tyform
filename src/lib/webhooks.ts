import { createHmac } from 'crypto'
import type { Form, Response, Webhook, WebhookLogInsert } from '@/types/database'
import { createAdminClient } from '@/lib/supabase/admin'

interface WebhookPayload {
  event: 'response.created' | 'response.updated'
  timestamp: string
  form: {
    id: string
    title: string
  }
  response: {
    id: string
    answers: Record<string, unknown>
    submitted_at: string
  }
}

interface WebhookResult {
  success: boolean
  statusCode?: number
  error?: string
  durationMs?: number
  responseBody?: string
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex')
}

/**
 * Send webhook to a single endpoint
 */
async function sendWebhook(
  webhook: Webhook,
  payload: WebhookPayload
): Promise<WebhookResult> {
  const startTime = Date.now()
  
  try {
    const body = JSON.stringify(payload)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Tyform-Webhook/1.0',
      'X-Webhook-Event': payload.event,
      'X-Webhook-Timestamp': payload.timestamp,
      ...webhook.headers,
    }
    
    // Add signature if secret is configured
    if (webhook.secret) {
      headers['X-Webhook-Signature'] = generateSignature(body, webhook.secret)
    }
    
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body,
    })
    
    // Try to get response body (truncate if too long)
    let responseBody: string | undefined
    try {
      const text = await response.text()
      responseBody = text.length > 1000 ? text.substring(0, 1000) + '...' : text
    } catch {
      // Ignore response body read errors
    }
    
    return {
      success: response.ok,
      statusCode: response.status,
      durationMs: Date.now() - startTime,
      responseBody,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    }
  }
}

/**
 * Log webhook delivery to database
 */
async function logWebhookDelivery(
  formId: string,
  responseId: string,
  webhook: Webhook,
  event: string,
  payload: WebhookPayload,
  result: WebhookResult
): Promise<void> {
  try {
    const adminClient = createAdminClient()
    
    const logEntry: WebhookLogInsert = {
      form_id: formId,
      response_id: responseId,
      webhook_id: webhook.id,
      webhook_url: webhook.url,
      event_type: event,
      status: result.success ? 'success' : 'failed',
      status_code: result.statusCode || null,
      request_body: payload as unknown as Record<string, unknown>,
      response_body: result.responseBody || null,
      error_message: result.error || null,
      duration_ms: result.durationMs || null,
      retry_count: 0,
    }
    
    const { error } = await adminClient
      .from('webhook_logs')
      .insert(logEntry)
    
    if (error) {
      console.error('Failed to log webhook delivery:', error)
    }
  } catch (err) {
    console.error('Error logging webhook delivery:', err)
  }
}

/**
 * Trigger webhooks for a form response
 */
export async function triggerWebhooks(
  form: Form,
  response: Response,
  event: 'response.created' | 'response.updated' = 'response.created'
): Promise<{ webhook: Webhook; result: WebhookResult }[]> {
  const webhooks = form.settings.webhooks || []
  const enabledWebhooks = webhooks.filter(
    (w) => w.enabled && w.events.includes(event)
  )
  
  if (enabledWebhooks.length === 0) {
    return []
  }
  
  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    form: {
      id: form.id,
      title: form.title,
    },
    response: {
      id: response.id,
      answers: response.answers,
      submitted_at: response.submitted_at,
    },
  }
  
  // Send webhooks in parallel
  const results = await Promise.all(
    enabledWebhooks.map(async (webhook) => {
      const result = await sendWebhook(webhook, payload)
      
      // Log the delivery attempt
      await logWebhookDelivery(
        form.id,
        response.id,
        webhook,
        event,
        payload,
        result
      )
      
      return { webhook, result }
    })
  )
  
  // Log results for debugging
  results.forEach(({ webhook, result }) => {
    if (!result.success) {
      console.error(`Webhook failed for ${webhook.url}:`, result.error || `Status ${result.statusCode}`)
    }
  })
  
  return results
}

/**
 * Test a webhook configuration
 */
export async function testWebhook(
  webhook: Webhook,
  formId: string,
  formTitle: string
): Promise<WebhookResult> {
  const testPayload: WebhookPayload = {
    event: 'response.created',
    timestamp: new Date().toISOString(),
    form: {
      id: formId,
      title: formTitle,
    },
    response: {
      id: 'test-response-id',
      answers: {
        'test-question': 'This is a test response',
      },
      submitted_at: new Date().toISOString(),
    },
  }
  
  return sendWebhook(webhook, testPayload)
}
