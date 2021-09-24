import { styled } from '../stitches.config';

export const Container = styled('div', {
  ml: 'auto',
  mr: 'auto',
  px: '$5',

  '@sm': {
    maxWidth: '640px',
  },
  '@md': {
    maxWidth: '768px',
  },
  '@lg': {
    maxWidth: '1024px',
  },
  '@xl': {
    maxWidth: '1280px',
  },
});
