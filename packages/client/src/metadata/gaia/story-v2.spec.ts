import { expect, test } from 'vitest';
import { GaiaStoryV2Schema, createGaiaStoryV2 } from './story-v2.js';

test('GaiaStoryV2Schema should validate a valid story object', () => {
  const validStory = {
    id: '123',
    title: 'My Story',
    content: 'This is my story',
    type: 'public',
    contentVersion: '2',
    createdAt: 1629876543,
    updatedAt: 1629876543,
  };

  const result = GaiaStoryV2Schema.safeParse(validStory);

  expect(result.success).toBe(true);
});

test('GaiaStoryV2Schema should fail to validate an invalid story object', () => {
  const invalidStory = {
    id: '123',
    title: 'My Story',
    content: {},
    type: 'invalidType',
    createdAt: 1629876543,
    updatedAt: 1629876543,
  };

  const result = GaiaStoryV2Schema.safeParse(invalidStory);

  expect(result.success).toBe(false);
});

test('createGaiaStoryV2 should return a valid story object', () => {
  const validStory = {
    id: '123',
    title: 'My Story',
    content: 'This is my story',
    type: 'public',
    contentVersion: '2',
    createdAt: 1629876543,
    updatedAt: 1629876543,
  } as const;

  const result = createGaiaStoryV2(validStory);

  expect(result).toEqual(validStory);
});
