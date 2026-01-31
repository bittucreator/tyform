'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Sparkle, Lightning, Shield, Heart } from '@phosphor-icons/react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="Tyform" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold text-xl text-foreground">Tyform</span>
            </Link>

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

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-8">
            <Sparkle className="h-4 w-4" />
            The modern form builder
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Build forms that
            <span className="underline decoration-2 underline-offset-4">
              {' '}people love{' '}
            </span>
            to fill
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create beautiful, engaging forms that convert. Tyform makes it easy to collect
            data, feedback, and leads with a delightful experience.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                View demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to collect data
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features that help you create forms, surveys, and quizzes in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Lightning className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Drag & Drop Builder
              </h3>
              <p className="text-muted-foreground">
                Build forms visually with our intuitive drag and drop interface. No coding required.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Smart Logic
              </h3>
              <p className="text-muted-foreground">
                Create dynamic forms with conditional logic that adapts to your respondents.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Secure & Private
              </h3>
              <p className="text-muted-foreground">
                Your data is encrypted and secure. We never sell your information to third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Question TextTs */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              15+ Question TextTs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From simple text fields to complex rating scales, we have got you covered.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              'Short Text',
              'Long Text',
              'Email',
              'Number',
              'Phone',
              'Multiple Choice',
              'Checkboxes',
              'Dropdown',
              'Rating',
              'Scale',
              'Date',
              'Yes/No',
              'Website URL',
              'Welcome Screen',
              'Thank You',
            ].map((type) => (
              <span
                key={type}
                className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium border border-border"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to create your first form?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators who use Tyform to collect data beautifully.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8 py-6">
              Get started for free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="Tyform" width={24} height={24} className="rounded-md" />
            <span className="font-medium text-foreground">Tyform</span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © 2026 Tyform. Built with <Heart className="h-4 w-4 text-red-500" weight="fill" />
          </p>
        </div>
      </footer>
    </div>
  )
}
