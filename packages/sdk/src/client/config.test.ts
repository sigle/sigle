import { expect, test } from 'vitest';
import { fixedMintFee } from './config.js';

test('should have fixed mint fee', () => {
  expect(fixedMintFee.total).toBe(
    fixedMintFee.protocol + fixedMintFee.creator + fixedMintFee.mintReferrer,
  );
});
