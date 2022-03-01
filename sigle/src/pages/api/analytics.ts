import { NextApiHandler } from 'next';
import * as Sentry from '@sentry/nextjs';
import { initFathomClient } from '../../utils/fathomApi';

const fathomClient = initFathomClient({
  apiToken: process.env.FATHOM_API_TOKEN!,
  entityId: process.env.FATHOM_ENTITY_ID!,
});

const analyticsEndpoint: NextApiHandler = async (_, res) => {
  // TODO proper error handling

  const data = await fathomClient.aggregate({
    entity: 'pageview',
    aggregates: 'visits,pageviews',
    date_grouping: 'month',
    field_grouping: 'pathname',
    sort_by: 'timestamp:asc',
    filters: [
      {
        property: 'pathname',
        operator: 'is',
        value: '/sigleapp.id.blockstack',
      },
    ],
  });

  const filter = data.filter((record: { pathname: string }) =>
    record.pathname?.startsWith('/sigleapp.id.blockstack')
  );
  console.log(JSON.stringify(filter, null, 2));

  res.status(200).json(data);
};

export default Sentry.withSentry(analyticsEndpoint);
