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
    <div
      id="how-it-works"
      className="container max-w-6xl mx-auto py-16 sm:py-24 px-6 sm:px-8"
    >
      <h3 className="pb-12 sm:pb-16 text-center text-3xl sm:text-5xl md:text-6xl font-bold bg-clip-text text_bg tracking-tight">
        How it Works
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300"
          >
            <div className="flex justify-center items-center pb-4 sm:pb-6">
              <Image
                src={item.image}
                alt={item.title}
                width={48}
                height={48}
                className="w-10 sm:w-12 h-10 sm:h-12"
              />
            </div>
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <h3 className="text-primary text-xl sm:text-2xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xs">
                {item.description}
              </p>
              <Link
                href="/dashboard"
                className="mt-4 flex items-center gap-2 text-sm sm:text-base font-medium text-primary hover:text-primary/70 transition-colors duration-200"
              >
                <span>Get started</span>
                <Image
                  src="/right-arrow.svg"
                  alt="Arrow"
                  width={20}
                  height={16}
                  className="w-4 sm:w-5 h-auto"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
