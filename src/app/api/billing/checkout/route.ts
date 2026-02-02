import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

// Helper to get Dodo API base URL
function getDodoBaseUrl(): string {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT
  return env === 'live_mode' 
    ? 'https://live.dodopayments.com' 
    : 'https://test.dodopayments.com'
}

// Helper to get product ID from environment
function getProductId(plan: string, billingCycle: string): string | null {
  if (plan === 'pro') {
    if (billingCycle === 'monthly') {
      return process.env.DODO_PRODUCT_PRO_MONTHLY || null
    }
    if (billingCycle === 'yearly') {
      return process.env.DODO_PRODUCT_PRO_YEARLY || null
    }
  }
  if (plan === 'business') {
    if (billingCycle === 'monthly') {
      return process.env.DODO_PRODUCT_BUSINESS_MONTHLY || null
    }
    if (billingCycle === 'yearly') {
      return process.env.DODO_PRODUCT_BUSINESS_YEARLY || null
    }
  }
  return null
}

// POST - Create a checkout session for upgrading plan
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan, billingCycle, workspaceId } = await request.json()

    if (!plan || !['pro', 'business'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 })
    }

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

    // Get product ID based on plan and billing cycle
    const productId = getProductId(plan, billingCycle)
    if (!productId) {
      return NextResponse.json({ 
        error: 'Product not configured. Please set DODO_PRODUCT_PRO_MONTHLY and DODO_PRODUCT_PRO_YEARLY environment variables.',
      }, { status: 501 })
    }

    // Get user profile for customer info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Get workspace info
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('name, slug')
      .eq('id', workspaceId)
      .single() as { data: { name: string; slug: string } | null }

    // Build the return URL
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tyform.com'}/billing?checkout=success`

    // Create checkout session with Dodo Payments API
    // Docs: https://docs.dodopayments.com/api-reference/checkout-sessions/create
    const checkoutResponse = await fetch(`${getDodoBaseUrl()}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_cart: [
          {
            product_id: productId,
            quantity: 1,
          },
        ],
        customer: {
          email: profile?.email || user.email,
          name: profile?.full_name || user.email?.split('@')[0] || 'Customer',
        },
        return_url: returnUrl,
        metadata: {
          user_id: user.id,
          workspace_id: workspaceId,
          plan,
          billing_cycle: billingCycle,
        },
      }),
    })

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text()
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { rawError: errorText }
      }
      console.error('Dodo Payments checkout error:', {
        status: checkoutResponse.status,
        statusText: checkoutResponse.statusText,
        error: errorData,
      })
      return NextResponse.json({ 
        error: 'Failed to create checkout session',
        details: errorData,
        status: checkoutResponse.status,
      }, { status: 500 })
    }

    const checkoutData = await checkoutResponse.json()
    
    console.log('Checkout session created:', { 
      plan, 
      billingCycle, 
      workspaceId, 
      userId: user.id,
      sessionId: checkoutData.session_id,
      checkoutUrl: checkoutData.checkout_url,
    })
    
    return NextResponse.json({ 
      url: checkoutData.checkout_url,
      sessionId: checkoutData.session_id,
    })
  } catch (error) {
    console.error('Error in POST /api/billing/checkout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Static checkout redirect for quick upgrades
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const workspaceId = searchParams.get('workspaceId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Payment provider not configured',
      }, { status: 501 })
    }

    // Get user profile for prefilling
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // Build checkout URL with query params for static checkout
    const checkoutUrl = new URL(`${getDodoBaseUrl()}/checkout`)
    checkoutUrl.searchParams.set('product_id', productId)
    checkoutUrl.searchParams.set('email', profile?.email || user.email || '')
    if (profile?.full_name) {
      checkoutUrl.searchParams.set('full_name', profile.full_name)
    }
    if (workspaceId) {
      checkoutUrl.searchParams.set('metadata_workspace_id', workspaceId)
      checkoutUrl.searchParams.set('metadata_user_id', user.id)
    }
    
    return NextResponse.redirect(checkoutUrl.toString())
  } catch (error) {
    console.error('Error in GET /api/billing/checkout:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
