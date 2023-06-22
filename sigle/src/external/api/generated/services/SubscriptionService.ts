/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubscriptionDto } from '../models/SubscriptionDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SubscriptionService {
  /**
   * Return the current active subscription of the current logged in user.
   * @returns SubscriptionDto Returns the current active subscription object. If no active subscription is found, null is returned.
   * @throws ApiError
   */
  public static subscriptionControllerGetUserMe(): CancelablePromise<SubscriptionDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/subscriptions',
    });
  }

  /**
   * Create or update a creator plus subscription on the current logged in user. A user can only have one active subscription at a time.
   * @returns SubscriptionDto Returns the newly created subscription object.
   * @throws ApiError
   */
  public static subscriptionControllerSyncSubscriptionWithNft(): CancelablePromise<SubscriptionDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/subscriptions/syncWithNft',
    });
  }
}
