'use client'

import Link from 'next/link'
import Image from 'next/image'
import { XLogo, LinkedinLogo } from '@phosphor-icons/react'

export function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image src="/logo.svg" alt="Tyform" width={32} height={32} className="rounded-lg" />
              <span className="font-semibold text-xl text-foreground">Tyform</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              Create beautiful, engaging forms that people love to fill out. Built for teams who care about design.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4 mb-6">
              <a 
                href="https://x.com/tyforms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on X (Twitter)"
              >
                <XLogo className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/company/tyformapp/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <LinkedinLogo className="h-5 w-5" />
              </a>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Operational</span>
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Tyform. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-12 md:gap-16">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/compare" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</Link></li>
                <li><Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Templates</Link></li>
                <li><Link href="/#integrations" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</Link></li>
                <li><Link href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link></li>
                <li><Link href="/api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API</Link></li>
                <li><a href="https://x.com/tyforms" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
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
  )
}
