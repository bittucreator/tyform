import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tyform vs Typeform vs Tally vs Youform - Best Form Builder Comparison 2026',
  description: 'Detailed feature comparison: Tyform vs Typeform vs Tally vs Youform. See which form builder offers the best value with unlimited free responses, conditional logic, payments & more.',
  keywords: [
    'typeform vs tally',
    'typeform alternative',
    'tally alternative',
    'youform alternative',
    'form builder comparison',
    'best form builder 2026',
    'typeform vs jotform',
    'typeform competitors',
    'free typeform alternative',
    'tyform vs typeform',
    'which form builder to choose',
    'form builder features comparison',
  ],
  openGraph: {
    title: 'Tyform vs Typeform vs Tally - Complete Comparison 2026',
    description: 'Find the best form builder for your needs. Compare features, pricing, and capabilities of top form builders.',
    url: '/compare',
    images: ['/OG.png'],
  },
  twitter: {
    title: 'Tyform vs Typeform vs Tally - Complete Comparison',
    description: 'Which form builder is best? Compare features and pricing side-by-side.',
    images: ['/OG.png'],
  },
  alternates: {
    canonical: '/compare',
  },
}

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
