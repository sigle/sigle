import { sanitizeHexColor, sanitizeLink } from './security';

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

describe('sanitizeLink', () => {
  it('Should return undefined if javascript value is passed', () => {
    expect(sanitizeLink('javascript:alert("hack")')).toBeUndefined();
  });

  it('Should return undefined if javascript value is passed with spaces', () => {
    expect(sanitizeLink('   javascript:alert("hack")   ')).toBeUndefined();
  });

  it('Should return undefined if base64 encoded data is passed', () => {
    expect(
      sanitizeLink(
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgiSGFja2VkISIpOzwvc2NyaXB0Pg==',
      ),
    ).toBeUndefined();
  });

  it('Should return undefined if base64 encoded data is passed with spaces', () => {
    expect(
      sanitizeLink(
        '   data:text/html;base64,PHNjcmlwdD5hbGVydCgiSGFja2VkISIpOzwvc2NyaXB0Pg==   ',
      ),
    ).toBeUndefined();
  });

  it('Should return link if secure link is passed', () => {
    expect(sanitizeLink('https://app.sigle.io')).toBe('https://app.sigle.io');
  });
});
