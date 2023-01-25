import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import { composeClient } from '@/lib/composeDB';

const network = Network.create(async (request, variables) => {
  return (await composeClient.executeQuery(request.text!, variables)) as any;
});

export const environment = new Environment({
  network,
  store: new Store(new RecordSource()),
});
