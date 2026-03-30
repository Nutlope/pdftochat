'use client';
import { useState } from 'react';
import Logo from '../ui/Logo';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="container hidden bg-white/80 backdrop-blur-md w-full px-6 h-16 sm:flex justify-between items-center border border-black/5 shadow-sm rounded-2xl mx-auto mt-4">
        <Logo />
        <div className="flex gap-3 items-center">
          <Link
            href="/dashboard"
            className="text-primary py-2 px-5 text-sm font-medium rounded-full border border-primary/20 hover:bg-primary/5 transition-all duration-200"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="text-white bg_linear py-2 px-5 text-sm font-medium rounded-full hover:opacity-90 transition-opacity duration-200"
          >
            Sign up
          </Link>
        </div>
      </div>

      <div className="sm:hidden bg-white/80 backdrop-blur-md shadow-sm border-b border-black/5 h-14 flex justify-between items-center px-5">
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
        <div className="flex sm:hidden gap-3 items-center py-3 bg-white/90 backdrop-blur-md shadow-sm px-5 border-b border-black/5">
          <Link
            href="/dashboard"
            className="text-primary py-1.5 px-5 text-sm font-medium rounded-full border border-primary/20 hover:bg-primary/5 transition-all duration-200"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="text-white bg_linear py-1.5 px-5 text-sm font-medium rounded-full hover:opacity-90 transition-opacity duration-200"
          >
            Sign up
          </Link>
        </div>
      ) : null}
    </>
  );
};

export default Header;
