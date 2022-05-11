import { FathomClientParams } from '.';

/**
 * Generic function
 * https://usefathom.com/api#aggregation
 */
export const aggregate =
  ({ entityId, apiToken }: FathomClientParams) =>
  async (params: {
    entity: 'pageview' | 'event';
    aggregates: string;
    date_grouping?: 'day' | 'month';
    field_grouping?: 'hostname' | 'pathname' | 'referrer_hostname';
    sort_by?: 'timestamp:asc' | 'timestamp:desc';
    date_from?: string;
    date_to?: string;
    limit?: number;
    filters?: {
      property: 'hostname' | 'pathname';
      operator: 'is' | 'is not';
      value: string;
    }[];
  }) => {
    const urlParams = new URLSearchParams({
      ...params,
      entity_id: entityId,
      filters: JSON.stringify(params.filters),
    } as any).toString();

    const response = await fetch(
      `https://api.usefathom.com/v1/aggregations?${urlParams}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    if (response.status !== 200) {
      console.error(await response.text());
      throw new Error(`Failed to fetch aggregations: ${response.status}`);
    }

    return response.json();
  };
