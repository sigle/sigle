/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EmailDto } from './EmailDto';

export type StoryDto = {
  id: string;
  publishedAt: string;
  unpublishedAt: string;
  deletedAt: string;
  email: EmailDto | null;
};
