import { sanitizeHexColor } from './security';

describe('sanitizeHexColor', () => {
  it('Should return undefined if wrong value is passed', () => {
    expect(sanitizeHexColor('a')).toBeUndefined();
  });

  it('Should return undefined if hex passed at the wrong place', () => {
    expect(sanitizeHexColor('#abababa')).toBeUndefined();
  });

  it('Should return undefined if hex passed at the wrong place', () => {
    expect(sanitizeHexColor('a#ababab')).toBeUndefined();
  });

  it('Should return color if valid hex is passed', () => {
    expect(sanitizeHexColor('#ababab')).toBe('#ababab');
  });
});
