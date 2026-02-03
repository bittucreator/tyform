'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Tyform" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold text-xl text-foreground">Tyform</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              <Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About Tyform
            </h1>
            <p className="text-muted-foreground text-lg">
              We&apos;re on a mission to make form creation beautiful, simple, and delightful. 
              Your forms deserve to be as good as your product.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-foreground">
            <p className="text-muted-foreground leading-relaxed">
              Tyform started with a simple observation: most form builders are either too 
              complicated, too ugly, or too expensive. We believed there had to be a better way 
              to create forms that people actually enjoy filling out.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              At Tyform, we&apos;re committed to building the best form creation experience. We 
              focus on simplicity without sacrificing power, and beauty without compromising 
              functionality. Your data belongs to you, not us.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Our mission</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              To empower everyone to create beautiful, engaging forms that people actually 
              enjoy filling out — no design skills or coding required. We believe that 
              collecting data should be a delightful experience for both creators and respondents.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">What we believe</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              We believe forms are more than just data collection tools. They&apos;re often the 
              first interaction someone has with your brand. That&apos;s why we obsess over every 
              detail — from the typography to the animations to the way questions flow.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              We believe in privacy by design. We never sell your data, never have, never will. 
              Your forms and responses belong to you, and we&apos;re just here to help you collect 
              them beautifully.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">The team</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Tyform is built by a small, passionate team that cares deeply about design, 
              user experience, and building tools that people love to use. We&apos;re based 
              around the world and united by our mission to make forms better.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Get in touch</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              We&apos;d love to hear from you. Whether you have a question, feedback, or just 
              want to say hello, reach out to us at{' '}
              <a href="mailto:support@tyform.com" className="text-primary hover:underline">
                support@tyform.com
              </a>.
            </p>
          </div>
        </div>
      </main>

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
