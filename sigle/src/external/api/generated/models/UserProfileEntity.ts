/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SubscriptionDto } from './SubscriptionDto';

export type UserProfileEntity = {
  id: string;
  stacksAddress: string;
  followersCount: number;
  followingCount: number;
  subscription: SubscriptionDto;
};
