import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper to get Dodo API base URL
function getDodoBaseUrl(): string {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT
  return env === 'live_mode' 
    ? 'https://live.dodopayments.com' 
    : 'https://test.dodopayments.com'
}

// POST - Create a billing portal session for managing subscription
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
        error: 'Payment provider not configured. Please set up Dodo Payments API key.',
      }, { status: 501 })
    }

    // Get subscription with Dodo customer ID
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('dodo_customer_id, plan, status')
      .eq('workspace_id', workspaceId)
      .single() as { data: { dodo_customer_id: string | null; plan: string; status: string } | null; error: unknown }

    if (subError || !subscription) {
      return NextResponse.json({ error: 'No subscription found for this workspace' }, { status: 404 })
    }

    if (!subscription.dodo_customer_id) {
      // No customer yet - they haven't completed a purchase
      return NextResponse.json({ 
        error: 'No billing information found. Please subscribe to a plan first.',
        plan: subscription.plan,
      }, { status: 404 })
    }

    // Create customer portal session with Dodo Payments
    const portalResponse = await fetch(`${getDodoBaseUrl()}/customer_portal/session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: subscription.dodo_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tyform.com'}/dashboard`,
      }),
    })

    if (!portalResponse.ok) {
      const errorData = await portalResponse.json().catch(() => ({}))
      console.error('Dodo Payments portal error:', errorData)
      return NextResponse.json({ 
        error: 'Failed to create billing portal session',
        details: errorData,
      }, { status: 500 })
    }

    const portalData = await portalResponse.json()

    console.log('Billing portal session created for:', { 
      workspaceId, 
      userId: user.id,
      customerId: subscription.dodo_customer_id,
    })
    
    return NextResponse.json({ 
      url: portalData.url || portalData.portal_url,
    })
  } catch (error) {
    console.error('Error in POST /api/billing/portal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Redirect to billing portal
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')
    const sendEmail = searchParams.get('send_email')

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Payment provider not configured',
      }, { status: 501 })
    }

    // Create customer portal session
    const portalResponse = await fetch(`${getDodoBaseUrl()}/customer_portal/session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
        send_email: sendEmail === 'true',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tyform.com'}/dashboard`,
      }),
    })

    if (!portalResponse.ok) {
      return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 })
    }

    const portalData = await portalResponse.json()
    
    return NextResponse.redirect(portalData.url || portalData.portal_url)
  } catch (error) {
    console.error('Error in GET /api/billing/portal:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
