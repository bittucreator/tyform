import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Access Your Forms | Tyform',
  description: 'Sign in to your Tyform account to manage forms, view responses, and analyze submissions. Secure login to your form builder dashboard.',
  openGraph: {
    title: 'Login to Tyform',
    description: 'Access your forms and responses dashboard.',
    url: '/login',
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/login',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
