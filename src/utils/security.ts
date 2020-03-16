import { hexRegex } from './regex';

/**
 * Check if an hex color is safe to be displayed, otherwise return undefined
 */
export const sanitizeHexColor = (color: string): string | undefined => {
  return color.match(hexRegex) ? color : undefined;
};
