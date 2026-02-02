import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Form Templates - Ready-to-Use Survey & Form Templates | Tyform',
  description: 'Browse 50+ free form templates: contact forms, surveys, quizzes, feedback forms, registration forms, order forms & more. Customize and publish in minutes. Free forever.',
  keywords: [
    'form templates',
    'free form templates',
    'survey templates',
    'quiz templates',
    'contact form template',
    'feedback form template',
    'registration form template',
    'order form template',
    'application form template',
    'typeform templates',
    'google forms templates',
    'questionnaire templates',
    'nps survey template',
    'customer feedback template',
    'event registration template',
  ],
  openGraph: {
    title: 'Free Form Templates - Start Building in Seconds',
    description: '50+ professionally designed form templates. Contact forms, surveys, quizzes & more. Free to use and customize.',
    url: '/templates',
    images: ['/OG.png'],
  },
  twitter: {
    title: 'Free Form Templates | Tyform',
    description: '50+ free templates: surveys, quizzes, contact forms & more.',
    images: ['/OG.png'],
  },
  alternates: {
    canonical: '/templates',
  },
}

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
