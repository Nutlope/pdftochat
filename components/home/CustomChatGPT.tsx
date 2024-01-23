import React from 'react';

const CustomChatGPT = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 sm:h-[855px] bg_linear_gpt">
      <div className="custom_bg flex-col items-end pr-64 h-full justify-center hidden sm:flex">
        <h3 className="text_bg text-center text-[60px] leading-[72px] tracking-[-1.2px]">
          Your Custom ChatGPT used by
        </h3>
      </div>
      <h3 className="text_bg text-center text-[30px] pb-[86px] pt-[29px] sm:hidden leading-[72px] tracking-[-0.6px]">
        Your Custom ChatGPT
      </h3>
      <ul className="list-disc list-inside pl-[60px] md:pl-64 flex flex-col justify-center gap-[60px] pb-[100px] sm:pb-0">
        {[
          'Professionals',
          'Students',
          'Teachers',
          'Researchers',
          'Translators',
        ].map((item, index) => (
          <li key={index} className="">
            <span className="text-3xl">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomChatGPT;
