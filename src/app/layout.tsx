import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.tyform.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tyform - Beautiful Form Builder",
    template: "%s | Tyform",
  },
  description: "Create stunning, interactive forms for free. Tyform is the best Typeform alternative with unlimited forms, responses & powerful features. Better than Tally, Jotform & Google Forms. Start building beautiful surveys, quizzes & lead capture forms in minutes.",
  keywords: [
    // Primary keywords
    "typeform alternative",
    "free typeform alternative", 
    "tally alternative",
    "jotform alternative",
    "google forms alternative",
    "form builder",
    "free form builder",
    "online form builder",
    // Feature keywords
    "survey maker",
    "quiz maker",
    "lead capture form",
    "contact form builder",
    "feedback form",
    "registration form",
    "order form",
    "application form",
    // Long-tail keywords
    "beautiful form builder",
    "interactive forms",
    "conversational forms",
    "one question at a time form",
    "typeform clone",
    "typeform free alternative",
    "unlimited forms free",
    "no-code form builder",
    "drag and drop form builder",
    // Use case keywords
    "customer feedback form",
    "employee survey",
    "event registration form",
    "job application form",
    "newsletter signup form",
    "waitlist form",
    "NPS survey",
    "customer satisfaction survey",
    // Brand comparisons
    "better than typeform",
    "cheaper than typeform",
    "typeform vs tally",
    "typeform pricing alternative",
  ],
  authors: [{ name: "Tyform" }],
  creator: "Tyform",
  publisher: "Tyform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.tyform.com",
    siteName: "Tyform",
    title: "Tyform - Free Typeform Alternative | Create Beautiful Forms",
    description: "Build stunning, interactive forms for free. The best alternative to Typeform, Tally & Google Forms. Unlimited forms, unlimited responses, powerful analytics.",
    images: [
      {
        url: "https://www.tyform.com/OG.png",
        width: 1200,
        height: 630,
        alt: "Tyform - Free Beautiful Form Builder - Typeform Alternative",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@tyforms",
    creator: "@tyforms",
    title: "Tyform - Free Typeform Alternative | Beautiful Form Builder",
    description: "Create stunning forms for free. Better than Typeform, Tally & Google Forms. Unlimited everything. Start building in seconds.",
    images: ["https://www.tyform.com/OG.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  category: "technology",
  classification: "Form Builder Software",
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL || "https://tyform.com"}/#website`,
      url: process.env.NEXT_PUBLIC_APP_URL || "https://tyform.com",
      name: "Tyform",
      description: "Free Typeform alternative. Create beautiful, interactive forms with unlimited responses.",
      publisher: {
        "@id": `${process.env.NEXT_PUBLIC_APP_URL || "https://tyform.com"}/#organization`,
      },
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://tyform.com"}/templates?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      ],
    },
    {
      "@type": "Organization",
      "@id": `${process.env.NEXT_PUBLIC_APP_URL || "https://tyform.com"}/#organization`,
      name: "Tyform",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://tyform.com",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://tyform.com"}/logo.svg`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://x.com/tyforms",
        "https://www.linkedin.com/company/tyformapp/",
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "Tyform",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Form Builder",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free plan with unlimited forms and responses",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        ratingCount: "500",
        bestRating: "5",
        worstRating: "1",
      },
      featureList: [
        "Unlimited Forms",
        "Unlimited Responses", 
        "Conditional Logic",
        "Custom Branding",
        "File Uploads",
        "Payment Collection",
        "Webhooks & Integrations",
        "Analytics Dashboard",
        "Team Collaboration",
        "Custom Domains",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#635BFF" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RootProvider>
          {children}
          <Toaster position="bottom-right" />
        </RootProvider>
      </body>
    </html>
  );
}
