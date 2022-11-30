import * as RadioGroup from '@radix-ui/react-radio-group';
import { styled } from '../stitches.config';

export const RadioGroupRoot = styled(RadioGroup.Root, {
  display: 'flex',
  gap: 10,

  variants: {
    orientation: {
      vertical: {
        flexDirection: 'column',
      },
      horizontal: {
        flexDirection: 'row',
      },
    },
  },
});

export const RadioGroupItem = styled(RadioGroup.Item, {
  all: 'unset',
  backgroundColor: '$gray1',
  width: 16,
  height: 16,
  br: '$1',
  boxShadow: `0 0 0 1px $colors$gray9`,
  '&:hover': { boxShadow: `0 0 0 1px $colors$gray10` },
  '&:focus': { boxShadow: `0 0 0 1px black` },

  '&[aria-checked=true]': {
    boxShadow: `none`,
    backgroundColor: '$orange11',
  },

  '& svg': {
    color: 'white',
  },
});

export const RadioGroupIndicator = styled(RadioGroup.Indicator, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  position: 'relative',
});

export const Label = styled('label', {
  color: '$gray11',
  fontSize: 15,
  lineHeight: 1,
  userSelect: 'none',
  paddingLeft: 15,
});
