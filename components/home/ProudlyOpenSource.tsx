import Image from 'next/image';

const ProudlyOpenSource = () => {
  return (
    <div className="container pt-[55px] mx-auto pb-[53px] sm:pb-[174px] px-8 sm:px-0">
      <h2 className="text-center text-3xl sm:text-[60px] font-normal leading-[72px] tracking-[-0.6px] sm:tracking-[-1.2px] bg-clip-text text_bg pb-3 sm:pb-[30px]">
        Proudly open-source
      </h2>
      <p className="text-primary  text-center text-[17px] sm:text-3xl font-light sm:leading-[34.5px] sm:tracking-[-0.6px] leading-[22px] tracking-[-0.34px] max-w-[728px] mx-auto pb-[18px] sm:pb-11">
        Our source code is available on GitHub - feel free to read, review, or
        contribute to it however you want!
      </p>
      <div className="flex justify-center">
        <a
          className="shadow-[0px_0.5px_4px_0px_rgba(0,0,0,0.15)_inset] drop_shadow rounded-full flex items-center gap-[3px] sm:gap-2 py-0.5 sm:py-3 px-6"
          href="https://github.com/Nutlope/pdftochat"
        >
          <Image
            src="/github.png"
            alt="Github"
            width={37}
            height={37}
            className="w-[19px] h-[19px] sm:w-[37px] sm:h-[37px]"
          />
          <span className="text-primary text-center text-[17px] sm:text-3xl font-light leading-[37px] tracking-[-0.3px]">
            Star
          </span>
        </a>
      </div>
    </div>
  );
};

export default ProudlyOpenSource;
