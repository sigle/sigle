'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SiteSettings } from '@/types';
import { IconMenu2 } from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/Sheet';

interface HeaderProps {
  settings: SiteSettings;
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
          'h-16 px-4 flex justify-between items-center bg-sigle-background sticky top-0 transition-all duration-300 ease-in-out z-10 border-b border-gray-150 md:px-16',
          {
            ['-top-16']: scrollDirection === 'down',
          }
        )
      )}
    >
      <Link href="/">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden p-2">
                <IconMenu2 size={15} />
              </button>
            </SheetTrigger>
            <SheetContent position="left" size="xl">
              <SheetHeader>
                <SheetTitle>
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
                </SheetTitle>
                <SheetDescription>
                  <ul className="mt-4 flex flex-col gap-5 items-start">
                    {settings.links?.map(({ href, label }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="text-sm text-gray-800 hover:text-gray-500"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

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
        <ul className="flex gap-8 items-center">
          {settings.links?.map(({ href, label }) => (
            <li key={href} className="hidden md:block">
              <Link
                href={href}
                className="text-sm text-gray-800 hover:text-gray-500"
              >
                {label}
              </Link>
            </li>
          ))}
          {settings.cta ? (
            <li>
              <Link
                className="text-sm text-white bg-gray-950 py-2 px-5 rounded-lg"
                href={settings.cta.href}
              >
                {settings.cta.label}
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
};
