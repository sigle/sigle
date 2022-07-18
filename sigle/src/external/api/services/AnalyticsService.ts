/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AnalyticsService {
  /**
   * Return the referrer statistics.
   * @param dateFrom The date from which to get the statistics (e.g. 2022-04-01).
   * @param storyId The story id to get the statistics for.
   * @returns any Default Response
   * @throws ApiError
   */
  public static getApiAnalyticsReferrers(
    dateFrom: string,
    storyId?: string
  ): CancelablePromise<
    Array<{
      domain?: string;
      count?: number;
    }>
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/analytics/referrers',
      query: {
        dateFrom: dateFrom,
        storyId: storyId,
      },
    });
  }

  /**
   * Return the historical statistics.
   * @param dateFrom The date from which to get the statistics (e.g. 2022-04-01).
   * @param dateGrouping The date grouping (e.g. day, month). When day is set the date format is YYYY-MM-DD. When month is set the date format is YYYY-MM.
   * @param storyId The story id to get the statistics for.
   * @returns any Default Response
   * @throws ApiError
   */
  public static getApiAnalyticsHistorical(
    dateFrom: string,
    dateGrouping: string,
    storyId?: string
  ): CancelablePromise<{
    historical?: Array<{
      date?: string;
      visits?: number;
      pageviews?: number;
    }>;
    stories?: Array<{
      pathname?: string;
      visits?: number;
      pageviews?: number;
    }>;
  }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/analytics/historical',
      query: {
        dateFrom: dateFrom,
        dateGrouping: dateGrouping,
        storyId: storyId,
      },
    });
  }
}
