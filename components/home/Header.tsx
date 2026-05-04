import Link from 'next/link';
import { Github } from 'lucide-react';
import Logo from '../ui/Logo';

export default function Header() {
  return (
    <header className="shell flex items-center justify-between py-5">
      <Logo />
      <nav className="flex items-center gap-2">
        <Link
          href="https://github.com/Nutlope/pdftochat"
          className="btn btn--ghost"
          aria-label="Source on GitHub"
        >
          <Github size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Source</span>
        </Link>
        <Link href="/sign-in" className="btn btn--ghost">
          Log in
        </Link>
        <Link href="/sign-up" className="btn btn--primary">
          Get started
        </Link>
      </nav>
    </header>
  );
}
