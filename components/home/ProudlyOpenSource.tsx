import Image from 'next/image';

const ProudlyOpenSource = () => {
  return (
    <div className="container max-w-4xl mx-auto py-16 sm:py-24 px-6 sm:px-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 text-center">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight bg-clip-text text_bg pb-4 sm:pb-6">
          Proudly open-source
        </h2>
        <p className="text-slate-500 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mx-auto pb-8 sm:pb-10">
          Our source code is available on GitHub — feel free to read, review, or
          contribute however you like!
        </p>
        <a
          className="inline-flex items-center gap-2 sm:gap-3 bg_linear text-white rounded-full py-2.5 sm:py-3.5 px-6 sm:px-8 hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-primary/25"
          href="https://github.com/Nutlope/pdftochat"
        >
          <Image
            src="/github.png"
            alt="Github"
            width={24}
            height={24}
            className="w-5 sm:w-6 h-5 sm:h-6 brightness-0 invert"
          />
          <span className="text-sm sm:text-base font-medium">
            Star on GitHub
          </span>
        </a>
      </div>
    </div>
  );
};

export default ProudlyOpenSource;
