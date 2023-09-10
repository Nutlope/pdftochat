import '../styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto flex flex-col space-y-4">
          <header className="container sticky top-0 z-40 bg-white">
            <div className="h-16 border-b border-b-slate-200 py-4">
              <nav className="ml-4 pl-6">
                <a href="#" className="hover:text-slate-600 cursor-pointer">
                  Home
                </a>
              </nav>
            </div>
          </header>
          <div>
            <main className="flex w-full flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
