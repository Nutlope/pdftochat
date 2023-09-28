import Link from 'next/link';
import Logo from './Logo';
import { UserButton, currentUser } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/dist/types/server';

export default async function Header() {
  const user: User | null = await currentUser();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-40 bg-white w-full border-b border-b-slate-200 shadow-sm">
      <div className="h-16 py-4 container mx-auto">
        <nav className="flex justify-between mx-10">
          <Link
            href="/"
            className="hover:text-slate-600 cursor-pointer flex items-center"
          >
            <Logo />
            <span className="text-2xl mb-2 font-medium">PDFtoChat</span>
          </Link>
          <div className="flex items-center gap-5">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <UserButton afterSignOutUrl="/dashboard" />
              </>
            ) : (
              <Link href="/sign-in">Log in</Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
