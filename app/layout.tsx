import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Anek_Bangla } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const anek = Anek_Bangla({
  subsets: ['latin'],
  display: 'swap',
});

let title = 'PDF to Chat';
let description = 'Chat with your PDFs in seconds.';
let ogimage = 'https://www.pdftochat.com/og-image.png';
let url = 'https://www.pdftochat.com';
let sitename = 'pdftochat.com';

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={anek.className}>
        <body>
          <Analytics />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
