/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserFollowDto } from '../models/CreateUserFollowDto';
import type { DeleteUserFollowDto } from '../models/DeleteUserFollowDto';
import type { ExploreResponse } from '../models/ExploreResponse';
import type { ExploreUser } from '../models/ExploreUser';
import type { UserProfileEntity } from '../models/UserProfileEntity';

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
   * @returns ExploreUser
   * @throws ApiError
   */
  public static userControllerGetUserMe(): CancelablePromise<ExploreUser> {
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
}
