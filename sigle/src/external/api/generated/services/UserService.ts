/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {
  /**
   * Return a user for a given stacks address.
   * @returns any Default Response
   * @throws ApiError
   */
  public static getApiUsers({
    userAddress,
  }: {
    userAddress: string;
  }): CancelablePromise<{
    id: string;
    stacksAddress: string;
    followersCount: number;
    followingCount: number;
    subscription?: {
      id: string;
      nftId: number;
    };
  }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/{userAddress}',
      path: {
        userAddress: userAddress,
      },
    });
  }

  /**
   * Return the current logged in user.
   * @returns any Default Response
   * @throws ApiError
   */
  public static getApiUsersMe(): CancelablePromise<{
    id: string;
    stacksAddress: string;
  }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/me',
    });
  }

  /**
   * Return a list of users using Sigle.
   * @returns any Default Response
   * @throws ApiError
   */
  public static getApiUsersExplore({
    page,
  }: {
    page?: number;
  }): CancelablePromise<{
    nextPage?: number;
    data: Array<{
      id: string;
      stacksAddress: string;
    }>;
  }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/users/explore',
      query: {
        page: page,
      },
    });
  }

  /**
   * Allows a user to follow another user.
   * @returns boolean Default Response
   * @throws ApiError
   */
  public static postApiUsersMeFollowing({
    body,
  }: {
    body?: {
      stacksAddress: string;
      createdAt: number;
    };
  }): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/users/me/following',
      body: body,
    });
  }

  /**
   * Allows a user to unfollow another user.
   * @returns boolean Default Response
   * @throws ApiError
   */
  public static deleteApiUsersMeFollowing({
    body,
  }: {
    body?: {
      stacksAddress: string;
    };
  }): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/users/me/following',
      body: body,
    });
  }

  /**
   * Returns a list of users who are followers of the specified user.
   * @returns string Default Response
   * @throws ApiError
   */
  public static getApiUsersFollowers({
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
   * @returns string Default Response
   * @throws ApiError
   */
  public static getApiUsersFollowing({
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
}
