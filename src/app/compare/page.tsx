'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/footer'
import { Check, X as XIcon, List, Crown, ArrowRight } from '@phosphor-icons/react'


interface ComparisonFeature {
  name: string
  tyform: boolean | string
  typeform: boolean | string
  tally: boolean | string
  youform: boolean | string
  tooltip?: string
}

const comparisonCategories: { title: string; features: ComparisonFeature[] }[] = [
  {
    title: 'Pricing & Value',
    features: [
      { name: 'Free plan available', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Unlimited forms (Free)', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Unlimited responses (Free)', tyform: true, typeform: '100/mo', tally: true, youform: true },
      { name: 'Pro plan starting price', tyform: '$20/mo', typeform: '$28/mo', tally: '$24/mo', youform: '$29/mo' },
      { name: 'Yearly discount', tyform: '2 months free', typeform: '~30%', tally: '2 months', youform: '~30%' },
    ],
  },
  {
    title: 'Form Building',
    features: [
      { name: 'Drag & drop builder', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Conditional logic', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Calculations & scoring', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Hidden fields', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Answer piping', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'File uploads (Free)', tyform: '10 MB', typeform: '10 MB', tally: '10 MB', youform: '10 MB' },
      { name: 'Unlimited file size (Pro)', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Collect signatures', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Collect payments', tyform: true, typeform: true, tally: true, youform: 'Pro only' },
    ],
  },
  {
    title: 'Customization',
    features: [
      { name: 'Custom colors & fonts', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Custom thank you page', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Remove branding (Pro)', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Custom CSS', tyform: 'Pro', typeform: 'Plus+', tally: 'Pro', youform: false },
      { name: 'Custom domains', tyform: 'Pro', typeform: 'Plus+', tally: 'Pro', youform: 'Pro' },
      { name: 'Custom OG image', tyform: 'Pro', typeform: 'Plus+', tally: 'Pro', youform: 'Pro' },
      { name: 'Custom favicon', tyform: 'Pro', typeform: 'Plus+', tally: 'Pro', youform: false },
    ],
  },
  {
    title: 'Integrations (Free)',
    features: [
      { name: 'Google Sheets', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Notion', tyform: true, typeform: true, tally: true, youform: false },
      { name: 'Slack', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Discord', tyform: true, typeform: false, tally: false, youform: false },
    ],
  },
  {
    title: 'Analytics & Tracking',
    features: [
      { name: 'Basic analytics', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Drop-off analytics', tyform: 'Pro', typeform: 'Business', tally: 'Pro', youform: 'Pro' },
      { name: 'Google Analytics', tyform: 'Pro', typeform: 'Plus+', tally: 'Pro', youform: 'Pro' },
      { name: 'Meta Pixel', tyform: 'Pro', typeform: 'Plus+', tally: 'Pro', youform: 'Pro' },
      { name: 'Conversion tracking', tyform: 'Pro', typeform: 'Business', tally: 'Pro', youform: false },
    ],
  },
  {
    title: 'Access Control',
    features: [
      { name: 'Password protection', tyform: true, typeform: true, tally: true, youform: false },
      { name: 'Close forms on date/limit', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Prevent duplicate submissions', tyform: true, typeform: true, tally: true, youform: false },
      { name: 'Partial submissions', tyform: 'Pro', typeform: false, tally: 'Pro', youform: 'Pro' },
    ],
  },
  {
    title: 'Email & Notifications',
    features: [
      { name: 'Email notifications to self', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'Email to respondents', tyform: 'Pro', typeform: 'Plus+', tally: 'Pro', youform: false },
      { name: 'Custom email domains', tyform: 'Pro', typeform: 'Business', tally: 'Pro', youform: false },
    ],
  },
  {
    title: 'Team & Collaboration',
    features: [
      { name: 'Workspaces', tyform: 'Pro', typeform: true, tally: 'Pro', youform: true },
      { name: 'Team members (Pro)', tyform: 'Unlimited', typeform: '3-5', tally: 'Unlimited', youform: 'Pro' },
      { name: 'Version history', tyform: '30 days (Pro)', typeform: false, tally: '30 days (Pro)', youform: false },
    ],
  },
  {
    title: 'Developer Features',
    features: [
      { name: 'API access', tyform: 'Pro', typeform: true, tally: true, youform: false },
      { name: 'Webhooks (Free)', tyform: true, typeform: true, tally: true, youform: true },
    ],
  },
  {
    title: 'Support & Security',
    features: [
      { name: 'GDPR compliant', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'SSL encryption', tyform: true, typeform: true, tally: true, youform: true },
      { name: 'EU data hosting', tyform: true, typeform: 'Enterprise', tally: true, youform: true },
      { name: 'Priority support', tyform: 'Pro', typeform: 'Business+', tally: false, youform: false },
    ],
  },
]

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <Check className="h-5 w-5 text-green-500 mx-auto" weight="bold" />
  }
  if (value === false) {
    return <XIcon className="h-5 w-5 text-red-400 mx-auto" weight="bold" />
  }
  return <span className="text-sm text-center block">{value}</span>
}

export default function ComparePage() {
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
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/compare" className="text-sm text-foreground font-medium transition-colors">Compare</Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
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
                <XIcon className="h-6 w-6 text-foreground" />
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
              <Link href="/pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/compare" className="block text-sm text-foreground font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>Compare</Link>
              <Link href="/docs" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Docs</Link>
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

      {/* Hero Section */}
      <section className="pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            How Tyform Compares to Other Form Builders
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            See why thousands choose Tyform. We offer the most generous free plan with premium features at a fraction of the cost.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Pricing Comparison */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Pricing at a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Tyform */}
            <div className="border rounded-xl p-6 bg-primary/5 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                  <Crown weight="fill" className="h-3 w-3" /> Best Value
                </span>
              </div>
              <div className="flex items-center justify-center mb-4">
                <Image src="/logo.svg" alt="Tyform" width={40} height={40} className="rounded-lg" />
              </div>
              <h3 className="font-semibold text-center mb-2">Tyform</h3>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Free plan</div>
                <div className="text-lg font-bold text-green-600">$0</div>
                <div className="text-xs text-muted-foreground">Unlimited responses</div>
              </div>
              <div className="border-t mt-4 pt-4 text-center">
                <div className="text-sm text-muted-foreground">Pro plan</div>
                <div className="text-lg font-bold">$20/mo</div>
                <div className="text-xs text-muted-foreground">or $200/year</div>
              </div>
            </div>

            {/* Typeform */}
            <div className="border rounded-xl p-6">
              <div className="flex items-center justify-center h-10 mb-4">
                <span className="font-semibold text-lg">Typeform</span>
              </div>
              <h3 className="font-semibold text-center mb-2 text-muted-foreground">Typeform</h3>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Free plan</div>
                <div className="text-lg font-bold">$0</div>
                <div className="text-xs text-red-500">100 responses/mo limit</div>
              </div>
              <div className="border-t mt-4 pt-4 text-center">
                <div className="text-sm text-muted-foreground">Basic plan</div>
                <div className="text-lg font-bold">$28/mo</div>
                <div className="text-xs text-muted-foreground">Plus $56, Business $91</div>
              </div>
            </div>

            {/* Tally */}
            <div className="border rounded-xl p-6">
              <div className="flex items-center justify-center h-10 mb-4">
                <span className="font-semibold text-lg">Tally</span>
              </div>
              <h3 className="font-semibold text-center mb-2 text-muted-foreground">Tally</h3>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Free plan</div>
                <div className="text-lg font-bold text-green-600">$0</div>
                <div className="text-xs text-muted-foreground">Unlimited responses</div>
              </div>
              <div className="border-t mt-4 pt-4 text-center">
                <div className="text-sm text-muted-foreground">Pro plan</div>
                <div className="text-lg font-bold">$24/mo</div>
                <div className="text-xs text-muted-foreground">Business $74/mo</div>
              </div>
            </div>

            {/* Youform */}
            <div className="border rounded-xl p-6">
              <div className="flex items-center justify-center h-10 mb-4">
                <span className="font-semibold text-lg">Youform</span>
              </div>
              <h3 className="font-semibold text-center mb-2 text-muted-foreground">Youform</h3>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Free plan</div>
                <div className="text-lg font-bold text-green-600">$0</div>
                <div className="text-xs text-muted-foreground">Unlimited responses</div>
              </div>
              <div className="border-t mt-4 pt-4 text-center">
                <div className="text-sm text-muted-foreground">Pro plan</div>
                <div className="text-lg font-bold">$29/mo</div>
                <div className="text-xs text-muted-foreground">or $20/mo yearly</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Tyform */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Why Choose Tyform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-green-500" weight="bold" />
              </div>
              <h3 className="font-semibold mb-2">Truly Free Forever</h3>
              <p className="text-sm text-muted-foreground">
                Unlike Typeform&apos;s 100 response limit, Tyform gives you unlimited forms and submissions at no cost.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-6 w-6 text-primary" weight="fill" />
              </div>
              <h3 className="font-semibold mb-2">Best Pro Value</h3>
              <p className="text-sm text-muted-foreground">
                At $20/mo, our Pro plan is the most affordable while offering unlimited team members and all premium features.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-blue-500" weight="bold" />
              </div>
              <h3 className="font-semibold mb-2">More Free Integrations</h3>
              <p className="text-sm text-muted-foreground">
                Discord, Notion, Slack, Google Sheets, and webhooks—all free. No paywalls for basic integrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Feature-by-Feature Comparison</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Compare Tyform with Typeform, Tally, and Youform across all major features
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-175 border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 sm:p-4 font-semibold w-1/4">Feature</th>
                  <th className="p-3 sm:p-4 font-semibold bg-primary/5 w-[15%]">
                    <div className="flex flex-col items-center gap-1">
                      <Image src="/logo.svg" alt="Tyform" width={28} height={28} className="rounded-md" />
                      <span>Tyform</span>
                    </div>
                  </th>
                  <th className="p-3 sm:p-4 font-semibold w-[15%]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm">Typeform</span>
                    </div>
                  </th>
                  <th className="p-3 sm:p-4 font-semibold w-[15%]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm">Tally</span>
                    </div>
                  </th>
                  <th className="p-3 sm:p-4 font-semibold w-[15%]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm">Youform</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonCategories.map((category, categoryIndex) => (
                  <>
                    <tr key={`category-${categoryIndex}`} className="bg-muted/50">
                      <td colSpan={5} className="p-3 sm:p-4 font-semibold text-sm">
                        {category.title}
                      </td>
                    </tr>
                    {category.features.map((feature, featureIndex) => (
                      <tr key={`feature-${categoryIndex}-${featureIndex}`} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-3 sm:p-4 text-sm">{feature.name}</td>
                        <td className="p-3 sm:p-4 bg-primary/5">
                          <FeatureCell value={feature.tyform} />
                        </td>
                        <td className="p-3 sm:p-4">
                          <FeatureCell value={feature.typeform} />
                        </td>
                        <td className="p-3 sm:p-4">
                          <FeatureCell value={feature.tally} />
                        </td>
                        <td className="p-3 sm:p-4">
                          <FeatureCell value={feature.youform} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="border rounded-2xl p-10 bg-linear-to-br from-primary/5 to-primary/10">
            <h2 className="text-2xl font-bold mb-3">Ready to switch to Tyform?</h2>
            <p className="text-muted-foreground mb-6">
              Start building beautiful forms today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg">
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
