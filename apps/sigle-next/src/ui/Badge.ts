import { styled } from '@sigle/stitches.config';

export const Badge = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$2xs',
  lineHeight: '$2xs',
  whiteSpace: 'nowrap',
  br: '$md',
  color: '$gray10',
  backgroundColor: '$gray3',
  px: '$2',
  py: '2px',
});

export const NumberBadge = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '$xs',
  lineHeight: '$xs',
  whiteSpace: 'nowrap',
  br: '$md',
  color: '$gray9',
  backgroundColor: '$gray3',
  height: '$5',
  px: '$2',
});
