import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getWorkspaceSubscription, PLAN_LIMITS, PLAN_PRICING, PRODUCT_IDS } from '@/lib/billing'

// GET - Get subscription info for a workspace
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    // Verify user has access to this workspace
    const { data: membership } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const subscription = await getWorkspaceSubscription(workspaceId)
    
    if (!subscription) {
      // No subscription - user needs to subscribe
      return NextResponse.json({ 
        subscription: null,
        needsSubscription: true,
        pricing: PLAN_PRICING,
        products: PRODUCT_IDS,
        trialDays: 3,
      })
    }

    const limits = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.trial

    return NextResponse.json({ 
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        billing_cycle: subscription.billing_cycle,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancelled_at: subscription.cancelled_at,
        trial_ends_at: subscription.trial_ends_at,
        has_customer: !!subscription.dodo_customer_id,
      },
      needsSubscription: false,
      limits,
      pricing: PLAN_PRICING,
      products: PRODUCT_IDS,
    })
  } catch (error) {
    console.error('Error in GET /api/billing/subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
