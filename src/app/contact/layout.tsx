import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us - Get Help with Tyform | Support & Sales',
  description: 'Have questions about Tyform? Contact our support team for help with forms, integrations, billing, or enterprise solutions. We typically respond within 24 hours.',
  keywords: [
    'contact tyform',
    'tyform support',
    'tyform help',
    'form builder support',
    'tyform sales',
  ],
  openGraph: {
    title: 'Contact Tyform - We\'re Here to Help',
    description: 'Get help with your forms. Our team responds within 24 hours.',
    url: '/contact',
    images: ['/OG.png'],
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
