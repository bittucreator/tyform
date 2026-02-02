import { createClient } from '@supabase/supabase-js'
import { NextResponse, NextRequest } from 'next/server'
import crypto from 'crypto'

// Define our own WebhookPayload type
interface WebhookPayload {
  type: string
  data: Record<string, unknown>
}

// Create admin client for webhook operations (bypasses RLS)
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Verify webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

// Helper to extract metadata from payload
function getMetadata(payload: WebhookPayload): Record<string, string> {
  try {
    // Access metadata from the payload data
    const data = payload.data as Record<string, unknown>
    return (data?.metadata as Record<string, string>) || {}
  } catch {
    return {}
  }
}

// Helper to get customer info from payload
function getCustomerInfo(payload: WebhookPayload): { customerId?: string; email?: string } {
  try {
    const data = payload.data as Record<string, unknown>
    const customer = data?.customer as Record<string, unknown>
    
    // Dodo sends customer.customer_id in subscription webhooks
    const customerId = 
      customer?.customer_id as string ||  // subscription.active has customer.customer_id
      data?.customer_id as string ||       // some events might have it at top level
      customer?.id as string
    
    console.log('Extracting customer info:', { 
      customerObject: customer,
      extractedId: customerId 
    })
    
    return {
      customerId,
      email: customer?.email as string || data?.email as string,
    }
  } catch {
    return {}
  }
}

// Helper to get subscription info from payload
function getSubscriptionInfo(payload: WebhookPayload): { 
  subscriptionId?: string
  status?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
} {
  try {
    const data = payload.data as Record<string, unknown>
    return {
      subscriptionId: data?.subscription_id as string || data?.id as string,
      status: data?.status as string,
      currentPeriodStart: data?.current_period_start as string,
      currentPeriodEnd: data?.current_period_end as string,
    }
  } catch {
    return {}
  }
}

// Helper to get payment info from payload
function getPaymentInfo(payload: WebhookPayload): {
  paymentId?: string
  amount?: number
  currency?: string
  status?: string
} {
  try {
    const data = payload.data as Record<string, unknown>
    return {
      paymentId: data?.payment_id as string || data?.id as string,
      amount: data?.amount as number,
      currency: data?.currency as string,
      status: data?.status as string,
    }
  } catch {
    return {}
  }
}

// Handle subscription becoming active (new subscription or renewal)
async function handleSubscriptionActive(payload: WebhookPayload) {
  const supabase = getAdminClient()
  const metadata = getMetadata(payload)
  const customer = getCustomerInfo(payload)
  const subscription = getSubscriptionInfo(payload)

  const workspaceId = metadata.workspace_id
  const plan = metadata.plan || 'pro'
  const billingCycle = metadata.billing_cycle || 'monthly'

  console.log('Subscription active webhook - Full payload:', JSON.stringify(payload, null, 2))
  console.log('Subscription active webhook - Extracted data:', { 
    workspaceId, 
    plan, 
    billingCycle,
    customerId: customer.customerId,
    subscriptionId: subscription.subscriptionId,
    metadata,
  })

  if (!workspaceId) {
    console.error('No workspace_id in subscription metadata')
    return
  }

  if (!customer.customerId) {
    console.error('No customer_id found in webhook payload')
  }

  // Upsert subscription record
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      workspace_id: workspaceId,
      dodo_customer_id: customer.customerId,
      dodo_subscription_id: subscription.subscriptionId,
      plan,
      billing_cycle: billingCycle,
      status: 'active',
      current_period_start: subscription.currentPeriodStart,
      current_period_end: subscription.currentPeriodEnd,
      metadata: metadata,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'workspace_id',
    })

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }

  console.log('Subscription activated for workspace:', workspaceId)
}

// Handle subscription renewal
async function handleSubscriptionRenewed(payload: WebhookPayload) {
  const supabase = getAdminClient()
  const subscription = getSubscriptionInfo(payload)

  console.log('Subscription renewed:', subscription.subscriptionId)

  if (!subscription.subscriptionId) return

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      current_period_start: subscription.currentPeriodStart,
      current_period_end: subscription.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription.subscriptionId)

  if (error) {
    console.error('Error updating renewed subscription:', error)
    throw error
  }
}

// Handle subscription on hold
async function handleSubscriptionOnHold(payload: WebhookPayload) {
  const supabase = getAdminClient()
  const subscription = getSubscriptionInfo(payload)

  console.log('Subscription on hold:', subscription.subscriptionId)

  if (!subscription.subscriptionId) return

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'on_hold',
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription.subscriptionId)

  if (error) {
    console.error('Error updating subscription to on_hold:', error)
    throw error
  }
}

