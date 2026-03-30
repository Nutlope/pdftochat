import Link from 'next/link';

const Hero = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-32 md:py-40 text-center">
      <a
        href="https://togetherai.link"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-full shadow-sm hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Powered by <span className="font-semibold">Together.ai</span> &{' '}
        <span className="font-semibold">Mixtral</span>
      </a>
      <h1 className="mt-10 text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-tight">
        Chat with your PDFs{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
          in seconds
        </span>
      </h1>
      <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Have a conversation with your papers, textbooks, and contracts. Free,
        fast, and powered by AI.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link href={'/dashboard'}>
          <button className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all duration-200 shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5">
            Get Started
          </button>
        </Link>
        <Link href={'#how-it-works'}>
          <button className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
            See how it works
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
