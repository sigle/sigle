import { FathomClientParams } from '.';
import { aggregate } from './aggregate';

export const aggregatePath =
  ({ entityId, apiToken }: FathomClientParams) =>
  async (params: {
    dateGrouping?: 'day' | 'month';
    dateFrom?: string;
    dateTo?: string;
    path: string;
  }): Promise<
    {
      pathname: string;
      date: string;
      visits: string;
      pageviews: string;
    }[]
  > => {
    return aggregate({ entityId, apiToken })({
      date_from: params.dateFrom,
      entity: 'pageview',
      aggregates: 'visits,pageviews',
      date_grouping: params.dateGrouping,
      field_grouping: 'pathname',
      sort_by: 'timestamp:asc',
      filters: [
        {
          property: 'pathname',
          operator: 'is',
          value: params.path,
        },
      ],
    });
  };
