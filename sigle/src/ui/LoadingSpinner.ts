import { keyframes, styled } from '../stitches.config';

const spin = keyframes({
  to: { transform: 'rotate(360deg)' },
});

export const LoadingSpinner = styled('div', {
  position: 'relative',
  px: '$4',

  '&::before': {
    content: '',
    boxSizing: 'border-box',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '$4',
    height: '$4',
    mt: '-8px',
    ml: '-8px',
    br: '$round',
    border: '1px solid $colors$gray8',
    borderTopColor: '$gray11',
    animation: `${spin} .7s linear infinite`,
  },
});
