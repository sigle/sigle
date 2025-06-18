"use client";

import type { paths } from "@sigle/sdk";
import { IconMenu2 } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { resolveImageUrl } from "@/lib/images";

interface HeaderProps {
  site: paths["/api/sites/{domain}"]["get"]["responses"]["200"]["content"]["application/json"];
}

export const Header = ({ site }: HeaderProps) => {
  const [scrollDirection, setScrollDirection] = useState<"down" | "up" | null>(
    null,
  );

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? "down" : "up";
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };
    window.addEventListener("scroll", updateScrollDirection);
    return () => {
      window.removeEventListener("scroll", updateScrollDirection);
    };
  }, [scrollDirection]);

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-sigle-background px-4 transition-all duration-300 ease-in-out md:px-16",
        {
          "-top-16": scrollDirection === "down",
        },
      )}
    >
      <Link href="/" className="w-full md:w-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative overflow-hidden rounded object-cover">
              {site.user.profile?.coverPictureUri ? (
                <Image
                  src={resolveImageUrl(site.user.profile?.coverPictureUri.id)}
                  alt="Avatar"
                  priority
                  height={22}
                  width={22}
                />
              ) : null}
            </div>
            <div className="text-sm font-semibold">
              {site.user.profile?.displayName}{" "}
              <span className="font-normal text-gray-500">| Blog</span>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button
                className="p-2 md:hidden"
                aria-label="Open mobile menu"
                type="button"
              >
                <IconMenu2 size={15} />
              </button>
            </SheetTrigger>
            <SheetContent position="top" size="content">
              <SheetHeader>
                <SheetTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative overflow-hidden rounded object-cover">
                      {site.user.profile?.coverPictureUri ? (
                        <Image
                          src={resolveImageUrl(
                            site.user.profile?.coverPictureUri.id,
                          )}
                          alt="Avatar"
                          priority
                          height={22}
                          width={22}
                        />
                      ) : null}
                    </div>
                    <div className="text-sm font-semibold">
                      {site.user.profile?.displayName}{" "}
                      <span className="font-normal text-gray-500">| Blog</span>
                    </div>
                  </div>
                </SheetTitle>
                <SheetDescription>
                  <ul className="mt-4 flex flex-col items-start gap-5">
                    {site.links.map(({ href, label }) => (
                      <li key={href}>
                        <Link
                          href={href}
                          className="text-sm text-gray-800 hover:text-gray-500"
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                    {site.cta ? (
                      <li className="mt-2">
                        <Link
                          className="rounded-lg bg-gray-950 px-5 py-2 text-sm text-white"
                          href={site.cta.href}
                        >
                          {site.cta.label}
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </Link>

      <nav className="hidden md:block">
        <ul className="flex items-center gap-8">
          {site.links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-sm text-gray-800 hover:text-gray-500"
              >
                {label}
              </Link>
            </li>
          ))}
          {site.cta ? (
            <li>
              <Link
                className="block rounded-lg bg-gray-950 px-5 py-2 text-sm text-white"
                href={site.cta.href}
              >
                {site.cta.label}
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
};
