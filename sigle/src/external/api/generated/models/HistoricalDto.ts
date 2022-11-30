/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AnalyticsHistoricalDto } from './AnalyticsHistoricalDto';
import type { AnalyticsStoryDto } from './AnalyticsStoryDto';

export type HistoricalDto = {
  historical: Array<AnalyticsHistoricalDto>;
  stories: Array<AnalyticsStoryDto>;
};
