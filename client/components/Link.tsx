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
}

export const Link = ({ href, ...props }: LinkProps) => (
  <NextLink href={href}>
    <a {...props} />
  </NextLink>
);
