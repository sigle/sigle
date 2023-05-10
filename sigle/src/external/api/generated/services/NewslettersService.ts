/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContactsListsEntity } from '../models/ContactsListsEntity';
import type { NewsletterEntity } from '../models/NewsletterEntity';
import type { UpdateNewsletterDto } from '../models/UpdateNewsletterDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class NewslettersService {
  /**
   * @returns NewsletterEntity
   * @throws ApiError
   */
  public static newslettersControllerGet(): CancelablePromise<NewsletterEntity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/newsletters',
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
      url: '/api/newsletters',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns ContactsListsEntity
   * @throws ApiError
   */
  public static newslettersControllerGetContactsLists(): CancelablePromise<
    Array<ContactsListsEntity>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/newsletters/contacts-lists',
    });
  }

  /**
   * @returns any
   * @throws ApiError
   */
  public static newslettersControllerSyncSender(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/newsletters/sender',
    });
  }
}
