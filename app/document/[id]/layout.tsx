import Header from '@/components/ui/Header';

export default function DocumentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page">
      <Header />
      {children}
    </div>
  );
}
