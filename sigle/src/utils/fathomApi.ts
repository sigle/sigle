export const initFathomClient = ({
  apiToken,
  entityId,
}: {
  apiToken: string;
  entityId: string;
}) => {
  return {
    /**
     * https://usefathom.com/api#aggregation
     */
    aggregate: async (params: {
      entity: 'pageview' | 'event';
      aggregates: string;
      date_grouping?: 'day' | 'month';
      field_grouping?: 'hostname' | 'pathname';
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

      // TODO proper error handling
      const response = await fetch(
        `https://api.usefathom.com/v1/aggregations?${urlParams}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      const data = await response.json();
      return data;
    },
  };
};
