'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              How we protect your privacy, what data we collect, and your rights 
              over your information. Your data always belongs to you, not us.
            </p>
            <span className="inline-block px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground">
              Last updated January 31, 2026
            </span>
          </div>

          {/* Content */}
          <div className="space-y-8 text-foreground">
            <p className="text-muted-foreground leading-relaxed">
              This policy covers tyform.com website visitors and customers. For analytics 
              data we process on behalf of our customers&apos; website visitors, see our{' '}
              <a href="#" className="text-primary hover:underline">data policy</a> and{' '}
              <a href="#" className="text-primary hover:underline">DPA</a>.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              For tyform.com website visitors, we collect anonymous usage data and only use 
              cookies for authentication. If you create an account to use our form builder, 
              we ask for the bare minimum and only share it with services that are absolutely 
              necessary for the app to function.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              At Tyform, we are committed to complying with GDPR, CCPA, PECR and other 
              privacy regulations on our website and on our form builder product too. The 
              privacy of your data, and it is your data, not ours, is a big deal to us.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              In this policy, we lay out what data we collect and why, how your data is 
              handled and your rights to your data. We promise we never sell your data, 
              never have, never will.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Data controller</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              The data controller is <strong className="text-foreground">Tyform</strong>. 
              We can be contacted by email at{' '}
              <a href="mailto:support@tyform.com" className="text-primary hover:underline">
                support@tyform.com
              </a>.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">As a visitor to tyform.com</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              We run our own analytics script to collect anonymous usage data for statistical 
              purposes. The data we collect includes referrer, browser, operating system, 
              device type, and pages visited. No personal information is collected. No 
              cookies are used for analytics.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">As a customer of Tyform</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              When you sign up for Tyform, we ask for your email address and a password. 
              That&apos;s it. We use your email to send you important updates about your 
              account, and to respond to any support requests. We don&apos;t send marketing 
              emails unless you explicitly opt in.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              If you upgrade to a paid plan, we collect your payment information through 
              our payment processor, Stripe. We never see or store your full credit card 
              number. Stripe handles all payment processing securely.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Form responses</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              When someone fills out a form you&apos;ve created, we store that response data 
              on your behalf. You are the data controller for this data, and we are the 
              data processor. We only use this data to provide you with our service.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              You can export or delete your form responses at any time. When you delete 
              a form or your account, all associated response data is permanently deleted 
              from our servers within 30 days.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Your rights</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, export, or delete your personal data 
              at any time. You can do most of this directly from your account settings. 
              If you need help, contact us at{' '}
              <a href="mailto:support@tyform.com" className="text-primary hover:underline">
                support@tyform.com
              </a>.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Data security</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              All data is encrypted in transit using TLS 1.3. Data at rest is encrypted 
              using AES-256. We use secure, SOC 2 compliant cloud infrastructure. We 
              regularly audit our security practices and update them as needed.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Changes to this policy</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. We&apos;ll notify you of any 
              significant changes by email. The latest version will always be available 
              on this page.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Contact us</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this privacy policy or how we handle your 
              data, please contact us at{' '}
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
