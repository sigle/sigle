export interface StatsData {
  pageviews: number;
  date: string;
  visits: number;
}

export type StatsType = 'weekly' | 'monthly' | 'all';
