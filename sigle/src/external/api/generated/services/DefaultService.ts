/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateNewsletterDto } from '../models/UpdateNewsletterDto';

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
   * @returns any
   * @throws ApiError
   */
  public static newslettersControllerUpdate({
    requestBody,
  }: {
    requestBody: UpdateNewsletterDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/newsletters',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
