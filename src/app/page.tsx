'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  ArrowRight, 
  Lightning, 
  Shield, 
  CaretDown,
  Palette,
  ChartLine,
  Code,
  Globe,
  X,
  LockSimple,
  ShieldCheck,
  List,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Lightning,
    title: 'Drag & Drop Builder',
    description: 'Build forms visually with our intuitive interface. No coding required.',
  },
  {
    icon: Palette,
    title: 'Beautiful Themes',
    description: '100+ Google Fonts, custom colors, backgrounds, and button styles.',
  },
  {
    icon: ChartLine,
    title: 'Analytics & Insights',
    description: 'Track views, completion rates, drop-offs, and response trends.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted. We never sell your information.',
  },
  {
    icon: Code,
    title: 'API & Webhooks',
    description: 'Integrate with your stack using our REST API and webhooks.',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    description: 'Use your own domain for a branded experience.',
  },
]

const faqs = [
  {
    question: 'How does the free plan work?',
    answer: 'The free plan gives you everything you need to get started — unlimited forms, unlimited submissions, file uploads, integrations with Google Sheets, Notion, Slack, Discord, and more. No credit card required, no time limits. Upgrade to Pro only when you need advanced features like removing branding or custom domains.',
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. When you upgrade, you\'ll be charged immediately. When you downgrade, the change takes effect at the end of your billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and many local payment methods through our secure payment processor.',
  },
  {
    question: 'Can I use my own domain?',
    answer: 'Yes! The Pro plan includes custom domain support. You can host your forms on your own domain (e.g., forms.yourcompany.com) for a fully branded experience.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. All data is encrypted in transit and at rest. We never sell your data to third parties. You can also delete your data at any time.',
  },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showVideo, setShowVideo] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-1.5">
              <Image src="/logo.svg" alt="Tyform" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold text-xl text-foreground">Tyform</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</Link>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
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
              <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <Link href="/pricing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/compare" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Compare</Link>
              <a href="#faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
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
      <section className="pt-28 sm:pt-50 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Build forms that<br />
              people love to fill
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
              Create beautiful, engaging forms in minutes. Collect data, feedback, and payments 
              with a delightful experience your respondents will appreciate.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup">
                <Button>
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required
            </p>
          </div>

          {/* Hero Image */}
          <div className="mt-20 relative">
            <div className="relative mx-auto" style={{ maxWidth: '1280px' }}>
              <Image 
                src="/hero.png" 
                alt="Tyform Builder" 
                width={1280}
                height={720}
                className="w-full h-auto rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features that help you create forms, surveys, and quizzes in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Connect with your favorite tools
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Seamlessly integrate Tyform with the tools you already use to automate your workflows.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-6">
            {[
              { name: 'Slack', logo: '/slack.svg', size: 40 },
              { name: 'Google Sheets', logo: '/sheets.svg', size: 32 },
              { name: 'Notion', logo: '/notion.svg', size: 32 },
              { name: 'Discord', logo: '/discord.svg', size: 32 },
              { name: 'Stripe', logo: '/stripe.svg', size: 44 },
              { name: 'Polar', logo: '/polar.svg', size: 32 },
              { name: 'Dodo Payments', logo: '/dodo.svg', size: 32 },
            ].map((integration) => (
              <div
                key={integration.name}
                className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
              >
                <Image src={integration.logo} alt={integration.name} width={integration.size} height={integration.size} className="mb-3" />
                <span className="text-sm font-medium text-foreground">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                <Shield className="h-5 w-5 text-foreground" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">GDPR Compliant</p>
                <p className="text-xs text-muted-foreground">EU data protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                <LockSimple className="h-5 w-5 text-foreground" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">SSL Encrypted</p>
                <p className="text-xs text-muted-foreground">256-bit encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-foreground" weight="fill" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">SOC 2 Type I</p>
                <p className="text-xs text-muted-foreground">Enterprise security</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about Tyform.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <CaretDown 
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      openFaq === index && "rotate-180"
                    )} 
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-12 md:p-16 text-center" style={{ backgroundColor: '#fafafa' }}>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Ready to create your first form?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of creators who use Tyform to collect data beautifully.
            </p>
            <Link href="/signup">
              <Button>
                Get started for free
                <ArrowRight className="ml-2 h-4 w-4" />
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
                  <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Overview</a></li>
                  <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>                  <li><Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</Link></li>                  <li><a href="#integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Integrations</a></li>
                  <li><a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
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

      {/* Video Modal */}
      {showVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div className="relative max-w-4xl w-full aspect-video bg-black rounded-2xl overflow-hidden">
            <button 
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              onClick={() => setShowVideo(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-white/60">Demo video coming soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
