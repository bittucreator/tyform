'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Check, Crown, Sparkle, List, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { PLANS, FEATURE_GROUPS } from '@/lib/plans'

const faqs = [
  {
    question: "Is Tyform really free?",
    answer: "Yes! Tyform is free forever with unlimited forms and submissions. Upgrade only when you need advanced features like removing branding or custom domains."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. You can cancel your subscription at any time. Your account will remain active until the end of your billing period."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and various local payment methods through our payment provider."
  },
  {
    question: "How does the yearly plan work?",
    answer: "Pay yearly and get 2 months free. You'll be billed once per year instead of monthly, saving you money in the long run."
  }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Tyform" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold text-xl text-foreground">Tyform</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/pricing" className="text-sm text-foreground font-medium transition-colors">Pricing</Link>
              <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</Link>
              <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <List className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-3">
              <Link href="/#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="/pricing" className="block text-sm text-foreground font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/compare" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Compare</Link>
              <Link href="/#faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <div className="pt-3 border-t border-border space-y-2">
                <Link href="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center">Sign in</Button>
                </Link>
                <Link href="/signup" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Build beautiful forms for free!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Paywalls getting in the way? Not anymore. Tyform gives you unlimited forms and 
            submissions, completely free.
          </p>
        </div>
      </section>

      {/* Free Features Grid */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="border rounded-2xl p-8 bg-muted/30">
            <h2 className="text-lg font-semibold text-center mb-6">Everything you need, for free</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEATURE_GROUPS.free.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" weight="bold" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upgrade Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Do more with Tyform</h2>
            <p className="text-muted-foreground">
              Upgrade to access advanced features designed for growing teams and creators.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3 bg-muted/50 rounded-full px-4 py-2">
              <span 
                className={cn(
                  "text-sm font-medium transition-colors cursor-pointer",
                  billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'
                )} 
                onClick={() => setBillingCycle('monthly')}
              >
                Pay monthly
              </span>
              <Switch
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
              />
              <span 
                className={cn(
                  "text-sm font-medium transition-colors cursor-pointer",
                  billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'
                )} 
                onClick={() => setBillingCycle('yearly')}
              >
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

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="border rounded-2xl p-6 bg-background">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Free</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground">forever</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  For individuals getting started
                </p>
              </div>

              <Link href="/signup">
                <Button variant="outline" className="w-full mb-6">
                  Get started free
                </Button>
              </Link>

              <div className="space-y-3">
                <p className="text-sm font-medium">Includes:</p>
                <div className="space-y-2">
                  {[
                    'Unlimited forms',
                    'Unlimited submissions',
                    'All question types',
                    'Basic integrations',
                    'Email notifications',
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" weight="bold" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative border-2 border-primary rounded-2xl p-6 bg-background shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3">
                  <Sparkle className="w-3.5 h-3.5 mr-1" weight="fill" />
                  Most Popular
                </Badge>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-primary" weight="fill" />
                  <h3 className="text-xl font-bold">Pro</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">
                    ${billingCycle === 'monthly' ? PLANS.pro.monthlyPrice : PLANS.pro.yearlyPrice}
                  </span>
                  <span className="text-muted-foreground">
                    {billingCycle === 'monthly' ? '/month' : '/year'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  For professionals and growing teams
                </p>
              </div>

              <Link href="/signup">
                <Button className="w-full mb-6">
                  Start free trial
                </Button>
              </Link>

              <div className="space-y-3">
                <p className="text-sm font-medium">Everything in Free, plus:</p>
                <div className="space-y-2">
                  {FEATURE_GROUPS.pro.features.slice(0, 12).map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" weight="bold" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {FEATURE_GROUPS.pro.features.length > 12 && (
                    <p className="text-xs text-muted-foreground pl-6">
                      +{FEATURE_GROUPS.pro.features.length - 12} more features
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Compare plans</h2>
            <p className="text-muted-foreground">See what&apos;s included in each plan</p>
          </div>
          
          <div className="border rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full min-w-125">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-medium text-sm">Feature</th>
                  <th className="text-center p-3 sm:p-4 font-medium text-sm w-20 sm:w-32">Free</th>
                  <th className="text-center p-3 sm:p-4 font-medium text-sm w-20 sm:w-32 bg-primary/5">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Forms & Submissions */}
                <tr className="bg-muted/30">
                  <td colSpan={3} className="p-2 sm:p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Forms & Submissions</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Forms</td>
                  <td className="p-3 sm:p-4 text-center text-xs sm:text-sm">Unlimited</td>
                  <td className="p-3 sm:p-4 text-center text-xs sm:text-sm bg-primary/5">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Submissions</td>
                  <td className="p-3 sm:p-4 text-center text-xs sm:text-sm">Unlimited</td>
                  <td className="p-3 sm:p-4 text-center text-xs sm:text-sm bg-primary/5">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Partial submissions</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">File upload size</td>
                  <td className="p-3 sm:p-4 text-center text-xs sm:text-sm">10 MB</td>
                  <td className="p-3 sm:p-4 text-center text-xs sm:text-sm bg-primary/5">Unlimited</td>
                </tr>

                {/* Customization */}
                <tr className="bg-muted/30">
                  <td colSpan={3} className="p-2 sm:p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customization</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Custom thank you page</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Remove Tyform branding</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Custom CSS</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Custom domains</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Custom OG image</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>

                {/* Integrations */}
                <tr className="bg-muted/30">
                  <td colSpan={3} className="p-2 sm:p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integrations</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Google Sheets</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Notion</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Slack</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Discord</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Webhooks</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Google Analytics / Meta Pixel</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">API access</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>

                {/* Notifications */}
                <tr className="bg-muted/30">
                  <td colSpan={3} className="p-2 sm:p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notifications</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Self email notifications</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Respondent emails</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Custom email domains</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>

                {/* Security & Controls */}
                <tr className="bg-muted/30">
                  <td colSpan={3} className="p-2 sm:p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security & Controls</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Password protection</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Close forms on date/submissions</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Prevent duplicate submissions</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>

                {/* Analytics */}
                <tr className="bg-muted/30">
                  <td colSpan={3} className="p-2 sm:p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Analytics</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Basic analytics</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Advanced analytics</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Drop-off analytics</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>

                {/* Collaboration */}
                <tr className="bg-muted/30">
                  <td colSpan={3} className="p-2 sm:p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collaboration</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Team members</td>
                  <td className="p-3 sm:p-4 text-center text-xs sm:text-sm">1</td>
                  <td className="p-3 sm:p-4 text-center text-xs sm:text-sm bg-primary/5">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Workspaces</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Version history</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center text-xs sm:text-sm bg-primary/5">30 days</td>
                </tr>

                {/* Support */}
                <tr className="bg-muted/30">
                  <td colSpan={3} className="p-2 sm:p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Support</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Email support</td>
                  <td className="p-3 sm:p-4 text-center"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 text-sm">Priority support</td>
                  <td className="p-3 sm:p-4 text-center text-sm text-muted-foreground">—</td>
                  <td className="p-3 sm:p-4 text-center bg-primary/5"><Check className="w-4 h-4 text-green-500 mx-auto" weight="bold" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Questions & answers</h2>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl px-6 mb-4 last:mb-0">
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="border rounded-2xl p-10 bg-linear-to-br from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold mb-3">Ready to create beautiful forms?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of creators building forms with Tyform.
            </p>
            <Link href="/signup">
              <Button size="lg">
                Get started for free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-xs">
              <p className="text-muted-foreground text-sm mb-6">
                Create beautiful, engaging forms that people love to fill out. Built for teams who care about design.
              </p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Operational</span>
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2026
              </p>
            </div>
            <div className="flex flex-wrap gap-12 md:gap-16">
              <div>
                <h4 className="font-semibold text-foreground mb-4">Features</h4>
                <ul className="space-y-2">
                  <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Overview</Link></li>
                  <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                  <li><Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</Link></li>
                  <li><Link href="/#integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
                  <li><Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
                  <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                  <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          {/* Large Logo */}
          <div className="flex justify-center -mb-125">
            <Image src="/logo.svg" alt="Tyform" width={1000} height={1000} className="opacity-10" />
          </div>
        </div>
      </footer>
    </div>
  )
}