// Handle subscription cancelled
async function handleSubscriptionCancelled(payload: WebhookPayload) {
  const supabase = getAdminClient()
  const subscription = getSubscriptionInfo(payload)

  console.log('Subscription cancelled:', subscription.subscriptionId)

  if (!subscription.subscriptionId) return

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription.subscriptionId)

  if (error) {
    console.error('Error updating subscription to cancelled:', error)
    throw error
  }
}

// Handle subscription failed
async function handleSubscriptionFailed(payload: WebhookPayload) {
  const supabase = getAdminClient()
  const subscription = getSubscriptionInfo(payload)

  console.log('Subscription failed:', subscription.subscriptionId)

  if (!subscription.subscriptionId) return

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription.subscriptionId)

  if (error) {
    console.error('Error updating subscription to failed:', error)
    throw error
  }
}

// Handle subscription expired
async function handleSubscriptionExpired(payload: WebhookPayload) {
  const supabase = getAdminClient()
  const subscription = getSubscriptionInfo(payload)

  console.log('Subscription expired:', subscription.subscriptionId)

  if (!subscription.subscriptionId) return

  // Downgrade to free plan
  const { error } = await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'expired',
      updated_at: new Date().toISOString(),
    })
    .eq('dodo_subscription_id', subscription.subscriptionId)

  if (error) {
    console.error('Error updating subscription to expired:', error)
    throw error
  }
}

// Handle payment succeeded
async function handlePaymentSucceeded(payload: WebhookPayload) {
  const supabase = getAdminClient()
  const metadata = getMetadata(payload)
  const payment = getPaymentInfo(payload)

  const workspaceId = metadata.workspace_id

  console.log('Payment succeeded:', {
    paymentId: payment.paymentId,
    amount: payment.amount,
    workspaceId,
  })

  if (!workspaceId) return

  // Get subscription ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('workspace_id', workspaceId)
    .single()

  // Record payment in history
  const { error } = await supabase
    .from('payment_history')
    .insert({
      subscription_id: subscription?.id,
      workspace_id: workspaceId,
      dodo_payment_id: payment.paymentId,
      amount: payment.amount || 0,
      currency: payment.currency || 'USD',
      status: 'succeeded',
    })

  if (error) {
    console.error('Error recording payment:', error)
    throw error
  }
}

// Handle payment failed
async function handlePaymentFailed(payload: WebhookPayload) {
  const supabase = getAdminClient()
  const metadata = getMetadata(payload)
  const payment = getPaymentInfo(payload)

  const workspaceId = metadata.workspace_id

  console.log('Payment failed:', {
    paymentId: payment.paymentId,
    workspaceId,
  })

  if (!workspaceId) return

  // Get subscription ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('workspace_id', workspaceId)
    .single()

  // Record failed payment in history
  const { error } = await supabase
    .from('payment_history')
    .insert({
      subscription_id: subscription?.id,
      workspace_id: workspaceId,
      dodo_payment_id: payment.paymentId,
      amount: payment.amount || 0,
      currency: payment.currency || 'USD',
      status: 'failed',
    })

  if (error) {
    console.error('Error recording failed payment:', error)
  }
}

// Handle refund succeeded
async function handleRefundSucceeded(payload: WebhookPayload) {
  const supabase = getAdminClient()
  const payment = getPaymentInfo(payload)

  console.log('Refund succeeded:', payment.paymentId)

  if (!payment.paymentId) return

  // Update payment status to refunded
  const { error } = await supabase
    .from('payment_history')
    .update({ status: 'refunded' })
    .eq('dodo_payment_id', payment.paymentId)

  if (error) {
    console.error('Error updating payment to refunded:', error)
  }
}

// Event handlers map
const eventHandlers: Record<string, (payload: WebhookPayload) => Promise<void>> = {
  'subscription.active': handleSubscriptionActive,
  'subscription.renewed': handleSubscriptionRenewed,
  'subscription.on_hold': handleSubscriptionOnHold,
  'subscription.cancelled': handleSubscriptionCancelled,
  'subscription.failed': handleSubscriptionFailed,
  'subscription.expired': handleSubscriptionExpired,
  'payment.succeeded': handlePaymentSucceeded,
  'payment.failed': handlePaymentFailed,
  'refund.succeeded': handleRefundSucceeded,
}

// Export the webhook handler
export async function POST(request: NextRequest) {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY
  
  if (!webhookKey) {
    console.error('DODO_PAYMENTS_WEBHOOK_KEY not set')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-dodo-signature') || 
                      request.headers.get('dodo-signature') || ''

    // Verify signature if provided
    if (signature && !verifySignature(rawBody, signature, webhookKey)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload: WebhookPayload = JSON.parse(rawBody)
    
    console.log('Dodo webhook received:', {
      type: payload.type,
      data: payload.data,
    })

    // Route to appropriate handler
    const handler = eventHandlers[payload.type]
    if (handler) {
      await handler(payload)
    } else {
      console.log('Unhandled webhook event type:', payload.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
