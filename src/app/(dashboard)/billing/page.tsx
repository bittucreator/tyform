'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Lightning, Sparkle, Buildings } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PLANS, FEATURE_GROUPS, type PlanType } from '@/lib/plans'

interface Subscription {
  id?: string
  plan: string
  status: string
  billing_cycle: 'monthly' | 'yearly' | null
  current_period_end?: string
  trial_ends_at?: string
}

export default function BillingPage() {
  const searchParams = useSearchParams()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState<PlanType | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  // Handle checkout success
  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      toast.success('Payment successful! Your subscription is now active.')
      // Clean up URL
      window.history.replaceState({}, '', '/billing')
    }
  }, [searchParams])

  useEffect(() => {
    async function loadData() {
      try {
        const wsRes = await fetch('/api/workspaces')
        if (wsRes.ok) {
          const wsData = await wsRes.json()
          if (wsData.workspaces?.length > 0) {
            const ws = wsData.workspaces[0]
            setWorkspaceId(ws.id)
            
            const subRes = await fetch(`/api/billing/subscription?workspaceId=${ws.id}`)
            if (subRes.ok) {
              const subData = await subRes.json()
              setSubscription(subData.subscription)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load billing data:', error)
      } finally {
        setLoadingSubscription(false)
      }
    }
    loadData()
  }, [])

  const handleSubscribe = async (plan: PlanType) => {
    if (plan === 'free') return
    if (!workspaceId) {
      toast.error('No workspace found')
      return
    }

    setLoading(plan)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle, workspaceId }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Failed to start checkout')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  const handleManageBilling = async () => {
    if (!workspaceId) return

    setLoading('pro')
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Failed to open billing portal')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(null)
    }
  }

  const currentPlan = (subscription?.plan as PlanType) || 'free'
  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing'

  if (loadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Upgrade Section */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Do more with Tyform</h1>
          <p className="text-muted-foreground">
            Upgrade to access advanced features designed for growing teams and creators.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="flex items-center gap-3 bg-muted/50 rounded-full px-4 py-2">
            <span className={cn(
              "text-sm font-medium transition-colors cursor-pointer",
              billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
            )} onClick={() => setBillingCycle('monthly')}>
              Pay monthly
            </span>
            <Switch
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <span className={cn(
              "text-sm font-medium transition-colors cursor-pointer",
              billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'
            )} onClick={() => setBillingCycle('yearly')}>
              Pay yearly
            </span>
            <Badge className={cn(
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 transition-opacity",
              billingCycle === 'yearly' ? 'opacity-100' : 'opacity-0'
            )}>
              2 months off
            </Badge>
          </div>
        </div>

        {/* Current Plan Banner */}
        {isSubscribed && currentPlan !== 'free' && (
          <div className="border rounded-xl p-4 bg-linear-to-br from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {currentPlan === 'business' ? (
                    <Buildings className="w-5 h-5 text-primary" weight="fill" />
                  ) : (
                    <Crown className="w-5 h-5 text-primary" weight="fill" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">Tyform {PLANS[currentPlan].name}</h3>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {subscription?.status === 'trialing' ? 'Trial' : 'Active'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {subscription?.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'} billing
                    {subscription?.current_period_end && (
                      <> • Renews {new Date(subscription.current_period_end).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={loading !== null}>
                Manage Billing
              </Button>
            </div>
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Pro Plan */}
          <div className={cn(
            "relative border-2 rounded-xl overflow-hidden",
            PLANS.pro.popular && "border-primary shadow-lg",
            currentPlan === 'pro' && isSubscribed && "ring-2 ring-primary ring-offset-2"
          )}>
            {PLANS.pro.popular && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg">
                <div className="flex items-center gap-1 text-xs font-medium">
                  <Sparkle className="w-3.5 h-3.5" weight="fill" />
                  Most Popular
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" weight="fill" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      ${billingCycle === 'monthly' ? PLANS.pro.monthlyPrice : PLANS.pro.yearlyPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {billingCycle === 'monthly' ? 'per month' : 'per year'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {FEATURE_GROUPS.pro.title}
              </p>

              <div className="space-y-2 mb-6">
                {FEATURE_GROUPS.pro.features.slice(0, 10).map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" weight="bold" />
                    <span>{feature}</span>
                  </div>
                ))}
                {FEATURE_GROUPS.pro.features.length > 10 && (
                  <p className="text-xs text-muted-foreground pl-6">
                    +{FEATURE_GROUPS.pro.features.length - 10} more features
                  </p>
                )}
              </div>

              {currentPlan === 'pro' && isSubscribed ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe('pro')}
                  disabled={loading !== null}
                >
                  {loading === 'pro' ? (
                    'Loading...'
                  ) : (
                    <>
                      <Lightning className="w-4 h-4 mr-1.5" weight="fill" />
                      Get started
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Business Plan */}
          <div className={cn(
            "relative border rounded-xl overflow-hidden",
            currentPlan === 'business' && isSubscribed && "ring-2 ring-primary ring-offset-2"
          )}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Buildings className="w-6 h-6 text-blue-600" weight="fill" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Business</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      ${billingCycle === 'monthly' ? PLANS.business.monthlyPrice : PLANS.business.yearlyPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {billingCycle === 'monthly' ? 'per month' : 'per year'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                {FEATURE_GROUPS.business.title}
              </p>

              <div className="space-y-2 mb-6">
                {FEATURE_GROUPS.business.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 shrink-0" weight="bold" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {currentPlan === 'business' && isSubscribed ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSubscribe('business')}
                  disabled={loading !== null}
                >
                  {loading === 'business' ? 'Loading...' : 'Get started'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
