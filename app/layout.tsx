import Header from '@/components/ui/Header';
import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Anek_Bangla } from 'next/font/google';

const anek = Anek_Bangla({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={anek.className}>
        <body>
          <div className="mx-auto flex flex-col space-y-4">
            <Header />
            <main className="flex w-full flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
