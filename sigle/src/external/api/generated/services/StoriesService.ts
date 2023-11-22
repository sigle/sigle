/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PublishStoryDto } from '../models/PublishStoryDto';
import type { SendTestStoryDto } from '../models/SendTestStoryDto';
import type { StoryDto } from '../models/StoryDto';
import type { UnpublishStoryDto } from '../models/UnpublishStoryDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class StoriesService {
  /**
   * @returns StoryDto
   * @throws ApiError
   */
  public static storiesControllerGet({
    storyId,
  }: {
    storyId: string;
  }): CancelablePromise<StoryDto> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/stories/{storyId}',
      path: {
        storyId: storyId,
      },
    });
  }

  /**
   * @returns any
   * @throws ApiError
   */
  public static storiesControllerSendTest({
    requestBody,
  }: {
    requestBody: SendTestStoryDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/stories/send-test',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns any
   * @throws ApiError
   */
  public static storiesControllerPublish({
    requestBody,
  }: {
    requestBody: PublishStoryDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/stories/publish',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns any
   * @throws ApiError
   */
  public static storiesControllerUnpublish({
    requestBody,
  }: {
    requestBody: UnpublishStoryDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/stories/unpublish',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * @returns any
   * @throws ApiError
   */
  public static storiesControllerDelete({
    requestBody,
  }: {
    requestBody: UnpublishStoryDto;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/stories/delete',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
