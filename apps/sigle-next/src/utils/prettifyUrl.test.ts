import { describe, expect, test } from '@jest/globals';
import { prettifyUrl } from './prettifyUrl';

describe('prettifyUrl', () => {
  test('should remove the protocol and the last slash', () => {
    expect(prettifyUrl('https://example.com/')).toBe('example.com');
    expect(prettifyUrl('https://example.com/test/')).toBe('example.com/test');
    expect(prettifyUrl('https://www.example.com/test/')).toBe(
      'www.example.com/test',
    );
  });
});
