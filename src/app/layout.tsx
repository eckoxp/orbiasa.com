import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Analytics } from '@vercel/analytics/react'


export const metadata: Metadata = {
  title: 'ORBIA - شركة سعودية تقف خلف العدسة وأمام الجمال',
  description: 'A Saudi company that stands behind the lens and in front of beauty. We specialize in documentary films, commercial photography, and visual storytelling.',
  keywords: 'ORBIA, Saudi Arabia, photography, film, documentary, commercial, visual storytelling, creative agency',
  authors: [{ name: 'ORBIA' }],
  openGraph: {
    title: 'ORBIA - شركة سعودية تقف خلف العدسة وأمام الجمال',
    description: 'A Saudi company that stands behind the lens and in front of beauty.',
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORBIA - شركة سعودية تقف خلف العدسة وأمام الجمال',
    description: 'A Saudi company that stands behind the lens and in front of beauty.',
  },
  robots: 'index, follow',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/site-icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: '/icons/site-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-rb antialiased" suppressHydrationWarning={true}>
        <LanguageProvider>
          {children}
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}