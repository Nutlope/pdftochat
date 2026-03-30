import Link from 'next/link';

const Hero = () => {
  return (
    <div className="container pt-32 md:pt-40 pb-24 sm:pb-32 px-6 sm:px-8 mx-auto text-center max-w-4xl">
      <a
        href="https://togetherai.link"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 border border-slate-200 rounded-full py-1.5 px-4 text-slate-500 transition-all duration-300 hover:text-slate-700 hover:border-slate-300 text-sm bg-white/50 backdrop-blur-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Powered by <span className="font-semibold">Together.ai</span> &{' '}
        <span className="font-semibold">Mixtral</span>
      </a>
      <h2 className="text-center max-w-3xl pb-6 sm:pb-8 text-4xl sm:text-6xl md:text-7xl leading-tight font-bold tracking-tight mx-auto mt-10 sm:mt-14 bg-clip-text text_bg">
        Chat with your PDFs in seconds
      </h2>
      <p className="text-lg sm:text-xl md:text-2xl pb-10 leading-relaxed text-slate-500 max-w-2xl mx-auto">
        Have a conversation with your papers, textbooks, and contracts for free
      </p>
      <Link href={'/dashboard'}>
        <button className="bg_linear rounded-full px-8 sm:px-12 py-3 sm:py-4 text-white text-center text-base sm:text-xl font-medium hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-primary/25">
          Get Started
        </button>
      </Link>
    </div>
  );
};

export default Hero;
