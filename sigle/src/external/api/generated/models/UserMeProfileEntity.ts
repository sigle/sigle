/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PublicNewsletterEntity } from './PublicNewsletterEntity';

export type UserMeProfileEntity = {
  id: string;
  stacksAddress: string;
  email: string;
  emailVerified: string;
  newsletter: PublicNewsletterEntity | null;
};
