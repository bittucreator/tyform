import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tyform",
    template: "%s | Tyform",
  },
  description: "Create beautiful, engaging forms with Tyform - the modern Typeform alternative. Build surveys, quizzes, and forms that people love to fill out.",
  keywords: ["form builder", "survey", "typeform alternative", "quiz maker", "online forms"],
  authors: [{ name: "Tyform" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tyform",
    title: "Tyform - Beautiful Form Builder",
    description: "Create beautiful, engaging forms with Tyform - the modern Typeform alternative.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tyform - Beautiful Form Builder",
    description: "Create beautiful, engaging forms with Tyform - the modern Typeform alternative.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
