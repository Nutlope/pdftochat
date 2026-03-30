'use client';
import { useState } from 'react';
import Logo from '../ui/Logo';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="hidden md:flex justify-between items-center py-4 px-6 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-2xl shadow-sm">
        <Logo />
        <div className="flex gap-3 items-center">
          <Link
            href="/dashboard"
            className="text-slate-700 py-2 px-5 text-sm font-medium rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="text-white bg-slate-900 py-2 px-5 text-sm font-medium rounded-full hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20"
          >
            Sign up
          </Link>
        </div>
      </div>

      <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200/60 h-14 flex justify-between items-center px-5">
        <Logo isMobile={true} />
        <div className="flex justify-center items-baseline">
          <Image
            src="/align-justify.svg"
            onClick={() => setOpen((i) => !i)}
            alt="Menu"
            width={20}
            height={20}
            className="cursor-pointer text-slate-600"
          />
        </div>
      </div>
      {open ? (
        <div className="md:hidden flex gap-3 items-center py-3 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-5">
          <Link
            href="/dashboard"
            className="text-slate-700 py-1.5 px-4 text-sm font-medium rounded-full border border-slate-200"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="text-white bg-slate-900 py-1.5 px-4 text-sm font-medium rounded-full"
          >
            Sign up
          </Link>
        </div>
      ) : null}
    </>
  );
};

export default Header;
