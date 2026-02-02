import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper to get Dodo API base URL
function getDodoBaseUrl(): string {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT
  return env === 'live_mode' 
    ? 'https://live.dodopayments.com' 
    : 'https://test.dodopayments.com'
}

// POST - Cancel a subscription (downgrade to free at end of billing period)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { workspaceId } = await request.json()

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    // Check if Dodo Payments is configured
    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Payment provider not configured.',
      }, { status: 501 })
    }

    // Get subscription with Dodo subscription ID
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, dodo_subscription_id, plan, status')
      .eq('workspace_id', workspaceId)
      .single() as { data: { id: string; dodo_subscription_id: string | null; plan: string; status: string } | null; error: unknown }

    if (subError || !subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    if (!subscription.dodo_subscription_id) {
      return NextResponse.json({ error: 'No active paid subscription found' }, { status: 400 })
    }

    if (subscription.status === 'cancelled') {
      return NextResponse.json({ error: 'Subscription is already cancelled' }, { status: 400 })
    }

    // Cancel subscription via Dodo Payments API
    const baseUrl = getDodoBaseUrl()
    const cancelResponse = await fetch(`${baseUrl}/subscriptions/${subscription.dodo_subscription_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled',
      }),
    })

    if (!cancelResponse.ok) {
      const errorData = await cancelResponse.text()
      console.error('Dodo cancel subscription error:', cancelResponse.status, errorData)
      return NextResponse.json({ 
        error: 'Failed to cancel subscription with payment provider' 
      }, { status: 500 })
    }

    // Update subscription status in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', subscription.id)

    if (updateError) {
      console.error('Failed to update subscription in database:', updateError)
      // Don't return error - subscription was cancelled in Dodo
    }

    return NextResponse.json({ 
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period'
    })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
