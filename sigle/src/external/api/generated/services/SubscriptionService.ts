/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SubscriptionService {
  /**
   * Create a creator plus subscription on the current logged in user. A user can only have one active subscription at a time.
   * @returns any Returns the newly created subscription object.
   * @throws ApiError
   */
  public static postApiSubscriptionsCreatorPlus({
    body,
  }: {
    body?: {
      nftId: number;
    };
  }): CancelablePromise<{
    id: string;
    nftId: number;
  }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/subscriptions/creatorPlus',
      body: body,
    });
  }

  /**
   * Return the current active subscription of the current logged in user.
   * @returns any Returns the current active subscription object. If no active subscription is found, null is returned.
   * @throws ApiError
   */
  public static getApiSubscriptions(): CancelablePromise<{
    id: string;
    nftId: number;
  }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/subscriptions',
    });
  }
}
