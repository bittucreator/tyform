'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Lightning, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Subscription {
  id?: string
  plan: string
  status: string
  billing_cycle: 'monthly' | 'yearly' | null
  current_period_end?: string
  trial_ends_at?: string
  has_customer?: boolean
}

const PRO_FEATURES = [
  'Unlimited forms',
  'Unlimited responses',
  'Remove Tyform branding',
  'Custom domains',
  'File uploads (unlimited)',
  'Advanced analytics',
  'Webhooks',
  'API access',
  'Priority support',
]

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // First get the workspace
        const wsRes = await fetch('/api/workspaces')
        if (wsRes.ok) {
          const wsData = await wsRes.json()
          if (wsData.workspaces?.length > 0) {
            const ws = wsData.workspaces[0]
            setWorkspaceId(ws.id)
            
            // Then get subscription
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

  const handleStartTrial = async () => {
    if (!workspaceId) {
      toast.error('No workspace found')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'pro',
          billingCycle,
          workspaceId,
        }),
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
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    if (!workspaceId) return

    setLoading(true)
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
      setLoading(false)
    }
  }

  const isSubscribed = subscription?.plan === 'pro' && 
    (subscription?.status === 'active' || subscription?.status === 'trialing')

  const price = billingCycle === 'monthly' ? 20 : 200
  const monthlyEquivalent = billingCycle === 'yearly' ? (200 / 12).toFixed(2) : 20

  if (loadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Status */}
      {isSubscribed ? (
        <div className="border rounded-xl p-6 bg-linear-to-br from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" weight="fill" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Tyform Pro</h2>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {subscription?.status === 'trialing' ? 'Trial' : 'Active'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription?.billing_cycle === 'yearly' ? 'Yearly' : 'Monthly'} subscription
                  {subscription?.current_period_end && (
                    <> • Renews {new Date(subscription.current_period_end).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleManageBilling} disabled={loading}>
              Manage Subscription
            </Button>
          </div>

          {/* Quick feature list */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Unlimited forms', 'Custom domains', 'Remove branding', 'API access'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" weight="bold" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Billing Cycle Toggle */}
          <div className="flex flex-col items-center gap-1.5 pb-4">
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              />
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
                Yearly
              </span>
            </div>
            <Badge className={`bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 transition-opacity ${billingCycle === 'yearly' ? 'opacity-100' : 'opacity-0'}`}>
              Save $40/year
            </Badge>
          </div>

          {/* Pro Plan Card */}
          <div className="relative border-2 border-primary rounded-xl overflow-hidden w-90 mx-auto">
            {/* Trial Badge */}
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg">
              <div className="flex items-center gap-1 text-xs font-medium">
                <Sparkle className="w-3.5 h-3.5" weight="fill" />
                3-Day Free Trial
              </div>
            </div>

            <div className="p-6">
              {/* Plan Header */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <Crown className="w-6 h-6 text-primary" weight="fill" />
                </div>
                <h2 className="text-xl font-bold">Tyform Pro</h2>
                <p className="text-muted-foreground text-xs mt-1">Everything you need for amazing forms</p>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-sm text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                <p className={`text-green-600 text-xs mt-1 h-4 transition-opacity ${billingCycle === 'yearly' ? 'opacity-100' : 'opacity-0'}`}>
                  ${monthlyEquivalent}/mo – save $40!
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2 mb-5">
                {PRO_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" weight="bold" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="text-center">
                <Button
                  size="sm"
                  className="w-full h-9 text-xs font-medium"
                  onClick={handleStartTrial}
                  disabled={loading}
                >
                  {loading ? (
                    'Loading...'
                  ) : (
                    <>
                      <Lightning className="w-3.5 h-3.5 mr-1.5" weight="fill" />
                      Start Free Trial
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-muted-foreground mt-2">
                  No credit card required • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* FAQ or Help Section */}
      <div className="border rounded-xl p-6 bg-muted/30">
        <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium">What happens after my trial ends?</p>
            <p className="text-muted-foreground mt-1">
              After your 3-day trial, you&apos;ll be charged based on your selected billing cycle. You can cancel anytime before the trial ends.
            </p>
          </div>
          <div>
            <p className="font-medium">Can I switch between monthly and yearly?</p>
            <p className="text-muted-foreground mt-1">
              Yes! You can switch billing cycles anytime from your billing portal. If you switch to yearly, you&apos;ll save $40/year.
            </p>
          </div>
          <div>
            <p className="font-medium">What payment methods do you accept?</p>
            <p className="text-muted-foreground mt-1">
              We accept all major credit cards, debit cards, and various local payment methods through our payment provider.
            </p>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Questions about billing?{' '}
          <a href="mailto:support@tyform.com" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
