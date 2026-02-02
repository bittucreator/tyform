import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Tyform - Our Mission to Make Forms Beautiful & Free',
  description: 'Learn about Tyform - the free, beautiful form builder created to democratize data collection. Our mission is to make professional forms accessible to everyone.',
  keywords: [
    'about tyform',
    'tyform company',
    'form builder company',
    'who made tyform',
    'tyform mission',
  ],
  openGraph: {
    title: 'About Tyform - Beautiful Forms for Everyone',
    description: 'Our mission is to make professional, beautiful forms accessible to everyone - for free.',
    url: '/about',
    images: ['/OG.png'],
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
