import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import PlausibleProvider from 'next-plausible';

const title = 'PDFtoChat — chat with your PDFs';
const description =
  'Upload a paper, contract, or textbook. Ask it anything. Open source, powered by Together AI.';
const url = 'https://www.pdftochat.com';
const sitename = 'pdftochat.com';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  manifest: '/manifest.webmanifest',
  openGraph: {
    title,
    description,
    url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: '#fdfbf8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <head>
          <PlausibleProvider domain="pdftochat.com" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
