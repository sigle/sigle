import { NextApiHandler } from 'next';
import * as Sentry from '@sentry/nextjs';

const analyticsEndpoint: NextApiHandler = async (_, res) => {
  // TODO proper error handling
  // TODO entity_id from env variable

  const params = {
    entity: 'pageview',
    entity_id: 'DLJCUFGQ',
    aggregates: 'pageviews',
    date_grouping: 'month',
    field_grouping: 'pathname',
    filters: JSON.stringify([
      {
        property: 'pathname',
        operator: 'is',
        value: '/sigleapp.id.blockstack',
      },
    ]),
  };
  const urlParams = new URLSearchParams(params).toString();
  const response = await fetch(
    `https://api.usefathom.com/v1/aggregations?${urlParams}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FATHOM_API_TOKEN}`,
      },
    }
  );

  const data = await response.json();

  res.status(200).json(data);
};

export default Sentry.withSentry(analyticsEndpoint);
