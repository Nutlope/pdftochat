import Footer from '@/components/home/Footer';
import Header from '@/components/ui/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page">
      <Header />
      <main className="app-shell">{children}</main>
      <Footer />
    </div>
  );
}
