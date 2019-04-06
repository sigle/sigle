import React from 'react';
import { default as NextLink, LinkProps as NextLinkProps } from 'next/link';
import { Omit } from '../utils/types';

interface LinkProps
  extends Omit<
    React.DetailedHTMLProps<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >,
    'href'
  > {
  href: NextLinkProps['href'];
}

export const Link = ({ href, ...props }: LinkProps) => (
  <NextLink href={href}>
    <a {...props} />
  </NextLink>
);
