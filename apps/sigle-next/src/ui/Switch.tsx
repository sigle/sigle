import * as SwitchPrimitive from '@radix-ui/react-switch';
import { VariantProps } from '@stitches/react';
import { CSS } from '@stitches/react/types/css-util';
import { forwardRef } from 'react';
import { styled } from '../stitches.config';

/**
 * Here we are using !important for the background color because tailwindcss
 * is adding a transparent background color to the switch
 */
const StyledSwitch = styled(SwitchPrimitive.Root, {
  all: 'unset',
  width: 26,
  height: 16,
  backgroundColor: '$gray8 !important',
  borderRadius: '$full',
  position: 'relative',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
  '&:focus': { boxShadow: `0 0 0 1px $colors$gray5` },
  '&[data-state="checked"]': { backgroundColor: '$indigo11 !important' },
});

const StyledThumb = styled(SwitchPrimitive.Thumb, {
  display: 'block',
  width: 10,
  height: 10,
  backgroundColor: 'white',
  borderRadius: '$full',
  transition: 'transform 100ms',
  transform: 'translateX(3px)',
  willChange: 'transform',
  '&[data-state="checked"]': {
    transform: 'translateX(13px)',
  },
});

type SwitchVariants = VariantProps<typeof StyledSwitch>;
type SwitchPrimitiveProps = React.ComponentProps<typeof SwitchPrimitive.Root>;
type SwitchProps = SwitchPrimitiveProps & SwitchVariants & { css?: CSS };

export const Switch = forwardRef<
  React.ElementRef<typeof StyledSwitch>,
  SwitchProps
>((props, forwardedRef) => (
  <StyledSwitch {...props} ref={forwardedRef}>
    <StyledThumb />
  </StyledSwitch>
));

Switch.displayName = 'Switch';
