import * as ProgressPrimitive from '@radix-ui/react-progress';
import { styled } from '../stitches.config';

export const StyledProgress = styled(ProgressPrimitive.Root, {
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: '$gray7',
  borderRadius: '99999px',
  width: 390,
  height: 12,

  // Fix overflow clipping in Safari
  // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
  transform: 'translateZ(0)',
});

export const StyledIndicator = styled(ProgressPrimitive.Indicator, {
  backgroundColor: '$green11',
  width: '100%',
  height: '100%',
  transition: 'transform 660ms cubic-bezier(0.65, 0, 0.35, 1)',
});

export const Progress = StyledProgress;
export const ProgressIndicator = StyledIndicator;
