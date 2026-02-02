import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up Free - Create Beautiful Forms in Seconds | Tyform',
  description: 'Create your free Tyform account. Build stunning forms, surveys & quizzes with unlimited responses. No credit card required. Better than Typeform - start in seconds.',
  keywords: [
    'sign up form builder',
    'create free account',
    'free form builder registration',
    'typeform sign up',
    'free survey maker',
    'create forms free',
  ],
  openGraph: {
    title: 'Sign Up Free - Start Building Beautiful Forms',
    description: 'Join thousands creating amazing forms with Tyform. Free forever with unlimited forms.',
    url: '/signup',
    images: ['/OG.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/signup',
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
