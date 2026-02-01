import { createClient } from '@/lib/supabase/server'
import { NextResponse, NextRequest } from 'next/server'

// Dodo Payments Product IDs
const PRODUCT_IDS = {
  pro: {
    monthly: 'pdt_0NXXkfDdlkgiwCjiAXUMU', // $20/month
    yearly: 'pdt_0NXXkoKA11QWPgPagGehN',  // $200/year (20% discount)
  },
} as const

// Helper to get Dodo API base URL
function getDodoBaseUrl(): string {
  const env = process.env.DODO_PAYMENTS_ENVIRONMENT
  return env === 'live_mode' 
    ? 'https://live.dodopayments.com' 
    : 'https://test.dodopayments.com'
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

    if (!plan || plan !== 'pro') {
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
    const productId = PRODUCT_IDS[plan as keyof typeof PRODUCT_IDS]?.[billingCycle as keyof typeof PRODUCT_IDS.pro]
    if (!productId) {
      return NextResponse.json({ error: 'Invalid plan or billing cycle' }, { status: 400 })
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
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://tyform.com'}/dashboard/${workspace?.slug || workspaceId}/settings?checkout=success`

    // Create checkout session with Dodo Payments API
    const checkoutResponse = await fetch(`${getDodoBaseUrl()}/checkout_sessions`, {
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
      const errorData = await checkoutResponse.json().catch(() => ({}))
      console.error('Dodo Payments checkout error:', errorData)
      return NextResponse.json({ 
        error: 'Failed to create checkout session',
        details: errorData,
      }, { status: 500 })
    }

    const checkoutData = await checkoutResponse.json()
    
    console.log('Checkout session created:', { 
      plan, 
      billingCycle, 
      workspaceId, 
      userId: user.id,
      checkoutUrl: checkoutData.checkout_url || checkoutData.url,
    })
    
    return NextResponse.json({ 
      url: checkoutData.checkout_url || checkoutData.url,
      sessionId: checkoutData.id,
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
