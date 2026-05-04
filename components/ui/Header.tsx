import Link from 'next/link';
import { UserButton, currentUser } from '@clerk/nextjs';
import type { User } from '@clerk/nextjs/server';
import Logo from './Logo';

export default async function Header() {
  const user: User | null = await currentUser();
  const isLoggedIn = !!user;

  return (
    <header className="app-nav">
      <div className="shell app-nav__inner">
        <Logo />
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="btn btn--ghost">
                Documents
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link href="/sign-in" className="btn btn--ghost">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
