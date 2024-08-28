import { expect, test } from 'vitest';
import { ProfileSchema } from './profile.js';

test('ProfileSchema should validate a valid profile object', () => {
  const validStory = {
    name: 'My Profile',
    description: 'This is my profile',
    picture: 'https://example.com/profile.png',
    website: 'https://example.com',
    twitter: 'example',
  };

  const result = ProfileSchema.safeParse(validStory);

  expect(result.success).toBe(true);
});

test('ProfileSchema should fail to validate an invalid story object', () => {
  const invalidStory = {
    twitter: 'https://twitter.com/example',
  };

  const result = ProfileSchema.safeParse(invalidStory);

  expect(result.success).toBe(false);
});
