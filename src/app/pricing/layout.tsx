import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Free Form Builder | Tyform vs Typeform Pricing',
  description: 'Compare Tyform pricing with Typeform, Tally, and JotForm. Start free with unlimited forms & responses. Pro plan at $20/mo - 40% cheaper than Typeform. No credit card required.',
  keywords: [
    'tyform pricing',
    'typeform pricing',
    'tally pricing',
    'form builder pricing',
    'free form builder',
    'typeform alternative price',
    'cheap typeform alternative',
    'affordable form builder',
    'form builder comparison',
    'unlimited responses free',
  ],
  openGraph: {
    title: 'Tyform Pricing - 40% Cheaper Than Typeform',
    description: 'Free forever with unlimited forms. Pro at $20/mo vs Typeform $28/mo. Get all features for less.',
    url: '/pricing',
    images: ['/OG.png'],
  },
  twitter: {
    title: 'Tyform Pricing - 40% Cheaper Than Typeform',
    description: 'Free forever with unlimited forms. Pro at $20/mo vs Typeform $28/mo.',
    images: ['/OG.png'],
  },
  alternates: {
    canonical: '/pricing',
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
