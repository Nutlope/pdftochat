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
          {/* <div className="min-h-screen flex flex-col"> */}
          {/* <Header /> */}
          {children}
          {/* </div> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
