import Image from 'next/image';
import Link from 'next/link';

const data = [
  {
    title: 'Sign up',
    description: 'Start by signing up for a free PDFtoChat account',
    image: '/pen.png',
  },
  {
    title: 'Upload a PDF',
    description: 'After login, upload your PDF and let the AI tool analyze it',
    image: '/upload.png',
  },
  {
    title: 'Begin Chatting',
    description: 'Simply start asking the AI any question about the PDF!',
    image: '/chat.png',
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="max-w-6xl mx-auto px-6 py-24 md:py-32"
    >
      <div className="text-center mb-16 md:mb-20">
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
          How it Works
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
          Three simple steps to start chatting with your PDFs
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {data.map((item, index) => (
          <div
            key={index}
            className="relative group p-8 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
          >
            <div className="absolute top-6 left-6 w-10 h-10 flex items-center justify-center text-sm font-bold text-slate-400 bg-slate-100 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
              {index + 1}
            </div>
            <div className="flex justify-center pt-8 pb-6">
              <div className="w-16 h-16 flex items-center justify-center bg-slate-100 rounded-2xl group-hover:bg-slate-900/10 transition-colors duration-300">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
            {index < 2 && (
              <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                <svg
                  className="w-8 h-8 text-slate-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all duration-200 shadow-lg shadow-slate-900/20"
        >
          <span>Get started now</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default HowItWorks;
