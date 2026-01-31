import { createHmac } from 'crypto'
import type { Form, Response, Webhook } from '@/types/database'

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
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
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
    
    return {
      success: response.ok,
      statusCode: response.status,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Trigger webhooks for a form response
 */
export async function triggerWebhooks(
  form: Form,
  response: Response,
  event: 'response.created' | 'response.updated' = 'response.created'
): Promise<{ webhook: Webhook; result: Awaited<ReturnType<typeof sendWebhook>> }[]> {
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
    enabledWebhooks.map(async (webhook) => ({
      webhook,
      result: await sendWebhook(webhook, payload),
    }))
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
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
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
