/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSubscriberDto } from '../models/CreateSubscriberDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SubscribersService {
  /**
   * Create a new email subscriber.
   * @returns any
   * @throws ApiError
   */
  public static subscribersControllerCreate({
    requestBody,
  }: {
    requestBody: CreateSubscriberDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/subscribers',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
