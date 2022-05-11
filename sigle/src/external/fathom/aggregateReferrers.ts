import { FathomClientParams } from '.';
import { aggregate } from './aggregate';

export const aggregateReferrers =
  ({ entityId, apiToken }: FathomClientParams) =>
  async (params: {
    dateFrom?: string;
    dateTo?: string;
    path: string;
  }): Promise<
    {
      referrer_hostname: string;
      uniques: string;
    }[]
  > => {
    return aggregate({ entityId, apiToken })({
      date_from: params.dateFrom,
      entity: 'pageview',
      aggregates: 'uniques',
      field_grouping: 'referrer_hostname',
      filters: [
        {
          property: 'pathname',
          operator: 'is',
          value: params.path,
        },
      ],
    });
  };
