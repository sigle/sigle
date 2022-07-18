/* tslint:disable */
/* eslint-disable */
/**
 * Sigle API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 0.1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import * as runtime from '../runtime';
import type {
  ApiSubscriptionsCreatorPlusPost200Response,
  ApiSubscriptionsCreatorPlusPostRequest,
  ApiSubscriptionsGet200Response,
} from '../models';
import {
  ApiSubscriptionsCreatorPlusPost200ResponseFromJSON,
  ApiSubscriptionsCreatorPlusPost200ResponseToJSON,
  ApiSubscriptionsCreatorPlusPostRequestFromJSON,
  ApiSubscriptionsCreatorPlusPostRequestToJSON,
  ApiSubscriptionsGet200ResponseFromJSON,
  ApiSubscriptionsGet200ResponseToJSON,
} from '../models';

export interface ApiSubscriptionsCreatorPlusPostOperationRequest {
  body?: ApiSubscriptionsCreatorPlusPostRequest;
}

/**
 * SubscriptionApi - interface
 *
 * @export
 * @interface SubscriptionApiInterface
 */
export interface SubscriptionApiInterface {
  /**
   * Create a creator plus subscription on the current logged in user. A user can only have one active subscription at a time.
   * @param {ApiSubscriptionsCreatorPlusPostRequest} [body]
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SubscriptionApiInterface
   */
  apiSubscriptionsCreatorPlusPostRaw(
    requestParameters: ApiSubscriptionsCreatorPlusPostOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<ApiSubscriptionsCreatorPlusPost200Response>>;

  /**
   * Create a creator plus subscription on the current logged in user. A user can only have one active subscription at a time.
   */
  apiSubscriptionsCreatorPlusPost(
    requestParameters: ApiSubscriptionsCreatorPlusPostOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<ApiSubscriptionsCreatorPlusPost200Response>;

  /**
   * Return the current active subscription of the current logged in user.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   * @memberof SubscriptionApiInterface
   */
  apiSubscriptionsGetRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<ApiSubscriptionsGet200Response>>;

  /**
   * Return the current active subscription of the current logged in user.
   */
  apiSubscriptionsGet(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<ApiSubscriptionsGet200Response>;
}

/**
 *
 */
export class SubscriptionApi
  extends runtime.BaseAPI
  implements SubscriptionApiInterface
{
  /**
   * Create a creator plus subscription on the current logged in user. A user can only have one active subscription at a time.
   */
  async apiSubscriptionsCreatorPlusPostRaw(
    requestParameters: ApiSubscriptionsCreatorPlusPostOperationRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<ApiSubscriptionsCreatorPlusPost200Response>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters['Content-Type'] = 'application/json';

    const response = await this.request(
      {
        path: `/api/subscriptions/creatorPlus`,
        method: 'POST',
        headers: headerParameters,
        query: queryParameters,
        body: ApiSubscriptionsCreatorPlusPostRequestToJSON(
          requestParameters.body
        ),
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      ApiSubscriptionsCreatorPlusPost200ResponseFromJSON(jsonValue)
    );
  }

  /**
   * Create a creator plus subscription on the current logged in user. A user can only have one active subscription at a time.
   */
  async apiSubscriptionsCreatorPlusPost(
    requestParameters: ApiSubscriptionsCreatorPlusPostOperationRequest = {},
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<ApiSubscriptionsCreatorPlusPost200Response> {
    const response = await this.apiSubscriptionsCreatorPlusPostRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * Return the current active subscription of the current logged in user.
   */
  async apiSubscriptionsGetRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<ApiSubscriptionsGet200Response>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    const response = await this.request(
      {
        path: `/api/subscriptions`,
        method: 'GET',
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      ApiSubscriptionsGet200ResponseFromJSON(jsonValue)
    );
  }

  /**
   * Return the current active subscription of the current logged in user.
   */
  async apiSubscriptionsGet(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<ApiSubscriptionsGet200Response> {
    const response = await this.apiSubscriptionsGetRaw(initOverrides);
    return await response.value();
  }
}
