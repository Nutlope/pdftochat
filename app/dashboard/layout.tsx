import Footer from '@/components/home/Footer';
import Header from '@/components/ui/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col ">
      <Header />
      <div className="flex-grow">{children}</div>
      <div className="sm:p-7 sm:pb-0">
        <Footer />
      </div>
    </div>
  );
}
