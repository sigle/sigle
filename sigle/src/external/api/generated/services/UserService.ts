/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddEmailDto } from '../models/AddEmailDto';
import type { CreateUserFollowDto } from '../models/CreateUserFollowDto';
import type { DeleteUserFollowDto } from '../models/DeleteUserFollowDto';
import type { ExploreResponse } from '../models/ExploreResponse';
import type { UserMeProfileEntity } from '../models/UserMeProfileEntity';
import type { UserProfileEntity } from '../models/UserProfileEntity';
import type { VerifyEmailDto } from '../models/VerifyEmailDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {
  /**
   * Return a list of users using Sigle.
   * @returns ExploreResponse The users using Sigle.
   * @throws ApiError
   */
  public static userControllerExplore({
    page,
  }: {
    page: number;
  }): CancelablePromise<ExploreResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/explore',
      query: {
        page: page,
      },
    });
  }

  /**
   * Return the current logged in user.
   * @returns UserMeProfileEntity
   * @throws ApiError
   */
  public static userControllerGetUserMe(): CancelablePromise<UserMeProfileEntity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/me',
    });
  }

  /**
   * Return a user for a given stacks address.
   * @returns UserProfileEntity
   * @throws ApiError
   */
  public static userControllerGetUser({
    userAddress,
  }: {
    userAddress: string;
  }): CancelablePromise<UserProfileEntity> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/{userAddress}',
      path: {
        userAddress: userAddress,
      },
    });
  }

  /**
   * Returns a list of users who are followers of the specified user.
   * @returns string The users who are following a user.
   * @throws ApiError
   */
  public static userControllerGetUserFollowers({
    userAddress,
  }: {
    userAddress: string;
  }): CancelablePromise<Array<string>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/{userAddress}/followers',
      path: {
        userAddress: userAddress,
      },
    });
  }

  /**
   * Returns a list of users the specified user is following.
   * @returns string The users a user is following.
   * @throws ApiError
   */
  public static userControllerGetUserFollowing({
    userAddress,
  }: {
    userAddress: string;
  }): CancelablePromise<Array<string>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/{userAddress}/following',
      path: {
        userAddress: userAddress,
      },
    });
  }

  /**
   * Allows a user to follow another user.
   * @returns boolean
   * @throws ApiError
   */
  public static userControllerAddFollow({
    requestBody,
  }: {
    requestBody: CreateUserFollowDto;
  }): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/users/me/following',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Allows a user to unfollow another user.
   * @returns boolean
   * @throws ApiError
   */
  public static userControllerRemoveFollow({
    requestBody,
  }: {
    requestBody: DeleteUserFollowDto;
  }): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/users/me/following',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Add an email address for the authenticated user. Send an email to the user with a verification link.
   * @returns boolean
   * @throws ApiError
   */
  public static emailVerificationControllerAddEmail({
    requestBody,
  }: {
    requestBody: AddEmailDto;
  }): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/email-verification/add',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Verify a user email address.
   * @returns boolean
   * @throws ApiError
   */
  public static emailVerificationControllerVerifyEmail({
    requestBody,
  }: {
    requestBody: VerifyEmailDto;
  }): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/email-verification/verify',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * Resend link to verify a user email address.
   * @returns boolean
   * @throws ApiError
   */
  public static emailVerificationControllerResendEmail(): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/email-verification/resend',
    });
  }
}
