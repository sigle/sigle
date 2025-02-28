"use client";

// eslint-disable-next-line no-restricted-imports
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

export type NextLinkProps = ComponentProps<typeof Link>;
export type { LinkProps };

/**
 * A wrapper around the Next.js Link component that disable prefetching when Link enters the layout and
 * enables prefetching when the user hovers over the link.
 * Just using prefetch `false` will not have enable hover prefetching with app router (next.js limitation).
 */
export function NextLink({
  children,
  prefetch = false,
  ...props
}: NextLinkProps) {
  const router = useRouter();

  return (
    <Link
      {...props}
      prefetch={prefetch}
      onMouseEnter={() => {
        router.prefetch(props.href as string);
      }}
    >
      {children}
    </Link>
  );
}
