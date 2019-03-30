import React from 'react';
import { Link as RebassLink, LinkProps as RebassLinkProps } from 'rebass';
import { default as NextLink, LinkProps as NextLinkProps } from 'next/link';
import { Omit } from '../utils/types';

interface LinkProps extends Omit<RebassLinkProps, 'href'> {
  href: NextLinkProps['href'];
}

export const Link = ({ href, ...props }: LinkProps) => (
  <NextLink href={href}>
    <RebassLink
      color="black"
      css={{
        cursor: 'pointer',
        '&:hover': {
          textDecoration: 'underline',
        },
      }}
      {...props}
    />
  </NextLink>
);
