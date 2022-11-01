/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DismissableFlags } from '../models/DismissableFlags';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {
  /**
   * @returns any
   * @throws ApiError
   */
  public static appControllerGetHello(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/health',
    });
  }

  /**
   * Return the dismissable flags for the authenticated user.
   * @returns DismissableFlags
   * @throws ApiError
   */
  public static dismissableFlagsControllerGetUserDismissableFlags(): CancelablePromise<DismissableFlags> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/me/dismissable-flags',
    });
  }
}
