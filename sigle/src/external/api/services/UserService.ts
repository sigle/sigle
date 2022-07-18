/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {
  /**
   * Return the current logged in user.
   * @returns any Default Response
   * @throws ApiError
   */
  public static getApiUsersMe(): CancelablePromise<{
    id?: string;
    stacksAddress?: string;
  }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/me',
    });
  }
}
