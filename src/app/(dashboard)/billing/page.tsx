import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Lightning } from '@/components/icons'

export default async function BillingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'For individuals getting started',
      features: [
        '3 forms',
        '100 responses/month',
        'Basic analytics',
        'Tyform branding',
      ],
      current: true,
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      description: 'For professionals and small teams',
      features: [
        'Unlimited forms',
        '10,000 responses/month',
        'Advanced analytics',
        'Remove branding',
        'Custom domains',
        'Priority support',
      ],
      current: false,
      popular: true,
    },
    {
      name: 'Business',
      price: '$49',
      period: '/month',
      description: 'For growing businesses',
      features: [
        'Everything in Pro',
        'Unlimited responses',
        'Team collaboration',
        'API access',
        'SSO & SAML',
        'Dedicated support',
      ],
      current: false,
    },
  ]

  return (
    <div className="space-y-5 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[17px] font-semibold tracking-tight">Billing</h1>
        <p className="text-[13px] text-muted-foreground/80 mt-0.5">
          Manage your subscription and billing
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 border border-border/50 rounded-lg bg-card overflow-hidden divide-x divide-border/50">
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Plan</span>
          <p className="text-lg font-semibold mt-1">Free</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Responses</span>
          <p className="text-lg font-semibold tabular-nums mt-1">0/100</p>
        </div>
        <div className="p-4 text-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">Usage</span>
          <p className="text-lg font-semibold tabular-nums mt-1">0%</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="border border-border/50 rounded-lg bg-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="font-semibold text-[14px] tracking-tight">Current Plan</h2>
          <p className="text-[12px] text-muted-foreground/70 mt-0.5">
            You are currently on the Free plan
          </p>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold">Free</p>
            <p className="text-[12px] text-muted-foreground/70">0/100 responses used this month</p>
          </div>
          <Button size="sm" className="h-8 text-[12px]">
            <Lightning className="h-3.5 w-3.5 mr-1.5" />
            Upgrade
          </Button>
        </div>
        <div className="px-4 pb-4">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-foreground rounded-full w-0" />
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="font-semibold text-[14px] tracking-tight mb-3">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-lg bg-card overflow-hidden ${
                plan.popular ? 'border-foreground' : 'border-border/50'
              }`}
            >
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-[14px]">{plan.name}</h3>
                  {plan.popular && (
                    <Badge className="text-[9px] bg-foreground text-background">Popular</Badge>
                  )}
                  {plan.current && (
                    <Badge className="text-[9px] bg-muted text-muted-foreground">Current</Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/70">{plan.description}</p>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-[12px] text-muted-foreground/70">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[12px]">
                      <Check className="h-3 w-3 text-foreground shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full h-8 text-[12px]"
                  variant={plan.current ? 'outline' : 'default'}
                  disabled={plan.current}
                  size="sm"
                >
                  {plan.current ? 'Current plan' : 'Upgrade'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
