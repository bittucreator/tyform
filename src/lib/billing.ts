import { createClient } from '@/lib/supabase/server'

export type SubscriptionPlan = 'trial' | 'pro'

export interface Subscription {
  id: string
  workspace_id: string
  dodo_customer_id: string | null
  dodo_subscription_id: string | null
  plan: SubscriptionPlan
  billing_cycle: 'monthly' | 'yearly' | null
  status: 'active' | 'cancelled' | 'on_hold' | 'expired' | 'failed' | 'pending' | 'trialing'
  current_period_start: string | null
  current_period_end: string | null
  cancelled_at: string | null
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

// Plan limits for features
export const PLAN_LIMITS = {
  trial: {
    forms: Infinity,
    responsesPerMonth: Infinity,
    teamMembers: 5,
    customDomains: 1,
    apiAccess: true,
    branding: false, // No branding during trial
    analytics: 'advanced',
    fileUploads: true,
    webhooks: true,
  },
  pro: {
    forms: Infinity,
    responsesPerMonth: Infinity,
    teamMembers: Infinity,
    customDomains: Infinity,
    apiAccess: true,
    branding: false, // No branding
    analytics: 'advanced',
    fileUploads: true,
    webhooks: true,
  },
} as const

// Pricing in cents
export const PLAN_PRICING = {
  pro: {
    monthly: 2000, // $20/month
    yearly: 20000, // $200/year (saves $40 - 17% off)
  },
} as const

// Dodo Payments Product IDs
export const PRODUCT_IDS = {
  pro: {
    monthly: 'pdt_0NXXkfDdlkgiwCjiAXUMU', // Pro $20/month
    yearly: 'pdt_0NXXkoKA11QWPgPagGehN',  // Pro $200/year
  },
} as const

/**
 * Get subscription for a workspace
 */
export async function getWorkspaceSubscription(workspaceId: string): Promise<Subscription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .single()
  
  if (error || !data) {
    // If no subscription found, return null (no subscription yet)
    return null
  }
  
  return data as Subscription
}

/**
 * Check if a workspace has an active subscription
 */
export async function hasActiveSubscription(workspaceId: string): Promise<boolean> {
  const subscription = await getWorkspaceSubscription(workspaceId)
  if (!subscription) return false
  return subscription.status === 'active' || subscription.status === 'trialing'
}

/**
 * Check if a workspace has access to a feature (requires Pro subscription)
 */
export async function hasFeatureAccess(
  workspaceId: string, 
  feature: keyof typeof PLAN_LIMITS.trial
): Promise<boolean> {
  const subscription = await getWorkspaceSubscription(workspaceId)
  
  if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
    return false // No access without subscription
  }
  
  const planLimits = PLAN_LIMITS[subscription.plan]
  if (!planLimits) return false
  
  return planLimits[feature] as boolean
}

/**
 * Get the limit for a feature for a workspace
 */
export async function getFeatureLimit(
  workspaceId: string,
  feature: keyof typeof PLAN_LIMITS.trial
): Promise<number | boolean | string | null> {
  const subscription = await getWorkspaceSubscription(workspaceId)
  
  if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trialing')) {
    return null // No access
  }
  
  const planLimits = PLAN_LIMITS[subscription.plan]
  if (!planLimits) return null
  
  return planLimits[feature]
}

/**
 * Check if subscription is active (not cancelled, expired, or failed)
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
  return subscription.status === 'active'
}

/**
 * Check if subscription is in trial period
 */
export function isInTrial(subscription: Subscription): boolean {
  if (!subscription.trial_ends_at) return false
  return new Date(subscription.trial_ends_at) > new Date()
}

/**
 * Get days until subscription expires
 */
export function getDaysUntilExpiry(subscription: Subscription): number | null {
  if (!subscription.current_period_end) return null
  
  const endDate = new Date(subscription.current_period_end)
  const now = new Date()
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}
