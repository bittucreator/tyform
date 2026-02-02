'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/footer'

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
        <div className="max-w-3xl mx-auto">
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
              Last updated February 2, 2026
            </span>
          </div>

          {/* Table of Contents */}
          <div className="mb-12 p-6 rounded-xl bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-4">Table of Contents</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#data-controller" className="text-primary hover:underline">Data Controller</a></li>
              <li><a href="#data-collection" className="text-primary hover:underline">Data Collection &amp; Usage</a></li>
              <li><a href="#google-user-data" className="text-primary hover:underline">Google User Data</a></li>
              <li><a href="#third-party-integrations" className="text-primary hover:underline">Third-Party Integrations</a></li>
              <li><a href="#form-responses" className="text-primary hover:underline">Form Responses</a></li>
              <li><a href="#data-security" className="text-primary hover:underline">Data Security</a></li>
              <li><a href="#your-rights" className="text-primary hover:underline">Your Rights</a></li>
              <li><a href="#contact" className="text-primary hover:underline">Contact Us</a></li>
            </ul>
          </div>

          {/* Content */}
          <div className="space-y-8 text-foreground">
            <p className="text-muted-foreground leading-relaxed">
              This privacy policy describes how Tyform (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, 
              and protects your personal information when you use our website at tyform.com and our 
              form builder service. This policy applies to all users, including website visitors, 
              registered users, and users who connect third-party services.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              At Tyform, we are committed to complying with GDPR, CCPA, PECR, and other 
              privacy regulations. The privacy of your data—and it is your data, not ours—is 
              extremely important to us. We promise we never sell your data. Never have, never will.
            </p>

            <h2 id="data-controller" className="text-2xl font-semibold text-foreground pt-4">Data Controller</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              The data controller is <strong className="text-foreground">Tyform</strong>. 
              We can be contacted by email at{' '}
              <a href="mailto:support@tyform.com" className="text-primary hover:underline">
                support@tyform.com
              </a>.
            </p>

            <h2 id="data-collection" className="text-2xl font-semibold text-foreground pt-4">Data Collection &amp; Usage</h2>
            
            <h3 className="text-xl font-medium text-foreground pt-2">As a Visitor to tyform.com</h3>
            <p className="text-muted-foreground leading-relaxed">
              We collect anonymous usage data for statistical purposes, including referrer, browser, 
              operating system, device type, and pages visited. No personal information is collected 
              from visitors. No cookies are used for analytics.
            </p>

            <h3 className="text-xl font-medium text-foreground pt-2">As a Registered User</h3>
            <p className="text-muted-foreground leading-relaxed">
              When you sign up for Tyform, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Email address:</strong> Used for account authentication, important service updates, and support communications</li>
              <li><strong className="text-foreground">Password:</strong> Securely hashed and stored for account authentication</li>
              <li><strong className="text-foreground">Profile information:</strong> Optional name and avatar for personalization</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground pt-2">Payment Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you upgrade to a paid plan, payment is processed through Stripe or Dodo Payments. 
              We never see or store your full credit card number. Our payment processors handle 
              all payment data securely according to PCI-DSS standards.
            </p>

            {/* GOOGLE USER DATA SECTION - Required for Google OAuth Verification */}
            <div id="google-user-data" className="mt-8 p-6 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google User Data
              </h2>
              
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you connect your Google account to Tyform (for features like Google Sheets integration), 
                we access specific Google user data. This section clearly describes what data we access 
                and how we use it in compliance with the{' '}
                <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google API Services User Data Policy
                </a>.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Data Accessed from Google</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                When you authorize Tyform to connect with Google services, we may access the following data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Google Account Email &amp; Profile:</strong> Your email address and basic profile information (name, profile picture) for authentication and displaying your connected account</li>
                <li><strong className="text-foreground">Google Sheets Data:</strong> When you enable Google Sheets integration, we access specific spreadsheets you authorize to send form responses to your selected sheets</li>
                <li><strong className="text-foreground">Spreadsheet Metadata:</strong> Names and IDs of spreadsheets and worksheets you grant access to, so you can select where to send form data</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">How We Use Google User Data</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use the Google user data we access strictly for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Google Sheets Integration:</strong> To automatically send form submission data to your selected Google Sheets spreadsheet when someone submits a form</li>
                <li><strong className="text-foreground">Account Display:</strong> To show which Google account is connected in your Tyform dashboard</li>
                <li><strong className="text-foreground">Spreadsheet Selection:</strong> To display a list of your spreadsheets so you can choose where form responses are saved</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Data Storage &amp; Retention</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>We store OAuth access tokens securely and encrypted to maintain your Google connection</li>
                <li>We do <strong className="text-foreground">not</strong> store copies of your Google Sheets content—we only write form responses to your sheets</li>
                <li>When you disconnect your Google account or delete your Tyform account, all stored tokens are immediately deleted</li>
              </ul>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Data Sharing</h3>
              <p className="text-muted-foreground leading-relaxed">
                We do <strong className="text-foreground">not</strong> share, sell, or transfer your Google user data to any third parties, 
                except as necessary to provide the integration service (i.e., sending data to your own Google Sheets). 
                Your Google data is never used for advertising, marketing, or any purpose other than providing 
                the specific integration features you&apos;ve enabled.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Revoking Access</h3>
              <p className="text-muted-foreground leading-relaxed">
                You can disconnect your Google account from Tyform at any time through your account settings. 
                You can also revoke Tyform&apos;s access directly from your{' '}
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google Account permissions page
                </a>. Upon revocation, we immediately delete all stored access tokens.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">Limited Use Disclosure</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tyform&apos;s use and transfer of information received from Google APIs adheres to the{' '}
                <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Google API Services User Data Policy
                </a>, including the Limited Use requirements.
              </p>
            </div>

            <h2 id="third-party-integrations" className="text-2xl font-semibold text-foreground pt-8">Third-Party Integrations</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Tyform integrates with various third-party services to provide additional functionality. 
              When you connect a third-party service, we may access and store authentication tokens 
              to maintain the connection. Here&apos;s what data we access for each integration:
            </p>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-semibold text-foreground border-b border-border">Integration</th>
                    <th className="text-left p-3 font-semibold text-foreground border-b border-border">Data Accessed</th>
                    <th className="text-left p-3 font-semibold text-foreground border-b border-border">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-border text-foreground">Google Sheets</td>
                    <td className="p-3 border-b border-border text-muted-foreground">Email, spreadsheet names, write access to selected sheets</td>
                    <td className="p-3 border-b border-border text-muted-foreground">Send form responses to your spreadsheets</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-border text-foreground">Notion</td>
                    <td className="p-3 border-b border-border text-muted-foreground">Workspace name, database names, write access to selected databases</td>
                    <td className="p-3 border-b border-border text-muted-foreground">Send form responses to your Notion databases</td>
                  </tr>
                  <tr>
                    <td className="p-3 border-b border-border text-foreground">Slack</td>
                    <td className="p-3 border-b border-border text-muted-foreground">Workspace name, channel list</td>
                    <td className="p-3 border-b border-border text-muted-foreground">Send form submission notifications to your channels</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground">Discord</td>
                    <td className="p-3 text-muted-foreground">Server name, webhook URL</td>
                    <td className="p-3 text-muted-foreground">Send form submission notifications to your servers</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 id="form-responses" className="text-2xl font-semibold text-foreground pt-8">Form Responses</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              When someone fills out a form you&apos;ve created, we store that response data on your behalf. 
              You are the data controller for this data, and we are the data processor. We only use 
              this data to provide you with our service.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              You can export or delete your form responses at any time. When you delete a form or 
              your account, all associated response data is permanently deleted from our servers 
              within 30 days.
            </p>

            <h2 id="data-security" className="text-2xl font-semibold text-foreground pt-8">Data Security</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              We take data security seriously. Here are the measures we implement:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Encryption in Transit:</strong> All data is encrypted using TLS 1.3</li>
              <li><strong className="text-foreground">Encryption at Rest:</strong> Data is encrypted using AES-256</li>
              <li><strong className="text-foreground">Secure Infrastructure:</strong> We use SOC 2 compliant cloud infrastructure</li>
              <li><strong className="text-foreground">Token Security:</strong> OAuth tokens and API keys are encrypted and stored securely</li>
              <li><strong className="text-foreground">Regular Audits:</strong> We regularly audit our security practices</li>
            </ul>

            <h2 id="your-rights" className="text-2xl font-semibold text-foreground pt-8">Your Rights</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
              <li><strong className="text-foreground">Correct:</strong> Update or correct inaccurate information</li>
              <li><strong className="text-foreground">Delete:</strong> Request deletion of your account and all associated data</li>
              <li><strong className="text-foreground">Export:</strong> Download your data in a portable format</li>
              <li><strong className="text-foreground">Revoke:</strong> Disconnect third-party integrations at any time</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              You can exercise most of these rights directly from your account settings. For additional 
              assistance, contact us at{' '}
              <a href="mailto:support@tyform.com" className="text-primary hover:underline">
                support@tyform.com
              </a>.
            </p>

            <h2 className="text-2xl font-semibold text-foreground pt-8">Changes to This Policy</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. We&apos;ll notify you of any significant 
              changes by email. The latest version will always be available on this page with 
              the updated date at the top.
            </p>

            <h2 id="contact" className="text-2xl font-semibold text-foreground pt-8">Contact Us</h2>
            
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this privacy policy, our data practices, or how we 
              handle your information, please contact us:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li><strong className="text-foreground">Email:</strong>{' '}
                <a href="mailto:support@tyform.com" className="text-primary hover:underline">
                  support@tyform.com
                </a>
              </li>
              <li><strong className="text-foreground">Website:</strong>{' '}
                <a href="https://tyform.com/contact" className="text-primary hover:underline">
                  tyform.com/contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
