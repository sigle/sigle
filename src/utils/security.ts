import { hexRegex } from './regex';

/**
 * Check if an hex color is safe to be displayed, otherwise return undefined
 */
export const sanitizeHexColor = (color: string): string | undefined => {
  return color.match(hexRegex) ? color : undefined;
};

/**
 * Check if a link is safe to be displayed, otherwise return undefined
 */
export const sanitizeLink = (href: string): string | undefined => {
  // We sanitise the link to protect from js execution "javascript:"
  // We use includes instead of startWith because there might be some spaces at the beginning
  // In a future version react will throw and error if this is happening https://reactjs.org/blog/2019/08/08/react-v16.9.0.html#deprecating-javascript-urls
  if (href.includes('javascript:')) {
    return undefined;
  }
  // We sanitise the link to protect from base64 "data:"
  if (href.trim().startsWith('data:')) {
    return undefined;
  }
  return href;
};
