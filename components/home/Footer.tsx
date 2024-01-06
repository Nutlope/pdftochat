import React from 'react';
import Logo from '../common/Logo';
import Link from 'next/link';
import Image from 'next/image';

const menuItems = [
  {
    title: 'Privacy Policy',
    link: '/privacy-policy',
  },
  {
    title: 'Terms and Conditions',
    link: '/terms-and-conditions',
  },
  {
    title: 'More Info',
    link: '/more-info',
  },
  {
    title: 'How it works',
    link: '#how-it-works',
  },
];

const Footer = () => {
  return (
    <div className="border-t-[rgba(0,0,0,0.20)] border-t border-solid bg-[#F9F9F9]">
      <div className="container flex flex-col sm:flex-row justify-between items-center sm:h-[77px] pt-3 pb-6 sm:pt-0 px-2 sm:px-0">
        <Logo />
        <ul className="flex items-center gap-3 sm:gap-[34px] pb-[18px] sm:pb-0">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link className=" text-[13px] sm:text-lg" href={item.link}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-[22px] sm:gap-[39px]">
          <a href={'facebook.com/iazadur'}>
            <Image src={'/images/twitter.svg'} alt="" width={24} height={19} />
          </a>
          <a href={'facebook.com/iazadur'}>
            <Image src={'/images/linkedin.svg'} alt="" width={24} height={23} />
          </a>
          <a href={'facebook.com/iazadur'}>
            <Image src={'/images/facebook.svg'} alt="" width={24} height={23} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
