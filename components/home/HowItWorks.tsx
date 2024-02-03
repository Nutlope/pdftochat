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
      className="xl:max-w-[1700px] xl:mx-auto container pt-9 sm:pt-[77px] pb-[100px] sm:pb-[264px] px-[30px] sm:px-0"
    >
      <h3 className="pb-[66px] sm:pb-[174px] text-center text-3xl sm:text-[60px] text_bg leading-[72px] tracking-[-0.6px] sm:tracking-[-1.2px]">
        How it Works
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[64px] sm:gap-[112px] md:mx-20">
        {data.map((item, index) => (
          <div key={index} className="">
            <div className="flex justify-center items-center pb-2 sm:pb-[50px]">
              <Image
                src={item.image}
                alt="Step 1"
                width={62}
                height={62}
                className="w-6 sm:w-[62px] h-6 sm:h-[62px]"
              />
            </div>
            <div className="flex flex-col items-center gap-2 sm:gap-9">
              <h3 className="text-center text-primary text-2xl sm:text-5xl leading-[34.5px] tracking-[-1.2px]">
                {item.title}
              </h3>
              <p className="text-primary text-center text-[17px] sm:text-2xl leading-[20px] sm:leading-[34.5px] tracking-[-0.34px] sm:tracking-[-0.6px] pb-5 sm:pb-0 max-w-sm">
                {item.description}
              </p>
              <Link
                href="/dashboard"
                className="flex gap-3 sm:gap-[33px] px-6 sm:px-[37px] py-[1px] sm:py-[14px] items-center border rounded-[29px] border-solid border-primary"
              >
                <span className="text-[17px] sm:text-[30px] leading-[34.5px] tracking-[-0.34px] sm:tracking-[-0.6px]">
                  Get started
                </span>
                <Image
                  src="/right-arrow.svg"
                  alt="Arrow"
                  width={31}
                  height={24}
                  className="w-4 sm:w-[31px] h-auto"
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
