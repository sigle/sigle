import { defaultStyles } from '@visx/tooltip';
import { styled, theme } from '../../../stitches.config';

export const tooltipStyles = {
  ...defaultStyles,
  background: theme.colors.gray1.toString(),
  border: '1px solid',
  borderColor: theme.colors.gray7.toString(),
  color: theme.colors.gray11.toString(),
  padding: 8,
  boxShadow: 'none',
};

export const TooltipDate = styled('p', { fontSize: 14 });

export const TooltipText = styled('p', { mt: '$2' });
