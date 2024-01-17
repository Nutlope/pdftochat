import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Metadata } from 'next';
import { Anek_Bangla } from 'next/font/google';

const anek = Anek_Bangla({
  subsets: ['latin'],
  display: 'swap',
});

let title = 'PDF to Chat';
let description = 'Chat with your PDFs in seconds.';
// TODO: Update OG Image
let ogimage = 'https://roomgpt-demo.vercel.app/og-image.png';
let url = 'https://www.pdftochat.com';
let sitename = 'pdftochat.com';

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
    url,
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
