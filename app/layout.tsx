import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Metadata } from 'next';
import { Anek_Bangla } from 'next/font/google';

const anek = Anek_Bangla({
  subsets: ['latin'],
  display: 'swap',
});

let title = 'Dream Room Generator';
let description = 'Generate your dream room in seconds.';
let ogimage = 'https://roomgpt-demo.vercel.app/og-image.png';
let sitename = 'roomGPT.io';

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: 'https://roomgpt-demo.vercel.app',
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
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
