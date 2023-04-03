'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// TODO get links from settings
const links = [
  { href: 'https://www.sigle.io/', label: 'Home' },
  { href: 'https://app.sigle.io/explore', label: 'Explore' },
];

interface HeaderProps {
  settings: {
    name: string;
    avatar: string;
  };
}

export const Header = ({ settings }: HeaderProps) => {
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | null>(
    null
  );

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener('scroll', updateScrollDirection);
    return () => {
      window.removeEventListener('scroll', updateScrollDirection);
    };
  }, [scrollDirection]);

  return (
    <header
      className={twMerge(
        clsx(
          'h-16 px-8 flex justify-between items-center bg-sigle-background sticky top-0 transition-all duration-300 ease-in-out z-10 border-b border-gray-150 md:px-16',
          {
            ['-top-16']: scrollDirection === 'down',
          }
        )
      )}
    >
      <Link href="/">
        <div className="flex items-center gap-2">
          <div className="relative object-cover rounded overflow-hidden">
            <Image
              src={settings.avatar}
              alt="Avatar"
              priority
              height={22}
              width={22}
            />
          </div>
          <div className="text-sm font-semibold">
            {settings.name}{' '}
            <span className="font-normal text-gray-500">| Blog</span>
          </div>
        </div>
      </Link>
      <nav>
        <ul className="flex gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="text-gray-800 hover:text-gray-500">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};
