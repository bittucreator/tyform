'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
              <Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
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
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              The terms and conditions that govern your use of Tyform. 
              By using our service, you agree to these terms.
            </p>
            <span className="inline-block px-4 py-2 rounded-full bg-muted text-sm text-muted-foreground">
              Last updated January 31, 2026
            </span>
          </div>

          {/* Content */}
          <div className="space-y-8 text-foreground">
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of Tyform&apos;s 
              website, products, and services (&quot;Services&quot;). Please read these Terms carefully, 
              and contact us if you have any questions.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              By accessing or using our Services, you agree to be bound by these Terms and 
              by our Privacy Policy. If you don&apos;t agree to these Terms, you may not use 
              our Services.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Using Tyform</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              You may use our Services only if you can form a binding contract with Tyform, 
              and only in compliance with these Terms and all applicable laws. You must be 
              at least 13 years old to use our Services. If you&apos;re under 18, you represent 
              that your legal guardian has reviewed and agreed to these Terms.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              When you create an account, you must provide accurate and complete information. 
              You are solely responsible for the activity on your account, and you must keep 
              your password secure. You must notify us immediately of any breach of security 
              or unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Your content</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of any intellectual property rights that you hold in the 
              content you create using Tyform. In short, what belongs to you stays yours.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              When you upload, submit, or create content using our Services, you grant Tyform 
              a worldwide, non-exclusive, royalty-free license to use, host, store, reproduce, 
              modify, and distribute that content solely for the purpose of operating, 
              developing, and improving our Services.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Acceptable use</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              You agree not to misuse our Services. For example, you must not:
            </p>

            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Use the Services for any unlawful purposes</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe the rights of others</li>
              <li>Collect information about users without their consent</li>
              <li>Interfere with or disrupt the Services</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Send spam or unsolicited messages through our platform</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Paid plans</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Some of our Services require payment. If you subscribe to a paid plan, you agree 
              to pay the applicable fees. Fees are non-refundable except as required by law or 
              as explicitly stated in our refund policy. We offer a 14-day money-back guarantee 
              on all paid plans.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              We may change our fees at any time. If we change fees for a Service you&apos;re 
              already using, we&apos;ll give you at least 30 days&apos; notice before the change 
              takes effect.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Termination</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              You can stop using our Services at any time. We may suspend or terminate your 
              access to the Services at any time for any reason, including if we reasonably 
              believe you have violated these Terms.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Upon termination, your right to use the Services will immediately cease. You 
              may export your data before termination. We will delete your data within 30 
              days of account termination, unless required by law to retain it.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Disclaimers</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Our Services are provided &quot;as is&quot; without warranty of any kind. We disclaim 
              all warranties, express or implied, including implied warranties of 
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Limitation of liability</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Tyform shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages, or any loss 
              of profits or revenues, whether incurred directly or indirectly, or any loss 
              of data, use, goodwill, or other intangible losses.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Changes to these terms</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              We may revise these Terms from time to time. If we make changes, we&apos;ll 
              notify you by revising the date at the top of this page and, in some cases, 
              we may provide you with additional notice. Your continued use of the Services 
              after the changes take effect means you agree to the revised Terms.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-4">Contact us</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at{' '}
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
                  <li><Link href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
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
