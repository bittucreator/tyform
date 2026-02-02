import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tyform.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/forms/',
          '/settings/',
          '/billing/',
          '/members/',
          '/domains/',
          '/auth/',
          '/invite/',
          '/connect/',
          '/_next/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/forms/',
          '/settings/',
          '/billing/',
          '/members/',
          '/domains/',
          '/auth/',
          '/invite/',
          '/connect/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
