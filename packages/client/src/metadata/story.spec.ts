import { expect, test } from 'vitest';
import { StorySchema } from './story.js';

test('StorySchema should validate a valid story object', () => {
  const validStory = {
    id: '123',
    title: 'My Story',
    content: {},
    type: 'public',
    createdAt: 1629876543,
    updatedAt: 1629876543,
  };

  const result = StorySchema.safeParse(validStory);

  expect(result.success).toBe(true);
});

test('StorySchema should fail to validate an invalid story object', () => {
  const invalidStory = {
    id: '123',
    title: 'My Story',
    content: {},
    type: 'invalidType',
    createdAt: 1629876543,
    updatedAt: 1629876543,
  };

  const result = StorySchema.safeParse(invalidStory);

  expect(result.success).toBe(false);
});
