export interface AnalyticsHistoricalData {
  date: string;
  visits: number;
  pageviews: number;
}

export interface AnalyticsStoriesData {
  pathname: string;
  visits: number;
  pageviews: number;
}

export type AnalyticsHistoricalResponse = {
  historical: AnalyticsHistoricalData[];
  stories: AnalyticsStoriesData[];
};

export interface StatsData {
  pageViews: number;
  date: string;
  visits: number;
}

export type StatsType = 'weekly' | 'monthly' | 'all';

export interface ReferrersItemProps {
  domain: string;
  count: number;
}

export type ReferrersResponse = ReferrersItemProps[];
