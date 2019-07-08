import React from 'react';
import { default as NextLink } from 'next/link';
import { Omit } from '../utils/types';

interface LinkProps
  extends Omit<
    React.DetailedHTMLProps<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >,
    'href'
  > {
  href: string;
  as?: string;
}

export const Link = ({ href, as, ...props }: LinkProps) => (
  <NextLink href={href} as={as}>
    <a {...props} />
  </NextLink>
);
