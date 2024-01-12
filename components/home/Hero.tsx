import Link from 'next/link';
import React from 'react';

const Hero = () => {
    return (
        <div className="container pt-[188px] md:pt-[300px] pb-[215px] sm:pb-[290px] px-[22px] sm:px-0 mx-auto">
            <h2 className="max-w-[867px] pb-5 sm:pb-7 text-[52px] sm:text-[100px] leading-[39.5px] tracking-[-1.04px] sm:leading-[75px] sm:tracking-[-2.74px]">
                Chat with your PDFs in seconds
            </h2>
            <p className="text-xl sm:text-2xl pb-10 sm:pb-8 leading-[19px] sm:leading-[34.5px] w-[232px] sm:w-full tracking-[-0.4px] sm:tracking-[-0.6px]">
                Have a conversation with your papers, textbooks, and contracts for free
            </p>
            <Link href={'/dashboard'}>
                <button className="bg_linear rounded-full sm:px-14 px-12 py-[2.5px] sm:py-4 text-white text-center text-xl sm:text-[30px] font-medium leading-[37px] tracking-[-0.3px]">
                    Get Started
                </button>
            </Link>
        </div>
    );
};

export default Hero;
