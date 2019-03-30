import React from 'react';
import { Box, BoxProps } from 'rebass';

interface ContainerProps extends BoxProps {}

export const Container = (props: ContainerProps) => (
  <Box
    {...props}
    px={2}
    mx="auto"
    css={{
      maxWidth: '1024px',
    }}
  />
);
